'use strict';

// you have to require the utils module and call adapter function
const ping = require('ping');
const utils = require('@iobroker/adapter-core');
const LupusAync = require(__dirname + '/lib/lupusasync');
const adapterName = require('./package.json').name.split('.').pop();
const adapterNodeVer = require('./package.json').engines.node;
let lupusecAsync = null;
let systemLanguage = 'EN';
let adapter;
let timerhandle = {};

/**
 * Wait / Sleep x milliseconds
 * @param {number} ms - time in ms to wail
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Change the external Sentry Logging. After changing the Logging
 * the adapter restarts once
 * @param {*} id : adapter.config.sentry_enable for example
 */
async function setSentryLogging(value) {
  try {
    value = value === true;
    let idSentry = 'system.adapter.' + adapter.namespace + '.plugins.sentry.enabled';
    let stateSentry = await adapter.getForeignStateAsync(idSentry);
    if (stateSentry && stateSentry.val !== value) {
      await adapter.setForeignStateAsync(idSentry, value);
      adapter.log.info('Restarting Adapter because of changeing Sentry settings');
      adapter.restart();
      return true;
    }
  } catch (error) {
    return false;
  }
  return false;
}

async function getStateValue(id) {
  try {
    let state = await adapter.getStateAsync(id);
    let value;
    if (state && state.val) value = state.val;
    return value;
  } catch (error) {
    return undefined;
  }
}

function startAdapter(options) {
  options = options || {};
  options.name = adapterName;
  adapter = new utils.Adapter(options);

  // is called when adapter shuts down - callback has to be called under any circumstances!
  adapter.on('unload', (callback) => {
    try {
      // adapter.log.info('cleaned everything up...');
      callback();
    } catch (error) {
      callback();
    }
  });

  // is called if a subscribed object changes
  adapter.on('objectChange', async (id, obj) => {
    // Warning, obj can be null if it was deleted
    // adapter.log.info('objectChange ' + id + ' ' + JSON.stringify(obj));
  });

  // is called if a subscribed state changes
  adapter.on('stateChange', async (id, state) => {
    if (id && state && !state.ack && lupusecAsync) {
      if (id.startsWith(adapter.namespace + '.devices.')) {
        const regstatusex = /.+\.devices\.(.+)\.(.+)/gm;
        let m = regstatusex.exec(id);
        let idparent = id.split('.').slice(0, -1).join('.');
        let iddevice = id.split('.').slice(2, -1).join('.');
        if (m !== null) {
          let key = m[1]; // Device ID
          let statusname = m[2]; // statusname
          let status = state.val;
          let form = {};
          if (statusname === 'status_ex') {
            status === false ? status = 0 : status = 1;
            // PD Wert mitnehmen, falls vorhanden
            let idpd = idparent + '.pd';
            let pdstatus = 0;
            try {
              let state = await adapter.getStateAsync(idpd);
              if (state && state.val) { pdstatus = ':' + state.val; }
              if (state && !state.ack) await adapter.setStateAsync(idpd, { val: state.val, ack: true });
            } catch (error) {
              // 
            }
            form = {
              id: key,
              pd: pdstatus,
              switch: status
            };
            await lupusecAsync.deviceSwitchPSSPost(form);
          }
          if (statusname === 'level') {
            // erst nach 500 ms ausführen, falls sich wert noch ändert!
            clearTimeout(timerhandle[key]);
            timerhandle[key] = setTimeout(async () => {
              form = {
                id: key,
                level: status
              };
              await lupusecAsync.deviceSwitchDimmerPost(form);
            }, adapter.config.alarm_polltime * 1000);
          }
          if (statusname === 'nuki_action') {
            let statusreq;
            switch (status) {
              case 3:
                statusreq = 1; // unlock 
                break;
              case 1:
                statusreq = 2; // lock
                break;
              case 0:
                statusreq = 3; // open
                break;
              default:
                statusreq = undefined;
                break;
            }
            if (statusreq) {
              form = {
                id: key,
                action: statusreq
              };
            }
            clearTimeout(timerhandle[key]);
            timerhandle[key] = setTimeout(async () => {
              const maxcount = 5; // 5 Tries
              let counter = 0;
              let result = 0;
              do {
                counter++;
                result = await lupusecAsync.deviceNukiCmd(form);
                if (result) {
                  let idnuki = idparent + '.' + statusname;
                  await adapter.setStateAsync(idnuki, { val: status, ack: true });
                } else {
                  if (counter === maxcount) {
                    adapter.log.error('Action on Nuki not executed, because no positive response from Nuki!');
                  } else {
                    adapter.log.info('Action on Nuki not executed, because no positive response from Nuki!. Will try it in 500 ms again. Try: ' + counter + ' from ' + maxcount);
                    await sleep(500);
                  }
                }
              } while (counter <= maxcount && result === 0);
            });
          }
          if (statusname === 'hue' || statusname === 'sat') {
            // erst nach 500 ms ausführen, falls sich wert noch ändert!
            clearTimeout(timerhandle[key]);
            timerhandle[key] = setTimeout(async () => {
              let hue;
              let saturation;
              try {
                if (statusname === 'hue') {
                  hue = status;
                  saturation = await getStateValue(idparent + '.sat');
                }
                if (statusname === 'sat') {
                  saturation = status;
                  hue = await getStateValue(idparent + '.hue');
                }
              } catch (error) { /* */ }
              form = {
                id: key,
                hue: hue || 0,
                saturation: saturation || 0,
                mod: 2
              };
              await lupusecAsync.deviceHueColorControl(form);
            }, adapter.config.alarm_polltime * 1000);
          }
          if (statusname === 'switch') {
            // (0: runterfahren/zu, 1: hochfahren/auf, 2: stop)
            form = {
              id: key,
              switch: status
            };
            await lupusecAsync.deviceSwitchPSSPost(form);
          }
          if (statusname === 'on_time' || statusname === 'off_time') { // Thermostat (Type 76) Shutter
            let on_time, off_time;
            if (statusname === 'on_time') {
              on_time = status;
              off_time = await getStateValue(idparent + '.off_time');
            }
            if (statusname === 'off_time') {
              on_time = await getStateValue(idparent + '.on_time');
              off_time = status;
            }
            form = {
              id: key,
              on_time: Math.round(on_time * 10),
              off_time: Math.round(off_time * 10)
            };
            await lupusecAsync.deviceEditShutterPost(form);
          }
          if (statusname === 'thermo_offset') { // Thermostat (Type 79)
            form = {
              id: key,
              act: 't_offset',
              thermo_offset: Math.round(status * 10)
            };
            await lupusecAsync.deviceEditThermoPost(form);
          }
          if (statusname === 'mode') { // Thermostat (Type 79)
            form = {
              id: key,
              act: 't_schd_setting',
              thermo_schd_setting: status == 0 ? 0 : 1
            };
            await lupusecAsync.deviceEditThermoPost(form);
          }
          if (statusname === 'off') { // Thermostat (Type 79)
            form = {
              id: key,
              act: 't_mode',
              thermo_mode: status == true ? 0 : 4
            };
            await lupusecAsync.deviceEditThermoPost(form);
          }
          if (statusname === 'set_temperature') { // Thermostat (Type 79)
            // erst nach 500 ms ausführen, falls sich wert noch ändert!
            clearTimeout(timerhandle[key]);
            timerhandle[key] = setTimeout(async () => {
              form = {
                id: key,
                act: 't_setpoint',
                thermo_setpoint: Math.trunc(100 * Math.round(2 * status) / 2)
              };
              await lupusecAsync.deviceEditThermoPost(form);
            }, adapter.config.alarm_polltime * 1000);
          }
          if (statusname && (statusname.startsWith('sresp_button_') || statusname === 'sresp_emergency') ||
            statusname === 'name' || statusname === 'send_notify' || statusname === 'bypass' ||
            statusname === 'bypass_tamper' || statusname === 'schar_latch_rpt' || statusname === 'always_off') {
            if (statusname === 'sresp_button_123') statusname = 'sresp_panic';
            if (statusname === 'sresp_button_456') statusname = 'sresp_fire';
            if (statusname === 'sresp_button_789') statusname = 'sresp_medical';
            if (statusname === 'name') statusname = 'sname';
            if (statusname === 'bypass') statusname = 'scond_bypass';
            form = {
              id: key,
              sarea: await getStateValue(idparent + '.area'),
              szone: await getStateValue(idparent + '.zone'),
            };
            form[statusname] = status;
            await lupusecAsync.deviceEditPost(form);
          }
          // Powermeter
          if (statusname === 'factor') {
            form = {
              id: key,
              factor: status
            };
            await lupusecAsync.deviceEditMeterPost(form);
          }

        }
      }
      if (id.startsWith(adapter.namespace + '.status.')) {
        // Area 1 alarm modus
        if (id === adapter.namespace + '.status.mode_pc_a1') {
          await lupusecAsync.panelCondPost({ area: 1, mode: state.val });
        }
        // Area 2 alarm modus
        if (id === adapter.namespace + '.status.mode_pc_a2') {
          await lupusecAsync.panelCondPost({ area: 2, mode: state.val });
        }
        // Area 1 alarm modus
        if (id === adapter.namespace + '.status.apple_home_a1') {
          let mode_pc_a1 = lupusecAsync.getLupusecFromAppleStautus(state.val);
          if (mode_pc_a1 >= 0 && mode_pc_a1 <= 4) {
            await lupusecAsync.panelCondPost({ area: 1, mode: mode_pc_a1 });
          }
        }
        // Area 2 alarm modus
        if (id === adapter.namespace + '.status.apple_home_a2') {
          let mode_pc_a2 = lupusecAsync.getLupusecFromAppleStautus(state.val);
          if (mode_pc_a2 >= 0 && mode_pc_a2 <= 4) {
            await lupusecAsync.panelCondPost({ area: 2, mode: mode_pc_a2 });
          }
        }
      }
    }
  });

  adapter.on('ready', async () => {
    try {
      adapter.log.info('Starting Adapter ' + adapter.namespace + ' in version ' + adapter.version);
      if (await setSentryLogging(adapter.config.sentry_enable)) return;
      let obj = await adapter.getForeignObjectAsync('system.config');
      if (adapter.config.alarm_password) {
        if (obj && obj.native && obj.native.secret) {
          //noinspection JSUnresolvedVariable
          adapter.config.alarm_password = decrypt(obj.native.secret, adapter.config.alarm_password);
        } else {
          //noinspection JSUnresolvedVariable
          adapter.config.alarm_password = decrypt('Zgfr56gFe87jJOM', adapter.config.alarm_password);
        }
      }
      if (adapter.config.alarm_password_confirm) {
        if (obj && obj.native && obj.native.secret) {
          //noinspection JSUnresolvedVariable
          adapter.config.alarm_password_confirm = decrypt(obj.native.secret, adapter.config.alarm_password_confirm);
        } else {
          //noinspection JSUnresolvedVariable
          adapter.config.alarm_password_confirm = decrypt('Zgfr56gFe87jJOM', adapter.config.alarm_password_confirm);
        }
      }
      if (obj && obj.common && obj.common.language) systemLanguage = (obj.common.language).toUpperCase();
      await main();
    } catch (error) {
      adapter.log.error('Error reading system.config: ' + error);
    }
  });

  return adapter;
}

/**
 * decrypt password
 * @param {*} key 
 * @param {*} value 
 */
function decrypt(key, value) {
  let result = '';
  if (value.startsWith('(crypt)')) {
    value = value.substr(7);
    for (let i = 0; i < value.length; ++i) {
      result += String.fromCharCode(key[i % key.length].charCodeAt(0) ^ value.charCodeAt(i));
    }
  } else {
    result = value;
  }
  return result;
}

/**
 * Check Paerameter
 */
function checkparameter() {
  if (!adapter.config.alarm_host || !adapter.config.alarm_port) {
    adapter.log.error('Hostname or Port in configuration missing!');
    return false;
  }
  if (!adapter.config.alarm_user || !adapter.config.alarm_password) {
    adapter.log.error('Unsername or password is missing!');
    return false;
  }
  return true;
}

/*
function pingalarmAsync(host, out) {
  return new Promise((resolve, reject) => {
    ping.sys.probe(host, (isAlive) => {
      let msg = isAlive ? 'Lupusec Alarmsystem ' + host + ' is alive' : 'Lupusec Alarmsystem ' + host + ' is not reachable';
      if (isAlive) {
        if (out) adapter.log.info(msg);
        resolve(true);
      } else {
        if (out) adapter.log.error(msg);
        resolve(false);
      }
    });
  });
}
*/

async function pingalarmAsync(host, out) {
  try {
    let res = await ping.promise.probe(host);
    let isAlive = res && res.alive;
    let msg = isAlive ? 'Lupusec Alarmsystem ' + host + ' is alive' : 'Lupusec Alarmsystem ' + host + ' is not reachable';
    if (out) {
      if (isAlive) {
        adapter.log.info(msg);
      } else {
        adapter.log.error(msg);
      }
    }
    return isAlive;
  } catch (error) {
    adapter.log.error('Error pinging ' + host + ' (' + error + ')');
    return false;
  }
}

async function changeAdapterConfigAsync(polltime, changedate) {
  let id = 'system.adapter.' + adapter.namespace;
  if (!changedate) {
    changedate = new Date();
  } else {
    let pattern = /(\d{1,2})\.(\d{1,2})\.(\d{4})/;
    changedate = new Date(changedate.replace(pattern, '$3-$2-$1'));
  }
  let unixtime = Math.round(changedate.getTime());
  try {
    let obj = await adapter.getForeignObjectAsync(id);
    if (obj && obj.native) {
      let lastChange = new Date(obj.ts); // only for debuging Interesting
      lastChange.setHours(0, 0, 0);
      obj.ts = lastChange.getTime();
      if (obj.native.alarm_polltime != polltime && unixtime > obj.ts) {
        adapter.log.info('Changing poll time from ' + obj.native.alarm_polltime + ' sec. to ' + polltime + ' sec.');
        obj.native.alarm_polltime = polltime;
        await adapter.setForeignObjectAsync(id, obj);
      }
    }
  } catch (error) { /* */ }
}

async function main() {
  let pollsec = 0.10; // not faster allowed as every 200 ms
  if (adapter.config.alarm_polltime < pollsec) await changeAdapterConfigAsync(pollsec);
  lupusecAsync = new LupusAync.Lupus(adapter, systemLanguage);
  let ping = await pingalarmAsync(adapter.config.alarm_host, true);
  if (!ping) {
    adapter.terminate('Not reachable');
    return;
  }
  // await pingalarmIntervall(adapter.config.alarm_host, 60);
  adapter.log.info('Checking the ioBroker Lupusec configuration');
  let check = checkparameter();
  // wenn alles okay ist, gehts los
  if (!check) {
    adapter.terminate('Parameter missing');
    return;
  }
  await lupusecAsync.deleteOldSates();
  if (adapter.config.alarm_https) {
    adapter.log.info('Connecting to Lupusec with https://' + adapter.config.alarm_host + ':' + adapter.config.alarm_port);
  } else {
    adapter.log.info('Connecting to Lupusec with http://' + adapter.config.alarm_host + ':' + adapter.config.alarm_port);
  }
  adapter.log.info('Polltime ' + adapter.config.alarm_polltime + ' sec.');
  await lupusecAsync.addToProcess(async () => await lupusecAsync.deviceListGet(), { loop: true }, 'deviceList');
  await lupusecAsync.addToProcess(async () => await lupusecAsync.devicePSSListGet(), { loop: true }, 'deviceListPSS');
  await lupusecAsync.addToProcess(async () => await lupusecAsync.panelCondGet(), { loop: true }, 'panelCond');
  await lupusecAsync.addToProcess(async () => await lupusecAsync.deviceEditAllGet(), { loop: true }, 'deviceEdit');
  await lupusecAsync.addToProcess(async () => await lupusecAsync.deviceAllGet(), { loop: true }, 'deviceEdit');
  if (adapter.config.webcam_providing) {
    // Starting Webcam 
    await lupusecAsync.addToProcess(async () => await lupusecAsync.getWebcamSnapshots(), { loop: true, wait: 60 }, 'webcam');
  } else {
    // Delete Webcams
    let deviceid = 'webcams';
    adapter.deleteDevice(deviceid);
  }
  adapter.subscribeStates(adapter.namespace + '.devices.*.status_ex');
  adapter.subscribeStates(adapter.namespace + '.devices.*.hue');
  adapter.subscribeStates(adapter.namespace + '.devices.*.sat');
  adapter.subscribeStates(adapter.namespace + '.devices.*.level');
  adapter.subscribeStates(adapter.namespace + '.devices.*.off');
  adapter.subscribeStates(adapter.namespace + '.devices.*.mode');
  adapter.subscribeStates(adapter.namespace + '.devices.*.name');
  adapter.subscribeStates(adapter.namespace + '.devices.*.sresp_button_*');
  adapter.subscribeStates(adapter.namespace + '.devices.*.sresp_emergency');
  adapter.subscribeStates(adapter.namespace + '.devices.*.send_notify');
  adapter.subscribeStates(adapter.namespace + '.devices.*.always_off');
  adapter.subscribeStates(adapter.namespace + '.devices.*.bypass');
  adapter.subscribeStates(adapter.namespace + '.devices.*.bypass_tamper');
  adapter.subscribeStates(adapter.namespace + '.devices.*.schar_latch_rpt');
  adapter.subscribeStates(adapter.namespace + '.devices.*.thermo_offset');
  adapter.subscribeStates(adapter.namespace + '.devices.*.factor');
  adapter.subscribeStates(adapter.namespace + '.devices.*.on_time');
  adapter.subscribeStates(adapter.namespace + '.devices.*.off_time');
  // adapter.subscribeStates(adapter.namespace + '.devices.*.mod');
  adapter.subscribeStates(adapter.namespace + '.devices.*.set_temperature');
  adapter.subscribeStates(adapter.namespace + '.devices.*.switch');
  adapter.subscribeStates(adapter.namespace + '.devices.*.pd');
  adapter.subscribeStates(adapter.namespace + '.status.mode_pc_a1');
  adapter.subscribeStates(adapter.namespace + '.status.mode_pc_a2');
  adapter.subscribeStates(adapter.namespace + '.status.apple_home_a1');
  adapter.subscribeStates(adapter.namespace + '.status.apple_home_a2');
  adapter.subscribeStates(adapter.namespace + '.devices.*.nuki_action');
}

/**
 * If started as allInOne mode => return function to create instance
 */
if (typeof module !== 'undefined' && module.parent) {
  module.exports = startAdapter;
} else {
  // or start the instance directly
  startAdapter();
}
'use strict';

// you have to require the utils module and call adapter function
const ping = require('ping');
const utils = require('@iobroker/adapter-core');
const LupusAync = require(__dirname + '/lib/lupusasync');
const adapterName = require('./package.json').name.split('.').pop();
const adapterNodeVer = require('./package.json').engines.node;
let lupusecAsync = null;
let adapter;

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
    // Warning, state can be null if it was deleted
    //  adapter.log.info('stateChange ' + id + ' ' + JSON.stringify(state));
    // you can use the ack flag to detect if it is status (true) or command (false)
    if (state && !state.ack) {
      if (lupusecAsync) {
        const regstatusex = /.+\.devices\.(.+)\.(.+)/gm;
        let m = regstatusex.exec(id);
        let idparent = id.split('.').slice(0, -1).join('.');
        let iddevice = id.split('.').slice(2, -1).join('.');
        let idtype = idparent + '.type';
        if (m !== null) {
          // adapter.getState(idtype, function(err, statetype) {
          let key = m[1]; // Device ID
          // let type = statetype.val;
          let type = lupusecAsync.getTypeById(key) || 0;
          let statusname = m[2]; // statusname
          let status = state.val;
          let form = {};
          switch (type) {
            // Schalter
            case 24:
            case 48:
              if (statusname == 'status_ex') {
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
                // await lupusecAsync.deviceSwitchPSSPost(form);
                await lupusecAsync.addToProcess(async () => await lupusecAsync.deviceSwitchPSSPost(form), 1, false);
              }
              break;
            // Dimmer / Unterputzrelais
            case 66:
              if (statusname == 'status_ex') {
                status === false ? status = 0 : status = 1;
                form = {
                  id: key,
                  switch: status
                };
                await lupusecAsync.addToProcess(async () => await lupusecAsync.deviceSwitchPSSPost(form), 1, false);
              }

              if (statusname == 'level') {
                // erst nach 500 ms ausführen, falls sich wert noch ändert!
                await lupusecAsync.addToProcess(lupusecAsync.callByDelay(async () => {
                  form = {
                    id: key,
                    level: status
                  };
                  await lupusecAsync.addToProcess(async () => await lupusecAsync.deviceSwitchDimmerPost(form), 1, false);
                }, key, statusname), 1, false);
              }
              break;

            // HUE Lampe
            case 74:
              if (statusname == 'status_ex') {
                status === false ? status = 0 : status = 1;
                form = {
                  id: key,
                  switch: status
                };
                await lupusecAsync.addToProcess(async () => await lupusecAsync.deviceSwitchPSSPost(form), 1, false);
              }

              if (statusname == 'hue' || statusname == 'sat') {
                // erst nach 500 ms ausführen, falls sich wert noch ändert!
                await lupusecAsync.addToProcess(lupusecAsync.callByDelay(async () => {
                  let hue;
                  let saturation;
                  if (statusname == 'hue') hue = status;
                  if (statusname == 'sat') saturation = status;
                  try {
                    if (statusname == 'sat') saturation = await adapter.getStateAsync(iddevice + '.sat');
                    if (statusname == 'hue') hue = await adapter.getStateAsync(iddevice + '.hue');
                  } catch (error) {
                    // 
                  }
                  form = {
                    id: key,
                    hue: hue || 0,
                    saturation: saturation || 0,
                    mod: 2
                  };
                  await lupusecAsync.addToProcess(async () => await lupusecAsync.deviceHueColorControl(form), 1, false);
                }, key, statusname), 1, false);
              }
              if (statusname == 'level') {
                // erst nach 500 ms ausführen, falls sich wert noch ändert!
                await lupusecAsync.addToProcess(lupusecAsync.callByDelay(async () => {
                  form = {
                    id: key,
                    level: status
                  };
                  await lupusecAsync.addToProcess(async () => await lupusecAsync.deviceSwitchDimmerPost(form), 1, false);
                }, key, statusname), 1, false);
              }
              break;

            // Rollläden
            case 76:
              if (statusname == 'switch') {
                // (0: runterfahren/zu, 1: hochfahren/auf, 2: stop)
                form = {
                  id: key,
                  switch: status
                };
                await lupusecAsync.addToProcess(async () => await lupusecAsync.deviceSwitchPSSPost(form), 1, false);
              }
              // down or up x %
              if (statusname == 'level') {
                form = {
                  id: key,
                  level: status
                };
                await lupusecAsync.addToProcess(async () => await lupusecAsync.deviceSwitchDimmerPost(form), 1, false);
              }
              break;

            // Thermometer
            case 79:
              if (statusname == 'mode') {
                form = {
                  id: key,
                  act: 't_schd_setting',
                  thermo_schd_setting: status == 0 ? 0 : 1
                };
                await lupusecAsync.addToProcess(async () => await lupusecAsync.deviceEditThermoPost(form), 1, false);
              }
              if (statusname == 'off') {
                form = {
                  id: key,
                  act: 't_mode',
                  thermo_mode: status == true ? 0 : 4
                };
                await lupusecAsync.addToProcess(async () => await lupusecAsync.deviceEditThermoPost(form), 1, false);
              }
              if (statusname == 'set_temperature') {
                form = {
                  id: key,
                  act: 't_setpoint',
                  thermo_setpoint: Math.trunc(100 * Math.round(2 * status) / 2)
                };
                await lupusecAsync.addToProcess(async () => await lupusecAsync.deviceEditThermoPost(form), 1, false);
              }
              break;

            default:
              break;
          }

          // });
        }

        // Area 1 alarm modus
        if (id == adapter.namespace + '.status.mode_pc_a1') {
          await lupusecAsync.addToProcess(async () => await lupusecAsync.panelCondPost({ area: 1, mode: state.val }), 1, false);
        }

        // Area 2 alarm modus
        if (id == adapter.namespace + '.status.mode_pc_a2') {
          await lupusecAsync.addToProcess(async () => await lupusecAsync.panelCondPost({ area: 2, mode: state.val }), 1, false);
        }

        // Area 1 alarm modus
        if (id == adapter.namespace + '.status.apple_home_a1') {
          let mode_pc_a1 = lupusecAsync.getLupusecFromAppleStautus(state.val);
          if (mode_pc_a1 >= 0 && mode_pc_a1 <= 4) {
            await lupusecAsync.addToProcess(async () => await lupusecAsync.panelCondPost({ area: 1, mode: mode_pc_a1 }), 1, false);
          }
        }

        // Area 2 alarm modus
        if (id == adapter.namespace + '.status.apple_home_a2') {
          let mode_pc_a2 = lupusecAsync.getLupusecFromAppleStautus(state.val);
          if (mode_pc_a2 >= 0 && mode_pc_a2 <= 4) {
            await lupusecAsync.addToProcess(async () => await lupusecAsync.panelCondPost({ area: 2, mode: mode_pc_a2 }), 1, false);
          }
        }

      }

    }

  });

  adapter.on('ready', async () => {
    try {
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
      await mainAsync();
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
  adapter.log.info('Checking the ioBroker Lupusec configuration');
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


function pingalarmAsync(host) {
  return new Promise((resolve, reject) => {
    ping.sys.probe(host, (isAlive) => {
      let msg = isAlive ? 'Lupusec Alarmsystem ' + host + ' is alive' : 'Lupusec Alarmsystem ' + host + ' is not reachable';
      if (isAlive) {
        adapter.log.info(msg);
        resolve(true);
      } else {
        adapter.log.error(msg);
        resolve(false);
      }
    });
  });
}

async function changeAdapterConfigAsync(polltime) {
  let id = 'system.adapter.' + adapter.namespace;
  try {
    let obj = await adapter.getForeignObjectAsync(id);
    if (obj && obj.native && obj.native.alarm_polltime != polltime) {
      obj.native.alarm_polltime = polltime;
      await adapter.setForeignObjectAsync(id, obj);
    }
  } catch (error) {
    //
  }

}

async function mainAsync() {
  await changeAdapterConfigAsync(0.5);
  lupusecAsync = new LupusAync.Lupus(adapter);
  let ping = await pingalarmAsync(adapter.config.alarm_host);
  let check = checkparameter();
  // wenn alles okay ist, gehts los
  if (ping && check) {
    await lupusecAsync.deleteOldSates();
    if (adapter.config.alarm_https) {
      adapter.log.info('Connecting to Lupusec with https://' + adapter.config.alarm_host + ':' + adapter.config.alarm_port);
    } else {
      adapter.log.info('Connecting to Lupusec with http://' + adapter.config.alarm_host + ':' + adapter.config.alarm_port);
    }
    await lupusecAsync.startProcess();
    await lupusecAsync.addToProcess(async () => await lupusecAsync.deviceListGet(), 2, true);
    await lupusecAsync.addToProcess(async () => await lupusecAsync.devicePSSListGet(), 2, true);
    await lupusecAsync.addToProcess(async () => await lupusecAsync.panelCondGet(), 2, true);
    // await lupusecAsync.addToProcess(async () => await lupusecAsync.deviceEditAllGet(), 2, true);
    // await lupusecAsync.addToProcess(async () => await lupusecAsync.deviceEditThermoGet(), 2, true);
    adapter.subscribeStates(adapter.namespace + '.devices.*.status_ex');
    adapter.subscribeStates(adapter.namespace + '.devices.*.hue');
    adapter.subscribeStates(adapter.namespace + '.devices.*.sat');
    adapter.subscribeStates(adapter.namespace + '.devices.*.level');
    adapter.subscribeStates(adapter.namespace + '.devices.*.off');
    adapter.subscribeStates(adapter.namespace + '.devices.*.mode');
    // adapter.subscribeStates(adapter.namespace + '.devices.*.mod');
    adapter.subscribeStates(adapter.namespace + '.devices.*.set_temperature');
    adapter.subscribeStates(adapter.namespace + '.devices.*.switch');
    adapter.subscribeStates(adapter.namespace + '.devices.*.pd');
    adapter.subscribeStates(adapter.namespace + '.status.mode_pc_a1');
    adapter.subscribeStates(adapter.namespace + '.status.mode_pc_a2');
    adapter.subscribeStates(adapter.namespace + '.status.apple_home_a1');
    adapter.subscribeStates(adapter.namespace + '.status.apple_home_a2');
  }
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
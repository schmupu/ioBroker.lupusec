'use strict';

// you have to require the utils module and call adapter function
var utils = require(__dirname + '/lib/utils'); // Get common adapter utils
var Lupus = require(__dirname + '/lib/lupus');
var adapter = new utils.Adapter('lupusec');
var lupusec = null;


// is called when adapter shuts down - callback has to be called under any circumstances!
adapter.on('unload', function (callback) {
  try {
    // adapter.log.info('cleaned everything up...');
    callback();
  } catch (e) {
    callback();
  }
});

// is called if a subscribed object changes
adapter.on('objectChange', function (id, obj) {
  // Warning, obj can be null if it was deleted
  // adapter.log.info('objectChange ' + id + ' ' + JSON.stringify(obj));
});

// is called if a subscribed state changes
adapter.on('stateChange', function (id, state) {
  // Warning, state can be null if it was deleted
  //  adapter.log.info('stateChange ' + id + ' ' + JSON.stringify(state));

  // you can use the ack flag to detect if it is status (true) or command (false)
  if (state && !state.ack) {

    if (lupusec) {

      const regstatusex = /.+\.devices\.(.+)\.(.+)/gm;
      let m = regstatusex.exec(id);
      let idparent = id.split(".").slice(0, -1).join(".");
      let iddevice = id.split(".").slice(2, -1).join(".");
      let idtype = idparent + ".type";

      if (m !== null) {

        // adapter.getState(idtype, function(err, statetype) {

        let key = m[1]; // Device ID
        // let type = statetype.val;
        let type = lupusec.getTypeById(key) || 0;
        let statusname = m[2]; // statusname
        let status = state.val;
        let values = {};

        switch (type) {

          // Schalter
          case 24:
          case 48:

            if (statusname == "status_ex") {

              status === false ? status = 0 : status = 1;
              values.switch = status;

              // PD Wert mitnehmen, falls vorhanden
              let idpd = idparent + ".pd";
              adapter.getState(idpd, function (err, state) {
                if (!err && state && !state.ack) {
                  values.pd = state.val;
                  adapter.setState(idpd, {
                    val: 0,
                    ack: true
                  });
                }
              });

              lupusec.DeviceSwitchPSSPost(key, values);

            }

            break;

          // HUE Lampe
          case 74:

            if (statusname == "status_ex") {

              status === false ? status = 0 : status = 1;
              values.switch = status;
              lupusec.DeviceSwitchPSSPost(key, values);

            }

            if (statusname == "hue") {
              // erst nach 500 ms ausführen, falls sich wert noch ändert!
              callByDelay(function () {
                values.hue = status;
                values.saturation = lupusec.getStateChangeById(iddevice + ".sat") || 0;
                values.mod = 2;
                lupusec.DeviceHueColorControl(key, values);
              }, "74_hue");
            }

            if (statusname == "sat") {
              // erst nach 500 ms ausführen, falls sich wert noch ändert!
              callByDelay(function () {
                values.saturation = status;
                values.hue = lupusec.getStateChangeById(iddevice + ".hue") || 0;
                values.mod = 2;
                lupusec.DeviceHueColorControl(key, values);
              }, "74_hue");
            }

            if (statusname == "level") {
              // erst nach 500 ms ausführen, falls sich wert noch ändert!
              callByDelay(function () {
                values.level = status;
                lupusec.DeviceSwitchDimmerPost(key, values);
              }, "74_level");
            }

            break;


          // Rollläden
          case 76:

            if (statusname == "switch") {

              // (0: runterfahren/zu, 1: hochfahren/auf)
              status == 0 ? values.switch = 0 : values.switch = 1;
              adapter.setState(id, {
                val: 0,
                ack: true
              });
              lupusec.DeviceSwitchPSSPost(key, values);
            }

            // down or up x %
            if (statusname == "level") {
              values.level = status;
              lupusec.DeviceSwitchDimmerPost(key, values);
            }

            break;

          // Thermometer
          case 79:

            if (statusname == "mode") {
              values.act = "t_schd_setting";
              if (status == 0) {
                values.thermo_schd_setting = 0;
              } else {
                values.thermo_schd_setting = 1;
              }
              lupusec.DeviceEditThermoPost(key, values);
            }

            if (statusname == "off") {
              values.act = "t_mode";
              if (status == true) {
                values.thermo_mode = 0;
              } else {
                values.thermo_mode = 4;
              }
              lupusec.DeviceEditThermoPost(key, values);
            }

            if (statusname == "set_temperature") {
              values.act = "t_setpoint";
              values.thermo_setpoint = Math.trunc(100 * Math.round(2 * status) / 2);
              lupusec.DeviceEditThermoPost(key, values);
            }

            break;

          default:

        }

        // });

      }

      // Area 1 alarm modus
      if (id == adapter.namespace + ".status.mode_pc_a1") {
        lupusec.PanelCondPost(1, state.val);
      }

      // Area 2 alarm modus
      if (id == adapter.namespace + ".status.mode_pc_a2") {
        lupusec.PanelCondPost(2, state.val);
      }

    }

  }

});


// is called when databases are connected and adapter received configuration.
// start here!
adapter.on('ready', function () {
  adapter.getForeignObject('system.config', (err, obj) => {

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
    main();
  });
});

// decrypt password
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

// Execute a callback function after x msec with a delayname. if you call callByDelay
// again, with a callback funtion, the older one will be canceld if not executed
// till now
function callByDelay(callback, delayname) {

  if (callByDelay.obj === undefined) {
    callByDelay.obj = {};
  }

  clearTimeout(callByDelay.obj[delayname]);
  callByDelay.obj[delayname] = setTimeout(function () {
    callback();
  }, 500);

}


// Check Paerameter
function checkparameter(callback) {

  adapter.log.info('Checking the ioBroker Lupusec configuration');

  if (!adapter.config.alarm_host || !adapter.config.alarm_port) {
    adapter.log.error('Hostname or Port in configuration missing!');
    return;
  }

  if (!adapter.config.alarm_user || !adapter.config.alarm_password) {
    adapter.log.error('Unsername or password is missing!');
    return;
  }

  // return pingalarm(callback);
  return callback && callback();

}

// if alarmssystem reachable
function pingalarm(callback) {

  let ping = require('ping');
  let host = adapter.config.alarm_host;

  ping.sys.probe(host, (isAlive) => {

    var msg = isAlive ? 'Lupusec Alarmsystem ' + host + ' is alive' : 'Lupusec Alarmsystem ' + host + ' is not reachable';

    if (isAlive) {
      adapter.log.info(msg);
      return callback && callback();
    } else {
      adapter.log.error(msg);
    }

  });

}


function changeAdapterConfig(polltime) {
  var id = "system.adapter." + adapter.namespace;
  adapter.getForeignObject(id, function (err, obj) {
    if (obj && obj.native.alarm_polltime != polltime) {
      obj.native.alarm_polltime = polltime;
      adapter.setForeignObject(id, obj, function (err) {
        if (err) adapter.log.error(err);
      });
    }
  });
}

// main function
function main() {

  changeAdapterConfig(1.0);
  lupusec = new Lupus(adapter);
  lupusec.startProcess();

  // Check Parameter
  checkparameter(() => {

    // test if we can reach the lupusec alarm system with a ping
    pingalarm(() => {

      // Load all state in lupusec object
      lupusec.setAllStateChange(() => {

        // wenn alles okay ist, gehts los
        if (adapter.config.alarm_https) {
          adapter.log.info('Connecting to Lupusec with https://' + adapter.config.alarm_host + ':' + adapter.config.alarm_port);
        } else {
          adapter.log.info('Connecting to Lupusec with http://' + adapter.config.alarm_host + ':' + adapter.config.alarm_port);
        }

        // delete or update old objects
        lupusec.deleteOldStates();

        /*
        lupusec.DeviceListGet();
        lupusec.DevicePSSListGet();
        lupusec.PanelCondGet();
        // lupusec.DeviceEditAllGet();
        */

        lupusec.addToProcess(function () {
          return lupusec.DeviceListGet();
        }, 2);
        lupusec.addToProcess(function () {
          return lupusec.DevicePSSListGet();
        }, 2);
        lupusec.addToProcess(function () {
          return lupusec.PanelCondGet();
        }, 2);

        adapter.subscribeStates(adapter.namespace + ".devices.*.status_ex");
        adapter.subscribeStates(adapter.namespace + ".devices.*.hue");
        adapter.subscribeStates(adapter.namespace + ".devices.*.sat");
        adapter.subscribeStates(adapter.namespace + ".devices.*.level");
        adapter.subscribeStates(adapter.namespace + ".devices.*.off");
        adapter.subscribeStates(adapter.namespace + ".devices.*.mode");
        // adapter.subscribeStates(adapter.namespace + ".devices.*.mod");
        adapter.subscribeStates(adapter.namespace + ".devices.*.set_temperature");
        adapter.subscribeStates(adapter.namespace + ".devices.*.switch");
        adapter.subscribeStates(adapter.namespace + ".devices.*.pd");
        adapter.subscribeStates(adapter.namespace + ".status.mode_pc_a1");
        adapter.subscribeStates(adapter.namespace + ".status.mode_pc_a2");

      })

    })

  })

}

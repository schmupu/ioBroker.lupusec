'use strict';

// you have to require the utils module and call adapter function
var utils = require(__dirname + '/lib/utils'); // Get common adapter utils
var Lupus = require(__dirname + '/lib/lupus');
var adapter = new utils.Adapter('lupusec');
var lupusec = null;


// is called when adapter shuts down - callback has to be called under any circumstances!
adapter.on('unload', function(callback) {
  try {
    // adapter.log.info('cleaned everything up...');
    callback();
  } catch (e) {
    callback();
  }
});

// is called if a subscribed object changes
adapter.on('objectChange', function(id, obj) {
  // Warning, obj can be null if it was deleted
  // adapter.log.info('objectChange ' + id + ' ' + JSON.stringify(obj));
});

// is called if a subscribed state changes
adapter.on('stateChange', function(id, state) {
  // Warning, state can be null if it was deleted
  //  adapter.log.info('stateChange ' + id + ' ' + JSON.stringify(state));

  // you can use the ack flag to detect if it is status (true) or command (false)
  if (state && !state.ack) {

    if (lupusec) {

      const regstatusex = /.+\.devices\.(.+)\.(.+)/gm;
      let m = regstatusex.exec(id);
      let idparent = id.split(".").slice(0, -1).join(".");

      if (m !== null) {

        let key = m[1]; // Device
        let statusname = m[2]; // statusname
        let status = state.val;
        let values = {};

        if (statusname == "status_ex") {

          if (status === false) {
            status = 0;
          } else {
            status = 1;
          }

          values.switch = status;

          // PD Wert mitnehmen, falls vorhanden
          let idpd = idparent + ".pd";
          adapter.getState(idpd, function(err, state) {
            if (!err && state && state.val > 0) {
              values.pd = state.val;
              adapter.setState(idpd, {
                val: 0,
                ack: true
              });
            }
          });

          lupusec.DeviceSwitchPSSPost(key, values);

        }

        if (statusname == "hue") {
          values.hue = status;
          lupusec.DeviceHueColorControl(key, values);
        }

        if (statusname == "sat") {
          values.saturation = status;
          lupusec.DeviceHueColorControl(key, values);
        }

        if (statusname == "level") {
          values.level = status;
          lupusec.DeviceSwitchDimmerPost(key, values);
        }

      }

      if (id == adapter.namespace + ".status.mode_pc_a1") {
        lupusec.PanelCondPost(1, state.val);
      }

      if (id == adapter.namespace + ".status.mode_pc_a2") {
        lupusec.PanelCondPost(2, state.val);
      }

    }

  }

});

// Some message was sent to adapter instance over message box. Used by email, pushover, text2speech, ...
adapter.on('message', function(obj) {
  if (typeof obj === 'object' && obj.message) {
    if (obj.command === 'send') {
      // e.g. send email or pushover or whatever
      // console.log('send command');

      // Send response in callback if required
      if (obj.callback) adapter.sendTo(obj.from, obj.command, 'Message received', obj.callback);
    }
  }
});

// is called when databases are connected and adapter received configuration.
// start here!
adapter.on('ready', function() {
  main();
});

function main() {

  lupusec = new Lupus(adapter);

  if (adapter.config.alarm_host != null && adapter.config.alarm_host != "") {

    lupusec.DeviceListGet();
    lupusec.DevicePSSListGet();
    lupusec.PanelCondGet();
    // lupusec.DeviceEditAllGet();

    adapter.subscribeStates(adapter.namespace + ".devices.*.status_ex");
    adapter.subscribeStates(adapter.namespace + ".devices.*.hue");
    adapter.subscribeStates(adapter.namespace + ".devices.*.sat");
    adapter.subscribeStates(adapter.namespace + ".devices.*.level");
    //adapter.subscribeStates(adapter.namespace + ".devices.*.pd");
    adapter.subscribeStates(adapter.namespace + ".status.mode_pc_a1");
    adapter.subscribeStates(adapter.namespace + ".status.mode_pc_a2");

  }


}

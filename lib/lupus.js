'use strict';
// const ping	= require('ping');
const request = require('request');
const types = require(__dirname + '/datapoints');


var urlTokenGet = "/action/tokenGet";
var urlLogoutPost = "/action/logout";
var urlDeviceListGet = "/action/deviceListGet";
var urlDevicePSSListGet = "/action/deviceListPSSGet";
var urlPanelCondGet = "/action/panelCondGet";
var urlPanelCondPost = "/action/panelCondPost";
var urlDeviceSwitchPSSPost = "/action/deviceSwitchPSSPost";
var urlDeviceEditGet = "/action/deviceEditGet";
var urlDeviceEditPost = "/action/deviceEditPost";
var urlDeviceSwitchDimmerPost = "/action/deviceSwitchDimmerPost";
var urlDeviceHueColorControl = "/action/deviceHueColorControl";
var urlDeviceEditThermoPost = "/action/deviceEditThermoPost";
var urlDeviceEditThermoGet = "/action/deviceEditThermoGet";

// *******************************************************************************
// Constructur
// *******************************************************************************
function Lupus(adapter) {

  this.adapter = adapter;
  this.hostname = this.adapter.config.alarm_host;
  this.port = this.adapter.config.alarm_port;
  this.https = this.adapter.config.alarm_https || false;
  this.username = this.adapter.config.alarm_user;
  this.password = this.adapter.config.alarm_password;
  this.pollsec = this.adapter.config.alarm_polltime || 15;
  this.allstates = this.adapter.config.alarm_allstates || false;
  this.types = {};

  this.auth = "Basic " + new Buffer(this.username + ":" + this.password).toString("base64");

  if (this.https) {

    this.url = "https://" + this.hostname;

  } else {

    this.url = "http://" + this.hostname;

  }

  if (!this.port) {

    this.port = this.https === true ? 443 : 80;

  }

  this.url = this.url + ":" + this.port;

  return this;

}

// *******************************************************************************
// Id und Types miteinander verknüpfen
// *******************************************************************************
Lupus.prototype.setTypeById = function(id, type) {

  this.types[id] = type;

}

// *******************************************************************************
// Id und Types miteinander verknüpfen
// *******************************************************************************
Lupus.prototype.getTypeById = function(id) {

  return (this.types[id] || 0);

}

// *******************************************************************************
// Complete URL. For example http://hostname/Service
// *******************************************************************************
Lupus.prototype.getURL = function(service) {

  return this.url + service;

}

// *******************************************************************************
// Sonderzeichen, wie tabs, LF etc. aus String entfernen
// *******************************************************************************
Lupus.prototype.delSonderzeichen = function(text) {

  text = text.replace(/\r/g, '');
  text = text.replace(/\n/g, '');
  text = text.replace(/\t/g, ' ');
  text = text.replace(/\f/g, '');
  return text;

}

// *******************************************************************************
// Get Type from Value (variable) status
// *******************************************************************************
Lupus.prototype.getPropertyType = function(status) {

  let type = null;

  switch (Object.prototype.toString.call(status)) {
    case "[object Object]":
      type = "object";
      break;
    case "[object Array]":
      type = "array";
      break;
    case "[object Number]":
      type = "number";
      break;
    case "[object Boolean]":
      type = "boolean";
      break;
    case "[object String]":
      type = "string";
      break;
    default:
      type = null;
  }

  return type;

}

// *******************************************************************************
// Get Type of Status (DataPoint) (Example: 48, status_ex)
// *******************************************************************************
Lupus.prototype.getTypeList = function(lupusType) {

  let ret = null;

  ret = typeList['TYPE_' + lupusType];

  if (!ret) {

    ret = {
      name: "Unknown",
      devlist: 'type_unknown'
    };

  }

  // return ret;
  return JSON.parse(JSON.stringify(ret));

}


// *******************************************************************************
// Get Type of Status (DataPoint) (Example: 48, status_ex)
// *******************************************************************************
Lupus.prototype.getDatapointDeviceList = function(lupusType, name) {

  let dp = null;
  let ret = this.getTypeList(lupusType) || {};

  if (ret) {

    dp = dpDeviceList[ret.devlist][name] || dpDeviceList.type_all[name] || null;

  }

  // return dp;
  return JSON.parse(JSON.stringify(dp));

}

// *******************************************************************************
// Get Type of Status (DataPoint). Ecample: mode_a1
// *******************************************************************************
Lupus.prototype.getDatapointStatus = function(name) {

  let dp = null;

  dp = dpStatus[name] || {};

  // return dp;
  return JSON.parse(JSON.stringify(dp));

}


// *******************************************************************************
// Set a state for an id. If id does not exist, the id will be created
// *******************************************************************************
Lupus.prototype.createObjectForDevice = function(deviceid, devicename, devicetype) {

  var self = this;

  let ret = this.getTypeList(devicetype);
  let a = dpDeviceList.type_all || {};
  let b = {};

  if (ret) {

    b = dpDeviceList[ret.devlist] || {};

  }

  // Wir arbeiten nur mit Kopien
  a = JSON.parse(JSON.stringify(a));
  b = JSON.parse(JSON.stringify(b));

  let obj = Object.assign(a, b);

  for (let prop in obj) {

    let id = deviceid + '.' + prop;
    let parameter = JSON.parse(JSON.stringify(obj[prop]));

    parameter.name = devicename + ' ' + parameter.name;

    self.adapter.setObjectNotExists(id, {
      type: 'state',
      common: parameter,
      native: {}
    });

  }

}


// *******************************************************************************
// Set a state for an id. If id does not exist, the id will be created
// setStateForDevice('RF:000XYZ.info.area', area, 'Keypad Haustür', 37, 154454545454)
// *******************************************************************************
Lupus.prototype.setStateForDevice = function(id, statusname, statusvalue, devicename, devicetype, ts) {

  var self = this;

  // Prüfen ob Status angzeigt werden soll.
  let parameter = self.getDatapointDeviceList(devicetype, statusname);
  let type = self.getPropertyType(statusvalue);
  // let statusname = id.split(".").slice(-1).join(".");

  if (type == "object") {

    statusvalue = "{" + statusvalue.toString() + "}";

  }

  if (type == "array") {

    statusvalue = "[" + statusvalue.toString() + "]";

  }

  if (parameter) {

    // falls Type anders als Value, dann anpassen.
    if (parameter.type == "boolean" && parameter.type != type) {

      if (statusvalue == "" || statusvalue == 0 || statusvalue == null) {

        statusvalue = false;

      } else {

        statusvalue = true;

      }

    }

    if (ts === null) {

      ts = Date.now();

    }

    self.adapter.getState(id, function(err, state) {

      if (!err) {
        // Wenn sate null ist, d.h. bisher war das Object leer, dann setzten
        // wenn Wert sich geändert hat und ack == true dann status ändern, kann nur durch read auf read eintreten
        // Wenn ack == false, dann Wert ändern wenn der gelesene Werte mindesesn 5 Sek. neuer ist

        if (state === null ||
          (state.val != statusvalue && state.ack === true) ||
          (state.ack === false && ts > (state.ts + (self.pollsec / 2)))) {

          self.adapter.setState(id, {
            val: statusvalue,
            ack: true
          });

        }

      }

    });

  } else if (this.allstates) {

    // Alte Logik
    parameter = {
      val: statusvalue,
      name: 'State ' + devicename + ' ' + statusname,
      type: type,
      role: 'value',
      read: true,
      write: false,
      ts: ts
    };

    self.setObjectState(id, parameter);

  }

}


// *******************************************************************************
// Set a state for an id. If id does not exist, the id will be created
// *******************************************************************************
Lupus.prototype.createObjectForStatus = function(deviceid, devicename) {

  var self = this;

  let obj = dpStatus || {};

  for (let prop in obj) {

    let id = deviceid + '.' + prop;
    let parameter = JSON.parse(JSON.stringify(obj[prop]));

    parameter.name = devicename + ' ' + parameter.name;

    self.adapter.setObjectNotExists(id, {
      type: 'state',
      common: parameter,
      native: {}
    });

  }

}


// *******************************************************************************
// Set a state for an id. If id does not exist, the id will be created
// Example
// setStateForStatus('Status.mode_a1', mode_a1, 'AREA_MODE_0', 152343454354345)
// *******************************************************************************
Lupus.prototype.setStateForStatus = function(id, statusname, statusvalue, ts) {

  var self = this;

  // Prüfen ob Status angzeigt werden soll.
  let parameter = self.getDatapointStatus(statusname);
  let type = self.getPropertyType(statusvalue);
  // let statusname = id.split(".").slice(-1).join(".");

  if (type == "object") {

    statusvalue = "{" + statusvalue.toString() + "}";

  }

  if (type == "array") {

    statusvalue = "[" + statusvalue.toString() + "]";

  }

  if (parameter) {

    // falls Type anders als Value, dann anpassen.
    if (parameter.type == "boolean" && parameter.type != type) {

      if (statusvalue == "" || statusvalue == 0 || statusvalue == null) {

        statusvalue = false;

      } else {

        statusvalue = true;

      }

    }

    if (ts === null) {

      ts = Date.now();

    }

    self.adapter.getState(id, function(err, state) {

      if (!err) {
        // Wenn sate null ist, d.h. bisher war das Object leer, dann setzten
        // wenn Wert sich geändert hat und ack == true dann status ändern, kann nur durch read auf read eintreten
        // Wenn ack == false, dann Wert ändern wenn der gelesene Werte mindesesn 5 Sek. neuer ist
        if (state === null ||
          (state.val != statusvalue && state.ack === true) ||
          (state.ack === false && ts > (state.ts + (self.pollsec / 2)))) {

          self.adapter.setState(id, {
            val: statusvalue,
            ack: true
          });

        }

      }

    });

  } else if (this.allstates) {

    // Alte Logik
    parameter = {
      val: statusvalue,
      name: 'Status Alarmanlage ' + statusname,
      type: type,
      role: 'value',
      read: true,
      write: false,
      ts: ts
    };

    self.setObjectState(id, parameter);

  }

}

// *******************************************************************************
// Set a state for an id. If id does not exist, the id will be created
// *******************************************************************************
Lupus.prototype.setObjectState = function(id, status) {

  var self = this;

  if (status.ts === null) {

    status.ts = Date.now();

  }

  self.adapter.setObjectNotExists(id, {
    type: 'state',
    common: status,
    native: {}
  });

  self.adapter.getObject(id, function(err, obj) {

    if (!err && obj) {

      self.adapter.getState(id, function(err, state) {

        if (!err) {

          // Wenn sate null ist, d.h. bisher war das Object leer, dann setzten
          // wenn Wert sich geändert hat und ack == true dann status ändern, kann nur durch read auf read eintreten
          // Wenn ack == false, dann Wert ändern wenn der gelesene Werte mindesesn 5 Sek. neuer ist
          if (state === null ||
            (state.val != status.val && state.ack === true) ||
            (state.ack === false && status.ts > (state.ts + (self.pollsec / 2)))) {

            self.adapter.setState(id, {
              val: status.val,
              ack: true
            });

          }

        }

      });

    }

  });

}

// *******************************************************************************
// Get Token for crosssite attacks
// *******************************************************************************
Lupus.prototype.TokenGet = function(callback) {

  var self = this;

  function parse(body) {

    let arrayBody = JSON.parse(body);
    let token = arrayBody.message;

    return token;

  }

  function read(callback) {

    self.adapter.log.debug("Starting Request in TokenGet");

    let options = {
      url: this.getURL(urlTokenGet),
      rejectUnauthorized: false,
      headers: {
        "Authorization": this.auth
      }
    };

    request.get(options, function(error, response, body) {

      if (error || response.statusCode !== 200) {

        self.adapter.log.info("Fehler in funciton TokenGet: " + error);

        return callback(self, error || {
          statusCode: response.statusCode
        });

      } else if (body) {

        body = self.delSonderzeichen(body);
        self.adapter.log.debug("TokenGet : " + body);

        try {
          let token = parse(arrayBody);
          self.adapter.log.debug("TokenGet (JSON.parse) : " + JSON.stringify(arrayBody));

          if (callback) {
            callback(self, null, token);
          }

        } catch (e) {

          self.adapter.log.info("TokenGet : " + e); // error in the above string (in this case, yes)!
          if (callback) {
            return callback(self, e);
          }

        }

      }

    });

  }

  read(callback);

}

// *******************************************************************************
// Post Request with getting Token for crosssite attacks before
// *******************************************************************************
Lupus.prototype.PostTokenRequest = function(options, callback) {

  var self = this;

  function Token(callbackpost) {

    self.adapter.log.debug("Starting Token Request in PostTokenRequest");

    let options = {
      url: self.getURL(urlTokenGet),
      rejectUnauthorized: false,
      headers: {
        "Authorization": self.auth
      }
    };

    request.get(options, function(error, response, body) {

      if (error || response.statusCode !== 200) {

        self.adapter.log.info("Fehler in Token Request in PostTokenRequest: " + error);

        return callbackpost(error || {
          statusCode: response.statusCode
        });

      } else if (body) {

        body = self.delSonderzeichen(body);
        self.adapter.log.debug("Token Request in PostTokenRequest : " + body);

        try {

          let arrayBody = JSON.parse(body);
          let token = arrayBody.message;

          self.adapter.log.debug("Token Request in PostTokenRequest (Token): " + token);

          if (callbackpost) {

            callbackpost(null, token);

          }

        } catch (e) {

          self.adapter.log.info("Token Request in PostTokenRequest : " + e); // error in the above string (in this case, yes)!

          if (callbackpost) {

            return callbackpost(self, e);

          }

        }

      }

    });

  }

  function Post(error, token) {

    if (!error) {
      // Kopie vom Object
      let opt = JSON.parse(JSON.stringify(options));

      opt.headers = {
        "Authorization": options.headers.Authorization,
        "X-Token": token
      };

      request.post(opt, function(error, response, body) {

        if (error || response.statusCode !== 200) {

          self.adapter.log.error("Fehler in Service " + opt.url + ": " + error);
          return callback(error);

        } else if (body) {

          try {

            if (callback) {

              callback(null, body);

            } else {

              self.adapter.log.error("Callback fehlt in Service " + opt.url);

            }

          } catch (e) {

            self.adapter.log.error("Callback fehlt in Service (catch) " + opt.url);

          }

        }

      });

    } else {

      self.adapter.log.error("Fehler in Post in PostTokenRequest: " + error);
      return callback(error);

    }

  }

  Token(Post);

}

// *******************************************************************************
// PostRequest
// *******************************************************************************
Lupus.prototype.PostRequest = function(options, callback) {

  var self = this;

  request.post(options,

    function(error, response, body) {

      if (error || response.statusCode !== 200) {

        self.adapter.log.error("Fehler in Service " + options.url + ": " + error);
        return callback(error);

      } else if (body) {

        try {

          if (callback) {

            callback(null, body);

          } else {

            self.adapter.log.error("Callback fehlt in Service " + options.url);

          }

        } catch (e) {

          self.adapter.log.error("Callback fehlt in Service (catch)" + options.url);

        }

      }

    });

}

// *******************************************************************************
// GetRequest
// *******************************************************************************
Lupus.prototype.GetRequest = function(options, callback) {

  var self = this;

  request.get(options,

    function(error, response, body) {

      if (error || response.statusCode !== 200) {

        self.adapter.log.error("Fehler in Service " + options.url + ": " + error);
        return callback(error);

      } else if (body) {

        try {

          if (callback) {

            callback(null, body);

          } else {

            self.adapter.log.error("Callback fehlt in Service " + options.url);

          }

        } catch (e) {

          self.adapter.log.error("Callback fehlt in Service  (catch) " + options.url);

        }

      }

    });

}


// *******************************************************************************
// Status for DeviceListGet and DeviceListPSSGet. Both results (output) of
// API ist simular
// *******************************************************************************
Lupus.prototype.DeviceListDevicePSSListSetStatus = function(object) {

  var self = this;
  let ts = Date.now();

  for (let devicename in object) {

    let device = object[devicename];

    if (Object.prototype.toString.call(device) === '[object Object]') {

      let deviceid = 'devices';
      let channelid = null;

      if (device.sid) {
        // DeviceListGet
        channelid = deviceid + '.' + device.sid;
        if (device.type) {
          self.setTypeById(device.sid, device.type);
        }

      } else if (device.id) {
        // DeviceListPSSGet
        channelid = deviceid + '.' + device.id;
        if (device.type) {
          self.setTypeById(device.sid, device.type);
        }

      } else {
        self.adapter.log.error("DeviceListDevicePSSListSetStatus : ID missing");
        return;
      }

      self.adapter.setObjectNotExists(deviceid, {
        type: 'device',
        common: {
          name: 'Devices Alarmanlage'
        },
        native: {}
      });

      self.adapter.setObjectNotExists(channelid, {
        type: 'channel',
        common: {
          name: device.name
        },
        native: {}
      });

      self.createObjectForDevice(channelid, device.name, device.type);

      for (let statusname in device) {

        let statusvalue = device[statusname];
        let statusid = channelid + '.' + statusname;

        //  Aus "{WEB_MSG_DC_CLOSE} or "{WEB_MSG_DC_OPEN} wird CLOSE bzw. OPEN
        if (statusname == "status") {

          const regstat = /\{WEB_MSG_DC_(.+)\}/gm;
          let m = regstat.exec(statusvalue);

          if (m && m.length > 0) {

            statusvalue = m[1]; // .toLowerCase();

          }

        }

        // Allgemeine Statusabfragen speichern
        if (statusname != "rssi") {
          self.setStateForDevice(statusid, statusname, statusvalue, device.name, device.type, ts);
        }

        // zustätzlicher Status einführen (alarm_statu_ex). This value will be true/false
        if (statusname == "alarm_status") {

          let tmpname = statusname + "_ex";
          let tmpid = channelid + '.' + tmpname;
          let tmpvalue = statusvalue;
          //self.setObjectStateForDevice(id, statusname, status, device.name, device.type, tms);

          self.setStateForDevice(tmpid, tmpname, tmpvalue, device.name, device.type, ts);

        }

        // Set TYPE Name like Türkontakt or Keypad
        if (statusname == "type") {

          let type = this.getTypeList(statusvalue) || {};

          if (type) {

            let tmpname = statusname + "_name";
            let tmpid = channelid + '.' + tmpname;
            let tmpvalue = type.name;
            self.setStateForDevice(tmpid, tmpname, tmpvalue, device.name, device.type, ts);

          }

        }

        // For Power Switches, 2 new States
        if (statusname == "rssi") {

          let reg = /\{WEB_MSG_(.+)\}(.*)/gm;
          let m = reg.exec(statusvalue);
          let rssi = 0;
          let tmpname;
          let tmpid;

          if (m) {

            // rssitxt = m[1].trim();
            rssi = m[2] ? m[2].trim() : 0;

            tmpname = 'rssi';
            tmpid = channelid + '.' + tmpname;
            self.setStateForDevice(tmpid, tmpname, rssi, device.name, device.type, ts);

          }

        }

        // For Power Switches, 2 new States
        if (statusname == "status" && device.type == 48) {

          let reg = /\{WEB_MSG_PSM_POWER\}(.+)\{WEB_MSG_POWER_METER_ENERGY\}(.+)/gm;
          let m = reg.exec(statusvalue);
          let power = 0;
          let powertotal = 0;
          let tmpname;
          let tmpid;

          if (m) {

            power = m[1].trim();
            powertotal = m[2].trim();

            tmpname = 'power';
            tmpid = channelid + '.' + tmpname;
            self.setStateForDevice(tmpid, tmpname, power, device.name, device.type, ts);

            tmpname = 'powertotal';
            tmpid = channelid + '.' + tmpname;
            self.setStateForDevice(tmpid, tmpname, powertotal, device.name, device.type, ts);

          }

        }

        // Shutter, if shutter level (0-100%) change, the swich value will change too
        if (statusname == "level" && device.type == 76) {

          let tmpname;
          let tmpid;
          let vswitch;

          // alten Wert lesen
          tmpname = 'level';
          tmpid = channelid + '.' + tmpname;
          self.adapter.getState(tmpid, function(err, state) {

            if (!err && state) {

              if (statusvalue != state.val) {

                //  statusvalue > state.val (100 > 10), shutter open (1)
                //  statusvalue < state.val (10 > 100), shutter close (0)
                vswitch = statusvalue > state.val ? 1 : 0;
                tmpname = 'switch';
                tmpid = channelid + '.' + tmpname;
                self.setStateForDevice(tmpid, tmpname, vswitch, device.name, device.type, ts);

              }

            }

          });

        }

        // For Thermostate new States
        if (statusname == "status" && device.type == 79) {

          let reg;
          let m;
          let actualtemperature = 0;
          let settemperature = 0;
          let valve = 0;
          let mode = 0;
          let off = false;
          let tmpname;
          let tmpid;

          // Ist Termperatur
          reg = /\{WEB_MSG_TS_DEGREE\}\s*([\d\.]+)/gm;
          m = reg.exec(statusvalue);
          actualtemperature = 0;

          if (m) {

            actualtemperature = m[1].trim();

          }

          tmpname = 'actual_temperature';
          tmpid = channelid + '.' + tmpname;
          self.setStateForDevice(tmpid, tmpname, actualtemperature, device.name, device.type, ts);

          // Ventilstellung
          reg = /\{WEB_MSG_TRV_VALVE\}\s*([\d\.]+)/gm;
          m = reg.exec(statusvalue);
          valve = 0;

          if (m) {

            valve = m[1].trim();

          }

          tmpname = 'valve';
          tmpid = channelid + '.' + tmpname;
          self.setStateForDevice(tmpid, tmpname, valve, device.name, device.type, ts);


          // Soll Termperatur
          reg = /\{WEB_MSG_TRV_SETPOINT\}\s*([\d\.]+)/gm;
          m = reg.exec(statusvalue);
          settemperature = 0;

          if (m) {

            settemperature = m[1].trim();

          }

          tmpname = 'set_temperature';
          tmpid = channelid + '.' + tmpname;
          self.setStateForDevice(tmpid, tmpname, settemperature, device.name, device.type, ts);


          // Auto / Manueller Mode
          reg = /\{WEB_MSG_TRV_(AUTO|MANUAL)\}/gm;
          m = reg.exec(statusvalue);
          mode = 0;

          if (m) {

            if (m[1].trim() == 'MANUAL') {

              mode = 0; // manuell

            } else {

              mode = 1; // automatic

            }

          }

          tmpname = 'mode';
          tmpid = channelid + '.' + tmpname;
          self.setStateForDevice(tmpid, tmpname, mode, device.name, device.type, ts);


          // Heizung aus
          reg = /\{WEB_MSG_TRV_(OFF)\}/gm;
          m = reg.exec(statusvalue);
          off = false;

          if (m) {

            if (m[1].trim() == 'OFF') {

              off = true;

            }

          }

          tmpname = 'off';
          tmpid = channelid + '.' + tmpname;
          self.setStateForDevice(tmpid, tmpname, off, device.name, device.type, ts);

        }

      }

    }

  }

}


// *******************************************************************************
// List of all states for a device
// *******************************************************************************
Lupus.prototype.DeviceListGet = function() {

  var self = this;

  function setStatus(object) {

    self.DeviceListDevicePSSListSetStatus(object);

  }


  function parse(error, body) {

    if (!error) {

      self.adapter.log.debug("Starting Parsing in DeviceListGet");
      body = self.delSonderzeichen(body);
      self.adapter.log.debug("DeviceListGet : " + body);

      try {

        let arrayBody = JSON.parse(body).senrows;
        self.adapter.log.debug("DeviceListGet (JSON.parse) : " + JSON.stringify(arrayBody));
        setStatus(arrayBody);

      } catch (e) {

        self.adapter.log.error("DeviceListGet : " + e); // error in the above string (in this case, yes)!
        return;

      }

    } else {

      self.adapter.log.error("Fehler in funciton DeviceListGet: " + error);

    }

  }

  function read() {

    let options = {
      url: self.getURL(urlDeviceListGet),
      rejectUnauthorized: false,
      headers: {
        "Authorization": self.auth
      }
    };

    // self.GetRequest(options, parse);
    self.GetRequest(options, function(error, data) {
      parse(error, data);
      setTimeout(read, self.pollsec * 1000);
    });

  }

  read();

}

// *******************************************************************************
// Liefert eine Liste aller angelernten Funkschalter / Aktoren der Lupusec Zentrale
// *******************************************************************************
Lupus.prototype.DevicePSSListGet = function() {

  var self = this;

  function setStatus(object) {

    self.DeviceListDevicePSSListSetStatus(object);

  }


  function parse(error, body) {

    if (!error) {

      self.adapter.log.debug("Starting Parsing in DeviceListPSSGet");
      body = self.delSonderzeichen(body);
      self.adapter.log.debug("DeviceListPSSGet : " + body);

      try {

        let arrayBody = JSON.parse(body).pssrows;
        self.adapter.log.debug("DeviceListPSSGet (JSON.parse) : " + JSON.stringify(arrayBody));
        setStatus(arrayBody);

      } catch (e) {

        self.adapter.log.error("DeviceListPSSGet : " + e); // error in the above string (in this case, yes)!
        return;

      }

    } else {

      self.adapter.log.error("Fehler in funciton DevicePSSListGet: " + error);

    }

  }

  function read() {

    let options = {
      url: self.getURL(urlDevicePSSListGet),
      rejectUnauthorized: false,
      headers: {
        "Authorization": self.auth
      }
    };

    // self.GetRequest(options, parse);
    self.GetRequest(options, function(error, data) {

      parse(error, data);
      setTimeout(read, self.pollsec * 1000);

    });

  }

  read();

}

// *******************************************************************************
// Logout, not realy needed
// *******************************************************************************
Lupus.prototype.LogoutPost = function() {

  var self = this;

  function parse(error, body) {

    let ret = 0;

    body = self.delSonderzeichen(body);
    ret = JSON.parse(body).result;

    if (error || ret != 1) {

      self.adapter.log.error("Fehler LogoutPost");

    }

  }

  function read() {

    let options = {
      url: self.getURL(urlLogoutPost),
      rejectUnauthorized: false
    };

    // self.GetRequest(options, parse);
    self.GetRequest(options, function(error, data) {

      parse(error, data);
      setTimeout(read, self.pollsec * 1000);

    });

  }

  read();

}

// *******************************************************************************
// Liefert den Zustand der Lupusec Zentrale
// *******************************************************************************
Lupus.prototype.PanelCondGet = function() {

  var self = this;

  function setStatus(object) {

    let ts = Date.now();
    let devicename = "Status Alarmanlage";
    let deviceid = "status";
    let objectnew = {};

    for (let statusname in object.updates) {
      let status = object.updates[statusname];
      objectnew[statusname] = status;
    }

    for (let statusname in object.forms.pcondform1) {
      let status = object.forms.pcondform1[statusname];
      objectnew[statusname + "_pc_a1"] = status;
    }

    for (let statusname in object.forms.pcondform2) {
      let status = object.forms.pcondform2[statusname];
      objectnew[statusname + "_pc_a2"] = status;
    }

    // Device Anlagen
    self.adapter.setObjectNotExists(deviceid, {
      type: 'device',
      common: {
        name: "Status Alarmanlage"
      },
      native: {}
    });

    self.createObjectForStatus(deviceid, devicename);

    for (let statusname in objectnew) {

      let statusvalue = objectnew[statusname];
      let statusid = deviceid + "." + statusname;


      // self.setObjectStateForStatus(id, statusname, status, devicename, tms);
      self.setStateForStatus(statusid, statusname, statusvalue, ts);

    }

  }

  function parse(error, body) {

    if (!error) {

      self.adapter.log.debug("Starting Parsing in PanelCondGet");
      body = self.delSonderzeichen(body);
      self.adapter.log.debug("PanelCondGet : " + body);

      try {

        let arrayBody = JSON.parse(body);
        self.adapter.log.debug("PanelCondGet (JSON.parse) : " + JSON.stringify(arrayBody));
        setStatus(arrayBody);
        //setLupusStatus(arrayBody, "lupusec.panelcond", "");

      } catch (e) {

        self.adapter.log.error("PanelCondGet : " + e); // error in the above string (in this case, yes)!
        return;

      }

    } else {

      self.adapter.log.error("Fehler in funciton PanelCondGet: " + error);

    }

  }

  function read() {

    let options = {
      url: self.getURL(urlPanelCondGet),
      rejectUnauthorized: false,
      headers: {
        "Authorization": self.auth
      }
    };

    // self.GetRequest(options, parse);
    self.GetRequest(options, function(error, data) {
      parse(error, data);
      setTimeout(read, self.pollsec * 1000);
    });

  }

  read();

}

// *******************************************************************************
// Liefert den Zustand der Lupusec Zentrale
// *******************************************************************************
Lupus.prototype.PanelCondPost = function(area, mode) {

  var self = this;

  function parse(error, body) {

    let ret = 0;
    body = self.delSonderzeichen(body);
    ret = JSON.parse(body).result;

    if (error || ret != 1) {

      self.adapter.log.error("Fehler PanelCondPost");

    }

  }

  function write() {

    let form = {
      area: area,
      mode: mode
    };

    let options = {
      url: self.getURL(urlPanelCondPost),
      rejectUnauthorized: false,
      headers: {
        "Authorization": self.auth
      },
      form: form
    };

    self.PostTokenRequest(options, parse);
  }

  write();

}


// *******************************************************************************
// Generic Post
// *******************************************************************************
Lupus.prototype.DeviceGenericPost = function(url, id, parameter) {

  var self = this;

  function parse(error, body) {

    let ret = 0;
    body = self.delSonderzeichen(body);
    ret = JSON.parse(body).result;

    if (error || ret != 1) {

      self.adapter.log.error("Fehler DeviceGenericPost for url " + url);

    }

  }

  function write() {

    let form = {
      id: id
    };

    for (let prop in parameter) {
      if (typeof parameter[prop] !== "undefined" && parameter[prop] !== null) {
        form[prop] = parameter[prop];
      }

    }

    let options = {
      url: self.getURL(url),
      rejectUnauthorized: false,
      headers: {
        "Authorization": self.auth
      },
      form: form
    };

    self.PostTokenRequest(options, parse);
  }

  write();

}


// *******************************************************************************
// Liefert den Zustand der Lupusec Zentrale
// *******************************************************************************
Lupus.prototype.DeviceSwitchDimmerPost = function(id, parameter) {

  var self = this;

  self.DeviceGenericPost(urlDeviceSwitchDimmerPost, id, parameter);

}

// *******************************************************************************
// Liefert den Zustand der Lupusec Zentrale
// *******************************************************************************
Lupus.prototype.DeviceHueColorControl = function(id, parameter) {

  var self = this;

  self.DeviceGenericPost(urlDeviceHueColorControl, id, parameter);

}


// *******************************************************************************
// Ändert Status am Thermostaten
// *******************************************************************************
Lupus.prototype.DeviceEditThermoPost = function(id, parameter) {

  var self = this;

  self.DeviceGenericPost(urlDeviceEditThermoPost, id, parameter);

}

// *******************************************************************************
// Liefert den Zustand der Lupusec Zentrale
// *******************************************************************************
Lupus.prototype.DeviceSwitchPSSPost = function(id, parameter) {

  var self = this;

  self.DeviceGenericPost(urlDeviceSwitchPSSPost, id, parameter);

}

// *******************************************************************************
// Getting master data like sensor name for a device
// *******************************************************************************
Lupus.prototype.DeviceEditGet = function(id) {

  var self = this;

  function setStatus(object) {

    let ts = Date.now();
    let deviceid = 'devices';
    let devicename = 'Devices Alarmanlage';

    let channelid = deviceid + '.' + object.forms.ssform.id;
    let channelname = object.forms.ssform.sname

    self.adapter.setObjectNotExists(deviceid, {
      type: 'device',
      common: {
        name: devicename
      },
      native: {}
    });

    self.adapter.setObjectNotExists(channelid, {
      type: 'channel',
      common: {
        name: channelname
      },
      native: {}
    });

    let objectnew = {};

    for (let statusname in object.forms.ssform) {

      let statusvalue = object.forms.ssform[statusname];
      objectnew["ssf_" + statusname] = statusvalue;

    }

    for (let statusname in object.forms.updates) {

      let statusvalue = object.forms.updates[statusname];
      objectnew["upd_" + statusname] = statusvalue;

    }

    for (let statusname in objectnew) {

      let statusvalue = objectnew[statusname];
      let statustype = self.getPropertyType(statusvalue);
      let statusid = channelid + '.' + statusname;

      let write = false;

      if (statustype !== null) {

        if (statustype == "object") {
          statusvalue = "{" + status.toString() + "}";
        }

        if (statustype == "array") {
          statusvalue = "[" + status.toString() + "]";
        }

        let parameter = {
          val: statusvalue,
          name: channelname + ' ' + statusname,
          type: statustype,
          write: write,
          ts: ts
        };

        self.setObjectState(statusid, parameter);

      }

    }

  }

  function parse(error, body) {

    if (!error) {

      self.adapter.log.debug("Starting Parsing in DeviceEditGet");
      body = self.delSonderzeichen(body);
      self.adapter.log.debug("DeviceEditGet : " + body);

      try {

        let arrayBody = JSON.parse(body);
        self.adapter.log.debug("DeviceEditGet (JSON.parse) : " + JSON.stringify(arrayBody));
        setStatus(arrayBody);
        // setLupusStatus(arrayBody, "lupusec.devices." + sid + ".edit", name);

      } catch (e) {

        self.adapter.log.error("DeviceEditGet : " + e); // error in the above string (in this case, yes)!
        return;

      }

    } else {

      self.adapter.log.error("Fehler in funciton DeviceEditGet: " + error);

    }

  }

  function read() {

    let form = {
      id: id
    };

    let options = {
      url: self.getURL(urlDeviceEditGet),
      rejectUnauthorized: false,
      headers: {
        "Authorization": self.auth
      },
      form: form
    };

    // self.PostRequest(options, parse);
    self.PostRequest(options, function(error, data) {
      parse(error, data);
      setTimeout(read, 4 * self.pollsec * 1000);
    });

  }

  read();

}

// *******************************************************************************
// Gets all master data
// *******************************************************************************
Lupus.prototype.DeviceEditAllGet = function() {

  var self = this;
  var arr = [];

  function read() {

    let deviceid = 'devices';

    self.adapter.getChannels(deviceid, function(err, channels) {

      if (!err && channels) {

        for (let c = 0; c < channels.length; c++) {

          // let id = devices[d]._id + ".info.sid";
          let channelid = channels[c]._id.split(".").slice(-1).join(".");

          if (arr.indexOf(channelid) < 0) {

            arr.push(channelid);
            self.DeviceEditGet(channelid);

          }

        }

      }

    });

  }

  read();
  setInterval(read, self.pollsec * 1000);

}

// *******************************************************************************
// DeviceEditPost
// *******************************************************************************
Lupus.prototype.DeviceEditPost = function(id, parameter) {

  var self = this;

  function parse(error, body) {

    let ret = 0;
    body = self.delSonderzeichen(body);
    ret = JSON.parse(body).result;

    if (error || ret != 1) {

      self.adapter.log.error("Fehler DeviceEditPost");

    }

  }

  function write() {

    let form = {
      id: id,
    };

    for (let prop in parameter) {
      if (typeof parameter[prop] !== "undefined" && parameter[prop] !== null) {
        form[prop] = parameter[prop];
      }
    }

    let options = {
      url: self.getURL(urlDeviceEditPost),
      rejectUnauthorized: false,
      headers: {
        "Authorization": self.auth
      },
      form: form
    };

    self.PostTokenRequest(options, parse);

  }

  write();

}

module.exports = Lupus;

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

// *******************************************************************************
// Constructur
// *******************************************************************************
function Lupus(adapter) {
  this.adapter = adapter;
  this.hostname = this.adapter.config.alarm_host;
  this.https = this.adapter.config.alarm_https || false;
  this.username = this.adapter.config.alarm_user;
  this.password = this.adapter.config.alarm_password;
  this.pollsec = this.adapter.config.alarm_polltime || 15;
  this.allstates = this.adapter.config.alarm_allstates || false;
  this.auth = "Basic " + new Buffer(this.username + ":" + this.password).toString("base64");
  if (this.https) {
    this.url = "https://" + this.hostname;
  } else {
    this.url = "http://" + this.hostname;
  }
  return this;
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
  return ret;
};

// *******************************************************************************
// Get Type of Status (DataPoint) (Example: 48, status_ex)
// *******************************************************************************

Lupus.prototype.getDatapointDeviceList = function(lupusType, name) {
  let dp = null;
  let ret = this.getTypeList(lupusType);
  if (ret) {
    dp = dpDeviceList[ret.devlist][name] || dpDeviceList.type_all[name] || null;
  }
  return dp;
};

// *******************************************************************************
// Get Type of Status (DataPoint)
// *******************************************************************************
Lupus.prototype.getDatapointStatus = function(name) {
  let dp = null;
  dp = dpStatus[name];
  return dp;
};

// *******************************************************************************
// Set a state for an id. If id does not exist, the id will be created
// *******************************************************************************
Lupus.prototype.setObjectStateForDevice = function(id, statusname, statusvalue, devicename, devicetype, ts) {

  var self = this;

  // Prüfen ob Status angzeigt werden soll.
  let parameter = self.getDatapointDeviceList(devicetype, statusname);
  let type = self.getPropertyType(statusvalue);
  if (type == "object") {
    statusvalue = "{" + statusvalue.toString() + "}";
  }

  if (type == "array") {
    statusvalue = "[" + statusvalue.toString() + "]";
  }
  if (parameter) {
    // Kopie vom Object
    parameter = JSON.parse(JSON.stringify(parameter));
    if (parameter.name) {
      parameter.name = 'State ' + devicename + ' ' + parameter.name;
    } else {
      parameter.name = 'State ' + devicename + ' ' + statusname;
    }
    parameter.val = statusvalue;
    parameter.ts = ts;
    // fals Type anders als Value, dann anpassen.
    if (parameter.type == "boolean" && parameter.type != type) {
      if (statusvalue == "" || statusvalue == 0 || statusvalue == null) {
        parameter.val = false;
      } else {
        parameter.val = true;
      }
    }
    self.setObjectState(id, parameter);
  } else if (this.allstates) {

    // Alte Logik
    parameter = {
      val: statusvalue,
      name: 'State ' + devicename + ' ' + statusname,
      type: type,
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
Lupus.prototype.setObjectStateForStatus = function(id, statusname, statusvalue, devicename, ts) {

  var self = this;

  // Prüfen ob Status angzeigt werden soll.
  let parameter = self.getDatapointStatus(statusname);
  let type = self.getPropertyType(statusvalue);
  if (type == "object") {
    statusvalue = "{" + statusvalue.toString() + "}";
  }

  if (type == "array") {
    statusvalue = "[" + statusvalue.toString() + "]";
  }
  if (parameter) {
    // Kopie vom Object
    parameter = JSON.parse(JSON.stringify(parameter));
    if (parameter.name) {
      parameter.name = devicename + ' ' + parameter.name;
    } else {
      parameter.name = devicename + ' ' + statusname;
    }
    parameter.val = statusvalue;
    parameter.ts = ts;
    // falls Type anders als Value, dann anpassen.
    if (parameter.type == "boolean" && parameter.type != type) {
      if (statusvalue == "" || statusvalue == 0 || statusvalue == null) {
        parameter.val = false;
      } else {
        parameter.val = true;
      }
    }
    self.setObjectState(id, parameter);

  } else if (this.allstates) {

    // Alte Logik
    parameter = {
      val: statusvalue,
      name: 'Status Alarmanlage ' + statusname,
      type: type,
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
// List of all states for a device
// *******************************************************************************
Lupus.prototype.DeviceListGet = function() {
  var self = this;

  function setStatus(object) {
    let tms = Date.now();
    for (let devicename in object) {
      let device = object[devicename];
      if (Object.prototype.toString.call(device) === '[object Object]') {
        self.adapter.setObjectNotExists(device.sid, {
          type: 'device',
          common: {
            name: device.name
          },
          native: {}
        });
        self.adapter.setObjectNotExists(device.sid + '.info', {
          type: 'channel',
          common: {
            name: 'Channel ' + device.name
          },
          native: {}
        });
        for (let statusname in device) {
          let status = device[statusname];
          let id = device.sid + '.info.' + statusname;

          self.setObjectStateForDevice(id, statusname, status, device.name, device.type, tms);

          // zustätzlicher Status einführen (alarm_statu_ex)
          if (statusname == "alarm_status") {
            statusname = statusname + "_ex";
            id = device.sid + '.info.' + statusname;
            self.setObjectStateForDevice(id, statusname, status, device.name, device.type, tms);
          }

        }
      }
    }
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
    let tms = Date.now();
    for (let devicename in object) {
      let device = object[devicename];
      if (Object.prototype.toString.call(device) === '[object Object]') {
        self.adapter.setObjectNotExists(device.id, {
          type: 'device',
          common: {
            name: device.name
          },
          native: {}
        });
        self.adapter.setObjectNotExists(device.id + '.info', {
          type: 'channel',
          common: {
            name: 'Channel ' + device.name
          },
          native: {}
        });
        for (let statusname in device) {
          let status = device[statusname];
          let id = device.id + '.info.' + statusname;

          self.setObjectStateForDevice(id, statusname, status, device.name, device.type, tms);

          // zustätzlicher Status einführen (alarm_statu_ex)
          if (statusname == "alarm_status") {
            statusname = statusname + "_ex";
            id = device.id + '.info.' + statusname;
            self.setObjectStateForDevice(id, statusname, status, device.name, device.type, tms);
          }

        }
      }
    }
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
    let tms = Date.now();
    let devicename = "Status";
    let sid = devicename;
    let objectnew = {};
    for (let statusname in object.updates) {
      let status = object.updates[statusname];
      objectnew[statusname] = status;
      // obj["upd_" + statusname] = status;
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
    self.adapter.setObjectNotExists(sid, {
      type: 'device',
      common: {
        name: "Status Alarmanlage"
      },
      native: {}
    });

    for (let statusname in objectnew) {
      let status = objectnew[statusname];
      let id = sid + "." + statusname;


      self.setObjectStateForStatus(id, statusname, status, devicename, tms);

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
// Liefert den Zustand der Lupusec Zentrale
// *******************************************************************************
Lupus.prototype.DeviceSwitchDimmerPost = function(id, parameter) {
  var self = this;

  function parse(error, body) {
    let ret = 0;
    body = self.delSonderzeichen(body);
    ret = JSON.parse(body).result;
    if (error || ret != 1) {
      self.adapter.log.error("Fehler DeviceSwitchDimmerPost");
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
      url: self.getURL(urlDeviceSwitchDimmerPost),
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
Lupus.prototype.DeviceHueColorControl = function(id, parameter) {
  var self = this;

  function parse(error, body) {
    let ret = 0;
    body = self.delSonderzeichen(body);
    ret = JSON.parse(body).result;
    if (error || ret != 1) {
      self.adapter.log.error("Fehler DeviceHueColorControl");
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
      url: self.getURL(urlDeviceHueColorControl),
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
Lupus.prototype.DeviceSwitchPSSPost = function(id, parameter) {
  var self = this;

  function parse(error, body) {
    let ret = 0;
    body = self.delSonderzeichen(body);
    ret = JSON.parse(body).result;
    if (error || ret != 1) {
      self.adapter.log.error("Fehler DeviceSwitchPSSPost");
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
      url: self.getURL(urlDeviceSwitchPSSPost),
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
// Getting master data like sensor name for a device
// *******************************************************************************
Lupus.prototype.DeviceEditGet = function(id) {
  var self = this;

  function setStatus(object) {
    let tms = Date.now();
    let deviceid = object.forms.ssform.id;
    let devicename = object.forms.ssform.sname;
    self.adapter.setObjectNotExists(deviceid, {
      type: 'device',
      common: {
        name: devicename
      },
      native: {}
    });
    self.adapter.setObjectNotExists(deviceid + '.edit', {
      type: 'channel',
      common: {
        name: 'Channel ' + devicename
      },
      native: {}
    });
    let objectnew = {};
    for (let statusname in object.forms.ssform) {
      let status = object.forms.ssform[statusname];
      objectnew["ssf_" + statusname] = status;
    }
    for (let statusname in object.forms.updates) {
      let status = object.forms.updates[statusname];
      objectnew["upd_" + statusname] = status;
    }
    for (let statusname in objectnew) {
      let status = objectnew[statusname];
      let type = self.getPropertyType(status);
      let id = deviceid + '.edit.' + statusname;
      let write = false;
      if (type !== null) {
        if (type == "object") {
          status = "{" + status.toString() + "}";
        }
        if (type == "array") {
          status = "[" + status.toString() + "]";
        }
        let parameter = {
          val: status,
          name: 'State ' + devicename + ' ' + statusname,
          type: type,
          write: write,
          ts: tms
        };

        self.setObjectState(id, parameter);
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
    self.adapter.getDevices(function(err, devices) {
      if (!err && devices) {
        for (let d = 0; d < devices.length; d++) {
          let id = devices[d]._id + ".info.sid";
          self.adapter.getState(id, function(err, state) {
            if (!err && state) {
              if (arr.indexOf(state.val) < 0) {
                arr.push(state.val);
                self.DeviceEditGet(state.val);
              }
            }
          });
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

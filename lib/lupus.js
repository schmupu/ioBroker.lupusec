'use strict';

var request = require('request');
var debug = false;
var pollsec = 15;

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
  this.https = this.adapter.config.alarm_https;
  this.username = this.adapter.config.alarm_user;
  this.password = this.adapter.config.alarm_password;
  this.auth = "Basic " + new Buffer(this.username + ":" + this.password).toString("base64");

  if (this.https) {

    this.url = "https://" + this.hostname;

  } else {

    this.url = "http://" + this.hostname;

  }

  return this;

}

// *******************************************************************************
// Get Url
// *******************************************************************************
Lupus.prototype.getURL = function(service) {

  return this.url + service;

}


// *******************************************************************************
// Logging
// *******************************************************************************
Lupus.prototype.logging = function(text, deb = false) {

  if (deb === true) {

    if (debug === true) {

      this.adapter.log.info("Debug: " + text);

    }

  } else {

    this.adapter.log.info(text);

  }

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
// Sonderzeichen, wie tabs, LF etc. aus String entfernen
// *******************************************************************************
Lupus.prototype.getPropertyType = function(status) {

  var type = null;

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


Lupus.prototype.setObjectState = function(id, status, statusname, type, write = false) {

  var self = this;

  self.adapter.setObjectNotExists(id, {
    type: 'state',
    common: {
      name: statusname,
      type: type,
      role: "",
      read: true,
      write: write
    },
    native: {}
  });

  self.adapter.getObject(id, function(err, obj) {

    if (!err && obj) {

      self.adapter.setState(id, {
        val: status,
        ack: true
      });

    }

  });

}

// *******************************************************************************
// Get Token
// *******************************************************************************
Lupus.prototype.TokenGet = function(callback) {

  var self = this;

  function parse(body) {

    var arrayBody = JSON.parse(body);
    var token = arrayBody.message;
    return token;

  }


  function read(callback) {

    self.logging("Starting Request in TokenGet", true);

    var options = {
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
        self.logging("TokenGet : " + body, true);

        try {

          var token = parse(arrayBody);

          self.logging("TokenGet (JSON.parse) : " + JSON.stringify(arrayBody), true);

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
// GetRequest
// *******************************************************************************
Lupus.prototype.PostTokenRequest = function(options, callback) {

  var self = this;

  function Token(callbackpost) {

    self.logging("Starting Token Request in PostTokenRequest", true);

    var options = {
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
        self.logging("Token Request in PostTokenRequest : " + body, true);

        try {

          var arrayBody = JSON.parse(body);
          var token = arrayBody.message;

          self.logging("Token Request in PostTokenRequest (Token): " + token, true);

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
      var opt = JSON.parse(JSON.stringify(options));

      opt.headers = {
        "Authorization": options.headers.Authorization,
        "X-Token": token
      };


      request.post(opt, function(error, response, body) {

        if (error || response.statusCode !== 200) {

          self.adapter.log.error("Fehler in Service " + opt.url + ": " + error);

        } else if (body) {

          try {

            if (callback) {

              callback(null, body);

            } else {

              self.adapter.log.error("Callback fehlt in Service " + opt.url);

            }

          } catch (e) {

            self.adapter.log.error("Callback fehlt in Service " + opt.url);
            return callback(e);

          }

        }

      });

    } else {

      self.adapter.log.error("Fehler in Post in PostTokenRequest: " + error);

    }

  }

  Token(Post);

}

// *******************************************************************************
// GetRequest
// *******************************************************************************
Lupus.prototype.PostRequest = function(options, callback) {

  var self = this;

  request.post(options,

    function(error, response, body) {

      if (error || response.statusCode !== 200) {

        self.adapter.log.error("Fehler in Service " + options.url + ": " + error);

      } else if (body) {

        try {

          if (callback) {

            callback(null, body);

          } else {

            self.adapter.log.error("Callback fehlt in Service " + options.url);

          }

        } catch (e) {

          self.adapter.log.error("Callback fehlt in Service " + options.url);
          return callback(e);

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

      } else if (body) {

        try {

          if (callback) {

            callback(null, body);

          } else {

            self.adapter.log.error("Callback fehlt in Service " + options.url);

          }

        } catch (e) {

          self.adapter.log.error("Callback fehlt in Service " + options.url);
          return callback(e);

        }

      }

    });

}


// *******************************************************************************
// Liefert eine Liste aller Sensoren der Lupusec Zentrale
// *******************************************************************************
Lupus.prototype.DeviceListGet = function() {

  var self = this;

  function setStatus(object) {

    for (var devicename in object) {

      var device = object[devicename];

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

        for (var statusname in device) {

          let status = device[statusname];
          let type = self.getPropertyType(status);
          let id = device.sid + '.info.' + statusname;
          let write = false;

          // Stecker hat Schreibberechtigung
          if (device.type == 48 && statusname == "status_ex") {
            write = true;
          } else {
            write = false;
          }

          if (type !== null) {

            if (type == "object") {
              status = "{" + status.toString() + "}";
            }
            if (type == "array") {
              status = "[" + status.toString() + "]";
            }

            self.setObjectState(id, status, statusname, type, write);

            if (statusname == "alarm_status") {

              statusname = statusname + "_ex";
              id = device.sid + '.info.' + statusname;
              if (status == "") {
                status = 0;
              } else {
                status = 1;
              }
              self.setObjectState(id, status, statusname, type, write);

            }


          }

        }

      }

    }

  }

  function parse(error, body) {

    if (!error) {

      self.logging("Starting Parsing in DeviceListGet", true);
      body = self.delSonderzeichen(body);
      self.logging("DeviceListGet : " + body, true);

      try {

        var arrayBody = JSON.parse(body).senrows;

      } catch (e) {

        self.adapter.log.error("DeviceListGet : " + e); // error in the above string (in this case, yes)!
        return;
      }

      self.logging("DeviceListGet (JSON.parse) : " + JSON.stringify(arrayBody), true);
      setStatus(arrayBody);

    } else {

      self.adapter.log.error("Fehler in funciton DeviceListGet: " + error);

    }

  }

  function read() {

    var options = {
      url: self.getURL(urlDeviceListGet),
      rejectUnauthorized: false,
      headers: {
        "Authorization": self.auth
      }
    };

    self.GetRequest(options, parse);

  }

  read();


}

// *******************************************************************************
// Liefert eine Liste aller angelernten Funkschalter / Aktoren der Lupusec Zentrale
// *******************************************************************************
Lupus.prototype.DevicePSSListGet = function() {

  var self = this;

  function parse(error, body) {

    if (!error) {

      self.logging("Starting Parsing in DeviceListPSSGet", true);
      body = self.delSonderzeichen(body);
      self.logging("DeviceListPSSGet : " + body, true);

      try {

        var arrayBody = JSON.parse(body).pssrows;

      } catch (e) {

        self.adapter.log.error("DeviceListPSSGet : " + e); // error in the above string (in this case, yes)!
        return;
      }

      self.logging("DeviceListPSSGet (JSON.parse) : " + JSON.stringify(arrayBody), true);

      for (var i = 0; i < arrayBody.length; i++) {

        var sensor = arrayBody[i];
        // setLupusStatus(sensor, "lupusec.devices." + sensor.id + ".info", sensor.name);

      }

    } else {

      self.adapter.log.error("Fehler in funciton DevicePSSListGet: " + error);

    }

  }

  function read() {

    var options = {
      url: self.getURL(urlDevicePSSListGet),
      rejectUnauthorized: false,
      headers: {
        "Authorization": self.auth
      }
    };

    self.GetRequest(options, parse);

  }

  read();

}

// *******************************************************************************
// Logout
// *******************************************************************************
Lupus.prototype.LogoutPost = function() {

  var self = this;

  function parse(error, body) {

    var ret = 0;

    body = self.delSonderzeichen(body);
    ret = JSON.parse(body).result;

    if (error || ret != 1) {

      self.logging("Fehler");

    }

  }

  function read() {

    var options = {
      url: self.getURL(urlLogoutPost),
      rejectUnauthorized: false
    };

    self.GetRequest(options, parse);

  }

  read();

}


// *******************************************************************************
// Liefert den Zustand der Lupusec Zentrale
// *******************************************************************************
Lupus.prototype.PanelCondGet = function() {

  var self = this;

  function setStatus(object) {

    var sid = "Status";
    var objectnew = {};

    for (let statusname in object.updates) {

      var status = object.updates[statusname];
      objectnew[statusname] = status;
      // obj["upd_" + statusname] = status;

    }

    for (let statusname in object.forms.pcondform1) {

      var status = object.forms.pcondform1[statusname];
      objectnew[statusname + "_pc_a1"] = status;

    }

    for (let statusname in object.forms.pcondform2) {

      var status = object.forms.pcondform2[statusname];
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
      let type = self.getPropertyType(status);
      let id = sid + "." + statusname;
      let write = false;

      if (type !== null) {

        if (type == "object") {
          status = "{" + status.toString() + "}";
        }
        if (type == "array") {
          status = "[" + status.toString() + "]";
        }

        if (statusname == "mode_pc_a1" || statusname == "mode_pc_a2") {

          write = true;

        } else {

          write = false;

        }

        self.adapter.setObjectNotExists(id, {
          type: 'state',
          common: {
            name: statusname,
            type: type,
            role: "",
            read: true,
            write: write
          },
          native: {}
        });

        self.adapter.getObject(id, function(err, obj) {

          if (!err && obj) {

            self.adapter.setState(id, {
              val: status,
              ack: true
            });

          }

        });

      }

    }

  }


  function parse(error, body) {

    if (!error) {

      self.logging("Starting Parsing in PanelCondGet", true);
      body = self.delSonderzeichen(body);
      self.logging("PanelCondGet : " + body, true);

      try {

        var arrayBody = JSON.parse(body);

      } catch (e) {

        self.adapter.log.error("PanelCondGet : " + e); // error in the above string (in this case, yes)!
        return;

      }

      self.logging("PanelCondGet (JSON.parse) : " + JSON.stringify(arrayBody), true);
      setStatus(arrayBody);
      //setLupusStatus(arrayBody, "lupusec.panelcond", "");

    } else {

      self.adapter.log.error("Fehler in funciton PanelCondGet: " + error);

    }

  }

  function read() {

    var options = {
      url: self.getURL(urlPanelCondGet),
      rejectUnauthorized: false,
      headers: {
        "Authorization": self.auth
      }
    };

    self.GetRequest(options, parse);

  }

  read();

}

// *******************************************************************************
// Liefert den Zustand der Lupusec Zentrale
// *******************************************************************************
Lupus.prototype.PanelCondPost = function(area, mode) {

  var self = this;

  function parse(error, body) {

    var ret = 0;

    body = self.delSonderzeichen(body);
    ret = JSON.parse(body).result;

    if (error || ret != 1) {

      self.logging("Fehler");

    }

  }

  function write() {

    var form = {
      area: area,
      mode: mode
    };

    var options = {
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
Lupus.prototype.DeviceSwitchPSSPost = function(id, parameter) {

  var self = this;

  function parse(error, body) {

    var ret = 0;

    body = self.delSonderzeichen(body);
    ret = JSON.parse(body).result;

    if (error || ret != 1) {

      self.logging("Fehler");

    }

  }

  function write() {

    var form = {
      id: id
    };

    for (var prop in parameter) {

      if (typeof parameter[prop] !== "undefined" && parameter[prop] !== null) {
        form[prop] = parameter[prop];
      }

    }

    var options = {
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
// Liefert den Zustand der Lupusec Zentrale
// *******************************************************************************
Lupus.prototype.DeviceEditGet = function(id) {

  var self = this;

  function setStatus(object) {

    var deviceid = object.forms.ssform.id;
    var devicename = object.forms.ssform.sname;

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

    var objectnew = {};

    for (let statusname in object.forms.ssform) {

      var status = object.forms.ssform[statusname];
      objectnew["ssf_" + statusname] = status;

    }

    for (let statusname in object.forms.updates) {

      var status = object.forms.updates[statusname];
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

        self.adapter.setObjectNotExists(id, {
          type: 'state',
          common: {
            name: statusname,
            type: type,
            role: "",
            read: true,
            write: write
          },
          native: {}
        });

        self.adapter.getObject(id, function(err, obj) {

          if (!err && obj) {

            self.adapter.setState(id, {
              val: status,
              ack: true
            });

          }

        });

      }

    }

  }


  function parse(error, body) {

    if (!error) {

      self.logging("Starting Parsing in DeviceEditGet", true);
      body = self.delSonderzeichen(body);
      self.logging("DeviceEditGet : " + body, true);

      try {

        var arrayBody = JSON.parse(body);

      } catch (e) {

        self.adapter.log.error("DeviceEditGet : " + e); // error in the above string (in this case, yes)!
        return;

      }

      self.logging("DeviceEditGet (JSON.parse) : " + JSON.stringify(arrayBody), true);
      setStatus(arrayBody);
      // setLupusStatus(arrayBody, "lupusec.devices." + sid + ".edit", name);

    } else {

      self.adapter.log.error("Fehler in funciton DeviceEditGet: " + error);

    }

  }

  function read() {

    var form = {
      id: id
    };

    var options = {
      url: self.getURL(urlDeviceEditGet),
      rejectUnauthorized: false,
      headers: {
        "Authorization": self.auth
      },
      form: form
    };

    self.PostRequest(options, parse);

  }

  read();

}

// *******************************************************************************
// Liefert den Zustand der Lupusec Zentrale
// *******************************************************************************
Lupus.prototype.DeviceEditAllGet = function() {

  var self = this;

  self.adapter.getDevices(function(err, devices) {

    if (!err && devices) {

      for (var d = 0; d < devices.length; d++) {

        var id = devices[d]._id + ".info.sid";

        self.adapter.getState(id, function(err, state) {

          if (!err && state) {

            self.DeviceEditGet(state.val);

          }

        });

      }

    }

  });

}

// *******************************************************************************
// DeviceEditPost
// *******************************************************************************
Lupus.prototype.DeviceEditPost = function(id, parameter) {

  var self = this;

  function parse(error, body) {

    var ret = 0;

    body = self.delSonderzeichen(body);
    ret = JSON.parse(body).result;

    if (error || ret != 1) {

      self.logging("Fehler");

    }

  }

  function write() {

    var form = {
      id: id,
    };

    for (var prop in parameter) {

      if (typeof parameter[prop] !== "undefined" && parameter[prop] !== null) {
        form[prop] = parameter[prop];
      }

    }

    var options = {
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


// *******************************************************************************
// Test Test Test
// *******************************************************************************
Lupus.prototype.test = function() {

  var timerDeviceListGet;
  var timerlDevicePSSListGet;
  var timerPanelCondGet;
  var timerDeviceEditGet;

  var self = this;

  /*
  self.LogoutPost();
  self.DeviceSwitchPSSPost("ZS:a61d01", {
    switch: 0
  });
  self.PanelCondPost(1, 0);
*/

  timerDeviceListGet = setInterval(function() {

    self.DeviceListGet();

  }, pollsec * 1000);


  timerlDevicePSSListGet = setInterval(function() {

    self.DevicePSSListGet();

  }, pollsec * 1000);

  timerPanelCondGet = setInterval(function() {

    self.PanelCondGet();

  }, pollsec * 1000);

  timerDeviceEditGet = setInterval(function() {

    self.DeviceEditAllGet();

  }, 60 * 1000);

}

module.exports = Lupus;

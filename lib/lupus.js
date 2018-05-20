'use strict';

var request = require('request');
var debug = true;

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
var urlDeviceHueColorControl ="/action/deviceHueColorControl";

// *******************************************************************************
// Constructur
// *******************************************************************************
function Lupus(adapter, hostname, https, username, password) {

  this.adapter = adapter;
  this.hostname = hostname;
  this.https = https;
  this.username = username;
  this.password = password;
  this.auth = "Basic " + new Buffer(username + ":" + password).toString("base64");

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
Lupus.prototype.PostRequest = function(options, callback) {

  var self = this;

  function Token(callbackpost) {

    self.logging("Starting Token Request in PostRequest", true);

    var options = {
      url: self.getURL(urlTokenGet),
      rejectUnauthorized: false,
      headers: {
        "Authorization": self.auth
      }
    };

    request.get(options, function(error, response, body) {

      if (error || response.statusCode !== 200) {

        self.adapter.log.info("Fehler in Token Request in PostRequest: " + error);

        return callbackpost(error || {
          statusCode: response.statusCode
        });

      } else if (body) {

        body = self.delSonderzeichen(body);
        self.logging("Token Request in PostRequest : " + body, true);

        try {

          var arrayBody = JSON.parse(body);
          var token = arrayBody.message;

          self.logging("Token Request in PostRequest (Token): " + token, true);

          if (callbackpost) {

            callbackpost(null, token);

          }
        } catch (e) {

          self.adapter.log.info("Token Request in PostRequest : " + e); // error in the above string (in this case, yes)!

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

      self.adapter.log.error("Fehler in Post in PostRequest: " + error);

    }

  }

  Token(Post);

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

      for (var i = 0; i < arrayBody.length; i++) {

        var sensor = arrayBody[i];
        // setLupusStatus(sensor, "lupusec.devices." + sensor.sid + ".info", sensor.name);

      }

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

    self.PostRequest(options, parse);

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

    var form = {};

    form.id = id;

    if (typeof parameter.switch !== "undefined" && parameter.switch !== null) {
      form.switch = parameter.switch;
    }

    if (typeof parameter.level !== "undefined" && parameter.level !== null) {
      form.level = parameter.level;
    }

    if (typeof parameter.pd !== "undefined" && parameter.pd !== null) {
      form.pd = parameter.pd;
    }

    if (typeof parameter.trigger !== "undefined" && parameter.trigger !== null) {
      form.trigger = parameter.trigger;
    }

    var options = {
      url: self.getURL(urlDeviceSwitchPSSPost),
      rejectUnauthorized: false,
      headers: {
        "Authorization": self.auth
      },
      form: form
    };

    self.PostRequest(options, parse);

  }

  write();

}


// *******************************************************************************
// Liefert den Zustand der Lupusec Zentrale
// *******************************************************************************
Lupus.prototype.DeviceEditGet = function(id) {

  var self = this;

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
      url: self.getURL(urlPanelCondGet),
      rejectUnauthorized: false,
      headers: {
        "Authorization": self.auth
      },
      form : form
    };

    self.GetRequest(options, parse);

  }

  read();

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

    var options = {
      url: self.getURL(urlDeviceEditPost),
      rejectUnauthorized: false,
      headers: {
        "Authorization": self.auth
      },
      form: form
    };

    self.PostRequest(options, parse);

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

  self.LogoutPost();
  self.DeviceSwitchPSSPost("ZS:a61d01", { switch: 1});
  self.PanelCondPost(1, 0);

  clearTimeout(timerDeviceListGet);
  timerDeviceListGet = setInterval(function() {

    self.DeviceListGet();

  }, 10 * 1000);


  clearTimeout(timerlDevicePSSListGet);
  timerlDevicePSSListGet = setInterval(function() {

    self.DevicePSSListGet();

  }, 10 * 1000);

  clearTimeout(timerPanelCondGet);
  timerPanelCondGet = setInterval(function() {

    self.PanelCondGet();

  }, 10 * 1000);

  clearTimeout(timerDeviceEditGet);
  timerDeviceEditGet = setInterval(function() {

    self.DeviceEditGet("ZS:a61d01");

  }, 10 * 1000);

}

module.exports = Lupus;

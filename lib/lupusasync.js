'use strict';

const ping = require('ping');
const request = require('request-promise');
const types = require(__dirname + '/datapoints');

var urlTokenGet = '/action/tokenGet';
var urlLogoutPost = '/action/logout';
var urlDeviceListGet = '/action/deviceListGet';
var urlDevicePSSListGet = '/action/deviceListPSSGet';
var urlPanelCondGet = '/action/panelCondGet';
var urlPanelCondPost = '/action/panelCondPost';
var urlDeviceSwitchPSSPost = '/action/deviceSwitchPSSPost';
var urlDeviceEditGet = '/action/deviceEditGet';
var urlDeviceEditPost = '/action/deviceEditPost';
var urlDeviceSwitchDimmerPost = '/action/deviceSwitchDimmerPost';
var urlDeviceHueColorControl = '/action/deviceHueColorControl';
var urlDeviceEditThermoPost = '/action/deviceEditThermoPost';
var urlDeviceEditThermoGet = '/action/deviceEditThermoGet';


/**
 * ping host
 * @param {string} host - hostname or ip-address
 */
function pingAsync(host) {
  return new Promise((resolve, reject) => {
    ping.sys.probe(host, (isAlive) => {
      if (isAlive) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}



/**
 * if function called async
 * @param {function} funct - function to check
 */
function isAsync(funct) {
  if (funct && funct.constructor) return funct.constructor.name == 'AsyncFunction';
  return undefined;
}

/**
 * Wait / Sleep x milliseconds
 * @param {number} ms - time in ms to wail
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get variable type of value 
 * @param {any} status - value
 */
function getPropertyType(status) {
  let type;
  switch (Object.prototype.toString.call(status)) {
    case '[object Object]':
      type = 'object';
      break;
    case '[object Array]':
      type = 'array';
      break;
    case '[object Number]':
      type = 'number';
      break;
    case '[object Boolean]':
      type = 'boolean';
      break;
    case '[object String]':
      type = 'string';
      break;
    default:
      break;
  }
  return type;
}

/**
 * Checks if propertis of object A and object B are equal
 * @param {object} obja - Object A
 * @param {object} objb - Object B
 */
function propertiesObjAinObjB(obja, objb) {
  if (obja === objb) return true;
  if (!(obja instanceof Object) || !(objb instanceof Object)) return false;
  if (obja.constructor !== objb.constructor) return false;
  for (let p in obja) {
    if (!obja.hasOwnProperty(p)) continue;
    if (!objb.hasOwnProperty(p)) return false;
    if (obja[p] === objb[p]) continue;
    if (typeof (obja[p]) !== 'object') return false;
    if (!this.propertiesObjAinObjB(obja[p], objb[p])) return false; // Objects and Arrays must be tested recursively
  }
  return true;
}

/**
 * Copy Object
 * @param {object} obj - object to copy
 */
function copyObject(obj) {
  let objcopy;
  if (obj) objcopy = JSON.parse(JSON.stringify(obj));
  return objcopy;
}

/**
 * Get Time now in Seconds
 */
function getNow() {
  return Math.floor(Date.now() / 1000);
}

/**
 * Lupusec Class
 */
class Lupus {

  constructor(adapter) {
    this.adapter = adapter;
    this.hostname = this.adapter.config.alarm_host;
    this.port = this.adapter.config.alarm_port;
    this.https = this.adapter.config.alarm_https || false;
    this.username = this.adapter.config.alarm_user;
    this.password = this.adapter.config.alarm_password;
    this.pollsec = this.adapter.config.alarm_polltime;
    this.allstates = this.adapter.config.alarm_allstates || false;
    this.types = {};
    this.processes = [];
    this.timeoutid = undefined;
    this.error = false;
    this.token = {};
    this.auth = 'Basic ' + new Buffer(this.username + ':' + this.password).toString('base64');
    if (!this.port) this.port = this.https === true ? 443 : 80;
    if (this.https && this.port == 443) this.url = 'https://' + this.hostname;
    if (this.https && this.port != 443) this.url = 'https://' + this.hostname + ':' + this.port;
    if (!this.https && this.port == 80) this.url = 'http://' + this.hostname;
    if (!this.https && this.port != 80) this.url = 'http://' + this.hostname + ':' + this.port;
    // this.url = this.https ? 'https://' + this.hostname + ':' + this.port : 'http://' + this.hostname + ':' + this.port;
  }

  /**
   * Concatenate url + path
   * @param {string} path - path of url 
   */
  getURL(path) {
    return this.url + path;
  }

  /** 
   * Seconds to next pool
   */
  getPollSec() {
    return this.pollsec;
  }

  /**
   * Pollseconds okay
   */
  async setPollSecOk() {
    this.error = false;
    if (this.pollsec > this.adapter.config.alarm_polltime) {
      this.adapter.log.info('Poll rythmus changed back to ' + this.adapter.config.alarm_polltime + ' seconds');
    }
    this.pollsec = this.adapter.config.alarm_polltime;
  }

  /**
   * Pollseconds error
   */
  async setPollSecError() {
    this.error = true;
    this.token = {};
    let alive = await pingAsync(this.host);
    if(alive === false) {
      this.pollsec = 30;
      this.adapter.log.error('Lupusec alarm system ' + this.host + ' is not reachable by ping. Wait 30 seconds for next try!');
      return;  
    }
    if (this.pollsec < 60) this.pollsec = 0;
    this.pollsec = this.pollsec + 60;
    if (this.pollsec > 300) this.pollsec = 300;
    this.adapter.log.error('Poll rythmus chnaged to ' + this.pollsec + ' seconds because of error!');
  }

  /**
   * Get typlist vor type
   * @param {number} lupusType - Lupusec Type like 38
   */
  getTypeList(lupusType) {
    let ret;
    if (types) ret = types.typeList['TYPE_' + lupusType];
    if (!ret) {
      ret = {
        name: 'Unknown',
        devlist: 'type_unknown'
      };
    }
    return ret;
  }

  setTypeById(id, type) {
    this.types[id] = type;
  }

  getTypeById(id) {
    return (this.types[id] || 0);
  }

  getDatapointDeviceList(lupusType, name) {
    let dp;
    let ret = this.getTypeList(lupusType) || {};
    if (ret) {
      dp = types.dpDeviceList[ret.devlist][name] || types.dpDeviceList.type_all[name] || undefined;
    }
    if (dp) dp = JSON.parse(JSON.stringify(dp));
    return dp;
  }

  getIcon(devicetype) {
    let ret = this.getTypeList(devicetype) || {};
    let icon;
    if (ret && ret.icon) icon = ret.icon;
    return icon;
  }

  /**
   * 
   * @param {string} text - string where special characters will be removed
   */
  delSonderzeichen(text) {
    if (text) {
      text = text.replace(/\r/g, '');
      text = text.replace(/\n/g, '');
      text = text.replace(/\t/g, ' ');
      text = text.replace(/\f/g, '');
    }
    return text;
  }

  /**
   * Lupusec Status to Apple Home Status
   * @param {number} mode_pc_a - Area 1 or 2 (1,2)
   * @param {number} alarm_ex - 0 = Disarm, 1 = Arm, 2 = Home1, 3 = Home2, 4 = Home3
   */
  getAppleStautusFromLupusec(mode_pc_a, alarm_ex) {
    let alarm = null; // disarm
    mode_pc_a = Number(mode_pc_a);
    alarm_ex = Number(alarm_ex);
    switch (mode_pc_a) {
      case 0: // Disarm
        alarm = 3; // disarm = 3 (The security system is disarmed)
        break;
      case 1: // Arm
        alarm = 1; // awayArm = 1 (The home is unoccupied)
        break;
      case 2: // Home
        alarm = 2; // nightArm = 2 (The home is occupied and residents are sleeping)
        break;
      case 3: // Home 
        alarm = 0; // stayArm = 0 (The home is occupied and residents are active)
        break;
      case 4: // Home
        alarm = 0; // stayArm = 0 (The home is occupied and residents are active)
        break;
      default:
        break;
    }
    if (mode_pc_a > 0 && alarm_ex == 1) {
      alarm = 4; // triggered = 4 (the security system is triggered)
    }
    return alarm;
  }


  /**
   * Apple Home Status to Lupusec Status
   * @param {number} applestatus - Apple Status
   */
  getLupusecFromAppleStautus(applestatus) {
    let alarm = null;
    switch (applestatus) {
      case 0: // Home 
        alarm = 3; // stayArm = 0 (The home is occupied and residents are active)
        break;
      case 1: // Arm
        alarm = 1; // awayArm = 1 (The home is unoccupied)
        break;
      case 2: // Home
        alarm = 2; // nightArm = 2 (The home is occupied and residents are sleeping)
        break;
      case 3: // Disarm
        alarm = 0; // disarm = 3 (The security system is disarmed)
        break;
      case 4: // Alarm triggered
        break;
      default:
        break;
    }
    return alarm;
  }

  /**
   * Create object if not exist or set state 
   * @param {number} id - Id
   * @param {object} obj - object description
   * @param {any} value - value
   * @param {boolean} ack - acknowledge
   */
  setObjectOrUpdate(id, obj, value, ack) {
    return new Promise(async (resolve) => {
      try {
        if (id) {
          if (!ack) ack = false;
          if (typeof obj !== 'undefined') await this.adapter.setObjectNotExistsAsync(id, obj);
          if (typeof value !== 'undefined') {
            let oldstate = await this.adapter.getStateAsync(id);
            if (!oldstate || oldstate.val != value || oldstate.ack !== ack) {
              await this.adapter.setStateAsync(id, value, ack);
            }
          }
          resolve(true);
        }
      } catch (error) {
        this.adapter.error('setObjectOrUpdate: ' + error);
        resolve(false);
      }
    });
  }

  /**
   * Delete old states
   */
  async deleteOldSates() {
    let ids;
    try {
      let obj = await this.adapter.getAdapterObjectsAsync();
      for (let id in obj) {
        id = id.replace(this.adapter.namespace + '.', '');
        // let state = await this.adapter.getStateAsync(id);
        if (!ids) ids = [];
        ids.push(id);
      }
      for (let i in ids) {
        let id = ids[i];
        let idtype = id.split('.').slice(0, -1).join('.') + '.type';
        let statusname = id.split('.').slice(-1).join('.');
        let state = await this.adapter.getStateAsync(idtype);
        if (state && state.val) {
          let type = state.val;
          let parameter = this.getDatapointDeviceList(type, statusname);
          if (!parameter || Object.keys(parameter).length == 0) {
            await this.adapter.delObjectAsync(id);
            this.adapter.log.debug('Delete old object ' + id);
          } else {
            let obj = await this.adapter.getObjectAsync(id);
            if (obj && obj.common && obj.common.name) parameter.name = obj.common.name; // Name kopieren
            if (!propertiesObjAinObjB(parameter, obj.common)) {
              obj.common = parameter;
              await this.adapter.extendObjectAsync(id, obj);
              this.adapter.log.debug('Changed parameters for object ' + id);
            }
          }
        }
      }
    } catch (error) {
      //
    }
  }

  /**
   * Add process to array
   * @param {function} funct - function to add to queue
   * @param {number} prio - priority, 1 ist highest
   * @param {boolen} loop - if true, after proccessing the function will add to queue againg
   */
  async addToProcess(funct, prio, loop) {
    if (!prio) prio = 99;
    if (!loop) loop = false;
    for (let i = 0; i < this.processes.length; i++) {
      if (this.processes[i].prio > prio) {
        let tmp = [];
        this.processes = tmp.concat(this.processes.slice(0, i), {
          prio: prio,
          funct: funct,
          loop: loop
        }, this.processes.slice(i));
        // if prio 1, start processes immediately
        // if (prio == 1 && this.timeoutid && !this.error) {
        if (prio == 1 && !this.error) {
          await this.startProcess();
        }
        return;
      }
    }
    this.processes.push({
      prio: prio,
      funct: funct,
      loop: loop
    });
  }

  /**
   * avaluate process
   */
  async startProcess() {
    this.adapter.log.debug('Prcoess Queue: ' + JSON.stringify(this.processes));
    if (this.timeoutid) {
      // clear running timeouts
      clearTimeout(this.timeoutid);
      this.timeoutid = undefined;
    }
    let process = this.processes.shift();
    if (process) {
      if (process.funct) {
        this.adapter.log.debug('Prcoess: ' + JSON.stringify(process));
        try {
          let result = isAsync(process.funct) ? await process.funct() : process.funct();
          this.adapter.log.debug('Prcoess result: ' + JSON.stringify(result));
        } catch (error) {
          this.adapter.log.error('could not procces functions in startProcess: ' + error);
        }
      }
      if (process.loop) {
        await this.addToProcess(process.funct, process.prio, process.loop);
      }
    }
    if (!this.timeoutid) {
      this.timeoutid = setTimeout(async () => {
        await this.startProcess();
      }, this.getPollSec() * 1000);
    }
  }

  /**
   * get Token
   */
  async getToken(newtoken) {
    try {
      let timeout = 15 * 60; // to get every 15 minutes a new token 
      if (!this.token || !this.token.token || newtoken || Math.abs(getNow() - this.token.time) > timeout || this.error) {
        let token;
        let opt = {
          url: this.getURL(urlTokenGet),
          rejectUnauthorized: false,
          headers: {
            'Authorization': this.auth
          }
        };
        this.adapter.log.debug('Starting Token Request in getToken');
        this.adapter.log.debug('Form of getToken (' + urlTokenGet + ') : ' + JSON.stringify(opt));
        let body = await request.get(opt);
        if (body) {
          body = this.delSonderzeichen(body);
          body = JSON.parse(body);
          token = body.message;
          this.adapter.log.debug('TokenGet : ' + JSON.stringify(body));
        }
        await this.setPollSecOk();
        this.token.token = token;
        this.token.time = getNow();
      }
      return this.token.token;
    } catch (error) {
      this.adapter.log.error('Error in getToken : ' + error); // error in the above string (in this case, yes)!
      await await this.setPollSecError();
    }
  }

  async deviceGenericPost(url, form) {
    let token = await this.getToken();
    let opt = {
      url: this.getURL(url),
      rejectUnauthorized: false,
      headers: {
        'Authorization': this.auth,
        'X-Token': token
      }
    };
    if (form) opt.form = form;
    try {
      this.adapter.log.debug('Form of deviceGenericPost (' + url + ') : ' + JSON.stringify(opt));
      let body = await request.post(opt);
      if (body) {
        body = this.delSonderzeichen(body);
        body = JSON.parse(body);
        this.adapter.log.debug('Result of deviceGenericPost (' + url + ') : ' + JSON.stringify(body));
      }
      await this.setPollSecOk();
      return body;
    } catch (error) {
      this.adapter.log.error('Error in deviceGenericPost (' + url + ') : ' + error);
      await this.setPollSecError();
    }
  }

  async deviceGenericGet(url, form) {
    let opt = {
      url: this.getURL(url),
      rejectUnauthorized: false,
      headers: {
        'Authorization': this.auth
      }
    };
    if (form) opt.form = form;
    try {
      this.adapter.log.debug('Form of deviceGenericGet (' + url + ') : ' + JSON.stringify(opt));
      let body = await request.get(opt);
      if (body) {
        body = this.delSonderzeichen(body);
        body = JSON.parse(body);
        this.adapter.log.debug('Result of deviceGenericGet (' + url + ') : ' + JSON.stringify(body));
      }
      await this.setPollSecOk();
      return body;
    } catch (error) {
      this.adapter.log.error('Error in deviceGenericGet (' + url + ') : ' + error); // error in the above string (in this case, yes)!
      await this.setPollSecError();
    }
  }

  async deviceSwitchDimmerPost(form) {
    let body = await this.deviceGenericPost(urlDeviceSwitchDimmerPost, form);
    let result = body ? body.result : undefined;
    return result;
  }

  async deviceHueColorControl(form) {
    let body = await this.deviceGenericPost(urlDeviceHueColorControl, form);
    let result = body ? body.result : undefined;
    return result;
  }

  /**
   * Switch on or off
   * @param {object} form - { id: 'ZS:b12d01', switch: 1 } switch can be 0 or 1
   */
  async deviceSwitchPSSPost(form) {
    let body = await this.deviceGenericPost(urlDeviceSwitchPSSPost, form);
    let result = body ? body.result : undefined;
    return result;
  }

  async deviceEditThermoPost(form) {
    let body = await this.deviceGenericPost(urlDeviceEditThermoPost, form);
    let result = body ? body.result : undefined;
    return result;
  }

  async panelCondPost(form) {
    let body = await this.deviceGenericPost(urlPanelCondPost, form);
    let result = body ? body.result : undefined;
    return result;
  }

  /**
   * DeviceEditPost
   * @param {object} form - { id: 'zx23424', param1: 'parameter 1', , param2: 'parameter 2'}
   */
  async deviceEditPost(form) {
    let body = await this.deviceGenericPost(urlDeviceEditPost, form);
    let result = body ? body.result : undefined;
    return result;
  }

  /**
   * Logout
   */
  async logoutPost() {
    let body = await this.deviceGenericPost(urlLogoutPost);
    let result = body ? body.result : undefined;
    return result;
  }

  /**
   * DeviceEditGet
   * @param {object} form - { id: 'zx122345' }
   */
  async deviceEditGet(form) {
    let body = await this.deviceGenericPost(urlDeviceEditGet, form);
    return body;
  }

  /**
   * DeviceEditAllGet
   */
  async deviceEditAllGet() {
    let result = {};
    let promises = [];
    let deviceid = 'devices';
    try {
      let channels = await this.adapter.getChannelsOfAsync(deviceid);
      for (let c = 0; c < channels.length; c++) {
        let id = channels[c]._id.split('.').slice(-1).join('.');
        let form = {
          id: id
        };
        // let body = await this.deviceEditGet(form);
        // if (body && id) result[id] = body;
        promises.push(await this.deviceEditGet(form));
      }
      result = await Promise.all(promises);
      return result;
    } catch (error) {
      this.adapter.log.error('Fehler in funciton DeviceEditGet: ' + error);
    }
  }

  /**
   * Get Info for thermostat
   * @param {object} form - { id: 'RF:xyzdfadf' } - Id of thermostat
   */
  async deviceEditThermoGet(form) {
    let body = await this.deviceGenericPost(urlDeviceEditThermoGet, form);
    return body;
  }

  /**
   * DeviceGetList & DevicePSSGetList
   * @param {*} object 
   */
  async deviceListDevicePSSListSetStatus(object) {
    let deviceid = 'devices';
    let promises = [];
    await this.setObjectOrUpdate(deviceid, {
      type: 'device',
      common: {
        name: 'Devices Alarmanlage',
        icon: '/icons/zentrale.png'
      },
      native: {}
    });
    for (let devicename in object) {
      let device = object[devicename];
      if (Object.prototype.toString.call(device) !== '[object Object]') continue;
      let channelid;
      let icon = this.getIcon(device.type) || '';
      let newstates = {};

      if (device.sid || device.id) {
        let id = device.sid ? device.sid : device.id;
        channelid = deviceid + '.' + id;
        this.setTypeById(id, device.type);
      } else {
        this.adapter.log.error('DeviceListDevicePSSListSetStatus : ID missing');
        continue;
      }
      await this.setObjectOrUpdate(channelid, {
        type: 'channel',
        common: {
          name: device.name,
          icon: icon
        },
        native: {}
      });

      for (let statusname in device) {
        let statusvalue = device[statusname];
        let statusid = channelid + '.' + statusname;
        //  Aus '{WEB_MSG_DC_CLOSE} or '{WEB_MSG_DC_OPEN} wird CLOSE bzw. OPEN
        if (statusname == 'status') {
          const regstat = /\{WEB_MSG_DC_(.+)\}/gm;
          let m = regstat.exec(statusvalue);
          if (m && m.length > 0) {
            statusvalue = m[1]; // .toLowerCase();
          }
        }

        // zustätzlicher Status einführen (alarm_statu_ex). This value will be true/false
        if (statusname == 'alarm_status') {
          let tmpname = statusname + '_ex';
          let tmpid = channelid + '.' + tmpname;
          let tmpvalue = statusvalue ? true : false;
          newstates[tmpname] = {
            statusid: tmpid, // device.RFxxxxx.status
            statusname: tmpname, // status
            statusvalue: tmpvalue, // 1
            devicename: device.name, // Wohnzimmer Türsensor
            devicetype: device.type // 48
          };
        }

        // Set TYPE Name like Türkontakt or Keypad
        if (statusname == 'type') {
          let type = this.getTypeList(statusvalue) || {};
          if (type) {
            let tmpname = statusname + '_name';
            let tmpid = channelid + '.' + tmpname;
            let tmpvalue = type.name;
            newstates[tmpname] = {
              statusid: tmpid, // device.RFxxxxx.status
              statusname: tmpname, // status
              statusvalue: tmpvalue, // 1
              devicename: device.name, // Wohnzimmer Türsensor
              devicetype: device.type // 48
            };
          }
        }

        // For Power Switches, 2 new States
        if (statusname == 'rssi') {
          let reg = /\{WEB_MSG_(.+)\}(.*)/gm;
          let m = reg.exec(statusvalue);
          let rssi = 0;
          if (m) {
            // rssitxt = m[1].trim();
            rssi = m[2] ? m[2].trim() : 0;
            statusvalue = rssi;
          }
        }

        // For Power Switches, 2 new States
        if (statusname == 'status' && device.type == 48) {
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
            newstates[tmpname] = {
              statusid: tmpid, // device.RFxxxxx.status
              statusname: tmpname, // status
              statusvalue: power, // 1
              devicename: device.name, // Wohnzimmer Türsensor
              devicetype: device.type
            };
            tmpname = 'powertotal';
            tmpid = channelid + '.' + tmpname;
            newstates[tmpname] = {
              statusid: tmpid, // device.RFxxxxx.status
              statusname: tmpname, // status
              statusvalue: powertotal, // 1
              devicename: device.name, // Wohnzimmer Türsensor
              devicetype: device.type
            };
          }
        }

        // Raumsensor / Temperatursensor mit Display , 2 new States
        if (statusname == 'status' && device.type == 54) {
          let reg = /\{WEB_MSG_TS_DEGREE\}(.+)\{WEB_MSG_RH_HUMIDITY\}(.+)/gm;
          let m = reg.exec(statusvalue);
          let actualtemperature = 0;
          let actualhumidity = 0;
          let tmpname;
          let tmpid;
          if (m) {
            actualtemperature = m[1].trim();
            actualhumidity = m[2].trim();
            tmpname = 'actual_temperature';
            tmpid = channelid + '.' + tmpname;
            newstates[tmpname] = {
              statusid: tmpid, // device.RFxxxxx.status
              statusname: tmpname, // status
              statusvalue: actualtemperature, // 1
              devicename: device.name, // Wohnzimmer Türsensor
              devicetype: device.type
            };
            tmpname = 'actual_humidity';
            tmpid = channelid + '.' + tmpname;
            newstates[tmpname] = {
              statusid: tmpid, // device.RFxxxxx.status
              statusname: tmpname, // status
              statusvalue: actualhumidity, // 1
              devicename: device.name, // Wohnzimmer Türsensor
              devicetype: device.type
            };
          }
        }

        // Lichtsensor
        if (statusname == 'status' && device.type == 78) {
          let reg = /\{WEB_MSG_TS_DEGREE\}(.+)\{WEB_MSG_RH_HUMIDITY\}(.+)\{WEB_MSG_LM_LUX\}(.+)/gm;
          let m = reg.exec(statusvalue);
          let actualtemperature = 0;
          let actualhumidity = 0;
          let actuallux = 0;
          let tmpname;
          let tmpid;
          if (m) {
            actualtemperature = m[1].trim();
            actualhumidity = m[2].trim();
            actuallux = m[3].trim();
            tmpname = 'actual_temperature';
            tmpid = channelid + '.' + tmpname;
            newstates[tmpname] = {
              statusid: tmpid, // device.RFxxxxx.status
              statusname: tmpname, // status
              statusvalue: actualtemperature, // 1
              devicename: device.name, // Wohnzimmer Türsensor
              devicetype: device.type
            };
            tmpname = 'actual_humidity';
            tmpid = channelid + '.' + tmpname;
            newstates[tmpname] = {
              statusid: tmpid, // device.RFxxxxx.status
              statusname: tmpname, // status
              statusvalue: actualhumidity, // 1
              devicename: device.name, // Wohnzimmer Türsensor
              devicetype: device.type
            };
            tmpname = 'actual_lux';
            tmpid = channelid + '.' + tmpname;
            newstates[tmpname] = {
              statusid: tmpid, // device.RFxxxxx.status
              statusname: tmpname, // status
              statusvalue: actuallux, // 1
              devicename: device.name, // Wohnzimmer Türsensor
              devicetype: device.type
            };
          }
        }

        // Schalter für An/Aus Hue Lampe und Dimmmer
        if (statusname == 'status_ex' && (device.type == 74 || device.type == 66)) {
          let reg;
          let m;
          let tmpname;
          let tmpval;
          // Wert von Status lesen
          tmpname = 'status';
          tmpval = device[tmpname];
          // Auto / Manueller Mode
          reg = /\{WEB_MSG_DIMMER_(ON|OFF)\}/gm;
          m = reg.exec(tmpval);
          statusvalue = false;
          if (m) {
            if (m[1].trim() == 'OFF') {
              statusvalue = false; // off
            } else {
              statusvalue = true; // on
            }
          }
        }

        // Shutter, if shutter level (0-100%) change, the swich value will change too
        if (statusname == 'level' && device.type == 76) {
          let tmpname;
          let tmpid;
          let vswitch;
          // alten bzw. vorherigen Wert lesen
          tmpname = 'level';
          tmpid = channelid + '.' + tmpname;
          try {
            let state = await this.adapter.getState(tmpid);
            if (state) {
              if (statusvalue != state.val) {
                //  statusvalue > state.val (100 > 10), shutter open (1)
                //  statusvalue < state.val (10 > 100), shutter close (0)
                vswitch = statusvalue > state.val ? 1 : 0;
                tmpname = 'switch';
                tmpid = channelid + '.' + tmpname;
                newstates[tmpname] = {
                  statusid: tmpid, // device.RFxxxxx.status
                  statusname: tmpname, // status
                  statusvalue: vswitch, // 1
                  devicename: device.name, // Wohnzimmer Türsensor
                  devicetype: device.type
                };
              }
            }
          } catch (error) {
            //
          }
        }

        // For Thermostate new States
        if (statusname == 'status' && device.type == 79) {
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
          reg = /\{WEB_MSG_TS_DEGREE\}\s*([\d.]+)/gm;
          m = reg.exec(statusvalue);
          actualtemperature = 0;
          if (m) {
            actualtemperature = m[1].trim();
          }
          tmpname = 'actual_temperature';
          tmpid = channelid + '.' + tmpname;
          newstates[tmpname] = {
            statusid: tmpid, // device.RFxxxxx.status
            statusname: tmpname, // status
            statusvalue: actualtemperature, // 1
            devicename: device.name, // Wohnzimmer Türsensor
            devicetype: device.type
          };
          // Ventilstellung
          reg = /\{WEB_MSG_TRV_VALVE\}\s*([\d.]+)/gm;
          m = reg.exec(statusvalue);
          valve = 0;
          if (m) {
            valve = m[1].trim();
          }
          tmpname = 'valve';
          tmpid = channelid + '.' + tmpname;
          newstates[tmpname] = {
            statusid: tmpid, // device.RFxxxxx.status
            statusname: tmpname, // status
            statusvalue: valve, // 1
            devicename: device.name, // Wohnzimmer Türsensor
            devicetype: device.type
          };
          // Soll Termperatur
          reg = /\{WEB_MSG_TRV_SETPOINT\}\s*([\d.]+)/gm;
          m = reg.exec(statusvalue);
          settemperature = 0;
          if (m) {
            settemperature = m[1].trim();
          }
          tmpname = 'set_temperature';
          tmpid = channelid + '.' + tmpname;
          newstates[tmpname] = {
            statusid: tmpid, // device.RFxxxxx.status
            statusname: tmpname, // status
            statusvalue: settemperature, // 1
            devicename: device.name, // Wohnzimmer Türsensor
            devicetype: device.type
          };
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
          newstates[tmpname] = {
            statusid: tmpid, // device.RFxxxxx.status
            statusname: tmpname, // status
            statusvalue: mode, // 1
            devicename: device.name, // Wohnzimmer Türsensor
            devicetype: device.type
          };
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
          newstates[tmpname] = {
            statusid: tmpid, // device.RFxxxxx.status
            statusname: tmpname, // status
            statusvalue: off, // 1
            devicename: device.name, // Wohnzimmer Türsensor
            devicetype: device.type
          };
        }

        // anzupassende Status ersteinmal im Objekt speichern
        newstates[statusname] = {
          statusid: statusid, // device.RFxxxxx.status
          statusname: statusname, // status
          statusvalue: statusvalue, // 1
          devicename: device.name, // Wohnzimmer Türsensor
          devicetype: device.type // 48
        };
      }

      // Set states
      for (let statusname in newstates) {
        let newstate = newstates[statusname];
        let parameter = this.getDatapointDeviceList(newstate.devicetype, newstate.statusname);
        let statusvalue = newstate.statusvalue;
        let stateid = newstate.statusid;
        let type = getPropertyType(statusvalue);
        if (type == 'object') statusvalue = '{' + statusvalue.toString() + '}';
        if (type == 'array') statusvalue = '[' + statusvalue.toString() + ']';
        if (parameter) {
          // falls Type anders als Value, dann anpassen.
          if (parameter.type == 'boolean' && parameter.type != type) {
            if (statusvalue == '' || statusvalue == 0 || statusvalue == null) {
              statusvalue = false;
            } else {
              statusvalue = true;
            }
          }
          parameter.name = device.name + ' ' + (parameter.name || '');
          parameter.icon = icon;
          promises.push(this.setObjectOrUpdate(stateid, {
            type: 'state',
            common: parameter,
            native: {}
          }, statusvalue, true));
        }
        // self.setStateForDevice(newstate.statusid, newstate.statusname, newstate.statusvalue, newstate.devicename, newstate.devicetype, newstate.ts);
      }
    }
    await Promise.all(promises);
  }

  async devicePSSListGet() {
    let body = await this.deviceGenericGet(urlDevicePSSListGet);
    let pssrows;
    if (body && body.pssrows) {
      pssrows = body.pssrows;
      await this.deviceListDevicePSSListSetStatus(pssrows);
    }
    return pssrows;
  }

  async deviceListGet() {
    let body = await this.deviceGenericGet(urlDeviceListGet);
    let senrows;
    if (body && body.senrows) {
      senrows = body.senrows;
      await this.deviceListDevicePSSListSetStatus(senrows);
    }
    return senrows;
  }

  async panelCondGet() {
    let deviceid = 'status';
    let devicename = 'Status Alarmanlage';
    let objectnew = {};
    let object = await this.deviceGenericGet(urlPanelCondGet);
    let promises = [];
    if (!object) return;
    for (let statusname in object.updates) {
      let status = object.updates[statusname];
      objectnew[statusname] = status;
    }
    for (let statusname in object.forms.pcondform1) {
      let status = object.forms.pcondform1[statusname];
      objectnew[statusname + '_pc_a1'] = status;
    }
    for (let statusname in object.forms.pcondform2) {
      let status = object.forms.pcondform2[statusname];
      objectnew[statusname + '_pc_a2'] = status;
    }
    objectnew.apple_home_a1 = this.getAppleStautusFromLupusec(objectnew.mode_pc_a1, objectnew.alarm_ex);
    objectnew.apple_home_a2 = this.getAppleStautusFromLupusec(objectnew.mode_pc_a2, objectnew.alarm_ex);
    await this.setObjectOrUpdate(deviceid, {
      type: 'device',
      common: {
        name: devicename,
        icon: '/icons/zentrale.png'
      },
      native: {}
    });
    let obj = types.dpStatus || {};
    for (let prop in obj) {
      let stateid = deviceid + '.' + prop;
      let value = objectnew[prop];
      let parameter = copyObject(obj[prop]) || {};
      parameter.name = devicename + ' ' + parameter.name;
      promises.push(this.setObjectOrUpdate(stateid, {
        type: 'state',
        common: parameter,
        native: {}
      }, value, true));
    }
    await Promise.all(promises);
  }

}

module.exports = {
  Lupus: Lupus
};
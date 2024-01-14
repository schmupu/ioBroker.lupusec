"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var lupusec_exports = {};
__export(lupusec_exports, {
  Lupusec: () => Lupusec
});
module.exports = __toCommonJS(lupusec_exports);
var import_axios = __toESM(require("axios"));
var import_http = __toESM(require("http"));
var import_https = __toESM(require("https"));
var import_querystring = __toESM(require("querystring"));
var datapoints = __toESM(require("./datapoints"));
var so = __toESM(require("./states"));
var tools = __toESM(require("./tools"));
var wc = __toESM(require("./webcam"));
const urlTokenGet = "/action/tokenGet";
const urlLogoutPost = "/action/logout";
const urlDeviceListGet = "/action/deviceListGet";
const urlDevicePSSListGet = "/action/deviceListPSSGet";
const urlDeviceGet = "/action/deviceGet";
const urlPanelCondGet = "/action/panelCondGet";
const urlPanelCondPost = "/action/panelCondPost";
const urlDeviceSwitchPSSPost = "/action/deviceSwitchPSSPost";
const urlHaExecutePost = "/action/haExecutePost";
const urlDeviceEditGet = "/action/deviceEditGet";
const urlDeviceEditPost = "/action/deviceEditPost";
const urlDeviceSwitchDimmerPost = "/action/deviceSwitchDimmerPost";
const urlDeviceHueColorControl = "/action/deviceHueColorControl";
const urlDeviceEditThermoPost = "/action/deviceEditThermoPost";
const urlDeviceEditThermoGet = "/action/deviceEditThermoGet";
const urlDeviceEditShutterPost = "/action/deviceEditShutterPost";
const urlDeviceEditShutterGet = "/action/deviceEditShutterGet";
const urlDeviceEditMeterGet = "/action/deviceEditMeterGet";
const urlDeviceEditMeterPost = "/action/deviceEditMeterPost";
const urlDeviceNukiCmd = "/action/nukiCmd";
const urlIpcamGet = "/action/ipcamGet";
const urlPasthru = "/action/passthru";
const urlDeviceListUPICGet = "/action/deviceListUPICGet";
const urlDeviceDoUPICPost = "/action/deviceDoUPICPost";
const urlSendSMSPost = "/action/sendSMSPost";
const urlSmsgwTestPost = "/action/smsgwTestPost";
const urlSystemGet = "/action/systemGet";
const urlLogsGet = "/action/logsGet";
const urlrecordListGet = "/action/recordListGet";
const urlNukiGet = "/action/nukiGet";
class Lupusec {
  adapter;
  unixtime;
  run;
  language;
  states;
  timerhandle;
  static instance;
  static uniqueid;
  cpu;
  auth;
  token;
  axiostimeout;
  httpsagent;
  httpagent;
  axiosinstance;
  constructor(adapter, language) {
    this.adapter = adapter;
    this.unixtime = {};
    this.run = {};
    this.language = language || "en";
    this.states = new so.States(adapter, language);
    this.timerhandle = {};
    this.auth = "Basic " + Buffer.from(this.adapter.config.alarm_user + ":" + this.adapter.config.alarm_password).toString("base64");
    this.httpsagent = new import_https.default.Agent({
      rejectUnauthorized: false,
      keepAlive: true,
      maxSockets: 1
    });
    this.httpagent = new import_http.default.Agent({
      keepAlive: true,
      maxSockets: 1
    });
    this.token = "";
    this.axiostimeout = 15 * 1e3;
    this.axiosinstance = import_axios.default.create();
    this.adapter.log.debug(`New instance of Lupusec created!`);
  }
  static async getInstance(adapter) {
    var _a;
    if (!this.instance) {
      const obj = await adapter.getForeignObjectAsync("system.config");
      const language = (((_a = obj == null ? void 0 : obj.common) == null ? void 0 : _a.language) || "en").toLowerCase();
      this.uniqueid = tools.getUnixTimestampNow();
      this.instance = new Lupusec(adapter, language);
      await this.instance.states.initObjectsAllAsync();
      await this.instance.states.initStatesAllAsync();
    }
    return this.instance;
  }
  static getUniqueId() {
    return this.uniqueid;
  }
  async startproc(id, seconds, callback) {
    var _a;
    if (callback) {
      try {
        this.adapter.log.debug(`Starting polling with process ${id}, callback ${callback}`);
        tools.isAsync(callback) ? await callback() : callback();
        this.adapter.log.debug(`Stoping polling with process ${id}, callback ${callback} `);
      } catch (error) {
        const message = ((_a = error == null ? void 0 : error.response) == null ? void 0 : _a.data) || error.toString() || "not known";
        this.adapter.log.error(`Error: ${message} for process ${id}`);
        if (error == null ? void 0 : error.stack)
          this.adapter.log.debug(`Error: ${error.stack.toString()} for process ${id}`);
      }
    }
    if (this.run[id])
      this.adapter.clearTimeout(this.run[id]);
    this.run[id] = this.adapter.setTimeout(async () => await this.startproc(id, seconds, callback), seconds * 1e3);
  }
  async stopproc(id) {
    if (this.run[id]) {
      this.adapter.log.debug(`Canceling process with id ${id}`);
      this.adapter.clearTimeout(this.run[id]);
      delete this.run[id];
    }
  }
  exsitproc(id) {
    return this.run[id] ? true : false;
  }
  setproc(id, val) {
    this.run[id] = val;
  }
  async startallproc() {
    this.adapter.log.debug(`Starting Lupsuec polling process`);
    const seconds = this.adapter.config.alarm_polltime;
    if (!this.exsitproc("Init")) {
      await this.initObjects();
      await this.requestToken(true);
      this.setproc("Init", 1);
    }
    if (!this.exsitproc("Status")) {
      await this.startproc("Status", seconds > 1 ? seconds : 1, async () => {
        await this.getAllStatusLupusecEntries();
      });
    }
    if (!this.exsitproc("Devices")) {
      await this.startproc("Devices", seconds > 1 ? seconds : 1, async () => {
        await this.getAllDeviceLupusec();
      });
    }
    if (this.adapter.config.webcam_providing && !this.exsitproc("Webcamsms")) {
      await this.startproc("Webcamsms", seconds > 10 ? seconds : 10, async () => {
        await this.getAllWebcamLupusecEntries();
        await this.getAllSMSLupusecEntries();
      });
    }
  }
  async debugInfos() {
    this.adapter.log.debug(`Array Unixtime: ${Object.keys(this.unixtime).length}`);
    this.adapter.log.debug(`Array Run: ${Object.keys(this.run).length}`);
    this.adapter.log.debug(`Array Timerhandle: ${Object.keys(this.timerhandle).length}`);
    this.adapter.log.debug(`Array internal States: ${Object.keys(await this.states.getStatesAllAsync()).length}`);
    this.adapter.log.debug(`Array internal Objects: ${Object.keys(await this.states.getObjectsAllAsync()).length}`);
    this.adapter.log.debug(`Unique Id: ${Lupusec.getUniqueId()}`);
    const memory = process.memoryUsage();
    this.cpu = process.cpuUsage(this.cpu);
    for (const i in memory) {
      memory[i] = `${(Math.round(memory[i]) / 1024 / 1024 * 100 / 100).toLocaleString(this.language)} MB`;
    }
    if (this.cpu) {
      memory["cpuUser"] = this.cpu.user.toLocaleString(this.language);
      memory["cpuSystem"] = this.cpu.system.toLocaleString(this.language);
    }
    this.adapter.log.debug(`Process Meomory: ${JSON.stringify(memory)}`);
  }
  async dummyProcess() {
    await tools.wait(4);
  }
  async stopallproc() {
    for (const id in this.run) {
      await this.stopproc(id);
    }
  }
  setUnixTimestamp(id, unixtimestamp) {
    if (unixtimestamp === void 0) {
      this.unixtime[id] = this.getUnixTimestampNow();
    } else {
      this.unixtime[id] = unixtimestamp;
    }
  }
  getUnixTimestampNow() {
    return Math.ceil(new Date().getTime());
  }
  getUnixTimestamp(id) {
    return this.unixtime[id];
  }
  delUnixTimestamp(id) {
    this.unixtime[id] = 0;
  }
  async getDeviceIdsByType(devicetype) {
    const deviceids = [];
    const states = await this.states.getStatesAllAsync("devices.*.type");
    if (states) {
      for (const key in states) {
        const value = states[key];
        if ((value == null ? void 0 : value.val) && (devicetype === (value == null ? void 0 : value.val) || devicetype === void 0)) {
          deviceids.push({
            id: key.replace(`devices.`, "").replace(".type", ""),
            type: value.val
          });
        }
      }
    }
    return deviceids;
  }
  async initObjects() {
    var _a;
    const deviceids = await this.getDeviceIdsByType();
    for (const i in deviceids) {
      const type = deviceids[i].type;
      const objects = datapoints.getDeviceTypeList(type, this.language);
      for (const j in objects) {
        const id = `devices.${deviceids[i].id}.${j}`;
        const oldobject = await this.states.getObjectAsync(id);
        const newobject = objects[j];
        if (oldobject && newobject) {
          if ((_a = oldobject == null ? void 0 : oldobject.common) == null ? void 0 : _a.name)
            newobject.common.name = oldobject.common.name;
          const object = {
            ...oldobject,
            ...newobject
          };
          await this.states.setObjectAsync(id, object);
        }
      }
    }
  }
  getAppleStautusFromLupusec(mode_pc_a, alarm_ex) {
    let alarm = void 0;
    const vmode_pc_a = Number(mode_pc_a);
    const valarm_ex = Number(alarm_ex);
    switch (vmode_pc_a) {
      case 0:
        alarm = 3;
        break;
      case 1:
        alarm = 1;
        break;
      case 2:
        alarm = 2;
        break;
      case 3:
        alarm = 0;
        break;
      case 4:
        alarm = 0;
        break;
      default:
        break;
    }
    if (vmode_pc_a > 0 && valarm_ex == 1) {
      alarm = 4;
    }
    return alarm;
  }
  getLupusecFromAppleStautus(applestatus) {
    let alarm = void 0;
    switch (applestatus) {
      case 0:
        alarm = 3;
        break;
      case 1:
        alarm = 1;
        break;
      case 2:
        alarm = 2;
        break;
      case 3:
        alarm = 0;
        break;
      case 4:
        break;
      default:
        break;
    }
    return alarm;
  }
  async getAbsoluteURI(path) {
    const alarm_hostname = await tools.lookup(this.adapter.config.alarm_hostname);
    const aboluteURI = this.adapter.config.alarm_https === true ? "https://" + alarm_hostname + path : "http://" + alarm_hostname + path;
    return aboluteURI;
  }
  async requestToken(renew) {
    if (renew === void 0)
      renew = false;
    const path = urlTokenGet;
    const lastupdate = this.getUnixTimestamp("Token") || 0;
    const now = this.getUnixTimestampNow();
    const diff = lastupdate + 60 * 1e3 - now;
    if (this.token !== "" && renew === false && diff > 0)
      return this.token;
    this.setUnixTimestamp("Token");
    const requestconfig = {
      httpsAgent: this.httpsagent,
      httpAgent: this.httpagent,
      timeout: this.axiostimeout,
      maxRedirects: 0,
      headers: {
        Authorization: this.auth,
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      responseType: "text",
      transformResponse: (res) => {
        return res;
      }
    };
    this.adapter.log.debug(`Request Token ${path}`);
    const response = await this.axiosinstance.get(await this.getAbsoluteURI(path), requestconfig);
    if (response.data)
      response.data = tools.JsonParseDelSonderszeichen(response.data);
    this.token = response.data.message;
    this.adapter.log.debug(`New Token: ${this.token}`);
    return this.token;
  }
  async requestGet(path, config = {}) {
    const unixtime = this.getUnixTimestampNow();
    const token = await this.requestToken(false);
    const requestconfig = {
      httpsAgent: this.httpsagent,
      httpAgent: this.httpagent,
      timeout: this.axiostimeout,
      maxRedirects: 0,
      headers: {
        Authorization: this.auth,
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Token": token
      },
      responseType: "text",
      transformResponse: (res) => {
        return res;
      },
      ...config
    };
    this.adapter.log.debug(`Request Get ${path}`);
    const response = await this.axiosinstance.get(await this.getAbsoluteURI(path), requestconfig);
    if (response.data)
      response.data = tools.JsonParseDelSonderszeichen(response.data);
    return {
      data: response.data,
      unixtime
    };
  }
  async requestPost(path, data, config) {
    const token = await this.requestToken(false);
    const requestconfig = {
      httpsAgent: this.httpsagent,
      httpAgent: this.httpagent,
      timeout: this.axiostimeout,
      maxRedirects: 0,
      headers: {
        Authorization: this.auth,
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Token": token
      },
      responseType: "text",
      transformResponse: (res) => {
        return res;
      },
      ...config
    };
    const unixtime = this.getUnixTimestampNow();
    const text = import_querystring.default.stringify(data);
    this.adapter.log.debug(`Request Post ${path} with payload ${JSON.stringify(data)}`);
    const response = await this.axiosinstance.post(await this.getAbsoluteURI(path), text, requestconfig);
    if (response.data)
      response.data = tools.JsonParseDelSonderszeichen(response.data);
    return {
      data: response.data,
      unixtime
    };
  }
  async device_mapping_all(states) {
    var _a, _b, _c, _d, _e;
    const statesmapped = {};
    const id = states.id || states.sid;
    const idc = `devices.${id}`;
    const type = states.type || states.stype || ((_a = await this.states.getStateAsync(`${idc}.type`)) == null ? void 0 : _a.val);
    if (type === void 0)
      return;
    for (const name in states) {
      let value = states[name];
      if (name === "rssi" && value !== void 0) {
        const regstat = /{WEB_MSG_(.+)}(.*)/gm;
        const m = regstat.exec(value);
        if (m) {
          value = m[2] ? Number(m[2].trim()) : 0;
        } else {
          value = 0;
        }
      }
      if (name === "reachable" && states.rssi !== void 0) {
        const regstat = /{WEB_MSG_(.+)}(.*)/gm;
        const m = regstat.exec(states.rssi);
        if (m) {
          value = m[2] && Number(m[2].trim()) > 0 ? true : false;
        } else {
          value = false;
        }
      }
      if (name === "type_name") {
        value = datapoints.getDeviceNameByDeviceType(type);
      }
      if (name === "alarm_status_ex") {
        if (states["alarm_status"] !== void 0)
          value = states["alarm_status"] ? true : false;
      }
      if (name === "status") {
        const regstat = /\{WEB_MSG_(DC|DL)_(.+)\}/gm;
        const m = regstat.exec(value);
        if (m && m.length > 1)
          value = m[2];
      }
      if (name === "logmsg" && states.msg !== void 0) {
        value = states.msg;
      }
      if (type === 17 || type === 37) {
        if (name === "sresp_button_123" && states.sresp_panic !== void 0)
          value = states.sresp_panic;
        if (name === "sresp_button_456" && states.sresp_fire !== void 0)
          value = states.sresp_fire;
        if (name === "sresp_button_789" && states.sresp_medical !== void 0)
          value = states.sresp_medical;
      }
      if (type === 24 || type === 48 || type === 50 || type === 66) {
        if (name === "pd") {
          value = ((_b = await this.states.getStateAsync(`${idc}.pd`)) == null ? void 0 : _b.val) || 0;
        }
        if (name === "power" && states.status !== void 0) {
          const regstat = /{WEB_MSG_PSM_POWER}\s*([\d.]+)/gm;
          const m = regstat.exec(states.status);
          if (m) {
            value = Number(m[1].trim());
          }
        }
        if (name === "powertotal" && states.status !== void 0) {
          const regstat = /{WEB_MSG_POWER_METER_ENERGY}\s*([\d.]+)/gm;
          const m = regstat.exec(states.status);
          if (m) {
            value = Number(m[1].trim());
          }
        }
      }
      if (type === 52 && name.match(/appliance_\d+\.mode_name_\d+/gm)) {
        const regstat = /appliance_\d+\.(mode_name_\d+)/gm;
        const m = regstat.exec(name);
        if (m && states[m[1]]) {
          value = states[m[1]];
        }
      }
      if (type === 54 || type === 78) {
        if (name === "actual_temperature" && states.status !== void 0) {
          const regstat = /{WEB_MSG_TS_DEGREE}\s*([\d.]+)/gm;
          const m = regstat.exec(states.status);
          if (m) {
            value = Number(m[1].trim());
          }
        }
        if (name === "actual_humidity" && states.status !== void 0) {
          const regstat = /{WEB_MSG_RH_HUMIDITY}\s*([\d.]+)/gm;
          const m = regstat.exec(states.status);
          if (m) {
            value = Number(m[1].trim());
          }
        }
        if (name === "actual_lux" && states.status !== void 0) {
          const regstat = /{WEB_MSG_LM_LUX}\s*([\d.]+)/gm;
          const m = regstat.exec(states.status);
          if (m) {
            value = Number(m[1].trim());
          }
        }
      }
      if (type === 57) {
        if (name === "nuki_state" && states.nuki !== void 0) {
          for (const i in this.adapter.config.nuki_doorsensors) {
            const nuki = this.adapter.config.nuki_doorsensors[i].nuki;
            const door = this.adapter.config.nuki_doorsensors[i].door;
            if (id === nuki && door) {
              const doorvalue = (_c = await this.states.getStateAsync(`devices.${door}.status_ex`)) == null ? void 0 : _c.val;
              const valuenuki = Number(states.nuki);
              value = valuenuki === 3 && doorvalue === true ? 0 : valuenuki;
              break;
            }
          }
        }
        if (name === "nuki_action") {
          value = (_d = await this.states.getStateAsync(`${idc}.nuki_action`)) == null ? void 0 : _d.val;
        }
        if (name == "reachable" && tools.hasProperty(states, "consumer_id")) {
          value = await this.isNukiAllive(states.consumer_id);
        }
      }
      if (type === 76) {
        if (name === "switch") {
          const valuelevel = ((_e = await this.states.getStateAsync(`${idc}.level`)) == null ? void 0 : _e.val) || void 0;
          value = valuelevel !== void 0 && states.level !== void 0 && states.level > value ? 1 : 0;
        }
        if (name === "on_time" && value !== void 0) {
          value = tools.round(value / 10, 0.1) || 0;
        }
        if (name === "off_time" && value !== void 0) {
          value = tools.round(value / 10, 0.1) || 0;
        }
      }
      if (type === 79) {
        if (name === "actual_temperature" && states.status !== void 0) {
          const regstat = /{WEB_MSG_TS_DEGREE}\s*([\d.]+)/gm;
          const m = regstat.exec(states.status);
          if (m) {
            value = Number(m[1].trim());
          }
        }
        if (name === "valve" && states.status !== void 0) {
          const regstat = /{WEB_MSG_TRV_VALVE}\s*([\d.]+)/gm;
          const m = regstat.exec(states.status);
          if (m) {
            value = Number(m[1].trim());
          }
        }
        if (name === "set_temperature" && states.status !== void 0) {
          const regstat = /{WEB_MSG_TRV_SETPOINT}\s*([\d.]+)/gm;
          const m = regstat.exec(states.status);
          if (m) {
            value = Number(m[1].trim());
          }
        }
        if (name === "off" && states.status !== void 0) {
          const regstat = /{WEB_MSG_TRV_(OFF)}/gm;
          const m = regstat.exec(states.status);
          if (m && m[1] === "OFF")
            value = true;
          else
            value = false;
        }
        if (name === "mode" && states.status !== void 0) {
          const regstat = /{WEB_MSG_TRV_(AUTO|MANUAL)}/gm;
          const m = regstat.exec(states.status);
          if (m && m[1] === "AUTO")
            value = 1;
          if (m && m[1] === "MANUAL")
            value = 0;
        }
        if (name === "thermo_offset" && value !== void 0) {
          value = tools.round(value / 10, 0.5);
        }
      }
      statesmapped[name] = value;
    }
    return statesmapped;
  }
  async webcam_mapping_all(id, states) {
    const statesmapped = states;
    const port = this.adapter.config.webcam_port;
    const bind = this.adapter.config.webcam_bind;
    const host = bind !== "0.0.0.0" ? bind : this.adapter.host;
    if (this.adapter.config.webcam_providing && statesmapped.url) {
      statesmapped.image = `http://${host}:${port}/image/${id}`;
      statesmapped.stream = `http://${host}:${port}/stream/${id}`;
    } else {
      statesmapped.image = "";
      statesmapped.stream = "";
    }
    return statesmapped;
  }
  async zentrale_mapping_all(states) {
    const statesmapped = states;
    statesmapped.apple_home_a1 = this.getAppleStautusFromLupusec(states.mode_pc_a1, states.alarm_ex);
    statesmapped.apple_home_a2 = this.getAppleStautusFromLupusec(states.mode_pc_a2, states.alarm_ex);
    if (states.rssi !== void 0) {
      statesmapped.reachable = states.rssi > 0 ? true : false;
    }
    return statesmapped;
  }
  async dummyDevicePost(id) {
    this.setUnixTimestamp(id);
  }
  async haExecutePost(id, form) {
    if (!form)
      return;
    const result = await this.requestPost(urlHaExecutePost, form);
    this.setUnixTimestamp(id);
    return result;
  }
  async deviceEditThermoPost(id, form) {
    if (!form)
      return;
    const result = await this.requestPost(urlDeviceEditThermoPost, form);
    this.setUnixTimestamp(id);
    return result;
  }
  async deviceEditPost(id, form) {
    var _a, _b;
    if (!form)
      return;
    const ressultold = await this.requestPost(urlDeviceEditGet, { id: form.id });
    if ((_b = (_a = ressultold == null ? void 0 : ressultold.data) == null ? void 0 : _a.forms) == null ? void 0 : _b.ssform) {
      const ssform = ressultold.data.forms.ssform;
      for (const name in ssform) {
        const value = ssform[name];
        if (!tools.hasProperty(form, name)) {
          switch (typeof value) {
            case "string":
              if (value.length > 0)
                form[name] = value;
              break;
            default:
              if (value)
                form[name] = value;
              break;
          }
        }
      }
      const result = await this.requestPost(urlDeviceEditPost, form);
      this.setUnixTimestamp(id);
      return result;
    }
  }
  async deviceEditShutterPost(id, form) {
    if (!form)
      return;
    const result = await this.requestPost(urlDeviceEditShutterPost, form);
    this.setUnixTimestamp(id);
    return result;
  }
  async deviceSwitchPSSPost(id, form) {
    if (!form)
      return;
    const result = await this.requestPost(urlDeviceSwitchPSSPost, form);
    this.setUnixTimestamp(id);
    return result;
  }
  async deviceNukiCmd(id, form) {
    if (!form)
      return;
    const result = await this.requestPost(urlDeviceNukiCmd, form);
    this.setUnixTimestamp(id);
    return result;
  }
  async deviceEditGet(form) {
    if (!form)
      return;
    const result = await this.requestPost(urlDeviceEditGet, form);
    return result;
  }
  async deviceEditThermoGet(form) {
    if (!form)
      return;
    const result = await this.requestPost(urlDeviceEditThermoGet, form);
    return result;
  }
  async deviceEditMeterGet(form) {
    if (!form)
      return;
    const result = await this.requestPost(urlDeviceEditMeterGet, form);
    return result;
  }
  async deviceEditShutterGet(form) {
    if (!form)
      return;
    const result = await this.requestPost(urlDeviceEditShutterGet, form);
    return result;
  }
  async deviceEditMeterPost(id, form) {
    if (!form)
      return;
    const result = await this.requestPost(urlDeviceEditMeterPost, form);
    this.setUnixTimestamp(id);
    return result;
  }
  async deviceSwitchDimmerPost(id, form) {
    if (!form)
      return;
    const result = await this.requestPost(urlDeviceSwitchDimmerPost, form);
    this.setUnixTimestamp(id);
    return result;
  }
  async panelCondPost(id, form) {
    if (!form)
      return;
    const result = await this.requestPost(urlPanelCondPost, form);
    this.setUnixTimestamp(id);
    return result;
  }
  async deviceDoUPICPost(id, form) {
    if (!form)
      return;
    const result = await this.requestPost(urlDeviceDoUPICPost, form);
    this.setUnixTimestamp(id);
    return result;
  }
  async sendSMSPost(id, form) {
    if (!form)
      return;
    const result = await this.requestPost(urlSendSMSPost, form);
    this.setUnixTimestamp(id);
    return result;
  }
  async sendSMSgwTestPost(id, form) {
    if (!form)
      return;
    const result = await this.requestPost(urlSmsgwTestPost, form);
    this.setUnixTimestamp(id);
    return result;
  }
  async deviceHueColorControl(id, form) {
    if (!form)
      return;
    const result = await this.requestPost(urlDeviceHueColorControl, form);
    this.setUnixTimestamp(id);
    return result;
  }
  async logoutPost() {
    const result = await this.requestGet(urlLogoutPost);
    this.setUnixTimestamp("logoutPost");
    return result;
  }
  async isNukiAllive(id) {
    var _a, _b;
    const result = await this.requestGet(urlNukiGet);
    if ((_b = (_a = result == null ? void 0 : result.data) == null ? void 0 : _a.forms) == null ? void 0 : _b.nukiform) {
      const nukis = result.data.forms.nukiform;
      if (nukis.url1) {
        const url = nukis.url1.match(/^(http|https):\/\//gm) ? nukis.url1 : `http:\\${nukis.url1}`;
        const myURL = new URL(url);
        if (myURL) {
          const proberesult = await tools.probe(myURL.hostname, Number(myURL.port));
          return proberesult;
        }
      }
    }
    return void 0;
  }
  async getAllStatusLupusecEntries() {
    var _a, _b, _c, _d;
    const result = await this.requestGet(urlPanelCondGet);
    const data = {
      unixtime: result.unixtime,
      zentrale: result.data.updates
    };
    if ((_b = (_a = result == null ? void 0 : result.data) == null ? void 0 : _a.forms) == null ? void 0 : _b.pcondform1) {
      for (const key in result.data.forms.pcondform1) {
        const value = result.data.forms.pcondform1[key];
        data.zentrale[key + "_pc_a1"] = value;
      }
    }
    if ((_d = (_c = result == null ? void 0 : result.data) == null ? void 0 : _c.forms) == null ? void 0 : _d.pcondform2) {
      for (const key in result.data.forms.pcondform2) {
        const value = result.data.forms.pcondform2[key];
        data.zentrale[key + "_pc_a2"] = value;
      }
    }
    await this.setAllStatusLupusecEntries(data);
  }
  async getAllSMSLupusecEntries() {
    const data = {
      unixtime: this.getUnixTimestampNow(),
      sms: {}
    };
    await this.setAllSMSLupusecEntries(data);
  }
  async getAllWebcamLupusecEntries() {
    var _a, _b;
    const webcams = {};
    const results = await this.requestGet(urlIpcamGet);
    if (!results || !results.data)
      return;
    if ((_b = (_a = results == null ? void 0 : results.data) == null ? void 0 : _a.forms) == null ? void 0 : _b.ipcamform) {
      for (const name in results.data.forms.ipcamform) {
        const value = results.data.forms.ipcamform[name];
        const index = Number(name.slice(-1));
        if (index >= 1 && index <= 9) {
          if (!webcams[`cam${index}`])
            webcams[`cam${index}`] = {};
          webcams[`cam${index}`][name.slice(0, -1)] = value;
        }
      }
    }
    const data = {
      unixtime: results.unixtime,
      webcams
    };
    await this.setAllWebcamLupusecEntries(data);
  }
  async getAllDeviceLupusec() {
    const parallelprocessing = true;
    const requestarray = [];
    const devices = {};
    requestarray.push(async () => await this.getAllDeviceLupusecEntries());
    requestarray.push(async () => await this.getAllDeviceLupusecEditEntries());
    requestarray.push(async () => await this.getAllDeviceLupusecLogs());
    let results = [];
    if (parallelprocessing || this.adapter.config.option_pollfaster) {
      results = await Promise.all(
        requestarray.map(async (request) => {
          let result = {};
          const isasync = tools.isAsync(request);
          result = isasync ? await request() : request();
          return result;
        })
      );
    } else {
      for (const request of requestarray) {
        let result = {};
        const isasync = tools.isAsync(request);
        result = isasync ? await request() : request();
        results.push(result);
      }
    }
    let unixtime = 0;
    for (const idx in results) {
      const result = results[idx];
      for (const idd in result.devices) {
        devices[idd] = {
          ...result.devices[idd],
          ...devices[idd]
        };
      }
      if (result && result.unixtime > unixtime)
        unixtime = result.unixtime;
    }
    const data = {
      unixtime,
      devices
    };
    await this.setAllDeviceLupusecEntries(data);
  }
  async getAllDeviceLupusecLogs() {
    var _a;
    const devices = {};
    const results = await this.requestPost(urlLogsGet, {
      max_count: 10
    });
    if (!results || !results.data)
      return;
    if ((_a = results == null ? void 0 : results.data) == null ? void 0 : _a.logrows) {
      const states = await this.states.getStatesAllAsync("devices.*");
      for (const i in results.data.logrows) {
        const row = results.data.logrows[i];
        const regex = /{WEB_MSG_DEVICE_AREA_ZONE}[\t\s]*(\d*)[\t\s]*(\d*)/gm;
        const m = regex.exec(row.source);
        if (m && m[1] && m[2]) {
          const area = Number(m[1]);
          const zone = Number(m[2]);
          let id = Object.keys(states).find(
            (key) => {
              var _a2;
              return key.startsWith("devices") && key.endsWith("zone") && states[key].val === zone && ((_a2 = states[key.replace(/zone$/, "area")]) == null ? void 0 : _a2.val) === area;
            }
          );
          if (id) {
            id = id.replace(`devices.`, "").replace(".zone", "");
            if (!devices[id] || !devices[id].logtime || row.log_time > devices[id].log_time) {
              devices[id] = {
                ...row,
                id,
                area,
                zone
              };
            }
          }
        }
      }
    }
    const data = {
      unixtime: results == null ? void 0 : results.unixtime,
      devices
    };
    return data;
  }
  async getAllDeviceLupusecEditEntries() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    const devices = {};
    const deviceids = await this.getDeviceIdsByType();
    let unixtime = 0;
    const requestarray = [];
    const parallelprocessing = true;
    for (const deviceid of deviceids) {
      const type = deviceid.type;
      const id = deviceid.id;
      if ([7, 17, 81, 37, 50, 76, 79, 81].includes(type)) {
        if (type) {
          requestarray.push(
            async () => await this.deviceEditGet({
              id
            })
          );
        }
      }
      if (type === 50) {
        requestarray.push(
          async () => await this.deviceEditMeterGet({
            id
          })
        );
      }
      if (type === 76) {
        requestarray.push(
          async () => await this.deviceEditShutterGet({
            id
          })
        );
      }
      if (type === 79) {
        requestarray.push(
          async () => await this.deviceEditThermoGet({
            id
          })
        );
      }
    }
    let results = [];
    if (parallelprocessing || this.adapter.config.option_pollfaster) {
      results = await Promise.all(
        requestarray.map(async (request) => {
          let result = {};
          const isasync = tools.isAsync(request);
          result = isasync ? await request() : request();
          return result;
        })
      );
    } else {
      for (const request of requestarray) {
        let result = {};
        const isasync = tools.isAsync(request);
        result = isasync ? await request() : request();
        results.push(result);
      }
    }
    for (const idx in results) {
      const result = results[idx];
      if ((_b = (_a = result == null ? void 0 : result.data) == null ? void 0 : _a.forms) == null ? void 0 : _b.ssform)
        result.data.form = result.data.forms.ssform;
      if ((_d = (_c = result == null ? void 0 : result.data) == null ? void 0 : _c.forms) == null ? void 0 : _d.thermoform)
        result.data.form = result.data.forms.thermoform;
      if ((_f = (_e = result == null ? void 0 : result.data) == null ? void 0 : _e.forms) == null ? void 0 : _f.shutterform)
        result.data.form = result.data.forms.shutterform;
      if ((_h = (_g = result == null ? void 0 : result.data) == null ? void 0 : _g.forms) == null ? void 0 : _h.meterform)
        result.data.form = result.data.forms.meterform;
      if ((_i = result == null ? void 0 : result.data) == null ? void 0 : _i.forms)
        delete result.data.forms;
      if ((_j = result == null ? void 0 : result.data) == null ? void 0 : _j.form) {
        const device = result.data.form;
        if (device.id || device.sid) {
          const id = device.id || device.sid;
          devices[id] = {
            ...devices[id],
            ...device
          };
        }
      }
      if (result && result.unixtime > unixtime)
        unixtime = result.unixtime;
    }
    const data = {
      unixtime,
      devices
    };
    return data;
  }
  async getAllDeviceLupusecEntries() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    const resultDeviceListGet = await this.requestGet(urlDeviceListGet);
    const resultDevicePSSListGet = await this.requestGet(urlDevicePSSListGet);
    const resultDeviceListUPICGet = await this.requestGet(urlDeviceListUPICGet);
    const results = {
      unixtime: resultDeviceListUPICGet.unixtime,
      data: {
        DeviceListGet: resultDeviceListGet,
        DevicePSSListGet: resultDevicePSSListGet,
        DeviceListUPICGet: resultDeviceListUPICGet
      }
    };
    if (!results || !results.data)
      return;
    const devices = {};
    if ((_c = (_b = (_a = results == null ? void 0 : results.data) == null ? void 0 : _a.DeviceListGet) == null ? void 0 : _b.data) == null ? void 0 : _c.senrows) {
      for (const device of results.data.DeviceListGet.data.senrows) {
        if (device.id || device.sid) {
          const id = device.id || device.sid;
          devices[id] = { ...devices[id], ...device };
        }
      }
    }
    if ((_f = (_e = (_d = results == null ? void 0 : results.data) == null ? void 0 : _d.DevicePSSListGet) == null ? void 0 : _e.data) == null ? void 0 : _f.pssrows) {
      for (const device of results.data.DevicePSSListGet.data.pssrows) {
        if (device.id || device.sid) {
          const id = device.id || device.sid;
          devices[id] = { ...devices[id], ...device };
        }
      }
    }
    if ((_i = (_h = (_g = results == null ? void 0 : results.data) == null ? void 0 : _g.DeviceListUPICGet) == null ? void 0 : _h.data) == null ? void 0 : _i.upicrows) {
      for (const device of results.data.DeviceListUPICGet.data.upicrows) {
        if (device.id || device.sid) {
          const id = device.id || device.sid;
          devices[id] = { ...devices[id], ...device };
        }
      }
    }
    const data = {
      unixtime: results == null ? void 0 : results.unixtime,
      devices
    };
    return data;
  }
  async extendCommonName(name, extname) {
    if (!extname || !name)
      return name;
    if (typeof name === "object" && typeof extname === "object") {
      const newnames = {};
      for (const language in name) {
        newnames[language] = extname[language] ? `${extname[language]} (${name[language]})` : name[language];
      }
      return newnames;
    }
    if (typeof name === "object" && typeof extname === "string") {
      const newnames = {};
      for (const language in name) {
        newnames[language] = `${extname} (${name[language]})`;
      }
      return newnames;
    }
    if (typeof name === "string" && typeof extname === "string") {
      const newname = `${extname} (${name})`;
      return newname;
    }
    if (typeof name === "string" && typeof extname === "object") {
      const newname = extname[this.language] ? `${extname[this.language]} (${name})` : name;
      return newname;
    }
  }
  async createObjectSetStates(id, name, value, unixtime, obj, devicename) {
    const execdelay = 0;
    const object = obj;
    const sid = id + "." + name;
    if (object.common.name === "%value%") {
      object.common.name = value !== void 0 ? value : void 0;
    }
    if (typeof object.common.name === "string" && object.common.name.indexOf("%value%") !== -1) {
      object.common.name = value !== void 0 ? object.common.name.replace("%value%", value) : void 0;
    }
    if (object.common.name) {
      object.common.name = await this.extendCommonName(object.common.name, devicename);
    }
    await this.states.setObjectNotExistsAsync(sid, {
      type: object.type,
      common: object.common,
      native: {}
    });
    if (object.type === "channel" || object.type === "device")
      return;
    const statevalue = tools.convertPropertyType(value, object.common.type);
    if (statevalue === null || statevalue === void 0) {
      return;
    }
    const stateget = await this.states.getStateAsync(sid);
    const stateunixtime = this.getUnixTimestamp(sid) > 0 ? this.getUnixTimestamp(sid) + execdelay : this.getUnixTimestamp(sid);
    if (stateget && stateunixtime === void 0 && stateget.ack === true && stateget.val === statevalue) {
      this.delUnixTimestamp(sid);
      return;
    }
    if (!stateget || stateunixtime === void 0 || stateget.ack === true && stateget.val !== statevalue) {
      const result = await this.states.setStateNotExistsAsync(sid, { val: statevalue, ack: true });
      this.delUnixTimestamp(sid);
      if (stateget) {
        this.adapter.log.debug(
          `State ${sid} changed value from ${stateget.val} to ${statevalue} and ack from ${stateget.ack} to true)`
        );
      } else {
        this.adapter.log.debug(`State ${sid} changed to value ${statevalue} and ack to true)`);
      }
      return;
    }
    if (!stateget || stateget.ack === false && stateunixtime > 0 && stateunixtime < unixtime) {
      const result = await this.states.setStateNotExistsAsync(sid, { val: statevalue, ack: true });
      this.delUnixTimestamp(sid);
      if (stateget) {
        this.adapter.log.debug(
          `State ${sid} changed value from ${stateget.val} to ${statevalue} and ack from ${stateget.ack} to true)`
        );
      } else {
        this.adapter.log.debug(`State ${sid} changed to value ${statevalue} and ack to true)`);
      }
      return;
    }
  }
  async setAllDeviceLupusecEntries(results) {
    var _a;
    const unixtime = results.unixtime;
    const devices = results.devices;
    const promisearray = [];
    for (const id in devices) {
      const device = devices[id];
      const idc = "devices." + id;
      const cname = device.name || device.sname;
      const type = device.type || device.stype || ((_a = await this.states.getStateAsync(`${idc}.type`)) == null ? void 0 : _a.val);
      if (type === void 0)
        continue;
      let objects = datapoints.getDeviceTypeList(type, this.language);
      if (!objects) {
        this.adapter.log.warn(
          `Ger\xE4tetyp ${type} f\xFCr das Ger\xE4t ${id} mit Namen ${cname || ""} wird nicht unterst\xFCtzt!`
        );
        objects = datapoints.getDeviceTypeList(0, this.language);
      }
      const icon = datapoints.getDeviceIconByDeviceType(type);
      const oldobject = await this.states.getObjectAsync(idc);
      if (cname !== void 0 && oldobject && oldobject.common && oldobject.common.name !== cname) {
        const result = await this.states.setObjectAsync(idc, {
          type: "channel",
          common: {
            name: cname,
            icon,
            statusStates: {
              onlineId: "reachable"
            }
          },
          native: {}
        });
        if (result) {
          this.adapter.log.info(`Neuer Ger\xE4tname f\xFCr ${id} ist ${cname || ""}`);
        }
      } else {
        const result = await this.states.setObjectNotExistsAsync(idc, {
          type: "channel",
          common: {
            name: cname,
            icon,
            statusStates: {
              onlineId: "reachable"
            }
          },
          native: {}
        });
        if (result) {
          this.adapter.log.info(`Ger\xE4t ${id} mit Namen ${cname || ""} hinzugef\xFCgt`);
        }
      }
      for (const dp in objects) {
        if (!tools.hasProperty(device, dp)) {
          device[dp] = void 0;
        }
      }
      const devicemappend = await this.device_mapping_all(device);
      for (const dp in objects) {
        const val = objects[dp];
        if (this.adapter.config.option_pollfaster) {
          promisearray.push(async () => {
            await this.createObjectSetStates(idc, dp, devicemappend[dp], unixtime, val, cname);
          });
        } else {
          await this.createObjectSetStates(idc, dp, devicemappend[dp], unixtime, val, cname);
        }
      }
    }
    if (promisearray)
      await Promise.all(promisearray.map(async (func) => await func()));
  }
  async setAllStatusLupusecEntries(results) {
    var _a, _b;
    const zentrale = results.zentrale;
    const unixtime = results.unixtime;
    const promisearray = [];
    const idc = "status";
    const objects = datapoints.getStatusTypeList(this.language);
    for (const dp in objects) {
      if (!tools.hasProperty(zentrale, dp)) {
        zentrale[dp] = void 0;
      }
    }
    const zentralemapped = await this.zentrale_mapping_all(zentrale);
    const cname = (_b = (_a = await this.states.getObjectAsync(idc)) == null ? void 0 : _a.common) == null ? void 0 : _b.name;
    for (const dp in objects) {
      if (this.adapter.config.option_pollfaster) {
        promisearray.push(
          async () => await this.createObjectSetStates(idc, dp, zentralemapped[dp], unixtime, objects[dp]),
          cname
        );
      } else {
        await this.createObjectSetStates(idc, dp, zentralemapped[dp], unixtime, objects[dp], cname);
      }
    }
    if (promisearray)
      await Promise.all(promisearray.map(async (func) => await func()));
  }
  async setAllSMSLupusecEntries(results) {
    var _a, _b, _c;
    const sms = results.sms;
    const unixtime = results.unixtime;
    const objects = datapoints.getSMSTypeList(this.language);
    const idc = "sms";
    const promisearray = [];
    for (const dp in objects) {
      if (!tools.hasProperty(sms, dp)) {
        sms[dp] = (_a = await this.states.getStateAsync(`${idc}.${dp}`)) == null ? void 0 : _a.val;
      }
    }
    const cname = (_c = (_b = await this.states.getObjectAsync(idc)) == null ? void 0 : _b.common) == null ? void 0 : _c.name;
    for (const dp in objects) {
      if (this.adapter.config.option_pollfaster) {
        promisearray.push(
          async () => await this.createObjectSetStates(idc, dp, sms[dp], unixtime, objects[dp], cname)
        );
      } else {
        await this.createObjectSetStates(idc, dp, sms[dp], unixtime, objects[dp], cname);
      }
    }
    if (promisearray)
      await Promise.all(promisearray.map(async (func) => await func()));
  }
  async setAllWebcamLupusecEntries(results) {
    const unixtime = results.unixtime;
    const webcams = results.webcams;
    const promisearray = [];
    const objects = datapoints.getWebcamTypeList(this.language);
    for (const id in webcams) {
      const webcam = webcams[id];
      const idc = "webcams." + id;
      const cname = webcam.name || `Webcam ${idc.slice(-1)} ` || "";
      const result = await this.states.setObjectNotExistsAsync(idc, {
        type: "channel",
        common: {
          name: cname,
          icon: "/icons/webcam.png"
        },
        native: {}
      });
      if (result) {
        this.adapter.log.info(`Webcam ${id} mit Namen ${cname} hinzugef\xFCgt`);
      }
      for (const dp in objects) {
        if (!tools.hasProperty(webcam, dp)) {
          webcam[dp] = void 0;
        }
      }
      const webcammapped = await this.webcam_mapping_all(id, webcam);
      for (const dp in objects) {
        if (this.adapter.config.option_pollfaster) {
          promisearray.push(
            async () => await this.createObjectSetStates(
              "webcams." + id,
              dp,
              webcammapped[dp],
              unixtime,
              objects[dp]
            )
          );
        } else {
          await this.createObjectSetStates("webcams." + id, dp, webcammapped[dp], unixtime, objects[dp]);
        }
      }
    }
    if (promisearray)
      await Promise.all(promisearray.map(async (func) => await func()));
    if (this.adapter.config.webcam_providing) {
      const caminstance = wc.Webcam.getInstance(this.adapter, webcams);
      await caminstance.startServer();
    }
  }
  async onStateChange(id, state) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
    try {
      if (state && state.ack === false) {
        await this.states.setStateNotExistsAsync(id, { val: state.val, ack: state.ack });
        if (id.startsWith(this.adapter.namespace + ".devices.")) {
          const execdelay = 1e3;
          const icchannelabs = id.split(".").slice(0, 4).join(".");
          const idchannel = id.split(".").slice(2, 4).join(".");
          const iddevice = id.split(".").slice(2).join(".");
          const channel = id.split(".").slice(3, 4).join(".");
          const name = id.split(".").slice(-1).join(".");
          const zone = (_a = await this.states.getStateAsync(`${idchannel}.zone`)) == null ? void 0 : _a.val;
          const area = (_b = await this.states.getStateAsync(`${idchannel}.area`)) == null ? void 0 : _b.val;
          const type = (_c = await this.states.getStateAsync(`${idchannel}.type`)) == null ? void 0 : _c.val;
          if (name === "status_ex") {
            const value = state.val === true ? "on" : "off";
            const valuepd = Number(((_d = await this.states.getStateAsync(`${idchannel}.pd`)) == null ? void 0 : _d.val) || 0) * 60 || 0;
            const valuepdtxt = !valuepd ? "" : `:${valuepd}`;
            const exec = `a=${area}&z=${zone}&sw=${value}&pd=${valuepdtxt}`;
            await this.haExecutePost(iddevice, {
              exec
            });
          } else if (name === "pd") {
            await this.dummyDevicePost(iddevice);
          } else if (name === "factor") {
            await this.deviceEditMeterPost(iddevice, {
              id: channel,
              factor: state.val
            });
          } else if (name.startsWith("mode_name_")) {
            const mode = name.replace("mode_name_", "");
            await this.deviceDoUPICPost(iddevice, {
              id: channel,
              mode
            });
          } else if (name === "leds") {
            await this.deviceDoUPICPost(iddevice, {
              id: channel,
              led: "query"
            });
          } else if (name === "nuki_action") {
            let value = void 0;
            switch (state.val) {
              case 3:
                value = 1;
                break;
              case 1:
                value = 2;
                break;
              case 0:
                value = 3;
                break;
              default:
                break;
            }
            this.adapter.clearTimeout(this.timerhandle[iddevice]);
            this.timerhandle[iddevice] = this.adapter.setTimeout(async () => {
              var _a2;
              for (let i = 1; i <= 10; i++) {
                const result = await this.deviceNukiCmd(iddevice, {
                  id: channel,
                  action: value
                });
                if (((_a2 = result == null ? void 0 : result.data) == null ? void 0 : _a2.result) === 1)
                  break;
                this.adapter.log.debug(
                  `Action on Nuki not executed, because no positive response from Nuki!. Will try it again in a few seconds!`
                );
                await tools.wait(1);
              }
            }, 0);
          } else if (name === "level") {
            this.adapter.clearTimeout(this.timerhandle[iddevice]);
            this.timerhandle[iddevice] = this.adapter.setTimeout(async () => {
              await this.deviceSwitchDimmerPost(iddevice, {
                id: channel,
                level: state.val
              });
            }, execdelay);
          } else if (name === "switch") {
            const shutterstates = {
              0: "on",
              1: "off",
              2: "stop"
            };
            const exec = `a=${area}&z=${zone}&shutter=${shutterstates[state.val]}`;
            await this.haExecutePost(iddevice, {
              exec
            });
          } else if (name === "on_time") {
            const on_time = Number(state.val);
            const off_time = Number(((_e = await this.states.getStateAsync(`${idchannel}.off_time`)) == null ? void 0 : _e.val) || 0);
            await this.deviceEditShutterPost(iddevice, {
              id: channel,
              on_time: Math.round(on_time * 10),
              off_time: Math.round(off_time * 10)
            });
          } else if (name === "off_time") {
            const on_time = Number(((_f = await this.states.getStateAsync(`${idchannel}.on_time`)) == null ? void 0 : _f.val) || 0);
            const off_time = Number(state.val);
            await this.deviceEditShutterPost(iddevice, {
              id: channel,
              on_time: Math.round(on_time * 10),
              off_time: Math.round(off_time * 10)
            });
          } else if (name === "thermo_offset") {
            await this.deviceEditThermoPost(iddevice, {
              id: channel,
              act: "t_offset",
              thermo_offset: Math.round(Number(state.val) * 10)
            });
          } else if (name === "mode") {
            await this.deviceEditThermoPost(iddevice, {
              id: channel,
              act: "t_schd_setting",
              thermo_schd_setting: state.val == 0 ? 0 : 1
            });
          } else if (name === "off") {
            await this.deviceEditThermoPost(iddevice, {
              id: channel,
              act: "t_mode",
              thermo_mode: state.val == true ? 0 : 4
            });
          } else if (name === "set_temperature") {
            this.adapter.clearTimeout(this.timerhandle[iddevice]);
            this.timerhandle[iddevice] = this.adapter.setTimeout(async () => {
              await this.deviceEditThermoPost(iddevice, {
                id: channel,
                act: "t_setpoint",
                thermo_setpoint: Math.trunc(100 * Math.round(2 * Number(state.val)) / 2)
              });
            }, execdelay);
          } else if (name.startsWith("sresp_button_") || name === "sresp_emergency" || name === "name" || name === "send_notify" || name === "bypass" || name === "bypass_tamper" || name === "schar_latch_rpt" || name === "always_off") {
            let parameter = name;
            const form = {
              id: channel,
              sarea: area,
              szone: zone
            };
            if (name === "sresp_button_123")
              parameter = "sresp_panic";
            if (name === "sresp_button_456")
              parameter = "sresp_fire";
            if (name === "sresp_button_789")
              parameter = "sresp_medical";
            if (name === "name")
              parameter = "sname";
            if (name === "bypass")
              parameter = "scond_bypass";
            form[parameter] = state.val;
            await this.deviceEditPost(iddevice, form);
          } else if (name === "hue") {
            this.adapter.clearTimeout(this.timerhandle[iddevice]);
            this.timerhandle[iddevice] = this.adapter.setTimeout(async () => {
              var _a2;
              const valuesat = Number(((_a2 = await this.states.getStateAsync(`${idchannel}.sat`)) == null ? void 0 : _a2.val) || 0);
              await this.deviceHueColorControl(iddevice, {
                id: channel,
                act: "t_setpoint",
                hue: state.val || 0,
                saturation: valuesat,
                mod: 2
              });
            }, execdelay);
          } else if (name === "sat") {
            this.adapter.clearTimeout(this.timerhandle[iddevice]);
            this.timerhandle[iddevice] = this.adapter.setTimeout(async () => {
              var _a2;
              const valuehue = Number(((_a2 = await this.states.getStateAsync(`${idchannel}.hue`)) == null ? void 0 : _a2.val) || 0);
              await this.deviceHueColorControl(iddevice, {
                id: channel,
                act: "t_setpoint",
                hue: valuehue,
                saturation: state.val || 0,
                mod: 2
              });
            }, execdelay);
          } else {
            this.adapter.log.error(`Found no function to set state to ${state.val} for Id ${iddevice}`);
            this.dummyDevicePost(iddevice);
          }
        }
        if (id.startsWith(this.adapter.namespace + ".status.")) {
          const regstat = /.+\.status\.(.+)/gm;
          const m = regstat.exec(id);
          if (!m)
            return;
          const icchannelabs = id.split(".").slice(0, -1).join(".");
          const idchannel = id.split(".").slice(2, -1).join(".");
          const iddevice = id.split(".").slice(2).join(".");
          const name = m[1];
          if (name === "mode_pc_a1") {
            await this.panelCondPost(iddevice, { area: 1, mode: state.val });
          } else if (name === "mode_pc_a2") {
            await this.panelCondPost(iddevice, { area: 2, mode: state.val });
          } else if (name === "apple_home_a1") {
            const mode_pc_a1 = this.getLupusecFromAppleStautus(Number(state.val));
            if (mode_pc_a1 !== void 0 && mode_pc_a1 >= 0 && mode_pc_a1 <= 4)
              await this.panelCondPost(iddevice, { area: 1, mode: mode_pc_a1 });
          } else if (name === "apple_home_a2") {
            const mode_pc_a2 = this.getLupusecFromAppleStautus(Number(state.val));
            if (mode_pc_a2 !== void 0 && mode_pc_a2 >= 0 && mode_pc_a2 <= 4)
              await this.panelCondPost(iddevice, { area: 2, mode: mode_pc_a2 });
          } else {
            this.adapter.log.error(`Found no function to set state to ${state.val} for Id ${iddevice}`);
            this.dummyDevicePost(iddevice);
          }
        }
        if (id.startsWith(this.adapter.namespace + ".sms.")) {
          const regstat = /.+\.sms\.(.+)/gm;
          const m = regstat.exec(id);
          if (!m)
            return;
          const icchannelabs = id.split(".").slice(0, -1).join(".");
          const idchannel = id.split(".").slice(2, -1).join(".");
          const iddevice = id.split(".").slice(2).join(".");
          const name = m[1];
          const valText = (_g = await this.states.getStateAsync(`${idchannel}.text`)) == null ? void 0 : _g.val;
          const valNumber = (_h = await this.states.getStateAsync(`${idchannel}.number`)) == null ? void 0 : _h.val;
          const valProvider = (_i = await this.states.getStateAsync(`${idchannel}.provider`)) == null ? void 0 : _i.val;
          let resultsms;
          if (name === "dial") {
            if (valText && valNumber) {
              switch (valProvider) {
                case 1:
                  resultsms = await this.sendSMSPost(iddevice, {
                    phone: valNumber,
                    smstext: valText
                  });
                  await this.states.setStateNotExistsAsync(`${idchannel}.result`, {
                    val: (_j = resultsms == null ? void 0 : resultsms.data) == null ? void 0 : _j.result,
                    ack: true
                  });
                  break;
                case 2:
                  resultsms = await this.sendSMSgwTestPost(iddevice, {
                    to: valNumber,
                    message: valText
                  });
                  await this.states.setStateNotExistsAsync(`${idchannel}.result`, {
                    val: (_k = resultsms == null ? void 0 : resultsms.data) == null ? void 0 : _k.result,
                    ack: true
                  });
                  break;
                default:
                  break;
              }
            }
          } else {
            this.adapter.log.error(`Found no function to set state to ${state.val} for Id ${iddevice}`);
            this.dummyDevicePost(iddevice);
          }
        }
      }
      if (!state) {
        await this.states.delStateAsync(id);
        this.adapter.log.info(`State ${id} deleted`);
      }
    } catch (error) {
      this.adapter.log.error(`Error while setting state: ${error.toString()}`);
    }
  }
  async onObjectChange(id, obj) {
    if (obj) {
    } else {
      await this.states.delObjectAsync(id);
      this.adapter.log.info(`object ${id} deleted`);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Lupusec
});
//# sourceMappingURL=lupusec.js.map

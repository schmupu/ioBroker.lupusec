"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var utils = __toESM(require("@iobroker/adapter-core"));
var import_lupusec = require("./lib/lupusec");
var import_tools = require("./lib/tools");
class Lupusec extends utils.Adapter {
  onlineCheckAvailable;
  onlineCheckTimeout;
  constructor(options = {}) {
    super({
      ...options,
      name: "lupusec"
    });
    this.onlineCheckAvailable = false;
    this.onlineCheckTimeout = void 0;
    this.on("ready", this.onReady.bind(this));
    this.on("stateChange", this.onStateChange.bind(this));
    this.on("objectChange", this.onObjectChange.bind(this));
    this.on("message", this.onMessage.bind(this));
    this.on("unload", this.onUnload.bind(this));
  }
  /**
   * Is called when databases are connected and adapter received configuration.
   */
  async onReady() {
    await this.changeDefaultParamter();
    await this.subscribeStatesAsync("devices.*");
    await this.subscribeStatesAsync("status.*");
    await this.subscribeStatesAsync("sms.*");
    await this.subscribeStatesAsync("webcams.*");
    await this.subscribeObjectsAsync("devices.*");
    await this.subscribeObjectsAsync("status.*");
    await this.subscribeObjectsAsync("sms.*");
    await this.subscribeObjectsAsync("webcams.*");
    await this.startOnlineCheck();
    this.log.info(`GitHub version!`);
  }
  /**
   * Is called when adapter shuts down - callback has to be called under any circumstances!
   *
   * @param callback calback function
   */
  async onUnload(callback) {
    try {
      this.log.info(`Stopping Lupusec processes, please wait!`);
      this.stopOnlineCheck();
      await this.stopLupusecAdapter();
      await import_tools.Tools.wait(15);
      callback();
    } catch (error) {
      callback();
    }
  }
  /**
   * Is called if a subscribed object changes
   *
   * @param id id of the object
   * @param obj object
   */
  async onObjectChange(id, obj) {
    const lupusec = await import_lupusec.Lupus.getInstance(this);
    await lupusec.onObjectChange(id, obj);
  }
  /**
   * Is called if a subscribed state changes
   *
   * @param id id of state
   * @param state state
   */
  async onStateChange(id, state) {
    const lupusec = await import_lupusec.Lupus.getInstance(this);
    if (state) {
      await lupusec.onStateChange(id, state);
    }
  }
  /**
   * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
   * Using this method requires "common.messagebox" property to be set to true in io-package.json
   *
   * @param obj object
   */
  async onMessage(obj) {
    if (typeof obj === "object" && obj.message) {
      if (obj.command === "send") {
        this.log.info("send command");
        if (obj.callback) {
          this.sendTo(obj.from, obj.command, "Message received", obj.callback);
        }
      }
      if (obj.command === "sendDoor") {
        const array = [];
        const actualstates = await this.getStatesAsync(`${this.namespace}.devices.*`);
        for (const [key] of Object.entries(actualstates)) {
          if (key.endsWith("type") && actualstates[key].val === 4) {
            const name = actualstates[key.replace(/type$/, "name")].val || "Door";
            const channel = key.split(".").slice(3, 4).join(".");
            array.push({ label: `${name} (${channel})`, value: channel });
          }
        }
        if (obj.callback) {
          this.sendTo(obj.from, obj.command, array, obj.callback);
        }
      }
      if (obj.command === "sendNuki") {
        const array = [];
        const actualstates = await this.getStatesAsync(`${this.namespace}.devices.*`);
        for (const [key] of Object.entries(actualstates)) {
          if (key.endsWith("type") && actualstates[key].val === 57) {
            const name = actualstates[key.replace(/type$/, "name")].val || "Nuki";
            const channel = key.split(".").slice(3, 4).join(".");
            array.push({ label: `${name} (${channel})`, value: channel });
          }
        }
        if (obj.callback) {
          this.sendTo(obj.from, obj.command, array, obj.callback);
        }
      }
      if (obj.command === "sms" || obj.command === "smsgw") {
        const lupusec = await import_lupusec.Lupus.getInstance(this);
        const valText = obj == null ? void 0 : obj.message.text;
        const valNumber = obj == null ? void 0 : obj.message.number;
        const iddevice = "sms.dial";
        if (obj.command === "sms" && valText && valNumber) {
          const form = {
            phone: valNumber,
            smstext: valText
          };
          const result = await lupusec.sendSMSPost(iddevice, form);
          this.sendTo(obj.from, obj.command, obj.message, obj.callback);
        }
        if (obj.command === "smsgw" && valText && valNumber) {
          const form = {
            to: valNumber,
            message: valText
          };
          const result = await lupusec.sendSMSgwTestPost(iddevice, form);
          this.sendTo(obj.from, obj.command, obj.message, obj.callback);
        }
      }
    }
  }
  /**
   * Change default parameter
   */
  async changeDefaultParamter() {
    let update = false;
    const id = `system.adapter.${this.namespace}`;
    const obj = await this.getForeignObjectAsync(id);
    if (obj && obj.native) {
      if (obj.native.option_pollfaster === true) {
      }
      const server = this.getHostnameAndPort();
      const url = server.https ? `https://${server.hostname}:${server.port}` : `http://${server.hostname}:${server.port}`;
      if (obj.native.alarmlink !== url) {
        this.log.debug(`Changing Local Link parameter ${id} to  ${obj.native.alarmlink}`);
        obj.native.alarmlink = url;
        update = true;
      }
      if (update && obj) {
        this.log.info(`Changing global Lupusec Adapter parmater. Adapter is restarting now.`);
        await this.setForeignObjectAsync(id, obj);
      }
    }
  }
  /**
   * returns the hostname and port of configuration.
   * example. test.foo:80 => {hostanem: test.foo, port: 80}
   *
   * @returns hostname and port as object
   */
  getHostnameAndPort() {
    const alarm_hostname = this.config.alarm_hostname;
    const array = alarm_hostname.split(":");
    const hostname = array[0];
    const port = array[1] ? array[1] : this.config.alarm_https === true ? 443 : 80;
    return { hostname, port, https: this.config.alarm_https };
  }
  /**
   * checks if alam system is reachable
   *
   * @returns true or false
   */
  async isAlarmSystemReachable() {
    const server = this.getHostnameAndPort();
    const isAlive = await import_tools.Tools.probe(server.hostname, server.port);
    return isAlive;
  }
  /**
   * Online-Check via TCP ping (when using CoAP)
   */
  async startOnlineCheck() {
    try {
      const server = this.getHostnameAndPort();
      const isAlive = await this.isAlarmSystemReachable();
      if (isAlive === true) {
        this.onlineCheckAvailable === false ? this.log.info(`Could reach alarm system with hostname ${server.hostname} on port ${server.port}.`) : this.log.debug(
          `Could reach alarm system with hostname ${server.hostname} on port ${server.port}.`
        );
        await this.startLupuscecAdapter();
      } else {
        this.log.error(
          `Could not reach alarm system with hostname  ${server.hostname} on port ${server.port}.`
        );
        await this.stopLupusecAdapter();
      }
      this.onlineCheckAvailable = isAlive;
    } catch (error) {
      this.log.error(`Error in periodical online check (${error.toString()})`);
    }
    this.onlineCheckTimeout = this.setTimeout(async () => await this.startOnlineCheck(), 10 * 1e3);
  }
  /**
   * Stops the continously online check
   */
  stopOnlineCheck() {
    if (this.onlineCheckTimeout) {
      this.clearTimeout(this.onlineCheckTimeout);
      this.onlineCheckTimeout = void 0;
    }
  }
  /**
   * Starts the polling of the states from the Lupusec alarm system.
   */
  async startLupuscecAdapter() {
    const lupusec = await import_lupusec.Lupus.getInstance(this);
    await lupusec.startallproc();
    await this.setStateAsync("info.connection", { val: true, ack: true });
  }
  /**
   * Stops polling the states from the Lupusec alarm system
   */
  async stopLupusecAdapter() {
    const lupusec = await import_lupusec.Lupus.getInstance(this);
    lupusec.stopallproc();
    await this.setStateAsync("info.connection", { val: false, ack: true });
  }
}
if (require.main !== module) {
  module.exports = (options) => new Lupusec(options);
} else {
  (() => new Lupusec())();
}
//# sourceMappingURL=main.js.map

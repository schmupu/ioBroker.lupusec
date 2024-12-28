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
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var tools_exports = {};
__export(tools_exports, {
  Tools: () => Tools
});
module.exports = __toCommonJS(tools_exports);
var import_dns = require("dns");
var import_lodash = __toESM(require("lodash"));
var tcpPing = __toESM(require("tcp-ping"));
class Tools {
  /**
   * round(2.74, 0.1) = 2.7
   * round(2.74, 0.25) = 2.75
   * round(2.74, 0.5) = 2.5
   * round(2.74, 1.0) = 3.0
   * @param value a number like 2.7, 2.75
   * @param step a number like 0.1, or 2.7
   * @returns a number
   */
  static round(value, step) {
    step || (step = 1);
    const inv = 1 / step;
    return Math.round(value * inv) / inv;
  }
  /**
   * Checking if key exist in object
   * @param obj {a:1, b:1, c:1}
   * @param key 'b'
   * @returns true or false
   */
  static hasProperty(obj, key) {
    try {
      return obj && key in obj ? true : false;
    } catch (error) {
      return false;
    }
  }
  /**
   * Wait (sleep) x seconds
   * @param seconds time in seconds
   * @returns
   */
  static wait(seconds) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1e3));
  }
  /**
   *
   * @param hostname string like www.google.de, test.foo.local:80 or 192.168.20.20:80
   * @returns the hostname and port.
   */
  static getHostnamePort(hostname) {
    const array = hostname.split(":");
    return {
      hostname: typeof array[0] !== "undefined" ? array[0] : "",
      port: typeof array[1] !== "undefined" ? Number(array[1]) : void 0
    };
  }
  /**
   *
   * @param hostname like www.google.com
   * @returns
   */
  static async lookup(hostname) {
    const hp = this.getHostnamePort(hostname);
    const dns = await import_dns.promises.lookup(hp.hostname);
    let address = dns && dns.address ? dns.address : hp.hostname;
    if (hp.port !== void 0)
      address = `${address}:${hp.port}`;
    return address;
  }
  /**
   * Checks if server (webserver) is reachable
   * @param hostname hostname or ip address. For example huhu.foo or 192.168.20.30)
   * @param portport, for example (80, 8080, ...
   * @returns
   */
  static async probe(hostname, port) {
    hostname = await this.lookup(hostname);
    return new Promise((resolve) => {
      tcpPing.probe(hostname, port, async (error, isAlive) => {
        resolve(isAlive);
      });
    });
  }
  /**
   * deletes special characteres
   * @param text : text
   * @returns text without special characters
   */
  static delSonderzeichen(text) {
    if (text) {
      text = text.replace(/\r/g, "");
      text = text.replace(/\n/g, "");
      text = text.replace(/\t/g, " ");
      text = text.replace(/\f/g, "");
    }
    return text;
  }
  /**
   * deletes special characteres in text (must be a stringyfy object) and returns as object if possible
   * @text text (stringify object)
   * @returns text if possible
   */
  static JsonParseDelSonderszeichen(text) {
    try {
      return typeof text === "string" ? JSON.parse(this.delSonderzeichen(text)) : text;
    } catch (error) {
      return text;
    }
  }
  /**
   * checks if two objects equal
   * @param obj1 object 1
   * @param obj2  object 2
   * @returns objects equal, true or false
   */
  static isEqual(obj1, obj2) {
    if (typeof obj1 === "object" && typeof obj2 === "object")
      return import_lodash.default.isEqual(obj1, obj2);
    return obj1 === obj2;
  }
  /**
   * if function / method is a async function / method
   * @param funct function
   * @returns function is async
   */
  static isAsync(funct) {
    if (funct && funct.constructor)
      return funct.constructor.name == "AsyncFunction";
    return false;
  }
  /**
   * Get datatype of value
   * @param {any} value : value
   * @returns {string} : datatype of value (object, array, boolean)
   */
  static getPropertyType(value) {
    let type;
    switch (Object.prototype.toString.call(value)) {
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
        type = "";
        break;
    }
    return type;
  }
  /**
   * Converts the value to given type. Example value to string, number, ...
   * @param {*} value : any type of value
   * @param {string} type :   datatype for converting the value
   * @returns
   */
  static convertPropertyType(value, type) {
    if (value === null || value === void 0)
      return value;
    let valuenew = value;
    switch (type) {
      case "number":
        valuenew = Number(value);
        break;
      case "string":
        valuenew = value.toString();
        break;
      case "boolean":
        valuenew = Boolean(Number(value));
        break;
      case "object":
        valuenew = "{" + value.toString() + "}";
        break;
      case "array":
        valuenew = "[" + value.toString() + "]";
        break;
      default:
        valuenew = value;
        break;
    }
    return valuenew;
  }
  static copyObject(object) {
    if (object && typeof object === "object") {
      return import_lodash.default.cloneDeep(object);
    } else {
      return object;
    }
  }
  static mergeObject(object1, object2) {
    return import_lodash.default.merge(object1, object2);
  }
  /**
   * gets acutal time
   */
  static getUnixTimestampNow() {
    return Math.ceil((/* @__PURE__ */ new Date()).getTime());
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Tools
});
//# sourceMappingURL=tools.js.map

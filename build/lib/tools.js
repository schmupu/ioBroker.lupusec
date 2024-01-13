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
var tools_exports = {};
__export(tools_exports, {
  JsonParseDelSonderszeichen: () => JsonParseDelSonderszeichen,
  convertPropertyType: () => convertPropertyType,
  copyObject: () => copyObject,
  delSonderzeichen: () => delSonderzeichen,
  getHostnamePort: () => getHostnamePort,
  getPropertyType: () => getPropertyType,
  getUnixTimestampNow: () => getUnixTimestampNow,
  hasProperty: () => hasProperty,
  isAsync: () => isAsync,
  isEqual: () => isEqual,
  lookup: () => lookup,
  mergeObject: () => mergeObject,
  probe: () => probe,
  round: () => round,
  wait: () => wait
});
module.exports = __toCommonJS(tools_exports);
var import_dns = require("dns");
var import_lodash = __toESM(require("lodash"));
var tcpPing = __toESM(require("tcp-ping"));
function round(value, step) {
  step || (step = 1);
  const inv = 1 / step;
  return Math.round(value * inv) / inv;
}
function hasProperty(obj, key) {
  try {
    return obj && key in obj ? true : false;
  } catch (error) {
    return false;
  }
}
function wait(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1e3));
}
function getHostnamePort(hostname) {
  const array = hostname.split(":");
  return {
    hostname: typeof array[0] !== "undefined" ? array[0] : "",
    port: typeof array[1] !== "undefined" ? Number(array[1]) : void 0
  };
}
async function lookup(hostname) {
  const hp = getHostnamePort(hostname);
  const dns = await import_dns.promises.lookup(hp.hostname);
  let address = dns && dns.address ? dns.address : hp.hostname;
  if (hp.port !== void 0)
    address = `${address}:${hp.port}`;
  return address;
}
async function probe(hostname, port) {
  hostname = await lookup(hostname);
  return new Promise((resolve) => {
    tcpPing.probe(hostname, port, async (error, isAlive) => {
      resolve(isAlive);
    });
  });
}
function delSonderzeichen(text) {
  if (text) {
    text = text.replace(/\r/g, "");
    text = text.replace(/\n/g, "");
    text = text.replace(/\t/g, " ");
    text = text.replace(/\f/g, "");
  }
  return text;
}
function JsonParseDelSonderszeichen(text) {
  try {
    return typeof text === "string" ? JSON.parse(delSonderzeichen(text)) : text;
  } catch (error) {
    return text;
  }
}
function isEqual(obj1, obj2) {
  if (typeof obj1 === "object" && typeof obj2 === "object")
    return import_lodash.default.isEqual(obj1, obj2);
  return obj1 === obj2;
}
function isAsync(funct) {
  if (funct && funct.constructor)
    return funct.constructor.name == "AsyncFunction";
  return false;
}
function getPropertyType(value) {
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
function convertPropertyType(value, type) {
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
function copyObject(object) {
  if (object && typeof object === "object") {
    return import_lodash.default.cloneDeep(object);
  } else {
    return object;
  }
}
function mergeObject(object1, object2) {
  return import_lodash.default.merge(object1, object2);
}
function getUnixTimestampNow() {
  return Math.ceil(new Date().getTime());
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  JsonParseDelSonderszeichen,
  convertPropertyType,
  copyObject,
  delSonderzeichen,
  getHostnamePort,
  getPropertyType,
  getUnixTimestampNow,
  hasProperty,
  isAsync,
  isEqual,
  lookup,
  mergeObject,
  probe,
  round,
  wait
});
//# sourceMappingURL=tools.js.map

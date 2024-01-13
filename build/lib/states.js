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
var states_exports = {};
__export(states_exports, {
  States: () => States
});
module.exports = __toCommonJS(states_exports);
var tools = __toESM(require("./tools"));
class States {
  adapter;
  states;
  language;
  objects;
  abort;
  saveobjects;
  savestates;
  constructor(adapter, language) {
    this.adapter = adapter;
    this.language = language || "en";
    this.states = {};
    this.objects = {};
    this.saveobjects = false;
    this.savestates = false;
    this.abort = adapter.config.alarm_polltime * 1e3 / 2;
  }
  async initStatesAllAsync() {
    this.states = {};
    const states = await this.adapter.getStatesAsync(`${this.adapter.namespace}.*`);
    for (const id in states) {
      const idnew = id.replace(`${this.adapter.namespace}.`, "");
      const val = tools.hasProperty(states[id], "val") ? states[id].val : null;
      const ack = tools.hasProperty(states[id], "ack") ? states[id].ack : false;
      delete states[id];
      states[idnew] = {
        val,
        ack
      };
      if (this.savestates)
        this.states[idnew] = states[idnew];
    }
  }
  async getStateAsync(id) {
    if (id) {
      id = id.replace(`${this.adapter.namespace}.`, "");
      if (this.savestates) {
        return this.states[id] ? this.states[id] : void 0;
      } else {
        const state = await this.adapter.getStateAsync(id);
        return state ? { val: state.val, ack: state.ack } : void 0;
      }
    }
    return void 0;
  }
  async getStatesAllAsync(pattern) {
    if (!this.states) {
      return this.states;
    } else {
      if (!pattern)
        pattern = "*";
      const states = await this.adapter.getStatesAsync(`${this.adapter.namespace}.${pattern}`);
      for (const id in states) {
        const idnew = id.replace(`${this.adapter.namespace}.`, "");
        const val = tools.hasProperty(states[id], "val") ? states[id].val : null;
        const ack = tools.hasProperty(states[id], "ack") ? states[id].ack : false;
        delete states[id];
        states[idnew] = {
          val,
          ack
        };
      }
      return states;
    }
  }
  async setStateNotExistsAsync(id, object) {
    if (id)
      id = id.replace(`${this.adapter.namespace}.`, "");
    if (object) {
      const stateold = await this.getStateAsync(id);
      if (!stateold || stateold.val !== object.val || stateold.ack !== object.ack) {
        return await this.setStateAsync(id, object);
      }
    }
    return void 0;
  }
  async setStateAsync(id, object) {
    if (id) {
      const val = tools.hasProperty(object, "val") ? object.val : null;
      const ack = tools.hasProperty(object, "ack") ? object.ack : false;
      id = id.replace(`${this.adapter.namespace}.`, "");
      if (this.savestates)
        this.states[id] = { val, ack };
      return await this.adapter.setStateAsync(id, { val, ack });
    }
    return void 0;
  }
  async delStateAsync(id) {
    if (id)
      id = id.replace(`${this.adapter.namespace}.`, "");
    if (this.states[id]) {
      delete this.states[id];
    }
    const state = await this.adapter.getStateAsync(id);
    if (state) {
      await this.adapter.delStateAsync(id);
    }
  }
  async initObjectsAllAsync() {
    this.objects = {};
    const objects = await this.adapter.getAdapterObjectsAsync();
    for (const id in objects) {
      const val = objects[id];
      const idnew = id.replace(`${this.adapter.namespace}.`, "");
      delete objects[id];
      objects[idnew] = val;
      if (this.saveobjects)
        this.objects[idnew] = objects[idnew];
    }
    return objects;
  }
  async getObjectAsync(id) {
    if (id) {
      id = id.replace(`${this.adapter.namespace}.`, "");
      if (this.saveobjects) {
        return this.objects[id] ? this.objects[id] : {};
      } else {
        const object = await this.adapter.getObjectAsync(id);
        return object ? object : {};
      }
    }
    return {};
  }
  async getObjectsAllAsync() {
    if (this.objects) {
      return this.objects;
    } else {
      const objects = await this.adapter.getAdapterObjectsAsync();
      for (const id in objects) {
        const object = objects[id];
        const idnew = id.replace(`${this.adapter.namespace}.`, "");
        delete objects[id];
        objects[idnew] = object;
      }
      return objects;
    }
  }
  async setObjectNotExistsAsync(id, object, options) {
    var _a, _b;
    if (id)
      id = id.replace(`${this.adapter.namespace}.`, "");
    if (((_a = object == null ? void 0 : object.common) == null ? void 0 : _a.name) || ((_b = object == null ? void 0 : object.common) == null ? void 0 : _b.states)) {
      const objectold = await this.getObjectAsync(id);
      if (!objectold || !tools.hasProperty(objectold, "common") || !tools.hasProperty(objectold.common, "name") || !tools.isEqual(objectold.common.name, object.common.name) || !tools.isEqual(objectold.common.states, object.common.states)) {
        return await this.setObjectAsync(id, object, options);
      }
    }
    return void 0;
  }
  async setObjectAsync(id, object, options) {
    if (id) {
      id = id.replace(`${this.adapter.namespace}.`, "");
      if (this.saveobjects)
        this.objects[id] = object;
      return await this.adapter.setObjectAsync(id, object, options);
    }
    return void 0;
  }
  async delObjectAsync(id) {
    if (id)
      id = id.replace(`${this.adapter.namespace}.`, "");
    if (this.objects[id]) {
      delete this.states[id];
    }
    const object = await this.adapter.getObjectAsync(id);
    if (object) {
      await this.adapter.delObjectAsync(id);
    }
    await this.delStateAsync(id);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  States
});
//# sourceMappingURL=states.js.map

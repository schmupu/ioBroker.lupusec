"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var states_exports = {};
__export(states_exports, {
  States: () => States
});
module.exports = __toCommonJS(states_exports);
var import_tools = require("./tools");
class States {
  adapter;
  states;
  language;
  objects;
  abort;
  saveobjects;
  savestates;
  /**
   *
   * @param adapter ioBroker Adapter
   * @param language Language like de, en
   * @param save state an objects changes saved in internal table
   */
  constructor(adapter, language, save = false) {
    this.adapter = adapter;
    this.language = language || "en";
    this.states = {};
    this.objects = {};
    this.saveobjects = save;
    this.savestates = save;
    this.abort = adapter.config.alarm_polltime * 1e3 / 2;
  }
  /**
   * Reads all states for adapter from ioBroker
   */
  async initStatesAllAsync() {
    this.states = {};
    const states = await this.adapter.getStatesAsync(`${this.adapter.namespace}.*`);
    for (const id in states) {
      const idnew = id.replace(`${this.adapter.namespace}.`, "");
      const val = import_tools.Tools.hasProperty(states[id], "val") ? states[id].val : null;
      const ack = import_tools.Tools.hasProperty(states[id], "ack") ? states[id].ack : false;
      delete states[id];
      states[idnew] = {
        val,
        ack
      };
      if (this.savestates) {
        this.states[idnew] = states[idnew];
      }
    }
  }
  /**
   * Get State by id
   *
   * @param id id of state
   * @returns returns value und ack from state
   */
  async getStateAsync(id) {
    if (id) {
      id = id.replace(`${this.adapter.namespace}.`, "");
      if (this.savestates) {
        return this.states[id] ? this.states[id] : void 0;
      }
      const state = await this.adapter.getStateAsync(id);
      return state ? { val: state.val, ack: state.ack } : void 0;
    }
    return void 0;
  }
  /**
   *
   * @param pattern like devices.*.type. If empty pattern = *
   * @returns all states for pattern
   */
  async getStatesAllAsync(pattern) {
    if (!this.states) {
      return this.states;
    }
    if (!pattern) {
      pattern = "*";
    }
    const states = await this.adapter.getStatesAsync(`${this.adapter.namespace}.${pattern}`);
    for (const id in states) {
      const idnew = id.replace(`${this.adapter.namespace}.`, "");
      const val = import_tools.Tools.hasProperty(states[id], "val") ? states[id].val : null;
      const ack = import_tools.Tools.hasProperty(states[id], "ack") ? states[id].ack : false;
      delete states[id];
      states[idnew] = {
        val,
        ack
      };
    }
    return states;
  }
  /**
   * Set State by id, only if state changed (ack or val)
   *
   * @param id id to state
   * @param object object with keys val and ack { val: 'value', ack: true/false }
   * @returns if state changed, you get back the id else undefined
   */
  async setStateNotExistsAsync(id, object) {
    if (id) {
      id = id.replace(`${this.adapter.namespace}.`, "");
    }
    if (object) {
      const stateold = await this.getStateAsync(id);
      if (!stateold || stateold.val !== object.val || stateold.ack !== object.ack) {
        return await this.setStateAsync(id, object);
      }
    }
    return void 0;
  }
  /**
   * Set State by id
   *
   * @param id id to state
   * @param object object with keys val and ack { val: 'value', ack: true/false }
   * @returns if state changed, you get back the id, else undefined
   */
  async setStateAsync(id, object) {
    if (id) {
      const val = import_tools.Tools.hasProperty(object, "val") ? object.val : null;
      const ack = import_tools.Tools.hasProperty(object, "ack") ? object.ack : false;
      id = id.replace(`${this.adapter.namespace}.`, "");
      if (this.savestates) {
        this.states[id] = { val, ack };
      }
      return await this.adapter.setStateAsync(id, { val, ack });
    }
    return void 0;
  }
  /**
   * Delete a state by id
   *
   * @param id id to state
   * @returns if state deleted, you get back true else false
   */
  async delStateAsync(id) {
    if (id) {
      id = id.replace(`${this.adapter.namespace}.`, "");
    }
    if (this.states[id]) {
      delete this.states[id];
    }
    const state = await this.adapter.getStateAsync(id);
    if (state) {
      await this.adapter.delStateAsync(id);
    }
  }
  /**
   * Reads all objects for an adapter
   *
   * @returns returns all objects
   */
  async initObjectsAllAsync() {
    this.objects = {};
    const objects = await this.adapter.getAdapterObjectsAsync();
    for (const id in objects) {
      const val = objects[id];
      const idnew = id.replace(`${this.adapter.namespace}.`, "");
      delete objects[id];
      objects[idnew] = val;
      if (this.saveobjects) {
        this.objects[idnew] = objects[idnew];
      }
    }
    return objects;
  }
  /**
   * Get State by id
   *
   * @param id id to state
   * @returns returns value und ack from state
   */
  async getObjectAsync(id) {
    if (id) {
      id = id.replace(`${this.adapter.namespace}.`, "");
      if (this.saveobjects) {
        return this.objects[id] ? this.objects[id] : {};
      }
      const object = await this.adapter.getObjectAsync(id);
      return object ? object : {};
    }
    return {};
  }
  /**
   * reads all objects
   *
   * @returns : return all objects
   */
  async getObjectsAllAsync() {
    if (!import_tools.Tools.isEmpty(this.objects)) {
      return this.objects;
    }
    const objects = await this.adapter.getAdapterObjectsAsync();
    for (const id in objects) {
      const object = objects[id];
      const idnew = id.replace(`${this.adapter.namespace}.`, "");
      delete objects[id];
      objects[idnew] = object;
    }
    return objects;
  }
  /**
   * reads all objects
   *
   * @param idChannel channel like devices.NK:23423
   * @returns : return all objects
   */
  async getObjectsByChannelAsync(idChannel) {
    const objects = await this.getObjectsAllAsync();
    const objectschannels = {};
    for (const id in objects) {
      if (id.startsWith(idChannel)) {
        objectschannels[id] = objects[id];
      }
    }
    return objectschannels;
  }
  /**
   * Sets for an id the object data
   *
   * @param id state id
   * @param object object
   * @param options (optional)
   * @returns returns id if changed, else undefined
   */
  async setObjectNotExistsAsync(id, object, options) {
    var _a, _b;
    if (id) {
      id = id.replace(`${this.adapter.namespace}.`, "");
    }
    if (((_a = object == null ? void 0 : object.common) == null ? void 0 : _a.name) || ((_b = object == null ? void 0 : object.common) == null ? void 0 : _b.states)) {
      const objectold = await this.getObjectAsync(id);
      if (!objectold || !import_tools.Tools.hasProperty(objectold, "common") || !import_tools.Tools.hasProperty(objectold.common, "name") || !import_tools.Tools.isEqual(objectold.common.name, object.common.name) || !import_tools.Tools.isEqual(objectold.common.states, object.common.states) || !import_tools.Tools.isEqual(objectold.common.statusStates, object.common.statusStates)) {
        return await this.setObjectAsync(id, object, options);
      }
    }
    return void 0;
  }
  /**
   *
   * @param id id of object
   * @param object object payload
   * @param options option (optional)
   * @returns return result of setObjectAsync
   */
  async setObjectAsync(id, object, options) {
    if (id) {
      id = id.replace(`${this.adapter.namespace}.`, "");
      if (this.saveobjects) {
        this.objects[id] = object;
      }
      return await this.adapter.setObjectAsync(id, object, options);
    }
    return void 0;
  }
  /**
   *
   * @param id id of object
   */
  async delObjectAsync(id) {
    if (id) {
      id = id.replace(`${this.adapter.namespace}.`, "");
    }
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

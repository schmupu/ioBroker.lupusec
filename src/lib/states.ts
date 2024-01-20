import { Tools } from './tools';

export interface ifState {
    val: any;
    ack: boolean;
}

export interface ifStates {
    [index: string]: ifState;
}

export interface ifObjects {
    [index: string]: any;
}

/**
 * Verwaltung von States
 */
export class States {
    adapter: any;
    states: ifStates;
    language: string;
    objects: ifObjects;
    abort: number;
    saveobjects: boolean;
    savestates: boolean;

    /**
     *
     * @param adapter ioBroker Adapter
     * @param language Language like de, en
     * @param save state an objects changes saved in internal table
     */
    constructor(adapter: any, language?: string, save: boolean = false) {
        this.adapter = adapter;
        this.language = language || 'en';
        this.states = {};
        this.objects = {};
        this.saveobjects = save;
        this.savestates = save;
        this.abort = (adapter.config.alarm_polltime * 1000) / 2;
    }

    /**
     * Reads all states for adapter from ioBroker
     */
    public async initStatesAllAsync(): Promise<void> {
        this.states = {};
        const states = await this.adapter.getStatesAsync(`${this.adapter.namespace}.*`);
        for (const id in states) {
            const idnew = id.replace(`${this.adapter.namespace}.`, '');
            const val = Tools.hasProperty(states[id], 'val') ? states[id].val : null;
            const ack = Tools.hasProperty(states[id], 'ack') ? states[id].ack : false;
            delete states[id];
            states[idnew] = {
                val: val,
                ack: ack,
            };
            if (this.savestates) this.states[idnew] = states[idnew];
        }
    }

    /**
     * Get State by id
     * @param id id of state
     * @returns returns value und ack from state
     */
    public async getStateAsync(id: string): Promise<ifState | undefined> {
        if (id) {
            id = id.replace(`${this.adapter.namespace}.`, '');
            if (this.savestates) {
                return this.states[id] ? this.states[id] : undefined;
            } else {
                const state = await this.adapter.getStateAsync(id);
                return state ? ({ val: state.val, ack: state.ack } as ifState) : undefined;
            }
        }
        return undefined;
    }

    /**
     *
     * @param pattern like devices.*.type. If empty pattern = *
     * @returns all states for pattern
     */
    public async getStatesAllAsync(pattern?: string): Promise<ifStates> {
        if (!this.states) {
            return this.states;
        } else {
            if (!pattern) pattern = '*';
            const states = await this.adapter.getStatesAsync(`${this.adapter.namespace}.${pattern}`);
            for (const id in states) {
                const idnew = id.replace(`${this.adapter.namespace}.`, '');
                const val = Tools.hasProperty(states[id], 'val') ? states[id].val : null;
                const ack = Tools.hasProperty(states[id], 'ack') ? states[id].ack : false;
                delete states[id];
                states[idnew] = {
                    val: val,
                    ack: ack,
                };
            }
            return states;
        }
    }

    /**
     * Set State by id, only if state changed (ack or val)
     * @param id id to state
     * @param object object with keys val and ack { val: 'value', ack: true/false }
     * @returns if state changed, you get back the id else undefined
     */
    public async setStateNotExistsAsync(id: string, object: any): Promise<any> {
        if (id) id = id.replace(`${this.adapter.namespace}.`, '');
        if (object) {
            const stateold = await this.getStateAsync(id);
            if (!stateold || stateold.val !== object.val || stateold.ack !== object.ack) {
                return await this.setStateAsync(id, object);
            }
        }
        return undefined;
    }

    /**
     * Set State by id
     * @param id id to state
     * @param object object with keys val and ack { val: 'value', ack: true/false }
     * @returns if state changed, you get back the id, else undefined
     */
    public async setStateAsync(id: string, object: any): Promise<any> {
        if (id) {
            const val = Tools.hasProperty(object, 'val') ? object.val : null;
            const ack = Tools.hasProperty(object, 'ack') ? object.ack : false;
            id = id.replace(`${this.adapter.namespace}.`, '');
            if (this.savestates) this.states[id] = { val: val, ack: ack };
            return await this.adapter.setStateAsync(id, { val: val, ack: ack });
        }
        return undefined;
    }

    /**
     * Delete a state by id
     * @param id id to state
     * @returns if state deleted, you get back true else false
     */
    public async delStateAsync(id: string): Promise<void> {
        if (id) id = id.replace(`${this.adapter.namespace}.`, '');
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
     * @returns returns all objects
     */
    public async initObjectsAllAsync(): Promise<ifObjects> {
        this.objects = {};
        const objects = await this.adapter.getAdapterObjectsAsync();
        for (const id in objects) {
            const val = objects[id];
            const idnew = id.replace(`${this.adapter.namespace}.`, '');
            delete objects[id];
            objects[idnew] = val;
            if (this.saveobjects) this.objects[idnew] = objects[idnew];
        }
        return objects;
    }

    /**
     * Get State by id
     * @param id id to state
     * @returns returns value und ack from state
     */
    public async getObjectAsync(id: string): Promise<any> {
        if (id) {
            id = id.replace(`${this.adapter.namespace}.`, '');
            if (this.saveobjects) {
                return this.objects[id] ? this.objects[id] : {};
            } else {
                const object = await this.adapter.getObjectAsync(id);
                return object ? object : {};
            }
        }
        return {};
    }

    /**
     * reads all objects
     * @returns {Promise<object>} : return all objects
     */
    public async getObjectsAllAsync(): Promise<ifObjects> {
        if (this.objects) {
            return this.objects;
        } else {
            const objects = await this.adapter.getAdapterObjectsAsync();
            for (const id in objects) {
                const object = objects[id];
                const idnew = id.replace(`${this.adapter.namespace}.`, '');
                delete objects[id];
                objects[idnew] = object;
            }
            return objects;
        }
    }

    /**
     * Sets for an id the object data
     * @param id state id
     * @param parameter like name
     * @param options (optional)
     * @returns returns id if changed, else undefined
     */
    public async setObjectNotExistsAsync(id: string, object: any, options?: object): Promise<any> {
        if (id) id = id.replace(`${this.adapter.namespace}.`, '');
        if (object?.common?.name || object?.common?.states) {
            const objectold = await this.getObjectAsync(id);
            if (
                !objectold ||
                !Tools.hasProperty(objectold, 'common') ||
                !Tools.hasProperty(objectold.common, 'name') ||
                !Tools.isEqual(objectold.common.name, object.common.name) ||
                !Tools.isEqual(objectold.common.states, object.common.states) ||
                !Tools.isEqual(objectold.common.statusStates, object.common.statusStates)
            ) {
                return await this.setObjectAsync(id, object, options);
            }
        }
        return undefined;
    }

    /**
     *
     * @param id id of object
     * @param object object payload
     * @param options option (optional)
     * @returns
     */
    public async setObjectAsync(id: string, object: any, options?: object): Promise<any> {
        if (id) {
            id = id.replace(`${this.adapter.namespace}.`, '');
            if (this.saveobjects) this.objects[id] = object;
            return await this.adapter.setObjectAsync(id, object, options);
        }
        return undefined;
    }

    /**
     *
     * @param id id of object
     */
    public async delObjectAsync(id: string): Promise<void> {
        if (id) id = id.replace(`${this.adapter.namespace}.`, '');
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

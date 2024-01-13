import axios from 'axios';
import http from 'http';
import https from 'https';
import querystring from 'querystring';
import * as datapoints from './datapoints';
import * as so from './states';
import * as tools from './tools';
import * as wc from './webcam';

const urlTokenGet = '/action/tokenGet';
const urlLogoutPost = '/action/logout';
const urlDeviceListGet = '/action/deviceListGet';
const urlDevicePSSListGet = '/action/deviceListPSSGet';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const urlDeviceGet = '/action/deviceGet';
const urlPanelCondGet = '/action/panelCondGet';
const urlPanelCondPost = '/action/panelCondPost';
const urlDeviceSwitchPSSPost = '/action/deviceSwitchPSSPost';
const urlHaExecutePost = '/action/haExecutePost';
const urlDeviceEditGet = '/action/deviceEditGet';
const urlDeviceEditPost = '/action/deviceEditPost';
const urlDeviceSwitchDimmerPost = '/action/deviceSwitchDimmerPost';
const urlDeviceHueColorControl = '/action/deviceHueColorControl';
const urlDeviceEditThermoPost = '/action/deviceEditThermoPost';
const urlDeviceEditThermoGet = '/action/deviceEditThermoGet';
const urlDeviceEditShutterPost = '/action/deviceEditShutterPost';
const urlDeviceEditShutterGet = '/action/deviceEditShutterGet';
const urlDeviceEditMeterGet = '/action/deviceEditMeterGet';
const urlDeviceEditMeterPost = '/action/deviceEditMeterPost';
const urlDeviceNukiCmd = '/action/nukiCmd';
const urlIpcamGet = '/action/ipcamGet';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const urlPasthru = '/action/passthru';
const urlDeviceListUPICGet = '/action/deviceListUPICGet';
const urlDeviceDoUPICPost = '/action/deviceDoUPICPost';
const urlSendSMSPost = '/action/sendSMSPost';
const urlSmsgwTestPost = '/action/smsgwTestPost';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const urlSystemGet = '/action/systemGet';
const urlLogsGet = '/action/logsGet';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const urlrecordListGet = '/action/recordListGet';
const urlNukiGet = '/action/nukiGet';

interface ifDeviceId {
    id: string;
    type: number;
}

/**
 * Lupsec Class (alarmsystem)
 */
export class Lupusec {
    private adapter: any;
    private unixtime: { [index: string]: number };
    private run: { [index: string]: ioBroker.Timeout };
    private language: string;
    private states: so.States;
    private timerhandle: { [index: string]: ioBroker.Timeout | undefined };
    private static instance: Lupusec;
    private static uniqueid: number;
    private cpu: any;
    private auth: string;
    private token: string;
    private axiostimeout: number;
    private httpsagent: https.Agent;
    private httpagent: http.Agent;
    private axiosinstance: axios.AxiosInstance;
    /**
     * Contructor - Use insteed singelton method getInstance
     * @param adapter ioBroker adapter instance
     * @param language language for state names (de, en, ..)
     */
    private constructor(adapter: any, language?: string) {
        this.adapter = adapter;
        this.unixtime = {};
        this.run = {};
        this.language = language || 'en';
        this.states = new so.States(adapter, language);
        this.timerhandle = {};
        this.auth =
            'Basic ' +
            Buffer.from(this.adapter.config.alarm_user + ':' + this.adapter.config.alarm_password).toString('base64');
        this.httpsagent = new https.Agent({
            rejectUnauthorized: false,
            keepAlive: true,
            maxSockets: 1,
        });
        this.httpagent = new http.Agent({
            keepAlive: true,
            maxSockets: 1,
        });
        this.token = '';
        this.axiostimeout = 15 * 1000; // this.adapter.config.alarm_polltime * 1000
        this.axiosinstance = axios.create();
        this.adapter.log.debug(`New instance of Lupusec created!`);
    }

    /**
     * Singelton - get Lupusec class instance
     * @param adapter ioBroker adapter instance
     * @returns Instane of Lupusec class
     */
    public static async getInstance(adapter: any): Promise<Lupusec> {
        if (!this.instance) {
            const obj = await adapter.getForeignObjectAsync('system.config');
            const language = (obj?.common?.language || 'en').toLowerCase();
            this.uniqueid = tools.getUnixTimestampNow();
            this.instance = new Lupusec(adapter, language);
            await this.instance.states.initObjectsAllAsync();
            await this.instance.states.initStatesAllAsync();
        }
        return this.instance;
    }

    /**
     * unique identifier
     * @returns unique identifier
     */
    private static getUniqueId(): number {
        return this.uniqueid;
    }

    /**
     * starting a prozess every x seconds
     * @param id unique name  / key of the process
     * @param seconds process restarting after x seconds
     * @param callback function to start (function can be async)
     */
    private async startproc(id: string, seconds: number, callback: () => void): Promise<void> {
        if (callback) {
            try {
                this.adapter.log.debug(`Starting polling with process ${id}, callback ${callback}`);
                tools.isAsync(callback) ? await callback() : callback();
                this.adapter.log.debug(`Stoping polling with process ${id}, callback ${callback} `);
            } catch (error: any) {
                const message = error?.response?.data || error.toString() || 'not known';
                this.adapter.log.error(`Error: ${message} for process ${id}`);
                if (error?.stack) this.adapter.log.debug(`Error: ${error.stack.toString()} for process ${id}`);
            }
        }
        if (this.run[id]) this.adapter.clearTimeout(this.run[id]);
        this.run[id] = this.adapter.setTimeout(async () => await this.startproc(id, seconds, callback), seconds * 1000);
    }

    /**
     * stopping process by id
     * @param id unique name  / key of the process
     */
    private async stopproc(id: string): Promise<void> {
        if (this.run[id]) {
            this.adapter.log.debug(`Canceling process with id ${id}`);
            this.adapter.clearTimeout(this.run[id]);
            delete this.run[id];
        }
    }

    /**
     * does process with id exist
     * @param id unique name  / key of the process
     * @returns exist true/false
     */
    private exsitproc(id: string): boolean {
        return this.run[id] ? true : false;
    }

    /**
     * set process with value
     * @param id unique name  / key of the process
     * @param val value is timmer of setTimeout
     */
    private setproc(id: string, val: ioBroker.Timeout): void {
        this.run[id] = val;
    }

    /**
     * List of all processes to start
     */
    public async startallproc(): Promise<void> {
        this.adapter.log.debug(`Starting Lupsuec polling process`);
        const seconds = this.adapter.config.alarm_polltime;
        if (!this.exsitproc('Init')) {
            await this.initObjects();
            await this.requestToken(true);
            this.setproc('Init', 1 as ioBroker.Timeout);
        }
        if (!this.exsitproc('Status')) {
            await this.startproc('Status', seconds > 1 ? seconds : 1, async () => {
                await this.getAllStatusLupusecEntries();
            });
        }
        if (!this.exsitproc('Devices')) {
            await this.startproc('Devices', seconds > 1 ? seconds : 1, async () => {
                await this.getAllDeviceLupusec();
            });
        }
        /*
        if (!this.exsitproc('DevicesEntries')) {
            await this.startproc('DevicesEntries', seconds > 1 ? seconds : 1, async () => {
                await this.getAllDeviceLupusecEntries();
            });
        }
        if (!this.exsitproc('DevicesEntriesExtended')) {
            await this.startproc('DevicesEntriesExtended', seconds > 5 ? seconds : 5, async () => {
                await this.getAllDeviceLupusecEditEntries();
                await this.getAllDeviceLupusecLogs();
            });
        }
        */
        if (this.adapter.config.webcam_providing && !this.exsitproc('Webcamsms')) {
            await this.startproc('Webcamsms', seconds > 10 ? seconds : 10, async () => {
                await this.getAllWebcamLupusecEntries();
                await this.getAllSMSLupusecEntries();
            });
        }
        /*
        if (!this.exsitproc('DebugInfos')) {
            await this.startproc('DebugInfos', 15, async () => {
                await this.debugInfos();
            });
        }
        */
    }

    /**
     * Some debug Infos
     */
    private async debugInfos(): Promise<void> {
        this.adapter.log.debug(`Array Unixtime: ${Object.keys(this.unixtime).length}`);
        this.adapter.log.debug(`Array Run: ${Object.keys(this.run).length}`);
        this.adapter.log.debug(`Array Timerhandle: ${Object.keys(this.timerhandle).length}`);
        this.adapter.log.debug(`Array internal States: ${Object.keys(await this.states.getStatesAllAsync()).length}`);
        this.adapter.log.debug(`Array internal Objects: ${Object.keys(await this.states.getObjectsAllAsync()).length}`);
        this.adapter.log.debug(`Unique Id: ${Lupusec.getUniqueId()}`);
        const memory = process.memoryUsage() as any;
        this.cpu = process.cpuUsage(this.cpu);
        // this.adapter.log.info(`Process Meomory: ${tools.delSonderzeichen(util.inspect(memory))}`);
        for (const i in memory) {
            memory[i] = `${(((Math.round(memory[i]) / 1024 / 1024) * 100) / 100).toLocaleString(this.language)} MB`;
        }
        if (this.cpu) {
            memory['cpuUser'] = this.cpu.user.toLocaleString(this.language);
            memory['cpuSystem'] = this.cpu.system.toLocaleString(this.language);
        }
        this.adapter.log.debug(`Process Meomory: ${JSON.stringify(memory)}`);
    }

    private async dummyProcess(): Promise<void> {
        await tools.wait(4);
    }

    /**
     * stop all process
     */
    public async stopallproc(): Promise<void> {
        for (const id in this.run) {
            await this.stopproc(id);
        }
    }

    /**
     * set actual time as unix time for an unique id
     * @param id unique name  / key of the process
     * @param unixtimestamp unixtime to set (optional)
     */
    private setUnixTimestamp(id: string, unixtimestamp?: number): void {
        if (unixtimestamp === undefined) {
            this.unixtime[id] = this.getUnixTimestampNow();
        } else {
            this.unixtime[id] = unixtimestamp;
        }
    }

    /**
     * gets acutal time
     */
    private getUnixTimestampNow(): number {
        // return Math.round(new Date().getTime());
        return Math.ceil(new Date().getTime());
    }

    /**
     * gets unixtime for id
     * @param id unique name  / key of the process
     * @returns unixtime
     */
    private getUnixTimestamp(id: string): number {
        return this.unixtime[id];
    }

    /**
     * deletes unixtime für id
     * @param id {string}
     */
    private delUnixTimestamp(id: string): void {
        this.unixtime[id] = 0;
    }

    /**
     * Get all device ids for a devicetype. Example for devicetype 42 you get back [{ id: 'Z:34324, type:42 }, { id: 'Z:4721', type: 42}]
     * If you set devicetype to undefined. You get back all devices ids
     * @param devicetype devicetype like 42 oder undefindes
     * @returns return an array with all device ids for a device type
     */
    private async getDeviceIdsByType(devicetype?: number): Promise<ifDeviceId[]> {
        const deviceids: ifDeviceId[] = [];
        const states = await this.states.getStatesAllAsync('devices.*.type');
        if (states) {
            for (const key in states) {
                const value = states[key];
                if (value?.val && (devicetype === value?.val || devicetype === undefined)) {
                    deviceids.push({
                        id: key.replace(`devices.`, '').replace('.type', ''),
                        type: value.val,
                    });
                }
            }
        }
        return deviceids;
    }

    private async initObjects(): Promise<void> {
        const deviceids = await this.getDeviceIdsByType();
        for (const i in deviceids) {
            const type = deviceids[i].type;
            const objects = datapoints.getDeviceTypeList(type, this.language);
            for (const j in objects) {
                const id = `devices.${deviceids[i].id}.${j}`;
                const oldobject = await this.states.getObjectAsync(id);
                const object = objects[j] as any;
                if (oldobject && object) {
                    if (oldobject?.common?.name) object.common.name = oldobject.common.name;
                    const newobject = {
                        ...oldobject,
                        ...object,
                    };
                    await this.states.setObjectAsync(id, newobject);
                }
            }
        }
    }

    /**
     * Lupusec Status to Apple Home Status
     * @param mode_pc_a Area 1 or 2 (1,2)
     * @param alarm_ex 0 = Disarm, 1 = Arm, 2 = Home1, 3 = Home2, 4 = Home3
     * @returns status for Apple home as number if set. If not set the return valus is undefined
     */
    private getAppleStautusFromLupusec(mode_pc_a: number, alarm_ex: number): number | undefined {
        let alarm = undefined; // disarm
        const vmode_pc_a = Number(mode_pc_a);
        const valarm_ex = Number(alarm_ex);
        switch (vmode_pc_a) {
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
        if (vmode_pc_a > 0 && valarm_ex == 1) {
            alarm = 4; // triggered = 4 (the security system is triggered)
        }
        return alarm;
    }

    /**
     * Apple Home Status to Lupusec Status
     * @param applestatus Apple Status from 0 to 4
     * @returns Lupsusec Status from 0 to 3
     */
    private getLupusecFromAppleStautus(applestatus: number): number | undefined {
        let alarm = undefined;
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
     * Gets from path the abssolute Url
     * @param path path of the Url like /action/logout
     * @returns full abaolute URI like https://foo.com/action/logout
     */
    private async getAbsoluteURI(path: string): Promise<string> {
        const alarm_hostname = await tools.lookup(this.adapter.config.alarm_hostname);
        const aboluteURI =
            this.adapter.config.alarm_https === true
                ? 'https://' + alarm_hostname + path
                : 'http://' + alarm_hostname + path;
        return aboluteURI;
    }

    /**
     * Gets Token from alarm system
     * @param renew : optinal parameter, to get new Token
     * @returns returns token
     */
    private async requestToken(renew?: boolean): Promise<string> {
        if (renew === undefined) renew = false;
        const path = urlTokenGet;
        const lastupdate = this.getUnixTimestamp('Token') || 0;
        const now = this.getUnixTimestampNow();
        const diff = lastupdate + 60 * 1000 - now; // Token alle 60 Sekunden erneuern
        if (this.token !== '' && renew === false && diff > 0) return this.token;
        // get new Token
        this.setUnixTimestamp('Token');
        const requestconfig: axios.AxiosRequestConfig = {
            httpsAgent: this.httpsagent,
            httpAgent: this.httpagent,
            timeout: this.axiostimeout,
            maxRedirects: 0,
            headers: {
                Authorization: this.auth,
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
            responseType: 'text',
            transformResponse: (res) => {
                return res; // Avoid automatic json parse
            },
        };
        this.adapter.log.debug(`Request Token ${path}`);
        const response = await this.axiosinstance.get(await this.getAbsoluteURI(path), requestconfig);
        if (response.data) response.data = tools.JsonParseDelSonderszeichen(response.data);
        this.token = response.data.message;
        this.adapter.log.debug(`New Token: ${this.token}`);
        return this.token;
    }

    /**
     * make a http request get
     * @param path path of the request like /action/logout
     * @param config optional parameter, list of configuraion
     * @returns Response of the request
     */
    private async requestGet(path: string, config: axios.AxiosRequestConfig = {}): Promise<any> {
        const unixtime = this.getUnixTimestampNow();
        const token = await this.requestToken(false);
        const requestconfig: axios.AxiosRequestConfig = {
            httpsAgent: this.httpsagent,
            httpAgent: this.httpagent,
            timeout: this.axiostimeout,
            maxRedirects: 0,
            headers: {
                Authorization: this.auth,
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Token': token,
            },
            responseType: 'text',
            transformResponse: (res) => {
                return res; // Avoid automatic json parse
            },
            ...config,
        };
        this.adapter.log.debug(`Request Get ${path}`);
        const response = await this.axiosinstance.get(await this.getAbsoluteURI(path), requestconfig);
        if (response.data) response.data = tools.JsonParseDelSonderszeichen(response.data);
        return {
            data: response.data,
            unixtime: unixtime,
        };
    }

    /**
     * Post Request
     * @param path url for post
     * @param data  payload for post statement
     * @param config config
     * @returns response of post request
     */
    private async requestPost(path: string, data: object, config?: axios.AxiosRequestConfig): Promise<any> {
        const token = await this.requestToken(false); // await this.requestToken(true);
        const requestconfig: axios.AxiosRequestConfig = {
            httpsAgent: this.httpsagent,
            httpAgent: this.httpagent,
            timeout: this.axiostimeout,
            maxRedirects: 0,
            headers: {
                Authorization: this.auth,
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Token': token,
            },
            responseType: 'text',
            transformResponse: (res) => {
                return res; // Avoid automatic json parse
            },
            ...config,
        };
        const unixtime = this.getUnixTimestampNow();
        const text = querystring.stringify(data as querystring.ParsedUrlQueryInput);
        this.adapter.log.debug(`Request Post ${path} with payload ${JSON.stringify(data)}`);
        const response = await this.axiosinstance.post(await this.getAbsoluteURI(path), text, requestconfig);
        if (response.data) response.data = tools.JsonParseDelSonderszeichen(response.data);
        return {
            data: response.data,
            unixtime: unixtime,
        };
    }

    private async device_mapping_all(states: any): Promise<any> {
        const statesmapped: any = {};
        const id = states.id || states.sid;
        const idc = `devices.${id}`;
        const type = states.type || states.stype || (await this.states.getStateAsync(`${idc}.type`))?.val;
        if (type === undefined) return;
        for (const name in states) {
            let value = states[name];
            // For Power Switches, 2 new States
            if (name === 'rssi' && value !== undefined) {
                const regstat = /{WEB_MSG_(.+)}(.*)/gm;
                const m = regstat.exec(value);
                if (m) {
                    value = m[2] ? Number(m[2].trim()) : 0;
                } else {
                    value = 0;
                }
            }
            if (name === 'reachable' && states.rssi !== undefined) {
                const regstat = /{WEB_MSG_(.+)}(.*)/gm;
                const m = regstat.exec(states.rssi);
                if (m) {
                    value = m[2] && Number(m[2].trim()) > 0 ? true : false;
                } else {
                    value = false;
                }
            }
            // type_name : name of the sensor, like NUKI
            if (name === 'type_name') {
                value = datapoints.getDeviceNameByDeviceType(type);
            }
            // alarm_status_ex: value of alarm_status as booelean
            if (name === 'alarm_status_ex') {
                if (states['alarm_status'] !== undefined) value = states['alarm_status'] ? true : false;
            }
            // status: make it more readdable
            if (name === 'status') {
                const regstat = /\{WEB_MSG_(DC|DL)_(.+)\}/gm;
                const m = regstat.exec(value);
                if (m && m.length > 1) value = m[2]; // .toLowerCase();
            }
            if (name === 'logmsg' && states.msg !== undefined) {
                value = states.msg;
            }
            if (type === 17 || type === 37) {
                if (name === 'sresp_button_123' && states.sresp_panic !== undefined) value = states.sresp_panic;
                if (name === 'sresp_button_456' && states.sresp_fire !== undefined) value = states.sresp_fire;
                if (name === 'sresp_button_789' && states.sresp_medical !== undefined) value = states.sresp_medical;
            }
            // For Power Switches,
            if (type === 24 || type === 48 || type === 50 || type === 66) {
                if (name === 'pd') {
                    value = (await this.states.getStateAsync(`${idc}.pd`))?.val || 0;
                }
                if (name === 'power' && states.status !== undefined) {
                    const regstat = /{WEB_MSG_PSM_POWER}\s*([\d.]+)/gm;
                    const m = regstat.exec(states.status);
                    if (m) {
                        value = Number(m[1].trim());
                    }
                }
                if (name === 'powertotal' && states.status !== undefined) {
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
                if (name === 'actual_temperature' && states.status !== undefined) {
                    const regstat = /{WEB_MSG_TS_DEGREE}\s*([\d.]+)/gm;
                    const m = regstat.exec(states.status);
                    if (m) {
                        value = Number(m[1].trim());
                    }
                }
                if (name === 'actual_humidity' && states.status !== undefined) {
                    const regstat = /{WEB_MSG_RH_HUMIDITY}\s*([\d.]+)/gm;
                    const m = regstat.exec(states.status);
                    if (m) {
                        value = Number(m[1].trim());
                    }
                }
                if (name === 'actual_lux' && states.status !== undefined) {
                    const regstat = /{WEB_MSG_LM_LUX}\s*([\d.]+)/gm;
                    const m = regstat.exec(states.status);
                    if (m) {
                        value = Number(m[1].trim());
                    }
                }
            }
            if (type === 57) {
                if (name === 'nuki_state' && states.nuki !== undefined) {
                    for (const i in this.adapter.config.nuki_doorsensors) {
                        const nuki = this.adapter.config.nuki_doorsensors[i].nuki;
                        const door = this.adapter.config.nuki_doorsensors[i].door;
                        if (id === nuki && door) {
                            const doorvalue = (await this.states.getStateAsync(`devices.${door}.status_ex`))?.val;
                            const valuenuki = Number(states.nuki);
                            value = valuenuki === 3 && doorvalue === true ? 0 : valuenuki;
                            break;
                        }
                    }
                }
                if (name === 'nuki_action') {
                    value = (await this.states.getStateAsync(`${idc}.nuki_action`))?.val;
                }
                if (name == 'reachable' && tools.hasProperty(states, 'consumer_id')) {
                    value = await this.isNukiAllive(states.consumer_id);
                }
            }
            // Shutter, if shutter level (0-100%) change, the swich value will change too
            if (type === 76) {
                if (name === 'switch') {
                    const valuelevel = (await this.states.getStateAsync(`${idc}.level`))?.val || undefined;
                    value = valuelevel !== undefined && states.level !== undefined && states.level > value ? 1 : 0;
                }
                if (name === 'on_time' && value !== undefined) {
                    value = tools.round(value / 10, 0.1) || 0;
                }
                if (name === 'off_time' && value !== undefined) {
                    value = tools.round(value / 10, 0.1) || 0;
                }
            }
            if (type === 79) {
                if (name === 'actual_temperature' && states.status !== undefined) {
                    const regstat = /{WEB_MSG_TS_DEGREE}\s*([\d.]+)/gm;
                    const m = regstat.exec(states.status);
                    if (m) {
                        value = Number(m[1].trim());
                    }
                }
                if (name === 'valve' && states.status !== undefined) {
                    const regstat = /{WEB_MSG_TRV_VALVE}\s*([\d.]+)/gm;
                    const m = regstat.exec(states.status);
                    if (m) {
                        value = Number(m[1].trim());
                    }
                }
                if (name === 'set_temperature' && states.status !== undefined) {
                    const regstat = /{WEB_MSG_TRV_SETPOINT}\s*([\d.]+)/gm;
                    const m = regstat.exec(states.status);
                    if (m) {
                        value = Number(m[1].trim());
                    }
                }
                if (name === 'off' && states.status !== undefined) {
                    const regstat = /{WEB_MSG_TRV_(OFF)}/gm;
                    const m = regstat.exec(states.status);
                    if (m && m[1] === 'OFF') value = true;
                    else value = false;
                }
                if (name === 'mode' && states.status !== undefined) {
                    const regstat = /{WEB_MSG_TRV_(AUTO|MANUAL)}/gm;
                    const m = regstat.exec(states.status);
                    if (m && m[1] === 'AUTO') value = 1;
                    if (m && m[1] === 'MANUAL') value = 0;
                }
                if (name === 'thermo_offset' && value !== undefined) {
                    value = tools.round(value / 10, 0.5);
                }
            }
            statesmapped[name] = value;
        }
        return statesmapped;
    }

    private async webcam_mapping_all(id: string, states: any): Promise<any> {
        const statesmapped = states;
        const port = this.adapter.config.webcam_port;
        const bind = this.adapter.config.webcam_bind;
        const host = bind !== '0.0.0.0' ? bind : this.adapter.host;
        if (this.adapter.config.webcam_providing && statesmapped.url) {
            statesmapped.image = `http://${host}:${port}/image/${id}`;
            statesmapped.stream = `http://${host}:${port}/stream/${id}`;
        } else {
            statesmapped.image = '';
            statesmapped.stream = '';
        }
        return statesmapped;
    }

    async zentrale_mapping_all(states: any): Promise<any> {
        const statesmapped = states;
        statesmapped.apple_home_a1 = this.getAppleStautusFromLupusec(states.mode_pc_a1, states.alarm_ex);
        statesmapped.apple_home_a2 = this.getAppleStautusFromLupusec(states.mode_pc_a2, states.alarm_ex);
        if (states.rssi !== undefined) {
            statesmapped.reachable = states.rssi > 0 ? true : false;
        }
        return statesmapped;
    }

    private async dummyDevicePost(id: string): Promise<void> {
        this.setUnixTimestamp(id);
    }

    private async haExecutePost(id: string, form: any): Promise<any> {
        if (!form) return;
        const result = await this.requestPost(urlHaExecutePost, form);
        this.setUnixTimestamp(id);
        return result;
    }

    private async deviceEditThermoPost(id: string, form: any): Promise<any> {
        if (!form) return;
        const result = await this.requestPost(urlDeviceEditThermoPost, form);
        this.setUnixTimestamp(id);
        return result;
    }

    private async deviceEditPost(id: string, form: any): Promise<any> {
        if (!form) return;
        const ressultold = await this.requestPost(urlDeviceEditGet, { id: form.id });
        if (ressultold?.data?.forms?.ssform) {
            const ssform = ressultold.data.forms.ssform;
            for (const name in ssform) {
                const value = ssform[name];
                if (!tools.hasProperty(form, name)) {
                    switch (typeof value) {
                        case 'string':
                            if (value.length > 0) form[name] = value;
                            break;
                        default:
                            if (value) form[name] = value;
                            break;
                    }
                }
            }
            const result = await this.requestPost(urlDeviceEditPost, form);
            this.setUnixTimestamp(id);
            return result;
        }
    }

    private async deviceEditShutterPost(id: string, form: any): Promise<any> {
        if (!form) return;
        const result = await this.requestPost(urlDeviceEditShutterPost, form);
        this.setUnixTimestamp(id);
        return result;
    }

    private async deviceSwitchPSSPost(id: string, form: any): Promise<any> {
        if (!form) return;
        const result = await this.requestPost(urlDeviceSwitchPSSPost, form);
        this.setUnixTimestamp(id);
        return result;
    }

    private async deviceNukiCmd(id: string, form: any): Promise<any> {
        if (!form) return;
        const result = await this.requestPost(urlDeviceNukiCmd, form);
        this.setUnixTimestamp(id);
        return result;
    }

    private async deviceEditGet(form: any): Promise<any> {
        if (!form) return;
        const result = await this.requestPost(urlDeviceEditGet, form);
        return result;
    }

    private async deviceEditThermoGet(form: any): Promise<any> {
        if (!form) return;
        const result = await this.requestPost(urlDeviceEditThermoGet, form);
        return result;
    }

    private async deviceEditMeterGet(form: any): Promise<any> {
        if (!form) return;
        const result = await this.requestPost(urlDeviceEditMeterGet, form);
        return result;
    }

    private async deviceEditShutterGet(form: any): Promise<any> {
        if (!form) return;
        const result = await this.requestPost(urlDeviceEditShutterGet, form);
        return result;
    }

    private async deviceEditMeterPost(id: string, form: any): Promise<any> {
        if (!form) return;
        const result = await this.requestPost(urlDeviceEditMeterPost, form);
        this.setUnixTimestamp(id);
        return result;
    }

    private async deviceSwitchDimmerPost(id: string, form: any): Promise<any> {
        if (!form) return;
        const result = await this.requestPost(urlDeviceSwitchDimmerPost, form);
        this.setUnixTimestamp(id);
        return result;
    }

    private async panelCondPost(id: string, form: any): Promise<any> {
        if (!form) return;
        const result = await this.requestPost(urlPanelCondPost, form);
        this.setUnixTimestamp(id);
        return result;
    }

    private async deviceDoUPICPost(id: string, form: any): Promise<any> {
        if (!form) return;
        const result = await this.requestPost(urlDeviceDoUPICPost, form);
        this.setUnixTimestamp(id);
        return result;
    }

    public async sendSMSPost(id: string, form: any): Promise<any> {
        if (!form) return;
        const result = await this.requestPost(urlSendSMSPost, form);
        this.setUnixTimestamp(id);
        return result;
    }

    public async sendSMSgwTestPost(id: string, form: any): Promise<any> {
        if (!form) return;
        const result = await this.requestPost(urlSmsgwTestPost, form);
        this.setUnixTimestamp(id);
        return result;
    }

    private async deviceHueColorControl(id: string, form: any): Promise<any> {
        if (!form) return;
        const result = await this.requestPost(urlDeviceHueColorControl, form);
        this.setUnixTimestamp(id);
        return result;
    }

    private async logoutPost(): Promise<any> {
        const result = await this.requestGet(urlLogoutPost);
        this.setUnixTimestamp('logoutPost');
        return result;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private async isNukiAllive(id?: string): Promise<boolean | undefined> {
        const result = await this.requestGet(urlNukiGet);
        if (result?.data?.forms?.nukiform) {
            const nukis = result.data.forms.nukiform;
            if (nukis.url1) {
                // const url = nukis.url1;
                const url = nukis.url1.match(/^(http|https):\/\//gm) ? nukis.url1 : `http:\\${nukis.url1}`;
                const myURL = new URL(url);
                if (myURL) {
                    const proberesult = await tools.probe(myURL.hostname, Number(myURL.port));
                    return proberesult;
                }
            }
        }
        return undefined;
    }

    private async getAllStatusLupusecEntries(): Promise<void> {
        const result = await this.requestGet(urlPanelCondGet);
        const data = {
            unixtime: result.unixtime,
            zentrale: result.data.updates,
        };
        if (result?.data?.forms?.pcondform1) {
            for (const key in result.data.forms.pcondform1) {
                const value = result.data.forms.pcondform1[key];
                data.zentrale[key + '_pc_a1'] = value;
            }
        }
        if (result?.data?.forms?.pcondform2) {
            for (const key in result.data.forms.pcondform2) {
                const value = result.data.forms.pcondform2[key];
                data.zentrale[key + '_pc_a2'] = value;
            }
        }
        await this.setAllStatusLupusecEntries(data);
    }

    private async getAllSMSLupusecEntries(): Promise<void> {
        const data = {
            unixtime: this.getUnixTimestampNow(),
            sms: {},
        };
        await this.setAllSMSLupusecEntries(data);
    }

    private async getAllWebcamLupusecEntries(): Promise<void> {
        const webcams: any = {};
        const results = await this.requestGet(urlIpcamGet);
        if (!results || !results.data) return;
        if (results?.data?.forms?.ipcamform) {
            for (const name in results.data.forms.ipcamform) {
                const value = results.data.forms.ipcamform[name];
                const index = Number(name.slice(-1));
                // const url = results.data.forms.ipcamform[`url${index}`];
                // if (!url) continue;
                if (index >= 1 && index <= 9) {
                    if (!webcams[`cam${index}`]) webcams[`cam${index}`] = {};
                    webcams[`cam${index}`][name.slice(0, -1)] = value;
                }
            }
        }
        const data = {
            unixtime: results.unixtime,
            webcams: webcams,
        };
        await this.setAllWebcamLupusecEntries(data);
    }

    private async getAllDeviceLupusec(): Promise<void> {
        const parallelprocessing = true;
        const requestarray = [];
        const devices: any = {};
        requestarray.push(async () => await this.getAllDeviceLupusecEntries());
        requestarray.push(async () => await this.getAllDeviceLupusecEditEntries());
        requestarray.push(async () => await this.getAllDeviceLupusecLogs());
        let results: any = [];
        if (parallelprocessing || this.adapter.config.option_pollfaster) {
            results = await Promise.all(
                requestarray.map(async (request) => {
                    let result = {} || undefined;
                    const isasync = tools.isAsync(request);
                    result = isasync ? await request() : request();
                    return result;
                }),
            );
        } else {
            for (const request of requestarray) {
                let result = {} || undefined;
                const isasync = tools.isAsync(request);
                result = isasync ? await request() : request();
                results.push(result);
            }
        }
        let unixtime: number = 0;
        for (const idx in results) {
            const result: any = results[idx];
            for (const idd in result.devices) {
                devices[idd] = {
                    ...result.devices[idd],
                    ...devices[idd],
                };
            }
            if (result && result.unixtime > unixtime) unixtime = result.unixtime;
        }
        const data = {
            unixtime: unixtime,
            devices: devices,
        };
        await this.setAllDeviceLupusecEntries(data);
    }

    private async getAllDeviceLupusecLogs(): Promise<any> {
        const devices: any = {};
        const results = await this.requestPost(urlLogsGet, {
            max_count: 10,
        });
        if (!results || !results.data) return;
        if (results?.data?.logrows) {
            const states = await this.states.getStatesAllAsync('devices.*');
            for (const i in results.data.logrows) {
                const row = results.data.logrows[i];
                const regex = /{WEB_MSG_DEVICE_AREA_ZONE}[\t\s]*(\d*)[\t\s]*(\d*)/gm;
                const m = regex.exec(row.source);
                if (m && m[1] && m[2]) {
                    const area = Number(m[1]);
                    const zone = Number(m[2]);
                    let id = Object.keys(states).find(
                        (key) =>
                            key.startsWith('devices') &&
                            key.endsWith('zone') &&
                            states[key].val === zone &&
                            states[key.replace(/zone$/, 'area')]?.val === area,
                    );
                    // const id = await this.getDeviceIdByAreaZone(area, zone);
                    if (id) {
                        id = id.replace(`devices.`, '').replace('.zone', '');
                        if (!devices[id] || !devices[id].logtime || row.log_time > devices[id].log_time) {
                            devices[id] = {
                                ...row,
                                id: id,
                                area: area,
                                zone: zone,
                                // ...devices[id],
                            };
                        }
                    }
                }
            }
        }
        const data = {
            unixtime: results?.unixtime,
            devices: devices,
        };
        // await this.setAllDeviceLupusecEntries(data);
        return data;
    }

    private async getAllDeviceLupusecEditEntries(): Promise<any> {
        const devices: any = {};
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
                        async () =>
                            await this.deviceEditGet({
                                id: id,
                            }),
                    );
                }
            }
            if (type === 50) {
                requestarray.push(
                    async () =>
                        await this.deviceEditMeterGet({
                            id: id,
                        }),
                );
            }
            if (type === 76) {
                requestarray.push(
                    async () =>
                        await this.deviceEditShutterGet({
                            id: id,
                        }),
                );
            }
            if (type === 79) {
                requestarray.push(
                    async () =>
                        await this.deviceEditThermoGet({
                            id: id,
                        }),
                );
            }
        }
        let results = [];
        if (parallelprocessing || this.adapter.config.option_pollfaster) {
            results = await Promise.all(
                requestarray.map(async (request) => {
                    let result = {} || undefined;
                    const isasync = tools.isAsync(request);
                    result = isasync ? await request() : request();
                    return result;
                }),
            );
        } else {
            for (const request of requestarray) {
                let result = {} || undefined;
                const isasync = tools.isAsync(request);
                result = isasync ? await request() : request();
                results.push(result);
            }
        }
        for (const idx in results) {
            const result: any = results[idx];
            if (result?.data?.forms?.ssform) result.data.form = result.data.forms.ssform; // Type 7, 81, 37, 50, 76, 79
            if (result?.data?.forms?.thermoform) result.data.form = result.data.forms.thermoform; // Type 79
            if (result?.data?.forms?.shutterform) result.data.form = result.data.forms.shutterform; // Type 76
            if (result?.data?.forms?.meterform) result.data.form = result.data.forms.meterform; // Type 50
            if (result?.data?.forms) delete result.data.forms;
            if (result?.data?.form) {
                const device = result.data.form;
                if (device.id || device.sid) {
                    const id = device.id || device.sid;
                    devices[id] = {
                        ...devices[id],
                        ...device,
                    };
                }
            }
            if (result && result.unixtime > unixtime) unixtime = result.unixtime;
        }
        const data = {
            unixtime: unixtime,
            devices: devices,
        };
        // await this.setAllDeviceLupusecEntries(data);
        return data;
    }

    private async getAllDeviceLupusecEntries(): Promise<any> {
        const list = {
            DeviceListGet: urlDeviceListGet,
            DevicePSSListGet: urlDevicePSSListGet,
            // /DeviceGet: urlDeviceGet,
            DeviceListUPICGet: urlDeviceListUPICGet,
        };
        /*
        const results = await this.requestGetAll(list);
        */
        const resultDeviceListGet = await this.requestGet(urlDeviceListGet);
        const resultDevicePSSListGet = await this.requestGet(urlDevicePSSListGet);
        const resultDeviceListUPICGet = await this.requestGet(urlDeviceListUPICGet);
        const results = {
            unixtime: resultDeviceListUPICGet.unixtime,
            data: {
                DeviceListGet: resultDeviceListGet,
                DevicePSSListGet: resultDevicePSSListGet,
                DeviceListUPICGet: resultDeviceListUPICGet,
            },
        };
        if (!results || !results.data) return;

        const devices: any = {};
        if (results?.data?.DeviceListGet?.data?.senrows) {
            for (const device of results.data.DeviceListGet.data.senrows) {
                if (device.id || device.sid) {
                    const id = device.id || device.sid;
                    devices[id] = { ...devices[id], ...device };
                }
            }
        }
        if (results?.data?.DevicePSSListGet?.data?.pssrows) {
            for (const device of results.data.DevicePSSListGet.data.pssrows) {
                if (device.id || device.sid) {
                    const id = device.id || device.sid;
                    devices[id] = { ...devices[id], ...device };
                }
            }
        }
        if (results?.data?.DeviceListUPICGet?.data?.upicrows) {
            for (const device of results.data.DeviceListUPICGet.data.upicrows) {
                if (device.id || device.sid) {
                    const id = device.id || device.sid;
                    devices[id] = { ...devices[id], ...device };
                }
            }
        }
        const data = {
            unixtime: results?.unixtime,
            devices: devices,
        };
        // await this.setAllDeviceLupusecEntries(data);
        return data;
    }

    /**
     *
     * @param name string or object with name like de: 'tür', en: 'door' or 'tür'
     * @param extname string or object with name kike de: 'Status', en: 'state' or 'Status'
     * @returns string or object like de: Status (tür), en: state (door) or Status (tür)
     */
    private async extendCommonName(name: any, extname?: any): Promise<any> {
        if (!extname || !name) return name;
        if (typeof name === 'object' && typeof extname === 'object') {
            const newnames: any = {};
            for (const language in name) {
                newnames[language] = extname[language] ? `${extname[language]} (${name[language]})` : name[language];
            }
            return newnames;
        }
        if (typeof name === 'object' && typeof extname === 'string') {
            const newnames: any = {};
            for (const language in name) {
                newnames[language] = `${extname} (${name[language]})`;
            }
            return newnames;
        }
        if (typeof name === 'string' && typeof extname === 'string') {
            const newname = `${extname} (${name})`;
            return newname;
        }
        if (typeof name === 'string' && typeof extname === 'object') {
            const newname = extname[this.language] ? `${extname[this.language]} (${name})` : name;
            return newname;
        }
    }

    private async createObjectSetStates(
        id: string,
        name: string,
        value: any,
        unixtime: number,
        obj: any,
        devicename?: any,
    ): Promise<void> {
        // const object = tools.copyObject(obj);  // copy of the object
        const execdelay = 0; // 100; // this.adapter.config.alarm_polltime * 1000;
        const object = obj;
        const sid = id + '.' + name;
        if (object.common.name === '%value%') {
            object.common.name = value !== undefined ? value : undefined;
        }
        if (typeof object.common.name === 'string' && object.common.name.indexOf('%value%') !== -1) {
            object.common.name = value !== undefined ? object.common.name.replace('%value%', value) : undefined;
        }
        if (object.common.name) {
            object.common.name = await this.extendCommonName(object.common.name, devicename);
        }
        await this.states.setObjectNotExistsAsync(sid, {
            type: object.type,
            common: object.common,
            native: {},
        });
        if (object.type === 'channel' || object.type === 'device') return;
        const statevalue = tools.convertPropertyType(value, object.common.type);
        if (statevalue === null || statevalue === undefined) {
            return;
        }
        const stateget = await this.states.getStateAsync(sid);
        // const stateunixtime = this.getUnixTimestamp(sid) +
        const stateunixtime =
            this.getUnixTimestamp(sid) > 0 ? this.getUnixTimestamp(sid) + execdelay : this.getUnixTimestamp(sid);
        // const stateunixtime = stateget && stateget.ts ? stateget.ts : undefined;
        if (stateget && stateunixtime === undefined && stateget.ack === true && stateget.val === statevalue) {
            this.delUnixTimestamp(sid);
            return;
        }
        if (!stateget || stateunixtime === undefined || (stateget.ack === true && stateget.val !== statevalue)) {
            const result = await this.states.setStateNotExistsAsync(sid, { val: statevalue, ack: true });
            this.delUnixTimestamp(sid);
            if (stateget) {
                this.adapter.log.debug(
                    `State ${sid} changed value from ${stateget.val} to ${statevalue} and ack from ${stateget.ack} to true)`,
                );
            } else {
                this.adapter.log.debug(`State ${sid} changed to value ${statevalue} and ack to true)`);
            }
            return;
        }
        if (!stateget || (stateget.ack === false && stateunixtime > 0 && stateunixtime < unixtime)) {
            const result = await this.states.setStateNotExistsAsync(sid, { val: statevalue, ack: true });
            this.delUnixTimestamp(sid);
            if (stateget) {
                this.adapter.log.debug(
                    `State ${sid} changed value from ${stateget.val} to ${statevalue} and ack from ${stateget.ack} to true)`,
                );
            } else {
                this.adapter.log.debug(`State ${sid} changed to value ${statevalue} and ack to true)`);
            }
            return;
        }
    }

    private async setAllDeviceLupusecEntries(results: any): Promise<void> {
        const unixtime = results.unixtime;
        const devices = results.devices;
        const promisearray = [];
        for (const id in devices) {
            const device = devices[id];
            const idc = 'devices.' + id;
            const cname = device.name || device.sname;
            const type = device.type || device.stype || (await this.states.getStateAsync(`${idc}.type`))?.val;
            if (type === undefined) continue;
            let objects = datapoints.getDeviceTypeList(type, this.language);
            if (!objects) {
                this.adapter.log.warn(
                    `Gerätetyp ${type} für das Gerät ${id} mit Namen ${cname || ''} wird nicht unterstützt!`,
                );
                objects = datapoints.getDeviceTypeList(0, this.language);
            }
            const icon = datapoints.getDeviceIconByDeviceType(type);
            const oldobject = await this.states.getObjectAsync(idc);
            if (cname !== undefined && oldobject && oldobject.common && oldobject.common.name !== cname) {
                const result = await this.states.setObjectAsync(idc, {
                    type: 'channel',
                    common: {
                        name: cname,
                        icon: icon,
                        statusStates: {
                            onlineId: 'reachable',
                        },
                    },
                    native: {},
                });
                if (result) {
                    this.adapter.log.info(`Neuer Gerätname für ${id} ist ${cname || ''}`);
                }
            } else {
                const result = await this.states.setObjectNotExistsAsync(idc, {
                    type: 'channel',
                    common: {
                        name: cname,
                        icon: icon,
                        statusStates: {
                            onlineId: 'reachable',
                        },
                    },
                    native: {},
                });
                if (result) {
                    this.adapter.log.info(`Gerät ${id} mit Namen ${cname || ''} hinzugefügt`);
                }
            }
            // Add owen (missing) datapoints
            for (const dp in objects) {
                if (!tools.hasProperty(device, dp)) {
                    device[dp] = undefined;
                }
            }
            // Daten erweitern
            const devicemappend = await this.device_mapping_all(device);
            for (const dp in objects) {
                const val: any = objects[dp];
                if (this.adapter.config.option_pollfaster) {
                    promisearray.push(async () => {
                        await this.createObjectSetStates(idc, dp, devicemappend[dp], unixtime, val, cname);
                    });
                } else {
                    await this.createObjectSetStates(idc, dp, devicemappend[dp], unixtime, val, cname);
                }
            }
        }
        if (promisearray) await Promise.all(promisearray.map(async (func) => await func()));
    }

    // Status
    private async setAllStatusLupusecEntries(results: any): Promise<void> {
        const zentrale = results.zentrale;
        const unixtime = results.unixtime;
        const promisearray = [];
        const idc = 'status';
        const objects = datapoints.getStatusTypeList(this.language);
        // Add owen (missing) datapoints
        for (const dp in objects) {
            if (!tools.hasProperty(zentrale, dp)) {
                zentrale[dp] = undefined;
            }
        }
        // Daten erweitern
        const zentralemapped = await this.zentrale_mapping_all(zentrale);
        const cname = (await this.states.getObjectAsync(idc))?.common?.name;
        for (const dp in objects) {
            if (this.adapter.config.option_pollfaster) {
                promisearray.push(
                    async () => await this.createObjectSetStates(idc, dp, zentralemapped[dp], unixtime, objects[dp]),
                    cname,
                );
            } else {
                await this.createObjectSetStates(idc, dp, zentralemapped[dp], unixtime, objects[dp], cname);
            }
        }
        if (promisearray) await Promise.all(promisearray.map(async (func) => await func()));
    }

    private async setAllSMSLupusecEntries(results: any): Promise<void> {
        const sms = results.sms;
        const unixtime = results.unixtime;
        const objects = datapoints.getSMSTypeList(this.language);
        const idc = 'sms';
        const promisearray = [];
        // Add owen (missing) datapoints
        for (const dp in objects) {
            if (!tools.hasProperty(sms, dp)) {
                sms[dp] = (await this.states.getStateAsync(`${idc}.${dp}`))?.val;
            }
        }
        const cname = (await this.states.getObjectAsync(idc))?.common?.name;
        for (const dp in objects) {
            if (this.adapter.config.option_pollfaster) {
                promisearray.push(
                    async () => await this.createObjectSetStates(idc, dp, sms[dp], unixtime, objects[dp], cname),
                );
            } else {
                await this.createObjectSetStates(idc, dp, sms[dp], unixtime, objects[dp], cname);
            }
        }
        if (promisearray) await Promise.all(promisearray.map(async (func) => await func()));
    }

    private async setAllWebcamLupusecEntries(results: any): Promise<void> {
        const unixtime = results.unixtime;
        const webcams = results.webcams;
        const promisearray = [];
        const objects = datapoints.getWebcamTypeList(this.language);
        for (const id in webcams) {
            const webcam = webcams[id];
            const idc = 'webcams.' + id;
            const cname = webcam.name || `Webcam ${idc.slice(-1)} ` || '';
            const result = await this.states.setObjectNotExistsAsync(idc, {
                type: 'channel',
                common: {
                    name: cname,
                    icon: '/icons/webcam.png',
                },
                native: {},
            });
            if (result) {
                this.adapter.log.info(`Webcam ${id} mit Namen ${cname} hinzugefügt`);
            }
            // Add owen (missing) datapoints
            for (const dp in objects) {
                if (!tools.hasProperty(webcam, dp)) {
                    webcam[dp] = undefined;
                }
            }
            // Daten erweitern
            const webcammapped = await this.webcam_mapping_all(id, webcam);
            for (const dp in objects) {
                if (this.adapter.config.option_pollfaster) {
                    promisearray.push(
                        async () =>
                            await this.createObjectSetStates(
                                'webcams.' + id,
                                dp,
                                webcammapped[dp],
                                unixtime,
                                objects[dp],
                            ),
                    );
                } else {
                    await this.createObjectSetStates('webcams.' + id, dp, webcammapped[dp], unixtime, objects[dp]);
                }
            }
        }
        if (promisearray) await Promise.all(promisearray.map(async (func) => await func()));
        if (this.adapter.config.webcam_providing) {
            const caminstance = wc.Webcam.getInstance(this.adapter, webcams);
            await caminstance.startServer();
        }
    }

    /**
     * Is called if a subscribed state changes
     * @param {string} id
     * @param {ioBroker.State | null | undefined} state
     */
    public async onStateChange(id: string, state: so.ifState): Promise<void> {
        try {
            if (state && state.ack === false) {
                await this.states.setStateNotExistsAsync(id, { val: state.val, ack: state.ack });
                if (id.startsWith(this.adapter.namespace + '.devices.')) {
                    const execdelay = 1000; // in milliseconds - this.adapter.config.alarm_polltime * 1000
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const icchannelabs = id.split('.').slice(0, 4).join('.'); //  lupusec.0.devices.ZS:a61d01
                    const idchannel = id.split('.').slice(2, 4).join('.'); //  devices.ZS:a61d01
                    const iddevice = id.split('.').slice(2).join('.'); // devices.ZS:a61d01.status_ex
                    const channel = id.split('.').slice(3, 4).join('.'); // Device ID - ZS:a61d01
                    const name = id.split('.').slice(-1).join('.'); // statusname - status_ex
                    const zone = (await this.states.getStateAsync(`${idchannel}.zone`))?.val;
                    const area = (await this.states.getStateAsync(`${idchannel}.area`))?.val;
                    const type = (await this.states.getStateAsync(`${idchannel}.type`))?.val;
                    // Type 24,48,66
                    if (name === 'status_ex') {
                        const value = state.val === true ? 'on' : 'off';
                        const valuepd =
                            Number((await this.states.getStateAsync(`${idchannel}.pd`))?.val || 0) * 60 || 0;
                        const valuepdtxt = !valuepd ? '' : `:${valuepd}`;
                        const exec = `a=${area}&z=${zone}&sw=${value}&pd=${valuepdtxt}`;
                        await this.haExecutePost(iddevice, {
                            exec: exec,
                        });
                    }
                    // Type 24,48,66
                    else if (name === 'pd') {
                        await this.dummyDevicePost(iddevice);
                    }
                    // Type 50
                    else if (name === 'factor') {
                        await this.deviceEditMeterPost(iddevice, {
                            id: channel,
                            factor: state.val,
                        });
                    }
                    // Type 52 (Univeral IR Controller)
                    else if (name.startsWith('mode_name_')) {
                        const mode = name.replace('mode_name_', '');
                        await this.deviceDoUPICPost(iddevice, {
                            id: channel,
                            mode: mode,
                        });
                    }
                    // Type 52 (Univeral IR Controller)
                    else if (name === 'leds') {
                        await this.deviceDoUPICPost(iddevice, {
                            id: channel,
                            led: 'query',
                        });
                    }
                    // Type 57
                    else if (name === 'nuki_action') {
                        let value = undefined;
                        switch (state.val) {
                            case 3:
                                value = 1; // unlock
                                break;
                            case 1:
                                value = 2; // lock
                                break;
                            case 0:
                                value = 3; // open
                                break;
                            default:
                                break;
                        }
                        await this.deviceNukiCmd(iddevice, {
                            id: channel,
                            action: value,
                        });
                    }
                    // Type 66
                    else if (name === 'level') {
                        this.adapter.clearTimeout(this.timerhandle[iddevice]);
                        this.timerhandle[iddevice] = this.adapter.setTimeout(async () => {
                            await this.deviceSwitchDimmerPost(iddevice, {
                                id: channel,
                                level: state.val,
                            });
                        }, execdelay);
                    }
                    // Type 76
                    else if (name === 'switch') {
                        const shutterstates: any = {
                            0: 'on',
                            1: 'off',
                            2: 'stop',
                        };
                        const exec = `a=${area}&z=${zone}&shutter=${shutterstates[state.val]}`;
                        await this.haExecutePost(iddevice, {
                            exec: exec,
                        });
                    }
                    // Type 76
                    else if (name === 'on_time') {
                        const on_time = Number(state.val);
                        const off_time = Number((await this.states.getStateAsync(`${idchannel}.off_time`))?.val || 0);
                        await this.deviceEditShutterPost(iddevice, {
                            id: channel,
                            on_time: Math.round(on_time * 10),
                            off_time: Math.round(off_time * 10),
                        });
                    }
                    // Type 76
                    else if (name === 'off_time') {
                        const on_time = Number((await this.states.getStateAsync(`${idchannel}.on_time`))?.val || 0);
                        const off_time = Number(state.val);
                        await this.deviceEditShutterPost(iddevice, {
                            id: channel,
                            on_time: Math.round(on_time * 10),
                            off_time: Math.round(off_time * 10),
                        });
                    }
                    // Type 79
                    else if (name === 'thermo_offset') {
                        await this.deviceEditThermoPost(iddevice, {
                            id: channel,
                            act: 't_offset',
                            thermo_offset: Math.round(Number(state.val) * 10),
                        });
                    }
                    // Type 79
                    else if (name === 'mode') {
                        await this.deviceEditThermoPost(iddevice, {
                            id: channel,
                            act: 't_schd_setting',
                            thermo_schd_setting: state.val == 0 ? 0 : 1,
                        });
                    }
                    // Type 79
                    else if (name === 'off') {
                        await this.deviceEditThermoPost(iddevice, {
                            id: channel,
                            act: 't_mode',
                            thermo_mode: state.val == true ? 0 : 4,
                        });
                    }
                    // Type 79
                    else if (name === 'set_temperature') {
                        this.adapter.clearTimeout(this.timerhandle[iddevice]);
                        this.timerhandle[iddevice] = this.adapter.setTimeout(async () => {
                            await this.deviceEditThermoPost(iddevice, {
                                id: channel,
                                act: 't_setpoint',
                                thermo_setpoint: Math.trunc((100 * Math.round(2 * Number(state.val))) / 2),
                            });
                        }, execdelay);
                    }
                    // Type 4,7,17,37,81
                    else if (
                        name.startsWith('sresp_button_') ||
                        name === 'sresp_emergency' ||
                        name === 'name' ||
                        name === 'send_notify' ||
                        name === 'bypass' ||
                        name === 'bypass_tamper' ||
                        name === 'schar_latch_rpt' ||
                        name === 'always_off'
                    ) {
                        let parameter = name;
                        const form: any = {
                            id: channel,
                            sarea: area,
                            szone: zone,
                        };
                        if (name === 'sresp_button_123') parameter = 'sresp_panic';
                        if (name === 'sresp_button_456') parameter = 'sresp_fire';
                        if (name === 'sresp_button_789') parameter = 'sresp_medical';
                        if (name === 'name') parameter = 'sname';
                        if (name === 'bypass') parameter = 'scond_bypass';
                        form[parameter] = state.val;
                        await this.deviceEditPost(iddevice, form);
                    }
                    // Type 74
                    else if (name === 'hue') {
                        this.adapter.clearTimeout(this.timerhandle[iddevice]);
                        this.timerhandle[iddevice] = this.adapter.setTimeout(async () => {
                            const valuesat = Number((await this.states.getStateAsync(`${idchannel}.sat`))?.val || 0);
                            await this.deviceHueColorControl(iddevice, {
                                id: channel,
                                act: 't_setpoint',
                                hue: state.val || 0,
                                saturation: valuesat,
                                mod: 2,
                            });
                        }, execdelay);
                    }
                    // Type 74
                    else if (name === 'sat') {
                        this.adapter.clearTimeout(this.timerhandle[iddevice]);
                        this.timerhandle[iddevice] = this.adapter.setTimeout(async () => {
                            const valuehue = Number((await this.states.getStateAsync(`${idchannel}.hue`))?.val || 0);
                            await this.deviceHueColorControl(iddevice, {
                                id: channel,
                                act: 't_setpoint',
                                hue: valuehue,
                                saturation: state.val || 0,
                                mod: 2,
                            });
                        }, execdelay);
                    } else {
                        this.adapter.log.error(`Found no function to set state to ${state.val} for Id ${iddevice}`);
                        this.dummyDevicePost(iddevice);
                    }
                }
                if (id.startsWith(this.adapter.namespace + '.status.')) {
                    const regstat = /.+\.status\.(.+)/gm;
                    const m = regstat.exec(id);
                    if (!m) return;
                    const icchannelabs = id.split('.').slice(0, -1).join('.'); //  lupusec.0.status
                    const idchannel = id.split('.').slice(2, -1).join('.'); //  status
                    const iddevice = id.split('.').slice(2).join('.'); //  status.apple_home_a1
                    const name = m[1]; // Device ID - apple_home_a1
                    if (name === 'mode_pc_a1') {
                        await this.panelCondPost(iddevice, { area: 1, mode: state.val });
                    } else if (name === 'mode_pc_a2') {
                        await this.panelCondPost(iddevice, { area: 2, mode: state.val });
                    } else if (name === 'apple_home_a1') {
                        const mode_pc_a1 = this.getLupusecFromAppleStautus(Number(state.val));
                        if (mode_pc_a1 !== undefined && mode_pc_a1 >= 0 && mode_pc_a1 <= 4)
                            await this.panelCondPost(iddevice, { area: 1, mode: mode_pc_a1 });
                    } else if (name === 'apple_home_a2') {
                        const mode_pc_a2 = this.getLupusecFromAppleStautus(Number(state.val));
                        if (mode_pc_a2 !== undefined && mode_pc_a2 >= 0 && mode_pc_a2 <= 4)
                            await this.panelCondPost(iddevice, { area: 2, mode: mode_pc_a2 });
                    } else {
                        this.adapter.log.error(`Found no function to set state to ${state.val} for Id ${iddevice}`);
                        this.dummyDevicePost(iddevice);
                    }
                }
                if (id.startsWith(this.adapter.namespace + '.sms.')) {
                    const regstat = /.+\.sms\.(.+)/gm;
                    const m = regstat.exec(id);
                    if (!m) return;
                    const icchannelabs = id.split('.').slice(0, -1).join('.'); //  lupusec.0.status
                    const idchannel = id.split('.').slice(2, -1).join('.'); //  status
                    const iddevice = id.split('.').slice(2).join('.'); //  status.apple_home_a1
                    const name = m[1]; // Device ID - apple_home_a1
                    const valText = (await this.states.getStateAsync(`${idchannel}.text`))?.val;
                    const valNumber = (await this.states.getStateAsync(`${idchannel}.number`))?.val;
                    const valProvider = (await this.states.getStateAsync(`${idchannel}.provider`))?.val;
                    let resultsms;
                    if (name === 'dial') {
                        if (valText && valNumber) {
                            switch (valProvider) {
                                case 1:
                                    resultsms = await this.sendSMSPost(iddevice, {
                                        phone: valNumber,
                                        smstext: valText,
                                    });
                                    await this.states.setStateNotExistsAsync(`${idchannel}.result`, {
                                        val: resultsms?.data?.result,
                                        ack: true,
                                    });
                                    break;
                                case 2:
                                    resultsms = await this.sendSMSgwTestPost(iddevice, {
                                        to: valNumber,
                                        message: valText,
                                    });
                                    await this.states.setStateNotExistsAsync(`${idchannel}.result`, {
                                        val: resultsms?.data?.result,
                                        ack: true,
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
                // The state was deleted
                await this.states.delStateAsync(id);
                this.adapter.log.info(`State ${id} deleted`);
            }
        } catch (error: any) {
            this.adapter.log.error(`Error while setting state: ${error.toString()}`);
        }
    }

    /**
     * Is called if a subscribed object changes
     * @param {string} id
     * @param {ioBroker.Object | null | undefined} obj
     */
    public async onObjectChange(id: string, obj: any): Promise<void> {
        if (obj) {
            const a = 1;
            // The object was changed
            // this.adapter.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
        } else {
            // The object was deleted
            await this.states.delObjectAsync(id);
            this.adapter.log.info(`object ${id} deleted`);
        }
    }
}

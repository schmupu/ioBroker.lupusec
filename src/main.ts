/*
 * Created with @iobroker/create-adapter v2.5.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from '@iobroker/adapter-core';

// Load your modules here, e.g.:
import * as Lupus from './lib/lupusec';
import * as tools from './lib/tools';

class Lupusec extends utils.Adapter {
    private onlineCheckAvailable: boolean;
    private onlineCheckTimeout: ReturnType<typeof this.setTimeout>;

    public constructor(options: Partial<utils.AdapterOptions> = {}) {
        super({
            ...options,
            name: 'lupusec',
        });
        this.onlineCheckAvailable = false;
        this.onlineCheckTimeout = undefined;
        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('objectChange', this.onObjectChange.bind(this));
        this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    private async onReady(): Promise<void> {
        await this.changeDefaultParamter();
        await this.subscribeStatesAsync('devices.*');
        await this.subscribeStatesAsync('status.*');
        await this.subscribeStatesAsync('sms.*');
        await this.subscribeStatesAsync('webcams.*');
        await this.subscribeObjectsAsync('devices.*');
        await this.subscribeObjectsAsync('status.*');
        await this.subscribeObjectsAsync('sms.*');
        await this.subscribeObjectsAsync('webcams.*');
        await this.startOnlineCheck();
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     */
    private async onUnload(callback: () => void): Promise<void> {
        try {
            this.log.info(`Stopping Lupusec processes, please wait!`);
            await this.stopOnlineCheck();
            await this.stopLupusecAdapter();
            await tools.wait(15);
            callback();
        } catch (error) {
            callback();
        }
    }

    /**
     * Is called if a subscribed object changes
     */
    private async onObjectChange(id: string, obj: ioBroker.Object | null | undefined): Promise<void> {
        const lupusec = await Lupus.Lupusec.getInstance(this);
        await lupusec.onObjectChange(id, obj);
    }

    /**
     * Is called if a subscribed state changes
     */
    private async onStateChange(id: string, state: ioBroker.State | null | undefined): Promise<void> {
        const lupusec = await Lupus.Lupusec.getInstance(this);
        if (state) {
            await lupusec.onStateChange(id, state);
        }
    }

    /**
     * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
     * Using this method requires "common.messagebox" property to be set to true in io-package.json
     * @param {ioBroker.Message} obj
     */
    private async onMessage(obj: ioBroker.Message): Promise<void> {
        if (typeof obj === 'object' && obj.message) {
            if (obj.command === 'send') {
                // e.g. send email or pushover or whatever
                this.log.info('send command');

                // Send response in callback if required
                if (obj.callback) this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
            }
            if (obj.command === 'sendDoor') {
                const array = [];
                const actualstates = await this.getStatesAsync(`${this.namespace}.devices.*`);
                for (const [key] of Object.entries(actualstates)) {
                    if (key.endsWith('type') && actualstates[key].val === 4) {
                        const name = actualstates[key.replace(/type$/, 'name')].val || 'Door';
                        const channel = key.split('.').slice(3, 4).join('.'); // Device ID - ZS:a61d01
                        array.push({ label: `${name} (${channel})`, value: channel });
                    }
                }
                // Send response in callback if required
                if (obj.callback) this.sendTo(obj.from, obj.command, array, obj.callback);
            }
            if (obj.command === 'sendNuki') {
                const array = [];
                const actualstates = await this.getStatesAsync(`${this.namespace}.devices.*`);
                for (const [key] of Object.entries(actualstates)) {
                    if (key.endsWith('type') && actualstates[key].val === 57) {
                        const name = actualstates[key.replace(/type$/, 'name')].val || 'Nuki';
                        const channel = key.split('.').slice(3, 4).join('.'); // Device ID - ZS:a61d01
                        array.push({ label: `${name} (${channel})`, value: channel });
                    }
                }
                // Send response in callback if required
                if (obj.callback) this.sendTo(obj.from, obj.command, array, obj.callback);
            }
            if (obj.command === 'sms' || obj.command === 'smsgw') {
                const lupusec = await Lupus.Lupusec.getInstance(this);
                const valText = obj?.message['text'];
                const valNumber = obj?.message['number'];
                const iddevice = 'sms.dial';
                if (obj.command === 'sms' && valText && valNumber) {
                    const form = {
                        phone: valNumber,
                        smstext: valText,
                    };
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const result = await lupusec.sendSMSPost(iddevice, form);
                    this.sendTo(obj.from, obj.command, obj.message, obj.callback);
                }
                if (obj.command === 'smsgw' && valText && valNumber) {
                    const form = {
                        to: valNumber,
                        message: valText,
                    };
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const result = await lupusec.sendSMSgwTestPost(iddevice, form);
                    this.sendTo(obj.from, obj.command, obj.message, obj.callback);
                }
            }
        }
    }

    /**
     * Change default parameter
     */
    async changeDefaultParamter(): Promise<void> {
        let update = false;
        const id = 'system.adapter.' + this.namespace;
        const obj = await this.getForeignObjectAsync(id);
        if (obj && obj.native) {
            if (obj.native.option_pollfaster === true) {
                this.log.debug(`Changing default parameter ${id} from value ${obj.native.option_pollfaster} to false`);
                obj.native.option_pollfaster = false;
                update = true;
            }
            const server = await this.getHostnameAndPort();
            const url = server.https
                ? `https://${server.hostname}:${server.port}`
                : `http://${server.hostname}:${server.port}`;
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
     * @returns hostname and port as object
     */
    async getHostnameAndPort(): Promise<any> {
        const alarm_hostname = this.config.alarm_hostname; // await tools.lookup(this.config.alarm_hostname);
        const array = alarm_hostname.split(':');
        const hostname = array[0];
        const port = array[1] ? array[1] : this.config.alarm_https === true ? 443 : 80;
        return { hostname: hostname, port: port, https: this.config.alarm_https };
    }

    /**
     * checks if alam system is reachable
     * @returns true or false
     */
    async isAlarmSystemReachable(): Promise<boolean> {
        const server = await this.getHostnameAndPort();
        const isAlive = await tools.probe(server.hostname, server.port);
        return isAlive;
    }

    /**
     * Online-Check via TCP ping (when using CoAP)
     */
    async startOnlineCheck(): Promise<void> {
        try {
            const server = await this.getHostnameAndPort();
            const isAlive = await this.isAlarmSystemReachable();
            if (isAlive === true) {
                this.onlineCheckAvailable === false
                    ? this.log.info(`Could reach alarm system with hostname ${server.hostname} on port ${server.port}.`)
                    : this.log.debug(
                          `Could reach alarm system with hostname ${server.hostname} on port ${server.port}.`,
                      );
                await this.startLupuscecAdapter();
            } else {
                this.log.error(
                    `Could not reach alarm system with hostname  ${server.hostname} on port ${server.port}.`,
                );
                await this.stopLupusecAdapter();
            }
            this.onlineCheckAvailable = isAlive;
        } catch (error: any) {
            this.log.error(`Error in periodical online check (${error.toString()})`);
        }
        this.onlineCheckTimeout = this.setTimeout(async () => await this.startOnlineCheck(), 10 * 1000);
    }

    /**
     * Stops the continously online check
     */
    async stopOnlineCheck(): Promise<void> {
        if (this.onlineCheckTimeout) {
            this.clearTimeout(this.onlineCheckTimeout);
            this.onlineCheckTimeout = undefined;
        }
    }

    /**
     * Starts the polling of the states from the Lupusec alarm system
     */
    async startLupuscecAdapter(): Promise<void> {
        const lupusec = await Lupus.Lupusec.getInstance(this);
        await lupusec.startallproc();
        await this.setStateAsync('info.connection', { val: true, ack: true });
    }

    /**
     * Stops polling the states from the Lupusec alarm system
     */
    async stopLupusecAdapter(): Promise<void> {
        const lupusec = await Lupus.Lupusec.getInstance(this);
        lupusec.stopallproc();
        await this.setStateAsync('info.connection', { val: false, ack: true });
    }
}

if (require.main !== module) {
    // Export the constructor in compact mode
    module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new Lupusec(options);
} else {
    // otherwise start the instance directly
    (() => new Lupusec())();
}

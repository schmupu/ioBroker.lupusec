import { promises as dnsPromises } from 'dns';
import _ from 'lodash';
import * as tcpPing from 'tcp-ping';

/**
 * Interface hostname
 */
export interface ifHostnamePort {
    // eslint-disable-next-line jsdoc/require-jsdoc
    hostname: string;
    // eslint-disable-next-line jsdoc/require-jsdoc
    port: number | undefined;
}

/**
 * Class of tools
 */
export class Tools {
    /**
     * round(2.74, 0.1) = 2.7
     * round(2.74, 0.25) = 2.75
     * round(2.74, 0.5) = 2.5
     * round(2.74, 1.0) = 3.0
     *
     * @param value a number like 2.7, 2.75
     * @param step a number like 0.1, or 2.7
     * @returns a number
     */
    public static round(value: number, step: number): number {
        step || (step = 1.0);
        const inv = 1.0 / step;
        return Math.round(value * inv) / inv;
    }

    /**
     * Checking if key exist in object
     *
     * @param obj {a:1, b:1, c:1}
     * @param key 'b'
     * @returns true or false
     */
    public static hasProperty(obj: object, key: string): boolean {
        try {
            return obj && key in obj ? true : false;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            return false;
        }
    }

    /**
     * Wait (sleep) x seconds
     *
     * @param seconds time in seconds
     * @returns void
     */
    public static wait(seconds: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }

    /**
     *
     * @param hostname string like www.google.de, test.foo.local:80 or 192.168.20.20:80
     * @returns the hostname and port.
     */
    public static getHostnamePort(hostname: string): ifHostnamePort {
        const array = hostname.split(':');
        return {
            hostname: typeof array[0] !== 'undefined' ? array[0] : '',
            port: typeof array[1] !== 'undefined' ? Number(array[1]) : undefined,
        };
    }

    /**
     *
     * @param hostname like www.google.com
     * @returns string
     */
    public static async lookup(hostname: string): Promise<string> {
        const hp = this.getHostnamePort(hostname);
        const dns = await dnsPromises.lookup(hp.hostname);
        let address = dns && dns.address ? dns.address : hp.hostname;
        if (hp.port !== undefined) {
            address = `${address}:${hp.port}`;
        }
        return address;
    }

    /**
     * Checks if server (webserver) is reachable
     *
     * @param hostname hostname or ip address. For example huhu.foo or 192.168.20.30)
     * @param port port for example (80, 8080, ...
     * @returns true or false
     */
    public static async probe(hostname: string, port: number): Promise<boolean> {
        hostname = await this.lookup(hostname);
        return new Promise(resolve => {
            // eslint-disable-next-line @typescript-eslint/require-await
            tcpPing.probe(hostname, port, async (error: any, isAlive: any) => {
                resolve(isAlive);
            });
        });
    }

    /**
     * deletes special characteres
     *
     * @param text : text
     * @returns text without special characters
     */
    public static delSonderzeichen(text: string): string {
        if (text) {
            text = text.replace(/\r/g, '');
            text = text.replace(/\n/g, '');
            text = text.replace(/\t/g, ' ');
            text = text.replace(/\f/g, '');
        }
        return text;
    }

    /**
     * deletes special characteres in text (must be a stringyfy object) and returns as object if possible
     *
     * @param text text or stingfy
     * @returns text if possible
     */
    public static JsonParseDelSonderszeichen(text: string): object | string {
        try {
            return typeof text === 'string' ? JSON.parse(this.delSonderzeichen(text)) : text;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            return text;
        }
    }

    /**
     * checks if two objects equal
     *
     * @param obj1 object 1
     * @param obj2  object 2
     * @returns objects equal, true or false
     */
    public static isEqual(obj1: object, obj2: object): boolean {
        if (typeof obj1 === 'object' && typeof obj2 === 'object') {
            return _.isEqual(obj1, obj2);
        }
        return obj1 === obj2;
    }

    /**
     * if function / method is a async function / method
     *
     * @param funct function
     * @returns function is async
     */
    public static isAsync(funct: any): boolean {
        if (funct && funct.constructor) {
            return funct.constructor.name == 'AsyncFunction';
        }
        return false;
    }

    /**
     * Get datatype of value
     *
     * @param value : value
     * @returns : datatype of value (object, array, boolean)
     */
    public static getPropertyType(value: any): string {
        let type;
        switch (Object.prototype.toString.call(value)) {
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
                type = '';
                break;
        }
        return type;
    }

    /**
     * Converts the value to given type. Example value to string, number, ...
     *
     * @param value : any type of value
     * @param type :   datatype for converting the value
     * @returns any kind of object
     */
    public static convertPropertyType(value: any, type: string): any {
        if (value === null || value === undefined) {
            return value;
        }
        let valuenew = value;
        switch (type) {
            case 'number':
                valuenew = Number(value);
                break;
            case 'string':
                valuenew = value.toString();
                break;
            case 'boolean':
                valuenew = Boolean(Number(value));
                break;
            case 'object':
                valuenew = `{${value.toString()}}`;
                break;
            case 'array':
                valuenew = `[${value.toString()}]`;
                break;
            default:
                valuenew = value;
                break;
        }
        return valuenew;
    }

    /**
     *
     * @param object object
     * @returns object
     */
    public static copyObject(object: any): any {
        if (object && typeof object === 'object') {
            return _.cloneDeep(object);
        }
        return object;
    }

    /**
     *
     * @param object1 object1
     * @param object2 object2
     * @returns object1 + object2
     */
    public static mergeObject(object1: any, object2: any): any {
        return _.merge(object1, object2);
    }

    /**
     * gets acutal time
     */
    public static getUnixTimestampNow(): number {
        return Math.ceil(new Date().getTime());
    }

    /**
     * Mappes values from Lupusec 0 .. 254 to 0 .. 360 degree
     *
     * @param value hue value from lupusec
     * @returns hue value in degree
     */
    public static hueLupusecToDegree(value: number): number {
        if (value === null || value === undefined) {
            return value;
        }
        return Math.floor((360 * value) / 254);
    }

    /**
     * Mappes values from 0 .. 360 degree to Lupusec 0 .. 254
     *
     * @param value hue value in degree
     * @returns hue value from lupusec
     */
    public static hueDegreeToLupusec(value: number): number {
        if (value === null || value === undefined) {
            return value;
        }
        return Math.floor((254 * value) / 360);
    }

    /**
     * Mappes values from Lupusec 0 .. 254 to 0% .. 100%
     *
     * @param value saturation value from Lupusec
     * @returns saturation value in %
     */
    public static satLupusecToPercent(value: number): number {
        if (value === null || value === undefined) {
            return value;
        }
        return Math.floor((100 * value) / 254);
    }

    /**
     * Mappes values from 0% .. 100% to Lupusec value 0 .. 254
     *
     * @param value saturation value in %
     * @returns saturation value from Lupusec
     */
    public static satPercentToLupusec(value: number): number {
        if (value === null || value === undefined) {
            return value;
        }
        return Math.floor((254 * value) / 100);
    }

    /**
     * Mappes values from Lupusec 0 .. 164 to 2220 .. 6500 K
     *
     * @param value temperature value from Lupusec
     * @returns temperature value in kelvin
     */
    public static tempLupusecToKelvin(value: number): number {
        if (value === null || value === undefined) {
            return value;
        }
        const m = (2200 - 6500) / (500 - 169);
        const b = 6500 - m * 169;
        return Math.floor(m * value + b);
    }

    /**
     * Mappes values from 2220 .. 6500K to Lupusec value 0 .. 164
     *
     * @param value temperature value in kelvin
     * @returns temperature value from Lupusec
     */
    public static tempKelvinToLupusec(value: number): number {
        if (value === null || value === undefined) {
            return value;
        }
        const m = (500 - 169) / (2200 - 6500);
        const b = 500 - m * 2200;
        return Math.floor(m * value + b);
    }
}

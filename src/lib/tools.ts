import { promises as dnsPromises } from 'dns';
import _ from 'lodash';
import * as tcpPing from 'tcp-ping';

export interface ifHostnamePort {
    hostname: string;
    port: number | undefined;
}

/**
 * round(2.74, 0.1) = 2.7
 * round(2.74, 0.25) = 2.75
 * round(2.74, 0.5) = 2.5
 * round(2.74, 1.0) = 3.0
 * @param value a number like 2.7, 2.75
 * @param step a number like 0.1, or 2.7
 * @returns a number
 */
export function round(value: number, step: number): number {
    step || (step = 1.0);
    const inv = 1.0 / step;
    return Math.round(value * inv) / inv;
}

/**
 * Checking if key exist in object
 * @param obj {a:1, b:1, c:1}
 * @param key 'b'
 * @returns true or false
 */
export function hasProperty(obj: object, key: string): boolean {
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
export function wait(seconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

/**
 *
 * @param hostname string like www.google.de, test.foo.local:80 or 192.168.20.20:80
 * @returns the hostname and port.
 */
export function getHostnamePort(hostname: string): ifHostnamePort {
    const array = hostname.split(':');
    return {
        hostname: typeof array[0] !== 'undefined' ? array[0] : '',
        port: typeof array[1] !== 'undefined' ? Number(array[1]) : undefined,
    };
}

/**
 *
 * @param hostname like www.google.com
 * @returns
 */
export async function lookup(hostname: string): Promise<string> {
    const hp = getHostnamePort(hostname);
    const dns = await dnsPromises.lookup(hp.hostname);
    let address = dns && dns.address ? dns.address : hp.hostname;
    if (hp.port !== undefined) address = `${address}:${hp.port}`;
    return address;
}

/**
 * Checks if server (webserver) is reachable
 * @param hostname hostname or ip address. For example huhu.foo or 192.168.20.30)
 * @param portport, for example (80, 8080, ...
 * @returns
 */
export async function probe(hostname: string, port: number): Promise<boolean> {
    hostname = await lookup(hostname);
    return new Promise((resolve) => {
        tcpPing.probe(hostname, port, async (error: any, isAlive: any) => {
            resolve(isAlive);
        });
    });
}

/**
 * deletes special characteres
 * @param text : text
 * @returns text without special characters
 */
export function delSonderzeichen(text: string): string {
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
 * @text text (stringify object)
 * @returns text if possible
 */
export function JsonParseDelSonderszeichen(text: string): object | string {
    try {
        return typeof text === 'string' ? JSON.parse(delSonderzeichen(text)) : text;
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
export function isEqual(obj1: object, obj2: object): boolean {
    if (typeof obj1 === 'object' && typeof obj2 === 'object') return _.isEqual(obj1, obj2);
    return obj1 === obj2;
}

/**
 * if function / method is a async function / method
 * @param funct function
 * @returns function is async
 */
export function isAsync(funct: any): boolean {
    if (funct && funct.constructor) return funct.constructor.name == 'AsyncFunction';
    return false;
}

/**
 * Get datatype of value
 * @param {any} value : value
 * @returns {string} : datatype of value (object, array, boolean)
 */
export function getPropertyType(value: any): string {
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
 * @param {*} value : any type of value
 * @param {string} type :   datatype for converting the value
 * @returns
 */
export function convertPropertyType(value: any, type: string): any {
    if (value === null || value === undefined) return value;
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
            valuenew = '{' + value.toString() + '}';
            break;
        case 'array':
            valuenew = '[' + value.toString() + ']';
            break;
        default:
            valuenew = value;
            break;
    }
    return valuenew;
}

export function copyObject(object: any): any {
    if (object && typeof object === 'object') {
        return _.cloneDeep(object);
    } else {
        return object;
    }
}

export function mergeObject(object1: any, object2: any): any {
    return _.merge(object1, object2);
}

/**
 * gets acutal time
 */
export function getUnixTimestampNow(): number {
    return Math.ceil(new Date().getTime());
}

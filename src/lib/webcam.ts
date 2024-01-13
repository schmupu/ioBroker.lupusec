import axios from 'axios';
import * as http from 'http';
import { createHttpTerminator } from 'http-terminator';
import * as https from 'https';
import * as tools from './tools';

export class MJPEGtoJPG {
    private adapter: any;
    private chunks: any[];

    /**
     *
     * @param adapter iobroker Adapter
     */
    constructor(adapter: any) {
        this.adapter = adapter;
        this.chunks = [];
    }

    /**
     *
     * @param data data
     * @param callback callback function
     */
    public mjpegTojpeg(data: any, callback?: (value: any) => void): void {
        const soi = Buffer.from([0xff, 0xd8]);
        const eoi = Buffer.from([0xff, 0xd9]);
        if (this.chunks.length === 0) {
            const startIndex = data.indexOf(soi);
            const slicedData = data.slice(startIndex, data.length);
            this.chunks.push(slicedData);
        } else if (data.indexOf(eoi) != -1) {
            const endIndex = data.indexOf(eoi) + 2;
            const slicedData = data.slice(0, endIndex);
            this.chunks.push(slicedData);
            const img = Buffer.concat(this.chunks);
            callback && callback(img);
            this.chunks = [];
            this.mjpegTojpeg(data);
        } else {
            this.chunks.push(data);
        }
    }

    /**
     * clear all
     */
    public clearAll(): void {
        this.chunks = [];
    }
}

export class Webcam {
    private adapter: any;
    private webcams: any;
    private host: string;
    private port: number;
    private static instance: Webcam;
    private httpTerminator: any; // HttpTerminator;

    /**
     * Constructur webcam instance
     * @param adapter iobroker adapter
     * @param webcams object with webcam from Lupusec system
     */
    private constructor(adapter: any, webcams: any) {
        this.adapter = adapter;
        this.webcams = webcams;
        this.host = this.adapter.config.webcam_bind;
        this.port = this.adapter.config.webcam_port;
        this.httpTerminator = undefined;
    }

    /**
     * Singelton, create webcam instance
     * @param adapter iobroker adapter
     * @param webcams object with webcam from Lupusec system
     * @returns returns webcam instance
     */
    static getInstance(adapter: any, webcams: any): Webcam {
        if (!this.instance) this.instance = new Webcam(adapter, webcams);
        return this.instance;
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
     * Start Server
     * @returns
     */
    public async startServer(): Promise<void> {
        const host = this.host;
        const port = this.port;
        if (port > 0 && host) {
            try {
                const bind = host ? host + ':' + port : port;
                const running = await tools.probe(host, port);
                if (running) {
                    this.adapter.log.debug(`Webcam Listining Service on ${bind} running`);
                    return;
                }
                this.adapter.log.debug(`Starting Webcam Listining Service on ${bind}`);
                const server = http.createServer();
                this.httpTerminator = createHttpTerminator({
                    server,
                });
                server.on('error', (error) => {
                    this.adapter.log.error(`Error listining Webcam on port ${bind} (${error})`);
                });
                server.on('request', async (req, res) => {
                    let controller: any;
                    if (res && res.socket && req && req.url) {
                        // if webcam request not running, start now
                        const reqid = req.url.replace(/^(\/image\/|\/stream\/)/g, '');
                        if (req.url.startsWith('/image/')) {
                            controller = await this.startStreamingClient(reqid, this.webcams[reqid].url, 'image', res);
                        } else if (req.url.startsWith('/stream/')) {
                            controller = await this.startStreamingClient(reqid, this.webcams[reqid].url, 'stream', res);
                        } else {
                            res.end();
                        }
                        res.socket.on('close', () => {
                            if (controller) controller.abort();
                        });
                    }
                });
                server.on('close', () => {
                    this.adapter.log.debug(`Stopping Webcam Listining Service on ${bind}`);
                });
                server.listen(port, host);
            } catch (error: any) {
                this.adapter.log.error(`Error: ${error.toString()}`);
            }
        }
    }

    /**
     * Stop Server
     */
    private async stoptServer(): Promise<void> {
        if (this.httpTerminator) {
            this.httpTerminator.terminate();
            delete this.httpTerminator;
        }
    }

    /**
     *
     * @param id
     * @param url
     * @param type
     * @param res
     * @returns
     */
    public async startStreamingClient(
        id: string,
        url: string,
        type: string,
        res: any,
    ): Promise<AbortController | void> {
        if (!id || !url) return;
        const uniqueid = Date.now().toString(36);
        const converter = new MJPEGtoJPG(this.adapter);
        const controller = new AbortController();
        const myURL = new URL(url);
        const path = myURL.pathname.slice(1) + (myURL.search.length > 0 ? '&' + myURL.search.slice(1) : '');
        const camnr = id.slice(-1);
        const urlPasthru = '/action/passthru';
        const uri = await this.getAbsoluteURI(`${urlPasthru}?cam=${camnr}&cmd=${path}`);
        const auth =
            'Basic ' +
            Buffer.from(this.adapter.config.alarm_user + ':' + this.adapter.config.alarm_password).toString('base64');
        const agent = new https.Agent({
            rejectUnauthorized: false,
        });
        try {
            const response = await axios.get(uri, {
                httpsAgent: agent,
                headers: {
                    Authorization: auth,
                },
                responseType: 'stream',
                signal: controller.signal,
            });
            let contenttype = response.headers['content-type'];
            const stream = response?.data;
            if (stream) this.adapter.log.debug(`Starting Webcam Client  ${id} with unique id (${uniqueid})`);
            stream.on('data', (data: any) => {
                switch (type) {
                    case 'image':
                        res.setHeader('Content-type', 'image/jpeg');
                        converter.mjpegTojpeg(data, (img) => {
                            // fs.writeFileSync(`/Users/thorsten.stueben/Downloads/${id}.jpg`, img);
                            res.end(img);
                            controller.abort();
                        });
                        break;
                    case 'stream':
                        if (contenttype) {
                            res.setHeader('Content-type', contenttype);
                            contenttype = '';
                        }
                        res.write(data, 'binary');
                        break;
                    default:
                        controller.abort();
                        break;
                }
            });
            stream.on('end', () => {
                converter.clearAll();
                this.adapter.log.debug(`Stopping Webcam Client  ${id} with unique id (${uniqueid})`);
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            stream.on('error', (error: any) => {
                converter.clearAll();
                this.adapter.log.debug(`Error, stopping Webcam Client  ${id} with unique id (${uniqueid})`);
            });
        } catch (error: any) {
            converter.clearAll();
            this.adapter.log.error(`Error: ${error.toString()}`);
        }
        return controller;
    }
}

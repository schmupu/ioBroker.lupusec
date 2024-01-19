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
var webcam_exports = {};
__export(webcam_exports, {
  MJPEGtoJPG: () => MJPEGtoJPG,
  Webcam: () => Webcam
});
module.exports = __toCommonJS(webcam_exports);
var import_axios = __toESM(require("axios"));
var http = __toESM(require("http"));
var import_http_terminator = require("http-terminator");
var https = __toESM(require("https"));
var import_tools = require("./tools");
class MJPEGtoJPG {
  adapter;
  chunks;
  constructor(adapter) {
    this.adapter = adapter;
    this.chunks = [];
  }
  mjpegTojpeg(data, callback) {
    const soi = Buffer.from([255, 216]);
    const eoi = Buffer.from([255, 217]);
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
  clearAll() {
    this.chunks = [];
  }
}
class Webcam {
  adapter;
  webcams;
  host;
  port;
  static instance;
  httpTerminator;
  constructor(adapter, webcams) {
    this.adapter = adapter;
    this.webcams = webcams;
    this.host = this.adapter.config.webcam_bind;
    this.port = this.adapter.config.webcam_port;
    this.httpTerminator = void 0;
  }
  static getInstance(adapter, webcams) {
    if (!this.instance)
      this.instance = new Webcam(adapter, webcams);
    return this.instance;
  }
  async getAbsoluteURI(path) {
    const alarm_hostname = await import_tools.Tools.lookup(this.adapter.config.alarm_hostname);
    const aboluteURI = this.adapter.config.alarm_https === true ? "https://" + alarm_hostname + path : "http://" + alarm_hostname + path;
    return aboluteURI;
  }
  async startServer() {
    const host = this.host;
    const port = this.port;
    if (port > 0 && host) {
      try {
        const bind = host ? host + ":" + port : port;
        const running = await import_tools.Tools.probe(host, port);
        if (running) {
          this.adapter.log.debug(`Webcam Listining Service on ${bind} running`);
          return;
        }
        this.adapter.log.debug(`Starting Webcam Listining Service on ${bind}`);
        const server = http.createServer();
        this.httpTerminator = (0, import_http_terminator.createHttpTerminator)({
          server
        });
        server.on("error", (error) => {
          this.adapter.log.error(`Error listining Webcam on port ${bind} (${error})`);
        });
        server.on("request", async (req, res) => {
          let controller;
          if (res && res.socket && req && req.url) {
            const reqid = req.url.replace(/^(\/image\/|\/stream\/)/g, "");
            if (req.url.startsWith("/image/")) {
              controller = await this.startStreamingClient(reqid, this.webcams[reqid].url, "image", res);
            } else if (req.url.startsWith("/stream/")) {
              controller = await this.startStreamingClient(reqid, this.webcams[reqid].url, "stream", res);
            } else {
              res.end();
            }
            res.socket.on("close", () => {
              if (controller)
                controller.abort();
            });
          }
        });
        server.on("close", () => {
          this.adapter.log.debug(`Stopping Webcam Listining Service on ${bind}`);
        });
        server.listen(port, host);
      } catch (error) {
        this.adapter.log.error(`Error: ${error.toString()}`);
      }
    }
  }
  async stoptServer() {
    if (this.httpTerminator) {
      this.httpTerminator.terminate();
      delete this.httpTerminator;
    }
  }
  async startStreamingClient(id, url, type, res) {
    if (!id || !url)
      return;
    const uniqueid = Date.now().toString(36);
    const converter = new MJPEGtoJPG(this.adapter);
    const controller = new AbortController();
    const myURL = new URL(url);
    const path = myURL.pathname.slice(1) + (myURL.search.length > 0 ? "&" + myURL.search.slice(1) : "");
    const camnr = id.slice(-1);
    const urlPasthru = "/action/passthru";
    const uri = await this.getAbsoluteURI(`${urlPasthru}?cam=${camnr}&cmd=${path}`);
    const auth = "Basic " + Buffer.from(this.adapter.config.alarm_user + ":" + this.adapter.config.alarm_password).toString("base64");
    const agent = new https.Agent({
      rejectUnauthorized: false
    });
    try {
      const response = await import_axios.default.get(uri, {
        httpsAgent: agent,
        headers: {
          Authorization: auth
        },
        responseType: "stream",
        signal: controller.signal
      });
      let contenttype = response.headers["content-type"];
      const stream = response == null ? void 0 : response.data;
      if (stream)
        this.adapter.log.debug(`Starting Webcam Client  ${id} with unique id (${uniqueid})`);
      stream.on("data", (data) => {
        switch (type) {
          case "image":
            res.setHeader("Content-type", "image/jpeg");
            converter.mjpegTojpeg(data, (img) => {
              res.end(img);
              controller.abort();
            });
            break;
          case "stream":
            if (contenttype) {
              res.setHeader("Content-type", contenttype);
              contenttype = "";
            }
            res.write(data, "binary");
            break;
          default:
            controller.abort();
            break;
        }
      });
      stream.on("end", () => {
        converter.clearAll();
        this.adapter.log.debug(`Stopping Webcam Client  ${id} with unique id (${uniqueid})`);
      });
      stream.on("error", (error) => {
        converter.clearAll();
        this.adapter.log.debug(`Error, stopping Webcam Client  ${id} with unique id (${uniqueid})`);
      });
    } catch (error) {
      converter.clearAll();
      this.adapter.log.error(`Error: ${error.toString()}`);
    }
    return controller;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MJPEGtoJPG,
  Webcam
});
//# sourceMappingURL=webcam.js.map

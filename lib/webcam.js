'use strict';

const fs = require('fs');
const request = require("request");
const http = require('http');

class MJPEGtoJPG {
  constructor(adapter) {
    this.adapter = adapter;
    this.chunks = [];
  }
  mjpegTojpeg(data, callback) {
    const soi = Buffer.from([0xFF, 0xD8]);
    const eoi = Buffer.from([0xFF, 0xD9]);
    if (this.chunks.length === 0) {
      const startIndex = data.indexOf(soi);
      const slicedData = data.slice(startIndex, data.length);
      this.chunks.push(slicedData);
    } else if (data.indexOf(eoi) != -1) {
      const endIndex = data.indexOf(eoi) + 2;
      const slicedData = data.slice(0, endIndex);
      this.chunks.push(slicedData);
      const img = new Buffer.concat(this.chunks);
      callback && callback(img);
      this.chunks = [];
      this.mjpegTojpeg(data);
    } else {
      this.chunks.push(data);
    }
  }
}

class Webcam {

  constructor(adapter, port, host) {
    this.adapter = adapter;
    this.filenameimage;
    this.filenamemjpeg;
    this.callbackimage;
    this.callbakstream;
    this.client = [];
    this.host = host;
    this.port = port;
    this.requests = {};
    this.server = this.serverListen(this.port, this.host);
    this.checkClients();
  }

  serverListen(port, host) {
    if (port > 0 && host) {
      let bind = host ? host + ':' + port : port;
      this.adapter.log.info('Starting Webcam Listining Service ' + bind);
      let server = http.createServer();
      server.on('error', (error) => {
        this.adapter.log.error('Error listining Webcam on port ' + bind + ' (' + error + ')');
      });
      server.on('request', (req, res) => {
        if (res && req && req.url) {
          // if webcam request not running, start now
          let reqid = req.url.replace(/^(\/image\/|\/stream\/)/g, '');
          if (this.requests[reqid]) {
            if (!this.requests[reqid].req) {
              this.startRequest(this.requests[reqid].opt, reqid, this.requests[reqid].callback);
            }
          } else {
            res.end();
            return;
          }
          if (req.url.startsWith('/image/')) {
            res.setHeader('Content-type', 'image/jpeg');
          } else if (req.url.startsWith('/stream/')) {
            // res.writeHead(200, res.headers);
          } else {
            res.end();
            return;
          }
          let client = {
            url: req.url,
            res: res
          };
          this.client.push(client);
          res.socket.on('close', () => {
            for (let i in this.client) {
              if (this.client[i].res === res) {
                this.client.splice(i, 1);
                break;
              }
            }
          });
        }
      });
      server.listen(port, host);
      return server;
    }
  }

  closeClient(id) {
    if (id) {
      for (let j in this.client) {
        let url = this.client[j].url;
        if (url === '/image/' + id || url === '/stream/' + id) {
          if (this.client[j].res) this.client[j].res.end();
        }
      }
    }
  }

  checkClients() {
    setInterval(() => {
      let unixtime = Math.round(new Date().getTime());
      let wait = 300 * 1000;
      for (let i in this.requests) {
        if (this.requests[i].req && !this.requests[i].callback && (this.requests[i].ts + wait) <= unixtime) {
          let found = false;
          let reqid = i;
          for (let j in this.client) {
            let url = this.client[j].url;
            if (url === '/image/' + reqid || url === '/stream/' + reqid) {
              this.requests[i].ts = unixtime;
              found = true;
              break;
            }
          }
          if (found === false) {
            this.closeRequest(reqid);
          }
        }
      }
    }, 15 * 1000);
  }

  isRequestExist(id) {
    return this.requests[id] && this.requests[id].req ? true : false;
  }

  closeRequest(id) {
    if (this.requests[id] && this.requests[id].req) {
      this.requests[id].req.end();
      this.requests[id].req.abort();
    }
  }

  closeAndDeleteRequest(id) {
    if (this.requests[id] && this.requests[id].req) {
      this.requests[id].delete = true;
      this.requests[id].req.end();
      this.requests[id].req.abort();
    }
  }

  addRequestToQueue(opt, id, callback) {
    this.requests[id] = {
      req: undefined,
      opt: opt,
      callback: callback
    };
  }

  startRequest(opt, id, callback) {
    if ((!this.server && !callback) || (this.requests[id] && this.requests[id].req)) return;
    let req = request.get(opt);
    let unixtime = Math.round(new Date().getTime());
    this.requests[id] = {
      req: req,
      ts: unixtime,
      opt: opt,
      callback: callback
    };
    let converter = new MJPEGtoJPG();
    let header;
    req.on('response', (res) => {
      if (res) {
        this.adapter.log.info('Starting Webcam Request for ' + id);
        header = res.headers;
        res.on('error', (error) => {
          this.adapter.log.error('Error in response for ' + id + ' (' + error + ')');
        });
        // Image
        res.on('data', (chunk) => {
          converter.mjpegTojpeg(chunk, (img) => {
            // this.filenameimage && fs.writeFileSync(this.filenameimage, img);
            // this.callbackimage && this.callbackimage(img);
            callback && callback(img, null);
            for (let i = this.client.length; i--;) {
              if (this.client[i].url === '/image/' + id) {
                this.client[i].res.end(img);
              }
            }
          });
        });
        // Video Stream
        res.on('data', (chunk) => {
          callback && callback(null, chunk);
          for (let i = this.client.length; i--;) {
            if (this.client[i].url === '/stream/' + id) {
              if (this.client[i].header === undefined) {
                this.client[i].header = header;
                this.client[i].res.writeHead(200, header);
              }
              this.client[i].res.write(chunk, 'binary');
            }
          }
        });
      }
    });
    req.on('error', (error) => {
      if (this.requests[id]) {
        if (this.requests[id].delete === true) {
          delete this.requests[id];
        } else {
          this.requests[id].req = undefined;
        }
        this.closeClient(id);
      }
      this.adapter.log.error('Error requesting webcam for ' + id + ' (' + error + ')');
    });
    req.on('end', () => {
      if (this.requests[id]) {
        if (this.requests[id].delete === true) {
          delete this.requests[id];
        } else {
          this.requests[id].req = undefined;
        }
        this.closeClient(id);
      }
      this.adapter.log.info('End Webcam Request for ' + id);
    });
    req.end();
  }

}

module.exports = {
  Webcam: Webcam
};
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
    this.serverListen();
  }

  serverListen() {
    let server = http.createServer();

    server.on('error', (error) => {
      this.adapter.log.error('Error listining Webcam on port ' + this.port + ' (' + error + ')');
    });

    server.on('request', (req, res) => {
      if (res) {
        if (req.url && req.url.startsWith('/image/')) {
          res.setHeader('Content-type', 'image/jpeg');
        }
        if (req.url && req.url.startsWith('/stream/')) {
          // res.writeHead(200, res.headers);
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

    server.listen(this.port, this.host);
  }

  isRequestExist(image) {
    return this.requests[image] ? true : false;
  }

  closeRequest(image) {
    if (this.requests[image]) {
      this.requests[image].abort();
      this.requests[image].end();
      delete this.requests[image];
    }
  }

  startRequestImage(opt, pathimage, callback) {
    if(this.requests[pathimage]) return;
    let req = request.get(opt);
    this.requests[pathimage] = req;
    let converter = new MJPEGtoJPG();
    req.on('error', (error) => {
      this.adapter.log.error('Error requesting webcam url of alarm sytem ' + ' (' + error + ')');
    });
    // Image
    req.on('response', (res) => {
      res.on('error', (error) => {
        this.adapter.log.error('Error in response ' + ' (' + error + ')');
      });
      res.on('data', (chunk) => {
        converter.mjpegTojpeg(chunk, (img) => {
          // this.filenameimage && fs.writeFileSync(this.filenameimage, img);
          // this.callbackimage && this.callbackimage(img);
          callback && callback(img);
          for (let i = this.client.length; i--;) {
            if (this.client[i].url === pathimage) {
              this.client[i].res.end(img);
            }
          }
        });
      });
    });
    req.on('end', () => {
      delete this.requests[pathimage];
      // this.adapter.log.info('End requesting webcam url of alarm sytem ');
    });
    req.end();
  }

  startRequestStream(opt, pathstream) {
    if(this.requests[pathstream]) return;
    let req = request.get(opt);
    this.requests[pathstream] = req;
    let header; 
    req.on('error', (error) => {
      this.adapter.log.error('Error requesting webcam url of alarm sytem ' + ' (' + error + ')');
    });

    // Video Stream
    req.on('response', (res) => {
      header = res.headers;
      res.on('error', (error) => {
        this.adapter.log.error('Error in response ' + ' (' + error + ')');
      });
      res.on('data', (chunk) => {
        // this.callbackstream && this.callbackstream(chunk);
        for (let i = this.client.length; i--;) {
          if (this.client[i].url === pathstream) {
            if(this.client[i].header === undefined) {
              this.client[i].header = header;
              this.client[i].res.writeHead(200, header);
            }
            this.client[i].res.write(chunk, 'binary');
          }
        }
      });
    });
    req.on('end', () => {
      delete this.requests[pathstream];
      // this.adapter.log.info('End requesting webcam url of alarm sytem ');
    });
    req.end();
  }
}


module.exports = {
  Webcam: Webcam
};
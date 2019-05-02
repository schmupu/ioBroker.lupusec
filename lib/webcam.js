'use strict';

const fs = require('fs');
const request = require("request");
const http = require('http');

class Webcam {

  constructor(adapter, options) {
    this.adapter = adapter;
    this.chunks = [];
    this.filenameimage;
    this.filenamemjpeg;
    this.callbackimage;
    this.callbakstream;
    this.opt = options;
    this.clientsimage = [];
    this.clientsstream = [];
    this.serverimage;
    this.serverstream;
  }

  writeImageToFile(file) {
    this.filenameimage = file;
  }

  writeImageToCallback(callback) {
    this.callbackimage = callback;
  }

  writeStreamToCallback(callback) {
    this.callbackstream = callback;
  }

  listenServerStream(port) {
    this.closeServerStream();
    this.serverstream = http.createServer();
    this.serverstream.on('error', (error) => {
      this.adapter.log.error('Error listining Webcam on port ' + port + ' (' + error + ')');
    });
    this.serverstream.listen(port);
  }

  listenServerImage(port) {
    this.closeServerImage();
    this.serverimage = http.createServer();
    this.serverimage.on('error', (error) => {
      this.adapter.log.error('Error listining Webcam on port ' + port + ' (' + error + ')');
    });
    this.serverimage.listen(port);
  }

  closeServerImage() {
    if (this.serverimage) {
      this.serverimage.close();
    }
  }

  closeServerStream() {
    if (this.serverstream) {
      this.serverstream.close();
    }
  }

  _mjpegTojpeg(data, callback) {
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
      this._mjpegTojpeg(data);
    } else {
      this.chunks.push(data);
    }
  }

  start() {
    let req = request.get(this.opt);
    req.on('error', (error) => {
      this.adapter.log.error('Error requesting webcam url of alarm sytem ' + ' (' + error + ')');
    });
    // Video Stream
    req.on('response', (res) => {
      res.on('error', (error) => {
        this.adapter.log.error('Error in response ' + ' (' + error + ')');
      });
      res.on('data', (chunk) => {
        this.callbackstream && this.callbackstream(chunk);
        for (let i = this.clientsstream.length; i--;) {
          this.clientsstream[i].write(chunk, 'binary');
        }
      });
      if (this.serverstream) {
        this.serverstream.on('request', (req, rres) => {
          if (rres) {
            rres.writeHead(200, res.headers);
            this.clientsstream.push(rres);
            rres.socket.on('close', () => {
              this.clientsstream.splice(this.clientsstream.indexOf(rres), 1);
            });
          }
        });
      }
    });
    // Image
    req.on('response', (res) => {
      res.on('error', (error) => {
        this.adapter.log.error('Error in response ' + ' (' + error + ')');
      });
      res.on('data', (chunk) => {
        this._mjpegTojpeg(chunk, (img) => {
          this.filenameimage && fs.writeFileSync(this.filenameimage, img);
          this.callbackimage && this.callbackimage(img);
          for (let i = this.clientsimage.length; i--;) {
            this.clientsimage[i].end(img);
          }
        });
      });
      if (this.serverimage) {
        this.serverimage.on('request', (req, rres) => {
          if (rres) {
            rres.setHeader('Content-type', 'image/jpeg');
            this.clientsimage.push(rres);
            rres.socket.on('close', () => {
              this.clientsimage.splice(this.clientsimage.indexOf(rres), 1);
            });
          }
        });

      }
    });
    req.end();
  }

}

module.exports = {
  Webcam: Webcam
};
'use strict';

/**
 * if function called async
 * @param {function} funct - function to check
 */
function isAsync(funct) {
  if (funct && funct.constructor) return funct.constructor.name == 'AsyncFunction';
  return undefined;
}

class Process {

  constructor(adapter,pollsec) {
    this.setPollSec(pollsec || 1);
    this.processes = [];
    this.timeoutid = undefined;
    this.adapter = adapter;
    this.pause = false;
  }

  /** 
   * Seconds to next poll
   */
  getPollSec() {
    return this.pollsec;
  }

  /** 
  * Seconds to next poll
  */
  setPollSec(pollsec) {
    this.pollsec = pollsec;
  }


  async setPause(value) {
    return this.pause = (value === true);
  }

  async getPause() {
    return this.pause;
  }

  /**
   * delete Process from process chain
   * @param {number} key - indentifier 
   */
  async delFromProcess(key) {
    for (let i in this.processes) {
      if (this.processes[i].key === key) {
        this.processes.splice(i, 1);
        if (this.timeoutid && this.processes.length <= 0) {
          clearTimeout(this.timeoutid);
          this.timeoutid = undefined;
        }
        return true;
      }
    }
    return false;
  }

  /**
   * Add process to array
   * @param {function} funct - function to add to queue
   * @param {string} key - identifier for added function to process. 
   * @param {boolen} loop - if true, after proccessing the function will add to queue again
   */
  async addToProcess(funct, object) {
    if (!object || !funct) return;
    let index = -1;
    let functname = funct.toString();
    for (let i = 0; i < this.processes.length; i++) {
      if (this.processes[i].key === object.key) {
        index = i;
        break;
      }
    }
    if (index >= 0) {
      this.processes[index] = {
        key: object.key || Date.now(), // identifier,
        funct: funct,
        functname: functname,
        loop: object.loop === true ? true : false,
        time: object.time || 0,
        localtime: Date.now()
      };
    } else {
      this.processes.push({
        key: object.key || Date.now(), // identifier,
        funct: funct,
        functname: functname,
        loop: object.loop === true ? true : false,
        time: object.time || 0,
        localtime: Date.now()
      });
    }
    if (!this.timeoutid) await this.runProcess();
  }

  async runProcess() {
    let localtime = Date.now();
    if (this.processes.length == 0) {
      this.timeoutid = undefined;
      return;
    }
    if (this.pause === true) {
      this.timeoutid = setTimeout(async () => await this.runProcess(), this.getPollSec() * 1000);
      return;
    }
    this.adapter.log.debug('Process Queue: ' + JSON.stringify(this.processes));
    let process = this.processes.shift();
    if (process && (process.localtime + process.time) > localtime) {
      this.processes.push(process);
      this.timeoutid = setTimeout(async () => await this.runProcess(), 1);
      return;
    }
    if (process && process.funct) {
      this.adapter.log.debug('Function: ' + process.funct);
      this.adapter.log.debug('Process: ' + JSON.stringify(process));
      try {
        let result = isAsync(process.funct) ? await process.funct() : process.funct();
      } catch (error) {
        this.adapter.log.error('could not procces functions in runProcess: ' + error);
      }
      process.localtime = localtime;
    }
    if (process && process.loop) this.processes.push(process);
    if (this.processes.length > 0) {
      this.timeoutid = setTimeout(async () => await this.runProcess(), this.getPollSec() * 1000);
    } else {
      this.timeoutid = undefined;
    }
  }
}


module.exports = {
  Process: Process
};
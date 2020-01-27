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

  constructor(adapter, name) {
    this.setPollSec(adapter.config.alarm_polltime || 1);
    this.processes = [];
    this.timeoutid = undefined;
    this.adapter = adapter;
    this.setError(false);
    this.keycnt = 1000;
    this.name = name;
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

  setError(error) {
    this.error = error;
  }

  getError() {
    return this.error;
  }

  /**
   * delete Process from process chain
   * @param {number} key - indentifier 
   */
  async delFromProcess(key) {
    for (let i in this.processes) {
      if (this.processes[i].key === key) {
        this.processes.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Add process to array
   * @param {function} funct - function to add to queue
   * @param {string} key - identifier for added function to process. 
   * @param {number} prio - priority, 1 ist highest, 99 lowest. No value is equal to 99
   * @param {boolen} loop - if true, after proccessing the function will add to queue again
   */
  async addToProcess(funct, object) {
    if (!object || !funct) return;
    let index = -1;
    let prio = this.processes.length > 0 ? this.processes[0].prio : undefined;
    for (let i = 0; i < this.processes.length; i++) {
      if (this.processes[i].prio > object.prio) {
        this.processes.splice(i, 0, {}); // insert entry between entries
        index = i;
        break;
      }
    }
    if (index === -1) {
      this.processes.push({
        key: object.key || 'KEY' + this.keycnt++, // identifier,
        prio: object.prio || 99, // Prio: 1 high, 99 low
        funct: funct,
        loop: object.loop === true ? true : false
      });
    } else {
      this.processes[index] = {
        key: object.key || 'KEY' + this.keycnt++, // identifier,
        prio: object.prio || 99, // Prio: 1 high, 99 low
        funct: funct,
        loop: object.loop === true ? true : false
      };
    }
    if (prio !== undefined && object.prio < prio) {
      clearTimeout(this.timeoutid);
      this.timeoutid = undefined;
    }
    if (!this.timeoutid && this.processes.length > 0) {
      this.timeoutid = setTimeout(async () => {
        await this.startProcess();
      });
    }
  }

  async startProcess() {
    if (this.processes.length > 0) {
      this.adapter.log.debug('Process Queue: ' + JSON.stringify(this.processes));
      let process = this.processes[0];
      if (process.funct) {
        this.adapter.log.debug('Prio: ' + process.prio + ', Function: ' + process.funct);
        this.adapter.log.debug('Process: ' + JSON.stringify(process));
        try {
          let result = isAsync(process.funct) ? await process.funct() : process.funct();
        } catch (error) {
          this.adapter.log.error('could not procces functions in startProcess: ' + error);
        }
      }
      this.processes.shift();
      if (process.loop) {
        // await this.addToProcess(process.funct, process.key, process.prio, process.loop);
        await this.addToProcess(process.funct, {
          key: process.key,
          prio: process.prio,
          loop: process.loop
        });
      }
      if (this.processes.length > 0) {
        this.timeoutid = setTimeout(async () => {
          await this.startProcess();
        }, this.getPollSec() * 1000);
      } else {
        this.timeoutid = undefined;
      }
    } else {
      this.timeoutid = undefined;
    }
  }

}




class ProcessOld {

  constructor(adapter, name) {
    this.setPollSec(adapter.config.alarm_polltime || 1);
    this.processes = [];
    this.timeoutid = undefined;
    this.adapter = adapter;
    this.setError(false);
    this.keycnt = 1000;
    this.name = name;
    this.startProcess();
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

  setError(error) {
    this.error = error;
  }

  getError() {
    return this.error;
  }

  /**
   * delete Process from process chain
   * @param {number} key - indentifier 
   */
  async delFromProcess(key) {
    for (let i in this.processes) {
      if (this.processes[i].key === key) {
        this.processes.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Add process to array
   * @param {function} funct - function to add to queue
   * @param {string} key - identifier for added function to process. 
   * @param {number} prio - priority, 1 ist highest, 99 lowest. No value is equal to 99
   * @param {boolen} loop - if true, after proccessing the function will add to queue again
   */
  async addToProcess(funct, object) {
    if (!object) object = {};
    let unixtime = Math.round((new Date()).getTime());
    let key = object.key || 'KEY' + this.keycnt++; // identifier
    let prio = object.prio || 99; // Prio: 1 high, 99 low
    let loop = object.loop === true ? true : false; // repeat process endless loop
    let wait = object.wait; // the same proccess can only be repeated between x sec
    let firstrun = object.firstrun === undefined ? true : false;
    if (!prio || prio < 1 || prio > 99) prio = 99;
    for (let i = 0; i < this.processes.length; i++) {
      if (key && this.processes[i].key === key) {
        this.processes[i] = {
          key: key,
          prio: prio,
          funct: funct,
          loop: loop,
          ts: unixtime,
          wait: wait,
          firstrun: firstrun
        };
        if (i === 0 && prio === 1 && !this.getError()) {
          await this.startProcess();
        }
        return;
      }
      if (this.processes[i].prio > prio) {
        this.processes.splice(0, i, {
          key: key,
          prio: prio,
          funct: funct,
          loop: loop,
          ts: unixtime,
          wait: wait,
          firstrun: firstrun
        });
        // if prio 1, start processes immediately
        // if (prio == 1 && this.timeoutid && !this.error) {
        if (i === 0 && prio === 1 && !this.getError()) {
          await this.startProcess();
        }
        return;
      }
    }
    this.processes.push({
      key: key,
      prio: prio,
      funct: funct,
      loop: loop,
      ts: unixtime,
      wait: wait,
      firstrun: firstrun
    });
  }

  /**
   * avaluate process
   */
  async startProcess() {
    if (this.processes.length >= 0) {
      let unixtime = Math.round((new Date()).getTime());
      this.adapter.log.debug('Process Queue: ' + JSON.stringify(this.processes));
      if (!this.getError()) {
        if (this.timeoutid) {
          // clear running timeouts
          clearTimeout(this.timeoutid);
          this.timeoutid = null;
        }
        // let process = this.processes.shift();
        let process;
        for (let i in this.processes) {
          if (this.processes[i].wait && this.processes[i].firstrun === false && (unixtime - this.processes[i].ts) < this.processes[i].wait * 1000) {
            continue;
          }
          process = this.processes[i];
          this.processes.splice(i, 1);
          break;
        }
        if (process) {
          if (process.funct) {
            this.adapter.log.debug('Prio: ' + process.prio + ', Function: ' + process.funct + ', Time: ' + new Date(process.ts).toISOString() + ', Now: ' + new Date().toISOString());
            this.adapter.log.debug('Process: ' + JSON.stringify(process));
            try {
              let result = isAsync(process.funct) ? await process.funct() : process.funct();
            } catch (error) {
              this.adapter.log.error('could not procces functions in startProcess: ' + error);
            }
          }
          if (process.loop) {
            // await this.addToProcess(process.funct, process.key, process.prio, process.loop);
            await this.addToProcess(process.funct, {
              key: process.key,
              prio: process.prio,
              loop: process.loop,
              wait: process.wait,
              firstrun: process.firstrun
            });
          }
        }
      }
      this.timeoutid = setTimeout(async () => {
        await this.startProcess();
      }, this.getPollSec() * 1000);
    }
  }

}

module.exports = {
  Process: Process
};
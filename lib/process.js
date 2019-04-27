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

  constructor(adapter) {
    this.setPollSec(adapter.config.alarm_polltime || 1);
    this.processes = [];
    this.timeoutid = undefined;
    this.adapter = adapter;
    this.setError(false);
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
     * Add process to array
     * @param {function} funct - function to add to queue
     * @param {number} prio - priority, 1 ist highest
     * @param {boolen} loop - if true, after proccessing the function will add to queue againg
     */
  async addToProcess(funct, prio, loop) {
    if (typeof prio === 'boolean') {
      loop = prio;
      prio = undefined;
    }
    if (!prio || prio < 1 || prio > 99) prio = 99;
    if (!loop) loop = false;
    for (let i = 0; i < this.processes.length; i++) {
      if (this.processes[i].prio > prio) {
        let tmp = [];
        this.processes = tmp.concat(this.processes.slice(0, i), {
          prio: prio,
          funct: funct,
          loop: loop
        }, this.processes.slice(i));
        // if prio 1, start processes immediately
        // if (prio == 1 && this.timeoutid && !this.error) {
        if (prio == 1 && !this.getError()) {
          await this.startProcess();
        }
        return;
      }
    }
    this.processes.push({
      prio: prio,
      funct: funct,
      loop: loop
    });
  }

  /**
   * avaluate process
   */
  async startProcess() {
    this.adapter.log.debug('Process Queue: ' + JSON.stringify(this.processes));
    if (this.timeoutid) {
      // clear running timeouts
      clearTimeout(this.timeoutid);
      this.timeoutid = undefined;
    }
    let process = this.processes.shift();
    if (process) {
      if (process.funct) {
        this.adapter.log.debug('Process: ' + JSON.stringify(process));
        try {
          let result = isAsync(process.funct) ? await process.funct() : process.funct();
        } catch (error) {
          this.adapter.log.error('could not procces functions in startProcess: ' + error);
        }
      }
      if (process.loop) {
        await this.addToProcess(process.funct, process.prio, process.loop);
      }
    }
    if (!this.timeoutid) {
      this.timeoutid = setTimeout(async () => {
        await this.startProcess();
      }, this.getPollSec() * 1000);
    }
  }

}

module.exports = {
  Process: Process
};
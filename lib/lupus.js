'use strict';

function test(adapter) {

  adapter.log.info("TEST TEST TEST TEST");

}


function lupus(adapter) {

  this.adapter = adapter;


  return this;

}

lupus.prototype.show = function() {

  test(this.adapter);
  this.adapter.log.info("HUHUHUHUHUHUHUHU");

}

//exports.test = test;
module.exports = lupus;

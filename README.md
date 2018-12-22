![Logo](admin/lupusec.png)
# ioBroker.lupusec
=================

[![Build Status](https://travis-ci.org/schmupu/ioBroker.lupusec.svg?branch=master)](https://travis-ci.org/schmupu/ioBroker.lupusec)
[![NPM version](http://img.shields.io/npm/v/iobroker.lupusec.svg)](https://www.npmjs.com/package/iobroker.lupusec)
[![Downloads](https://img.shields.io/npm/dm/iobroker.lupusec.svg)](https://www.npmjs.com/package/iobroker.lupusec)

[![NPM](https://nodei.co/npm/iobroker.lupusec.png?downloads=true)](https://nodei.co/npm/iobroker.lupusec/)

Requires node.js 6.0 or higher and Admin v3!

This adapter connects the Lupusec alarm system XT1 Plus, XT2, XT2 Plus and XT3 with ioBroker.
The XT1 (without Plus) will not be supported. You can read the status of the Lupusec sensors
like door, windows, water, smoke sensors and the status of the alarm system.
You can turn on switches and arm/disarm the alarm system.

You can find detailed information here: [Lupus](https://www.lupus-electronics.de/en)

## Installation

1. Install the adapter
The easiest way is to configure the lupusec.iobroker adapter via the discovery adapter in ioBroker. The discovery adapter search for the right IP-address of the Lupusec alarm system. The other way is it, to configure it manually

2. Manually configuration of the adapter
Choose the IP-Address or hostname from the Lupusec alarm system. Choose https (recommended) if possible.
For only reading the status, select a user without write access. If you want to change the status
(for example, turn on/off the light or arm/disarm the alarm) pick a user with write access.


By default all Lupssec devices will be on the ioBroker object tab  displayed.
Fully supported and individually adapted are following devices:

  - Door contact / window contact (Type 4)
  - Water sensor (Type 5)
  - Motion detector / 360 degree motion detector (Type 9)
  - Smoke Detector / Heat Detector (Type 14)
  - Status Indicator / Mini Indoor Siren (Type 22)
  - Power Switch (Type 24)
  - Keypad (Type 37)
  - Power Switch Meter (Type 49)
  - Room sensor V1 (Type 54)
  - Dimmer (Type 66)
  - Hue (Type 74)
  - Roller shutter relay V1 (Type 76)
  - Light sensor (Type 78)
  - Radiator thermostat (Type 79)

The two states apple_home_a1 and lupusec.0.status.apple_home_a2 for the Apple Homekit adapter yahka supported. You can turn in addition to the lupusec states the alarm system for area 1 and 2 on and off.  

If you own a device that is not listed in the list above, please contact me
at Thorsten Stueben <thorsten@stueben.de>.


## Changelog

### 0.4.1 (22.12.2018)
* (Stübi) Changed core adapter   

### 0.4.0 (07.12.2018)
* (Stübi) Add Light sensor (type 78)  

### 0.3.9 (26.11.2018)
* (Stübi) Add Apple home alarm status  

### 0.3.8 (13.11.2018)
* (Stübi) Add dimmer / relais (type 66)  

### 0.3.7 (12.11.2018)
* (Stübi) Bugfixing

### 0.3.6 (31.10.2018)
* (Stübi) Bugfixing and new status alarm_ex

### 0.3.5 (21.10.2018)
* (Stübi) Bugfixing and changing of the polling mechanism

### 0.3.4 (30.09.2018)
* (Stübi) password will be encrypted. Translation of configuration

### 0.3.2 (15.09.2018)
* (Stübi) add debug messages

### 0.3.1 (12.09.2018)
* (Stübi) Hue, room sensor, power switch added

### 0.2.7 (19.08.2018)
* (Stübi) Fixing error update function

### 0.2.6 (17.08.2018)
* (Stübi) Improvements and new add/del/update Object function

### 0.2.5 (10.08.2018)
* (Stübi) Changes of roles and icons added to devices

### 0.2.4 (16.07.2018)
* (Stübi) Wrong device description removed

### 0.2.3 (16.07.2018)
* (Stübi) RSSI Status an Device shutter (type 76) supported

### 0.2.2 (13.07.2018)
* (Stübi) Devices thermostat (type 79) and switch (type 48) supported

### 0.2.1 (08.06.2018)
* (Stübi) Directory widged deleted

### 0.2.0 (03.06.2018)
* (Stübi) Port can be added


## License
The MIT License (MIT)

Copyright (c) 2018 Thorsten Stueben <thorsten@stueben.de>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

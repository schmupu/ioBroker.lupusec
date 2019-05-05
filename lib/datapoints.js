/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

/**
 * Types of Devices
 */
let typeList = {
  TYPE_2: {
    name: 'Fernbedienung',
    devlist: 'type_unknown',
    icon: '/icons/2.png'
  },
  TYPE_3: {
    name: 'Nachtschalter',
    devlist: 'type_unknown'
  },
  TYPE_4: {
    name: 'Türkontakt',
    devlist: 'type_contact',
    icon: '/icons/4.png'
  },
  TYPE_5: {
    name: 'Wassersensor',
    devlist: 'type_sensor_water',
    icon: '/icons/5.png'
  },
  TYPE_6: {
    name: 'Panic Button',
    devlist: 'type_unknown'
  },
  TYPE_7: {
    name: 'Panic Button',
    devlist: 'type_panic_button',
    icon: '/icons/7.png'
  },
  TYPE_9: {
    name: 'Bewegungsmelder',
    devlist: 'type_motion',
    icon: '/icons/9.png'
  },
  TYPE_11: {
    name: 'Rauchmelder / Hitzemelder',
    devlist: 'type_sensor_fire',
    icon: '/icons/11.png'
  },
  TYPE_12: {
    name: 'Gasmelder',
    devlist: 'type_unknown'
  },
  TYPE_13: {
    name: 'CO-Melder',
    devlist: 'type_sensor_co',
    icon: '/icons/13.png'
  },
  TYPE_14: {
    name: 'Hitzemelder',
    devlist: 'type_unknown'
  },
  TYPE_16: {
    name: 'Tag Reader',
    devlist: 'type_unknown'
  },
  TYPE_17: {
    name: 'Keypad',
    devlist: 'type_unknown'
  },
  TYPE_19: {
    name: 'Glasbruchsensor',
    devlist: 'type_sensor_glas',
    icon: '/icons/19.png'
  },
  TYPE_20: {
    name: 'Temperatursensor',
    devlist: 'type_unknown'
  },
  TYPE_21: {
    name: 'Med. Alarmmelder',
    devlist: 'type_unknown'
  },
  TYPE_22: {
    name: 'Mini Innensirene / Statusanzeige',
    devlist: 'type_statusanzeige',
    icon: '/icons/22.png'
  },
  TYPE_23: {
    name: 'Sirene',
    devlist: 'type_siren',
    icon: '/icons/23.png'
  },
  TYPE_24: {
    name: 'Power Switch',
    devlist: 'type_pswitch',
    icon: '/icons/24.png'
  },
  TYPE_26: {
    name: 'Repeater',
    devlist: 'type_unknown'
  },
  TYPE_27: {
    name: 'PIR Kamera',
    devlist: 'type_unknown'
  },
  TYPE_31: {
    name: 'Fernbedienung',
    devlist: 'type_unknown',
    icon: '/icons/2.png'
  },
  TYPE_33: {
    name: 'Drahtloser Sensoreingang',
    devlist: 'type_unknown'
  },
  TYPE_37: {
    name: 'Keypad',
    devlist: 'type_kpad',
    icon: '/icons/37.png'
  },
  TYPE_39: {
    name: 'Glasbruchmelder',
    devlist: 'type_sensor_glas',
    icon: '/icons/39.png'
  },
  TYPE_46: {
    name: 'Außensirene',
    devlist: 'type_siren',
    icon: '/icons/46.png'
  },
  TYPE_48: {
    name: 'Power Switch Meter',
    devlist: 'type_switch',
    icon: '/icons/48.png'
  },
  TYPE_52: {
    name: 'UPIC',
    devlist: 'type_unknown'
  },
  TYPE_54: {
    name: 'Raumsensor',
    devlist: 'type_raumsensor',
    icon: '/icons/54.png'
  },
  TYPE_58: {
    name: 'Hitzemelder',
    devlist: 'type_heatdetector',
    icon: '/icons/58.png'
  },
  TYPE_61: {
    name: 'Remote Switch',
    devlist: 'type_unknown'
  },
  TYPE_66: {
    name: 'Dimmer',
    devlist: 'type_dimmer',
    icon: '/icons/66.png'
  },
  TYPE_67: {
    name: 'Rauchmelder',
    devlist: 'type_unknown'
  },
  TYPE_73: {
    name: 'Heizungsthermostat',
    devlist: 'type_unknown'
  },
  TYPE_74: {
    name: 'Hue',
    devlist: 'type_hue',
    icon: '/icons/74.png'
  },
  TYPE_75: {
    name: 'Temperatursensor',
    devlist: 'type_unknown'
  },
  TYPE_76: {
    name: 'Rollladenrelais',
    devlist: 'type_shutter',
    icon: '/icons/76.png'
  },
  TYPE_78: {
    name: 'Lichtsensor',
    devlist: 'type_lightsensor',
    icon: '/icons/78.png'
  },
  TYPE_79: {
    name: 'Heizkörperthermostat',
    devlist: 'type_thermostat',
    icon: '/icons/79.png'
  },
  TYPE_81: {
    name: 'Smart Switch',
    devlist: 'type_smart_switch',
    icon: '/icons/81.png'
  },
  TYPE_93: {
    name: 'Erschütterungssensor',
    devlist: 'type_shock_sensor',
    icon: '/icons/93.png'
  },
};


let noanswer_event = '0:Keine Antwort';
let doorbellevent = '3:Türklingel';
let alarm_events = '5:Einbruchalarm;6:Rauch;7:Medizinischer Alarm;8:Wasser;9:Stiller Alarm;10:Panic Alarm;11:Notfall Alarm;15:Notfall Alarm (Still);12:Feuer;13:CO Alarm;18:Gas Alarm;19:Hitze Alarm';
let sensor_events = '100:Sensor-Event anwenden 1;101:Sensor-Event anwenden 2;102:Sensor-Event anwenden 3;103:Sensor-Event anwenden 4;104:Sensor-Event anwenden 5;105:Sensor-Event anwenden 6;106:Sensor-Event anwenden 7;107:Sensor-Event anwenden 8;108:Sensor-Event anwenden 9;109:Sensor-Event anwenden 10;110:Sensor-Event anwenden 11;111:Sensor-Event anwenden 12;112:Sensor-Event anwenden 13;113:Sensor-Event anwenden 14;114:Sensor-Event anwenden 15;115:Sensor-Event anwenden 16';
let szene_events = '150:Szene anwenden 1;151:Szene anwenden 2;152:Szene anwenden 3;153:Szene anwenden 4;154:Szene anwenden 5;155:Szene anwenden 6;156:Szene anwenden 7;157:Szene anwenden 8;158:Szene anwenden 9;159:Szene anwenden 10;160:Szene anwenden 11;161:Szene anwenden 12;162:Szene anwenden 13;163:Szene anwenden 14;164:Szene anwenden 15;165:Szene anwenden 16';
let button_events = noanswer_event + ';' + alarm_events + ';' + sensor_events + ';' + szene_events;
// '0:Keine Antwort;5:Einbruchalarm;6:Rauch;7:Medizinischer Alarm;8:Wasser;9:Stiller Alarm;10:Panic Alarm;11:Notfall Alarm;15:Notfall Alarm (Still);12:Feuer;13:CO Alarm;18:Gas Alarm;19:Hitze Alarm;100:Sensor-Event anwenden 1;101:Sensor-Event anwenden 2;102:Sensor-Event anwenden 3;103:Sensor-Event anwenden 4;104:Sensor-Event anwenden 5;105:Sensor-Event anwenden 6;106:Sensor-Event anwenden 7;107:Sensor-Event anwenden 8;108:Sensor-Event anwenden 9;109:Sensor-Event anwenden 10;110:Sensor-Event anwenden 11;111:Sensor-Event anwenden 12;112:Sensor-Event anwenden 13;113:Sensor-Event anwenden 14;114:Sensor-Event anwenden 15;115:Sensor-Event anwenden 16;150:Szene anwenden 1;151:Szene anwenden 2;152:Szene anwenden 3;153:Szene anwenden 4;154:Szene anwenden 5;155:Szene anwenden 6;156:Szene anwenden 7;157:Szene anwenden 8;158:Szene anwenden 9;159:Szene anwenden 10;160:Szene anwenden 11;161:Szene anwenden 12;162:Szene anwenden 13;163:Szene anwenden 14;164:Szene anwenden 15;165:Szene anwenden 16';

/**
 * List of devices
 */
let dpDeviceList = {
  // Sirene
  type_siren: {
    alarm_status_ex: {
      type: 'boolean',
      role: 'sensor.alarm',
      name: 'Alarm Status',
      read: true,
      write: false
    },
    alarm_status: {
      type: 'string',
      role: 'sensor.alarm',
      name: 'Alarm Status',
      read: true,
      write: false
    }
  },
  // Steckdose
  type_switch: {
    status_ex: {
      type: 'boolean',
      role: 'switch.power',
      name: 'Switch',
      read: true,
      write: true,
      states: 'false:off;true:on'
    },
    /*
    status: {
      type: 'string',
      role: 'text',
      read: true,
      write: false,
    },
    */
    pd: {
      type: 'number',
      role: 'level',
      name: 'Minutes to get off again',
      read: true,
      write: true,
      min: 0,
      max: 180,
      def: 0,
    },
    power: {
      type: 'number',
      role: 'value.power.consumption',
      name: 'Power',
      read: true,
      write: false,
      states: '',
      unit: 'W',
    },
    powertotal: {
      type: 'number',
      role: 'value.power.consumption',
      name: 'Power Total',
      read: true,
      write: false,
      states: '',
      unit: 'kWh',
    },
    always_off: {
      type: 'number',
      role: 'value',
      name: 'Switch/Push button',
      read: true,
      write: true,
      states: '0:Switch;1:Push button'
    }
  },
  // Lichtschalter (Bsp. 24)
  type_pswitch: {
    status_ex: {
      type: 'boolean',
      role: 'switch.power',
      name: 'Switch',
      read: true,
      write: true,
      states: 'false:off;true:on'
    },
    /*
    status: {
      type: 'string',
      role: 'text',
      read: true,
      write: false
    },
    */
    pd: {
      type: 'number',
      role: 'level',
      name: 'Minutes to get off again',
      read: true,
      write: true,
      min: 0,
      max: 180,
      def: 0,
    },
    always_off: {
      type: 'number',
      role: 'value',
      name: 'Switch/Push button',
      read: true,
      write: true,
      states: '0:Switch;1:Push button'
    }
  },
  // Dimmer , Unterputzrelais
  type_dimmer: {
    status_ex: {
      type: 'boolean',
      role: 'switch.power',
      name: 'Switch',
      read: true,
      write: true,
      states: 'false:off;true:on'
    },
    level: {
      type: 'number',
      role: 'level.dimmer',
      name: 'Brightness',
      read: true,
      write: true,
      min: 0,
      max: 100,
      unit: "%"
    },
    always_off: {
      type: 'number',
      role: 'value',
      name: 'Switch/Push button',
      read: true,
      write: true,
      states: '0:Switch;1:Push button'
    }
  },
  // Hue Lampe
  type_hue: {
    status_ex: {
      type: 'boolean',
      role: 'switch.power',
      name: 'Switch',
      read: true,
      write: true,
      states: 'false:off;true:on'
    },
    /*
    mod: {
      type: 'number',
      role: 'level',
      name: 'Modus',
      read: true,
      write: true,
      def: 2
    },
    */
    hue: {
      type: 'number',
      role: 'level.color.hue',
      name: 'Hue',
      read: true,
      write: true,
      min: 0,
      max: 65535
    },
    sat: {
      type: 'number',
      role: 'level.color.saturation',
      name: 'Saturation',
      read: true,
      write: true,
      min: 0,
      max: 360
    },
    level: {
      type: 'number',
      role: 'level.dimmer',
      name: 'Brightness',
      read: true,
      write: true,
      min: 0,
      max: 100,
      unit: "%"
    },
  },
  // Türkontakt
  type_contact: {
    status_ex: {
      type: 'boolean',
      role: 'sensor.door',
      name: 'Status',
      read: true,
      write: false
    },
    status: {
      type: 'string',
      role: 'text',
      name: 'Status',
      read: true,
      write: false,
    },
    alarm_status_ex: {
      type: 'boolean',
      role: 'sensor.alarm',
      name: 'Alarm Status',
      read: true,
      write: false
    },
    alarm_status: {
      type: 'string',
      role: 'sensor.alarm',
      name: 'Alarm Status',
      read: true,
      write: false
    },
    send_notify: {
      type: 'string',
      role: 'text',
      name: 'Push notification',
      read: true,
      write: true
    },
    schar_latch_rpt: {
      type: 'number',
      role: 'value',
      name: 'Send SIA/Contact-ID Msg.',
      read: true,
      write: true,
      states: '0:off;1:on',
      min: 0,
      max: 1
    }
  },
  // Type shock sensor
  type_shock_sensor: {
    alarm_status_ex: {
      type: 'boolean',
      role: 'sensor.alarm',
      name: 'Alarm Status',
      read: true,
      write: false
    },
    alarm_status: {
      type: 'string',
      role: 'sensor.alarm',
      name: 'Alarm Status',
      read: true,
      write: false
    },
    send_notify: {
      type: 'string',
      role: 'text',
      name: 'Push notification',
      read: true,
      write: true
    }
  },
  // Bewegungsmelder
  type_motion: {
    alarm_status_ex: {
      type: 'boolean',
      role: 'sensor.alarm.secure',
      name: 'Alarm Status',
      read: true,
      write: false
    },
    alarm_status: {
      type: 'string',
      role: 'sensor.alarm.secure',
      name: 'Alarm Status',
      read: true,
      write: false,
    },
    send_notify: {
      type: 'string',
      role: 'text',
      name: 'Push notification',
      read: true,
      write: true
    }
  },
  // Glasbruch
  type_sensor_glas: {
    alarm_status_ex: {
      type: 'boolean',
      role: 'sensor.alarm',
      name: 'Alarm Status',
      read: true,
      write: false
    },
    alarm_status: {
      type: 'string',
      role: 'sensor.alarm',
      name: 'Alarm Status',
      read: true,
      write: false
    },
    send_notify: {
      type: 'string',
      role: 'text',
      name: 'Push Nachricht',
      read: true,
      write: true
    }
  },
  // Rauchmelder
  type_sensor_fire: {
    alarm_status_ex: {
      type: 'boolean',
      role: 'sensor.alarm.fire',
      name: 'Alarm Status',
      read: true,
      write: false
    },
    alarm_status: {
      type: 'string',
      role: 'sensor.alarm.fire',
      name: 'Alarm Status',
      read: true,
      write: false
    },
    send_notify: {
      type: 'string',
      role: 'text',
      name: 'Push notification',
      read: true,
      write: true
    }
  },
  // Hitzemelder
  type_heatdetector: {
    alarm_status_ex: {
      type: 'boolean',
      role: 'sensor.alarm.fire',
      name: 'Alarm Status',
      read: true,
      write: false
    },
    alarm_status: {
      type: 'string',
      role: 'sensor.alarm.fire',
      name: 'Alarm Status',
      read: true,
      write: false
    },
    send_notify: {
      type: 'string',
      role: 'text',
      name: 'Push Nachricht',
      read: true,
      write: true
    }
  },
  // Wassermelder
  type_sensor_water: {
    alarm_status_ex: {
      type: 'boolean',
      role: 'sensor.alarm.flood',
      name: 'Alarm Status',
      read: true,
      write: false
    },
    alarm_status: {
      type: 'string',
      role: 'sensor.alarm.flood',
      name: 'Alarm Status',
      read: true,
      write: false
    },
    send_notify: {
      type: 'string',
      role: 'text',
      name: 'Push Nachricht',
      read: true,
      write: true
    }
  },
  // Panic button
  type_panic_button: {
    alarm_status_ex: {
      type: 'boolean',
      role: 'sensor.alarm',
      name: 'Alarm Status',
      read: true,
      write: false
    },
    alarm_status: {
      type: 'string',
      role: 'sensor.alarm',
      name: 'Alarm Status',
      read: true,
      write: false
    },
    sresp_emergency: {
      type: 'number',
      role: 'value',
      name: 'Emergency Button',
      read: true,
      write: true,
      states: doorbellevent + ';' + alarm_events + ';' + sensor_events + ';' + szene_events
    },
    send_notify: {
      type: 'string',
      role: 'text',
      name: 'Push notification',
      read: true,
      write: true
    }
  },
  // Rolläden
  type_shutter: {
    level: {
      type: 'number',
      role: 'level',
      name: 'Shutter',
      read: true,
      write: true,
      min: 0,
      max: 100,
      unit: '%'
    },
    switch: {
      type: 'number',
      role: 'switch',
      name: 'Shutter down/up',
      read: true,
      write: true,
      states: '0:up;1:down;2:stop',
      min: 0,
      max: 2
    },
    on_time: {
      type: 'number',
      role: 'level.timer',
      name: 'Time to get up',
      read: true,
      write: true,
      min: 0,
      max: 240,
      unit: 'sec'
    },
    off_time: {
      type: 'number',
      role: 'level.timer',
      name: 'Time to get down',
      read: true,
      write: true,
      min: 0,
      max: 240,
      unit: 'sec'
    }
  },
  // Raumsensor / Thermostat
  type_raumsensor: {
    actual_temperature: {
      type: 'number',
      role: 'value.temperature',
      name: 'Actual temperature',
      read: true,
      write: false,
      min: 0,
      max: 100,
      unit: '°C'
    },
    actual_humidity: {
      type: 'number',
      role: 'value.humidity',
      name: 'Humidity',
      read: true,
      write: false,
      min: 0,
      max: 100,
      unit: '%'
    },
    send_notify: {
      type: 'string',
      role: 'text',
      name: 'Push Nachricht',
      read: true,
      write: true
    }
  },
  // Lichtsensor
  type_lightsensor: {
    actual_lux: {
      type: 'number',
      role: 'value.brightness',
      name: 'Lux level',
      read: true,
      write: false,
      min: 0,
      max: 16
    },
    actual_temperature: {
      type: 'number',
      role: 'value.temperature',
      name: 'Actual temperature',
      read: true,
      write: false,
      min: 0,
      max: 100,
      unit: '°C'
    },
    actual_humidity: {
      type: 'number',
      role: 'value.humidity',
      name: 'Humidity',
      read: true,
      write: false,
      min: 0,
      max: 100,
      unit: '%'
    },
    send_notify: {
      type: 'string',
      role: 'text',
      name: 'Push Nachricht',
      read: true,
      write: true
    }
  },
  // Thermostat
  type_thermostat: {
    /*
    status_ex: {
      type: 'boolean',
      role: 'sensor',
      name: 'Schalter',
      read: true,
      write: true
    },
    */
    /*
    status: {
      type: 'string',
      role: 'text',
      read: true,
      write: false
    },
    */
    set_temperature: {
      type: 'number',
      role: 'level.temperature',
      name: 'Set temperature',
      read: true,
      write: true,
      min: 0,
      max: 30,
      unit: '°C'
    },
    thermo_offset: {
      type: 'number',
      role: 'level.temperature',
      name: 'Offset temperature',
      read: true,
      write: true,
      min: -2.5,
      max: 2.5,
      def: 0,
      unit: '°C'
    },
    actual_temperature: {
      type: 'number',
      role: 'value.temperature',
      name: 'Actual temperatur',
      read: true,
      write: false,
      min: 0,
      max: 100,
      unit: '°C'
    },
    mode: {
      type: 'number',
      role: 'switch',
      name: 'Zeitsteuerung',
      read: true,
      write: true,
      states: '0:manuell;1:automatic',
      min: 0,
      max: 1
    },
    valve: {
      type: 'number',
      role: 'value.valve',
      name: 'Valve',
      read: true,
      write: false,
      min: 0,
      max: 100,
      unit: "%",
    },
    off: {
      type: 'boolean',
      role: 'switch',
      name: 'Off/On',
      read: true,
      write: true
    }
  },
  // Nichts gefunden
  type_unknown: {
    alarm_status_ex: {
      type: 'boolean',
      role: 'sensor.alarm',
      name: 'Alarm Status',
      read: true,
      write: false
    },
    alarm_status: {
      type: 'string',
      role: 'sensor.alarm',
      name: 'Alarm Status',
      read: true,
      write: false
    },
    status: {
      type: 'string',
      role: 'text',
      name: 'Status',
      read: true,
      write: false,
    },
    status_ex: {
      type: 'string',
      role: 'text',
      name: 'Status',
      read: true,
      write: false,
    }
  },
  // Innensirene / Statusanzeige
  type_statusanzeige: {
    alarm_status_ex: {
      type: 'boolean',
      role: 'sensor.alarm',
      name: 'Alarm Status',
      read: true,
      write: false
    },
    alarm_status: {
      type: 'string',
      role: 'sensor.alarm',
      name: 'Alarm Status',
      read: true,
      write: false
    }
  },
  // CO sensor
  type_sensor_co: {
    alarm_status_ex: {
      type: 'boolean',
      role: 'sensor.alarm',
      name: 'Alarm Status',
      read: true,
      write: false
    },
    alarm_status: {
      type: 'string',
      role: 'sensor.alarm',
      name: 'Alarm Status',
      read: true,
      write: false
    }
  },
  // Smart Switch
  type_smart_switch: {
    alarm_status_ex: {
      type: 'boolean',
      role: 'sensor.alarm',
      name: 'Alarm Status',
      read: true,
      write: false
    },
    alarm_status: {
      type: 'string',
      role: 'sensor.alarm',
      name: 'Alarm Status',
      read: true,
      write: false
    },
    sresp_button_1: {
      type: 'number',
      role: 'value',
      name: 'Button 1',
      read: true,
      write: true,
      states: button_events
    },
    sresp_button_2: {
      type: 'number',
      role: 'value',
      name: 'Button 2',
      read: true,
      write: true,
      states: button_events
    },
    sresp_button_3: {
      type: 'number',
      role: 'value',
      name: 'Button 3',
      read: true,
      write: true,
      states: button_events
    },
    sresp_button_4: {
      type: 'number',
      role: 'value',
      name: 'Button 4',
      read: true,
      write: true,
      states: button_events
    }
  },
  type_kpad: {
  },
  // Gilt für alle Geräte.
  type_all: {
    // SID löschen !!!
    /*
    sid: {
      type: 'string',
      role: 'text',
      name: 'ID des Gerätes',
      read: true,
      write: false
    },
    */
    name: {
      type: 'string',
      role: 'text',
      name: 'Name of device',
      read: true,
      write: true
    },
    sresp_button_123: {
      type: 'number',
      role: 'value',
      name: 'Buttons 1-3',
      read: true,
      write: true,
      states: doorbellevent + ';' + alarm_events + ';' + sensor_events + ';' + szene_events
    },
    sresp_button_456: {
      type: 'number',
      role: 'value',
      name: 'Buttons 4-6',
      read: true,
      write: true,
      states: alarm_events + ';' + sensor_events + ';' + szene_events
    },
    sresp_button_789: {
      type: 'number',
      role: 'value',
      name: 'Buttons 7-9',
      read: true,
      write: true,
      states: alarm_events + ';' + sensor_events + ';' + szene_events
    },
    area: {
      type: 'number',
      role: 'value',
      name: 'Area',
      read: true,
      write: false,
      states: '1:Area1;2:Area2',
      min: 1,
      max: 2
    },
    zone: {
      type: 'number',
      role: 'value',
      name: 'Zone',
      read: true,
      write: false,
      states: '',
      min: 1,
      max: 80
    },
    tamper_ok: {
      type: 'number',
      role: 'value',
      name: 'Sabotage',
      read: true,
      write: false,
      states: '0:Error;1:Okay',
      min: 0,
      max: 1
    },
    cond_ok: {
      type: 'number',
      role: 'value',
      name: 'Condition',
      read: true,
      write: false,
      states: '0:Error;1:Okay',
      min: 0,
      max: 1
    },
    battery_ok: {
      type: 'number',
      role: 'value',
      name: 'Battery',
      read: true,
      write: false,
      states: '0:Error;1:Okay',
      min: 0,
      max: 1,
    },
    /*
    type_f: {
      type: 'string',
      role: 'value',
      name: 'Sensortyp',
      read: true,
      write: false
    },
    */
    rssi: {
      type: 'number',
      role: 'value',
      name: 'Rssi',
      read: true,
      write: false
    },
    type: {
      type: 'number',
      role: 'value',
      name: 'Sensortype number',
      read: true,
      write: false
    },
    type_name: {
      type: 'string',
      role: 'text',
      name: 'Sensortype',
      read: true,
      write: false
    },
    bypass: {
      type: 'number',
      role: 'value',
      name: 'Sensor deactivated',
      read: true,
      write: true,
      states: '0:off;1:on',
      min: 0,
      max: 1
    },
    bypass_tamper: {
      type: 'number',
      role: 'value',
      name: 'Tamper deactivated',
      read: true,
      write: true,
      states: '0:off;1:on',
      min: 0,
      max: 1
    }
  }
};

/**
 * Status
 */
let dpStatus = {
  mode_pc_a1: {
    type: 'number',
    role: 'level',
    name: 'Modus Area 1',
    icon: '/icons/zentrale.png',
    read: true,
    write: true,
    states: '0:Disarm;1:Arm;2:Home1;3:Home2;4:Home3',
    min: 0,
    max: 4
  },
  apple_home_a1: {
    type: 'number',
    role: 'level',
    name: 'Apple Home 1',
    icon: '/icons/zentrale.png',
    read: true,
    write: true,
    states: '0:stay arm;1:away arm;2:night arm;3:disarm;4:alarm triggered',
    min: 0,
    max: 4
  },
  mode_pc_a2: {
    type: 'number',
    role: 'level',
    name: 'Modus Area 2',
    icon: '/icons/zentrale.png',
    read: true,
    write: true,
    states: '0:Disarm;1:Arm;2:Home1;3:Home2;4:Home3',
    min: 0,
    max: 4
  },
  apple_home_a2: {
    type: 'number',
    role: 'level',
    name: 'Apple Home 2',
    icon: '/icons/zentrale.png',
    read: true,
    write: true,
    states: '0:stay arm;1:away arm;2:night arm;3:disarm;4:alarm triggered',
    min: 0,
    max: 4
  },
  alarm_ex: {
    type: 'number',
    role: 'sensor.alarm',
    name: 'Alarm Status',
    icon: '/icons/zentrale.png',
    read: true,
    write: false,
    states: '0:kein Alarm;1:Alarm in Area 1;2:Alarm in Area 2',
    min: 0,
    max: 2
  },
  dc_ex: {
    type: 'number',
    role: 'value',
    name: 'Door contact open',
    icon: '/icons/zentrale.png',
    read: true,
    write: false,
    states: '0:Door conntact(s) open;1:Door contact(s) closed',
    min: 0,
    max: 1
  },
  battery_ok: {
    type: 'number',
    role: 'value',
    name: 'Emergency power battery',
    icon: '/icons/zentrale.png',
    read: true,
    write: false,
    states: '0:Error;1:Okay',
    min: 0,
    max: 1
  },
  tamper_ok: {
    type: 'number',
    role: 'value',
    name: 'Sabotage',
    icon: '/icons/zentrale.png',
    read: true,
    write: false,
    states: '0:Error;1:Okay',
    min: 0,
    max: 1
  },
  interference_ok: {
    type: 'number',
    role: 'value',
    name: 'Radio interference',
    icon: '/icons/zentrale.png',
    read: true,
    write: false,
    states: '0:Error;1:Okay',
    min: 0,
    max: 1
  },
  ac_activation_ok: {
    type: 'number',
    role: 'value',
    name: 'Power supply',
    icon: '/icons/zentrale.png',
    read: true,
    write: false,
    states: '0:Error;1:Okay',
    min: 0,
    max: 1
  },
  rssi: {
    type: 'number',
    role: 'value',
    name: 'Rssi',
    icon: '/icons/zentrale.png',
    read: true,
    write: false,
    states: '',
    min: 1,
    max: 9
  },
  sig_gsm_ok: {
    type: 'number',
    role: 'value',
    name: 'GSM Signal',
    icon: '/icons/zentrale.png',
    read: true,
    write: false,
    states: '0:Error;1:Okay',
    min: 0,
    max: 1
  }
};

module.exports.dpStatus = dpStatus;
module.exports.dpDeviceList = dpDeviceList;
module.exports.typeList = typeList;

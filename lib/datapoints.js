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
    name: 'Keypad Outdoor',
    devlist: 'type_kpad_outdoor',
    icon: '/icons/17.png'
  },
  TYPE_19: {
    name: 'Glasbruchsensor',
    devlist: 'type_sensor_glas',
    icon: '/icons/19.png'
  },
  TYPE_20: {
    name: 'Temperatursensor',
    devlist: 'type_raumsensor20',
    icon: '/icons/20.png'
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
    devlist: 'type_repeater',
    icon: '/icons/26.png'
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
  TYPE_45: {
    name: 'Innensirene',
    devlist: 'type_statusanzeige',
    icon: '/icons/45.png'
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
  TYPE_50: {
    name: 'Electric Meter',
    devlist: 'type_electric_meter',
    icon: '/icons/50.png'
  },
  TYPE_52: {
    name: 'Universal IR Fernbedienung',
    devlist: 'type_52',
    icon: '/icons/52.png'
  },
  TYPE_54: {
    name: 'Raumsensor',
    devlist: 'type_raumsensor',
    icon: '/icons/54.png'
  },
  TYPE_57: {
    name: 'Nuki',
    devlist: 'type_nuki',
    icon: '/icons/57.png'
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


let noanswer_event_en = '0:no answer';
let doorbellevent_en = '3:doorbell';
let alarm_events_en = '5:burglar alarm;6:smoke;7:medical alarm;8:water;9:silence alarm;10:panic alarm;11:ermergency alarm;15:emergency alarm (silence);12:fire;13:CO alarm;18:Gas alarm;19:Heat alarm';
let sensor_events_en = '100:Sensor-Event 1;101:Sensor-Event 2;102:Sensor-Event 3;103:Sensor-Event 4;104:Sensor-Event 5;105:Sensor-Event 6;106:Sensor-Event 7;107:Sensor-Event 8;108:Sensor-Event 9;109:Sensor-Event 10;110:Sensor-Event 11;111:Sensor-Event 12;112:Sensor-Event 13;113:Sensor-Event 14;114:Sensor-Event 15;115:Sensor-Event 16';
let szene_events_en = '150:Szene 1;151:Szene 2;152:Szene 3;153:Szene 4;154:Szene 5;155:Szene 6;156:Szene 7;157:Szene 8;158:Szene 9;159:Szene 10;160:Szene 11;161:Szene 12;162:Szene 13;163:Szene 14;164:Szene 15;165:Szene 16';
let button_events_en = noanswer_event_en + ';' + alarm_events_en + ';' + sensor_events_en + ';' + szene_events_en;

let noanswer_event_de = '0:Keine Antwort';
let doorbellevent_de = '3:Türklingel';
let alarm_events_de = '5:Einbruchalarm;6:Rauch;7:Medizinischer Alarm;8:Wasser;9:Stiller Alarm;10:Panic Alarm;11:Notfall Alarm;15:Notfall Alarm (Still);12:Feuer;13:CO Alarm;18:Gas Alarm;19:Hitze Alarm';
let sensor_events_de = '100:Sensor-Event anwenden 1;101:Sensor-Event anwenden 2;102:Sensor-Event anwenden 3;103:Sensor-Event anwenden 4;104:Sensor-Event anwenden 5;105:Sensor-Event anwenden 6;106:Sensor-Event anwenden 7;107:Sensor-Event anwenden 8;108:Sensor-Event anwenden 9;109:Sensor-Event anwenden 10;110:Sensor-Event anwenden 11;111:Sensor-Event anwenden 12;112:Sensor-Event anwenden 13;113:Sensor-Event anwenden 14;114:Sensor-Event anwenden 15;115:Sensor-Event anwenden 16';
let szene_events_de = '150:Szene anwenden 1;151:Szene anwenden 2;152:Szene anwenden 3;153:Szene anwenden 4;154:Szene anwenden 5;155:Szene anwenden 6;156:Szene anwenden 7;157:Szene anwenden 8;158:Szene anwenden 9;159:Szene anwenden 10;160:Szene anwenden 11;161:Szene anwenden 12;162:Szene anwenden 13;163:Szene anwenden 14;164:Szene anwenden 15;165:Szene anwenden 16';
let button_events_de = noanswer_event_de + ';' + alarm_events_de + ';' + sensor_events_de + ';' + szene_events_de;
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
      name_de: 'Schalter',
      name_en: 'Switch',
      read: true,
      write: true,
      states_en: 'false:off;true:on',
      states_de: 'false:Aus;true:An'
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
      name_en: 'Minutes to get off again',
      name_de: 'Aus in x Minuten',
      read: true,
      write: true,
      min: 0,
      max: 180,
      def: 0,
    },
    power: {
      type: 'number',
      role: 'value.power.consumption',
      name_en: 'Power',
      name_de: 'Verbrauch',
      read: true,
      write: false,
      states: '',
      unit: 'W',
    },
    powertotal: {
      type: 'number',
      role: 'value.power.consumption',
      name_en: 'Power Total',
      name_de: 'Gesamtverbrauch',
      read: true,
      write: false,
      states: '',
      unit: 'kWh',
    },
    always_off: {
      type: 'number',
      role: 'value',
      name_en: 'Switch/Push button',
      name_de: 'Schalter/Taster',
      read: true,
      write: true,
      states_en: '0:Switch;1:Push button',
      states_de: '0:Schalter;1:Taster'
    }
  },
  type_nuki: {
    nuki_state: {
      type: 'number',
      role: 'value',
      name_de: 'Tür Status',
      name_en: 'Door state',
      read: true,
      write: false,
      states_en: '0:opend;1:locked;3:unlocked',
      states_de: '0:Tür offen;1:Abgeschlossen;3:Aufgeschlossen'
    },
    nuki_action: {
      type: 'number',
      role: 'value',
      name_de: 'Tür Aktion',
      name_en: 'Door action',
      read: true,
      write: true,
      states_en: '0:open;1:lock;3:unlock',
      states_de: '0:Tür öffnen;1:abschließen;3:aufschließen'
    },
    status: {
      type: 'string',
      role: 'text',
      name: 'Status',
      read: true,
      write: false,
    }
  },
  // Electric Meter / Hauptstromzähler
  type_electric_meter: {
    factor: {
      type: 'number',
      role: 'value',
      name_de: 'Impulsfaktor pro 1 kWh',
      name_en: 'Impulsfactor for 1 kWh',
      read: true,
      write: true
    },
    power: {
      type: 'number',
      role: 'value.power.consumption',
      name_en: 'Power',
      name_de: 'Verbrauch',
      read: true,
      write: false,
      states: '',
      unit: 'W',
    },
    powertotal: {
      type: 'number',
      role: 'value.power.consumption',
      name_en: 'Power Total',
      name_de: 'Gesamtverbrauch',
      read: true,
      write: false,
      states: '',
      unit: 'kWh',
    }
  },
  // Lichtschalter (Bsp. 24)
  type_pswitch: {
    status_ex: {
      type: 'boolean',
      role: 'switch.power',
      name_de: 'Schalter',
      name_en: 'Switch',
      read: true,
      write: true,
      states_en: 'false:off;true:on',
      states_de: 'false:Aus;true:An'
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
      name_en: 'Minutes to get off again',
      name_de: 'Aus in x Minuten',
      read: true,
      write: true,
      min: 0,
      max: 180,
      def: 0,
    },
    always_off: {
      type: 'number',
      role: 'value',
      name_en: 'Switch/Push button',
      name_de: 'Schalter/Taster',
      read: true,
      write: true,
      states_en: '0:Switch;1:Push button',
      states_de: '0:Schalter;1:Taster'
    }
  },
  // Dimmer , Unterputzrelais
  type_dimmer: {
    status_ex: {
      type: 'boolean',
      role: 'switch.power',
      name_de: 'Schalter',
      name_en: 'Switch',
      read: true,
      write: true,
      states_en: 'false:off;true:on',
      states_de: 'false:Aus;true:An'
    },
    level: {
      type: 'number',
      role: 'level.dimmer',
      name_en: 'Brightness',
      name_de: 'Helligkeit',
      read: true,
      write: true,
      min: 0,
      max: 100,
      unit: "%"
    },
    always_off: {
      type: 'number',
      role: 'value',
      name_en: 'Switch/Push button',
      name_de: 'Schalter/Taster',
      read: true,
      write: true,
      states_en: '0:Switch;1:Push button',
      states_de: '0:Schalter;1:Taster'
    }
  },
  // Hue Lampe
  type_hue: {
    status_ex: {
      type: 'boolean',
      role: 'switch.power',
      name_de: 'Schalter',
      name_en: 'Switch',
      read: true,
      write: true,
      states_en: 'false:off;true:on',
      states_de: 'false:Aus;true:An'
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
      name_en: 'Brightness',
      name_de: 'Helligkeit',
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
      name_en: 'Send SIA/Contact-ID Msg.',
      name_de: 'SIA/Contact-ID Nachricht',
      read: true,
      write: true,
      states_en: '0:off;1:on',
      states_de: '0:Aus;1:An',
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
      name_en: 'Emergency Button',
      name_de: 'Notfall Knopf',
      read: true,
      write: true,
      states_en: doorbellevent_en + ';' + alarm_events_en + ';' + sensor_events_en + ';' + szene_events_en,
      states_de: doorbellevent_de + ';' + alarm_events_de + ';' + sensor_events_de + ';' + szene_events_de
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
      name_en: 'Shutter',
      name_de: 'Rollladenhöhe',
      read: true,
      write: true,
      min: 0,
      max: 100,
      unit: '%'
    },
    switch: {
      type: 'number',
      role: 'switch',
      name_en: 'Shutter down/up',
      name_de: 'Rollladen hoch/runter',
      read: true,
      write: true,
      states_en: '0:up;1:down;2:stop',
      states_de: '0:hoch;1:runter;2:stop',
      min: 0,
      max: 2
    },
    on_time: {
      type: 'number',
      role: 'level.timer',
      name_en: 'Time to get up',
      name_de: 'Zeitraum um ganz hochzufahren',
      read: true,
      write: true,
      min: 0,
      max: 240,
      unit: 'sec'
    },
    off_time: {
      type: 'number',
      role: 'level.timer',
      name_en: 'Time to get down',
      naem_de: 'Zeitraum um ganz runterzufahren',
      read: true,
      write: true,
      min: 0,
      max: 240,
      unit: 'sec'
    }
  },
  // Raumsensor / Thermostat Type 20
  type_raumsensor20: {
    actual_temperature: {
      type: 'number',
      role: 'value.temperature',
      name_en: 'Actual temperature',
      name_de: 'Aktuelle Temperatur',
      read: true,
      write: false,
      min: -100,
      max: 100,
      unit: '°C'
    },
    send_notify: {
      type: 'string',
      role: 'text',
      name: 'Push Nachricht',
      read: true,
      write: true
    }
  },
  // Raumsensor / Thermostat Type 54
  type_raumsensor: {
    actual_temperature: {
      type: 'number',
      role: 'value.temperature',
      name_en: 'Actual temperature',
      name_de: 'Aktuelle Temperatur',
      read: true,
      write: false,
      min: -100,
      max: 100,
      unit: '°C'
    },
    actual_humidity: {
      type: 'number',
      role: 'value.humidity',
      name_en: 'Humidity',
      name_de: 'Luftfeuchtigkeit',
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
      name_en: 'Lux level',
      name_de: 'Lux Helligkeitsniveau',
      read: true,
      write: false,
      min: 0,
      max: 16
    },
    actual_temperature: {
      type: 'number',
      role: 'value.temperature',
      name_en: 'Actual temperature',
      name_de: 'Aktuelle Temperatur',
      read: true,
      write: false,
      min: -100,
      max: 100,
      unit: '°C'
    },
    actual_humidity: {
      type: 'number',
      role: 'value.humidity',
      name_en: 'Humidity',
      name_de: 'Luftfeuchtigkeit',
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
      name_en: 'Set temperature',
      name_de: 'Soll Temperatur',
      read: true,
      write: true,
      min: -30,
      max: 30,
      unit: '°C'
    },
    thermo_offset: {
      type: 'number',
      role: 'level.temperature',
      name_en: 'Offset temperature',
      name_de: 'Abweichende Temperatur',
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
      name_en: 'Actual temperatur',
      name_de: 'Aktuelle Temperatur',
      read: true,
      write: false,
      min: -100,
      max: 100,
      unit: '°C'
    },
    mode: {
      type: 'number',
      role: 'switch',
      name_en: 'Control',
      name_de: 'Zeitsteuerung',
      read: true,
      write: true,
      states_en: '0:manuell;1:automatic',
      states_de: '0:Manuell;1:Automatisch',
      min: 0,
      max: 1
    },
    valve: {
      type: 'number',
      role: 'value.valve',
      name_en: 'Valve',
      name_de: 'Ventilöffnung',
      read: true,
      write: false,
      min: 0,
      max: 100,
      unit: "%",
    },
    off: {
      type: 'boolean',
      role: 'switch',
      name_en: 'Off/On',
      name_de: 'Aus/An',
      read: true,
      write: true,
      states_en: 'false:off;true:on',
      states_de: 'false:Aus;true:An'
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
  // Repeater
  type_repeater: {
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
      name_en: 'Button 1',
      name_de: 'Taster 1',
      read: true,
      write: true,
      states_en: button_events_en,
      states_de: button_events_de
    },
    sresp_button_2: {
      type: 'number',
      role: 'value',
      name_en: 'Button 2',
      name_de: 'Taster 2',
      read: true,
      write: true,
      states_en: button_events_en,
      states_de: button_events_de
    },
    sresp_button_3: {
      type: 'number',
      role: 'value',
      name_en: 'Button 3',
      name_de: 'Taster 3',
      read: true,
      write: true,
      states_en: button_events_en,
      states_de: button_events_de
    },
    sresp_button_4: {
      type: 'number',
      role: 'value',
      name_en: 'Button 4',
      name_de: 'Taster 4',
      read: true,
      write: true,
      states_en: button_events_en,
      states_de: button_events_de
    }
  },
  // Universal IR Fernbedienung
  type_52: {
    appliance_1: {
      name: 'channel'
    },
    appliance_2: {
      name: 'channel'
    },
    appliance_3: {
      name: 'channel'
    },
    appliance_4: {
      name: 'channel'
    },
    appliance_5: {
      name: 'channel'
    },
    leds: {
      type: 'boolean',
      role: 'button',
      name_en: 'LEDs',
      name_de: 'LEDs',
      read: true,
      write: true
    }
  },
  type_kpad: {
    sresp_button_123: {
      type: 'number',
      role: 'value',
      name_en: 'Buttons 1-3',
      name_de: 'Tastern 1-3',
      read: true,
      write: true,
      states_en: doorbellevent_en + ';' + alarm_events_en + ';' + sensor_events_en + ';' + szene_events_en,
      states_de: doorbellevent_de + ';' + alarm_events_de + ';' + sensor_events_de + ';' + szene_events_de
    },
    sresp_button_456: {
      type: 'number',
      role: 'value',
      name_en: 'Buttons 4-6',
      name_de: 'Tastern 4-6',
      read: true,
      write: true,
      states_en: alarm_events_en + ';' + sensor_events_en + ';' + szene_events_en,
      states_de: alarm_events_de + ';' + sensor_events_de + ';' + szene_events_de
    },
    sresp_button_789: {
      type: 'number',
      role: 'value',
      name_en: 'Buttons 7-9',
      name_de: 'Tastern 7-9',
      read: true,
      write: true,
      states_en: alarm_events_en + ';' + sensor_events_en + ';' + szene_events_en,
      states_de: alarm_events_de + ';' + sensor_events_de + ';' + szene_events_de
    },
  },
  type_kpad_outdoor: {
    sresp_button_123: {
      type: 'number',
      role: 'value',
      name_en: 'Buttons 1-3',
      name_de: 'Tastern 1-3',
      read: true,
      write: true,
      states_en: doorbellevent_en + ';' + alarm_events_en + ';' + sensor_events_en + ';' + szene_events_en,
      states_de: doorbellevent_de + ';' + alarm_events_de + ';' + sensor_events_de + ';' + szene_events_de
    },
    sresp_button_456: {
      type: 'number',
      role: 'value',
      name_en: 'Buttons 4-6',
      name_de: 'Tastern 4-6',
      read: true,
      write: true,
      states_en: alarm_events_en + ';' + sensor_events_en + ';' + szene_events_en,
      states_de: alarm_events_de + ';' + sensor_events_de + ';' + szene_events_de
    },
    sresp_button_789: {
      type: 'number',
      role: 'value',
      name_en: 'Buttons 7-9',
      name_de: 'Tastern 7-9',
      read: true,
      write: true,
      states_en: alarm_events_en + ';' + sensor_events_en + ';' + szene_events_en,
      states_de: alarm_events_de + ';' + sensor_events_de + ';' + szene_events_de
    },
    sresp_button_1: {
      type: 'number',
      role: 'value',
      name_en: 'Button 1',
      name_de: 'Taster 1',
      read: true,
      write: true,
      states_en: button_events_en,
      states_de: button_events_de
    },
    sresp_button_2: {
      type: 'number',
      role: 'value',
      name_en: 'Button 2',
      name_de: 'Taster 2',
      read: true,
      write: true,
      states_en: button_events_en,
      states_de: button_events_de
    },
    sresp_button_3: {
      type: 'number',
      role: 'value',
      name_en: 'Button 3',
      name_de: 'Taster 3',
      read: true,
      write: true,
      states_en: button_events_en,
      states_de: button_events_de
    },
    sresp_button_4: {
      type: 'number',
      role: 'value',
      name_en: 'Button 4',
      name_de: 'Taster 4',
      read: true,
      write: true,
      states_en: button_events_en,
      states_de: button_events_de
    }
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
      name_en: 'Name of device',
      name_de: 'Gerätename',
      read: true,
      write: true
    },
    area: {
      type: 'number',
      role: 'value',
      name: 'Area',
      read: true,
      write: false,
      states: '1:Area 1;2:Area 2',
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
      min: 0,
      max: 500
    },
    tamper_ok: {
      type: 'number',
      role: 'value',
      name_en: 'Sabotage',
      name_de: 'Sabotage',
      read: true,
      write: false,
      states_en: '0:Error;1:Okay',
      states_de: '0:Fehler;1:Okay',
      min: 0,
      max: 1
    },
    cond_ok: {
      type: 'number',
      role: 'value',
      name_en: 'Condition',
      name_de: 'Zustand',
      read: true,
      write: false,
      states_en: '0:Error;1:Okay',
      states_de: '0:Fehler;1:Okay',
      min: 0,
      max: 1
    },
    battery_ok: {
      type: 'number',
      role: 'value',
      name_en: 'Battery',
      name_de: 'Batterie',
      read: true,
      write: false,
      states_en: '0:Low;1:Okay',
      states_de: '0:Leer;1:Okay',
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
      name_en: 'Devicetype number',
      name_de: 'Nummer Gerätetyp',
      read: true,
      write: false
    },
    type_name: {
      type: 'string',
      role: 'text',
      name_en: 'Devicetype',
      name_de: 'Gerätetyp',
      read: true,
      write: false
    },
    bypass: {
      type: 'number',
      role: 'value',
      name_en: 'Device deactivated',
      name_de: 'Gerät deaktiviert',
      read: true,
      write: true,
      states_en: '0:off;1:on',
      states_de: '0:Aus;1:An',
      min: 0,
      max: 1
    },
    bypass_tamper: {
      type: 'number',
      role: 'value',
      name_en: 'Tamper deactivated',
      name_de: 'Sabotage deaktivieren',
      read: true,
      write: true,
      states_en: '0:off;1:on',
      states_de: '0:Aus;1:An',
      min: 0,
      max: 1
    },
    logmsg: {
      type: 'string',
      role: 'value',
      name_en: 'Logfile',
      name_de: 'Logfile',
      read: true,
      write: false
    },
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
    states_en: '0:no Alarm;1:Alarm in Area 1;2:Alarm in Area 2',
    states_de: '0:kein Alarm;1:Alarm in Area 1;2:Alarm in Area 2',
    min: 0,
    max: 2
  },
  dc_ex: {
    type: 'number',
    role: 'value',
    name_en: 'Door contact open',
    name_de: 'Tür-/Fensterkontakte',
    icon: '/icons/zentrale.png',
    read: true,
    write: false,
    states_en: '0:Door conntact(s) open;1:Door contact(s) closed',
    states_de: '0:Tür-/Fensterkontakt(e) offen;1:Tür-/Fensterkontakt(e) geschlossen',
    min: 0,
    max: 1
  },
  battery_ok: {
    type: 'number',
    role: 'value',
    name_en: 'Emergency power battery',
    name_de: 'Notstrombatterie',
    icon: '/icons/zentrale.png',
    read: true,
    write: false,
    states_en: '0:Error;1:Okay',
    states_de: '0:Fehler;1:Okay',
    min: 0,
    max: 1
  },
  tamper_ok: {
    type: 'number',
    role: 'value',
    name_en: 'Sabotage',
    name_de: 'Sabotage',
    icon: '/icons/zentrale.png',
    read: true,
    write: false,
    states_en: '0:Error;1:Okay',
    states_de: '0:Fehler;1:Okay',
    min: 0,
    max: 1
  },
  interference_ok: {
    type: 'number',
    role: 'value',
    name_en: 'Radio interference',
    name_de: 'Funkstörungen',
    icon: '/icons/zentrale.png',
    read: true,
    write: false,
    states_en: '0:Error;1:Okay',
    states_de: '0:Fehler;1:Okay',
    min: 0,
    max: 1
  },
  ac_activation_ok: {
    type: 'number',
    role: 'value',
    name_en: 'Power supply',
    name_de: 'Netzteil',
    icon: '/icons/zentrale.png',
    read: true,
    write: false,
    states_en: '0:Error;1:Okay',
    states_de: '0:Fehler;1:Okay',
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
    states_en: '0:Error;1:Okay',
    states_de: '0:Fehler;1:Okay',
    min: 0,
    max: 1
  }
};

let dpSMS = {
  number: {
    type: 'string',
    role: 'state',
    name: 'Phone Number',
    icon: '/icons/sms.png',
    read: true,
    write: true
  },
  text: {
    type: 'string',
    role: 'state',
    name: 'SMS Text',
    icon: '/icons/sms.png',
    read: true,
    write: true
  },
  dial: {
    type: 'boolean',
    role: 'button',
    name: 'Send SMS',
    icon: '/icons/sms.png',
    read: true,
    write: true
  },
  result: {
    type: 'number',
    role: 'value',
    name: 'Send Result',
    icon: '/icons/sms.png',
    read: false,
    write: false,
    states: '0:Error;1:Okay;2:Sending',
    def: 1
  },
  provider: {
    type: 'number',
    role: 'state',
    name: 'Provider',
    icon: '/icons/sms.png',
    read: false,
    write: true,
    states: '1:SMS with SIM Card;2:SMS by Gateway',
    def: '1'
  },
};

module.exports = {
  dpStatus: dpStatus,
  dpDeviceList: dpDeviceList,
  typeList: typeList,
  dpSMS: dpSMS
};

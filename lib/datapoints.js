// *******************************************************************************
// Typen
// *******************************************************************************
typeList = {
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
    devlist: 'type_unknown'
  },
  TYPE_9: {
    name: 'Bewegungsmelder',
    devlist: 'type_unknown',
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
    devlist: 'type_unknown'
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
    devlist: 'type_unknown'
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
    devlist: 'type_unknown'
  },
  TYPE_23: {
    name: 'Sirene',
    devlist: 'type_unknown'
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
    devlist: 'type_unknown',
    icon: '/icons/39.png'
  },
  TYPE_46: {
    name: 'Außensirene',
    devlist: 'type_unknown',
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
    devlist: 'type_unknown'
  },
  TYPE_58: {
    name: 'Hitzemelder',
    devlist: 'type_unknown'
  },
  TYPE_61: {
    name: 'Remote Switch',
    devlist: 'type_unknown'
  },
  TYPE_66: {
    name: 'Dimmer',
    devlist: 'type_unknown'
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
    devlist: 'type_unknown'
  },
  TYPE_79: {
    name: 'Heizkörperthermostat',
    devlist: 'type_thermostat',
    icon: '/icons/79.png'
  },
  TYPE_81: {
    name: 'Smart Switch',
    devlist: 'type_unknown'
  },
  TYPE_93: {
    name: 'Erschütterungssensor',
    devlist: 'type_unknown'
  },
};

// *******************************************************************************
// Devicelist
// *******************************************************************************
dpDeviceList = {

  // Steckdose
  type_switch: {

    status_ex: {
      type: 'boolean',
      role: 'switch.power',
      name: 'Schalter',
      read: true,
      write: true,
      states: 'false:off;true:on'
    },
    status: {
      type: 'string',
      role: 'text',
      read: true,
      write: false,
      delete: true   // Altes Objekt, falls vorhanden löschen
    },
    pd: {
      type: 'number',
      role: 'level',
      name: 'Minuten bis wieder aus',
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
    }
  },

  // Lichtschalter (Bsp. 24)
  type_pswitch: {

    status_ex: {
      type: 'boolean',
      role: 'switch.power',
      name: 'Schalter',
      read: true,
      write: true,
      states: 'false:off;true:on'
    },
    status: {
      type: 'string',
      role: 'text',
      read: true,
      write: false,
      delete: true   // Altes Objekt, falls vorhanden löschen
    },
    pd: {
      type: 'number',
      role: 'level',
      name: 'Minuten bis wieder aus',
      read: true,
      write: true,
      min: 0,
      max: 180,
      def: 0,
    }
  },

  // Hue Lampe
  type_hue: {

    status_ex: {
      type: 'boolean',
      role: 'switch.power',
      name: 'Schalter',
      read: true,
      write: true,
      states: 'false:off;true:on'
    },
    mod: {
      type: 'number',
      role: 'level',
      name: 'Modus',
      read: true,
      write: true
    },
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
      name: 'saturation',
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
      role: 'text',
      name: 'Alarm Status',
      read: true,
      write: false
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
      role: 'text',
      name: 'Alarm Status',
      read: true,
      write: false,
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
      role: 'text',
      name: 'Alarm Status',
      read: true,
      write: false
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
      role: 'text',
      name: 'Alarm Status',
      read: true,
      write: false
    }
  },

  // Rolläden
  type_shutter: {
    level: {
      type: 'number',
      role: 'level',
      name: 'Rollladen ',
      read: true,
      write: true,
      min: 0,
      max: 1,
      unit: '%'
    },
    switch: {
      type: 'number',
      role: 'switch',
      name: 'Rollladen runter-/hochfahren',
      read: true,
      write: true,
      states: '0:zu;1:auf',
      min: 0,
      max: 1
    }
  },

  // Thermostat
  type_thermostat: {

    status_ex: {
      type: 'boolean',
      role: 'sensor',
      name: 'Schalter',
      read: true,
      write: true,
      delete: true   // Altes Objekt, falls vorhanden löschen
    },
    status: {
      type: 'string',
      role: 'text',
      read: true,
      write: false,
      delete: true   // Altes Objekt, falls vorhanden löschen
    },
    set_temperature: {
      type: 'number',
      role: 'level.temperature',
      name: 'Soll Temperatur',
      read: true,
      write: true,
      min: 0,
      max: 30,
      unit: '°C'
    },
    actual_temperature: {
      type: 'number',
      role: 'value.temperature',
      name: 'Ist Temperatur',
      read: true,
      write: false,
      min: 0,
      max: 30,
      unit: '°C'
    },
    mode: {
      type: 'number',
      role: 'switch',
      name: 'Area',
      read: true,
      write: true,
      states: '0:manuell;1:automatic',
      min: 0,
      max: 1
    },
    valve: {
      type: 'number',
      role: 'value.valve',
      name: 'Ventilstellung',
      read: true,
      write: false
    },
    off: {
      type: 'boolean',
      role: 'switch',
      name: 'Off/On',
      read: true,
      write: true
    },
  },

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
      role: 'text',
      name: 'Alarm Status',
      read: true,
      write: false
    }
  },

  type_kpad: {


  },

  // Gilt für alle Geräte.
  type_all: {

    // SID löschen !!!
    sid: {
      type: 'string',
      role: 'text',
      name: 'ID des Gerätes',
      read: true,
      write: false,
      delete: true
    },

    name: {
      type: 'string',
      role: 'text',
      name: 'Gerätename',
      read: true,
      write: false
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
      states: '0:Fehler;1:Okay',
      min: 0,
      max: 1
    },
    cond_ok: {
      type: 'number',
      role: 'value',
      name: 'Zustand',
      read: true,
      write: false,
      states: '0:Fehler;1:Okay',
      min: 0,
      max: 1
    },
    battery_ok: {
      type: 'number',
      role: 'value',
      name: 'Akku',
      read: true,
      write: false,
      states: '0:Fehler;1:Okay',
      min: 0,
      max: 1,
    },
    type_f: {
      type: 'string',
      role: 'value',
      name: 'Sensortyp',
      read: true,
      write: false,
      delete: true   // Altes Objekt, falls vorhanden löschen
    },
    rssi: {
      type: 'number',
      role: 'value',
      name: 'rssi',
      read: true,
      write: false
    },
    type: {
      type: 'number',
      role: 'value',
      name: 'Sensortypnummer',
      read: true,
      write: false
    },
    type_name: {
      type: 'string',
      role: 'text',
      name: 'Sensortyp',
      read: true,
      write: false
    },
    bypass: {
      type: 'number',
      role: 'value',
      name: 'Bypass',
      read: true,
      write: false,
      states: '0:aus;1:an',
      min: 0,
      max: 1
    }
  }

};


// *******************************************************************************
// Stautus
// *******************************************************************************
dpStatus = {

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

  dc_ex: {
    type: 'number',
    role: 'value',
    name: 'Türkontakt geöffnet',
    icon: '/icons/zentrale.png',
    read: true,
    write: false,
    states: '0:Türkontakt(e) offen;1:Türkontakt(e) zu',
    min: 0,
    max: 1
  },

  battery_ok: {
    type: 'number',
    role: 'value',
    name: 'Notstromakku',
    icon: '/icons/zentrale.png',
    read: true,
    write: false,
    states: '0:Fehler;1:Okay',
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
    states: '0:Fehler;1:Okay',
    min: 0,
    max: 1
  },

  interference_ok: {
    type: 'number',
    role: 'value',
    name: 'Funktsörung',
    icon: '/icons/zentrale.png',
    read: true,
    write: false,
    states: '0:Fehler;1:Okay',
    min: 0,
    max: 1
  },

  ac_activation_ok: {
    type: 'number',
    role: 'value',
    name: 'Stromversorgung',
    icon: '/icons/zentrale.png',
    read: true,
    write: false,
    states: '0:Fehler;1:Okay',
    min: 0,
    max: 1
  },

  rssi: {
    type: 'number',
    role: 'value',
    name: 'Funkstörung',
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
    states: '0:Fehler;1:Okay',
    min: 0,
    max: 1
  },

};


module.exports.dpStatus = dpStatus;
module.exports.dpDeviceList = dpDeviceList;
module.exports.typeList = typeList;

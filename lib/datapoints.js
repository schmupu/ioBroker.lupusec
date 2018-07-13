// *******************************************************************************
// Typen
// *******************************************************************************
typeList = {
  TYPE_2: {
    name: "Fernbedienung",
    devlist: 'type_unknown'
  },
  TYPE_3: {
    name: "Nachtschalter",
    devlist: 'type_unknown'
  },
  TYPE_4: {
    name: "Türkontakt",
    devlist: 'type_contact'
  },
  TYPE_5: {
    name: "Wassersensor",
    devlist: 'type_sensor'
  },
  TYPE_6: {
    name: "Panic Button",
    devlist: 'type_unknown'
  },
  TYPE_7: {
    name: "Panic Button",
    devlist: 'type_unknown'
  },
  TYPE_9: {
    name: "Bewegungsmelder",
    devlist: 'type_unknown'
  },
  TYPE_11: {
    name: "Rauchmelder / Hitzemelder",
    devlist: 'type_sensor'
  },
  TYPE_12: {
    name: "Gasmelder",
    devlist: 'type_unknown'
  },
  TYPE_13: {
    name: "CO-Melder",
    devlist: 'type_unknown'
  },
  TYPE_14: {
    name: "Hitzemelder",
    devlist: 'type_unknown'
  },
  TYPE_16: {
    name: "Tag Reader",
    devlist: 'type_unknown'
  },
  TYPE_17: {
    name: "Keypad",
    devlist: 'type_unknown'
  },
  TYPE_19: {
    name: "Glasbruchsensor",
    devlist: 'type_unknown'
  },
  TYPE_20: {
    name: "Temperatursensor",
    devlist: 'type_unknown'
  },
  TYPE_21: {
    name: "Med. Alarmmelder",
    devlist: 'type_unknown'
  },
  TYPE_22: {
    name: "Mini Innensirene / Statusanzeige",
    devlist: 'type_unknown'
  },
  TYPE_23: {
    name: "Sirene",
    devlist: 'type_unknown'
  },
  TYPE_24: {
    name: "Power Switch",
    devlist: 'type_unknown'
  },
  TYPE_26: {
    name: "Repeater",
    devlist: 'type_unknown'
  },
  TYPE_27: {
    name: "PIR Kamera",
    devlist: 'type_unknown'
  },
  TYPE_31: {
    name: "Fernbedienung",
    devlist: 'type_unknown'
  },
  TYPE_33: {
    name: "Drahtloser Sensoreingang",
    devlist: 'type_unknown'
  },
  TYPE_37: {
    name: "Keypad",
    devlist: 'type_kpad'
  },
  TYPE_39: {
    name: "Glasbruchmelder",
    devlist: 'type_unknown'
  },
  TYPE_46: {
    name: "Außensirene",
    devlist: 'type_unknown'
  },
  TYPE_48: {
    name: "Power Switch Meter",
    devlist: 'type_switch'
  },
  TYPE_52: {
    name: "UPIC",
    devlist: 'type_unknown'
  },
  TYPE_54: {
    name: "Raumsensor",
    devlist: 'type_unknown'
  },
  TYPE_58: {
    name: "Hitzemelder",
    devlist: 'type_unknown'
  },
  TYPE_61: {
    name: "Remote Switch",
    devlist: 'type_unknown'
  },
  TYPE_66: {
    name: "Dimmer",
    devlist: 'type_unknown'
  },
  TYPE_67: {
    name: "Rauchmelder",
    devlist: 'type_unknown'
  },
  TYPE_73: {
    name: "Heizungsthermostat",
    devlist: 'type_unknown'
  },
  TYPE_74: {
    name: "Hue",
    devlist: 'type_unknown'
  },
  TYPE_75: {
    name: "Temperatursensor",
    devlist: 'type_unknown'
  },
  TYPE_76: {
    name: "Rollladenrelais",
    devlist: 'type_unknown'
  },
  TYPE_78: {
    name: "Lichtsensor",
    devlist: 'type_unknown'
  },
  TYPE_79: {
    name: "Heizkörperthermostat",
    devlist: 'type_thermostat'
  },
  TYPE_81: {
    name: "Smart Switch",
    devlist: 'type_unknown'
  },
  TYPE_93: {
    name: "Erschütterungssensor",
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
      role: 'switch',
      name: 'Schalter',
      read: true,
      write: true
    },
    /*
    status: {
      type: 'string',
      role: 'value',
      read: true,
      write: false
    },
    */
    pd: {
      type: 'number',
      role: 'value',
      name: 'Minuten bis wieder aus',
      read: true,
      write: true,
      min: 0,
      max: 180,
      def: 0,
    },
    power: {
      type: 'number',
      role: 'value',
      name: 'Power',
      read: true,
      write: false,
      states: "",
      unit: "W",
    },
    powertotal: {
      type: 'number',
      role: 'value',
      name: 'Power Total',
      read: true,
      write: false,
      states: "",
      unit: "kWh",
    }
  },


  // Türkontakt
  type_contact: {
    status_ex: {
      type: 'boolean',
      role: 'value',
      name: 'Status',
      read: true,
      write: false
    },
    status: {
      type: 'string',
      role: 'value',
      name: 'Status',
      read: true,
      write: false,
    },
    alarm_status_ex: {
      type: 'boolean',
      role: 'value',
      name: 'Alarm Status',
      read: true,
      write: false
    },
    alarm_status: {
      type: 'string',
      role: 'value',
      name: 'Alarm Status',
      read: true,
      write: false
    },
    bypass: {
      type: 'number',
      role: 'value',
      name: 'Bypass',
      read: true,
      write: false,
      states: "0:aus;1:an",
      min: 0,
      max: 1
    }
  },

  // Bewegungsmelder
  type_motion: {
    alarm_status_ex: {
      type: 'boolean',
      role: 'value',
      name: 'Alarm Status',
      read: true,
      write: false
    },
    alarm_status: {
      type: 'string',
      role: 'value',
      name: 'Alarm Status',
      read: true,
      write: false,
    },
    bypass: {
      type: 'number',
      role: 'value',
      name: 'Bypass',
      read: true,
      write: false,
      states: "0:aus;1:an",
      min: 0,
      max: 1,
    }
  },

  // Rauchmelder + Wassermelder
  type_sensor: {
    alarm_status_ex: {
      type: 'boolean',
      role: 'value',
      name: 'Alarm Status',
      read: true,
      write: false
    },
    alarm_status: {
      type: 'string',
      role: 'value',
      name: 'Alarm Status',
      read: true,
      write: false
    },
    bypass: {
      type: 'number',
      role: 'value',
      name: 'Bypass',
      read: true,
      write: false,
      states: "0:aus;1:an",
      min: 0,
      max: 1
    }
  },

  // Steckdose
  type_thermostat: {

    /*
    
    status_ex: {
      type: 'boolean',
      role: 'switch',
      name: 'Schalter',
      read: true,
      write: true
    },

    status: {
      type: 'string',
      role: 'value',
      read: true,
      write: false
    },
    */
    set_temperature: {
      type: 'number',
      role: 'value',
      name: 'Soll Temperatur',
      read: true,
      write: true,
      min: 0,
      max: 30,
      unit: "°C"
    },
    actual_temperature: {
      type: 'number',
      role: 'value',
      name: 'Ist Temperatur',
      read: true,
      write: false,
      min: 0,
      max: 30,
      unit: "°C"
    },
    mode: {
      type: 'number',
      role: 'value',
      name: 'Area',
      read: true,
      write: true,
      states: "0:manuell;1:automatic",
      min: 0,
      max: 1
    },
    valve: {
      type: 'number',
      role: 'value',
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
      role: 'value',
      name: 'Alarm Status',
      read: true,
      write: false
    },
    alarm_status: {
      type: 'string',
      role: 'value',
      name: 'Alarm Status',
      read: true,
      write: false
    }
  },

  type_kpad: {


  },

  // Gilt für alle Geräte.
  type_all: {
    sid: {
      type: 'string',
      role: 'value',
      name: 'ID des Gerätes',
      read: true,
      write: false
    },
    name: {
      type: 'string',
      role: 'value',
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
      states: "1:Area1;2:Area2",
      min: 1,
      max: 2
    },
    zone: {
      type: 'number',
      role: 'value',
      name: 'Zone',
      read: true,
      write: false,
      states: "",
      min: 1,
      max: 80
    },
    tamper_ok: {
      type: 'number',
      role: 'value',
      name: 'Sabotage',
      read: true,
      write: false,
      states: "0:Fehler;1:Okay",
      min: 0,
      max: 1
    },
    battery_ok: {
      type: 'number',
      role: 'value',
      name: 'Akku',
      read: true,
      write: false,
      states: "0:Fehler;1:Okay",
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
    type: {
      type: 'number',
      role: 'value',
      name: 'Sensortypnummer',
      read: true,
      write: false
    },
    type_name: {
      type: 'string',
      role: 'value',
      name: 'Sensortyp',
      read: true,
      write: false
    }
  }
};


// *******************************************************************************
// Stautus
// *******************************************************************************
dpStatus = {

  mode_pc_a1: {
    type: 'number',
    role: 'value',
    name: 'Modus Area 1',
    read: true,
    write: true,
    states: "0:Disarm;1:Arm;2:Home1;3:Home2;4:Home3",
    min: 0,
    max: 4
  },

  mode_pc_a2: {
    type: 'number',
    role: 'value',
    name: 'Modus Area 2',
    read: true,
    write: true,
    states: "0:Disarm;1:Arm;2:Home1;3:Home2;4:Home3",
    min: 0,
    max: 4
  },

  dc_ex: {
    type: 'number',
    role: 'value',
    name: 'Türkontakt geöffnet',
    read: true,
    write: false,
    states: "0:Türkontakte zu;1:Türkontakt(e) offen",
    min: 0,
    max: 1
  },

  battery_ok: {
    type: 'number',
    role: 'value',
    name: 'Notstromakku',
    read: true,
    write: false,
    states: "0:Fehler;1:Okay",
    min: 0,
    max: 1
  },

  tamper_ok: {
    type: 'number',
    role: 'value',
    name: 'Sabotage',
    read: true,
    write: false,
    states: "0:Fehler;1:Okay",
    min: 0,
    max: 1
  },

  interference_ok: {
    type: 'number',
    role: 'value',
    name: 'Funktsörung',
    read: true,
    write: false,
    states: "0:Fehler;1:Okay",
    min: 0,
    max: 1
  },

  ac_activation_ok: {
    type: 'number',
    role: 'value',
    name: 'Stromversorgung',
    read: true,
    write: false,
    states: "0:Fehler;1:Okay",
    min: 0,
    max: 1
  },

  rssi: {
    type: 'number',
    role: 'value',
    name: 'Funkstörung',
    read: true,
    write: false,
    states: "",
    min: 1,
    max: 9
  },

  sig_gsm_ok: {
    type: 'number',
    role: 'value',
    name: 'GSM Signal',
    read: true,
    write: false,
    states: "0:Fehler;1:Okay",
    min: 0,
    max: 1
  },

};


module.exports.dpStatus = dpStatus;
module.exports.dpDeviceList = dpDeviceList;
module.exports.typeList = typeList;

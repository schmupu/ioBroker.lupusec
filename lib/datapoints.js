dpDeviceList = {

  type_48: {
    status_ex: {
      type: 'boolean',
      role: 'switch',
      read: true,
      write: true
    },
    status: {
      type: 'string',
      role: 'value',
      read: true,
      write: false,
    },
  },

  default: {
    status_ex: {
      type: 'boolean',
      role: 'switch',
      read: true,
      write: true
    },
    status: {
      type: 'string',
      role: 'value',
      read: true,
      write: false,
    },
  }

};

dpDevicePSSList = {

  type_48: {
    status_ex: {
      type: 'boolean',
      role: 'switch',
      read: true,
      write: true
    },
    status: {
      type: 'string',
      role: 'value',
      read: true,
      write: false,
    },

  },

  type_XX: {}

};


typeList = {
  D_TYPE_2: "Fernbedienung",
  D_TYPE_3: "Nachtschalter",
  D_TYPE_4: "Türkontakt",
  D_TYPE_5: "Wassersensor",
  D_TYPE_6: "Panic Button",
  D_TYPE_7: "Panic Button",
  D_TYPE_9: "Bewegungsmelder",
  D_TYPE_11: "Rauchmelder / Hitzemelder",
  D_TYPE_12: "Gasmelder",
  D_TYPE_13: "CO-Melder",
  D_TYPE_14: "Hitzemelder",
  D_TYPE_16: "Tag Reader",
  D_TYPE_17: "Keypad",
  D_TYPE_19: "Glasbruchsensor",
  D_TYPE_20: "Temperatursensor",
  D_TYPE_21: "Med. Alarmmelder",
  D_TYPE_22: "Mini Innensirene / Statusanzeige",
  D_TYPE_23: "Sirene",
  D_TYPE_24: "Power Switch",
  D_TYPE_26: "Repeater",
  D_TYPE_27: "PIR Kamera",
  D_TYPE_31: "Fernbedienung",
  D_TYPE_33: "Drahtloser Sensoreingang",
  D_TYPE_39: "Glasbruchmelder",
  D_TYPE_46: "Außensirene",
  D_TYPE_48: "Power Switch Meter",
  D_TYPE_52: "UPIC",
  D_TYPE_54: "Raumsensor",
  D_TYPE_58: "Hitzemelder",
  D_TYPE_61: "Remote Switch",
  D_TYPE_66: "Dimmer",
  D_TYPE_67: "Rauchmelder",
  D_TYPE_73: "Heizungsthermostat",
  D_TYPE_74: "Hue",
  D_TYPE_75: "Temperatursensor",
  D_TYPE_76: "Rollladenrelais",
  D_TYPE_78: "Lichtsensor",
  D_TYPE_79: "Heizkörperthermostat",
  D_TYPE_81: "Smart Switch",
  D_TYPE_93: "Erschütterungssensor"
};


module.exports.dpDeviceList = dpDeviceList;
module.exports.dpDevicePSSList = dpDevicePSSList;
module.exports.typeList = typeList;

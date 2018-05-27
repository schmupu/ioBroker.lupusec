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

module.exports.dpDeviceList = dpDeviceList;
module.exports.dpDevicePSSList = dpDevicePSSList;

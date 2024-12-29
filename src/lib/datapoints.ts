import { Tools } from './tools';

/**
 * Interface Device Types
 */
export interface defDeviceTypes {
    [index: string]: {
        name: string;
        devlist: string;
        icon?: string;
    };
}

/**
 * Interface Device Datapoints
 */
export interface defDeviceDatapoints {
    [index: string]: object;
}

/**
 * Interface SMS datapoints
 */
export interface defSmsDatapoints {
    [index: string]: any;
}

/**
 * Interface webcam datapoints
 */
export interface defWebcamDatapoints {
    [index: string]: any;
}

/**
 * Interface status datapoints
 */
export interface defStatusDatapoints {
    [index: string]: any;
}

/**
 * Class for datapoints
 */
export class Datapoints {
    /**
     * Types of Devices
     */
    private static getDeviceTypes(): defDeviceTypes {
        const deviceTypes: defDeviceTypes = {
            TYPE_0: {
                name: 'Unknown Device',
                devlist: 'type_unknown',
            },
            TYPE_2: {
                name: 'Fernbedienung',
                devlist: 'type_unknown',
                icon: '/icons/2.png',
            },
            TYPE_3: {
                name: 'Nachtschalter',
                devlist: 'type_unknown',
            },
            TYPE_4: {
                name: 'Türkontakt',
                devlist: 'type_contact',
                icon: '/icons/4.png',
            },
            TYPE_5: {
                name: 'Wassersensor',
                devlist: 'type_sensor_water',
                icon: '/icons/5.png',
            },
            TYPE_6: {
                name: 'Panic Button',
                devlist: 'type_unknown',
            },
            TYPE_7: {
                name: 'Panic Button',
                devlist: 'type_panic_button',
                icon: '/icons/7.png',
            },
            TYPE_9: {
                name: 'Bewegungsmelder',
                devlist: 'type_motion',
                icon: '/icons/9.png',
            },
            TYPE_11: {
                name: 'Rauchmelder / Hitzemelder',
                devlist: 'type_sensor_fire',
                icon: '/icons/11.png',
            },
            TYPE_12: {
                name: 'Gasmelder',
                devlist: 'type_unknown',
            },
            TYPE_13: {
                name: 'CO-Melder',
                devlist: 'type_sensor_co',
                icon: '/icons/13.png',
            },
            TYPE_14: {
                name: 'Hitzemelder',
                devlist: 'type_unknown',
            },
            TYPE_16: {
                name: 'Tag Reader',
                devlist: 'type_unknown',
            },
            TYPE_17: {
                name: 'Keypad Outdoor',
                devlist: 'type_kpad_outdoor',
                icon: '/icons/17.png',
            },
            TYPE_19: {
                name: 'Glasbruchsensor',
                devlist: 'type_sensor_glas',
                icon: '/icons/19.png',
            },
            TYPE_20: {
                name: 'Temperatursensor',
                devlist: 'type_raumsensor20',
                icon: '/icons/20.png',
            },
            TYPE_21: {
                name: 'Med. Alarmmelder',
                devlist: 'type_unknown',
            },
            TYPE_22: {
                name: 'Mini Innensirene / Statusanzeige',
                devlist: 'type_statusanzeige',
                icon: '/icons/22.png',
            },
            TYPE_23: {
                name: 'Sirene',
                devlist: 'type_siren',
                icon: '/icons/23.png',
            },
            TYPE_24: {
                name: 'Power Switch',
                devlist: 'type_pswitch',
                icon: '/icons/24.png',
            },
            TYPE_26: {
                name: 'Repeater',
                devlist: 'type_repeater',
                icon: '/icons/26.png',
            },
            TYPE_27: {
                name: 'PIR Kamera',
                devlist: 'type_unknown',
            },
            TYPE_31: {
                name: 'Fernbedienung',
                devlist: 'type_unknown',
                icon: '/icons/2.png',
            },
            TYPE_33: {
                name: 'Drahtloser Sensoreingang',
                devlist: 'type_unknown',
            },
            TYPE_37: {
                name: 'Keypad',
                devlist: 'type_kpad',
                icon: '/icons/37.png',
            },
            TYPE_39: {
                name: 'Glasbruchmelder',
                devlist: 'type_sensor_glas',
                icon: '/icons/39.png',
            },
            TYPE_45: {
                name: 'Innensirene',
                devlist: 'type_statusanzeige',
                icon: '/icons/45.png',
            },
            TYPE_46: {
                name: 'Außensirene',
                devlist: 'type_siren',
                icon: '/icons/46.png',
            },
            TYPE_48: {
                name: 'Power Switch Meter',
                devlist: 'type_switch',
                icon: '/icons/48.png',
            },
            TYPE_50: {
                name: 'Electric Meter',
                devlist: 'type_electric_meter',
                icon: '/icons/50.png',
            },
            TYPE_52: {
                name: 'Universal IR Fernbedienung',
                devlist: 'type_ir_remotecontrol',
                icon: '/icons/52.png',
            },
            TYPE_54: {
                name: 'Raumsensor',
                devlist: 'type_raumsensor',
                icon: '/icons/54.png',
            },
            TYPE_57: {
                name: 'Nuki',
                devlist: 'type_nuki',
                icon: '/icons/57.png',
            },
            TYPE_58: {
                name: 'Hitzemelder',
                devlist: 'type_heatdetector',
                icon: '/icons/58.png',
            },
            TYPE_61: {
                name: 'Remote Switch',
                devlist: 'type_unknown',
            },
            TYPE_66: {
                name: 'Dimmer',
                devlist: 'type_dimmer',
                icon: '/icons/66.png',
            },
            TYPE_67: {
                name: 'Rauchmelder',
                devlist: 'type_unknown',
            },
            TYPE_73: {
                name: 'Heizungsthermostat',
                devlist: 'type_unknown',
            },
            TYPE_74: {
                name: 'Hue',
                devlist: 'type_hue',
                icon: '/icons/74.png',
            },
            TYPE_75: {
                name: 'Temperatursensor',
                devlist: 'type_unknown',
            },
            TYPE_76: {
                name: 'Rollladenrelais',
                devlist: 'type_shutter',
                icon: '/icons/76.png',
            },
            TYPE_78: {
                name: 'Lichtsensor',
                devlist: 'type_lightsensor',
                icon: '/icons/78.png',
            },
            TYPE_79: {
                name: 'Heizkörperthermostat',
                devlist: 'type_thermostat',
                icon: '/icons/79.png',
            },
            TYPE_81: {
                name: 'Smart Switch',
                devlist: 'type_smart_switch',
                icon: '/icons/81.png',
            },
            TYPE_93: {
                name: 'Erschütterungssensor',
                devlist: 'type_shock_sensor',
                icon: '/icons/93.png',
            },
        };
        return deviceTypes;
    }

    private static getDeviceDatapoints(): defDeviceDatapoints {
        const noanswer_event_en = { 0: 'no answer' };
        const doorbellevent_en = { 3: 'doorbell' };
        const alarm_events_en = {
            5: 'burglar alarm',
            6: 'smoke',
            7: 'medical alarm',
            8: 'water',
            9: 'silence alarm',
            10: 'panic alarm',
            11: 'ermergency alarm',
            15: 'emergency alarm(silence)',
            12: 'fire',
            13: 'CO alarm',
            18: 'Gas alarm',
            19: 'Heat alarm',
        };
        const sensor_events_en = {
            100: 'Sensor-Event 1',
            101: 'Sensor-Event 2',
            102: 'Sensor-Event 3',
            103: 'Sensor-Event 4',
            104: 'Sensor-Event 5',
            105: 'Sensor-Event 6',
            106: 'Sensor-Event 7',
            107: 'Sensor-Event 8',
            108: 'Sensor-Event 9',
            109: 'Sensor-Event 10',
            110: 'Sensor-Event 11',
            111: 'Sensor-Event 12',
            112: 'Sensor-Event 13',
            113: 'Sensor-Event 14',
            114: 'Sensor-Event 15',
            115: 'Sensor-Event 16',
        };
        const szene_events_en = {
            150: 'Szene 1',
            151: 'Szene 2',
            152: 'Szene 3',
            153: 'Szene 4',
            154: 'Szene 5',
            155: 'Szene 6',
            156: 'Szene 7',
            157: 'Szene 8',
            158: 'Szene 9',
            159: 'Szene 10',
            160: 'Szene 11',
            161: 'Szene 12',
            162: 'Szene 13',
            163: 'Szene 14',
            164: 'Szene 15',
            165: 'Szene 16',
        };
        const button_events_en = { ...noanswer_event_en, ...alarm_events_en, ...sensor_events_en, ...szene_events_en };

        const noanswer_event_de = { 0: 'Keine Antwort' };
        const doorbellevent_de = { 3: 'Türklingel' };
        const alarm_events_de = {
            5: 'Einbruchalarm',
            6: 'Rauch',
            7: 'Medizinischer Alarm',
            8: 'Wasser',
            9: 'Stiller Alarm',
            10: 'Panic Alarm',
            11: 'Notfall Alarm',
            15: 'Notfall Alarm (Still)',
            12: 'Feuer',
            13: 'CO Alarm',
            18: 'Gas Alarm',
            19: 'Hitze Alarm',
        };
        const sensor_events_de = {
            100: 'Sensor-Event anwenden 1',
            101: 'Sensor-Event anwenden 2',
            102: 'Sensor-Event anwenden 3',
            103: 'Sensor-Event anwenden 4',
            104: 'Sensor-Event anwenden 5',
            105: 'Sensor-Event anwenden 6',
            106: 'Sensor-Event anwenden 7',
            107: 'Sensor-Event anwenden 8',
            108: 'Sensor-Event anwenden 9',
            109: 'Sensor-Event anwenden 10',
            110: 'Sensor-Event anwenden 11',
            111: 'Sensor-Event anwenden 12',
            112: 'Sensor-Event anwenden 13',
            113: 'Sensor-Event anwenden 14',
            114: 'Sensor-Event anwenden 15',
            115: 'Sensor-Event anwenden 16',
        };
        const szene_events_de = {
            150: 'Szene anwenden 1',
            151: 'Szene anwenden 2',
            152: 'Szene anwenden 3',
            153: 'Szene anwenden 4',
            154: 'Szene anwenden 5',
            155: 'Szene anwenden 6',
            156: 'Szene anwenden 7',
            157: 'Szene anwenden 8',
            158: 'Szene anwenden 9',
            159: 'Szene anwenden 10',
            160: 'Szene anwenden 11',
            161: 'Szene anwenden 12',
            162: 'Szene anwenden 13',
            163: 'Szene anwenden 14',
            164: 'Szene anwenden 15',
            165: 'Szene anwenden 16',
        };
        const button_events_de = { ...noanswer_event_de, ...alarm_events_de, ...sensor_events_de, ...szene_events_de };

        /**
         * List of devices
         */
        const deviceDatapoints: defDeviceDatapoints = {
            // Sirene
            type_siren: {
                alarm_status_ex: {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'sensor.alarm',
                        name: 'Alarm Status',
                        read: true,
                        write: false,
                    },
                },
                alarm_status: {
                    type: 'state',
                    common: {
                        type: 'string',
                        role: 'sensor.alarm',
                        name: 'Alarm Status',
                        read: true,
                        write: false,
                    },
                },
            },
            // Steckdose
            type_switch: {
                status_ex: {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'switch.power',
                        name: {
                            de: 'Schalter',
                            en: 'Switch',
                        },
                        read: true,
                        write: true,
                        states: {
                            en: { false: 'off', true: 'on' },
                            de: { false: 'Aus', true: 'An' },
                        },
                    },
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
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'level',
                        name: {
                            en: 'Minutes to get off again',
                            de: 'Aus in x Minuten',
                        },
                        read: true,
                        write: true,
                        min: 0,
                        max: 180,
                        def: 0,
                    },
                },
                power: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value.power.consumption',
                        name: {
                            en: 'Power',
                            de: 'Verbrauch',
                        },
                        read: true,
                        write: false,
                        unit: 'W',
                    },
                },
                powertotal: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value.power.consumption',
                        name: {
                            en: 'Power Total',
                            de: 'Gesamtverbrauch',
                        },
                        read: true,
                        write: false,
                        unit: 'kWh',
                    },
                },
                always_off: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value',
                        name: {
                            en: 'Switch/Push button',
                            de: 'Schalter/Taster',
                        },
                        read: true,
                        write: true,
                        states: {
                            en: { 0: 'Switch', 1: 'Push button' },
                            de: { 0: 'Schalter', 1: 'Taster' },
                        },
                    },
                },
            },
            type_nuki: {
                nuki_state: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value',
                        name: {
                            de: 'Tür Status',
                            en: 'Door state',
                        },
                        read: true,
                        write: false,
                        states: {
                            en: { 0: 'opend', 1: 'locked', 3: 'unlocked' },
                            de: { 0: 'Tür offen', 1: 'Abgeschlossen', 3: 'Aufgeschlossen' },
                        },
                    },
                },
                nuki_action: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value',
                        name: {
                            de: 'Tür Aktion',
                            en: 'Door action',
                        },
                        read: true,
                        write: true,
                        states: {
                            en: { 0: 'open', 1: 'lock', 3: 'unlock', 4: 'unknown' },
                            de: { 0: 'Tür öffnen', 1: 'abschließen', 3: 'aufschließen', 4: 'nicht bekannt' },
                        },
                        def: 4,
                    },
                },
                status: {
                    type: 'state',
                    common: {
                        type: 'string',
                        role: 'text',
                        name: 'Status',
                        read: true,
                        write: false,
                    },
                },
            },
            // Electric Meter / Hauptstromzähler
            type_electric_meter: {
                factor: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value',
                        name: {
                            de: 'Impulsfaktor pro 1 kWh',
                            en: 'Impulsfactor for 1 kWh',
                        },
                        read: true,
                        write: true,
                    },
                },
                power: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value.power.consumption',
                        name: {
                            en: 'Power',
                            de: 'Verbrauch',
                        },
                        read: true,
                        write: false,
                        unit: 'W',
                    },
                },
                powertotal: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value.power.consumption',
                        name: {
                            en: 'Power Total',
                            de: 'Gesamtverbrauch',
                        },
                        read: true,
                        write: false,
                        unit: 'kWh',
                    },
                },
            },
            // Lichtschalter (Bsp. 24)
            type_pswitch: {
                status_ex: {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'switch.power',
                        name: {
                            de: 'Schalter',
                            en: 'Switch',
                        },
                        read: true,
                        write: true,
                        states: {
                            en: { false: 'off', true: 'on' },
                            de: { false: 'Aus', true: 'An' },
                        },
                    },
                },
                pd: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'level',
                        name: {
                            en: 'Minutes to get off again',
                            de: 'Aus in x Minuten',
                        },
                        read: true,
                        write: true,
                        min: 0,
                        max: 180,
                        def: 0,
                    },
                },
                always_off: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value',
                        name: {
                            en: 'Switch/Push button',
                            de: 'Schalter/Taster',
                        },
                        read: true,
                        write: true,
                        states: {
                            en: { 0: 'Switch', 1: 'Push button' },
                            de: { 0: 'Schalter', 1: 'Taster' },
                        },
                    },
                },
            },
            // Dimmer , Unterputzrelais
            type_dimmer: {
                status_ex: {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'switch.power',
                        name: {
                            de: 'Schalter',
                            en: 'Switch',
                        },
                        read: true,
                        write: true,
                        states: {
                            en: { false: 'off', true: 'on' },
                            de: { false: 'Aus', true: 'An' },
                        },
                    },
                },
                level: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'level.dimmer',
                        name: {
                            en: 'Brightness',
                            de: 'Helligkeit',
                        },
                        read: true,
                        write: true,
                        min: -1,
                        max: 100,
                        step: 1,
                        unit: '%',
                    },
                },
                always_off: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value',
                        name: {
                            en: 'Switch/Push button',
                            de: 'Schalter/Taster',
                        },
                        read: true,
                        write: true,
                        states: {
                            en: { 0: 'Switch', 1: 'Push button' },
                            de: { 0: 'Schalter', 1: 'Taster' },
                        },
                    },
                },
                pd: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'level',
                        name: {
                            en: 'Minutes to get off again',
                            de: 'Aus in x Minuten',
                        },
                        read: true,
                        write: true,
                        min: 0,
                        max: 180,
                        def: 0,
                    },
                },
            },
            // Hue Lampe
            type_hue: {
                status_ex: {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'switch.power',
                        name: {
                            de: 'Schalter',
                            en: 'Switch',
                        },
                        read: true,
                        write: true,
                        states: {
                            en: { false: 'off', true: 'on' },
                            de: { false: 'Aus', true: 'An' },
                        },
                    },
                },
                /*
            mod: {
                 type: 'state',
            common: {
              type: 'number',
              role: 'level',
              name: 'Modus',
              read: true,
              write: true,
              def: 2
            }
            },
            */
                hue: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'level.color.hue',
                        name: 'Hue',
                        read: true,
                        write: true,
                        min: 0,
                        max: 65535,
                    },
                },
                sat: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'level.color.saturation',
                        name: 'Saturation',
                        read: true,
                        write: true,
                        min: 0,
                        max: 360,
                    },
                },
                level: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'level.dimmer',
                        name: {
                            en: 'Brightness',
                            de: 'Helligkeit',
                        },
                        read: true,
                        write: true,
                        min: -1,
                        max: 100,
                        step: 1,
                        unit: '%',
                    },
                },
            },
            // Türkontakt
            type_contact: {
                status_ex: {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'sensor.door',
                        name: 'Status',
                        read: true,
                        write: false,
                    },
                },
                status: {
                    type: 'state',
                    common: {
                        type: 'string',
                        role: 'text',
                        name: 'Status',
                        read: true,
                        write: false,
                    },
                },
                alarm_status_ex: {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'sensor.alarm',
                        name: 'Alarm Status',
                        read: true,
                        write: false,
                    },
                },
                alarm_status: {
                    type: 'state',
                    common: {
                        type: 'string',
                        role: 'sensor.alarm',
                        name: 'Alarm Status',
                        read: true,
                        write: false,
                    },
                },
                send_notify: {
                    type: 'state',
                    common: {
                        type: 'string',
                        role: 'text',
                        name: 'Push notification',
                        read: true,
                        write: true,
                    },
                },
                schar_latch_rpt: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value',
                        name: {
                            en: 'Send SIA/Contact-ID Msg.',
                            de: 'SIA/Contact-ID Nachricht',
                        },
                        read: true,
                        write: true,
                        states: {
                            en: { false: 'off', true: 'on' },
                            de: { false: 'Aus', true: 'An' },
                        },
                        min: 0,
                        max: 1,
                    },
                },
            },
            // Type shock sensor
            type_shock_sensor: {
                alarm_status_ex: {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'sensor.alarm',
                        name: 'Alarm Status',
                        read: true,
                        write: false,
                    },
                },
                alarm_status: {
                    type: 'state',
                    common: {
                        type: 'string',
                        role: 'sensor.alarm',
                        name: 'Alarm Status',
                        read: true,
                        write: false,
                    },
                },
                send_notify: {
                    type: 'state',
                    common: {
                        type: 'string',
                        role: 'text',
                        name: 'Push notification',
                        read: true,
                        write: true,
                    },
                },
            },
            // Bewegungsmelder
            type_motion: {
                alarm_status_ex: {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'sensor.alarm.secure',
                        name: 'Alarm Status',
                        read: true,
                        write: false,
                    },
                },
                alarm_status: {
                    type: 'state',
                    common: {
                        type: 'string',
                        role: 'sensor.alarm.secure',
                        name: 'Alarm Status',
                        read: true,
                        write: false,
                    },
                },
                send_notify: {
                    type: 'state',
                    common: {
                        type: 'string',
                        role: 'text',
                        name: 'Push notification',
                        read: true,
                        write: true,
                    },
                },
            },
            // Glasbruch
            type_sensor_glas: {
                alarm_status_ex: {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'sensor.alarm',
                        name: 'Alarm Status',
                        read: true,
                        write: false,
                    },
                },
                alarm_status: {
                    type: 'state',
                    common: {
                        type: 'string',
                        role: 'sensor.alarm',
                        name: 'Alarm Status',
                        read: true,
                        write: false,
                    },
                },
                send_notify: {
                    type: 'state',
                    common: {
                        type: 'string',
                        role: 'text',
                        name: 'Push Nachricht',
                        read: true,
                        write: true,
                    },
                },
            },
            // Rauchmelder
            type_sensor_fire: {
                alarm_status_ex: {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'sensor.alarm.fire',
                        name: 'Alarm Status',
                        read: true,
                        write: false,
                    },
                },
                alarm_status: {
                    type: 'state',
                    common: {
                        type: 'string',
                        role: 'sensor.alarm.fire',
                        name: 'Alarm Status',
                        read: true,
                        write: false,
                    },
                },
                send_notify: {
                    type: 'state',
                    common: {
                        type: 'string',
                        role: 'text',
                        name: 'Push notification',
                        read: true,
                        write: true,
                    },
                },
            },
            // Hitzemelder
            type_heatdetector: {
                alarm_status_ex: {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'sensor.alarm.fire',
                        name: 'Alarm Status',
                        read: true,
                        write: false,
                    },
                },
                alarm_status: {
                    type: 'state',
                    common: {
                        type: 'string',
                        role: 'sensor.alarm.fire',
                        name: 'Alarm Status',
                        read: true,
                        write: false,
                    },
                },
                send_notify: {
                    type: 'state',
                    common: {
                        type: 'string',
                        role: 'text',
                        name: 'Push Nachricht',
                        read: true,
                        write: true,
                    },
                },
            },
            // Wassermelder
            type_sensor_water: {
                alarm_status_ex: {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'sensor.alarm.flood',
                        name: 'Alarm Status',
                        read: true,
                        write: false,
                    },
                },
                alarm_status: {
                    type: 'state',
                    common: {
                        type: 'string',
                        role: 'sensor.alarm.flood',
                        name: 'Alarm Status',
                        read: true,
                        write: false,
                    },
                },
                send_notify: {
                    type: 'state',
                    common: {
                        type: 'string',
                        role: 'text',
                        name: 'Push Nachricht',
                        read: true,
                        write: true,
                    },
                },
            },
            // Panic button
            type_panic_button: {
                alarm_status_ex: {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'sensor.alarm',
                        name: 'Alarm Status',
                        read: true,
                        write: false,
                    },
                },
                alarm_status: {
                    type: 'state',
                    common: {
                        type: 'string',
                        role: 'sensor.alarm',
                        name: 'Alarm Status',
                        read: true,
                        write: false,
                    },
                },
                sresp_emergency: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value',
                        name: {
                            en: 'Emergency Button',
                            de: 'Notfall Knopf',
                        },
                        read: true,
                        write: true,
                        states: {
                            en: { ...doorbellevent_en, ...alarm_events_en, ...sensor_events_en, ...szene_events_en },
                            de: { ...doorbellevent_de, ...alarm_events_de, ...sensor_events_de, ...szene_events_de },
                        },
                    },
                },
                send_notify: {
                    type: 'state',
                    common: {
                        type: 'string',
                        role: 'text',
                        name: 'Push notification',
                        read: true,
                        write: true,
                    },
                },
            },
            // Rolläden
            type_shutter: {
                level: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'level',
                        name: {
                            en: 'Shutter',
                            de: 'Rollladenhöhe',
                        },
                        read: true,
                        write: true,
                        min: -1,
                        max: 100,
                        step: 1,
                        unit: '%',
                    },
                },
                switch: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'switch',
                        name: {
                            en: 'Shutter down/up',
                            de: 'Rollladen hoch/runter',
                        },
                        read: true,
                        write: true,
                        states: {
                            en: { 0: 'up', 1: 'down', 2: 'stop' },
                            de: { 0: 'hoch', 1: 'runter', 2: 'stop' },
                        },
                        min: 0,
                        max: 2,
                    },
                },
                on_time: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'level.timer',
                        name: {
                            en: 'Time to get up',
                            de: 'Zeitraum um ganz hochzufahren',
                        },
                        read: true,
                        write: true,
                        min: -1,
                        max: 240,
                        step: 0.1,
                        def: 0,
                        unit: 'sec',
                    },
                },
                off_time: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'level.timer',
                        name: {
                            en: 'Time to get down',
                            de: 'Zeitraum um ganz runterzufahren',
                        },
                        read: true,
                        write: true,
                        min: -1,
                        max: 240,
                        step: 0.1,
                        def: 0,
                        unit: 'sec',
                    },
                },
            },
            // Raumsensor / Thermostat Type 20
            type_raumsensor20: {
                actual_temperature: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value.temperature',
                        name: {
                            en: 'Actual temperature',
                            de: 'Aktuelle Temperatur',
                        },
                        read: true,
                        write: false,
                        min: -100,
                        max: 100,
                        unit: '°C',
                    },
                },
                send_notify: {
                    type: 'state',
                    common: {
                        type: 'string',
                        role: 'text',
                        name: 'Push Nachricht',
                        read: true,
                        write: true,
                    },
                },
            },
            // Raumsensor / Thermostat Type 54
            type_raumsensor: {
                actual_temperature: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value.temperature',
                        name: {
                            en: 'Actual temperature',
                            de: 'Aktuelle Temperatur',
                        },
                        read: true,
                        write: false,
                        min: -100,
                        max: 100,
                        unit: '°C',
                    },
                },
                actual_humidity: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value.humidity',
                        name: {
                            en: 'Humidity',
                            de: 'Luftfeuchtigkeit',
                        },
                        read: true,
                        write: false,
                        min: 0,
                        max: 100,
                        unit: '%',
                    },
                },
                send_notify: {
                    type: 'state',
                    common: {
                        type: 'string',
                        role: 'text',
                        name: 'Push Nachricht',
                        read: true,
                        write: true,
                    },
                },
            },
            // Lichtsensor
            type_lightsensor: {
                actual_lux: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value.brightness',
                        name: {
                            en: 'Lux level',
                            de: 'Lux Helligkeitsniveau',
                        },
                        read: true,
                        write: false,
                        min: 0,
                        max: 20,
                    },
                },
                actual_temperature: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value.temperature',
                        name: {
                            en: 'Actual temperature',
                            de: 'Aktuelle Temperatur',
                        },
                        read: true,
                        write: false,
                        min: -100,
                        max: 100,
                        unit: '°C',
                    },
                },
                actual_humidity: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value.humidity',
                        name: {
                            en: 'Humidity',
                            de: 'Luftfeuchtigkeit',
                        },
                        read: true,
                        write: false,
                        min: 0,
                        max: 100,
                        unit: '%',
                    },
                },
                send_notify: {
                    type: 'state',
                    common: {
                        type: 'string',
                        role: 'text',
                        name: 'Push Nachricht',
                        read: true,
                        write: true,
                    },
                },
            },
            // Thermostat
            type_thermostat: {
                set_temperature: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'level.temperature',
                        name: {
                            en: 'Set temperature',
                            de: 'Soll Temperatur',
                        },
                        read: true,
                        write: true,
                        min: -30,
                        max: 30,
                        step: 0.5,
                        unit: '°C',
                    },
                },
                thermo_offset: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'level.temperature',
                        name: {
                            en: 'Offset temperature',
                            de: 'Abweichende Temperatur',
                        },
                        read: true,
                        write: true,
                        min: -2.5,
                        max: 2.5,
                        step: 0.5,
                        unit: '°C',
                    },
                },
                actual_temperature: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value.temperature',
                        name: {
                            en: 'Actual temperatur',
                            de: 'Aktuelle Temperatur',
                        },
                        read: true,
                        write: false,
                        min: -100,
                        max: 100,
                        unit: '°C',
                    },
                },
                mode: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'switch',
                        name: {
                            en: 'Control',
                            de: 'Zeitsteuerung',
                        },
                        read: true,
                        write: true,
                        states: {
                            en: { 0: 'manuell', 1: 'automatic' },
                            de: { 0: 'Manuell', 1: 'Automatisch' },
                        },
                        min: 0,
                        max: 1,
                    },
                },
                valve: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value.valve',
                        name: {
                            en: 'Valve',
                            de: 'Ventilöffnung',
                        },
                        read: true,
                        write: false,
                        min: 0,
                        max: 100,
                        unit: '%',
                    },
                },
                off: {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'switch',
                        name: {
                            en: 'Off/On',
                            de: 'Aus/An',
                        },
                        read: true,
                        write: true,
                        states: {
                            en: { false: 'off', true: 'on' },
                            de: { false: 'Aus', true: 'An' },
                        },
                    },
                },
            },
            // Nichts gefunden
            type_unknown: {
                alarm_status_ex: {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'sensor.alarm',
                        name: 'Alarm Status',
                        read: true,
                        write: false,
                    },
                },
                alarm_status: {
                    type: 'state',
                    common: {
                        type: 'string',
                        role: 'sensor.alarm',
                        name: 'Alarm Status',
                        read: true,
                        write: false,
                    },
                },
                status: {
                    type: 'state',
                    common: {
                        type: 'string',
                        role: 'text',
                        name: 'Status',
                        read: true,
                        write: false,
                    },
                },
                status_ex: {
                    type: 'state',
                    common: {
                        type: 'string',
                        role: 'text',
                        name: 'Status',
                        read: true,
                        write: false,
                    },
                },
            },
            // Innensirene / Statusanzeige
            type_statusanzeige: {
                alarm_status_ex: {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'sensor.alarm',
                        name: 'Alarm Status',
                        read: true,
                        write: false,
                    },
                },
                alarm_status: {
                    type: 'state',
                    common: {
                        type: 'string',
                        role: 'sensor.alarm',
                        name: 'Alarm Status',
                        read: true,
                        write: false,
                    },
                },
            },
            // Repeater
            type_repeater: {
                alarm_status_ex: {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'sensor.alarm',
                        name: 'Alarm Status',
                        read: true,
                        write: false,
                    },
                },
                alarm_status: {
                    type: 'state',
                    common: {
                        type: 'string',
                        role: 'sensor.alarm',
                        name: 'Alarm Status',
                        read: true,
                        write: false,
                    },
                },
            },
            // CO sensor
            type_sensor_co: {
                alarm_status_ex: {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'sensor.alarm',
                        name: 'Alarm Status',
                        read: true,
                        write: false,
                    },
                },
                alarm_status: {
                    type: 'state',
                    common: {
                        type: 'string',
                        role: 'sensor.alarm',
                        name: 'Alarm Status',
                        read: true,
                        write: false,
                    },
                },
            },
            // Smart Switch
            type_smart_switch: {
                alarm_status_ex: {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'sensor.alarm',
                        name: 'Alarm Status',
                        read: true,
                        write: false,
                    },
                },
                alarm_status: {
                    type: 'state',
                    common: {
                        type: 'string',
                        role: 'sensor.alarm',
                        name: 'Alarm Status',
                        read: true,
                        write: false,
                    },
                },
                sresp_button_1: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value',
                        name: {
                            en: 'Button 1',
                            de: 'Taster 1',
                        },
                        read: true,
                        write: true,
                        states: {
                            en: { ...button_events_en },
                            de: { ...button_events_de },
                        },
                    },
                },
                sresp_button_2: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value',
                        name: {
                            en: 'Button 2',
                            de: 'Taster 2',
                        },
                        read: true,
                        write: true,
                        states: {
                            en: { ...button_events_en },
                            de: { ...button_events_de },
                        },
                    },
                },
                sresp_button_3: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value',
                        name: {
                            en: 'Button 3',
                            de: 'Taster 3',
                        },
                        read: true,
                        write: true,
                        states: {
                            en: { ...button_events_en },
                            de: { ...button_events_de },
                        },
                    },
                },
                sresp_button_4: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value',
                        name: {
                            en: 'Button 4',
                            de: 'Taster 4',
                        },
                        read: true,
                        write: true,
                        states: {
                            en: { ...button_events_en },
                            de: { ...button_events_de },
                        },
                    },
                },
            },
            // Universal IR Fernbedienung
            type_ir_remotecontrol: {
                appliance_1: {
                    type: 'channel',
                    common: {
                        name: '%value%',
                    },
                },
                appliance_2: {
                    type: 'channel',
                    common: {
                        name: '%value%',
                    },
                },
                appliance_3: {
                    type: 'channel',
                    common: {
                        name: '%value%',
                    },
                },
                appliance_4: {
                    type: 'channel',
                    common: {
                        name: '%value%',
                    },
                },
                appliance_5: {
                    type: 'channel',
                    common: {
                        name: '%value%',
                    },
                },
                leds: {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: {
                            en: 'LEDs',
                            de: 'LEDs',
                        },
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_1.mode_name_17': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_1.mode_name_18': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_1.mode_name_19': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_1.mode_name_20': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_1.mode_name_21': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_1.mode_name_22': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_1.mode_name_23': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_1.mode_name_24': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_2.mode_name_33': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_2.mode_name_34': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_2.mode_name_35': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_2.mode_name_36': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_2.mode_name_37': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_2.mode_name_38': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_2.mode_name_39': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_2.mode_name_40': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_3.mode_name_49': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_3.mode_name_50': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_3.mode_name_51': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_3.mode_name_52': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_3.mode_name_53': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_3.mode_name_54': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_3.mode_name_55': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_3.mode_name_56': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_4.mode_name_65': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_4.mode_name_66': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_4.mode_name_67': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_4.mode_name_68': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_4.mode_name_69': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_4.mode_name_70': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_4.mode_name_71': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_4.mode_name_72': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_5.mode_name_81': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_5.mode_name_82': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_5.mode_name_83': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_5.mode_name_84': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_5.mode_name_85': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_5.mode_name_86': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_5.mode_name_87': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
                'appliance_5.mode_name_88': {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'button',
                        name: '%value%',
                        read: true,
                        write: true,
                        def: false,
                    },
                },
            },
            type_kpad: {
                sresp_button_123: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value',
                        name: {
                            en: 'Buttons 1-3',
                            de: 'Tastern 1-3',
                        },
                        read: true,
                        write: true,
                        states: {
                            en: { ...doorbellevent_en, ...alarm_events_en, ...sensor_events_en, ...szene_events_en },
                            de: { ...doorbellevent_de, ...alarm_events_de, ...sensor_events_de, ...szene_events_de },
                        },
                    },
                },
                sresp_button_456: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value',
                        name: {
                            en: 'Buttons 4-6',
                            de: 'Tastern 4-6',
                        },
                        read: true,
                        write: true,
                        states: {
                            en: { ...alarm_events_en, ...sensor_events_en, ...szene_events_en },
                            de: { ...alarm_events_de, ...sensor_events_de, ...szene_events_de },
                        },
                    },
                },
                sresp_button_789: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value',
                        name: {
                            en: 'Buttons 7-9',
                            de: 'Tastern 7-9',
                        },
                        read: true,
                        write: true,
                        states: {
                            en: { ...alarm_events_en, ...sensor_events_en, ...szene_events_en },
                            de: { ...alarm_events_de, ...sensor_events_de, ...szene_events_de },
                        },
                    },
                },
            },
            type_kpad_outdoor: {
                sresp_button_123: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value',
                        name: {
                            en: 'Buttons 1-3',
                            de: 'Tastern 1-3',
                        },
                        read: true,
                        write: true,
                        states: {
                            en: { ...doorbellevent_en, ...alarm_events_en, ...sensor_events_en, ...szene_events_en },
                            de: { ...doorbellevent_de, ...alarm_events_de, ...sensor_events_de, ...szene_events_de },
                        },
                    },
                },
                sresp_button_456: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value',
                        name: {
                            en: 'Buttons 4-6',
                            de: 'Tastern 4-6',
                        },
                        read: true,
                        write: true,
                        states: {
                            en: { ...alarm_events_en, ...sensor_events_en, ...szene_events_en },
                            de: { ...alarm_events_de, ...sensor_events_de, ...szene_events_de },
                        },
                    },
                },
                sresp_button_789: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value',
                        name: {
                            en: 'Buttons 7-9',
                            de: 'Tastern 7-9',
                        },
                        read: true,
                        write: true,
                        states: {
                            en: { ...alarm_events_en, ...sensor_events_en, ...szene_events_en },
                            de: { ...alarm_events_de, ...sensor_events_de, ...szene_events_de },
                        },
                    },
                },
                sresp_button_1: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value',
                        name: {
                            en: 'Button 1',
                            de: 'Taster 1',
                        },
                        read: true,
                        write: true,
                        states: {
                            en: { ...button_events_en },
                            de: { ...button_events_de },
                        },
                    },
                },
                sresp_button_2: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value',
                        name: {
                            en: 'Button 2',
                            de: 'Taster 2',
                        },
                        read: true,
                        write: true,
                        states: {
                            en: { ...button_events_en },
                            de: { ...button_events_de },
                        },
                    },
                },
                sresp_button_3: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value',
                        name: {
                            en: 'Button 3',
                            de: 'Taster 3',
                        },
                        read: true,
                        write: true,
                        states: {
                            en: { ...button_events_en },
                            de: { ...button_events_de },
                        },
                    },
                },
                sresp_button_4: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value',
                        name: {
                            en: 'Button 4',
                            de: 'Taster 4',
                        },
                        read: true,
                        write: true,
                        states: {
                            en: { ...button_events_en },
                            de: { ...button_events_de },
                        },
                    },
                },
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
                    type: 'state',
                    common: {
                        type: 'string',
                        role: 'text',
                        name: {
                            en: 'Name of device',
                            de: 'Gerätename',
                        },
                        read: true,
                        write: true,
                    },
                },
                area: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value',
                        name: 'Area',
                        read: true,
                        write: false,
                        states: { 1: 'Area 1', 2: 'Area 2' },
                        min: 1,
                        max: 2,
                    },
                },
                zone: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value',
                        name: 'Zone',
                        read: true,
                        write: false,
                        min: 0,
                        max: 500,
                    },
                },
                tamper_ok: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value',
                        name: {
                            en: 'Sabotage',
                            de: 'Sabotage',
                        },
                        read: true,
                        write: false,
                        states: {
                            en: { 0: 'Error', 1: 'Okay' },
                            de: { 0: 'Fehler', 1: 'Okay' },
                        },
                        min: 0,
                        max: 1,
                    },
                },
                cond_ok: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value',
                        name: {
                            en: 'Condition',
                            de: 'Zustand',
                        },
                        read: true,
                        write: false,
                        states: {
                            en: { 0: 'Error', 1: 'Okay' },
                            de: { 0: 'Fehler', 1: 'Okay' },
                        },
                        min: 0,
                        max: 1,
                    },
                },
                battery_ok: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value',
                        name: {
                            en: 'Battery',
                            de: 'Batterie',
                        },
                        read: true,
                        write: false,
                        states: {
                            en: { 0: 'Low', 1: 'Okay' },
                            de: { 0: 'Leer', 1: 'Okay' },
                        },
                        min: 0,
                        max: 1,
                    },
                },
                /*
            type_f: {
                            type: 'state',
                common: {
              type: 'string',
              role: 'value',
              name: 'Sensortyp',
              read: true,
              write: false}
            },
            */
                rssi: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value',
                        name: {
                            en: 'Rssi',
                            de: 'Rssi',
                        },
                        read: true,
                        write: false,
                        min: 0,
                        max: 9,
                    },
                },
                reachable: {
                    type: 'state',
                    common: {
                        type: 'boolean',
                        role: 'value',
                        name: {
                            en: 'Device reachable',
                            de: 'Gerät erreichbar',
                        },
                        states: {
                            en: { false: 'no', 1: 'yes' },
                            de: { false: 'nein', 1: 'ja' },
                        },
                        read: true,
                        write: false,
                    },
                },
                type: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value',
                        name: {
                            en: 'Devicetype number',
                            de: 'Nummer Gerätetyp',
                        },
                        read: true,
                        write: false,
                    },
                },
                type_name: {
                    type: 'state',
                    common: {
                        type: 'string',
                        role: 'text',
                        name: {
                            en: 'Devicetype',
                            de: 'Gerätetyp',
                        },
                        read: true,
                        write: false,
                    },
                },
                bypass: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value',
                        name: {
                            en: 'Device deactivated',
                            de: 'Gerät deaktiviert',
                        },
                        read: true,
                        write: true,
                        states: {
                            en: { 0: 'off', 1: 'on' },
                            de: { 0: 'Aus', 1: 'An' },
                        },
                        min: 0,
                        max: 1,
                    },
                },
                bypass_tamper: {
                    type: 'state',
                    common: {
                        type: 'number',
                        role: 'value',
                        name: {
                            en: 'Tamper deactivated',
                            de: 'Sabotage deaktivieren',
                        },
                        read: true,
                        write: true,
                        states: {
                            en: { 0: 'off', 1: 'on' },
                            de: { 0: 'Aus', 1: 'An' },
                        },
                        min: 0,
                        max: 1,
                    },
                },
                logmsg: {
                    type: 'state',
                    common: {
                        type: 'string',
                        role: 'value',
                        name: {
                            en: 'Logfile',
                            de: 'Logfile',
                        },
                        read: true,
                        write: false,
                        def: '',
                    },
                },
            },
        };
        return deviceDatapoints;
    }

    private static getStatusDatapoints(): defStatusDatapoints {
        /**
         * Status
         */
        const statusDatapoints: defStatusDatapoints = {
            mode_pc_a1: {
                type: 'state',
                common: {
                    type: 'number',
                    role: 'level',
                    name: {
                        de: 'Modus Area 1',
                        en: 'Modus Area 1',
                    },
                    icon: '/icons/zentrale.png',
                    read: true,
                    write: true,
                    states: {
                        en: { 0: 'Disarm', 1: 'Arm', 2: 'Home1', 3: 'Home2', 4: 'Home3' },
                        de: { 0: 'Disarm', 1: 'Arm', 2: 'Home1', 3: 'Home2', 4: 'Home3' },
                    },
                    min: 0,
                    max: 4,
                },
            },
            apple_home_a1: {
                type: 'state',
                common: {
                    type: 'number',
                    role: 'level',
                    name: {
                        en: 'Apple Home 1',
                        de: 'Apple Home 1',
                    },
                    icon: '/icons/zentrale.png',
                    read: true,
                    write: true,
                    states: {
                        en: { 0: 'stay arm', 1: 'away arm', 2: 'night arm', 3: 'disarm', 4: 'alarm triggered' },
                        de: { 0: 'stay arm', 1: 'away arm', 2: 'night arm', 3: 'disarm', 4: 'alarm triggered' },
                    },
                    min: 0,
                    max: 4,
                },
            },
            mode_pc_a2: {
                type: 'state',
                common: {
                    type: 'number',
                    role: 'level',
                    name: {
                        de: 'Modus Area 2',
                        en: 'Modus Area 2',
                    },
                    icon: '/icons/zentrale.png',
                    read: true,
                    write: true,
                    states: {
                        en: { 0: 'Disarm', 1: 'Arm', 2: 'Home1', 3: 'Home2', 4: 'Home3' },
                        de: { 0: 'Disarm', 1: 'Arm', 2: 'Home1', 3: 'Home2', 4: 'Home3' },
                    },
                    min: 0,
                    max: 4,
                },
            },
            apple_home_a2: {
                type: 'state',
                common: {
                    type: 'number',
                    role: 'level',
                    name: {
                        en: 'Apple Home 2',
                        de: 'Apple Home 2',
                    },
                    icon: '/icons/zentrale.png',
                    read: true,
                    write: true,
                    states: {
                        en: { 0: 'stay arm', 1: 'away arm', 2: 'night arm', 3: 'disarm', 4: 'alarm triggered' },
                        de: { 0: 'stay arm', 1: 'away arm', 2: 'night arm', 3: 'disarm', 4: 'alarm triggered' },
                    },
                    min: 0,
                    max: 4,
                },
            },
            alarm_ex: {
                type: 'state',
                common: {
                    type: 'number',
                    role: 'sensor.alarm',
                    name: {
                        en: 'Alarm Status',
                        de: 'Alarm Status',
                    },
                    icon: '/icons/zentrale.png',
                    read: true,
                    write: false,
                    states: {
                        en: { 0: 'no Alarm', 1: 'Alarm in Area 1', 2: 'Alarm in Area 2' },
                        de: { 0: 'kein Alarm', 1: 'Alarm in Area 1', 2: 'Alarm in Area 2' },
                    },
                    min: 0,
                    max: 2,
                },
            },
            dc_ex: {
                type: 'state',
                common: {
                    type: 'number',
                    role: 'value',
                    name: {
                        en: 'Door contact open',
                        de: 'Tür-/Fensterkontakte',
                    },
                    icon: '/icons/zentrale.png',
                    read: true,
                    write: false,
                    states: {
                        en: { 0: 'Door conntact(s) open', 1: 'Door contact(s) closed' },
                        de: { 0: 'Tür-/Fensterkontakt(e) offen', 1: 'Tür-/Fensterkontakt(e) geschlossen' },
                    },
                    min: 0,
                    max: 1,
                },
            },
            battery_ok: {
                type: 'state',
                common: {
                    type: 'number',
                    role: 'value',
                    name: {
                        en: 'Emergency power battery',
                        de: 'Notstrombatterie',
                    },
                    icon: '/icons/zentrale.png',
                    read: true,
                    write: false,
                    states: {
                        en: { 0: 'Error', 1: 'Okay' },
                        de: { 0: 'Fehler', 1: 'Okay' },
                    },
                    min: 0,
                    max: 1,
                },
            },
            tamper_ok: {
                type: 'state',
                common: {
                    type: 'number',
                    role: 'value',
                    name: {
                        en: 'Sabotage',
                        de: 'Sabotage',
                    },
                    icon: '/icons/zentrale.png',
                    read: true,
                    write: false,
                    states: {
                        en: { 0: 'Error', 1: 'Okay' },
                        de: { 0: 'Fehler', 1: 'Okay' },
                    },
                    min: 0,
                    max: 1,
                },
            },
            interference_ok: {
                type: 'state',
                common: {
                    type: 'number',
                    role: 'value',
                    name: {
                        en: 'Radio interference',
                        de: 'Funkstörungen',
                    },
                    icon: '/icons/zentrale.png',
                    read: true,
                    write: false,
                    states: {
                        en: { 0: 'Error', 1: 'Okay' },
                        de: { 0: 'Fehler', 1: 'Okay' },
                    },
                    min: 0,
                    max: 1,
                },
            },
            ac_activation_ok: {
                type: 'state',
                common: {
                    type: 'number',
                    role: 'value',
                    name: {
                        en: 'Power supply',
                        de: 'Netzteil',
                    },
                    icon: '/icons/zentrale.png',
                    read: true,
                    write: false,
                    states: {
                        en: { 0: 'Error', 1: 'Okay' },
                        de: { 0: 'Fehler', 1: 'Okay' },
                    },
                    min: 0,
                    max: 1,
                },
            },
            rssi: {
                type: 'state',
                common: {
                    type: 'number',
                    role: 'value',
                    name: {
                        en: 'Rssi',
                        de: 'Rssi',
                    },
                    icon: '/icons/zentrale.png',
                    read: true,
                    write: false,
                    min: 0,
                    max: 9,
                },
            },
            reachable: {
                type: 'state',
                common: {
                    type: 'boolean',
                    role: 'value',
                    name: {
                        en: 'Device reachable',
                        de: 'Gerät erreichbar',
                    },
                    icon: '/icons/zentrale.png',
                    states: {
                        en: { false: 'no', 1: 'yes' },
                        de: { false: 'nein', 1: 'ja' },
                    },
                    read: true,
                    write: false,
                },
            },
            sig_gsm_ok: {
                type: 'state',
                common: {
                    type: 'number',
                    role: 'value',
                    name: {
                        en: 'GSM Signal',
                        de: 'GSM Signal',
                    },
                    icon: '/icons/zentrale.png',
                    read: true,
                    write: false,
                    states: {
                        en: { 0: 'Error', 1: 'Okay' },
                        de: { 0: 'Fehler', 1: 'Okay' },
                    },
                    min: 0,
                    max: 1,
                },
            },
        };
        return statusDatapoints;
    }

    private static getSmsDatapoints(): defSmsDatapoints {
        const smsDatapoints: defSmsDatapoints = {
            number: {
                type: 'state',
                common: {
                    type: 'string',
                    role: 'state',
                    name: {
                        en: 'Phone Number',
                        de: 'Telefonnumer',
                    },
                    icon: '/icons/sms.png',
                    read: true,
                    write: true,
                    def: '',
                },
            },
            text: {
                type: 'state',
                common: {
                    type: 'string',
                    role: 'state',
                    name: {
                        en: 'SMS Text',
                        de: 'SMS Text',
                    },
                    icon: '/icons/sms.png',
                    read: true,
                    write: true,
                    def: '',
                },
            },
            dial: {
                type: 'state',
                common: {
                    type: 'boolean',
                    role: 'button',
                    name: {
                        en: 'Send SMS',
                        de: 'SMS senden',
                    },
                    icon: '/icons/sms.png',
                    read: true,
                    write: true,
                    def: false,
                },
            },
            result: {
                type: 'state',
                common: {
                    type: 'number',
                    role: 'value',
                    name: {
                        en: 'Sent Result',
                        de: 'Rückmeldung',
                    },
                    states: {
                        en: { 0: 'Error', 1: 'Okay', 2: 'Sending', 3: 'No Status' },
                        de: { 0: 'Fehler beim senden', 1: 'erfogeich gessendet', 2: 'in Zustellung', 3: 'Kein Status' },
                    },
                    icon: '/icons/sms.png',
                    read: false,
                    write: false,
                    def: 3,
                },
            },
            provider: {
                type: 'state',
                common: {
                    type: 'number',
                    role: 'state',
                    name: {
                        de: 'Provider',
                        en: 'Provider',
                    },
                    icon: '/icons/sms.png',
                    read: false,
                    write: true,
                    states: {
                        en: { 1: 'SMS with SIM Card', 2: 'SMS by Gateway' },
                        de: { 1: 'SMS per SIM Card', 2: 'SMS per Gateway' },
                    },
                    def: 1,
                },
            },
        };
        return smsDatapoints;
    }

    private static getWebcamDatapoints(): defWebcamDatapoints {
        const webcamDatapoints: defWebcamDatapoints = {
            /*
        cam9: {
            type: 'channel',
            common: {
                name: '%value%'
            }
        },
        'camp8.stream': {
            type: 'state',
            common: {
                type: 'string',
                role: 'text.url',
                icon: '/icons/webcam.png',
                name: 'Stream',
                read: true,
                write: false,
                def: ''
            }
        },
        'cam8.image': {
            type: 'state',
            common: {
                type: 'string',
                role: 'text.url',
                icon: '/icons/webcam.png',
                name: 'Image',
                read: true,
                write: false,
                def: ''
            }
        },
        */
            image: {
                type: 'state',
                common: {
                    type: 'string',
                    role: 'text.url',
                    icon: '/icons/webcam.png',
                    name: 'Image',
                    read: true,
                    write: false,
                    def: '',
                },
            },
            stream: {
                type: 'state',
                common: {
                    type: 'string',
                    role: 'text.url',
                    icon: '/icons/webcam.png',
                    name: 'Stream',
                    read: true,
                    write: false,
                    def: '',
                },
            },
        };
        return webcamDatapoints;
    }

    /**
     * Get all information (datapoints) like name, value type, ...for a device type
     *
     * @param devicetype Lupusec Type like 38
     * @param language Language like en, de, ...
     * @returns List of state for Type
     */
    public static getDeviceTypeList(devicetype: number, language: string): defDeviceDatapoints | undefined {
        const deviceTypes = Datapoints.getDeviceTypes();
        const deviceDatapoints = Datapoints.getDeviceDatapoints();

        if (devicetype === undefined) {
            return;
        }
        const typename = `TYPE_${devicetype}`;
        const icon = deviceTypes[typename]?.icon;
        const devlist = deviceTypes[typename]?.devlist;
        /*
    const devicelist = tools.copyObject({
        ...deviceDatapoints[devlist],
        ...deviceDatapoints['type_all']
    });
    */
        const devicelist = Tools.mergeObject(deviceDatapoints[devlist], deviceDatapoints.type_all);
        // const devicelist = tools.mergeObject(tools.copyObject(deviceDatapoints[devlist]), tools.copyObject(deviceDatapoints['type_all']));
        if (devicelist) {
            for (const name in devicelist) {
                if (devicelist[name].common && icon && !devicelist[name].common.icon) {
                    devicelist[name].common.icon = icon;
                }
                if (
                    devicelist[name].common &&
                    devicelist[name].common.states &&
                    devicelist[name].common.states[language]
                ) {
                    devicelist[name].common.states = devicelist[name].common.states[language];
                    continue;
                }
                if (devicelist[name].common && devicelist[name].common.states && devicelist[name].common.states.en) {
                    devicelist[name].common.states = devicelist[name].common.states.en;
                    continue;
                }
            }
        }
        return devicelist;
    }

    /**
     * Returns a icon for a devicetype
     *
     * @param devicetype : device type like 20, 30, 21
     * @returns : icon
     */
    public static getDeviceIconByDeviceType(devicetype: number): string | undefined {
        const deviceTypes = Datapoints.getDeviceTypes();
        if (devicetype === undefined) {
            return;
        }
        const typename = `TYPE_${devicetype}`;
        const icon = deviceTypes[typename]?.icon;
        return icon;
    }

    /**
     *
     * @param devicetype type of lupsec alarm system like 57
     * @returns name of type. for example Nuki
     */
    public static getDeviceNameByDeviceType(devicetype: number): string | undefined {
        const deviceTypes = Datapoints.getDeviceTypes();
        if (devicetype === undefined) {
            return;
        }
        const typename = `TYPE_${devicetype}`;
        const name = deviceTypes[typename]?.name;
        return name;
    }

    /**
     *
     * @param language language like en or de
     * @returns status datapoints
     */
    public static getStatusTypeList(language: string): defStatusDatapoints {
        const statuslist = Datapoints.getStatusDatapoints();
        if (statuslist) {
            for (const name in statuslist) {
                if (
                    statuslist[name].common &&
                    statuslist[name].common.states &&
                    statuslist[name].common.states[language]
                ) {
                    statuslist[name].common.states = statuslist[name].common.states[language];
                    continue;
                }
                if (statuslist[name].common && statuslist[name].common.states && statuslist[name].common.states.en) {
                    statuslist[name].common.states = statuslist[name].common.states.en;
                    continue;
                }
                delete statuslist[name].common?.states;
            }
        }
        return statuslist;
    }

    /**
     *
     * @param language language like en or de
     * @returns sms datapoints
     */
    public static getSMSTypeList(language: string): defSmsDatapoints {
        const smslist = Datapoints.getSmsDatapoints();
        if (smslist) {
            for (const name in smslist) {
                if (smslist[name].common && smslist[name].common.states && smslist[name].common.states[language]) {
                    smslist[name].common.states = smslist[name].common.states[language];
                    continue;
                }
                if (smslist[name].common && smslist[name].common.states && smslist[name].common.states.en) {
                    smslist[name].common.states = smslist[name].common.states.en;
                    continue;
                }
                delete smslist[name].common?.states;
            }
        }
        return smslist;
    }

    /**
     *
     * @param language language like en or de
     * @returns webcam datapoints
     */
    public static getWebcamTypeList(language: string): defWebcamDatapoints {
        const webcamlist = Datapoints.getWebcamDatapoints();
        if (webcamlist) {
            for (const name in webcamlist) {
                if (
                    webcamlist[name].common &&
                    webcamlist[name].common.states &&
                    webcamlist[name].common.states[language]
                ) {
                    webcamlist[name].common.states = webcamlist[name].common.states[language];
                    continue;
                }
                if (webcamlist[name].common && webcamlist[name].common.states && webcamlist[name].common.states.en) {
                    webcamlist[name].common.states = webcamlist[name].common.states.en;
                    continue;
                }
                delete webcamlist[name].common?.states;
            }
        }
        return webcamlist;
    }
}

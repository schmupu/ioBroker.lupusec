// This file extends the AdapterConfig type from "@types/iobroker"

// Augment the globally declared type ioBroker.AdapterConfig
declare global {
    namespace ioBroker {
        interface AdapterConfig {
            alarm_hostname: string;
            alarm_https: boolean;
            alarm_type: string;
            alarm_user: string;
            alarm_password: string;
            alarm_polltime: number;
            nuki_doorsensors: [];
            webcam_providing: boolean;
            webcam_bind: string;
            webcam_port: number;
            option_pollfaster: boolean;
            option_execdelay: number;
            option_updatedelay: number;
        }
    }
}

// this is required so the above AdapterConfig is found by TypeScript / type checking
export {};

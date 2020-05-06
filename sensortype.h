#pragma once

const unsigned int NR_OF_SENSORTYPES = 14;

// values and type names thankfully taken from wlanthermo project
// https://github.com/WLANThermo-nano/WLANThermo_ESP32_Software/blob/master/src/temperature/TemperatureBase.cpp#L294
// https://github.com/WLANThermo-nano/WLANThermo_ESP32_Software/blob/master/src/temperature/TemperatureSensors.h

enum class SensorType {
    UNKNOWN = -1,
    MAVERICK = 0,
    FANTAST_NEW = 1,
    FANTAST = 2,
    IGRILL2 = 3,
    ET73 = 4,
    PERFEKTION = 5,
    GENERIC_50K = 6,
    INKBIRD = 7,
    NTC100K6A1B = 8,
    WEBER6743 = 9,
    SANTOS = 10,
    NTC5K3A1B = 11,
    THERMOWORKS = 12,
    PRO05 = 13
};

struct sensordata_t {
    float rn;
    float a;
    float b;
    float c;
};

class SensorData {
    public:
        static SensorType getSensorTypeByIndex(uint8_t index) {
            if (index >= NR_OF_SENSORTYPES) {
                return SensorType::UNKNOWN;
            }
            switch (index) {
                case 0: return SensorType::MAVERICK; break;
                case 1: return SensorType::FANTAST_NEW; break;
                case 2: return SensorType::FANTAST; break;
                case 3: return SensorType::IGRILL2; break;
                case 4: return SensorType::ET73; break;
                case 5: return SensorType::PERFEKTION; break;
                case 6: return SensorType::GENERIC_50K; break;
                case 7: return SensorType::INKBIRD; break;
                case 8: return SensorType::NTC100K6A1B; break;
                case 9: return SensorType::WEBER6743; break;
                case 10: return SensorType::SANTOS; break;
                case 11: return SensorType::NTC5K3A1B; break;
                case 12: return SensorType::THERMOWORKS; break;
                case 13: return SensorType::PRO05; break;
                default: return SensorType::UNKNOWN;
            }
        }

        static sensordata_t getSensorData(SensorType sensorType) {
            switch (sensorType) {
                case SensorType::MAVERICK:
                    return { .rn = 1000, .a = 0.003358, .b = 0.0002242, .c = 0.00000261 };
                case SensorType::FANTAST_NEW:
                    return { .rn = 220, .a = 0.00334519, .b = 0.000243825, .c = 0.00000261726 };
                case SensorType::FANTAST:
                    return { .rn = 50.08, .a = 3.3558340e-03, .b = 2.5698192e-04, .c = 1.6391056e-06 };
                case SensorType::IGRILL2:
                    return { .rn = 99.61, .a = 3.3562424e-03, .b = 2.5319218e-04, .c = 2.7988397e-06 };
                case SensorType::ET73:
                    return { .rn = 200, .a = 0.00335672, .b = 0.000291888, .c = 0.00000439054 };
                case SensorType::PERFEKTION:
                    return { .rn = 200.1, .a = 3.3561990e-03, .b = 2.4352911e-04, .c = 3.4519389e-06 };
                case SensorType::GENERIC_50K:
                    return { .rn = 50.0, .a = 3.35419603e-03, .b = 2.41943663e-04, .c = 2.77057578e-06 };
                case SensorType::INKBIRD:
                    return { .rn = 48.59, .a = 3.3552456e-03, .b = 2.5608666e-04, .c = 1.9317204e-06 };
                case SensorType::NTC100K6A1B:
                    return { .rn = 100, .a = 0.00335639, .b = 0.000241116, .c = 0.00000243362 };
                case SensorType::WEBER6743:
                    return { .rn = 102.315, .a = 3.3558796e-03, .b = 2.7111149e-04, .c = 3.1838428e-06 };
                case SensorType::SANTOS:
                    return { .rn = 200.82, .a = 3.3561093e-03, .b = 2.3552814e-04, .c = 2.1375541e-06 };
                case SensorType::NTC5K3A1B:
                    return { .rn = 5, .a = 0.0033555, .b = 0.0002570, .c = 0.00000243 };
                case SensorType::THERMOWORKS:
                    return { .rn = 97.31, .a = 3.3556417e-03, .b = 2.5191450e-04, .c = 2.3606960e-06 };
                case SensorType::PRO05:
                    return { .rn = 50.0, .a = 3.3648668e-03, .b = 2.6369913e-04, .c = 3.9587022e-06 };
                default:
#ifdef DEBUG
                    Serial.printf("unknown sensortype: %d\n", sensorType);
#endif
                    return { .rn = 0, .a = 0, .b = 0, .c = 0 };
                }
        }
};
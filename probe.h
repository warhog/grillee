#pragma once

#include <Arduino.h>
#include "adc_mcp3208.h"
#include "sensortype.h"

//#define DEBUG

namespace measurement {

class Probe {
    public:
        Probe(util::Adc_MCP3208 *adc, MCP3208::Channel channel, SensorType sensorType) : _adc(adc), _channel(channel), _probeTemperature(-100), _sensorType(sensorType) {
            _sensorData = SensorData::getSensorData(_sensorType);
        }

        void setSensorType(SensorType sensorType) {
            _sensorType = sensorType;
#ifdef DEBUG
            Serial.printf("updating sensordata to %d\n", sensorType);
#endif
            _sensorData = SensorData::getSensorData(_sensorType);
        }

        SensorType getSensorType() {
            return _sensorType;
        }

        void setSetpoint(uint16_t setpoint) {
            _setpoint = setpoint;
        }

        uint16_t getSetpoint() {
            return _setpoint;
        }

        bool isAlarm() {
            if (getProbeTemperature() <= -100) {
                return false;
            }
            if (getProbeTemperature() >= _setpoint) {
                _alarm = true;
            } else if (getProbeTemperature() < (_setpoint - 1)) {
                _alarm = false;
            }
            return _alarm;
        }

        uint16_t update() {
            if (_timeout()) {
                _timeout.reset();

                if (_sensorData.rn == 0) {
#ifdef DEBUG
                    Serial.println("unknown sensortype");
#endif
                    _probeTemperature = -200;
                    return _probeTemperature;
                }

                uint16_t adcValue = _adc->getRawValue(_channel);
                if (adcValue < 10) {
#ifdef DEBUG
                    Serial.printf("probe not connected: %d\n", adcValue);
#endif
                    _probeTemperature = -100;
                    return _probeTemperature;
                }

                float rMeasure = 47;    // resistance in kOhm of main measurement resistor
                float rTheta = rMeasure * ((4096.0 / (4096.0 - static_cast<float>(adcValue))) - 1.0);
                float v = log(rTheta / _sensorData.rn);
                float temperature = (1 / (_sensorData.a + _sensorData.b * v + _sensorData.c * v * v)) - 273.15;
                _probeTemperature = static_cast<int16_t>(temperature);
#ifdef DEBUG
                Serial.printf("probe: %d -> %f (%d)\n", adcValue, temperature, _probeTemperature);
#endif
            }
            return _probeTemperature;
        }

        int16_t getProbeTemperature() {
            return _probeTemperature;
        }

    private:
        util::Adc_MCP3208 *_adc;
        MCP3208::Channel _channel;
        TimeoutS _timeout{1};
        int16_t _probeTemperature;
        SensorType _sensorType;
        struct sensordata_t _sensorData;
        uint16_t _setpoint{80};
        bool _alarm{false};

};

}
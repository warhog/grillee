#pragma once

#include <Arduino.h>
#include "adc.h"
#include "sensortype.h"

#define DEBUG

class Probe {
    public:
        Probe(gpio_num_t pin, SensorType sensorType) : _probeTemperature(-100), _sensorType(sensorType) {
            _adc = new Adc(pin, 5, ADC_11db);
        }

        void setSensorType(SensorType sensorType) {
            _sensorType = sensorType;
        }

        uint16_t update() {
            if (_timeout()) {
                _timeout.reset();
                _adc->update();
                uint16_t adcValue = _adc->getRawValue();
                if (adcValue < 10) {
#ifdef DEBUG
                    Serial.printf("probe not connected: %d\n", adcValue);
#endif
                    _probeTemperature = -100;
                    return _probeTemperature;
                }
                struct sensordata_t sensorData = SensorData::getSensorData(_sensorType);
                if (sensorData.rn == 0) {
#ifdef DEBUG
                    Serial.println("unknown sensortype");
#endif
                    _probeTemperature = -200;
                    return _probeTemperature;
                }
                float rMeasure = 47;
                float rt = rMeasure * ((4096.0 / (4096.0 - static_cast<float>(adcValue))) - 1.0);
                float v = log(rt / sensorData.rn);
                float temperature = (1 / (sensorData.a + sensorData.b * v + sensorData.c * v * v)) - 273.15;
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
        Adc *_adc;
        TimeoutS _timeout{1};
        int16_t _probeTemperature;
        SensorType _sensorType;

};
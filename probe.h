#pragma once

#include <Arduino.h>
#include "adc.h"
#include "sensortype.h"

#define DEBUG

namespace measurement {

class Probe {
    public:
        Probe(gpio_num_t pin, SensorType sensorType) : _probeTemperature(-100), _sensorType(sensorType) {
            _adc = new Adc(pin, 5, ADC_11db);
            pinMode(pin, INPUT);
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
                if (_sensorData.rn == 0) {
#ifdef DEBUG
                    Serial.println("unknown sensortype");
#endif
                    _probeTemperature = -200;
                    return _probeTemperature;
                }
                float rMeasure = 47;    // resistance in kOhm of main measurement resistor
                float voltage = 4096.0 / (4096.0 - static_cast<float>(adcValue));
                Serial.printf("volt: %f\n", voltage);
                float rThermistor = rMeasure * (voltage - 1.0);
                float v = log(rThermistor / _sensorData.rn);
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
        Adc *_adc;
        TimeoutS _timeout{1};
        int16_t _probeTemperature;
        SensorType _sensorType;
        struct sensordata_t _sensorData;

};

}
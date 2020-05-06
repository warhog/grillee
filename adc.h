#pragma once

#include <Arduino.h>
#include <MedianFilterLib.h>
#include <esp_adc_cal.h>

const uint16_t DEFAULT_VOLTAGE_REFERENCE = 1111;

class Adc {
    public:
        Adc(gpio_num_t pin, uint16_t medianWindowSize = 10, adc_attenuation_t attenuation = ADC_0db) : _pin(pin),
            _defaultVref(DEFAULT_VOLTAGE_REFERENCE),
            _medianWindowSize(medianWindowSize),
            _rawValue(0), _filteredValue(0), _attenuation(attenuation) {
            pinMode(_pin, INPUT);
            analogSetPinAttenuation(_pin, attenuation);

            _adcCharacteristics = new esp_adc_cal_characteristics_t;
            esp_adc_cal_characterize(ADC_UNIT_1, ADC_ATTEN_DB_0, ADC_WIDTH_BIT_12, _defaultVref, _adcCharacteristics);

            _medianFilter = new MedianFilter<uint16_t>(medianWindowSize);
        }

        void update() {
            _rawValue = analogRead(_pin);
            _filteredValue = _medianFilter->AddValue(_rawValue);
        }

        uint16_t getRawValue() {
            return _rawValue;
        }

        uint16_t getFilteredValue() {
            return _filteredValue;
        }

        uint32_t getRawVoltage() {
            return esp_adc_cal_raw_to_voltage(_rawValue, _adcCharacteristics);
        }

        uint32_t getFilteredVoltage() {
            return esp_adc_cal_raw_to_voltage(_filteredValue, _adcCharacteristics);
        }

        void setDefaultVref(uint16_t defaultVref) {
            _defaultVref = defaultVref;
            esp_adc_cal_characterize(ADC_UNIT_1, ADC_ATTEN_DB_0, ADC_WIDTH_BIT_12, _defaultVref, _adcCharacteristics);
        }
        static void enableVrefOutput(gpio_num_t pin) {
#ifdef DEBUG
            Serial.println(F("enabling vref output"));
#endif
            esp_err_t status = adc2_vref_to_gpio(pin);
#ifdef DEBUG
            if (status == ESP_OK) {
                Serial.println(F("v_ref routed to GPIO"));
            } else {
                Serial.println(F("failed to route v_ref"));
            }
#endif
        }

    private:
        gpio_num_t _pin;
        esp_adc_cal_characteristics_t *_adcCharacteristics;
        uint16_t _defaultVref;
        MedianFilter<uint16_t> *_medianFilter;
        uint16_t _medianWindowSize;
        uint16_t _rawValue;
        uint16_t _filteredValue;
        adc_attenuation_t _attenuation;

};
#include "storage.h"

namespace util {

#define DEBUG

const char* CONFIG_VERSION = "100";
const unsigned int CONFIG_START = 32;

#ifndef max
    #define max(a,b) ({ __typeof__ (a) _a = (a); __typeof__ (b) _b = (b); _a > _b ? _a : _b; })
#endif

void Storage::loadFactoryDefaults() {
    _sensorType1 = SensorType::UNKNOWN;
    _sensorType2 = SensorType::UNKNOWN;
    _setpoint1 = 80;
    _setpoint2 = 80;
    // default vref is skipped as this is more like a factory default than a user setting
}

bool Storage::isValid() {
    return EEPROM.read(CONFIG_START + 0) == CONFIG_VERSION[0] && EEPROM.read(CONFIG_START + 1) == CONFIG_VERSION[1] && EEPROM.read(CONFIG_START + 2) == CONFIG_VERSION[2];
}

void Storage::load() {
    if (EEPROM.read(CONFIG_START + 0) == CONFIG_VERSION[0] && EEPROM.read(CONFIG_START + 1) == CONFIG_VERSION[1] && EEPROM.read(CONFIG_START + 2) == CONFIG_VERSION[2]) {
#ifdef DEBUG
        Serial.println(F("load values from eeprom"));
#endif
        StorageEepromStruct storage;
        for (unsigned int t = 0; t < sizeof(storage); t++) {
            *((char*)&storage + t) = EEPROM.read(CONFIG_START + t);
        }
        _sensorType1 = SensorData::getSensorTypeByIndex(storage.sensorType1);
        _sensorType2 = SensorData::getSensorTypeByIndex(storage.sensorType2);
        _setpoint1 = storage.setpoint1;
        _setpoint2 = storage.setpoint2;
        _defaultVref = storage.defaultVref;
#ifdef DEBUG
        Serial.printf("sensorType1: %d, sensorType2: %d, setpoint1: %d, setpoint2: %d, _defaultVref: %d\n", _sensorType1, _sensorType2, _setpoint1, _setpoint2, _defaultVref);
#endif
    } else {
#ifdef DEBUG
        Serial.println(F("load default values"));
#endif
        this->store();
    }
}

void Storage::store() {
#ifdef DEBUG
    Serial.println(F("store config to eeprom"));
#endif

    StorageEepromStruct storage;
    strncpy(storage.version, CONFIG_VERSION, 3);
    storage.defaultVref = _defaultVref;
    storage.sensorType1 = SensorData::getSensorIndexByType(_sensorType1);
    storage.sensorType2 = SensorData::getSensorIndexByType(_sensorType2);
    storage.setpoint1 = _setpoint1;
    storage.setpoint2 = _setpoint2;
    
    for (unsigned int t = 0; t < sizeof(storage); t++) {
        EEPROM.write(CONFIG_START + t, *((char*)&storage + t));
    }
    EEPROM.commit();
}

}
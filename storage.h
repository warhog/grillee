#pragma once
#include <Arduino.h>
#include <EEPROM.h>
#include "sensortype.h"

namespace util {

class Storage {
public:
    void load();
    void store();
    void loadFactoryDefaults();
    bool isValid();
    
    void setSensorType1(SensorType sensorType) {
        _sensorType1 = sensorType;
    }

    SensorType getSensorType1() {
        return _sensorType1;
    }

    void setSensorType2(SensorType sensorType) {
        _sensorType2 = sensorType;
    }

    SensorType getSensorType2() {
        return _sensorType2;
    }

    void setSetpoint1(uint16_t setpoint1) {
        _setpoint1 = setpoint1;
    }

    uint8_t getSetpoint1() {
        return _setpoint1;
    }

    void setSetpoint2(uint16_t setpoint2) {
        _setpoint2 = setpoint2;
    }

    uint8_t getSetpoint2() {
        return _setpoint2;
    }

private:
    SensorType _sensorType1{SensorType::UNKNOWN};
    SensorType _sensorType2{SensorType::UNKNOWN};
    uint16_t _setpoint1{80};
    uint16_t _setpoint2{80};

    struct StorageEepromStruct {
        char version[4];
        uint8_t sensorType1;
        uint8_t sensorType2;
        uint16_t setpoint1;
        uint16_t setpoint2;
    };

};

}
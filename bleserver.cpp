/**
* Copyright (C) 2020 warhog <warhog@gmx.de>
* 
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
* 
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
* 
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <https://www.gnu.org/licenses/>.
**/
#include "bleserver.h"

namespace ble {

    void BleServer::begin() {
        BLEDevice::init("LotusBLE");
        _server = BLEDevice::createServer();
        _server->setCallbacks(new MyServerCallbacks(this));

        _service = _server->createService(BLEUUID(SERVICE_UUID), NR_OF_CHARACTERISTICS * 4);

    }

    void BleServer::start() {
        _characteristicAlarm = createCharacteristic(BLEUUID(CHARACTERISTIC_ALARM_UUID));
        _characteristicSetpoint1 = createCharacteristic(BLEUUID(CHARACTERISTIC_SETPOINT1_UUID));
        _characteristicSetpoint2 = createCharacteristic(BLEUUID(CHARACTERISTIC_SETPOINT2_UUID));
        _characteristicTemperature1 = createCharacteristic(BLEUUID(CHARACTERISTIC_TEMPERATURE1_UUID));
        _characteristicTemperature2 = createCharacteristic(BLEUUID(CHARACTERISTIC_TEMPERATURE2_UUID));
        _characteristicFan = createCharacteristic(BLEUUID(CHARACTERISTIC_FAN_UUID));
        _characteristicRpm = createCharacteristic(BLEUUID(CHARACTERISTIC_RPM_UUID));
        _characteristicBattery = createCharacteristic(BLEUUID(CHARACTERISTIC_BATTERY_UUID));
        _characteristicSensorType1 = createCharacteristic(BLEUUID(CHARACTERISTIC_SENSORTYPE1_UUID));
        _characteristicSensorType2 = createCharacteristic(BLEUUID(CHARACTERISTIC_SENSORTYPE2_UUID));

        MyCharacteristicCallback *characteristicCallback = new MyCharacteristicCallback(this);
        _characteristicAlarm->setCallbacks(characteristicCallback);
        _characteristicSetpoint1->setCallbacks(characteristicCallback);
        _characteristicSetpoint2->setCallbacks(characteristicCallback);
        _characteristicFan->setCallbacks(characteristicCallback);
        _characteristicSensorType1->setCallbacks(characteristicCallback);
        _characteristicSensorType2->setCallbacks(characteristicCallback);

        _service->start();

        BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
        pAdvertising->addServiceUUID(BLEUUID(SERVICE_UUID));
        pAdvertising->setScanResponse(true);
        BLEDevice::startAdvertising();
    }

    void BleServer::setAlarm(uint8_t alarm) {
        _characteristicAlarm->setValue(std::string((char *)&alarm, 1));
        if (_devicesConnected > 0) {
            _characteristicAlarm->notify();
        }
    }

    void BleServer::setSetpoint1(uint16_t setpoint) {
        _characteristicSetpoint1->setValue(std::string((char *)&setpoint, 2));
        if (_devicesConnected > 0) {
            _characteristicSetpoint1->notify();
        }
    }

    void BleServer::setSetpoint2(uint16_t setpoint) {
        _characteristicSetpoint2->setValue(std::string((char *)&setpoint, 2));
        if (_devicesConnected > 0) {
            _characteristicSetpoint2->notify();
        }
    }

    void BleServer::setTemperature1(int16_t temperature) {
        _characteristicTemperature1->setValue(std::string((char *)&temperature, 2));
        if (_devicesConnected > 0) {
            _characteristicTemperature1->notify();
        }
    }

    void BleServer::setTemperature2(int16_t temperature) {
        _characteristicTemperature2->setValue(std::string((char *)&temperature, 2));
        if (_devicesConnected > 0) {
            _characteristicTemperature2->notify();
        }
    }

    void BleServer::setFan(uint8_t fan) {
        _characteristicFan->setValue(std::string((char *)&fan, 1));
        if (_devicesConnected > 0) {
            _characteristicFan->notify();
        }
    }

    void BleServer::setRpm(uint16_t rpm) {
        _characteristicRpm->setValue(rpm);
        if (_devicesConnected > 0) {
            _characteristicRpm->notify();
        }
    }

    void BleServer::setBattery(float battery) {
        _characteristicBattery->setValue(battery);
        if (_devicesConnected > 0) {
            _characteristicBattery->notify();
        }
    }

    void BleServer::setSensorType1(SensorType sensorType) {
        uint8_t sensorIndex = SensorData::getSensorIndexByType(sensorType);
        _characteristicSensorType1->setValue((uint8_t *)&sensorIndex, 1);
        if (_devicesConnected > 0) {
            _characteristicSensorType1->notify();
        }
    }

    void BleServer::setSensorType2(SensorType sensorType) {
        uint8_t sensorIndex = SensorData::getSensorIndexByType(sensorType);
        _characteristicSensorType2->setValue((uint8_t *)&sensorIndex, 1);
        if (_devicesConnected > 0) {
            _characteristicSensorType2->notify();
        }
    }

}
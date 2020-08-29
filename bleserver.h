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
#pragma once

#include <string>
#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include <BLE2902.h>

#include "sensortype.h"

namespace ble {

    #define NR_OF_CHARACTERISTICS 10
    #define SERVICE_UUID "32b33b05-6ac4-4137-9ca7-6dc3dbac4e41"
    #define CHARACTERISTIC_ALARM_UUID "06817906-f5db-4d66-86e4-776e74074cd6"
    #define CHARACTERISTIC_SETPOINT1_UUID "857f0daf-b9e1-45c9-9df3-c935f3e0f163"
    #define CHARACTERISTIC_SETPOINT2_UUID "779d932a-c52c-43a0-a38f-668e0bc76f68"
    #define CHARACTERISTIC_TEMPERATURE1_UUID "fc24e2b1-9612-4a85-8f13-c7c0b8ed74c9"
    #define CHARACTERISTIC_TEMPERATURE2_UUID "94570d21-a9ca-45d7-a313-8238593286e5"
    #define CHARACTERISTIC_SENSORTYPE1_UUID "a4b7ca52-c743-4931-9153-ec28030a41a4"
    #define CHARACTERISTIC_SENSORTYPE2_UUID "7488eed8-6b19-4391-9a83-9c97d6f10319"
    #define CHARACTERISTIC_FAN_UUID "0303ed74-974e-4ae2-8cee-7296eaffadfa"
    #define CHARACTERISTIC_RPM_UUID "26552eef-1507-4e7d-8845-99b815841856"
    #define CHARACTERISTIC_BATTERY_UUID "12325d24-0357-4877-b57a-d323793b44b3"

    class BleServer {
    public:
        BleServer() : _fanCallback(nullptr), _controlByBleCallback(nullptr), _setpointCallback(nullptr),
            _sensorTypeCallback(nullptr), _alarmCallback(nullptr) {
            }

        /**
         * @brief Create a %BLE Service.
         *
         * With a %BLE server, we can host one or more services.  Invoking this function causes the creation of a definition
         * of a new service.  Every service must have a unique UUID.
         * @param [in] uuid The UUID of the new service.
         * @param [in] numHandles The maximum number of handles associated with this service.
         * @param [in] inst_id With multiple services with the same UUID we need to provide inst_id value different for each service.
         * @return A reference to the new service object.
         */
        void begin();

        void setControlByBleCallback(void (*controlByBleCallback)(bool control)) {
            _controlByBleCallback = controlByBleCallback;
        }

        void setFanWriteCallback(void (*callback)(uint8_t value)) {
            _fanCallback = callback;
        }

        void setSetpointWriteCallback(void (*callback)(uint16_t value, uint8_t nr)) {
            _setpointCallback = callback;
        }

        void setAlarmWriteCallback(void (*callback)()) {
            _alarmCallback = callback;
        }

        void setSensorTypeCallback(void (*callback)(uint8_t sensorType, uint8_t nr)) {
            _sensorTypeCallback = callback;
        }

        void start();

        void setAlarm(uint8_t alarm);

        void setSetpoint1(uint16_t setpoint);

        void setSetpoint2(uint16_t setpoint);

        void setTemperature1(int16_t temperature);

        void setTemperature2(int16_t temperature);

        void setFan(uint8_t fan);

        void setRpm(uint16_t rpm);

        void setBattery(float battery);

        void setSensorType1(SensorType sensorType);

        void setSensorType2(SensorType sensorType);

        void stop() {
            _service->stop();
        }

        private:
            BLEServer *_server;
            BLEService *_service;
            BLECharacteristic *_characteristicAlarm;
            BLECharacteristic *_characteristicSetpoint1;
            BLECharacteristic *_characteristicSetpoint2;
            BLECharacteristic *_characteristicTemperature1;
            BLECharacteristic *_characteristicTemperature2;
            BLECharacteristic *_characteristicFan;
            BLECharacteristic *_characteristicRpm;
            BLECharacteristic *_characteristicBattery;
            BLECharacteristic *_characteristicSensorType1;
            BLECharacteristic *_characteristicSensorType2;
            uint8_t _devicesConnected;
            void (*_controlByBleCallback)(bool control);
            void (*_fanCallback)(uint8_t value);
            void (*_setpointCallback)(uint16_t value, uint8_t number);
            void (*_alarmCallback)();
            void (*_sensorTypeCallback)(uint8_t sensorType, uint8_t number);

            friend class MyServerCallbacks;
            friend class MyCharacteristicCallback;

            BLECharacteristic* createCharacteristic(BLEUUID uuid) {
                BLECharacteristic *characteristic = _service->createCharacteristic(uuid, BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_NOTIFY | BLECharacteristic::PROPERTY_INDICATE);
                characteristic->addDescriptor(new BLE2902());
                characteristic->setValue("0");
                return characteristic;
            }

            class MyCharacteristicCallback: public BLECharacteristicCallbacks {
                public:
                    MyCharacteristicCallback(BleServer *bleServer) : _bleServer(bleServer) {}

                    void onWrite(BLECharacteristic *characteristic) {
                        if (characteristic == _bleServer->_characteristicFan) {
                            if (_bleServer->_fanCallback != nullptr) {
                                uint8_t fanSpeed = *((uint8_t *)(characteristic->getValue().data()));
                                _bleServer->_fanCallback(fanSpeed);
                            }
                        } else if (characteristic == _bleServer->_characteristicSetpoint1) {
                            if (_bleServer->_setpointCallback != nullptr) {
                                uint16_t setpoint = *((uint16_t *)(characteristic->getValue().data()));
                                _bleServer->_setpointCallback(setpoint, 1);
                            }
                        } else if (characteristic == _bleServer->_characteristicSetpoint2) {
                            if (_bleServer->_setpointCallback != nullptr) {
                                uint16_t setpoint = *((uint16_t *)(characteristic->getValue().data()));
                                _bleServer->_setpointCallback(setpoint, 2);
                            }
                        } else if (characteristic == _bleServer->_characteristicAlarm) {
                            if (_bleServer->_alarmCallback != nullptr) {
                                _bleServer->_alarmCallback();
                            }
                        } else if (characteristic == _bleServer->_characteristicSensorType1) {
                            if (_bleServer->_sensorTypeCallback != nullptr) {
                                uint8_t sensorType = *((uint8_t *)(characteristic->getValue().data()));
                                _bleServer->_sensorTypeCallback(sensorType, 1);
                            }
                        } else if (characteristic == _bleServer->_characteristicSensorType2) {
                            if (_bleServer->_sensorTypeCallback != nullptr) {
                                uint8_t sensorType = *((uint8_t *)(characteristic->getValue().data()));
                                _bleServer->_sensorTypeCallback(sensorType, 2);
                            }
                        }
                    }
                private:
                    BleServer *_bleServer;
            };

            class MyServerCallbacks: public BLEServerCallbacks {
                public:
                    MyServerCallbacks(BleServer *bleServer) : _bleServer(bleServer) {}

                    void onConnect(BLEServer* pServer) {
                        _bleServer->_devicesConnected++;
                        if (_bleServer->_controlByBleCallback != nullptr) {
                            _bleServer->_controlByBleCallback(true);
                        }
                    };

                    void onDisconnect(BLEServer* pServer) {
                        _bleServer->_devicesConnected--;
                        if (_bleServer->_controlByBleCallback != nullptr) {
                            _bleServer->_controlByBleCallback(false);
                        }
                    }
                private:
                    BleServer *_bleServer;
            };



    };

}
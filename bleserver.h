#pragma once

#include <string>
#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include <BLE2902.h>

#define NR_OF_CHARACTERISTICS 9
#define SERVICE_UUID "32b33b05-6ac4-4137-9ca7-6dc3dbac4e41"
#define CHARACTERISTIC_ALARM_UUID "06817906-f5db-4d66-86e4-776e74074cd6"
#define CHARACTERISTIC_ALARMACK_UUID "16817906-f5db-4d66-86e4-776e74074cd6"
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
    BleServer() : _fanWriteCallback(nullptr), _controlByBleCallback(nullptr) {}

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
    void begin() {
        BLEDevice::init("LotusBLE");
        _server = BLEDevice::createServer();
        _server->setCallbacks(new MyServerCallbacks(this));

        _service = _server->createService(BLEUUID(SERVICE_UUID), NR_OF_CHARACTERISTICS * 4);

    }

    void setControlByBleCallback(void (*controlByBleCallback)(bool control)) {
        _controlByBleCallback = controlByBleCallback;
    }

    void setFanWriteCallback(void (*callback)(uint16_t value)) {
        _fanWriteCallback = callback;
    }

    void setSetpointWriteCallback(void (*callback)(uint16_t value, uint8_t nr)) {
        _setpointCallback = callback;
    }

    void setAlarmAckWriteCallback(void (*callback)()) {
        _alarmAckWriteCallback = callback;
    }

    void setSensorTypeCallback(void (*callback)(uint8_t sensorType, uint8_t nr)) {
        _sensorTypeCallback = callback;
    }

    void start() {
        _characteristicAlarm = createCharacteristic(BLEUUID(CHARACTERISTIC_ALARM_UUID));
        _characteristicAlarmAck = createCharacteristic(BLEUUID(CHARACTERISTIC_ALARMACK_UUID));
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
        _characteristicAlarmAck->setCallbacks(characteristicCallback);
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

    void setAlarm(bool alarm) {
        uint8_t temp[2];
        temp[0] = alarm ? 1 : 0;
        _characteristicAlarm->setValue(temp, 2);
        if (_devicesConnected > 0) {
            _characteristicAlarm->notify();
        }
    }

    void setSetpoint1(uint16_t setpoint) {
        _characteristicSetpoint1->setValue(setpoint);
        if (_devicesConnected > 0) {
            _characteristicSetpoint1->notify();
        }
    }

    void setSetpoint2(uint16_t setpoint) {
        _characteristicSetpoint2->setValue(setpoint);
        if (_devicesConnected > 0) {
            _characteristicSetpoint2->notify();
        }
    }

    void setTemperature1(int16_t temperature) {
        _characteristicTemperature1->setValue((uint8_t *)&temperature, 2);
        if (_devicesConnected > 0) {
            _characteristicTemperature1->notify();
        }
    }

    void setTemperature2(int16_t temperature) {
        _characteristicTemperature2->setValue((uint8_t *)&temperature, 2);
        if (_devicesConnected > 0) {
            _characteristicTemperature2->notify();
        }
    }

    void setFan(uint16_t fan) {
        _characteristicFan->setValue(fan);
        if (_devicesConnected > 0) {
            _characteristicFan->notify();
        }
    }

    void setRpm(uint16_t rpm) {
        _characteristicRpm->setValue(rpm);
        if (_devicesConnected > 0) {
            _characteristicRpm->notify();
        }
    }

    void setBattery(float battery) {
        _characteristicBattery->setValue(battery);
        if (_devicesConnected > 0) {
            _characteristicBattery->notify();
        }
    }

    void stop() {
        _service->stop();
    }

    private:
        BLEServer *_server;
        BLEService *_service;
        BLECharacteristic *_characteristicAlarm;
        BLECharacteristic *_characteristicAlarmAck;
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
        void (*_fanWriteCallback)(uint16_t value);
        void (*_setpointCallback)(uint16_t value, uint8_t number);
        void (*_alarmAckWriteCallback)();
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
                        if (_bleServer->_fanWriteCallback != nullptr) {
                            Serial.println(atoi(_bleServer->_characteristicFan->getValue().c_str()));
                            Serial.println(_bleServer->_characteristicFan->getValue().c_str());
                            _bleServer->_fanWriteCallback(atoi(_bleServer->_characteristicFan->getValue().c_str()));
                        }
                    } else if (characteristic == _bleServer->_characteristicSetpoint1) {
                        if (_bleServer->_setpointCallback != nullptr) {
                            _bleServer->_setpointCallback(atoi(_bleServer->_characteristicSetpoint1->getValue().c_str()), 1);
                        }
                    } else if (characteristic == _bleServer->_characteristicSetpoint2) {
                        if (_bleServer->_setpointCallback != nullptr) {
                            _bleServer->_setpointCallback(atoi(_bleServer->_characteristicSetpoint2->getValue().c_str()), 2);
                        }
                    } else if (characteristic == _bleServer->_characteristicAlarmAck) {
                        if (_bleServer->_alarmAckWriteCallback != nullptr) {
                            _bleServer->_alarmAckWriteCallback();
                        }
                    } else if (characteristic == _bleServer->_characteristicSensorType1) {
                        if (_bleServer->_sensorTypeCallback != nullptr) {
                            _bleServer->_sensorTypeCallback(atoi(_bleServer->_characteristicSensorType1->getValue().c_str()), 1);
                        }
                    } else if (characteristic == _bleServer->_characteristicSensorType2) {
                        if (_bleServer->_sensorTypeCallback != nullptr) {
                            _bleServer->_sensorTypeCallback(atoi(_bleServer->_characteristicSensorType2->getValue().c_str()), 2);
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
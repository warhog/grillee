#include <Arduino.h>
#include <MedianFilterLib.h>
#include <Mcp320x.h>

#include "timeout.h"
#include "toggle.h"
#include "edgedetector.h"
#include "bleserver.h"

#include "battery.h"
#include "adc.h"
#include "adc_mcp3208.h"
#include "sensortype.h"
#include "probe.h"
#include "fan.h"
#include "storage.h"
#include "buzzer.h"

#define DEBUG

const gpio_num_t PIN_FAN = GPIO_NUM_17;
const gpio_num_t PIN_ADC_POTI = GPIO_NUM_34;
const gpio_num_t PIN_ADC_BATTERY = GPIO_NUM_35;
const gpio_num_t PIN_ADC_MEAT_PROBE1 = GPIO_NUM_32;
const gpio_num_t PIN_ADC_MEAT_PROBE2 = GPIO_NUM_33;
const gpio_num_t PIN_RPM = GPIO_NUM_27;
const gpio_num_t PIN_ALARM_BUZZER = GPIO_NUM_16;
const gpio_num_t PIN_DEFAULT_VOLTAGE_OUTPUT = GPIO_NUM_26;
const gpio_num_t PIN_ADC_CS = GPIO_NUM_5;

const MCP3208::Channel ADC_CHANNEL_BATTERY = MCP3208::Channel::SINGLE_7;
const MCP3208::Channel ADC_CHANNEL_PROBE0 = MCP3208::Channel::SINGLE_0;
const MCP3208::Channel ADC_CHANNEL_PROBE1 = MCP3208::Channel::SINGLE_1;

// weather controlled by bluetooth or poti
bool controlByBle = false;

// alarm
bool alarmAcked{false};
bool alarmFan{false};
bool alarmBattery{false};

EdgeDetector<bool> alarmChanged(false);
EdgeDetector<bool> alarmFanChanged(false);
EdgeDetector<bool> alarmBatteryChanged(false);
EdgeDetector<bool> alarmProbe1Changed(false);
EdgeDetector<bool> alarmProbe2Changed(false);

TimeoutMs timeoutReadPoti(25);

EdgeDetector<float> batteryChanged(0, 0.1);
EdgeDetector<uint16_t> rpmChanged(0, 100);
EdgeDetector<uint8_t> fanPercentChanged(0);

EdgeDetector<int16_t> probe1Changed(0, 1);
EdgeDetector<int16_t> probe2Changed(0, 1);

BleServer bleServer;

util::Adc_MCP3208 adcMcp3208;
util::Storage storage;
util::Buzzer buzzer(PIN_ALARM_BUZZER);
util::Battery battery(&adcMcp3208, ADC_CHANNEL_BATTERY);

measurement::Probe probe1(&adcMcp3208, ADC_CHANNEL_PROBE0, SensorType::UNKNOWN);
measurement::Probe probe2(&adcMcp3208, ADC_CHANNEL_PROBE1, SensorType::UNKNOWN);

MedianFilter<uint16_t> medianFilterPoti(10);

void rpmIsr();
ventilation::Fan fan(PIN_FAN, PIN_RPM, &rpmIsr);
void IRAM_ATTR rpmIsr() {
    ventilation::Fan::tickRpm(&fan);
}


void controlByBleCallback(bool control) {
#ifdef DEBUG
    Serial.printf("set control by ble: %d\n", control);
#endif
    controlByBle = control;
}

void fanWriteCallback(uint8_t value) {
#ifdef DEBUG
    Serial.printf("fan write callback: %d\n", value);
#endif
    fan.setFanPercent(value);
}

void setpointWriteCallback(uint16_t value, uint8_t number) {
#ifdef DEBUG
    Serial.printf("setpoint write callback %d: %d\n", number, value);
#endif
    if (number == 1) {
        probe1.setSetpoint(value);
        storage.setSetpoint1(value);
    } else if (number == 2) {
        probe2.setSetpoint(value);
        storage.setSetpoint2(value);
    }
    storage.store();
}

void sensorTypeWriteCallback(uint8_t sensorType, uint8_t number) {
#ifdef DEBUG
    Serial.printf("sensortype write callback %d: %d\n", number, sensorType);
#endif
    if (number == 1) {
        probe1.setSensorType(SensorData::getSensorTypeByIndex(sensorType));
        storage.setSensorType1(SensorData::getSensorTypeByIndex(sensorType));
    } else if (number == 2) {
        probe2.setSensorType(SensorData::getSensorTypeByIndex(sensorType));
        storage.setSensorType2(SensorData::getSensorTypeByIndex(sensorType));
    }
    storage.store();
}

void alarmWriteCallback() {
#ifdef DEBUG
    Serial.println("alarm write callback");
#endif
    alarmAcked = true;
    buzzer.disable();
}

void setup() {
#ifdef DEBUG
    Serial.begin(115200);
    Serial.println("startup");
#endif

#ifdef DEBUG
	Serial.println(F("reading config from eeprom"));
#endif
	EEPROM.begin(512);
#ifdef DEBUG
    if (storage.isValid()) {
        Serial.println("storage is valid");
    }
#endif
    storage.load();
    
    uint16_t setpoint1 = storage.getSetpoint1();
    probe1.setSensorType(storage.getSensorType1());
    probe1.setSetpoint(setpoint1);
    
    uint16_t setpoint2 = storage.getSetpoint2();
    probe2.setSensorType(storage.getSensorType2());
    probe2.setSetpoint(setpoint2);

#ifdef DEBUG
    Serial.println("start ble");
#endif
    bleServer.begin();
    bleServer.setControlByBleCallback(&controlByBleCallback);
    bleServer.setFanWriteCallback(&fanWriteCallback);
    bleServer.setSetpointWriteCallback(&setpointWriteCallback);
    bleServer.setAlarmWriteCallback(&alarmWriteCallback);
    bleServer.setSensorTypeCallback(&sensorTypeWriteCallback);
    bleServer.start();

    bleServer.setAlarm(false);
    bleServer.setBattery(6.0);
    bleServer.setFan(0);
    bleServer.setRpm(0);
    bleServer.setSetpoint1(probe1.getSetpoint());
    bleServer.setSetpoint2(probe2.getSetpoint());
    bleServer.setSensorType1(probe1.getSensorType());
    bleServer.setSensorType2(probe2.getSensorType());
    bleServer.setTemperature1(probe1.getProbeTemperature());
    bleServer.setTemperature2(probe2.getProbeTemperature());

#ifdef DEBUG
    Serial.println("init done");
#endif
}

void loop() {

    // test if alarm has changed to true
    bool alarm = 0;
    if (alarmBatteryChanged(alarmBattery, true)) {
        alarm = true;
    }
    if (alarmFanChanged(alarmFan)) {
        alarm = true;
    }
    if (alarmProbe1Changed(probe1.isAlarm(), true)) {
        alarm = true;
    }
    Serial.flush();
    if (alarmProbe2Changed(probe2.isAlarm(), true)) {
        alarm = true;
    }
    if (alarm) {
        // new alarm triggered
#ifdef DEBUG
        Serial.println("sending alarm");
#endif
        alarmAcked = false;
        bleServer.setAlarm(true);
        buzzer.enable();
    }

    bool alarms = alarmBattery | alarmFan | probe1.isAlarm() | probe2.isAlarm();
    alarmChanged.lambda(alarms, [](bool newValue, bool oldValue) {
        if (!newValue) {
            // changed alarm back to normal
#ifdef DEBUG
            Serial.println("sending alarm disable");
#endif
            bleServer.setAlarm(false);
            buzzer.disable();
        }
    });

    if (probe1Changed(probe1.update())) {
        bleServer.setTemperature1(probe1.getProbeTemperature());
    }

    if (probe2Changed(probe2.update())) {
        bleServer.setTemperature2(probe2.getProbeTemperature());
    }

    if (!controlByBle && timeoutReadPoti()) {
        timeoutReadPoti.reset();
        uint16_t potiAnalogValue = analogRead(PIN_ADC_POTI);
        uint16_t potiAnalogFiltered = medianFilterPoti.AddValue(potiAnalogValue);
        uint16_t fanPercentFiltered = static_cast<uint16_t>((static_cast<float>(potiAnalogFiltered) / 4096.0) * 100.0);
        if (fanPercentFiltered != fan.getFanPercent()) {
            fan.setFanPercent(fanPercentFiltered);
        }
    }

    fan.update();
    uint16_t fanSpeedRpm = fan.getFanSpeedRpm();
    if (rpmChanged(fanSpeedRpm)) {
        bleServer.setRpm(fanSpeedRpm);
    }
    uint8_t fanPercent = fan.getFanPercent();
    if (fanPercentChanged(fanPercent)) {
        bleServer.setFan(fanPercent);
    }
    alarmFan = fan.getFanAlarm();

    battery.update();
    float batteryVoltage = battery.getBatteryVoltage();
    if (batteryChanged(batteryVoltage)) {
        if (batteryVoltage < 4.5) {
            alarmBattery = true;
        }
        bleServer.setBattery(batteryVoltage);
    }

    buzzer.update();

}
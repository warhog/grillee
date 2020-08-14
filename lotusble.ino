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
#include "ledc.h"
#include "led.h"
#include "wifiwebserver.h"
#include "wifiap.h"
#include "version.h"
#include "alarm.h"

#define DEBUG

const gpio_num_t PIN_FAN = GPIO_NUM_26;
const gpio_num_t PIN_RPM = GPIO_NUM_27;
const gpio_num_t PIN_ALARM_BUZZER = GPIO_NUM_16;
const gpio_num_t PIN_ADC_CS = GPIO_NUM_5;
const gpio_num_t PIN_LED_R = GPIO_NUM_32;
const gpio_num_t PIN_LED_G = GPIO_NUM_33;
const gpio_num_t PIN_LED_B = GPIO_NUM_25;
const gpio_num_t PIN_WEB_UPDATE = GPIO_NUM_34;

const MCP3208::Channel ADC_CHANNEL_BATTERY = MCP3208::Channel::SINGLE_1;
const MCP3208::Channel ADC_CHANNEL_POTI = MCP3208::Channel::SINGLE_0;
const MCP3208::Channel ADC_CHANNEL_PROBE0 = MCP3208::Channel::SINGLE_7;
const MCP3208::Channel ADC_CHANNEL_PROBE1 = MCP3208::Channel::SINGLE_6;

// wether device is controlled by bluetooth device or poti
bool controlByBle = false;

unsigned long loopTime = 0L;
unsigned long lastLoopTimeRun = 0L;

TimeoutMs timeoutReadPoti(25);
MedianFilter<uint16_t> medianFilterPoti(10);

EdgeDetector<float> batteryChanged(0, 0.1);
EdgeDetector<uint16_t> rpmChanged(0, 100);
EdgeDetector<uint8_t> fanPercentChanged(0);

EdgeDetector<int16_t> probe1Changed(0, 1);
EdgeDetector<int16_t> probe2Changed(0, 1);

BleServer bleServer;
util::Led ledR(PIN_LED_R, util::LEDC_CHANNEL_LED_R);
util::Led ledG(PIN_LED_G, util::LEDC_CHANNEL_LED_G);
util::Led ledB(PIN_LED_B, util::LEDC_CHANNEL_LED_B);

util::Adc_MCP3208 adcMcp3208;
util::Storage storage;
util::Buzzer buzzer(PIN_ALARM_BUZZER);
util::Battery battery(&adcMcp3208, ADC_CHANNEL_BATTERY);

measurement::Probe probe1(&adcMcp3208, ADC_CHANNEL_PROBE0, SensorType::UNKNOWN);
measurement::Probe probe2(&adcMcp3208, ADC_CHANNEL_PROBE1, SensorType::UNKNOWN);

comm::WifiWebServer wifiWebServer(&storage, &loopTime);
comm::WifiAp wifiAp;
util::Alarm alarmState;

void rpmIsr();
ventilation::Fan fan(PIN_FAN, PIN_RPM, &rpmIsr);
/**
 * ISR function for rpm detection
 **/
void IRAM_ATTR rpmIsr() {
    ventilation::Fan::tickRpm(&fan);
}


/**
 * callback for control by ble changes
 * @param controle true if controlled by ble device
 **/
void controlByBleCallback(bool control) {
#ifdef DEBUG
    Serial.printf("set control by ble: %d\n", control);
#endif
    controlByBle = control;
    updateLed();
}

/**
 * callback for fan speed change writes
 * @param sensorType the new fan speed in percent (0-100)
 **/
void fanWriteCallback(uint8_t value) {
#ifdef DEBUG
    Serial.printf("fan write callback: %d\n", value);
#endif
    fan.setFanPercent(value);
}

/**
 * callback for setpoint change writes
 * @param value the new setpoint in °C
 * @param number the probe number
 **/
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

/**
 * callback for sensor type change writes
 * @param sensorType the new sensor type index
 * @param number the probe number
 **/
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

/**
 * callback for alarm ack writes
 **/
void alarmWriteCallback() {
#ifdef DEBUG
    Serial.println("alarm write callback");
#endif
    alarmState.ack();
    buzzer.disable();
}

/**
 * update the led color
 **/
void updateLed() {
    if (alarmState.isAny()) {
        ledR.setBreath(250);
        ledG.setOff();
        ledB.setOff();
    } else if (controlByBle) {
        ledR.setOff();
        ledG.setOn();
        ledG.setBrightness16(static_cast<uint16_t>(static_cast<float>(fan.getFanPercent()) * 40.95));
        ledB.setOff();
    } else {
        ledR.setOff();
        ledG.setOff();
        ledB.setOn();
        ledB.setBrightness16(static_cast<uint16_t>(static_cast<float>(fan.getFanPercent()) * 40.95));
    }
}

/**
 * arduino setup function
 **/
void setup() {
#ifdef DEBUG
    Serial.begin(115200);
    Serial.println("startup");
    Serial.println("version: " VERSION);
    Serial.println("build time: " VERSION_DATETIME);
    Serial.println("commit: " VERSION_COMMIT);
#endif
    ledR.setOff();
    ledG.setOff();
    ledB.setOff();

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
    
    // in debug mode always enable webupdate feature
#ifndef DEBUG
	pinMode(PIN_WEB_UPDATE, INPUT_PULLUP);
	if (digitalRead(PIN_WEB_UPDATE) == LOW) {
#endif
#ifdef DEBUG
		Serial.println(F("force wifi ap mode"));
#endif
		if (!wifiAp.connect()) {
#ifdef DEBUG
			Serial.println(F("cannot enable wifi ap mode"));
#endif
		} else {
        	wifiWebServer.begin();
	    }
#ifndef DEBUG
	}
#endif

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

    bleServer.setAlarm(0);
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

    updateLed();
}

/**
 * arduino loop (main) function
 **/
void loop() {

    // probe handling
    if (probe1Changed(probe1.update())) {
        bleServer.setTemperature1(probe1.getProbeTemperature());
        alarmState.fromBool(util::ALARM_BIT_TEMPERATURE1, probe1.isAlarm());
    }
    if (probe2Changed(probe2.update())) {
        bleServer.setTemperature2(probe2.getProbeTemperature());
        alarmState.fromBool(util::ALARM_BIT_TEMPERATURE2, probe2.isAlarm());
    }

    // fan handling
    if (!controlByBle && timeoutReadPoti()) {
        timeoutReadPoti.reset();
        uint16_t potiAnalogValue = adcMcp3208.getRawValue(ADC_CHANNEL_POTI);
        uint16_t potiAnalogFiltered = medianFilterPoti.AddValue(potiAnalogValue);
        uint16_t fanPercentFiltered = static_cast<uint16_t>((static_cast<float>(potiAnalogFiltered) / 4095.0) * 100.0);
//        Serial.printf("potiAnalogValue: %d, potiAnalogFiltered: %d, fanPercentFiltered: %d\n", potiAnalogValue, potiAnalogFiltered, fanPercentFiltered);
        if (fanPercentFiltered >= 95) {
            fanPercentFiltered = 100;
        }
        if (fan.getFanPercent() != fanPercentFiltered) {
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
        updateLed();
    }
    alarmState.fromBool(util::ALARM_BIT_FAN, fan.getFanAlarm());

    // battery handling
    battery.update();
    float batteryVoltage = battery.getBatteryVoltage();
    if (batteryChanged(batteryVoltage)) {
        if (batteryVoltage < 4.5) {
            alarmState.set(util::ALARM_BIT_BATTERY);
        }
        bleServer.setBattery(batteryVoltage);
    }

    // buzzer handling
    buzzer.update();

    // wifi handling
	if (wifiWebServer.isConnected()) {
		// handle the wifi webserver data
		wifiWebServer.handle();
	}

    // led handling
    ledR.update();
    ledG.update();
    ledB.update();

    // alarms have to be handled last to make sure notification for sensor changes comes before alarm notification
    if (alarmState.isAny() && alarmState.isModifiedSet()) {
        // at least one alarm is active and at least one alarm was set to alarm
#ifdef DEBUG
        Serial.printf("sending alarm: %d\n", alarmState.toUint8());
#endif
        bleServer.setAlarm(alarmState.toUint8());
        buzzer.enable();
        updateLed();
    } else if (alarmState.isNone() && alarmState.isModifiedClear()) {
        // at least one alarm was cleared and no alarm is currently active
#ifdef DEBUG
        Serial.println("sending alarm disable");
#endif
        bleServer.setAlarm(0);
        buzzer.disable();
        updateLed();
    }
    // reset the alarm modifiers last, no more isModifiedX calls should happen after this until the next loop
    alarmState.resetModified();

	loopTime = micros() - lastLoopTimeRun;
	lastLoopTimeRun = micros();
}
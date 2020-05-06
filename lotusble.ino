#include <Arduino.h>
#include "timeout.h"
#include "toggle.h"
#include "edgedetector.h"
#include "bleserver.h"

#include "battery.h"
#include "adc.h"
#include "sensortype.h"
#include "probe.h"

#define DEBUG

const gpio_num_t PIN_FAN = GPIO_NUM_17;
const gpio_num_t PIN_ADC_POTI = GPIO_NUM_34;
const gpio_num_t PIN_ADC_BATTERY = GPIO_NUM_35;
const gpio_num_t PIN_ADC_MEAT_PROBE1 = GPIO_NUM_32;
const gpio_num_t PIN_ADC_MEAT_PROBE2 = GPIO_NUM_33;
const gpio_num_t PIN_RPM = GPIO_NUM_27;
const gpio_num_t PIN_ALARM_BUZZER = GPIO_NUM_14;
const gpio_num_t PIN_DEFAULT_VOLTAGE_OUTPUT = GPIO_NUM_26;

// minimum rpm, below alarm detection is triggered
const unsigned int MIN_RPM = 300;
// time to wait in seconds before triggering an alarm if rpm is below MIN_RPM
const unsigned int ALARM_WAIT_TIME = 5;
// update rpm reading every
const unsigned int UPDATE_RPM_EVERY_X_MILLIS = 500;
// how many pulses per full rotation the fan is generating on the rpm pin
const uint8_t PULSES_PER_ROTATION = 2;

const uint8_t NR_OF_TEMPERATURE_PROBES = 2;

// internal variables
const unsigned int ALARM_WAIT_TIME_CYCLES = ALARM_WAIT_TIME * 1000 / UPDATE_RPM_EVERY_X_MILLIS;
const unsigned int RPM_CALCULATION_TIMEFRAME = 60000 / UPDATE_RPM_EVERY_X_MILLIS;
uint16_t rpm{5000};
uint16_t rpmSmoothed{5000};
// ticks rpm is to calculate the rpm and used in the ISR
volatile unsigned int ticksRpm{0};

// weather controlled by bluetooth or poti
bool controlByBle = false;

// fan speed percentage
uint16_t fanPercent{100};

// analog value from poti (smoothed)
float potiAnalogSmooth{0};

// alarm
unsigned int rpmAlarmCounter{0};
bool alarmGeneral{false};
bool alarmFan{false};
bool alarmBattery{false};
bool alarmProbe1{false};
bool alarmProbe2{false};

TimeoutMs timeoutRpm(UPDATE_RPM_EVERY_X_MILLIS);
#ifdef DEBUG
TimeoutS timeoutRpmSerial(1);
#endif
TimeoutMs timeoutReadPoti(25);
TimeoutS timeoutAlarm(1);
Toggle toggleAlarm;

EdgeDetector<bool> alarmChanged(false);
EdgeDetector<bool> alarmBatteryChanged(false);
EdgeDetector<bool> alarmFanChanged(false);
EdgeDetector<bool> alarmProbe1Changed(false);
EdgeDetector<bool> alarmProbe2Changed(false);

EdgeDetector<unsigned int> fanPercentChanged(0, 5);
EdgeDetector<float> batteryChanged(0, 0.1);
EdgeDetector<unsigned int> rpmChanged(0, 100);

EdgeDetector<unsigned int> probe1Changed(0, 1);
EdgeDetector<unsigned int> probe2Changed(0, 1);
uint16_t setpoint1 = 80;
uint16_t setpoint2 = 80;

BleServer bleServer;

Battery battery(PIN_ADC_BATTERY);
Probe probe1(PIN_ADC_MEAT_PROBE1, SensorType::PRO05);
Probe probe2(PIN_ADC_MEAT_PROBE2, SensorType::PRO05);

// ISR function for the rpm reading
void IRAM_ATTR rpmIsr() {
    ticksRpm++;
}

void initFan() {
    // setup pin for pwm fan
    pinMode(PIN_FAN, OUTPUT);
    digitalWrite(PIN_FAN, LOW);

    // set pwm generator for fan using ledcontroller
    // set to 25khz and 12bit resolution
    ledcSetup(0, 25000, 12);
    ledcAttachPin(PIN_FAN, 0);
    // set to full speed at initialization
    ledcWrite(0, 4095);

    // setup pin for rpm input
    pinMode(PIN_RPM, INPUT_PULLUP);
    // attach pin change interrupt to rpm pin on falling edges
    attachInterrupt(PIN_RPM, rpmIsr, FALLING);

}

void initTemperature() {
    pinMode(PIN_ADC_MEAT_PROBE1, INPUT);
    pinMode(PIN_ADC_MEAT_PROBE2, INPUT);
}

void controlByBleCallback(bool control) {
#ifdef DEBUG
    Serial.printf("set control by ble: %d\n", control);
#endif
    controlByBle = control;
}

void fanWriteCallback(uint16_t value) {
#ifdef DEBUG
    Serial.printf("fan write callback: %d\n", value);
#endif
    fanPercent = value;
}

void setpointWriteCallback(uint16_t value, uint8_t number) {
#ifdef DEBUG
    Serial.printf("setpoint write callback %d: %d\n", number, value);
#endif
    if (number == 1) {
        setpoint1 = value;
    } else if (number == 2) {
        setpoint2 = value;
    }
}

void sensorTypeWriteCallback(uint8_t sensorType, uint8_t number) {
#ifdef DEBUG
    Serial.printf("sensortype write callback %d: %d\n", number, sensorType);
#endif
    if (number == 1) {
        probe1.setSensorType(SensorData::getSensorTypeByIndex(sensorType));
    } else if (number == 2) {
        probe2.setSensorType(SensorData::getSensorTypeByIndex(sensorType));
    }
}

void alarmAckWriteCallback() {
#ifdef DEBUG
    Serial.println("alarm ack callback");
#endif
}

void setup() {
#ifdef DEBUG
    Serial.begin(115200);
    Serial.println("startup");
#endif

    // set analog pin for reading the poti
    analogSetPinAttenuation(PIN_ADC_POTI, ADC_11db);

    // Adc::enableVrefOutput(PIN_DEFAULT_VOLTAGE_OUTPUT);
    // for (;;) {
    //     yield();
    // }
    
    initFan();
    initTemperature();

    bleServer.begin();
    bleServer.setControlByBleCallback(&controlByBleCallback);
    bleServer.setFanWriteCallback(&fanWriteCallback);
    bleServer.setSetpointWriteCallback(&setpointWriteCallback);
    bleServer.setAlarmAckWriteCallback(&alarmAckWriteCallback);
    bleServer.setSensorTypeCallback(&sensorTypeWriteCallback);
    bleServer.start();

    bleServer.setAlarm(false);
    bleServer.setBattery(6.0);
    bleServer.setFan(fanPercent);
    bleServer.setRpm(rpm);
    bleServer.setSetpoint1(setpoint1);
    bleServer.setSetpoint2(setpoint2);
    bleServer.setTemperature1(probe1.getProbeTemperature());
    bleServer.setTemperature2(probe2.getProbeTemperature());

    

}

void rpmLoop() {
    if (timeoutRpm()) {
        timeoutRpm.reset();
        rpm = ((ticksRpm * RPM_CALCULATION_TIMEFRAME) / PULSES_PER_ROTATION);
        ticksRpm = 0;
        rpmSmoothed = static_cast<unsigned int>(static_cast<double>(rpm) * 0.25 + static_cast<double>(rpmSmoothed) * 0.75);

        if (!alarmFan && rpmSmoothed < MIN_RPM) {
            // no alarm yet and rpm is too low
            rpmAlarmCounter++;
        } else if (rpmAlarmCounter > 0 && rpmSmoothed >= MIN_RPM) {
            // alarm counter started triggering and rpm is fine again
            rpmAlarmCounter--;
        }
        if (!alarmFan && rpmAlarmCounter >= ALARM_WAIT_TIME_CYCLES) {
            // no alarm and counter above wait cycles -> trigger alarm
            alarmFan = true;
        } else if (alarmFan && rpmAlarmCounter == 0) {
            // alarm and counter back to zero -> disable alarm
            alarmFan = false;
        }
    }

    if (rpmChanged(rpm)) {
        bleServer.setRpm(rpm);
    }

#ifdef DEBUG
    if (timeoutRpmSerial()) {
        Serial.print("rpm: ");
        Serial.print(rpm);
        Serial.print(" - ");
        Serial.println(rpmSmoothed);
        timeoutRpmSerial.reset();
    }
#endif
}

void fanLoop() {
    if (!controlByBle && timeoutReadPoti()) {
        timeoutReadPoti.reset();
        unsigned int potiAnalogValue = analogRead(PIN_ADC_POTI);
        potiAnalogSmooth = static_cast<float>(potiAnalogValue) * 0.50 + static_cast<float>(potiAnalogSmooth) * 0.50;
        unsigned int fanPercentSmoothed = static_cast<unsigned int>((potiAnalogSmooth / 4096.0) * 100.0);
        if (fanPercentSmoothed != fanPercent) {
            fanPercent = static_cast<unsigned int>(fanPercentSmoothed);
        }
    }

    if (fanPercentChanged(fanPercent)) {
        unsigned int fanSpeedRaw = static_cast<unsigned int>(static_cast<float>(fanPercent) * 40.96);
        // minimum fanspeed is 10%
        fanSpeedRaw = constrain(fanSpeedRaw, 409, 4096);
#ifdef DEBUG
        Serial.printf("update fan, %d -> %d (raw: %d)\n", fanPercentChanged.getOldValue(), fanPercent, fanSpeedRaw);
#endif
        ledcWrite(0, fanSpeedRaw);
        bleServer.setFan(fanPercent);
    }
}

void loop() {

    alarmGeneral = alarmFan || alarmBattery;
    if (alarmChanged(alarmGeneral, true) || alarmBatteryChanged(alarmBattery, true) || alarmFanChanged(alarmFan, true)) {
#ifdef DEBUG
        Serial.println("sending alarm");
#endif
        bleServer.setAlarm(true);
    }
    if (alarmChanged(alarmGeneral, false)) {
        bleServer.setAlarm(false);
    }
    
    if (alarmGeneral && timeoutAlarm()) {
        timeoutAlarm.reset();
        if (toggleAlarm()) {
            Serial.println("ALARM");
        }
    }

    rpmLoop();
    fanLoop();

    if (probe1Changed(probe1.update())) {
        bleServer.setTemperature1(probe1.getProbeTemperature());
    }

    if (probe2Changed(probe2.update())) {
        bleServer.setTemperature2(probe2.getProbeTemperature());
    }

    battery.update();
    float batteryVoltage = battery.getBatteryVoltage();
    if (batteryChanged(batteryVoltage)) {
        if (batteryVoltage < 4.5) {
            alarmBattery = true;
        }
        bleServer.setBattery(batteryVoltage);
    }

}
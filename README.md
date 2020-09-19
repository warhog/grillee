# Grillee

## Legal
LotusGrill&reg; is a registered trademark of [LotusGrill GmbH](https://lotusgrill.de).

This project has in no way a connection to the LotusGrill GmbH. It is a private hobby project.

## License
GPLv3 licensed, see [LICENSE.md](license.md).

## Advice
Everything in this repo is provided as it is. I give no guarantee or take any responsibility for it. If you are not experienced with electronics you should at least have someone looking on your final build.

## Details
This project is a digital, bluetooth enabled control unit for LotusGrill&reg; styled grills. These kind of grills normally comes with a simple potentiometer for regulating the fan speed (correlating with the heat produces by the coal). After a few years of heavy usage of my LotusGrill&reg; the potentiometer was broken. Instead of replacing it I decided to create this control unit for improved handling.

Highlights:
* Bluetooth control (using an app)
* Manual (bluetoothless) control
* Fan rpm monitoring
* 2 built in grill thermometer probe connectors for various NTCs
* Battery voltage monitoring
* Alarming buzzer
* Webupdate

## App
The app is currently only available for Android on the Google Play Store. Due to the usage of the [Ionic Framework](https://ionicframework.com/) it can be also compiled for iOS.

Google Play Store: TODO: LINK

## Usage
### Fan control
The fan speed can either be controlled by the potentiometer (manual mode) or the app (using bluetooth). As soon as the app is connected the potentiometer is ignored.

### LED
The RGB LED shows the different states of operation. Blue light shows that the unit is in manual mode (potentiometer controls fan). Green light shows that bluetooth is connected. Both (blue and green light) show the selected fan speed using the brightness. The LED is blinking red in case of errors.

### Alarming


### Probes


### Update
Press the webupdate button and the reset button in parallel. Keep the webupdate button pressed while releasing the reset button and hold for 5 seconds. The board should start up in webupdate mode now. Search for a wifi network called `grillee-....`. The dots are the serial number of the ESP32 module. Connect to the wifi and browse the url: `http://192.168.4.1`. The web ui gives you the option to upload a new software.

## Control unit software
The control unit software is using Arduino on ESP32. The measurement data for the different sensors was taken from the WLANThermo Nano project ([source](https://github.com/WLANThermo-nano/WLANThermo_ESP32_Software/blob/master/src/temperature/TemperatureBase.cpp)).

The board has test pins for the serial connection to initially flash the software.

## Libraries used
MedianFilterLib2 v1.0.0

Mcp3208 v1.4.0

## Hardware
The hardware schematics, gerber files, ... can be found in the `hardware` folder. The components were chosen to be easy to obtain. 
The basic measurement circuit was taken from the WLANThermo Nano project ([schematics](https://github.com/WLANThermo-nano/WLANThermo_nano_Hardware/blob/master/nano%20v1%2B/circuit/Schaltplan%20WLANThermo%20Nano%20V1%2B.pdf)).
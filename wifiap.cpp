#include "wifiap.h"

namespace comm {

bool WifiAp::connect() {
#ifdef DEBUG
    Serial.println(F("setting up wifi ap"));
#endif
    String wifiApName = "lotusble-";
    wifiApName += getChipIdAsString();
    if (!WiFi.softAP(wifiApName.c_str(), "")) {
#ifdef DEBUG
        Serial.print(F("wifi ap error"));
#endif
        return false;
    }
#ifdef DEBUG
    IPAddress myIP = WiFi.softAPIP();
    Serial.print(F("AP IP address: "));
    Serial.println(myIP);
#endif
    this->_connected = true;
    return true;
}

void WifiAp::disconnect() {
    this->_connected = false;
    WiFi.softAPdisconnect(true);
}

String WifiAp::getChipIdAsString() {
    unsigned long chipIdLong = static_cast<unsigned long>(ESP.getEfuseMac());
    return String(chipIdLong);
}

}
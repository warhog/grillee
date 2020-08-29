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
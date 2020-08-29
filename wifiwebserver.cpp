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
#include "wifiwebserver.h"

//#define DEBUG

namespace comm {

void WifiWebServer::sendJson() {
    String result("");
    serializeJson(this->_jsonDocument, result);
    this->_server.send(200, "application/json", result);
}

String WifiWebServer::concat(String text) {
    String temp(comm::WifiWebServerFiles::header);
    temp.replace("%VERSION%", VERSION);
    temp.replace("%CHIPID%", getChipIdAsString());
    temp.replace("%DATETIME%", VERSION_DATETIME);
    String versionCommit = "";
    if (VERSION_COMMIT != "NO_TRAVIS_BUILD") {
        versionCommit = "(" VERSION_COMMIT ")";
    }
    temp.replace("%COMMIT%", versionCommit);
    return temp + text + comm::WifiWebServerFiles::footer;
}

void WifiWebServer::disconnectClients() {
    this->_server.client().setNoDelay(true);
    delay(100);
    this->_server.client().flush();
    this->_server.client().stop();
    this->_server.stop();
    delay(100);
}

void WifiWebServer::rebootDevice() {
    this->_server.send(200, "text/html", this->concat("<script>window.setTimeout(function() { rebooting(); }, 50);</script>rebooting device..."));
    this->disconnectClients();
    ESP.restart();
}

void WifiWebServer::begin() {

	this->_server.onNotFound([&]() {
        String message = "File Not Found\n\n";
        message += "URI: ";
        message += this->_server.uri();
        message += "\nMethod: ";
        message += (this->_server.method() == HTTP_GET) ? "GET" : "POST";
        message += "\nArguments: ";
        message += this->_server.args();
        message += "\n";

        for (uint8_t i = 0; i < this->_server.args(); i++) {
            message += " " + this->_server.argName(i) + ": " + this->_server.arg(i) + "\n";
        }

        this->_server.send(404, "text/plain", this->concat(message));
    });

    this->_server.on("/", HTTP_GET, [&]() {
        this->_server.sendHeader("Connection", "close");
        String temp(comm::WifiWebServerFiles::index);
        temp.replace("%LOOPTIME%", String(*_loopTime));
        this->_server.send(200, "text/html", this->concat(temp));
    });
    
    this->_server.on("/factorydefaults", HTTP_GET, [&]() {
        this->_server.sendHeader("Connection", "close");
        this->_server.send(200, "text/html", this->concat("really load factory defaults?<br /><a class='button' href='/dofactorydefaults'>yes</a> <a class='button' href='/'>no</a>"));
    });
    this->_server.on("/dofactorydefaults", HTTP_GET, [&]() {
        this->_server.sendHeader("Connection", "close");
        this->_storage->loadFactoryDefaults();
        this->_storage->store();
        this->rebootDevice();
    });

    // this reset is used for the device web ui
    this->_server.on("/reset", HTTP_GET, [&]() {
        this->_server.sendHeader("Connection", "close");
        this->_server.send(200, "text/html", this->concat("really restart the device?<br /><a class='button' href='/doreset'>yes</a> <a class='button' href='/'>no</a>"));
    });
    this->_server.on("/doreset", HTTP_GET, [&]() {
        this->_server.sendHeader("Connection", "close");
        this->rebootDevice();
    });

    this->_server.on("/update", HTTP_POST, [&]() {
        this->_server.sendHeader("Connection", "close");
        this->_server.send(200, "text/html", this->concat((Update.hasError()) ? "update failed!\n" : "update successful! rebooting...<br /><a class='button' href='/'>back</a>"));
        this->disconnectClients();
        ESP.restart();
    }, [&]() {
        HTTPUpload& upload = this->_server.upload();
        if (upload.status == UPLOAD_FILE_START) {
#ifdef DEBUG
            Serial.setDebugOutput(true);
            Serial.printf("update: %s\n", upload.filename.c_str());
#endif
            if (!Update.begin()) { //start with max available size
#ifdef DEBUG
                Update.printError(Serial);
#endif
            }
        } else if (upload.status == UPLOAD_FILE_WRITE) {
            if (Update.write(upload.buf, upload.currentSize) != upload.currentSize) {
#ifdef DEBUG
                Update.printError(Serial);
#endif
            }
        } else if (upload.status == UPLOAD_FILE_END) {
            if (Update.end(true)) { //true to set the size to the current progress
#ifdef DEBUG
                Serial.printf("update success: %u\nrebooting...\n", upload.totalSize);
#endif
            } else {
#ifdef DEBUG
                Update.printError(Serial);
#endif
            }
#ifdef DEBUG
            Serial.setDebugOutput(false);
#endif
        }
    });
    
    this->_server.begin();
    this->_connected = true;
}

void WifiWebServer::handle() {
    this->_server.handleClient();
}

String WifiWebServer::getChipIdAsString() {
    unsigned long chipIdLong = static_cast<unsigned long>(ESP.getEfuseMac());
    return String(chipIdLong);
}

}
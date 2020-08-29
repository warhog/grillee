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

#include <Arduino.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include <Update.h>

#include "storage.h"
#include "version.h"
#include "webui-generated.h"

namespace comm {
    class WifiWebServer {
        public:
            WifiWebServer(util::Storage *storage, unsigned long *loopTime) : _storage(storage), _loopTime(loopTime), _jsonDocument(1024) {}
            void begin();
            void handle();
            bool isConnected() {
                return this->_connected;
            }
            void disconnect() {
                this->_connected = false;
                this->_server.stop();
            }
        private:
            void prepareJson();
            void sendJson();
            String concat(String text);
            void disconnectClients();
            void rebootDevice();
            String getChipIdAsString();

            WebServer _server;
            DynamicJsonDocument _jsonDocument;
            util::Storage *_storage;
            bool _connected;
            unsigned long *_loopTime;
    };
}

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

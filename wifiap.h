#pragma once

#include <Arduino.h>
#include <WiFi.h>

namespace comm {

    class WifiAp {
    public:
        bool connect();
        bool isConnected() const {
            return this->_connected;
        }
        void disconnect();
        String getChipIdAsString();
    private:
        bool _connected;
    };

}
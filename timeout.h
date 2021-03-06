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

template <class T> class Timeout {
    public:
        Timeout(T timeout, T (*timeoutFunction)(), bool fireOnStart = false) : _timeout(timeout), _timeoutFunction(timeoutFunction), _nextTimeout(0) {
            if (!fireOnStart) {
                reset();
            }
        }

        void reset() {
            _nextTimeout = _timeoutFunction() + _timeout;
        }

        void setTimeout(T timeout) {
            _timeout = timeout;
            reset();
        }

        T getNextTimeout() {
            return _nextTimeout;
        }

        T getTimeout() {
            return _timeout;
        }

        bool operator()() {
            return (_timeoutFunction() >= _nextTimeout);
        }

    private:
        T _timeout;
        T _nextTimeout;
        T (*_timeoutFunction)();
};

class TimeoutUs : public Timeout<unsigned long> {
    public:
        TimeoutUs(unsigned long timeout, bool fireOnStart = false) : Timeout(timeout, &micros, fireOnStart) {}
};

class TimeoutMs : public Timeout<unsigned long> {
    public:
        TimeoutMs(unsigned long timeout, bool fireOnStart = false) : Timeout(timeout, &millis, fireOnStart) {}
};

class TimeoutS : public Timeout<unsigned long> {
    public:
        TimeoutS(unsigned long timeout, bool fireOnStart = false) : Timeout(timeout * 1000L, &millis, fireOnStart) {}
};
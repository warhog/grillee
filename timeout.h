#pragma once

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
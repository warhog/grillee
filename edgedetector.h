#pragma once

template <class T> class EdgeDetector {
    public:
        EdgeDetector() : _oldValue(0), _oldOldValue(0), _hysteresis{0} { }
        EdgeDetector(T initialValue) : _oldValue(initialValue), _oldOldValue(initialValue), _hysteresis{0} { }
        EdgeDetector(T initialValue, T hysteresis) : _oldValue(initialValue), _oldOldValue(initialValue), _hysteresis{hysteresis} { }

        /**
         * @brief Tests if given value has changed since last call
         *
         * Tests if newValue has changed since the last call to this function.
         * 
         * @param [in] newValue the new value to do an edge detection for
         * @return Boolean true if newValue has changed
         */
        bool operator()(T newValue) {
            _oldOldValue = _oldValue;
            if (_hysteresis) {
                if (abs(newValue - _oldValue) > _hysteresis) {
                    _oldValue = newValue;
                    return true;
                }
            } else if (newValue != _oldValue) {
                _oldValue = newValue;
                return true;
            }
            return false;
        }

        T abs(const T value) {
            T newValue = value;
            if (newValue < static_cast<T>(0)) {
                newValue *= static_cast<T>(-1);
            }
            return newValue;
        }

        /**
         * @brief Tests if given value has changed to a given value
         *
         * Tests if newValue has changed to toValue and return true if condition is met.
         * Attention: this ignores hysteresis!
         * 
         * @param [in] newValue the new value to do an edge detection for
         * @param [in] toValue the value newValue has to change to to trigger
         * @return Boolean true if newValue has changed to toValue
         */
        bool operator()(T newValue, T toValue) {
            _oldOldValue = _oldValue;
            if (newValue != _oldValue && newValue == toValue) {
                _oldValue = newValue;
                return true;
            }
            return false;
        }

        /**
         * @brief Get the old value
         *
         * Returns the old value from before the change.
         * 
         * @return Old value
         */
        T getOldValue() {
            return _oldOldValue;
        }

    private:
        T _oldValue;
        T _oldOldValue;
        T _hysteresis;
};
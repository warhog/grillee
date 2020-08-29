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

#include <functional>

template <class T> class EdgeDetector {
    public:
        EdgeDetector() : _oldValue(0), _oldOldValue(0), _hysteresis{0} { }
        EdgeDetector(T initialValue) : _oldValue(initialValue), _oldOldValue(initialValue), _hysteresis{0} { }
        EdgeDetector(T initialValue, T hysteresis) : _oldValue(initialValue), _oldOldValue(initialValue), _hysteresis{hysteresis} { }

        /**
         * @brief Tests if given value has changed since last call
         *
         * Tests if currentValue has changed since the last call to this function.
         * 
         * @param [in] currentValue the new value to do an edge detection for
         * @return bool true if currentValue has changed
         */
        bool operator()(T currentValue) {
            _oldOldValue = _oldValue;
            if (_hysteresis) {
                if (abs(currentValue - _oldValue) > _hysteresis) {
                    _oldValue = currentValue;
                    return true;
                }
            } else if (currentValue != _oldValue) {
                _oldValue = currentValue;
                return true;
            }
            return false;
        }

        /**
         * @brief Tests if given value has changed since last call and calls the given function
         * if value has changed
         *
         * Tests if currentValue has changed since the last call to this function. If the value has changed
         * the given function lambda is called with the old and new value as argument.
         * 
         * @param [in] currentValue the new value to do an edge detection for
         * @param [in] lambda the function to execute on value changes
         * @return bool true if currentValue has changed
         */
        bool lambda(T currentValue, std::function<void(T, T)> lambda) {
            _oldOldValue = _oldValue;
            if (_hysteresis) {
                if (abs(currentValue - _oldValue) > _hysteresis) {
                    _oldValue = currentValue;
                    lambda(currentValue, _oldOldValue);
                    return true;
                }
            } else if (currentValue != _oldValue) {
                _oldValue = currentValue;
                lambda(currentValue, _oldOldValue);
                return true;
            }
            return false;
        }

        /**
         * @brief Tests if given value has changed to a given value
         *
         * Tests if currentValue has changed to toValue and return true if condition is met.
         * Attention: this ignores hysteresis!
         * 
         * @param [in] currentValue the new value to do an edge detection for
         * @param [in] toValue the value currentValue has to change to to trigger
         * @return bool true if currentValue has changed to toValue
         */
        bool operator()(T currentValue, T toValue) {
            _oldOldValue = _oldValue;
            if (currentValue != _oldValue) {
                _oldValue = currentValue;
                if (currentValue == toValue) {
                    return true;
                }
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

        /**
         * template based abs function
         **/
        T abs(const T value) {
            T currentValue = value;
            if (currentValue < static_cast<T>(0)) {
                currentValue *= static_cast<T>(-1);
            }
            return currentValue;
        }

};
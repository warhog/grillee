#pragma once

class Toggle {
    public:
        Toggle() : _toggle(false) {}
        
        Toggle(bool startWith) {
            _toggle = startWith;
        }
        
        bool operator()() {
            _toggle = !_toggle;
            return _toggle;
        }

    private:
        bool _toggle;
};

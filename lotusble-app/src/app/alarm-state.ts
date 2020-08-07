export class AlarmState {
    private bitset: number = 0;
    private modifiedSet: boolean = false;
    private modifiedClear: boolean = false;
    
    set(bit: number): void {
        if (!this.is(bit)) {
            // only set if not set before
            this.bitset |= (1 << bit);
            this.setModifiedSet();
        }
        
    }
    
    clear(bit: number): void {
        if (this.is(bit)) {
            // only clear if not set before
            this.bitset &= ~(1 << bit);
            this.setModifiedClear();
        }
    }
    
    is(bit: number): boolean {
        return (this.bitset & (1 << bit)) !== 0;
    }

    hasChanged(bit: number, externalBits: number): boolean {
        let localBit = (this.bitset & (1 << bit)) !== 0;
        let externalBit = (externalBits & (1 << bit)) !== 0;
        return localBit != externalBit;
    }

    hasChangedTo(bit: number, externalBits: number, externalChangedTo: boolean): boolean {
        let localBit = (this.bitset & (1 << bit)) !== 0;
        let externalBit = (externalBits & (1 << bit)) !== 0;
        return localBit != externalChangedTo && externalBit == externalChangedTo;
    }
    
    isAny(): boolean {
        return this.toUint8() != 0;
    }

    isNone(): boolean {
        return this.toUint8() == 0;
    }
    
    toUint8(): number {
        return this.bitset;
    }

    isModified(): boolean {
        return this.modifiedClear || this.modifiedSet;
    }

    isModifiedSet(): boolean {
        return this.modifiedSet;
    }

    isModifiedClear(): boolean {
        return this.modifiedClear;
    }

    resetModified(): void {
        this.modifiedClear = false;
        this.modifiedSet = false;
    }

    fromBool(bit: number, value: boolean): void {
        if (value) {
            this.set(bit);
        } else {
            this.clear(bit);
        }
    }

    fromUint8(bits: number): void {
        if (bits != this.toUint8()) {
            for (let i: number = 0; i < 8; i++) {
                if (bits & 0b00000001) {
                    this.set(i);
                } else {
                    this.clear(i);
                }
                bits >>= 1;
            }
        }
    }

    private setModifiedSet() {
        this.modifiedSet = true;
    }

    private setModifiedClear() {
        this.modifiedClear = true;
    }
}

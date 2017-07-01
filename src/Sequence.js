class Sequence {
    constructor() {
        this.current = [];
        this.last = [];
        this.longest = [];
        this.excludes = [];
        this.pointer = 0;
    }

    getRandomSequenceNumber() {
        let newVal = -1;

        while(true) { // only generate numbers that are not excluded
            newVal = Math.floor(Math.random() * 4);
            if (this.getSkipCount() === 0 || !this.excludes.includes(newVal)) {
                return newVal;
            }
        }
    }

    getCurrent() {
        if (this.getCount() > this.pointer) {
            return this.current[this.pointer];
        }

        return undefined;
    }

    getNext() {
        if (this.hasNext()) {
            this.moveNext();
            return this.getCurrent();
        }

        return undefined;
    }

    hasNext() {
        return this.getCount() > this.pointer + 1;
    }

    resetPointer() {
        this.pointer = 0;
    }

    add(value) {
        const current = this.current.slice();

        if (value === undefined) {
            current.push(this.getRandomSequenceNumber());
        } else {
            current.push(value);
        }

        this.current = current;
        this.count = this.current.length;
    }

    reset(saveSkips) {
        this.last = this.current;
        this.current = [];
        this.pointer = 0;
        if (!saveSkips) {
            this.excludes = [];
        }
    }

    matchesCurrent(value) {
        const current = this.getCurrent();

        if (current !== undefined) {
            return current === value;
        }

        return undefined;
    }

    moveNext() {
        if (this.hasNext()) {
            this.pointer++;
        }
    }

    getCount() {
        return this.current.length;
    }

    addSkip(value) {
        if (!this.excludes.includes(value)) {
            this.excludes.push(value);
        }
    }

    getSkipCount() {
        return this.excludes.length;
    }

    clearSkips() {
        this.excludes = [];
    }
}

export default Sequence;

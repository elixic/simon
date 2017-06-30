class Sequence {
    constructor() {
        this.current = [];
        this.last = [];
        this.longest = [];
        this.pointer = 0;
        this.count = 0;
    }

    getRandomSequenceNumber(excluded) {
        let newVal = -1;
        if (excluded === undefined || excluded === null) {
            excluded = [];
        }

        while(true) {
            newVal = Math.floor(Math.random() * 4);
            if (!excluded.includes(newVal)) {
                return newVal;
            }
        }
    }

    getCurrent() {
        if (this.count > this.pointer) {
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
        return this.count > this.pointer + 1;
    }

    resetPointer() {
        this.pointer = 0;
    }

    add(value, excluded) {
        if (value === undefined) {
            console.log("adding new value");
            this.current.push(this.getRandomSequenceNumber(excluded));
            console.log(this.current);
        } else {
            this.current.push(value);
        }

        this.count = this.current.length;
    }

    reset() {
        this.last = this.current;
        this.current = [];
        this.pointer = 0;
        this.count = 0;
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
        return this.count;
    }
}

export default Sequence;

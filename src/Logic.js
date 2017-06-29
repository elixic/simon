class Logic {
    constructor() {
        this.timerDuration = 250; // milliseconds between timer calls
        this.maxInterval = 20; // maximum number of timer calls to wait. (is 5 seconds)
        this.waitInterval = 0;
        this.expired = false;
    }

    getRandomLenseNumber(exclude) {
        let newVal = -1;
        if (exclude === undefined || exclude === null) {
            exclude = -1;
        }

        while(true) {
            newVal = Math.floor(Math.random() * 4);
            if (newVal !== exclude) {
                return newVal;
            }
        }
    }

    calculatePlaybackSpeed(current) {
        if (current > 13) {
            return 1
        } else if (current > 9) {
            return 2;
        } else if (current > 5) {
            return 3;
        } else {
            return 4;
        }
    }

    calculateMax(level) {
        // the max values for the levels when selected
        const levels = [8, 14, 20, 31];

        return levels[level];
    }

    incrementInterval(intervalHandler) {
        if (this.waitInterval >= this.maxInterval) {
            this.stopTimer();
            intervalHandler(true); // time expired is true
        }

        this.waitInterval++;
        return intervalHandler(this.expired || false); // time expired is false
    }

    addToSequence(sequence, excludes) {
        sequence.push(this.getRandomLenseNumber(excludes));
        return sequence;
    }

    resetInerval() {
        this.waitInterval = 0;
    }

    resetExpired() {
        this.expired = false;
    }

    stopTimer() {
        clearInterval(this.timer);
        this.timer = null;
    }

    startTimer(intervalHandler) {
        if (!this.timer) {
            this.resetInerval();
            this.timer = setInterval(() => {this.incrementInterval(intervalHandler)}, this.timerDuration);
        }
    }
};

export default Logic;

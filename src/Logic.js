class Logic {
    constructor() {
        this.timerDuration = 200; // milliseconds between timer calls
        this.maxInterval = 50; // maximum number of timer calls to wait. (is 5 seconds)
        this.waitInterval = 0;
        this.expired = false;
        this.level = 0;
        this.speed = 0;
        this.elapsed = 0;
    }

    calculatePlaybackSpeed(count) {
        if (count > 13) {
            return 2;
        } else if (count > 9) {
            return 3;
        } else if (count > 5) {
            return 4;
        } else {
            return 5;
        }
    }

    calculateMax() {
        // the max values for the levels when selected
        const levels = [8, 14, 20, 31];

        return levels[this.level];
    }

    incrementInterval(intervalHandler) {
        if (this.waitInterval >= this.maxInterval) {
            this.stopTimer();
            intervalHandler(0, true); // time expired is true
        }

        this.waitInterval++;

        if (this.elapsed === this.speed) {
            this.elapsed = 0;
        } else {
            this.elapsed++;
        }

        intervalHandler(this.speed - this.elapsed, this.expired || false); // time expired is false
    }

    resetInerval() {
        this.waitInterval = 0;
    }

    resetExpired() {
        this.expired = false;
    }

    setLevel(level) {
        this.level = Math.abs(level) <= 3? level : 3;
    }

    stopTimer() {
        clearInterval(this.timer);
        this.timer = null;
    }

    isPlaybackMode(mode) {
        return mode !== 1; // mode one (Player Add Mode) does not do playback, but the player adds the next value.
    }

    checkWinCondition(current) {
        return current >= this.calculateMax(this.level);
    }

    startTimer(intervalHandler, count) {
        if (!this.timer) {
            this.resetInerval();
            this.timer = setInterval(() => {this.incrementInterval(intervalHandler)}, this.timerDuration);
            this.speed = this.calculatePlaybackSpeed(count);
            this.elapsed = 0;
        }
    }
};

export default Logic;
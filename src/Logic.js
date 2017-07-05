const _LEVELS = [8, 14, 20, 8];

class Logic {
    constructor() {
        this.level = 0;
    }

    calculateMax() {
        // the max values for the levels when selected
        return _LEVELS[this.level];
    }

    setLevel(level) {
        this.level = Math.abs(level) <= 3? level : 3;
    }

    isPlaybackMode(mode) {
        return mode !== 1; // mode one (Player Add Mode) does not do playback, but the player adds the next value.
    }

    checkWinCondition(current) {
        return current >= this.calculateMax(this.level);
    }
};

export default Logic;

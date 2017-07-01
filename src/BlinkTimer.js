const DEFAULT_NUMBER_OF_BLINKS = 6;
const DEFAULT_DURATION = 200;

class BlinkTimer {
    constructor() {
        this.timer = undefined;
        this.duration = DEFAULT_DURATION; // 100 milisecond blinks
        this.blinkMultiple = 2;
        this.numberOfBlinks = DEFAULT_NUMBER_OF_BLINKS; // default number of blinks
    }

    setBlinks(numberOfBlinks) {
        if (!isNaN(numberOfBlinks)) {
            this.numberOfBlinks = Math.floor(numberOfBlinks);
        } else {
            this.numberOfBlinks = DEFAULT_NUMBER_OF_BLINKS;
        }
    }

    setDurration(durration) {
        if (!isNaN(durration)) {
            this.duration = Math.floor(durration);
        } else {
            this.duration = DEFAULT_DURATION;
        }
    }

    setBlinkeMultiple(multiple) {
        if (!isNaN(multiple)) {
            this.blinkMultiple = Math.floor(multiple);
        } else {
            this.blinkMultiple = 2;
        }
    }

    blink(blink, pause) {
        let iterations = 0;
        let blinks = 0;
        let intervalHandler = () => {
            console.log("blink or something...");
            iterations++;
            if (iterations % this.blinkMultiple === 0) {
                pause();
            } else {
                blinks++;
                blink();
            }

            if (blinks > this.numberOfBlinks) {
                this.stop();
                pause(); // undo the blink...
            }
        };

        this.timer = setInterval(intervalHandler, this.duration)
    }

    stop() {
        clearInterval(this.timer);
        this.timer = undefined;
    }
}

export default BlinkTimer;

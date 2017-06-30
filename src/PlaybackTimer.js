function calculateDelay(count) {
    if (count > 13) {
        return 250;
    } else if (count > 9) {
        return 500;
    } else if (count > 5) {
        return 750;
    } else {
        return 1000;
    }
}

class PlaybackTimer {
    constructor() {
        this.timer = undefined;
        this.stopped = false;
    }

    start(drawWait, drawHighlight, finalize, count) {
        let highlight = null;
        let waitHandler = () => {
            if (this.stopped) {
                return;
            }

            highlight = drawHighlight();
            this.timer = setTimeout(innerHandler, calculateDelay(count));
        };

        let innerHandler = () => {
            if (this.stopped) {
                return;
            }

            if (highlight) {
                drawWait();
                this.timer = setTimeout(waitHandler, 250);
            } else {
                finalize();
            }
        };

        let start = () => {
            this.stopped = false;
            highlight = drawHighlight();
            this.timer = setTimeout(innerHandler, calculateDelay(count));
        };

        this.stop(); // ensure there is no other timer running.

        console.log("Starting playback timer...");
        // wait for a bit when we start to give a lil gap between the last button press and
        // playing the next sequence back.
        this.timer = setTimeout(start, 200);
    }

    stop() {
        this.stopped = true;
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }
}

export default PlaybackTimer;

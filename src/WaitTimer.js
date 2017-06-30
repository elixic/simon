class WaitTimer {
    constructor() {
        this.timer = undefined;
        this.handler = undefined;
    }

    start(handleTimeout) {
        this.stop(); // ensure no other timers are running
        this.handler = handleTimeout;
        this.timer = setTimeout(this.handler, 5000); // wait five seconds between lense presses
    }

    reset() {
        this.stop();
        this.start(this.handler);
    }

    stop() {
        clearTimeout(this.timer);
    }
}

export default WaitTimer;

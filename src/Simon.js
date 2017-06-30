import React from 'react';
import Logic from './Logic';
import Sequence from './Sequence';

import './index.css';

function Border(props) {
    return (
        <div className={props.class}></div>
    );
}

function Lense(props) {
    return (
        <button className={props.class} onClick={props.onClick}>
        </button>
    );
}

function Start(props) {
    return (
        <button onClick={props.onClick}>Start</button>
    );
}

function Level(props) {
    return (
        <div>
        <span>Level </span>
        <select onChange={(evt) => props.onChange(evt)} value={props.level} disabled={props.isDisabled}>
            <option value="0">1</option>
            <option value="1">2</option>
            <option value="2">3</option>
            <option value="3">4</option>
        </select>
        </div>
    );
}

function Mode(props) {
    return (
        <div>
            <span>Mode </span>
            <select onChange={(evt) => props.onChange(evt)} value={props.mode} disabled={props.isDisabled}>
                <option value="0">Simon Says</option>
                <option value="1">Player Adds</option>
                <option value="2">Chose Your Color</option>
            </select>
        </div>
    );
}

class Simon extends React.Component {
    constructor() {
        super();

        this.logic = new Logic();
        this.sequence = new Sequence();

        this.state = {
            level: 0,
            mode: 0,
            playback: true, // when true simon is playing the pattern to be remembered
            highlight: false,
            add: true,
            fail: false,
            play: false,
            speed: this.logic.calculatePlaybackSpeed(0),
        };
    }

    start() {
        this.logic.resetExpired();
        this.logic.startTimer(this.tick.bind(this));
        this.sequence.reset();

        this.setState({...this.state,
            add: true,
            playback: true,
            play: true,
            fail: false,
            highlight: false,
            speed: this.logic.calculatePlaybackSpeed(0),
        });
    }

    doPlayback() {
        let playback = this.state.playback; // if we are still playing the sequence back
        let speed = this.state.speed; // how many ticks to wait before we move to the next item in sequence
        let highlight = this.state.highlight; // should we highlight the current item in sequence?

        if (speed === 0) {
            if (!this.sequence.getNext()) {
                highlight = false;
                playback = false;
                this.sequence.resetPointer();
                this.logic.resetInerval(); // make sure we give players the full tiem interval to guess their number.
            } else {
                // when we increment the item we are highlighting we want to wait a tick before
                // we highlight it to avoid one lone highlight for duplicate sequences.
                highlight = false;
                speed = this.logic.calculatePlaybackSpeed(this.sequence.getCount());
                console.log("next with speed: " + speed);
            }
        } else {
            highlight = true;
            speed--;
        }

        this.setState({...this.state,
            playback,
            speed,
            highlight,
        });
    }

    doWait(expired) {
        // our interval handler gets called again with a different value after the first fail
        // and resets the timer if we don't check for fail to have already happend.
        let fail = expired || this.state.fail;

        this.setState({...this.state,
            fail,
            play: !expired && !fail,
        });
    }

    doAddValue(value) {
        let speed = this.logic.calculatePlaybackSpeed(this.sequence.getCount());

        this.sequence.add(value); // adds a new random value to the sequence.
        this.sequence.resetPointer(); // resets the point for replay

        this.setState({...this.state,
            add: false,
            speed: speed,
            playback: this.logic.isPlaybackMode(this.state.mode),
        });
    }

    tick(expired) {
        if (this.state.add) {
            this.doAddValue();
        } else if (this.state.playback) {
            this.doPlayback();
        } else {
            this.doWait(expired);
        }
    }

    componentWillUnmount() {
        this.logic.stopTimer();
    }

    handleLevelChange(evt) {
        // base 10 integer
        const newLevel = parseInt(evt.target.value, 10);
        let mode = this.state.mode;
        this.logic.setLevel(newLevel);

        if (newLevel < 3) {
            mode = 0;
        }

        this.setState({...this.state,
            level: newLevel,
            mode,
        });
    }

    handleModeChange(evt) {
        // base 10 integer
        const newMode = parseInt(evt.target.value, 10);
        let level = this.state.level;

        if (newMode > 0) {
            level = 3;
            this.logic.setLevel(level);
        }

        this.setState({...this.state,
            mode: newMode,
            level,
        });
    }

    handleClick(i) {
        let fail = !this.sequence.matchesCurrent(i);
        let win = !this.sequence.hasNext() && this.sequence.getCount() === this.logic.calculateMax();
        let isPlayback = !this.sequence.hasNext() && this.logic.isPlaybackMode(this.state.mode); // no playback for player add mode.
        let play = this.state.play;

        this.logic.stopTimer();

        if (!win && !this.sequence.getNext() && this.state.mode === 1) {
            // if we are at the current and our game mode is player add, we'll add the new, which will trigger a state event
            this.doAddValue(i);
        } else {
            this.setState({...this.state,
                playback: isPlayback,
                add: isPlayback,
                fail,
                play: play && !fail,
                win: !fail && win,
            });
        }
    }

    renderLense(lenseClass, i) {
        let handleClick = this.handleClick.bind(this);
        if (this.state.playback) {
            handleClick = () => {}; // do nothing if we are playing back
        }

        if (this.state.highlight && this.sequence.matchesCurrent(i)) {
            lenseClass = lenseClass + "-active";
        }

        return (
            <Lense
            class={lenseClass}
            onClick={() => handleClick(i)}
            />
        );
    }

    renderModeSelect() {
        return (
            <Mode onChange={this.handleModeChange.bind(this)} mode={this.state.mode} isDisabled={this.state.play} />
        );
    }

    renderLevelSelect() {
        let handleLevelChange = this.handleLevelChange.bind(this);

        return (
            <Level onChange={handleLevelChange} level={this.state.level} isDisabled={this.state.play} />
        );
    }

    renderStart() {
        let start = this.start.bind(this);

        return (
            <Start onClick={() => start()} />
        );
    }

    renderBorder(borderClass) {
        return (
            <Border class={borderClass} />
        );
    }

    render() {
        let status;

        if (this.state.win) {
            status = 'You Win!';
            // todo - play sound
        } else if (this.state.fail) {
            status = 'Start Over!';
            // todo - play sound
        } else {
            status = 'Total: ' + (this.sequence.getCount());
            if (this.state.play) {
                this.logic.startTimer(this.tick.bind(this));
            }
        }

        return (
            <div>
                <div className="status">{status}</div>
                {this.renderStart()}
                {this.renderLevelSelect()}
                {this.renderModeSelect()}
                <div className="board-row">
                    {this.renderLense("lense top-left", 0)}
                    {this.renderBorder("border border-vertical")}
                    {this.renderLense("lense top-right", 1)}
                </div>
                <div className="board-row">
                    {this.renderBorder("border border-horizontal")}
                    {this.renderBorder("border")}
                    {this.renderBorder("border border-horizontal")}
                </div>
                <div className="board-row">
                    {this.renderLense("lense bottom-left", 2)}
                    {this.renderBorder("border border-vertical")}
                    {this.renderLense("lense bottom-right", 3)}
                </div>
                <div>
                    level: {this.state.level + 1}<br />
                    max: {this.logic.calculateMax()}<br />
                    playback: {this.state.playback? "true" : "false"}<br />
                    play: {this.state.play? "true" : "false"}<br />
                    order: {this.sequence.getCount()}<br />
                    current: {this.state.current}<br />
                    fail: {this.state.fail}<br />
                    speed: {this.state.speed}<br />
                    waitIntervals: {this.state.waitIntervals}<br />
                </div>
            </div>
        );
    }
};

export default Simon;

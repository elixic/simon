import React from 'react';
import Logic from './Logic';

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
        <select onChange={(evt) => props.onChange(evt)}>
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
            <select onChange={(evt) => props.onChange(evt)}>
                <option value="0">1</option>
                <option value="1">2</option>
                <option value="2">3</option>
            </select>
        </div>
    )
}

const ADD_TO_SEQUENCE_SIGNAL = -1;

class Simon extends React.Component {
    constructor() {
        super();

        this.logic = new Logic();

        this.state = {
            level: 0,
            max: this.logic.calculateMax(0), // this is the maximum number of values to remember
            mode: null, // todo: we will use this for game modes
            playback: true, // when true simon is playing the pattern to be remembered
            highlight: false,
            order: [],
            current: ADD_TO_SEQUENCE_SIGNAL,
            count: 0,
            fail: false,
            play: false,
            speed: this.logic.calculatePlaybackSpeed(0),
        };
    }

    start() {
        this.logic.resetExpired();
        this.logic.startTimer(this.tick.bind(this));

        this.setState({...this.state,
            current: ADD_TO_SEQUENCE_SIGNAL,
            playback: true,
            max: this.logic.calculateMax(this.state.level),
            play: true,
            fail: false,
            highlight: false,
            order: [],
            count: 0,
            speed: this.logic.calculatePlaybackSpeed(0),
        });
    }

    doPlayback() {
        let current = this.state.current; // the current item in the sequcne
        let playback = this.state.playback; // if we are still playing the sequence back
        let speed = this.state.speed; // how many ticks to wait before we move to the next item in sequence
        let highlight = this.state.highlight; // should we highlight the current item in sequence?

        if (speed === 0) {
            if (current === this.state.order.length - 1) {
                current = 0;
                highlight = false;
                playback = false;
                this.logic.resetInerval(); // make sure we give players the full tiem interval to guess their number.
            } else {
                // when we increment the item we are highlighting we want to wait a tick before
                // we highlight it to avoid one lone highlight for duplicate sequences.
                highlight = false;
                current++;
                speed = this.logic.calculatePlaybackSpeed(this.state.count);
            }
        } else {
            highlight = true;
            speed--;
        }

        this.setState({...this.state,
            current,
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
            play: !expired,
        });
    }

    doAddValue() {
        let order = this.logic.addToSequence(this.state.order.slice());
        let speed = this.logic.calculatePlaybackSpeed(order.length);

        this.setState({...this.state,
            order,
            count: order.length,
            current: 0,
            speed: speed,
            playback: true,
        });
    }

    tick(expired) {
        if (this.state.current === ADD_TO_SEQUENCE_SIGNAL) {
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
        const newLevel = parseInt(evt.target.value);

        this.setState({...this.state,
            level: newLevel,
            max: this.logic.calculateMax(newLevel),
        });
    }

    handleClick(i) {
        let current = this.state.current;
        let fail = this.state.order[current] !== i;
        let newCurrent = current + 1;
        let isPlayback = newCurrent === this.state.count;
        let win = newCurrent === this.state.max;

        this.logic.stopTimer();

        this.setState({...this.state,
            playback: isPlayback,
            current: isPlayback? ADD_TO_SEQUENCE_SIGNAL : newCurrent,
            fail,
            win: !fail && win,
        });
    }

    renderLense(lenseClass, i) {
        let handleClick = this.handleClick.bind(this);
        if (this.state.playback) {
            handleClick = () => {}; // do nothing if we are playing back
        }

        if (this.state.highlight && this.state.order[this.state.current] === i) {
            lenseClass = lenseClass + "-active";
        }

        return (
            <Lense
            class={lenseClass}
            onClick={() => handleClick(i)}
            />
        );
    }

    renderLevelSelect() {
        let handleLevelChange = this.handleLevelChange.bind(this);

        return (
            <Level onChange={handleLevelChange} />
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
            status = 'Total: ' + (this.state.current);
            if (this.state.play) {
                this.logic.startTimer(this.tick.bind(this));
            }
        }

        return (
            <div>
                <div className="status">{status}</div>
                {this.renderStart()}
                {this.renderLevelSelect()}
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
                    max: {this.state.max}<br />
                    playback: {this.state.playback? "true" : "false"}<br />
                    order: {this.state.order.length}<br />
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

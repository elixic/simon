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

function ActiveLense(props) {
    return (
        <button className={props.class + "-active"}>
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
        };
    }

    start() {
        this.logic.resetExpired();
        this.logic.startTimer(this.tick.bind(this), 0);
        this.sequence.reset();

        this.setState({...this.state,
            add: true,
            playback: true,
            play: true,
            fail: false,
            highlight: false,
        });
    }

    doPlayback(speed) {
        let playback = this.state.playback; // if we are still playing the sequence back
        let highlight = this.state.highlight;

        if (speed === 0) {
            if (!this.sequence.getNext()) {
                highlight = false;
                playback = false;
                this.sequence.resetPointer(); // set the pointer back to home so we can press all the values.
                this.logic.resetInerval(); // make sure we give players the full tiem interval to guess their number.
            }

            this.setState({...this.state,
                playback,
                highlight: false,
            });
        } else {
            if (!highlight) {
                // the first time we decrement the speed we let a playback tick where nothing is ighlighted happen
                this.setState({...this.state,
                    playback,
                    speed,
                    highlight: true,
                });
            }
        }
    }

    doWait(expired) {
        // our interval handler gets called again with a different value after the first fail
        // and resets the timer if we don't check for fail to have already happend.
        let fail = expired || this.state.fail;
        let win = false;

        if (expired && this.state.mode === 2) { // color mode
            this.addSkip(this.sequence.getCurrent()); // current player is eliminated for missing

            fail = false;
            expired = false;

            if (this.sequence.getSkipCount() === 3) {
                win = true;
                expired = true;
            }
        }

        this.setState({...this.state,
            win,
            fail,
            play: !expired && !fail,
        });
    }

    doAddValue(value) {
        this.sequence.add(value); // adds a new random value to the sequence.
        this.sequence.resetPointer(); // resets the point for replay

        this.setState({...this.state,
            add: false,
            playback: this.logic.isPlaybackMode(this.state.mode),
        });
    }


    tick(speed, expired) {
        if (!this.state.play || this.rendering) {
            return; // skip all this if we are not playing.
        }

        if (this.state.add) {
            this.doAddValue();
        } else if (this.state.playback) {
            this.doPlayback(speed);
        } else {
            this.doWait(expired);
        }
    }

    addSkip(value) {
        this.sequence.addSkip(value);
        this.sequence.reset(true); // reset the game but keep the skips
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

    handleSimonSaysClick(value) {
        let fail = !this.sequence.matchesCurrent(value);
        let win = !fail && !this.sequence.hasNext() & this.sequence.getCount() === this.logic.calculateMax();
        let playback = !fail && !win && !this.sequence.getNext();
        let play = this.state.play;

        this.setState({...this.state,
            add: playback,
            play: play && !fail,
            playback,
            fail,
            win,
        });
    }

    handlePlayerAddsCliek(value) {
        let fail = !this.sequence.matchesCurrent(value);
        let win = !fail && !this.sequence.hasNext() & this.sequence.getCount() === this.logic.calculateMax();
        let playback = !fail && !win && !this.sequence.hasNext();
        let play = this.state.play;

        if (!win && !this.sequence.getNext()) {
            this.doAddValue(value);
        } else {
            this.setState({...this.state,
                add: playback,
                play: play && !fail,
                playback,
                fail,
                win,
            });
        }
    }

    handleColorModeClick(value) {
        let fail = !this.sequence.matchesCurrent(value);
        let win = !this.sequence.hasNext() && this.sequence.getCount() === this.logic.calculateMax();
        let playback = !this.sequence.hasNext() && this.logic.isPlaybackMode(this.state.mode); // no playback for player add mode.
        let play = this.state.play;
        let add = playback;

        if (fail) {
            this.addSkip(value);
            if (this.sequence.getSkipCount() === 3) {
                playback = false;
                add = false;
                fail = false;
                play = false;
                win = true;
            } else {
                playback = true;
                add = true;
                fail = false;
                win = false;
            }
        }

        this.setState({...this.state,
            playback,
            add,
            fail,
            play: play && !fail,
            win: !fail && win,
        });
    }

    handleClick(value) {
        if (this.state.mode === 0) {
            this.handleSimonSaysClick(value);
        } else if (this.state.mode === 1) {
            this.handlePlayerAddsCliek(value);
        } else if (this.state.mode === 2) {
            this.handleColorModeClick(value);
        }
    }

    renderLense(lenseClass, i) {
        let handleClick = this.handleClick.bind(this);
        let onClick = () => {
                handleClick(i);
            };

        if (this.state.playback) {
            onClick = undefined; // do nothing if we are playing back
        }

        if (this.state.highlight && this.sequence.matchesCurrent(i)) {
            return (<ActiveLense class={lenseClass} />);
        } else {
            return (<Lense class={lenseClass} onClick={onClick} />);
        }
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
        let count = this.sequence.getCount();

        if (this.state.win) {
            status = 'You Win!';
            // todo - play sound
        } else if (this.state.fail) {
            status = 'Start Over!';
            // todo - play sound
        } else {
            status = 'Total: ' + count;
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

import React from 'react';
import Sound from 'react-sound';

import Lense from './Lense';

import Logic from './Logic';
import PlaybackTimer from './PlaybackTimer';
import WaitTimer from './WaitTimer';
import BlinkTimer from './BlinkTimer';
import Sequence from './Sequence';

import './index.css';

function Border(props) {
    return (
        <div className={props.class}></div>
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
        this.playbackTimer = new PlaybackTimer();
        this.waitTimer = new WaitTimer();
        this.blinkTimer = new BlinkTimer();

        this.state = {
            level: 0,
            mode: 0,
            highlight: false,
            add: true,
            fail: false,
            win: false,
            play: false,
            playback: false,
        };
    }

    start(keepSkips) {
        this.sequence.reset(keepSkips);

        this.setState({...this.state,
            highlight: false,
            add: false,
            fail: false,
            win: false,
            play: true,
        });

        this.doAddValue();
        this.doPlayback();
    }

    handleSoundFinished() {
        console.log("Sound done playing");
    }

    doPlayback() {
        this.playbackTimer.start(() => {
            this.setState({
                ...this.state,
                play: true,
                highlight: false,
                playback: true,
            });

            this.sequence.getNext();
        }, () => {
            this.setState({
                ...this.state,
                play: true,
                highlight: true,
                plaback: true,
            });

            return this.sequence.hasNext();
        }, () => {
            this.setState({
                ...this.state,
                play: true,
                highlight: false,
                add: false,
                playback: false,
            });

            this.doWait();
        }, this.sequence.getCount());
    }

    doWait() {
        this.sequence.resetPointer();
        this.waitTimer.start(() => {
            if (this.state.mode === 2) {
                let value = this.sequence.getCurrent(); // the value we are waiting to be pressed
                this.sequence.addSkip(value); // this value won't be in the game anymore

                if (this.sequence.getSkipCount() < 3) {
                    this.start(true); // keep the skips we added when resetting the sequence
                } else {
                    this.setState({
                        ...this.state,
                        win: true, // remaining color is the winner
                        fail: false,
                        play: false,
                    });
                }
            } else {
                this.setState({
                    ...this.state,
                    fail: true,
                    play: false,
                    win: false,
                });
            }
        });
    }

    doAddValue(value) {
        this.sequence.add(value); // adds a new random value to the sequence.
        this.sequence.resetPointer(); // resets the point for replay
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
            fail: false,
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
            fail: false,
        });
    }

    handleSimonSaysClick(value) {
        let fail = !this.sequence.matchesCurrent(value);
        let hasNext = this.sequence.getNext() !== undefined;
        let win = !fail && !hasNext && this.logic.checkWinCondition(this.sequence.getCount());
        let add = !fail && !win && !hasNext;

        if (win || fail) {
            this.waitTimer.stop();
            this.setState({
                ...this.state,
                win,
                fail,
                play: false,
            });
        }

        if (add) {
            this.waitTimer.stop();
            this.doAddValue();
            this.doPlayback();
        }
    }

    handlePlayerAddsClick(value) {
        let fail = !this.sequence.matchesCurrent(value);
        let hasNext = this.sequence.getNext() !== undefined;
        let win = !fail && !hasNext && this.logic.checkWinCondition(this.sequence.getCount());
        let add = this.state.add;

        if (add) {
            this.doAddValue(value);
            this.setState({
                ...this.state,
                add: false,
                fail: false,
            });
        } else if (win || fail) {
            this.setState({
                ...this.state,
                play: false,
                fail,
                win,
            });
        } else if (!hasNext) {
            this.setState({
                ...this.state,
                add: true,
            })
        }
    }

    handleColorModeClickFailure(value) {
        this.sequence.addSkip(value);

        if (this.sequence.getSkipCount() < 3) {
            this.start(true);
        } else {
            this.handleColorModeWin();
        }
    }

    handleColorModeWin() {
        let blink = () => {
            this.setState({
                ...this.status,
                highlight: true,
                win: true,
                fail: false,
                play: false,
            });
        }

        let pause = () => {
            this.setState({
                ...this.status,
                highlight: false,
                win: true,
                fail: false,
                play: false,
            });
        }

        // we'll set it so the only value that is avaialble for highlighting is the winning value.
        this.sequence.reset(true);
        this.sequence.add();
        this.blinkTimer.blink(blink, pause);
    }

    handleColorModeClick(value) {
        let fail = !this.sequence.matchesCurrent(value);
        let hasNext = this.sequence.getNext() !== undefined;
        let win = !fail && !hasNext && this.logic.checkWinCondition(this.sequence.getCount());
        let add = !fail && !win && !hasNext;

        if (win || fail) {
            this.waitTimer.stop();

            if (fail) {
                this.handleColorModeClickFailure(value);
            } else {
                // if we win due to reachign the end it's a draw and all remaining players "win"
                this.setState({
                    ...this.status,
                    highlight: false,
                    win: true,
                    fail: false,
                    play: false,
                });
            }
        }

        if (add) {
            this.waitTimer.stop();
            this.doAddValue();
            this.doPlayback();
        }
    }

    handleClick(value) {
        if (!this.state.play || this.state.playback) {
            return;
        }

        this.waitTimer.reset(); // any click resets wait timer.

        if (this.state.mode === 0) {
            this.handleSimonSaysClick(value);
        } else if (this.state.mode === 1) {
            this.handlePlayerAddsClick(value);
        } else if (this.state.mode === 2) {
            this.handleColorModeClick(value);
        }
    }

    renderLense(position, i) {
        let active = this.state.highlight && this.sequence.matchesCurrent(i);
        let handleClick = this.handleClick.bind(this);
        let onClick = () => {
            handleClick(i);
        };

        console.log('active: ' + active);
        console.log('postion: ' + position);

        return (<Lense position={position} active={active} onClick={onClick} />);
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

    renderJazz() {
        return (
            <Sound url={process.env.PUBLIC_URL + "/wrong-answer.mp3"}
                playStatus={this.state.fail? Sound.status.PLAYING : Sound.status.STOPPED}
                volume={25}
                onFinishedPlaying={() => this.handleSoundFinished()}
                />
        );
    }

    render() {
        let count = this.sequence.getCount();
        let status = 'Total: ' + count;

        if (this.state.win) {
            status = 'You Win!';
        } else if (this.state.fail) {
            status = 'Start Over!';
        }

        return (
            <div>
                {this.renderJazz()}
                <div className="status">{status}</div>
                {this.renderStart()}
                {this.renderLevelSelect()}
                {this.renderModeSelect()}
                <div className="board-row">
                    {this.renderLense("tl", 0)}
                    {this.renderBorder("border border-vertical")}
                    {this.renderLense("tr", 1)}
                </div>
                <div className="board-row">
                    {this.renderBorder("border border-horizontal")}
                    {this.renderBorder("border")}
                    {this.renderBorder("border border-horizontal")}
                </div>
                <div className="board-row">
                    {this.renderLense("bl", 2)}
                    {this.renderBorder("border border-vertical")}
                    {this.renderLense("br", 3)}
                </div>
            </div>
        );
    }
};

export default Simon;

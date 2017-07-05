import React from 'react';
import Sound from 'react-sound';

import Lens from './Lens';

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

function Play(props) {
    return (
        <button className="play-button" onClick={props.onClick} disabled={props.isDisabled}>{props.name}</button>
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

    replayLast() {
        if (this.sequence.loadLast()) {
            this.setState({
                ...this.state,
                play: true,
                playback: true,
                fail: false, // avoid the jazz sound playing with every blink
            });

            // supplying true signifies we will skip playing the game after playback
            this.doPlayback(true);
        }
    }

    replayLongest() {
        if (this.sequence.loadLongest()) {
            this.setState({
                ...this.state,
                play: true,
                playback: true,
                fail: false, // avoid the jazz sound playing with every blink
            });

            // supplying true signifies we will skip playing the game after playback
            this.doPlayback(true);
        }
    }

    doPlayback(skipWait) {
        this.playbackTimer.start(() => {
            this.setState({
                ...this.state,
                play: true,
                fail: false,
                highlight: false,
                playback: true,
            });

            this.sequence.getNext();
        }, () => {
            this.setState({
                ...this.state,
                play: true,
                fail: false,
                highlight: true,
                plaback: true,
            });

            return this.sequence.hasNext();
        }, () => {
            // if skip wait is supplied when this function is called and it is truty
            // then we will no play or start waiting after the playback sequence.
            this.setState({
                ...this.state,
                fail: false,
                play: !skipWait,
                highlight: false,
                add: false,
                playback: false,
            });

            if (!skipWait) {
                this.doWait();
            }
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

            if (win) {
                this.handleWin();
            } else {
                this.setState({
                    ...this.state,
                    win: false,
                    fail: true,
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
            if (win) {
                this.handleWin();
            } else {
                this.setState({
                    ...this.state,
                    play: false,
                    fail: true,
                    win: false,
                });
            }
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
            this.handleWin();
        }
    }

    handleWin() {
        while(this.sequence.moveNext()) {
            // nothing, just making sure we are at the Last
            // button pressed.
        }

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

    renderLens(position, i) {
        let active = this.state.highlight && this.sequence.matchesCurrent(i);
        let handleClick = this.handleClick.bind(this);
        let onClick = () => {
            handleClick(i);
        };

        return (<Lens position={position} active={active} onClick={onClick} />);
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
            <Play name="Start" onClick={() => start()} isDisabled={false} />
        );
    }

    renderPlayLast() {
        let play = this.replayLast.bind(this);

        return (
            <Play name="Play Last" onClick={() => play()} isDisabled={!this.sequence.hasLast() || this.state.play} />
        );
    }

    renderPlayLongest() {
        let play = this.replayLongest.bind(this);

        return (
            <Play name="Play Longest" onClick={() => play()} isDisabled={!this.sequence.hasLast() || this.state.play} />
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
                playStatus={this.state.fail && !this.state.play? Sound.status.PLAYING : Sound.status.STOPPED}
                volume={25}
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
                <div className="board-row">
                    {this.renderStart()}
                    {this.renderPlayLast()}
                    {this.renderPlayLongest()}
                </div>
                {this.renderLevelSelect()}
                {this.renderModeSelect()}
                <div className="board-row">
                    {this.renderLens("tl", 0)}
                    {this.renderBorder("border border-vertical")}
                    {this.renderLens("tr", 1)}
                </div>
                <div className="board-row">
                    {this.renderBorder("border border-horizontal")}
                    {this.renderBorder("border")}
                    {this.renderBorder("border border-horizontal")}
                </div>
                <div className="board-row">
                    {this.renderLens("bl", 2)}
                    {this.renderBorder("border border-vertical")}
                    {this.renderLens("br", 3)}
                </div>
            </div>
        );
    }
};

export default Simon;

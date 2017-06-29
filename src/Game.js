import React from 'react';
import Simon from './Simon';

import './index.css';

class Game extends React.Component {
    render() {
        return (
            <div className="game">
            <div className="game-board">
            <Simon />
            </div>
            <div className="game-info">
            <div>{/* status */}</div>
            <ol>{/* TODO */}</ol>
            </div>
            </div>
        );
    }
};

export default Game;

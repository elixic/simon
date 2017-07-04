import React from 'react';

import './index.css';

function getClass(position, isActive) {
    let lensClass = "";

    if (position === "tl") {
        lensClass = "lens top-left red";
    }

    if (position === "tr") {
        lensClass = "lens top-right green";
    }

    if (position === "bl") {
        lensClass = "lens bottom-left yellow";
    }

    if (position === "br") {
        lensClass = "lens bottom-right blue";
    }

    if (isActive) {
        return lensClass + "-active";
    }

    return lensClass;
}

function isMe(position, code) {
    if (position === "tl" && code === 70) {
        return true;
    } else if (position === "tr" && code === 72) {
        return true;
    } else if (position === "bl" && code === 86) {
        return true;
    } else if (position === "br" && code === 66) {
        return true;
    }
}

function setKeyupEventListener(position, that) {
    window.addEventListener("keyup", (evt) => {
        if (isMe(position, evt.keyCode)) {
            that.setState({
                ...that.state,
                class: getClass(position, false),
            });
        }
    });
}

function setKeydownEventListener(position, handler, that) {
    window.addEventListener("keydown", (evt) => {
        if (isMe(position, evt.keyCode)) {
            that.setState({
                ...that.state,
                class: getClass(position, true),
            });

            handler();
        }
    });
}

class Lens extends React.Component {
    constructor(props) {
        super(props);

        this.handleClick = this.handleClick.bind(this);
        setKeydownEventListener(props.position, this.handleClick, this);
        setKeyupEventListener(props.position, this);

        this.state = {
            class: getClass(props.position, props.active),
            active: props.active,
            onClick: props.onClick,
            position: props.position,
        };
    }

    componentWillReceiveProps(newProps) {
        if (this.state.active !== newProps.active) {
            this.setState({
                class: getClass(newProps.position, newProps.active),
                active: newProps.active,
                onClick: newProps.onClick,
                postion: newProps.position,
            });
        }
    }

    handleClick() {
        if (this.state.onClick) {
            this.state.onClick();
        }
    }

    render() {
        return (
            <button className={this.state.class} onClick={this.handleClick}>
            </button>
        );
    }
}

export default Lens;

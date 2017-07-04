import React from 'react';

import './index.css';

function getClass(position, isActive) {
    let lenseClass = "";

    if (position === "tl") {
        lenseClass = "lense top-left red";
    }

    if (position === "tr") {
        lenseClass = "lense top-right green";
    }

    if (position === "bl") {
        lenseClass = "lense bottom-left yellow";
    }

    if (position === "br") {
        lenseClass = "lense bottom-right blue";
    }

    if (isActive) {
        return lenseClass + "-active";
    }

    return lenseClass;
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

class Lense extends React.Component {
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

export default Lense;

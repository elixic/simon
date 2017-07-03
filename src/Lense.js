import React from 'react';

import './index.css';

function getClass(position, isActive) {
    let lenseClass = "";

    console.log("position: " + position + " active: " + isActive? isActive : "undefined");

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

class Lense extends React.Component {
    constructor(props) {
        super(props);

        console.log(props);
        this.handleClick = this.handleClick.bind(this);

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
        } else {
            console.log("No click handler!");
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

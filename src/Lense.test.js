import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';

import Lense from './Lense';

it('can render without error', () => {
    const rendered = renderer.create(<Lense />).toJSON();
    expect(rendered).toBeTruthy();
});

it('can handle an onClick function', () => {
    let clicked = false;
    const handleClick = () => {
        clicked = true;
    };

    const lense = shallow(<Lense postion="tr" active={false} onClick={handleClick} />);

    lense.find('button').simulate('click');
    expect(clicked).toBeTruthy();
});

it('can render with different classes depending on position', () => {
    const tlLense = shallow(<Lense position="tl" />);
    const trLense = shallow(<Lense position="tr" />);
    const blLense = shallow(<Lense position="bl" />);
    const brLense = shallow(<Lense position="br" />);

    expect(tlLense.find('button.lense')).toHaveLength(1);
    expect(tlLense.find('button.top-left')).toHaveLength(1);
    expect(trLense.find('button.lense')).toHaveLength(1);
    expect(trLense.find('button.top-right')).toHaveLength(1);
    expect(blLense.find('button.lense')).toHaveLength(1);
    expect(blLense.find('button.bottom-left')).toHaveLength(1);
    expect(brLense.find('button.lense')).toHaveLength(1);
    expect(brLense.find('button.bottom-right')).toHaveLength(1);
});

if('can render with different classes depeding on active flag', () => {
    const inactiveLense = shallow(<Lesne position="tl" active={false} />);
    const activeLense = shalow(<Lense position="tl" active={true} />);

    expect(inactiveLene.find('button.red')).toHaveLength(1);
    expect(inactiveLene.find('button.red-active')).toHaveLength(0);
    expect(activeLense.find('button.red')).toHaveLength(0);
    expect(activeLense.find('button.red-active')).toHaveLength(1);
});

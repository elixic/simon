import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';

import Lens from './Lens';

it('can render without error', () => {
    const rendered = renderer.create(<Lens />).toJSON();
    expect(rendered).toBeTruthy();
});

it('can handle an onClick function', () => {
    let clicked = false;
    const handleClick = () => {
        clicked = true;
    };

    const lens = shallow(<Lens postion="tr" active={false} onClick={handleClick} />);

    lens.find('button').simulate('click');
    expect(clicked).toBeTruthy();
});

it('can render with different classes depending on position', () => {
    const tllens = shallow(<Lens position="tl" />);
    const trlens = shallow(<Lens position="tr" />);
    const bllens = shallow(<Lens position="bl" />);
    const brlens = shallow(<Lens position="br" />);

    expect(tllens.find('button.lens')).toHaveLength(1);
    expect(tllens.find('button.top-left')).toHaveLength(1);
    expect(trlens.find('button.lens')).toHaveLength(1);
    expect(trlens.find('button.top-right')).toHaveLength(1);
    expect(bllens.find('button.lens')).toHaveLength(1);
    expect(bllens.find('button.bottom-left')).toHaveLength(1);
    expect(brlens.find('button.lens')).toHaveLength(1);
    expect(brlens.find('button.bottom-right')).toHaveLength(1);
});

if('can render with different classes depeding on active flag', () => {
    const inactivelens = shallow(<Lens position="tl" active={false} />);
    const activelens = shalow(<Lens position="tl" active={true} />);

    expect(inactiveLens.find('button.red')).toHaveLength(1);
    expect(inactiveLens.find('button.red-active')).toHaveLength(0);
    expect(activelens.find('button.red')).toHaveLength(0);
    expect(activelens.find('button.red-active')).toHaveLength(1);
});

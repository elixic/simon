import React from 'react';
import Simon from './Simon';

import renderer from 'react-test-renderer';

it('renders without crashing', () => {
    const rendered = renderer.create(<Simon />).toJSON();
    expect(rendered).toBeTruthy();
});

if('changed level when game mode is changed to Player Add', () => {
    
});

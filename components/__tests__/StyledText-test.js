import renderer from 'react-test-renderer';
import { createElement } from 'react';
import { describe, expect, it } from '@jest/globals';

import { MonoText } from '../StyledText';

describe('MonoText', () => {
  it('renders correctly', () => {
    const tree = renderer.create(createElement(MonoText, null, 'Snapshot test!')).toJSON();

    expect(tree).toMatchSnapshot();
  });
});

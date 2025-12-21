import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import Tetris from '../src/client/components/Tetris';

describe('Tetris component', function () {
    it('renders Board component', function () {
        const { container } = render(<Tetris />);
        expect(container.querySelector('.board')).to.exist;
        expect(container.textContent).to.include('Score');
    });
});
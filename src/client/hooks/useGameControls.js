import { useEffect, useCallback } from 'react';
import { sendInput } from '../socket/socket.js';

const KEYBOARD_MAP = {
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'rotate',
    ArrowDown: 'softDrop',
    ' ': 'hardDrop',
};

// Wires keyboard input to sendInput() while `active` is true.
export function useGameControls(active) {
    const handleKeyDown = useCallback((e) => {
        if (!active) return;
        const input = KEYBOARD_MAP[e.key];
        if (input) {
            e.preventDefault();
            sendInput(input);
        }
    }, [active]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}

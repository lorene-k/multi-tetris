export const ALERT_POP = 'ALERT_POP';

export const alert = (message) => ({
    type: ALERT_POP,
    message,
});

export const ping = () => ({
    type: 'server/ping',
});

export function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

export function modEquivalent(a, b, m) {
    return (a - b) - m * Math.floor((a - b) / m) === 0;
}
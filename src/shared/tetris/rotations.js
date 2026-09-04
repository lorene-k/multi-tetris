export const rotate90 = (shape, pivot) => {
    return shape.map(([x, y]) => {
        const dx = x - pivot.x;
        const dy = y - pivot.y;
        const [rx, ry] = [dy, -dx];
        return [rx + pivot.x, ry + pivot.y];
    });
}

export const rotateN = (shape, pivot, n) => {
    let rotatedShape = shape
    for (let i = 0; i < n; i++) {
        rotatedShape = rotate90(rotatedShape, pivot)
    }
    return rotatedShape;
}

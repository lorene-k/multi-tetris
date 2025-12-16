export const rotate90 = (shape) => {
    shape.map(([x, y]) => [-y, x])
}

export const rotateN = (shape, n) => {
    let rotated = shape
    for (let i = 0; i < n; i++) {
        rotated = rotate90(rotated)
    }
    return rotated
}

// Add wall kicks
// If can't rotate in place, try shifting left/right/up/down by 1
// Wall kicks are:
//  - A small list of position offsets
//  - Tested after rotation
//  - Applied only if rotation initially fails
// Create kick table, try each offset until one fits
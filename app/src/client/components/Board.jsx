// ! use grid or flexbox

export function Board() {
    return (
        <div className="board">
            {
        Array.from({ length: 20 })
            .map((_, rowIndex) => (
                <div key={rowIndex} className="board-row">
                    {
                Array.from({ length: 10 })
                    .map((_, colIndex) => (
                        <div key={colIndex} className="board-cell"></div>
                    ))
            }
                </div>
            ))
        }
        </div>
    )
}
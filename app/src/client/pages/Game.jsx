import { useParams } from "react-router-dom";
import { Board } from "../components/Board.jsx";

export default function Game() {
    const { room, player } = useParams();

    console.log("DemoBoard room:", room, "player:", player); // ! TEST
    const emptyBoard = Array.from({ length: 20 }, () =>
        Array(10).fill(0)
    );

    return (
        <Board board={emptyBoard} />
    );
}

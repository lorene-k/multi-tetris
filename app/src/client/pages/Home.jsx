import { use, useState } from "react";
import { useNavigate } from "react-router-dom";
import reactLogo from '../assets/react.svg'
import '../style/Home.css'

export default function Home() {
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handlePlay = () => {
        const room = "default";
        const player = name.trim();
        if (!player) {
            setError("Please enter username to start playing.");
            return;
        }
        navigate(`/${room}/${player}`);
    };

    return (
        <>
            <div>
                <img src={reactLogo} className="logo react" alt="React logo" />
            </div>

            <div className="card">
                <h1>MULTI TETRIS</h1>

                <input
                    className="text-input"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    required={true}
                    onChange={(e) => setName(e.target.value)}
                />

                <button onClick={handlePlay}>
                    Play now
                </button>
                {error && <p className="error">{error}</p>}
            </div>
        </>
    );
}

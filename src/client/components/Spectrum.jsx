import '../style/Spectrum.css';

export function Spectrum({ name, spectrum, alive }) {
    const maxHeight = 20;

    return (
        <div className={`spectrum-container ${alive ? '' : 'spectrum-dead'}`}>
            <div className="spectrum-name">{name}</div>
            <div className="spectrum-bars">
                {spectrum.map((height, col) => (
                    <div key={col} className="spectrum-col">
                        <div
                            className="spectrum-bar"
                            style={{ height: `${(height / maxHeight) * 100}%` }}
                        />
                    </div>
                ))}
            </div>
            {!alive && <div className="spectrum-overlay">X</div>}
        </div>
    );
}

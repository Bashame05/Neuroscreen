import React, { useRef, useState, useEffect } from 'react';

const Canvas = ({ onExport }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;

        // Fill with black background for clear contrast
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, []);

    const startDrawing = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ctx = canvasRef.current.getContext('2d');
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);

        // Export image blob
        canvasRef.current.toBlob((blob) => {
            onExport(blob);
        }, 'image/png');
    };

    const clear = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        onExport(null);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <canvas
                ref={canvasRef}
                width={400}
                height={400}
                style={{
                    border: '1px solid var(--cyan)',
                    borderRadius: '8px',
                    cursor: 'crosshair',
                    touchAction: 'none'
                }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
            />
            <button
                onClick={clear}
                style={{
                    background: 'none',
                    color: 'var(--slate)',
                    fontSize: '0.8rem',
                    border: '1px solid rgba(136, 146, 176, 0.3)',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px'
                }}
            >
                Clear Canvas
            </button>
        </div>
    );
};

export default Canvas;

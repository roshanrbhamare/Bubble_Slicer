import React, { useRef, useEffect } from 'react';
import { GameState } from '../types/game';

interface GameCanvasProps {
  width: number;
  height: number;
  gameState: {
    lives: number;
    score: number;
    combo: number;
    level: number;
    gameOver: boolean;
  };
  onSlice: (x: number, y: number) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  width,
  height,
  onSlice,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Get bubbles directly from the game state ref
      const bubbles = (window as any).__GAME_STATE?.current?.bubbles || [];

      bubbles.forEach((bubble: any) => {
        ctx.save();
        ctx.globalAlpha = bubble.opacity;
        
        // Transform for scale animation
        ctx.translate(bubble.x, bubble.y);
        ctx.scale(bubble.scale, bubble.scale);
        ctx.translate(-bubble.x, -bubble.y);

        // Draw bubble
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        
        if (bubble.isPoison) {
          ctx.fillStyle = 'rgba(163, 63, 191, 0.8)';
        } else {
          ctx.fillStyle = bubble.sliced 
            ? 'rgba(255, 255, 255, 0.3)' 
            : 'rgba(66, 135, 245, 0.8)';
        }
        
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.stroke();

        if (bubble.isPoison) {
          // Draw spikes
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const spikeLength = bubble.radius * 0.3;
            
            ctx.beginPath();
            ctx.moveTo(
              bubble.x + Math.cos(angle) * bubble.radius,
              bubble.y + Math.sin(angle) * bubble.radius
            );
            ctx.lineTo(
              bubble.x + Math.cos(angle) * (bubble.radius + spikeLength),
              bubble.y + Math.sin(angle) * (bubble.radius + spikeLength)
            );
            ctx.strokeStyle = 'rgba(163, 63, 191, 0.8)';
            ctx.stroke();
          }
        }

        ctx.restore();
      });

      requestAnimationFrame(render);
    };

    render();
  }, [width, height]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    onSlice(x, y);
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onPointerMove={handlePointerMove}
      className="touch-none"
      style={{ backgroundColor: '#1a1a1a' }}
    />
  );
};
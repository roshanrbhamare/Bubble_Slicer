import React from 'react';
import { Heart, Trophy, Gauge } from 'lucide-react';

interface GameHUDProps {
  gameState: {
    lives: number;
    score: number;
    combo: number;
    level: number;
    gameOver: boolean;
  };
  onRestart: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({ gameState, onRestart }) => {
  const { lives, score, combo, gameOver, level } = gameState;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="p-4 flex justify-between items-start">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-8 h-8 ${
                  i < lives 
                    ? 'text-red-500 animate-pulse' 
                    : 'text-gray-600'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-2">
            <Gauge className="w-5 h-5 text-blue-400" />
            <span className="text-lg font-bold text-white">Level {level}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span className="text-2xl font-bold text-white">{score}</span>
          </div>
          {combo > 1 && (
            <span className="text-lg font-bold text-yellow-500 animate-pulse">
              {combo}x Combo!
            </span>
          )}
        </div>
      </div>

      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="text-center bg-gray-800 p-8 rounded-xl shadow-lg">
            <h2 className="text-4xl font-bold text-white mb-4">Game Over!</h2>
            <p className="text-2xl text-white mb-8">Final Score: {score}</p>
            <button
              className="px-6 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 pointer-events-auto transition-colors"
              onClick={onRestart}
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
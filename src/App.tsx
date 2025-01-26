import React from 'react';
import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { useGameLoop } from './hooks/useGameLoop';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

function App() {
  const { gameState, handleSlice, startGame } = useGameLoop(
    CANVAS_HEIGHT,
    CANVAS_WIDTH
  );

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="relative">
        <GameCanvas
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          gameState={gameState}
          onSlice={handleSlice}
        />
        <GameHUD gameState={gameState} onRestart={startGame} />
      </div>
    </div>
  );
}

export default App;
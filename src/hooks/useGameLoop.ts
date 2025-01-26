import { useCallback, useEffect, useRef, useState } from 'react';
import { Bubble, GameState } from '../types/game';

const INITIAL_STATE: GameState = {
  lives: 3,
  score: 0,
  combo: 0,
  lastComboTime: 0,
  gameOver: false,
  bubbles: [],
  isPaused: false,
  level: 1,
  baseSpeed: 1,
};

const COMBO_TIMEOUT = 1000; // ms
const BUBBLE_SPAWN_RATE = 1000; // ms
const POISON_BUBBLE_CHANCE = 0.2;
const SLICE_ANIMATION_DURATION = 500; // ms
const LEVEL_SCORE_THRESHOLD = 1000; // Score needed to increase level
const MAX_LEVEL = 10;
const BASE_SPEED = 0.8;

export const useGameLoop = (canvasHeight: number, canvasWidth: number) => {
  const gameState = useRef<GameState>({ ...INITIAL_STATE });
  const requestRef = useRef<number>();
  const lastSpawnTime = useRef(0);

  // Add state for UI updates
  const [stats, setStats] = useState({
    score: 0,
    lives: 3,
    level: 1,
    combo: 0,
    gameOver: false,
  });

  // Expose game state for canvas rendering
  (window as any).__GAME_STATE = gameState;

  const updateStats = useCallback(() => {
    const { score, lives, level, combo, gameOver } = gameState.current;
    setStats({ score, lives, level, combo, gameOver });
  }, []);

  const createBubble = useCallback((): Bubble => {
    const radius = Math.random() * 20 + 20;
    const currentSpeed = BASE_SPEED + (gameState.current.level - 1) * 0.3;
    return {
      id: Math.random().toString(36).substring(7),
      x: Math.random() * (canvasWidth - radius * 2) + radius,
      y: -radius,
      radius,
      speed: currentSpeed + Math.random() * 0.5,
      isPoison: Math.random() < POISON_BUBBLE_CHANCE,
      sliced: false,
      slicedAt: 0,
      scale: 1,
      opacity: 1,
    };
  }, [canvasWidth]);

  const checkLevelUp = useCallback(() => {
    const { score, level } = gameState.current;
    const shouldLevelUp = Math.floor(score / LEVEL_SCORE_THRESHOLD) + 1;
    if (shouldLevelUp > level && level < MAX_LEVEL) {
      gameState.current.level = shouldLevelUp;
      gameState.current.baseSpeed = BASE_SPEED + (shouldLevelUp - 1) * 0.2;
      updateStats();
    }
  }, [updateStats]);

  const spawnBubbles = useCallback(() => {
    const now = Date.now();
    const spawnDelay = Math.max(BUBBLE_SPAWN_RATE - (gameState.current.level - 1) * 50, 300);

    if (now - lastSpawnTime.current > spawnDelay) {
      gameState.current.bubbles.push(createBubble());
      lastSpawnTime.current = now;
    }
  }, [createBubble]);

  const updateBubbles = useCallback(() => {
    const { bubbles } = gameState.current;
    const now = Date.now();
    let statsUpdated = false;

    gameState.current.bubbles = bubbles.filter((bubble) => {
      if (!bubble.sliced) {
        bubble.y += bubble.speed;

        if (bubble.y > canvasHeight + bubble.radius) {
          if (!bubble.isPoison) {
            gameState.current.lives--;
            gameState.current.combo = 0;
            statsUpdated = true;

            if (gameState.current.lives <= 0) {
              gameState.current.gameOver = true;
            }
          }
          return false;
        }
      } else {
        const timeSinceSlice = now - bubble.slicedAt;
        const progress = Math.min(timeSinceSlice / SLICE_ANIMATION_DURATION, 1);

        bubble.scale = 1 + progress * 0.5;
        bubble.opacity = 1 - progress;

        if (progress >= 1) {
          return false;
        }
      }
      return true;
    });

    if (statsUpdated) {
      updateStats();
    }
  }, [canvasHeight, updateStats]);

  const gameLoop = useCallback(() => {
    if (!gameState.current.isPaused && !gameState.current.gameOver) {
      spawnBubbles();
      updateBubbles();
      checkLevelUp();
    }
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [spawnBubbles, updateBubbles, checkLevelUp]);

  const startGame = useCallback(() => {
    gameState.current = { ...INITIAL_STATE };
    lastSpawnTime.current = Date.now();
    updateStats();
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop, updateStats]);

  const handleSlice = useCallback((x: number, y: number) => {
    if (gameState.current.gameOver) return;

    const { bubbles, combo, lastComboTime } = gameState.current;
    const now = Date.now();
    let statsUpdated = false;

    bubbles.forEach((bubble) => {
      if (!bubble.sliced) {
        const dx = x - bubble.x;
        const dy = y - bubble.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < bubble.radius) {
          bubble.sliced = true;
          bubble.slicedAt = now;

          if (bubble.isPoison) {
            gameState.current.gameOver = true;
            statsUpdated = true;
          } else {
            const isCombo = now - lastComboTime < COMBO_TIMEOUT;
            const comboMultiplier = isCombo ? combo + 1 : 1;

            gameState.current.score += 100 * comboMultiplier;
            gameState.current.combo = isCombo ? combo + 1 : 1;
            gameState.current.lastComboTime = now;
            statsUpdated = true;
          }
        }
      }
    });

    if (statsUpdated) {
      updateStats();
    }
  }, [updateStats]);

  useEffect(() => {
    startGame();
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [startGame]);

  return {
    gameState: stats,
    handleSlice,
    startGame,
  };
};

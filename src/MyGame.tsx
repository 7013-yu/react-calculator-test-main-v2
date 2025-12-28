import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Modal } from './components/Modal';
import { 
  BOARD_SIZE, 
  INITIAL_SPEED, 
  MIN_SPEED,
  SPEED_INCREMENT,
  INITIAL_SNAKE_POSITION, 
  INITIAL_FOOD_POSITION,
  DIRECTIONS,
  OPPOSITE_DIRECTIONS
} from './constants';
import type { Coordinates, Direction } from './types';

function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>(null);
  useEffect(() => { savedCallback.current = callback; }, [callback]);
  useEffect(() => {
    function tick() { if (savedCallback.current) savedCallback.current(); }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const MyGame: React.FC = () => {
  const [snake, setSnake] = useState<Coordinates[]>(INITIAL_SNAKE_POSITION);
  const [food, setFood] = useState<Coordinates>(INITIAL_FOOD_POSITION);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [speed, setSpeed] = useState<number | null>(null);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(20);

  const generateFood = useCallback((snakeBody: Coordinates[]): Coordinates => {
    while (true) {
      const foodPosition = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE),
      };
      const onSnake = snakeBody.some(
        segment => segment.x === foodPosition.x && segment.y === foodPosition.y
      );
      if (!onSnake) return foodPosition;
    }
  }, []);

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE_POSITION);
    setFood(generateFood(INITIAL_SNAKE_POSITION));
    setDirection('RIGHT');
    setSpeed(INITIAL_SPEED);
    setIsGameOver(false);
    setIsGameStarted(true);
    setScore(0);
  }, [generateFood]);

  const endGame = () => {
    setSpeed(null);
    setIsGameOver(true);
  };

  const gameLoop = useCallback(() => {
    const snakeCopy = [...snake];
    const head = { ...snakeCopy[0] };
    const move = DIRECTIONS[direction];
    const newHead: Coordinates = { x: head.x + move.x, y: head.y + move.y };

    if (
      newHead.x < 0 || newHead.x >= BOARD_SIZE ||
      newHead.y < 0 || newHead.y >= BOARD_SIZE ||
      snakeCopy.some(segment => segment.x === newHead.x && segment.y === newHead.y)
    ) {
      endGame();
      return;
    }

    snakeCopy.unshift(newHead);

    if (newHead.x === food.x && newHead.y === food.y) {
      setScore(prev => prev + 10);
      setFood(generateFood(snakeCopy));
      setSpeed(prev => (prev ? Math.max(MIN_SPEED, prev - SPEED_INCREMENT) : null));
    } else {
      snakeCopy.pop();
    }

    setSnake(snakeCopy);
  }, [snake, direction, food, generateFood]);

  useInterval(gameLoop, speed);

  const handleDirectionChange = useCallback((newDirection: Direction) => {
    if (newDirection !== OPPOSITE_DIRECTIONS[direction]) {
      setDirection(newDirection);
    }
  }, [direction]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isGameStarted) return;
      let newDirection: Direction | null = null;
      switch (e.key) {
        case 'ArrowUp': case 'w': newDirection = 'UP'; break;
        case 'ArrowDown': case 's': newDirection = 'DOWN'; break;
        case 'ArrowLeft': case 'a': newDirection = 'LEFT'; break;
        case 'ArrowRight': case 'd': newDirection = 'RIGHT'; break;
        default: return;
      }
      handleDirectionChange(newDirection);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGameStarted, handleDirectionChange]);
  
  // 💡 自動計算格子大小，適應容器尺寸
  useEffect(() => {
    const updateCellSize = () => {
      if (boardRef.current) {
        const width = boardRef.current.clientWidth;
        setCellSize(width / BOARD_SIZE);
      }
    };
    updateCellSize();
    const resizeObserver = new ResizeObserver(updateCellSize);
    if (boardRef.current) resizeObserver.observe(boardRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const DPadButton: React.FC<{ dir: Direction, children: React.ReactNode, className?: string }> = ({ dir, children, className }) => (
    <button
      onClick={() => handleDirectionChange(dir)}
      className={`bg-gray-700/80 active:bg-teal-500 text-white font-bold rounded-md flex items-center justify-center transition-all aspect-square ${className}`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col items-center justify-center w-full max-h-full font-mono select-none">
      {/* 1. 分數與標題：縮小間距 */}
      <header className="w-full max-w-md flex justify-between items-center mb-2 p-2 bg-gray-800/50 rounded-lg border border-gray-700">
        <h1 className="text-lg font-bold text-teal-400">Greedy Snake</h1>
        <div className="text-lg font-bold">Score: <span className="text-green-400">{score}</span></div>
      </header>

      {/* 2. 遊戲畫板：使用 vh 限制高度，確保不產生捲軸 */}
      <div 
        ref={boardRef} 
        className="relative bg-gray-900 border-4 border-teal-500 shadow-lg shadow-teal-500/20 overflow-hidden"
        style={{
          width: 'min(80vw, calc(100vh - 320px))',
          height: 'min(80vw, calc(100vh - 320px))',
        }}
      >
        {snake.map((segment, index) => (
          <div
            key={index}
            className={`absolute rounded-sm ${index === 0 ? 'bg-green-400 z-10' : 'bg-green-600 z-5'}`}
            style={{
              left: `${segment.x * cellSize}px`,
              top: `${segment.y * cellSize}px`,
              width: `${cellSize}px`,
              height: `${cellSize}px`,
            }}
          />
        ))}
        <div
          className="absolute bg-red-500 rounded-full"
          style={{
            left: `${food.x * cellSize}px`,
            top: `${food.y * cellSize}px`,
            width: `${cellSize}px`,
            height: `${cellSize}px`,
            boxShadow: '0 0 8px #f56565',
          }}
        />
      </div>

      {/* 3. 控制區：電腦隱藏，手機縮小 */}
      <div className="mt-4 w-32 h-32 grid grid-cols-3 grid-rows-3 gap-1 md:hidden">
        <DPadButton dir="UP" className="col-start-2">▲</DPadButton>
        <DPadButton dir="LEFT" className="row-start-2">◄</DPadButton>
        <DPadButton dir="DOWN" className="col-start-2 row-start-3">▼</DPadButton>
        <DPadButton dir="RIGHT" className="col-start-3 row-start-2">►</DPadButton>
      </div>
      <p className="hidden md:block mt-2 text-xs text-gray-500">Use Arrows or WASD</p>

      {/* Modals */}
      <Modal title="Greedy Snake" isOpen={!isGameStarted && !isGameOver}>
        <p className="text-gray-300 text-sm mb-4">Eat red pellets to grow. Don't hit walls or your tail!</p>
        <button onClick={resetGame} className="w-full bg-teal-600 text-white font-bold py-2 rounded-lg hover:bg-teal-500">Start Game</button>
      </Modal>

      <Modal title="Game Over" isOpen={isGameOver}>
        <p className="text-gray-300">Final Score: <span className="text-green-400 font-bold">{score}</span></p>
        <button onClick={resetGame} className="w-full mt-4 bg-teal-600 text-white font-bold py-2 rounded-lg hover:bg-teal-500">Play Again</button>
      </Modal>
    </div>
  );
};

export default MyGame;

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

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }
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
      if (!onSnake) {
        return foodPosition;
      }
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
        case 'ArrowUp':
        case 'w':
          newDirection = 'UP';
          break;
        case 'ArrowDown':
        case 's':
          newDirection = 'DOWN';
          break;
        case 'ArrowLeft':
        case 'a':
          newDirection = 'LEFT';
          break;
        case 'ArrowRight':
        case 'd':
          newDirection = 'RIGHT';
          break;
        default:
          return;
      }
      handleDirectionChange(newDirection);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, isGameStarted, handleDirectionChange]);
  
  useEffect(() => {
    const updateCellSize = () => {
        if (boardRef.current) {
            const width = boardRef.current.offsetWidth;
            setCellSize(width / BOARD_SIZE);
        }
    };
    updateCellSize();
    window.addEventListener('resize', updateCellSize);
    return () => window.removeEventListener('resize', updateCellSize);
  }, []);

  const DPadButton: React.FC<{ dir: Direction, children: React.ReactNode, className?: string }> = ({ dir, children, className }) => (
    <button
      onClick={() => handleDirectionChange(dir)}
      className={`bg-gray-700/80 hover:bg-teal-500/80 text-white font-bold rounded-md flex items-center justify-center transition-all duration-200 aspect-square ${className}`}
      aria-label={`Move ${dir.toLowerCase()}`}
    >
      {children}
    </button>
  );

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 font-mono select-none">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl flex flex-col items-center">
        <header className="w-full flex justify-between items-center mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
          <h1 className="text-xl md:text-3xl font-bold text-teal-400">Greedy Snake</h1>
          <div className="text-xl md:text-3xl font-bold">
            Score: <span className="text-green-400">{score}</span>
          </div>
        </header>

        <div ref={boardRef} className="w-full aspect-square bg-gray-900 border-4 border-teal-500 shadow-lg shadow-teal-500/10 relative">
          {snake.map((segment, index) => (
            <div
              key={index}
              className={`absolute rounded-sm transition-all duration-75 ${index === 0 ? 'bg-green-400' : 'bg-green-600'}`}
              style={{
                left: `${segment.x * cellSize}px`,
                top: `${segment.y * cellSize}px`,
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                zIndex: index === 0 ? 10 : 5,
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

        <div className="mt-6 w-48 h-48 grid grid-cols-3 grid-rows-3 gap-2 md:hidden">
          <DPadButton dir="UP" className="col-start-2">▲</DPadButton>
          <DPadButton dir="LEFT" className="row-start-2">◄</DPadButton>
          <DPadButton dir="DOWN" className="col-start-2 row-start-3">▼</DPadButton>
          <DPadButton dir="RIGHT" className="col-start-3 row-start-2">►</DPadButton>
        </div>
        <p className="hidden md:block mt-4 text-gray-500">Use Arrow Keys or WASD to move</p>
      </div>

      <Modal title="Greedy Snake" isOpen={!isGameStarted && !isGameOver}>
        <p className="text-gray-300">Eat the red pellets to grow and increase your score. Avoid hitting the walls or your own tail!</p>
        <button
          onClick={resetGame}
          className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-4 rounded-lg text-xl transition-transform transform hover:scale-105"
        >
          Start Game
        </button>
      </Modal>

      <Modal title="Game Over" isOpen={isGameOver}>
        <p className="text-gray-300 text-lg">Your final score is:</p>
        <p className="text-5xl font-bold text-green-400 my-4">{score}</p>
        <button
          onClick={resetGame}
          className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-4 rounded-lg text-xl transition-transform transform hover:scale-105"
        >
          Play Again
        </button>
      </Modal>
    </div>
  );
};

export default MyGame;

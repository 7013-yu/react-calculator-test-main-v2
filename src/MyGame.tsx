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

// 自定義 Interval Hook
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
  // --- 1. 狀態宣告 (States) ---
  const [snake, setSnake] = useState<Coordinates[]>(INITIAL_SNAKE_POSITION);
  const [food, setFood] = useState<Coordinates>(INITIAL_FOOD_POSITION);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [speed, setSpeed] = useState<number | null>(null);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [cellSize, setCellSize] = useState(20);
  const boardRef = useRef<HTMLDivElement>(null);

  // 歷史最高分數：從 localStorage 讀取
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('snakeHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });

  // --- 2. 核心邏輯函數 (Functions) ---

  // 產生食物
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

  // 重置遊戲 (定義在前面以供 Modal 使用)
  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE_POSITION);
    setFood(generateFood(INITIAL_SNAKE_POSITION));
    setDirection('RIGHT');
    setSpeed(INITIAL_SPEED);
    setIsGameOver(false);
    setIsGameStarted(true);
    setScore(0);
  }, [generateFood]);

  // 遊戲結束邏輯
  const endGame = useCallback(() => {
    setSpeed(null);
    setIsGameOver(true);
    // 檢查並更新最高分
    setHighScore(prev => {
      if (score > prev) {
        localStorage.setItem('snakeHighScore', score.toString());
        return score;
      }
      return prev;
    });
  }, [score]);

  // 遊戲主循環
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
  }, [snake, direction, food, generateFood, endGame]);

  useInterval(gameLoop, speed);

  const handleDirectionChange = useCallback((newDirection: Direction) => {
    if (newDirection !== OPPOSITE_DIRECTIONS[direction]) {
      setDirection(newDirection);
    }
  }, [direction]);

  // --- 3. 副作用處理 (Effects) ---

  // 鍵盤監聽
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isGameStarted || isGameOver) return;
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
  }, [isGameStarted, isGameOver, handleDirectionChange]);
  
  // 自動計算格子大小
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

  // --- 4. 元件部分 ---
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
      {/* 標題與分數列 */}
      <header className="w-full max-w-md flex justify-between items-center mb-2 p-2 bg-gray-800/50 rounded-lg border border-gray-700">
        <h1 className="text-lg font-bold text-teal-400">Greedy Snake</h1>
        <div className="flex flex-col items-end leading-tight">
          <div className="text-[10px] text-gray-500 uppercase">Best: {highScore}</div>
          <div className="text-lg font-bold">Score: <span className="text-green-400">{score}</span></div>
        </div>
      </header>

      {/* 遊戲畫板 */}
      <div 
        ref={boardRef} 
        className="relative bg-gray-900 border-4 border-teal-500 shadow-lg shadow-teal-500/20 overflow-hidden aspect-square"
        style={{
          height: 'min(90vw, calc(100dvh - 240px))',
          width: 'min(90vw, calc(100dvh - 240px))',
          maxHeight: '100%',
          maxWidth: '100%'
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

      {/* 控制按鈕 (手機版) */}
      <div className="mt-4 w-32 h-32 grid grid-cols-3 grid-rows-3 gap-1 md:hidden">
        <DPadButton dir="UP" className="col-start-2">▲</DPadButton>
        <DPadButton dir="LEFT" className="row-start-2">◄</DPadButton>
        <DPadButton dir="DOWN" className="col-start-2 row-start-3">▼</DPadButton>
        <DPadButton dir="RIGHT" className="col-start-3 row-start-2">►</DPadButton>
      </div>
      <p className="hidden md:block mt-2 text-xs text-gray-500">Use Arrows or WASD</p>

      {/* 初始彈窗 */}
      <Modal title="Greedy Snake" isOpen={!isGameStarted && !isGameOver}>
        <p className="text-gray-300 text-sm mb-4 text-center">Eat red pellets to grow. Don't hit walls or your tail!</p>
        <button onClick={resetGame} className="w-full bg-teal-600 text-white font-bold py-2 rounded-lg hover:bg-teal-500 transition-colors">Start Game</button>
      </Modal>

      {/* 結束彈窗 */}
      <Modal title="Game Over" isOpen={isGameOver}>
        <div className="text-center space-y-2 mb-4">
          <p className="text-gray-300">Final Score: <span className="text-green-400 font-bold text-xl">{score}</span></p>
          {score >= highScore && score > 0 && (
            <p className="text-yellow-400 text-sm font-bold animate-bounce">🏆 NEW RECORD!</p>
          )}
          <p className="text-gray-500 text-xs">Your Best: {highScore}</p>
        </div>
        <button onClick={resetGame} className="w-full bg-teal-600 text-white font-bold py-2 rounded-lg hover:bg-teal-500 transition-colors">Play Again</button>
      </Modal>
    </div>
  );
};

export default MyGame;
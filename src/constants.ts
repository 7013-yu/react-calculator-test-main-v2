
import type { Coordinates, Direction } from './types';

export const BOARD_SIZE = 20;
export const INITIAL_SPEED = 200;
export const MIN_SPEED = 50;
export const SPEED_INCREMENT = 5;

export const INITIAL_SNAKE_POSITION: Coordinates[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

export const INITIAL_FOOD_POSITION: Coordinates = { x: 15, y: 15 };

export const DIRECTIONS: Record<Direction, Coordinates> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
};

export interface Cell {
    row: number;
    col: number;
  }
  
  export interface Maze {
    size: number;
    walls: Cell[];
  }
  
  export function generateMaze(level: number): Maze {
    const size = 5 + level;
    const walls: Cell[] = [];
  
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if ((row === 0 && col === 0) || (row === size - 1 && col === size - 1)) continue;
        if (Math.random() < 0.3) walls.push({ row, col });
      }
    }
  
    return { size, walls };
  }
  
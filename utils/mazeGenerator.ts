export interface Cell {
    row: number;
    col: number;
  }
  
  export interface Maze {
    size: number;
    walls: Cell[];
  }
  
  function hasPathToGoal(maze: boolean[][], startRow: number, startCol: number, endRow: number, endCol: number): boolean {
    const visited = new Set<string>();
    const stack: [number, number][] = [[startRow, startCol]];
    
    while (stack.length > 0) {
      const [row, col] = stack.pop()!;
      const key = `${row}-${col}`;
      
      if (row === endRow && col === endCol) return true;
      if (visited.has(key)) continue;
      if (maze[row][col]) continue; // Skip walls
      
      visited.add(key);
      
      // Check all four directions
      const directions = [
        [row + 1, col], // down
        [row - 1, col], // up
        [row, col + 1], // right
        [row, col - 1], // left
      ];
      
      for (const [newRow, newCol] of directions) {
        if (
          newRow >= 0 && newRow < maze.length &&
          newCol >= 0 && newCol < maze[0].length &&
          !visited.has(`${newRow}-${newCol}`)
        ) {
          stack.push([newRow, newCol]);
        }
      }
    }
    
    return false;
  }
  
  export function generateMaze(level: number): Maze {
    // Adjust maze size based on level
    // Start with size 5, increase by 1 every 3 levels, max size 15
    const baseSize = 5;
    const sizeIncrement = Math.floor(level / 3);
    const size = Math.min(baseSize + sizeIncrement, 15);
  
    const walls: Cell[] = [];
  
    // Create a 2D array to represent the maze
    const mazeGrid: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false));
  
    // Calculate wall probability based on level
    // Start with 25% probability, increase by 2% every level, max 40%
    const baseProbability = 0.25;
    const probabilityIncrement = 0.02;
    const maxProbability = 0.40;
    const wallProbability = Math.min(baseProbability + (level * probabilityIncrement), maxProbability);
  
    // Add random walls
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        // Skip start and goal positions
        if ((row === 0 && col === 0) || (row === size - 1 && col === size - 1)) continue;
        
        // Add wall with calculated probability
        if (Math.random() < wallProbability) {
          mazeGrid[row][col] = true;
          walls.push({ row, col });
        }
      }
    }
  
    // Ensure there's a path to the goal
    while (!hasPathToGoal(mazeGrid, 0, 0, size - 1, size - 1)) {
      // Remove a random wall
      const randomIndex = Math.floor(Math.random() * walls.length);
      const wall = walls[randomIndex];
      mazeGrid[wall.row][wall.col] = false;
      walls.splice(randomIndex, 1);
    }
  
    return { size, walls };
  }
  
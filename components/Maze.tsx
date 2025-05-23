import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Maze } from '../utils/mazeGenerator';

interface MazeProps {
  maze: Maze;
}

const MazeComponent: React.FC<MazeProps> = ({ maze }) => {
  const { width, height } = Dimensions.get('window');
  const mazeSize = Math.min(width, height) * 0.9;
  const cellSize = mazeSize / maze.size;

  const wallSet = new Set(maze.walls.map(w => `${w.row}-${w.col}`));

  return (
    <View style={[styles.container, { width: mazeSize, height: mazeSize }]}>
      {Array.from({ length: maze.size }, (_, row) => (
        <View key={row} style={{ flexDirection: 'row' }}>
          {Array.from({ length: maze.size }, (_, col) => {
            const isWall = wallSet.has(`${row}-${col}`);
            return (
              <View
                key={col}
                style={[
                  styles.cell,
                  {
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: isWall ? 'black' : 'white',
                    borderWidth: 1,
                    borderColor: '#ccc',
                  },
                ]}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
  cell: {},
});

export default MazeComponent;

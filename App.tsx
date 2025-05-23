import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Accelerometer } from 'expo-sensors';

import Maze from './components/Maze';
import Ball from './components/Ball';
import GameOver from './components/GameOver';
import Victory from './components/Victory';
import { generateMaze, Maze as MazeType } from './utils/mazeGenerator';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [level, setLevel] = useState(1);
  const [maze, setMaze] = useState<MazeType>(generateMaze(1));
  const mazeSize = Math.min(width, height) * 0.9;
  const cellSize = mazeSize / maze.size;

  const [position, setPosition] = useState({ x: cellSize / 2, y: cellSize / 2 });
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);

  useEffect(() => {
    if (gameOver || victory) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver, victory]);

  useEffect(() => {
    const subscription = Accelerometer.addListener(({ x, y }) => {
      if (gameOver || victory) return;

      let newX = position.x - x * 15;
      let newY = position.y + y * 15;

      newX = Math.max(cellSize / 2, Math.min(mazeSize - cellSize / 2, newX));
      newY = Math.max(cellSize / 2, Math.min(mazeSize - cellSize / 2, newY));

      const col = Math.floor(newX / cellSize);
      const row = Math.floor(newY / cellSize);

      const wallHit = maze.walls.some(w => w.row === row && w.col === col);

      if (!wallHit) {
        setPosition({ x: newX, y: newY });
      }

      if (row === maze.size - 1 && col === maze.size - 1) {
        setVictory(true);
        setScore(prev => prev + timeLeft * 10);
      }
    });

    return () => subscription.remove();
  }, [position, maze, timeLeft, gameOver, victory]);

  const restartGame = () => {
    const newMaze = generateMaze(1);
    setMaze(newMaze);
    setLevel(1);
    setTimeLeft(60);
    setScore(0);
    setGameOver(false);
    setVictory(false);
    setPosition({ x: cellSize / 2, y: cellSize / 2 });
  };

  const nextLevel = () => {
    const newLevel = level + 1;
    const newMaze = generateMaze(newLevel);
    setMaze(newMaze);
    setLevel(newLevel);
    setTimeLeft(60);
    setVictory(false);
    setPosition({ x: cellSize / 2, y: cellSize / 2 });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.hud}>Level: {level}  Time: {timeLeft}s  Score: {score}</Text>
      <View style={{ marginTop: 20 }}>
        <Maze maze={maze} />
        <Ball x={position.x} y={position.y} />
        <View
          style={{
            position: 'absolute',
            width: cellSize,
            height: cellSize,
            backgroundColor: 'green',
            left: cellSize * (maze.size - 1),
            top: cellSize * (maze.size - 1),
          }}
        />
      </View>
      {gameOver && <GameOver onRestart={restartGame} />}
      {victory && <Victory level={level} onNextLevel={nextLevel} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  hud: {
    fontSize: 18,
    fontWeight: '600',
  },
});

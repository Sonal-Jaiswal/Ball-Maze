import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Maze from './components/Maze';
import Ball from './components/Ball';
import GameOver from './components/GameOver';
import Victory from './components/Victory';
import { generateMaze, Maze as MazeType } from './utils/mazeGenerator';
import soundManager from './utils/soundManager';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [level, setLevel] = useState(1);
  const [maze, setMaze] = useState<MazeType>(generateMaze(1));
  const mazeSize = Math.min(width, height) * 0.85;
  const cellSize = mazeSize / maze.size;

  const [position, setPosition] = useState({ x: cellSize / 2, y: cellSize / 2 });
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const fadeAnim = new Animated.Value(1);

  // Load high score when app starts
  useEffect(() => {
    const loadHighScore = async () => {
      try {
        const savedHighScore = await AsyncStorage.getItem('highScore');
        if (savedHighScore) {
          setHighScore(parseInt(savedHighScore));
        }
      } catch (error) {
        console.error('Error loading high score:', error);
      }
    };
    loadHighScore();
  }, []);

  // Update high score when score changes
  useEffect(() => {
    const updateHighScore = async () => {
      if (score > highScore) {
        setHighScore(score);
        try {
          await AsyncStorage.setItem('highScore', score.toString());
        } catch (error) {
          console.error('Error saving high score:', error);
        }
      }
    };
    updateHighScore();
  }, [score]);

  // Function to check if a position is valid (not in a wall)
  const isValidPosition = (x: number, y: number) => {
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    // Check if position is within maze bounds
    if (col < 0 || col >= maze.size || row < 0 || row >= maze.size) {
      return false;
    }
    // Check if position is in a wall cell
    if (maze.walls.some(w => w.row === row && w.col === col)) {
      return false;
    }
    return true;
  };

  // Function to generate a new maze
  const generateNewMaze = () => {
    const newLevel = level + 1;
    const newMaze = generateMaze(newLevel);
    setMaze(newMaze);
    setLevel(newLevel);
    setPosition({ x: cellSize / 2, y: cellSize / 2 });
  };

  useEffect(() => {
    // Load and start sounds when the app starts
    const setupSounds = async () => {
      await soundManager.loadSounds();
      await soundManager.startBackgroundMusic();
    };
    setupSounds();

    // Cleanup sounds when the app unmounts
    return () => {
      soundManager.unloadSounds();
    };
  }, []);

  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          soundManager.playSound('gameOver');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver]);

  useEffect(() => {
    const subscription = Accelerometer.addListener(({ x, y }) => {
      if (gameOver) return;

      let newX = position.x - x * 15;
      let newY = position.y + y * 15;

      // Keep ball within maze bounds with a small margin
      const margin = cellSize / 2;
      newX = Math.max(margin, Math.min(mazeSize - margin, newX));
      newY = Math.max(margin, Math.min(mazeSize - margin, newY));

      // Check if the new position is valid (not in a wall)
      if (isValidPosition(newX, newY)) {
        setPosition({ x: newX, y: newY });
        // Only play move sound if it exists
        try {
          soundManager.playSound('move');
        } catch (error) {
          // Ignore missing sound error
        }

        // Check if ball reached the goal
        const col = Math.floor(newX / cellSize);
        const row = Math.floor(newY / cellSize);
        if (row === maze.size - 1 && col === maze.size - 1) {
          setScore(prev => prev + 100);
          soundManager.playSound('victory');
          generateNewMaze();
        }
      } else {
        // Play collision sound only when trying to move into a wall
        try {
          soundManager.playSound('collision');
        } catch (error) {
          // Ignore missing sound error
        }
      }
    });

    return () => subscription.remove();
  }, [position, maze, gameOver]);

  const toggleMute = () => {
    const newMuteState = soundManager.toggleMute();
    setIsMuted(newMuteState);
  };

  const restartGame = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    const newMaze = generateMaze(1);
    setMaze(newMaze);
    setLevel(1);
    setTimeLeft(60);
    setScore(0);
    setGameOver(false);
    setPosition({ x: cellSize / 2, y: cellSize / 2 });
  };

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e']}
      style={styles.container}
    >
      <Text style={styles.gameTitle}>Red Ball Escape</Text>

      <TouchableOpacity
        style={styles.muteButton}
        onPress={toggleMute}
      >
        <Ionicons
          name={isMuted ? 'volume-mute' : 'volume-high'}
          size={24}
          color="#fff"
        />
      </TouchableOpacity>

      <Animated.View style={[styles.gameContainer, { opacity: fadeAnim }]}>
        <Maze maze={maze} />
        <Ball x={position.x} y={position.y} />
        <View style={styles.goalContainer}>
          <LinearGradient
            colors={['#ffd700', '#ffa500']}
            style={[
              styles.goal,
              {
                width: cellSize,
                height: cellSize,
                position: 'absolute',
                left: cellSize * (maze.size - 1),
                top: cellSize * (maze.size - 1),
              }
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.goalText}>GOAL</Text>
          </LinearGradient>
        </View>
      </Animated.View>

      <View style={styles.bottomContainer}>
        <View style={styles.hudContainer}>
          <View style={styles.hudItem}>
            <Text style={styles.hudLabel}>Level</Text>
            <Text style={styles.hudValue}>{level}</Text>
          </View>
          <View style={styles.hudItem}>
            <Text style={styles.hudLabel}>Time</Text>
            <Text style={[styles.hudValue, timeLeft <= 10 && styles.timeWarning]}>
              {timeLeft}s
            </Text>
          </View>
          <View style={styles.hudItem}>
            <Text style={styles.hudLabel}>Score</Text>
            <Text style={styles.hudValue}>{score}</Text>
          </View>
        </View>
        <View style={styles.highScoreContainer}>
          <Text style={styles.highScoreLabel}>High Score</Text>
          <Text style={styles.highScoreValue}>{highScore}</Text>
        </View>
      </View>

      {gameOver && <GameOver onRestart={restartGame} score={score} highScore={highScore} />}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a2e',
  },
  gameTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    alignSelf: 'center',
  },
  muteButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  gameContainer: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  hudContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 10,
  },
  hudItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 10,
    minWidth: 80,
  },
  hudLabel: {
    color: '#8f8f8f',
    fontSize: 14,
    marginBottom: 4,
  },
  hudValue: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  timeWarning: {
    color: '#ff4444',
  },
  highScoreContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  highScoreLabel: {
    color: '#8f8f8f',
    fontSize: 14,
    marginBottom: 4,
  },
  highScoreValue: {
    color: '#ffd700',
    fontSize: 24,
    fontWeight: 'bold',
  },
  goalContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goal: {
    width: 60,
    height: 60,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  goalText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

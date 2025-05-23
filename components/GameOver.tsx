import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  onRestart: () => void;
}

const GameOver: React.FC<Props> = ({ onRestart }) => (
  <View style={styles.overlay}>
    <Text style={styles.title}>Game Over</Text>
    <TouchableOpacity style={styles.button} onPress={onRestart}>
      <Text style={styles.buttonText}>Restart</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 42, color: '#fff', marginBottom: 20 },
  button: { backgroundColor: '#e91e63', padding: 16, borderRadius: 20 },
  buttonText: { color: 'white', fontSize: 18 },
});

export default GameOver;

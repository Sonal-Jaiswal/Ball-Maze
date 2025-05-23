import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  level: number;
  onNextLevel: () => void;
}

const Victory: React.FC<Props> = ({ level, onNextLevel }) => (
  <View style={styles.overlay}>
    <Text style={styles.title}>Level {level} Complete!</Text>
    <TouchableOpacity style={styles.button} onPress={onNextLevel}>
      <Text style={styles.buttonText}>Next Level</Text>
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
  button: { backgroundColor: '#4caf50', padding: 16, borderRadius: 20 },
  buttonText: { color: 'white', fontSize: 18 },
});

export default Victory;

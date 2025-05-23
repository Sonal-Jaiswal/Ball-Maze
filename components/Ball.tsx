import React from 'react';
import { View, StyleSheet } from 'react-native';

interface BallProps {
  x: number;
  y: number;
  size?: number;
}

const Ball: React.FC<BallProps> = ({ x, y, size = 30 }) => {
  return (
    <View
      style={[
        styles.ball,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          position: 'absolute',
          left: x - size / 2,
          top: y - size / 2,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  ball: {
    backgroundColor: 'red',
  },
});

export default Ball;

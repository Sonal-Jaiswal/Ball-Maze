// utils/useSound.ts
import { Audio } from 'expo-av';

export const playSound = async (soundFile: number) => {
  const { sound } = await Audio.Sound.createAsync(soundFile);
  await sound.playAsync();
  setTimeout(() => sound.unloadAsync(), 2000);
};

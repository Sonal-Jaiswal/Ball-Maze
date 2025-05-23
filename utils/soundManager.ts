import { Audio } from 'expo-av';

class SoundManager {
  private static instance: SoundManager;
  private sounds: { [key: string]: Audio.Sound } = {};
  private backgroundMusic: Audio.Sound | null = null;
  private isMuted: boolean = false;

  private constructor() {}

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  async loadSounds() {
    try {
      // Only load sounds that exist
      const soundsToLoad: { [key: string]: any } = {};
      
      try {
        soundsToLoad.victory = require('../assets/sounds/victory.mp3');
      } catch (e) {
        console.warn('Victory sound not found');
      }
      
      try {
        soundsToLoad.gameOver = require('../assets/sounds/gameover.mp3');
      } catch (e) {
        console.warn('Game over sound not found');
      }

      for (const [key, source] of Object.entries(soundsToLoad)) {
        try {
          const { sound } = await Audio.Sound.createAsync(source);
          this.sounds[key] = sound;
        } catch (error) {
          console.warn(`Failed to load sound ${key}:`, error);
        }
      }
    } catch (error) {
      console.error('Error loading sounds:', error);
    }
  }

  async playSound(soundName: string) {
    if (this.isMuted) return;

    try {
      const sound = this.sounds[soundName];
      if (sound) {
        await sound.replayAsync();
      }
    } catch (error) {
      console.warn(`Error playing sound ${soundName}:`, error);
    }
  }

  async startBackgroundMusic() {
    if (this.isMuted) return;

    try {
      const sound = this.sounds.background;
      if (sound) {
        await sound.playAsync();
        this.backgroundMusic = sound;
      }
    } catch (error) {
      console.error('Error playing background music:', error);
    }
  }

  async stopBackgroundMusic() {
    try {
      if (this.backgroundMusic) {
        await this.backgroundMusic.stopAsync();
      }
    } catch (error) {
      console.error('Error stopping background music:', error);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBackgroundMusic();
    } else {
      this.startBackgroundMusic();
    }
    return this.isMuted;
  }

  async unloadSounds() {
    try {
      for (const sound of Object.values(this.sounds)) {
        await sound.unloadAsync();
      }
      this.sounds = {};
      this.backgroundMusic = null;
    } catch (error) {
      console.error('Error unloading sounds:', error);
    }
  }
}

export default SoundManager.getInstance(); 
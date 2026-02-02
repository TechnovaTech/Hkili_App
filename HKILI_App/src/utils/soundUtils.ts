import { Audio } from 'expo-av';

// Short beep/click sound base64
const DEFAULT_CLICK_SOUND = 'data:audio/mp3;base64,//+MYxAAEaAIEeUAQAgBgNgP/////KQQ/////Lvrg+lcWYHgtjadzsbTq+yREu495tq9c6v/7vt/of7mna9v6/btUnU17Jun9/+MYxCkT26KW+YGBAj9v6vUh+zab//v/96C3/pu6H+pv//r/ycIIP4pcWWTRBBBAMXgNdbRaABQAAABRWKwgjQVX0ECmrb///+MYxBQSM0sWWYI4A++Z/////////////0rOZ3MP//7H44QEgxgdvRVMXHZseL//540B4JAvMPEgaA4/0nHjxLhRgAoAYAgA/+MYxAYIAAJfGYEQAMAJAIAQMAwX936/q/tWtv/2f/+v//6v/+7qTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

let soundObject: Audio.Sound | null = null;

export const playClickSound = async () => {
  try {
    // Unload previous sound if exists to avoid memory leaks or overlapping
    if (soundObject) {
      try {
        await soundObject.unloadAsync();
      } catch (e) {
        // Ignore unload error
      }
    }

    // Create and play sound
    const { sound } = await Audio.Sound.createAsync(
      { uri: DEFAULT_CLICK_SOUND },
      { shouldPlay: true }
    );
    
    soundObject = sound;
    
    // Clean up after playback
    sound.setOnPlaybackStatusUpdate(async (status) => {
      if (status.isLoaded && status.didJustFinish) {
        await sound.unloadAsync();
        soundObject = null;
      }
    });

  } catch (error) {
    console.warn('Failed to play click sound', error);
  }
};

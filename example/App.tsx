import { StatusBar } from 'expo-status-bar';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ImageComparison } from 'react-native-image-comparison';

const PHOTO = 'https://picsum.photos/id/1027/1200/2400';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <ImageComparison
        before={<Image source={{ uri: `${PHOTO}?grayscale` }} style={StyleSheet.absoluteFill} />}
        after={<Image source={{ uri: PHOTO }} style={StyleSheet.absoluteFill} />}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={styles.gradient} />
      <View pointerEvents="box-none" style={styles.overlay}>
        <Text style={styles.title}>Recolor AI</Text>
        <Text style={styles.subtitle}>Bring black-and-white photos back to life.</Text>
        <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
      </View>
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'black',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    experimental_backgroundImage:
      'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.85) 45%, black 70%)',
  },
  overlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 56,
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 36,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 8,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 17,
    textAlign: 'center',
  },
  button: {
    alignSelf: 'stretch',
    marginTop: 32,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: 'black',
    fontSize: 17,
    fontWeight: '600',
  },
});

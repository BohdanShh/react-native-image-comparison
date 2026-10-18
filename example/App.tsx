import { StatusBar } from 'expo-status-bar';
import { Image, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ImageComparison } from 'react-native-image-comparison';

const PHOTO = 'https://picsum.photos/id/1069/1200/2400';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <ImageComparison
        before={
          <View style={StyleSheet.absoluteFill}>
            <Image source={{ uri: `${PHOTO}?grayscale` }} style={StyleSheet.absoluteFill} />
            <Text style={[styles.label, styles.labelBefore]}>Before</Text>
          </View>
        }
        after={
          <View style={StyleSheet.absoluteFill}>
            <Image source={{ uri: PHOTO }} style={StyleSheet.absoluteFill} />
            <Text style={[styles.label, styles.labelAfter]}>After</Text>
          </View>
        }
        style={StyleSheet.absoluteFill}
      />
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'black',
  },
  label: {
    position: 'absolute',
    top: 64,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  labelBefore: {
    left: 16,
  },
  labelAfter: {
    right: 16,
  },
});

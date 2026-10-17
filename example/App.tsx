import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ImageComparison } from 'react-native-image-comparison';

// The same Picsum photo in grayscale and in color.
const PHOTO = 'https://picsum.photos/id/1015/1200/900';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <ImageComparison
        before={{ uri: `${PHOTO}?grayscale` }}
        after={{ uri: PHOTO }}
        style={styles.comparison}
      />
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
  },
  comparison: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
});

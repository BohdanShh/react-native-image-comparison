import { StyleSheet, View } from 'react-native';

export const HANDLE_SIZE = 40;
const LINE_WIDTH = 2;
const ARROW_SIZE = 8;

export function Handle() {
  return (
    <>
      <View style={styles.line} />
      <View style={styles.knob}>
        <View style={[styles.arrow, styles.arrowLeft]} />
        <View style={[styles.arrow, styles.arrowRight]} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  line: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: LINE_WIDTH,
    backgroundColor: 'white',
    boxShadow: '0 0 4px rgba(0, 0, 0, 0.3)',
  },
  knob: {
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    backgroundColor: 'white',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ARROW_SIZE,
  },
  arrow: {
    width: ARROW_SIZE,
    height: ARROW_SIZE,
    borderColor: '#333',
  },
  arrowLeft: {
    borderLeftWidth: LINE_WIDTH,
    borderBottomWidth: LINE_WIDTH,
    transform: [{ rotate: '45deg' }],
  },
  arrowRight: {
    borderRightWidth: LINE_WIDTH,
    borderTopWidth: LINE_WIDTH,
    transform: [{ rotate: '45deg' }],
  },
});

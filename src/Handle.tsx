import { StyleSheet, View } from 'react-native';

import type { Orientation } from './types';

const HANDLE_SIZE = 40;
const LINE_WIDTH = 2;
const ARROW_SIZE = 8;

type HandleProps = {
  orientation: Orientation;
};

export function Handle({ orientation }: HandleProps) {
  return (
    <>
      <View style={[styles.line, lineStyles[orientation]]} />

      <View style={[styles.knob, orientation === 'vertical' && styles.knobVertical]}>
        <View style={[styles.arrow, styles.arrowLeft]} />
        <View style={[styles.arrow, styles.arrowRight]} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  line: {
    position: 'absolute',
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
  knobVertical: {
    transform: [{ rotate: '90deg' }],
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

const lineStyles = StyleSheet.create({
  horizontal: {
    top: 0,
    bottom: 0,
    width: LINE_WIDTH,
  },
  vertical: {
    left: 0,
    right: 0,
    height: LINE_WIDTH,
  },
});

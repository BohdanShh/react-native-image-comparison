import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { HANDLE_SIZE, Handle } from './Handle';
import type { ImageComparisonProps } from './types';

export function ImageComparison({
  before,
  after,
  initialPosition = 0.5,
  style,
  renderHandle,
  onSlidingStart,
  onSlidingEnd,
}: ImageComparisonProps) {
  const width = useSharedValue(0);
  const position = useSharedValue(Math.min(Math.max(initialPosition, 0), 1));

  const onLayout = (event: LayoutChangeEvent) => {
    width.value = event.nativeEvent.layout.width;
  };

  const pan = usePanGesture({
    // Lets a parent vertical ScrollView keep scrolling when the drag is mostly vertical.
    activeOffsetX: [-10, 10],
    failOffsetY: [-10, 10],
    onActivate: () => {
      'worklet';
      if (onSlidingStart) scheduleOnRN(onSlidingStart, position.value);
    },
    onUpdate: (event) => {
      'worklet';
      position.value = Math.min(Math.max(event.x / width.value, 0), 1);
    },
    onDeactivate: () => {
      'worklet';
      if (onSlidingEnd) scheduleOnRN(onSlidingEnd, position.value);
    },
  });

  // Hidden until the first layout, otherwise `after` covers everything for a frame.
  const clipStyle = useAnimatedStyle(() => ({
    opacity: width.value > 0 ? 1 : 0,
    transform: [{ translateX: position.value * width.value }],
  }));
  const counterStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -position.value * width.value }],
  }));
  const handleStyle = useAnimatedStyle(() => ({
    opacity: width.value > 0 ? 1 : 0,
    transform: [{ translateX: position.value * width.value - HANDLE_SIZE / 2 }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <View style={[styles.container, style]} onLayout={onLayout}>
        {before}
        <Animated.View style={[StyleSheet.absoluteFill, styles.clip, clipStyle]}>
          <Animated.View style={[StyleSheet.absoluteFill, counterStyle]}>{after}</Animated.View>
        </Animated.View>
        <Animated.View pointerEvents="none" style={[styles.handle, handleStyle]}>
          {renderHandle ? renderHandle(position) : <Handle />}
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  clip: {
    overflow: 'hidden',
  },
  handle: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: HANDLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

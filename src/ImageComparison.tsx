import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Handle } from './Handle';
import type { ImageComparisonProps } from './types';

const DRAG_OFFSET: [number, number] = [-10, 10];

export function ImageComparison({
  before,
  after,
  orientation = 'horizontal',
  initialPosition = 0.5,
  position: positionProp,
  enabled = true,
  style,
  testID,
  renderHandle,
  onSlidingStart,
  onSlidingEnd,
}: ImageComparisonProps) {
  const vertical = orientation === 'vertical';

  const size = useSharedValue({ width: 0, height: 0 });
  // Derived so changing `orientation` needs no new layout.
  const length = useDerivedValue(() => (vertical ? size.value.height : size.value.width));

  const internalPosition = useSharedValue(Math.min(Math.max(initialPosition, 0), 1));
  const position = positionProp ?? internalPosition;

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;

    size.value = { width, height };
  };

  const translate = (value: number) => {
    'worklet';

    return vertical ? { translateY: value } : { translateX: value };
  };

  const pan = usePanGesture({
    enabled,

    // Lets a parent ScrollView along the other axis keep scrolling.
    activeOffsetX: vertical ? undefined : DRAG_OFFSET,
    activeOffsetY: vertical ? DRAG_OFFSET : undefined,
    failOffsetX: vertical ? DRAG_OFFSET : undefined,
    failOffsetY: vertical ? undefined : DRAG_OFFSET,

    onActivate: () => {
      'worklet';

      if (onSlidingStart) {
        scheduleOnRN(onSlidingStart, position.value);
      }
    },

    onUpdate: (event) => {
      'worklet';

      if (length.value <= 0) {
        return;
      }

      const offset = vertical ? event.y : event.x;

      position.value = Math.min(Math.max(offset / length.value, 0), 1);
    },

    onDeactivate: () => {
      'worklet';

      if (onSlidingEnd) {
        scheduleOnRN(onSlidingEnd, position.value);
      }
    },
  });

  // `before` gets its own clipped layer too, so it never shows through a transparent `after`.
  const beforeClipStyle = useAnimatedStyle(() => ({
    transform: [translate((position.value - 1) * length.value)],
  }));

  const beforeContentStyle = useAnimatedStyle(() => ({
    transform: [translate((1 - position.value) * length.value)],
  }));

  // Hidden until the first layout, otherwise `after` covers everything for a frame.
  const afterClipStyle = useAnimatedStyle(() => ({
    opacity: length.value > 0 ? 1 : 0,
    transform: [translate(position.value * length.value)],
  }));

  const afterContentStyle = useAnimatedStyle(() => ({
    transform: [translate(-position.value * length.value)],
  }));

  // Centered in a full-size layer instead of offset from `left`, which RTL layouts flip.
  const handleStyle = useAnimatedStyle(() => ({
    opacity: length.value > 0 ? 1 : 0,
    transform: [translate((position.value - 0.5) * length.value)],
  }));

  return (
    <GestureDetector gesture={pan}>
      <View style={[styles.container, style]} testID={testID} onLayout={onLayout}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.clip, beforeClipStyle]}>
          <Animated.View style={[StyleSheet.absoluteFill, beforeContentStyle]}>
            {before}
          </Animated.View>
        </Animated.View>

        <Animated.View style={[StyleSheet.absoluteFill, styles.clip, afterClipStyle]}>
          <Animated.View style={[StyleSheet.absoluteFill, afterContentStyle]}>
            {after}
          </Animated.View>
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styles.handle, handleStyle]}
        >
          {renderHandle ? renderHandle(position) : <Handle orientation={orientation} />}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
});

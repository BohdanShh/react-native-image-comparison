import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { HANDLE_SIZE, Handle } from './Handle';
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
  // Container length along the drag axis; derived so changing `orientation` needs no new layout.
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

  // Hidden until the first layout, otherwise `after` covers everything for a frame.
  const clipStyle = useAnimatedStyle(() => ({
    opacity: length.value > 0 ? 1 : 0,
    transform: [translate(position.value * length.value)],
  }));

  const counterStyle = useAnimatedStyle(() => ({
    transform: [translate(-position.value * length.value)],
  }));

  const handleStyle = useAnimatedStyle(() => ({
    opacity: length.value > 0 ? 1 : 0,
    transform: [translate(position.value * length.value - HANDLE_SIZE / 2)],
  }));

  return (
    <GestureDetector gesture={pan}>
      <View style={[styles.container, style]} testID={testID} onLayout={onLayout}>
        {before}

        <Animated.View style={[StyleSheet.absoluteFill, styles.clip, clipStyle]}>
          <Animated.View style={[StyleSheet.absoluteFill, counterStyle]}>{after}</Animated.View>
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[styles.handle, handleStyles[orientation], handleStyle]}
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
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const handleStyles = StyleSheet.create({
  horizontal: {
    top: 0,
    bottom: 0,
    width: HANDLE_SIZE,
  },
  vertical: {
    left: 0,
    right: 0,
    height: HANDLE_SIZE,
  },
});

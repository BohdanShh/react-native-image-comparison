import { useCallback } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useDerivedValue, useSharedValue } from 'react-native-reanimated';

import { Handle } from './Handle';
import type { ImageComparisonProps } from '../types';
import { useDividerPan } from '../hooks/useDividerPan';
import { useLayerStyles } from '../hooks/useLayerStyles';
import { useSliderAccessibility } from '../hooks/useSliderAccessibility';
import { clamp01 } from '../utils/clamp01';

export function ImageComparison({
  before,
  after,
  orientation = 'horizontal',
  initialPosition = 0.5,
  position: positionProp,
  enabled = true,
  style,
  testID,
  accessibilityLabel,
  renderHandle,
  onSlidingStart,
  onSlidingEnd,
}: ImageComparisonProps) {
  const vertical = orientation === 'vertical';

  const size = useSharedValue({ width: 0, height: 0 });
  // Derived so changing `orientation` needs no new layout.
  const length = useDerivedValue(() => (vertical ? size.value.height : size.value.width));

  const internalPosition = useSharedValue(clamp01(initialPosition));
  const position = positionProp ?? internalPosition;

  const accessibility = useSliderAccessibility({
    position,
    initialPosition,
    enabled,
    label: accessibilityLabel,
    onChange: onSlidingEnd,
  });

  const layerStyles = useLayerStyles({ position, length, vertical });

  const { syncValue } = accessibility;

  const handleSlidingEnd = useCallback(
    (value: number) => {
      syncValue(value);
      onSlidingEnd?.(value);
    },
    [syncValue, onSlidingEnd],
  );

  const pan = useDividerPan({
    position,
    length,
    vertical,
    enabled,
    onSlidingStart,
    onSlidingEnd: handleSlidingEnd,
  });

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;

    size.value = { width, height };
  };

  return (
    <GestureDetector gesture={pan}>
      <View
        style={[styles.container, style]}
        testID={testID}
        {...accessibility.props}
        onLayout={onLayout}
      >
        <Animated.View style={[StyleSheet.absoluteFill, styles.clip, layerStyles.beforeClip]}>
          <Animated.View style={[StyleSheet.absoluteFill, layerStyles.beforeContent]}>
            {before}
          </Animated.View>
        </Animated.View>

        <Animated.View style={[StyleSheet.absoluteFill, styles.clip, layerStyles.afterClip]}>
          <Animated.View style={[StyleSheet.absoluteFill, layerStyles.afterContent]}>
            {after}
          </Animated.View>
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styles.handle, layerStyles.handle]}
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

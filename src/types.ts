import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

export type Orientation = 'horizontal' | 'vertical';

export type ImageComparisonProps = {
  /** Content on the left of the divider, or above it when vertical. */
  before: ReactNode;
  /** Content on the right of the divider, or below it when vertical. */
  after: ReactNode;
  /** Direction the divider moves in. Defaults to `'horizontal'`. */
  orientation?: Orientation;
  /** Starting divider position, from 0 (left or top) to 1 (right or bottom). Defaults to 0.5. */
  initialPosition?: number;
  /** Divider position from 0 to 1, to control or read it from outside. Overrides `initialPosition`. */
  position?: SharedValue<number>;
  /** Whether the divider can be moved. Defaults to true. */
  enabled?: boolean;
  /** Style of the container. */
  style?: StyleProp<ViewStyle>;
  /** Used to locate the component in end-to-end tests. */
  testID?: string;
  /** What screen readers announce for the slider, e.g. "Photo before and after retouching". */
  accessibilityLabel?: string;
  /** Custom handle. Receives the divider position from 0 to 1. */
  renderHandle?: (position: SharedValue<number>) => ReactNode;
  /** Called when the user starts dragging, with the divider position. */
  onSlidingStart?: (position: number) => void;
  /** Called when the user stops dragging or moves the divider with a screen reader, with the divider position. */
  onSlidingEnd?: (position: number) => void;
};

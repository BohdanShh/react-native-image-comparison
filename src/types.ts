import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

export type ImageComparisonProps = {
  /** Content on the left of the divider. */
  before: ReactNode;
  /** Content on the right of the divider. */
  after: ReactNode;
  /** Starting divider position, from 0 (left) to 1 (right). Defaults to 0.5. */
  initialPosition?: number;
  /** Style of the container. */
  style?: StyleProp<ViewStyle>;
  /** Custom handle. Receives the divider position from 0 to 1. */
  renderHandle?: (position: SharedValue<number>) => ReactNode;
  /** Called when the user starts dragging, with the divider position. */
  onSlidingStart?: (position: number) => void;
  /** Called when the user stops dragging, with the divider position. */
  onSlidingEnd?: (position: number) => void;
};

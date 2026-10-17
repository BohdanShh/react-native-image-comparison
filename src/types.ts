import type { ImageSourcePropType, StyleProp, ViewStyle } from 'react-native';

export type ImageComparisonProps = {
  /** Shown to the left of the divider. */
  before: ImageSourcePropType;
  /** Shown to the right of the divider. */
  after: ImageSourcePropType;
  /** Sets the size; both images cover it. */
  style?: StyleProp<ViewStyle>;
};

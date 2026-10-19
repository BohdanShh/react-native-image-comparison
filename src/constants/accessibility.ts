import { Platform } from 'react-native';

export const ACCESSIBILITY_STEP = 0.1;

// iOS doesn't give `role="slider"` the adjustable trait; the trait brings its own increment/decrement.
export const SLIDER_PLATFORM_PROPS =
  Platform.OS === 'ios'
    ? ({ accessibilityRole: 'adjustable' } as const)
    : ({
        role: 'slider',
        accessibilityActions: [{ name: 'increment' }, { name: 'decrement' }],
      } as const);

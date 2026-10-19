import { useCallback, useEffect, useState } from 'react';
import type { AccessibilityActionEvent } from 'react-native';
import { withTiming, type SharedValue } from 'react-native-reanimated';

import { ACCESSIBILITY_STEP, SLIDER_PLATFORM_PROPS } from '../constants/accessibility';
import { clamp01 } from '../utils/clamp01';

type Options = {
  position: SharedValue<number>;
  initialPosition: number;
  enabled: boolean;
  label?: string;
  onChange?: (position: number) => void;
};

export function useSliderAccessibility({
  position,
  initialPosition,
  enabled,
  label,
  onChange,
}: Options) {
  // Only what screen readers announce. Synced on discrete events, never per frame.
  const [percent, setPercent] = useState(() => Math.round(clamp01(initialPosition) * 100));

  const syncValue = useCallback((value: number) => setPercent(Math.round(value * 100)), []);

  // Picks up a `position` prop whose value differs from `initialPosition`.
  useEffect(() => syncValue(position.value), [position, syncValue]);

  const onAccessibilityAction = (event: AccessibilityActionEvent) => {
    const { actionName } = event.nativeEvent;

    if (!enabled || (actionName !== 'increment' && actionName !== 'decrement')) {
      return;
    }

    const step = actionName === 'increment' ? ACCESSIBILITY_STEP : -ACCESSIBILITY_STEP;
    // From the announced value, not `position.value`, which may be mid-animation.
    const next = clamp01(percent / 100 + step);

    if (Math.round(next * 100) === percent) {
      return;
    }

    position.value = withTiming(next);
    syncValue(next);
    onChange?.(next);
  };

  const props = {
    accessible: true,
    ...SLIDER_PLATFORM_PROPS,
    'aria-label': label,
    'aria-disabled': !enabled,
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    'aria-valuenow': percent,
    onAccessibilityAction,
  } as const;

  return { props, syncValue };
}

import { useMemo } from 'react';
import { usePanGesture, type PanGestureConfig } from 'react-native-gesture-handler';
import type { SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { PAN_OFFSET } from '../constants/gesture';
import { clamp01 } from '../utils/clamp01';

type Options = {
  position: SharedValue<number>;
  length: SharedValue<number>;
  vertical: boolean;
  enabled: boolean;
  onSlidingStart?: (position: number) => void;
  onSlidingEnd?: (position: number) => void;
};

export function useDividerPan({
  position,
  length,
  vertical,
  enabled,
  onSlidingStart,
  onSlidingEnd,
}: Options) {
  // Memoized: a new config object makes gesture-handler resend it to native and rebuild the handlers.
  const config = useMemo<PanGestureConfig>(
    () => ({
      enabled,

      // Lets a parent ScrollView along the other axis keep scrolling.
      activeOffsetX: vertical ? undefined : PAN_OFFSET,
      activeOffsetY: vertical ? PAN_OFFSET : undefined,
      failOffsetX: vertical ? PAN_OFFSET : undefined,
      failOffsetY: vertical ? undefined : PAN_OFFSET,

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

        position.value = clamp01(offset / length.value);
      },

      onDeactivate: () => {
        'worklet';

        if (onSlidingEnd) {
          scheduleOnRN(onSlidingEnd, position.value);
        }
      },
    }),
    [position, length, vertical, enabled, onSlidingStart, onSlidingEnd],
  );

  return usePanGesture(config);
}

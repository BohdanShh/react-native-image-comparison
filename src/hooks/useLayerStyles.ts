import { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

type Options = {
  position: SharedValue<number>;
  length: SharedValue<number>;
  vertical: boolean;
};

// Module-level: a function created per render would restart every animated style on each render.
const translate = (value: number, vertical: boolean) => {
  'worklet';

  return vertical ? { translateY: value } : { translateX: value };
};

export function useLayerStyles({ position, length, vertical }: Options) {
  // `before` gets its own clipped layer too, so it never shows through a transparent `after`.
  const beforeClip = useAnimatedStyle(() => ({
    transform: [translate((position.value - 1) * length.value, vertical)],
  }));

  const beforeContent = useAnimatedStyle(() => ({
    transform: [translate((1 - position.value) * length.value, vertical)],
  }));

  // Hidden until the first layout, otherwise `after` covers everything for a frame.
  const afterClip = useAnimatedStyle(() => ({
    opacity: length.value > 0 ? 1 : 0,
    transform: [translate(position.value * length.value, vertical)],
  }));

  const afterContent = useAnimatedStyle(() => ({
    transform: [translate(-position.value * length.value, vertical)],
  }));

  // Centered in a full-size layer instead of offset from `left`, which RTL layouts flip.
  const handle = useAnimatedStyle(() => ({
    opacity: length.value > 0 ? 1 : 0,
    transform: [translate((position.value - 0.5) * length.value, vertical)],
  }));

  return { beforeClip, beforeContent, afterClip, afterContent, handle };
}

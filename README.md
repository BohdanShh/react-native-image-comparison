# react-native-image-comparison

Before/after image comparison slider for React Native. Drag the divider to compare two images, or any two views, side by side.

## Installation

Works with both Expo and React Native CLI apps on the New Architecture. The library itself is pure JS; it needs these peer dependencies:

- `react-native-reanimated` >= 4.1
- `react-native-worklets` >= 0.5
- `react-native-gesture-handler` >= 3.0

First install and set up the peer dependencies by following their official guides:

- [Reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started)
- [Worklets](https://docs.swmansion.com/react-native-worklets/docs/fundamentals/getting-started)
- [Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation)

Then install the library:

```sh
# Expo
npx expo install react-native-image-comparison

# React Native CLI
npm install react-native-image-comparison
```

## Usage

```tsx
import { Image, StyleSheet } from 'react-native';
import { ImageComparison } from 'react-native-image-comparison';

export function Example() {
  return (
    <ImageComparison
      before={<Image source={require('./before.jpg')} style={StyleSheet.absoluteFill} />}
      after={<Image source={require('./after.jpg')} style={StyleSheet.absoluteFill} />}
      style={{ width: '100%', aspectRatio: 4 / 3 }}
    />
  );
}
```

`before` and `after` can be any views and are rendered as is, so give them a size, usually `StyleSheet.absoluteFill`.

### Custom handle

`renderHandle` replaces the default handle and receives the divider position, so the handle can animate with it. This one fades out near the edges:

```tsx
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

function Handle({ position }: { position: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(position.value, [0, 0.1, 0.9, 1], [0, 1, 1, 0]),
  }));

  return <Animated.View style={[{ width: 4, height: '100%', backgroundColor: 'white' }, style]} />;
}

<ImageComparison
  before={before}
  after={after}
  renderHandle={(position) => <Handle position={position} />}
/>;
```

### Controlled position

Pass your own shared value to move the divider from code or read its position:

```tsx
import { Button } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';

export function Example() {
  const position = useSharedValue(0.5);

  return (
    <>
      <ImageComparison before={before} after={after} position={position} />
      <Button title="Show after" onPress={() => (position.value = withTiming(0))} />
    </>
  );
}
```

## API

| Prop              | Type                                           | Default  | Description                                                                                    |
| ----------------- | ---------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| `before`          | `ReactNode`                                    | required | Content on the left of the divider.                                                            |
| `after`           | `ReactNode`                                    | required | Content on the right of the divider.                                                           |
| `initialPosition` | `number`                                       | `0.5`    | Starting divider position, from 0 (left) to 1 (right).                                         |
| `position`        | `SharedValue<number>`                          |          | Divider position from 0 to 1, to control or read it from outside. Overrides `initialPosition`. |
| `enabled`         | `boolean`                                      | `true`   | Whether the divider can be moved.                                                              |
| `style`           | `StyleProp<ViewStyle>`                         |          | Style of the container.                                                                        |
| `testID`          | `string`                                       |          | Used to locate the component in end-to-end tests.                                              |
| `renderHandle`    | `(position: SharedValue<number>) => ReactNode` |          | Custom handle. Receives the divider position from 0 to 1.                                      |
| `onSlidingStart`  | `(position: number) => void`                   |          | Called when the user starts dragging, with the divider position.                               |
| `onSlidingEnd`    | `(position: number) => void`                   |          | Called when the user stops dragging, with the divider position.                                |

## License

MIT

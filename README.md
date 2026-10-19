<div align="center">

# react-native-image-comparison

A tiny, smooth, customizable before/after slider for React Native.

[![npm](https://img.shields.io/npm/v/react-native-image-comparison)](https://www.npmjs.com/package/react-native-image-comparison)
[![CI](https://img.shields.io/github/actions/workflow/status/BohdanShh/react-native-image-comparison/ci.yml?branch=main&label=CI)](https://github.com/BohdanShh/react-native-image-comparison/actions/workflows/ci.yml)
[![bundle size](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fdeno.bundlejs.com%2F%3Fq%3Dreact-native-image-comparison%26config%3D%257B%2522esbuild%2522%253A%257B%2522external%2522%253A%255B%2522react%2522%252C%2522react-native%2522%252C%2522react-native-reanimated%2522%252C%2522react-native-worklets%2522%252C%2522react-native-gesture-handler%2522%255D%257D%257D&query=%24.size.compressedSize&label=bundle%20size)](https://bundlejs.com/?q=react-native-image-comparison&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22react%22%2C%22react-native%22%2C%22react-native-reanimated%22%2C%22react-native-worklets%22%2C%22react-native-gesture-handler%22%5D%7D%7D)

Compare two images or any two views with a draggable divider.

<img src="assets/demo.gif" width="300" alt="Dragging the divider reveals a color photo of a jellyfish over its grayscale version" />

</div>

## Why this one

- **Smooth UI-thread animations.** The gesture and every frame run on the UI thread with Reanimated worklets, animating transforms only. While you drag, nothing crosses to JS.
- **Tiny and dependency-free.** Pure JavaScript, no native code.
- **iOS, Android and Web.** The same component and API on all three.
- **Compare any two React views.** `before` and `after` are plain React nodes: images, videos, maps, whole screens.
- **Accessible.** Screen readers announce it as a slider with its position in percent, and VoiceOver and TalkBack can move the divider.
- **Controlled position with SharedValue.** Drive the divider from code, or read where the user left it.
- **Customizable handle.** Render your own and animate it in sync with the divider.
- **Horizontal and vertical orientations.** Switch with a single prop.
- **ScrollView gesture compatibility.** Dragging along one axis keeps a parent ScrollView on the other axis scrolling.
- **RTL support.** The handle stays on the divider in right-to-left layouts.

## Installation

Works with Expo and React Native CLI apps on the New Architecture, and on the web through [React Native Web](https://necolas.github.io/react-native-web/). Runs in Expo Go on Expo SDK 58 and later. On SDK 57 and earlier, Expo Go bundles Gesture Handler 2, so use a [development build](https://docs.expo.dev/develop/development-builds/introduction/) instead.

Peer dependencies:

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

For `orientation="vertical"`, draw a horizontal line instead.

### Controlled position

Pass your own shared value to move the divider from code or read its position. `0` puts the divider at the left (or top) edge and reveals all of `after`, `1` puts it at the right (or bottom) edge and reveals all of `before`:

```tsx
import { Button } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';

export function Example() {
  const position = useSharedValue(0.5);

  return (
    <>
      <ImageComparison before={before} after={after} position={position} />
      <Button title="Show after" onPress={() => (position.value = withTiming(0))} />
      <Button title="Show before" onPress={() => (position.value = withTiming(1))} />
    </>
  );
}
```

### Sliding events

`onSlidingStart` and `onSlidingEnd` fire when the user starts and stops dragging, with the divider position from 0 to 1. `onSlidingEnd` also fires when a screen reader moves the divider:

```tsx
<ImageComparison
  before={before}
  after={after}
  onSlidingStart={(position) => console.log('Started at', position)}
  onSlidingEnd={(position) => console.log('Ended at', position)}
/>
```

## API

| Prop                 | Type                                           | Default        | Description                                                                                               |
| -------------------- | ---------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------- |
| `before`             | `ReactNode`                                    | required       | Content on the left of the divider, or above it when vertical.                                            |
| `after`              | `ReactNode`                                    | required       | Content on the right of the divider, or below it when vertical.                                           |
| `orientation`        | `'horizontal' \| 'vertical'`                   | `'horizontal'` | Direction the divider moves in.                                                                           |
| `initialPosition`    | `number`                                       | `0.5`          | Starting divider position, from 0 (left or top) to 1 (right or bottom).                                   |
| `position`           | `SharedValue<number>`                          |                | Divider position from 0 to 1, to control or read it from outside. Overrides `initialPosition`.            |
| `enabled`            | `boolean`                                      | `true`         | Whether the divider can be moved.                                                                         |
| `style`              | `StyleProp<ViewStyle>`                         |                | Style of the container.                                                                                   |
| `testID`             | `string`                                       |                | Used to locate the component in end-to-end tests.                                                         |
| `accessibilityLabel` | `string`                                       |                | What screen readers announce for the slider, e.g. "Photo before and after retouching".                    |
| `renderHandle`       | `(position: SharedValue<number>) => ReactNode` |                | Custom handle. Receives the divider position from 0 to 1.                                                 |
| `onSlidingStart`     | `(position: number) => void`                   |                | Called when the user starts dragging, with the divider position.                                          |
| `onSlidingEnd`       | `(position: number) => void`                   |                | Called when the user stops dragging or moves the divider with a screen reader, with the divider position. |

## License

MIT

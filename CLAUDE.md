# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`react-native-image-comparison` — a before/after image comparison slider for React Native. Pure JS/TS library, no native code; targets the New Architecture. Animations/gestures come from peer dependencies: `react-native-reanimated` >= 4.1, `react-native-worklets` >= 0.5, `react-native-gesture-handler` >= 3.0 (keep `package.json` peer ranges in sync with README).

Goals, in priority order when they conflict: **few bugs** (one gesture, no overlays, no async beyond image loading), **60 fps on low-end Android release builds**, **clean architecture**.

## Commands

Package manager is **Bun** (both root and `example/`); don't use npm/yarn or create `package-lock.json`.

```sh
bun run build          # clean lib/, then tsc → lib/
bun run format         # prettier --write .
bun run format:check   # prettier --check .
cd example && bunx tsc --noEmit         # typecheck the example
cd example && bunx expo run:ios         # build + run the example (needed after native dep changes)
cd example && bunx expo start -c        # Metro only; open the already-installed app manually
cd example && bunx expo start --web     # run the example in the browser (react-native-web)
cd example && bunx expo install <pkg>   # add deps to example with SDK-matched versions (not for gesture-handler: it would downgrade it to 2.x)
```

There are no tests and no linter yet. Prettier config is `.prettierrc` (single quotes, trailing commas, width 100); there is intentionally no `.prettierignore` — Prettier 3 uses `.gitignore`.

## After changing the library

The example consumes the library as a packed tarball, exactly like a published package — it is **not** a workspace and has **no Metro config / tsconfig paths** to `../src`. Rebuild and reinstall every time (without being asked):

```sh
bun run build
bun pm pack --destination example
cd example && bun remove react-native-image-comparison && bun add ./react-native-image-comparison-$(node -p "require('../package.json').version").tgz
```

`bun remove` first is required: re-adding a repacked tarball with the same version (even with `--force`) keeps the old contents because `example/bun.lock` pins the old integrity hash. Verify the new code landed in `example/node_modules/react-native-image-comparison`. `*.tgz` is gitignored. The tarball name carries the version (hence the `node -p`, same as CI); `example/package.json` pins that filename, so bumping `version` changes it there too.

`tsc` passing is not enough: the Worklets Babel plugin only runs in Metro and rejects some valid TS (e.g. `...spread` inside a `usePanGesture({...})` config). After reinstalling, typecheck the example and bundle it for every platform, confirming "iOS Bundled", "Android Bundled" and "Web Bundled":

```sh
cd example && bunx expo export --platform ios --output-dir <tmp-dir> --clear
cd example && bunx expo export --platform android --output-dir <tmp-dir> --clear
cd example && bunx expo export --platform web --output-dir <tmp-dir> --clear
```

CI (`.github/workflows/ci.yml`) runs exactly this pipeline on every PR: `format:check` → build → pack → reinstall into example → example `tsc --noEmit` → iOS/Android/web bundles. Keep its job id `check`: the `main` ruleset requires that status.

Bun auto-installs peer dependencies into the root `node_modules` too; the example must only ever use its own copies of react / react-native / reanimated.

## Layout

- `src/` — library source (entry `src/index.ts`), compiled by plain `tsc` to `lib/` (`main`/`types` point there). No bundler, no builder-bob. TypeScript `strict`, no `any` / `@ts-ignore`, named exports. Comment only what isn't obvious from the code; don't comment everything. Files are grouped by kind: `src/components/` — `ImageComparison.tsx` (wires layout, position and the hooks together), `Handle.tsx` (default handle); `src/hooks/` — one hook per concern: `useDividerPan.ts` (pan gesture), `useLayerStyles.ts` (animated layer styles), `useSliderAccessibility.ts` (screen reader props and actions); `src/utils/` — pure worklet functions, one per file named after it (`clamp01.ts`); `src/constants/` — one file per concern (`gesture.ts`, `accessibility.ts`); and directly in `src/` — `index.ts` (public exports), `types.ts`. Add more files only when there's something to put there. No re-export-only `index.ts` files in the folders (import from each file directly); what's public is decided only by `src/index.ts`.
- `example/` — standalone Expo app (SDK 57) with its own `package.json` and `bun.lock`. Runs as a native debug build via `expo run:*` (or in the browser via `expo start --web`), not Expo Go (Expo Go bundles gesture-handler 2.x; the library needs 3.x). `ios/` and `android/` are generated from `app.json` and gitignored. It must only use the library's public API. Its `package.json` enables Reanimated's `IOS_SYNCHRONOUSLY_UPDATE_UI_PROPS` / `ANDROID_SYNCHRONOUSLY_UPDATE_UI_PROPS` static flags; changing them needs a native rebuild. Judge smoothness only on release builds (`--configuration Release` / `--variant release`).

Per-frame work stays on the UI thread (gesture worklets, shared values, worklet math); cross to JS only on discrete events, never in `onUpdate`. Animate transforms/opacity only — clip the "after" image with an `overflow: hidden` container and counter-translated content, never by animating `width`.

Keep identities stable across renders: the `usePanGesture` config is `useMemo`'d (a new object makes gesture-handler resend it to native and rebuild the handlers), and worklet helpers used inside `useAnimatedStyle` live at module level (a function created per render restarts every animated style). Callbacks passed into the pan go through `useCallback` for the same reason.

## How the slider works

`components/ImageComparison.tsx` stacks three absolute-fill layers inside one `GestureDetector` (pan): `before` clip layer, `after` clip layer, handle layer (`pointerEvents="none"`). The divider position is a normalized 0–1 `SharedValue` (the `position` prop if passed, otherwise internal); pixels come from `length` = width or height of the measured container depending on `orientation`. Every layer is positioned purely by `translateX/Y` of `position * length`:

- Both `before` and `after` are clipped (outer view translated, inner content counter-translated) so `before` never shows through a transparent `after`.
- The handle is centered in a full-size layer and offset by `(position - 0.5) * length`, not positioned via `left`, so RTL layouts don't flip it.
- `after` and the handle stay `opacity: 0` until the first layout (`length > 0`), to avoid a one-frame flash.
- Pan `activeOffset`/`failOffset` are set per axis so a parent ScrollView on the other axis keeps scrolling.
- `length` is a `useDerivedValue` over the measured `{ width, height }`, so switching `orientation` needs no new layout.
- `onSlidingStart`/`onSlidingEnd` are the only JS crossings, via `scheduleOnRN` in the pan's `onActivate`/`onDeactivate`; `onDeactivate` also syncs the one piece of React state, the percent announced to screen readers.
- Accessibility: the container is `role="slider"` with `aria-*` (not `accessibility*`, which react-native-web ignores), except on iOS, where it is `accessibilityRole="adjustable"` because Fabric doesn't map `role="slider"` to the adjustable trait (VoiceOver swipes wouldn't adjust it); the trait already provides increment/decrement there, so `accessibilityActions` is only passed on other platforms (listing them on iOS duplicates them). `increment`/`decrement` actions step from the announced percent (not the possibly mid-animation `position`), move `position` with `withTiming` and call `onSlidingEnd`; these actions are native-only.

Props live in `types.ts`; the README API table mirrors them — update both together.

## Git

- Don't commit or push unless explicitly asked.
- `main` is protected by a ruleset with no bypass: no direct pushes, force pushes or deletion. Every change goes through a branch and a pull request (no approvals required, so it can be merged right away).
- Conventional Commits: `type(scope)?: lowercase imperative summary` — `feat`, `fix`, `perf`, `refactor`, `docs`, `chore`, `build`, `test`; use `(example)` scope for example-only changes.
- `.vscode/` is local-only (gitignored); never commit it.

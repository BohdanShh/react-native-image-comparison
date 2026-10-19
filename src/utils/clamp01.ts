export const clamp01 = (value: number) => {
  'worklet';

  return Math.min(Math.max(value, 0), 1);
};

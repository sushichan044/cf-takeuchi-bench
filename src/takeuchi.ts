export const takeuchi = (x: number, y: number, z: number): number => {
  if (x <= y) {
    return y;
  }
  return takeuchi(
    takeuchi(x - 1, y, z),
    takeuchi(y - 1, z, x),
    takeuchi(z - 1, x, y),
  );
};

export function takeuchi(x, y, z) {
  if (x <= y) return z;
  return takeuchi(
    takeuchi(x - 1, y, z),
    takeuchi(y - 1, z, x),
    takeuchi(z - 1, x, y),
  );
}

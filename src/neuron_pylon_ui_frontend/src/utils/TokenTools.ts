export const e8sToIcp = (x: number): number => {
  if (!x) return 0;
  return x / Math.pow(10, 8);
};

export const icpToE8s = (x: number): bigint => {
  try {
    return BigInt(Math.round(x * 100000000));
  } catch (e) {
    return 0n;
  }
};

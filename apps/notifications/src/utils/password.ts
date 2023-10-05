export function generatePassword() {
  const minm = 0;
  const maxm = 9;

  return new Array(6)
    .fill(0)
    .map(() =>
      (Math.floor(Math.random() * (maxm - minm + 1)) + minm).toString(),
    )
    .join('');
}

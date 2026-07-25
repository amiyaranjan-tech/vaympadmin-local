// Alpha sizes don't sort correctly as plain strings ("3XL" < "L" < "XL"
// alphabetically) — rank known ladder sizes explicitly, fall back to
// numeric compare for waist/shoe sizes, then locale compare for the rest
// (band+cup, "One Size", etc).
const SIZE_ORDER = [
  "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL",
];

export const compareSizes = (a: string, b: string) => {
  const ai = SIZE_ORDER.indexOf(a);
  const bi = SIZE_ORDER.indexOf(b);

  if (ai !== -1 || bi !== -1) {
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  }

  const an = Number(a);
  const bn = Number(b);

  if (!Number.isNaN(an) && !Number.isNaN(bn)) return an - bn;

  return a.localeCompare(b);
};

export const sortSizes = (values: string[]) => [...values].sort(compareSizes);

const transformPostalCode = (postalCode: string | null) => {
  if (!postalCode) {
    return "";
  }
  const cleaned = postalCode.replace(/\s+/g, "").toUpperCase();
  if (cleaned.length >= 6) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  }
  return cleaned;
};

const validatePostalCode = (postalCode: string | null) => {
  if (!postalCode) {
    return false;
  }

  const cleaned = postalCode
    .replace(/\u00A0/g, " ")
    .trim()
    .toUpperCase();

  const postalCodeRegex = /^[ABCEGHJ-NPRSTVXY]\d[A-Z][ -]?\d[A-Z]\d$/;

  if (!postalCodeRegex.test(cleaned)) {
    return false;
  }

  return true;
};

export { transformPostalCode, validatePostalCode };

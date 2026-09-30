const escapeHtml = (value) => value
  .trim()
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#x27;');

// Preserve JSON structures such as authors: [{ name, email, ... }].
// Sanitizing body('*') directly coerces nested objects and arrays, which can
// cause their fields to be lost before a controller receives the request.
const sanitizeValue = (value) => {
  if (typeof value === 'string') return escapeHtml(value);
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, sanitizeValue(item)]));
  }
  return value;
};

export const sanitizeMiddleware = [
  (req, _res, next) => {
    if (req.body && typeof req.body === 'object') req.body = sanitizeValue(req.body);
    next();
  }
];

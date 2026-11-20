const knownInsecureSecrets = new Set([
  'evora_jwt_secret_dev_super_safe_key_2026',
]);

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32 || knownInsecureSecrets.has(secret)) {
    throw new Error('Set JWT_SECRET to a unique random value with at least 32 characters.');
  }
  return secret;
}

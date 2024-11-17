import crypto from 'crypto';

export const generateRandomCharacters = async (size = 20) => {
  const randomBytes = await Promise.resolve(crypto.randomBytes(size));
  const randomCharacters = randomBytes.toString('hex');
  return randomCharacters;
};

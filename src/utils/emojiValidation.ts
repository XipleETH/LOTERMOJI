import { EMOJI_CATEGORIES } from './emojiData';

// Create a set of all valid emojis for quick lookup
const validEmojis = new Set(
  Object.values(EMOJI_CATEGORIES)
    .flatMap(category => category.emojis)
);

export const validateEmojis = (emojis: string[]): string[] => {
  if (!Array.isArray(emojis)) return [];
  return emojis.filter(emoji => validEmojis.has(emoji));
};
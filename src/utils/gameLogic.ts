import { EMOJIS } from './emojiData';

export const mapNumberToEmoji = (number: number): string => {
  return EMOJIS[number % EMOJIS.length];
};

export const mapEmojiToNumber = (emoji: string): number => {
  return EMOJIS.indexOf(emoji);
};

export const convertNumbersToEmojis = (numbers: number[]): string[] => {
  return numbers.map(mapNumberToEmoji);
};

export const convertEmojisToNumbers = (emojis: string[]): number[] => {
  return emojis.map(mapEmojiToNumber);
};

export const checkWin = (ticket: string[], winning: string[]): {
  firstPrize: boolean;
  secondPrize: boolean;
  thirdPrize: boolean;
} => {
  const exactMatch = (a: string[], b: string[]) => 
    a.length === b.length && a.every((v, i) => v === b[i]);
  
  const containsAll = (a: string[], b: string[]) => 
    b.every(v => a.includes(v));

  return {
    firstPrize: exactMatch(ticket.slice(0, 4), winning.slice(0, 4)),
    secondPrize: exactMatch(ticket.slice(0, 3), winning.slice(0, 3)),
    thirdPrize: containsAll(ticket, winning.slice(0, 4)) && !exactMatch(ticket.slice(0, 4), winning.slice(0, 4))
  };
};
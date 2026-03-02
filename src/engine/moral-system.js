/**
 * Moral System — Folk/Dragon counter + ending determination
 * Counter is hidden from the player, feedback is through character reactions
 */

/**
 * Determine which ending the player gets
 * @param {number} folkCounter — current folk counter (0-100)
 * @param {string} finalChoice — 'accept' | 'refuse' | 'counter_offer'
 * @returns {'lantern' | 'bridge' | 'chair'}
 */
export function determineEnding(folkCounter, finalChoice) {
  const isHighFolk = folkCounter >= 65;
  const isMidRange = folkCounter >= 36 && folkCounter < 65;
  const isHighDragon = folkCounter < 36;

  switch (finalChoice) {
    case 'accept':
      if (isHighDragon) return 'chair';
      return 'bridge';

    case 'refuse':
      if (isHighDragon) return 'bridge';
      return 'lantern';

    case 'counter_offer':
      if (isHighFolk) return 'lantern';
      return 'bridge';

    default:
      return 'bridge';
  }
}

/**
 * Get ending display name
 * @param {'lantern' | 'bridge' | 'chair'} ending
 * @returns {string}
 */
export function getEndingName(ending) {
  const names = {
    lantern: 'Фонарь',
    bridge: 'Мост',
    chair: 'Кресло',
  };
  return names[ending] || ending;
}

/**
 * Parse feedback tag from Ink
 * @param {string} tag — e.g. "FEEDBACK: folk" or "FEEDBACK: dragon"
 * @returns {'folk' | 'dragon' | null}
 */
export function parseFeedbackTag(tag) {
  const match = tag.match(/^FEEDBACK:\s*(folk|dragon)$/i);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Parse lamp tag from Ink
 * @param {string} tag — e.g. "LAMP: steady" or "LAMP: bright" or "LAMP: flicker"
 * @returns {'steady' | 'bright' | 'flicker' | null}
 */
export function parseLampTag(tag) {
  const match = tag.match(/^LAMP:\s*(steady|bright|flicker)$/i);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Parse ending tag from Ink
 * @param {string} tag — e.g. "ENDING: lantern" or "ENDING: bridge" or "ENDING: chair"
 * @returns {'lantern' | 'bridge' | 'chair' | null}
 */
export function parseEndingTag(tag) {
  const match = tag.match(/^ENDING:\s*(lantern|bridge|chair)$/i);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Parse audio tag from Ink
 * @param {string} tag — e.g. "AUDIO: act1-dark" or "AUDIO: stop"
 * @returns {string|null} — track name or 'stop', or null if not an audio tag
 */
export function parseAudioTag(tag) {
  const match = tag.match(/^AUDIO:\s*([\w-]+)$/i);
  return match ? match[1].toLowerCase() : null;
}

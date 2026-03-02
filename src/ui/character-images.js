/**
 * Character illustration mappings for sidebar display
 */

export const CHARACTER_IMAGES = {
  'arni': { src: '/images/char-arni.webp', alt: 'Арни на набережной Сетубала' },
  'alice': { src: '/images/char-alice.webp', alt: 'Алиса с блокнотом' },
  'gonzo': { src: '/images/char-gonzo.webp', alt: 'КиберГонзо в капюшоне' },
  'dan': { src: '/images/char-dan.webp', alt: 'Дэн с гитарой' },
  'breus-young': { src: '/images/char-breus-young.webp', alt: 'Молодой Бреус' },
  'breus': { src: '/images/char-breus.webp', alt: 'Бреус в дорогой куртке' },
  'arni-mirror': { src: '/images/char-arni-mirror.webp', alt: 'Отражение Арни в зеркале' },
  'comandante': { src: '/images/char-comandante.webp', alt: 'Команданте' },
  'team': { src: '/images/char-team.webp', alt: 'Силуэты команды FolkUp' },
  'chair': { src: '/images/char-chair.webp', alt: 'Пустое кожаное кресло' },
};

/** Scene → character fallback (when no CHARACTER: tag) */
export const SCENE_CHARACTER_MAP = {
  'epigraph': null,
  'shore': 'arni',
  'flashback_stick': 'arni',
  'library': 'arni',
  'barnes_alice': 'alice',
  'cogumelos_gonzo': 'gonzo',
  'retrotech_dan': 'dan',
  'flashback_young_breus': 'breus-young',
  'breus_proposal': 'breus',
  'silence_after': 'arni',
  'mirror_zone': 'arni-mirror',
  'final_choice': 'comandante',
  'ending': null,
  'credits': null,
};

/** Ending → character map */
export const ENDING_CHARACTER_MAP = {
  'lantern': 'team',
  'bridge': 'team',
  'chair': 'chair',
};

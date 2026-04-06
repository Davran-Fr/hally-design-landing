import type { Slide, CardItem } from './types';

export const RADIUS     = 300;
export const CARD_W     = 380;
export const CARD_H     = 270;
export const TILT_X     = -8;
export const CARD_COUNT = 5;

export const SLIDES: Slide[] = [
  {
    word: 'Design',
    text: 'We curate art, shape environments, and command light — three disciplines united by a single belief that every space has the power to leave a lasting impression.',
    images: [
      '/images/design2.jpg',
      '/images/design3.jpg',
      '/images/design4.jpg',
      '/images/design5.jpg',
      '/images/design2.jpg',
    ],
  },
  {
    word: 'Art Gallery',
    text: 'We collect and present works that challenge perception, provoke emotion, and transform ordinary walls into windows of meaning.',
    images: [
      '/images/gallery.jpg',
      '/images/gallery2.jpg',
      '/images/gallery3.jpg',
      '/images/gallery.jpg',
      '/images/gallery2.jpg',
    ],
  },
  {
    word: 'Lighting',
    text: 'We engineer light as a material — sculpting atmosphere, guiding focus, and turning architecture into lived experience.',
    images: [
      '/images/lighting.jpg',
      '/images/lighting2.jpg',
      '/images/lighting3.jpg',
      '/images/lighting.jpg',
      '/images/lighting2.jpg',
    ],
  },
];

export const CARDS: CardItem[] = Array.from({ length: CARD_COUNT }, (_, i) => ({
  angle: i * (360 / CARD_COUNT),
}));

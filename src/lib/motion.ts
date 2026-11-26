import { Transition } from 'framer-motion';

export const SPRING_SMOOTH: Transition = {
  type: 'spring',
  stiffness: 280,
  damping: 28,
  mass: 0.8,
};

export const SPRING_SNAPPY: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 32,
};

export const SPRING_SHEET: Transition = {
  type: 'spring',
  stiffness: 320,
  damping: 34,
};

export const PAGE_TRANSITION = {
  initial: { opacity: 0, y: 10, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8 },
  transition: SPRING_SMOOTH,
};

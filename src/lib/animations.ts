export const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.1 },
  transition: { duration: 0.7, delay, ease: [0.22, 0.61, 0.36, 1] as const },
});

export const staggerChildren = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.1 },
  transition: { duration: 0.6, staggerChildren: 0.07, ease: [0.22, 0.61, 0.36, 1] as const },
};

export const heroFadeIn = {
  initial: { opacity: 0.001, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
};

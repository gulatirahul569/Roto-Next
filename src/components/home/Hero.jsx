"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";

const SLIDE_DURATION = 6000;
const PAUSE_ON_HOVER = false;
const EASE_OUT = [0.22, 1, 0.36, 1];
const EASE_WIPE = [0.76, 0, 0.24, 1];
const WIPE_TIME = 1.1;

/*
  Each slide has 2 small cards (shown on mobile, fills the bottom gap).
  Swap `image` for real product thumbnails whenever you have them.
*/
const slides = [
  {
    id: "mini-kadet",
    image:
      "https://chromeindustries.com/cdn/shop/files/YearMonthDay_HP-MiniKadetReviews-Desktop_1.jpg?v=1777045669&width=2000",
    mobileImage:
      "https://images.pexels.com/photos/37625744/pexels-photo-37625744.jpeg",
    eyebrow: "Top rated for a reason",
    title: "Simple and comfortable.",
    description:
      "The mini sling carries your essentials without the bulk, and sits close to the body all day.",
    buttonText: "Get the mini",
    route: "/category/women",
    align: "left",
    cards: [
      {
        title: "50+ products",
        sub: "Shop women",
        route: "/category/women",
        image:
          "https://images.pexels.com/photos/37625744/pexels-photo-37625744.jpeg",
      },
      {
        title: "New arrivals",
        sub: "Just dropped",
        route: "/category/women",
        image:
          "https://chromeindustries.com/cdn/shop/files/YearMonthDay_HP-MiniKadetReviews-Desktop_1.jpg?v=1777045669&width=2000",
      },
    ],
  },
  {
    id: "everyday-organizers",
    image:
      "https://chromeindustries.com/cdn/shop/files/041526_Rim-homepage-Desktop-V2_1.jpg?v=1776289664&width=2000",
    mobileImage:
      "https://images.pexels.com/photos/21390399/pexels-photo-21390399.jpeg",
    eyebrow: "Everyday organizers",
    title: "Wear it. Stash it.",
    description:
      "Pockets, straps and pouches that keep everything in reach and out of your way.",
    buttonText: "Find your setup",
    route: "/category/men",
    align: "center",
    cards: [
      {
        title: "50+ products",
        sub: "Shop men",
        route: "/category/men",
        image:
          "https://images.pexels.com/photos/21390399/pexels-photo-21390399.jpeg",
      },
      {
        title: "Best sellers",
        sub: "Most loved",
        route: "/category/men",
        image:
          "https://chromeindustries.com/cdn/shop/files/041526_Rim-homepage-Desktop-V2_1.jpg?v=1776289664&width=2000",
      },
    ],
  },
];

/* ---------- Text animation variants ---------- */

const content = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.5 } },
  exit: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
};

const word = {
  hidden: { y: "115%" },
  visible: { y: "0%", transition: { duration: 0.85, ease: EASE_OUT } },
  exit: { y: "-115%", transition: { duration: 0.35, ease: [0.4, 0, 1, 1] } },
};

const soft = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const rule = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.8, ease: EASE_OUT } },
  exit: { scaleX: 0, transition: { duration: 0.2 } },
};

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ready, setReady] = useState(false);

  const reduceMotion = useReducedMotion();
  const progress = useMotionValue(0);
  const pausedRef = useRef(false);

  const currentSlide = slides[currentIndex];
  const isCenter = currentSlide.align === "center";

  /* ---------- Preload images ---------- */

  useEffect(() => {
    let cancelled = false;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    const loads = slides.map(
      (slide) =>
        new Promise((resolve) => {
          const img = new Image();
          img.src = isMobile ? slide.mobileImage : slide.image;
          if (typeof img.decode === "function") {
            img.decode().then(resolve, resolve);
          } else {
            img.onload = resolve;
            img.onerror = resolve;
          }
        })
    );

    const timeout = new Promise((resolve) => setTimeout(resolve, 4000));

    Promise.race([Promise.all(loads), timeout]).then(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------- Autoplay ---------- */

  useAnimationFrame((_, delta) => {
    if (!ready || reduceMotion || pausedRef.current) return;

    const next = progress.get() + Math.min(delta, 50) / SLIDE_DURATION;

    if (next >= 1) {
      progress.set(0);
      setCurrentIndex((index) => (index + 1) % slides.length);
    } else {
      progress.set(next);
    }
  });

  /* ---------- Navigation ---------- */

  const goTo = (index) => {
    progress.set(0);
    setCurrentIndex(index);
  };
  const goNext = () => goTo((currentIndex + 1) % slides.length);
  const goPrev = () => goTo((currentIndex - 1 + slides.length) % slides.length);

  /* ---------- Swipe ---------- */

  const handlePanEnd = (_, info) => {
    if (Math.abs(info.offset.x) < 60) return;
    if (info.offset.x < 0) goNext();
    else goPrev();
  };

  return (
    <motion.section
      className="relative isolate h-[100svh] min-h-[640px] w-full touch-pan-y select-none overflow-hidden bg-zinc-950 sm:h-[700px] sm:min-h-0"
      onPanEnd={handlePanEnd}
      onMouseEnter={PAUSE_ON_HOVER ? () => (pausedRef.current = true) : undefined}
      onMouseLeave={PAUSE_ON_HOVER ? () => (pausedRef.current = false) : undefined}
    >
      {/* ---------- BACKGROUND IMAGE ---------- */}

      <AnimatePresence initial={false}>
        <motion.div
          key={currentSlide.id}
          className="absolute inset-0 overflow-hidden will-change-transform"
          initial={reduceMotion ? { opacity: 0 } : { x: "100%" }}
          animate={reduceMotion ? { opacity: 1 } : { x: "0%" }}
          exit={reduceMotion ? { opacity: 0 } : { x: "-25%" }}
          transition={{ duration: WIPE_TIME, ease: EASE_WIPE }}
        >
          <motion.div
            className="absolute inset-0 will-change-transform"
            initial={reduceMotion ? false : { x: "-100%" }}
            animate={{ x: "0%" }}
            transition={{ duration: WIPE_TIME, ease: EASE_WIPE }}
          >
            <picture className="block size-full">
              <source
                media="(max-width: 768px)"
                srcSet={currentSlide.mobileImage}
              />
              <motion.img
                src={currentSlide.image}
                alt=""
                decoding="async"
                draggable={false}
                initial={reduceMotion ? false : { scale: 1.12 }}
                animate={{ scale: 1 }}
                transition={{
                  duration: SLIDE_DURATION / 1000 + WIPE_TIME,
                  ease: "easeOut",
                }}
                className="size-full object-cover object-center will-change-transform"
              />
            </picture>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* ---------- OVERLAYS ---------- */}

      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 h-[80%] bg-gradient-to-t from-black/85 via-black/40 to-transparent md:hidden" />
      <div className="absolute inset-0 bg-black/5 md:hidden" />

      {/* ---------- CONTENT ---------- */}

      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl items-center px-5 pb-48 pt-16 min-[400px]:pb-52 sm:px-6 sm:pb-24 sm:pt-0 lg:px-8 lg:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            variants={content}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`flex w-full max-w-3xl flex-col text-white ${
              isCenter
                ? "mx-auto items-center text-center"
                : "items-center text-center md:items-start md:text-left"
            }`}
          >
            {/* Eyebrow */}
            <motion.div
              variants={soft}
              className="mb-4 flex items-center gap-2.5 sm:mb-5 sm:gap-3"
            >
              <motion.span
                variants={rule}
                className="block h-px w-7 origin-left bg-white/80 sm:w-10"
              />
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/90 sm:text-[11px] sm:tracking-[0.22em] md:text-xs">
                {currentSlide.eyebrow}
              </span>
            </motion.div>

            {/* Title */}
            <h1
              aria-label={currentSlide.title}
              className={`flex max-w-[320px] flex-wrap justify-center gap-x-[0.22em] text-[clamp(2.1rem,10.5vw,2.9rem)] font-black uppercase leading-[0.94] tracking-[-0.055em] sm:max-w-3xl sm:text-6xl lg:text-8xl ${
                isCenter ? "md:justify-center" : "md:justify-start"
              }`}
            >
              {currentSlide.title.split(" ").map((w, i) => (
                <span
                  key={`${w}-${i}`}
                  aria-hidden="true"
                  className="inline-block overflow-hidden py-[0.06em]"
                >
                  <motion.span
                    variants={word}
                    className="inline-block will-change-transform"
                  >
                    {w}
                  </motion.span>
                </span>
              ))}
            </h1>

            {/* Description */}
            <motion.p
              variants={soft}
              className={`mt-4 max-w-[300px] text-center text-[13px] leading-5 text-white/85 sm:mt-6 sm:max-w-md sm:text-base sm:leading-7 ${
                isCenter ? "md:text-center" : "md:text-left"
              }`}
            >
              {currentSlide.description}
            </motion.p>

            {/* Button */}
            <motion.div variants={soft} className="mt-5 sm:mt-8">
              <Link
                href={currentSlide.route}
                className="group/btn relative inline-flex min-h-[46px] items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-6 py-3 text-sm font-extrabold text-zinc-950 transition-colors duration-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:min-h-0 sm:py-3.5"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 translate-y-full bg-zinc-950 transition-transform duration-500 ease-out group-hover/btn:translate-y-0"
                />
                <span className="relative">{currentSlide.buttonText}</span>
                <FiArrowUpRight
                  size={17}
                  className="relative transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5"
                />
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ---------- MOBILE PRODUCT CARDS (fills bottom gap) ---------- */}

      <div className="absolute inset-x-0 bottom-9 z-20 px-5 sm:hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.7 }}
            className="mx-auto grid max-w-md grid-cols-2 gap-3"
          >
            {currentSlide.cards.map((card) => (
              <Link
                key={card.title}
                href={card.route}
                className="group/card flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/10 p-2 backdrop-blur-md transition-colors duration-300 active:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              >
                <span className="relative block size-12 shrink-0 overflow-hidden rounded-xl bg-white/10">
                  <img
                    src={card.image}
                    alt=""
                    loading="lazy"
                    draggable={false}
                    className="size-full object-cover"
                  />
                </span>

                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block truncate text-[13px] font-extrabold text-white">
                    {card.title}
                  </span>
                  <span className="block truncate text-[11px] text-white/70">
                    {card.sub}
                  </span>
                </span>

                <FiArrowUpRight
                  size={15}
                  className="mr-1 shrink-0 text-white/80"
                />
              </Link>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ---------- PROGRESS NAVIGATION ---------- */}

      <div className="absolute inset-x-0 bottom-0 z-20 mx-auto flex max-w-7xl gap-2.5 px-5 pb-4 sm:gap-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;
          const isDone = index < currentIndex;

          return (
            <button
              key={slide.id}
              type="button"
              aria-label={`Show slide ${index + 1}: ${slide.eyebrow}`}
              aria-current={isActive}
              onClick={() => goTo(index)}
              className="group/tab flex-1 text-left focus-visible:outline-none"
            >
              <span
                className={`mb-2 hidden truncate text-xs font-semibold transition-colors duration-300 sm:block ${
                  isActive
                    ? "text-white"
                    : "text-white/50 group-hover/tab:text-white/80"
                }`}
              >
                {slide.eyebrow}
              </span>

              <span className="relative block h-[3px] overflow-hidden rounded-full bg-white/25 group-focus-visible/tab:ring-2 group-focus-visible/tab:ring-white group-focus-visible/tab:ring-offset-2 group-focus-visible/tab:ring-offset-black/50">
                <motion.span
                  className="absolute inset-0 origin-left bg-white"
                  style={{
                    scaleX: isActive ? progress : isDone ? 1 : 0,
                  }}
                />
              </span>
            </button>
          );
        })}
      </div>
    </motion.section>
  );
}
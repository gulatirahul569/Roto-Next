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

const SLIDE_DURATION = 6000; // ms each slide stays
const PAUSE_ON_HOVER = false; // set true to pause autoplay while hovering
const EASE_OUT = [0.22, 1, 0.36, 1];
const EASE_WIPE = [0.76, 0, 0.24, 1];
const WIPE_TIME = 1.1;

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
    route: "/category/sling",
    align: "left",
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
    route: "/category/bags",
    align: "center",
  },
];

/* ---------- Text animation variants (transform + opacity only) ---------- */

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

  const progress = useMotionValue(0); // 0 → 1 across one slide
  const pausedRef = useRef(false);

  const currentSlide = slides[currentIndex];
  const isCenter = currentSlide.align === "center";

  /* Preload + decode every slide image so transitions never wait on the network.
     A timeout guarantees autoplay still starts if an image is slow or fails. */
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

  /* Autoplay: a frame loop advances `progress` (no React re-renders, no CSS
     animation events to miss). Delta is clamped so a background tab or a
     laggy frame can never make the slider jump. */
  useAnimationFrame((_, delta) => {
    if (!ready || reduceMotion || pausedRef.current) return;

    const next = progress.get() + Math.min(delta, 50) / SLIDE_DURATION;

    if (next >= 1) {
      progress.set(0);
      setCurrentIndex((i) => (i + 1) % slides.length);
    } else {
      progress.set(next);
    }
  });

  const goTo = (index) => {
    progress.set(0);
    setCurrentIndex(index);
  };

  const goNext = () => goTo((currentIndex + 1) % slides.length);
  const goPrev = () => goTo((currentIndex - 1 + slides.length) % slides.length);

  // Swipe on touch devices
  const handlePanEnd = (_, info) => {
    if (Math.abs(info.offset.x) < 60) return;
    if (info.offset.x < 0) goNext();
    else goPrev();
  };

  return (
    <motion.section
      className="relative isolate h-[580px] touch-pan-y select-none overflow-hidden bg-zinc-950 sm:h-[650px] lg:h-[700px]"
      onPanEnd={handlePanEnd}
      onMouseEnter={
        PAUSE_ON_HOVER ? () => (pausedRef.current = true) : undefined
      }
      onMouseLeave={
        PAUSE_ON_HOVER ? () => (pausedRef.current = false) : undefined
      }
    >
      {/* Background. The new image slides in behind a moving mask while the
          image inside counter-moves, so it looks like a wipe but only uses
          GPU transforms (no clip-path repaints). */}
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
                className="size-full object-cover will-change-transform"
              />
            </picture>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Readability overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/60 via-black/10 to-transparent md:hidden" />

      {/* Slide content */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            variants={content}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`flex max-w-3xl flex-col text-white ${
              isCenter
                ? "mx-auto items-center text-center"
                : "items-center text-center md:items-start md:text-left"
            }`}
          >
            <motion.div variants={soft} className="mb-5 flex items-center gap-3">
              <motion.span
                variants={rule}
                className="block h-px w-10 origin-left bg-white/80"
              />
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/85 sm:text-xs">
                {currentSlide.eyebrow}
              </span>
            </motion.div>

            <h1
              aria-label={currentSlide.title}
              className={`flex max-w-3xl flex-wrap gap-x-[0.25em] text-4xl font-black uppercase leading-[0.95] tracking-[-0.055em] sm:text-6xl lg:text-8xl ${
                isCenter ? "justify-center" : "justify-center md:justify-start"
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

            <motion.p
              variants={soft}
              className="mt-6 max-w-md text-sm leading-6 text-white/85 sm:text-base sm:leading-7"
            >
              {currentSlide.description}
            </motion.p>

            <motion.div variants={soft} className="mt-8">
              <Link
                href={currentSlide.route}
                className="group/btn relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-6 py-3.5 text-sm font-extrabold text-zinc-950 transition-colors duration-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
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

      {/* Progress navigation: click to jump */}
      <div className="absolute inset-x-0 bottom-0 z-20 mx-auto flex max-w-7xl gap-3 px-6 pb-6 lg:gap-4 lg:px-8 lg:pb-8">
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
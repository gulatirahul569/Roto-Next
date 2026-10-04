"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  animate,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  FiArrowUpRight,
  FiPlay,
  FiShoppingBag,
  FiUsers,
  FiVolume2,
  FiVolumeX,
} from "react-icons/fi";

const EASE = [0.22, 1, 0.36, 1];

/* ---------- Animation variants (transform + opacity only) ---------- */

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const rise = {
  hidden: { y: "115%" },
  visible: { y: "0%", transition: { duration: 0.9, ease: EASE } },
};

const soft = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
};

/* Number that counts up once when it scrolls into view */
function Counter({ value, suffix }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || !inView) return;

    if (reduceMotion) {
      node.textContent = `${value}${suffix}`;
      return;
    }

    const controls = animate(0, value, {
      duration: 1.8,
      ease: EASE,
      onUpdate: (latest) => {
        node.textContent = `${Math.round(latest)}${suffix}`;
      },
    });

    return () => controls.stop();
  }, [inView, reduceMotion, value, suffix]);

  return <span ref={ref}>{`0${suffix}`}</span>;
}

export default function LifestyleVideo() {
  const sectionRef = useRef(null);
  const frameRef = useRef(null);
  const videoRef = useRef(null);

  const [isMuted, setIsMuted] = useState(true);
  const reduceMotion = useReducedMotion();

  // Slow parallax: the video drifts inside its frame as you scroll
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const videoY = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);

  // Only play while on screen (saves CPU and battery)
  const isVideoInView = useInView(frameRef, { amount: 0.15 });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isVideoInView) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isVideoInView]);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  return (
    <section
      ref={sectionRef}
      className="overflow-hidden bg-gray-50 px-6 py-6 pb-12"
    >
      <div className="mx-auto grid max-w-full grid-cols-1 items-center gap-12 sm:gap-14 md:grid-cols-2 md:gap-12 lg:gap-16 lg:px-6">
        {/* ================= LEFT: TEXT ================= */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="flex flex-col justify-center text-black"
        >
          <motion.p
            variants={soft}
            className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-black/40 sm:mb-4 sm:text-xs"
          >
            Premium collection
          </motion.p>

          <h2
            aria-label="Elevate your style."
            className="text-3xl font-black uppercase leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
          >
            <span aria-hidden="true" className="block overflow-hidden py-[0.06em]">
              <motion.span variants={rise} className="block">
                Elevate
              </motion.span>
            </span>
            <span aria-hidden="true" className="block overflow-hidden py-[0.06em]">
              <motion.span variants={rise} className="block text-black/25">
                your style.
              </motion.span>
            </span>
          </h2>

          <motion.div
            variants={soft}
            className="mt-5 max-w-lg space-y-4 text-sm leading-6 text-black/60 sm:mt-6 sm:space-y-5 sm:text-base sm:leading-7"
          >
            <p>
              Discover premium bags, sneakers, and accessories selected for
              modern streetwear and everyday movement.
            </p>

            <p>
              From daily carry to weekend runs, every piece is chosen to hold
              up and look good doing it.
            </p>
          </motion.div>

          <motion.div variants={soft} className="mt-7 flex flex-wrap gap-3 sm:mt-8">
            <Link
              href="/category/all"
              className="group/btn relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-zinc-950 bg-zinc-950 px-6 py-3.5 text-sm font-extrabold text-white transition-colors duration-300 hover:text-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 translate-y-full bg-white transition-transform duration-500 ease-out group-hover/btn:translate-y-0"
              />
              <span className="relative">Shop the collection</span>
              <FiArrowUpRight
                size={17}
                className="relative transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5"
              />
            </Link>

            <Link
              href="/category/new"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-6 py-3.5 text-sm font-extrabold text-zinc-950 transition hover:border-zinc-950 hover:bg-zinc-950 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
            >
              <FiPlay size={15} />
              Explore new drops
            </Link>
          </motion.div>

          {/* Divider row */}
          <motion.div
            variants={soft}
            className="mt-8 border-t border-black/10 pt-5 sm:mt-10 sm:pt-6 md:mt-12 md:pt-7"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-black text-white sm:size-11 md:size-12">
                <FiShoppingBag size={17} />
              </div>

              <div>
                <p className="text-sm font-bold sm:text-base">
                  <Counter value={250} suffix="+" /> premium products
                </p>

                <p className="mt-1 text-xs text-black/40 sm:text-sm">
                  Bags, sneakers and accessories for everyday movement.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ================= RIGHT: VIDEO ================= */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.95, ease: EASE }}
          className="relative pb-5"
        >
          <div
            ref={frameRef}
            className="relative h-80 w-full overflow-hidden rounded-2xl bg-zinc-200 sm:h-96 md:h-[440px] lg:h-[580px]"
          >
            <motion.video
              ref={videoRef}
              src="/videos/section4.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              style={{ y: reduceMotion ? 0 : videoY, scale: 1.15 }}
              className="absolute inset-0 size-full object-cover will-change-transform"
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? "Turn sound on" : "Turn sound off"}
              className="absolute right-4 top-4 grid size-10 place-items-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur-md transition hover:bg-white hover:text-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {isMuted ? <FiVolumeX size={17} /> : <FiVolume2 size={17} />}
            </button>
          </div>

          {/* Floating stat card overlapping the frame */}
          <div className="absolute bottom-0 left-3 right-3 flex items-center gap-3 rounded-xl border border-black/5 bg-white p-3.5 shadow-lg sm:left-4 sm:right-auto sm:w-64 sm:rounded-2xl sm:p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-black text-white sm:size-11">
              <FiUsers size={18} />
            </div>

            <div>
              <p className="text-xl font-black text-black sm:text-2xl">
                <Counter value={10} suffix="K+" />
              </p>
              <p className="text-[10px] text-black/50 sm:text-xs">
                Happy customers
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
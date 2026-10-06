"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FiArrowLeft, FiArrowRight, FiStar } from "react-icons/fi";
import { fetchTopReviews } from "@/services/productService";

/*
  Shown only while there are no real reviews yet.
  Delete this array (and the fallback below) once customers have
  posted reviews and you only want real ones.
*/
const fallbackTestimonials = [
  {
    id: "fallback-1",
    name: "Ananya",
    subtitle: "Chandigarh",
    rating: 5,
    quote:
      "My trainer completely changed the way I approach fitness. I finally feel consistent and confident in my fitness journey.",
  },
  {
    id: "fallback-2",
    name: "Rohan",
    subtitle: "Delhi",
    rating: 5,
    quote:
      "Booking a session was so simple, and my trainer actually listens to my goals. Every workout feels personalized.",
  },
  {
    id: "fallback-3",
    name: "Priya",
    subtitle: "Mumbai",
    rating: 5,
    quote:
      "The yoga sessions helped me build a routine I've stuck to for months now. I feel healthier, calmer, and more active.",
  },
  {
    id: "fallback-4",
    name: "Arjun",
    subtitle: "Pune",
    rating: 5,
    quote:
      "Finding the right trainer made a huge difference. The sessions are challenging, enjoyable, and perfectly suited to my goals.",
  },
];

const placeholderSlide = { id: "placeholder", isPlaceholder: true };

function mapReview(review) {
  return {
    id: review._id,
    name: review.userName || "Customer",
    subtitle: review.productName ? `Reviewed ${review.productName}` : "",
    productId: review.productId,
    rating: review.rating,
    title: review.title,
    quote: review.comment,
    isVerifiedPurchase: review.isVerifiedPurchase,
  };
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [activeIndex, setActiveIndex] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const sliderRef = useRef(null);

  // Load the top 4 real reviews.
  useEffect(() => {
    let isCancelled = false;

    async function loadReviews() {
      try {
        const data = await fetchTopReviews(4);
        const realReviews = Array.isArray(data?.reviews)
          ? data.reviews.map(mapReview)
          : [];

        if (!isCancelled) {
          setTestimonials(
            realReviews.length > 0 ? realReviews : fallbackTestimonials
          );
        }
      } catch (error) {
        console.error("Testimonials loading error:", error);

        if (!isCancelled) {
          setTestimonials(fallbackTestimonials);
        }
      } finally {
        if (!isCancelled) {
          setActiveIndex(0);
          setIsTransitioning(false);
          setIsAnimating(false);
          setIsLoaded(true);
        }
      }
    }

    loadReviews();

    return () => {
      isCancelled = true;
    };
  }, []);

  const canRotate = isLoaded && testimonials.length > 1;

  // The first review is repeated at the end so the loop looks seamless.
  const slides = !isLoaded
    ? [placeholderSlide]
    : canRotate
      ? [...testimonials, testimonials[0]]
      : testimonials;

  const updateSliderPosition = () => {
    if (!sliderRef.current) return;

    const firstSlide = sliderRef.current.children[0];

    if (!firstSlide) return;

    const slideWidth = firstSlide.getBoundingClientRect().width;
    const gap = 32;

    setTranslateX(activeIndex * (slideWidth + gap));
  };

  useEffect(() => {
    updateSliderPosition();

    const resizeObserver = new ResizeObserver(() => {
      updateSliderPosition();
    });

    if (sliderRef.current) {
      resizeObserver.observe(sliderRef.current);
    }

    window.addEventListener("resize", updateSliderPosition);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateSliderPosition);
    };
  }, [activeIndex, slides.length]);

  useEffect(() => {
    if (!canRotate || isAnimating) return;

    const timer = setTimeout(() => {
      handleNext();
    }, 4000);

    return () => clearTimeout(timer);
  }, [activeIndex, isAnimating, canRotate]);

  const handleNext = () => {
    /*
      Ignore extra clicks while a slide is moving.
      This prevents moving past the cloned final slide.
    */
    if (!canRotate || isAnimating || activeIndex >= testimonials.length) {
      return;
    }

    setIsAnimating(true);
    setIsTransitioning(true);
    setActiveIndex((current) => current + 1);
  };

  const handlePrevious = () => {
    if (!canRotate || isAnimating) return;

    /*
      First testimonial -> jump invisibly to cloned first testimonial,
      then animate back to the final real testimonial.
    */
    if (activeIndex === 0) {
      setIsAnimating(true);
      setIsTransitioning(false);
      setActiveIndex(testimonials.length);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(true);
          setActiveIndex(testimonials.length - 1);
        });
      });

      return;
    }

    setIsAnimating(true);
    setIsTransitioning(true);
    setActiveIndex((current) => current - 1);
  };

  const handleTransitionEnd = (event) => {
    /*
      Ignore transition events caused by child elements.
      Only respond to the track transform animation.
    */
    if (event.target !== sliderRef.current) return;
    if (event.propertyName !== "transform") return;

    /*
      After the final clone appears:
      clone of the first review at the end -> real first review at index 0,
      with no visible animation.
    */
    if (activeIndex === testimonials.length) {
      setIsTransitioning(false);
      setActiveIndex(0);

      requestAnimationFrame(() => {
        setIsAnimating(false);
      });

      return;
    }

    setIsAnimating(false);
  };

  return (
    <section className="overflow-hidden bg-gray-50 py-12">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[390px_1fr] lg:gap-16">
          {/* Left content */}
          <div>
            <div className="max-w-[360px]">
              <div className="mb-7 inline-block">
                <p className="text-[15px] font-medium tracking-wide text-[#222] md:text-[16px]">
                  TESTIMONIALS
                </p>

                <div className="mt-2 h-[2px] w-[133px] bg-lime-500" />
              </div>

              <h2 className="text-[48px] font-extrabold leading-[0.98] tracking-[-2.5px] text-[#252525] sm:text-[54px] md:text-[58px] lg:text-[60px]">
                What people 
                <br />
                Say About Our Products
                <span className="text-lime-500">.</span>
              </h2>

              {canRotate && (
                <div className="mt-9 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    aria-label="Previous testimonial"
                    className="flex h-14 w-14 items-center justify-center rounded-full border border-gray-200 bg-white text-[#222] transition-all duration-300 hover:border-black hover:bg-black hover:text-white active:scale-95"
                  >
                    <FiArrowLeft size={20} strokeWidth={1.8} />
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next testimonial"
                    className="flex h-14 w-14 items-center justify-center rounded-full border border-gray-200 bg-white text-[#222] transition-all duration-300 hover:border-black hover:bg-black hover:text-white active:scale-95"
                  >
                    <FiArrowRight size={20} strokeWidth={1.8} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Slider */}
          <div className="relative min-w-0 w-full">
            <div className="w-full overflow-hidden">
              <div
                ref={sliderRef}
                onTransitionEnd={handleTransitionEnd}
                className={`flex gap-8 ${
                  isTransitioning
                    ? "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    : ""
                }`}
                style={{
                  transform: `translate3d(-${translateX}px, 0, 0)`,
                  willChange: "transform",
                }}
              >
                {slides.map((testimonial, index) => (
                  <div
                    key={`${testimonial.id}-${index}`}
                    className="w-full flex-none md:w-[82%] lg:w-[70%] xl:w-[62%]"
                  >
                    <article className="relative h-[340px] rounded-4xl border border-gray-200 bg-white p-8 shadow-[0_8px_35px_rgba(0,0,0,0.07)] md:h-[330px] md:p-10 lg:p-11">
                      {testimonial.isPlaceholder ? (
                        <div className="animate-pulse space-y-4">
                          <div className="h-5 w-32 rounded bg-gray-200" />
                          <div className="h-4 w-full max-w-[520px] rounded bg-gray-100" />
                          <div className="h-4 w-full max-w-[480px] rounded bg-gray-100" />
                          <div className="h-4 w-2/3 max-w-[360px] rounded bg-gray-100" />
                        </div>
                      ) : (
                        <>
                          <div className="pointer-events-none absolute right-8 top-7 select-none font-serif text-[70px] leading-none text-gray-100 md:right-10 md:top-9">
                            “
                          </div>

                          <div
                            className="relative z-10 mb-4 flex items-center gap-1"
                            aria-label={`${testimonial.rating} out of 5 stars`}
                          >
                            {Array.from({ length: 5 }).map((_, starIndex) => (
                              <FiStar
                                key={starIndex}
                                size={18}
                                strokeWidth={1.6}
                                className={
                                  starIndex < testimonial.rating
                                    ? "fill-lime-500 text-lime-500"
                                    : "text-gray-300"
                                }
                              />
                            ))}
                          </div>

                          <h3 className="relative z-10 mb-4 text-[20px] font-semibold text-[#303030] md:text-[21px]">
                            {testimonial.name}
                          </h3>

                          {testimonial.title && (
                            <p className="relative z-10 mb-2 line-clamp-1 text-[16px] font-semibold text-[#444]">
                              {testimonial.title}
                            </p>
                          )}

                          <p className="relative z-10 line-clamp-3 max-w-[520px] text-[17px] font-normal leading-[1.75] text-[#777] md:text-[18px]">
                            {testimonial.quote}
                          </p>

                          <div className="relative z-10 mt-5">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                              {testimonial.subtitle &&
                                (testimonial.productId ? (
                                  <Link
                                    href={`/product/${testimonial.productId}`}
                                    className="truncate text-sm text-gray-400 transition hover:text-black"
                                  >
                                    {testimonial.subtitle}
                                  </Link>
                                ) : (
                                  <p className="text-sm text-gray-400">
                                    {testimonial.subtitle}
                                  </p>
                                ))}

                              {testimonial.isVerifiedPurchase && (
                                <span className="rounded-full bg-lime-50 px-2.5 py-0.5 text-xs font-semibold text-lime-700">
                                  Verified purchase
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="absolute bottom-0 left-5 h-[3px] w-20 bg-lime-500" />
                        </>
                      )}
                    </article>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

const HERO_SLIDES = [
  {
    src: "/slider1.jpeg",
    alt: "Balbuddhi Swarn Prashan — Ayurvedic formula for healthy growth & brain development",
  },
  {
    src: "/slider2.jpeg",
    alt: "Glow Face Oil — Kumkumadi glow face oil by Atharva Health Solutions",
  },
  {
    src: "/slider3.jpeg",
    alt: "Himalayan Shilajit — stamina & vitality booster",
  },
] as const;

export function HeroSection() {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api) return;
    const id = window.setInterval(() => {
      if (api.canScrollNext()) api.scrollNext();
      else api.scrollTo(0);
    }, 4500);
    return () => window.clearInterval(id);
  }, [api]);

  const goTo = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api],
  );

  return (
    <section className="relative isolate overflow-hidden bg-gradient-hero flex items-center">
      {/* Layered background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-purple-deep via-brand-purple/90 to-brand-purple-deep/75" />
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-brand-orange/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-brand-teal/25 blur-[90px] pointer-events-none" />
      </div>

      <div className="relative mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-10 sm:pb-14 lg:pb-16 w-full">
        <div className="flex flex-col items-center text-center w-full">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 mb-3 sm:mb-4 px-3 py-1.5 rounded-full bg-white/8 border border-white/15">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-brand-yellow opacity-70" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-yellow" />
            </span>
            <span className="text-[11px] font-semibold text-white/90 tracking-wider uppercase">
              Atharva Health Solutions
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-display-2 text-white mb-3 sm:mb-4 max-w-3xl">
            Pure Ayurveda. <span className="text-gradient-gold">Trusted care.</span>
          </h1>

          {/* Tagline */}
          <p className="text-base sm:text-lg text-white/70 leading-relaxed max-w-xl">
            Handcrafted herbal formulations for everyday health — natural, safe, and made
            to restore balance from within.
          </p>

          {/* Hero slider */}
          <div className="relative w-full my-6 sm:my-8 lg:my-10">
            <Carousel
              setApi={setApi}
              opts={{ loop: true, align: "start" }}
              className="w-full"
            >
              <CarouselContent className="-ml-0">
                {HERO_SLIDES.map((slide, index) => (
                  <CarouselItem key={slide.src} className="pl-0 basis-full">
                    <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 shadow-card-hover bg-black/20">
                      <img
                        src={slide.src}
                        alt={slide.alt}
                        width={1920}
                        height={800}
                        loading={index === 0 ? "eager" : "lazy"}
                        decoding="async"
                        fetchPriority={index === 0 ? "high" : "auto"}
                        className="w-full h-auto max-h-[min(58vh,560px)] object-cover object-center"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <button
                type="button"
                onClick={() => api?.scrollPrev()}
                aria-label="Previous slide"
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/45 text-white border border-white/20 backdrop-blur-md hover:bg-black/60 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => api?.scrollNext()}
                aria-label="Next slide"
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/45 text-white border border-white/20 backdrop-blur-md hover:bg-black/60 transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </Carousel>

            <div className="mt-4 flex items-center justify-center gap-2">
              {HERO_SLIDES.map((slide, index) => (
                <button
                  key={slide.src}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={current === index}
                  onClick={() => goTo(index)}
                  className={`h-2 rounded-full transition-all ${
                    current === index
                      ? "w-7 bg-brand-yellow"
                      : "w-2 bg-white/35 hover:bg-white/55"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <a
              href="#products"
              className="group inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4 rounded-full font-bold text-sm tracking-wide bg-gradient-orange text-white shadow-gold hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Shop bestsellers
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="https://wa.me/919669361290?text=Hi%2C%20I%20want%20to%20order%20Atharva%20Health%20Solutions%20products"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4 rounded-full bg-white/8 hover:bg-white/12 border border-white/20 backdrop-blur-md font-bold text-sm text-white active:scale-[0.98] transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Order on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

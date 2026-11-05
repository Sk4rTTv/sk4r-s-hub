import { useEffect, useRef } from "react";

export function useRetroMotion(active: boolean, itemCount: number, view: string) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element || !active) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cleanup = () => {};
    const configure = () => {
      cleanup();
      if (preference.matches) return;
      let frame = 0;
      let previousY = window.scrollY;
      const targets = element.querySelectorAll<HTMLElement>(".console-hero, .retro-toolbar, .collection-card, .console-footer");
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => entry.target.classList.toggle("is-visible", entry.isIntersecting));
      }, { threshold: 0.08 });
      targets.forEach(target => {
        target.classList.add("scroll-reveal");
        observer.observe(target);
      });
      const update = () => {
        const y = window.scrollY;
        element.style.setProperty("--scroll-shift", `${-Math.min(y * 0.06, 36)}px`);
        element.style.setProperty("--reveal-offset", y < previousY ? "-18px" : "18px");
        previousY = y;
        frame = 0;
      };
      const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(update); };
      update();
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanup = () => {
        observer.disconnect();
        window.removeEventListener("scroll", onScroll);
        window.cancelAnimationFrame(frame);
        element.style.removeProperty("--scroll-shift");
        element.style.removeProperty("--reveal-offset");
        targets.forEach(target => target.classList.remove("scroll-reveal", "is-visible"));
      };
    };
    configure();
    preference.addEventListener("change", configure);
    return () => { cleanup(); preference.removeEventListener("change", configure); };
  }, [active, itemCount, view]);

  return root;
}

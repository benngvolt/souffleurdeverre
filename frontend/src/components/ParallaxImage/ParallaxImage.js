import "./ParallaxImage.scss";
import React, { useEffect, useRef } from "react";

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export default function ParallaxImage({ image }) {
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img) return;

    let maxShift = 0;

    const computeMaxShift = () => {
      const c = container.getBoundingClientRect();
      const i = img.getBoundingClientRect();
      maxShift = Math.max(0, (i.height - c.height) / 2);
    };

    const update = () => {
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight;

      // progression 0..1 quand la section traverse le viewport
      const progress = clamp((vh - rect.top) / (vh + rect.height), 0, 1);

      // map 0..1 vers -maxShift..+maxShift
      const y = (progress * 2 - 1) * -maxShift;

      img.style.transform = `translateY(${y}px)`;
    };

    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        update();
        raf = null;
      });
    };

    const onResize = () => {
      computeMaxShift();
      update();
    };

    // important: attendre que l'image soit chargée pour mesurer correctement
    const onLoad = () => {
      computeMaxShift();
      update();
    };

    img.addEventListener("load", onLoad);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    // cas où l’image est déjà en cache
    if (img.complete) onLoad();

    return () => {
      img.removeEventListener("load", onLoad);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [image?.imageUrl]);

  return (
    <div className="oneSpectacle_parallaxContainer" ref={containerRef}>
      <img
        ref={imgRef}
        className="oneSpectacle_parallaxContainer_parallax"
        src={image?.imageUrl}
        alt=""
      />
    </div>
  );
}

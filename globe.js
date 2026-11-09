import createGlobe from "./cobe.js?v=20261110v37";

const canvas = document.getElementById("globe-canvas");

if (canvas) {
  // Start phi=2.35 so within ~1.5-2.5s of viewing, Europe (Ukraine, Russia, France, UK) and China rotate right across the front
  let phi = 2.35;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const size = 660; // Crisp resolution matching larger half-planet dome display

  try {
    const globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: size * dpr,
      height: size * dpr,
      phi: phi,
      theta: 0.18,
      dark: 1,
      diffuse: 1.25,
      mapSamples: 18000,
      mapBrightness: 6,
      baseColor: [0.85, 0.85, 0.9],     // Crisp bright white / silver dotted continents (like Radnaabazar)
      markerColor: [0.86, 0.34, 0.52],  // Website signature rose-pink (--wine-light: #db5785 / #d34d78)
      markerElevation: 0,               // Flat markers directly on the sphere surface (not protruding)
      glowColor: [1, 1, 1],             // Pure white atmospheric glow
      markers: [
        { location: [50.4501, 30.5234], size: 0.05 }, // Ukraine — Ukrainian
        { location: [55.7558, 37.6173], size: 0.05 }, // Russia — Russian
        { location: [51.5074, -0.1278], size: 0.05 }, // UK — English
        { location: [39.9042, 116.407], size: 0.05 }, // China — Chinese
        { location: [48.8566, 2.3522],  size: 0.05 }  // France — French
      ]
    });

    // Reset starting angle the first time the user scrolls the globe into view so markers appear in 2-3 seconds
    if ("IntersectionObserver" in window) {
      let hasEnteredView = false;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasEnteredView) {
            hasEnteredView = true;
            phi = 2.35;
            observer.disconnect();
          }
        });
      }, { threshold: 0.15 });
      observer.observe(canvas);
    }

    // Continuous smooth spinning loop around its axis (slightly faster)
    const animate = () => {
      phi += 0.009;
      globe.update({ phi: phi });
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);

    canvas.style.opacity = "1";
  } catch (err) {
    console.warn("3D Globe init failed:", err);
  }
}

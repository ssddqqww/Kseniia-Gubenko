import createGlobe from "./cobe.js";

const canvas = document.getElementById("globe-canvas");

if (canvas) {
  let phi = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const size = 680; // Crisp resolution matching larger half-planet dome display

  try {
    const globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: size * dpr,
      height: size * dpr,
      phi: 0,
      theta: 0.18,
      dark: 1,
      diffuse: 1.25,
      mapSamples: 18000,
      mapBrightness: 6,
      baseColor: [0.85, 0.85, 0.9],     // Crisp bright white / silver dotted continents (like Radnaabazar)
      markerColor: [0.1, 0.8, 1],       // Luminous cyan location markers
      glowColor: [1, 1, 1],             // Pure white atmospheric glow
      markers: [
        { location: [50.4501, 30.5234], size: 0.08 }, // Kyiv (Ukrainian)
        { location: [48.8566, 2.3522],  size: 0.07 }, // Paris (French)
        { location: [51.5074, -0.1278], size: 0.07 }, // London (English)
        { location: [39.9042, 116.407], size: 0.08 }, // Beijing (Chinese)
        { location: [35.6762, 139.650], size: 0.07 }  // Tokyo (Japanese)
      ]
    });

    // Continuous smooth spinning loop around its axis
    const animate = () => {
      phi += 0.005;
      globe.update({ phi: phi });
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);

    canvas.style.opacity = "1";
  } catch (err) {
    console.warn("3D Globe init failed:", err);
  }
}

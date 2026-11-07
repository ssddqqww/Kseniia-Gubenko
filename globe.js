import createGlobe from "./cobe.js";

const canvas = document.getElementById("globe-canvas");

if (canvas) {
  let phi = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const SIZE = 580; // logical px — should match CSS wrapper size

  try {
    const globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: SIZE * dpr,
      height: SIZE * dpr,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 1.3,
      mapSamples: 18000,
      mapBrightness: 6.5,
      baseColor: [0.06, 0.06, 0.1],
      markerColor: [1, 0.25, 0.55],   // neon pink markers
      glowColor: [0.85, 0.25, 0.5],   // pink atmospheric rim glow
      markers: [
        { location: [50.4501, 30.5234], size: 0.09 }, // Kyiv (Ukrainian)
        { location: [48.8566, 2.3522],  size: 0.07 }, // Paris (French)
        { location: [51.5074, -0.1278], size: 0.07 }, // London (English)
        { location: [39.9042, 116.407], size: 0.08 }, // Beijing (Chinese)
        { location: [35.6762, 139.650], size: 0.07 }  // Tokyo (Japanese)
      ],
      onRender: (state) => {
        state.phi = phi;
        phi += 0.004;
      }
    });

    // fade in once WebGL renders
    requestAnimationFrame(() => { canvas.style.opacity = "1"; });
  } catch (err) {
    console.warn("3D Globe init failed:", err);
  }
}

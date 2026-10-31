/* Rocket promo card — live animation (experiment).
   The rocket (Rocket.json, Lottie) flies back and forth along a rising curve; the trail is drawn from the ground at the bottom-left
   to the rocket's tail every frame, so it stretches when the rocket surges ahead and shrinks when it falls back. */
(function () {
  'use strict';
  const card = document.querySelector('.event-card--rocket'); if (!card) return;
  const svg = card.querySelector('#rkcLive'), line = card.querySelector('#rkcLine'), fill = card.querySelector('#rkcFill'), lt = card.querySelector('#rkcLt');
  const lgs = svg.querySelectorAll('linearGradient');
  const SIZE = 104, TOP = 24, X0 = -6; let KCURVE = 2.4, E = Math.exp(KCURVE) - 1;
  let W = 0, H = 0, vis = true, raf = 0, anim = null;
  const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function measure() { const r = card.getBoundingClientRect(); W = r.width; H = r.height; svg.setAttribute('viewBox', `0 0 ${W} ${H}`); KCURVE = W > 560 ? 4.2 : 2.4; E = Math.exp(KCURVE) - 1; }
  const xEnd = () => W > 560 ? W / 2 + 130 + 0.1 * 250 : W * 0.94, y0 = () => H - 5;

  const cx = (s) => X0 + s * (xEnd() - X0);
  const cy = (s) => y0() - (y0() - TOP) * (Math.exp(KCURVE * s) - 1) / E;
  const dx = () => xEnd() - X0;
  const dy = (s) => -(y0() - TOP) * KCURVE * Math.exp(KCURVE * s) / E;       // screen-space slope (negative = up)
  // how far along the curve the rocket is: surges ahead, falls back, repeats (smooth pseudo-random)
  const progress = (t) => 0.74 + 0.12 * Math.sin(t * 0.00085) + 0.06 * Math.sin(t * 0.0021 + 1.3) + 0.025 * Math.sin(t * 0.0051 + 0.4);

  function draw(t) {
    if (!W) measure(); if (!W) return;
    const p = still ? 0.8 : progress(t);
    const px = cx(p), py = cy(p), sx = dx(), sy = dy(p), speed = Math.hypot(sx, sy), elev = Math.atan2(-sy, sx);     // elevation angle of the flight direction
    // rocket sits on the curve, nose along the tangent (the art points 45deg up-right, so rotate by 45 - elevation)
    lt.style.transform = `translate(${(px - SIZE / 2).toFixed(1)}px, ${(py - SIZE / 2).toFixed(1)}px) rotate(${(45 - elev * 180 / Math.PI).toFixed(1)}deg)`;
    // trail: from the ground to just behind the rocket (the flame)
    const tail = SIZE * 0.34, se = Math.max(0.02, p - tail / speed), n = 36;
    let d = `M${cx(0).toFixed(1)} ${cy(0).toFixed(1)}`;
    for (let i = 1; i <= n; i++) { const s = se * i / n; d += ` L${cx(s).toFixed(1)} ${cy(s).toFixed(1)}`; }
    line.setAttribute('d', d);
    fill.setAttribute('d', d + ` L${cx(se).toFixed(1)} ${(H + 4).toFixed(1)} L${cx(0).toFixed(1)} ${(H + 4).toFixed(1)} Z`);
    const ex = cx(se); lgs.forEach((g) => { g.setAttribute('x1', X0); g.setAttribute('x2', ex.toFixed(1)); });
  }
  function loop(t) { raf = 0; if (!vis || document.hidden) return; draw(t); raf = requestAnimationFrame(loop); }
  function go() { if (still) { draw(0); return; } if (!raf && vis && !document.hidden) raf = requestAnimationFrame(loop); }

  new IntersectionObserver((es) => { vis = es[0].isIntersecting; if (anim) (vis ? anim.play() : anim.pause()); go(); }, { threshold: 0.05 }).observe(card);
  document.addEventListener('visibilitychange', () => { if (anim) (document.hidden ? anim.pause() : anim.play()); go(); });
  new ResizeObserver(() => { measure(); draw(performance.now()); }).observe(card);
  measure(); draw(0); go();

  // the Lottie rocket (3.9 MB) is fetched a moment after the page is up; the still artwork is shown until then
  function loadLottie() {
    if (typeof lottie === 'undefined') return;
    fetch('assets/Rocket.json').then((r) => r.json()).then((data) => {
      const holder = document.createElement('div'); holder.style.cssText = 'position:absolute;inset:0';
      lt.appendChild(holder);
      anim = lottie.loadAnimation({ container: holder, renderer: 'svg', loop: true, autoplay: !still && vis, animationData: data, rendererSettings: { preserveAspectRatio: 'xMidYMid meet' } });
      anim.addEventListener('DOMLoaded', () => { const img = lt.querySelector('img'); if (img) img.remove(); if (still) anim.goToAndStop(60, true); });
    }).catch(() => {});
  }
  if (document.readyState === 'complete') setTimeout(loadLottie, 500); else window.addEventListener('load', () => setTimeout(loadLottie, 500));
})();

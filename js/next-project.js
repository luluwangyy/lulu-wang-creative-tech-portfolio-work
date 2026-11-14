const nextProject = document.querySelector('.next-project-link');

if (nextProject && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  const atEnd = () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 3;
  const hint = document.querySelector('.next-project-hint');
  let pull = 0;
  let resetTimer;
  let wheelTime = -Infinity;
  let wheelGesture = false;
  let touchStart = null;

  hint.hidden = false;

  function resetPull() {
    pull = 0;
    nextProject.classList.remove('is-pulling');
  }

  function updatePull(distance) {
    pull = distance;
    nextProject.classList.add('is-pulling');
    nextProject.style.setProperty('--project-pull', `${-44 * (1 - Math.exp(-pull / 145))}px`);
  }

  window.addEventListener('wheel', event => {
    const now = performance.now();
    if (now - wheelTime > 220) {
      wheelGesture = atEnd() && event.deltaY > 0;
    }
    wheelTime = now;

    if (event.ctrlKey || !wheelGesture || !atEnd() || event.deltaY <= 0 || Math.abs(event.deltaX) > event.deltaY) {
      resetPull();
      return;
    }
    const scale = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? innerHeight : 1;
    updatePull(pull + Math.min(event.deltaY * scale, 90));
    clearTimeout(resetTimer);
    if (pull >= 220) {
      window.location.assign(nextProject.href);
      return;
    }
    resetTimer = setTimeout(resetPull, 340);
  }, { passive: true });

  window.addEventListener('touchstart', event => {
    touchStart = atEnd() && event.touches.length === 1 ? event.touches[0] : null;
  }, { passive: true });

  window.addEventListener('touchmove', event => {
    if (!touchStart || event.touches.length !== 1 || !atEnd()) return;
    const finger = event.touches[0];
    const distance = touchStart.clientY - finger.clientY;
    if (distance <= 0 || Math.abs(touchStart.clientX - finger.clientX) > distance) {
      resetPull();
      return;
    }
    updatePull(distance);
  }, { passive: true });

  window.addEventListener('touchend', () => {
    if (touchStart && atEnd() && pull >= 115) window.location.assign(nextProject.href);
    touchStart = null;
    resetPull();
  }, { passive: true });

  window.addEventListener('touchcancel', () => {
    touchStart = null;
    resetPull();
  });

  window.addEventListener('pageshow', resetPull);
}

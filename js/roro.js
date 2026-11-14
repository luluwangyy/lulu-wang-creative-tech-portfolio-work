const clips = [...document.querySelectorAll('.roro-process-clip')];
const canAutoplay = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
const marsPlayer = document.querySelector('#movement-lab .video-facade');
if (canAutoplay && marsPlayer) {
  const marsInView = new IntersectionObserver(([entry], observer) => {
    if (entry.intersectionRatio <= 0.5) return;
    observer.disconnect();

    // Give the documentary the autoplay slot when it comes into view.
    const hero = document.querySelector('#demo-video iframe');
    hero?.contentWindow.postMessage(JSON.stringify({
      event: 'command',
      func: 'pauseVideo',
      args: [],
    }), 'https://www.youtube.com');

    const source = new URL(marsPlayer.dataset.embedSrc);
    source.searchParams.set('mute', '1');
    marsPlayer.dataset.embedSrc = source.href;
    marsPlayer.click();
  }, { threshold: 0.51 });
  marsInView.observe(marsPlayer);
}

let hoverPreview = null;

const startInView = new IntersectionObserver((entries, observer) => {
  for (const { target, isIntersecting } of entries) {
    if (!isIntersecting) continue;
    target.play().catch(() => {});
    observer.unobserve(target);
  }
}, { threshold: 0.25 });

for (const clip of clips) {
  const video = clip.querySelector('video');
  const sound = clip.querySelector('.roro-sound-toggle');
  const label = sound.dataset.clip;

  function updateSoundButton() {
    const action = video.muted ? 'Unmute' : 'Mute';
    sound.dataset.muted = String(video.muted);
    sound.setAttribute('aria-label', `${action} process clip ${label}`);
  }

  video.addEventListener('volumechange', () => {
    if (!video.muted) {
      for (const other of clips) {
        const otherVideo = other.querySelector('video');
        if (otherVideo !== video) otherVideo.muted = true;
      }
    }
    updateSoundButton();
  });

  sound.hidden = false;
  sound.addEventListener('click', () => {
    hoverPreview = null;
    video.muted = !video.muted;
    if (!video.muted) video.play().catch(() => {});
  });

  video.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'mouse' || video.paused || !video.muted) return;
    // Browsers can pause a muted autoplay video if it is unmuted before any interaction.
    if (!navigator.userActivation?.hasBeenActive) return;
    hoverPreview = video;
    video.muted = false;
  });

  video.addEventListener('pointerleave', () => {
    if (hoverPreview !== video) return;
    hoverPreview = null;
    video.muted = true;
  });

  if (canAutoplay) startInView.observe(video);
}

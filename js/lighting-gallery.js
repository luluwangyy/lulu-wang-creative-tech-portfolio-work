const lightingGallery = document.querySelector("[data-lighting-gallery]");
const lightingDialog = document.querySelector("[data-lighting-lightbox]");

if (lightingGallery && lightingDialog) {
  const studies = Array.from(lightingGallery.querySelectorAll(".lighting-study"));
  const player = lightingDialog.querySelector("[data-lighting-player]");
  const title = lightingDialog.querySelector("[data-lighting-title]");
  const count = lightingDialog.querySelector("[data-lighting-count]");
  const closeButton = lightingDialog.querySelector("[data-lighting-close]");
  const previousButton = lightingDialog.querySelector("[data-lighting-previous]");
  const nextButton = lightingDialog.querySelector("[data-lighting-next]");
  let currentIndex = 0;
  let returnFocus = null;

  const studyMedia = (index) => {
    const study = studies[index];
    const preview = study.querySelector("video");
    const source = preview?.querySelector("source");
    return {
      source: source?.getAttribute("src") || "",
      poster: preview?.getAttribute("poster") || "",
      title: study.dataset.title || `Study ${String(index + 1).padStart(2, "0")}`,
    };
  };

  const showStudy = (index) => {
    currentIndex = (index + studies.length) % studies.length;
    const media = studyMedia(currentIndex);
    player.pause();
    player.src = media.source;
    player.poster = media.poster;
    player.muted = false;
    player.volume = 1;
    title.textContent = media.title;
    count.textContent = `${currentIndex + 1} / ${studies.length}`;
    player.load();
    player.play().catch(() => {});
  };

  const openStudy = (index, trigger) => {
    returnFocus = trigger;
    document.documentElement.classList.add("lighting-lightbox-lock");
    if (typeof lightingDialog.showModal === "function") {
      lightingDialog.showModal();
    } else {
      lightingDialog.setAttribute("open", "");
    }
    showStudy(index);
    closeButton.focus();
  };

  const closeStudy = () => {
    if (typeof lightingDialog.close === "function") {
      lightingDialog.close();
    } else {
      lightingDialog.removeAttribute("open");
    }
  };

  studies.forEach((study, index) => {
    study.addEventListener("click", () => openStudy(index, study));
  });

  previousButton.addEventListener("click", () => showStudy(currentIndex - 1));
  nextButton.addEventListener("click", () => showStudy(currentIndex + 1));
  closeButton.addEventListener("click", closeStudy);

  lightingDialog.addEventListener("click", (event) => {
    if (event.target === lightingDialog) closeStudy();
  });

  lightingDialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showStudy(currentIndex - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showStudy(currentIndex + 1);
    }
  });

  lightingDialog.addEventListener("close", () => {
    player.pause();
    player.removeAttribute("src");
    player.load();
    document.documentElement.classList.remove("lighting-lightbox-lock");
    returnFocus?.focus();
  });
}

document.querySelectorAll("[data-lighting-hero]").forEach((hero) => {
  const video = hero.querySelector("video");
  const toggle = hero.querySelector("[data-lighting-hero-toggle]");
  if (!video || !toggle) return;

  const label = toggle.querySelector("span");
  const update = () => {
    const paused = video.paused;
    toggle.setAttribute("aria-label", paused ? "Play hero lighting study" : "Pause hero lighting study");
    label.textContent = paused ? "Play" : "Pause";
  };

  toggle.addEventListener("click", () => {
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
    update();
  });

  video.addEventListener("play", update);
  video.addEventListener("pause", update);
  update();
});

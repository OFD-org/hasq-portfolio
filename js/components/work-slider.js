import { WorkViewer } from "./work-viewer.js";

const collections = [
  {
    id: "motion",
    title: "2D & 3D motion",
    description: "Showreels, campaigns, and personal explorations in movement.",
    filters: [
      ["all", "All motion"],
      ["reels", "Reels & campaigns"],
      ["experiments", "Personal edits"],
    ],
  },
  {
    id: "performance",
    title: "Performance creatives",
    description:
      "Video ads, product interactions, and static concepts made for the feed.",
    filters: [
      ["all", "All creatives"],
      ["ads", "Video ads"],
      ["ui", "UI animations"],
      ["stills", "Static creatives"],
    ],
  },
  {
    id: "brand",
    title: "SaaS / Brand",
    description:
      "An earlier brand piece from 2024. More SaaS and brand work is in progress.",
    filters: [],
  },
];

export class WorkSlider {
  constructor(root, projects) {
    this.root = root;
    this.projects = projects;
    this.track = root.querySelector(".works-track");
    this.scrollbar = root.querySelector(".works-scrollbar");

    this.scrollbar.addEventListener("input", () => {
      this.track.scrollLeft = Number(this.scrollbar.value);
    });
    this.active = null;
    this.reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    this.viewer = new WorkViewer();
    this.tabs = root.querySelector(".works-collections");
    this.filters = root.querySelector(".works-filters");
    collections.forEach((collection) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.collection = collection.id;
      button.textContent = collection.title;
      if (collection.id === "brand") {
        const badge = document.createElement("small");
        badge.textContent = "In progress";
        button.append(badge);
      }
      button.addEventListener("click", () => this.setCollection(collection));
      this.tabs.append(button);
    });
    root.querySelectorAll("[data-direction]").forEach((button) => {
      button.addEventListener("click", () =>
        this.navigate(Number(button.dataset.direction)),
      );
    });
    this.track.addEventListener("scroll", () => this.updateNavigation(), {
      passive: true,
    });
    this.track.addEventListener("transitionend", () => this.updateNavigation());
    this.resizeObserver = new ResizeObserver(() => this.updateNavigation());
    this.resizeObserver.observe(this.track);
    this.track.addEventListener("keydown", (event) => {
      if (event.key === "Escape") this.select(null);
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
        return;
      event.preventDefault();
      const index = this.cards.indexOf(
        document.activeElement.closest(".work-card"),
      );
      const next =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? this.cards.length - 1
            : (index +
                (event.key === "ArrowRight" ? 1 : -1) +
                this.cards.length) %
              this.cards.length;
      this.reveal(this.cards[next]);
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.select(null);
    });
    this.reducedMotion.addEventListener("change", () => this.select(null));
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (!entry.isIntersecting && entry.target === this.active)
            this.select(null);
      },
      { threshold: 0.15 },
    );
    this.setCollection(collections[0]);
  }

  setCollection(collection) {
    this.collection = collection;
    this.tabs
      .querySelectorAll("button")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.collection === collection.id),
        ),
      );
    this.root.querySelector(".works-description").textContent =
      collection.description;
    this.filters.replaceChildren();
    collection.filters.forEach(([id, title]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = title;
      button.dataset.filter = id;
      button.addEventListener("click", () => this.render(id));
      this.filters.append(button);
    });
    this.render("all");
  }

  render(filter) {
    this.select(null);
    this.observer.disconnect();
    this.lastNavigated = null;
    this.filters
      .querySelectorAll("button")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.filter === filter),
        ),
      );
    const projects = this.projects.filter(
      (project) =>
        project.collection === this.collection.id &&
        (filter === "all" || project.kind === filter),
    );
    this.cards = projects.map((project) => this.createCard(project));
    this.track.replaceChildren(...this.cards);
    this.track.scrollLeft = 0;
    this.track.classList.toggle("is-single", projects.length === 1);
    this.track.classList.toggle("is-stills", filter === "stills");
    this.root.querySelector(".works-navigation").hidden = filter === "stills";
    this.root.querySelector(".works-instruction").textContent =
      filter === "stills"
        ? "Open an image to explore the full composition."
        : "Hover or tap to preview. Open a film to watch with sound.";
    this.root.querySelector(".works-count").textContent =
      `${projects.length} ${projects.length === 1 ? "work" : "works"} · ${this.collection.title}`;
    this.updateNavigation();
    this.cards.forEach((card) => this.observer.observe(card));
  }

  createCard(project) {
    const card = document.createElement("article");
    card.className = "work-card";
    card.dataset.format =
      project.width < project.height ? "portrait" : "landscape";
    const preview = document.createElement("button");
    preview.type = "button";
    preview.className = "work-preview";
    preview.setAttribute(
      "aria-label",
      `${project.image ? "View image:" : "Preview"} ${project.title}`,
    );
    if (!project.image) preview.setAttribute("aria-pressed", "false");
    const poster = document.createElement("img");
    poster.src = project.poster;
    poster.alt = "";
    poster.className = "work-poster";
    poster.loading = "lazy";
    preview.append(poster);
    let video;
    if (project.preview) {
      video = document.createElement("video");
      video.dataset.src = project.preview;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "none";
      video.setAttribute("aria-hidden", "true");
      preview.append(video);
    }
    const format = document.createElement("span");
    format.className = "work-format";
    format.textContent = project.image
      ? "Still"
      : `${Math.floor(project.duration / 60)}:${String(project.duration % 60).padStart(2, "0")}`;
    const status = document.createElement("span");
    status.className = "work-status";
    status.textContent = project.image ? "View composition" : "Preview";
    preview.append(format, status);
    const caption = document.createElement("div");
    caption.className = "work-caption";
    const category = document.createElement("p");
    category.className = "work-category";
    category.textContent = project.category;
    const title = document.createElement("h3");
    title.className = "work-title";
    title.textContent = project.title;
    const open = document.createElement("button");
    open.type = "button";
    open.className = "work-open";
    open.textContent = project.image ? "View image" : "Watch full film";
    open.setAttribute("aria-label", `${open.textContent}: ${project.title}`);
    open.addEventListener("click", () => {
      this.select(null);
      this.viewer.open(project, open);
    });
    caption.append(category, title, open);
    card.append(preview, caption);
    video?.addEventListener("playing", () => {
      if (this.active !== card) {
        video.pause();
        return;
      }
      card.classList.add("is-playing");
      status.textContent = "Preview · Muted";
    });
    video?.addEventListener("error", () => {
      if (this.active === card)
        status.textContent = "Preview unavailable · Open full film";
    });
    card.addEventListener("pointerenter", (event) => {
      if (
        !this.viewer.dialog.open &&
        event.pointerType === "mouse" &&
        !this.reducedMotion.matches
      )
        this.select(card);
    });
    card.addEventListener("pointerleave", (event) => {
      if (event.pointerType === "mouse" && this.active === card)
        this.select(null);
    });
    card.addEventListener("focusout", (event) => {
      if (!card.contains(event.relatedTarget) && this.active === card)
        this.select(null);
    });
    preview.addEventListener("click", () => {
      if (project.image) {
        this.select(null);
        this.viewer.open(project, preview);
      } else this.select(this.active === card ? null : card);
    });
    return card;
  }

  select(card) {
    if (this.active === card) return;
    this.playRequest = (this.playRequest || 0) + 1;
    const request = this.playRequest;
    if (this.active) {
      const previous = this.active;
      previous.querySelector("video")?.pause();
      previous.classList.remove("is-active", "is-playing");
      if (previous.querySelector("video"))
        previous
          .querySelector(".work-preview")
          .setAttribute("aria-pressed", "false");
      previous.querySelector(".work-status").textContent =
        previous.querySelector("video") ? "Preview" : "View composition";
    }
    this.active = card;
    if (!card) return;

    card.classList.add("is-active");
    this.keepCardVisible(card, request);

    const video = card.querySelector("video");
    if (!video) return;
    card.querySelector(".work-preview").setAttribute("aria-pressed", "true");
    card.querySelector(".work-status").textContent = "Loading preview…";
    if (!video.hasAttribute("src")) video.src = video.dataset.src;
    if (video.error) video.load();
    video.play().catch(() => {
      if (this.active === card && this.playRequest === request)
        card.querySelector(".work-status").textContent =
          "Preview unavailable · Open full film";
    });
  }

  keepCardVisible(card, request) {
    if (this.track.classList.contains("is-stills")) return;

    const start = performance.now();
    const duration = this.reducedMotion.matches ? 0 : 650;

    const update = () => {
      if (this.active !== card || this.playRequest !== request) return;

      const trackRect = this.track.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();

      const left = trackRect.left + this.track.clientLeft;
      const right = left + this.track.clientWidth;

      if (cardRect.right > right + 1) {
        this.track.scrollLeft += Math.ceil(cardRect.right - right);
      } else if (cardRect.left < left - 1) {
        this.track.scrollLeft -= Math.ceil(left - cardRect.left);
      }

      if (performance.now() - start < duration) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  }

  reveal(card) {
    if (!card) return;
    this.select(null);
    this.lastNavigated = card;
    card.querySelector(".work-preview").focus({ preventScroll: true });
    this.track.scrollTo({
      left: card.offsetLeft - (this.track.clientWidth - card.clientWidth) / 2,
      behavior: this.reducedMotion.matches ? "instant" : "smooth",
    });
  }

  navigate(direction) {
    this.select(null);
    this.track.scrollBy({
      left: direction * this.track.clientWidth * 0.8,
      behavior: this.reducedMotion.matches ? "instant" : "smooth",
    });
  }

  updateNavigation() {
    const { scrollWidth, clientWidth, scrollLeft } = this.track;
    const maximum = Math.max(0, scrollWidth - clientWidth);

    this.root.querySelector('[data-direction="-1"]').disabled = scrollLeft <= 2;

    this.root.querySelector('[data-direction="1"]').disabled =
      scrollLeft >= maximum - 2;

    this.scrollbar.max = maximum;
    this.scrollbar.value = scrollLeft;
    this.scrollbar.hidden =
      maximum <= 2 || this.track.classList.contains("is-stills");

    const ratio = clientWidth / (scrollWidth || 1);

    const thumbWidth = Math.min(
      clientWidth,
      Math.max(100, clientWidth * ratio),
    );

    this.scrollbar.style.setProperty("--thumb-width", `${thumbWidth}px`);
  }
}

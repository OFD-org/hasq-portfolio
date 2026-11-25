import { t } from '../i18n.js';
export class WorkViewer {
  constructor() {
    this.dialog = document.createElement('dialog');
    this.dialog.className = 'work-viewer';
    this.dialog.setAttribute('aria-labelledby', 'viewer-title');
    this.dialog.innerHTML = `<div class="viewer-toolbar"><div><p class="viewer-category"></p><h3 id="viewer-title"></h3></div><button type="button" class="viewer-close" aria-label="${t('Close work')}">${t('Close')} <span aria-hidden="true">×</span></button></div><div class="viewer-stage"></div><p class="viewer-note"></p>`;
    document.body.append(this.dialog);
    document.addEventListener('languagechange', () => {
      const close = this.dialog.querySelector('.viewer-close');
      close.firstChild.textContent = t('Close') + ' ';
      close.setAttribute('aria-label', t('Close work'));
    });
    this.stage = this.dialog.querySelector('.viewer-stage');
    this.dialog.querySelector('.viewer-close').addEventListener('click', () => this.dialog.close());
    this.dialog.addEventListener('click', event => { if (event.target === this.dialog) this.dialog.close(); });
    this.dialog.addEventListener('close', () => {
      this.stage.querySelector('video')?.pause();
      this.stage.replaceChildren();
      document.documentElement.classList.remove('viewer-open');
      this.trigger?.focus({ preventScroll: true });
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.stage.querySelector('video')?.pause();
    });
  }

  open(project, trigger) {
    this.trigger = trigger;
    this.dialog.querySelector('h3').textContent = t(project.title);
    this.dialog.querySelector('.viewer-category').textContent = t(project.category);
    const media = document.createElement(project.image ? 'img' : 'video');
    const note = this.dialog.querySelector('.viewer-note');
    if (project.image) {
      media.alt = t(project.title);
      media.src = project.image;
      note.textContent = t('Static creative · Original composition');
    } else {
      media.src = project.video;
      media.poster = project.poster;
      media.controls = true;
      media.playsInline = true;
      media.preload = 'metadata';
      note.textContent = t('Full film · Use the player controls for sound and fullscreen');
    }
    media.addEventListener('error', () => { note.textContent = t('This media could not load. Close and reopen to retry.'); });
    this.stage.replaceChildren(media);
    this.dialog.showModal();
    document.documentElement.classList.add('viewer-open');
    if (!project.image) media.play().catch(() => { note.textContent = t('Press play to watch the full film.'); });
  }
}

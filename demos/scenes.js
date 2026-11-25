const sceneObserver = new IntersectionObserver(entries => {
  for (const entry of entries) entry.target.classList.toggle('in-scene', entry.isIntersecting);
}, {threshold: 0});
document.querySelectorAll('.record,.row,.steps li,figcaption,.pair .kicker,.storyline blockquote,.contact-channels li,.chapter-nav a,.case-panel').forEach(el => sceneObserver.observe(el));

const hero = document.querySelector('.cover,.title');
if (hero) {
  const wideMotion = matchMedia('(min-width:851px) and (prefers-reduced-motion:no-preference)');
  let frame = 0;
  function updateHero() {
    frame = 0;
    if (!wideMotion.matches) return;
    const rect = hero.getBoundingClientRect();
    if (rect.bottom <= 0) return;
    const progress = Math.min(1, Math.max(0, -rect.top / rect.height));
    hero.style.setProperty('--hero-scale', 1.055 - progress * .055);
    hero.style.setProperty('--plate-rise', -progress * 38 + 'px');
  }
  function queueHero() {
    if (wideMotion.matches && !frame) frame = requestAnimationFrame(updateHero);
  }
  addEventListener('scroll', queueHero, {passive: true});
  wideMotion.addEventListener('change', queueHero);
  updateHero();
}

const selector = document.querySelector('.case-selector');
if (selector) {
  const buttons = [...selector.querySelectorAll('button')];
  function selectCase(button) {
    for (const option of buttons) {
      const active = option === button;
      option.setAttribute('aria-pressed', String(active));
      document.getElementById(option.getAttribute('aria-controls')).hidden = !active;
    }
  }
  selector.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (button) selectCase(button);
  });
  selectCase(buttons[0]);
  selector.hidden = false;
}

const video = document.querySelector('.review-film video');
if (video) {
  const button = document.querySelector('.play-review');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let manual = null;
  let inView = false;
  let revision = 0;
  function updateLabel() {
    button.textContent = video.paused ? '후기 재생' : '잠시 멈춤';
  }
  function updateVideo() {
    const current = ++revision;
    if (inView && !document.hidden && (manual ?? !preference.matches)) {
      video.play().catch(() => { if (current === revision) updateLabel(); });
    } else {
      video.pause();
    }
  }
  button.addEventListener('click', () => {
    manual = video.paused;
    updateVideo();
  });
  for (const event of ['pause','play']) video.addEventListener(event, updateLabel);
  new IntersectionObserver(entries => {
    inView = entries[entries.length - 1].isIntersecting;
    updateVideo();
  }).observe(video);
  preference.addEventListener('change', () => { manual = null; updateVideo(); });
  document.addEventListener('visibilitychange', updateVideo);
  button.hidden = false;
}

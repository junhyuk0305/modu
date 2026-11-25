const sceneObserver = new IntersectionObserver(entries => {
  for (const entry of entries) entry.target.classList.toggle('in-scene', entry.isIntersecting);
}, {threshold: 0});
document.querySelectorAll('.row,.steps li,figcaption,.mission-quote,.pair .kicker,.contact-channels li,.chapter-nav a,.case-panel').forEach(el => sceneObserver.observe(el));

const hero = document.querySelector('.photo-hero');
if (hero) {
  const motion = matchMedia('(prefers-reduced-motion:no-preference)');
  const opening = hero.closest('.home-opening');
  let frame = 0;
  function updateHero() {
    frame = 0;
    if (!motion.matches) return;
    const rect = hero.getBoundingClientRect();
    if (opening) {
      const distance = opening.offsetHeight - hero.offsetHeight;
      const top = parseFloat(getComputedStyle(hero).top);
      const progress = Math.min(1, Math.max(0, (top - opening.getBoundingClientRect().top) / distance));
      hero.style.setProperty('--open', Math.min(1, progress / .75));
      hero.style.setProperty('--shade', Math.min(1, Math.max(0, (progress - .50) / .25)));
      hero.style.setProperty('--copy', Math.min(1, Math.max(0, (progress - .75) / .25)));
      hero.style.setProperty('--hero-pointer', progress > .75 ? 'auto' : 'none');
    } else {
      const progress = Math.min(1, Math.max(0, -rect.top / rect.height));
      hero.style.setProperty('--photo-shift', progress * 5 + '%');
    }
  }
  function queueHero() {
    if (motion.matches && !frame) frame = requestAnimationFrame(updateHero);
  }
  function configureHero() {
    opening?.classList.toggle('has-scroll-opening', motion.matches);
    updateHero();
  }
  addEventListener('scroll', queueHero, {passive: true});
  addEventListener('resize', queueHero);
  addEventListener('pageshow', queueHero);
  motion.addEventListener('change', configureHero);
  configureHero();
}

const historyTrack = document.querySelector('.history-track');
if (historyTrack) {
  const records = [...historyTrack.querySelectorAll('.record')];
  const dates = records.map(record => record.querySelector('.record-date'));
  const pictures = records.map(record => record.querySelector('figure'));
  const layout = historyTrack.parentElement;
  const stage = layout.querySelector('.history-stage');
  const desktop = matchMedia('(min-width:851px) and (min-height:500px)');
  let frame = 0;

  function arrangeHistory() {
    layout.classList.toggle('has-stage', desktop.matches);
    pictures.forEach((picture, i) => {
      (desktop.matches ? stage : records[i]).append(picture);
    });
    drawHistory();
  }
  function drawHistory() {
    frame = 0;
    const track = historyTrack.getBoundingClientRect();
    const tip = innerHeight * .52;
    const centers = dates.map(date => {
      const rect = date.getBoundingClientRect();
      return rect.top + rect.height / 2;
    });
    const active = centers.findLastIndex(center => center <= tip);
    const length = desktop.matches ? centers.at(-1) - track.top : track.height;
    const fill = Math.min(length, Math.max(0, tip - track.top));
    historyTrack.style.setProperty('--rail-height', length + 'px');
    historyTrack.style.setProperty('--rail-fill', fill + 'px');

    dates.forEach((date, i) => {
      const copy = date.parentElement;
      copy.classList.toggle('is-reached', i <= active);
      copy.classList.toggle('is-highlighted', desktop.matches ? i === active : i <= active);
      pictures[i].toggleAttribute('hidden', desktop.matches && i !== Math.max(0, active));
    });
  }
  function queueHistory() {
    if (!frame) frame = requestAnimationFrame(drawHistory);
  }
  addEventListener('scroll', queueHistory, {passive: true});
  addEventListener('resize', queueHistory);
  addEventListener('pageshow', queueHistory);
  new ResizeObserver(queueHistory).observe(document.querySelector('main'));
  desktop.addEventListener('change', arrangeHistory);
  arrangeHistory();
}

const strip = document.querySelector('.partner-strip');
if (strip) {
  const list = strip.querySelector('.partner-list');
  const duplicate = list.cloneNode(true);
  duplicate.setAttribute('aria-hidden', 'true');
  duplicate.inert = true;
  strip.append(duplicate);

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let reading = false;
  let onScreen = false;
  let frame = 0;
  let lastTime = 0;
  let position = 0;

  function advance(time) {
    const distance = lastTime ? Math.min(time - lastTime, 100) * .048 : 0;
    position = (position + distance) % list.offsetWidth;
    strip.scrollLeft = position;
    lastTime = time;
    frame = requestAnimationFrame(advance);
  }
  function syncStrip() {
    cancelAnimationFrame(frame);
    const moving = !reading && !reduce.matches && onScreen && !document.hidden;
    if (moving) {
      position = strip.scrollLeft;
      lastTime = 0;
      frame = requestAnimationFrame(advance);
    }
  }
  function pauseToBrowse() {
    reading = true;
    syncStrip();
  }
  strip.addEventListener('pointerdown', pauseToBrowse);
  strip.addEventListener('keydown', pauseToBrowse);
  strip.addEventListener('blur', () => { reading = false; syncStrip(); });
  document.addEventListener('visibilitychange', syncStrip);
  reduce.addEventListener('change', syncStrip);
  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    syncStrip();
  }).observe(strip);
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
  selectCase(buttons.find(button => '#' + button.getAttribute('aria-controls') === location.hash) || buttons[0]);
  selector.hidden = false;
}

const video = document.querySelector('.review-film video');
if (video) {
  const button = video.closest('button');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let manual = null;
  let inView = false;
  let revision = 0;
  function updateLabel() {
    button.setAttribute('aria-pressed', String(!video.paused));
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
}

const motion = matchMedia('(prefers-reduced-motion: no-preference)');
const menu = document.querySelector('.mobile');
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.open) {
    menu.open = false;
    menu.querySelector('summary').focus();
  }
});
const samples = Array.from(document.querySelectorAll('[data-sample]'));
if (samples.length) {
  const controls = document.querySelector('[data-controls]');
  const front = samples[0];
  const image = front.querySelector('img');
  const question = front.querySelector('strong');
  const counter = front.querySelector('.meta');
  const announcement = document.querySelector('[data-current]');
  const cards = samples.map(sample => ({
    src: sample.querySelector('img').getAttribute('src'),
    alt: sample.querySelector('img').alt,
    text: sample.querySelector('strong').textContent,
    count: sample.querySelector('.meta').textContent
  }));
  // The other faces reserve space for the longest question at each screen width.
  samples.slice(1).forEach(sample => { sample.inert = true; });
  front.parentElement.classList.add('is-ready');
  let current = 0;
  let turn;
  function showSample(direction) {
    const card = cards[current];
    question.textContent = card.text;
    counter.textContent = card.count;
    image.alt = card.alt;
    image.src = card.src;
    announcement.textContent = card.count + '. ' + card.text;
    turn?.cancel();
    if (motion.matches) {
      turn = question.animate(
        [{transform: `translateX(${direction * 2}px)`}, {transform: 'none'}],
        {duration: 140, easing: 'ease-out'}
      );
    }
  }
  controls.hidden = false;
  controls.addEventListener('click', event => {
    const step = event.target.closest('[data-step]');
    if (!step) return;
    const direction = Number(step.dataset.step);
    current = (current + direction + samples.length) % samples.length;
    showSample(direction);
  });
}
const copy = document.querySelector('[data-copy]');
if (copy && navigator.clipboard) {
  copy.hidden = false;
  copy.addEventListener('click', async () => {
    const status = document.querySelector('[data-status]');
    try {
      await navigator.clipboard.writeText(copy.dataset.copy);
      status.textContent = '이메일 주소를 복사했습니다.';
    } catch {
      status.textContent = '위에 표시된 이메일 주소를 선택해 복사해 주세요.';
    }
  });
}
const fineWheel = matchMedia('(hover: hover) and (pointer: fine)');
let smoothScroll;
// Observe the stationary frame so an image's changing clip cannot retrigger itself.
if ('IntersectionObserver' in window) {
  const photos = document.querySelectorAll('main img:not(.partner-logo)');
  const photoObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const image = entry.target.querySelector('img');
      if (!entry.isIntersecting) image.classList.remove('photo-in-view');
      else image.classList.add('photo-in-view');
    }
  }, {threshold: 0});

  for (const image of photos) {
    const markReady = () => image.classList.add('photo-ready');
    image.addEventListener('load', markReady);
    image.addEventListener('error', markReady);
    if (image.complete && image.hasAttribute('src')) markReady();
    photoObserver.observe(image.parentElement);
  }
  document.documentElement.classList.add('photo-motion');
}
function configureMotion() {
  smoothScroll?.destroy();
  if (!motion.matches) {
    document.getAnimations().forEach(animation => animation.cancel());
    return;
  }
  if (fineWheel.matches && window.Lenis) {
    smoothScroll = new Lenis({
      autoRaf: true,
      smoothWheel: true,
      syncTouch: false,
      lerp: 0.085,
      wheelMultiplier: 0.88,
      prevent: node => node.closest('dialog, .mobile[open]')
    });
  }

}
motion.addEventListener('change', configureMotion);
fineWheel.addEventListener('change', configureMotion);
configureMotion();

const notes = document.querySelector('.story-notes');
if (notes) {
  const controls = document.querySelector('.story-controls');
  const chapters = Array.from(notes.children);
  function positions() {
    const left = notes.getBoundingClientRect().left;
    return chapters.map(chapter => Math.min(notes.scrollWidth - notes.clientWidth,
      notes.scrollLeft + chapter.getBoundingClientRect().left - left));
  }
  function chapterIndex() {
    const distances = positions().map(x => Math.abs(x - notes.scrollLeft));
    return distances.indexOf(Math.min(...distances));
  }
  function updateChapters() {
    const index = chapterIndex();
    controls.querySelector('span').textContent = (index + 1) + ' / ' + chapters.length;
    controls.firstElementChild.disabled = index === 0;
    controls.lastElementChild.disabled = index === chapters.length - 1;
  }
  controls.hidden = false;
  controls.addEventListener('click', event => {
    const button = event.target.closest('[data-story]');
    if (!button) return;
    notes.scrollTo({left: positions()[chapterIndex() + Number(button.dataset.story)],
      behavior: motion.matches ? 'smooth' : 'instant'});
  });
  notes.addEventListener('scroll', updateChapters, {passive:true});
  window.addEventListener('resize', updateChapters);
  updateChapters();
}

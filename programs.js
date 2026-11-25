document.documentElement.classList.add('demo-ready');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) entry.target.classList.toggle('on-screen',entry.isIntersecting);
  });
  const targets = document.documentElement.classList.contains('photo-motion') ? '.lab-cover' : '.photo,.lab-cover';
  document.querySelectorAll(targets).forEach(el=>observer.observe(el));
  document.documentElement.classList.add('motion');
}
const scene = document.querySelector('.scene');
const index = [...document.querySelectorAll('.guide-aside nav a')];
const header = document.querySelector('.bar');
const sceneMotion = matchMedia('(prefers-reduced-motion:no-preference)');
let scheduled = false;
function syncScroll() {
  scheduled = false;
  const rect = scene.getBoundingClientRect();
  if (rect.bottom >= 0 && sceneMotion.matches) scene.style.setProperty('--shift', Math.max(0,Math.min(1,-rect.top/rect.height))*4+'%');
  if (index.length) {
    const readingEdge = header.getBoundingClientRect().bottom + 48;
    const current = index.findLast(link => document.getElementById(link.hash.slice(1)).getBoundingClientRect().top <= readingEdge) || index[0];
    for (const link of index) {
      if (link === current) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    }
  }
}
function queueScroll() {
  if (!scheduled) { scheduled = true; requestAnimationFrame(syncScroll); }
}
addEventListener('scroll',queueScroll,{passive:true});
addEventListener('resize',queueScroll);
addEventListener('pageshow',queueScroll);
syncScroll();

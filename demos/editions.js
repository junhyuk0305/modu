// Alternate local review editions share the published copy and navigation.
(() => {
  const edition = new URLSearchParams(location.search).get('edition');
  if (!['photo', 'contents'].includes(edition)) return;

  const pictures = {
    'page-index': ['card-table', '찻잔 옆에 펼쳐 놓은 마잇카드'],
    'page-company': ['office', '군포에 자리한 주식회사 모두랑 사무실'],
    'page-product': ['kit-white', '마잇카드와 활동 자료 구성'],
    'page-programs': ['songbu-class', '송부종합사회복지관 학부모 수업'],
    'page-impact': ['booth-wide', '송부종합사회복지관 느린학습자 인식개선 부스']
  };
  const scenes = [...document.querySelectorAll('main > section')];
  const hero = scenes[0];
  if (!hero) return;
  document.documentElement.dataset.edition = edition;
  const picture = pictures[document.body.className];
  if (picture) {
    const copy = hero.querySelector('.wrap > div:first-child');
    const frame = hero.querySelector('.feature-media');
    if (edition === 'photo') {
      const img = frame.querySelector('img');
      img.src = '../images/field/' + picture[0] + '.webp';
      img.alt = picture[1];
      const caption = document.createElement('span');
      caption.className = 'cover-caption';
      caption.textContent = picture[1];
      frame.append(caption);
    } else {
      const nav = document.createElement('nav');
      nav.className = 'chapter-nav';
      nav.setAttribute('aria-label', '이 페이지의 목차');
      scenes.slice(1).forEach((scene, index) => {
        scene.id ||= 'chapter-' + (index + 1);
        const a = document.createElement('a');
        a.href = '#' + scene.id;
        a.textContent = scene.querySelector('.kicker').textContent;
        nav.append(a);
      });
      copy.append(nav);

      const jump = document.createElement('details');
      jump.className = 'chapter-jump';
      jump.hidden = true;
      const summary = document.createElement('summary');
      summary.textContent = '목차';
      jump.append(summary, nav.cloneNode(true));
      document.body.append(jump);
      function trackChapter() {
        const top = document.querySelector('.bar').offsetHeight;
        jump.hidden = hero.getBoundingClientRect().bottom > top ||
          document.querySelector('.foot').getBoundingClientRect().top < innerHeight * .5;
        if (jump.hidden) jump.open = false;
        const active = scenes.slice(1).filter(section =>
          section.getBoundingClientRect().top < innerHeight * .45).pop() || scenes[1];
        for (const link of jump.querySelectorAll('a')) {
          if (link.hash === '#' + active.id) {
            link.setAttribute('aria-current', 'location');
            summary.textContent = '목차 · ' + link.textContent;
          } else link.removeAttribute('aria-current');
        }
      }
      jump.addEventListener('click', event => {
        if (event.target.closest('a')) jump.open = false;
      });
      jump.addEventListener('keydown', event => {
        if (event.key === 'Escape') { jump.open = false; summary.focus(); }
      });
      const tracker = new IntersectionObserver(trackChapter, {
        rootMargin: '-20% 0px -55% 0px', threshold: [0, .01]
      });
      for (const scene of [...scenes, document.querySelector('.foot')]) tracker.observe(scene);

    }
  }
  for (const a of document.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href');
    if (/^(index|company|product|programs|impact|contact)\.html(?:#|$)/.test(href)) {
      a.setAttribute('href', href.replace('.html', '.html?edition=' + edition));
    }
  }
})();
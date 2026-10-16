let mobileExpanded = false;
const mobileGrid = document.querySelector('#mobile-grid');
const mobileToggle = document.querySelector('#show-mobile');
const quietMotion = matchMedia('(prefers-reduced-motion: reduce)');

function renderMobileFilms() {
  const list = mobileExpanded ? mobileWorks : mobileWorks.slice(0, 3);
  const fragment = document.createDocumentFragment();
  list.forEach((work, index) => {
    const article = document.createElement('article');
    article.className = 'mobile-card';
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `播放手机影像 ${index + 1}`);
    const frame = document.createElement('div');
    frame.className = 'mobile-image';
    const image = document.createElement('img');
    image.src = work.poster;
    image.alt = work.title;
    image.loading = 'lazy';
    image.width = 720;
    image.height = 1280;
    const play = document.createElement('span');
    play.textContent = '▶';
    play.setAttribute('aria-hidden', 'true');
    frame.append(image, play);
    const title = document.createElement('h3');
    title.textContent = work.title;
    button.append(frame, title);
    button.addEventListener('click', () => openWork(work, button));
    article.append(button);
    fragment.append(article);
  });
  mobileGrid.replaceChildren(fragment);
  mobileToggle.setAttribute('aria-expanded', String(mobileExpanded));
  mobileToggle.innerHTML = mobileExpanded ? '收起手机影像 <b aria-hidden="true">−</b>' : `查看全部手机影像 <span>${mobileWorks.length}</span><b aria-hidden="true">＋</b>`;
  if (!quietMotion.matches) [...mobileGrid.children].forEach((card, index) => {
    card.animate([{ opacity: .3, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 360, delay: index * 45, easing: 'cubic-bezier(.2,.7,.2,1)' });
  });
}
mobileToggle.addEventListener('click', () => {
  mobileExpanded = !mobileExpanded;
  renderMobileFilms();
  if (!mobileExpanded) document.querySelector('#mobile-films').scrollIntoView({ behavior: quietMotion.matches ? 'instant' : 'smooth' });
});
renderMobileFilms();

const previewSequences = { all: ['sunset', 'forest', 'archive-18'], sea: ['sunset', 'beach', 'islands'], forest: ['archive-07', 'forest', 'archive-02'], daily: ['archive-18', 'archive-01', 'archive-14'] };
const homePhotoGrid = document.querySelector('#home-photo-grid');
function renderPhotographyPreview(album = 'all') {
  homePhotoGrid.replaceChildren();
  previewSequences[album].forEach((id, index) => {
    const photo = photos.find(item => item.id === id);
    const link = document.createElement('a');
    link.className = `album-card ${['album-sea', 'album-forest', 'album-daily'][index]}`;
    link.href = `photography.html?photo=${encodeURIComponent(photo.id)}`;
    if (album !== 'all') link.href += `&album=${album}`;
    link.setAttribute('aria-label', `查看摄影作品：${photo.title}`);
    const image = document.createElement('img');
    image.src = photo.src;
    image.alt = photo.alt;
    image.width = photo.width;
    image.height = photo.height;
    image.loading = 'lazy';
    const reveal = document.createElement('span');
    reveal.className = 'photo-peek';
    reveal.setAttribute('aria-hidden', 'true');
    reveal.textContent = '↗';
    link.append(image, reveal);
    homePhotoGrid.append(link);
    if (!quietMotion.matches) link.animate([{ opacity: .4, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 360, delay: index * 45, easing: 'cubic-bezier(.2,.7,.2,1)' });
  });
  document.querySelector('#all-photographs').href = 'photography.html';
}
document.querySelectorAll('.home-photo-filter').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.home-photo-filter').forEach(filter => {
    const active = filter === button;
    filter.classList.toggle('active', active);
    filter.setAttribute('aria-pressed', String(active));
  });
  renderPhotographyPreview(button.dataset.album);
}));
renderPhotographyPreview();

const sectionLinks = [...document.querySelectorAll('.archive-nav a')];
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) sectionLinks.forEach(link => {
      const selected = link.getAttribute('href') === `#${entry.target.id}`;
      link.classList.toggle('active', selected);
      if (selected) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-10% 0px -70% 0px', threshold: 0 });
sectionLinks.forEach(link => sectionObserver.observe(document.querySelector(link.getAttribute('href'))));

if (!quietMotion.matches) {
  document.querySelector('.profile-copy').animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 550, easing: 'cubic-bezier(.2,.7,.2,1)' });
  const reveal = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.animate([{ opacity: .45, transform: 'translateY(15px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 480, easing: 'cubic-bezier(.2,.7,.2,1)' });
      reveal.unobserve(entry.target);
    });
  }, { threshold: .15 });
  document.querySelectorAll('.section-heading,.album-card').forEach(element => reveal.observe(element));
}

// Navigation to a hidden archive is an explicit request to reveal that content.
const visualArchive = document.querySelector('#visual-archive');
document.querySelectorAll('a[href="#visual-archive"]').forEach(link => {
  link.addEventListener('click', event => {
    if (visualArchive.open) return;
    event.preventDefault();
    visualArchive.open = true;
    requestAnimationFrame(() => document.querySelector(link.getAttribute('href')).scrollIntoView({behavior:quietMotion.matches?'instant':'smooth'}));
  });
});

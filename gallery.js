const photoGrid = document.querySelector('#photo-grid');
const photoDialog = document.querySelector('#photo-dialog');
const photoImage = document.querySelector('#photo-full');
const photoCanvas = document.querySelector('.photo-canvas');
let visiblePhotos = photos;
let photoIndex = 0;
let photoTrigger;
let touchStart;

function renderPhotos(group = 'all') {
  visiblePhotos = group === 'all' ? photos : photos.filter(photo => photo.album === group);
  const fragment = document.createDocumentFragment();
  visiblePhotos.forEach((photo, index) => {
    const figure = document.createElement('figure');
    figure.className = 'photo-card';
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `查看照片：${photo.title}`);
    const frame = document.createElement('div');
    frame.className = 'photo-image';
    const image = document.createElement('img');
    image.src = photo.thumb;
    image.alt = photo.alt;
    image.width = photo.width;
    image.height = photo.height;
    image.loading = 'lazy';
    image.decoding = 'async';
    frame.append(image);
    button.append(frame);
    button.addEventListener('click', () => openPhoto(index, button));
    figure.append(button);
    fragment.append(figure);
  });
  photoGrid.replaceChildren(fragment);
  document.querySelector('#photo-count').textContent = `${visiblePhotos.length} 张照片`;
  photoGrid.classList.remove('is-switching');
  void photoGrid.offsetWidth;
  photoGrid.classList.add('is-switching');
}

document.querySelectorAll('.photo-filter').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.photo-filter').forEach(filter => {
    filter.classList.toggle('active', filter === button);
    filter.setAttribute('aria-pressed', String(filter === button));
  });
  renderPhotos(button.dataset.group);
}));

function showPhoto(index) {
  photoIndex = index;
  const photo = visiblePhotos[index];
  photoCanvas.classList.add('is-loading');
  photoCanvas.classList.remove('is-zoomed');
  photoCanvas.scrollTo(0, 0);
  document.querySelector('#photo-zoom').setAttribute('aria-pressed', 'false');
  document.querySelector('#photo-zoom').setAttribute('aria-label', '放大照片');
  document.querySelector('#photo-zoom').textContent = '放大';
  document.querySelector('#photo-status').textContent = '正在加载…';
  photoImage.alt = photo.alt;
  photoImage.src = photo.src;
  document.querySelector('#photo-caption').textContent = photo.title;
  document.querySelector('#photo-position').textContent = `${String(index + 1).padStart(2, '0')} / ${visiblePhotos.length}`;
  document.querySelector('#photo-download').href = photo.src;
  document.querySelector('#photo-download').download = `${photo.title}.webp`;
  document.querySelector('#photo-prev').disabled = index === 0;
  document.querySelector('#photo-next').disabled = index === visiblePhotos.length - 1;
}
function openPhoto(index, trigger) {
  photoTrigger = trigger;
  showPhoto(index);
  photoDialog.showModal();
  document.body.classList.add('modal-open');
  document.querySelector('#photo-close').focus();
}
photoImage.addEventListener('load', () => {
  photoCanvas.classList.remove('is-loading');
  document.querySelector('#photo-status').textContent = '';
});
photoImage.addEventListener('error', () => {
  photoCanvas.classList.remove('is-loading');
  document.querySelector('#photo-status').textContent = '照片暂时无法加载';
});
document.querySelector('#photo-close').addEventListener('click', () => photoDialog.close());
document.querySelector('#photo-prev').addEventListener('click', () => { if (photoIndex > 0) showPhoto(photoIndex - 1); });
document.querySelector('#photo-next').addEventListener('click', () => { if (photoIndex < visiblePhotos.length - 1) showPhoto(photoIndex + 1); });
document.querySelector('#photo-zoom').addEventListener('click', event => {
  const zoomed = photoCanvas.classList.toggle('is-zoomed');
  event.currentTarget.setAttribute('aria-pressed', String(zoomed));
  event.currentTarget.setAttribute('aria-label', zoomed ? '缩小照片' : '放大照片');
  event.currentTarget.textContent = zoomed ? '缩小' : '放大';
});
photoDialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' && photoIndex > 0) { event.preventDefault(); showPhoto(photoIndex - 1); }
  if (event.key === 'ArrowRight' && photoIndex < visiblePhotos.length - 1) { event.preventDefault(); showPhoto(photoIndex + 1); }
});
photoDialog.addEventListener('click', event => {
  if (event.target === photoDialog) {
    const r = photoDialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) photoDialog.close();
  }
});
photoDialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  photoTrigger?.focus();
});
photoCanvas.addEventListener('touchstart', event => { touchStart = event.touches[0].clientX; }, { passive: true });
photoCanvas.addEventListener('touchend', event => {
  if (photoCanvas.classList.contains('is-zoomed') || touchStart === undefined) return;
  const delta = event.changedTouches[0].clientX - touchStart;
  if (delta > 65 && photoIndex > 0) showPhoto(photoIndex - 1);
  if (delta < -65 && photoIndex < visiblePhotos.length - 1) showPhoto(photoIndex + 1);
  touchStart = undefined;
}, { passive: true });


const requestedAlbum = new URLSearchParams(location.search).get('album');
const initialAlbum = ['sea', 'forest', 'daily'].includes(requestedAlbum) ? requestedAlbum : 'all';
document.querySelectorAll('.photo-filter').forEach(button => {
  const selected = button.dataset.group === initialAlbum;
  button.classList.toggle('active', selected);
  button.setAttribute('aria-pressed', String(selected));
});
renderPhotos(initialAlbum);
const galleryTheme = document.querySelector('.gallery-theme');
function applyGalleryTheme(theme) {
  document.documentElement.dataset.theme = theme;
  galleryTheme.textContent = theme === 'light' ? '深色' : '浅色';
  galleryTheme.setAttribute('aria-label', `切换到${theme === 'light' ? '深色' : '浅色'}模式`);
}
try { applyGalleryTheme(localStorage.getItem('zx-theme-v2') === 'light' ? 'light' : 'dark'); } catch {}
galleryTheme.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  applyGalleryTheme(theme);
  try { localStorage.setItem('zx-theme-v2', theme); } catch {}
});

const requestedPhoto = new URLSearchParams(location.search).get('photo');
if (requestedPhoto) {
  const requestedIndex = visiblePhotos.findIndex(photo => photo.id === requestedPhoto);
  if (requestedIndex >= 0) openPhoto(requestedIndex, document.querySelectorAll('.photo-card button')[requestedIndex]);
}

import { loadJSON, renderLinks, showError } from './content.js';

const gallery = document.getElementById('gallery');
const viewer = document.getElementById('imageViewer');
const preview = document.getElementById('viewerImage');
let previousFocus;

function closeViewer() {
    viewer.classList.remove('active');
    preview.removeAttribute('src');
    document.body.style.overflow = '';
    previousFocus?.focus();
}

function openViewer(image) {
    previousFocus = image;
    preview.src = image.src;
    preview.alt = image.alt;
    viewer.classList.add('active');
    document.body.style.overflow = 'hidden';
    viewer.focus();
}

viewer.addEventListener('click', event => {
    if (event.target === viewer) closeViewer();
});
viewer.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeViewer();
    if (event.key === 'Tab') { event.preventDefault(); viewer.focus(); }
});

async function renderGallery() {
    try {
        const files = await loadJSON('./gallery.json');
        const fragment = document.createDocumentFragment();
        for (const file of files) {
            const item = document.createElement('div');
            item.className = 'item';
            if (file.type === 'image') {
                const image = document.createElement('img');
                image.src = file.web;
                image.alt = file.title || file.name;
                image.loading = 'lazy';
                image.decoding = 'async';
                image.tabIndex = 0;
                image.setAttribute('aria-label', `${image.alt}. Double-click or press Enter to enlarge.`);
                image.addEventListener('error', () => {
                    if (image.getAttribute('src') !== file.highRes) image.src = file.highRes;
                });
                image.addEventListener('dblclick', () => openViewer(image));
                image.addEventListener('keydown', event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault(); openViewer(image);
                    }
                });
                const download = document.createElement('a');
                download.href = file.highRes;
                download.download = file.name;
                download.className = 'download-btn';
                download.textContent = 'Download High-Res';
                item.append(image, download);
            } else if (file.type === 'video') {
                const video = document.createElement('video');
                video.controls = true;
                video.preload = 'none';
                video.playsInline = true;
                video.hidden = true;
                video.setAttribute('aria-label', file.title || file.name);
                if (file.poster) video.poster = file.poster;
                const container = document.createElement('div');
                container.className = 'video-preview';
                const play = document.createElement('button');
                play.type = 'button';
                play.className = 'video-play';
                play.setAttribute('aria-label', `Play ${file.title || file.name}`);
                if (file.poster) {
                    const poster = document.createElement('img');
                    poster.src = file.poster;
                    poster.alt = '';
                    poster.loading = 'lazy';
                    poster.decoding = 'async';
                    if (file.width && file.height) {
                        poster.width = video.width = file.width;
                        poster.height = video.height = file.height;
                    }
                    play.append(poster);
                }
                const label = document.createElement('span');
                label.textContent = `▶ Play ${file.title || file.name}`;
                play.append(label);
                const status = document.createElement('p');
                status.className = 'video-status';
                status.setAttribute('role', 'status');
                play.addEventListener('click', () => {
                    gallery.querySelectorAll('video').forEach(other => {
                        if (other !== video) other.pause();
                    });
                    video.hidden = false;
                    play.hidden = true;
                    status.textContent = 'Loading video…';
                    if (!video.getAttribute('src')) video.src = file.web;
                    video.play().catch(error => {
                        if (error.name !== 'AbortError') status.textContent = 'Use the video’s play button to start.';
                    });
                });
                video.addEventListener('playing', () => { status.textContent = ''; });
                video.addEventListener('waiting', () => { status.textContent = 'Loading video…'; });
                video.addEventListener('error', () => {
                    status.textContent = 'This video couldn’t load. Try again or use Download Video.';
                    video.hidden = true;
                    play.hidden = false;
                    video.removeAttribute('src');
                    video.load();
                });
                const download = document.createElement('a');
                download.href = file.highRes;
                download.download = file.name;
                download.className = 'download-btn';
                download.textContent = 'Download Video';
                video.append('Your browser cannot play this video. Use Download Video below.');
                container.append(video, play);
                item.append(container, status, download);
            } else continue;
            fragment.append(item);
        }
        gallery.replaceChildren(fragment);
    } catch (error) {
        showError(gallery, 'Artwork could not load. Please refresh.');
        console.error(error);
    }
}

async function renderProjects() {
    const container = document.getElementById('project-links');
    try { renderLinks(container, await loadJSON('./projects.json')); }
    catch (error) {
        showError(container, 'Projects could not load. Please refresh.');
        console.error(error);
    }
}

await Promise.all([renderGallery(), renderProjects()]);

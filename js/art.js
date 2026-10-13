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
                video.src = file.web;
                video.controls = true;
                video.preload = 'metadata';
                video.playsInline = true;
                video.setAttribute('aria-label', file.title || file.name);
                const download = document.createElement('a');
                download.href = file.highRes;
                download.download = file.name;
                download.className = 'download-btn';
                download.textContent = 'Download Video';
                video.append('Your browser cannot play this video. Use Download Video below.');
                item.append(video, download);
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

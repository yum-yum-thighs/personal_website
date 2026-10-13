import { loadJSON, renderLinks, showError } from './content.js';

try {
    const data = await loadJSON('./links.json');
    for (const section of ['other', 'mine']) {
        renderLinks(document.getElementById(`${section}-links`), data[section] || []);
    }
} catch (error) {
    showError(document.getElementById('other-links'), 'Resources could not load. Please refresh.');
    console.error(error);
}

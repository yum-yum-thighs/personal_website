export async function loadJSON(url) {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Could not load ${url}: ${response.status}`);
    return response.json();
}

export function renderLinks(container, links) {
    const fragment = document.createDocumentFragment();
    for (const item of links) {
        if (!item?.title || !item?.url || item.url === '#') continue;
        const url = new URL(item.url, window.location.href);
        if (!['http:', 'https:'].includes(url.protocol)) continue;
        const link = document.createElement('a');
        link.className = 'link';
        link.href = item.url;
        link.textContent = item.title;
        if (url.origin !== window.location.origin) {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        }
        fragment.append(link);
    }
    container.replaceChildren(fragment);
}

export function showError(container, message) {
    container.textContent = message;
}

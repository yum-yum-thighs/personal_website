export function initMarquee(speed) {
    const marquee = document.getElementById('marquee');
    if (!marquee) return;

    const spans = marquee.querySelectorAll('span');
    if (spans.length > 0) {
        for (let i = 0; i < 4; i++) {
            spans.forEach(span => {
                marquee.appendChild(span.cloneNode(true));
            });
        }

        let position = 0;
        function step() {
            position -= speed;
            const halfWidth = marquee.scrollWidth / 2;
            if (Math.abs(position) >= halfWidth) {
                position = 0;
            }
            marquee.style.transform = `translateX(${position}px)`;
            requestAnimationFrame(step);
        }

        marquee.innerHTML += marquee.innerHTML;
        requestAnimationFrame(step);
    }
}

export function initMarquee(speed) {
    const marquee = document.getElementById('marquee');
    if (!marquee) return;

    const originals = [...marquee.querySelectorAll('span')];
    if (window.matchMedia('(pointer: coarse)').matches) {
        originals.forEach(span => { span.textContent = 'Tap a box to access it'; });
    }

    let cycleWidth = 0;
    let position = 0;
    let resizeFrame;

    function fill() {
        marquee.replaceChildren(...originals.map(span => span.cloneNode(true)));
        while (marquee.scrollWidth < window.innerWidth + 200) {
            originals.forEach(span => marquee.append(span.cloneNode(true)));
        }
        cycleWidth = marquee.scrollWidth;
        [...marquee.children].forEach(span => marquee.append(span.cloneNode(true)));
        position = 0;
        marquee.style.transform = 'translateX(0)';
    }

    fill();
    let previousTime;
    function step(time) {
        const frames = previousTime ? Math.min((time - previousTime) / (1000 / 60), 3) : 1;
        previousTime = time;
        position -= speed * frames;
        if (-position >= cycleWidth) position += cycleWidth;
        marquee.style.transform = `translateX(${position}px)`;
        requestAnimationFrame(step);
    }
    requestAnimationFrame(step);

    window.addEventListener('resize', () => {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(fill);
    });
}

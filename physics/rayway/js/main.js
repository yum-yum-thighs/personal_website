let canvas, ctx;
let currentLevel = null;
const keys = {};

function fitCanvasToWindow() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (currentLevel && typeof currentLevel.resize === 'function') {
        currentLevel.resize(canvas.width, canvas.height);
    }
}

window.addEventListener('load', () => {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    fitCanvasToWindow();

    window.addEventListener('resize', fitCanvasToWindow);
    window.addEventListener('keydown', (e) => { keys[e.key] = true; });
    window.addEventListener('keyup', (e) => { keys[e.key] = false; });

    if (typeof Level !== 'undefined') {
        currentLevel = new Level(1, canvas.width, canvas.height);
    }

    requestAnimationFrame(gameLoop);
});

function gameLoop() {
    if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (currentLevel) {
            currentLevel.update(keys);
            currentLevel.draw(ctx);
        }
    }
    requestAnimationFrame(gameLoop);
}

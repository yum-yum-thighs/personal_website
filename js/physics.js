import { CONFIG, validateAllLinks } from './config.js';

export function initPhysics() {
    const validation = validateAllLinks();
    if (!validation.valid) console.error('Link configuration errors:', validation.errors);

    const { Engine, Render, Runner, Bodies, Body, Composite, Mouse, MouseConstraint, Events, Query, Constraint } = Matter;
    const engine = Engine.create();
    const world = engine.world;
    const render = Render.create({
        element: document.body,
        engine,
        options: {
            width: window.innerWidth,
            height: window.innerHeight,
            wireframes: false,
            background: 'transparent'
        }
    });

    render.canvas.style.touchAction = 'none';
    Render.run(render);
    Runner.run(Runner.create(), engine);

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: { stiffness: 0.2, render: { visible: false } }
    });
    Composite.add(world, mouseConstraint);
    render.mouse = mouse;

    let sceneObjects = [];
    let interactiveBodies = [];
    let navigationBodies = [];
    let labelSize = 26;

    function buildScene() {
        for (const object of sceneObjects) Composite.remove(world, object);
        sceneObjects = [];

        const width = window.innerWidth;
        const height = window.innerHeight;
        const bannerBottom = document.getElementById('ui-layer').getBoundingClientRect().bottom;
        const compact = width < 800;
        const boxSize = compact ? CONFIG.boxSize * 0.7 : CONFIG.boxSize;
        const maxOffset = Math.max(...CONFIG.links.map(link => Math.abs(link.xOffset)), 1);
        const xScale = Math.min(1, Math.max(0, (width - boxSize - 24) / (2 * maxOffset)));
        const wallThickness = 200;

        const inset = 10;
        const walls = [
            Bodies.rectangle(width / 2, height - inset + wallThickness / 2, width * 2, wallThickness, { isStatic: true, render: { visible: false } }),
            Bodies.rectangle(width / 2, -wallThickness / 2, width * 2, wallThickness, { isStatic: true, render: { visible: false } }),
            Bodies.rectangle(inset - wallThickness / 2, height / 2, wallThickness, height * 2, { isStatic: true, render: { visible: false } }),
            Bodies.rectangle(width - inset + wallThickness / 2, height / 2, wallThickness, height * 2, { isStatic: true, render: { visible: false } })
        ];

        const boxes = CONFIG.links.map(link => {
            const y = Math.min(link.y, height - boxSize / 2 - 12);
            const body = Bodies.rectangle(width / 2 + link.xOffset * xScale, Math.max(bannerBottom + boxSize, y), boxSize, boxSize, {
                restitution: 0.8,
                frictionAir: 0.02,
                render: { fillStyle: '#111111', strokeStyle: '#00ffff', lineWidth: 2 }
            });
            body.customLabel = link.label;
            body.targetUrl = link.url;
            return body;
        });

        const cradleScale = Math.min(1, (width - 32) / (CONFIG.cradle.items.length * (CONFIG.cradle.ballSize + 2)));
        const ballSize = Math.max(20, CONFIG.cradle.ballSize * cradleScale);
        const spacing = ballSize + 2 * cradleScale;
        const cradleLength = compact ? Math.min(CONFIG.cradle.length, Math.max(60, height * 0.22)) : CONFIG.cradle.length;
        const startX = width / 2 - (CONFIG.cradle.items.length - 1) * spacing / 2;
        const cradleBodies = [];
        const ropes = [];

        CONFIG.cradle.items.forEach((item, index) => {
            const x = startX + index * spacing;
            const body = Bodies.rectangle(x, bannerBottom + cradleLength, ballSize, ballSize, {
                restitution: 0.98,
                friction: 0,
                frictionAir: 0.001,
                slop: 0.005,
                render: { fillStyle: '#111111', strokeStyle: '#ff00ff', lineWidth: 2 }
            });
            body.customLabel = item.label;
            const rope = Constraint.create({
                pointA: { x, y: bannerBottom },
                bodyB: body,
                pointB: { x: 0, y: -ballSize / 2 },
                length: cradleLength,
                stiffness: 1,
                render: { strokeStyle: '#00ffff', lineWidth: 1, anchors: false }
            });
            cradleBodies.push(body);
            ropes.push(rope);
        });

        sceneObjects = [...walls, ...boxes, ...cradleBodies, ...ropes];
        interactiveBodies = [...boxes, ...cradleBodies];
        navigationBodies = boxes;
        labelSize = compact ? Math.max(18, ballSize * 0.58) : 26;
        Composite.add(world, sceneObjects);
    }

    Events.on(engine, 'afterUpdate', () => {
        const inset = 12;
        for (const body of navigationBodies) {
            const dx = body.bounds.min.x < inset ? inset - body.bounds.min.x
                : body.bounds.max.x > window.innerWidth - inset ? window.innerWidth - inset - body.bounds.max.x : 0;
            const dy = body.bounds.max.y > window.innerHeight - inset
                ? window.innerHeight - inset - body.bounds.max.y : 0;
            if (dx || dy) Body.translate(body, { x: dx, y: dy });
        }
    });

    Events.on(render, 'afterRender', () => {
        const context = render.context;
        context.font = `${labelSize}px "CMUNRM", serif`;
        context.fillStyle = '#ff00ff';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        interactiveBodies.forEach(body => {
            context.save();
            context.translate(body.position.x, body.position.y);
            context.rotate(body.angle);
            context.fillText(body.customLabel, 0, 0);
            context.restore();
        });
    });

    function targetAt(event) {
        const rect = render.canvas.getBoundingClientRect();
        const point = {
            x: (event.clientX - rect.left) * render.canvas.width / rect.width,
            y: (event.clientY - rect.top) * render.canvas.height / rect.height
        };
        return Query.point(interactiveBodies, point).find(body => body.targetUrl);
    }

    function navigate(event) {
        const target = targetAt(event);
        if (target) window.location.href = target.targetUrl;
    }

    // Desktop keeps double-click. A short touch opens a box on phones.
    render.canvas.addEventListener('dblclick', navigate);
    const touches = new Map();
    render.canvas.addEventListener('pointerdown', event => {
        if (event.pointerType === 'mouse') return;
        touches.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY,
            time: performance.now(),
            target: targetAt(event)
        });
    });
    render.canvas.addEventListener('pointerup', event => {
        const start = touches.get(event.pointerId);
        touches.delete(event.pointerId);
        if (!start) return;
        const distance = Math.hypot(event.clientX - start.x, event.clientY - start.y);
        if (start.target && distance < 12 && performance.now() - start.time < 450) {
            window.location.href = start.target.targetUrl;
        }
    });
    render.canvas.addEventListener('pointercancel', event => touches.delete(event.pointerId));

    function resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        render.options.width = render.canvas.width = width;
        render.options.height = render.canvas.height = height;
        render.bounds.max.x = width;
        render.bounds.max.y = height;
        buildScene();
    }

    let resizeFrame;
    window.addEventListener('resize', () => {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(resize);
    });

    buildScene();
}

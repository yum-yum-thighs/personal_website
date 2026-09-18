import { CONFIG } from './config.js';

export function initPhysics() {
    const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, Events, Query, Constraint } = Matter;

    const engine = Engine.create();
    const world = engine.world;

    const render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: window.innerWidth,
            height: window.innerHeight,
            wireframes: false,
            background: 'transparent'
        }
    });

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    // Bulletproof Boundary walls
    const wallThickness = 200;
    const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + wallThickness / 2, window.innerWidth * 2, wallThickness, { isStatic: true, restitution: 1.0, render: { visible: false } });
    const ceiling = Bodies.rectangle(window.innerWidth / 2, -wallThickness / 2 - 100, window.innerWidth * 2, wallThickness, { isStatic: true, restitution: 1.0, render: { visible: false } });
    const leftWall = Bodies.rectangle(-wallThickness / 2 - 100, window.innerHeight / 2, wallThickness, window.innerHeight * 2, { isStatic: true, restitution: 1.0, render: { visible: false } });
    const rightWall = Bodies.rectangle(window.innerWidth + wallThickness / 2, window.innerHeight / 2, wallThickness, window.innerHeight * 2, { isStatic: true, restitution: 1.0, render: { visible: false } });

    Composite.add(world, [ground, ceiling, leftWall, rightWall]);

    // 1. Create Free-Floating Boxes
    const scale = window.innerWidth < 800 ? window.innerWidth / 1000 : 1;
    const boxSize = window.innerWidth < 800 ? CONFIG.boxSize * 0.7 : CONFIG.boxSize;

    const boxBodies = CONFIG.boxesData.map(data => {
        const body = Bodies.rectangle(window.innerWidth / 2 + (data.xOffset * scale), data.y, boxSize, boxSize, {
            restitution: 0.8,
            frictionAir: 0.02,
            render: {
                fillStyle: '#111111',
                strokeStyle: '#00ffff',
                lineWidth: 2
            }
        });
        body.customLabel = data.label;
        body.targetUrl = data.url;
        return body;
    });

    Composite.add(world, boxBodies);

    // 2. Find the exact bottom line of your top HTML banner
    const uiLayer = document.getElementById('ui-layer');
    const bannerBottom = uiLayer ? uiLayer.getBoundingClientRect().bottom : 80; 

    // 3. Create the bigger 7-Item Newton's Cradle
    const centerX = window.innerWidth / 2;
    const ballSize = CONFIG.cradle.ballSize;
    const spacing = ballSize + 2; 
    const totalWidth = CONFIG.cradle.items.length * spacing;
    const startX = centerX - totalWidth / 2 + ballSize / 2;

    const cradleBodies = [];

    CONFIG.cradle.items.forEach((item, index) => {
        const xPos = startX + (index * spacing);
        const yPos = bannerBottom + CONFIG.cradle.length;

        const pivot = { x: xPos, y: bannerBottom };

        const body = Bodies.rectangle(xPos, yPos, ballSize, ballSize, {
            restitution: 0.98,
            friction: 0.0,
            frictionAir: 0.001,
            slop: 0.005,
            render: {
                fillStyle: '#111111',
                strokeStyle: '#ff00ff',
                lineWidth: 2
            }
        });
        body.customLabel = item.label;
        body.targetUrl = item.url;

        const rope = Constraint.create({
            pointA: pivot,
            bodyB: body,
            pointB: { x: 0, y: -ballSize / 2 },
            length: CONFIG.cradle.length,
            stiffness: 1.0,
            render: {
                strokeStyle: '#00ffff',
                lineWidth: 1,
                anchors: false
            }
        });

        Composite.add(world, [body, rope]);
        cradleBodies.push(body);
    });

    const allInteractiveBodies = [...boxBodies, ...cradleBodies];

    Events.on(render, 'afterRender', () => {
        const context = render.context;
        context.font = '26px "CMUNRM", serif'; // Slightly larger font for bigger boxes
        context.fillStyle = '#ff00ff';
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        allInteractiveBodies.forEach(body => {
            const { x, y } = body.position;
            context.save();
            context.translate(x, y);
            context.rotate(body.angle);
            context.fillText(body.customLabel, 0, 0);
            context.restore();
        });
    });

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: { visible: false }
        }
    });
    Composite.add(world, mouseConstraint);
    render.mouse = mouse;

    render.canvas.addEventListener('dblclick', (event) => {
        const rect = render.canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        const clickedBodies = Query.point(allInteractiveBodies, { x: clickX, y: clickY });

        if (clickedBodies.length > 0) {
            const targetBody = clickedBodies[0];
            if (targetBody.targetUrl) {
                window.location.href = targetBody.targetUrl;
            }
        }
    });

    window.addEventListener('resize', () => {
        render.canvas.width = window.innerWidth;
        render.canvas.height = window.innerHeight;
    });
}

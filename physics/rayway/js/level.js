const OPTIC_COLORS = {
    concaveMirror: '#00ff66',
    convexMirror: '#00e5ff',
    concaveLens: '#b026ff',
    convexLens: '#ff2bd6',
    planeMirror: '#00ffff',
};

const PALETTE = {
    bgGrid: 'rgba(0, 255, 0, 0.04)',
    wall: '#00FF00',
    wallGlow: 'rgba(0, 255, 0, 0.6)',
    axis: '#00FF00',
    rayFocus: '#ff0055',
    rayCenter: '#00e5ff',
    image: '#ff9100',
    object: '#00e5ff',
    exitBox: '#ff0055',
    pickupIcon: '#00ff66',
    hudBg: 'rgba(10, 12, 20, 0.92)',
    hudBorder: 'rgba(0, 255, 0, 0.4)',
    hudText: '#ffffff',
    hudAccent: '#00ff66',
};

const OPTIC_TYPES = {
    concaveMirror: { focalLength: 100 },
    convexMirror: { focalLength: -100 },
    concaveLens: { focalLength: -100 },
    convexLens: { focalLength: 100 },
    planeMirror: { focalLength: Infinity },
};

const ARROW_HEIGHT = 40;
const ARROW_SPEED = 4;
const INTERACT_RADIUS = 100;
const ROTATE_STEP_DEG = 15;
const FOCAL_STEP = 20;
const FOCAL_MAX = 200;
const FOCAL_MIN = 40;

const KEY_BINDINGS = {
    '1': { action: 'drop', optic: 'concaveMirror' },
    '2': { action: 'drop', optic: 'convexMirror' },
    '3': { action: 'drop', optic: 'concaveLens' },
    '4': { action: 'drop', optic: 'convexLens' },
    '5': { action: 'drop', optic: 'planeMirror' },
    e: { action: 'rotateCW' }, E: { action: 'rotateCW' },
    q: { action: 'rotateCCW' }, Q: { action: 'rotateCCW' },
    c: { action: 'cycleRadius' }, C: { action: 'cycleRadius' },
    t: { action: 'teleportToImage' }, T: { action: 'teleportToImage' },
    f: { action: 'pickUp' }, F: { action: 'pickUp' },
    r: { action: 'reset' }, R: { action: 'reset' },
    Escape: { action: 'back' },
};

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function labelChip(ctx, text, x, y, color) {
    ctx.save();
    ctx.font = '11px monospace';
    const w = ctx.measureText(text).width + 12;
    ctx.fillStyle = 'rgba(10, 12, 20, 0.9)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    roundRect(ctx, x - w / 2, y - 8, w, 16, 4);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
    ctx.restore();
}

class Level {
    constructor(levelNum, canvasWidth = window.innerWidth, canvasHeight = window.innerHeight) {
        this.number = levelNum;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.keyPrev = {};
        this.isWin = false;
        
        this.backBtnBounds = { x: 16, y: 12, width: 80, height: 28 };
        this.handleCanvasClick = this.handleCanvasClick.bind(this);
        window.removeEventListener('click', this.handleCanvasClick);
        window.addEventListener('click', this.handleCanvasClick);

        this.init();
    }

    init() {
        this.isWin = false;
        const w = this.canvasWidth;
        const h = this.canvasHeight;
        
        this.sidebarWidth = 220;
        const playW = w - this.sidebarWidth;

        // Central axis line passing horizontally through the middle of the room
        this.centerY = h / 2;

        this.walls = [
            { x1: 20, y1: 50, x2: playW, y2: 50 },
            { x1: 20, y1: h - 20, x2: playW, y2: h - 20 },
            { x1: 20, y1: 50, x2: 20, y2: h - 20 },
            { x1: playW, y1: 50, x2: playW, y2: h - 20 },
            { x1: playW * 0.5, y1: 50, x2: playW * 0.5, y2: h - 20 },
        ];

        this.pickups = [];

        this.exitZone = {
            x: playW * 0.65,
            y: this.centerY - 40,
            width: playW * 0.25,
            height: 80,
        };

        this.inventory = {
            concaveMirror: 1,
            convexMirror: 1,
            concaveLens: 1,
            convexLens: 1,
            planeMirror: 1,
        };

        this.placedOptics = [];
        this.calculatedImage = null;
        this.rayPaths = [];

        // Player arrow stands right on the central axis line
        this.arrow = {
            x: playW * 0.25,
            y: this.centerY,
            height: ARROW_HEIGHT,
            speed: ARROW_SPEED,
            isInverted: false,
        };
    }

    handleCanvasClick(e) {
        const rect = e.target.getBoundingClientRect ? e.target.getBoundingClientRect() : { left: 0, top: 0 };
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        const btn = this.backBtnBounds;

        if (clickX >= btn.x && clickX <= btn.x + btn.width && clickY >= btn.y && clickY <= btn.y + btn.height) {
            window.history.back();
        }
    }

    resize(w, h) {
        this.canvasWidth = w;
        this.canvasHeight = h;
        this.init();
    }

    getInteractableOptic() {
        if (this.placedOptics.length === 0) return null;
        let closest = null, minDist = Infinity;
        for (const opt of this.placedOptics) {
            const dist = Math.hypot(this.arrow.x - opt.x, this.arrow.y - opt.y);
            if (dist < minDist) { minDist = dist; closest = opt; }
        }
        return (closest && minDist < INTERACT_RADIUS) ? { optic: closest } : null;
    }

    dropOptic(type) {
        if (this.inventory[type] <= 0) return;
        
        // Placed directly centered on the central axis line passing through the middle
        this.placedOptics.push({
            type,
            x: this.arrow.x,
            y: this.centerY,
            focalLength: OPTIC_TYPES[type].focalLength,
            rotation: 0,
        });
        this.inventory[type]--;
    }

    rotateClosestOptic(direction) {
        const target = this.getInteractableOptic();
        if (target) {
            target.optic.rotation = (target.optic.rotation + (direction * ROTATE_STEP_DEG) + 360) % 360;
        }
    }

    cycleClosestRadius() {
        const target = this.getInteractableOptic();
        if (!target || target.optic.type === 'planeMirror') return;
        let nextAbsF = Math.abs(target.optic.focalLength) + FOCAL_STEP;
        if (nextAbsF > FOCAL_MAX) nextAbsF = FOCAL_MIN;
        target.optic.focalLength = nextAbsF * Math.sign(target.optic.focalLength);
    }

    pickUpClosestOptic() {
        const target = this.getInteractableOptic();
        if (!target) return;
        const idx = this.placedOptics.indexOf(target.optic);
        if (idx !== -1) {
            this.inventory[target.optic.type]++;
            this.placedOptics.splice(idx, 1);
            this.calculatedImage = null;
            this.rayPaths = [];
        }
    }

    checkPickups() {
        this.pickups.forEach((p) => {
            if (!p.collected && Math.hypot(this.arrow.x - p.x, this.arrow.y - p.y) < 45) {
                p.collected = true;
                this.inventory[p.opticType]++;
            }
        });
    }

    checkWinCondition() {
        const ez = this.exitZone;
        if (
            this.arrow.x >= ez.x &&
            this.arrow.x <= ez.x + ez.width &&
            this.arrow.y >= ez.y - 40 &&
            this.arrow.y <= ez.y + ez.height + 40
        ) {
            this.isWin = true;
        }
    }

    teleportArrowToImage() {
        if (!this.calculatedImage) return;
        const playW = this.canvasWidth - this.sidebarWidth;
        this.arrow.x = Math.min(playW - 30, Math.max(30, this.calculatedImage.x));
        this.arrow.y = this.centerY;
        this.arrow.height = Math.max(20, Math.min(80, this.calculatedImage.height));
        this.arrow.isInverted = this.calculatedImage.isInverted;
    }

    calculateOptics() {
        this.rayPaths = [];
        this.calculatedImage = null;
        if (this.placedOptics.length === 0) return;

        const playerTopY = this.arrow.y - (this.arrow.isInverted ? -this.arrow.height : this.arrow.height);
        let posX = this.arrow.x;
        let posY = playerTopY;

        for (const optic of this.placedOptics) {
            const rad = (optic.rotation * Math.PI) / 180;
            const normX = Math.cos(rad);
            const normY = Math.sin(rad);
            const opticCenterY = optic.y;

            if (optic.type === 'planeMirror') {
                const vx = posX - optic.x;
                const vy = posY - opticCenterY;
                const dot = vx * normX + vy * normY;

                const imgX = optic.x + (vx - 2 * dot * normX);
                const imgY = opticCenterY + (vy - 2 * dot * normY);

                const hit1 = { x: optic.x - normY * 20, y: opticCenterY + normX * 20 };
                const hit2 = { x: optic.x + normY * 20, y: opticCenterY - normX * 20 };

                this.rayPaths.push({
                    rays: [
                        [
                            { from: { x: posX, y: posY }, to: hit1, isVirtual: false },
                            { from: hit1, to: { x: imgX, y: imgY }, isVirtual: true }
                        ],
                        [
                            { from: { x: posX, y: posY }, to: hit2, isVirtual: false },
                            { from: hit2, to: { x: imgX, y: imgY }, isVirtual: true }
                        ]
                    ]
                });

                this.calculatedImage = {
                    x: imgX,
                    y: this.centerY,
                    height: this.arrow.height,
                    isInverted: this.arrow.isInverted
                };
            } else {
                const dx = posX - optic.x;
                const dy = posY - opticCenterY;
                const u_o = Math.hypot(dx, dy);
                if (u_o < 1e-3) continue;

                const f = optic.focalLength;
                const isLens = optic.type.toLowerCase().includes('lens');

                let u_i;
                if (isLens) {
                    u_i = (f * u_o) / (u_o - f);
                } else {
                    u_i = (f * u_o) / (u_o - f);
                }

                const magnification = isLens ? (u_i / u_o) : (-u_i / u_o);
                const imgHeight = Math.min(80, Math.max(20, Math.abs(magnification) * this.arrow.height));
                const isInverted = magnification < 0 ? !this.arrow.isInverted : this.arrow.isInverted;

                const dirX = dx / u_o;
                const dirY = dy / u_o;
                const imgX = optic.x + dirX * Math.abs(u_i);
                const imgY = opticCenterY + dirY * Math.abs(u_i);

                const hit1 = { x: optic.x - normY * 20, y: opticCenterY + normX * 20 };
                const hit2 = { x: optic.x + normY * 20, y: opticCenterY - normX * 20 };

                this.rayPaths.push({
                    rays: [
                        [
                            { from: { x: posX, y: posY }, to: hit1, isVirtual: false },
                            { from: hit1, to: { x: imgX, y: imgY }, isVirtual: false }
                        ],
                        [
                            { from: { x: posX, y: posY }, to: hit2, isVirtual: false },
                            { from: hit2, to: { x: imgX, y: imgY }, isVirtual: false }
                        ]
                    ]
                });

                this.calculatedImage = {
                    x: imgX,
                    y: this.centerY,
                    height: imgHeight,
                    isInverted: isInverted
                };
            }
        }
    }

    handleAction(binding) {
        switch (binding.action) {
            case 'drop': this.dropOptic(binding.optic); break;
            case 'rotateCW': this.rotateClosestOptic(1); break;
            case 'rotateCCW': this.rotateClosestOptic(-1); break;
            case 'cycleRadius': this.cycleClosestRadius(); break;
            case 'teleportToImage': this.teleportArrowToImage(); break;
            case 'pickUp': this.pickUpClosestOptic(); break;
            case 'reset': this.init(); break;
            case 'back': window.history.back(); break;
        }
    }

    update(keys) {
        const isKeyPressed = (k) => keys[k] && !this.keyPrev[k];

        for (const key in KEY_BINDINGS) {
            if (isKeyPressed(key)) this.handleAction(KEY_BINDINGS[key]);
        }
        for (const key in KEY_BINDINGS) this.keyPrev[key] = !!keys[key];

        let nextX = this.arrow.x;
        if (keys['a'] || keys['A'] || keys['ArrowLeft']) nextX -= this.arrow.speed;
        if (keys['d'] || keys['D'] || keys['ArrowRight']) nextX += this.arrow.speed;

        const playW = this.canvasWidth - this.sidebarWidth;
        this.arrow.x = Math.min(playW - 25, Math.max(25, nextX));

        this.checkPickups();
        this.checkWinCondition();
        this.calculateOptics();
    }

    draw(ctx) {
        ctx.save();
        this.drawBackgroundGrid(ctx);
        this.drawWalls(ctx);
        this.drawCentralAxis(ctx);
        this.drawExitZone(ctx);
        this.drawPickups(ctx);
        this.drawRayPaths(ctx);
        this.drawOptics(ctx);
        this.drawImage(ctx);
        this.drawObjectArrow(ctx);
        this.drawTopBarHud(ctx);
        this.drawRightSideGuide(ctx);

        if (this.isWin) this.drawWinBanner(ctx);
        ctx.restore();
    }

    drawBackgroundGrid(ctx) {
        ctx.strokeStyle = PALETTE.bgGrid;
        ctx.lineWidth = 1;
        for (let x = 0; x < this.canvasWidth; x += 40) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.canvasHeight); ctx.stroke();
        }
        for (let y = 0; y < this.canvasHeight; y += 40) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.canvasWidth, y); ctx.stroke();
        }
    }

    drawWalls(ctx) {
        ctx.save();
        ctx.strokeStyle = PALETTE.wall;
        ctx.shadowColor = PALETTE.wallGlow;
        ctx.shadowBlur = 12;
        ctx.lineWidth = 4;
        this.walls.forEach((w) => {
            ctx.beginPath(); ctx.moveTo(w.x1, w.y1); ctx.lineTo(w.x2, w.y2); ctx.stroke();
        });
        ctx.restore();
    }

    drawCentralAxis(ctx) {
        ctx.save();
        ctx.strokeStyle = PALETTE.axis;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(20, this.centerY);
        ctx.lineTo(this.canvasWidth - this.sidebarWidth, this.centerY);
        ctx.stroke();
        ctx.restore();
    }

    drawExitZone(ctx) {
        const ez = this.exitZone;
        ctx.save();
        ctx.strokeStyle = PALETTE.exitBox;
        ctx.fillStyle = 'rgba(255, 0, 85, 0.15)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        roundRect(ctx, ez.x, ez.y, ez.width, ez.height, 8);
        ctx.fill(); ctx.stroke();

        ctx.font = 'bold 18px monospace';
        ctx.fillStyle = PALETTE.exitBox;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('EXIT', ez.x + ez.width / 2, ez.y + ez.height / 2);
        ctx.restore();
    }

    drawPickups(ctx) {
        this.pickups.forEach((p) => {
            if (p.collected) return;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.strokeStyle = PALETTE.pickupIcon;
            ctx.fillStyle = 'rgba(0, 255, 102, 0.15)';
            ctx.lineWidth = 2.5;
            ctx.shadowBlur = 12;
            ctx.shadowColor = PALETTE.pickupIcon;

            ctx.beginPath();
            this.traceOpticShape(ctx, p.opticType);
            ctx.stroke();
            ctx.restore();

            labelChip(ctx, `[Pick Up] ${p.label}`, p.x, p.y - 45, PALETTE.pickupIcon);
        });
    }

    drawTopBarHud(ctx) {
        ctx.save();
        ctx.font = 'bold 16px monospace';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = PALETTE.hudAccent;
        ctx.fillText('← Back', 16, 25);
        ctx.restore();
    }

    drawRightSideGuide(ctx) {
        ctx.save();
        const x = this.canvasWidth - this.sidebarWidth + 10;
        const y = 10;
        const w = this.sidebarWidth - 20;
        const h = this.canvasHeight - 20;

        ctx.fillStyle = PALETTE.hudBg;
        ctx.strokeStyle = PALETTE.hudBorder;
        ctx.lineWidth = 1.5;
        roundRect(ctx, x, y, w, h, 8);
        ctx.fill(); ctx.stroke();

        ctx.font = 'bold 13px monospace';
        ctx.fillStyle = PALETTE.hudAccent;
        ctx.fillText('GAME GUIDE', x + 12, y + 25);

        ctx.font = '11px monospace';

        const lines = [
            '--------------------',
            'CONTROLS:',
            '[1] Concave Mirror',
            '[2] Convex Mirror',
            '[3] Concave Lens',
            '[4] Convex Lens',
            '[5] Plane Mirror',
            '',
            'INVENTORY COUNT:',
            `1. Concave : x${this.inventory.concaveMirror}`,
            `2. Convex  : x${this.inventory.convexMirror}`,
            `3. Con.Lens: x${this.inventory.concaveLens}`,
            `4. Cvx.Lens: x${this.inventory.convexLens}`,
            `5. Plane   : x${this.inventory.planeMirror}`,
            '',
            'ACTIONS:',
            '[Q] Rotate Anti-CW',
            '[E] Rotate Clockwise',
            '[C] Change Curvature',
            '[T] Teleport to Image',
            '[F] Pick Up Item',
            '[R] Reset Level',
        ];

        let lineY = y + 44;
        lines.forEach((line) => {
            if (line.startsWith('[')) ctx.fillStyle = '#00ff66';
            else if (line.endsWith(':')) ctx.fillStyle = '#00e5ff';
            else if (line.includes(': x')) ctx.fillStyle = '#ffea00';
            else ctx.fillStyle = PALETTE.hudText;

            ctx.fillText(line, x + 12, lineY);
            lineY += 16;
        });

        ctx.restore();
    }

    drawRayPaths(ctx) {
        this.rayPaths.forEach((stage) => {
            const colors = [PALETTE.rayFocus, PALETTE.rayCenter];
            stage.rays.forEach((raySegs, i) => {
                const color = colors[i] || PALETTE.rayFocus;
                raySegs.forEach((seg) => {
                    ctx.save();
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2;
                    if (seg.isVirtual) ctx.setLineDash([5, 5]);
                    ctx.beginPath();
                    ctx.moveTo(seg.from.x, seg.from.y);
                    ctx.lineTo(seg.to.x, seg.to.y);
                    ctx.stroke();
                    ctx.restore();
                });
            });
        });
    }

    drawOptics(ctx) {
        this.placedOptics.forEach((opt) => {
            const color = OPTIC_COLORS[opt.type];
            ctx.save();
            ctx.translate(opt.x, opt.y);
            ctx.rotate(((opt.rotation || 0) * Math.PI) / 180);
            ctx.shadowBlur = 12;
            ctx.shadowColor = color;
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;

            ctx.beginPath();
            this.traceOpticShape(ctx, opt.type);
            ctx.stroke();
            ctx.restore();
        });
    }

    traceOpticShape(ctx, type) {
        // Correctly centered directly intersecting the axis line passing through the middle
        if (type === 'concaveMirror') {
            ctx.arc(0, 0, 30, Math.PI * 0.75, Math.PI * 1.25);
        } else if (type === 'convexMirror') {
            ctx.arc(0, 0, 30, Math.PI * 1.75, Math.PI * 0.25);
        } else if (type === 'planeMirror') {
            ctx.moveTo(0, -30); ctx.lineTo(0, 30);
        } else if (type === 'concaveLens') {
            ctx.moveTo(-8, -35); ctx.lineTo(8, -35);
            ctx.quadraticCurveTo(0, 0, 8, 35); ctx.lineTo(-8, 35);
            ctx.quadraticCurveTo(0, 0, -8, -35);
        } else if (type === 'convexLens') {
            ctx.ellipse(0, 0, 6, 30, 0, 0, Math.PI * 2);
        }
    }

    drawImage(ctx) {
        if (!this.calculatedImage) return;
        const img = this.calculatedImage;
        const topY = img.y - (img.isInverted ? -img.height : img.height);

        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = PALETTE.image;
        ctx.strokeStyle = PALETTE.image;
        ctx.lineWidth = 2;

        ctx.beginPath(); ctx.moveTo(img.x, img.y); ctx.lineTo(img.x, topY); ctx.stroke();
        labelChip(ctx, 'image [T]', img.x, img.y - img.height - 15, PALETTE.image);
        ctx.restore();
    }

    drawObjectArrow(ctx) {
        const dir = this.arrow.isInverted ? -1 : 1;
        const topY = this.arrow.y - (this.arrow.height * dir);

        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = PALETTE.object;
        ctx.strokeStyle = PALETTE.object;
        ctx.fillStyle = PALETTE.object;
        ctx.lineWidth = 3;

        ctx.beginPath(); ctx.moveTo(this.arrow.x, this.arrow.y); ctx.lineTo(this.arrow.x, topY); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.arrow.x - 5, topY + (8 * dir));
        ctx.lineTo(this.arrow.x, topY);
        ctx.lineTo(this.arrow.x + 5, topY + (8 * dir));
        ctx.fill();

        labelChip(ctx, 'You', this.arrow.x, this.arrow.y + 20, PALETTE.object);
        ctx.restore();
    }

    drawWinBanner(ctx) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.88)';
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        ctx.font = 'bold 36px monospace';
        ctx.fillStyle = '#00ff66';
        ctx.textAlign = 'center';
        ctx.fillText('ESCAPE SUCCESSFUL!', this.canvasWidth / 2, this.canvasHeight / 2 - 10);

        ctx.font = '16px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Press [R] to replay level', this.canvasWidth / 2, this.canvasHeight / 2 + 30);
        ctx.restore();
    }
}

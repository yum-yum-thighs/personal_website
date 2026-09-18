/* ===== COLORS ===== */
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
    ray1: '#ff0055',
    ray2: '#00e5ff',
    image: '#ff9100',
    imageVirtual: '#ff3333',
    object: '#00e5ff',
    exitBox: '#ff0055',
    hudBg: 'rgba(10, 12, 20, 0.92)',
    hudBorder: 'rgba(0, 255, 0, 0.4)',
    hudText: '#ffffff',
    hudAccent: '#00ff66',
};

/* ===== OPTIC DEFAULTS ===== */
const OPTIC_TYPES = {
    concaveMirror: { focalLength: 100 },
    convexMirror: { focalLength: -100 },
    concaveLens: { focalLength: -100 },
    convexLens: { focalLength: 100 },
    planeMirror: { focalLength: Infinity },
};

/* ===== GAMEPLAY CONSTANTS ===== */
const ARROW_HEIGHT = 50;
const ARROW_SPEED = 4;
const INTERACT_RADIUS = 100;
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

/* ===== HELPERS ===== */
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

/* ========================================================================
   LEVEL CLASS
   ======================================================================== */
class Level {
    constructor(levelNum, canvasWidth, canvasHeight) {
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

    /* ------------------------------------------------------------------
       INIT — builds the level layout
       ------------------------------------------------------------------ */
    init() {
        this.isWin = false;
        const w = this.canvasWidth;
        const h = this.canvasHeight;
        this.sidebarWidth = 220;
        const playW = w - this.sidebarWidth;
        this.centerY = h / 2;

        // Outer walls
        this.walls = [
            { x1: 20, y1: 50, x2: playW, y2: 50 },
            { x1: 20, y1: h - 20, x2: playW, y2: h - 20 },
            { x1: 20, y1: 50, x2: 20, y2: h - 20 },
            { x1: playW, y1: 50, x2: playW, y2: h - 20 },
        ];

        // Level-specific walls
        if (this.number === 1) {
            this.walls.push({ x1: playW * 0.5, y1: 50, x2: playW * 0.5, y2: h - 150 });
        } else if (this.number === 2) {
            this.walls.push({ x1: playW * 0.5, y1: 50, x2: playW * 0.5, y2: h - 20 });
        }

        this.exitZone = { x: playW * 0.65, y: this.centerY - 40, width: playW * 0.25, height: 80 };

        this.inventory = {
            concaveMirror: 1, convexMirror: 1,
            concaveLens: 1, convexLens: 1,
            planeMirror: 1,
        };

        this.placedOptics = [];
        this.calculatedImage = null;
        this.rayPaths = [];
        this.teleportFlash = 0;

        this.arrow = {
            x: playW * 0.25,
            y: this.centerY,
            height: ARROW_HEIGHT,
            speed: ARROW_SPEED,
            isInverted: false,
        };
    }

    handleCanvasClick(e) {
        const rect = e.target && e.target.getBoundingClientRect
            ? e.target.getBoundingClientRect() : { left: 0, top: 0 };
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        const b = this.backBtnBounds;
        if (cx >= b.x && cx <= b.x + b.width && cy >= b.y && cy <= b.y + b.height) {
            window.history.back();
        }
    }

    resize(w, h) { this.canvasWidth = w; this.canvasHeight = h; this.init(); }

    /* ------------------------------------------------------------------
       COORDINATE TRANSFORMS
       ------------------------------------------------------------------ */
    worldToOpticLocal(worldX, worldY, optic) {
        const dx = worldX - optic.x;
        const dy = worldY - optic.y;
        const angle = (optic.rotation || 0) * Math.PI / 180;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: dx * cos + dy * sin,
            y: -dx * sin + dy * cos
        };
    }

    opticLocalToWorld(localX, localY, optic) {
        const angle = (optic.rotation || 0) * Math.PI / 180;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: optic.x + localX * cos - localY * sin,
            y: optic.y + localX * sin + localY * cos
        };
    }

    /* ------------------------------------------------------------------
       OPTIC INTERACTION
       ------------------------------------------------------------------ */
    getInteractableOptic() {
        let closest = null, minDist = Infinity;
        for (const opt of this.placedOptics) {
            const dist = Math.hypot(this.arrow.x - opt.x, this.arrow.y - opt.y);
            if (dist < minDist) { minDist = dist; closest = opt; }
        }
        return (closest && minDist < INTERACT_RADIUS) ? { optic: closest } : null;
    }

    dropOptic(type) {
        if (this.inventory[type] <= 0) return;
        this.placedOptics.push({
            type, x: this.arrow.x, y: this.centerY,
            focalLength: OPTIC_TYPES[type].focalLength, rotation: 0,
        });
        this.inventory[type]--;
    }

    rotateClosestOptic(direction) {
        const t = this.getInteractableOptic();
        if (!t) return;
        t.optic.rotation = (t.optic.rotation + direction * 15 + 360) % 360;
    }

    cycleClosestRadius() {
        const t = this.getInteractableOptic();
        if (!t || t.optic.type === 'planeMirror') return;
        let nextF = Math.abs(t.optic.focalLength) + FOCAL_STEP;
        if (nextF > FOCAL_MAX) nextF = FOCAL_MIN;
        t.optic.focalLength = nextF * Math.sign(t.optic.focalLength);
    }

    pickUpClosestOptic() {
        const t = this.getInteractableOptic();
        if (!t) return;
        const idx = this.placedOptics.indexOf(t.optic);
        if (idx !== -1) {
            this.inventory[t.optic.type]++;
            this.placedOptics.splice(idx, 1);
            this.calculatedImage = null;
            this.rayPaths = [];
        }
    }

    teleportArrowToImage() {
        if (!this.calculatedImage) return; // Can now teleport to ALL images
        const playW = this.canvasWidth - this.sidebarWidth;
        // The image object has the calculated x,y world coordinates of its base
        this.arrow.x = Math.min(playW - 30, Math.max(30, this.calculatedImage.x));
        this.arrow.y = this.calculatedImage.y;
        this.arrow.height = Math.max(20, Math.min(80, this.calculatedImage.height));
        this.arrow.isInverted = this.calculatedImage.isInverted;
    }

    checkWinCondition() {
        const ez = this.exitZone;
        if (this.arrow.x >= ez.x && this.arrow.x <= ez.x + ez.width &&
            this.arrow.y >= ez.y - 40 && this.arrow.y <= ez.y + ez.height + 40) {
            this.isWin = true;
        }
    }

    /* ==================================================================
       CORE OPTICS — Thin lens / mirror equation with proper ray diagram
       ================================================================== */
    calculateOptics() {
        this.rayPaths = [];
        this.calculatedImage = null;
        if (this.placedOptics.length === 0) return;

        // Current base and tip start as the arrow itself
        const dir = this.arrow.isInverted ? -1 : 1;
        let currentBase = { x: this.arrow.x, y: this.arrow.y };
        let currentTip = { x: this.arrow.x, y: this.arrow.y - this.arrow.height * dir };
        
        let h = this.arrow.height;
        let inv = this.arrow.isInverted;

        // Sort optics by physical distance from the current object base
        const optics = [...this.placedOptics].sort(
            (a, b) => Math.hypot(a.x - currentBase.x, a.y - currentBase.y) - 
                      Math.hypot(b.x - currentBase.x, b.y - currentBase.y)
        );

        for (const optic of optics) {
            const baseLocal = this.worldToOpticLocal(currentBase.x, currentBase.y, optic);
            const tipLocal = this.worldToOpticLocal(currentTip.x, currentTip.y, optic);

            const u = Math.abs(baseLocal.x);
            if (u < 1) continue; // practically on top of it

            const objLeft = baseLocal.x < 0; 
            const f = optic.focalLength;
            const type = optic.type;

            const isPlane = type === 'planeMirror';
            const isLens = type === 'concaveLens' || type === 'convexLens';
            const isMirror = type === 'concaveMirror' || type === 'convexMirror';

            const hObj = tipLocal.y - baseLocal.y; // height relative to base in local Y

            let imgBaseLocalX, imgTipLocalY, isReal, imgInverted, imgHeight;

            if (isPlane) {
                // Plane mirror
                imgBaseLocalX = -baseLocal.x; // reflection across Y axis
                imgTipLocalY = tipLocal.y;
                isReal = false;
                imgInverted = inv; 
                imgHeight = h;
            } else if (isLens || isMirror) {
                // Lens / Mirror Equation
                let v;
                const denom = u - f;
                if (Math.abs(denom) < 0.01) {
                    v = 100000;
                } else {
                    v = (f * u) / denom;
                }

                const m = -(v / u);
                const hImg = hObj * m;
                isReal = v > 0;

                if (isLens) {
                    imgBaseLocalX = isReal ? (objLeft ? v : -v) : (objLeft ? -Math.abs(v) : Math.abs(v));
                } else { 
                    imgBaseLocalX = isReal ? (objLeft ? -v : v) : (objLeft ? Math.abs(v) : -Math.abs(v));
                }

                imgTipLocalY = baseLocal.y + hImg;
                imgHeight = Math.min(120, Math.max(10, Math.abs(hImg)));
                imgInverted = inv !== (m < 0);
            } else {
                continue;
            }

            // Calculate world points for the image
            const imgBaseWorld = this.opticLocalToWorld(imgBaseLocalX, baseLocal.y, optic);
            const imgTipWorld = this.opticLocalToWorld(imgBaseLocalX, imgTipLocalY, optic);

            // ---- TEXTBOOK RAY DIAGRAM ----
            // Ray 1: Parallel to optic's axis. Hits surface at local x=0, local y=tipLocal.y
            const hit1Local = { x: 0, y: tipLocal.y };
            // Ray 2: Through optical center. Hits surface at local x=0, local y=baseLocal.y
            const hit2Local = { x: 0, y: baseLocal.y }; 

            const hit1World = this.opticLocalToWorld(hit1Local.x, hit1Local.y, optic);
            const hit2World = this.opticLocalToWorld(hit2Local.x, hit2Local.y, optic);

            // Function to generate the physical and virtual rays
            const pushRay = (hitWorld) => {
                const segs = [];
                // Incident ray
                segs.push({ from: { ...currentTip }, to: { ...hitWorld }, isVirtual: false });
                
                if (isReal) {
                    // Refracted/Reflected ray goes straight to the real image
                    segs.push({ from: { ...hitWorld }, to: { ...imgTipWorld }, isVirtual: false });
                    // Extend the ray past the real image
                    const dx = imgTipWorld.x - hitWorld.x;
                    const dy = imgTipWorld.y - hitWorld.y;
                    segs.push({ from: { ...imgTipWorld }, to: { x: imgTipWorld.x + dx * 2, y: imgTipWorld.y + dy * 2 }, isVirtual: false });
                } else {
                    // Virtual image: dashed backward ray
                    segs.push({ from: { ...hitWorld }, to: { ...imgTipWorld }, isVirtual: true }); 
                    // Actual real ray diverges away from the virtual image
                    const dx = hitWorld.x - imgTipWorld.x;
                    const dy = hitWorld.y - imgTipWorld.y;
                    segs.push({ from: { ...hitWorld }, to: { x: hitWorld.x + dx * 10, y: hitWorld.y + dy * 10 }, isVirtual: false });
                }
                return segs;
            };

            this.rayPaths.push({ rays: [pushRay(hit1World), pushRay(hit2World)] });

            this.calculatedImage = {
                x: imgBaseWorld.x, y: imgBaseWorld.y,
                tipX: imgTipWorld.x, tipY: imgTipWorld.y,
                height: imgHeight, isInverted: imgInverted, isVirtual: !isReal
            };

            currentBase = { ...imgBaseWorld };
            currentTip = { ...imgTipWorld };
            h = imgHeight;
            inv = imgInverted;
        }
    }

    /* ------------------------------------------------------------------
       INPUT HANDLING
       ------------------------------------------------------------------ */
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
        const pressed = k => keys[k] && !this.keyPrev[k];
        for (const key in KEY_BINDINGS) { if (pressed(key)) this.handleAction(KEY_BINDINGS[key]); }
        for (const key in KEY_BINDINGS) { this.keyPrev[key] = !!keys[key]; }

        const playW = this.canvasWidth - this.sidebarWidth;
        const wallX = playW * 0.5;
        let nx = this.arrow.x;

        if (keys['a'] || keys['A'] || keys['ArrowLeft']) nx -= this.arrow.speed;
        if (keys['d'] || keys['D'] || keys['ArrowRight']) nx += this.arrow.speed;
        nx = Math.min(playW - 25, Math.max(25, nx));

        // Solid central wall collision
        const pr = 18;
        if (this.walls.some(w => Math.abs(w.x1 - wallX) < 1 && Math.abs(w.x2 - wallX) < 1)) {
            if (this.arrow.x < wallX && nx >= wallX - pr) nx = wallX - pr;
            if (this.arrow.x > wallX && nx <= wallX + pr) nx = wallX + pr;
        }

        this.arrow.x = nx;
        this.checkWinCondition();
        this.calculateOptics();
    }

    /* ==================================================================
       DRAWING
       ================================================================== */
    draw(ctx) {
        ctx.save();
        this.drawGrid(ctx);
        this.drawWalls(ctx);
        this.drawAxis(ctx);
        this.drawExitZone(ctx);
        this.drawRays(ctx);
        this.drawOptics(ctx);

        // Draw image arrow (if calculated)
        if (this.calculatedImage) {
            const ci = this.calculatedImage;
            this.drawArrow(ctx, ci.x, ci.y, ci.tipX, ci.tipY, ci.isVirtual);
        }

        // Draw object arrow
        const d = this.arrow.isInverted ? -1 : 1;
        const tipY = this.arrow.y - this.arrow.height * d;
        this.drawArrow(ctx, this.arrow.x, this.arrow.y, this.arrow.x, tipY, null);

        this.drawHudBar(ctx);
        this.drawSidebar(ctx);
        if (this.isWin) this.drawWinBanner(ctx);

        ctx.restore();
    }

    /* ---- Background grid ---- */
    drawGrid(ctx) {
        ctx.strokeStyle = PALETTE.bgGrid;
        ctx.lineWidth = 1;
        for (let x = 0; x < this.canvasWidth; x += 40) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.canvasHeight); ctx.stroke();
        }
        for (let y = 0; y < this.canvasHeight; y += 40) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.canvasWidth, y); ctx.stroke();
        }
    }

    /* ---- Walls ---- */
    drawWalls(ctx) {
        ctx.save();
        ctx.strokeStyle = PALETTE.wall;
        ctx.shadowColor = PALETTE.wallGlow;
        ctx.shadowBlur = 12;
        ctx.lineWidth = 4;
        this.walls.forEach(w => {
            ctx.beginPath(); ctx.moveTo(w.x1, w.y1); ctx.lineTo(w.x2, w.y2); ctx.stroke();
        });
        ctx.restore();
    }

    /* ---- Principal axis ---- */
    drawAxis(ctx) {
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

    /* ---- Exit zone ---- */
    drawExitZone(ctx) {
        const e = this.exitZone;
        ctx.save();
        ctx.strokeStyle = PALETTE.exitBox;
        ctx.fillStyle = 'rgba(255, 0, 85, 0.15)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        roundRect(ctx, e.x, e.y, e.width, e.height, 8);
        ctx.fill(); ctx.stroke();
        ctx.font = 'bold 18px monospace';
        ctx.fillStyle = PALETTE.exitBox;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('EXIT', e.x + e.width / 2, e.y + e.height / 2);
        ctx.restore();
    }

    /* ---- Ray paths ---- */
    drawRays(ctx) {
        const colors = [PALETTE.ray1, PALETTE.ray2];
        this.rayPaths.forEach(stage => {
            stage.rays.forEach((raySegs, i) => {
                const color = colors[i] || PALETTE.ray1;
                raySegs.forEach(seg => {
                    ctx.save();
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2;
                    ctx.setLineDash(seg.isVirtual ? [5, 5] : []);
                    ctx.globalAlpha = seg.isVirtual ? 0.6 : 1;
                    ctx.beginPath();
                    ctx.moveTo(seg.from.x, seg.from.y);
                    ctx.lineTo(seg.to.x, seg.to.y);
                    ctx.stroke();
                    ctx.restore();
                });
            });
        });
    }

    /* ---- Optic elements ---- */
    drawOptics(ctx) {
        this.placedOptics.forEach(opt => {
            const color = OPTIC_COLORS[opt.type];
            ctx.save();
            ctx.translate(opt.x, opt.y);
            ctx.rotate((opt.rotation || 0) * Math.PI / 180);
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
        const H = 90; // Big static height so rays hit it but it doesn't warp!
        if (type === 'concaveMirror') {
            ctx.arc(120, 0, 120, 0.85 * Math.PI, 1.15 * Math.PI);
        } else if (type === 'convexMirror') {
            ctx.arc(-120, 0, 120, -0.15 * Math.PI, 0.15 * Math.PI);
        } else if (type === 'planeMirror') {
            ctx.moveTo(0, -H); ctx.lineTo(0, H);
        } else if (type === 'concaveLens') {
            ctx.moveTo(-8, -H); ctx.lineTo(8, -H);
            ctx.quadraticCurveTo(0, 0, 8, H);
            ctx.lineTo(-8, H);
            ctx.quadraticCurveTo(0, 0, -8, -H);
        } else if (type === 'convexLens') {
            ctx.ellipse(0, 0, 6, H, 0, 0, Math.PI * 2);
        }
    }

    /* ---- Arrow drawing ---- */
    drawArrow(ctx, baseX, baseY, tipX, tipY, imgState) {
        ctx.save();
        ctx.shadowBlur = 12;

        let color = PALETTE.object;
        if (imgState === false) color = PALETTE.image;
        else if (imgState === true) color = PALETTE.imageVirtual;

        ctx.shadowColor = color;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 3;

        if (imgState !== null) {
            ctx.setLineDash([5, 5]);
            ctx.globalAlpha = 0.7;
        }

        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();

        ctx.setLineDash([]);
        
        // Don't try to calculate angle if height is 0
        if (Math.abs(tipX - baseX) > 0.1 || Math.abs(tipY - baseY) > 0.1) {
            const angle = Math.atan2(tipY - baseY, tipX - baseX);
            ctx.beginPath();
            ctx.moveTo(tipX, tipY);
            ctx.lineTo(tipX - 12 * Math.cos(angle - Math.PI/6), tipY - 12 * Math.sin(angle - Math.PI/6));
            ctx.lineTo(tipX - 12 * Math.cos(angle + Math.PI/6), tipY - 12 * Math.sin(angle + Math.PI/6));
            ctx.fill();
        }

        ctx.restore();
    }

    /* ---- HUD top bar ---- */
    drawHudBar(ctx) {
        ctx.save();
        ctx.font = 'bold 16px monospace';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = PALETTE.hudAccent;
        ctx.fillText('\u2190 Back', 16, 25);
        ctx.restore();
    }

    /* ---- Right sidebar guide ---- */
    drawSidebar(ctx) {
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
            'DROP OPTICS:',
            '[1] Concave Mirror',
            '[2] Convex Mirror',
            '[3] Concave Lens',
            '[4] Convex Lens',
            '[5] Plane Mirror',
            '',
            'INVENTORY:',
            `1. ConcMir : x${this.inventory.concaveMirror}`,
            `2. ConvMir : x${this.inventory.convexMirror}`,
            `3. ConcLen : x${this.inventory.concaveLens}`,
            `4. ConvLen : x${this.inventory.convexLens}`,
            `5. Plane   : x${this.inventory.planeMirror}`,
            '',
            'ACTIONS:',
            '[Q/E] Rotate optic',
            '[C] Change curvature',
            '[T] Teleport to image',
            '[F] Pick up optic',
            '[R] Reset level',
            '',
            'RULES:',
            'Orange = real image [T]',
            'Red = virtual (no [T])',
        ];

        let ly = y + 44;
        lines.forEach(line => {
            if (line.startsWith('[')) ctx.fillStyle = '#00ff66';
            else if (line.endsWith(':')) ctx.fillStyle = '#00e5ff';
            else if (line.includes(': x')) ctx.fillStyle = '#ffea00';
            else if (line.startsWith('Orange')) ctx.fillStyle = PALETTE.image;
            else if (line.startsWith('Red')) ctx.fillStyle = PALETTE.imageVirtual;
            else ctx.fillStyle = PALETTE.hudText;
            ctx.fillText(line, x + 12, ly);
            ly += 16;
        });
        ctx.restore();
    }

    /* ---- Win banner ---- */
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

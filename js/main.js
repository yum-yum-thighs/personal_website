import { CONFIG } from './config.js';
import { initMarquee } from './marquee.js';
import { initPhysics } from './physics.js';

// Run directly since ES6 modules are deferred automatically
initMarquee(CONFIG.marqueeSpeed);
initPhysics();

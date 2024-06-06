class PekoMiniBoss extends Actor {
    dir = true;

    size = new Vector2(16 * 16, 6 * 16);

    maxHealth = 20;

    moveSpeed = 4;

    phase = 'intro';

    waitBuffer = 0;
    phaseBuffer = 0;

    leftParts = [];
    leftVel = new Vector2(0, 0);
    leftPhase = 'start';
    rightParts = [];
    rightVel = new Vector2(0, 0);
    rightPhase = null;
    middleParts = [];
    middleVel = new Vector2(0, 0);
    middlePhase = null;

    constructor(pos) {
        super(pos);

        this.health = this.maxHealth;

        for (let i = 0; i < 7; i++) {
            this.leftParts.push({
                pos: new Vector2(pos.x - 10, -2 - 18 * (i+1)),
                size: new Vector2(20, 20)
            });
        }
        for (let i = 0; i < 7; i++) {
            this.rightParts.push({
                pos: new Vector2(pos.x + this.size.x - 10, this.size.y + 2 + 18 * i),
                size: new Vector2(20, 20)
            });
        }
        this.middleParts = [];
        for (let i = 0; i < 4; i++) {
            this.middleParts.push({
                master: i === 3,
                pos: new Vector2(pos.x + this.size.x / 4 - 10, -this.size.y + 18 * (i % 4)),
                size: new Vector2(20, 20)
            });
        }
        this.leftVel = new Vector2(0, this.moveSpeed);
    }

    introPhase = game => {
        if (this.leftPhase === 'start') {
            if (this.leftParts.some(part => part.pos.y > this.size.y)) {
                this.leftPhase = 'move';
                this.rightPhase = 'start';
                this.waitBuffer = 120;
            }
        }
        else if (this.rightPhase === 'start') {
            if (!this.waitBuffer) {
                this.rightVel = new Vector2(0, -this.moveSpeed);
            }
            if (this.rightParts.some(part => part.pos.y + part.size.y < 0)) {
                this.rightPhase = 'move';
                this.middlePhase = 'start';
                this.waitBuffer = 120;
            }
        }
        else if (this.middlePhase === 'start') {
            if (!this.waitBuffer) {
                this.leftVel = new Vector2(0, this.moveSpeed / 3);
                this.rightVel = new Vector2(0, -this.moveSpeed / 3);
                this.middleVel = new Vector2(0, this.moveSpeed / 3);
            }
            if (this.middleParts.some(part => part.pos.y > 24)) {
                this.leftPhase = 'idle';
                this.leftVel = new Vector2(0, 0);
                this.rightPhase = 'idle';
                this.rightVel = new Vector2(0, 0);
                this.middlePhase = 'idle';
                this.middleVel = new Vector2(0, 0);
                this.phase = 'idle';
            }
        }
    }

    deathPhase = game => {
        const parts = [...this.leftParts, ...this.rightParts, ...this.middleParts];
        const randomPart = parts[Math.floor(Math.random() * parts.length)];
        if (Math.random() > .75) game.scene.particles.explosion(CollisionBox.center(randomPart));
    }

    idlePhase = game => {
        if (this.phaseBuffer >= 60) {
            if (Math.random() > .4) {
                this.phase = 'attack';
                this.laserTarget = this.middleParts[3].pos;
            } else {
                this.phase = 'move';
                game.playSound("boss_move");
                this.middleVel = new Vector2(this.moveSpeed * (this.middleParts[3].pos.x < this.pos.x + this.size.x / 2 ? 1 : -1), 0);
            }
        }
    }

    movePhase = game => {
        const xPos = this.middleParts[3].pos.x;
        if (this.phaseBuffer && (xPos + 12 < this.pos.x + this.size.x / 4 || xPos + 12 > this.pos.x + (this.size.x / 4) * 3)) {
            this.phase = 'idle';
            this.middleVel = new Vector2(0, 0);
        }
    }

    attackPhase = game => {
        const flare = game.scene.actors.find(actor => actor instanceof Flare);
        const core = this.middleParts[3];
        if (!(this.phaseBuffer % 4)) game.scene.particles.charge(CollisionBox.center(core));
        
        if (this.laserTarget) this.laserTarget = this.laserTarget.lerp(CollisionBox.center(flare), 0.05);

        if (this.phaseBuffer >= 180) {
            this.phase = 'release';
            game.playSound("level_start");
        } else if (!(this.phaseBuffer % 60)) game.playSound("charge");
    }

    releasePhase = game => {
        if (this.phaseBuffer > 10 && !(this.phaseBuffer % 4) && this.laserTarget) {
            const core = this.middleParts[3];
            const p1 = this.laserTarget;
            const p2 = CollisionBox.center(core);
            const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) + Math.random() * 0.125 - 0.0625;
            const vel = new Vector2(Math.cos(angle), Math.sin(angle)).times(-10);
            game.scene.actors.push(new Bullet(core.pos.plus(new Vector2(8, 8)), new Vector2(8, 8), vel, this));
        }

        if (this.phaseBuffer >= 60 * 3) {
            this.phase = 'idle';
            this.laserTarget = null;
        }
    }

    checkHit = (game, collisionBox) => {
        const collision = CollisionBox.intersects(this.middleParts[3], collisionBox);
        return collision;
    }

    takeHit = (game, other) => {
        this.health--;
        game.playSound('damage');
        game.scene.shakeBuffer = 15;
        this.hitBuffer = 20;
        game.scene.particles.ray(this.checkHit(game, other).pos);
        game.scene.particles.impact(this.checkHit(game, other).pos);
    }

    update = game => {
        // console.log(this.waitBuffer)
        
        this[`${this.phase}Phase`](game);

        ['left', 'right', 'middle'].forEach(side => {
            const parts = this[`${side}Parts`];
            const phase = this[`${side}Phase`];
            const vel = this[`${side}Vel`];
            
            parts.forEach(part => {
                part.pos = part.pos.plus(vel);
                if (['move'].includes(phase)) {
                    if (vel.y < 0 && part.pos.y + part.size.y < 0) part.pos.y += parts.length * 18;
                    if (vel.y > 0 && part.pos.y >= this.size.y) part.pos.y -= parts.length * 18;
                }
            });
        });

        // Side parts animation
        // parts.forEach((part, i) => {
        //     part.pos.x = part.target.x + Math.cos(Math.floor(this.frameCount + i * 8) * 8 * Math.PI / 180) * 2;
        // });

        if (this.hitBuffer) this.hitBuffer--;

        if (this.health < this.maxHealth / 2) {
            const parts = [...this.leftParts, ...this.rightParts, ...this.middleParts];
            parts.forEach(part => {
                if (Math.random() > .9) game.scene.particles.smoke_white(CollisionBox.center(part), new Vector2(0, -2), 1);
            });
        }

        if (this.waitBuffer) this.waitBuffer--;

        if (this.lastPhase !== this.phase) this.phaseBuffer = 0;
        else this.phaseBuffer++;
        this.lastPhase = this.phase;

        this.frameCount++;
    }
    
    draw = (game, cx) => {
        cx.save();
        const parts = [...this.leftParts, ...this.rightParts, ...this.middleParts];

        parts.forEach((part, i) => {
            const posX = !part.master ? 0 : this.hitBuffer && Math.floor(this.frameCount / 4) % 2 ? 48 : 24;
            cx.drawImage(game.assets.images['sp_peko_mini_boss'], posX, 0, 24, 24,
                Math.round(part.pos.x) - 2 + Math.cos(Math.floor(this.frameCount + i * 8) * 8 * Math.PI / 180) * 2,
                Math.round(part.pos.y) - 2,
                24, 24);
        });

        if (this.laserTarget) {
            cx.drawImage(game.assets.images['sp_laser_target'], this.phase === 'attack' ? 0 : (Math.floor(this.frameCount / 2) % 2) * 24, 0, 24, 24, this.laserTarget.x - 12, this.laserTarget.y - 12, 24, 24);
        }

        if (this.phase === 'attack') {

        }

        cx.restore();
    }
}
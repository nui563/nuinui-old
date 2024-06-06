const EVENTS = {
    "forest": {
        "0_0": [
            {
                condition: game => game.scene.frameCount === 0,
                isPersistent: true,
                timeline: [
                    // Wait for player input
                    (game, event) => {
                        const scene = game.scene;
                
                        if (event.frameCount === 0) {
                            event.flare = new Flare(new Vector2(160, 48), new Vector2(16, 32));
                            event.flare.setAnimation('sleep');
                            event.flare.animationLocked = true;
                
                            scene.view.target = event.flare;
                
                            event.elfriends = [
                                new Elfriend(new Vector2(96, 48), true),
                                new Elfriend(new Vector2(128, 24), true),
                                new Elfriend(new Vector2(224, 32), false)
                            ];
                
                            scene.actors.push(
                                event.flare,
                                ...event.elfriends
                            );
                        }
                
                        if (game.keys.jump) event.next = true;

                        scene.customDraw.push(game => {
                            // game.ctx3.drawImage(game.assets.images['ui_title_screen'], 2, 2);
                            game.ctx0.drawImage(game.assets.images['ui_start_label'], 204, 165);
                            if (!(Math.floor(scene.frameCount / 32) % 2)) {
                                game.ctx0.fillStyle = "#0008";
                                game.ctx0.fillRect(208, 167, 104, 20);
                            }
                        });
                    },
                    (game, event) => {
                        const scene = game.scene;
                        switch (event.timelineFrame) {
                            case 0:
                                event.flare.setAnimation('wakeup');
                                game.playSound('wakeup');
                                break;
                            case 39:
                                event.flare.setAnimation('idle');
                                break;
                            case 89:
                                event.flare.dir = false;
                                break;
                            case 129:
                                event.flare.dir = true;
                                break;
                            case 394:
                                game.cpuKeys = new Object;
                                break;
                            case 400:
                                scene.actors = scene.actors.filter(actor => !event.elfriends.includes(actor));
                                break;
                            case 660:
                                event.flare.setAnimation('idle');
                                // event.flare.animationLocked = false;
                                event.flare.playerControl = true;
                                event.flare.animationLocked = false;
                                event.end = true;
                                scene.enableHUD = true;
                
                                // const a = new Audio('./sound/terminal.mp3');
                                // a.volume = .25;
                                // a.play();
                                break;
                                
                            default:
                                break;
                        }
                
                        if (event.timelineFrame > 159 && event.timelineFrame < 339) {
                            if (event.timelineFrame === 160) game.playSound('question');
                            scene.customDraw.push(game => {
                                game.ctx3.drawImage(game.assets.images['sp_speech_bubble'], 32 * (Math.floor(event.frameCount / 16) % 2), 0, 32, 24, 164, 20, 32, 24);
                                game.ctx3.drawImage(game.assets.images['sp_kintsuba'], 167, 23);
                            });
                        }
                
                        if (event.timelineFrame > 339 && event.timelineFrame < 394) {
                            if (event.timelineFrame === 340) event.flare.animationLocked = false;
                            game.cpuKeys.right = true;
                        }
                
                        if (event.timelineFrame > 480 && event.timelineFrame < 660) {
                            if (event.timelineFrame === 481) {
                                game.playSound('level_start');
                                event.flare.setAnimation('look');
                                event.flare.animationLocked = true;
                            }
                            scene.customDraw.push(game => {
                                game.ctx3.drawImage(game.assets.images['ui_forest_label'], game.width / 2 - 56, 32);
                            });
                        }
                    }
                ]
            }
        ],
        "2_1": [
            {
                condition: game => true,
                isPersistent: false,
                timeline: [
                    (game, event) => {
                        game.scene.customDraw.push(game => {
                            game.ctx0.save();
                            game.ctx0.translate(-game.scene.view.pos.x, -game.scene.view.pos.y);
                            game.ctx0.drawImage(game.assets.images['sp_carrots'], 45 * 16, 18 * 16);
                            game.ctx0.restore();
                        });
                    }
                ]
            }
        ],
        "4_0": [
            {
                condition: game => {
                    const flare = game.scene.actors.find(actor => actor instanceof Flare);
                    return flare && flare.hasBow && !game.scene.miniBossStarted && !game.scene.miniBossCleared;
                },
                isPersistent: true,
                timeline: [
                    (game, event) => {
                        game.scene.miniBossStarted = true;
                        const scene = game.scene;    
                        const flare = scene.actors.find(actor => actor instanceof Flare);
                        if (flare && flare.pos.x < 16 * 90) event.next = true;
                    },
                    (game, event) => {
                        const scene = game.scene;

                        const flare = scene.actors.find(actor => actor instanceof Flare);

                        if (event.timelineFrame === 0) {
                            scene.miniBoss = 'started';
                            event.boss = new PekoMiniBoss(new Vector2(82 * 16, 0));
                            scene.actors.push(event.boss);

                            event.collisions = [
                                { pos: { x: 81.25 * 16, y: 0 }, size: { x: 16, y: 6 * 16 }},
                                { pos: { x: 97.75 * 16, y: 0 }, size: { x: 16, y: 6 * 16 }}
                            ];

                            scene.warning = true;
                            scene.currentSection.collisions.push(...event.collisions);

                            flare.playerControl = false;
                        }

                        if (event.boss.phase === 'intro') {
                            scene.shakeBuffer = 2;
                            if (!(event.timelineFrame % 32)) game.playSound('rumble');
                        }

                        if (event.boss.phase === 'idle') {
                            flare.playerControl = true;
                            scene.warning = false;
                        }
                        
                        if (event.boss.health <= 0) {
                            event.boss.laserTarget = null;
                            event.boss.middleVel = new Vector2(0, 0);
                            event.next = true;
                        }
                        
                        // scene.customDraw.push(game => {
                        //     game.ctx1.fillStyle = '#00f4';
                        //     event.collisions.forEach(({pos, size}) => {
                        //         game.ctx1.fillRect(pos.x % game.width, pos.y, size.x, size.y);
                        //     });
                        // });
                    },
                    (game, event) => {
                        const scene = game.scene;

                        const flare = scene.actors.find(actor => actor instanceof Flare);

                        scene.currentSection.collisions = scene.currentSection.collisions.filter(collision => !event.collisions.includes(collision));

                        if (event.timelineFrame === 0) {
                            flare.playerControl = false;

                            scene.miniBossCleared = true;
                            event.boss.phase = 'death';
                        }
                        
                        if (!(event.timelineFrame % 32)) game.playSound('rumble');
                        
                        if (event.timelineFrame === 180) {
                            
                            for (let i = 0; i < event.boss.size.x / 16; i++) {
                                scene.particles.explosion(event.boss.pos.plus(new Vector2(i * 16, event.boss.size.y)));
                            }

                            scene.actors = scene.actors.filter(actor => actor !== event.boss);
                            
                            scene.currentSection.collisions = scene.currentSection.collisions.filter(collision => collision.pos.y > 96 || collision.pos.x <= 1312 || collision.pos.x > 1536);
                            
                            game.playSound('rumble');

                            const pos = scene.view.pos.times(1 / 16).floor();
                            for (let y = pos.y; y < pos.y + 1 + scene.view.size.y / 16; y++) {
                                for (let x = pos.x; x < pos.x + 1 + scene.view.size.x / 16; x++) {
                                    if ((x > 81 && x <= 97 && y === 5) || (x > 82 && x <= 96 && y === 6)) delete scene.foreground[`${x}_${y}`];
                                }
                            }
                            scene.drawView = true;

                            flare.playerControl = true;
                            event.end = true;
                        }
                        
                        scene.shakeBuffer = 2;
                    }
                ]
            }
        ],
        "5_0": [
            {
                condition: game => {
                    const flare = game.scene.actors.find(actor => actor instanceof Flare);
                    return flare && !flare.hasBow && !game.scene.actors.find(actor => actor instanceof BowPickup);
                },
                isPersistent: true,
                timeline: [
                    (game, event) => {
                        game.scene.actors.push(new BowPickup(new Vector2(116 * 16 - 2, 62), new Vector2(20, 20)));
                        event.end = true;
                    }
                ]
            }
        ],
        "7_1": [
            {
                condition: game => {
                    const flare = game.scene.actors.find(actor => actor instanceof Flare);
                    return flare && flare.health !== flare.maxHealth;
                },
                isPersistent: false,
                timeline: [
                    (game, event) => {
                        const flare = game.scene.actors.find(actor => actor instanceof Flare);
                        
                        if (!(event.timelineFrame % 4)) game.scene.particles.charge(new Vector2(150 * 16, 16 * 16));

                        if (flare.pos.x < 151 * 16 && flare.pos.x > 149 * 16) {
                            flare.health = flare.maxHealth;
                            game.playSound('level_start');

                            event.end = true;
                        }
                    }
                ]
            }
        ],
        "7_3": [
            {
                condition: game => {
                    const flare = game.scene.actors.find(actor => actor instanceof Flare);
                    return flare && flare.health !== flare.maxHealth;
                },
                isPersistent: false,
                timeline: [
                    (game, event) => {
                        const flare = game.scene.actors.find(actor => actor instanceof Flare);
                        
                        if (!(event.timelineFrame % 4)) game.scene.particles.charge(new Vector2(150 * 16, 40 * 16));

                        if (flare.pos.x < 151 * 16 && flare.pos.x > 149 * 16) {
                            flare.health = flare.maxHealth;
                            game.playSound('level_start');

                            event.end = true;
                        }
                    }
                ]
            }
        ],
        "6_1": [
            {
                condition: game => !game.scene.bossCleared,
                isPersistent: true,
                timeline: [
                    (game, event) => {
                        const scene = game.scene;

                        const flare = scene.actors.find(actor => actor instanceof Flare);

                        if (event.timelineFrame === 0) {
                            flare.playerControl = false;
                            event.pekora = new Pekora(new Vector2(123 * 16, 20 * 16));
                            event.pekora.setAnimation('think');
                            scene.actors.push(event.pekora);
                        }

                        if (event.timelineFrame === 30) {
                            event.pekora.setAnimation('idle');
                        }
                        
                        game.cpuKeys.left = true;

                        if (flare.pos.x < 133 * 16) {
                            // flare.playerControl = true;
                            game.cpuKeys = new Object;
                            event.next = true;
                        }
                    },
                    (game, event) => {
                        const scene = game.scene;

                        const flare = scene.actors.find(actor => actor instanceof Flare);

                        if (event.timelineFrame === 20) {
                            event.collision = { pos: { x: 139 * 16, y: 15 * 16 }, size: { x: 16, y: 48 }};
                            scene.currentSection.collisions.push(event.collision);

                            const pos = scene.view.pos.times(1 / 16).floor();
                            for (let y = pos.y; y < pos.y + 1 + scene.view.size.y / 16; y++) {
                                for (let x = pos.x; x < pos.x + 1 + scene.view.size.x / 16; x++) {
                                    if (x === 139 && [15, 16, 17].includes(y)) scene.foreground[`${x}_${y}`] = "6";
                                }
                            }

                            scene.shakeBuffer = 4;
                            game.playSound("rumble");
                            scene.warning = true;
                        }
                        
                        if (event.timelineFrame === 60) {
                            event.pekora.dir = true;
                        }

                        if (event.timelineFrame === 90) {
                            event.pekora.dir = true;
                            game.playSound('peko');
                            event.pekora.setAnimation('laugh');
                        }

                        if (event.timelineFrame === 200) {
                            scene.warning = false;
                            flare.playerControl = true;
                            event.pekora.setAnimation('idle');
                            event.pekora.phase = 'idle';
                        }

                        if (!event.pekora.health) {
                            event.next = true;
                            flare.playerControl = false;
                            event.pekora.phase = 'defeated';
                            event.pekora.dir = false;
                            event.pekora.setAnimation('idle');
                        }
                    },
                    (game, event) => {
                        const scene = game.scene;

                        if (event.timelineFrame === 90) scene.bossCleared = true;

                        if (event.timelineFrame === 120) {
                            scene.currentSection.collisions = scene.currentSection.collisions.filter(collision => collision !== event.collision && (collision.pos.x !== 1920 || collision.pos.y < 304 || collision.pos.y === 352));

                            scene.shakeBuffer = 4;
                            game.playSound("rumble");

                            const pos = scene.view.pos.times(1 / 16).floor();
                            for (let y = pos.y; y < pos.y + 1 + scene.view.size.y / 16; y++) {
                                for (let x = pos.x; x < pos.x + 1 + scene.view.size.x / 16; x++) {
                                    if ((x === 120 && [19, 20, 21].includes(y)) || (x === 139 && [15, 16, 17].includes(y))) delete scene.foreground[`${x}_${y}`];
                                }
                            }
                            scene.drawView = true;
                            event.next = true;
                        }
                    },
                    (game, event) => {
                        const scene = game.scene;
                        const flare = scene.actors.find(actor => actor instanceof Flare);

                        if (event.timelineFrame > 60 && CollisionBox.includedIn(event.pekora, scene.currentSection)) {
                            event.pekora.phase = "flee";
                        }

                        if (event.pekora.pos.x < 1850) {
                            scene.actors = scene.actors.filter(actor => actor !== event.pekora);
                            flare.playerControl = true;
                            event.end = true;
                        }

                        if (event.pekora.phase === 'flee') {
                            flare.dir = CollisionBox.center(event.pekora).x > CollisionBox.center(flare).x;
                        }
                    }
                ]
            }
        ],
        "5_1": [
            {
                condition: game => true,
                isPersistent: true,
                timeline: [
                    (game, event) => {
                        const scene = game.scene;
                        const flare = scene.actors.find(actor => actor instanceof Flare);
                        
                        if (event.timelineFrame === 0) {
                            flare.playerControl = false;
                        }
                        
                        game.cpuKeys.left = true;

                        if (flare.pos.x < 109 * 16) {
                            game.cpuKeys = new Object;
                            event.end = true;
                            
                            scene.nextScene = new StageSelect(game, 0, 1);
                        }
                    }
                ]
            }
        ]
    },
    "casino": {
        "0_0": [
            {
                condition: game => game.scene.frameCount === 0,
                isPersistent: true,
                timeline: [
                    (game, event) => {
                        const scene = game.scene;
                
                        if (Math.random() > .97) {
                            scene.shakeBuffer = 2;
                            game.playSound("elevator");
                        }

                        if (event.frameCount === 0) {
                            event.flare = new Flare(new Vector2(16 * 9.5, 16 * 7), new Vector2(16, 32));
                            event.flare.setAnimation('idle');
                            event.flare.hasBow = true;
                            
                            scene.view.target = event.flare;
                            scene.actors.push(event.flare);
                        }
                
                        if (game.keys.jump) event.next = true;
                
                        scene.customDraw.push(game => {
                            game.ctx3.drawImage(game.assets.images['ui_start_label'], 204, 165);
                            if (!(Math.floor(scene.frameCount / 32) % 2)) {
                                game.ctx3.fillStyle = "#0008";
                                game.ctx3.fillRect(208, 167, 104, 20);
                            }
                        });
                    },
                    (game, event) => {
                        const scene = game.scene;
                
                        switch (event.timelineFrame) {
                            case 0:
                                scene.shakeBuffer = 20;
                                game.playSound('rumble');

                                const pos = scene.view.pos.times(1 / 16).floor();
                                for (let y = pos.y; y < pos.y + 1 + scene.view.size.y / 16; y++) {
                                    for (let x = pos.x; x < pos.x + 1 + scene.view.size.x / 16; x++) {
                                        if ([4, 15].includes(x) && y < 12) scene.foreground[`${x}_${y}`] = "5";
                                    }
                                }

                                break;
                            case 59:
                                game.playSound("level_start");
                                break;
                            default:
                                break;
                        }

                        if (event.timelineFrame > 89) {
                            game.cpuKeys.right = true;

                            if (event.flare.pos.x > 16 * 16) {
                                event.next = true;
                                event.flare.pos = new Vector2(16, 16 * 56);
                                event.flare.landBuffer = true;
                            }
                        }
                
                        // if (event.timelineFrame > 480 && event.timelineFrame < 660) {
                        //     if (event.timelineFrame === 481) {
                        //         game.playSound('level_start');
                        //         event.flare.setAnimation('look');
                        //         event.flare.animationLocked = true;
                        //     }
                        //     scene.customDraw.push(game => {
                        //         game.ctx3.drawImage(game.assets.images['ui_forest_label'], game.width / 2 - 56, 32);
                        //     });
                        // }
                    },
                    (game, event) => {
                        const scene = game.scene;

                        if (event.timelineFrame === 40) {
                            const pos = scene.view.pos.times(1 / 16).floor();
                            for (let y = pos.y; y < pos.y + 1 + scene.view.size.y / 16; y++) {
                                for (let x = pos.x; x < pos.x + 1 + scene.view.size.x / 16; x++) {
                                    if (x === 2 && y > 54 && y < 58) scene.foreground[`${x}_${y}`] = "1";
                                    if (x === 3 && y > 54 && y < 58) scene.foreground[`${x}_${y}`] = "1";
                                    if (x === 4 && y > 54 && y < 58) scene.foreground[`${x}_${y}`] = "5";
                                }
                            }
                            game.playSound('rumble');
                            scene.shakeBuffer = 4;

                            event.collision = { pos: { x: 4 * 16, y: 55 * 16 }, size: { x: 16, y: 48 }};
                            scene.currentSection.collisions.push(event.collision);
                        }

                        if (event.flare.pos.x > 16 * 6) {
                            
                            game.cpuKeys = new Object;
                            event.flare.playerControl = true;
                            event.end = true;
                            scene.enableHUD = true;
                        }
                    }
                ]
            }
        ],
        "0_4": [
            {
                condition: game => true,
                isPersistent: false,
                timeline: [
                    (game, event) => {
                        game.scene.customDraw.push(game => {
                            game.ctx0.save();
                            game.ctx0.translate(-game.scene.view.pos.x, -game.scene.view.pos.y);
                            game.ctx0.drawImage(game.assets.images['sp_statue'], 12 * 40, 48 * 16);
                            game.ctx0.restore();
                        });
                    }
                ]
            }
        ],
        "5_2": [
            {
                condition: game => {
                    const flare = game.scene.actors.find(actor => actor instanceof Flare);
                    return flare && !flare.hasKintsuba && !game.scene.actors.find(actor => actor instanceof ClockPickup);
                },
                isPersistent: true,
                timeline: [
                    (game, event) => {
                        const scene = game.scene;
                        const flare = scene.actors.find(actor => actor instanceof Flare);

                        if (event.timelineFrame === 0) {
                            flare.playerControl = false;
                        
                            event.kintsuba = new Kintsuba(new Vector2(109.25 * 16, 28 * 16));
                            event.kintsuba.dir = false;
                            game.scene.actors.unshift(event.kintsuba);

                            game.cpuKeys.right = true;
                        }

                        if (flare.pos.x > 106 * 16) {
                            game.cpuKeys = new Object;
                            event.next = true;
                        }
                    },
                    (game, event) => {
                        const scene = game.scene;
                        const flare = scene.actors.find(actor => actor instanceof Flare);

                        if (event.timelineFrame > 59 && event.timelineFrame < 240) {
                            if (event.timelineFrame === 60) game.playSound('question');
                            scene.customDraw.push(game => {
                                game.ctx3.drawImage(game.assets.images['sp_speech_bubble'], 32 * (Math.floor(event.frameCount / 16) % 2), 0, 32, 24, 110, 100, 32, 24);
                                game.ctx3.drawImage(game.assets.images['sp_kintsuba2'], 113, 103);
                            });
                        }

                        if (event.timelineFrame === 240) {
                            game.scene.actors.push(new ClockPickup(event.kintsuba.pos, new Vector2(20, 20)));
                        }

                        if (event.timelineFrame > 240) {
                            event.kintsuba.pos = event.kintsuba.pos.lerp(flare.pos, .05);
                        }

                        if (event.kintsuba.pos.x - flare.pos.x < 2) {
                            scene.actors = scene.actors.filter(a => a !== event.kintsuba);
                            flare.playerControl = true;
                            event.end = true;
                        }
                    }
                ]
            }
        ],
        "8_0": [
            {
                condition: game => true,
                isPersistent: false,
                timeline: [
                    (game, event) => {
                        game.scene.customDraw.push(game => {
                            game.ctx0.save();
                            game.ctx0.translate(-game.scene.view.pos.x, -game.scene.view.pos.y);
                            // game.ctx0.globalAlpha = .5;
                            game.ctx0.drawImage(game.assets.images['sp_skulls'], 20 * 8.5 * 16, Math.cos((game.scene.frameCount / game.height / 4) * (180 / Math.PI)) * 2 - 2);
                            game.ctx0.restore();
                        });
                    }
                ]
            }
        ],
    }
}
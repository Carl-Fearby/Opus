import { getRandomApology } from './constants';
import { Ghost } from './types';
import { distance } from './utils';

export interface AnimationCallbacks {
    onHeadbuttStart?: (ghost1Id: string, ghost2Id: string, apologyText: string) => void;
}

export class GhostAnimations {
    private callbacks: AnimationCallbacks;

    constructor(callbacks: AnimationCallbacks = {}) {
        this.callbacks = callbacks;
    }
    updateBlinkTimers(ghosts: Ghost[], delta: number): void {
        ghosts.forEach((ghost) => {
            if ((ghost.blinkTimer ?? 0) > 0) {
                ghost.blinkTimer = (ghost.blinkTimer ?? 0) - delta;
                if ((ghost.blinkTimer ?? 0) <= 0) {
                    ghost.blinkTimer = 0;
                    ghost.blinkCooldown = 0.8 + Math.random() * 1.7;
                }
            } else if ((ghost.blinkCooldown ?? 0) > 0) {
                ghost.blinkCooldown = (ghost.blinkCooldown ?? 0) - delta;
                if ((ghost.blinkCooldown ?? 0) <= 0) {
                    ghost.blinkTimer = 0.35;
                }
            }
        });
    }

    updateLookTimers(ghosts: Ghost[], delta: number, isWaiting: boolean): void {
        ghosts.forEach((ghost) => {
            if (!isWaiting && !(ghost.inHouse ?? false)) {
                ghost.lookDir = 'center';
                return;
            }

            if ((ghost.lookTimer ?? 0) > 0) {
                ghost.lookTimer = (ghost.lookTimer ?? 0) - delta;
                if ((ghost.lookTimer ?? 0) <= 0) {
                    ghost.lookTimer = 0;
                    ghost.lookDir = 'center';
                    ghost.lookCooldown = 0.6 + Math.random() * 2.0;
                }
            } else if ((ghost.lookCooldown ?? 0) > 0) {
                ghost.lookCooldown = (ghost.lookCooldown ?? 0) - delta;
                if ((ghost.lookCooldown ?? 0) <= 0) {
                    ghost.lookDir = Math.random() < 0.5 ? 'left' : 'right';
                    ghost.lookTimer = 0.4 + Math.random() * 1.0;
                }
            }
        });
    }

    updateSpinTimers(ghosts: Ghost[], delta: number, isWaiting: boolean): void {
        if (!isWaiting) {
            ghosts.forEach((ghost) => {
                ghost.spinTimer = 0;
                ghost.spinAngle = 0;
            });
            return;
        }

        ghosts.forEach((ghost) => {
            if ((ghost.spinTimer ?? 0) > 0) {
                ghost.spinTimer = (ghost.spinTimer ?? 0) - delta;

                if ((ghost.spinTimer ?? 0) > 0) {
                    const totalDuration = ghost.spinDuration ?? 1.5;
                    const timeRemaining = ghost.spinTimer ?? 0;
                    const progress = 1 - timeRemaining / totalDuration;

                    const spinDirection = ghost.spinDirection ?? 1;
                    ghost.spinAngle = spinDirection * progress * Math.PI * 2;

                    if (progress >= 1.0) {
                        ghost.dizzyTimer = 2.5;
                        ghost.dizzyBounce = 0;
                    }
                }

                if ((ghost.spinTimer ?? 0) <= 0) {
                    ghost.spinTimer = 0;
                    ghost.spinAngle = 0;
                    ghost.spinCooldown = 8 + Math.random() * 6;
                }
            } else if ((ghost.spinCooldown ?? 0) > 0) {
                ghost.spinCooldown = (ghost.spinCooldown ?? 0) - delta;
                if ((ghost.spinCooldown ?? 0) <= 0 && (ghost.dizzyTimer ?? 0) === 0) {
                    ghost.spinTimer = 1.5;
                    ghost.spinDuration = 1.5;
                    ghost.spinDirection = Math.random() < 0.5 ? 1 : -1;
                    ghost.spinAngle = 0;
                }
            }
        });
    }

    updateDizzyTimers(ghosts: Ghost[], delta: number): void {
        ghosts.forEach((ghost) => {
            if ((ghost.dizzyTimer ?? 0) > 0) {
                ghost.dizzyTimer = (ghost.dizzyTimer ?? 0) - delta;

                const timeRemaining = ghost.dizzyTimer ?? 0;
                const totalDuration = 2.5;
                const bouncePhaseEnd = totalDuration - 0.5;

                if (timeRemaining > bouncePhaseEnd) {
                    const bounceProgress = (totalDuration - timeRemaining) / 0.5;
                    const easeOut = 1 - (1 - bounceProgress) ** 3;
                    ghost.dizzyBounce = -0.3 * (1 - easeOut);
                } else {
                    ghost.dizzyBounce = 0;
                }

                if ((ghost.dizzyTimer ?? 0) <= 0) {
                    ghost.dizzyTimer = 0;
                    ghost.dizzyBounce = 0;
                }
            }
        });
    }

    updateEyeRollTimers(ghosts: Ghost[], delta: number, isWaiting: boolean): void {
        if (!isWaiting) {
            ghosts.forEach((ghost) => {
                ghost.eyeRollTimer = 0;
            });
            return;
        }

        ghosts.forEach((ghost) => {
            if ((ghost.eyeRollTimer ?? 0) > 0) {
                ghost.eyeRollTimer = (ghost.eyeRollTimer ?? 0) - delta;
                if ((ghost.eyeRollTimer ?? 0) <= 0) {
                    ghost.eyeRollTimer = 0;
                    ghost.eyeRollCooldown = 10 + Math.random() * 10;
                }
            } else if ((ghost.eyeRollCooldown ?? 0) > 0) {
                ghost.eyeRollCooldown = (ghost.eyeRollCooldown ?? 0) - delta;
                if (
                    (ghost.eyeRollCooldown ?? 0) <= 0 &&
                    (ghost.dizzyTimer ?? 0) === 0 &&
                    (ghost.spinTimer ?? 0) === 0
                ) {
                    ghost.eyeRollTimer = 2.0;
                    ghost.eyeRollDuration = 2.0;
                }
            }
        });
    }

    updateHeadbuttTimers(ghosts: Ghost[], delta: number, isWaiting: boolean): void {
        if (!isWaiting) {
            ghosts.forEach((ghost) => {
                ghost.headbuttTimer = 0;
                ghost.headbuttPhase = undefined;
                ghost.headbuttPartner = undefined;
                ghost.headbuttLeanAmount = 0;
                ghost.headbuttRotation = 0;
            });
            return;
        }
        ghosts.forEach((ghost) => {
            if ((ghost.headbuttTimer ?? 0) > 0) {
                ghost.headbuttTimer = (ghost.headbuttTimer ?? 0) - delta;
                const totalDuration = 2.0;
                const timeRemaining = ghost.headbuttTimer ?? 0;
                const progress = 1 - timeRemaining / totalDuration;
                if (progress < 0.125) {
                    ghost.headbuttPhase = 'looking';
                    ghost.headbuttLeanAmount = 0;
                    ghost.headbuttRotation = 0;
                } else if (progress < 0.25) {
                    ghost.headbuttPhase = 'rotating';
                    const rotateProgress = (progress - 0.125) / 0.125;
                    const eased = rotateProgress * rotateProgress;
                    const rotationDir = ghost.headbuttRotationDir ?? 1;
                    ghost.headbuttRotation = rotationDir * eased * (Math.PI / 2);
                    ghost.headbuttLeanAmount = 0;
                } else if (progress < 0.5) {
                    ghost.headbuttPhase = 'leaning';
                    const rotationDir = ghost.headbuttRotationDir ?? 1;
                    ghost.headbuttRotation = rotationDir * (Math.PI / 2);
                    const leanProgress = (progress - 0.25) / 0.25;
                    const eased = leanProgress * leanProgress;
                    ghost.headbuttLeanAmount = eased * 0.2;
                } else if (progress < 0.75) {
                    ghost.headbuttPhase = 'leanback';
                    const rotationDir = ghost.headbuttRotationDir ?? 1;
                    ghost.headbuttRotation = rotationDir * (Math.PI / 2);
                    const leanbackProgress = (progress - 0.5) / 0.25;
                    const eased = 1 - (1 - leanbackProgress) ** 2;
                    ghost.headbuttLeanAmount = 0.2 * (1 - eased);
                } else {
                    ghost.headbuttPhase = 'turnback';
                    const turnProgress = (progress - 0.75) / 0.25;
                    const eased = 1 - (1 - turnProgress) ** 3;
                    const rotationDir = ghost.headbuttRotationDir ?? 1;
                    ghost.headbuttRotation = rotationDir * (Math.PI / 2) * (1 - eased);
                    ghost.headbuttLeanAmount = 0;
                }

                if ((ghost.headbuttTimer ?? 0) <= 0) {
                    const partnerId = ghost.headbuttPartner;
                    ghost.headbuttTimer = 0;
                    ghost.headbuttPhase = undefined;
                    ghost.headbuttPartner = undefined;
                    ghost.headbuttLeanAmount = 0;
                    ghost.headbuttRotation = 0;
                    ghost.headbuttCooldown = 15 + Math.random() * 15;
                    if (partnerId && this.callbacks.onHeadbuttStart) {
                        this.callbacks.onHeadbuttStart(ghost.id, partnerId, getRandomApology());
                    }
                }
            }
        });
        for (let idx = 0; idx < ghosts.length - 1; idx++) {
            const ghost = ghosts[idx];
            const partner = ghosts[idx + 1];

            if ((ghost.headbuttTimer ?? 0) > 0) continue;
            if ((ghost.headbuttCooldown ?? 0) > 0) continue;
            if ((ghost.dizzyTimer ?? 0) > 0 || (ghost.spinTimer ?? 0) > 0) continue;

            if ((partner.headbuttTimer ?? 0) > 0) continue;
            if ((partner.headbuttCooldown ?? 0) > 0) continue;
            if ((partner.dizzyTimer ?? 0) > 0 || (partner.spinTimer ?? 0) > 0) continue;

            const dist = distance(ghost.position, partner.position);
            if (dist < 3 && dist > 0.5) {
                ghost.headbuttTimer = 2.0;
                partner.headbuttTimer = 2.0;
                ghost.headbuttPartner = partner.id;
                partner.headbuttPartner = ghost.id;

                const dx = partner.position.x - ghost.position.x;
                const dy = partner.position.y - ghost.position.y;
                ghost.headbuttAngle = Math.atan2(dy, dx);
                partner.headbuttAngle = Math.atan2(-dy, -dx);

                const ghostRotationDir = dx < 0 ? -1 : 1;
                const partnerRotationDir = -ghostRotationDir;

                ghost.headbuttRotationDir = ghostRotationDir;
                partner.headbuttRotationDir = partnerRotationDir;
            }
        }
        ghosts.forEach((ghost) => {
            if ((ghost.headbuttTimer ?? 0) === 0 && (ghost.headbuttCooldown ?? 0) > 0) {
                ghost.headbuttCooldown = (ghost.headbuttCooldown ?? 0) - delta;
            }
        });
    }
}

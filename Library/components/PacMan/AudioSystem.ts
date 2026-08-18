export class AudioSystem {
    private audioContext: AudioContext | null = null;
    private sounds: Map<string, AudioBuffer> = new Map();
    private enabled: boolean = true;
    private wakkaToggle: boolean = false;
    private frightenedSource: AudioBufferSourceNode | null = null;
    private gainNode: GainNode | null = null;
    private activeSources: Set<AudioBufferSourceNode> = new Set();

    constructor() {
        if (typeof window !== 'undefined') {
            try {
                const AudioContextClass =
                    window.AudioContext ||
                    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
                this.audioContext = new AudioContextClass();
                if (this.audioContext) {
                    this.gainNode = this.audioContext.createGain();
                    this.gainNode.connect(this.audioContext.destination);
                    this.gainNode.gain.value = 0.5;
                    this.primeAudioContext();
                }
            } catch {}
        }
    }

    private primeAudioContext() {
        if (!this.audioContext) return;
        const silentBuffer = this.audioContext.createBuffer(1, 1, 22050);
        const source = this.audioContext.createBufferSource();
        source.buffer = silentBuffer;
        source.connect(this.audioContext.destination);

        try {
            source.start(0);
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume().catch(() => {});
            }
        } catch {}
    }

    async initialize(soundFiles: Record<string, string>) {
        if (!this.audioContext) return;

        try {
            const loadPromises = Object.entries(soundFiles).map(async ([key, url]) => {
                try {
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                    const arrayBuffer = await response.arrayBuffer();
                    const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
                    this.sounds.set(key, audioBuffer);
                } catch (error) {
                    console.warn(`Failed to load sound ${key}:`, error);
                }
            });

            await Promise.all(loadPromises);
        } catch (error) {
            console.error('Failed to load sounds:', error);
        }
    }

    play(soundName: string) {
        if (!this.enabled || !this.audioContext || !this.gainNode) return;

        try {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume().catch(() => {});
            }

            let buffer: AudioBuffer | undefined;
            if (soundName === 'pellet') {
                this.wakkaToggle = !this.wakkaToggle;
                buffer = this.sounds.get(this.wakkaToggle ? 'waka0' : 'waka1');
            } else if (soundName === 'countdownBeep' || soundName === 'startGame') {
                buffer = this.sounds.get('start');
            } else {
                buffer = this.sounds.get(soundName);
            }

            if (!buffer) return;
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.gainNode);
            this.activeSources.add(source);
            source.onended = () => {
                this.activeSources.delete(source);
            };
            source.start(0);
        } catch {}
    }

    playLoop(soundName: string) {
        if (!this.enabled || !this.audioContext || !this.gainNode) return;

        try {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume().catch(() => {});
            }

            const buffer = this.sounds.get(soundName);
            if (!buffer) return;
            if (this.frightenedSource) {
                try {
                    this.frightenedSource.stop();
                } catch {}
                this.frightenedSource = null;
            }

            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.loop = true;
            source.connect(this.gainNode);
            source.start(0);
            this.frightenedSource = source;
        } catch {}
    }

    stopLoop() {
        if (this.frightenedSource) {
            try {
                this.frightenedSource.stop();
            } catch {}
            this.frightenedSource = null;
        }
    }

    stopAll() {
        this.activeSources.forEach((source) => {
            try {
                source.stop();
            } catch {}
        });
        this.activeSources.clear();
        this.stopLoop();
    }

    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            return this.audioContext.resume();
        }
        return Promise.resolve();
    }

    private async ensureContextRunning() {
        if (!this.audioContext) return false;

        if (this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
            } catch {
                return false;
            }
        }

        return this.audioContext.state === 'running';
    }

    playDeathSequence() {
        if (!this.audioContext || !this.gainNode) {
            console.warn('Audio context or gain node missing');
            return;
        }
        const death0 = this.sounds.get('death');
        const death1 = this.sounds.get('death_1');
        if (!death0) {
            console.warn('death_0 buffer missing');
            return;
        }
        if (!death1) {
            console.warn('death_1 buffer missing, playing only death_0');
            const source0 = this.audioContext.createBufferSource();
            source0.buffer = death0;
            source0.connect(this.gainNode);
            source0.start();
            return;
        }
        const source0 = this.audioContext.createBufferSource();
        source0.buffer = death0;
        source0.connect(this.gainNode);
        source0.start();
        source0.onended = () => {
            if (!this.audioContext || !this.gainNode) return;
            const source1 = this.audioContext.createBufferSource();
            source1.buffer = death1;
            source1.connect(this.gainNode);
            source1.start();
            source1.onended = () => {
                if (!this.audioContext || !this.gainNode) return;
                const source2 = this.audioContext.createBufferSource();
                source2.buffer = death1;
                source2.connect(this.gainNode);
                source2.start();
            };
        };
    }
}

import { JSW_DATA_BASE_ADDRESS, JSW_NATIVE_DATA_BASE64 } from "./jetSetWillyData";
import { JSW_GAME_SCORE, JSW_TITLE_SCORE } from "./jetSetWillyAudioData";
import { JSW_TITLE_SCREEN_DATA_URL } from "./jetSetWillyTitleScreen";

const WIDTH = 256;
const ROOM_HEIGHT = 128;
const HEIGHT = 192;
const ROOM_BASE = 0xc000;
// The original game timer advances gameplay 12 times per second.
const LOGIC_STEP_MS = 1000 / 12;
const PALETTE = ["#000000", "#0000d7", "#d70000", "#d700d7", "#00d700", "#00d7d7", "#d7d700", "#d7d7d7"];
const BRIGHT = ["#000000", "#0000ff", "#ff0000", "#ff00ff", "#00ff00", "#00ffff", "#ffff00", "#ffffff"];
const JUMP = [
  [-4, -32, 6, 5, 72], [-4, 0, 4, 5, 74], [-3, -32, 6, 4, 76], [-3, 0, 6, 4, 78], [-2, 0, 4, 3, 80], [-2, -32, 6, 3, 82],
  [-1, 0, 6, 2, 84], [-1, 0, 6, 2, 86], [0, 0, 6, 1, 88], [0, 0, 6, 1, 88], [1, 0, 6, 2, 86], [1, 0, 6, 2, 84],
  [2, 32, 4, 3, 82], [2, 0, 6, 3, 80], [3, 0, 6, 4, 78], [3, 32, 4, 4, 76], [4, 0, 6, 5, 74], [4, 32, 4, 5, 72],
] as const;
const MARIA_WHITE = [
  [768, 960, 480, 320, 480, 1920, 8184, 16380, 0, 0, 0, 0, 0, 0, 0, 0],
  [768, 960, 480, 320, 480, 1920, 8184, 16380, 0, 0, 0, 0, 0, 0, 0, 0],
  [768, 960, 480, 320, 480, 1920, 8188, 16382, 0, 0, 0, 0, 0, 0, 0, 0],
  [768, 960, 480, 320, 480, 1920, 8191, 16382, 0, 0, 0, 0, 0, 0, 0, 0],
] as const;
const MARIA_GREEN = [
  [0, 0, 0, 0, 0, 0, 0, 0, 14188, 5272, 4080, 4080, 4080, 576, 576, 1632],
  [0, 0, 0, 0, 0, 0, 0, 0, 14188, 5272, 4080, 4080, 4080, 576, 1600, 608],
  [0, 0, 0, 0, 0, 0, 0, 0, 14182, 5266, 4080, 4080, 4080, 576, 576, 1632],
  [0, 0, 0, 0, 0, 0, 0, 0, 14176, 5264, 4080, 4080, 4080, 576, 576, 1632],
] as const;

type Player = { x: number; y: number; tile: number; align: 4 | 6; frame: number; direction: 0 | 1; moving: boolean; airborne: number; jump: number };
type Guardian = { definition: number; x: number; y: number; direction: -1 | 1; frame: number; frameUpdate: number };

export type JetSetWillyGameOptions = {
  onItemsChange?: (collected: number, total: number) => void;
  onRoomChange?: (room: number, name: string) => void;
};

function decodeData() {
  const binary = atob(JSW_NATIVE_DATA_BASE64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export class JetSetWillyEngine {
  private readonly context: CanvasRenderingContext2D;
  private readonly memory = decodeData();
  private readonly titleImage = new Image();
  private readonly keys = new Set<string>();
  private readonly collected = new Set<number>();
  private readonly options: JetSetWillyGameOptions;
  private player: Player = { x: 160, y: 104, tile: 436, align: 4, frame: 0, direction: 0, moving: false, airborne: 0, jump: 0 };
  private guardians: Guardian[] = [];
  private savedPlayer: Player = { x: 160, y: 104, tile: 436, align: 4, frame: 0, direction: 0, moving: false, airborne: 0, jump: 0 };
  private savedRoom = 0x21;
  private room = 0x21;
  private lives = 7;
  private tick = 0;
  private lastTime = 0;
  private accumulator = 0;
  private animationFrame = 0;
  private running = false;
  private audioContext: AudioContext | null = null;
  private musicTimer = 0;
  private musicPosition = 0;
  private musicClock = 0;
  private musicDelta = 0;
  private musicOscillators: OscillatorNode[] = [];
  private musicGains: GainNode[] = [];
  private muted = false;
  private guardiansEnteredThisTick = false;
  private clockTicks = 0;
  private clockMinutes = 0;
  private paused = false;
  private screen: "title" | "game" = "title";

  constructor(private readonly canvas: HTMLCanvasElement, options: JetSetWillyGameOptions = {}) {
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas 2D is unavailable.");
    this.context = context;
    this.options = options;
    this.titleImage.src = JSW_TITLE_SCREEN_DATA_URL;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    context.imageSmoothingEnabled = false;
    this.enterRoom(this.room, 160, 104, 436);
  }

  start() {
    if (this.running) return;
    this.running = true;
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    this.canvas.addEventListener("blur", this.onBlur);
    this.canvas.addEventListener("pointerdown", this.onPointerDown);
    this.animationFrame = requestAnimationFrame(this.loop);
  }

  destroy() {
    this.running = false;
    cancelAnimationFrame(this.animationFrame);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.canvas.removeEventListener("blur", this.onBlur);
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    void this.audioContext?.close();
    this.audioContext = null;
    window.clearTimeout(this.musicTimer);
    this.musicTimer = 0;
    this.musicOscillators.forEach((oscillator) => oscillator.stop());
    this.musicOscillators = [];
    this.musicGains = [];
  }

  reset() {
    this.collected.clear();
    this.lives = 7;
    this.clockTicks = 0;
    this.clockMinutes = 0;
    this.paused = false;
    this.player = { x: 160, y: 104, tile: 436, align: 4, frame: 0, direction: 0, moving: false, airborne: 0, jump: 0 };
    this.enterRoom(0x21, 160, 104, 436);
    this.screen = "game";
    this.restartMusic();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) {
      window.clearTimeout(this.musicTimer);
      this.musicTimer = 0;
      const now = this.audioContext?.currentTime ?? 0;
      this.musicGains.forEach((gain) => gain.gain.setValueAtTime(0, now));
    }
    else if (this.audioContext?.state === "running") this.scheduleMusic();
  }

  private read(address: number) {
    const index = address - JSW_DATA_BASE_ADDRESS;
    return index >= 0 && index < this.memory.length ? this.memory[index] : 0;
  }

  private roomAddress() {
    return ROOM_BASE + this.room * 0x100;
  }

  private roomName() {
    return Array.from({ length: 32 }, (_, index) => this.read(this.roomAddress() + 0x80 + index))
      .map((value) => (value >= 32 && value < 127 ? String.fromCharCode(value) : " "))
      .join("")
      .trim();
  }

  private tileAt(column: number, row: number) {
    if (column < 0 || column > 31 || row < 0 || row > 15) return 0;
    const cell = row * 32 + column;
    const packed = this.read(this.roomAddress() + (cell >> 2));
    return (packed >> ((3 - (cell & 3)) * 2)) & 3;
  }

  private isSolidAt(x: number, y: number, descending = false) {
    const column = Math.floor(x / 8);
    const row = Math.floor(y / 8);
    const type = this.tileAt(column, row);
    return type === 2 || (descending && (type === 1 || this.featureAt(column, row)));
  }

  private featureAt(column: number, row: number) {
    const address = this.roomAddress();
    const conveyor = this.decodePosition(this.read(address + 0xd7), this.read(address + 0xd8));
    const conveyorLength = this.read(address + 0xd9);
    if (row === conveyor.row && column >= conveyor.column && column < conveyor.column + conveyorLength) return true;

    const ramp = this.decodePosition(this.read(address + 0xdb), this.read(address + 0xdc));
    const direction = this.read(address + 0xda) ? 1 : -1;
    const rampLength = this.read(address + 0xdd);
    for (let index = 0; index < rampLength; index += 1) {
      if (column === ramp.column + index * direction && row === ramp.row - index) return true;
    }
    return false;
  }

  private cellType(tile: number) {
    if (tile < 0 || tile > 511) return "space";
    const column = tile & 31;
    const row = tile >> 5;
    const base = this.tileAt(column, row);
    if (base === 2) return "solid";
    if (base === 3) return "harm";
    const address = this.roomAddress();
    const conveyor = this.decodePosition(this.read(address + 0xd7), this.read(address + 0xd8));
    if (row === conveyor.row && column >= conveyor.column && column < conveyor.column + this.read(address + 0xd9)) {
      return this.read(address + 0xd6) === 0 ? "conveyor-left" : "conveyor-right";
    }
    const ramp = this.decodePosition(this.read(address + 0xdb), this.read(address + 0xdc));
    const direction = this.read(address + 0xda) ? 1 : -1;
    for (let index = 0; index < this.read(address + 0xdd); index += 1) {
      if (column === ramp.column + index * direction && row === ramp.row - index) return direction < 0 ? "ramp-left" : "ramp-right";
    }
    return base === 1 ? "floor" : "space";
  }

  private isSupporting(type: string) {
    return type !== "space";
  }

  private isSolid(tile: number) {
    if (tile < 0 || tile === 512) return false;
    if (this.cellType(tile) === "solid" || this.cellType(tile + 32) === "solid") return true;
    if (tile + 64 > 511 || this.cellType(tile + 64) !== "solid") return false;
    if (this.player.align === 6) return true;
    if (this.player.airborne === 1 && this.player.jump > 9) this.player.airborne = 0;
    return false;
  }

  private isDeadlyAt(x: number, y: number) {
    return this.tileAt(Math.floor(x / 8), Math.floor(y / 8)) === 3;
  }

  private enterRoom(room: number, x: number, y: number, tile = Math.floor(y / 8) * 32 + Math.floor(x / 8)) {
    this.room = Math.max(0, Math.min(59, room));
    this.player = { ...this.player, x, y, tile };
    this.savedRoom = this.room;
    this.savedPlayer = { ...this.player };
    this.guardians = [];
    this.guardiansEnteredThisTick = true;
    const address = this.roomAddress();
    for (let index = 0; index < 8; index += 1) {
      const definition = this.read(address + 0xf0 + index * 2);
      const start = this.read(address + 0xf1 + index * 2);
      if (definition === 0xff) break;
      const entry = 0xa000 + (definition & 0x7f) * 8;
      const type = this.read(entry) & 7;
      if (type !== 1 && type !== 2) continue;
      const verticalStep = this.read(entry + 4);
      const direction = type === 2 ? (verticalStep > 127 ? -1 : 1) : (this.read(entry) & 0x80 ? 1 : -1);
      this.guardians.push({
        definition: definition & 0x7f,
        x: (start & 31) * 8,
        y: this.read(entry + 3) / 2,
        direction,
        frame: type === 1 && direction > 0 ? 4 : 0,
        frameUpdate: type === 2 ? 2 : 0,
      });
    }
    this.options.onRoomChange?.(this.room, this.roomName());
    this.options.onItemsChange?.(this.collected.size, 83);
  }

  private onKeyDown = (event: KeyboardEvent) => {
    if (document.activeElement !== this.canvas && !this.canvas.matches(":hover")) return;
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "Space"].includes(event.code)) event.preventDefault();
    this.unlockAudio();
    if (this.screen === "title" && (event.code === "Enter" || event.code === "Space")) {
      event.preventDefault();
      this.beginGame();
      return;
    }
    if (this.screen === "game" && event.code === "Pause") {
      event.preventDefault();
      this.paused = !this.paused;
      return;
    }
    this.keys.add(event.code);
  };

  private onKeyUp = (event: KeyboardEvent) => this.keys.delete(event.code);
  private onBlur = () => this.keys.clear();
  private onPointerDown = () => {
    this.canvas.focus();
    this.unlockAudio();
  };

  private unlockAudio() {
    this.audioContext ??= new AudioContext();
    if (this.audioContext.state === "suspended") {
      void this.audioContext.resume().then(() => this.scheduleMusic());
    } else this.scheduleMusic();
  }

  private beginGame() {
    this.collected.clear();
    this.lives = 7;
    this.clockTicks = 0;
    this.clockMinutes = 0;
    this.paused = false;
    this.player = { x: 160, y: 104, tile: 436, align: 4, frame: 0, direction: 0, moving: false, airborne: 0, jump: 0 };
    this.enterRoom(0x21, 160, 104, 436);
    this.screen = "game";
    this.restartMusic();
  }

  private restartMusic() {
    this.musicPosition = 0;
    this.musicClock = 0;
    this.musicDelta = 0;
    window.clearTimeout(this.musicTimer);
    this.musicTimer = 0;
    const now = this.audioContext?.currentTime ?? 0;
    this.musicGains.forEach((gain) => gain.gain.setValueAtTime(0, now));
    if (!this.muted) this.scheduleMusic();
  }

  private activeScore() {
    return this.screen === "title" ? JSW_TITLE_SCORE : JSW_GAME_SCORE;
  }

  private scheduleMusic() {
    if (this.muted || this.musicTimer || !this.audioContext || this.audioContext.state !== "running") return;
    this.ensureMusicChannels();
    const playTick = () => {
      this.musicTimer = 0;
      if (this.muted || !this.audioContext || this.audioContext.state !== "running") return;
      if (this.musicDelta === this.musicClock) {
        let duration = 0;
        do {
          const score = this.activeScore();
          const event = score[this.musicPosition++] ?? 0x40;
          const channel = event & 0x0f;
          const operation = event & 0xf0;
          if (operation === 0x40) {
            const repeat = score[this.musicPosition] === 1;
            if (!repeat) {
              const now = this.audioContext.currentTime;
              this.musicGains.forEach((gain) => gain.gain.setValueAtTime(0, now));
              return;
            }
            this.musicPosition = 0;
            this.musicClock = 0;
            this.musicDelta = 0;
            duration = 0;
            continue;
          }
          if (operation === 0x10) {
            const note = score[this.musicPosition++] ?? 69;
            this.musicOscillators[channel].frequency.setValueAtTime(this.noteFrequency(note), this.audioContext.currentTime);
            this.musicGains[channel].gain.setValueAtTime(0.012, this.audioContext.currentTime);
          } else {
            this.musicGains[channel].gain.setValueAtTime(0, this.audioContext.currentTime);
          }
          duration = score[this.musicPosition++] ?? 0;
          this.musicDelta += duration;
        } while (duration === 0);
      }
      this.musicClock += 1;
      this.musicTimer = window.setTimeout(playTick, 1000 / 60);
    };
    playTick();
  }

  private ensureMusicChannels() {
    const context = this.audioContext;
    if (!context || this.musicOscillators.length) return;
    for (let channel = 0; channel < 5; channel += 1) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "square";
      gain.gain.value = 0;
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      this.musicOscillators.push(oscillator);
      this.musicGains.push(gain);
    }
  }

  private noteFrequency(note: number) {
    return 440 * 2 ** ((note - 69) / 12);
  }

  private willyNote(note: number, ticks: number) {
    const frequency = this.noteFrequency(note);
    this.tone(frequency, ticks / 60, frequency, 0.045);
  }

  private tone(frequency: number, duration: number, endFrequency = frequency, volume = 0.035) {
    const context = this.audioContext;
    if (!context || context.state !== "running" || this.muted) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), context.currentTime + duration);
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  }

  private loop = (time: number) => {
    if (!this.running) return;
    const delta = Math.min(100, time - (this.lastTime || time));
    this.lastTime = time;
    this.accumulator += delta;
    while (this.accumulator >= LOGIC_STEP_MS) {
      this.update();
      this.accumulator -= LOGIC_STEP_MS;
    }
    this.draw();
    this.animationFrame = requestAnimationFrame(this.loop);
  };

  private update() {
    this.tick += 1;
    if (this.screen === "title") return;
    if (this.paused) return;
    const left = this.keys.has("ArrowLeft") || this.keys.has("KeyO");
    const right = this.keys.has("ArrowRight") || this.keys.has("KeyP");
    const jump = this.keys.has("Space") || this.keys.has("ArrowUp");
    this.updateDirection(left, right, jump);
    this.moveWilly();
    this.moveGuardians();
    this.collectItems();
    this.checkDanger();
    this.updateClock();
  }

  private updateClock() {
    // The Spectrum game advances one game minute after 257 gameplay ticks.
    if (this.clockTicks++ < 256) return;
    this.clockTicks = 0;
    this.clockMinutes += 1;
    // 07:00 to midnight is the original time limit.
    if (this.clockMinutes === 17 * 60 && this.collected.size < 83) this.reset();
  }

  private updateDirection(left: boolean, right: boolean, jump: boolean, conveyor: "left" | "right" | null = null) {
    const requested = Number(left || conveyor === "left") + Number(right || conveyor === "right") * 2;
    if (requested === 0 || requested === 3) this.player.moving = false;
    else if (requested === 1) {
      if (this.player.direction === 0) {
        this.player.direction = 1;
        this.player.moving = false;
      } else this.player.moving = true;
    } else {
      if (this.player.direction === 1) {
        this.player.direction = 0;
        this.player.moving = false;
      } else this.player.moving = true;
    }
    if (jump && this.player.airborne === 0) {
      this.player.airborne = 1;
      this.player.jump = 0;
    }
  }

  private moveLeftRight() {
    const player = this.player;
    if (!player.moving) return;
    let vertical = 0;
    let tileOffset = 0;
    if (player.direction === 0) {
      if (player.frame < 3) {
        player.frame += 1;
        return;
      }
      if (player.airborne === 0) {
        if (this.cellType(player.tile + 64) === "ramp-left") { vertical = 8; tileOffset = 32; }
        else if (this.cellType(player.tile + 34) === "ramp-right") { vertical = -8; tileOffset = -32; }
      }
      if (player.x === 240) { this.changeRoom("right"); return; }
      if (this.isSolid(player.tile + tileOffset + 2)) return;
      player.x += 8;
      player.tile += 1;
      player.frame = 0;
    } else {
      if (player.frame > 0) {
        player.frame -= 1;
        return;
      }
      if (player.airborne === 0) {
        if (this.cellType(player.tile + 31) === "ramp-left") { vertical = -8; tileOffset = -32; }
        else if (this.cellType(player.tile + 65) === "ramp-right") { vertical = 8; tileOffset = 32; }
      }
      if (player.x === 0) { this.changeRoom("left"); return; }
      if (this.isSolid(player.tile + tileOffset - 1)) return;
      player.x -= 8;
      player.tile -= 1;
      player.frame = 3;
    }
    player.y += vertical;
    player.tile += tileOffset;
  }

  private moveWilly() {
    const player = this.player;
    if (player.airborne === 1) {
      const [vertical, tileOffset, align, soundLength, soundPitch] = JUMP[player.jump];
      const nextY = player.y + vertical;
      if (nextY < 0) { this.changeRoom("above"); return; }
      const nextTile = player.tile + tileOffset;
      if (this.cellType(nextTile) === "solid" || this.cellType(nextTile + 1) === "solid") {
        player.y = (nextY + 8) & 120;
        player.tile = nextTile + 32;
        player.align = 4;
        player.airborne = 2;
        player.moving = false;
        return;
      }
      player.y = nextY;
      player.tile = nextTile;
      player.align = align;
      this.willyNote(soundPitch, soundLength);
      player.jump += 1;
      if (player.jump === JUMP.length) { player.airborne = 6; return; }
      if (player.jump !== 13 && player.jump !== 16) { this.moveLeftRight(); return; }
    }

    if (player.align === 4) {
      const below = player.tile + 64;
      if (below & 512) { this.changeRoom("below"); return; }
      const left = this.cellType(below);
      const right = this.cellType(below + 1);
      if (left === "harm" || right === "harm") {
        // While rising, Willy may clear a nasty if either half of his feet is
        // over space. This small asymmetry is essential to original jumps.
        if (player.airborne === 1 && (left === "space" || right === "space")) this.moveLeftRight();
        else this.killWilly();
        return;
      }
      if (this.isSupporting(left) || this.isSupporting(right)) {
        if (player.airborne >= 12) { this.killWilly(); return; }
        player.airborne = 0;
        const conveyor = left === "conveyor-left" || right === "conveyor-left" ? "left" : left === "conveyor-right" || right === "conveyor-right" ? "right" : null;
        const inputLeft = this.keys.has("ArrowLeft") || this.keys.has("KeyO");
        const inputRight = this.keys.has("ArrowRight") || this.keys.has("KeyP");
        this.updateDirection(inputLeft, inputRight, false, conveyor);
        this.moveLeftRight();
        return;
      }
    }
    if (player.airborne === 1) { this.moveLeftRight(); return; }
    player.moving = false;
    if (player.airborne === 0) { player.airborne = 2; return; }
    player.airborne += 1;
    if (player.airborne === 16) player.airborne = 12;
    this.willyNote(78 - player.airborne, 4);
    player.y += 4;
    player.align = (player.y & 7) ? 6 : 4;
    if ((player.y & 7) === 0) player.tile += 32;
  }

  private moveGuardians() {
    // The original changes the room action first and does not tick the newly
    // installed guardian set until the following game tick.
    if (this.guardiansEnteredThisTick) {
      this.guardiansEnteredThisTick = false;
      return;
    }
    for (const guardian of this.guardians) {
      const entry = 0xa000 + guardian.definition * 8;
      const type = this.read(entry) & 7;
      const minimum = this.read(entry + 6);
      const maximum = this.read(entry + 7);
      if (type === 1) {
        if (guardian.direction < 0) {
          if ((guardian.frame & 3) > 0) guardian.frame -= 1;
          else if (guardian.x > minimum * 8) { guardian.x -= 8; guardian.frame = 3; }
          else { guardian.direction = 1; guardian.frame += 4; }
        } else if (guardian.frame < 7) guardian.frame += 1;
        else if (guardian.x < maximum * 8) { guardian.x += 8; guardian.frame = 4; }
        else { guardian.direction = -1; guardian.frame &= 3; }
      } else {
        const rawSpeed = this.read(entry + 4);
        const speed = Math.max(1, Math.abs(rawSpeed > 127 ? rawSpeed - 256 : rawSpeed) / 2);
        guardian.frameUpdate ^= 1;
        if (guardian.frameUpdate) guardian.frame += 1;
        guardian.y += guardian.direction * speed;
        if (guardian.direction < 0 && guardian.y * 2 <= minimum) {
          guardian.y = minimum / 2;
          guardian.direction = 1;
        } else if (guardian.direction > 0 && guardian.y * 2 >= maximum) {
          // JSW reverses here without clamping the downward overshoot.
          guardian.direction = -1;
        }
      }
    }
  }

  private collectItems() {
    for (let item = 0xad; item <= 0xff; item += 1) {
      if (this.collected.has(item)) continue;
      const high = this.read(0xa400 + item);
      const low = this.read(0xa500 + item);
      if ((high & 0x3f) !== this.room) continue;
      const x = (low & 31) * 8;
      const y = (((high >> 7) & 1) * 8 + (low >> 5)) * 8;
      if (this.overlaps(this.player.x, this.player.y, 16, 16, x, y, 8, 8)) {
        this.collected.add(item);
        this.tone(880, 0.12, 1320, 0.045);
        this.options.onItemsChange?.(this.collected.size, 83);
      }
    }
  }

  private changeRoom(direction: "above" | "right" | "below" | "left") {
    const address = this.roomAddress();
    const player = this.player;
    if (direction === "above") {
      const destination = this.read(address + 0xeb);
      // Original fixes for jumping from Under the Drive into The Drive and
      // from First Landing into Top Landing while inside blocking geometry.
      if ((destination === 4 && player.x > 22 && player.x < 32) || (destination === 28 && player.x > 182)) {
        player.airborne = 2;
        return;
      }
      player.y = 104;
      player.x = (player.tile & 31) * 8;
      player.tile = 416 + (player.tile & 31);
      player.align = 4;
      player.airborne = 0;
      this.enterRoom(destination, player.x, player.y, player.tile);
    } else if (direction === "right") {
      player.x = 0;
      player.tile &= ~31;
      this.enterRoom(this.read(address + 0xea), player.x, player.y, player.tile);
    } else if (direction === "below") {
      if (player.airborne < 11) player.airborne = 2;
      player.y = 0;
      player.tile &= 31;
      this.enterRoom(this.read(address + 0xec), player.x, player.y, player.tile);
    } else {
      player.x = 240;
      player.tile = (player.tile & ~31) | 30;
      this.enterRoom(this.read(address + 0xe9), player.x, player.y, player.tile);
    }
  }

  private checkDanger() {
    const p = this.player;
    const deadly = this.isDeadlyAt(p.x + 2, p.y + 2) || this.isDeadlyAt(p.x + 13, p.y + 13);
    const guardianHit = this.guardians.some((guardian) => this.guardianTouchesWilly(guardian));
    const mariaHit = this.mariaIsPresent() && this.mariaTouchesWilly();
    if (!deadly && !guardianHit && !mariaHit) return;
    this.killWilly();
  }

  private killWilly() {
    this.tone(420, 0.65, 45, 0.06);
    this.lives -= 1;
    if (this.lives < 1) this.reset();
    else {
      this.player = { ...this.savedPlayer };
      this.enterRoom(this.savedRoom, this.player.x, this.player.y, this.player.tile);
    }
  }

  private overlaps(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  private guardianTouchesWilly(guardian: Guardian) {
    const rampOffset = this.willyRampOffset();
    const willyX = this.player.x;
    const willyY = this.player.y + rampOffset;
    if (!this.overlaps(willyX, willyY, 16, 16, guardian.x, guardian.y, 16, 16)) return false;

    const willyFrame = this.player.frame + this.player.direction * 4;
    const willyAddress = 0x9d00 + willyFrame * 32;
    const entry = 0xa000 + guardian.definition * 8;
    const mask = this.read(entry + 1) >> 5;
    const sprite = guardian.frame & mask;
    const guardianAddress = this.read(entry + 5) * 0x100 + sprite * 32;
    const left = Math.max(Math.round(willyX), Math.round(guardian.x));
    const right = Math.min(Math.round(willyX) + 16, Math.round(guardian.x) + 16);
    const top = Math.max(Math.round(willyY), Math.round(guardian.y));
    const bottom = Math.min(Math.round(willyY) + 16, Math.round(guardian.y) + 16);

    for (let y = top; y < bottom; y += 1) {
      const willyRow = y - Math.round(willyY);
      const guardianRow = y - Math.round(guardian.y);
      const willyBits = (this.read(willyAddress + willyRow * 2) << 8) | this.read(willyAddress + willyRow * 2 + 1);
      const guardianBits = (this.read(guardianAddress + guardianRow * 2) << 8) | this.read(guardianAddress + guardianRow * 2 + 1);
      for (let x = left; x < right; x += 1) {
        const willyBit = 0x8000 >> (x - Math.round(willyX));
        const guardianColumn = x - Math.round(guardian.x);
        const guardianBit = 0x8000 >> guardianColumn;
        if ((willyBits & willyBit) && (guardianBits & guardianBit)) return true;
      }
    }
    return false;
  }

  private mariaIsPresent() {
    return this.room === 35 && this.collected.size < 83;
  }

  private mariaFrame() {
    if (this.player.airborne === 0 && this.player.y < 96) return 3;
    if (this.player.airborne === 0 && this.player.y < 104) return 2;
    return (this.tick & 2) >> 1;
  }

  private mariaTouchesWilly() {
    const mariaX = 14 * 8;
    const mariaY = 88;
    const willyX = Math.round(this.player.x);
    const willyY = Math.round(this.player.y + this.willyRampOffset());
    if (!this.overlaps(willyX, willyY, 16, 16, mariaX, mariaY, 16, 16)) return false;
    const willyAddress = 0x9d00 + (this.player.frame + this.player.direction * 4) * 32;
    const frame = this.mariaFrame();
    const left = Math.max(willyX, mariaX);
    const right = Math.min(willyX + 16, mariaX + 16);
    const top = Math.max(willyY, mariaY);
    const bottom = Math.min(willyY + 16, mariaY + 16);
    for (let y = top; y < bottom; y += 1) {
      const willyBits = (this.read(willyAddress + (y - willyY) * 2) << 8) | this.read(willyAddress + (y - willyY) * 2 + 1);
      const mariaBits = MARIA_WHITE[frame][y - mariaY] | MARIA_GREEN[frame][y - mariaY];
      for (let x = left; x < right; x += 1) {
        if ((willyBits & (0x8000 >> (x - willyX))) && (mariaBits & (0x8000 >> (x - mariaX)))) return true;
      }
    }
    return false;
  }

  private draw() {
    if (this.screen === "title") {
      this.drawTitle();
      return;
    }
    const context = this.context;
    context.fillStyle = PALETTE[this.read(this.roomAddress() + 0xde) & 7];
    context.fillRect(0, 0, WIDTH, HEIGHT);
    for (let row = 0; row < 16; row += 1) {
      for (let column = 0; column < 32; column += 1) this.drawTile(column, row, this.tileAt(column, row));
    }
    this.drawRampAndConveyor();
    this.drawItems();
    for (const guardian of this.guardians) this.drawGuardian(guardian);
    if (this.mariaIsPresent()) this.drawMaria();
    this.drawWilly();
    this.drawHud();
  }

  private drawTitle() {
    const context = this.context;
    context.fillStyle = "#000";
    context.fillRect(0, 0, WIDTH, HEIGHT);
    if (this.titleImage.complete) {
      context.imageSmoothingEnabled = false;
      context.drawImage(this.titleImage, 0, 0, WIDTH, HEIGHT);
    }
  }

  private drawTile(column: number, row: number, type: number) {
    const address = this.roomAddress() + 0xa0 + type * 9;
    this.draw8x8(column * 8, row * 8, address + 1, this.read(address));
  }

  private draw8x8(x: number, y: number, bitmapAddress: number, attribute: number) {
    const ink = (attribute & 0x40 ? BRIGHT : PALETTE)[attribute & 7];
    const paper = (attribute & 0x40 ? BRIGHT : PALETTE)[(attribute >> 3) & 7];
    for (let row = 0; row < 8; row += 1) {
      const pixels = this.read(bitmapAddress + row);
      for (let column = 0; column < 8; column += 1) {
        this.context.fillStyle = pixels & (0x80 >> column) ? ink : paper;
        this.context.fillRect(x + column, y + row, 1, 1);
      }
    }
  }

  private decodePosition(first: number, second: number) {
    const attributeAddress = first | (second << 8);
    const cell = attributeAddress - 0x5e00;
    const column = cell & 31;
    const row = cell >> 5;
    return { column, row, x: column * 8, y: row * 8 };
  }

  private drawRampAndConveyor() {
    const address = this.roomAddress();
    const conveyor = this.decodePosition(this.read(address + 0xd7), this.read(address + 0xd8));
    for (let index = 0; index < this.read(address + 0xd9); index += 1) {
      this.draw8x8(conveyor.x + index * 8, conveyor.y, address + 0xce, this.read(address + 0xcd));
    }
    const ramp = this.decodePosition(this.read(address + 0xdb), this.read(address + 0xdc));
    const direction = this.read(address + 0xda) ? 1 : -1;
    for (let index = 0; index < this.read(address + 0xdd); index += 1) {
      this.draw8x8(ramp.x + index * 8 * direction, ramp.y - index * 8, address + 0xc5, this.read(address + 0xc4));
    }
  }

  private drawItems() {
    const address = this.roomAddress();
    for (let item = 0xad; item <= 0xff; item += 1) {
      if (this.collected.has(item)) continue;
      const high = this.read(0xa400 + item);
      const low = this.read(0xa500 + item);
      if ((high & 0x3f) !== this.room) continue;
      const x = (low & 31) * 8;
      const y = (((high >> 7) & 1) * 8 + (low >> 5)) * 8;
      this.draw8x8(x, y, address + 0xe1, 0x47);
    }
  }

  private drawGuardian(guardian: Guardian) {
    const entry = 0xa000 + guardian.definition * 8;
    const page = this.read(entry + 5);
    const mask = this.read(entry + 1) >> 5;
    const sprite = guardian.frame & mask;
    // Horizontal guardian frames already run in the opposite order when the
    // direction changes; the Spectrum routine never mirrors their bitmap.
    this.draw16x16(guardian.x, guardian.y, page * 0x100 + sprite * 32, this.read(entry + 1) & 15, false);
  }

  private drawMaria() {
    const frame = this.mariaFrame();
    this.drawBitmap16(14 * 8, 88, MARIA_WHITE[frame], BRIGHT[7]);
    this.drawBitmap16(14 * 8, 88, MARIA_GREEN[frame], BRIGHT[4]);
  }

  private drawBitmap16(x: number, y: number, rows: readonly number[], colour: string) {
    this.context.fillStyle = colour;
    for (let row = 0; row < 16; row += 1) {
      for (let column = 0; column < 16; column += 1) {
        if (rows[row] & (0x8000 >> column)) this.context.fillRect(x + column, y + row, 1, 1);
      }
    }
  }

  private drawWilly() {
    const frame = this.player.frame + this.player.direction * 4;
    const rampOffset = this.willyRampOffset();
    this.draw16x16(this.player.x, this.player.y + rampOffset, 0x9d00 + frame * 32, 7, false);
  }

  private willyRampOffset() {
    if (this.player.airborne !== 0) return 0;
    if (this.cellType(this.player.tile + 64) === "ramp-left") return this.player.frame * 2;
    if (this.cellType(this.player.tile + 65) === "ramp-right") return 6 - this.player.frame * 2;
    return 0;
  }

  private draw16x16(x: number, y: number, address: number, colour: number, flip: boolean) {
    this.context.fillStyle = BRIGHT[colour & 7];
    for (let row = 0; row < 16; row += 1) {
      const pixels = (this.read(address + row * 2) << 8) | this.read(address + row * 2 + 1);
      for (let column = 0; column < 16; column += 1) {
        if (pixels & (0x8000 >> column)) this.context.fillRect(Math.round(x) + (flip ? 15 - column : column), Math.round(y) + row, 1, 1);
      }
    }
  }

  private drawHud() {
    this.context.fillStyle = "#000";
    this.context.fillRect(0, ROOM_HEIGHT, WIDTH, HEIGHT - ROOM_HEIGHT);
    this.context.fillStyle = "#ffff00";
    this.context.font = "8px monospace";
    this.context.textAlign = "center";
    this.context.fillText(this.roomName().toUpperCase(), WIDTH / 2, 141);
    this.context.fillStyle = "#00ffff";
    this.context.textAlign = "left";
    this.context.fillText(`ITEMS ${String(this.collected.size).padStart(2, "0")}/83`, 8, 158);
    this.context.fillStyle = "#ffffff";
    const totalMinutes = 7 * 60 + this.clockMinutes;
    const hour24 = Math.floor(totalMinutes / 60) % 24;
    const minute = totalMinutes % 60;
    const hour12 = hour24 % 12 || 12;
    this.context.fillText(`${hour12}:${String(minute).padStart(2, "0")} ${hour24 < 12 ? "am" : "pm"}`, 104, 158);
    this.context.fillText(`LIVES ${this.lives}`, 184, 158);
    for (let life = 0; life < this.lives; life += 1) this.draw16x16(8 + life * 18, 168, 0x9d00, 7, false);
  }
}

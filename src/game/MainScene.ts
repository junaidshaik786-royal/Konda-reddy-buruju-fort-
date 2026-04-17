import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  preload() {
    // We'll use high-quality procedurally generated assets or CDN placeholders
    this.load.image('sky', 'https://picsum.photos/seed/night-sky/1920/1080?blur=10');
    this.load.image('bastion', 'https://picsum.photos/seed/kurnool-fort/800/600');
  }

  create() {
    const { width, height } = this.scale;

    // Atmospheric Background
    const bg = this.add.image(width / 2, height / 2, 'sky').setDisplaySize(width, height);
    bg.setTint(0x440000); // Deep red atmospheric tint

    // High-Fidelity Bastion Silhouette (Placeholder)
    const bastion = this.add.image(width / 2, height, 'bastion');
    bastion.setOrigin(0.5, 1);
    bastion.setTint(0x220000);
    bastion.setAlpha(0.8);

    // Advanced Lighting Effects (Post-processing)
    // In Phaser 3.60+, we have powerful FX
    const bloom = this.cameras.main.postFX.addBloom(0xffffff, 1, 1, 2, 1.2);
    
    // Vignette FX
    this.cameras.main.postFX.addVignette(0.5, 0.5, 0.7, 0.5);

    // Interactive Core (Player Placeholder)
    const player = this.add.container(width / 2, height - 100);
    const glow = this.add.circle(0, 0, 40, 0xd4af37, 0.2);
    const core = this.add.circle(0, 0, 10, 0xd4af37);
    
    player.add([glow, core]);

    // Particles for 'GTA-style' atmospheric dust
    const particles = this.add.particles(0, 0, 'core', {
      emitZone: { type: 'rect', source: new Phaser.Geom.Rectangle(0, 0, width, height) },
      speed: { min: 5, max: 20 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.1, end: 0 },
      alpha: { start: 0.3, end: 0 },
      lifespan: 4000,
      frequency: 100,
      blendMode: 'ADD'
    });

    // Animate light
    this.tweens.add({
      targets: glow,
      scale: 1.5,
      alpha: 0.4,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Text Overlay with High Precision
    this.add.text(40, height - 150, 'SECTOR_7 / BASTION_ENTRY', {
      fontFamily: 'JetBrains Mono',
      fontSize: '12px',
      color: '#d4af37'
    }).setAlpha(0.6);
  }

  update() {
    // Real-time atmospheric shifting
    this.cameras.main.scrollX += Math.sin(this.time.now / 1000) * 0.2;
    this.cameras.main.scrollY += Math.cos(this.time.now / 1000) * 0.2;
  }
}

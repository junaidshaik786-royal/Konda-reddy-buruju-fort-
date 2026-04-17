import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private treasures!: Phaser.Physics.Arcade.Group;
  private traps!: Phaser.Physics.Arcade.Group;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private portal!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  
  private score: number = 0;
  private level: number = 1;
  private scoreText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private isGameOver: boolean = false;

  constructor() {
    super('MainScene');
  }

  init(data: { level?: number; score?: number }) {
    this.level = data.level || 1;
    this.score = data.score || 0;
    this.isGameOver = false;
  }

  preload() {
    // High-quality placeholders
    this.load.image('ground', 'https://picsum.photos/seed/stone-floor/400/32');
    this.load.image('player', 'https://picsum.photos/seed/warrior-icon/32/32');
    this.load.image('relic', 'https://picsum.photos/seed/gold-crown/24/24');
    this.load.image('trap', 'https://picsum.photos/seed/fire-trap/32/32');
    this.load.image('portal', 'https://picsum.photos/seed/magic-gate/48/64');
    
    // Cinematic Audio Assets
    this.load.audio('collect', ['https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3']); // Crystal shimmer
    this.load.audio('death', ['https://assets.mixkit.co/active_storage/sfx/2591/2591-preview.mp3']); // Dark impact
    this.load.audio('ambient', ['https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3']); // Dark cinematic
  }

  create() {
    const { width, height } = this.scale;

    // Play Background Ambient
    if (!this.sound.get('ambient')) {
      this.sound.play('ambient', { loop: true, volume: 0.3 });
    }

    // Static Platforms (Procedural level design based on level number)
    this.platforms = this.physics.add.staticGroup();
    
    // Floor
    for (let i = 0; i < width; i += 400) {
      this.platforms.create(i + 200, height - 16, 'ground').refreshBody();
    }

    // Procedural Platforms
    const platformCount = 5 + this.level;
    for (let i = 0; i < platformCount; i++) {
        const x = Phaser.Math.Between(100, width - 100);
        const y = height - (100 + (i * 80));
        this.platforms.create(x, y, 'ground').setScale(0.5).refreshBody();
    }

    // Player Setup
    this.player = this.physics.add.sprite(100, height - 100, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    this.player.setTint(0xd4af37); // Royal Gold

    // Controls
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Treasures
    this.treasures = this.physics.add.group({
        key: 'relic',
        repeat: 8 + this.level,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    this.treasures.children.iterate((child: any) => {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        child.setCollideWorldBounds(true);
        child.setTint(0xffd700);
        return true;
    });

    // Traps
    this.traps = this.physics.add.group();
    const trapCount = this.level * 2;
    for (let i = 0; i < trapCount; i++) {
        const x = Phaser.Math.Between(300, width - 100);
        const y = height - (Phaser.Math.Between(150, height - 150));
        const trap = this.traps.create(x, y, 'trap');
        trap.setTint(0x8b0000);
        trap.setImmovable(true);
        trap.body.allowGravity = false;
        
        // Add patrol tween
        this.tweens.add({
            targets: trap,
            x: x + 100,
            duration: Phaser.Math.Between(1000, 3000),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    // Portal (Exit)
    this.portal = this.physics.add.sprite(width - 50, 100, 'portal');
    this.portal.setImmovable(true);
    this.portal.body.allowGravity = false;
    this.portal.setTint(0x00ffff);

    // Dynamic UI
    this.scoreText = this.add.text(16, 16, `GOLD: ${this.score}`, { 
        fontSize: '24px', 
        fontFamily: 'Cinzel', 
        color: '#d4af37' 
    });
    this.levelText = this.add.text(16, 48, `FLOOR: ${this.level}`, { 
        fontSize: '18px', 
        fontFamily: 'Cinzel', 
        color: '#fff' 
    });

    // Collisions
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.treasures, this.platforms);
    this.physics.add.collider(this.traps, this.platforms);
    this.physics.add.overlap(this.player, this.treasures, this.collectRelic, undefined, this);
    this.physics.add.overlap(this.player, this.traps, this.hitTrap, undefined, this);
    this.physics.add.overlap(this.player, this.portal, this.reachPortal, undefined, this);

    // Advanced FX
    this.cameras.main.postFX.addBloom(0xffffff, 1, 1, 2, 1.2);
    this.cameras.main.postFX.addVignette(0.5, 0.5, 0.7, 0.5);
  }

  update() {
    if (this.isGameOver) return;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-450);
    }
  }

  private collectRelic(player: any, relic: any) {
    relic.disableBody(true, true);
    this.score += 100;
    this.scoreText.setText(`GOLD: ${this.score}`);
    this.sound.play('collect');
    
    // Sparkle effect
    const gem = this.add.circle(relic.x, relic.y, 10, 0xd4af37);
    this.tweens.add({
        targets: gem,
        scale: 4,
        alpha: 0,
        duration: 500,
        onComplete: () => gem.destroy()
    });
  }

  private hitTrap(player: any, trap: any) {
    this.isGameOver = true;
    this.physics.pause();
    player.setTint(0xff0000);
    this.sound.play('death');
    
    this.cameras.main.shake(500, 0.01);
    
    const failText = this.add.text(this.scale.width/2, this.scale.height/2, 'DEFEATED IN THE TUNNELS', {
        fontFamily: 'Cinzel',
        fontSize: '48px',
        color: '#ff0000'
    }).setOrigin(0.5);

    this.time.delayedCall(2000, () => {
        // Emit custom event for React to handle game over
        this.events.emit('GAME_OVER', { score: this.score, level: this.level });
        this.scene.start('MainScene', { level: 1, score: 0 });
    });
  }

  private reachPortal(player: any, portal: any) {
    this.sound.play('collect');
    this.level += 1;
    this.scene.start('MainScene', { level: this.level, score: this.score });
  }
}

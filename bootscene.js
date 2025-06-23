class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(){
    this.load.image("boot_bg","png/boot_bg.jpg");
  }

  create() {
    this.add.image(0, 0, 'boot_bg').setOrigin(0).setDisplaySize(this.cameras.main.width, this.cameras.main.height).setDepth(-1);
    const fullText = '請從左側選擇開始遊戲或進入商店';
    const textObj = this.add.text(280, 560, '', {
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
      fontSize: '26px',
      color: '#000000',
      padding: { x: 10, y: 5 },
      wordWrap: { width: 900 }
    });

    this.typeWriter(textObj, fullText, 60);
  }

  typeWriter(textObj, fullText, speed = 50, onComplete = null) {
    let i = 0;
    this.time.addEvent({
      delay: speed,
      repeat: fullText.length - 1,
      callback: () => {
        textObj.text += fullText[i];
        i++;
        if (i === fullText.length && onComplete) onComplete();
      }
    });
  }
}

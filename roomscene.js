class RoomScene extends Phaser.Scene {
    constructor() {
        super({ key: 'RoomScene' });
    }

    preload(){
        this.load.image("room_bg","png/room_bg.jpg");
        this.load.image("1","png/1.png");
        this.load.image("2","png/2.png");
        this.load.image("3","png/3.png");
        this.load.image("4","png/4.png");
        this.load.image("5","png/5.png");
        this.load.image("6","png/6.png");
        this.load.image("7","png/7.png");
        this.load.image("8","png/8.png");
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');
        this.add.image(0, 0, 'room_bg').setOrigin(0).setDisplaySize(this.cameras.main.width, this.cameras.main.height).setDepth(-1);

        const imageKeys = {
            item1: '1', item2: '2', item3: '3', item4: '4',
            item5: '5', item6: '6', item7: '7', item8: '8'
        };

        const positions = {
            item1: { x: 140, y: 150 }, item2: { x: 290, y: 160 },
            item3: { x: 450, y: 100 }, item4: { x: 610, y: 90 },
            item5: { x: 770, y: 150 }, item6: { x: 200, y: 520 },
            item7: { x: 450, y: 520 }, item8: { x: 800, y: 520 }
        };

        const saved = localStorage.getItem('purchasedItems');
        window.purchasedItems = saved ? JSON.parse(saved) : {};

        for (const key in window.purchasedItems) {
            if (window.purchasedItems[key]) {
                const imgKey = imageKeys[key];
                const pos = positions[key];
                this.add.image(pos.x, pos.y, imgKey).setScale(0.15);
            }
        }
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
    takeScreenshot() {
        this.game.renderer.snapshot((image) => {
            const a = document.createElement('a');
            a.href = image.src;
            a.download = 'screenshot.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    }
}

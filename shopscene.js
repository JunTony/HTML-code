class ShopScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ShopScene' });
    }

    preload(){
        this.load.image("1","png/1.png");
        this.load.image("2","png/2.png");
        this.load.image("3","png/3.png");
        this.load.image("4","png/4.png");
        this.load.image("5","png/5.png");
        this.load.image("6","png/6.png");
        this.load.image("7","png/7.png");
        this.load.image("8","png/8.png");
        this.load.image("shopcoin","png/shopcoin.png");
        this.load.image("shop_bg","png/shop_bg.jpg");
    }

    create() {
        this.background = this.add.image(500, 300, 'shop_bg').setScale(1.65).setDepth(-1);
        // 打字效果
        const textObj = this.add.text(300, 80, '', {
            padding: { top: 10, bottom: 10, left: 10, right: 10 },
            fontSize: '24px', color: '#000000', wordWrap: { width: 900 }
        }).setOrigin(0, 0);
        const fullText = '歡迎來到商店 以下為可購買商品';
        this.typeWriter(textObj, fullText, 60);

        // 商品圖片
        for (let i = 1; i <= 8; i++) {
            const x = 180 + ((i - 1) % 4) * 210;
            const y = i <= 4 ? 220 : 420;
            this.add.image(x, y, `${i}`).setScale(0.15);
        }

        this.add.image(120, 50, 'shopcoin').setScale(0.2);
        this.goldText = this.add.text(100, 30, `${window.shopcoin}`, {
            fontSize: '30px', color: '#000000', fontFamily: 'Arial',
            padding: { x: 10, y: 5 }
        });

        // 商品清單
        this.items = [
            { name: "Tralalero Tralala", price: 100 },
            { name: "Bombardiro Crocodilo", price: 150 },
            { name: "Tung Tung Tung Sahur", price: 200 },
            { name: "Lirilì Larilà", price: 250 },
            { name: "Brr Brr Patapim", price: 120 },
            { name: "Chimpanzini Bananini", price: 180 },
            { name: "Ballerina Cappuccina", price: 300 },
            { name: "Cappuccino Assassino", price: 80 }
        ];

        const startX = 80, startY = 300, gapX = 220, gapY = 200;

        this.items.forEach((item, index) => {
            const col = index % 4;
            const row = Math.floor(index / 4);
            const x = startX + col * gapX;
            const y = startY + row * gapY;

            const isBought = window.purchasedItems[`item${index + 1}`];

            const btn = this.add.text(x, y, isBought ? `${item.name}\n✅ 已購買` : `${item.name}\n${item.price}金幣`, {
                fontSize: '16px',
                backgroundColor: isBought ? '#cccccc' : '#ffffcc',
                color: isBought ? '#666666' : '#000000',
                padding: { left: 10, right: 10, top: 5, bottom: 5 },
                align: 'center'
            }).setInteractive({ useHandCursor: true });

            if (!isBought) {
                btn.on('pointerdown', () => this.purchaseItem(item, index, btn));
            } else {
                btn.disableInteractive();
            }
        });
    }

    purchaseItem(item, index, btn) {
        if (window.shopcoin >= item.price) {
            window.shopcoin -= item.price;
            window.purchasedItems[`item${index + 1}`] = true;

            // 更新畫面
            this.goldText.setText(`${window.shopcoin}`);
            btn.setText(`${item.name}\n✅ 已購買`);
            btn.disableInteractive();
            btn.setStyle({ backgroundColor: '#cccccc', color: '#666666' });

            // 存入 localStorage
            localStorage.setItem('purchasedItems', JSON.stringify(window.purchasedItems));
            localStorage.setItem('shopcoin', window.shopcoin);

            alert(`成功購買 ${item.name}！`);
        } else {
            alert(`金幣不足，無法購買 ${item.name}。`);
        }
    }

    typeWriter(textObj, fullText, speed = 50, onComplete = null) {
        let i = 0;
        this.time.addEvent({
            delay: speed,
            repeat: fullText.length - 1,
            callback: () => {
                textObj.text += fullText[i++];
                if (i === fullText.length && onComplete) onComplete();
            }
        });
    }
}

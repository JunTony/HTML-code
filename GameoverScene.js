class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  preload(){
    this.load.image("connection_bg","png/connection_bg.jpeg");
    this.load.image("confidence_bg","png/confidence_bg.jpeg");
    this.load.image("resilience_bg","png/resilience_bg.jpeg");
    this.load.image("gold_bg","png/gold_bg.jpeg");
    this.load.image("success_bg","png/success_bg.jpeg");
  }

  init(data) {
    this.win = data.win;  // 由前一個Scene傳進來是否勝利
    this.failReason = data.failReason;
  }

  create() {
    const message = this.win
      ? '🎉 恭喜你成功通關人生風險實驗室！'
      : '💔 有一項屬性歸零，人生風險實驗室挑戰失敗。';

    // 👇 加入不同背景圖判斷
    if (!this.win) {
      const bgMap = {
        gold: 'gold_bg',
        connection: 'connection_bg',
        confidence: 'confidence_bg',
        resilience: 'resilience_bg'
      };
      const bgKey = bgMap[this.failReason];
      if (bgKey) {
        this.add.image(500, 300, bgKey).setDepth(-1).setAlpha(0.7).setScale(0.6); // 加一張背景圖
      }
    }else{
      this.add.image(500, 300, 'success_bg').setDepth(-1).setAlpha(0.7).setScale(0.6); // 加一張背景圖
    }

    // 原有訊息與屬性
    this.add.text(200, 200, message, {
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#000000',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      padding: { x: 20, y: 10 }
    });

    // 顯示玩家最終屬性
    const attributes = [
      `💰 金幣：${window.playerGold}K`,
      `🔗 人脈：${window.connection}%`,
      `💪 自信：${window.confidence}%`,
      `🧠 韌性：${window.resilience}%`
    ];

    if (this.win) {
      attributes.push(`💰 商城金幣+${window.playerGold}`);
      window.shopcoin += window.playerGold;

      // 以 50 為基準，每多/少 3 點加/扣金幣
      const getDelta = (value) => Math.floor((value - 50) / 3);

      const deltaConnection = getDelta(window.connection);
      const deltaConfidence = getDelta(window.confidence);
      const deltaResilience = getDelta(window.resilience);

      const bonus = deltaConnection + deltaConfidence + deltaResilience;

      if (bonus !== 0) {
        const sign = bonus > 0 ? '+' : '';
        attributes.push(`🎁 屬性差異影響金幣 ${sign}${bonus}`);
        window.shopcoin += bonus;
      }
    }

    attributes.forEach((text, i) => {
      this.add.text(400, 280 + i * 40, text, {
        fontSize: '24px',
        color: '#000000',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        padding: { x: 10, y: 5 }
      });
    });
  }
}

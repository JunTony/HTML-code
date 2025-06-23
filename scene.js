class Scene extends Phaser.Scene {
  constructor() {
    super({ key: 'Scene' });
  }
  
  preload(){
    this.load.image("coin","png/coin.png");
    this.load.image("connection","png/connection.png");
    this.load.image("confidence","png/confidence.png");
    this.load.image("resilience","png/resilience.jpg");
    this.load.image("20","png/20_bg.jpeg");
    this.load.image("30","png/30_bg.jpeg");
    this.load.image("42","png/42_bg.jpeg");
    this.load.image("55","png/55_bg.jpeg");
    this.load.image("70","png/70_bg.jpeg");
    this.load.image("chat","png/chat.png");
    this.load.image("frame","png/frame.png");
    this.load.json('story', 'story.json');
  }

  create() {
    this.background = this.add.image(500, 300, '20').setScale(0.6).setDepth(-1);
    this.dialogueBox = this.add.image(500, 510, 'chat');
    this.frameBox = this.add.image(870, 240, 'frame');
    this.frameBox.setScale(0.45, 0.6).setAlpha(0.8).setDepth(0);
    this.dialogueBox.setScale(1.13, 0.8).setAlpha(0.7);
    this.dialogueBox.setDepth(0);
    // 劇情內容
    this.storyData = this.cache.json.get('story');
    this.storyIndex = 0;
    // 文字區塊
    this.textBox = this.add.text(50, 400, '', {
      fontSize: '24px',
      color: '#000',
      wordWrap: { width: 700 },
      padding: { top: 10, bottom: 10, left: 10, right: 10 },
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
    });
    this.textBox.setDepth(2);

    // 按鈕建立（3個）
    this.choiceButtons = [];
    for (let i = 0; i < 3; i++) {
      const btn = this.add.text(50 , 450 + i * 50, '', {
        fontSize: '20px',
        color: '#000000',
        backgroundColor: '#ffff99',
        padding: { left: 20, right: 20, top: 10, bottom: 10 }
      })
      .setInteractive({ useHandCursor: true })
      .setVisible(false)
      .on('pointerdown', () => {
        this.onChoice(i);
      });

      this.choiceButtons.push(btn);
    }

    this.showStory(this.storyIndex);
    this.add.image(50, 80, 'coin').setScale(0.03);
    this.add.image(450, 80, 'connection').setScale(0.3);
    this.add.image(650, 80, 'confidence').setScale(0.05);
    this.add.image(850, 80, 'resilience').setScale(0.1);
    this.multiSelectTimer = null;
    this.countdownText = this.add.text(470, 407, '', {
      fontSize: '22px',
      color: '#ff3333',
      fontFamily: 'Arial',
    });
    this.countdownText.setVisible(false);
    this.goldText = this.add.text(90, 60, `${window.playerGold}K`, {
      fontSize: '30px',
      color: '#000',
      fontFamily: 'Arial',
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
      padding: { x: 10, y: 5 }
    });
    this.connectionText = this.add.text(480, 60, `${window.connection}%`, {
      fontSize: '30px',
      color: '#000',
      fontFamily: 'Arial',
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
      padding: { x: 10, y: 5 }
    });
    this.confidenceText = this.add.text(680, 60, `${window.confidence}%`, {
      fontSize: '30px',
      color: '#000',
      fontFamily: 'Arial',
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
      padding: { x: 10, y: 5 }
    });
    this.resilienceText = this.add.text(880, 60, `${window.resilience}%`, {
      fontSize: '30px',
      color: '#000',
      fontFamily: 'Arial',
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
      padding: { x: 10, y: 5 }
    });
    this.insuranceText = this.add.text(750, 150, '📄 已購買保險：\n（尚未購買）', {
      fontSize: '18px',
      color: '#000',
      //backgroundColor: '#000',
      wordWrap: { width: 700 },
      padding: { x: 10, y: 5 }
    });
  }

  showStory(index) {
    const backgroundMap = {
      // 20歲背景
      0: "20", 1: "20", 2: "20", 3: "20", 4: "20", 5: "20", 6: "20", 7: "20", 8: "20", 9: "20", 10: "20", 
      
      // 30歲背景
      11: "30", 12: "30", 13: "30", 14: "30", 15: "30", 16: "30", 17: "30", 18: "30", 19: "30", 20: "30",
      21: "30",
      
      // 42歲背景
      22: "42", 23: "42", 24: "42", 25: "42", 26: "42", 27: "42", 28: "42", 29: "42", 30: "42", 31: "42",
      32: "42",
      
      // 55歲背景
      33: "55", 34: "55", 35: "55", 36: "55", 37: "55", 38: "55", 39: "55", 40: "55", 41: "55", 42: "55",
      43: "55",
      
      // 70歲背景
      44: "70", 45: "70", 46: "70", 47: "70", 48: "70", 49: "70", 50: "70", 51: "70", 52: "70", 53: "70",
      54: "70"
    };
    this.handleInsuranceEvent(index);
    if (this.multiSelectTimer) {
      this.multiSelectTimer.remove(false);
      this.multiSelectTimer = null;
    }
    if (this.countdownEvent) {
      this.countdownEvent.remove(false);
      this.countdownEvent = null;
    }
    this.multiSelectCounting = false; // 重置倒數旗標
    const bgKey = backgroundMap[index];
    if (bgKey) {
      this.background.setTexture(bgKey);
      this.background.setScale(0.6); // 如需縮小
    }
    const data = this.storyData[index];
    this.textBox.setText('');
    this.choiceButtons.forEach(btn => btn.setVisible(false));

    this.typeWriter(this.textBox, data.text, 180, () => {
      // 顯示選項
      data.choices.forEach((choice, i) => {
        this.choiceButtons[i].setText(choice.text).setVisible(true).setStyle({ backgroundColor: '#ffff99' });
        // 初始化所有選項為未選
        if (data.multiSelect) {
          window.selectedChoices[i] = false;
          this.choiceButtons[i].setStyle({ backgroundColor: '#ffff99' });
        }
      });

      // 複選模式倒數計時從這裡開始
      if (data.multiSelect) {
        this.multiSelectCounting = true;
        let countdown = 10;
        this.countdownText.setText(`還有 ${countdown} 秒自動跳轉...`);
        this.countdownText.setVisible(true);
        this.countdownText.setStyle({
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          color: '#000',
          padding: { x: 10, y: 5 }
        });

        // 每秒更新倒數
        this.countdownEvent = this.time.addEvent({
          delay: 1000,
          repeat: countdown - 1,
          callback: () => {
            countdown--;
            this.countdownText.setText(`還有 ${countdown} 秒自動跳轉...`);
            this.countdownText.setStyle({
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              color: '#000',
              padding: { x: 10, y: 5 }
            });
          }
        });

        // 10秒後跳轉
        this.multiSelectTimer = this.time.delayedCall(10000, () => {
          this.countdownText.setVisible(false);
          this.multiSelectCounting = false;
          let purchaseCount = 0;
          data.choices.forEach((choice, i) => {
            if (window.selectedChoices[i] && choice.type) {
              const price = choice.price || 10;
              if (!window.insurancePurchased[choice.type]) {
                window.insurancePurchased[choice.type] = true;
                window.playerGold -= price;
                this.goldText.setText(`${window.playerGold}K`);
                //this.checkImmediateGameOver();

                // 計算每條訊息的 Y 偏移
                const yOffset = 300 + purchaseCount * 30;
                const msg = this.add.text(50, yOffset,
                  `已購買保險：${this.getInsuranceName(choice.type)}，扣除 ${price} K金幣`,
                  { fontSize: '22px', color: '#00ffff', backgroundColor: '#000', padding: { x: 10, y: 5 } }
                );
                this.time.delayedCall(3000, () => msg.destroy());
                purchaseCount++; // 每購買一個保險就增加偏移
              }
            }
          });
          this.updateInsuranceText?.();
          if (data.next !== undefined) {
            this.storyIndex = data.next;
            this.showStory(this.storyIndex);
          }
        });
      }

      // 其他autoNext邏輯保留
      if (data.autoNext !== undefined) {
        this.time.delayedCall(1000, () => {
          this.storyIndex = data.autoNext;
          this.showStory(this.storyIndex);
        });
      }
      if (index === this.storyData.length - 1) { // 到達最後一章
        if (
          window.playerGold > 0 &&
          window.connection > 0 &&
          window.confidence > 0 &&
          window.resilience > 0
        ) {
          // 成功通關
          this.scene.start('GameOverScene', { win: true });
        } else {
          // 失敗情況（可選，通常失敗會在扣數值時即時判斷）
          this.scene.start('GameOverScene', { win: false });
        }
      }
      this.checkImmediateGameOver();
    });
  }

  handleInsuranceEvent(index) {
  // 定義各種事件對應的保險項目、金幣變動與提示訊息
  const events = {
    2: {
      message: '信心減少20',
      affectedAttributes: { confidence: -20 },
      hasInsuranceCost: 0,
      noInsuranceCost: 0,
      insuranceKey: null,  // 無保險判斷
    },
    5: {
      message: '人際連結減少35',
      affectedAttributes: { connection: -35 },
      hasInsuranceCost: 0,
      noInsuranceCost: 0,
      insuranceKey: null,  // 無保險判斷
    },
    6: {
      message: '心理韌性減少30',
      affectedAttributes: { resilience: -30 },
      hasInsuranceCost: 0,
      noInsuranceCost: 0,
      insuranceKey: null,  // 無保險判斷
    },
    8: {
      message: '心理韌性減少25',
      affectedAttributes: { resilience: -25 },
      hasInsuranceCost: 0,
      noInsuranceCost: 0,
      insuranceKey: null,  // 無保險判斷
    },
    15: {
      message: '心理韌性增加10',
      affectedAttributes: { resilience: +10 },
      hasInsuranceCost: 0,
      noInsuranceCost: 0,
      insuranceKey: null,  // 無保險判斷
    },
    17: {
      message: '心理韌性減少30',
      affectedAttributes: { resilience: -30 },
      hasInsuranceCost: 0,
      noInsuranceCost: 0,
      insuranceKey: null,  // 無保險判斷
    },
    19: {
      message: '人際連結增加15',
      affectedAttributes: { connection: +15 },
      hasInsuranceCost: 0,
      noInsuranceCost: 0,
      insuranceKey: null,  // 無保險判斷
    },
    24: {
      message: '心理韌性增加10、自信心增加5',
      affectedAttributes: { resilience: +10, confidence: +5 },
      hasInsuranceCost: 0,
      noInsuranceCost: 0,
      insuranceKey: null,  // 無保險判斷
    },
    26: {
      message: '人際連結增加15、自信心增加15',
      affectedAttributes: { connection: +15, confidence: +15 },
      hasInsuranceCost: 0,
      noInsuranceCost: 0,
      insuranceKey: null,  // 無保險判斷
    },
    28: {
      message: '心理韌性減少35',
      affectedAttributes: { resilience: -35 },
      hasInsuranceCost: 0,
      noInsuranceCost: 0,
      insuranceKey: null,  // 無保險判斷
    },
    34: {
      message: '人際連結增加30、心理韌性增加30',
      affectedAttributes: { connection: +30, resilience: +30 },
      hasInsuranceCost: 0,
      noInsuranceCost: 0,
      insuranceKey: null,  // 無保險判斷
    },
    40: {
      message: '人際連結增加5',
      affectedAttributes: { connection: +5 },
      hasInsuranceCost: 0,
      noInsuranceCost: 0,
      insuranceKey: null,  // 無保險判斷
    },
    41: {
      message: '心理韌性減少35',
      affectedAttributes: { resilience: -35 },
      hasInsuranceCost: 0,
      noInsuranceCost: 0,
      insuranceKey: null,  // 無保險判斷
    },
    45: {
      message: '心理韌性增加15、自信心增加15',
      affectedAttributes: { resilience: +15, confidence: +15 },
      hasInsuranceCost: 0,
      noInsuranceCost: 0,
      insuranceKey: null,  // 無保險判斷
    },
    46: {
      message: '人際連結增加10',
      affectedAttributes: { connection: +10 },
      hasInsuranceCost: 0,
      noInsuranceCost: 0,
      insuranceKey: null,  // 無保險判斷
    },
    47: {
      message: '心理韌性減少35',
      affectedAttributes: { resilience: -35 },
      hasInsuranceCost: 0,
      noInsuranceCost: 0,
      insuranceKey: null,  // 無保險判斷
    },
    48: {
      message: '心理韌性增加10',
      affectedAttributes: { resilience: +10 },
      hasInsuranceCost: 0,
      noInsuranceCost: 0,
      insuranceKey: null,  // 無保險判斷
    },
    50: {
      message: '心理韌性減少25、人際連結減少25',
      affectedAttributes: { resilience: -25, connection: -25 },
      hasInsuranceCost: 0,
      noInsuranceCost: 0,
      insuranceKey: null,  // 無保險判斷
    },
    51: {
      message: '心理韌性增加10',
      affectedAttributes: { resilience: +10 },
      hasInsuranceCost: 0,
      noInsuranceCost: 0,
      insuranceKey: null,  // 無保險判斷
    },
    13: {
      insuranceKey: 'criticalIllness',
      hasInsuranceCost: 3,
      noInsuranceCost: 8,
      message: '健康出現狀況'
    },
    16: {
      insuranceKey: 'incomeProtection',
      hasInsuranceCost: 2,
      noInsuranceCost: 10,
      message: '懷孕期間收入減少'
    },
    18: {
      insuranceKey: 'propertyInsurance',
      hasInsuranceCost: 5,
      noInsuranceCost: 30,
      message: '房屋遭遇火災'
    },
    23: {
      insuranceKey: 'longTermCare',
      hasInsuranceCost: 1,
      noInsuranceCost: 10,
      message: '父母因失能需長期照護'
    },
    25: {
      insuranceKey: 'longTermCare',
      hasInsuranceCost: 3,
      noInsuranceCost: 20,
      message: '因需聘請全天看護，加上醫療費用，財務迅速惡化'
    },
    27: {
      insuranceKey: 'enhancedMedical',
      hasInsuranceCost: 3,
      noInsuranceCost: 9,
      message: '因壓力過大導致健康亮紅燈'
    },
    29: {
      insuranceKey: 'educationFund',
      hasInsuranceCost: 2,
      noInsuranceCost: 6,
      message: '有事先投保教育基金險'
    },
    31: {
      insuranceKey: 'educationFund',
      hasInsuranceCost: 3,
      noInsuranceCost: 7,
      message: '高昂學費與補習費使家庭財務吃緊'
    },
    35: {
      insuranceKey: 'accidentSenior',
      hasInsuranceCost: 2,
      noInsuranceCost: 12,
      message: '旅途中不慎跌倒骨折'
    },
    36: {
      insuranceKey: 'accidentSenior',
      hasInsuranceCost: 1,
      noInsuranceCost: 7,
      message: '志工旅途中因高原反應住院'
    },
    37: {
      insuranceKey: 'enhancedMedical2',
      hasInsuranceCost: 7,
      noInsuranceCost: 30,
      message: '發現慢性病'
    },
    39: {
      insuranceKey: 'enhancedMedical2',
      hasInsuranceCost: 3,
      noInsuranceCost: 21,
      message: '視輕忽檢查導致後續併發腎臟問題，須定期洗腎'
    },
    42: {
      insuranceKey: 'cancerEarly',
      hasInsuranceCost: 3,
      noInsuranceCost: 10,
      message: '偶然參加健檢發現腫瘤'
    },
    45: {
      insuranceKey: 'accidentElderly',
      hasInsuranceCost: 3,
      noInsuranceCost: 15,
      message: '因突發跌倒需住院'
    },
    49: {
      insuranceKey: 'lifeTrust',
      hasInsuranceCost: 10,
      noInsuranceCost: 20,
      message: '你遺產處理過程發現保單遺失與法律不清'
    },
    52: {
      insuranceKey: 'accidentElderly',
      hasInsuranceCost: 2,
      noInsuranceCost: 6,
      message: '你在活動中跌倒骨折'
    },
    53: {
      insuranceKey: 'lifeTrust',
      hasInsuranceCost: 10,
      noInsuranceCost: 50,
      message: '對方其實另有所圖，試圖介入財產安排'
    },
    // 你可以依照情境繼續加更多事件
  };
  
  const event = events[index];
  if (!event) return; // 沒對應事件就略過

  const hasInsurance = event.insuranceKey ? window.insurancePurchased[event.insuranceKey] : false;
  const cost = hasInsurance ? event.hasInsuranceCost : event.noInsuranceCost;

  // 扣金錢
  if(cost > 0) {
    window.playerGold = Math.max(0, window.playerGold - cost);
    this.goldText.setText(`${window.playerGold}K`);
  }

  // 扣屬性分數（避免變成負數）
  if (event.affectedAttributes) {
    if (typeof event.affectedAttributes.connection === 'number') {
      window.connection = Math.min(100, Math.max(0, window.connection + event.affectedAttributes.connection));
      this.connectionText.setText(`${window.connection}%`);
      //this.checkImmediateGameOver();
    }
    if (typeof event.affectedAttributes.confidence === 'number') {
      window.confidence = Math.min(100, Math.max(0, window.confidence + event.affectedAttributes.confidence));
      this.confidenceText.setText(`${window.confidence}%`);
      //this.checkImmediateGameOver();
    }
    if (typeof event.affectedAttributes.resilience === 'number') {
      window.resilience = Math.min(100, Math.max(0, window.resilience + event.affectedAttributes.resilience));
      this.resilienceText.setText(`${window.resilience}%`);
      //this.checkImmediateGameOver();
    }
}


  // 顯示提示訊息
  const color = hasInsurance ? '#00ff00' : '#ff0000';
  let displayMsg = event.message;

  // 如果事件與保險有關，才顯示保險與扣金幣的說明
  if (event.insuranceKey) {
    displayMsg += `，${hasInsurance ? '有保險幫助' : '沒有保險'}，扣 ${cost} K金幣！`;
  } else if (cost > 0) {
    displayMsg += `，扣 ${cost} K金幣！`;
  }

  const msg = this.add.text(50, 360, displayMsg, {
    fontSize: '22px',
    color: hasInsurance ? '#00ff00' : '#ff0000',
    backgroundColor: '#000',
    padding: { x: 10, y: 5 }
  });

  this.time.delayedCall(7000, () => msg.destroy());
  //this.checkImmediateGameOver();
}


  onChoice(index) {
    const data = this.storyData[this.storyIndex];
    const choice = data.choices[index];
    if (!choice) return;

    if (data.multiSelect) {
      // 切換選項狀態，倒數不動
      window.selectedChoices[index] = !window.selectedChoices[index];
      this.choiceButtons[index].setStyle({
        backgroundColor: window.selectedChoices[index] ? '#00cc66' : '#ffff99'
      });
      return;
    }

    // 單選模式保持原本邏輯
    if (choice.randomNext && Array.isArray(choice.randomNext)) {
      const randomIndex = Phaser.Math.Between(0, choice.randomNext.length - 1);
      this.storyIndex = choice.randomNext[randomIndex];
    } else if (choice.next !== undefined) {
      this.storyIndex = choice.next;
    }

    this.showStory(this.storyIndex);
  }



  typeWriter(textObj, fullText, speed, onComplete) {
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

  updateInsuranceText() {
    const purchased = Object.entries(window.insurancePurchased)
      .filter(([key, val]) => val)
      .map(([key]) => `✔ ${this.getInsuranceName(key)}`);

    if (purchased.length === 0) {
      this.insuranceText.setText('📄 已購買保險：\n（尚未購買）');
    } else {
      this.insuranceText.setText('📄 已購買保險：\n' + purchased.join('\n'));
    }
  }

  // 方便用的名稱轉換函式
  getInsuranceName(key) {
    const map = {
      criticalIllness: '重大疾病險',
      incomeProtection: '收入保障險',
      propertyInsurance: '房屋財產險',
      enhancedMedical: '醫療險加強版',
      educationFund: '教育基金險',
      longTermCare: '長期照護險',
      enhancedMedical2: '醫療險加強版2',
      accidentSenior: '意外險（熟年版）',
      cancerEarly: '癌症險（早期理賠型）',
      longCare: '長照險',
      accidentElderly: '意外險（高齡延伸版）',
      lifeTrust: '壽險／遺產信託型保單',
    };
    return map[key] || key;
  }

  checkImmediateGameOver() {
    let reason = null;

    if (window.playerGold <= 0) {
      reason = 'gold';
    } else if (window.connection <= 0) {
      reason = 'connection';
    } else if (window.confidence <= 0) {
      reason = 'confidence';
    } else if (window.resilience <= 0) {
      reason = 'resilience';
    }

    if (reason) {
      this.scene.start('GameOverScene', {
        win: false,
        failReason: reason
      });
    }
  }

  showEnding(win) {
    this.choiceButtons.forEach(btn => btn.setVisible(false));
    this.countdownText.setVisible(false);

    const message = win
      ? '🎉 恭喜你通關人生！'
      : '💔 有一項屬性歸零，你的人生暫時失敗了。';

    this.textBox.setText(message);
  }
}
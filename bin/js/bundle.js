(function () {
    'use strict';

    class Loading extends Laya.Script {
        constructor() {
            super();
            this.loadingProgress = null;
        }
        onStart() {
            var resourceArray = [
                { url: "res/atlas/main.atlas", type: Laya.Loader.ATLAS },
                { url: "res/atlas/comp.atlas", type: Laya.Loader.ATLAS },
                { url: "res/sound/Menu.mp3", type: Laya.Loader.SOUND },
                { url: "res/sound/GamePlay.mp3", type: Laya.Loader.SOUND },
                { url: "res/sound/GameOver.ogg", type: Laya.Loader.SOUND },
                { url: "res/sound/Options.mp3", type: Laya.Loader.SOUND },
                { url: "res/sound/Pop.mp3", type: Laya.Loader.SOUND },
                { url: "res/sound/Restart.ogg", type: Laya.Loader.SOUND },
                { url: "res/sound/Bomb.mp3", type: Laya.Loader.SOUND },
                { url: "res/sound/Button.ogg", type: Laya.Loader.SOUND },
                { url: "fonts/Bubble3D.ttf", type: Laya.Loader.TTF },
                { url: "fonts/Pirate of the Seaside Bubbles.ttf", type: Laya.Loader.TTF }
            ];
            Laya.loader.load(resourceArray, null, Laya.Handler.create(this, this.onProgress, null, false));
            this.setProgressBar();
        }
        setProgressBar() {
            this.loadingProgress.value = 0;
        }
        onProgress(value) {
            this.loadingProgress.value = value;
            if (this.loadingProgress.value >= 1) {
                this.loadingProgress.value = 1;
                Laya.Scene.open('main.scene', true, 0, Laya.Handler.create(this, () => {
                    Laya.Scene.destroy("loading.scene");
                }));
                return;
            }
        }
    }

    class ButtonEffect extends Laya.Script {
        constructor() {
            super();
        }
        onMouseDown() {
            if (this.nameButton === "info") {
                Laya.Tween.to(this.currentButton, { scaleY: 0.8 }, 100, Laya.Ease.elasticInOut, Laya.Handler.create(this, this.onHideButtonAnim));
            }
            else if (this.nameButton === "sound") {
                Laya.Tween.to(this.currentButton, { scaleY: 1.6 }, 100, Laya.Ease.elasticInOut, Laya.Handler.create(this, this.onHideButtonAnim));
            }
        }
        onMouseOver() {
            if (this.nameButton === "info") {
                this.currentButton.scaleY = 0.8;
            }
            else if (this.nameButton === "sound") {
                this.currentButton.scaleY = 1.6;
            }
        }
        onMouseUp() {
            if (this.nameButton === "info") {
                Laya.Tween.to(this.currentButton, { scaleY: 0.8 }, 100, Laya.Ease.elasticInOut, Laya.Handler.create(this, this.onHideButtonAnim));
            }
            else if (this.nameButton === "sound") {
                Laya.Tween.to(this.currentButton, { scaleY: 1.6 }, 100, Laya.Ease.elasticInOut, Laya.Handler.create(this, this.onHideButtonAnim));
            }
        }
        onHideButtonAnim() {
            if (this.nameButton === "info") {
                this.currentButton.scaleY = 0.7;
            }
            else if (this.nameButton === "sound") {
                this.currentButton.scaleY = 1.5;
            }
        }
        onEnable() {
            this.currentButton = this.owner;
            this.currentButton.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);
            this.currentButton.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
            this.currentButton.on(Laya.Event.MOUSE_OVER, this, this.onMouseOver);
            this.currentButton.on(Laya.Event.MOUSE_OUT, this, this.onHideButtonAnim);
        }
    }

    class BubbleBox extends Laya.Script {
        constructor() {
            super();
            this.isUpdateTime = false;
            BubbleBox.instance = this;
        }
        onEnable() {
            this.currentBubble = this.owner;
            this.bubbleRig = this.owner.getComponent(Laya.RigidBody);
        }
        onDisable() {
            Laya.Pool.recover("bubbleBox", this.owner);
        }
        onTriggerEnter(other, self, contact) {
            if (other.label === "wall") {
                this.currentBubble.removeSelf();
            }
        }
        onMouseDown() {
            if (GameManager.instance.isPlaying) {
                if (this.typeBubble === "normal") {
                    GameManager.instance.playSound('Pop', 1.0, '.mp3');
                    this.onShowPop();
                    this.currentBubble.removeSelf();
                    GameManager.instance.nScore++;
                    GameManager.instance.updateScore();
                }
                else if (this.typeBubble === "bonus") {
                    GameManager.instance.playSound('Pop', 1.0, '.mp3');
                    this.onShowPop();
                    this.currentBubble.removeSelf();
                    GameManager.instance.onUpdateTimer();
                }
                else if (this.typeBubble === "bomb") {
                    GameManager.instance.playSound('Bomb', 1.0, '.mp3');
                    Laya.timer.loop(10, GameManager.instance, GameManager.instance.onVibrateScreen);
                    Laya.physicsTimer.pause();
                }
                else if (this.typeBubble === "obstacle") {
                    GameManager.instance.playSound('Pop', 1.0, '.mp3');
                    this.onShowPop();
                    this.currentBubble.removeSelf();
                    GameManager.instance.isShowObstacles = true;
                    GameManager.instance.onShowObstacles();
                }
            }
        }
        onShowPop() {
            let pop = Laya.Pool.getItemByCreateFun("pop", this.createEffect, this);
            pop.pos(this.currentBubble.x, this.currentBubble.y);
            this.currentBubble.parent.addChild(pop);
            pop.play(0, false);
        }
        createEffect() {
            let ani = new Laya.Animation();
            ani.loadAnimation("animation/pop.ani");
            ani.on(Laya.Event.COMPLETE, null, recover);
            function recover() {
                ani.removeSelf();
                Laya.Pool.recover("pop", ani);
            }
            return ani;
        }
    }

    var keyBestScore = "keyBestScore";
    class GameManager extends Laya.Script {
        constructor() {
            super();
            this.createBoxInterval = 300;
            this.createBonusInterval = 3000;
            this.createBlockInterval = 500;
            this.isPlaying = false;
            this.isInfo = false;
            this.isShowObstacles = false;
            this.isLeftPos = true;
            this.time = 0;
            this.bonusTime = 0;
            this.blockTime = 0;
            this.count = 0;
            this.nScore = 0;
            this.nCountDown = 30;
            this.nVibrate = 0;
            this.audioStatus = true;
            this.playTime = 0;
            this.currentMusic = 'Menu';
            GameManager.instance = this;
            this.gameView = null;
            this.startPanel = null;
            this.gamePanel = null;
            this.gameOverPanel = null;
            this.infoPanel = null;
            this.playBtn = null;
            this.replayBtn = null;
            this.infoBtn = null;
            this.audioBtn = null;
            this.obstacleObj = null;
            this.score = null;
            this.currentScore = null;
            this.bestScore = null;
            this.countDown = null;
            Laya.MouseManager.multiTouchEnabled = false;
            Laya.SoundManager.setMusicVolume(0.5);
            this.playMusic(this.currentMusic);
        }
        onStart() {
            this.infoBtn.on(Laya.Event.MOUSE_UP, this, this.onInfo);
            this.audioBtn.on(Laya.Event.MOUSE_UP, this, this.onAudio);
            this.playBtn.once(Laya.Event.CLICK, this, this.startGame);
        }
        onInfo() {
            this.playSound('Button', 0.5, '.ogg');
            if (this.isInfo) {
                this.infoPanel.visible = false;
                this.isInfo = false;
                this.infoBtn.label = "?";
            }
            else {
                this.infoPanel.visible = true;
                this.isInfo = true;
                this.infoBtn.label = "X";
            }
        }
        startGame() {
            this.playSound('Restart', 1.0, '.ogg');
            this.currentMusic = 'GamePlay';
            this.playMusic(this.currentMusic);
            if (!this.isPlaying) {
                this.isPlaying = true;
                this.enabled = true;
                this.startPanel.visible = false;
                this.gamePanel.visible = true;
                this.gameOverPanel.visible = false;
                this.countDown.visible = true;
                this.nCountDown = 30;
                this.countDown.value = "" + this.nCountDown.toFixed(0);
                this.score.visible = true;
                this.nScore = 0;
                this.score.value = "000";
                this.level = 1;
                this.levelUpScore = 10;
                this.nVibrate = 0;
                Laya.timer.frameLoop(1, this, this.onTimer);
                Laya.timer.frameLoop(1, this, this.onCreate);
            }
        }
        onTimer() {
            if (this.isPlaying) {
                if (this.nCountDown < 0.99) {
                    this.isPlaying = false;
                    this.nCountDown = 0;
                    Laya.timer.clear(this, this.onTimer);
                    Laya.timer.clear(this, this.onCreate);
                    Laya.timer.loop(10, this, this.onVibrateScreen);
                    Laya.physicsTimer.pause();
                }
                this.countDown.value = "" + this.nCountDown.toFixed(0);
                this.nCountDown -= 0.01;
            }
        }
        onUpdateTimer() {
            if (this.isPlaying) {
                this.nCountDown += 3;
                if (this.nCountDown >= 30) {
                    this.nCountDown = 30;
                    this.countDown.text = "30";
                }
                this.countDown.text = "" + this.nCountDown.toFixed(0);
                Laya.Tween.to(this.countDown, { scaleX: 1.5 }, 100, Laya.Ease.elasticInOut, Laya.Handler.create(this, this.onHideTimeAnim));
            }
        }
        onHideTimeAnim() {
            GameManager.instance.countDown.scaleX = 1;
        }
        onEnable() {
            this.time = Date.now();
            this.gameBox = this.owner.getChildByName("game_box");
        }
        onCreate() {
            if (this.score > this.levelUpScore) {
                this.level++;
                this.levelUpScore += this.level * 5;
                this.createBoxInterval += 50;
                this.createBlockInterval += 50;
                this.createBonusInterval += 800;
            }
            let now = Date.now();
            if (now - this.time > this.createBoxInterval && this.isPlaying) {
                this.time = now;
                this.createBox();
            }
            if (now - this.bonusTime > this.createBonusInterval && this.isPlaying) {
                this.bonusTime = now;
                this.createBonus();
            }
            if (now - this.blockTime > this.createBlockInterval && this.isPlaying) {
                this.blockTime = now;
                this.createBlock();
            }
        }
        createBox() {
            this.normal = Laya.Pool.getItemByCreateFun("bubble_box", this.bubbleBox.create, this.bubbleBox);
            this.normal.pos(Math.random() * 628, -10);
            BubbleBox.instance.typeBubble = "normal";
            this.gameBox.addChild(this.normal);
        }
        createBonus() {
            this.bonus = Laya.Pool.getItemByCreateFun("bonus_box", this.bonusBox.create, this.bonusBox);
            this.bonus.pos(Math.random() * 628, -10);
            BubbleBox.instance.typeBubble = "bonus";
            this.gameBox.addChild(this.bonus);
        }
        createBlock() {
            this.blockRand = Math.ceil(Math.random() * 2);
            switch (this.blockRand) {
                case 1:
                    {
                        this.block = Laya.Pool.getItemByCreateFun("bomb_box", this.blockBox.create, this.blockBox);
                        BubbleBox.instance.typeBubble = "bomb";
                        break;
                    }
                case 2:
                    {
                        if (!this.isShowObstacles) {
                            this.block = Laya.Pool.getItemByCreateFun("obstacle_box", this.obstacleBox.create, this.obstacleBox);
                            BubbleBox.instance.typeBubble = "obstacle";
                        }
                        break;
                    }
                default:
                    break;
            }
            this.block.pos(Math.random() * 628, -10);
            this.gameBox.addChild(this.block);
        }
        updateScore() {
            if (!this.isPlaying) {
                return;
            }
            this.count = Math.log(this.nScore) * Math.LOG10E + 1 | 0;
            if (this.count <= 3) {
                switch (this.count) {
                    case 1:
                        {
                            this.score.value = "00" + this.nScore;
                            break;
                        }
                    case 2:
                        {
                            this.score.value = "0" + this.nScore;
                            break;
                        }
                    case 3:
                        {
                            this.score.value = "" + this.nScore;
                            break;
                        }
                    default:
                        break;
                }
                this.count = 0;
                if (this.nScore <= 0) {
                    this.nScore = 0;
                    this.score.value = "000";
                }
                else if (this.nScore >= 999) {
                    this.nScore = 999;
                    this.score.value = "999";
                }
            }
            this.onShowScore();
        }
        onShowObstacles() {
            this.obstacleObj.visible = true;
            this.obstacleObj.alpha = 1;
            Laya.Tween.to(this.obstacleObj, { y: -1410 }, 5000, Laya.Ease.linearIn, Laya.Handler.create(this, this.onHideObstacles));
        }
        onHideObstacles() {
            this.obstacleObj.visible = false;
            this.obstacleObj.alpha = 0;
            this.obstacleObj.y = 450;
            this.isShowObstacles = false;
        }
        onVibrateScreen() {
            if (this.nVibrate <= 10) {
                if (this.isLeftPos) {
                    Laya.Tween.to(this.gameView, { rotation: -1 }, 10, Laya.Ease.linearInOut);
                    this.isLeftPos = false;
                }
                else {
                    Laya.Tween.to(this.gameView, { rotation: 1 }, 10, Laya.Ease.linearInOut);
                    this.isLeftPos = true;
                }
                this.nVibrate++;
            }
            else {
                Laya.Tween.to(this.gameView, { rotation: 0 }, 10, Laya.Ease.linearInOut);
                Laya.timer.clear(this, this.onVibrateScreen);
                this.nVibrate = 0;
                this.isLeftPos = true;
                this.stopGame();
            }
        }
        onShowScore() {
            Laya.Tween.to(this.score, { scaleX: 1.1 }, 10, Laya.Ease.linearInOut, Laya.Handler.create(this, this.onHideScore));
        }
        onHideScore() {
            this.score.scaleX = 1;
        }
        stopGame() {
            this.isPlaying = false;
            Laya.timer.clear(this, this.onCreate);
            Laya.timer.clear(this, this.onTimer);
            Laya.timer.once(2000, this, this.gameOver);
        }
        gameOver() {
            this.playSound('GameOver', 1.0, '.ogg');
            this.currentMusic = 'Options';
            this.playMusic(this.currentMusic);
            Laya.physicsTimer.resume();
            this.gameOverPanel.visible = true;
            this.gameBox.removeChildren();
            this.createBoxInterval = 300;
            this.createBonusInterval = 3000;
            this.createBlockInterval = 500;
            this.currentScore.text = "" + this.nScore;
            var tempBestScore = 0;
            if (window.localStorage[keyBestScore]) {
                if (window.localStorage[keyBestScore] > this.nScore) {
                    tempBestScore = window.localStorage[keyBestScore];
                }
                else {
                    tempBestScore = this.nScore;
                }
            }
            else {
                tempBestScore = this.nScore;
            }
            window.localStorage[keyBestScore] = tempBestScore;
            this.bestScore.text = "" + tempBestScore;
            this.replayBtn.once(Laya.Event.MOUSE_UP, this, this.startGame);
        }
        onAudio() {
            this.playSound('Button', 0.5, '.ogg');
            if (this.audioStatus == true) {
                this.audioStatus = false;
                this.audioBtn.skin = "main/mute.png";
                this.playTime = this.soundChannel.position;
                this.soundChannel.stop();
            }
            else if (this.audioStatus == false) {
                this.audioStatus = true;
                this.audioBtn.skin = "main/sound.png";
                var soundUrl = "res/sound/" + this.currentMusic + ".mp3";
                this.soundChannel = Laya.SoundManager.playMusic(soundUrl, 0, null, this.playTime);
            }
            Laya.SoundManager.soundMuted = !this.audioStatus;
        }
        playMusic(soundName) {
            if (this.audioStatus) {
                this.soundChannel = Laya.SoundManager.playMusic("res/sound/" + soundName + ".mp3", 0);
                Laya.SoundManager.useAudioMusic = false;
            }
        }
        playSound(soundName, soundVolume, soundType) {
            Laya.SoundManager.setSoundVolume(soundVolume);
            Laya.SoundManager.playSound("res/sound/" + soundName + soundType, 1);
        }
    }

    class GameConfig {
        constructor() { }
        static init() {
            var reg = Laya.ClassUtils.regClass;
            reg("Loading.ts", Loading);
            reg("ButtonEffect.ts", ButtonEffect);
            reg("GameManager.ts", GameManager);
            reg("BubbleBox.ts", BubbleBox);
        }
    }
    GameConfig.width = 1066;
    GameConfig.height = 600;
    GameConfig.scaleMode = "showall";
    GameConfig.screenMode = "horizontal";
    GameConfig.alignV = "middle";
    GameConfig.alignH = "center";
    GameConfig.startScene = "loading.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    class Main {
        constructor() {
            if (window["Laya3D"])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            Laya["Physics"] && Laya["Physics"].enable();
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.stage.alignV = GameConfig.alignV;
            Laya.stage.alignH = GameConfig.alignH;
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
                Laya.enableDebugPanel();
            if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
                Laya["PhysicsDebugDraw"].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.alertGlobalError(true);
            Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
        }
        onVersionLoaded() {
            Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
        }
        onConfigLoaded() {
            GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
        }
    }
    new Main();

}());

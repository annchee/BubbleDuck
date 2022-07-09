import BubbleBox from "./BubbleBox";

var keyBestScore = "keyBestScore";

export default class GameManager extends Laya.Script 
{
    /** @prop {name:gameView, tips:"gameview", type:Node, default:null}*/
    gameView: any;

    /** @prop {name:startPanel, tips:"startpanel", type:Node, default:null}*/
    startPanel: any;
    /** @prop {name:gamePanel, tips:"gamepanel", type:Node, default:null}*/
    gamePanel: any;
    /** @prop {name:gameOverPanel, tips:"gameOverpanel", type:Node, default:null}*/
    gameOverPanel: any;
    /** @prop {name:infoPanel, tips:"infopanel", type:Node, default:null}*/
    infoPanel: any;

    /** @prop {name:playBtn, tips:"playbutton", type:Node, default:null}*/
    playBtn: any;
    /** @prop {name:replayBtn, tips:"replaybutton", type:Node, default:null}*/
    replayBtn: any;
    /** @prop {name:infoBtn, tips:"infobutton", type:Node, default:null}*/
    infoBtn: any;
    /** @prop {name:audioBtn, tips:"audiobtn", type:Node, default:null}*/
    audioBtn: any;

    /** @prop {name:bubbleBox,tips:"掉落容器预制体对象",type:Prefab}*/
    public bubbleBox: Laya.Prefab;
    /** @prop {name:bonusBox,tips:"掉落容器预制体对象",type:Prefab}*/
    public bonusBox: Laya.Prefab;
    /** @prop {name:blockBox,tips:"掉落容器预制体对象",type:Prefab}*/
    public blockBox: Laya.Prefab;
    /** @prop {name:obstacleBox,tips:"掉落容器预制体对象",type:Prefab}*/
    public obstacleBox: Laya.Prefab;

    /** @prop {name:obstacleObj,tips:"obstacleobject",type:Node, default:null}*/
    public obstacleObj: any;

    /** @prop {name:createBoxInterval,tips:"间隔多少毫秒创建一个下跌的容器",type:int,default:800}*/
    createBoxInterval: number = 300;
    /** @prop {name:createBonusInterval,tips:"间隔多少毫秒创建一个下跌的容器",type:int,default:5000}*/
    createBonusInterval: number = 3000;
    /** @prop {name:createBombInterval,tips:"间隔多少毫秒创建一个下跌的容器",type:int,default:2000}*/
    createBlockInterval: number = 500;

    /** @prop {name:score, tips:"score", type:Node, default:null}*/
    public score:  any;
    /** @prop {name:currentScore, tips:"currentscore", type:Node, default:null}*/
    currentScore:  any;
    /** @prop {name:bestScore, tips:"bestscore", type:Node, default:null}*/
    bestScore:  any;

    /** @prop {name:countDown, tips:"countdown", type:Node, default:null}*/
    private countDown:  any;

    private gameBox: Laya.Sprite;
    public normal: Laya.Sprite;
    public bonus: Laya.Sprite;
    public block: Laya.Sprite;

    public isPlaying: boolean = false;
    private isInfo: boolean = false;
    public isShowObstacles: boolean = false;
    private isLeftPos: boolean = true;

    private time: number = 0;
    private bonusTime: number = 0;
    private blockTime: number = 0;
    private count: number = 0;
    public nScore: number = 0;
    public nCountDown: number = 30;
    private nVibrate: number = 0;

    private blockRand: number;
    private level: number;
    private levelUpScore: number;

    public static instance:GameManager;

    private soundChannel: Laya.SoundChannel;
    private audioStatus:boolean = true;
    private playTime:number = 0;
    private currentMusic: string = 'Menu';

    constructor() 
    { 
        super();

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

    onStart():void
    {
        this.infoBtn.on(Laya.Event.MOUSE_UP,this, this.onInfo);
        this.audioBtn.on(Laya.Event.MOUSE_UP,this, this.onAudio);
        this.playBtn.once(Laya.Event.CLICK, this, this.startGame);
    }

    onInfo():void
    {
        this.playSound('Button', 0.5, '.ogg');

        if(this.isInfo){
            this.infoPanel.visible = false;
            this.isInfo = false;
            this.infoBtn.label = "?";
        }
        else
        {
            this.infoPanel.visible=true;
            this.isInfo = true;
            this.infoBtn.label = "X";
        }
    }

    startGame(): void
    {
        this.playSound('Restart', 1.0 , '.ogg');

        this.currentMusic = 'GamePlay';
        this.playMusic(this.currentMusic);

        if(!this.isPlaying)
        {
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
            this.score.value="000";

            this.level = 1;
            this.levelUpScore = 10;

            this.nVibrate = 0;

            Laya.timer.frameLoop(1, this, this.onTimer);
            Laya.timer.frameLoop(1, this, this.onCreate);
        }
    }

    onTimer(): void
    {
        if(this.isPlaying)
        {
            if(this.nCountDown < 0.99 )
            {
                this.isPlaying = false;
                this.nCountDown = 0;
                Laya.timer.clear(this,this.onTimer);
                Laya.timer.clear(this, this.onCreate);
                Laya.timer.loop(10, this, this.onVibrateScreen);
                
                Laya.physicsTimer.pause();
            }

            this.countDown.value = ""+ this.nCountDown.toFixed(0);
            this.nCountDown -= 0.01;
        }
    }

    onUpdateTimer(): void
    {
        if(this.isPlaying)
        {
            this.nCountDown += 3;
            
            if(this.nCountDown >= 30)
            {
                this.nCountDown = 30;
                this.countDown.text = "30";
            }
            this.countDown.text = "" + this.nCountDown.toFixed(0);

            Laya.Tween.to(this.countDown, {scaleX: 1.5}, 100, Laya.Ease.elasticInOut, Laya.Handler.create(this, this.onHideTimeAnim));
        }
    }

    onHideTimeAnim(): void
    {
        GameManager.instance.countDown.scaleX = 1;
    }
    
    onEnable(): void 
    {
        this.time = Date.now();
        this.gameBox = this.owner.getChildByName("game_box") as Laya.Sprite;
    }

    onCreate(): void
    {
        if(this.score > this.levelUpScore)
        {
            this.level ++;
            this.levelUpScore += this.level * 5;
            this.createBoxInterval += 50;
            this.createBlockInterval += 50;
            this.createBonusInterval += 800;
        }
        
        let now = Date.now();

        if (now - this.time > this.createBoxInterval && this.isPlaying) 
        {
            this.time = now;
            this.createBox();
        }

        if (now - this.bonusTime > this.createBonusInterval && this.isPlaying) 
        {
            this.bonusTime = now;
            this.createBonus();
        }

        if (now - this.blockTime > this.createBlockInterval && this.isPlaying) 
        {
            this.blockTime = now;
            this.createBlock();
        }
    }

    createBox(): void 
    {
        this.normal = Laya.Pool.getItemByCreateFun("bubble_box", this.bubbleBox.create, this.bubbleBox);
        this.normal.pos(Math.random() * 628, -10);
        BubbleBox.instance.typeBubble = "normal";
        this.gameBox.addChild(this.normal);
    }

    createBonus(): void 
    {
        this.bonus = Laya.Pool.getItemByCreateFun("bonus_box", this.bonusBox.create, this.bonusBox);
        this.bonus.pos(Math.random() * 628, -10);
        BubbleBox.instance.typeBubble = "bonus";
        this.gameBox.addChild(this.bonus);
    }

    createBlock(): void 
    {
        this.blockRand = Math.ceil(Math.random() * 2);
        switch(this.blockRand)
        {
            case 1:
                {
                    this.block = Laya.Pool.getItemByCreateFun("bomb_box", this.blockBox.create, this.blockBox);
                    BubbleBox.instance.typeBubble = "bomb";
                    break;
                }
            case 2:
                {
                    if(!this.isShowObstacles)
                    {
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

    public updateScore(): void
    {
        if(!this.isPlaying)
        {
            return;
        }
        
        this.count = Math.log(this.nScore) * Math.LOG10E + 1 | 0;

        if(this.count <= 3)
        {
            switch(this.count)
            {
                case 1: 
                {
                    this.score.value = "00"+this.nScore;
                    break;
                }
                case 2: 
                {
                    this.score.value = "0"+this.nScore;
                    break;
                }
                case 3: 
                {
                    this.score.value = ""+this.nScore;
                    break;
                }
                default:
                    break;
            }

            this.count = 0;

            if(this.nScore <= 0)
            {
                this.nScore = 0;
                this.score.value = "000";
            }
            else if(this.nScore >= 999)
            {
                this.nScore = 999;
                this.score.value = "999";
            }
        }

        this.onShowScore();
    }

    public onShowObstacles(): void
    {
        this.obstacleObj.visible = true;
        this.obstacleObj.alpha = 1;
        Laya.Tween.to(this.obstacleObj, {y: -1410}, 5000, Laya.Ease.linearIn, Laya.Handler.create(this, this.onHideObstacles));
    }

    onHideObstacles(): void
    {
        this.obstacleObj.visible = false;
        this.obstacleObj.alpha = 0;
        this.obstacleObj.y = 450;
        this.isShowObstacles = false;
    }

    public onVibrateScreen(): void
    {
        if(this.nVibrate <= 10)
        {
            if(this.isLeftPos)
            {
                Laya.Tween.to(this.gameView,{rotation: -1},10,Laya.Ease.linearInOut);
                this.isLeftPos = false;
            }
            else
            {
                Laya.Tween.to(this.gameView,{rotation: 1},10,Laya.Ease.linearInOut);
                this.isLeftPos = true;
            }
            this.nVibrate ++;
        }
        else
        {
            Laya.Tween.to(this.gameView,{rotation: 0},10,Laya.Ease.linearInOut);
            Laya.timer.clear(this, this.onVibrateScreen);
            this.nVibrate = 0;
            this.isLeftPos = true;
            this.stopGame();
        }
    }

    onShowScore(): void
    {
        Laya.Tween.to(this.score,{scaleX: 1.1},10,Laya.Ease.linearInOut, Laya.Handler.create(this, this.onHideScore));
    }

    onHideScore(): void
    {
        this.score.scaleX = 1;
    }

    public stopGame(): void
    {
        this.isPlaying = false;
    
        Laya.timer.clear(this, this.onCreate);
        Laya.timer.clear(this, this.onTimer);
        Laya.timer.once(2000, this, this.gameOver);
    }

    public gameOver():void
    {
        this.playSound('GameOver', 1.0 ,'.ogg');
        
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
        if(window.localStorage[keyBestScore])
        {
            if(window.localStorage[keyBestScore] > this.nScore)
            {
                tempBestScore = window.localStorage[keyBestScore];
            }
            else
            {
                tempBestScore = this.nScore;
            }
        }
        else
        {
            tempBestScore = this.nScore;
        }

        window.localStorage[keyBestScore] = tempBestScore;
        this.bestScore.text = "" + tempBestScore;

        this.replayBtn.once(Laya.Event.MOUSE_UP, this, this.startGame);
    }

    onAudio(): void
    {
        this.playSound('Button', 0.5,'.ogg');

        if(this.audioStatus == true)
        {
            this.audioStatus = false;
            this.audioBtn.skin = "main/mute.png";
            this.playTime = this.soundChannel.position;
            this.soundChannel.stop();
        }
        else if(this.audioStatus == false)
        {
            this.audioStatus = true;
            this.audioBtn.skin = "main/sound.png";
            var soundUrl = "res/sound/"+this.currentMusic+".mp3";
            this.soundChannel = Laya.SoundManager.playMusic(soundUrl,0,null, this.playTime);
        }

        Laya.SoundManager.soundMuted = !this.audioStatus;

    }

    playMusic(soundName: string) : void
    {
        if(this.audioStatus)
        {
            this.soundChannel = Laya.SoundManager.playMusic("res/sound/"+soundName+".mp3", 0);
            Laya.SoundManager.useAudioMusic = false;
        }
    }

    playSound(soundName:string, soundVolume:number, soundType:string):void
    {
        Laya.SoundManager.setSoundVolume(soundVolume);
        Laya.SoundManager.playSound("res/sound/"+soundName+soundType, 1);
    }
}
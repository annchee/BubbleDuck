import GameManager from "./GameManager";

export default class BubbleBox extends Laya.Script 
{
    private bubbleRig: Laya.RigidBody;
    public currentBubble: Laya.Sprite;
    public typeBubble:string;
    public isUpdateTime: boolean = false;
    public static instance: BubbleBox;

    constructor() 
    { 
        super();
        BubbleBox.instance = this; 
    }
    
    onEnable(): void 
    {
        this.currentBubble = this.owner as Laya.Sprite;
        this.bubbleRig = this.owner.getComponent(Laya.RigidBody);
    }

    onDisable(): void 
    {
        Laya.Pool.recover("bubbleBox", this.owner);
    }

    onTriggerEnter(other: any, self: any, contact: any): void 
    {
        if (other.label === "wall") {
            this.currentBubble.removeSelf();
        }
    }

    onMouseDown(): void
    {
        if(GameManager.instance.isPlaying)
        {
            if(this.typeBubble === "normal")
            {
                GameManager.instance.playSound('Pop', 1.0 ,'.mp3');
             
                this.onShowPop();
                this.currentBubble.removeSelf();

                GameManager.instance.nScore++;
                GameManager.instance.updateScore();
            }
            else if(this.typeBubble === "bonus")
            {
                GameManager.instance.playSound('Pop', 1.0 ,'.mp3');

                this.onShowPop();
                this.currentBubble.removeSelf();
    
                GameManager.instance.onUpdateTimer();
            }

            else if(this.typeBubble === "bomb")
            {
                GameManager.instance.playSound('Bomb', 1.0 ,'.mp3');
                Laya.timer.loop(10, GameManager.instance, GameManager.instance.onVibrateScreen);
                Laya.physicsTimer.pause();
            }
            else if(this.typeBubble === "obstacle")
            {
                GameManager.instance.playSound('Pop', 1.0 ,'.mp3');

                this.onShowPop();
                this.currentBubble.removeSelf();

                GameManager.instance.isShowObstacles = true;
                GameManager.instance.onShowObstacles();
            }
        }
    }

    onShowPop(): void
    {
        let pop:Laya.Animation = Laya.Pool.getItemByCreateFun("pop", this.createEffect, this);
        pop.pos(this.currentBubble.x, this.currentBubble.y);
        this.currentBubble.parent.addChild(pop);
        pop.play(0,false);
    }

    createEffect(): Laya.Animation
    {
        let ani: Laya.Animation = new Laya.Animation();
        ani.loadAnimation("animation/pop.ani");
        ani.on(Laya.Event.COMPLETE, null, recover);
        function recover(): void 
        {
            ani.removeSelf();
            Laya.Pool.recover("pop", ani);
        }
        return ani;
    }
}
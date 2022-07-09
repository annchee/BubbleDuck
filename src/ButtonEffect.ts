export default class ButtonEffect extends Laya.Script {
    
    private currentButton: Laya.Button;

     /** @prop {name:nameButton,tips:"间隔多少毫秒创建一个下跌的容器",type:string ,default:null}*/
     public nameButton: string;
    
    constructor() 
    { 
        super();
    }

    onMouseDown(): void
    {
        if(this.nameButton === "info")
        {
            Laya.Tween.to(this.currentButton, {scaleY: 0.8}, 100, Laya.Ease.elasticInOut, Laya.Handler.create(this, this.onHideButtonAnim));
        }
        else if(this.nameButton === "sound")
        {
            Laya.Tween.to(this.currentButton, {scaleY: 1.6}, 100, Laya.Ease.elasticInOut, Laya.Handler.create(this, this.onHideButtonAnim));
        }
    }

    onMouseOver(): void
    {
        if(this.nameButton === "info")
        {
            this.currentButton.scaleY = 0.8;
        }
        else if(this.nameButton === "sound")
        {
            this.currentButton.scaleY = 1.6;
        }
    }

    onMouseUp(): void
    {
        if(this.nameButton === "info")
        {
            Laya.Tween.to(this.currentButton, {scaleY: 0.8}, 100, Laya.Ease.elasticInOut, Laya.Handler.create(this, this.onHideButtonAnim));
        }
        else if(this.nameButton === "sound")
        {
            Laya.Tween.to(this.currentButton, {scaleY: 1.6}, 100, Laya.Ease.elasticInOut, Laya.Handler.create(this, this.onHideButtonAnim));
        }
    }

    onHideButtonAnim(): void
    {
        if(this.nameButton === "info")
        {
            this.currentButton.scaleY = 0.7;
        }
        else if(this.nameButton === "sound")
        {
            this.currentButton.scaleY = 1.5;
        }
    }
    
    onEnable(): void 
    {
        this.currentButton = this.owner as Laya.Button;
        this.currentButton.on(Laya.Event.MOUSE_UP,this, this.onMouseUp);
        this.currentButton.on(Laya.Event.MOUSE_DOWN,this, this.onMouseDown);
        this.currentButton.on(Laya.Event.MOUSE_OVER,this, this.onMouseOver);
        this.currentButton.on(Laya.Event.MOUSE_OUT,this, this.onHideButtonAnim);
    }
}
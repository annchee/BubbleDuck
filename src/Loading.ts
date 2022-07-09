export default class Loading extends Laya.Script 
{
    /** @prop {name:loadingProgress, tips:"loadingprogress", type:Node, default:null}*/
    loadingProgress: any;
    
    constructor() 
    { 
        super();
        this.loadingProgress = null; 
    }
    
    onStart(): void
    {
        var resourceArray = [
            {url:"res/atlas/main.atlas", type:Laya.Loader.ATLAS},
            {url:"res/atlas/comp.atlas", type:Laya.Loader.ATLAS},
            {url:"res/sound/Menu.mp3", type:Laya.Loader.SOUND},
            {url:"res/sound/GamePlay.mp3", type:Laya.Loader.SOUND},
            {url:"res/sound/GameOver.ogg", type:Laya.Loader.SOUND},
            {url:"res/sound/Options.mp3", type:Laya.Loader.SOUND},
            {url:"res/sound/Pop.mp3", type:Laya.Loader.SOUND},
            {url:"res/sound/Restart.ogg", type:Laya.Loader.SOUND},
            {url:"res/sound/Bomb.mp3", type:Laya.Loader.SOUND},
            {url:"res/sound/Button.ogg", type:Laya.Loader.SOUND},
            {url:"fonts/Bubble3D.ttf", type:Laya.Loader.TTF},
            {url:"fonts/Pirate of the Seaside Bubbles.ttf", type:Laya.Loader.TTF}
        ];
       
        Laya.loader.load(resourceArray, null, Laya.Handler.create(this, this.onProgress, null, false))
        this.setProgressBar();
    }

    setProgressBar(): void
    {
        this.loadingProgress.value = 0;
    }

    onProgress(value: number): void
    {
        this.loadingProgress.value = value;

        if(this.loadingProgress.value >= 1)
        {
            this.loadingProgress.value = 1;
            Laya.Scene.open('main.scene', true, 0, Laya.Handler.create(this, ()=>{
                Laya.Scene.destroy("loading.scene");
            }));
            return;
        }
    }
}
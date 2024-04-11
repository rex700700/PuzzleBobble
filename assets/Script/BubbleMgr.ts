import { EVENT, bubbleData } from "./Interface";
import Bubble from "./Bubble";
import Util from "./Util";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BubbleMgr extends cc.Component {

    @property([cc.SpriteFrame]) bubbleSpriteFrame: cc.SpriteFrame[] = [];

    @property(cc.Prefab) bubblePrefab = null;

    @property(cc.Node) shooter: cc.Node = null;

    @property(cc.JsonAsset) levelData: cc.JsonAsset = null;

    public bubblesArray: bubbleData[][] = [];

    public shootBubble: bubbleData;

    public isShooting: boolean = false;

    public shootDir: cc.Vec2 = null;

    public gameover: boolean = false;
    
    public onLoad(): void {
        this.init("lv1");

        cc.director.on(EVENT.TOUCHEND_SHOOT, (data) => {
            let r = cc.misc.degreesToRadians(data);
            this.shootDir = cc.v2(-Math.sin(r), Math.cos(r));
            this.isShooting = true;
        }, this);

        this._createOneShooter();
    }

    public update(dt: number): void {
        if(this.isShooting){
            this._bubbleMove(dt);
            this._isCollided();
        }

    }

    

    private _isCollided (): void {
        for(let row = 0; row < this.bubblesArray.length; row++) {
            for(let col = 0; col < this.bubblesArray[row].length; col++) {
                if(!this.bubblesArray[row][col]) continue;
                let n: cc.Node = this.bubblesArray[row][col].node;
                let offsetY = Math.abs(n.y - this.shootBubble.node.y);
                if(offsetY > Util.BUBBLE_R * 2) continue;
                let offsetX = Math.abs(n.x - this.shootBubble.node.x);
                if(offsetX > Util.BUBBLE_R * 2) continue;
                let dis = offsetX * offsetX + offsetY + offsetY;
                if(dis > Util.BUBBLE_R * 2 * Util.BUBBLE_R * 2) continue;
                this.isShooting = false;

                this._setBubblePos();
                return;
            }
        }

        if(this.shootBubble.node.y > Util.SCREEN_H - Util.BUBBLE_R) {
            this.isShooting = false;
            this._setBubblePos();
        }
    }

    private _setBubblePos (): void {
        let index: cc.Vec3 = Util.convertRowColToRowCol(this.shootBubble.node.x, this.shootBubble.node.y);
        this.shootBubble.node.position = Util.convertRowColToPos(index.x, index.y);
        let obj: bubbleData = Object.create(null);
        obj.node = this.shootBubble.node;
        obj.color = this.shootBubble.color;
        obj.isVisited = false;
        obj.isLinked = false;
        this.bubblesArray[index.x][index.y] = obj;

        this._mapColor(index);
    }

    private _mapColor(index: cc.Vec3): void{
        let test: Function = (row: number, col: number, color: number) => {
            if(!this.bubblesArray[row] || !this.bubblesArray[row][col]) return;
            let b = this.bubblesArray[row][col];
            if(b.isVisited) return;
            if(b.color !== color) return;
            b.isVisited = true;
            let leftTop = col;
            if(row % 2 === 0){
                leftTop = col - 1;
            }

            test(row - 1, leftTop, color);
            test(row - 1, leftTop + 1, color);
            test(row, leftTop - 1, color);
            test(row - 1, leftTop + 1, color);
            test(row + 1, leftTop, color);
            test(row + 1, leftTop + 1, color);
        }


        for(let i = 0; i < this.bubblesArray[0].length; i++){
            if(!this.bubblesArray[0][i]) continue;
            test(0, i);
        }
            
        test(index.x, index.y, this.bubblesArray[index.x][index.y].color);
        let count: number = 0;
        let record: cc.Vec2[] = [];
        for(let row = 0; row < this.bubblesArray.length; row++){
            for(let col = 0; col < this.bubblesArray[row].length; col++){
                if(!this.bubblesArray[row][col]) continue;
                if(this.bubblesArray[row][col].isVisited){
                    this.bubblesArray[row][col].isVisited = false;
                    count++;
                    record.push(cc.v2(row, col));
                }
            }
        }
        if(count >= 3){
            for(let i in record){
                let b = this.bubblesArray[record[i].x][record[i].y].node;
                b.getComponent(Bubble).playDeathAnimation(record[i]);
            }
            this.scheduleOnce(this._testUnLinked, 0.3);
        } else {
            this._nextBubble();
        }
    }

    private _testUnLinked (): void {
        let test: Function = (row: number, col: number, color: number) => {
            if(!this.bubblesArray[row] || !this.bubblesArray[row][col]) return;
            let b = this.bubblesArray[row][col];
            if(b.isVisited) return;
            b.isVisited = true;
            b.isLinked = true;
            let leftTop = col;
            if(row % 2 === 0){
                leftTop = col - 1;
            }

            test(row - 1, leftTop, color);
            test(row - 1, leftTop + 1, color);
            test(row, leftTop - 1, color);
            test(row - 1, leftTop + 1, color);
            test(row + 1, leftTop, color);
            test(row + 1, leftTop + 1, color);
        }

        for(let i = 0; i < this.bubblesArray[0].length; i++){
            if(!this.bubblesArray[0][i]) continue;
            test(0, i);
        }

        let flag: boolean = true;
        for(let row = 0; row < this.bubblesArray.length; row++){
            for(let col = 0; col < this.bubblesArray[row].length; col++){
                if(!this.bubblesArray[row][col]) continue;
                if(!this.bubblesArray[row][col].isLinked){
                    flag = false;
                    let b = this.bubblesArray[row][col].node;
                    b.getComponent(Bubble).playDownAnimation(cc.v2(row, col));
                } else {
                    this.bubblesArray[row][col].isVisited = false;
                    this.bubblesArray[row][col].isLinked = false;
                }
            }
        }
        if(flag){
            this._nextBubble();
        } else {
            this.scheduleOnce(this._nextBubble, 0.6);
        }
    }

    private _nextBubble(): void {
        this._createOneShooter();
    }

    private _bubbleMove (dt: number): void {
        let speed = 1000;
        let n: cc.Node = this.shootBubble.node;
        if(n.x < Util.BUBBLE_R) this.shootDir.x = Math.abs(this.shootDir.x);
        if(n.x > Util.SCREEN_W - Util.BUBBLE_R) this.shootDir.x = -Math.abs(this.shootDir.x);
        n.x += this.shootDir.x * speed * dt;
        n.y += this.shootDir.y * speed * dt;
    }

    public init (str: string): void {
        let data: [][] = this.levelData.json[str];

        for(let row = 0; row < data.length; row++){
            let colBubbleData: bubbleData[] = data[row];
            this.bubblesArray[row] = [];
            
            for(let col = 0; col < colBubbleData.length; col++){
                let color = data[row][col];
                if(color === 0) continue;
                let b = cc.instantiate(this.bubblePrefab);
                let pos = Util.convertRowColToPos(row, col);
                b.getComponent(Bubble).init(this, pos, this.bubbleSpriteFrame[color - 1]);
                let obj: bubbleData = Object.create(null);
                obj.node = b;
                obj.color = color;
                obj.isVisited = false;
                obj.isLinked = false;
                this.bubblesArray[row][col] = obj;
            }
        }
    }

    private _createOneShooter(): void {
        let b = cc.instantiate(this.bubblePrefab);
        let color = Util.randNun(1,4);
        b.getComponent(Bubble).init(this, this.shooter.position, this.bubbleSpriteFrame[color - 1]);
        let obj: bubbleData = Object.create(null);
        obj.node = b;
        obj.color = color;
        obj.isVisited = false;
        obj.isLinked = false;
        this.shootBubble = obj;
    }
}

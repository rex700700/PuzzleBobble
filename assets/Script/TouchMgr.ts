import { EVENT } from "./Interface";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TouchMgr extends cc.Component {

    @property(cc.Node) shooter: cc.Node = null;

    public onLoad(): void {
        this.openTouch();
    }
    
    public openTouch(): void {
        this.node.on(cc.Node.EventType.TOUCH_START, this._touchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this._touchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this._touchEnd, this);
    }

    public closeTouch(): void {
        this.node.off(cc.Node.EventType.TOUCH_START, this._touchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this._touchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this._touchEnd, this);
    }

    private _touchStart(e: cc.Event.EventTouch): void {
        let d = this.convertToDegree(e);
        this.shooter.angle = d;
    }

    private _touchMove(e: cc.Event.EventTouch): void {
        let d = this.convertToDegree(e);
        this.shooter.angle = d;
    }

    private _touchEnd(e: cc.Event.EventTouch): void {
        let d = this.convertToDegree(e);
        this.shooter.angle = d;
        cc.director.emit(EVENT.TOUCHEND_SHOOT, d);
    }

    private convertToDegree(e: cc.Event.EventTouch): number {
        let pos: cc.Vec2 = e.getLocation();
        let x = pos.x - this.shooter.x;
        let y = pos.y - this.shooter.y;
        let radian = Math.atan2(y, x);
        let degree = cc.misc.radiansToDegrees(radian);
        degree -= 90;
        if(degree < -80 && degree > -180) degree = -80;
        if(degree > 80 || degree <= -180) degree = 80;
        return degree;
    }
}

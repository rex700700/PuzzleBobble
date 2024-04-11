import BubbleMgr from "./BubbleMgr"

const {ccclass, property} = cc._decorator;

@ccclass
export default class Bubble extends cc.Component {

    private parent: BubbleMgr;

    public init(parent: BubbleMgr, position: cc.Vec2, spriteFrame: cc.SpriteFrame): void {
        parent.node.addChild(this.node);
        this.parent = parent;
        this.node.position = new cc.Vec3(position.x, position.y, 0);
        this.setSpriteFrame(spriteFrame);
    }

    public setSpriteFrame(spriteFrame: cc.SpriteFrame): void {
        this.getComponent(cc.Sprite).spriteFrame = spriteFrame;
    }

    public playDeathAnimation(index: cc.Vec2): void {
        this.node.runAction(
            cc.sequence(
                cc.scaleTo(0.1, 1.2),
                cc.scaleTo(0.1, 1.0),
                cc.callFunc(() => {
                    this.parent.bubblesArray[index.x][index.y] = undefined;
                }, this),
                cc.removeSelf()
            )
        );
    }
    
    public playDownAnimation(index: cc.Vec2): void {
        this.node.runAction(
            cc.sequence(
                cc.spawn(
                    cc.moveBy(0.5, 0, -300),
                    cc.fadeOut(0.5)
                ),
                cc.callFunc(() => {
                    this.parent.bubblesArray[index.x][index.y] = undefined;
                }, this),
                cc.removeSelf()
            )
        );
    }
}

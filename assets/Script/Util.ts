export default class Util{

    public static readonly SCREEN_W: number = 288;
    public static readonly SCREEN_H: number = 512;
    public static readonly BUBBLE_R: number = 16;
    
    public static readonly BUBBLE_Y: number = 16 * Math.sqrt(3);

    public static randNun (min: number, max: number): number {
        return min + Math.floor((max - min + 1) * Math.random());
    }

    public static convertRowColToPos (row: number, col: number): cc.Vec3 {
        let posX: number = this.BUBBLE_R * ((row % 2) + 1) + col * this.BUBBLE_R * 2;
        let posY: number = this.SCREEN_H - (this.BUBBLE_R + row * this.BUBBLE_Y);
        return new cc.Vec3(posX, posY, 0);
    }

    public static convertRowColToRowCol (posX: number, posY: number): cc.Vec3 {
        let row: number = Math.round((this.SCREEN_H - posY - this.BUBBLE_R) / this.BUBBLE_Y);
        let col: number = Math.round((posX - this.BUBBLE_R * ((row % 2) + 1 )) / (this.BUBBLE_R * 2));
        return new cc.Vec3(row, col, 0);
    }
}

export interface bubbleData {
    node: cc.Node,
    color: number,
    isVisited: boolean,
    isLinked: boolean
}

export enum EVENT {
    //滑鼠放開後,射擊事件,附帶角度參數
    TOUCHEND_SHOOT = 'shoot'
}
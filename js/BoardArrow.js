"use strict"

class BoardArrow{
  constructor(fromType, fromX, fromY, toX, toY, color, name, parentCanvas){
    this._fromType = fromType
    this._fromX = fromX
    this._fromY = fromY
    this._toX = toX
    this._toY = toY
    this._color = color
    this.name = name
    this._parentCanvas = parentCanvas
  }

  static get CONST(){
    return {
      OFFSET: 3,
      HEAD_LENGTH: 16,
      HEAD_ANGLE: Math.PI / 6,
      MAX_ARROWS: 8
    }
  }

  draw(){
    let fromSq = this._findSquare(this._fromType, this._fromX, this._fromY)
    let toSq = this._findSquare(-1, this._toX, this._toY)
		let fromX = fromSq.offset().left + fromSq.width()/2 - this._parentCanvas.offset().left
    let fromY = fromSq.offset().top + fromSq.height()/2 - this._parentCanvas.offset().top
		let toX = toSq.offset().left + fromSq.width()/2 - this._parentCanvas.offset().left
    let toY = toSq.offset().top + fromSq.height()/2 - this._parentCanvas.offset().top
		let theta = Math.atan2(fromY - toY, fromX - toX)
		fromX -= BoardArrow.CONST.OFFSET * Math.cos(theta)
    fromY -= BoardArrow.CONST.OFFSET * Math.sin(theta)
		toX += BoardArrow.CONST.OFFSET * Math.cos(theta)
    toY += BoardArrow.CONST.OFFSET * Math.sin(theta)
    let ctx = this._parentCanvas.get(0).getContext('2d');
    ctx.beginPath()
    ctx.moveTo(fromX, fromY)
		ctx.lineTo(toX + BoardArrow.CONST.HEAD_LENGTH / 2 * Math.cos(theta + BoardArrow.CONST.HEAD_ANGLE * 0.4), toY + BoardArrow.CONST.HEAD_LENGTH / 2 * Math.sin(theta + BoardArrow.CONST.HEAD_ANGLE * 0.4))
		ctx.lineTo(toX + BoardArrow.CONST.HEAD_LENGTH * Math.cos(theta + BoardArrow.CONST.HEAD_ANGLE), toY + BoardArrow.CONST.HEAD_LENGTH * Math.sin(theta + BoardArrow.CONST.HEAD_ANGLE))
		ctx.lineTo(toX, toY)
		ctx.lineTo(toX + BoardArrow.CONST.HEAD_LENGTH * Math.cos(theta - BoardArrow.CONST.HEAD_ANGLE), toY + BoardArrow.CONST.HEAD_LENGTH * Math.sin(theta - BoardArrow.CONST.HEAD_ANGLE))
		ctx.lineTo(toX + BoardArrow.CONST.HEAD_LENGTH / 2 * Math.cos(theta - BoardArrow.CONST.HEAD_ANGLE * 0.4), toY + BoardArrow.CONST.HEAD_LENGTH / 2 * Math.sin(theta - BoardArrow.CONST.HEAD_ANGLE * 0.4))
		ctx.lineTo(fromX, fromY)
    ctx.stroke()
  }

  _findSquare(areaType, x, y) {
    if (areaType == -1) {
      return $('#sq' + x + '_' + y)
    } else {
      return $('[id=sq' + (areaType == 0 ? '0' : '-1') + '_' + x + ']:eq(' + y +')')
    }
  }
}
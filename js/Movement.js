"use strict"

class Movement{
  constructor(n = 0){
    this.num = n
    this.special = null
    this.owner = Position.CONST.SENTE
    this.pieceType = null
    this.toX = null //human coordinate
    this.toY = null //human coordinate
    this.promote = false
    this.capture = false
    this.toSame = false
    this.additionalIdentifier = false
    this.time = 0
  }

  static get CONST(){
    return {
  		RESIGN: 1,
  		TIMEUP: 2,
  		JISHOGI: 3,
  		SENNICHITE: 4,
  		ILLEGAL: 5,
  		OUTE_SENNICHITE: 6,
  		DISCONNECT: 7,
  		CATCH: 8,
  		TRY: 9
    }
  }

  setFromPlayerMove(owner, sq1, sq2, promote = false){
    this.owner = owner
    this.fromX = sq1.data('x') > 0 ? sq1.data('x') : 0
    this.fromY = sq1.data('x') > 0 ? sq1.data('y') : 0
    if (sq1.data('x') <= 0) this.pieceType = sq1.data('y')
    this.toX = sq2.data('x')
    this.toY = sq2.data('y')
    this.promote = promote
  }

}

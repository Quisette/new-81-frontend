"use strict"

class Piece{
  constructor(owner, promoted = false){
    //boolean(sente:true), int, int, boolean
    this.owner = owner
    this._promoted = promoted
    this.type
    this.CSA = ""
    this.promotedCSA = null
    this._img = ""
    this._promotedImg = null
    this._sfen = ""
  }

  normalMoves(){
    return []
  }

  promotedMoves(){
    return []
  }

  adjacentMoves(){
    return this._promoted ? this.promotedMoves() : this.normalMoves()
  }

  farMoves(){
    return []
  }

  promote(){
    if (!this._promoted) this._promoted = true
  }

  depromote(){
    if (this._promoted) this._promoted = false
  }

  toString(){
    let str = this.owner ? "+" : "-"
    return str + (this._promoted ? this.promotedCSA : this.CSA)
  }

  toImagePath(reverse = false, showPromotedSide = false){
    return (this.owner == !reverse ? "S" : "G") + ((this._promoted || showPromotedSide) ? this._promotedImg : this._img) + ".png"
  }

  getType(){
    return this.type + (this._promoted ? 8 : 0)
  }

  isPromoted(){
    return this._promoted
  }

  isKing(){
    return false
  }

  isPawn(){
    return false
  }

  isPromotable(){
    return true
  }

  toSFEN(){
    let str = (this.isPromotable() && this.isPromoted() ? "+" : "") + this._sfen
    return this.owner ? str : str.toLowerCase()
  }

  soundVolume(){
    return 1
  }
//  kyotoConvert(){
//  		 kyoto_conversion:Array = new Array(0, 7, 4, 5, 2, 3, 15, 1, 8, 9, 10, 11, 12, 13, 14, 6);
//  }

  mustPromote(rowsAhead){
    // integer (how many rows are ahead of the piece until the end of the opponent side)
    return false
  }

  checkSibling(){ //whether the piece needs to check siblings when moved
    return true
  }

  convertKyoto(){
    return this
  }
}

class PieceOU extends Piece{
  constructor(owner, promoted){
    super(owner, promoted)
    this.point = 0
    this.type = 0
    this.CSA = "OU"
    this.promotedCSA = "OU"
    this._img = "gyoku"
    this._promotedImg = "ou"
    this._sfen = "K"
  }
  normalMoves(){
    return [[0, +1], [+1, +1], [-1, +1], [+1, +0], [-1, +0], [0, -1], [+1, -1], [-1, -1]]
  }
  promotedMoves(){
    return this.normalMoves()
  }
  isKing(){
    return true
  }
  isPromotable(){
    return false
  }
  checkSibling(){
    return false
  }
}

class PieceHI extends Piece{
  constructor(owner, promoted){
    super(owner, promoted)
    this.point = 5
    this.type = 1
    this.CSA = "HI"
    this.promotedCSA = "RY"
    this._img = "hi"
    this._promotedImg = "ryu"
    this._sfen = "R"
  }
  promotedMoves(){
    return [[+1, +1], [-1, +1], [+1, -1], [-1, -1]]
  }
  farMoves(){
    return [[0, +1], [+1, 0], [0, -1], [-1, 0]]
  }
  soundVolume(){
    return this._promoted ? 1 : 0.9
  }
  convertKyoto(){
    return new PieceFU(this.owner)
  }
}

class PieceKA extends Piece{
  constructor(owner, promoted){
    super(owner, promoted)
    this.point = 5
    this.type = 2
    this.CSA = "KA"
    this.promotedCSA = "UM"
    this._img = "kaku"
    this._promotedImg = "uma"
    this._sfen = "B"
  }
  promotedMoves(){
    return [[0, +1], [+1, 0], [-1, 0], [0, -1]]
  }
  farMoves(){
    return [[+1, +1], [+1, -1], [-1, -1], [-1, +1]]
  }
  soundVolume(){
    return this._promoted ? 1 : 0.9
  }
  convertKyoto(){
    return new PieceGI(this.owner)
  }
}

class PieceKI extends Piece{
  constructor(owner, promoted){
    super(owner, false)
    this.point = 1
    this.type = 3
    this.CSA = "KI"
    this._img = "kin"
    this._sfen = "G"
  }
  normalMoves(){
    return [[0, +1], [+1, +1], [-1, +1], [+1, +0], [-1, +0], [0, -1]]
  }
  isPromotable(){
    return false
  }
  soundVolume(){
    return 0.65
  }
  convertKyoto(){
    return new PieceKE(this.owner)
  }
}

class PieceGI extends Piece{
  constructor(owner, promoted){
    super(owner, promoted)
    this.point = 1
    this.type = 4
    this.CSA = "GI"
    this.promotedCSA = "NG"
    this._img = "gin"
    this._promotedImg = "ngin"
    this._sfen = "S"
  }
  normalMoves(){
    return [[0, +1], [+1, +1], [-1, +1], [+1, -1], [-1, -1]]
  }
  promotedMoves(){
    return [[0, +1], [+1, +1], [-1, +1], [+1, +0], [-1, +0], [0, -1]]
  }
  soundVolume(){
    return 0.65
  }
  convertKyoto(){
    return new PieceKA(this.owner)
  }
}

class PieceKE extends Piece{
  constructor(owner, promoted){
    super(owner, promoted)
    this.point = 1
    this.type = 5
    this.CSA = "KE"
    this.promotedCSA = "NK"
    this._img = "kei"
    this._promotedImg = "nkei"
    this._sfen = "N"
  }
  normalMoves(){
    return [[+1, +2], [-1, +2]]
  }
  promotedMoves(){
    return [[0, +1], [+1, +1], [-1, +1], [+1, +0], [-1, +0], [0, -1]]
  }
  soundVolume(){
    return 0.5
  }
  mustPromote(rowsAhead){
    return !this._promoted && rowsAhead < 2
  }
  convertKyoto(){
    return new PieceKI(this.owner)
  }
}

class PieceKY extends Piece{
  constructor(owner, promoted){
    super(owner, promoted)
    this.point = 1
    this.type = 6
    this.CSA = "KY"
    this.promotedCSA = "NY"
    this._img = "kyo"
    this._promotedImg = "nkyo"
    this._sfen = "L"
  }
  promotedMoves(){
    return [[0, +1], [+1, +1], [-1, +1], [+1, +0], [-1, +0], [0, -1]]
  }
  farMoves(){
    return this._promoted ? [] : [[0, +1]]
  }
  soundVolume(){
    return 0.5
  }
  mustPromote(rowsAhead){
    return !this._promoted && rowsAhead < 1
  }
  checkSibling(){
    return this._promoted
  }
  convertKyoto(){
    return new PieceFU(this.owner, true)
  }
}

class PieceFU extends Piece{
  constructor(owner, promoted){
    super(owner, promoted)
    this.point = 1
    this.type = 7
    this.CSA = "FU"
    this.promotedCSA = "TO"
    this._img = "fu"
    this._promotedImg = "to"
    this._sfen = "P"
  }
  normalMoves(){
    return [[0, +1]]
  }
  promotedMoves(){
    return [[0, +1], [+1, +1], [-1, +1], [+1, +0], [-1, +0], [0, -1]]
  }
  isPawn(){
    return !this._promoted
  }
  soundVolume(){
    return this._promoted ? 0.4 : 0.35
  }
  mustPromote(rowsAhead){
    return !this._promoted && rowsAhead < 1
  }
  checkSibling(){
    return this._promoted
  }
  convertKyoto(){
    return this._promoted ? new PieceKY(this.owner) : new PieceHI(this.owner)
  }
}

class PieceZL extends PieceOU{
  constructor(owner, promoted){
    super(owner, promoted)
    this._img = "ra"
    this._promotedImg = "ra"
  }
}

class PieceZG extends Piece{
  constructor(owner, promoted){
    super(owner, false)
    this.type = 1
    this.CSA = "ZG"
    this._img = "ki"
  }
  normalMoves(){
    return [[0, +1], [+1, +0], [-1, +0], [0, -1]]
  }
  isPromotable(){
    return false
  }
}

class PieceZE extends Piece{
  constructor(owner, promoted){
    super(owner, false)
    this.type = 2
    this.CSA = "ZE"
    this._img = "zo"
  }
  normalMoves(){
    return [[+1, +1], [-1, +1], [+1, -1], [-1, -1]]
  }
  isPromotable(){
    return false
  }
}

class PieceZC extends Piece{
  constructor(owner, promoted){
    super(owner, promoted)
    this.type = 7
    this.CSA = "ZC"
    this.promotedCSA = "TO"
    this._img = "hi"
    this._promotedImg = "ni"
  }
  normalMoves(){
    return [[0, +1]]
  }
  promotedMoves(){
    return [[0, +1], [+1, +1], [-1, +1], [+1, +0], [-1, +0], [0, -1]]
  }
  checkSibling(){
    return this._promoted
  }
}

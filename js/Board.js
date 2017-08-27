"use strict"

class Board{
  constructor(div){
    this._div = div
    this._komadais = new Array(2)
    this._playerInfos = new Array(2)
    this._timers = new Array(2)
    this._flags = new Array(2)
    this._position
    this._direction = Position.CONST.SENTE
    this._theme = "ichiji"
    this._selectedSquare = null
    this._lastSquare = null
    this._canMoveMyPiece = true
    this._canMoveHisPiece = true
    this.moves = new Array()
    this._generateParts()
    this._setTheme()
  }

  _generateParts(){
    this._ban = $('<div></div>', {id: 'banField'}).appendTo(this._div)
    this._komadais[0] = $('<div></div>', {id: 'senteKomadai', class: 'komadai'}).appendTo(this._div)
    this._komadais[1] = $('<div></div>', {id: 'goteKomadai', class: 'komadai'}).appendTo(this._div)
    this._playerInfos[0] = $('<div></div>', {id: 'senteInfo', class: 'player-info'}).appendTo(this._div)
    this._playerInfos[1] = $('<div></div>', {id: 'goteInfo', class: 'player-info'}).appendTo(this._div)
    this._timers[0] = $('<div></div>', {id: 'senteTimer', class: 'game-timer'}).appendTo(this._div)
    this._timers[1] = $('<div></div>', {id: 'goteTimer', class: 'game-timer'}).appendTo(this._div)
    this._flags[0] = $('<div></div>', {id: 'senteFlag', class: 'board-flag'}).appendTo(this._div)
    this._flags[1] = $('<div></div>', {id: 'goteFlag', class: 'board-flag'}).appendTo(this._div)
  }

  _setTheme(){
    this._banW = 410
    this._banH = 454
    this._banX = 185
    this._banY = 10
    this._komadaiW = 170
    this._komadaiH = 200
    this._hisKomadaiX = 7
    this._hisKomadaiY = 10
    this._myKomadaiX = 605
    this._myKomadaiY = 264
    this._hisInfoX = 7
    this._hisInfoY = 267
    this._myInfoX = 615
    this._myInfoY = 16
    this._komaW = 43
    this._komaH = 48
    this._banEdgeX = 11
    this._banEdgeY = 11

    this._partSize()
    this._imagePath()
    this._partLayout()
  }

  _partSize(){
    this._ban.css({width: this._banW + 'px', height: this._banH + 'px'})
    $(this._komadais.map(e => e[0])).css({width: this._komadaiW + 'px', height: this._komadaiH + 'px'})
  }

  _imagePath(){
    this._ban.css('background-image', 'url(img/themes/' + this._theme + '/ban.jpg)')
    this._komadais[0].css('background-image', 'url(img/themes/' + this._theme + '/Shand.jpg)')
    this._komadais[1].css('background-image', 'url(img/themes/' + this._theme + '/Ghand.jpg)')
  }

  _partLayout(){
    this._ban.css({left: this._banX + 'px', top: this._banY + 'px'})
    this._komadais[0].css({left: this._myKomadaiX + 'px', top: this._myKomadaiY + 'px'})
    this._komadais[1].css({left: this._hisKomadaiX + 'px', top: this._hisKomadaiY + 'px'})
    this._playerInfos[0].css({left: this._myInfoX + 'px', top: this._myInfoY + 'px'})
    this._playerInfos[1].css({left: this._hisInfoX + 'px', top: this._hisInfoY + 'px'})
  }

  _generateSquares(){
    this._ban.empty()
    for(let y = 1; y <= 9; y++){
      for(let x = 1; x <= 9; x++){
        let left
        let top
        if (this._direction) {
          left = this._banEdgeX + (9-x) * this._komaW
          top = this._banEdgeY + (y-1) * this._komaH
        } else {
          left = this._banEdgeX + (x-1) * this._komaW
          top = this._banEdgeY + (9-y) * this._komaH
        }
        let sq = $('<div></div>', {id: 'sq' + x + '_' + y, class: 'square'}).data({x: x, y: y})
        sq.css({width: this._komaW + 'px', height: this._komaH + 'px', left: left + 'px', top: top + 'px'})
        sq.appendTo(this._ban)
      }
    }
    let thisInstance = this
    $('.square').on("click", function(){
      thisInstance._handleSquareClick($(this))
    })
  }

  _refreshSquare(sq){
    let koma = this._position.getPieceFromSquare(sq)
    if (koma) {
      sq.css('background-image', 'url(img/themes/' + this._theme + '/' + koma.toImagePath() + ')')
    } else {
      sq.css('background-image', 'none')
    }
  }

  _refreshPosition(){
    let thisInstance = this
    for (let i = 0; i < 2; i++){
      this._komadais[i].empty()
    }
    $('.square').each(function(){
      thisInstance._refreshSquare($(this))
    })
    for (let i = 0; i < 2; i++){
      let hash = this._position.handCoordinateHash(i)
      this._position.komadais[i].forEach(function(piece){
        let sq = $('<div></div>', {id: 'sq' + (piece.owner ? 0 : -1) + '_' + piece.getType(), class: 'square'}).data({x: piece.owner ? 0 : -1, y: piece.getType()})
        sq.css({width: this._komaW + 'px', height: this._komaH + 'px'})
        sq.css({left: hash[piece.CSA].x + 'px', top: hash[piece.CSA].y + 'px'})
        hash[piece.CSA].x += hash[piece.CSA].dx
        sq.css('background-image', 'url(img/themes/' + this._theme + '/' + piece.toImagePath() + ')')
        let thisInstance = this
        sq.on("click", function(){
          thisInstance._handleSquareClick($(this))
        })
        sq.appendTo(this._komadais[i])
      }, this)
    }
  }

  loadNewPosition(){
    this._generateSquares()
    this._position = new Position();
    this._position.loadFromString(Position.CONST.INITIAL_POSITION)
    this._refreshPosition()
    this.moves = new Array()
    this.moves.push(new Movement(0))
  }

  _handleSquareClick(sq){
    if (!this._selectedSquare) {
      let koma = this._position.getPieceFromSquare(sq)
      if (this._canMovePieceNow() && koma && koma.owner == this._position.turn) {
        this._selectedSquare = sq
        sq.addClass("square-selected")
        this._position.getMovableGridsFromSquare(sq).forEach(function(e){
          $("#sq" + e[0] + "_" + e[1]).addClass("square-movable")
        })
      }
    } else {
      if (sq.hasClass("square-movable")) {
        let move = new Movement()
        move.setFromPlayerMove(this._position.turn, this._selectedSquare, sq)
        move = this._position.makeMove(move)
        this._refreshPosition()
      }
      this._cancelSelect()
    }
  }

  _canMovePieceNow(){
    return (this._canMoveMyPiece && this._position.turn == this._direction) || (this._canMoveHisPiece && this._position.turn != this._direction)
  }

  _cancelSelect(){
    $(".square").removeClass("square-movable")
    this._selectedSquare.removeClass("square-selected")
    this._selectedSquare = null
  }

}

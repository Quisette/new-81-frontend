"use strict"

class DobutsuBoard extends Board{
  _setTheme(){
    this._theme = "3x4_pieco"
    this._banW = 410
    this._banH = 476
    this._banX = 185
    this._banY = 0
    this._komadaiW = this._banW
    this._komadaiH = 76
    this._hisKomadaiX = this._banX
    this._hisKomadaiY = 3
    this._myKomadaiX = this._banX
    this._myKomadaiY = 398
    this._myInfoX = 615
    this._myInfoY = 16
    this._hisInfoX = 7
    this._hisInfoY = 267
    this._myFlagX = 718
    this._myFlagY = 215
    this._hisFlagX = 10
    this._hisFlagY = 215
    this._myTimerX = 615
    this._myTimerY = 220
    this._hisTimerX = 80
    this._hisTimerY = 220
    this._komaW = 75
    this._komaH = 75
    this._banEdgeX = 93
    this._banEdgeY = 88

    this._partSize()
    this._partLayout()

    this._preloadPieceImages(this._theme)
  }

  _imagePath(){
    this._ban.css('background-image', 'url(img/themes/' + this._theme + '/ban.png)')
    this._coord.css('background-image', 'url(img/themes/' + this._theme + (this._direction ? '/Scoord.png)' : '/Gcoord.png)'))
  }

  _generateSquares(){
    //Call after direction is set!
    this._ban.empty()
    for(let y = 1; y <= 4; y++){
      for(let x = 7; x <= 9; x++){
        let left
        let top
        if (this._direction) {
          left = this._banEdgeX + (9-x) * this._komaW
          top = this._banEdgeY + (y-1) * this._komaH
        } else {
          left = this._banEdgeX + (x-7) * this._komaW
          top = this._banEdgeY + (4-y) * this._komaH
        }
        let sq = $('<div></div>', {id: 'sq' + x + '_' + y, class: 'square'}).data({x: x, y: y})
        sq.css({width: this._komaW + 'px', height: this._komaH + 'px', left: left + 'px', top: top + 'px'})
        sq.appendTo(this._ban)
      }
    }
    let thisInstance = this
    $('.square').on("click", function(e){
      if (e.ctrlKey) return
      thisInstance._handleSquareClick($(this))
    })
    $('.square').on("mousedown", function(){
      thisInstance._handleSquareMouseDown($(this))
    })
    $('.square').on("mouseup", function(e){
      thisInstance._handleSquareMouseUp($(this), e.ctrlKey && getPremium() >= 1)
    })
  }

  _scratchKifu(){
    this.moves = new Array()
    let firstMove = new DobutsuMovement()
    this.moves.push(firstMove)
    kifuGrid.clear()
    this.addMoveToKifuGrid(firstMove)
  }

  static get MOVEMENT_CONST(){
    return DobutsuMovement.CONST
  }

  loadPieceDesignOption(){
    let v = options.piece_type_34 || 1
    let newTheme = ['3x4_pieco', '3x4_pieco', '3x4_hidetchi'][v]
    if (this._theme != newTheme) this._preloadPieceImages(newTheme)
    this._theme = newTheme
    this._imagePath()
    this._refreshPosition()
  }

  _preloadPieceImages(theme){
    ['hi', 'ki', 'ni', 'ra', 'zo'].forEach(function(p){
      $('<img>').attr('src', 'img/themes/' + theme + '/S' + p + '.png')
      $('<img>').attr('src', 'img/themes/' + theme + '/G' + p + '.png')
    })
  }

  _layoutHandPieceClosureFunc(i){
    let sum = this._position.komadais[i].length
    let deltaX = 0.9 * this._komaW
    let startX = (this._komadaiW - this._komaW - (sum - 1) * deltaX) * 0.5
    let count = 0
    return function(sq, piece){
      //square, piece
      let sqX = startX + deltaX * count
      sq.css({left: sqX + 'px', top: '0px'})
      count += 1
    }
  }

}

"use strict"

class Board{
  constructor(div){
    // Board Condition parameters
    this.myRoleType = null // 0: sente as player, 1: gote as player, 2: watcher
    this.isPostGame = false
    this.studyHostType = 0  // 0: not host, 1: Sub-host, 2: Host
    // Properties
    this._div = div
    this._komadais = new Array(2)
    this.playerInfos = new Array(2)
    this._timers = new Array(2)
    this._flags = new Array(2)
    this._publicPosition
    this._position
    this._direction = Position.CONST.SENTE
    this._theme = "ichiji"
    this._selectedSquare = null
    this._lastSquare = null
    this._canMoveMyPiece = true
    this._canMoveHisPiece = true
    this.onListen = true
    this._initialPositionStr = null
    this.moves = new Array()
    this.game = null
    this._generateParts()
    this._setTheme()
  }

  _generateParts(){
    this._ban = $('<div></div>', {id: 'banField'}).appendTo(this._div)
    this._komadais[0] = $('<div></div>', {id: 'senteKomadai', class: 'komadai'}).appendTo(this._div)
    this._komadais[1] = $('<div></div>', {id: 'goteKomadai', class: 'komadai'}).appendTo(this._div)
    this.playerInfos[0] = $('<div></div>', {id: 'senteInfo', class: 'player-info'}).appendTo(this._div)
    this.playerInfos[1] = $('<div></div>', {id: 'goteInfo', class: 'player-info'}).appendTo(this._div)
    this._timers[0] = $('<div></div>', {id: 'senteTimer', class: 'game-timer'}).appendTo(this._div)
    this._timers[1] = $('<div></div>', {id: 'goteTimer', class: 'game-timer'}).appendTo(this._div)
    this._flags[0] = $('<div></div>', {id: 'senteFlag', class: 'board-flag'}).appendTo(this._div)
    this._flags[1] = $('<div></div>', {id: 'goteFlag', class: 'board-flag'}).appendTo(this._div)
    for (let i = 0; i < 2; i++){
      this.playerInfos[i].append('<div class="avatar-wrapper"><img class="avatar"/></div><span id="player-info-mark" style="font-size:15px">' + (i == 0 ? '☗' : '☖') + '</span><span id="player-info-name"></span><br><span id="player-info-rate"></span>')
    }
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
    this._myFlagX = 718
    this._myFlagY = 215
    this._hisFlagX = 10
    this._hisFlagY = 215
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
    let myTurnIndex = this._direction ? 0 : 1
    let hisTurnIndex = this._direction ? 1 : 0
    this._ban.css({left: this._banX + 'px', top: this._banY + 'px'})
    this._komadais[myTurnIndex].css({left: this._myKomadaiX + 'px', top: this._myKomadaiY + 'px'})
    this._komadais[hisTurnIndex].css({left: this._hisKomadaiX + 'px', top: this._hisKomadaiY + 'px'})
    this.playerInfos[myTurnIndex].css({left: this._myInfoX + 'px', top: this._myInfoY + 'px'})
    this.playerInfos[hisTurnIndex].css({left: this._hisInfoX + 'px', top: this._hisInfoY + 'px'})
    this._flags[myTurnIndex].css({left: this._myFlagX + 'px', top: this._myFlagY + 'px'})
    this._flags[hisTurnIndex].css({left: this._hisFlagX + 'px', top: this._hisFlagY + 'px'})
  }

  _generateSquares(){
    //Call after direction is set!
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
      sq.css('background-image', 'url(img/themes/' + this._theme + '/' + koma.toImagePath(!this._direction) + ')')
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
        sq.css('background-image', 'url(img/themes/' + this._theme + '/' + piece.toImagePath(!this._direction) + ')')
        let thisInstance = this
        sq.on("click", function(){
          thisInstance._handleSquareClick($(this))
        })
        sq.appendTo(this._komadais[i])
      }, this)
    }
  }

  setGame(game){
    this.game = game
    this.displayPlayerInfos()
  }

  setDirection(direction){
    this._direction = direction
    this._partLayout()
  }

  displayPlayerInfos(){
    for (let i = 0; i < 2; i++){
      let user = i == 0 ? this.game.black : this.game.white
      this.playerInfos[i].find("img.avatar").attr("src", user.avatarURL())
      this.playerInfos[i].find("#player-info-name").html(user.name)
      this.playerInfos[i].find("#player-info-rate").html('R: ' + user.rate + ' (' + makeRankFromRating(user.rate) + ')')
      this._flags[i].html(user.country.flagImgTagMovie())
    }
  }

  loadNewPosition(str = Position.CONST.INITIAL_POSITION){
    this._publicPosition = new Position()
    this._publicPosition.loadFromString(str)
    this._position = new Position()
    this._position.loadFromString(str)
    this._initialPositionStr = str
    this._generateSquares()
    this._refreshPosition()
    this.moves = new Array()
    let firstMove = new Movement(0)
    this.moves.push(firstMove)
    kifuGrid.clear()
    this.addMoveToKifuGrid(firstMove)
  }

  addMoveToKifuGrid(move){
    kifuGrid.row.add(move)
    kifuGrid.draw()
    if (this.onListen) {
      kifuGrid.rows().deselect()
      kifuGrid.row(":last").select()
    }
  }

  startGame(myTurn) {
    this.myRoleType = myTurn ? 0 : 1
    this.isPostGame = false
    this.studyHostType = 0
    this.onListen = true
    /*
    rematch[0] = false;
    rematch[1] = false;
    _board_coord_image.visible = false;
    timers[0].reset(_game.total, _game.byoyomi);
    timers[1].reset(_game.total, _game.byoyomi);
    timers[_my_turn == _position.turn ? 0 : 1].start();
    if (moves) {
  	  if (moves.length > 0) {
    		for each(var move:Object in moves) {
    			if (move.move == "%TORYO") {
    				var mv:Movement = new Movement(kifu_list.length);
    				mv.setGameEnd(_last_pos.turn, Movement.RESIGN, parseInt(move.time.substr(1)));
    				kifu_list.push(mv);
    				timers[_my_turn == _last_pos.turn ? 0 : 1].accumulateTime(parseInt(move.time.substr(1)));
    			} else {
    				makeMove(move.move + "," + move.time, true, false);
    			}
    		}
  	  }
    }
    _client_timeout = false;
    studyOrigin = 0;
    */
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
        let move = new Movement(kifuGrid.row({selected: true}).data().num + 1)
        move.setFromManualMove(this._position.turn, this._selectedSquare, sq)
        this._executeManualMove(move)
      }
      this._cancelSelect()
    }
  }

  _executeManualMove(move){
    move = this._position.makeMove(move)
    this._refreshPosition()
    if (this.isPlaying()) {
      makeMoveAsPlayer(move)
      this._publicPosition.loadFromString(this._position.toString())
    }
  }

  handleReceivedMove(move){
    this._publicPosition.makeMove(move)
    this.addMoveToKifuGrid(move)
    if (this.onListen) {
      this._position.loadFromString(this._publicPosition.toString())
      this._refreshPosition()
    }
  }

  setBoardConditions(){
    if (this.isPlayer()) {
      if (this.isPostGame){
      } else {
        this._canMoveMyPiece = true
        this._canMoveHisPiece = false
      }
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

  isPlayer(){
    return (this.myRoleType == 0 || this.myRoleType == 1)
  }

  isPlaying(){
    return this.isPlayer() && !this.isPostGame
  }

  getFinalMove(){
    return this.moves[this.moves.length - 1]
  }

  get position(){
    return this._position
  }

}

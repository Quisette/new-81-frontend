"use strict"

class Board{
  constructor(div){
    // Board Condition parameters
    this.myRoleType = null // 0: sente as player, 1: gote as player, 2: watcher
    this.isPostGame = false
    this.studyHostType = null  // 0: not host, 1: Sub-host, 2: Host
    // Properties
    this._div = div
    this._originalWidth = div.width()
    this._originalHeight = div.height()
    this._komadais = new Array(2)
    this.playerInfos = new Array(2)
    this._timers = new Array(2)
    this._flags = new Array(2)
    this._publicPosition
    this._position
    this._direction = Position.CONST.SENTE
    this._theme = "ichiji"
    this.pieceDesignType = 0
    this._selectedSquare = null
    this._lastSquare = null
    this._mouseDownSquare = null
    this._canMoveMyPiece = true
    this._canMoveHisPiece = true
    this.onListen = true
    this._initialPositionStr = null
    this.moves = new Array()
    this.game = null
    this._kid = null
    this._rematchReady = [false, false]
    this._arrowsSelf = []
    this._arrowsPublic = []
    this._generateParts()
    this._setTheme()
    this._scale = 1
  }

  _generateParts(){
    this._ban = $('<div></div>', {id: 'banField'}).appendTo(this._div)
    this._komadais[0] = $('<div></div>', {id: 'senteKomadai', class: 'komadai'}).appendTo(this._div)
    this._komadais[1] = $('<div></div>', {id: 'goteKomadai', class: 'komadai'}).appendTo(this._div)
    this.playerInfos[0] = $('<div></div>', {id: 'senteInfo', class: 'player-info'}).appendTo(this._div)
    this.playerInfos[1] = $('<div></div>', {id: 'goteInfo', class: 'player-info'}).appendTo(this._div)
    this._timers[0] = new GameTimer($('<div></div>', {id: 'senteTimer', class: 'game-timer'}).appendTo(this._div))
    this._timers[1] = new GameTimer($('<div></div>', {id: 'goteTimer', class: 'game-timer'}).appendTo(this._div))
    this._flags[0] = $('<div></div>', {id: 'senteFlag', class: 'board-flag'}).appendTo(this._div)
    this._flags[1] = $('<div></div>', {id: 'goteFlag', class: 'board-flag'}).appendTo(this._div)
    for (let i = 0; i < 2; i++){
      this.playerInfos[i].append('<div class="avatar-wrapper" style="margin:5px 15px;"><img class="avatar"/></div><span id="player-info-mark" style="font-size:15px">' + (i == 0 ? '☗' : '☖') + '</span><span id="player-info-name"></span><br><span id="player-info-rate"></span>')
    }
    $('[id=player-info-name]').dblclick(function(){_playerNameDblClick($(this).text())})
    this._arrowCanvas = $('<canvas></canvas>', {id: 'boardCanvas'}).attr({width: this._originalWidth, height: this._originalHeight}).appendTo(this._div)
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
    let dir = ['dobutsu', 'blind_extreme'].includes(this._theme) ? this._theme : 'default'
    this._ban.css('background-image', 'url(img/themes/' + dir + '/ban.jpg)')
    this._komadais[0].css('background-image', 'url(img/themes/' + dir + '/Shand.jpg)')
    this._komadais[1].css('background-image', 'url(img/themes/' + dir + '/Ghand.jpg)')
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
    this._timers[myTurnIndex].setPosition(this._myTimerX, this._myTimerY)
    this._timers[hisTurnIndex].setPosition(this._hisTimerX, this._hisTimerY)
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
    $('.square').on("mousedown", function(){
      thisInstance._handleSquareMouseDown($(this))
    })
    $('.square').on("mouseup", function(){
      thisInstance._handleSquareMouseUp($(this))
    })
  }

  _refreshSquare(sq){
    sq.removeClass("square-last")
    let koma = this._position.getPieceFromSquare(sq)
    if (koma) {
      sq.css('background-image', 'url(img/themes/' + this._theme + '/' + koma.toImagePath(!this._direction) + ')')
    } else {
      sq.css('background-image', 'none')
    }
  }

  _refreshPosition(){
    if (this._position == null) return
    let thisInstance = this
    for (let i = 0; i < 2; i++){
      this._komadais[i].empty()
    }
    $('.square').each(function(){
      thisInstance._refreshSquare($(this))
    })
    $(".square-selected").removeClass("square-selected")
//    $(".square-last").removeClass("square-last")
    for (let i = 0; i < 2; i++){
      let hash = this._position.handCoordinateHash(i)
      this._position.komadais[i].forEach(function(piece){
        if (hash[piece.CSA] == null) return
        let sq = $('<div></div>', {id: 'sq' + (piece.owner ? 0 : -1) + '_' + piece.getType(), class: 'square'}).data({x: piece.owner ? 0 : -1, y: piece.getType()})
        sq.css({width: this._komaW + 'px', height: this._komaH + 'px'})
        sq.css({left: hash[piece.CSA].x + 'px', top: hash[piece.CSA].y + 'px'})
        hash[piece.CSA].x += hash[piece.CSA].dx
        sq.css('background-image', 'url(img/themes/' + this._theme + '/' + piece.toImagePath(!this._direction) + ')')
        let thisInstance = this
        sq.on("click", function(){
          thisInstance._handleSquareClick($(this))
        })
        sq.on("mousedown", function(){
          thisInstance._handleSquareMouseDown($(this))
        })
        sq.appendTo(this._komadais[i])
      }, this)
    }
    if (this._position.lastMove) {
      $('#sq' + this._position.lastMove.toX + '_' + this._position.lastMove.toY).addClass('square-last')
      $('#sq' + this._position.lastMove.fromX + '_' + this._position.lastMove.fromY).addClass('square-last')
    }
    if ($("#modalImpasse").dialog('isOpen')) this.calcImpasse()
  }

  setPieceDesignType(v){
    if (v <= 8) this._theme = ['ichiji', 'ninju', 'hidetchi', 'ichiji_ryoko', 'dobutsu', 'kinki', 'ryoko', 'kiyoyasu', 'shogicz'][v]
    else if (v >= 100) this._theme = ['blind_middle', 'blind_hard', 'blind_extreme'][v - 100]
    this._imagePath()
    this._refreshPosition()
  }

  setScale(scale){
    if (scale == this._scale) return false // Not changed
    this._div.css('transform', 'scale(' + scale + ')')
    let hMargin = (scale - 1) * this._originalHeight / 2
    let wMargin = (scale - 1) * this._originalWidth / 2
    this._div.css('margin', hMargin + 'px ' + wMargin + 'px')
    this._scale = scale
    return true // Changed
  }

  actualWidth(){
    return this._div.width() * this._scale
  }

  actualHeight(){
    return this._div.height() * this._scale
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

  flipBoard(){
    this._cancelSelect()
    this.setDirection(!this._direction)
    this._generateSquares()
    this._refreshPosition()
    this.redrawAllArrows(this.onListen)
  }

  loadNewPosition(str = Position.CONST.INITIAL_POSITION){
    this._publicPosition = new Position()
    this._publicPosition.superior = this.game ? (!this.game.isHandicap() && this.game.black.rate > this.game.white.rate) : false
    this._publicPosition.loadFromString(str)
    this._position = new Position()
    this._position.superior = this.game ? (!this.game.isHandicap() && this.game.black.rate > this.game.white.rate) : false
    this._position.loadFromString(str)
    this._initialPositionStr = str
    this._generateSquares()
    this._refreshPosition()
    this.moves = new Array()
    let firstMove = new Movement()
    this.moves.push(firstMove)
    kifuGrid.clear()
    this.addMoveToKifuGrid(firstMove)
  }

  addMoveToKifuGrid(move, highlight = true){
    if (move.num < kifuGrid.rows().count()) {
      while (kifuGrid.row(move.num).length == 1) kifuGrid.row(move.num).remove()
    }
    kifuGrid.row.add(move)
    kifuGrid.draw()
    if (highlight) {
      kifuGrid.rows().deselect()
      kifuGrid.row(move.num).select()
      scrollGridToSelected(kifuGrid)
    }
  }

  startGame(positionStr, myRoleType, move_strings = [], since_last_move = 0) {
    this.myRoleType = myRoleType
    if (myRoleType == 2) this.setDirection(true)
    else this.setDirection(myRoleType == 0)
    this.loadNewPosition(positionStr)
    this.isPostGame = false
    if (this.studyHostType == null) this.studyHostType = 0 // Keep the same host level as before even if startGame() is newly called
    this.onListen = true
    this._timers[0].initialize(this.game.total, this.game.byoyomi)
    this._timers[1].initialize(this.game.total, this.game.byoyomi)
    if (this.isPlayer()) this._timers[this.myRoleType].myPlayingTimer = true
    this._rematchReady = [false, false]
    /*
    _board_coord_image.visible = false;
    studyOrigin = 0;
    */
    if (move_strings.length > 0) {
      move_strings.forEach(function(move_str){
        if (move_str.match(/^%TORYO/)) return
        let move = new Movement(board.getFinalMove())
        move.setFromCSA(move_str.split(",")[0])
        move.time = parseInt(move_str.split(",")[1])
        this.runningTimer.useTime(move.time)
        move = this._publicPosition.makeMove(move, false)
        this.moves.push(move)
        kifuGrid.row.add(move)
      }, this)
      this._position.deepCopy(this._publicPosition)
      this._refreshPosition()
      kifuGrid.draw()
      kifuGrid.rows().deselect()
      kifuGrid.row(":last").select()
      scrollGridToSelected(kifuGrid)
    }
		if (since_last_move > 0) {
      this.runningTimer.useTime(since_last_move, true)
		}
    this.runningTimer.run()
    this.updateTurnHighlight()
  }

  handleMonitorMove(move){
    this.runningTimer.useTime(move.time)
    move = this._publicPosition.makeMove(move)
    this.moves.push(move)
    if (!kifuGrid.row(':last').data().branch) {
      kifuGrid.row.add(move)
      if (this.onListen) {
        kifuGrid.draw()
        kifuGrid.rows().deselect()
        kifuGrid.row(":last").select()
        scrollGridToSelected(kifuGrid)
      } else {
        drawGridMaintainScroll(kifuGrid)
      }
    }
    if (this.onListen) {
      this._position.deepCopy(this._publicPosition)
      this._refreshPosition()
    }
    this.updateTurnHighlight()
    this.runningTimer.run()
  }

  refreshKifuGrid(){
  }

  _handleSquareMouseDown(sq){
    this._mouseDownSquare = sq
  }

  _handleSquareMouseUp(sq){
    if (this._mouseDownSquare == null) return
    if (!this._mouseDownSquare.is(sq)) {
      if (this.onListen){
        if (!board.isPlaying()) {
          if (_studyBase != null || !this.isPostGame) this._addMyArrow(sq, true)
        }
      } else {
        this._addMyArrow(sq, false)
      }
    }
    this._mouseDownSquare = null
  }

  _addMyArrow(sqTo, isPublic){
    let fromType = -1
    let fromX = this._mouseDownSquare.data().x
    let fromY = this._mouseDownSquare.data().y
    let toX = sqTo.data().x
    let toY = sqTo.data().y
    if (fromX <= 0) {
      fromType = fromX == 0 ? 0 : 1
      fromX = fromY
      fromY = 0
      let thisInstance = this
      this._komadais[fromType].find('.square').each(function(i, node){
        if ($(node).is(thisInstance._mouseDownSquare)) {
          return false
        } else if ($(node).data().y == thisInstance._mouseDownSquare.data().y) {
          fromY++
        }
      })
    }
    this.addArrow(fromType, fromX, fromY, toX, toY, options.arrow_color, isPublic, me.name)
    if (isPublic) client.gameChat("[##ARROW]" + fromType + "," + fromX + "," + fromY + "," + toX + "," + toY + ",0x" + options.arrow_color.toString(16))
  }

  _handleSquareClick(sq){
    if (!this._selectedSquare) {
      let koma = this._position.getPieceFromSquare(sq)
      if (this._canMovePieceNow() && koma && koma.owner == this._position.turn) {
        this._selectedSquare = sq
        sq.addClass("square-selected")
        if (this.isPlaying()) { //Send ##GRAB message
          let x = sq.data().x
          let y = sq.data().y
          if (x <= 0) {
            x = 100 + koma.pieceType
            y = 0
          }
          sendGrab(x, y)
        }
        this._position.getMovableGridsFromSquare(sq).forEach(function(e){
          $("#sq" + e[0] + "_" + e[1]).addClass("square-movable")
        })
      }
    } else {
      if (sq.hasClass("square-movable")) {
        if (this._position.canPromote(this._selectedSquare, sq)) this._openPromotionDialog(sq)
        else this._manualMoveCommandComplete(sq, false)
      } else {
        this._cancelSelect()
      }
    }
  }

  _openPromotionDialog(sq){
    //square
    let element = $("<div></div>",{
      title: 'Promote?',
      html: '<div id="promotion-window">\
        <button type=button id="promote-yes" class="promotion-button"><img class="promotion-image" id="promote-yes-image"></button>\
        <button type=button id="promote-no" class="promotion-button"><img class="promotion-image" id="promote-no-image"></button>\
        </div>'
    }).dialog({
      dialogClass: 'no-close',
      modal: true,
      autoOpen: false,
      width: 100,
      minHeight: 0,
      position: {at:'left+'+mouseX+' top+'+mouseY},
      close: function(e){
        element.dialog('destroy').remove()
      }
    })
    let koma = this._position.getPieceFromSquare(this._selectedSquare)
    element.find('#promote-yes-image').attr('src', 'img/themes/' + this._theme + '/' + koma.toImagePath(!this._direction, true))
    element.find('#promote-no-image').attr('src', 'img/themes/' + this._theme + '/' + koma.toImagePath(!this._direction))
    let thisInstance = this
    $('#promote-yes').click(function(){
      thisInstance._manualMoveCommandComplete(sq, true)
      element.dialog('close')
    })
    $('#promote-no').click(function(){
      thisInstance._manualMoveCommandComplete(sq, false)
      element.dialog('close')
    })
    element.dialog('open')
  }

  _manualMoveCommandComplete(destinationSquare, promote){
    //sqaure, boolean
    let move = new Movement(kifuGrid.row({selected: true}).data())
    move.setFromManualMove(this._position.turn, this._selectedSquare, destinationSquare, promote)
    this._cancelSelect()
    this._executeManualMove(move)
  }

  _executeManualMove(move){
    this.clearArrows(false)
    if (this.isPlaying()) {
      this.runningTimer.stop()
    }
    move = this._position.makeMove(move)
    this._refreshPosition()
    if (this.isPlaying()) {
      sendMoveAsPlayer(move)
      this._publicPosition.deepCopy(this._position)
      this.updateTurnHighlight()
    } else {
      move.branch = true
      this.addMoveToKifuGrid(move)
      if (this.onListen && this.studyHostType >= 1) sendStudy()
      else forceKifuMode(0)
    }
  }

  handleReceivedMove(move){
    move = this._publicPosition.makeMove(move)
    this.moves.push(move)
    this.addMoveToKifuGrid(move)
    if (this.onListen) {
      this._position.deepCopy(this._publicPosition)
      this._refreshPosition()
    }
  }

  replayMoves(moves){
    this._cancelSelect()
	  //_last_to_square = null;
    this._position.loadFromString(this._initialPositionStr)
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].replayable()) this._position.makeMove(moves[i], false)
    }
    /*
		  if (mv.replayable()) {
			  _last_to_square = _cells[mv.to.y][mv.to.x];
			  _last_to_square.setStyle('backgroundColor', '0xCC3333');
			  if (mv.from.x < Kyokumen.HAND) {
				_last_from_square = _cells[mv.from.y][mv.from.x];
				_last_from_square.setStyle('backgroundColor', '0xFF5555');
			  }
		  }
      */
    this._refreshPosition()
  }

  handleBranchMove(move){
    return this._position.makeMove(move, false)
  }

  handleGrab(x, y){
    $(".square-selected").removeClass("square-selected")
    if (x == 0) {
      return
    } else if (x >= 100) {
      y = x - 100
      x = this._position.turn ? 0 : -1
    }
    $("#sq" + x + "_" + y).addClass("square-selected")
  }

  setBoardConditions(){
    if (this.isPlaying()) {
      this._canMoveMyPiece = true
      this._canMoveHisPiece = false
    } else {
      this._canMoveMyPiece = !this.onListen || this.studyHostType >= 1
      this._canMoveHisPiece = !this.onListen || this.studyHostType >= 1
    }
  }

  _canMovePieceNow(){
    return (this._canMoveMyPiece && this._position.turn == this._direction) || (this._canMoveHisPiece && this._position.turn != this._direction)
  }

  _cancelSelect(){
    if (this._selectedSquare != null){
      $(".square").removeClass("square-movable")
      this._selectedSquare.removeClass("square-selected")
      this._selectedSquare = null
    }
    if (this.isPlaying()) sendGrab(0,0)
		//_endGrab();
		//if (highlight_movable) _hideMovableSquares();
		//_pieceGrab = false;
  }

  updateTurnHighlight(){
    if (this.isPostGame) {
      this.playerInfos[0].removeClass('player-info-has-turn')
      this.playerInfos[1].removeClass('player-info-has-turn')
    } else {
      this.playerInfos[this._publicPosition.turn ? 1 : 0].removeClass('player-info-has-turn')
      this.playerInfos[this._publicPosition.turn ? 0 : 1].addClass('player-info-has-turn')
    }
  }

  playerNameClassChange(turn, className, add_or_remove){
    //int, string, boolean
    if (add_or_remove) this.playerInfos[turn].find("#player-info-name").addClass(className)
    else this.playerInfos[turn].find("#player-info-name").removeClass(className)
  }

  pauseAllTimers(){
    this._timers[0].stop(true)
    this._timers[1].stop(true)
  }

  close(){
    this.myRoleType = null
    this.studyHostType = null
    this.game = null
    this.playerInfos[0].find("#player-info-name").removeClass("name-winner name-left name-mouse-out")
    this.playerInfos[1].find("#player-info-name").removeClass("name-winner name-left name-mouse-out")
    this._timers[0].stop()
    this._timers[1].stop()
  }

  rematch(turn){
    //integer
    this._rematchReady[turn] = true
  }

  rematchAgreed(){
    return this._rematchReady[0] == true && this._rematchReady[1] == true
  }

  disconnectTimer(turn){
    //integer
    this._timers[turn].disconnect()
  }

  reconnectTimer(turn){
    //integer
    this._timers[turn].reconnect()
    if (this.isPlaying) this.runningTimer.run()
  }

  calcImpasse(){
    if (this.isPlaying() && this.myRoleType == (this._position.turn ? 0 : 1)) {
      _updateImpasseWindow(this._position.calcImpasse(), this.myRoleType)
    } else {
      _updateImpasseWindow(this._position.calcImpasse())
    }
  }

  refreshPosition(){
    this._refreshPosition()
  }

  addArrow(fromType, fromX, fromY, toX, toY, color, isPublic, sender){
    //integer, integer, integer, integer, integer, uint, boolean, string
    let arrows = isPublic ? this._arrowsPublic : this._arrowsSelf
    let isFull = arrows.length >= BoardArrow.CONST.MAX_ARROWS
    if (isFull) {
      arrows.shift()
      if (this.onListen == isPublic) this.redrawAllArrows(isPublic)
    }
    let arrow = new BoardArrow(fromType, fromX, fromY, toX, toY, color, sender, this._arrowCanvas)
    arrows.push(arrow)
    if (this.onListen == isPublic) arrow.draw(this._scale)
  }

  clearArrows(isPublic, sender = "*"){
    let arrows = isPublic ? this._arrowsPublic : this._arrowsSelf
    let found = false
    if (sender != "*") {
      for (let i = arrows.length - 1; i >= 0; i--) {
        if (arrows[i].name == sender) {
          found = true
          arrows.splice(i,1)
        }
      }
    }
    if (!found) arrows.length = 0
    if (this.onListen && isPublic || !this.onListen && !isPublic) this.redrawAllArrows(isPublic)
    return found
  }

  redrawAllArrows(isPublic, withLable = false){
    let arrows = isPublic ? this._arrowsPublic : this._arrowsSelf
    this.clearCanvas()
    arrows.forEach(function(arrow){
      arrow.draw(this._scale)
    }, this)
  }

  clearCanvas(){
    this._arrowCanvas.get(0).getContext('2d').clearRect(0, 0, this._arrowCanvas.width(), this._arrowCanvas.height())
  }

  isPlayer(){
    return (this.myRoleType == 0 || this.myRoleType == 1)
  }

  isPlaying(){
    return this.isPlayer() && !this.isPostGame
  }

  isWatcher(){
    return this.myRoleType == 2
  }

  isHost(){
    return this.studyHostType == 2
  }

  isSubHost(){
    return this.studyHostType == 1
  }

  isPlayerPresent(turn){
    //integer: 0 or 1
    return !this.playerInfos[turn].find("#player-info-name").hasClass("name-left")
  }

  getPlayerRoleFromName(name){
    if (!this.game) return null
    if (name == this.game.black.name) return 0
    else if (name == this.game.white.name) return 1
    else return null
  }

  getFinalMove(){
    return this.moves[this.moves.length - 1]
  }

  getPlayersTimer(sente){
    return this._timers[sente ? 0 : 1]
  }

  getOpponent(){
    if (this.myRoleType == 0) return this.game.white
    else if (this.myRoleType == 1) return this.game.black
    else return null
  }

  setKifuId(kid){
    this._kid = kid
  }

  toKifuURL(){
    if (this._kid) return "http://system.81dojo.com/" + EJ('en', 'ja') + "/kifus/" + this._kid
    else return ""
  }

  get runningTimer(){
    return this._timers[this._publicPosition.turn ? 0 : 1]
  }

  get position(){
    return this._position
  }

  get div(){
    return this._div
  }

}

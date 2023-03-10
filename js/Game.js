"use strict"

class Game{
  constructor(num, id, black, white){
    //integer, string, User, User
    this.num = num
		this.gameId = id
    this.serverName = this.gameId.split("+")[0]
		this.gameName = this.gameId.split("+")[1]
		let game_info = this.gameName.match(/^([0-9a-z]+?)_(.*)-([0-9]*)-([0-9]*)$/)
		this.gameType = game_info[1]
    this._ownerName = game_info[2].split(".")[0]
		this.total = parseInt(game_info[3])
		this.byoyomi = parseInt(game_info[4])
		this.black = black
		this.white = white
    this.moves = 0
    this.watchers = 0
		this.isBlackIn = true
		this.isWhiteIn = true
    this.opening = "*"
    this.password = ""
    this._enteredPassword = ""
    this.status = ""
    this.gameEndType = null
		if (game_info[2].match(/\.([0-9a-z]{6})/)) this.password = RegExp.$1
    this.shortId = (this.isStudy() ? "SG" : (black.name.slice(0,1) + white.name.slice(0,1))) + id.slice(-8)
  }

	setFromList(moves, status, isBlackIn, isWhiteIn, watchers, opening){
		this.moves = moves
		this.status = status
		this.isBlackIn = isBlackIn
		this.isWhiteIn = isWhiteIn
		this.watchers = watchers;
		this.opening = opening;
  }

  senteStr(){
    let str = coloredSpan(makeRankFromRating(this.black.rate), makeColorFromRating(this.black.rate), 34)
    str += this.black.country.flagImgTag27()
    let nameLimited = '<span style="display:inline-block;max-width:100px;">' + this.black.name + '</span>'
    let nameHTML = this.status == "win" ? ('<span style="text-decoration:underline">' + nameLimited + '</span>') : nameLimited
    nameHTML = (this.isBlackIn || this.isStudy()) ? nameHTML : coloredSpan(nameHTML, '#999')
    str += '&nbsp;' + this.black.generateMark() + nameHTML
    return str
  }

  goteStr(){
    let nameLimited = '<span style="display:inline-block;max-width:100px;">' + this.white.name + '</span>'
    let nameHTML = this.status == "lose" ? ('<span style="text-decoration:underline">' + nameLimited + '</span>') : nameLimited
    nameHTML = (this.isWhiteIn || this.isStudy()) ? nameHTML : coloredSpan(nameHTML, '#999')
    let str = this.white.generateMark() + nameHTML + '&nbsp;'
    str += this.white.country.flagImgTag27()
    str += coloredSpan(makeRankFromRating(this.white.rate), makeColorFromRating(this.white.rate), 34)
    return str
  }

  ruleShort(){
    let str
    if (this.gameType == "r") {
      str = "R: "
    } else if (this.gameType.match(/^hc/)) {
      str = "HC: "
    } else if (this.gameType.match(/^va/)) {
      str = "SP: "
    } else {
      str = "NR: "
    }
    str += this.total/60 + ' - ' + this.byoyomi
    if (this.isTournament()) {
      let tournament = this.getTournament()
      if (tournament) {
        str = coloredSpan(tournament.nameShort(), 'crimson', null, tournament.name())
      } else {
        str = coloredSpan(EJ('Tournament', '??????'), 'crimson')
      }
    }
    return str
  }

  movesStr(){
    if (this.status == "") return coloredSpan(EJ('New', '??????'), 'blue')
    if (this.status == "game" || this.status == "suspend") return this.moves
    return coloredSpan(EJ('End', '??????'), 'green')
  }

  movesSortFunc(){
    if (this.status == "") return -1
    if (this.status == "game" || this.status == "suspend") return parseInt(this.moves)
    return 1000
  }

  watchersStr(){
    if (this.watchers == 0) return ""
    let str = '<span data-gameid="' + this.shortId + '" onmouseover="popupWatchers(this)" onmouseout="$(this).tooltip(\'close\')" style="padding:0 7px'
    if (this.watchers >= 10) str += ';color:red'
		else if (this.watchers >= 5) str += ';color:#e80'
		return str + '">' + this.watchers + '</span>'
  }

  watchersSortFunc(){
    return this.watchers
  }

  openingStr(){
    let object
    if (this.password != "") {
      object = {short: '<i class="fa fa-lock fa-lg"></i>', tip: i18next.t("new_game.private_room")}
    } else {
      object = openingTypeObject(this.hasNoOpeningTypes() ? this.gameType : this.opening)
    }
    return '<span title="' + object.tip + '">' + object.short + "</span>"
  }

  isRated(){
    return this.gameType == "r"
  }

  isHandicap(){
    return this.gameType.match(/^hc/)
  }

  isVariant(){
    return this.gameType.match(/^va/)
  }

  isKyoto(){
    return this.gameType == 'vakyoto'
  }

  hasNoOpeningTypes(){
    return this.gameType.match(/^(hc|va)/) && this.gameType != "hcfixed"
  }

  isUnsupportedRule(){
    return getHandicapShort(this.gameType) == undefined
  }

  maxRate(){
		let maxRate = Math.max(this.black.rate, this.white.rate)
		if ((!this.isBlackIn || !this.isWhiteIn) && this.watchers < 5) {
			return maxRate - 3000
		} else if (this.isTournament() || (this.isStudy() && this.watchers >= 5) || this.watchers >= 10) {
			return maxRate + 3000
		} else {
			return maxRate
		}
  }

  isTournament(){
		return this.gameName.match(/\-\-(\d+)\-(\d)/)
  }

  getTournament(){
		if (this.gameName.match(/\-\-(\d+)\-(\d)/)) {
      return tournaments[parseInt(RegExp.$1)]
    } else return null
  }

  isStudy(){
    return this.gameId.match(/^STUDY/)
  }

  canCalculateMaterialBalance(){
    return this.gameType == "r" || this.gameType == "nr" || this.gameType == "hcfixed"
  }

  isMyRoom(){
    return this._ownerName == me.name
  }

  isMyDisconnectedGame(){
    if (!this.isBlackIn && this.black.name == me.name || !this.isWhiteIn && this.white.name == me.name) {
      if (this.status == "game") return true
      else return false
    } else {
      return false
    }
  }

  isUserIn(user){
    if (this.isBlackIn && this.black.name == user.name) {
      return true
    } else if (this.isWhiteIn && this.white.name == user.name) {
      return true
    } else if (user.isWatchingGame(this)) {
      return true
    }
    return false
  }

  enterPass(pass){
    this._enteredPassword = pass
  }

  lockedOut(){
    if (this.isStudy()) {
      if (this.isMyRoom()) return false
    } else {
      if (this.black.name == me.name || this.white.name == me.name) return false
    }
    if (this.password == "") {
      return false
    } else {
      return this.password != CybozuLabs.MD5.calc(config.privateRoomSalt + this._enteredPassword).substr(0,6)
    }
  }

}

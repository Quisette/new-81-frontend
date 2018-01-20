"use strict"

class Game{
  constructor(num, id, black, white){
    //integer, string, User, User
    this.num = num
		this.gameId = id
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
    this.status = ""
		if (game_info[2].match(/\.([0-9a-z]{6})/)) this.password = RegExp.$1
    this.shortId = (this.isStudy() ? "SG" : (black.name.substr(0,1) + white.name.substr(0,1))) + id.substr(id.length - 7, 7)
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
    let nameHTML = this.status == "win" ? ('<span style="text-decoration:underline">' + this.black.name + '</span>') : this.black.name
    nameHTML = (this.isBlackIn || this.isStudy()) ? nameHTML : coloredSpan(nameHTML, '#999')
    str += '&nbsp;' + nameHTML
    return str
  }

  goteStr(){
    let nameHTML = this.status == "lose" ? ('<span style="text-decoration:underline">' + this.white.name + '</span>') : this.white.name
    nameHTML = (this.isWhiteIn || this.isStudy()) ? nameHTML : coloredSpan(nameHTML, '#999')
    let str = nameHTML + '&nbsp;'
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
    } else {
      str = "NR: "
    }
    str += this.total/60 + ' - ' + this.byoyomi
    if (this.isTournament()) {
      let tournament = this.getTournament()
      if (tournament) {
        str = '<span title="' + tournament.name() + '">' + tournament.nameShort() + '</span>'
      } else {
        str = EJ('Tournament', '大会')
      }
    }
    return str
  }

  movesStr(){
    if (this.status == "") return coloredSpan(EJ('New', '開始'), 'blue')
    if (this.status == "game" || this.status == "suspend") return this.moves
    return coloredSpan(EJ('End', '終局'), 'green')
  }

  watchersStr(){
    if (this.watchers == 0) return ""
		if (this.watchers >= 10) return coloredSpan(this.watchers, 'red')
		if (this.watchers >= 5) return coloredSpan(this.watchers, '#e80')
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

  hasNoOpeningTypes(){
    return this.gameType.match(/^(hc|va)/) && this.gameType != "hcfixed"
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

}

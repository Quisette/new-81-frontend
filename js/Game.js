"use strict"

class Game{
  constructor(num, id, black, white){
    //integer, string, User, User
    this.num = num
		this.gameId = id
		this.gameName = this.gameId.split("+")[1]
		let game_info = this.gameName.match(/^([0-9a-z]+?)_(.*)-([0-9]*)-([0-9]*)$/)
		this.gameType = game_info[1]
		this.total = parseInt(game_info[3])
		this.byoyomi = parseInt(game_info[4])
		this.black = black
		this.white = white
    this.moves = 0
    this.watchers = 0
    this.opening = "*"
    this.password = ""
    this.status = ""
		if (game_info[2].match(/\.([0-9a-z]{6})/)) this.password = RegExp.$1
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
    let str = coloredSpan(makeRankFromRating(this.black.rate), makeColorFromRating(this.black.rate), 25)
    str += this.black.country.flagImgTag27()
    str += '&nbsp;' + this.black.name
    return str
  }

  goteStr(){
    let str = this.white.name + '&nbsp;'
    str += this.white.country.flagImgTag27()
    str += coloredSpan(makeRankFromRating(this.white.rate), makeColorFromRating(this.white.rate), 25)
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
    return str
  }

  openingStr(){
    let object
    if (this.password != "") {
      object = {short: EJ("PRIVATE", "[ロック]"), tip: i18next.t("new_game.private_room")}
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

}

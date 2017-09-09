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

  gridObject(){
    let senteStr = coloredSpan(makeRankFromRating(this.black.rate), makeColorFromRating(this.black.rate), 25)
    senteStr += this.black.country.flagImgTag27()
    senteStr += '&nbsp;' + this.black.name
    let goteStr = this.white.name + '&nbsp;'
    goteStr += this.white.country.flagImgTag27()
    goteStr += coloredSpan(makeRankFromRating(this.white.rate), makeColorFromRating(this.white.rate), 25)
    let ruleStr
    if (this.gameType == "r") {
      ruleStr = "R: "
    } else if (this.gameType.match(/^hc/)) {
      ruleStr = "HC: "
    } else {
      ruleStr = "NR: "
    }
    ruleStr += this.total/60 + ' - ' + this.byoyomi

    return {
      senteStr: senteStr,
      goteStr: goteStr,
      ruleShort: ruleStr,
      moves: this.moves,
      watchers: this.watchers,
      opening: ""
		}
  }

}

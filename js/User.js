"use strict";

class User{
  constructor(name){
    this.name = name
    this.rate = 0
    this._countryCode = 0
    this.status = 0
    // 0:connected, 1:game_waiting, 2:agree_wating, 3:start_waiting, 4:game, 5:post_game, 6:finished
    this.idle = false
    this._isMobile = false
    this._monitorGame = "*"
    this.provisional = true
    this._waitingGameName = ""
    this._waitingTurn = "*"
    this._waitingComment = ""
  }

  setFromWho(tokens){
    if (tokens.shift() == "x2|81AR") this._isMobile = true
    this.status = parseInt(tokens.shift())
    this.rate = parseInt(tokens.shift())
    this.provisional = tokens.shift() == "1"
    let token = tokens.shift()
    if (token != "0") this._countryCode = parseInt(token)
    this._monitorGame = tokens.shift()
    this.idle = tokens.shift() == "1"
    if (this.status == 1){
      let waiting_token = tokens.join(",").split("|")
      this._waitingGameName = waiting_token.shift()
      this._waitingTurn = waiting_token.shift()
      this._waitingComment = waiting_token.join("|")
    } else {
      this._waitingGameName = ""
      this._waitingTurn = "*"
      this._waitingComment = ""
    }
  }

	setFromList(rating, country_code) { // String, int
		if (rating.match(/^\*/)) {
			if (parseInt(rating.substr(1)) > 3500) this.rate= parseInt(rating.substr(1));
			else this.rate = 0
		} else {
  		this.rate = parseInt(rating)
    }
		this._countryCode = country_code
	}

	setFromGame(game_name, turn, comment){
    //string, string, string
		this._waitingGameName = game_name
		this._waitingTurn = turn;
		this._waitingComment = comment;
		if (game_name == "*") this.status = 0
		else this.status = 1
	}

	setFromStart(game_name, turn){
    //string, string
		this.game_name = game_name;
		//this.turn = turn;
		this.status = 4
		//this.moves = 0
	}

  setFromLogin(tokens){
    this.rate = tokens[1]
  }

	setFromLobbyIn(rate, country_code) {
    //int, int,
		this.rate = rate
		this._countryCode = country_code
  }

  setFromStudy(sente){
    //sente:boolean
    this._countryCode = sente ? 1 : 2
  }

  listAsWaiter(){
		return this.status == 1 && !this._waitingGameName.match(/_@/)
  }

  inGameRoom(){
    return this.status == 4 || this.status == 5
  }

  gridObject(){
		let statStr =  (this._monitorGame != "*") ? EJ("M ", "観") : ""
		if (this.listAsWaiter()) {
		  statStr += EJ("W", "待")
		} else if (this.status == 5) {
			statStr = EJ("P ", "感想 ")
		} else if (this.status == 4) {
			statStr = EJ("G ", "対")
		}

    let ruleStr = ""
    let timeStr = ""
		if (this.listAsWaiter()) {
      let game_info = this._waitingGameName.match(/^([0-9a-z]+?)_(.*)-([0-9]*)-([0-9]*)$/)
			if (game_info[2].match(/\-\-(\d+)$/)) {}
//	return InfoFetcher.getSystemTournamentName(parseInt(match[1]));
      ruleStr = getHandicapShort(game_info[1])
			timeStr = (parseInt(game_info[3]) / 60) + "-" + game_info[4]
		}

    return {
      statStr: statStr,
      title: "",
      rank: coloredSpan(makeRankFromRating(this.rate), makeColorFromRating(this.rate)),
      name: this.name,
      nameStr: this.idle ? coloredSpan(this.name, '#00f') : this.name,
      country: this.country.flagImgTag16() + ' ' + this.country.name3Tag(),
      rate: this.rate,
      waiter: this.country.flagImgTag27() + ' ' + coloredSpan('■', makeColorFromRating(this.rate)) + ' ' + (this.idle ? coloredSpan(this.name, '#00f') : this.name),
      ruleStr: ruleStr,
      timeStr: timeStr
		}
  }

  avatarURL(){
    return "http://system.81dojo.com/players/" + this.name + "/avatar"
  }

  set countryCode(v){
    this._countryCode = v
  }

  get country(){
    return countries[this._countryCode]
  }

  get waitingGameName(){
    return this._waitingGameName
  }

}

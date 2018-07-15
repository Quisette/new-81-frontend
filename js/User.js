"use strict";

class User{
  constructor(name){
    this.name = name
    this.isGuest = /^GUEST_[0-9a-z]{6}$/.test(name)
    this.rate = 0
    this._countryCode = 0
    this.status = 0
    // 0:connected, 1:game_waiting, 2:agree_wating, 3:start_waiting, 4:game, 5:post_game, 6:finished
    this.idle = false
    this.isMobile = false
    this._monitorGame = "*"
    this.provisional = true
    this._waitingGameName = ""
    this._waitingTurn = "*"
    this._waitingComment = ""
    this._waitingTournamentId = null
    this._isSelf = name == client.username
    this._isCircleMember = options.members.includes(name)
    this._isTournamentMember = options.opponents.includes(name)
    this._isFavorite = options.favorites.includes(name)
  }

  setFromWho(tokens){
    if (tokens.shift() == "x2|81AR") this.isMobile = true
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
      this._setTournamentId()
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
    this._setTournamentId()
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
    this.provisional = (parseInt(tokens[3]) + parseInt(tokens[4])) < 5
  }

	setFromLobbyIn(rate, provisional, country_code, protocol) {
    //int, string, int,
		this.rate = rate
    this.provisional = provisional == "true"
		this._countryCode = country_code
    if (protocol == "x2|81AR") this.isMobile = true
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

  _setTournamentId(){
    this._waitingTournamentId = null
    if (this._waitingGameName.length <= 1) return
    let game_info = this._waitingGameName.match(/^([0-9a-z]+?)_(.*)-([0-9]*)-([0-9]*)$/)
		if (game_info[2].match(/\-\-(\d+)$/)) { // If tournament
      this._waitingTournamentId = parseInt(RegExp.$1)
    }
  }

  waitingChallengeableTournament(){
    if (this._waitingTournamentId) {
      if (tournaments[this._waitingTournamentId] && tournaments[this._waitingTournamentId].amJoined()) return true
      else return false
    } else {
      return false
    }
  }

  gridObject(){
		let statStr = ""
    if (this.listAsWaiter()) statStr = coloredSpan(i18next.t("lobby.stat_w"), 'green', 13, i18next.t("lobby.stat_w_tip"))
		if (this._monitorGame != "*") {
		  statStr += coloredSpan(i18next.t("lobby.stat_m"), null, 13, i18next.t("lobby.stat_m_tip"))
		} else if (this.status == 5) {
		  statStr = coloredSpan(i18next.t("lobby.stat_p"), null, null, i18next.t("lobby.stat_p_tip"))
		} else if (this.status == 4) {
		  statStr = coloredSpan(i18next.t("lobby.stat_g"), 'goldenrod', null, i18next.t("lobby.stat_g_tip"))
		}

    let ruleStr = ""
    let timeStr = ""
		if (this.listAsWaiter()) {
      let game_info = this._waitingGameName.match(/^([0-9a-z]+?)_(.*)-([0-9]*)-([0-9]*)$/)
      ruleStr = getHandicapShort(game_info[1])
			if (this._waitingTournamentId) {
        if (tournaments[this._waitingTournamentId]){
          ruleStr = coloredSpan(tournaments[this._waitingTournamentId].nameShort(), 'crimson', null, tournaments[this._waitingTournamentId].name())
        } else {
          ruleStr = coloredSpan(EJ('Tournament', '大会'), 'crimson')
        }
      }
			timeStr = (parseInt(game_info[3]) / 60) + "-" + game_info[4]
		}
    let rateStr = this.rate
    if (this.provisional) rateStr = "*" + this.rate
    if (this.rate == 0) rateStr = "????"
    let rankStr = (this.provisional && this.rate < 3000) ? "-" : coloredSpan(makeRankFromRating(this.rate), makeColorFromRating(this.rate))
    let nameLimited = '<span style="display:inline-block;width:100px;">' + this.name + '</span>'
    let markStr = this.generateMark()
    let hostStr = this.name == hostPlayerName ? coloredSpan('<i class="fa fa-graduation-cap"></i>', '#008', 15, i18next.t("board.attr_host")) : ''

    return {
      statStr: statStr,
      title: this.titleTag(),
      rank: rankStr,
      name: this.name,
      nameStr: markStr + (this.idle ? coloredSpan(nameLimited, '#00f') : nameLimited),
      watcher: hostStr + markStr + nameLimited,
      country: this.country.flagImgTag16() + ' ' + this.country.name3Tag(),
      rate: rateStr,
      waiter: this.country.flagImgTag27() + ' ' + coloredSpan('■', makeColorFromRating(this.rate)) + ' ' + (this.idle ? coloredSpan(nameLimited, '#00f') : nameLimited),
      ruleStr: ruleStr,
      timeStr: timeStr
		}
  }

  generateMark(){
    let markStr = ""
    if (this._isSelf) markStr += coloredSpan('<i class="fa fa-info-circle"></i>', '#5b1', 13, i18next.t("lobby.attr_self"))
    else {
      if (this._isTournamentMember) markStr += coloredSpan('<i class="fa fa-crosshairs"></i>', 'red', 12, i18next.t("lobby.attr_tournament"))
      if (this._isFavorite) markStr += coloredSpan('<i class="fa fa-star"></i>', 'orange', 12, i18next.t("lobby.attr_favorite"))
      if (this._isCircleMember) markStr += coloredSpan('<i class="fa fa-circle-o"></i>', '#5b1', 12, i18next.t("lobby.attr_club"))
    }
    return markStr
  }

  avatarURL(){
    if (this._countryCode == 1 || this._countryCode == 2) {
      return "http://81dojo.com/dojo/images/avatars/" + (this._countryCode == 1 ? "study_black" : "study_white") + ".jpg"
    } else {
      let titleAvatar = infoFetcher.titleAvatars[this.name.toLowerCase()]
      if (titleAvatar && titleAvatar != "*") return "http://81dojo.com/dojo/images/avatars/" + titleAvatar + ".jpg"
      else return "http://system.81dojo.com/players/" + this.name + "/avatar"
    }
  }

  titleTag(){
    if (infoFetcher.titleNames[this.name.toLowerCase()]) {
      return '<span title="' + infoFetcher.titleNameTips[this.name.toLowerCase()] + '">' + infoFetcher.titleNames[this.name.toLowerCase()] + '</span>'
    } else {
      return ''
    }
  }

  titleName(){
    if (infoFetcher.titleNames[this.name.toLowerCase()]) {
      return infoFetcher.titleNames[this.name.toLowerCase()]
    } else {
      return ''
    }
  }

  mobileIconTag(){
    return this.isMobile ? '<i class="fa fa-mobile fa-2x" style="vertical-align:-3px"></i>' : ''
  }

  isWatchingGame(game){
    return this._monitorGame == game.shortId
  }

  isFromJapan(){
    return this._countryCode == 392
  }

  static rateStrToRate(v){ // Restore rate as integer back from rateStr
    let str = v.toString()
    if (str == "????") return 0
    if (str.match(/^\*(\d+)$/)) str = RegExp.$1
    return parseInt(str)
  }

  set countryCode(v){
    this._countryCode = v
  }

  get country(){
    if (this._countryCode == 1 || this._countryCode == 2) return new Country(this._countryCode, "", "", "")
    else return countries[this._countryCode] || countries[392] // falls back to JPN in case of unexpected error having no country found
  }

  get waitingGameName(){
    return this._waitingGameName
  }

  get waitingTurn(){
    return this._waitingTurn
  }

  get waitingTournamentId(){
    return this._waitingTournamentId
  }

}

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
    this._isSelf = client && name == client.username
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

  prepareForWho3(){
    if (this.inGameRoom()) this.status = 0
    this._monitorGame = "*"
  }

  updateFromWho3(token){
    if (token == "4" || token == "5") {
      this.status = parseInt(token)
    } else {
      this._monitorGame = token
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
		this.status = 4
    this._monitorGame = "*"
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

  waitingPassword(){
    let game_info = this._waitingGameName.match(/^([0-9a-z]+?)_(.*)-([0-9]*)-([0-9]*)$/)
		if (game_info[2].match(/\.([0-9a-z]{6})/)) return RegExp.$1
    else return null
  }

  waitingPasswordMatch(str){
    return CybozuLabs.MD5.calc(config.privateRoomSalt + str).substr(0,6) == this.waitingPassword()
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

  statStr(){
		let str = ""
    if (this.listAsWaiter()) str = coloredSpan(i18next.t("lobby.stat_w"), 'green', 13, i18next.t("lobby.stat_w_tip"))
		if (this._monitorGame != "*") {
		  str += coloredSpan(i18next.t("lobby.stat_m"), null, 13, i18next.t("lobby.stat_m_tip"))
		} else if (this.status == 5) {
		  str = coloredSpan(i18next.t("lobby.stat_p"), null, null, i18next.t("lobby.stat_p_tip"))
		} else if (this.status == 4) {
		  str = coloredSpan(i18next.t("lobby.stat_g"), 'goldenrod', null, i18next.t("lobby.stat_g_tip"))
		}
    return str
  }

  rankStr(){
    return (this.provisional && this.rate < 3000) ? "-" : coloredSpan(makeRankFromRating(this.rate), makeColorFromRating(this.rate))
  }

  statStr(){
		let str = ""
    if (this.listAsWaiter()) str = coloredSpan(i18next.t("lobby.stat_w"), 'green', 13, i18next.t("lobby.stat_w_tip"))
		if (this._monitorGame != "*") {
		  str += coloredSpan(i18next.t("lobby.stat_m"), null, 13, i18next.t("lobby.stat_m_tip"))
		} else if (this.status == 5) {
		  str = coloredSpan(i18next.t("lobby.stat_p"), null, null, i18next.t("lobby.stat_p_tip"))
		} else if (this.status == 4) {
		  str = coloredSpan(i18next.t("lobby.stat_g"), 'goldenrod', null, i18next.t("lobby.stat_g_tip"))
		}
    return str
  }

  nameStr(){
    let nameLimited = '<span style="display:inline-block;max-width:70px;">' + this.name + '</span>'
    return this.generateMark() + (this.idle ? coloredSpan(nameLimited, '#00f') : nameLimited)
  }

  nameSortFunc(){
    if (this.isGuest) return "|" + this.name
    if (this._isSelf) return "!!!!!!!!" + this.name
    let sortHeader = ""
    if (this._isFavorite) sortHeader = "!!!!" + sortHeader
    if (this._isCircleMember) sortHeader = "!!" + sortHeader
    if (this._isTournamentMember) sortHeader = "!" + sortHeader
    return sortHeader + this.name
  }

  countryStr(){
    return this.country.flagImgTag16() + ' ' + this.country.name3Tag()
  }

  rateStr(){
    let str = this.rate
    if (this.provisional) str = "*" + this.rate
    if (this.rate == 0) str = "????"
    return str
  }

  rateSortFunc(){
    return this.rate
  }

  watcherStr(){
    let nameLimited = '<span style="display:inline-block;max-width:70px;">' + this.name + '</span>'
    let hostStr = this.name == hostPlayerName ? coloredSpan('<i class="fa fa-graduation-cap"></i>', '#008', 15, i18next.t("board.attr_host")) : ''
    return hostStr + this.generateMark() + nameLimited
  }

  waiterStr(){
    let nameLimited = '<span style="display:inline-block;max-width:70px;">' + this.name + '</span>'
    return this.country.flagImgTag27() + ' ' + coloredSpan('■', makeColorFromRating(this.rate)) + ' ' + (this.idle ? coloredSpan(nameLimited, '#00f') : nameLimited)
  }

  ruleStr(){
    let str = ""
		if (this.listAsWaiter()) {
      let game_info = this._waitingGameName.match(/^([0-9a-z]+?)_(.*)-([0-9]*)-([0-9]*)$/)
      str = getHandicapShort(game_info[1])
			if (this._waitingTournamentId) {
        if (tournaments[this._waitingTournamentId]){
          str = coloredSpan(tournaments[this._waitingTournamentId].nameShort(), 'crimson', null, tournaments[this._waitingTournamentId].name())
        } else {
          str = coloredSpan(EJ('Tournament', '大会'), 'crimson')
        }
      }
  		if (game_info[2].match(/\.([0-9a-z]{6})/)) str = '<i class="fa fa-lock fa-fw"></i>' + str
		}
    return str
  }

  timeStr(){
    let str = ""
		if (this.listAsWaiter()) {
      let game_info = this._waitingGameName.match(/^([0-9a-z]+?)_(.*)-([0-9]*)-([0-9]*)$/)
			str = (parseInt(game_info[3]) / 60) + "-" + game_info[4]
    }
    return str
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
      return "https://81dojo.com/dojo/images/avatars/" + (this._countryCode == 1 ? "study_black" : "study_white") + ".jpg"
    } else {
      if (infoFetcher.titles[this.name.toLowerCase()]) {
        let avatar = infoFetcher.titles[this.name.toLowerCase()].avatar
        let priority = infoFetcher.titles[this.name.toLowerCase()].priority
        if (avatar == "*") return "https://system.81dojo.com/players/" + this.name + "/avatar"
        else if (parseInt(avatar) > 0) {
          if (priority  >= 0) return "https://system.81dojo.com/titles/" + avatar + "/avatar.jpg"
          else return "https://system.81dojo.com/players/" + this.name + "/avatar"
        }
        else return "https://81dojo.com/dojo/images/avatars/" + avatar + ".jpg"
      } else return "https://system.81dojo.com/players/" + this.name + "/avatar"
    }
  }

  titleTag(){
    if (infoFetcher.titles[this.name.toLowerCase()]) {
      return '<span title="' + infoFetcher.titles[this.name.toLowerCase()].tooltip + '">' + infoFetcher.titles[this.name.toLowerCase()].name + '</span>'
    } else {
      return ''
    }
  }

  titleName(){
    if (infoFetcher.titles[this.name.toLowerCase()]) {
      return infoFetcher.titles[this.name.toLowerCase()].name
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

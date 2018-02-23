"use strict"

class Movement{
  constructor(previousMove = null){
    this.num = previousMove == null ? 0 : (previousMove.num + 1)
    this._accumulatedTime = null
    this.previousMove = previousMove
    this.endTypeKey = null
    this.owner = Position.CONST.SENTE
    this.pieceType = null
    this.fromX = null //human coordinate
    this.fromY = null //human coordinate
    this.toX = null //human coordinate
    this.toY = null //human coordinate
    this.promote = false
    this.promotable = false
    this.capture = false
    this.toSame = false
    this.siblingOrigins = []
    this.time = null
    this.branch = false
  }

  static get CONST(){
    return {
  		RESIGN: 1,
  		TIMEUP: 2,
  		JISHOGI: 3,
  		SENNICHITE: 4,
  		ILLEGAL: 5,
  		OUTE_SENNICHITE: 6,
  		DISCONNECT: 7,
  		CATCH: 8,
  		TRY: 9,
      SUSPEND: 10,
  		LIST_UNIVERSAL: 0, // Chess-style
  		LIST_JAPANESE: 1, // Default in WebSystem options database
  		LIST_1TO1: 4, // Default for English app
      PIECE_NAMES_CSA: ['OU', 'HI', 'KA', 'KI', 'GI', 'KE', 'KY', 'FU', 'OU', 'RY', 'UM', '', 'NG', 'NK', 'NY', 'TO'],
  		koma_japanese_names: ['玉', '飛', '角', '金', '銀', '桂', '香', '歩', '玉', '龍', '馬', '', '成銀', '成桂', '成香', 'と'],
  		rank_japanese_names: ['', '一','二','三','四','五','六','七','八','九'],
  		file_japanese_names: ['', '１', '２', '３', '４', '５', '６', '７', '８', '９'],
  		koma_universal_names: ['Ｋ', 'Ｒ', 'Ｂ', 'Ｇ', 'Ｓ', 'Ｎ', 'Ｌ', 'Ｐ', 'Ｋ', 'Ｄ', 'Ｈ', '', '+S', '+N', '+L', 'Ｔ'],
  		koma_universal_names_condensed: ['K', 'R', 'B', 'G', 'S', 'N', 'L', 'P', 'K', 'D', 'H', '', '+S', '+N', '+L', 'T'],
      special_notations_ja: {
        TIME_UP: '時間切れ',
        DISCONNECT: '接続切れ',
        ILLEGAL_MOVE: '反則手',
        RESIGN: '投了',
        OUTE_SENNICHITE: '反則手',
        SENNICHITE: '千日手',
        JISHOGI: '27点宣言',
        SUSPEND: '中断',
        CATCH: 'キャッチ!',
        TRY: 'トライ!'
      },
      special_notations_en: {
        TIME_UP: 'Time-up',
        DISCONNECT: 'Disconnection',
        ILLEGAL_MOVE: 'Illegal',
        RESIGN: 'Resign',
        OUTE_SENNICHITE: 'Illegal',
        SENNICHITE: 'Repetition',
        JISHOGI: '27-point Rule',
        SUSPEND: 'Suspended',
        CATCH: 'CATCH!',
        TRY: 'TRY!'
      }
    }
  }

  setFromManualMove(owner, sq1, sq2, promote = false){
    this.owner = owner
    this.fromX = sq1.data('x') > 0 ? sq1.data('x') : 0
    this.fromY = sq1.data('x') > 0 ? sq1.data('y') : 0
    if (sq1.data('x') <= 0) this.pieceType = sq1.data('y')
    this.toX = sq2.data('x')
    this.toY = sq2.data('y')
    this.promote = promote
  }

  setFromCSA(csa){
    if (csa == "%TORYO") {

    } else {
      this.owner = csa.substr(0, 1) == "+"
      this.fromX = parseInt(csa.substr(1, 1))
      this.fromY = parseInt(csa.substr(2, 1))
      this.toX = parseInt(csa.substr(3, 1))
      this.toY = parseInt(csa.substr(4, 1))
      // Set pieceType temporarily even if the piece is already promoted (pieceType >= 8)
      this.pieceType = Movement.CONST.PIECE_NAMES_CSA.indexOf(csa.substr(5,2))
      // Set promoted to true temporarily even if the piece is already promoted
      if (this.pieceType >= 8) this.promote = true
    }
  }

  setTime(time, currentBoard){
    this.time = time
    this._accumulatedTime = (currentBoard.accumulatedTimes[this.owner ? 0 : 1] += time)
  }

  setGameEnd(endTypeKey){
    this.endTypeKey = endTypeKey
  }

  toCSA(){
    let str = this.owner ? "+" : "-"
    str += this.fromX.toString() + this.fromY.toString() + this.toX.toString() + this.toY.toString()
    str += Movement.CONST.PIECE_NAMES_CSA[this.pieceType + (this.promote && this.pieceType < 8 ? 8 : 0)]
    return str
  }

  toGameEndMessage(){
    switch (this.endTypeKey) {
      case "TIME_UP":
        return i18next.t("msg.game_end.time_up")
      case "DISCONNECT":
        return i18next.t("msg.game_end.disconnect")
      case "ILLEGAL_MOVE":
        return i18next.t("msg.game_end.illegal")
      case "RESIGN":
        return i18next.t("msg.game_end.resign")
      case "OUTE_SENNICHITE":
        return i18next.t("msg.game_end.perpetual")
      case "SENNICHITE":
        return i18next.t("msg.game_end.repetition")
      case "JISHOGI":
        return i18next.t("msg.game_end.jishogi")
      case "CATCH":
        return EJ("CATCH!", "キャッチ!")
      case "TRY":
        return EJ("REACH!", "トライ!")
      case "SUSPEND":
        return i18next.t("msg.game_end.suspend")
    }
  }

  toJapaneseNotation(specialPurpose = null){
    // 1: for KIF file, 2: for Kifu Note
		let alphabet = !specialPurpose && options.notation_style == Movement.CONST.LIST_1TO1
    let str
		if (this.toX == this.previousMove.toX && this.toY == this.previousMove.toY) {
			str = alphabet ? "x " : "同　";
		} else {
			str = Movement.CONST.file_japanese_names[this.toX]
			str += (specialPurpose == 2 || alphabet) ? Movement.CONST.file_japanese_names[this.toY] : Movement.CONST.rank_japanese_names[this.toY]
		}
		str += alphabet ? Movement.CONST.koma_universal_names[this.pieceType] : Movement.CONST.koma_japanese_names[this.pieceType]
		if (this.fromX == 0 && this.fromY == 0) {
			if (this.siblingOrigins.length > 0 || specialPurpose == 1) str += alphabet ? "*" : "打"
		} else {
			if (this.siblingOrigins.length > 0 && specialPurpose != 1) {
				if (alphabet) str += "(" + this.fromX.toString() + this.fromY.toString() + ")"
        else str += this._japaneseIdentifier()
			}
			if (this.promote) {
				str += alphabet ? "+" : "成"
			} else if (specialPurpose != 1 && this.promotable){
				str += alphabet ? "=" : "不成"
			}
			if (specialPurpose == 1) {
				str += "(" + this.fromX.toString() + this.fromY.toString() + ")"
			}
		}
    if (!specialPurpose) str = (this.owner == Position.CONST.SENTE ? "☗" : "☖") + str
    return str
  }

	toChessNotation() {
		let str = Movement.CONST.koma_universal_names_condensed[this.pieceType]
		if (this.fromX == 0 && this.fromY == 0) {
			str += "*"
		} else {
  		if (this.siblingOrigins.length > 0) {
				str += "(" + this.fromX.toString() + this.fromY.toString() + ")"
  		}
  		str += this.capture ? "x" : "-"
    }
    str += this.toX.toString() + this.toY.toString()
		if (this.promote) {
			str += "+"
		} else if (this.promotable) {
      str += "="
		}
    return (this.owner == Position.CONST.SENTE ? "☗" : "☖") + str
	}

  _japaneseIdentifier(){
    if (this.siblingOrigins.length == 0) return ''
    let vx = (this.owner == Position.CONST.SENTE ? 1 : -1) * (this.toX - this.fromX)
    let vy = (this.owner == Position.CONST.SENTE ? 1 : -1) * (this.toY - this.fromY)
    let selfCandidates = this._identifierCandidates(vx, vy, true)
    let otherCandidates = []
    this.siblingOrigins.forEach(function(origin){
      vx = (this.owner == Position.CONST.SENTE ? 1 : -1) * (this.toX - origin[0])
      vy = (this.owner == Position.CONST.SENTE ? 1 : -1) * (this.toY - origin[1])
      otherCandidates = otherCandidates.concat(this._identifierCandidates(vx, vy))
    }, this)
    for (let i = 0; i < selfCandidates.length; i++){
      if (!otherCandidates.includes(selfCandidates[i])) return selfCandidates[i]
    }
    return ''
  }

  _identifierCandidates(vx, vy, self = false){
    //integer, integer (vector from -> to, direction normalized)
    let candidates = []
    if (vy == 0) { // to the sides
      candidates.push('寄')
      candidates.push(vx > 0 ? '右' : '左')
      if (self) candidates.push(vx > 0 ? '右寄' : '左寄')
    } else if (vx == 0) {
      if (vy < 0) { // straight forward
        candidates.push('上')
        if (self && [3,4,12,13,14,15].includes(this.pieceType)) candidates.push('直')
      } else { // straight backward
        candidates.push('引')
      }
      if (self && [9, 10].includes(this.pieceType)) {
        candidates.push('右')
        candidates.push('左')
      }
    } else if (vy < 0) { // diagonally forward
      candidates.push('上')
      candidates.push(vx > 0 ? '右' : '左')
      if (self) candidates.push(vx > 0 ? '右上' : '左上')
    } else { // diagonally backward
      candidates.push('引')
      candidates.push(vx > 0 ? '右' : '左')
      if (self) candidates.push(vx > 0 ? '右引' : '左引')
    }
    return candidates
  }

  toKIF(){
    let str = ""
    if (this.num == 0) return null
    if (this.endTypeKey) {
      if (this.endTypeKey == "RESIGN") str = "投了"
      else return null
    } else {
      str = this.toJapaneseNotation(1)
    }
    str = this.num.toString() + "   " + str
    if (this.time != null) str = str + "   (" + Math.floor(this.time/60) + ":" + (this.time % 60) + "/)"
    return str
  }

  toKifuNote(){
    if (this.num == 0 || this.endTypeKey) return ","
    let str = this.toJapaneseNotation(2) + ","
    if (this.time != null) str += sec2minsec(this.time)
    if (this._accumulatedTime != null) str+= "/<br>" + sec2minsec(this._accumulatedTime)
    return str
  }

  replayable(){
    return this.num != 0 && this.endTypeKey == null
  }

  get numStr(){
    return (this.branch ? "*" : "") + this.num.toString()
  }

  get moveStr(){
    if (this.num == 0) {
      return options.notation_style == Movement.CONST.LIST_JAPANESE ? '開始' : 'Start'
    } else if (this.endTypeKey) {
      return options.notation_style == Movement.CONST.LIST_JAPANESE ? Movement.CONST.special_notations_ja[this.endTypeKey] : Movement.CONST.special_notations_en[this.endTypeKey]
    } else {
      return options.notation_style == Movement.CONST.LIST_UNIVERSAL ? this.toChessNotation() : this.toJapaneseNotation()
    }
  }

  get timeStr(){
    if (this.time == null) {
      return ""
    } else {
      let time = options.show_accumulated_time == 1 ? (this._accumulatedTime || this.time) : this.time
      return sec2minsec(time)
    }
  }

}

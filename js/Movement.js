"use strict"

class Movement{
  constructor(previousMove = null){
    this.num = previousMove == null ? 0 : (previousMove.num + 1)
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
    this.additionalIdentifier = false
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
  		LIST_UNIVERSAL: 0,
  		LIST_JAPANESE: 1, // Default in WebSystem options database
  		LIST_WESTERN: 2,
  		LIST_1TO1: 4, // Default for English app
  		koma_japanese_names: ['玉', '飛', '角', '金', '銀', '桂', '香', '歩', '玉', '龍', '馬', '', '成銀', '成桂', '成香', 'と'],
  		rank_japanese_names: ['', '一','二','三','四','五','六','七','八','九'],
  		file_japanese_names: ['', '１', '２', '３', '４', '５', '６', '７', '８', '９'],
  		koma_universal_names: ['Ｋ', 'Ｒ', 'Ｂ', 'Ｇ', 'Ｓ', 'Ｎ', 'Ｌ', 'Ｐ', '', 'Ｄ', 'Ｈ', '', '+S', '+N', '+L', 'Ｔ'],
      special_notations_ja: {
        TIME_UP: '時間切れ',
        DISCONNECT: '接続切れ',
        ILLEGAL_MOVE: '反則手',
        RESIGN: '投了',
        OUTE_SENNICHITE: '反則手',
        SENNICHITE: '千日手',
        JISHOGI: '27点宣言',
        CATCH: 'キャッチ!',
        TRY: 'トライ!'
      }
    }
  }

  static get PIECE_NAMES_CSA(){
    return ['OU', 'HI', 'KA', 'KI', 'GI', 'KE', 'KY', 'FU', 'OU', 'RY', 'UM', '', 'NG', 'NK', 'NY', 'TO']
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
      this.pieceType = Movement.PIECE_NAMES_CSA.indexOf(csa.substr(5,2))
      // Set promoted to true temporarily even if the piece is already promoted
      if (this.pieceType >= 8) this.promote = true
    }
  }

  setGameEnd(endTypeKey){
    this.endTypeKey = endTypeKey
  }

  toCSA(){
    let str = this.owner ? "+" : "-"
    str += this.fromX.toString() + this.fromY.toString() + this.toX.toString() + this.toY.toString()
    str += Movement.PIECE_NAMES_CSA[this.pieceType + (this.promote && this.pieceType < 8 ? 8 : 0)]
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
    }
  }

  toJapaneseNotation(forFile = false){
		let alphabet = !forFile && options.notation == Movement.CONST.LIST_1TO1
    let str
		if (this.toX == this.previousMove.toX && this.toY == this.previousMove.toY) {
			str = alphabet ? "x " : "同　";
		} else {
			str = Movement.CONST.file_japanese_names[this.toX]
			str += alphabet ? Movement.CONST.file_japanese_names[this.toY] : Movement.CONST.rank_japanese_names[this.toY]
		}
		str += alphabet ? Movement.CONST.koma_universal_names[this.pieceType] : Movement.CONST.koma_japanese_names[this.pieceType]
		if (this.fromX == 0 && this.fromY == 0) {
			if (this.additionalIdentifier || forFile) str += alphabet ? "*" : "打"
		} else {
			if (this.additionalIdentifier && !forFile) {
				str += "(" + Movement.CONST.file_rank_numbers[this.fromX] + Movement.CONST.file_rank_numbers[this.fromY] + ")"
			}
			if (this.promote) {
				str += alphabet ? "+" : "成"
			} else if (!forFile && this.promotable){
				str += alphabet ? "=" : "不成"
			}
		}
	  return (this.owner == Position.CONST.SENTE ? "☗" : "☖") + str
  }

  replayable(){
    return this.num != 0 && this.endTypeKey == null
  }

  get numStr(){
    return (this.branch ? "*" : "") + this.num.toString()
  }

  get moveStr(){
    if (this.num == 0) {
      return EJ('Start', '開始')
    } else if (this.endTypeKey) {
      return Movement.CONST.special_notations_ja[this.endTypeKey]
    } else {
      return this.toJapaneseNotation()
    }
  }

  get timeStr(){
    if (this.time == null) {
      return ""
    } else {
      return this.time.toString()
    }
  }

}

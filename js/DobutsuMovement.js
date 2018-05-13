"use strict"

class DobutsuMovement extends Movement{
  static get CONST(){
    return {
  		RESIGN: 1,
  		TIMEUP: 2,
  		SENNICHITE: 4,
  		ILLEGAL: 5,
  		DISCONNECT: 7,
  		CATCH: 8,
  		TRY: 9,
      SUSPEND: 10,
  		LIST_UNIVERSAL: 0, // Chess-style
  		LIST_JAPANESE: 1, // Default in WebSystem options database
  		LIST_1TO1: 4, // Default for English app
      PIECE_NAMES_CSA: ['OU', 'ZG', 'ZE', '', '', '', '', 'ZC', 'OU', '', '', '', '', '', '', 'TO'],
  		koma_japanese_names: ['ライオン', 'きりん', 'ぞう', '', '', '', '', 'ひよこ', 'ライオン', '', '', '', '', '', '', 'にわとり'],
  		rank_japanese_names: ['', '１','２','３','４','','','','',''],
  		file_japanese_names: ['', '１', '２', '３', '４', '', '', 'Ｃ', 'Ｂ', 'Ａ'],
  		koma_universal_names: ['Ｌ', 'Ｇ', 'Ｅ', '', '', '', '', 'Ｃ', 'Ｌ', '', '', '', '', '', '', 'Ｈ'],
  		koma_universal_names_condensed: ['L', 'G', 'E', '', '', '', '', 'C', 'L', '', '', '', '', '', '', 'H'],
      special_notations_ja: {
        TIME_UP: '時間切れ',
        DISCONNECT: '接続切れ',
        ILLEGAL_MOVE: '反則手',
        RESIGN: '投了',
        SENNICHITE: '千日手',
        SUSPEND: '中断',
        CATCH: 'キャッチ!',
        TRY: 'トライ!'
      },
      special_notations_en: {
        TIME_UP: 'Time-up',
        DISCONNECT: 'Disconnection',
        ILLEGAL_MOVE: 'Illegal',
        RESIGN: 'Resign',
        SENNICHITE: 'Repetition',
        SUSPEND: 'Suspended',
        CATCH: 'CATCH!',
        TRY: 'TRY!'
      }
    }
  }

  toGameEndMessage(){
    switch (this.endTypeKey) {
      case "CATCH":
        return EJ("CATCH!", "キャッチ!")
      case "TRY":
        return EJ("REACH!", "トライ!")
    }
    return super.toGameEndMessage()
  }

}

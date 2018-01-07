"use strict";

function caesar(val, key) {
  val = encodeURIComponent(val);
  var result = "";
  for (var i = 0; i < val.length; i++) {
    result += String.fromCharCode(val.charCodeAt(i) + key);
  }
  return result;
}

function decaesar(val, key) {
  var result = "";
  for (var i = 0; i < val.length; i++) {
    result += String.fromCharCode(val.charCodeAt(i) - key);
  }
  return decodeURIComponent(result) ;
}

function makePremiumNum(mile, default_class){
  let prem = 0;
  if (default_class.match(/[D4]/)) prem = 4; //Diamond
  else if (default_class.match(/[G3]/)) prem = 3; //Gold
  else if (default_class.match(/[S2]/)) prem = 2; //Silver
  else if (default_class.match(/[B1]/)) prem = 1; //Bronze
  if (mile >= 15000) prem = Math.max(prem, 3);
  else if (mile >= 7500) prem = Math.max(prem, 2);
  else if (mile >= 1500) prem = Math.max(prem, 1);
  return prem;
}

function makePremiumName(num){
  if (i18next.language == "ja") return ["レギュラー", "ブロンズ", "シルバー", "ゴールド", "ダイヤモンド"][num]
  else return ["Regular", "Bronze", "Silver", "Gold", "Diamond"][num]
}

function EJ(str_en, str_ja){
  if (i18next.language == "ja") return str_ja
  else return str_en
}

const RANK_NAMES_JA = ['プロ', '七段',
	'六段', '五段', '四段', '三段', '二段', '初段',
	'1級', '2級', '3級', '4級', '5級',
	'6級', '7級', '8級', '9級', '10級',
	'11級', '12級', '13級', '14級', '15級', '-']
const RANK_NAMES_EN = ['PRO', '7-Dan',
	'6-Dan', '5-Dan', '4-Dan', '3-Dan', '2-Dan', '1-Dan',
	'1-kyu', '2-kyu', '3-kyu', '4-kyu', '5-kyu',
	'6-kyu', '7-kyu', '8-kyu', '9-kyu', '10-kyu',
	'11-kyu', '12-kyu', '13-kyu', '14-kyu', '15-kyu', '-']
const RANK_THRESHOLDS = [3500, 2300,
	2150, 2000, 1875, 1750, 1625, 1500,
	1425, 1350, 1300, 1250, 1200,
	1150, 1100, 1050, 1000, 900,
	800, 700, 600, 500, 1, 0]
function makeRankFromRating(v){
	for (let i = 0; i < RANK_THRESHOLDS.length; i++) {
		if (v >= RANK_THRESHOLDS[i]) return EJ(RANK_NAMES_EN[i], RANK_NAMES_JA[i])
	}
	return ""
}

function makeColorFromRating(v){
	if (v >= RANK_THRESHOLDS[1]) {
		return "#000"
	} else if (v >= RANK_THRESHOLDS[3]) {
		return "#f00"
	} else if (v >= RANK_THRESHOLDS[5]) {
		return "#e80"
	} else if (v >= RANK_THRESHOLDS[7]) {
		return "#009300"
	} else if (v >= RANK_THRESHOLDS[10]) {
		return "#16f"
	} else if (v >= RANK_THRESHOLDS[13]) {
		return "#a5f"
	} else {
		return "#777"
	}
}

function isBeforeUpgrade(rate) {
	for (let i = 1; i <= 21; i++) {
		if (rate == RANK_THRESHOLDS[i] - 1) return true
		else if (rate >= RANK_THRESHOLDS[i]) return false
	}
	return false
}

function isBeforeDowngrade(rate) {
	for (let i = 1; i <= 21; i++) {
		if (rate > RANK_THRESHOLDS[i]) return false
		else if (rate == RANK_THRESHOLDS[i]) return true
	}
	return false
}

const HANDICAPS_JA = {
	r: "平手(レート)",
	nr: "平手(非レート)",
	hcfixed: "定先",
	hclance: "香落ち",
	hcbishop: "角落ち",
	hcrook: "飛車落ち",
	hcrooklance: "飛香落ち",
	hcrooksilver: "飛銀落ち",
	hc2p: "二枚落ち",
	hc4p: "四枚落ち",
	hc6p: "六枚落ち",
	hc8p: "八枚落ち",
	hctombonl: "トンボ＋桂香",
	hctombol: "トンボ＋香",
	hctombo: "トンボ",
	hc10p: "十枚落ち",
	hcfu3: "歩三兵",
	hcnaked: "裸玉",
	vaoa: "青空将棋",
	vamini: "五々将棋",
	va5656: "ゴロゴロ将棋",
	vajudkins: "ジャドケンス将棋",
	vakyoto: "京都将棋",
	vazoo: "どうぶつしょうぎ",
	va33: "９マス将棋",
	hcpawnrd: "右端歩得",
	hcpawnld: "左端歩得",
	hcpawn2d: "両端歩得",
	hclanced: "香得",
	hcbishopd: "角得",
	hcrookd: "飛車得",
	hcrooklanced: "飛香得",
	hc2pd: "二枚得",
	hc4pd: "四枚得",
	hc6pd: "六枚得",
	hc8pd: "八枚得"
	}
const HANDICAPS_EN = {
	r: "Even (R)",
	nr: "Even (NR)",
	hcfixed: "Fixed-black",
	hclance: "Lance Down",
	hcbishop: "Bishop Down",
	hcrook: "Rook Down",
	hcrooklance: "1.5p Down",
	hcrooksilver: "1.75p Down",
	hc2p: "2p Down",
	hc4p: "4p Down",
	hc6p: "6p Down",
	hc8p: "8p Down",
	hctombonl: "Dragonfly+NL",
	hctombol: "Dragonfly+L",
	hctombo: "Dragonfly",
	hc10p: "10p Down",
	hcfu3: "Three Pawns",
	hcnaked: "Naked King",
	vaoa: "Open-air",
	vamini: "Mini Shogi",
	va5656: "Goro-Goro",
	vajudkins: "Judkins",
	vakyoto: "Kyoto Shogi",
	vazoo: "Dobutsu",
	va33: "9-square",
	hcpawnrd: "R-Pawn Gained",
	hcpawnld: "L-Pawn Gained",
	hcpawn2d: "2-Pawns Gained",
	hclanced: "Lance Gained",
	hcbishopd: "Bishop Gained",
	hcrookd: "Rook Gained",
	hcrooklanced: "1.5p Gained",
	hc2pd: "2p Gained",
	hc4pd: "4p Gained",
	hc6pd: "6p Gained",
	hc8pd: "8p Gained"
}
function getHandicapShort(key){
  return EJ(HANDICAPS_EN[key], HANDICAPS_JA[key])
}

function coloredSpan(text, color = null, width = null, title = null){
  //string(css color), integer, string
  let str = '<span style="'
  if (color) str += 'color:' + color + ';'
  if (width) str += 'display:inline-block;text-align:center;width:' + width + 'px;'
  str += '"'
  if (title) str += ' title="' + title + '"'
  str += '>' + text + '</span>'
  return str
}

function scrollGridToSelected(grid){
  if (grid.row('.selected').node()) {
    let scrollBody = $(grid.table().container()).find('.dataTables_scrollBody')
    scrollBody.scrollTop(grid.row('.selected').node().offsetTop - scrollBody.height() * 0.5)
  }
}

function drawGridMaintainScroll(grid){
  let scrollBody = $(grid.table().container()).find('.dataTables_scrollBody')
  let scrollPos = scrollBody.scrollTop()
  grid.draw()
  scrollBody.scrollTop(scrollPos)
}

const SWINGING_FILE_NAME_JA = {
  "2": "向かい飛車",
  "3": "三間飛車",
  "4": "四間飛車",
  "5": "中飛車"
}
const SWINGING_FILE_NAME_EN = {
  "2": "Opposing Rook",
  "3": "3rd-file Rook",
  "4": "4th-file Rook",
  "5": "Central Rook"
}
const OPENING_NAME_JA = {
	"*": "",
  "unknown": "力戦",
	"side_pawn": "横歩取り",
	"double_wing": "相掛かり",
	"bishop_exchange": "角換り",
	"yagura": "矢倉",
	"double_ranging": "相振り"
}
const OPENING_NAME_EN = {
	"*": "",
  "unknown": "Free-style",
	"side_pawn": "Side Pawn Picker",
	"double_wing": "Aigakari(Double Wing Attack)",
	"bishop_exchange": "Bishop Exchange",
	"yagura": "Yagura",
	"double_ranging": "Double Swinging Rook"
}
function openingTypeObject(key){
  let short = ""
  let tip = ""
  if (key.match(/opposition_(black|white)[01]/)) key = "unknown" // Countermeasure to shogi-server bug
  if (key.match(/^(hc|va)/)) {  // key is gameType code for handicaps or variants
    switch (key) {
  		case "hctombonl":
  			short = "トンボ桂"; break;
  		case "hctombol":
  			short = "トンボ香"; break;
  		case "va5656":
  			short = "ゴロゴロ"; break;
  		case "vajudkins":
  			short = "六々将棋"; break;
  		case "vazoo":
  			short = "どうぶつ"; break;
  		case "va33":
  			short = "９マス"; break;
      default:
        short = HANDICAPS_JA[key]
    }
    tip = i18next.language == "ja" ? HANDICAPS_JA[key] : HANDICAPS_EN[key]
  } else if (key.match(/opposition_(black|white)(\d)/)) {  // key is opening type, and it is swinging rook
    short = "対抗" + (RegExp.$1 == "black" ? "☗" : "☖") + SWINGING_FILE_NAME_JA[RegExp.$2][0]
    if (i18next.language == "ja") {
      tip = "対抗形 " + (RegExp.$1 == "black" ? "☗" : "☖") + SWINGING_FILE_NAME_JA[RegExp.$2]
    } else {
      tip = "Opposition, " + (RegExp.$1 == "black" ? "Black's " : "White's ") + SWINGING_FILE_NAME_EN[RegExp.$2]
    }
	} else { // key is other opening types
    short = OPENING_NAME_JA[key]
    if (i18next.language == "ja") {
      tip = key == "double_ranging" ? (short + "飛車") : short
    } else {
      tip = OPENING_NAME_EN[key]
    }
	}
  return {short: short, tip: tip}
}

function gameTypeToKIF(str){
  if (["r", "nr", "hcfixed", "hclance", "hcbishop", "hcrook", "hcrooklance", "hc2p", "hc4p", "hc6p", "hc8p", "hc10p"].includes(str)) {
    if (str == "r" || str == "nr" || str == "hcfixed") return "平手"
    else return HANDICAPS_JA[str]

  } else {
    return null
  }
}

function debugLoop(){
  window.addEventListener('devtoolschange', function(){while(true) debugger})
}

function restoreIdleConnections(n){
  return n > 30 ? Math.floor(n * 1.07) : n
}

function intToColorStyle(v) {
  return '#' + (('000000' + v.toString(16).toUpperCase()).substr(-6))
}

function playingStyleName(i) {
  if (i18next.language == "ja") {
    return ['棋風 未登録', '居飛車党', '純粋居飛車党', '振り飛車党', '純粋振り飛車党', 'オールラウンダー', '真正オールラウンダー', '対抗形志向', '対抗形マニア', '力戦派', '矢倉マニア', '角換りマニア', '横歩取りマニア', '三間飛車党', '三間飛車マニア', '四間飛車党', '四間飛車マニア', '中飛車党', '中飛車マニア'][i]
  } else {
    return ['Playing style unknown', 'Static Rook Player', 'Pure Static Rook Player', 'Swinging Rook Player', 'Pure Swinging Rook Player', 'All-rounder', 'Genuine All-rounder', 'Opposition Seeker', 'Opposition Enthusiast', 'Free-style Player', 'Yagura Enthusiast', 'Bishop Exchange Enthusiast', 'Side Pawn Picker Enthusiast', '3rd-file Rook Player', '3rd-file Rook Enthusiast', '4th-file Rook Player', '4th-file Rook Enthusiast', 'Central Rook Player', 'Central Rook Enthusiast'][i]
  }
}

function showAlertDialog(i18nextCode, handler = function(){}){
  //string, string, function
  let alertWindow = $('<div></div>', {class: 'alert-dialog'}).html('<div style="padding:10px">'+ i18next.t("alert." + i18nextCode) + '</div>').appendTo($('body'))
  alertWindow.dialog({
    modal: true,
    dialogClass: 'no-close',
    close: function(e){$(this).dialog('destroy').remove()},
    title: i18next.t("alert." + i18nextCode + "_title"),
    buttons: [{text: "OK", click: function(){$(this).dialog("close");handler()}}]
  })
}

function shareKifu(mode){
	let str = ""
  let url = ""
	let opening = openingTypeObject(board.game.hasNoOpeningTypes() ? board.game.gameType : board.game.opening).tip
	let black = board.game.black
	let white = board.game.white
  /*
    //TODO Load opening name from the game list when isPlayer()
    //Must automatically refresh lobby from time to time
    //gameGrid.rows().data().forEach
		for each (var game:Object in _game_list) {
			if (game.id == _game_name) {
				opening = game.openingTip;
				break;
			}
		}
  */
	if (mode == "FB") {
		url = "http://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(board.toKifuURL(true))
	} else if (mode == "TW") {
		if (i18next.language == "ja") {
			str = "81道場 対局譜: "
			if (opening != "") str += " 【" + opening.replace(/☗/,"▲").replace(/☖/,"△") + "】 "
			str += "▲" + black.name + " (" + black.country.name_ja + ", " + makeRankFromRating(black.rate) + ") 対 "
			str += "△" + white.name + " (" + white.country.name_ja + ", " + makeRankFromRating(white.rate) +")"
			str += " #81dojo #shogi"
		} else {
			str = "81Dojo Kifu: [";
			str += black.name + "(" + black.country.name3 + ", " + makeRankFromRating(black.rate) + ") vs "
			str += white.name + "(" + white.country.name3 + ", " + makeRankFromRating(white.rate) + ")]"
			if (opening != "") str += ", " + opening
			str += ". #81dojo"
		}
		url = "http://twitter.com/share?text=" + encodeURIComponent(str) + "&url=" + encodeURIComponent(board.toKifuURL(true))
	}
  window.open(url, "_blank")
	//TODO _handleSNSClick(mode)
}

function sharePosition(mode) {
  let row = kifuGrid.row({selected: true})
  let black = board.game.black.name
  let white = board.game.white.name
	let url = "http://sfenreader.appspot.com/twiimg?sfen=" + board.position.toSFEN(true) + "%20" + row.index()
	url += "&lm=" + (row.data().toX == null ?  "" : (row.data().toX.toString() + row.data().toY.toString()))
	url += "&sname=" + black + "&gname=" + white
	url += EJ("&title=from_81Dojo", "&title=81道場・局面図")

  let str
	if (mode == "FB") {
		str = "http://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url)
	} else if (mode == "TW") {
		if (i18next.language == "ja") {
			str = "81道場 局面図: ▲" + black + " 対 △" + white
			str += " #81dojo #shogi (powered by @shibacho2)"
		} else {
			str = "81Dojo Diagram: [" + black + " vs " + white + "]"
			str += " %2381dojo (powered by @shibacho2)";
		}
		str = "http://twitter.com/share?text=" + encodeURIComponent(str) + "&url=" + encodeURIComponent(url)
	}
  window.open(str, "_blank")
	//TODO _handleSNSClick(mode)
}

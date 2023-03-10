"use strict";

function EJ(str_en, str_ja){
  if (i18next.language == "ja" || i18next.language == "zh_tw" ) return str_ja
  else return str_en
}

const RANK_NAMES_JA = ['プロ', '七段',
	'六段', '五段', '四段', '三段', '二段', '初段',
	'1級', '2級', '3級', '4級', '5級',
	'6級', '7級', '8級', '9級', '10級',
	'11級', '12級', '13級', '14級', '15級', '']
const RANK_NAMES_EN = ['PRO', '7-Dan',
	'6-Dan', '5-Dan', '4-Dan', '3-Dan', '2-Dan', '1-Dan',
	'1-kyu', '2-kyu', '3-kyu', '4-kyu', '5-kyu',
	'6-kyu', '7-kyu', '8-kyu', '9-kyu', '10-kyu',
	'11-kyu', '12-kyu', '13-kyu', '14-kyu', '15-kyu', '']
const RANK_THRESHOLDS = [3500, 2300,
	2200, 2100, 1950, 1800, 1650, 1500,
	1425, 1350, 1300, 1250, 1200,
	1150, 1100, 1050, 1000, 900,
	800, 700, 600, 500, 1, 0]
const RANK_NAMES34 = ['GOD', 'KING', 'MINISTER', 'SENATOR', 'SAGE', 'MASTER', 'PROFESSOR', 'DOCTOR', 'TEACHER', 'STUDENT', 'KID', 'INFANT', 'BABY', 'EGG']
const RANK_THRESHOLDS34 = [15000, 10000, 7000, 5000, 3000, 2000, 1000, 500, 200, 100, 50, 20, 5, 0]
function makeRankFromRating(v, forceJapanese = false){
	for (let i = 0; i < RANK_THRESHOLDS.length; i++) {
		if (v >= RANK_THRESHOLDS[i]) return (forceJapanese || i18next.language == "ja" || i18next.language == "zh_tw") ? RANK_NAMES_JA[i] : RANK_NAMES_EN[i]
	}
	return ""
}
function makeRank34FromExp(v){
	for (let i = 0; i < RANK_THRESHOLDS34.length; i++) {
		if (v >= RANK_THRESHOLDS34[i]) return RANK_NAMES34[i]
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
	nr: "平手(練習)",
	hcfixed: "定先",
	hclance: "香落ち",
	hcbishop: "角落ち",
	hcrook: "飛車落ち",
	hcrooklance: "飛香落ち",
	hcrooksilver: "飛銀落ち",
	hc2p: "二枚落ち",
	hc3p: "三枚落ち",
	hc4p: "四枚落ち",
	hcl5p: "左五枚落ち",
	hcr5p: "右五枚落ち",
	hc6p: "六枚落ち",
	hcl7p: "左七枚落ち",
	hcr7p: "右七枚落ち",
	hc8p: "八枚落ち",
	hcl9p: "左九枚落ち",
	hcr9p: "右九枚落ち",
	hc10p: "十枚落ち",
	hctombonl: "トンボ＋桂香",
	hctombol: "トンボ＋香",
	hctombo: "トンボ",
	hcfu3: "歩三兵",
	hcnaked: "裸玉",
	hclanced: "香得",
	hcbishopd: "角得",
	hcrookd: "飛車得",
	hcrooklanced: "飛香得",
	hc2pd: "二枚得",
	hc4pd: "四枚得",
	hc6pd: "六枚得",
	hc8pd: "八枚得",
	vaoa: "青空将棋",
	vamini: "五々将棋",
	va5656: "ゴロゴロ将棋",
	vajudkins: "ジャドケンス将棋",
	vakyoto: "京都将棋",
	vazoo: "どうぶつしょうぎ",
	va33: "９マス将棋"
	}
const HANDICAPS_EN = {
	r: "Even (Rated)",
	nr: "Even (Practice)",
	hcfixed: "Fixed-black",
	hclance: "Lance Down",
	hcbishop: "Bishop Down",
	hcrook: "Rook Down",
	hcrooklance: "1.5p Down",
	hcrooksilver: "1.75p Down",
	hc2p: "2p Down",
  	hc3p: "3p Down",
	hc4p: "4p Down",
	hcl5p: "Left-5p Down",
	hcr5p: "Right-5p Down",
	hc6p: "6p Down",
	hcl7p: "Left-7p Down",
	hcr7p: "Right-7p Down",
	hc8p: "8p Down",
	hcl9p: "Left-9p Down",
	hcr9p: "Right-9p Down",
	hc10p: "10p Down",
	hctombonl: "Dragonfly+NL",
	hctombol: "Dragonfly+L",
	hctombo: "Dragonfly",
	hcfu3: "Three Pawns",
	hcnaked: "Naked King",
	hclanced: "Lance Gained",
	hcbishopd: "Bishop Gained",
	hcrookd: "Rook Gained",
	hcrooklanced: "1.5p Gained",
	hc2pd: "2p Gained",
	hc4pd: "4p Gained",
	hc6pd: "6p Gained",
	hc8pd: "8p Gained",
	vaoa: "Open-air",
	vamini: "Mini Shogi",
	va5656: "Goro-Goro",
	vajudkins: "Judkins",
	vakyoto: "Kyoto Shogi",
	vazoo: "Dobutsu",
	va33: "9-square"
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
  let selectedNode = grid.row('.selected').node()
  if (selectedNode) {
    if (grid.page.info().length > 0) {  // If the grid is using pagination
      let i = grid.rows({order:'applied'}).nodes().indexOf(selectedNode)
      if (i >= 0) {
        let page = Math.floor( i / grid.page.info().length )
        grid.page(page).draw(false)
      }
    }
    let scrollBody = $(grid.table().container()).find('.dataTables_scrollBody')
    scrollBody.scrollTop(grid.row('.selected').node().offsetTop - scrollBody.height() * 0.5)
  }
}

function drawGridMaintainScroll(grid){
  let scrollBody = $(grid.table().container()).find('.dataTables_scrollBody')
  let scrollPos = scrollBody.scrollTop()
  grid.draw(false)
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
function openingTypeObject(key, forceJapanese = false){
  let short = ""
  let tip = ""
  if (key.match(/opposition_(black|white)[01]/)) key = "unknown" // Countermeasure to shogi-server bug
  if (key.match(/^(hc|va)/)) {  // key is gameType code for handicaps or variants
    switch (key) {
  		case "hctombonl":
  			short = "トンボ桂"; break;
  		case "hctombol":
  			short = "トンボ香"; break;
  		case "vajudkins":
  			short = "六々将棋"; break;
  		case "va33":
  			short = "９マス"; break;
      default:
        short = HANDICAPS_JA[key]
        if (short.length > 4) short = short.slice(0, 4)
    }
    tip = (forceJapanese || i18next.language == "ja") ? HANDICAPS_JA[key] : HANDICAPS_EN[key]
  } else if (key.match(/opposition_(black|white)(\d)/)) {  // key is opening type, and it is swinging rook
    short = "対抗" + (RegExp.$1 == "black" ? "☗" : "☖") + SWINGING_FILE_NAME_JA[RegExp.$2][0]
    if (forceJapanese || i18next.language == "ja") {
      tip = "対抗形 " + (RegExp.$1 == "black" ? "☗" : "☖") + SWINGING_FILE_NAME_JA[RegExp.$2]
    } else {
      tip = "Opposition, " + (RegExp.$1 == "black" ? "Black's " : "White's ") + SWINGING_FILE_NAME_EN[RegExp.$2]
    }
	} else { // key is other opening types
    short = OPENING_NAME_JA[key]
    if (forceJapanese || i18next.language == "ja") {
      tip = key == "double_ranging" ? (short + "飛車") : short
    } else {
      tip = OPENING_NAME_EN[key]
    }
	}
  if (short == undefined) short = EJ('SPECIAL', '特殊手合')
  return {short: short, tip: tip}
}

function gameTypeToKIF(str){
  if (str.match(/^va/) || ['hclanced', 'hcbishopd', 'hcrookd', 'hcrooklanced', 'hc4pd', 'hc6pd', 'hc8pd'].includes(str)) return null
  else if (str == "r" || str == "nr" || str == "hcfixed") return "平手"
  else return HANDICAPS_JA[str]
}

function pushInitialPositionLines(lines, gameType){
  if (gameType == 'hcfu3') lines.push('上手の持駒：歩三')

  switch (gameType){
    //case 'hcbishopd': case 'hcrookd': case 'hc2pd': case 'vaoa': lines.push('|v香v桂v銀v金v玉v金v銀v桂v香|'); break;  // komadoku handicaps and variants(va) are omitted
    //case 'hclanced': case 'hcrooklanced': lines.push('|v香v桂v銀v金v玉v金v銀v桂 ・|'); break;
    case 'hcrooksilver': lines.push('|v香v桂v銀v金v玉v金 ・v桂v香|'); break;
    case 'hc3p': lines.push('|v香v桂v銀v金v玉v金v銀v桂 ・|'); break;
    //case 'hc4pd': lines.push('| ・v桂v銀v金v玉v金v銀v桂 ・|'); break;
    case 'hcr5p': lines.push('| ・ ・v銀v金v玉v金v銀v桂 ・|'); break;
    case 'hcl5p': lines.push('| ・v桂v銀v金v玉v金v銀 ・ ・|'); break;
    //case 'hc6pd': lines.push('| ・ ・v銀v金v玉v金v銀 ・ ・|'); break;
    case 'hcr7p': lines.push('| ・ ・ ・v金v玉v金v銀 ・ ・|'); break;
    case 'hcl7p': lines.push('| ・ ・v銀v金v玉v金 ・ ・ ・|'); break;
    //case 'hc8pd': lines.push('| ・ ・ ・v金v玉v金 ・ ・ ・|'); break;
    case 'hcr9p': lines.push('| ・ ・ ・ ・v玉v金 ・ ・ ・|'); break;
    case 'hcl9p': lines.push('| ・ ・ ・v金v玉 ・ ・ ・ ・|'); break;
  	case 'hctombonl': lines.push('|v香v桂 ・ ・v玉 ・ ・v桂v香|'); break;
  	case 'hctombol': lines.push('|v香 ・ ・ ・v玉 ・ ・ ・v香|'); break;
  	case 'hctombo': case 'hcfu3': case 'hcnaked': lines.push('| ・ ・ ・ ・v玉 ・ ・ ・ ・|'); break;
  }

  if (gameType == 'hcrooksilver') lines.push('| ・ ・ ・ ・ ・ ・ ・v角 ・|')
  else if (gameType.match(/^hctombo/)) lines.push('| ・v飛 ・ ・ ・ ・ ・v角 ・|')
  else lines.push('| ・ ・ ・ ・ ・ ・ ・ ・ ・|')

  if (['hcnaked', 'hcfu3'].includes(gameType)) lines.push('| ・ ・ ・ ・ ・ ・ ・ ・ ・|')
  else lines.push('|v歩v歩v歩v歩v歩v歩v歩v歩v歩|')

  lines.push('| ・ ・ ・ ・ ・ ・ ・ ・ ・|')
  lines.push('| ・ ・ ・ ・ ・ ・ ・ ・ ・|')
  lines.push('| ・ ・ ・ ・ ・ ・ ・ ・ ・|')
  lines.push('| 歩 歩 歩 歩 歩 歩 歩 歩 歩|')
  lines.push('| ・ 角 ・ ・ ・ ・ ・ 飛 ・|')
  lines.push('| 香 桂 銀 金 玉 金 銀 桂 香|')
}

function restoreIdleConnections(n){
  return n
  //return n > 30 ? Math.floor(n * 1.07) : n
}

function intToColorStyle(v) {
  return '#' + (('000000' + v.toString(16).toUpperCase()).substr(-6))
}

function playingStyleName(i) {
  if (i18next.language == "ja" ||i18next.language == "zh_tw" ) {
    return ['棋風 未登録', '居飛車党', '純粋居飛車党', '振り飛車党', '純粋振り飛車党', 'オールラウンダー', '真正オールラウンダー', '対抗形志向', '対抗形マニア', '力戦派', '矢倉マニア', '角換りマニア', '横歩取りマニア', '三間飛車党', '三間飛車マニア', '四間飛車党', '四間飛車マニア', '中飛車党', '中飛車マニア'][i]
  } else {
    return ['Playing style unknown', 'Static Rook Player', 'Pure Static Rook Player', 'Swinging Rook Player', 'Pure Swinging Rook Player', 'All-rounder', 'Genuine All-rounder', 'Opposition Seeker', 'Opposition Enthusiast', 'Free-style Player', 'Yagura Enthusiast', 'Bishop Exchange Enthusiast', 'Side Pawn Picker Enthusiast', '3rd-file Rook Player', '3rd-file Rook Enthusiast', '4th-file Rook Player', '4th-file Rook Enthusiast', 'Central Rook Player', 'Central Rook Enthusiast'][i]
  }
}

function showAlertDialog(i18nextCode, handler = function(){}, withCancel = false){
  //string, string, function
  let alertWindow = $('<div></div>', {class: 'alert-dialog'}).html('<div style="padding:10px">'+ i18next.t("alert." + i18nextCode) + '</div>').appendTo($('body'))
  alertWindow.dialog({
    modal: true,
    dialogClass: 'no-close',
    close: function(e){$(this).dialog('destroy').remove()},
    title: i18next.t("alert." + i18nextCode + "_title"),
    buttons: [
      {text: "OK", click: function(){$(this).dialog("close");handler()}},
      {text: i18next.t("cancel"), click: function(){$(this).dialog("close")}, class: withCancel ? '' : 'hidden'}
    ]
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
  if (me) apiClient.incrementMedal("use.kifu_share")
}

function sharePosition(mode) {
  let row = kifuGrid.row({selected: true})
  let black = board.game.black.name
  let white = board.game.white.name
	let url = "https://sfenreader2.appspot.com/twiimg?sfen=" + board.position.toSFEN(true) + "%20" + row.index()
	url += "&lm=" + (row.data().toX == null ?  "" : (row.data().toX.toString() + row.data().toY.toString()))
	url += "&sname=" + black + "&gname=" + white
	url += "&title=81Dojo"

  let str
	if (mode == "FB") {
		str = "http://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url)
	} else if (mode == "TW") {
		if (i18next.language == "ja") {
			str = "81道場 局面図: ▲" + black + " 対 △" + white
			str += " #81dojo #shogi (powered by @shibacho2)"
		} else {
			str = "81Dojo Diagram: [" + black + " vs " + white + "]"
			str += " #81dojo (powered by @shibacho2)";
		}
		str = "http://twitter.com/share?text=" + encodeURIComponent(str) + "&url=" + encodeURIComponent(url)
	}
  window.open(str, "_blank")
	//TODO _handleSNSClick(mode)
}

function downloadToFile(content, filename){
  var blob = new Blob([content], {type: "text/plain"})
  var a = document.createElement("a")
  a.target = '_blank'
  a.download = filename
  if(window.navigator.msSaveBlob){ // InternetExplorer
    window.navigator.msSaveBlob(blob, filename)
  } else if (window.URL && window.URL.createObjectURL) { // Firefox
    a.href = window.URL.createObjectURL(blob)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(a.href)
  } else if (window.webkitURL && window.webkitURL.createObjectURL) { // Chrome
    a.href = window.webkitURL.createObjectURL(blob)
    a.click()
    window.webkitURL.revokeObjectURL(a.href)
  } else { // Safari
    window.open('data:text/plain;base64,' + window.Base64.encode(content), '_blank')
  }
}

function formatDateToText(date){
  let str = ""
  str += date.getFullYear() % 100
  str += (date.getMonth() + 101).toString().slice(1)
  str += (date.getDate() + 100).toString().slice(1)
  str += (date.getHours() + 100).toString().slice(1)
  str += (date.getMinutes() + 100).toString().slice(1)
  str += (date.getSeconds() + 100).toString().slice(1)
  return str
}

function CSALinesFromBOD(text){
  let csa_lines = []
  text.split("\n").forEach(function(line){
    line = line.trim()
    let csa = ""
  	if (line.match(/^(.)手の持駒：(.*)$/)) {
      let pieces = RegExp.$2
  		csa = (RegExp.$1 == "後" || RegExp.$1 == "上") ? "P-" : "P+"
  		if (!pieces.match(/なし/)) {
  			pieces.split("　").forEach(function(str){
  				if (str.length == 1) csa += "00" + pieceNameToCSA(str)
  				else {
  					for (let i = 0; i < numJapaneseToInt(str.slice(1)); i++) csa += "00" + pieceNameToCSA(str.substr(0,1))
  				}
  			})
  		}
  	} else if (line.match(/^\|(.+)\|(.)$/)) {
  		csa = "P" + numJapaneseToInt(RegExp.$2)
  		for (let i = 0; i < 9; i++) {
  			if (RegExp.$1.substr(2 * i + 1, 1) == "・") csa += "_*_"
  			else csa += (RegExp.$1.substr(2 * i, 1) == "v" ? "-" : "+") + pieceNameToCSA(RegExp.$1.substr(2 * i + 1, 1))
  		}
  	} else return
  	csa_lines.push(csa)
  })
  csa_lines.push("+")
  return csa_lines
}

function CSALinesFromKIF(text){
  let csa_lines = []
  let hirate = false
  let prev = ""
  let lines = text.split("\n")
  for (let i = 0; i < lines.length; i++){
    let line = lines[i].trim()
  	if (line.match(/^手合割：平手/)) {
  		hirate = true
  		continue
  	} else if (line.match(/^\s*\d+\s+投了\s/)) {
  		csa_lines.push("%TORYO")
  		break
  	} else if (line.match(/^\s*\d+\s+切れ負け\s/)) {
  		csa_lines.push("%%%TIMEOUT")
  		break
  	} else if (line.match(/^変化：\d+手$/)) break

  	if (line.match( /^\s*(\d+)\s+(同|[１２３４５６７８９][一二三四五六七八九])[\s　]*(成?)([歩と香桂銀金角馬飛龍竜玉王])(不?成?)(\(\d+\)|打)/)) {
    	let csa = ""
    	if (parseInt(RegExp.$1) % 2 == (hirate ? 0 : 1)) {
    		csa += "-"
    	} else {
    		csa += "+"
    	}
    	if (RegExp.$6 == "打") {
    		csa += "00"
    	} else {
    		csa += RegExp.$6.substr(1, 2)
    	}
    	if (RegExp.$2 == "同") {
    		csa += prev
    	} else {
    		prev = numJapaneseToInt(RegExp.$2.substr(0, 1)).toString()
    		prev += numJapaneseToInt(RegExp.$2.substr(1, 1)).toString()
    		csa += prev
    	}
    	if (RegExp.$3 == "成" || RegExp.$5 == "成") {
        csa += pieceNameToCSA(RegExp.$4, true) // returns CSA piece name after promoting the piece
    	} else {
    		csa += pieceNameToCSA(RegExp.$4)
    	}
    	csa_lines.push(csa)
    }
  }
  return csa_lines
}

function pieceNameToCSA(str, forcePromotion = false) {
  if (str == "王") str = "玉"
  else if (str == "竜") str = "龍"
  else if (str == "全") str = "成銀"
  else if (str == "圭") str = "成桂"
  else if (str == "杏") str = "成香"
	if (Movement.CONST.koma_japanese_names.indexOf(str) >= 0) return Movement.CONST.PIECE_NAMES_CSA[Movement.CONST.koma_japanese_names.indexOf(str) + (forcePromotion ? 8 : 0)]
	else return ""
}

function numJapaneseToInt(str) {
	let i = 0
	str.split("").forEach(function(jp){
		switch (jp) {
			case "１":
			case "一":
				i += 1; break;
			case "２":
			case "二":
				i += 2; break;
			case "３":
			case "三":
				i += 3; break;
			case "４":
			case "四":
				i += 4; break;
			case "５":
			case "五":
				i += 5; break;
			case "６":
			case "六":
				i += 6; break;
			case "７":
			case "七":
				i += 7; break;
			case "８":
			case "八":
				i += 8; break;
			case "９":
			case "九":
				i += 9; break;
			case "十":
				i += 10; break;
		}
	})
	return i;
}

function sec2minsec(sec){
  //integer
  if (sec < 60) return sec.toString()
  else {
    let min = Math.floor(sec/60).toString()
    let res = (100 + (sec % 60)).toString()
    return min + ':' + res.slice(1)
  }
}

const pieceTypeKyotoConversion = [0, 7, 4, 5, 2, 3, 15, 1, 8, 9, 10, 11, 12, 13, 14, 6]

function getRotation(elem){
  let match = elem.css('transform').match(/\((.+)\)/)
  return match ? Math.acos(parseFloat(match[1])) : 0
}

function userNameToKey(name) {
  return name.match(/^\d/) ? ('$' + name) : name
}

function debugLoop(){
  window.addEventListener('devtoolschange', function(){while(true) debugger})
  $(window).keydown(function(e){if (e.keyCode == 123) e.preventDefault()})
}

/////////////////////////////////////////////////////////////////////////
//  Any attempt to communicate with the server by other means than
//  what is offered by the app user interface is prohibited.
//  For details see also Section 4.1 at https://81dojo.com/en/terms.html
//
//  正規アプリのGUI上で提供している以外の手段でサーバにアクセスを
//  試みることは禁止されており監視の対象となります
//　詳しくは右記の4.1項を確認下さい   https://81dojo.com/jp/terms.html
/////////////////////////////////////////////////////////////////////////

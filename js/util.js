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
	'11級', '12級', '13級', '14級', '15級']
const RANK_NAMES_EN = ['PRO', '7-Dan',
	'6-Dan', '5-Dan', '4-Dan', '3-Dan', '2-Dan', '1-Dan',
	'1-kyu', '2-kyu', '3-kyu', '4-kyu', '5-kyu',
	'6-kyu', '7-kyu', '8-kyu', '9-kyu', '10-kyu',
	'11-kyu', '12-kyu', '13-kyu', '14-kyu', '15-kyu']
const RANK_THRESHOLDS = [3500, 2300,
	2150, 2000, 1875, 1750, 1625, 1500,
	1425, 1350, 1300, 1250, 1200,
	1150, 1100, 1050, 1000, 900,
	800, 700, 600, 500, 0]
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

function coloredSpan(text, color, width = 0){
  let str = '<span style="color:' + color
  if (width > 0) str += ';display:inline-block;text-align:center;width:' + width + 'px'
  str += '">' + text + '</span>'
  return str
}

function debugLoop(){
  window.addEventListener('devtoolschange', function(){while(true) debugger})
}

function restoreIdleConnections(n){
  return n > 30 ? Math.floor(n * 1.07) : n
}

"use strict"

class Position{
  constructor(gameType){
    this._gameType = gameType
    this.turn = Position.CONST.SENTE
    this.superior = Position.CONST.GOTE
    if (gameType == "vazoo") {
      this.xN = 3
      this.yN = 4
    } else {
      this.xN = 9
      this.yN = 9
    }
    this.xmin = 1
    this.xmax = this.xN
    this.ymin = 1
    this.ymax = this.yN
    this._promoteY0 = 3 //for sente
    this._promoteY1 = 7 //for gote

    this._squares = new Array(9)
    for (let i = 0; i < 9; i++) {
      this._squares[i] = new Array(9).fill(null)
    }
    this.komadais = new Array(2)
    this.komadais[0] = []
    this.komadais[1] = []
    this.lastMove = null
  }

  static get CONST(){
    return {
      SENTE: true,
      GOTE: false,
      INITIAL_POSITION: "P0+\n" +
        "P1-KY-KE-GI-KI-OU-KI-GI-KE-KY\n" +
        "P2 * -HI *  *  *  *  * -KA * \n" +
        "P3-FU-FU-FU-FU-FU-FU-FU-FU-FU\n" +
        "P4 *  *  *  *  *  *  *  *  * \n" +
        "P5 *  *  *  *  *  *  *  *  * \n" +
        "P6 *  *  *  *  *  *  *  *  * \n" +
        "P7+FU+FU+FU+FU+FU+FU+FU+FU+FU\n" +
        "P8 * +KA *  *  *  *  * +HI * \n" +
        "P9+KY+KE+GI+KI+OU+KI+GI+KE+KY\n"
    }
  }

  createPiece(CSA, owner, x, y){
    if (CSA == "OU") return new PieceOU(owner)
    if (CSA == "HI") return new PieceHI(owner)
    if (CSA == "KA") return new PieceKA(owner)
    if (CSA == "KI") return new PieceKI(owner)
    if (CSA == "GI") return new PieceGI(owner)
    if (CSA == "KE") return new PieceKE(owner)
    if (CSA == "KY") return new PieceKY(owner)
    if (CSA == "FU") return new PieceFU(owner)
    if (CSA == "RY") return new PieceHI(owner, true)
    if (CSA == "UM") return new PieceKA(owner, true)
    if (CSA == "NG") return new PieceGI(owner, true)
    if (CSA == "NK") return new PieceKE(owner, true)
    if (CSA == "NY") return new PieceKY(owner, true)
    if (CSA == "TO") return new PieceFU(owner, true)
  }

  loadFromString(position_str){
    this.lastMove = null
    let lines = position_str.split("\n")
    if (lines[0].substr(2) == "+") {
  	  this.turn = Position.CONST.SENTE;
    } else {
  	  this.turn = Position.CONST.GOTE;
    }
    for(let y = 0; y < 9; y++){
      let line = lines[y+1].substr(2);
      for(let x = 0; x < 9; x++){
        let koma_str = line.slice((8-x) * 3, (8-x) * 3 + 3)
        if(koma_str != " * "){
          let owner = koma_str.charAt(0) == '+' ? Position.CONST.SENTE : Position.CONST.GOTE
          this._squares[x][y] = this.createPiece(koma_str.slice(1,3), owner, x, y)
          if (this._squares[x][y].isKing() && owner == this.superior) this._squares[x][y].promote()
        } else {
          this._squares[x][y] = null
        }
      }
    }
    this.komadais[0] = []
    this.komadais[1] = []
    if(lines.length > 10){
      for(let i = 9; i < lines.length; i++){
        if (lines[i].match(/P([+-])00(.*)/)){
          let owner = RegExp.$1 == "+"
          let komas = lines[i].split("00")
          komas.shift(); //P[+-]
          komas.forEach(function(koma_name){
            let koma = this.createPiece(koma_name, owner, 0, 0)
            this.komadais[owner ? 0 : 1].push(koma)
          }, this)
        }
      }
    }
  }

	toString() {
		let str = ""
		if (this.turn == Position.CONST.SENTE) {
			str += "P0+\n";
		} else {
			str += "P0-\n";
		}
		for (let y = 0; y < 9; y++) {
			let line = "P" + (y + 1);
			for (let x = 8; x >= 0; x--) {
				if (this._squares[x][y]) {
					line += this._squares[x][y].toString()
				} else {
					line += " * ";
				}
			}
			str += line + "\n";
		}
		for (let y = 0; y < 2; y++) {
			let line = "P" + (y == 0 ? "+" : "-");
      this.komadais[y].forEach(function(piece){
        line += "00" + piece.CSA
      })
			if (line.length > 2) str += line + "\n";
		}
		return str;
	}

  getPieceFromSquare(sq){
    //sq:jQuery DIV(square) object
    if (sq.data('x') > 0) {
      return this._squares[sq.data('x') - 1][sq.data('y') - 1]
    } else {
      return this._getPieceFromKomadai(sq.data('x') == 0, sq.data('y'))
    }
  }

  _getPieceFromKomadai(owner, pieceType){
    // owner: boolean, pieceType: int
    let returnedPiece
    this.komadais[owner ? 0 : 1].every(function(piece){
      if (piece.getType() == pieceType) {
        returnedPiece = piece
        return false
      }
      return true
    })
    return returnedPiece
  }

  _removePieceFromKomadai(owner, pieceType){
    // owner: boolean, pieceType: int
    this.komadais[owner ? 0 : 1].every(function(piece, i){
      if (piece.getType() == pieceType) {
        this.komadais[owner ? 0 : 1].splice(i, 1)
        return false
      }
      return true
    }, this)
  }

  getMovableGridsFromSquare(sq){
    //sq:jQuery DIV(square) object
    let squares = new Array()
    let x0 = sq.data('x')
    let y0 = sq.data('y')
    if (x0 > 0) {
      let koma = this.getPieceFromSquare(sq)
      let grids = koma.adjacentMoves()
      grids.forEach(function(e){
        let x1 = x0 + e[0]
        let y1 = y0 + (koma.owner ? -1 : 1) * e[1]
        if (x1 <  this.xmin || x1 > this.xmax || y1 < this.ymin || y1 > this.ymax) return
        let koma2 = this._squares[x1-1][y1-1]
        if (koma2 && koma2.owner == koma.owner) return
        squares.push([x1, y1])
      }, this)
      grids = koma.farMoves()
      grids.forEach(function(e){
        let x1 = x0
        let y1 = y0
        do {
          x1 += e[0]
          y1 += (koma.owner ? -1 : 1) * e[1]
          if (x1 <  this.xmin || x1 > this.xmax || y1 < this.ymin || y1 > this.ymax) break
          let koma2 = this._squares[x1-1][y1-1]
          if (koma2) {
            if (koma2.owner != koma.owner) squares.push([x1, y1])
            break
          } else {
            squares.push([x1, y1])
          }
        } while(true)
      }, this)
    } else {
      for (let y = this.ymin; y <= this.ymax; y++) {
        for (let x = this.xmin; x <= this.xmax; x++) {
          if (this._squares[x-1][y-1] == null) squares.push([x, y])
        }
      }
    }
    return squares
  }

  makeMove(move, withSound = true){
    // move: Movement
    let koma1
    let koma2
    if (move.fromX > 0){
      koma1 = this._squares[move.fromX - 1][move.fromY - 1]
      move.pieceType = koma1.getType()
      if (move.pieceType >= 8) move.promote = false //'promote' might have been set to true temporarily
      this._squares[move.fromX - 1][move.fromY - 1] = null
      koma2 = this._squares[move.toX - 1][move.toY - 1]
      if (koma2) {
        koma2.owner = move.owner
        koma2.depromote()
        this.komadais[move.owner ? 0 : 1].push(koma2)
        move.capture = true
      }
      if (move.promote) koma1.promote()
      this._squares[move.toX - 1][move.toY - 1] = koma1
    } else {
      koma1 = this._getPieceFromKomadai(move.owner, move.pieceType)
      this._squares[move.toX - 1][move.toY - 1] = koma1
      this._removePieceFromKomadai(move.owner, move.pieceType)
    }
    this.turn = !this.turn
    this.lastMove = move
    if (withSound) {
      let soundDouble = false
      let koma3 = null
      if (move.owner && move.toY <= 8) {
        koma3 = this._squares[move.toX - 1][move.toY]
      } else if (!move.owner && move.toY >= 2) {
        koma3 = this._squares[move.toX - 1][move.toY - 2]
      }
      if (koma3 && koma3.owner == move.owner) soundDouble = true
      sp.piece(soundDouble, koma1.soundVolume())
    }
    return move
  }

  canPromote(sqFrom, sqTo){
    // returns 0: Not promotable, 1: Can promote, 2: Must promote
    if (sqFrom.data('x') <= 0) return 0
    let koma = this.getPieceFromSquare(sqFrom)
    if (!koma || !koma.isPromotable() || koma.isPromoted()) return 0
    if (koma.owner) {
      if (sqFrom.data('y') <= this._promoteY0 || sqTo.data('y') <= this._promoteY0) {
        return koma.mustPromote(sqTo.data('y') - this.ymin) ? 2 : 1
      } else return 0
    } else {
      if (sqFrom.data('y') >= this._promoteY1 || sqTo.data('y') >= this._promoteY1) {
        return koma.mustPromote(this.ymax - sqTo.data('y')) ? 2 : 1
      } else return 0
    }
  }

  handCoordinateHash(i){
    // i: sente/gote (integer)
    let hash = {
      HI: {x: 10, y: 10, n: 0, dx: 0},
      KA: {x: 85, y: 10, n: 0, dx: 0},
      KI: {x: 10, y: 55, n: 0, dx: 0},
      GI: {x: 85, y: 55, n: 0, dx: 0},
      KE: {x: 10, y: 100, n: 0, dx: 0},
      KY: {x: 85, y: 100, n: 0, dx: 0},
      FU: {x: 10, y: 145, n: 0, dx: 0}
    }
    this.komadais[i].forEach(function(piece){
      if (hash[piece.CSA] == null) return
      hash[piece.CSA].n += 1
      hash[piece.CSA].dx = (piece.CSA == "FU" ? 107.0 : 50.0) / hash[piece.CSA].n
    })
    return hash
  }

  deepCopy(pos){
    //Position
    this.loadFromString(pos.toString())
    this.lastMove = pos.lastMove
  }

	calcImpasse() {
		let totalPoints = 0
    let impasseStatus = [{entered: false, pieces: 0, points: 0}, {entered: false, pieces: 0, points: 0}]
		for (let i = 0; i < 2; i++) {
      this.komadais[i].forEach(function(piece){
        impasseStatus[i].points += piece.point
			})
			totalPoints += impasseStatus[i].points
		}
		for (let y = 0; y < 9; y++) {
			for (let x = 0; x < 9; x++) {
				if (this._squares[x][y]) {
          totalPoints += this._squares[x][y].point
          let owner = this._squares[x][y].owner
          if ((owner && (y + 1) <= this._promoteY0) || (!owner && (y + 1) >= this._promoteY1)) {
            if (this._squares[x][y].isKing()) {
              impasseStatus[owner ? 0 : 1].entered = true
            } else {
              impasseStatus[owner ? 0 : 1].pieces += 1
              impasseStatus[owner ? 0 : 1].points += this._squares[x][y].point
            }
          }
        }
			}
		}
		impasseStatus[1].points += 54 - totalPoints
    return impasseStatus
	}

	toSFEN(url = false) {
		let str = ""
		let n = 0
		for (let y = 0; y < 9; y++) {
			for (let x = 8; x >= 0; x--) {
				if (this._squares[x][y]) {
					if (n > 0) str += n.toString()
					n = 0
					str += this._squares[x][y].toSFEN()
				} else {
					n += 1
				}
			}
			if (n > 0) str += n.toString()
			n = 0
			if (y < 8) str += "/"
		}
		str += " " + (this.turn ? "b" : "w")
		let hand = ""
    let counts = {K:0, R:0, B:0, G:0, S:0, N:0, L:0, P:0, k:0, r:0, b:0, g:0, s:0, n:0, l:0, p:0}
		for (let j = 0; j < 2; j++) {
      this.komadais[j].forEach(function(piece){
        counts[piece.toSFEN()] += 1
      })
		}
    for (let key in counts) {
      if (counts[key] > 0) hand += (counts[key] > 1 ? counts[key] : "") + key
    }
		if (hand == "") hand = "-"
		str += " " + hand
		return url ? encodeURIComponent(str) : str
	}

}

//	private static const koma_neutral_nums:Array = new Array(1, 1, 1, 2, 2, 2, 2, 9);
//	private static const koma_material_points:Array = new Array(0, 8, 8, 5, 5, 3, 3, 1);

/*

		public function mustPromote(from:Point, to:Point):Boolean {
			if (koma_names == koma_names_zoo) return false;
			from = translateHumanCoordinates(from);
			to = translateHumanCoordinates(to);
			var koma:Koma = getKomaAt(from);
			if (koma.type == Koma.FU || koma.type == Koma.KY) {
				if (koma.ownerPlayer == SENTE && to.y == 0) return true;
				if (koma.ownerPlayer == GOTE && to.y == 8) return true;
			} else if (koma.type == Koma.KE) {
				if (koma.ownerPlayer == SENTE && to.y <= 1) return true;
				if (koma.ownerPlayer == GOTE && to.y >= 7) return true;
			}
			return false;
		}

		public function isNifu(from:Point, to:Point):Boolean {
			if (from.x == HAND_FU) {
				to = translateHumanCoordinates(to);
				for (var i:int = 0; i < 9; i++) {
					var koma:Koma;
					if ((koma = getKomaAt(new Point(to.x, i)))) {
						if (koma.type == Koma.FU && koma.ownerPlayer == _turn) {
							return true;
						}
					}
				}
			}
			return false;
		}

		public function isSoundDouble(to:Point):Boolean {
			var koma:Koma;
			if (getKomaAt(to).ownerPlayer == SENTE && to.y <= 7) {
				if ((koma = getKomaAt(new Point(to.x, to.y + 1)))) {
					if (koma.ownerPlayer == SENTE) return true;
				}
			} else if (getKomaAt(to).ownerPlayer == GOTE && to.y >= 1) {
				if ((koma = getKomaAt(new Point(to.x, to.y - 1)))) {
					if (koma.ownerPlayer == GOTE) return true;
				}
			}
			return false;
		}

		public function calcMaterial(turn:int, joban:Boolean):String {
			var piece_nums:Array = new Array(0, 0, 0, 0, 0, 0, 0, 0);
			var sente_got:String = "";
			var gote_got:String = "";
			var sente_gain:int = 0;
			var str:String = "";
			for (var y:int = 0; y < 9; y++) {
				for (var x:int = 0; x < 9; x++) {
					if (_ban[x][y] && _ban[x][y].ownerPlayer == SENTE) piece_nums[_ban[x][y].type <= 7 ? _ban[x][y].type : (_ban[x][y].type - Koma.PROMOTE)] += 1;
				}
			}
			for (var i:int = 0; i < 8; i++) {
				piece_nums[i] += _komadai[SENTE].getNumOfKoma(i);
			}
			for (i = 1; i <= 6; i++) {
				if (piece_nums[i] > koma_neutral_nums[i]) {
					for (var n:int = 1; n <= piece_nums[i] - koma_neutral_nums[i]; n++) {
						sente_got += koma_japanese_names[i];
						sente_gain += koma_material_points[i];
					}
				} else if (piece_nums[i] < koma_neutral_nums[i]) {
					for (n = 1; n <= koma_neutral_nums[i] - piece_nums[i]; n++) {
						gote_got += koma_japanese_names[i];
						sente_gain -= koma_material_points[i];
					}
				}
			}
			if (gote_got.length > 0 && sente_got.length == 0) {
				if (joban && sente_gain >= -3 && piece_nums[7] >= koma_neutral_nums[7] + 3) sente_got += LanguageSelector.EJ("歩x", "歩") + (piece_nums[7] - koma_neutral_nums[7]) + LanguageSelector.EJ("", "枚");
			} else if (gote_got.length == 0 && sente_got.length > 0) {
				if (joban && sente_gain <= 3 && piece_nums[7] <= koma_neutral_nums[7] - 3) gote_got += LanguageSelector.EJ("歩x", "歩") + (koma_neutral_nums[7] - piece_nums[7]) + LanguageSelector.EJ("", "枚");
			}
			if (gote_got.length > 0 && sente_got.length == 0) {
				return turn == SENTE ? LanguageSelector.EJ("Black is down by " + gote_got, "先手 " + gote_got + "損") : LanguageSelector.EJ("White is up by " + gote_got, "後手 " + gote_got + "得");
			} else if (gote_got.length == 0 && sente_got.length > 0) {
				return turn == SENTE ? LanguageSelector.EJ("Black is up by " + sente_got, "先手 " + sente_got + "得") : LanguageSelector.EJ("White is up by " + sente_got, "後手 " + sente_got + "損");
			} else {
				if (sente_got.length > 0 && gote_got.length > 0) {
					str = LanguageSelector.EJ("Exchange of " + (turn == SENTE ? ("▲" + sente_got + " and △" + gote_got) : ("△" + gote_got + " and ▲" + sente_got)) + " / ", (turn == SENTE ? ("☗" + sente_got + "と☖" + gote_got) : ("☖" + gote_got + "と☗" + sente_got)) + "の交換　　");
					var gain_threshold:int = (sente_got.length == gote_got.length && sente_got.length <= 2) ? 2 : 3;
					if (sente_gain >= gain_threshold) return str + (turn == SENTE ? LanguageSelector.EJ("Black is up.","先手の駒得") : LanguageSelector.EJ("White is down.", "後手の駒損"));
					else if (sente_gain <= -gain_threshold) return str + (turn == SENTE ? LanguageSelector.EJ("Black is down.","先手の駒損") : LanguageSelector.EJ("White is up.", "後手の駒得"));
				}
				if (sente_gain == 0 && sente_got.length == gote_got.length && sente_got.length <= 2) {
					if (joban && piece_nums[7] > koma_neutral_nums[7]) str += turn == SENTE ? LanguageSelector.EJ("", "先手 ") + (piece_nums[7] - koma_neutral_nums[7]) + LanguageSelector.EJ("-pawn up for black.", "歩得") : LanguageSelector.EJ("", "後手 ") + (piece_nums[7] - koma_neutral_nums[7]) + LanguageSelector.EJ("-pawn down for white.", "歩損");
					else if (joban && piece_nums[7] < koma_neutral_nums[7]) str += turn == SENTE ? LanguageSelector.EJ("", "先手 ") + (koma_neutral_nums[7] - piece_nums[7]) + LanguageSelector.EJ("-pawn down for black.", "歩損") : LanguageSelector.EJ("", "後手 ") + (koma_neutral_nums[7] - piece_nums[7]) + LanguageSelector.EJ("-pawn up for white.", "歩得");
					else str += LanguageSelector.EJ("Equal.", "互角");
				}
				return str;
			}
		}

		public static function komaJapaneseToCSA(v:String):String {
			if (koma_japanese_names.indexOf(v) >= 0) return koma_names[koma_japanese_names.indexOf(v)];
			else if (v == "王") return "OU";
			else if (v == "竜") return "RY";
			else return "";
		}

		public static function numJapaneseToInt(v:String):int {
			var csa:int = 0;
			for each(var jp:String in v.split("")) {
				switch (jp) {
					case "１":
					case "一":
						csa += 1; break;
					case "２":
					case "二":
						csa += 2; break;
					case "３":
					case "三":
						csa += 3; break;
					case "４":
					case "四":
						csa += 4; break;
					case "５":
					case "五":
						csa += 5; break;
					case "６":
					case "六":
						csa += 6; break;
					case "７":
					case "七":
						csa += 7; break;
					case "８":
					case "八":
						csa += 8; break;
					case "９":
					case "九":
						csa += 9; break;
					case "十":
						csa += 10; break;
				}
			}
			return csa;
		}

	}

}
*/

"use strict"

class Position{
  constructor(gameType){
    this._gameType = gameType
    this.turn = Position.CONST.SENTE
    this._superior //int
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

  makeMove(move){
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
    return move
  }

  canPromote(sqFrom, sqTo){
    if (sqFrom.data('x') <= 0) return false
    let koma = this.getPieceFromSquare(sqFrom)
    if (!koma || koma.isPromoted()) return false
    if (koma.owner) {
      return sqFrom.data('y') <= this._promoteY0 || sqTo.data('y') <= this._promoteY0
    } else {
      return sqFrom.data('y') >= this._promoteY1 || sqTo.data('y') >= this._promoteY1
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
      hash[piece.CSA].n += 1
      hash[piece.CSA].dx = (piece.CSA == "FU" ? 107.0 : 50.0) / hash[piece.CSA].n
    })
    return hash
  }

}

//	private static const koma_neutral_nums:Array = new Array(1, 1, 1, 2, 2, 2, 2, 9);
//	private static const koma_material_points:Array = new Array(0, 8, 8, 5, 5, 3, 3, 1);

/*

	public function toSFEN(url:Boolean=false):String {
		var str:String = "";
		var n:int = 0;
		for (var y:int = 0; y < 9; y++) {
			for (var x:int = 0; x < 9; x++) {
				if (_ban[x][y]) {
					if (n > 0) str += n;
					n = 0;
					if (_ban[x][y].ownerPlayer == SENTE) {
						str += koma_sfen_names[_ban[x][y].type];
					} else {
						str += koma_sfen_names[_ban[x][y].type].toLowerCase();
					}
				} else {
					n += 1;
				}
			}
			if (n > 0) str += n;
			n = 0;
			if (y < 8) str += "/";
		}
		str += " " + (turn == SENTE ? "b" : "w");
		var hand:String = ""
		for (var j:int = 0; j < 2;j++) {
			for (var i:int = 0; i < 8; i++) {
				n = _komadai[j].getNumOfKoma(i);
				if (n > 0) hand += (n > 1 ? n : "") + (j == 0 ? koma_sfen_names[i] : koma_sfen_names[i].toLowerCase());
			}
		}
		if (hand == "") hand = "-";
		str += " " + hand;
		return url ? encodeURIComponent(str) : str;
	}

		public function get impasseStatus():Array {
			return this._impasseStatus;
		}

		public function canPromote(from:Point,to:Point):Boolean {
			to = translateHumanCoordinates(to);
			var koma:Koma;
			if (from.x > HAND) return false;
			from = translateHumanCoordinates(from);
			koma = getKomaAt(from);
			if(koma.isPromoted()) return false;
			if (koma.type == Koma.OU || koma.type == Koma.KI) return false;
			if (koma_names == koma_names_zoo && koma.type != Koma.FU) return false;
			if(koma.ownerPlayer == SENTE){
				if(from.y <= _promoteY1 || to.y <= _promoteY1){
					return true;
				}
			} else {
				if(from.y >= _promoteY2 || to.y >= _promoteY2){
					return true;
				}
			}
			return false;
		}

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

    public function generateMovementFromString(moveStr:String):Movement {
	  if (!moveStr || moveStr.charAt(0) == "%") return null;
	  var turn:int = moveStr.charAt(0) == "+" ? Kyokumen.SENTE : Kyokumen.GOTE;
      var from:Point = new Point(parseInt(moveStr.charAt(1)),parseInt(moveStr.charAt(2)));
      if(from.x == 0){
        from.x = HAND;
        from.y = HAND;
      } else {
        from = translateHumanCoordinates(from);
      }
      var to:Point = new Point(parseInt(moveStr.charAt(3)),parseInt(moveStr.charAt(4)));
      to = translateHumanCoordinates(to);
      var capture:Boolean = getKomaAt(to) != null
	  var match:Array = moveStr.match(/,T([0-9]*)/);
	  var time:int = parseInt(match[1]);
	  if (from.x != HAND){
	  	var promote:Boolean = getKomaAt(from).type != koma_names.indexOf(moveStr.slice(5,7)) && !isKyoto;
	  }
	  var originalKomaType:int = koma_names.indexOf(moveStr.slice(5, 7)) - (promote ? Koma.PROMOTE : 0);
	  var additionalIdentifier:Boolean = false;
	  outer: for (var y:int = 0; y < 9; y++) {
		  for (var x:int = 0; x < 9; x++) {
			  if (x == from.x && y == from.y) continue;
			  if (_ban[x][y] && _ban[x][y].ownerPlayer == turn && _ban[x][y].type == originalKomaType) {
				  if (!cantMove(_ban[x][y], new Point(x,y), to, false)) additionalIdentifier = true;
			  }
			  if (additionalIdentifier) break outer;
		  }
	  }
	  var mv:Movement = new Movement();
	  mv.setFromKyokumen(turn, from, to, originalKomaType, promote, capture, _last_to, additionalIdentifier, time);
	  return mv;
    }

		public function move(mv:Movement):void {
			//drop
			if(mv.from.x == HAND){
				_komadai[mv.turn].removeKoma(isKyoto ? Koma.typeKyotoConverted(mv.type, true) : mv.type);
			}
			//put piece into hand if capturing.
			if (getKomaAt(mv.to) != null) {
				if(mv.from.x == HAND){
					return; //illegal
				} else {
					var captured_koma:Koma = getKomaAt(mv.to);
					_captureKoma(captured_koma,_turn);
				}
			}
			//move piece
			if(mv.from.x != HAND){
				//_ban[mv.from.x - 1][mv.from.y - 1] = null;
				setKomaAt(mv.from,null);
			}
			setKomaAt(mv.to, mv.getResultKoma());
			_last_to = mv.to;
			_turn = _turn == SENTE ? GOTE : SENTE;
		}

		private function _captureKoma(koma:Koma,turn:int):void {
      setKomaAt(new Point(koma.x,koma.y),null);
			koma.ownerPlayer = turn;
			koma.x = HAND;
			koma.y = HAND;
			if (isKyoto) koma.convertKyoto(true);
			if (koma.isPromoted()) {
				koma.depromote();
			}
			_komadai[turn].addKoma(koma);
		}

		public function calcImpasse():void {
			var turn:int;
			var total_points:int = 0;
			for (turn = 0; turn < 2; turn++) {
				_impasseStatus[turn].entered = false;
				_impasseStatus[turn].pieces = 0;
				_impasseStatus[turn].points = 0;
				for (var i:int = 0; i < 8; i++) {
					_impasseStatus[turn].points += _komadai[turn].getNumOfKoma(i) * koma_impasse_points[i];
				}
				total_points += _impasseStatus[turn].points;
			}
			for (var y:int = 0; y < 9; y++) {
				for (var x:int = 0; x < 9; x++) {
					if (_ban[x][y]) {
						total_points += koma_impasse_points[_ban[x][y].type];
						if (y <= _promoteY1) {
							turn = SENTE;
						} else if (y >= _promoteY2) {
							turn = GOTE;
						} else {
							continue;
						}
						if (_ban[x][y].ownerPlayer == turn) {
							_impasseStatus[turn].pieces += 1;
							_impasseStatus[turn].points += koma_impasse_points[_ban[x][y].type];
						}
					}
				}
			}
			_impasseStatus[GOTE].points += ALL_POINTS - total_points;
			for (turn = 0; turn < 2; turn++) {
				if (_impasseStatus[turn].points >= koma_impasse_points[0]) {
					_impasseStatus[turn].points -= koma_impasse_points[0];
					_impasseStatus[turn].pieces -= 1;
					_impasseStatus[turn].entered = true;
				}
			}
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

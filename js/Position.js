"use strict"

class Position{
  constructor(gameType){
    this._gameType = gameType
    this.turn = Position.CONST.SENTE
    this.superior = Position.CONST.GOTE
    this.xmin = 1
    this.xmax = 9
    this.ymin = 1
    this.ymax = 9
    this._promoteY0 = 3 //for sente
    this._promoteY1 = 7 //for gote
    switch (gameType) {
      case 'vamini':
      case 'vakyoto':
        [this.xmin, this.xmax, this.ymin, this.ymax] = [3, 7, 3, 7]
        if (gameType == 'vakyoto') [this._promoteY0, this._promoteY1] = [2, 8]
        break
      case 'va33':
        [this.xmin, this.xmax, this.ymin, this.ymax, this._promoteY0, this._promoteY1] = [4, 6, 4, 6, 4, 6]
        break
      case 'va5656':
        [this.xmin, this.xmax, this.ymin, this.ymax, this._promoteY0] = [3, 7, 3, 8, 4]
        break
      case 'vajudkins':
        [this.xmin, this.xmax, this.ymin, this.ymax, this._promoteY0] = [3, 8, 3, 8, 4]
        break
      case 'vazoo':
        [this.xmin, this.xmax, this.ymin, this.ymax, this._promoteY0, this._promoteY1] = [7, 9, 1, 4, 1, 4]
        break
    }

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
      NEUTRAL_NUMS: [1, 1, 1, 2, 2, 2, 2, 9],
      MATERIAL_POINTS: [0, 8, 8, 5, 5, 3, 3, 1],
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
    if (CSA == "OU") return this._gameType == 'vazoo' ? new PieceZL(owner) : new PieceOU(owner)
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
    if (CSA == "TO") return this._gameType == 'vazoo' ? new PieceZC(owner, true) : new PieceFU(owner, true)
    if (CSA == "ZG") return new PieceZG(owner)
    if (CSA == "ZE") return new PieceZE(owner)
    if (CSA == "ZC") return new PieceZC(owner)
    if (CSA == "ZH") return new PieceZC(owner, true)
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

  _getPieceFromKomadai(owner, pieceType, remove = false){
    // owner: boolean, pieceType: int, find_and_then_remove: boolean
    let returnedPiece = null
    this.komadais[owner ? 0 : 1].every(function(piece, i){
      if (piece.getType() == pieceType) {
        returnedPiece = piece
        if (remove) this.komadais[owner ? 0 : 1].splice(i, 1)
        return false
      }
      return true
    }, this)
    return returnedPiece
  }

  getMovableGridsFromSquare(sq){
    //sq:jQuery DIV(square) object
    return this._getMovableGrids(sq.data('x'), sq.data('y'))
  }

  _getMovableGrids(x0, y0){
    let squares = new Array()
    if (x0 > 0) {
      let koma = this._squares[x0 - 1][y0 - 1]
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
    // Find piece
    if (move.fromX > 0){
      koma1 = this._squares[move.fromX - 1][move.fromY - 1]
      if (this._gameType == "vakyoto") koma1 = koma1.convertKyoto() // <<< Kyoto-shogi only
      move.pieceType = koma1.getType()
      if (move.pieceType >= 8) move.promote = false //'promote' might have been set to true temporarily
      // check promotable
      if (!koma1.isPromoted() && koma1.isPromotable()){
        if (koma1.owner) {
          if (move.fromY <= this._promoteY0 || move.toY <= this._promoteY0) move.promotable = true
        } else {
          if (move.fromY >= this._promoteY1 || move.toY >= this._promoteY1) move.promotable = true
        }
      }
    } else {
      koma1 = this._getPieceFromKomadai(move.owner, move.pieceType, true)
      if (!koma1 && this._gameType == 'vakyoto') { // <<< Rescue for Kyoto-shogi flipped drop
        koma1 = this._getPieceFromKomadai(move.owner, pieceTypeKyotoConversion[move.pieceType], true).convertKyoto()
      }
    }
    // Search siblings
    move.siblingOrigins = []
    for (let x = this.xmin; x <= this.xmax; x++){
      for (let y = this.ymin; y <= this.ymax; y++){
        if (x == move.fromX && y == move.fromY) continue
        let koma3 = this._squares[x - 1][y - 1]
        if (koma3 && (koma3.checkSibling() || move.fromX <= 0) && koma3.owner == koma1.owner && koma3.getType() == koma1.getType()) {
          if (this._getMovableGrids(x, y).map(v => v.toString()).includes(move.toX + ',' + move.toY)) move.siblingOrigins.push([x, y])
        }
      }
    }
    // Execute move (In case of drop, hand piece is already removed from komadai)
    if (move.fromX > 0){
      this._squares[move.fromX - 1][move.fromY - 1] = null
      koma2 = this._squares[move.toX - 1][move.toY - 1]
      if (koma2) {
        koma2.owner = move.owner
        if (this._gameType == 'vakyoto' && koma2.isPromoted()) koma2 = koma2.convertKyoto()
        koma2.depromote()
        this.komadais[move.owner ? 0 : 1].push(koma2)
        move.capture = true
      }
      if (move.promote) koma1.promote()
    }
    this._squares[move.toX - 1][move.toY - 1] = koma1

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
      if (move.constructor.name == 'DobutsuMovement') sp.piece34(soundDouble, koma1.soundVolume())
      else sp.piece(soundDouble, koma1.soundVolume())
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

  checkIllegal(){
    let kingCoord = this._getKingCoordinates(!this.turn)
    if (kingCoord) {
  		for (let y = 0; y < 9; y++) {
  			for (let x = 0; x < 9; x++) {
  				if (this._squares[x][y] && this._squares[x][y].owner == this.turn) {
            if (this._getMovableGrids(x + 1, y + 1).map(v => v.toString()).includes(kingCoord.x + ',' + kingCoord.y)) return {cause: 'SUICIDE', x1: x + 1, y1: y + 1, x2: kingCoord.x, y2: kingCoord.y}
          }
        }
      }
    }
    if (this._gameType == 'vakyoto') return null
    for (let x = 0; x < 9; x++){
      let pawnCoord = null
      for (let y = 0;y < 9; y++){
        if (this._squares[x][y] && this._squares[x][y].isPawn() && this._squares[x][y].owner == !this.turn) {
          if (pawnCoord == null) {
            pawnCoord = {x: x + 1, y: y + 1}
          } else {
            return {cause: 'NIFU', x1: pawnCoord.x, y1: pawnCoord.y, x2: x + 1, y2: y + 1}
          }
        }
      }
    }
    return null
  }

  _getKingCoordinates(turn){
		for (let y = 0; y < 9; y++) {
			for (let x = 0; x < 9; x++) {
				if (this._squares[x][y]) {
          if (this._squares[x][y].isKing() && this._squares[x][y].owner == turn) return {x: x+1, y: y+1} // Human coordinates
        }
      }
    }
    return null
  }

  handCoordinateHash(i){
    // i: sente/gote (integer)
    let hash = {
      HI: {fanmax: 2, xmin: 3, xmax: 43, y: 9, originH: 174, n: 0, dx: 0, i: 0},
      KA: {fanmax: 2, xmin: 83, xmax: 123, y: 9, originH: 174, n: 0, dx: 0, i: 0},
      KI: {fanmax: 2, xmin: 3, xmax: 45, y: 55, originH: 167, n: 0, dx: 0, i: 0},
      GI: {fanmax: 2, xmin: 83, xmax: 125, y: 55, originH: 164, n: 0, dx: 0, i: 0},
      KE: {fanmax: 2, xmin: 1, xmax: 45, y: 100, originH: 152, n: 0, dx: 0, i: 0},
      KY: {fanmax: 2, xmin: 82, xmax: 127, y: 100, originH: 147, n: 0, dx: 0, i: 0},
      FU: {fanmax: 5, xmin: 0, xmax: 128, y: 144, originH: 142, n: 0, dx: 0, i: 0}
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

	materialBalance(turn, joban) {
    // boolean (true if seen from sente), boolean
    let str = ""
		let senteGot = ""
		let goteGot = ""
		let sentePieceNums = new Array(8).fill(0)
		let senteGain = 0
		for (let y = 0; y < 9; y++) {
			for (let x = 0; x < 9; x++) {
				if (this._squares[x][y] && this._squares[x][y].owner) sentePieceNums[this._squares[x][y].type] += 1
			}
		}
    this.komadais[0].forEach(function(piece){
      sentePieceNums[piece.type] += 1
    })
		for (let i = 1; i <= 6; i++) {
			if (sentePieceNums[i] > Position.CONST.NEUTRAL_NUMS[i]) {
				for (let n = 1; n <= sentePieceNums[i] - Position.CONST.NEUTRAL_NUMS[i]; n++) {
					senteGot += Movement.CONST.koma_japanese_names[i]
					senteGain += Position.CONST.MATERIAL_POINTS[i]
				}
			} else if (sentePieceNums[i] < Position.CONST.NEUTRAL_NUMS[i]) {
				for (let n = 1; n <= Position.CONST.NEUTRAL_NUMS[i] - sentePieceNums[i]; n++) {
					goteGot += Movement.CONST.koma_japanese_names[i]
					senteGain -= Position.CONST.MATERIAL_POINTS[i]
				}
			}
		}
    let sentePawns = sentePieceNums[7]
    let evenPawns = Position.CONST.NEUTRAL_NUMS[7]
		if (goteGot.length > 0 && senteGot.length == 0) {
			if (joban && senteGain >= -3 && sentePawns >= evenPawns + 3) senteGot += EJ("???x", "???") + (sentePawns - evenPawns) + EJ("", "???")
			return turn ? EJ("Black is down by " + goteGot, "?????? " + goteGot + "???") : EJ("White is up by " + goteGot, "?????? " + goteGot + "???")
		} else if (goteGot.length == 0 && senteGot.length > 0) {
			if (joban && senteGain <= 3 && sentePawns <= evenPawns - 3) goteGot += EJ("???x", "???") + (evenPawns - sentePawns) + EJ("", "???")
			return turn ? EJ("Black is up by " + senteGot, "?????? " + senteGot + "???") : EJ("White is up by " + senteGot, "?????? " + senteGot + "???")
		}
		if (senteGot.length > 0 && goteGot.length > 0) {
			str = EJ("Exchange of ", "") + (turn ? ("???" + senteGot) : ("???" + goteGot)) + EJ(" and ", "???") + (turn ? ("???" + goteGot) : ("???" + senteGot)) + EJ("", "?????????") + "???/???"
			let gain_threshold = (senteGot.length == goteGot.length && senteGot.length <= 2) ? 2 : 3
			if (senteGain >= gain_threshold) return str + (turn ? EJ("Black is up.", "???????????????") : EJ("White is down.", "???????????????"))
			else if (senteGain <= -gain_threshold) return str + (turn ? EJ("Black is down.", "???????????????") : EJ("White is up.", "???????????????"))
		}
		if (senteGain == 0 && senteGot.length == goteGot.length && senteGot.length <= 2) {
			if (joban && sentePawns > evenPawns) str += turn ? EJ("", "?????? ") + (sentePawns - evenPawns) + EJ("-pawn up for black.", "??????") : EJ("", "?????? ") + (sentePawns - evenPawns) + EJ("-pawn down for white.", "??????")
			else if (joban && sentePawns < evenPawns) str += turn ? EJ("", "?????? ") + (evenPawns - sentePawns) + EJ("-pawn down for black.", "??????") : EJ("", "?????? ") + (evenPawns - sentePawns) + EJ("-pawn up for white.", "??????")
			else str += EJ("Equal.", "??????")
		}
		return str
	}

}

/*
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

		public static function numJapaneseToInt(v:String):int {
			var csa:int = 0;
			for each(var jp:String in v.split("")) {
				switch (jp) {
					case "???":
					case "???":
						csa += 1; break;
					case "???":
					case "???":
						csa += 2; break;
					case "???":
					case "???":
						csa += 3; break;
					case "???":
					case "???":
						csa += 4; break;
					case "???":
					case "???":
						csa += 5; break;
					case "???":
					case "???":
						csa += 6; break;
					case "???":
					case "???":
						csa += 7; break;
					case "???":
					case "???":
						csa += 8; break;
					case "???":
					case "???":
						csa += 9; break;
					case "???":
						csa += 10; break;
				}
			}
			return csa;
		}

	}

}
*/

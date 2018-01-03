"use strict"

class Tournament{
  constructor(data){
    this._data = data
  }

  name(){
    let name_en = this._data.name_en != "" ? this._data.name_en : null
    let name_ja = this._data.name_ja != "" ? this._data.name_ja : null
    return EJ(name_en || name_ja, name_ja || name_en)
  }

  nameShort(){
    return EJ(this._data.name_en_short, this._data.name_ja_short)
  }

  amJoined(){
    return this._data.joined
  }

  wait(){
    let side = 0
    if (this._data.turn == 1) side = 1
    else if (this._data.turn == 2) side = -1
    client.wait(this._data.gametype, this._data.total, this._data.byoyomi, side, "--" + this._data.id)
  }

  url(){
    return 'http://system.81dojo.com/' + EJ('en', 'ja') + '/tournaments/' + this._data.id
  }
}

"use strict"

class SoundPlayer{
  constructor(){
    this.chatEnabled = true
    this.buttonEnabled = true
    this.gameEndEnabled = true
    this.byoyomiType = 1

    this._channels = new Object()
    this._loadChannel("CHALLENGER", "challenger")
    this._loadChannel("CHIME", "chime")
    this._loadChannel("WIN", "win")
    this._loadChannel("LOSE", "lose")
  }

  static get CONST(){
    return {
      SOUND_PATH: 'sound',
      BYOYOMI_DIRECTORIES: ['', 'byoyomi01', 'byoyomi02', 'byoyomi03']
    }
  }

  sayByoyomi(){
    if (this.byoyomiType == 1) this.play("CHIME")

  }

  sayNumber(sec){
    //integer
    if (this.byoyomiType == 1) {
      if (sec > 0 && sec <= 5 || sec == 7 || sec == 9) this.play("CHIME")
    }
  }

  sayTimeUp(){

  }

  gameEnd(win){
    //boolean
    if (this.gameEndEnabled){
      this.play(win ? "WIN" : "LOSE")
    }
  }

  play(key){
    this._channels[key].play()
  }

  _loadChannel(key, file){
    this._channels[key] = new Audio(SoundPlayer.CONST.SOUND_PATH + "/" + file + ".mp3")
  }

}

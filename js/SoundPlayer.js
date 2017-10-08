"use strict"

class SoundPlayer{
  constructor(){
    this.chatLobbyEnabled = true
    this.chatBoardEnabled = true
    this.buttonEnabled = true
    this.gameStartEndEnabled = true
    this.byoyomiType = 1

    this._channels = new Object()
    this._loadChannel("CHALLENGER", "challenger")
    this._loadChannel("CHIME", "chime")
    this._loadChannel("GAME_START", "start")
    this._loadChannel("WIN", "win")
    this._loadChannel("LOSE", "lose")
    this._loadChannel("CHAT1", "chat_lobby")
    this._loadChannel("CHAT2", "chat_board")
    this._loadChannel("NOTIFY", "chat_notify")
    this._loadChannel("DOOR_OPEN", "fusuma_open")
    this._loadChannel("DOOR_CLOSE", "fusuma_close")
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

  chatLobby(){
    if (this.chatLobbyEnabled) this.play("CHAT1")
  }

  chatBoard(){
    if (this.chatBoardEnabled) this.play("CHAT2")
  }

  chatPrivate(currentLayer){
    if (currentLayer == 1 && this.chatLobbyEnabled || currentLayer == 2 && this.chatBoardEnabled) this.play("NOTIFY")
  }

  gameStart(){
    if (this.gameStartEndEnabled) this.play("GAME_START")
  }

  gameEnd(win){
    //boolean
    if (this.gameStartEndEnabled) this.play(win ? "WIN" : "LOSE")
  }

  door(open){
    //boolean
    if (this.chatBoardEnabled) this.play(open ? "DOOR_OPEN" : "DOOR_CLOSE")
  }

  play(key){
    this._channels[key].play()
  }

  _loadChannel(key, file){
    this._channels[key] = new Audio(SoundPlayer.CONST.SOUND_PATH + "/" + file + ".mp3")
  }

}

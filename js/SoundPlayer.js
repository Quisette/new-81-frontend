"use strict"

class SoundPlayer{
  constructor(){
    this.chatLobbyEnabled = true
    this.chatBoardEnabled = true
    this.buttonEnabled = true
    this.gameStartEndEnabled = true
    this.byoyomiType = 1

    this._channels = new Object()
    this._loadChannel("OPENING", "opening")
    this._channels["OPENING"].loop = true
    this._loadChannel("PIECE_NORMAL", "piece")
    this._loadChannel("PIECE_DOUBLE", "piece_double")
    this._loadChannel("CHALLENGER", "challenger")
    this._loadChannel("INVITATION", "invitation")
    this._loadChannel("CHIME", "chime")
    this._loadChannel("GAME_START", "start")
    this._loadChannel("WIN", "win")
    this._loadChannel("LOSE", "lose")
    this._loadChannel("CHAT1", "chat_lobby")
    this._loadChannel("CHAT2", "chat_board")
    this._loadChannel("NOTIFY", "chat_notify")
    this._loadChannel("DOOR_OPEN", "fusuma_open")
    this._loadChannel("DOOR_CLOSE", "fusuma_close")
    this._loadChannel("HOVER", "hover")
    this._loadChannel("CLICK_NORMAL", "click_normal")
    this._loadChannel("CLICK_CANCEL", "click_cancel")
    this._loadChannel("CLICK_EXEC", "click_exec")
  }

  static get CONST(){
    return {
      SOUND_PATH: 'sound',
      BYOYOMI_DIRECTORIES: ['', '', 'byoyomi01', 'byoyomi02', 'byoyomi03']
    }
  }

  setByoyomiType(v){
    this.byoyomiType = v
    if (v != 1) {
      let dir = SoundPlayer.CONST.BYOYOMI_DIRECTORIES[v]
      for (let i = 1; i <= 9; i++) {
        let key = (100 + i).toString().substr(1,2)
        this._loadChannel(key, dir + "/" + key)
      }
      for (let i = 10; i <= 50; i += 10) {
        let key = (100 + i).toString().substr(1,2)
        this._loadChannel(key, dir + "/" + key)
      }
      this._loadChannel("TIME_UP", dir + "/timeup")
      this._loadChannel("BYOYOMI_START", dir + "/byoyomi")
    }
  }

  piece(isDouble = false, volume = 1){
    let key = isDouble ? "PIECE_DOUBLE" : "PIECE_NORMAL"
    this._setVolume(key, volume)
    this.play(key)
  }

  sayByoyomi(){
    if (this.byoyomiType == 1) this.play("CHIME")
    else this.play("BYOYOMI_START")
  }

  sayNumber(sec){
    //integer
    if (this.byoyomiType == 1) {
      if (sec < 10 && sec >= 5 || sec == 3 || sec == 1) this.play("CHIME")
    } else {
      this.play((100 + sec).toString().substr(1,2))
    }
  }

  sayTimeUp(){
    if (this.byoyomiType != 1) this.play("TIME_UP")
  }

  chatLobby(){
    if (currentLayer == 1 && this.chatLobbyEnabled) this.play("CHAT1")
  }

  chatBoard(){
    if (this.chatBoardEnabled) this.play("CHAT2")
  }

  chatPrivate(){
    this.play("NOTIFY")
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

  startOpening(){
    this._setVolume("OPENING", 0)
    this.play("OPENING")
    $(this._channels["OPENING"]).animate({volume: 0.8}, 3000)
  }

  stopOpening(){
    let audio = this._channels["OPENING"]
    $(audio).animate({volume: 0}, 4000, function(){
      audio.pause()
    })
  }

  muteOpening(toggle){
    this._channels["OPENING"].muted = toggle
  }

  _setVolume(key, volume){
    this._channels[key].volume = volume
  }

  play(key){
    this._channels[key].currentTime = 0
    this._channels[key].play()
  }

  _loadChannel(key, file){
    this._channels[key] = new Audio(SoundPlayer.CONST.SOUND_PATH + "/" + file + ".mp3")
  }

  buttonHover(){
    if (this.buttonEnabled) this.play("HOVER")
  }

  buttonClick(clickType){
    if (this.buttonEnabled) this.play("CLICK_" + clickType)
  }

}

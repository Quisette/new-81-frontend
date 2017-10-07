"use strict";

class WebSocketClient {
  constructor(serverName, host, port, username, password){
    this._host = host;
    this._port = port;
    this.username = username;
    this._password = password;
    this._socket = null;
    this._callbackFunctions = new Object();
    this._buffer = new Object();
    this.serverName = serverName;
    this._readingGameSummary = false
    this.status = null // 0:connected, 1:challenging, 2:now-playing-my-game
    this.resignTime = 0
  }

  setCallbackFunctions(key, func){
    this._callbackFunctions[key] = func;
  }

  connect(){
    this._socket = new WebSocket("ws://" + this._host + ":" + this._port);
    var thisInstance = this;
    this._socket.onopen = function(e){
      thisInstance._handleSocketOpen();
    }
    this._socket.onmessage = function(e){
      console.log('Response: ' + e.data);
      var lines = e.data.split("\n");
      lines.forEach(function(line){
        if (currentLayer == 0) {
          if (line.match(/^##\[HANDSHAKE\](.+)$/)) {
            thisInstance._login(CybozuLabs.MD5.calc(config.clientPass + RegExp.$1));
          } else if (line.match(/^LOGIN:(.+)\sOK$/)){
            thisInstance._password = "";
            thisInstance._callbackFunctions["LOGGED_IN"](RegExp.$1);
          } else if (line.match(/LOGIN:incorrect ([A-Z]\d{3})/)){
            thisInstance._callbackFunctions["LOGIN_FAILED"](RegExp.$1);
          } else if (line.match(/LOGIN:incorrect/)){
            thisInstance._callbackFunctions["LOGIN_FAILED"]("L003");
          }
        } else if (thisInstance._readingGameSummary) {
          if (line == "END Game_Summary") thisInstance._readingGameSummary = false
          else thisInstance._storeBuffer("GAME_SUMMARY", line)
        } else {
          if (thisInstance.status == 2) { // when during my game
            if (line.match(/^%TORYO,T(\d+)$/)) {
              thisInstance.resignTime = parseInt(RegExp.$1)
              return
            } else if (line.match(/^([-+][0-9]{4}[A-Z]{2}),T(\d+)$/)) {
              thisInstance._callbackFunctions["MOVE"](RegExp.$1, parseInt(RegExp.$2))
              return
            } else if (line.match(/^#(WIN|LOSE|DRAW|RESIGN|TIME_UP|ILLEGAL_MOVE|SENNICHITE|OUTE_SENNICHITE|JISHOGI|DISCONNECT|CATCH|TRY)/)) {
              thisInstance._storeBuffer("GAME_END",RegExp.$1)
              if (RegExp.$1 == "WIN" || RegExp.$1 == "LOSE" || RegExp.$1 == "DRAW") {
                thisInstance.status = 0
                thisInstance._callbackWithBuffer("GAME_END")
              }
              return
            }
          } else { // when not playing game
            if (line == "BEGIN Game_Summary") {
              thisInstance._readingGameSummary = true
              return
            } else if (line.match(/^START\:/)) {
              thisInstance.status = 2
              thisInstance._storeBuffer("GAME_SUMMARY", line)
              thisInstance._callbackWithBuffer("GAME_SUMMARY")
              return
    			  } else if (line.match(/^##\[CHALLENGE\]\[(.+)\]$/)) {
    				  thisInstance._callbackFunctions["CHALLENGE"](RegExp.$1)
              return
    			  } else if (line.match(/^##\[ACCEPT\](.*)$/)) {
    				  thisInstance._callbackFunctions["ACCEPT"](RegExp.$1)
              return
    			  } else if (line.match(/^##\[DECLINE\](.*)$/)) {
    				  thisInstance._callbackFunctions["DECLINE"](RegExp.$1)
              return
            } else if (line.match(/^##\[MONITOR2\]\[(.*)\]\s(.+)$/)) {
              if (RegExp.$2 == "+OK") thisInstance._callbackWithBuffer("MONITOR")
              else if (RegExp.$2 == "V2") thisInstance._storeBuffer("MONITOR", "kifu_id:" + RegExp.$1)
              else thisInstance._storeBuffer("MONITOR", RegExp.$2)
              return
            }
          }
          // all timing
          if (line.match(/^##\[CHAT\]\[(.+)\]\s(.+)$/)) {
            thisInstance._callbackFunctions["CHAT"](RegExp.$1, RegExp.$2)
          } else if (line.match(/^##\[GAMECHAT\]\[(.+)\]\s(.+)$/)) {
            thisInstance._callbackFunctions["GAMECHAT"](RegExp.$1, RegExp.$2)
      		} else if (line.match(/^##\[PRIVATECHAT\]\[(.+)\]\s(.+)$/)) {
            thisInstance._callbackFunctions["PRIVATECHAT"](RegExp.$1, RegExp.$2)
          } else if (line.match(/^##\[MILE\](.+)$/)) {
            thisInstance._callbackFunctions["MILE"](RegExp.$1)
          } else if (line.match(/^##\[EXP\](.+)$/)) {
            thisInstance._callbackFunctions["EXP"](RegExp.$1)
          } else if (line.match(/^##\[LOBBY_IN\](.+)$/)) {
            thisInstance._callbackFunctions["LOBBY_IN"](RegExp.$1)
          } else if (line.match(/^##\[LOBBY_OUT\]\[(.+)\]$/)) {
            thisInstance._callbackFunctions["LOBBY_OUT"](RegExp.$1)
          } else if (line.match(/^##\[ENTER\]\[(.+)\]$/)) {
            thisInstance._callbackFunctions["ENTER"](RegExp.$1);
          } else if (line.match(/^##\[LEAVE\]\[(.+)\]$/)) {
            thisInstance._callbackFunctions["LEAVE"](RegExp.$1)
          } else if (line.match(/^##\[DISCONNECT\]\[(.+)\]$/)) {
            thisInstance._callbackFunctions["DISCONNECT"](RegExp.$1)
          } else if (line.match(/^##\[WHO2\]\s(.+)$/)){
            if (RegExp.$1 == "+OK") thisInstance._callbackWithBuffer("WHO")
            else thisInstance._storeBuffer("WHO", RegExp.$1)
          } else if (line.match(/^##\[LIST\]\s(.+)$/)){
            if (RegExp.$1 == "+OK") thisInstance._callbackWithBuffer("LIST")
            else thisInstance._storeBuffer("LIST", RegExp.$1)
  			  } else if (line.match(/^##\[GAME\](.*)$/)) {
  				  thisInstance._callbackFunctions["GAME"](RegExp.$1)
  			  } else if (line.match(/^##\[START\]\[(.*)\]$/)) {
  				  thisInstance._callbackFunctions["START"](RegExp.$1)
  			  } else if (line.match(/^##\[RESULT\](.*)$/)) {
  				  thisInstance._callbackFunctions["RESULT"](RegExp.$1)
          } else if (line.match(/^##\[ERROR\](.+)$/)) {
            thisInstance._callbackFunctions["ERROR"](RegExp.$1)
          }
        }
      });
    }
    this._socket.onerror = function(e){
      $('#loginAlert').text(i18next.t("code.L005"))
    }
    this._socket.onclose = function(e){
      console.log('Connection closed.');
      thisInstance._callbackFunctions["CLOSED"]();
    }
  }

  _callbackWithBuffer(key){
    if (this._buffer[key] == undefined || this._buffer[key] == "") return
    this._callbackFunctions[key](this._buffer[key])
    this._buffer[key] = ""
  }

  _storeBuffer(key, line){
    if (this._buffer[key] == null) this._buffer[key] = ""
    this._buffer[key] += line + "\n"
  }

  _handleSocketOpen(){
    console.log('connected');
  }

  _login(clientPass){
    $('#loginAlert').text(i18next.t("login.logging"))
    this.send("LOGIN  " + this.username + " " + this._password + " x2 " + clientPass);
  }

  who(first = false){
    this.send("%%WHO2" + (first ? "FIRST" : ""));
  }

  list(){
    this.send("%%LIST");
  }

  chat(str){
    this.send("%%CHAT " + str)
  }

  gameChat(message, game_id = null) {
    if (game_id == null) {
      this.send("%%GAMECHAT : " + message)
    } else {
      this.send("%%GAMECHAT " + game_id + " " + message)
    }
  }

  privateChat(sendTo, message){
    //string, string
    this.send("%%PRIVATECHAT " + sendTo + " " + message)
  }

  wait(rule, total, byoyomi, side=0, tournament="", comment="", password="") {
    //string, int, int
    //if (password != "") password = "." + generateMD5Hex(Config.PRIVATE_ROOM_SALT + password).substr(0,6);
  	let wait_gamename = rule + "_" + this.username + password + tournament + "-" + total.toString() + "-" + byoyomi.toString() + (comment == "" ? "" : ("," + comment))
    let side_code = "*"
    if (side > 0) {
      side_code = "+"
    } else if (side < 0) {
      side_code = "-"
    } else if (Math.round(Math.random()) == 1) {
      side_code = "+"
    } else {
      side_code = "-"
    }
    this.send("%%GAME " + wait_gamename + ' ' + side_code)
  }

  challenge(user){
    this.send("%%CHALLENGE " + user.name)
  }

  accept(){
    this.send("ACCEPT")
  }

  decline(comment = null){
		this.send("DECLINE" + (comment ? (" " + comment) : ""))
  }

	stopWaiting() {
		this.send("%%GAME")
	}

  move(move){
    this.send(move.toCSA())
  }

  resign(){
    this.send("%TORYO")
  }

  closeGame(){
    this.send("CLOSE")
  }

  timeout(){
    this.send("%%%TIMEOUT")
  }

  monitor(game_name, onoff){
    //string, Boolean(on: true, off: false)
    this.send("%%MONITOR2" + (onoff ? "ON " : "OFF ") + game_name)
  }

  send(str){
    this._socket.send(str);
    console.log("Sent: " + str)
  }

  close(){
    this._socket.close();
  }
}

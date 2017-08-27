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
            thisInstance._login(CybozuLabs.MD5.calc('shogijapan' + RegExp.$1));
          } else if (line.match(/^LOGIN:(.+)\sOK$/)){
            thisInstance._password = "";
            thisInstance._callbackFunctions["LOGGED_IN"](RegExp.$1);
          } else if (line.match(/LOGIN:incorrect ([A-Z]\d{3})/)){
            thisInstance._callbackFunctions["LOGIN_FAILED"](RegExp.$1);
          } else if (line.match(/LOGIN:incorrect/)){
            thisInstance._callbackFunctions["LOGIN_FAILED"]("L003");
          }
        } else {
          if (line.match(/^##\[CHAT\]\[(.+)\]\s(.+)$/)) {
            thisInstance._callbackFunctions["CHAT"](RegExp.$1, RegExp.$2);
          } else if (line.match(/^##\[MILE\](.+)$/)) {
            thisInstance._callbackFunctions["MILE"](RegExp.$1);
          } else if (line.match(/^##\[EXP\](.+)$/)) {
            thisInstance._callbackFunctions["EXP"](RegExp.$1);
          } else if (line.match(/^##\[LOBBY_IN\](.+)$/)) {
            thisInstance._callbackFunctions["LOBBY_IN"](RegExp.$1);
          } else if (line.match(/^##\[LOBBY_OUT\]\[(.+)\]$/)) {
            thisInstance._callbackFunctions["LOBBY_OUT"](RegExp.$1);
          } else if (line.match(/^##\[ENTER\]\[(.+)\]$/)) {
            thisInstance._callbackFunctions["ENTER"](RegExp.$1);
          } else if (line.match(/^##\[LEAVE\]\[(.+)\]$/)) {
            thisInstance._callbackFunctions["LEAVE"](RegExp.$1);
          } else if (line.match(/^##\[DISCONNECT\]\[(.+)\]$/)) {
            thisInstance._callbackFunctions["DISCONNECT"](RegExp.$1);
          } else if (line.match(/^##\[WHO2\]\s(.+)$/)){
            if (RegExp.$1 == "+OK") thisInstance._callbackWithBuffer("WHO");
            else thisInstance._storeBuffer("WHO", RegExp.$1)
          } else if (line.match(/^##\[LIST\]\s(.+)$/)){
            if (RegExp.$1 == "+OK") thisInstance._callbackWithBuffer("LIST");
            else thisInstance._storeBuffer("LIST", RegExp.$1)
  			  } else if (line.match(/^##\[GAME\](.*)$/)) {
  				  thisInstance._callbackFunctions["GAME"](RegExp.$1)
  			  } else if (line.match(/^##\[START\]\[(.*)\]$/)) {
  				  thisInstance._callbackFunctions["START"](RegExp.$1)
  			  } else if (line.match(/^##\[CHALLENGE\]\[(.+)\]$/)) {
  				  thisInstance._callbackFunctions["CHALLENGE"](RegExp.$1)
  			  } else if (line.match(/^##\[ACCEPT\](.*)$/)) {
  				  thisInstance._callbackFunctions["ACCEPT"](RegExp.$1)
  			  } else if (line.match(/^##\[DECLINE\](.*)$/)) {
  				  thisInstance._callbackFunctions["DECLINE"](RegExp.$1)
  			  } else if (line.match(/^##\[RESULT\](.*)$/)) {
  				  thisInstance._callbackFunctions["RESULT"](RegExp.$1)
          } else if (line.match(/^##\[ERROR\](.+)$/)) {
            thisInstance._callbackFunctions["ERROR"](RegExp.$1);
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
    this._socket.send("LOGIN  " + this.username + " " + this._password + " x2 " + clientPass);
  }

  who(first = false){
    this._socket.send("%%WHO2" + (first ? "FIRST" : ""));
  }

  list(){
    this._socket.send("%%LIST");
  }

  chat(str){
    this._socket.send("%%CHAT " + str)
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

  accept(){
    this.send("ACCEPT")
  }

  decline(comment = null){
		this.send("DECLINE" + (comment ? (" " + comment) : ""))
  }

	stopWaiting() {
		this.send("%%GAME")
	}

  send(str){
    this._socket.send(str);
    console.log("Sent: " + str)
  }

  close(){
    this._socket.close();
  }
}

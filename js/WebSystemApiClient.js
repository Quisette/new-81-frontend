"use strict";

class WebSystemApiClient {
  constructor(host, port){
    this._path = "http://" + host + ":" + port + "/api/v2/"
    //this._path = "http://192.168.220.131:3000/api/v2/"
    this._callbackFunctions = new Object();
  }

  setCallbackFunctions(key, func){
    this._callbackFunctions[key] = func;
  }

  _callJsonApi(key, path, arg1 = null){
    let thisInstance = this
    console.log('Sent: ' + path)
    $.getJSON(this._path + path, function(data){
      console.log('Response: ' + JSON.stringify(data))
      if (arg1 == null) {
        thisInstance._callbackFunctions[key](data)
      } else {
        thisInstance._callbackFunctions[key](data, arg1)
      }
    })
  }

  getServers(){
    this._callJsonApi("SERVERS", "servers.json")
  }

  getOptions(){
    if (me.isGuest) return
    this._callJsonApi("OPTIONS", "options.json?name=" + me.name.toLowerCase())
  }

  getPlayerDetail(user){
    if (user.isGuest) return
    this._callJsonApi("PLAYER", "players/detail/" + user.name + ".json", user.name)
  }

  getTournaments(){
    let name = me.isGuest ? "GUEST" : me.name
    this._callJsonApi("TOURNAMENTS", "tournaments.json?player_name=" + name)
  }

  checkTournamentOpponent(tournamentId, opponent){
    this._callJsonApi("CHECK_OPPONENT", "tournaments/" + tournamentId + "/check_game.json?name=" + me.name + "&opponent=" + opponent, opponent)
  }

	getEvaluation(name){
    if (me.isGuest) return
    if (/^GUEST_[0-9a-z]{6}$/.test(name)) return
    this._callJsonApi("EVALUATION", "players/get_evaluation.json?name=" + name)
	}

  postEvaluation(name, like){
    if (me.isGuest) return
    $.post(this._path + "players/evaluate.xml", {like: like, name: me.name.toLowerCase(), opponent: name.toLowerCase()}, function(){})
  }

  postOption(key, val){
    if (me.isGuest) return
    $.post(this._path + "options", {name: me.name.toLowerCase(), key: key, value: val}, function(){})
  }

}

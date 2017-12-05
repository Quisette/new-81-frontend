"use strict";

class WebSystemApiClient {
  constructor(host, port){
    this._path = "http://" + host + ":" + port + "/api/v2/"
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
    this._callJsonApi("OPTIONS", "options.json?name=" + me.name.toLowerCase())
  }

  getPlayerDetail(user){
    this._callJsonApi("PLAYER", "players/detail/" + user.name + ".json", user.name)
  }

  postOption(key, val){
    //TODO return if guest
    $.post(this._path + "options", {name: me.name.toLowerCase(), key: key, value: val}, function(){})
  }

}

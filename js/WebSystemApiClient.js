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
    $.getJSON(this._path + path, function(data){
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

}

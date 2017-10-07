var cache_key = "0"
$.get("dat/cache_key.txt", function(data){
  cache_key = data
})
function _jsinclude(path){
  document.write('<script src="' + path + '?' + cache_key + '"></script>')
}
_jsinclude("js/Piece.js")
_jsinclude("js/Movement.js")
_jsinclude("js/Position.js")
_jsinclude("js/GameTimer.js")
_jsinclude("js/SoundPlayer.js")
_jsinclude("js/Board.js")
_jsinclude("js/Country.js")
_jsinclude("js/User.js")
_jsinclude("js/Game.js")
_jsinclude("js/WebSocketClient.js")
_jsinclude("js/WebSystemApiClient.js")
_jsinclude("js/util.js")
_jsinclude("js/main.js")

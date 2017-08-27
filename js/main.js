"use strict";
const IMAGE_DIRECTORY = "http://81dojo.com/dojo/images/"
var client = null;
var apiClient = null;
var currentLayer = 0;
var isGuest = false;
var mileage;
var serverGrid;
var playerGrid;
var waiterGrid;
var gameGrid;
var watcherGrid;
var users = new Object();
var playerInfoWindows = new Object();
var me;
var premium;
var countries = new Object();
var board;
var hidden_prm;

/* ====================================
    On document.ready
===================================== */

$(function(){
  // Generate board
  board = new Board($('#boardBox'))

  // Load data
  let xhr = new XMLHttpRequest()
  xhr.addEventListener("load", function(){
    xhr.responseText.split("\n").forEach(function(line){
      let tokens = line.split("\t")
      countries[tokens[0]] = new Country(parseInt(tokens[0]), tokens[1], tokens[4], tokens[2])
    })
  })
  xhr.open("get", "dat/countries.txt")
  xhr.send()

  // Internationalization
  i18next.language = "ja"
  i18next.use(i18nextXHRBackend).init({
    lng: 'ja',
    fallbackLng: 'ja',
    debug: true,
    backend: {
      loadPath: "locales/{{lng}}.json"
    }
  }, function(err, t) {
    _updateLanguage()
  });

  i18next.on('languageChanged', () => {
    _updateLanguage()
  })

  serverGrid = $('#serverGrid').DataTable({
    data: [],
    columns: [
      {data: "name", width: "35%", className: "dt-body-left", bSortable: false,
        render: function(data){return '<img class="inline" src="img/' + data + '.png"> ' + data}},
      {data: "description_ja", width: "35%", bSortable: false},
      {data: "population", width: "35%", bSortable: false}
    ],
    rowId: "name",
    searching: false, paging: false, info: false,
    order: false,
    select: true,
    oLanguage: {sEmptyTable: "Loading..."}
  })
  serverGrid.clear()

  playerGrid = $('#playerGrid').DataTable({
    data: [],
    columns: [
      {data: "statStr", width: "10%"},
      {data: "title", width: "14%"},
      {data: "rank", width: "14%", bSortable: false},
      {data: "name", width: "40%", className: "dt-body-left"},
      {data: "country", width: "12%", className: "dt-body-left"},
      {data: "rate", width: "10%", className: "dt-body-right"}
    ],
    rowId: "name",
    searching: false, paging: false, info: false,
    select: true,
    order: [[5, 'desc']],
    oLanguage: {sEmptyTable: EJ("Loading...", "読込中...")}
  })
  playerGrid.clear()

  waiterGrid = $('#waiterGrid').DataTable({
    data: [],
    columns: [
      {data: "waiter", width: "50%", className: "dt-body-left"},
      {data: "rate", width: "10%", className: "dt-body-right"},
      {data: "ruleStr", width: "27%"},
      {data: "timeStr", width: "13%"}
    ],
    rowId: "name",
    searching: false, paging: false, info: false,
    select: true,
    order: [[1, 'desc']],
    oLanguage: {sEmptyTable: EJ("No player is waiting", "対局待プレーヤがいません")}
  })
  waiterGrid.clear()

  gameGrid = $('#gameGrid').DataTable({
    data: [],
    columns: [
      {data: "senteStr", width: "29%", className: "dt-body-left", bSortable: false},
      {data: "goteStr", width: "29%", className: "dt-body-right", bSortable: false},
      {data: "ruleShort", width: "16%", bSortable: false},
      {data: "moves", width: "7%", bSortable: false},
      {data: "watchers", width: "7%", bSortable: false},
      {data: "opening", width: "12%", bSortable: false}
    ],
    searching: false, paging: false, info: false,
    select: true,
    order: false,
    oLanguage: {sEmptyTable: EJ("No game room found.", "対局がありません")}
  })
  gameGrid.clear()

  // Load localStorage
  if (localStorage.login) $('#usernameInput').val(localStorage.login)
  if (localStorage.dat) $('#passwordInput').val(decaesar(decaesar(localStorage.dat, 81), 3))
  if (localStorage.save) $('#loginSave').prop('checked', localStorage.save == 'true')

  // Event listeners
  $("#lobbyChatInput").on('keyup', function(e){
    if (e.keyCode == 13){
      if ($(this).val().length > 0) {
        client.chat($(this).val())
        $(this).val('')
      }
    }
  })

  // Do in every relogin

  //  apiClient = new WebSystemApiClient("192.168.220.131", 3000)
  apiClient = new WebSystemApiClient("system.81dojo.com", 80)
  apiClient.setCallbackFunctions("SERVERS", _handleServers)
  apiClient.getServers()

//  _switchLayer(2)
});

/* ====================================
    On window.resize
===================================== */

window.onresize = function () {
};

/* ====================================
    Login View functions
===================================== */

function _languageSelected(){
  i18next.changeLanguage($('#languageSelector').val())
}

function _updateLanguage(){
  $("[data-i18n]").each(function(){
    $(this).text(i18next.t($(this).attr('data-i18n')))
  })
  $("[data-i18n-value]").each(function(){
    $(this).val(i18next.t($(this).attr('data-i18n-value')))
  })
  $("[data-i18n-title]").each(function(){
    $(this).attr('title', i18next.t($(this).attr('data-i18n-title')))
  })
  $('#newGameRuleSelect').empty()
  if (i18next.language == "ja") {
    Object.keys(HANDICAPS_JA).forEach(function(key){
      if (key == "r" || key == "vazoo") return true
      $('#newGameRuleSelect').append($("<option />").val(key).text(HANDICAPS_JA[key]))
    })
  }
}

function _loginTypeChange(){
  isGuest = $('input[name=loginType]:checked').val() == 1
  $('#usernameInput').attr('disabled', isGuest)
  $('#passwordInput').attr('disabled', isGuest)
}

function _loginButtonClick(){
  let server = serverGrid.row({selected: true}).data()
  if (server == null){
    alert('Please select a server.')
    return
  }
  $('#loginButton').attr('disabled', true)
  if (client != null) client.close();
  $('#loginAlert').text(i18next.t("login.connecting"))
  client = new WebSocketClient(server.name, server.host, server.port, isGuest ? 'guest' : $('#usernameInput').val(), isGuest ? 'dojo_guest' : $('#passwordInput').val());
  client.setCallbackFunctions("LOGGED_IN", _handleLoggedIn)
  client.setCallbackFunctions("LOGIN_FAILED", _handleLoginFailed)
  client.setCallbackFunctions("LOBBY_IN", _handleLobbyIn)
  client.setCallbackFunctions("LOBBY_OUT", _handleLobbyOut)
  client.setCallbackFunctions("CHAT", _handleChat)
  client.setCallbackFunctions("ERROR", _handleGeneralResponse)
  client.setCallbackFunctions("CLOSED", _handleClosed)
  client.setCallbackFunctions("WHO", _handleWho)
  client.setCallbackFunctions("LIST", _handleList)
  client.setCallbackFunctions("GAME", _handleGame)
  client.setCallbackFunctions("CHALLENGE", _handleChallenger)
  client.setCallbackFunctions("START", _handleStart)
  client.connect();
}

/* ====================================
    Lobby View functions
===================================== */

function _refreshButtonClick(){
  client.who()
  client.list()
}

function _waitButtonClick(){
  $('#modalNewGame').modal({
    focus: false,
    persist: true,
    onOpen: function(dialog){
      dialog.overlay.fadeIn(300)
      dialog.container.fadeIn(300)
      dialog.data.fadeIn(300)
    }
  })
}

function writeUserMessage(str, layer, clr = null, bold = false, lineChange = true){
  let area
  if (layer == 1) {
    area = $('#lobbyMessageArea')
  } else if (layer == 2) {
    area = $('#boardMessageArea')
  }
  $('<span></span>',{}).css({
    'color': (clr ? clr : ''),
    'font-weight': (bold ? 'bold' : '')
  }).text(str).appendTo(area)
  if (lineChange) area.append('<br>')
}

/* ====================================
    Board View functions
===================================== */

function _rematchButtonClick(){
  board.loadNewPosition()
}

/* ====================================
    Modal View functions
===================================== */

function _handleNewGame(){
  let val = $('input[name="newGameType"]:checked').val()
  if (val == 1) {
    client.wait("r", 900, 60)
  } else if (val == 2) {
    client.wait("r", 600, 30)
  } else if (val == 3) {
    client.wait("r", 300, 30)
  } else if (val == 4) {
    client.wait("r", 0, 30)
  } else if (val == 5) {
    let ruleType = $("#newGameRuleSelect option:selected").val()
    client.wait(ruleType, 60 * $("#newGameTotalSelect option:selected").val(), $("#newGameByoyomiSelect option:selected").val(), ruleType.match(/^hc_/) ? -1 : 0)
  } else if (val == 6) {

  } else if (val == 7) {

  } else if (val == 8) {
    client.stopWaiting()
  }
}

function _handleAcceptChallenge(){
	client.accept();
//	_gameAccepted = true;
//	_acceptedCancelTimer.reset();
//	_acceptedCancelTimer.start();
//	if (_mileForFix > 0) {
//		_client.mileage( -_mileForFix);
//		_mileForFix = 0;
//	}
}

function _handleRejectChallenge(challenger, declineCode = null){
	client.decline(declineCode)
	writeUserMessage(EJ("Rejected the challenge from " + challenger.name + ".", challenger.name + "さんからの挑戦をパスしました。"), 1, "#008800", true)
}

/* ====================================
    Server message handlers
===================================== */

function _handleGeneralResponse(tokens){
  console.log('Event received: ' + tokens)
}

function _handleLoggedIn(str){
  $('#loginAlert').text(i18next.t("login.successfull"))
  if (!isGuest) {
    localStorage.login = $('#usernameInput').val()
    localStorage.dat = caesar(caesar($('#passwordInput').val(), 3), 81)
    localStorage.save = $('#loginSave').prop('checked')
  }
  _switchLayer(1)
  $('#serverLogo').prop('src', 'img/' + client.serverName + '.png')
  $('#header-serverName').text(client.serverName + " : ")
  let tokens = str.split(":")
  client.username = tokens[0]
  users[client.username] = new User(client.username)
  me = users[client.username]
  me.setFromLogin(tokens)
  mileage = tokens[12]
  premium = makePremiumNum(parseInt(tokens[13]),tokens[14])
  hidden_prm = premium
  $('#header-playerName').text(me.name + " : ")
  $('#header-rate').text("R" + me.rate + " : ")
  $('#header-mile').text(mileage + EJ(" D-Miles : ", " Dマイル : "))
  $('#header-premium').text(makePremiumName(premium) + EJ(" class", " クラス"))
  client.who(true)
  client.list()
}

function _handleLoginFailed(code){
  $('#loginAlert').text(i18next.t(code))
  $('#loginButton').attr('disabled', false)
}

function _handleWho(str){
  let lines = str.trim().split("\n")
  lines.forEach(function(line){
    let tokens = line.split(",")
    let username = tokens.shift()
    if (users[username] == null) users[username] = new User(username)
    users[username].setFromWho(tokens)
  })
  playerGrid.clear()
  waiterGrid.clear()
  Object.keys(users).forEach(function(key){
    playerGrid.row.add(users[key].gridObject())
    if (users[key].listAsWaiter()) waiterGrid.row.add(users[key].gridObject())
  })
  playerGrid.draw()
  waiterGrid.draw()
}

function _handleList(str){
  let n = 0
  let lines = str.trim().split("\n")
  let games = []
  lines.forEach(function(line){
    n += 1
    let tokens = line.split(" ")
		let black = users[tokens[0].split("+")[2]]
		if (!black) {
			black = new User(tokens[0].split("+")[2])
			if (tokens[0].match(/^STUDY\+/)) black.countryCode = 1
			else black.setFromList(tokens[2], parseInt(tokens[4]))
		}
		let white = users[tokens[0].split("+")[3]]
		if (!white) {
			white = new User(tokens[0].split("+")[3])
			if (tokens[0].match(/^STUDY\+/)) white.countryCode = 2
			else white.setFromList(tokens[3], parseInt(tokens[5]))
		}
		let game = new Game(n, tokens[0], black, white);
		game.setFromList(parseInt(tokens[1]), tokens[6], tokens[7] == "true", tokens[8] == "true", parseInt(tokens[9]), tokens[10])
    games.push(game)
  })
  gameGrid.clear()
  games.forEach(function(g){
    gameGrid.row.add(g.gridObject())
  })
  gameGrid.draw()
}

function _handleLobbyIn(line){
	let tokens = line.split(",");
  let rank = ""
  let name = tokens[0]
	if (tokens[2] == "true" && parseInt(tokens[1]) < RANK_THRESHOLDS[0]) {
		rank = EJ("A new player", "新鋭棋士");
	} else {
		rank = EJ("A ", "") + makeRankFromRating(parseInt(tokens[1]));
	}
  // TODO If title holder, change rank
	// TODO var isOpponent:Boolean = _tournament_opponent_list.indexOf(tokens[0]) >= 0;
	let mobile = tokens[12] != null && tokens[12].match(/81AR/);
	if (_isFavorite(name) || _isColleague(name) || parseInt(tokens[1]) >= RANK_THRESHOLDS[3] || parseInt(tokens[6]) >= 7 || (users.length < 40 && name != me.name)) {
		writeUserMessage("  -  " + _name2link(name) + EJ(" logged in" + (mobile ? " via mobile" : "") + ". " + rank + " from " + countries[parseInt(tokens[3])].name_en + "." + (parseInt(tokens[6]) >= 3 ? "　Now on " + tokens[6] + "-win streak!" : ""), " さんが" + (mobile ? "モバイルから" : "") + "ログインしました。 (" + countries[parseInt(tokens[3])].name_ja + ", " + rank + ")" + (parseInt(tokens[6]) >= 3 ? "　現在" + tokens[6] + "連勝中!" : "")), 1, "#008800", _isFavorite(name) || _isColleague(name));
		// TODO if (mainViewStack.selectedIndex == 1 && _chat_sound1_play) {
	}
	let add = false;
	if (name == me.name) return;
	if (!users[name]) {
		users[name] = new User(name);
		add = true;
	} else {
		// TODO users[name].initialize();
	}
	users[name].setFromLobbyIn(parseInt(tokens[1]), parseInt(tokens[3]))
	// TODO if (isMobile) _users[tokens[0]].isMobile = true;
	// TODO if (isFavorite) _users[tokens[0]].markFavorite();
	// TODO if (isColleague) _users[tokens[0]].markColleague();
	// TODO if (isOpponent) _users[tokens[0]].markTournamentOpponent();
	if (add) {
		// TODO serverLabel.text = serverName + LanguageSelector.EJ(" : ", "サーバ : ") + LanguageSelector.lan.lobby + LanguageSelector.EJ(" (", " (ログイン数 ") + _user_list.length + LanguageSelector.EJ(" players)", "名)");
	}
  playerGrid.row.add(users[name].gridObject()).draw()
}

function _handleLobbyOut(name){
	if (currentLayer == 1) {
		if (_isFavorite(name) || _isColleague(name)) {
			writeUserMessage("  -  " + name + i18next.t("code.G031"), 1, "#008800")
			// TODO if (isFavorite && _chat_sound1_play) _sound_door_close.play();
		}
	}
  playerGrid.row("#" + name).remove().draw()
  waiterGrid.row("#" + name).remove().draw()
	// TODO serverLabel.text = serverName + LanguageSelector.EJ(" : ", "サーバ : ") + LanguageSelector.lan.lobby + LanguageSelector.EJ(" (", " (ログイン数 ") + _user_list.length + LanguageSelector.EJ(" players)", "名)");
	delete users[name];
}

function _handleGame(line) {
	if (line.match(/^\[(.+)\]$/)) {
    let name = RegExp.$1
		if (users[name]) {
			users[name].setFromGame("*", "*", "")
			if (playerInfoWindows[name]) playerInfoWindows[name].disableChallenge()
		}
    waiterGrid.row('#' + name).remove().draw()
	} else {
		let tokens = line.match(/^([0-9a-z]+?)_(.*)-([0-9]*)-([0-9]*),/)
		if (tokens[2].match(/^@/)) return
		if (tokens[2].match(/\-\-/)) {
			name = tokens[2].split("--")[0]
		} else {
			name = tokens[2].split(".")[0]
		}
		tokens = line.match(/(.+),(\+|\-|\*),(.+)$/)
		if (users[name]) users[name].setFromGame(tokens[1], tokens[2], tokens[3] == "*" ? "" : tokens[3])
    waiterGrid.row('#' + name).remove().draw()
    waiterGrid.row.add(users[name].gridObject()).draw()
	}
  playerGrid.row('#' + name).data(users[name].gridObject()).draw()
}

function _handleChallenger(name){
  $("#modalChallenger").modal({
    onOpen: function(dialog){
      dialog.overlay.fadeIn(300)
      dialog.container.fadeIn(300)
      dialog.data.fadeIn(300)
      _initModalChallenger(users[name])
    }
  })
}

function _handleStart(game_id){
	let tokens = game_id.split("+")
	let game_info = tokens[1].match(/^([0-9a-z]+?)_(.*)-([0-9]*)-([0-9]*)$/)
  let game
//	var autoEnterStudy:Boolean = false;
	if (tokens[0] == "STUDY") {
    /*
		_writeUserMessage("<a href=\"event:game," + e.message + "\">" + game_info[2].split(".")[0] + LanguageSelector.EJ(" CREATED STUDY ROOM.</a>\n", " さんが検討室を作成しました。</a>\n"), 1, "#008800");
		if (_chat_sound1_play && mainViewStack.selectedIndex == 1) _sound_chat1.play();
    */
		let black = new User(tokens[2])
		black.setFromStudy(true)
		var white = new User(tokens[3])
		white.setFromStudy(false)
		game = new Game(0, game_id, black, white);
//		if (game_info[2].split(".")[0] == login_name) autoEnterStudy = true;
	} else {
    /*
		var gameKind:String;
		else gameKind = LanguageSelector.EJ(InfoFetcher.gameTypeEn(game_info[1]), InfoFetcher.gameType(game_info[1]));
    */
		writeUserMessage(EJ("GAME STARTED: ▲", "新規対局: ☗") + tokens[2] + EJ(" vs △", " 対 ☖") + tokens[3] + " / " + EJ(HANDICAPS_EN[game_info[1]], HANDICAPS_JA[game_info[1]]), 1, "#008800")
		if (users[tokens[2]]) {
      users[tokens[2]].setFromStart(tokens[1], "+")
      playerGrid.row("#" + tokens[2]).remove()
      playerGrid.row.add(users[tokens[2]].gridObject())
      waiterGrid.row("#" + tokens[2]).remove()
    }
		if (users[tokens[3]]) {
      users[tokens[3]].setFromStart(tokens[1], "-")
      playerGrid.row("#" + tokens[3]).remove()
      playerGrid.row.add(users[tokens[3]].gridObject())
      waiterGrid.row("#" + tokens[3]).remove()
    }
    playerGrid.draw()
    waiterGrid.draw()
		game = new Game(0, game_id, users[tokens[2]], users[tokens[3]])
	}
  gameGrid.row.add(game.gridObject())
  gameGrid.draw()
  /*
	if (autoEnterStudy) {
		_watch_game = _games[e.message];
		_execute_watch();
	}
  */
}

function _handleChat(sender, message){
	if (message.match(/^\[\#\#BROADCAST\](.+)$/)) {
    // TODO
    return;
	}
  // TODO: if in ignore list
	if (message.match(/^\[\#\#WINS\](\d+)$/)) {
		writeUserMessage(_name2link(sender) + EJ(" has won ", "さんが通算") + parseInt(RegExp.$1) + EJ(" games!", "勝を達成しました!"), 1, "#008800", true);
//		if (currentLayer == 1 && _chat_sound1_play) _sound_chat1.play();
		return;
	}
	if (message.match(/^\[\#\#EXP\](.+),(\d+)$/)) {
//		writeUserMessage(_name2link(sender) + EJ(" is promoted to " + makeRank34FromExp(parseInt(RegExp.$2)) + " class in " + (RegExp.$1 == "nr" ? "10-sec Shogi" : gameTypeShort(RegExp.$1)) + "!", "さん、" + (RegExp.$1 == "nr" ? "10秒将棋" : gameTypeShort(RegExp.$1)) + "で " + makeRank34FromExp(parseInt(RegExp.$2)) + " に昇格!!"), 1, "#008800", true);
//		if (currentLayer == 1 && _chat_sound1_play) _sound_chat1.play();
		return;
	}
	if (message.match(/^\[\#\#INFONEW\]/)) {
		return;
	}
	if (message.match(/^\[##.+\]/)) return;
	if (_isFavorite(sender)) {
		writeUserMessage("[" + _name2link(sender) + "] " + message, 1, "#DD7700");
	} else if (_isColleague(sender)) {
		writeUserMessage("[" + _name2link(sender) + "] " + message, 1, "#550066");
	} else if (message.match(/\[auto\-chat\]/)) {
		writeUserMessage("[" + _name2link(sender) + "] " + message, 1, "#888888");
	} else if (sender == me.name) {
		writeUserMessage("[" + _name2link(sender) + "] " + message, 1, "#0033DD");
	} else {
		writeUserMessage("[" + _name2link(sender) + "] " + message, 1, "#000000");
	}
//	if (mainViewStack.selectedIndex == 1 && _chat_sound1_play) _sound_chat1.play();
}

function _handleClosed(){
  $('#loginAlert').text(i18next.t("login.closed"))
  $('#loginButton').attr('disabled', false)
  $('#loginButton').attr('value', i18next.t("login.relogin"))
  _switchLayer(0)
  users = new Object()
  playerGrid.clear().draw()
  waiterGrid.clear().draw()
  gameGrid.clear().draw()
}

/* ====================================
    Web System API response handlers
===================================== */

function _handleServers(data){
  serverGrid.clear()
  serverGrid.rows.add(data)
  serverGrid.draw()
  serverGrid.row("#MOON").select()
}

/* ====================================
    General
===================================== */

function _switchLayer(n){
  if (n == 0) {
    $('div#layerLogin').css('display', 'initial')
    $('div#layerLobby').css('display', 'initial')
  } else if (n == 1){
    $('div#layerLobby').css('display', 'initial')
    $('div#layerLogin').css('display', 'none')
  } else if (n == 2){
    $('div#layerLogin').css('display', 'none')
    $('div#layerLobby').css('display', 'none')
  }
  currentLayer = n
}

function _name2link(name){
  return name
}

function _isFavorite(name){
  return false
}

function _isColleague(name){
  return false
}

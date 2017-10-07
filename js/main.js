"use strict";
const IMAGE_DIRECTORY = "http://81dojo.com/dojo/images/"
var client = null;
var apiClient = null;
var sp;
var currentLayer = 0;
var isGuest = false;
var mileage;
var serverGrid;
var playerGrid;
var waiterGrid;
var gameGrid;
var watcherGrid;
var kifuGrid;
var users = new Object();
var playerInfoWindows = new Object();
var me;
var _challengeUser = null
var _gameAccepted = false
var premium;
var countries = new Object();
var board;
var hidden_prm;
var mouseX
var mouseY
var testMode = true
var config = null

/* ====================================
    On document.ready
===================================== */

function _testFunction(phase){
  //phase:integer
  if (phase == 0) { // After creation
//    board.loadNewPosition()
 //   _switchLayer(2)
//    return
    _handleServers([
      {id:1, name:'MERCURY', description_en: 'test', description_ja: 'テスト', enabled: true, population: 0, host: 'shogihub.com', port: 4084},
      {id:2, name:'MOON', description_en: 'local', description_ja: 'ローカル', enabled: true, population: 0, host: '192.168.220.131', port: 4081}
    ])
  } else if (phase == 1) { // After servers are loaded
    serverGrid.row("#MERCURY").select()
    _loginButtonClick()
  } else if (phase == 2) { // After logged in
    client.send("%%GAME hc2pd_test2-900-30 -")
  }
}

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
  sp = new SoundPlayer()

  $.getJSON("dat/config.json", function(data){
    config = data
  })

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

  // Prepare Datatables
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
    select: "single",
    oLanguage: {sEmptyTable: "Loading..."}
  })
  serverGrid.clear()

  playerGrid = $('#playerGrid').DataTable({
    data: [],
    columns: [
      {data: "statStr", width: "10%"},
      {data: "title", width: "14%"},
      {data: "rank", width: "14%", bSortable: false},
      {data: "nameStr", width: "40%", className: "dt-body-left"},
      {data: "country", width: "12%", className: "dt-body-left"},
      {data: "rate", width: "10%", className: "dt-body-right"}
    ],
    rowId: "name",
    searching: false, paging: false, info: false,
    select: "single",
    order: [[5, 'desc']],
    oLanguage: {sEmptyTable: EJ("Loading...", "読込中...")}
  })
  playerGrid.clear()
  $('#playerGrid tbody').on('dblclick', 'tr', function () {
    _openPlayerInfo(users[playerGrid.row(this).id()])
  })

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
    select: "single",
    order: [[1, 'desc']],
    oLanguage: {sEmptyTable: EJ("No player is waiting", "対局待プレーヤがいません")}
  })
  waiterGrid.clear()
  $('#waiterGrid tbody').on('dblclick', 'tr', function () {
    _openPlayerInfo(users[waiterGrid.row(this).id()])
  })

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
    rowId: "gameId",
    searching: false, paging: false, info: false,
    select: "single",
    order: false,
    oLanguage: {sEmptyTable: EJ("No game room found.", "対局がありません")}
  })
  gameGrid.clear()
  $('#gameGrid tbody').on('dblclick', 'tr', function () {
    _enterGame(gameGrid.row(this).data())
  })

  watcherGrid = $('#watcherGrid').DataTable({
    data: [],
    columns: [
      {data: "name", width: "55%", className: "dt-body-left"},
      {data: "country", width: "25%", className: "dt-body-left"},
      {data: "rate", width: "20%", className: "dt-body-right"}
    ],
    rowId: "name",
    searching: false, paging: false, info: false,
    select: "single",
    order: [[2, 'desc']],
    oLanguage: {sEmptyTable: EJ("No watcher", "観戦者なし")}
  })
  watcherGrid.clear()

  kifuGrid = $('#kifuGrid').DataTable({
    data: [],
    columns: [
      {data: "numStr", width: "15%", bSortable: false},
      {data: "moveStr", width: "60%", className: "dt-body-left", bSortable: false},
      {data: "timeStr", width: "25%", className: "dt-body-right", bSortable: false}
    ],
    searching: false, paging: false, info: false,
    select: "api",
    order: false
  })
  kifuGrid.clear()
  kifuGrid.on('user-select', function(e, dt, type, cell, originalEvent){
    if ($(cell.node()).parent().hasClass('selected')) {
      e.preventDefault()
    } else {
      _kifuSelected(cell.index().row)
    }
  })

  // Prepare modal windows
  $('#modalNewGame').dialog({
    modal: true,
    dialogClass: 'no-close',
    autoOpen: false,
    position: {my: 'left top', at:'left+100 top+100'},
    open: function(e, ui){
      $('.ui-widget-overlay').hide().fadeIn()
    },
    show: 'fade',
    buttons: [
      {text: "OK", click: function(){_handleNewGame()}},
      {id: "i18n-cancel", click: function(){$(this).dialog('close')}}
    ]
  })

  $('#modalChallenger').dialog({
    modal: true,
    dialogClass: 'no-close',
    autoOpen: false,
    position: {my: 'center bottom'},
    open: function(e, ui){
      $('.ui-widget-overlay').hide().fadeIn()
    },
    show: 'fade'
  })

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
  $("#boardChatInput").on('keyup', function(e){
    if (e.keyCode == 13){
      if ($(this).val().length > 0) {
        client.gameChat($(this).val())
        $(this).val('')
      }
    }
  })
  window.onmousemove = function(event) {
      event = event || window.event
      mouseX = event.clientX
      mouseY = event.clientY
  }

  // Do in every relogin

  //  apiClient = new WebSystemApiClient("192.168.220.131", 3000)
  apiClient = new WebSystemApiClient("system.81dojo.com", 80)
  apiClient.setCallbackFunctions("SERVERS", _handleServers)
  if (!testMode) apiClient.getServers()

  if (testMode) _testFunction(0)
});

/* ====================================
    On window.resize
===================================== */

window.onresize = function () {
  $("div.menuBar").find("a.button").css('min-width', window.innerWidth / 12.)
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
  $('#modalNewGame').dialog('option', 'title', i18next.t("new_game.title"))
  $('#modalChallenger').dialog('option', 'title', i18next.t("challenger.title"))
  $('[id^=i18n-]').each(function(){
    $(this).button('option', 'label', i18next.t($(this).attr('id').split("-")[1]))
  })
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
  client.setCallbackFunctions("GAMECHAT", _handleGameChat)
  client.setCallbackFunctions("PRIVATECHAT", _handlePrivateChat)
  client.setCallbackFunctions("MOVE", _handleMove)
  client.setCallbackFunctions("GAME_END", _handleGameEnd)
  client.setCallbackFunctions("ERROR", _handleGeneralResponse)
  client.setCallbackFunctions("CLOSED", _handleClosed)
  client.setCallbackFunctions("WHO", _handleWho)
  client.setCallbackFunctions("LIST", _handleList)
  client.setCallbackFunctions("GAME", _handleGame)
  client.setCallbackFunctions("CHALLENGE", _handleChallenger)
  client.setCallbackFunctions("ACCEPT", _handleAccept)
  client.setCallbackFunctions("DECLINE", _handleDecline)
  client.setCallbackFunctions("GAME_SUMMARY", _handleGameSummary)
  client.setCallbackFunctions("START", _handleStart)
  client.setCallbackFunctions("MONITOR", _handleMonitor)
  client.setCallbackFunctions("ENTER", _handleEnter)
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
  $('#modalNewGame').dialog('open')
}

function _enterGame(game){
  if (board.game) return
  board.setGame(game)
  client.monitor(game.gameId, true)
}

function writeUserMessage(str, layer, clr = null, bold = false, lineChange = true){
  let area
  if (layer == 1) {
    area = $('#lobbyMessageArea')
  } else if (layer == 2) {
    area = $('#boardMessageArea')
  }
	str = str.replace(/</g, "&lt;")
	str = str.replace(/&lt;sPAn/g, "<span");
	str = str.replace(/&lt;\/SpaN>/g, "</span>");
	str = str.replace(/(https?\:\/\/[^\"^\s^\\]+)/g, '<a href="$1" target="_blank">$1</a>')
	str = str.replace(/\\n/g, "<br>&emsp;&emsp;&emsp;")
  $('<span></span>',{}).css({
    'color': (clr ? clr : ''),
    'font-weight': (bold ? 'bold' : '')
  }).html(str).appendTo(area)
  if (lineChange) area.append('<br>')
  area.animate({scrollTop: area[0].scrollHeight}, 'fast')
}

function _interpretCommunicationCode(name, code, n, bold, sound) {
  //string, string, integer, boolean, boolean
	writeUserMessage(name + i18next.t("code." + code), n, "#008800", bold)
//	if (sound && _chat_sound2_play) _sound_chat2.play();
}


/* ====================================
    Board View functions
===================================== */

function _resignButtonClick(){
  if (board.myRoleType == 0 && board.position.turn == true || board.myRoleType == 1 && board.position.turn == false) client.resign()
}

function _rematchButtonClick(){
  if (board.isPlayer()) {
  	//if (_game_name && !board.rematch[board.my_turn]) {
      /*
  		if (_isGuest && _guestGamesExpired()) {
  			Alert.show(LanguageSelector.lan.msg_guest_expire, LanguageSelector.lan.error, 4);
  			return;
  		} */
//  		client.gameChat("[##REMATCH]")
  } /*else {
		var match:Array = _game_name.split("+")[1].match(/^([0-9a-z]+?)_(.*)$/);
		var found:Boolean = false;
		for each (var game:Object in _game_list) {
			if (game.id.split("+")[1] == match[1] + "_@" + match[2] && game.status == "game") {
				found = true;
				break;
			}
		}
		if (!found) {
			_writeUserMessage(LanguageSelector.EJ("The rematch game is already finished.\n", "再戦の対局が既に終了しています\n"), 2, "#008800");
		} else {
			_clearAllTags();
			_client.monitorOff(_game_name);
			board.closeGame();
			_monitoring = false;
			_watch_game = game;
			_execute_watch();
		} */
}

function _closeBoard(){
  if (board.isPlayer()) client.closeGame()
  else if (board.isWatcher()) client.monitor(board.game.gameId, false)
  client.who()
  client.list()
  board.close()
  _switchLayer(1)
  $('boardMessageArea').empty()
}

function sendMoveAsPlayer(move){
  client.move(move)
  board.moves.push(move)
  board.addMoveToKifuGrid(move)
  /*
  if (board.since_last_move > 0) {
	  board.timers[board.my_turn == board.last_pos.turn ? 0 : 1].accumulateTime( - board.since_last_move);
	  board.since_last_move = 0;
  }
  board.makeMove(str + ",T0", true, true);
  _myMoveSent = true;
  _myMoveSentTimer.reset();
  _myMoveSentTimer.start();
  */
}

function _kifuSelected(index){
  board.replayMoves(kifuGrid.rows(Array.from(Array(index+1).keys())).data())
}

function sendTimeout(){
  console.log('OK')
  client.timeout()
  board.pauseAllTimers()
}

function setBoardConditions(){
  board.setBoardConditions()
  let kifuSelectable = false
  if (board.isPlayer()) {
    $("#flipButton").addClass("button-disabled")
    $("#greetButton").prop('disabled', 'false')
    if (board.isPostGame) {
      kifuSelectable = true
      $("input[name=kifuModeRadio]").val(1).prop("disabled", true)
      $("#resignButton").addClass("button-disabled")
      $("#positionMenuButton, #kifuMenuButton, #rematchButton, #closeGameButton").removeClass("button-disabled")
      $("#receiveWatcherChatCheckBox").prop({disabled: true, checked: true})
    } else {
      $("input[name=kifuModeRadio]").val(1).prop("disabled", true)
      $("#resignButton").removeClass("button-disabled")
      $("#positionMenuButton, #kifuMenuButton, #rematchButton, #closeGameButton").addClass("button-disabled")
      if (board.game.gameType != "r") {
        $("#receiveWatcherChatCheckBox").prop({disabled: false, checked: true})
      } else {
        $("#receiveWatcherChatCheckBox").prop({disabled: true, checked: false})
      }
    }
  } else if (board.isWatcher()){
    $("input[name=kifuModeRadio]").val(1).prop("disabled", true)
    $("#greetButton").prop('disabled', 'true')
    $("#resignButton").addClass("button-disabled")
    $("#flipButton, #positionMenuButton, #kifuMenuButton, #rematchButton").removeClass("button-disabled")
    $("#receiveWatcherChatCheckBox").prop({disabled: true, checked: true})
    if (board.isPostGame) {
      kifuSelectable = true
    } else {
    }
  }
  if (kifuSelectable){
    kifuGrid.select.style('single')
  } else {
    kifuGrid.select.style('api')
  }
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
    client.wait(ruleType, 60 * $("#newGameTotalSelect option:selected").val(), $("#newGameByoyomiSelect option:selected").val(), ruleType.match(/^hc/) ? -1 : 0)
  } else if (val == 6) {

  } else if (val == 7) {

  } else if (val == 8) {
    client.stopWaiting()
  }
  $('#modalNewGame').dialog('close')
}

function _handleAcceptChallenge(){
	client.accept()
	_gameAccepted = true
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

function _openPlayerInfo(user, doOpen = true){
  let element = $("#player-info-window-" + user.name)
  if (!element[0]) {
    element = $("<div></div>",{
      id: 'player-info-window-' + user.name,
      title: user.name,
      html: '<div id="player-info-layer-1" class="hbox" style="pointer-events:none">\
        <div class="avatar-wrapper"><img class="avatar"/></div>\
        <div style="flex:1;margin-left:10px"><p id="p1"></p><p id="p2"></p><p id="p3"></p><p id="p4"></p></div>\
        </div>\
        <div id="player-info-layer-2" style="margin-top:-128px;opacity:0">\
        <div id="privateMessageArea"></div>\
        <div class="hbox" style="margin-top:5px"><span style="margin-right:5px;white-space:nowrap">PM:</span><input id="privateChatInput" style="flex:1"></div>\
        </div>'
    }).dialog({
      autoOpen: false,
      position: {at:'left+'+mouseX+' top+'+mouseY},
      close: function(e){
        if (element.find("#privateMessageArea").html() == "") element.dialog('destroy').remove()
      },
      buttons: [
        {text: i18next.t("player_info.challenge"), click: function(){_playerChallengeClick(user)}},
        {text: i18next.t("player_info.detail"), click: function(){_playerDetailClick(user)}},
        {text: "PM", click: function(){_playerPMClick(this)}}
      ]
    })
    element.find("#privateChatInput").on('keyup', function(e){
      if (e.keyCode == 13){
        if ($(this).val().length > 0) {
          client.privateChat(user.name, $(this).val())
          let area = element.find("#privateMessageArea")
          $('<span></span>',{}).css('color', '#33f').text($(this).val()).appendTo(area)
          area.append('<br>')
          area.animate({scrollTop: area[0].scrollHeight}, 'fast')
          $(this).val('')
        }
      }
    })
  }
  if (doOpen) element.dialog('open')
  element.find("img.avatar").attr("src", user.avatarURL())
  element.find("p#p1").html(user.country.flagImgTag27() + ' ' + user.country.toString())
  element.find("p#p2").html('R: ' + user.rate + ' (' + makeRankFromRating(user.rate) + ')')
  return element
}

function _playerChallengeClick(user){
  if (user == me) return
  if (_challengeUser) {
	  writeUserMessage(EJ("You can only challenge one player at a time.", "挑戦は一度に一人に対してしか行えません。"), 1, "#008800")
  } else if (user.listAsWaiter()) {
    if (user.rate >= RANK_THRESHOLDS[2] && me.provisional && user.waitingGameName.match(/^r_/)) {
  	  writeUserMessage(EJ("New player with a provisional rating cannot challenge 6-Dan or higher for rated games.", "レート未確定の新鋭棋士は六段以上とのレーティング対局には挑戦出来ません。"), 1, "#008800")
    } else if (user.waitingGameName.match(/_automatch\-/)) {
		  client.seek(user)
	  } else {
		  _challengeUser = user
		  writeUserMessage(EJ("Challenging " + _challengeUser.name + "..... (Must wait for 20 seconds max)\n", _challengeUser.name + "さんに挑戦中..... (待ち時間 最大で20秒)\n"), 1, "#008800", true)
		  client.challenge(_challengeUser)
//		  _challengeCancelTimer.reset();
//		  _challengeCancelTimer.start();
	  }
  } else if (!me.listAsWaiter()) {
		writeUserMessage(EJ("The opponent is not waiting with own game rule. You can invite him if you wait with your own game rule.", "相手は対局待をしていません。自分が対局待にすることで招待メッセージを送ることが可能です。"), 1, "#008800")
	} else if (user.idle) {
		writeUserMessage(user.name + EJ(" is not accepting challenge or invitations right now.", "さんは現在 挑戦・招待を受け付けていません。"), 1, "#008800", true)
	} else if (user.inGameRoom()) {
		writeUserMessage(user.name + EJ(" is in another game right now.", "さんは対局中です。"), 1, "#008800", true)
	} else {
		me.waitingGameName.match(/^([0-9a-z]+?)_(.*)-([0-9]*)-([0-9]*)/)
		client.privateChat(user.name, "[##INVITE]" + RegExp.$3 + "," + RegExp.$4 + "," + RegExp.$1)
		writeUserMessage(EJ("The opponent is not waiting with own game rule. Instead, an invitation to your game has been sent to him.", "相手は対局待をしていません。代わりに自分の対局への招待メッセージを" + user.name + "さんに送信しました。(拒否された場合は連続送信しないで下さい)"), 1, "#008800")
	}
      /*
		  if (_isGuest && _guestGamesExpired()) {
			  Alert.show(LanguageSelector.lan.msg_guest_expire, LanguageSelector.lan.error, 4);
			  return;
		  if (!(_challengeUser.statusMark.match(/[待W]/))) {
			  if (_isGuest || _users[name].isMobile) {
			if (_isGuest && (match[1] == "r" || match[2].match(/\-\-..$/))) {
				Alert.show(LanguageSelector.EJ("Guests cannot play rated games.", "ゲストはレーティング対局に参加できません"), LanguageSelector.lan.error, 4);
		  }
      */
}

function _playerDetailClick(user){
  window.open("http://system.81dojo.com/" + EJ('en', 'ja') + "/players/show/" + user.name)
}

function _playerPMClick(e, forcePM = false){
  if (forcePM || $(e).find("div#player-info-layer-1").css('opacity') == 1) {
    $(e).find("div#player-info-layer-1").css('opacity', 0)
    $(e).find("div#player-info-layer-2").css('opacity', 1)
  } else {
    $(e).find("div#player-info-layer-1").css('opacity', 1)
    $(e).find("div#player-info-layer-2").css('opacity', 0)
  }
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
  if (testMode) _testFunction(2)
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
  gameGrid.clear()
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
    gameGrid.row.add(game)
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
  sp.play("CHALLENGER")
  $('#modalChallenger').dialog('open')
  _initModalChallenger(users[name])
}

function _handleAccept(str){
	//_challengeCancelTimer.stop();
	_gameAccepted = true
	//_acceptedCancelTimer.reset();
	//_acceptedCancelTimer.start();
	_interpretCommunicationCode("", "C005", 1, true, false)
	if (_challengeUser) client.seek(_challengeUser)
}

function _handleDecline(str){
//	_challengeCancelTimer.stop();
//	_acceptedCancelTimer.stop();
	if (str.match(/^([A-Z]\d{3})/)) {
		_interpretCommunicationCode("", RegExp.$1, 1, true, false)
	} else {
		writeUserMessage(str, 1, "#008800", true)
	}
	_challengeUser = null
	_gameAccepted = false
  /*
	if (_challengerAlertWindow) {
		_challengerAlertWindow.terminate();
		_challengerAlertWindow = null;
	}
  */
}

function _handleGameSummary(str){
  _gameAccepted = false
//  _acceptedCancelTimer.stop();
  let black
  let white
  let myTurn
  let initialPosition = ""
  let gameId
  let kid
  str.split("\n").forEach(function(line){
    if (line.match(/^Name\+\:(.+)$/)){
      black = users[RegExp.$1]
    } else if (line.match(/^Name\-\:(.+)$/)){
      white = users[RegExp.$1]
    } else if (line.match(/^Your_Turn\:(.)$/)){
      myTurn = RegExp.$1 == "+"
    } else if (line.match(/^To_Move\:(.)$/)){
      initialPosition = "P0" + RegExp.$1 + "\n"
	  } else if (line.match(/^P[0-9\+\-]/)){
      initialPosition += line + "\n"
    } else if (line.match(/^START:(.+):(\d+)$/)){
      gameId = RegExp.$1
      kid = RegExp.$2
    }
  })
//	  _waiting = false;
//	  _challenging = false;
//	  _rematching = false;
	  /*if(_game_name && _monitoring){
        _client.monitorOff(_game_name);
        _monitoring = false;
  		board.closeGame();
	  }*/
    //  var match:Array = e.message.match(/^START:(.*)\+(.*)-([0-9]*)-([0-9]*)/);
	  board.setGame(new Game(0, gameId, black, white))
    board.setDirection(myTurn)
    board.loadNewPosition(initialPosition)
	  //if (_end_sound_play) _sound_start.play();
	  //board.superior = game.superior;
    board.startGame(myTurn)
	  //userMessage2.htmlText = "";
    setBoardConditions()
    _switchLayer(2)
    return
	  //watcherListGrid.dataProvider = _watcher_list;
    if (myTurn) writeUserMessage(EJ("You are Black " + (board.gameType == "hc" ? "(Handicap taker).\n" : "(Sente).\n"), "あなた" + (board.gameType == "hc" ? "は下手(したて)" : "が先手") + "です。\n"), 2, "#008800")
    else writeUserMessage(EJ("You are White " + (board.gameType == "hc" ? "(Handicap giver).\n" : "(Gote).\n"), "あなた" + (board.gameType == "hc" ? "が上手(うわて)" : "は後手") + "です。\n"), 2, "#008800")
	  //if (match[2].match(/\-\-\d+$/) && board.gameType != "r") writeUserMessage(LanguageSelector.EJ("To mute watcher's chat, switch off the checkbox above the watcher list.\n", "観戦者のチャットをミュートするには観戦者リスト上部のチェックボックスをOFFにして下さい。\n"), 2, "#FF3388")
    /*
	  greetButton.state = GreetButton.STATE_BEFORE_GAME;
	  board.onListen = true;
	  _switchListenColor(true);
    */
	  //_nOpponentDisconnect = 0;
	  //_study_notified = false;
    /*
	  var oppo:Object = login_name == game.black.name ? game.white : game.black;
	  if (board.gameType == "r" && !_users[login_name].isProvisional) {
		  if (InfoFetcher.beforeUpgrade(_myRate)) {
			  if (!oppo.isProvisional && oppo.rating > _myRate - 200) _sendAutoChat("#G020");
		  } else if (InfoFetcher.beforeDowngrade(_myRate)) {
			  if (!oppo.isProvisional && oppo.rating < _myRate + 200) _sendAutoChat("#G021");
		  }
	  }*/
//	  _client.privateChat(oppo.name, "[##FITNESS]" + _levelStudy + "," + _levelEnglish);
//	  if (parseInt(match[4]) == 0) greetButton.autoGreet(GreetButton.STATE_BEFORE_GAME);
}

function _handleMove(csa, time){
  //string, integer
  if (board.isPlaying()){
    let owner = csa.substr(0, 1) == "+"
    board.getPlayersTimer(owner).useTime(time)
    if (owner && board.myRoleType == 0 || !owner && board.myRoleType == 1) {
      board.moves[board.moves.length - 1].time = time
    } else {
      let move = new Movement(board.getFinalMove().num + 1)
      move.setFromCSA(csa)
      move.time = time
      board.handleReceivedMove(move)
      board.updateTurnHighlight()
    }
    board.runningTimer.run()
  }
}

function _handleGameEnd(lines){
  board.pauseAllTimers()
  let gameEndType = lines.split("\n")[0]
  let result = lines.split("\n")[1]
  //var adviseIllegal:Boolean = false;
  /*
  if (_disconnectAlertWindow) {
	  _disconnectAlertWindow.terminate();
	  _disconnectAlertWindow = null;
	  var opponent_disconnected:Boolean = true;
  }
  */
  board.isPostGame = true
  let move = new Movement(board.getFinalMove().num + 1)
  move.setGameEnd(gameEndType) //turn too?
  board.moves.push(move) //refresh list too
  writeUserMessage(move.toGameEndMessage(), 2, "#DD0088")
	//if (GameTimer.soundType >= 2) Byoyomi.sayTimeUp();
  //board.timeout();
  switch (result) {
    case "LOSE":
    	board.studyHostType = 2
    	//_openGameResultWindow(-1);
    	board.playerInfos[1 - board.myRoleType].find("#player-info-name").addClass("name-winner")
      writeUserMessage(EJ("### You Lose ###", "### あなたの負けです ###"), 2, "#DD0088", true)
    	//if (adviseIllegal) _writeUserMessage(LanguageSelector.EJ("( For details of illegal moves in shogi, see: http://81dojo.com/documents/Illegal_Move )\n", "( 将棋の反則手についてはこちらでご確認下さい: http://81dojo.com/documents/反則手 )\n"), 2, "#DD0088");
      sp.gameEnd(false)
      /*
    	if (board.gameType == "r") _losses_session += 1;
    	var history = "  ●";
    	_losersCloseButtonTimer.reset();
    	_losersCloseButtonTimer.start();
      */
      break
    case "WIN":
      board.studyHostType = 1
    	//_openGameResultWindow(1);
    	board.playerInfos[board.myRoleType].find("#player-info-name").addClass("name-winner")
      writeUserMessage(EJ("### You Win ###\n", "### あなたの勝ちです ###\n"), 2, "#DD0088", true)
      sp.gameEnd(true)
      /*
    	if (board.gameType == "r") _wins_session += 1;
    	history = "  ◯";
    	if (board.gameType == "r" && board.kifu_list.length >= 6 && ((_users[login_name].wins + 1) % 100 == 0)) _client.chat("[##WINS]" + (_users[login_name].wins + 1));
      */
      break
    case "DRAW":
    	if (board.myRoleType == 1) board.studyHostType = 2
    	else if (board.myRoleType == 0) board.studyHostType = 1
    	//_openGameResultWindow(0);
      writeUserMessage(EJ("### Draw ###\n", "### 引き分け ###\n"), 2, "#DD0088", true)
      sp.gameEnd(true)
    	//history = "  引";
      break
    case "SENTE_WIN":
    	board.playerInfos[0].find("#player-info-name").addClass("name-winner")
      writeUserMessage(EJ("### Sente (or Shitate) Wins ###\n", "### 先手(または下手)の勝ち ###\n"), 2, "#DD0088", true)
      sp.gameEnd(true)
      break
    case "GOTE_WIN":
    	board.playerInfos[1].find("#player-info-name").addClass("name-winner")
      writeUserMessage(EJ("### Gote (or Uwate) Wins ###\n", "### 後手(または上手)の勝ち ###\n"), 2, "#DD0088", true)
      sp.gameEnd(true)
      break
  }
  /*
  if (board.gameType == "hc") {
	  if (board.my_turn == Kyokumen.GOTE) {
		  board.isStudyHost = true;
		  board.isSubHost = false;
	  } else {
		  board.isStudyHost = false;
		  board.isSubHost = true;
	  }
  }
  if (opponent_disconnected && board.isSubHost) {
	  board.isStudyHost = true;
	  board.isSubHost = false;
  }
  */
  /*
  if (_pmGameLog != "") {
	  _writeUserMessage(LanguageSelector.EJ("PM received during the game:\n", "対局中にPMが届いています\n"), 2, "#FF0000", true);
	  _writeUserMessage(_pmGameLog, 2, "#FF0000");
	  _pmGameLog = "";
  }
  history += board.my_turn == 0 ? LanguageSelector.EJ("  Black:   ", "  ☗先手:  ") : LanguageSelector.EJ("  White:  ", "  ☖後手:  ");
  for each (var game:Object in _game_list) {
	  if (game.id == _game_name) {
		  var openingName:String = LanguageSelector.EJ(game.openingEn, game.openingTip);
		  break;
	  }
  }
  if (board.my_turn == 0) {
	  openingName = LanguageSelector.EJ(openingName.replace(/Opposition, Black's /, ""), openingName.replace(/対抗形 ☗/, ""));
	  openingName = LanguageSelector.EJ(openingName.replace(/Opposition, White's/, "Static Rook vs"), openingName.replace(/対抗形 ☖/, "居飛車　(対"));
  } else {
	  openingName = LanguageSelector.EJ(openingName.replace(/Opposition, White's /, ""), openingName.replace(/対抗形 ☖/, ""));
	  openingName = LanguageSelector.EJ(openingName.replace(/Opposition, Black's/, "Static Rook vs"), openingName.replace(/対抗形 ☗/, "居飛車　(対"));
  }
  if (openingName.match(/\(/)) openingName += ")";
  history += openingName;
  if (board.gameType == "r") _games_session.push(history);
  _notifyOnCloseGame = true;
  if (board.gameType == "r") _client.mileage(10);
  else _client.mileage(5);
  */
  setBoardConditions()
  board.updateTurnHighlight()
  /*
  if (greetButton.state != GreetButton.STATE_POSTGAME) greetButton.state = GreetButton.STATE_AFTER_GAME;
  _shareKifuEnabled = true;
  if (board.isStudyHost) _toggleHostStatus(true);
  if (board.isSubHost) _writeUserMessage(LanguageSelector.lan.msg_subhost + "\n", 2, "#008800", true);
  _status_disconnected = false;
  if (_isGuest) {
	  var date:Date = new Date();
	  if (_so.data.guest_game_period && _so.data.guest_game_period == date.toDateString()) _so.data.guest_game_num += 1;
	  else {
		  _so.data.guest_game_period = date.toDateString();
		  _so.data.guest_game_num = 1;
	  }
  }
  */
}

function _handleMonitor(str){
  let kifu_id = null
  let lines = str.split("\n")
  let move_strings = []
  let since_last_move = 0
  let positionStr = ""
  let gameEndStr = ""
  lines.forEach(function(line){
    if(line.match(/^([-+][0-9]{4}[A-Z]{2}|%TORYO)$/)) {
      move_strings.push(RegExp.$1)
    } else if (line.match(/^T(\d+)$/)){
      move_strings[move_strings.length - 1] += "," + RegExp.$1
    } else if (line.match(/^kifu_id:(.+)$/)) {
      kifu_id = RegExp.$1
    } else if (line.match(/^\$SINCE_LAST_MOVE:(\d+)$/)) {
      since_last_move = parseInt(RegExp.$1)
    } else if (line.match(/^To_Move:([\+\-])$/)){
			positionStr += "P0" + RegExp.$1 + "\n"
    } else if (line.match(/^P[0-9+-].*/)) {
      positionStr += line + "\n"
    } else if (line.match(/^#(SENTE_WIN|GOTE_WIN|DRAW|RESIGN|TIME_UP|ILLEGAL_MOVE|SENNICHITE|OUTE_SENNICHITE|JISHOGI|DISCONNECT|CATCH|TRY)/)) {
      gameEndStr += RegExp.$1 + "\n"
    }
  })
  if (kifu_id) {
    board.startMonitor(kifu_id, positionStr, move_strings, since_last_move)
    setBoardConditions()
    _switchLayer(2)
  } else {
    move_strings.forEach(function(move_str){
      let move = new Movement(board.getFinalMove().num + 1)
      move.setFromCSA(move_str.split(",")[0])
      move.time = parseInt(move_str.split(",")[1])
      board.handleMonitorMove(move)
    })
  }
  if (gameEndStr != "") _handleGameEnd(gameEndStr)
}

function _handleEnter(){

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

function _handleGameChat(sender, message){
	if (!board.game) return
	// if (_isDuringMyGame() && (e.message.substr(12).match(/^\[(.+?)\]\s\[comment\]/))) return;
	if (message.match(/\[\#\#HOVER\](\d+),(\d+)$/)) {
  /*
		if (sender != login_name && board.onListen) board.handleHover(match[1], match[2]);
	} else if ((match = e.message.match(/\[\#\#GRAB\](\d+),(\d+)$/))) {
		if (sender != login_name && board.onListen) board.handleGrab(match[1], match[2]);
	} else if (e.message.match(/\[\#\#TYPE\]$/)) {
		if (sender != login_name) {
			if (sender == board.name_labels[0].text) {
				board.typingIndicatorStart(0);
			} else if (sender == board.name_labels[1].text) {
				board.typingIndicatorStart(1);
			}
		}
	} else if ((match = e.message.match(/\[\#\#STUDY\](\d+)\/(.+)$/))) {
		_handleStudy(sender, match[1], match[2]);
	} else if ((match = e.message.substr(12).match(/^\[.+\]\s\[##ARROW\]CLEAR$/))) {
		if (sender != login_name) board.clearArrows(Board.ARROWS_PUBLIC, sender);
	} else if ((match = e.message.substr(12).match(/^\[.+\]\s\[##ARROW\](.+),(.+),(.+),(.+),(.+),(.+)$/))) {
		if (_ignore_list.indexOf(sender.toLowerCase()) >= 0) return;
		if (!_accept_arrows && sender != login_name) return;
		if (_isDuringMyGame()) return; // (board.isPlayer && !board.post_game) return;
		if (board.post_game && !board.studyOn) return;
		if (sender == login_name) sender = "";
		if (board.isStudyHost || board.onListen) {
			board.addArrow(parseInt(match[1]), new Point(Number(match[2]), Number(match[3])), new Point(Number(match[4]), Number(match[5])), uint(match[6]), sender,Board.ARROWS_PUBLIC, true);
		} else {
			board.addArrow(parseInt(match[1]), new Point(Number(match[2]), Number(match[3])), new Point(Number(match[4]), Number(match[5])), uint(match[6]), sender,Board.ARROWS_PUBLIC);
		}
	} else if ((match = e.message.substr(12).match(/^\[.+\]\s\[##M_(IN|OUT)\](\d+),(\d+)$/))) {
		if (sender != login_name) {
			if (sender == board.name_labels[0].text) {
				if (match[1] == "OUT") {
					board.name_labels[0].setStyle("color", 0x777777);
				} else {
					board.name_labels[0].setStyle("color", undefined);
				}
			} else if (sender == board.name_labels[1].text) {
				if (match[1] == "OUT") {
					board.name_labels[1].setStyle("color", 0x777777);
				} else {
					board.name_labels[1].setStyle("color", undefined);
				}
			}
		}
	} else if ((match = e.message.substr(12).match(/^\[.+\]\s\[##GIVEHOST\](.+)$/))) {
		if (match[1] == login_name) _toggleHostStatus(true);
		else _writeUserMessage(LanguageSelector.EJ("Study Host status given to " + match[1] + "\n", "感想戦ホストは、" + match[1] + "さんに引き継がれました。\n"), 2, "#008800", false);
		if (_users[match[1]]) {
			for each (var user:Object in _users) user.isHost = false;
			_users[match[1]].isHost = true;
			_updateStatusMarks();
		}
	} else if ((match = e.message.substr(12).match(/^\[.+\]\s\[##SUBHOST_ON\](.+)$/))) {
		if (match[1] == login_name) {
			_writeUserMessage(LanguageSelector.lan.msg_subhost_given + "\n", 2, "#008800", true);
			board.isSubHost = true;
		} else {
			_writeUserMessage(LanguageSelector.EJ("Study Sub-host status given to " + _name2link(match[1]) + "\n", _name2link(match[1]) + "さんに、感想戦サブ・ホスト権限が付与されました。\n"), 2, "#008800", false);
		}
	} else if ((match = e.message.substr(12).match(/^\[.+\]\s\[##TEMPLATE\]([A-Z]\d{3})/))) {
		_handleGameChat(new ServerMessageEvent("template", "##[GAMECHAT][" + sender + LanguageSelector.EJ("] <Template> ", "] <定型> ") + LanguageSelector.lan[match[1]]));
    */
	} else if (message.match(/^\[##.+\]/)) {
	} else if (message.match(/^\[auto\-chat\]\s#([A-Z]\d{3})$/)) {
		_interpretCommunicationCode(sender, RegExp.$1, 2, false, true)
	} else {
    /*
		if (_losersCloseButtonTimer.running && sender != login_name) {
			if (sender == board.playerInfos[0].name || sender == board.playerInfos[1].name) {
				_losersCloseButtonTimer.stop();
				closeButton.enabled = true;
			}
		}
    */
//		if (_ignore_list.indexOf(sender.toLowerCase()) >= 0) return;
		if (sender == board.game.black.name) {
//			board.typingIndicatorStop(0);
			writeUserMessage("[" + _name2link(sender) + "] " + message, 2, "#000000")
		} else if (sender == board.game.white.name) {
//			board.typingIndicatorStop(1);
			writeUserMessage("[" + _name2link(sender) + "] " + message, 2, "#666666")
		} else if (sender == me.name) {
			writeUserMessage("[" + _name2link(sender) + "] " + message, 2, "#0033DD")
      /*
		} else if (_isDuringMyGame() && !_allowWatcherChat) {
      return
		} else if (_favorite_list.indexOf(sender) >= 0) {
			_writeUserMessage("[" + _name2link(sender) + "] " + message, 2, "#DD7700")
		} else if (_colleague_list.indexOf(sender) >= 0) {
			_writeUserMessage("[" + _name2link(sender) + "] " + message, 2, "#550066")
      */
		} else {
			writeUserMessage("[" + _name2link(sender) + "] " + message, 2, "#660000")
		}
    //if (_chat_sound2_play) _sound_chat2.play();
	}
}

function _handlePrivateChat(sender, message){
	if (message.match(/^\[\#\#STUDY\](\d+)\/(.+)$/)) {
//		_handleStudy(name, match[1], match[2]);
		return
	} else if (message.match(/^\[\#\#FITNESS\](\d),(\d)$/)) {
//		let str = EJ("Opponent's ", "対局相手の") + LanguageSelector.lan.study_level + ": " + (match[1] == 0 ? ("<" + LanguageSelector.lan.not_defined + ">") : (LanguageSelector.EJ("Level ", "レベル") + (parseInt(match[1]) - 1)));
//		if (board.playerInfos[0].country_code != 392 || board.playerInfos[1].country_code != 392) str += LanguageSelector.EJ(" \ ", "、　") + LanguageSelector.lan.english_level + ": " + (match[2] == 0 ? ("<" + LanguageSelector.lan.not_defined + ">") : (LanguageSelector.EJ("Level ", "レベル") + (parseInt(match[2]) - 1)));
//		_writeUserMessage(str + "\n", 2, "#0000AA");
		return
	} else if (message.match(/^\[\#\#INVITE\](\d+),(\d+),(.+)$/)) {
//		_handleInvitation(name, parseInt(match[1]), parseInt(match[2]), match[3]);
		return
	} else if (message.match(/^\[\#\#REJECT\]/)) {
    /*
		if ((match = message.match(/^\[\#\#REJECT\]([A-Z]\d{3})/))) _interpretCommunicationCode(name, match[1], 1, true, false);
		else _writeUserMessage(name + LanguageSelector.EJ(" did not accept your invitation.\n", "さんに招待メッセージが送信出来ませんでした。\n"), 1, "#008800", true);
    */
		return
	} else if (message.match(/^\[auto\-PM\]/)) {
//		if (message.match(/^\[auto\-PM\]\s#([A-Z]\d{3})/)) _interpretCommunicationCode(name, match[1], 2, false, true);
		return
	}
//	if (_ignore_list.indexOf(name.toLowerCase()) >= 0) return;
//	if (_isGuest) return;
  let playerWindow = $("div#player-info-window-" + sender)
  if (!playerWindow[0] && users[sender]) playerWindow = _openPlayerInfo(users[sender], false)
  let area = playerWindow.find("#privateMessageArea")
  $('<span></span>',{}).css('color', '#f35').text(message).appendTo(area)
  area.append('<br>')
  area.animate({scrollTop: area[0].scrollHeight}, 'fast')
  _playerPMClick(playerWindow, true)
  if (!playerWindow.dialog('isOpen') && !board.isPlaying()) {
		writeUserMessage("PM: [" + _name2link(sender) + "] " + message.replace(/^\[\#\#URGENT\]/, ""), 1, "#FF0000")
		if (currentLayer == 2) writeUserMessage("PM: [" + _name2link(name) + "] " + message.replace(/^\[\#\#URGENT\]/, ""), 2, "#FF0000")
	}
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
  serverGrid.row("#EARTH").select()
  if (testMode) _testFunction(1)
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
  return '<sPAn onclick="_openPlayerInfo(users[\'' + name + '\'])" class="name-link">' + name + '</SpaN>'
}

function _isFavorite(name){
  return false
}

function _isColleague(name){
  return false
}

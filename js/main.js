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
var timeouts = new Object()
var _disconnectTimer
var me;
var _challengeUser = null
var _gameAccepted = false
var _greetState = 0 //0:not-active, 1:before-game, 2:during-game, 3:after-game, 4:post-game
var premium;
var countries = new Object();
var board;
var hidden_prm;
var _hourMileCount
var mouseX
var mouseY
var testMode = false
var config = null
var options = new Object()
var _studyBase = null
var _studyBranch = null

/* ====================================
    On document.ready
===================================== */

function _testFunction(phase){
  //phase:integer
  if (phase == 0) { // After creation
    //board.loadNewPosition()
    //_switchLayer(2)
    //return
    _handleServers([
      {id:1, name:'MERCURY', description_en: 'test', description_ja: 'テスト', enabled: true, population: 0, host: 'shogihub.com', port: 4084},
      {id:2, name:'MOON', description_en: 'local', description_ja: 'ローカル', enabled: true, population: 0, host: '192.168.47.133', port: 4081}
    ])
  } else if (phase == 1) { // After servers are loaded
    return
    serverGrid.row("#MERCURY").select()
    _loginButtonClick()
  } else if (phase == 2) { // After logged in
    //client.send("%%GAME hc2pd_test2-900-30 -")
  }
}

$(function(){
  // Load version InfoFetcher
  $('p#versionText').text('ver. ' + version)

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

  $.getJSON("dat/config.json?" + new Date().getTime(), function(data){
    config = data
    if (config.allowConsole == false) debugLoop()
  })

  // Internationalization
  i18next.language = "ja"
  i18next.use(i18nextXHRBackend).init({
    lng: 'ja',
    fallbackLng: 'ja',
    debug: true,
    backend: {
      loadPath: "locales/{{lng}}.json?" + version
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
    scrollY: true,
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
    scrollY: true,
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
      {data: "movesStr", width: "7%", bSortable: false},
      {data: "watchersStr", width: "7%", bSortable: false},
      {data: "openingStr", width: "12%", bSortable: false}
    ],
    rowId: "gameId",
    searching: false, paging: false, info: false,
    select: "single",
    order: false,
    scrollY: true,
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
    scrollY: true,
    oLanguage: {sEmptyTable: EJ("No watcher", "観戦者なし")}
  })
  watcherGrid.clear()
  $('#watcherGrid tbody').on('dblclick', 'tr', function () {
    _openPlayerInfo(users[watcherGrid.row(this).id()])
  })

  kifuGrid = $('#kifuGrid').DataTable({
    data: [],
    columns: [
      {data: "numStr", width: "15%", bSortable: false},
      {data: "moveStr", width: "60%", className: "dt-body-left", bSortable: false},
      {data: "timeStr", width: "25%", className: "dt-body-right", bSortable: false}
    ],
    searching: false, paging: false, info: false,
    select: "api",
    scrollY: true,
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
  $('#modalImpasse').dialog({
    modal: true,
    autoOpen: false,
    position: {my: 'center bottom'},
    width: 250,
    open: function(e, ui){
      $('.ui-widget-overlay').hide().fadeIn()
    },
    show: 'fade',
    buttons: [
      {id: "i18n-declare", click: function(){_handleImpasseDeclare()}}
    ]
  })

  // Sub menus
  $('.subMenu').hide()
  $('.menuBar > ul > li').hover(function(){
    if ($(this).find('a').hasClass('button-disabled')) return
    $("ul:not(:animated)", this).css('min-width', $(this).width()).slideDown()
  }, function(){
    $("ul",this).slideUp()
  })

  // Hide all layers other than login
  _switchLayer(0)

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
  $("#passwordInput").tooltip()
  window.onmousemove = function(event) {
      event = event || window.event
      mouseX = event.clientX
      mouseY = event.clientY
  }
  _resize()

  // Define default options
  options = {
    notation: 1,
    acceptArrow: true
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
  _resize()
}

function _resize(){
  $("div.menuBar").find("a.button").css('min-width', window.innerWidth / 12.)
  $("#playerGridWrapper, #waiterGridWrapper, #gameGridWrapper, #watcherGridWrapper, #kifuGridWrapper").each(function(){
    $(this).find('.dataTables_scrollBody').css('height', $(this).height() - $(this).find($("thead")).height())
  })
}

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
      if (key == "r" || key.match(/^va/)) return true
      $('#newGameRuleSelect').append($("<option />").val(key).text(HANDICAPS_JA[key]))
    })
  }
  $('#modalNewGame, #modalChallenger, #modalImpasse').each(function(){
    $(this).dialog('option', 'title', i18next.t($(this).attr('data-i18n-title')))
  })
  $('[id^=i18n-]').each(function(){
    $(this).button('option', 'label', i18next.t($(this).attr('id').split("-")[1]))
  })
  $('#passwordInput').tooltip()
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
  client.setCallbackFunctions("WATCHERS", _handleWatchers)
  client.setCallbackFunctions("GAME", _handleGame)
  client.setCallbackFunctions("CHALLENGE", _handleChallenger)
  client.setCallbackFunctions("ACCEPT", _handleAccept)
  client.setCallbackFunctions("DECLINE", _handleDecline)
  client.setCallbackFunctions("GAME_SUMMARY", _handleGameSummary)
  client.setCallbackFunctions("START", _handleStart)
  client.setCallbackFunctions("RESULT", _handleResult)
  client.setCallbackFunctions("MONITOR", _handleMonitor)
  client.setCallbackFunctions("RECONNECT", _handleReconnect)
  client.setCallbackFunctions("MILE", _handleMile)
  client.setCallbackFunctions("ENTER", _handleEnter)
  client.setCallbackFunctions("LEAVE", _handleLeave)
  client.setCallbackFunctions("DISCONNECT", _handleDisconnect)
  client.connect();
}

/* ====================================
    Lobby View functions
===================================== */

function _refreshButtonClick(){
  client.who()
  client.list()
  $("#refreshButton").addClass("button-disabled")
  setGeneralTimeout("REFRESH", 10000)
}

function _waitButtonClick(){
  $('#modalNewGame').dialog('open')
}

function _navigateToWebSystem(path){
  window.open('http://system.81dojo.com/' + EJ('en', 'ja') + '/' + path, '_blank')
}

function _enterGame(game){
  if (board.game) return
  if (game.isVariant()) {
    writeUserMessage(EJ("This game rule is not supported by HTML client yet.", "この対局ルールはHTML版アプリでは未対応です。"), 1, "#ff0000")
    return
  } else if (game.password != "") {
    writeUserMessage(EJ("Entering private room is not supported by HTML client yet.", "プライベート対局室への入室はHTML版アプリでは未対応です。"), 1, "#ff0000")
    return
  }
  board.setGame(game)
  //TODO watching or reconnecting ?
	if (!game.gameId.match(/^STUDY/) && board.getPlayerRoleFromName(me.name) != null) { // Reconnect
		if (me.status == 1) {
      writeUserMessage(EJ("Stop waiting for game before you reconnect.", "対局に再接続するには、対局待状態を解除して下さい。"), 1, "#008800", true)
      board.close()
    } else {
      client.watchers(game.gameId)
      client.reconnect(game.gameId)
    }
  } else { // Monitor
  	//if (_watch_game.password != "" && !_watch_game.isStudyHost(login_name) && !InfoFetcher.isAdminLv1(login_name)) _openInputDialog(LanguageSelector.lan.private_room, LanguageSelector.lan.enter_pass, _enterPrivateRoom, gameListGrid);
    client.watchers(game.gameId)
    client.monitor(game.gameId, true)
  }
}

function writeUserMessage(str, layer, clr = null, bold = false, lineChange = true){
  let area
  let p
  if (layer == 1) {
    area = $('#lobbyMessageArea')
  } else if (layer == 2) {
    area = $('#boardMessageArea')
    p = $("p#disconnectTimer")
    if (p.length) p.detach()
  }
	str = str.replace(/</g, "&lt;")
	str = str.replace(/&lt;sPAn/g, "<span");
	str = str.replace(/&lt;\/SpaN>/g, "</span>");
	str = str.replace(/(https?\:\/\/[^\"^\s^\\]+)/g, '<a href="$1" target="_blank">$1</a>')
	str = str.replace(/\n/g, "<br>&emsp;")
  $('<span></span>',{}).css({
    'color': (clr ? clr : ''),
    'font-weight': (bold ? 'bold' : '')
  }).html(str).appendTo(area)
  if (lineChange) area.append('<br>')
  if (p && p.length) p.appendTo(area)
  area.animate({scrollTop: area[0].scrollHeight}, 'fast')
}

function _interpretCommunicationCode(name, code, n, bold, sound) {
  //string, string, integer, boolean, boolean
	writeUserMessage(name + i18next.t("code." + code), n, "#008800", bold)
  if (sound) sp.chatBoard()
}


/* ====================================
    Board View functions
===================================== */

function _resignButtonClick(){
  if (board.myRoleType == 0 && board.position.turn == true || board.myRoleType == 1 && board.position.turn == false) {
		client.gameChat("<(_ _)> 負けました。(Makemashita.)")
    client.resign()
    _greetState = 3
    _greetButtonClick()
  }
}

function _rematchButtonClick(){
  if (board.isPlayer()) {
    if (!board.rematchAgreed()){
  		client.gameChat("[##REMATCH]")
      /*
  		if (_isGuest && _guestGamesExpired()) {
  			Alert.show(LanguageSelector.lan.msg_guest_expire, LanguageSelector.lan.error, 4);
  			return;
  		} */
    }
  } else {
    let newGameName = ""
    if (board.game.gameId.split("+")[1].match(/^([0-9a-z]+?)_(.*)$/)){
      newGameName = RegExp.$1 + "_@" + RegExp.$2
    } else return
    let foundRow = gameGrid.rows(function(idx, data, node){
      return data.gameId.split("+")[1] == newGameName// && data.status == "game"
    })
    if (foundRow) {
      client.monitor(board.game.gameId, false)
      board.close()
      $('#boardMessageArea').empty()
      watcherGrid.clear().draw()
      board.setGame(foundRow.data()[0])
      client.watchers(board.game.gameId)
      client.monitor(board.game.gameId, true)
    } else {
			writeUserMessage(EJ("The rematch game is already finished.", "再戦の対局が既に終了しています"), 2, "#008800")
		}
  }
}

function _greetButtonClick(){
  switch(_greetState){
    case 1:
      client.gameChat("<(_ _)> お願いします。(Onegai-shimasu.)")
      _greetState = 2
      break
    case 3:
      client.gameChat("<(_ _)> 有難うございました。(Arigatou-gozaimashita.)")
      _greetState = 4
      break
  }
}

function _flipButtonClick(){
  board.flipBoard()
}

function _impasseButtonClick(){
  if (board.game.isVariant()) return
  $("#modalImpasse").dialog('open')
  board.calcImpasse()
}

function _clearArrowsButtonClick(){
	if (board.onListen) {
		if (board.clearArrows(true, me.name)) {
			client.gameChat("[##ARROW]CLEAR")
		}
	} else {
		board.clearArrows(false)
	}
}

function _giveHostButtonClick(){
  if (!board.isHost()) return
  let user = null
  if (board.game.white.name != me.name && board.isPlayerPresent(1)) {
    user = board.game.white
  } else if (board.game.black.name != me.name && board.isPlayerPresent(0)) {
    user = board.game.black
  }
  if (user) {
		client.gameChat("[##GIVEHOST]" + user.name)
    board.studyHostType = 1
    setBoardConditions()
  }
}

function _optionButtonClick(){
  writeUserMessage(EJ('No option available yet.', 'オプション機能は準備中です'), currentLayer, "#ff0000")
}

function _closeBoard(){
  if (board.isPlayer()) client.closeGame()
  else if (board.isWatcher()) client.monitor(board.game.gameId, false)
  client.who()
  client.list()
  board.close()
  _switchLayer(1)
  $('#boardMessageArea').empty()
  watcherGrid.clear().draw()
  kifuGrid.clear().draw()
  _greetState = 0
  _studyBase = null
  _studyBranch = null
}

function sendMoveAsPlayer(move){
  client.move(move)
  board.moves.push(move)
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

function _kifuModeRadioChange(){
  if ($("input[name=kifuModeRadio]:eq(0)").prop("checked")) {
    if (board.onListen) {
      board.onListen = false
      $("#kifuGridWrapper").find(".dataTables_scrollBody").addClass("local-kifu")
      if (board.isSubHost()) _sendAutoChat("#G000")
      board.clearCanvas()
    }
  } else {
    if (!board.onListen) {
      board.onListen = true
      $("#kifuGridWrapper").find(".dataTables_scrollBody").removeClass("local-kifu")
      if (board.isSubHost()) _sendAutoChat("#G001")
      board.clearArrows(false)
      board.redrawAllArrows(true, true)
      if (board.isPostGame && _studyBase != null) _handleStudy()
      if (!board.isPostGame) {
        if (kifuGrid.row(':last').data().branch) _restorePublicKifu()
        kifuGrid.row(':last').select()
        scrollGridToSelected(kifuGrid)
        board.replayMoves(board.moves)
      }
    }
  }
}

function forceLocalMode(){
  if ($("input[name=kifuModeRadio]:eq(0)").prop('checked') == false){
    $("input[name=kifuModeRadio]:eq(0)").prop('checked', true)
    _kifuModeRadioChange()
  }
}

function _kifuSelected(index){
  if (kifuGrid.row(':last').data().branch && !kifuGrid.row(index).data().branch) {
    _restorePublicKifu()
    if (board.isHost()) _sendAutoChat("#G003")
  }
  board.replayMoves(kifuGrid.rows(Array.from(Array(index+1).keys())).data())
  if (board.isHost()) {
    sendStudy(index)
  } else {
    forceLocalMode()
  }
}

function _restorePublicKifu(){
  kifuGrid.clear()
  kifuGrid.rows.add(board.moves)
  drawGridMaintainScroll(kifuGrid)
}

function sendTimeout(){
  client.timeout()
  board.pauseAllTimers()
}

function setBoardConditions(){
  board.setBoardConditions()
  $("#lobbyOptionButton")
  if (board.isPlayer()) {
    $("#flipButton").addClass("button-disabled")
    $("#greetButton").prop('disabled', false)
    if (board.isPostGame) {
      kifuGrid.select.style('single')
      $("input[name=kifuModeRadio]").prop("disabled", board.isHost())
      $("#resignButton").addClass("button-disabled")
      $("#clearArrowsButton, #positionMenuButton, #kifuMenuButton, #rematchButton, #closeGameButton").removeClass("button-disabled")
      $("#receiveWatcherChatCheckBox").prop({disabled: true, checked: true})
    } else {
      kifuGrid.select.style('api')
      $("input[name=kifuModeRadio]").prop("disabled", true)
      $("#resignButton").removeClass("button-disabled")
      $("#clearArrowsButton, #positionMenuButton, #kifuMenuButton, #rematchButton, #closeGameButton").addClass("button-disabled")
      if (board.game.gameType != "r") {
        $("#receiveWatcherChatCheckBox").prop({disabled: false, checked: true})
      } else {
        $("#receiveWatcherChatCheckBox").prop({disabled: true, checked: false})
      }
    }
  } else if (board.isWatcher()){
    kifuGrid.select.style('single')
    $("input[name=kifuModeRadio]").prop("disabled", board.isHost())
    $("#greetButton").prop('disabled', 'true')
    $("#resignButton, #rematchButton").addClass("button-disabled")
    $("#clearArrowsButton, #flipButton, #positionMenuButton, #kifuMenuButton").removeClass("button-disabled")
    $("#receiveWatcherChatCheckBox").prop({disabled: true, checked: true})
  }
  if (board.game) $("#logoutButton").removeClass("button-disabled")
  else $("#logoutButton").addClass("button-disabled")
  if (board.onListen) $("input[name=kifuModeRadio]:eq(1)").prop("checked", true)
  else $("input[name=kifuModeRadio]:eq(0)").prop("checked", true)
  $("#giveHostButton").removeClass("button-disabled")
  if (!board.isHost()) $("#giveHostButton").addClass("button-disabled")
  _kifuModeRadioChange()
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
        {text: i18next.t("player_info.challenge"), click: function(){_playerChallengeClick(user); $(this).dialog('close')}},
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
    } else if (user.waitingGameName.match(/^va/)) {
  	  writeUserMessage(EJ("This game rule is not supported yet.", "HTML版は特殊ルールには未対応です。"), 1, "#ff0000")
	  } else {
		  _challengeUser = user
		  writeUserMessage(EJ("Challenging " + _challengeUser.name + "..... (Must wait for 20 seconds max)\n", _challengeUser.name + "さんに挑戦中..... (待ち時間 最大で20秒)\n"), 1, "#008800", true)
		  client.challenge(_challengeUser)
      setGeneralTimeout("CHALLENGE", 30000)
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

function _handleImpasseDeclare(){
  $("#modalImpasse").dialog('close')
  client.kachi()
}

function sendGrab(x, y){
  client.gameChat("[##GRAB]" + x + "," + y)
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
  mileage = parseInt(tokens[12])
  premium = makePremiumNum(parseInt(tokens[13]),tokens[14])
  hidden_prm = premium
  _updateLobbyHeader()
  writeUserMessage(i18next.t("msg.html5_initial"), 1, "#008800")
  _hourMileCount = 0
  setGeneralTimeout("HOUR_MILE", 3600000)
  client.who(true)
  client.list()
  if (testMode) _testFunction(2)
}

function _updateLobbyHeader(){
  $('#header-playerName').text(me.name + " : ")
  $('#header-rate').text("R" + me.rate + " : ")
  $('#header-mile').text(mileage + EJ(" D-Miles : ", " Dマイル : "))
  $('#header-premium').text(makePremiumName(premium) + EJ(" class", " クラス"))
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
  playerGrid.row('#' + me.name).select()
  scrollGridToSelected(playerGrid)
  drawGridMaintainScroll(waiterGrid)
}

function _handleList(str){
  let n = 0
  let lines = str.trim().split("\n")
  gameGrid.clear()
  let games = []
  lines.forEach(function(line){
    if (line == "") return
    n += 1
    let tokens = line.split(" ")
		let black = users[tokens[0].split("+")[2]]
		if (!black) {
			black = new User(tokens[0].split("+")[2])
			if (tokens[0].match(/^STUDY\+/)) black.setFromStudy(true)
			else black.setFromList(tokens[2], parseInt(tokens[4]))
		}
		let white = users[tokens[0].split("+")[3]]
		if (!white) {
			white = new User(tokens[0].split("+")[3])
			if (tokens[0].match(/^STUDY\+/)) white.setFromStudy(false)
			else white.setFromList(tokens[3], parseInt(tokens[5]))
		}
		let game = new Game(n, tokens[0], black, white);
		game.setFromList(parseInt(tokens[1]), tokens[6], tokens[7] == "true", tokens[8] == "true", parseInt(tokens[9]), tokens[10])
    games.push(game)
  })
  games.sort(function(a, b){
    if (a.maxRate() < b.maxRate()) return 1
    if (a.maxRate() > b.maxRate()) return -1
    return 0
  })
  gameGrid.rows.add(games)
  gameGrid.draw()
}

function _handleWatchers(str){
  let lines = str.trim().split("\n")
  watcherGrid.clear()
  lines.forEach(function(line){
    if (users[line]) watcherGrid.row.add(users[line].gridObject())
  })
  watcherGrid.draw()
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
  playerGrid.row.add(users[name].gridObject())
  drawGridMaintainScroll(playerGrid)
}

function _handleLobbyOut(name){
	if (currentLayer == 1) {
		if (_isFavorite(name) || _isColleague(name)) {
			writeUserMessage("  -  " + name + i18next.t("code.G031"), 1, "#008800")
			// TODO if (isFavorite && _chat_sound1_play) _sound_door_close.play();
		}
	}
  playerGrid.row("#" + name).remove()
  waiterGrid.row("#" + name).remove()
  drawGridMaintainScroll(playerGrid)
  drawGridMaintainScroll(waiterGrid)
	// TODO serverLabel.text = serverName + LanguageSelector.EJ(" : ", "サーバ : ") + LanguageSelector.lan.lobby + LanguageSelector.EJ(" (", " (ログイン数 ") + _user_list.length + LanguageSelector.EJ(" players)", "名)");
	delete users[name];
}

function _handleGame(line) {
  let name = ""
	if (line.match(/^\[(.+)\]$/)) {
    name = RegExp.$1
		if (users[name]) {
			users[name].setFromGame("*", "*", "")
			if (playerInfoWindows[name]) playerInfoWindows[name].disableChallenge()
		}
    waiterGrid.row('#' + name).remove()
    drawGridMaintainScroll(waiterGrid)
	} else {
		let tokens = line.match(/^([0-9a-z]+?)_(.*)-([0-9]*)-([0-9]*),/)
		if (tokens[2].match(/^@/)) return
		if (tokens[2].match(/\-\-/)) {
			name = tokens[2].split("--")[0]
		} else {
			name = tokens[2].split(".")[0]
		}
		tokens = line.match(/(.+),(\+|\-|\*),(.+)$/)
		if (!users[name]) return
    users[name].setFromGame(tokens[1], tokens[2], tokens[3] == "*" ? "" : tokens[3])
    waiterGrid.row('#' + name).remove()
    waiterGrid.row.add(users[name].gridObject())
    drawGridMaintainScroll(waiterGrid)
	}
  playerGrid.row('#' + name).data(users[name].gridObject())
  drawGridMaintainScroll(playerGrid)
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
  _challengeUser = null
//	  _waiting = false;
//	  _rematching = false;
    //  var match:Array = e.message.match(/^START:(.*)\+(.*)-([0-9]*)-([0-9]*)/);
    if (board.game) _closeBoard()
	  board.setGame(new Game(0, gameId, black, white))
    board.startGame(initialPosition, myTurn ? 0 : 1)
    $("#kifuGridWrapper").find(".dataTables_scrollBody").removeClass("local-kifu")
    setBoardConditions()
    _switchLayer(2)
    sp.gameStart()
    _greetState = 1

    if (myTurn) writeUserMessage(EJ("You are Black " + (board.game.isHandicap() ? "(Handicap taker)." : "(Sente)."), "あなた" + (board.game.isHandicap() ? "は下手(したて)" : "が先手") + "です。"), 2, "#008800")
    else writeUserMessage(EJ("You are White " + (board.game.isHandicap() ? "(Handicap giver)." : "(Gote).\n"), "あなた" + (board.game.isHandicap() ? "が上手(うわて)" : "は後手") + "です。"), 2, "#008800")
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
  board.clearArrows(true)
  if (board.isPlaying()){
    let owner = csa.substr(0, 1) == "+"
    board.getPlayersTimer(owner).useTime(time)
    if (owner && board.myRoleType == 0 || !owner && board.myRoleType == 1) {
      board.moves[board.moves.length - 1].time = time
      board.addMoveToKifuGrid(board.moves[board.moves.length - 1])
    } else {
      let move = new Movement(board.getFinalMove())
      move.setFromCSA(csa)
      move.time = time
      board.handleReceivedMove(move)
      board.updateTurnHighlight()
    }
    board.runningTimer.run()
  }
}

function _handleGameEnd(lines, atReconnection = false){
  board.pauseAllTimers()
  let gameEndType = lines.split("\n")[0]
  let result = lines.split("\n")[1]
  //var adviseIllegal:Boolean = false;
  clearInterval(_disconnectTimer)
  $("p#disconnectTimer").remove()
  board.isPostGame = true
  let move = new Movement(board.getFinalMove())
  move.setGameEnd(gameEndType) //turn too?
  if (gameEndType != "SUSPEND") {
    board.moves.push(move) //refresh list too
    if (!kifuGrid.row(':last').data().branch) board.addMoveToKifuGrid(move)
  }
  writeUserMessage(move.toGameEndMessage(), 2, "#DD0088")
	//if (GameTimer.soundType >= 2) Byoyomi.sayTimeUp();
  //board.timeout();
  switch (result) {
    case "LOSE":
    	board.studyHostType = 2
    	board.playerNameClassChange(1 - board.myRoleType, "name-winner", true)
      writeUserMessage(EJ("### You Lose ###", "### あなたの負けです ###"), 2, "#DD0088", true)
      sp.gameEnd(false)
    	openResult(-1)
    	//if (adviseIllegal) _writeUserMessage(LanguageSelector.EJ("( For details of illegal moves in shogi, see: http://81dojo.com/documents/Illegal_Move )\n", "( 将棋の反則手についてはこちらでご確認下さい: http://81dojo.com/documents/反則手 )\n"), 2, "#DD0088");
      /*
    	if (board.gameType == "r") _losses_session += 1;
    	var history = "  ●";
    	_losersCloseButtonTimer.reset();
    	_losersCloseButtonTimer.start();
      */
      break
    case "WIN":
      board.studyHostType = 1
    	board.playerNameClassChange(board.myRoleType, "name-winner", true)
      writeUserMessage(EJ("### You Win ###\n", "### あなたの勝ちです ###\n"), 2, "#DD0088", true)
      sp.gameEnd(true)
    	openResult(1)
      /*
    	if (board.gameType == "r") _wins_session += 1;
    	history = "  ◯";
      */
    	// if (board.game.isRated() && board.moves.length >= 6 && (me.wins + 1) % 100 == 0)) client.chat("[##WINS]" + (me.wins + 1))
      break
    case "DRAW":
    	if (board.myRoleType == 1) board.studyHostType = 2
    	else if (board.myRoleType == 0) board.studyHostType = 1
      writeUserMessage(EJ("### Draw ###\n", "### 引き分け ###\n"), 2, "#DD0088", true)
      sp.gameEnd(true)
    	if (board.isPlayer() && !atReconnection) openResult(0)
    	//history = "  引";
      break
    case "SENTE_WIN":
    	board.playerNameClassChange(0, "name-winner", true)
      writeUserMessage(EJ("### Sente (or Shitate) Wins ###\n", "### 先手(または下手)の勝ち ###\n"), 2, "#DD0088", true)
      sp.gameEnd(true)
      break
    case "GOTE_WIN":
    	board.playerNameClassChange(1, "name-winner", true)
      writeUserMessage(EJ("### Gote (or Uwate) Wins ###\n", "### 後手(または上手)の勝ち ###\n"), 2, "#DD0088", true)
      sp.gameEnd(true)
      break
  }
  if (board.isPlayer() && board.game.gameType == "hc") {
	  if (board.myRoleType == 0) board.studyHostType = 1
    else board.studyHostType = 2
  }
  if (board.isHost()) writeUserMessage(i18next.t("msg.host"), 2, "#008800", true)
  else if (board.isSubHost()) writeUserMessage(i18next.t("msg.subhost"), 2, "#008800", true)
  /*
  if (opponent_disconnected && board.isSubHost) {
	  board.isStudyHost = true;
	  board.isSubHost = false;
  }
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
  */
  if (board.isPlayer() && !atReconnection) {
    if (board.game.gameType == "r") client.mileage(10, config.mileagePass)
    else client.mileage(5, config.mileagePass)
  }
  setBoardConditions()
  board.updateTurnHighlight()
  if (_greetState <= 2) _greetState = atReconnection ? 4 : 3
  /*
  _shareKifuEnabled = true;
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

function _handleResult(str){
  let tokens = str.split(",")
  loadResult(tokens[0], tokens[1], tokens[2], tokens[3])
}

function _handleMonitor(str){
  let kifu_id = null
  let lines = str.split("\n")
  let move_strings = []
  let since_last_move = 0
  let positionStr = ""
  let gameEndStr = ""
  board.clearArrows(true)
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
    } else if (line.match(/^#(SENTE_WIN|GOTE_WIN|DRAW|RESIGN|TIME_UP|ILLEGAL_MOVE|SENNICHITE|OUTE_SENNICHITE|JISHOGI|DISCONNECT|SUSPEND|CATCH|TRY)/)) {
      gameEndStr += RegExp.$1 + "\n"
    }
  })
  if (kifu_id) { // Start of watching game
    board.startGame(positionStr, 2, move_strings, since_last_move)
    setBoardConditions()
    _switchLayer(2)
    /*
		  if (board.gameType == "r") {
			  _writeUserMessage(LanguageSelector.lan.msg_rated + "\n", 2, "#008800", true);
		  } else {
			  _writeUserMessage(LanguageSelector.lan.msg_nonrated + "\n", 2, "#008800", true);
		  }
		  var match:Array;
		  if ((match = game_info[2].match(/\-\-(\d+)$/))) {
			_writeUserMessage(LanguageSelector.EJ('This game belongs to "', "イベント対局: 「") + InfoFetcher.getSystemTournamentName(parseInt(match[1])) + LanguageSelector.EJ('"\n', "」\n"), 2, "#FF3388", true);
			_writeUserMessage("( http://system.81dojo.com/" + LanguageSelector.EJ("en", "ja") + "/tournaments/" + match[1] + " )\n", 2, "#FF3388");
		  }
		  _shareKifuEnabled = false;
		  _study_notified = false;
      */
  } else {
    move_strings.forEach(function(move_str){
      if (move_str.match(/^%TORYO/)) return
      let move = new Movement(board.getFinalMove())
      move.setFromCSA(move_str.split(",")[0])
      move.time = parseInt(move_str.split(",")[1])
      board.handleMonitorMove(move)
    })
  }
  if (gameEndStr != "") _handleGameEnd(gameEndStr)
}

function _handleReconnect(str){
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
  board.startGame(positionStr, board.getPlayerRoleFromName(me.name), move_strings, since_last_move)
  setBoardConditions()
  _switchLayer(2)
  _greetState = 2
  if (gameEndStr != "") {
    client.status = 0
    _handleGameEnd(gameEndStr, true)
  }
}

function _handleEnter(name){
  if (board.getPlayerRoleFromName(name) != null) {
    clearInterval(_disconnectTimer)
    $("p#disconnectTimer").remove()
    if (board.isPlaying()) board.reconnectTimer(board.getPlayerRoleFromName(name))
		writeUserMessage(_name2link(name) + i18next.t("code.G030"), 2, board.getPlayerRoleFromName(name) == 0 ? "#000000" : "#666666", true)
    board.playerNameClassChange(board.getPlayerRoleFromName(name), "name-left", false)
    sp.door(true)
		if (board.isHost()) client.gameChat("[##SUBHOST_ON]" + name)
  } else {
    let importantUser = false
		if (watcherGrid.rows().count() < 15 || importantUser) {
			writeUserMessage(_name2link(name) + i18next.t("code.G030"), 2, "#008800", importantUser)
      //TODO if importantUser && isPostGame then doorOpen-sound
		}
		if (users[name]) {
      watcherGrid.row.add(users[name].gridObject())
      drawGridMaintainScroll(watcherGrid)
  		//_watcherTitle = LanguageSelector.lan.watchers + " (" + _watcher_list.length +")";
    }
  }
  if (board.isHost()) client.privateChat(name, "[##STUDY]" + _generateStudyText(kifuGrid.row({selected: true}).data().num))
  /*
	if (_isDuringMyGame() && !board.is34()) {
		if (_notify_blind) {
			if (board.piece_type == 100) _client.privateChat(e.message, "[auto-PM] #G014");
			else if (board.piece_type == 101) _client.privateChat(e.message, "[auto-PM] #G015");
			else if (board.piece_type == 102) _client.privateChat(e.message, "[auto-PM] #G016");
		}
		if (board.gameType != "r" && !_allowWatcherChat) _client.privateChat(e.message, "[auto-PM] #G102");
	}
	if (voiceButton.sendingDirect()) _client.privateChat(e.message, "[##VOICE]DIRECT," + voiceButton.nearID);
	else if (voiceButton.sendingShared) _client.privateChat(e.message, "[##VOICE]SHARED");
	else if (voiceButton.broadcastingSelf) _client.privateChat(e.message, "[##VOICE]BROADCAST");
	if (_users[e.message]) _users[e.message].clearTags();
	_updateStatusMarks(e.message);
  */
}

function _handleLeave(name) {
  if (!board.game) return
  if (board.getPlayerRoleFromName(name) != null) {
		writeUserMessage(name + i18next.t("code.G031"), 2, board.getPlayerRoleFromName(name) == 0 ? "#000000" : "#666666", true)
    board.playerNameClassChange(board.getPlayerRoleFromName(name), "name-left", true)
    sp.door(false)
  } else {
		let importantUser = false
		if (watcherGrid.rows().count() < 10 || importantUser) {
			writeUserMessage(name + i18next.t("code.G031"), 2, "#008800", importantUser)
      //TODO if importantUser && isPostGame then doorClose-sound
		}
    watcherGrid.row("#" + name).remove()
    drawGridMaintainScroll(watcherGrid)
		//_watcherTitle = LanguageSelector.lan.watchers + " (" + _watcher_list.length +")";
  }
  /*
	if (_losersCloseButtonTimer.running && (e.message == board.playerInfos[0].name || e.message == board.playerInfos[1].name)) {
		_losersCloseButtonTimer.stop();
		closeButton.enabled = true;
	}*/
}

function _handleDisconnect(name) {
  if (!board.game) return
  if (board.getPlayerRoleFromName(name) != null) {
		writeUserMessage(name + EJ(" disconnected.", "さんの接続が切れました。"), 2, board.getPlayerRoleFromName(name) == 0 ? "#000000" : "#666666", true)
    board.playerNameClassChange(board.getPlayerRoleFromName(name), "name-left", true)
    sp.door(false)
  	if (board.isPlaying() && name != me.name) {
      board.disconnectTimer(board.getPlayerRoleFromName(name))
      writeUserMessage(i18next.t("msg.opponent_disconnect"), 2, "#ff0000")
      _startDisconnectTimer()
  	}
	}
}

function _startDisconnectTimer(){
  $("p#disconnectTimer").remove()
  let p = $('<p></p>', {id: 'disconnectTimer'})
  $("#boardMessageArea").append(p)
  p.html(i18next.t("since_disconnect") + '<span id="disconnectCount">0</span>&nbsp' + i18next.t("sec"))
  let count = 0
  _disconnectTimer = setInterval(function(){
    count++
    $("span#disconnectCount").text(count)
    if (count == 60) {
      $('<input id="disconnectDeclareButton" type="button" value="' + i18next.t("declare") + '" style="height:20px;margin-left:5px">').appendTo(p)
      $("#disconnectDeclareButton").click(function(){
        _handleDisconnectDeclare()
      })
    } else if (count >= 300) {
      _handleDisconnectDeclare()
    }
  }, 1000)
}

function _handleDisconnectDeclare(){
  clearInterval(_disconnectTimer)
  client.declare()
  $("p#disconnectTimer").remove()
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
    drawGridMaintainScroll(playerGrid)
    drawGridMaintainScroll(waiterGrid)
		game = new Game(0, game_id, users[tokens[2]], users[tokens[3]])
	}
  gameGrid.row.add(game)
  drawGridMaintainScroll(gameGrid)
  /*
	if (autoEnterStudy) {
		_watch_game = _games[e.message];
		_execute_watch();
	}
  */
}

function _handleChat(sender, message){
  // TODO: if in ignore list
	if (message.match(/^\[##INFONEW\]/)) {
		return
	} else if (message.match(/^\[##BROADCAST\](.+)$/)) {
    // TODO
    return
	} else if (message.match(/^\[##WINS\](\d+)$/)) {
		writeUserMessage(_name2link(sender) + EJ(" has won ", "さんが通算") + parseInt(RegExp.$1) + EJ(" games!", "勝を達成しました!"), 1, "#008800", true);
	} else if (message.match(/^\[##EXP\](.+),(\d+)$/)) {
//		writeUserMessage(_name2link(sender) + EJ(" is promoted to " + makeRank34FromExp(parseInt(RegExp.$2)) + " class in " + (RegExp.$1 == "nr" ? "10-sec Shogi" : gameTypeShort(RegExp.$1)) + "!", "さん、" + (RegExp.$1 == "nr" ? "10秒将棋" : gameTypeShort(RegExp.$1)) + "で " + makeRank34FromExp(parseInt(RegExp.$2)) + " に昇格!!"), 1, "#008800", true);
	} else if (message.match(/^\[##.+\]/)) {
    return
  } else if (_isFavorite(sender)) {
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
  if (currentLayer == 1) sp.chatLobby()
}

function _handleGameChat(sender, message){
	if (!board.game) return
	if (board.isPlaying() && (message.match(/^\[comment\]/))) return
	if (message.match(/\[\#\#HOVER\](\d+),(\d+)$/)) {
		//if (sender != login_name && board.onListen) board.handleHover(match[1], match[2]);
	} else if (message.match(/\[##GRAB\](\d+),(\d+)$/)) {
		if (sender != me.name && board.onListen) board.handleGrab(RegExp.$1, RegExp.$2)
    /*
	} else if (e.message.match(/\[\#\#TYPE\]$/)) {
		if (sender != login_name) {
			if (sender == board.name_labels[0].text) {
				board.typingIndicatorStart(0);
			} else if (sender == board.name_labels[1].text) {
				board.typingIndicatorStart(1);
			}
		}
    */
	} else if (message.match(/\[\#\#STUDY\](\d+)\/(.+)$/)) {
    _studyBase = parseInt(RegExp.$1)
    _studyBranch = RegExp.$2
    /*
  	if (!board.studyOn) {
  		board.studyOn = true;
  		_users[name].isHost = true;
  		_updateStatusMarks();
  	}*/
  	board.clearArrows(true)
  	if (board.isHost() && name == me.name) return
    /*
  	if (!_study_notified && board.post_game && !board.onListen && !board.isStudyHost) {
  		_writeUserMessage(LanguageSelector.lan.msg_study_notify + "\n", 2, "#008800");
  		_study_notified = true;
  	}
    */
		if (!(board.isPostGame && board.onListen)) return
		_handleStudy()
    /*
		var old_length:int = board.study_list.length;
		if (old_length == 0) _writeUserMessage(name + LanguageSelector.EJ(": Studying a branch from move #" + base + "\n", ": " + base + "手目からの分岐手順を検討\n"), 2, "#008800");
    */
	} else if (message.match(/^\[##ARROW\]CLEAR$/)) {
		if (sender != me.name) board.clearArrows(true, sender)
	} else if (message.match(/^\[##ARROW\](.+),(.+),(.+),(.+),(.+),(.+)$/)) {
		//if (_ignore_list.indexOf(sender.toLowerCase()) >= 0) return;
		if (!options.acceptArrow && sender != me.name) return
		if (board.isPlaying()) return
		//if (board.post_game && !board.studyOn) return;
		if (sender == me.name) sender = ""
		board.addArrow(parseInt(RegExp.$1), Number(RegExp.$2), Number(RegExp.$3), Number(RegExp.$4), Number(RegExp.$5), parseInt(RegExp.$6, 16), true, sender)
    /*
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
    */
	} else if (message.match(/^\[##GIVEHOST\](.+)$/)) {
		if (RegExp.$1 == me.name) {
      sendStudy()
      board.studyHostType = 2
      $("input[name=kifuModeRadio]:eq(1)").prop("checked", true)
      _kifuModeRadioChange()
      setBoardConditions()
			writeUserMessage(i18next.t("msg.host"), 2, "#008800", true)
    } else {
      writeUserMessage(EJ("Study Host status given to " + RegExp.$1, "感想戦ホストは、" + RegExp.$1 + "さんに引き継がれました。"), 2, "#008800")
    }
    /*
		if (_users[match[1]]) {
			for each (var user:Object in _users) user.isHost = false;
			_users[match[1]].isHost = true;
			_updateStatusMarks();
		}
    */
	} else if (message.match(/^\[##SUBHOST_ON\](.+)$/)) {
		if (RegExp.$1 == me.name) {
			writeUserMessage(i18next.t("msg.subhost_given"), 2, "#008800", true)
			board.studyHostType = 1
		} else {
			writeUserMessage(EJ("Study Sub-host status given to " + _name2link(RegExp.$1), _name2link(RegExp.$1) + "さんに、感想戦サブ・ホスト権限が付与されました。"), 2, "#008800")
		}
    /*
	} else if ((match = e.message.substr(12).match(/^\[.+\]\s\[##TEMPLATE\]([A-Z]\d{3})/))) {
		_handleGameChat(new ServerMessageEvent("template", "##[GAMECHAT][" + sender + LanguageSelector.EJ("] <Template> ", "] <定型> ") + LanguageSelector.lan[match[1]]));
    */
	} else if (message.match(/^\[##REMATCH\]$/)) {
    board.rematch(board.getPlayerRoleFromName(sender))
    _interpretCommunicationCode(sender, "G050", 2, true, true)
    if (board.rematchAgreed()) {
			writeUserMessage(EJ("Rematch agreed!", "再戦成立!"), 2, "#008800", true)
			if (board.isPlayer()) {
        client.closeGame()
				client.rematch(board.game, board.myRoleType)
			} else {
        $("#rematchButton").removeClass("button-disabled")
			}
    }
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
    sp.chatBoard()
	}
}

function _handlePrivateChat(sender, message){
	if (message.match(/^\[\#\#STUDY\](\d+)\/(.+)$/)) {
    _studyBase = parseInt(RegExp.$1)
    _studyBranch = RegExp.$2
		if (!(board.isPostGame && board.onListen)) return
		_handleStudy()
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

function _handleMile(result) {
	//if (_isGuest) return;
  result = parseInt(result)
  if (result == -1) return
  let diff = result - mileage
	if (diff > 0) writeUserMessage(EJ("You've earned " + diff + " D-Mile" + (diff == 1 ? "!" : "s!"), diff + " Dマイル獲得しました!"), 1, "#FF3388")
	else if (diff < 0) writeUserMessage(EJ("You've used " + (- diff) + " D-Mile" + (diff == -1 ? "" : "s"), (- diff) + " Dマイルを消費しました。(通算マイル・期間マイルは減少しません)"), 1, "#FF3388")
  mileage = result
  _updateLobbyHeader()
}

function _handleClosed(){
  _stopAllTimeouts()
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
    Post-game communication
===================================== */

function _handleStudy() {
  if (_studyBase == null) return
	if (_studyBranch == "*") {
    if (kifuGrid.row(':last').data().branch) _restorePublicKifu()
    kifuGrid.rows().deselect()
    kifuGrid.row(_studyBase).select()
    scrollGridToSelected(kifuGrid)
    board.replayMoves(kifuGrid.rows(Array.from(Array(_studyBase + 1).keys())).data())
	} else {
    kifuGrid.clear()
    kifuGrid.rows.add(board.moves.slice(0, _studyBase + 1))
    board.replayMoves(kifuGrid.rows(Array.from(Array(_studyBase + 1).keys())).data())
    let prevMove = board.moves[_studyBase]
    _studyBranch.split("/").forEach(function(csa){
      let move = new Movement(prevMove)
      move.setFromCSA(csa)
      move.branch = true
      prevMove = board.handleBranchMove(move)
      kifuGrid.rows.add([prevMove])
    })
    board.refreshPosition()
    kifuGrid.draw()
    kifuGrid.row(':last').select()
    scrollGridToSelected(kifuGrid)
		// if (name != login_name && board.study_list.length >= old_length) board.showLastSquareLabel(name);
	}
}

function _generateStudyText(index){
  //integer
  let str = ""
  for (let i = 0; i <= index; i++) {
    let move = kifuGrid.row(i).data()
    if (!move.branch) {
      str = move.num.toString()
    } else {
      str += "/" + move.toCSA()
    }
  }
	if (!str.match(/\//)) str += "/*"
  return str
}

function sendStudy(index = kifuGrid.row({selected: true}).data().num){
  client.gameChat("[##STUDY]" + _generateStudyText(index))
}

function _sendAutoChat(str) {
  if (board.game) {
    client.gameChat("[auto-chat] " + str)
  } else {
    client.chat("[auto-chat] " + str)
	}
}

/* ====================================
    Web System API response handlers
===================================== */

function _handleServers(data){
  data[0].population = restoreIdleConnections(data[0].population)
  serverGrid.clear()
  serverGrid.rows.add(data)
  serverGrid.draw()
  serverGrid.row(0).select()
  if (testMode) _testFunction(1)
}

/* ====================================
    General
===================================== */

function _switchLayer(n){
  $('div#layerLogin').css({'z-index': n == 0 ? 2 : 1, opacity: n == 0 ? 1 : 0})
  $('div#layerLobby').css({'z-index': n == 1 ? 2 : 1, opacity: n == 1 ? 1 : 0})
  $('div#layerBoard').css({'z-index': n == 2 ? 2 : 1, opacity: n == 2 ? 1 : 0})
  currentLayer = n
}

function setGeneralTimeout(key, ms){
  //string, integer
  if (timeouts[key]) return
  timeouts[key] = setTimeout(_handleGeneralTimeout, ms, key)
}

function clearGeneralTimeout(key){
  if (timeouts[key]) {
    clearTimeout(timeouts[key])
    timeouts[key] = false
  }
}

function _handleGeneralTimeout(key){
  timeouts[key] = false
  switch (key) {
    case "CHALLENGE":
  		if (_challengeUser) {
  			_challengeUser = null
  			writeUserMessage(EJ("Communication could not be established with this opponent. The challenge is canceled.", "相手との通信が確認できないため挑戦をキャンセルします。"), 1, "#008800", true)
  			client.decline("C006")
  		}
      break
    case "REFRESH":
      $("#refreshButton").removeClass("button-disabled")
      break
    case "HOUR_MILE":
			client.mileage([5, 8, 10, 10, 12, 12, 12, 12][_hourMileCount], config.mileagePass)
      if (_hourMileCount < 7) {
        _hourMileCount++
        setGeneralTimeout("HOUR_MILE", 3600000)
      }
  }
}

function _stopAllTimeouts(){
  Object.keys(timeouts).forEach(function(key){
    clearGeneralTimeout(key)
  })
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

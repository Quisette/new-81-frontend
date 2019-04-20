"use strict";
var testMode = false
var viewerKifuId = null
const IMAGE_DIRECTORY = "https://81dojo.com/dojo/images/"
var args = new Object()
var client = null;
var apiClient = null;
var sp;
var currentLayer = 0;
var mileage;
var serverGrid;
var playerGrid;
var waiterGrid;
var gameGrid;
var watcherGrid;
var kifuGrid;
var users = new Object();
var tournaments = new Object()
var playerInfoWindows = new Object();
var timeouts = new Object()
var _disconnectTimer
var me;
var _challengeUser = null
var _gameAccepted = false
var _allowWatcherChat = false
var _greetState = 0 //0:not-active, 1:before-game, 2:during-game, 3:after-game, 4:post-game
var premium = 0
var countries = seedCountries()
var board
var hidden_prm = 0
var _hourMileCount
var mouseX
var mouseY
var config = null
var infoFetcher = new Object()
var options = new Object()
var _studyBase = null
var _studyBranchMoves = null
var _studySender = null
var _sendStudyBuffer = null
var _opponentDisconnectCount = 0
var _dialogOnBoardClose = false
var _worldClocks = []
var _loginHistory = []
var hostPlayerName = null
var _loserLeaveDisabled = false
var _declinedList = new Object() // _declinedList[name] = false: declined, = true: auto-decline
var snowfall = null
var _longTapRow = null
var isTouchDevice = navigator.userAgent.match(/(iPhone|iPad|Android)/) ? true : false
var secureLoginPublicKey = null
var _ignoreList = []

/* ====================================
    On document.ready
===================================== */

function _testFunction(phase){
  //phase:integer
  if (phase == 0) { // After creation
    if (true) {
      //board.loadNewPosition()
      //_switchLayer(2)
      //return
    }
    _handleServers([
      //{id:1, name:'MERCURY', description_en: 'test', description_ja: 'テスト', enabled: true, population: 0, host: 'shogihub.com', port: 4084}
      //{id:1, name:'EARTH', description_en: 'main', description_ja: 'メイン', enabled: true, population: 0, host: 'shogihub.com', port: 4081}
      {id:1, name:'MOON', description_en: 'local', description_ja: 'ローカル', enabled: true, population: 0, host: '192.168.56.101', port: 4081}
    ])
  } else if (phase == 1) { // After servers are loaded
    //_loginButtonClick()
  } else if (phase == 2) { // After logged in
    //client.send("%%GAME hc2pd_test1-900-30 -")
    //_optionButtonClick()
  }
}

$(function(){
  // Load URL params
  if (location.search != "") {
    location.search.substring(1).split('&').forEach(function(pair){
      let tokens = pair.split('=')
      args[tokens[0]] = tokens[1]
    })
  }
  viewerKifuId = args["kid"]

  // Load version
  $('p#versionText').text('ver. ' + version)

  // Load secure login public key
  $.get("dat/secure_login.pub", function(data){secureLoginPublicKey = data})

  // Generate board
  board = new Board($('#boardBox'))

  // Load infoData
  infoFetcher = {
    initialMessageEn: [],
    initialMessageJa: [],
    titles: new Object(),
    banned: []
  }
  let xhr1 = new XMLHttpRequest()
  xhr1.addEventListener("load", function(){
    xhr2.open("get", "http://81dojo.com/dojo/infoData.txt?" + xhr1.responseText)
    xhr2.send()
  })
  let xhr2 = new XMLHttpRequest()
  xhr2.addEventListener("load", function(){
    let header = ""
    xhr2.responseText.split("\n").forEach(function(line){
      if (line.trim().match(/^###(.+)$/)) {
        header = RegExp.$1
      } else {
        switch (header) {
          case "INITIAL_MESSAGE":
            infoFetcher.initialMessageEn.push(line.trim())
            break
          case "INITIAL_MESSAGE_JP":
            infoFetcher.initialMessageJa.push(line.trim())
            break
          case "TITLE_HOLDERS":
            let tokens = line.split("\t")
            infoFetcher.titles[tokens[0]] = {name: tokens[1], tooltip: tokens[2], avatar: tokens[3].trim(), priority: 1}
            break
          case "BANNED":
            infoFetcher.banned.push(line.trim())
        }
      }
    })
  })
  xhr1.open("get", "http://81dojo.com/dojo/infoCode.txt?" + Date.now())
  if (viewerKifuId == null) xhr1.send()
  // .txt file in 81dojo.com cannot have Access-Control-Allow-Origin header set for some reason. As it has to be .html, a symbolic link infoData.html -> infoData.txt is prepared on 81dojo.com side

  sp = new SoundPlayer()

  $.getJSON("dat/config.json?" + new Date().getTime(), function(data){
    config = data
    if (config.allowConsole == false) debugLoop()
  })

  // Internationalization
  i18next.language = localStorage.locale || args["locale"] || "ja"
  i18next.use(i18nextXHRBackend).init({
    lng: localStorage.locale || args["locale"] || 'ja',
    fallbackLng: args["locale"] || 'ja',
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
  $.fn.dataTableExt.oSort['rate-str-asc'] = function(a, b) {
    a = User.rateStrToRate(a)
    b = User.rateStrToRate(b)
    return ((a < b) ? -1 : ((a > b) ?  1 : 0))
  }
  $.fn.dataTableExt.oSort['rate-str-desc'] = function(a, b) {
    a = User.rateStrToRate(a)
    b = User.rateStrToRate(b)
    return ((a < b) ? 1 : ((a > b) ?  -1 : 0))
  }
  serverGrid = $('#serverGrid').DataTable({
    data: [],
    columns: [
      {data: "name", width: "35%", className: "dt-body-left", bSortable: false,
        render: function(data){return '<img class="inline" src="img/' + data + '.png"> ' + data}},
      {width: "35%", bSortable: false,
        render: function(data, type, row){return EJ(row.description_en, row.description_ja)}},
      {data: "population", width: "35%", bSortable: false}
    ],
    rowId: "name",
    searching: false, paging: false, info: false,
    order: false,
    select: "single",
    oLanguage: {sEmptyTable: EJ('Loading...', '読込中')}
  })
  serverGrid.clear()

  playerGrid = $('#playerGrid').DataTable({
    data: [],
    columns: [
      {data: "statStr", width: "10%"},
      {data: "titleTag", width: "14%"},
      {data: "rankStr", width: "14%", bSortable: false},
      {data: "nameStr", width: "40%", className: "dt-body-left"},
      {data: "countryStr", width: "12%", className: "dt-body-left"},
      {data: "rateStr", width: "10%", className: "dt-body-right", type: "rate-str"}
    ],
    rowId: "name",
    searching: false, paging: false, info: false,
    select: "single",
    order: [[5, 'desc']],
    scrollY: true
  })
  playerGrid.clear()
  $('#playerGrid tbody').on('dblclick', 'tr', function () {
    _openPlayerInfo(users[playerGrid.row(this).id()])
  })
  playerGrid.on('user-select', function(e, dt, type, cell, originalEvent){
    if ($(cell.node()).parent().hasClass('selected')) {
      e.preventDefault()
    } else {
      _playerSelected(playerGrid, cell.index().row)
    }
  })

  waiterGrid = $('#waiterGrid').DataTable({
    data: [],
    columns: [
      {data: "waiterStr", width: "50%", className: "dt-body-left"},
      {data: "rateStr", width: "10%", className: "dt-body-right", type: "rate-str"},
      {data: "ruleStr", width: "27%"},
      {data: "timeStr", width: "13%"}
    ],
    rowId: "name",
    searching: false, paging: false, info: false,
    select: "single",
    order: [[1, 'desc']],
    scrollY: true
  })
  waiterGrid.clear()
  $('#waiterGrid tbody').on('dblclick', 'tr', function () {
    _openPlayerInfo(users[waiterGrid.row(this).id()])
  })
  waiterGrid.on('user-select', function(e, dt, type, cell, originalEvent){
    if ($(cell.node()).parent().hasClass('selected')) {
      e.preventDefault()
    } else {
      _playerSelected(waiterGrid, cell.index().row)
    }
  })

  gameGrid = $('#gameGrid').DataTable({
    data: [],
    columns: [
      {data: "senteStr", width: "31%", className: "dt-body-left", bSortable: false},
      {data: "goteStr", width: "31%", className: "dt-body-right", bSortable: false},
      {data: "ruleShort", width: "13%", bSortable: false},
      {data: "movesStr", width: "7%", bSortable: false},
      {data: "watchersStr", width: "7%", bSortable: false},
      {data: "openingStr", width: "11%", bSortable: false},
      {data: "maxRate", width: "0%", visible: false}
    ],
    rowId: "gameId",
    searching: false, paging: false, info: false,
    select: "single",
    order: [[6, 'desc']],
    scrollY: true
  })
  gameGrid.clear()
  $('#gameGrid tbody').on('dblclick', 'tr', function () {
    _enterGame(gameGrid.row(this).data())
  })

  watcherGrid = $('#watcherGrid').DataTable({
    data: [],
    columns: [
      {name: "name_column", data: "watcherStr", width: "55%", className: "dt-body-left"},
      {data: "countryStr", width: "25%", className: "dt-body-left"},
      {data: "rateStr", width: "20%", className: "dt-body-right", type: "rate-str"}
    ],
    rowId: "name",
    searching: false, paging: false, info: false,
    select: "single",
    order: [[2, 'desc']],
    scrollY: true
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

  // Sub menus
  $('.subMenu').hide()
  $('.menuBar > ul > li').hover(function(){
    if ($(this).find('a').hasClass('button-disabled')) return
    sp.buttonHover()
    $("ul:not(:animated)", this).css('min-width', $(this).width()).slideDown('fast')
  }, function(){
    $("ul",this).slideUp('fast')
  })
  if (!isTouchDevice) {
    $('.subMenu').find('a').click(function(){
      $(this).closest('ul').slideUp('fast')
    })
  }

  // World clocks
  _generateWorldClocks()

  // Snowfall
  snowfall = new Snowfall('snowfallCanvas')

  // Hide all layers other than login
  if (viewerKifuId == null) {
    _switchLayer(0)
    _fadeInLoginView()
  }

  // Load localStorage
  if (localStorage.login) $('#usernameInput').val(localStorage.login)
  if (localStorage.dat) {
    $('#passwordInput').val(decaesar(decaesar(localStorage.dat, 81), 3))
    $('#hiddenPass').val(decaesar(decaesar(localStorage.dat, 81), 3))
    maskPass()
  }
  if (localStorage.dat2) _loginHistory = decaesar(decaesar(localStorage.dat2, 81), 3).split(",")
  if (localStorage.save) $('#loginSave').prop('checked', localStorage.save == 'true')
  $('#languageSelector').val(localStorage.locale || args["locale"] || 'ja')
  if (localStorage.openingMusic) {
    $('#openingMusicCheckBox').prop('checked', localStorage.openingMusic == 'true')
    sp.muteOpening(!(localStorage.openingMusic == 'true'))
  }

  // User finder
  $('#findUser').autocomplete({
    autoFocus: true,
    minLength: 2,
    delay: 0,
    select: function(e, ui){
      let name = ui.item.value
      if (users[name]) {
        playerGrid.row('#' + name).select()
        scrollGridToSelected(playerGrid)
        _playerSelected(playerGrid, playerGrid.row({selected: true}).index())
      } else {
        writeUserMessage(i18next.t("lobby.player_not_found"), 1, "#FF0000")
      }
    }
  })

  // Event listeners
  window.onblur = function(){
    if (board.isPlaying() && !testMode && board.game.isRated()) client.gameChat("[##M_OUT]0,0")
  }
  window.onfocus = function(){
    if (board.isPlaying() && !testMode && board.game.isRated()) client.gameChat("[##M_IN]0,0")
  }
  $(window).on("beforeunload",function(e){
    if (board.isPlaying()) {
      writeUserMessage("You are player.", 2, "#FF0000")
      return "You are player. Exit the room before closing the browser."
    }
  })
  $(window).unload(function(){
    if (board.isHost()) _giveHostButtonClick()
  })
  window.addEventListener("message", function(e){
    if (e.data.match(/^goToPosition:(\d+)$/)) {
      goToPosition(parseInt(RegExp.$1))
    } else if (e.data.match(/^replayButtonClick:(.+)$/)) {
      _replayButtonClick(parseInt(RegExp.$1))
    } else if (e.data == "getKIF") {
      e.source.postMessage(_generateKIF(), e.origin)
    }
  })
  document.getElementById('layerBoard').ondragstart = function(){return false}
  $("#lobbyChatInput").on('keypress', function(e){
    if (e.keyCode == 13){
      if ($(this).val().length > 0) {
        client.chat($(this).val())
        $(this).val('')
      }
    }
  })
  $("#boardChatInput").on('keypress', function(e){
    if (e.keyCode == 13){
      if ($(this).val().length > 0) {
        clearGeneralTimeout("SEND_TYPE")
        client.gameChat($(this).val())
        $(this).val('')
      }
    }
  })
  $("#boardChatInput").on('keyup', function(e){
    if (board.isPlayer()) {
      if (e.keyCode == 13) {
			} else if (e.keyCode == 8) {
        if ($(this).val() == "") clearGeneralTimeout("SEND_TYPE")
			} else {
        if ($(this).val().length > 0) setGeneralTimeout("SEND_TYPE", 2500)
			}
    }
  })
  $("#passwordInput").tooltip({position:{my:'right middle',at:'left middle'}})
  window.onmousemove = function(event) {
      event = event || window.event
      mouseX = event.clientX
      mouseY = event.clientY
  }
  $("#findUser").on('focus', function(){$(this).val('')})
  $("[data-click]").click(function(){sp.buttonClick($(this).data('click').toUpperCase())})
  $(".ui-dialog-titlebar-close").click(function(){sp.buttonClick("CANCEL")})
  $('#playerGrid tbody, #waiterGrid tbody, #gameGrid tbody, #watcherGrid tbody').on('touchstart', 'tr', function (e){
    mouseX = e.originalEvent.touches[0].clientX
    mouseY = e.originalEvent.touches[0].clientY
    _longTapRow = $(this)
    setGeneralTimeout("LONG_TAP", 400, true)
  })
  $(window).on('touchend touchmove', function(e){
    clearGeneralTimeout("LONG_TAP")
  })

  _resize()

  // Define default options
  _loadDefaultOptions()

  //apiClient = new WebSystemApiClient("192.168.220.131", 3000)
  //apiClient = new WebSystemApiClient("192.168.56.101", 3000)
  apiClient = new WebSystemApiClient("system.81dojo.com", 80)
  apiClient.setCallbackFunctions("SERVERS", _handleServers)
  apiClient.setCallbackFunctions("OPTIONS", _handleOptions)
  apiClient.setCallbackFunctions("PLAYER", _handlePlayerDetail)
  apiClient.setCallbackFunctions("TITLES", _handleTitles)
  apiClient.setCallbackFunctions("TOURNAMENTS", _handleTournaments)
  apiClient.setCallbackFunctions("CHECK_OPPONENT", _handleCheckOpponent)
  apiClient.setCallbackFunctions("EVALUATION", _handleEvaluation)
  apiClient.setCallbackFunctions("KIFU", _handleKifuDetail)

  if (testMode) {
    $('div#loader').detach()
    _testFunction(0)
  } else if (viewerKifuId) {
    if (args["piece"]) {
      options.piece_type = parseInt(args["piece"])
      options.piece_type_34 = parseInt(args["piece"])
    }
    if (args["notation"]) options.notation_style = parseInt(args["notation"])
    options.gamechat_sound_play = 0
    _enforceOptions()
    apiClient.getKifuDetail(viewerKifuId)
  } else {
    $('div#loader').detach()
    _prepareForLogin()
  }
});

/* ====================================
    On window.resize
===================================== */

window.onresize = function () {
  _resize()
}

function _resize(){
  $("#layerLobby").find("div.menuBar").find("a.button").css('min-width', window.innerWidth / 9.5)
  $("#layerBoard").find("div.menuBar").find("a.button").css('min-width', window.innerWidth / 12.5)
  let clocksInVertical = false
  $("#worldClocks").removeClass("clocks-reduced")
	if (window.innerWidth > 1550) {
    $("#lobbyChatBox").insertAfter($("#playerListBox")).css('flex', 'initial')
    if (window.innerWidth > 1670) clocksInVertical = true
	} else {
    $("#lobbyChatBox").insertAfter($("#gameGridWrapper")).css('flex', '11 11 1px')
    if (window.innerWidth > 1090) clocksInVertical = true
    else $("#worldClocks").addClass("clocks-reduced")
	}
  if (clocksInVertical) {
    $("#worldClocks").insertAfter($("#gameListBox")).css({'height':'100%', 'flex-direction':'column', 'justify-content':'space-around'})
  } else {
    $("#worldClocks").insertAfter($("#lobbyHBox")).css({'height':'', 'flex-direction':'', 'justify-content':''})
  }
	if (window.innerWidth >= board.actualWidth() + 400 && window.innerHeight < board.actualHeight() + 230) {
    $("#boardChatBox").insertBefore($("#boardRightBottomHBox"))
    $("#watcherBox").insertAfter($("#kifuBox"))
	} else {
    $("#watcherBox").prependTo($("#boardLeftBottomHBox"))
    $("#boardChatBox").insertAfter($("#watcherBox"))
	}
  $("#playerGridWrapper, #waiterGridWrapper, #gameGridWrapper, #watcherGridWrapper, #kifuGridWrapper").each(function(){
    $(this).find('.dataTables_scrollBody').css('height', $(this).height() - $(this).find($("thead")).height())
  })
  snowfall.resize(window.innerWidth, window.innerHeight)
}

/* ====================================
    Login View functions
===================================== */

function _fadeInLoginView(){
  $('#layerLoginContents').css('opacity', 0).animate({'opacity': 1}, testMode ? 0 : 3000)
}

function _prepareForLogin(){
  setTimeout(function(){snowfall.start("SAKURA_WHITE", 10, 1)}, 1100)
  sp.startOpening()
  $('input[name=loginType], input#usernameInput, input#passwordInput, input#loginSave, input#loginButton').prop('disabled', true)
  serverGrid.clear().draw()
  _setLoginAlert("login.starting")
  apiClient.getServers()
}

function _languageSelected(){
  i18next.changeLanguage($('#languageSelector').val())
  localStorage.locale = $('#languageSelector').val()
}

function _updateLanguage(){
  serverGrid.rows().invalidate()
  playerGrid.settings()[0].oLanguage.sEmptyTable = i18next.t("loading")
  playerGrid.draw()
  waiterGrid.settings()[0].oLanguage.sEmptyTable = i18next.t("loading")
  waiterGrid.draw()
  gameGrid.settings()[0].oLanguage.sEmptyTable = i18next.t("loading")
  gameGrid.draw()
  watcherGrid.settings()[0].oLanguage.sEmptyTable = i18next.t("board.no_watchers")
  watcherGrid.draw()
  $('span#languageFlag').html(countries[$('#languageSelector option:selected').data('code')].flagImgTag16())
  $("[data-i18n]").each(function(){
    $(this).text(i18next.t($(this).attr('data-i18n')))
  })
  $("[data-i18n-value]").each(function(){
    $(this).val(i18next.t($(this).attr('data-i18n-value')))
  })
  $("[data-i18n-title]").each(function(){ //TODO exclude modal dialogs
    $(this).attr('title', i18next.t($(this).attr('data-i18n-title')))
  })
  $('#newGameRuleSelect, #newGameStudyRuleSelect').empty()
  let handicaps = i18next.language == "ja" ? HANDICAPS_JA : HANDICAPS_EN
  Object.keys(handicaps).forEach(function(key){
    if (key == "r" || key == "vazoo2") return true
    $('#newGameRuleSelect, #newGameStudyRuleSelect').append($("<option />").val(key).text(handicaps[key]))
  })
  $('#modalNewGame, #modalChallenger, #modalInvitation, #modalImpasse, #modalOption, #modalChatTemplate').each(function(){
    $(this).dialog('option', 'title', i18next.t($(this).attr('data-i18n-title')))
    $(this).prop('title', '')
  })
  $('[id^=i18n-]').each(function(){
    $(this).button('option', 'label', i18next.t($(this).attr('id').split("-")[1]))
  })
}

function _openingMusicCheckBoxClick(){
  localStorage.openingMusic = $('#openingMusicCheckBox').prop('checked')
  sp.muteOpening(!$('#openingMusicCheckBox').prop('checked'))
}

function _loginTypeChange(){
  $('#usernameInput, #passwordInput').attr('disabled', $('input[name=loginType]:checked').val() == 1)
}

function _loginButtonClick(){
  $("#passwordInput").tooltip('close')
  let server = serverGrid.row({selected: true}).data()
  if (server == null){
    alert('Please select a server.')
    return
  }
  if (_bannedLoginInHistory()) return
  $('#loginButton, #passwordInput, #usernameInput').attr('disabled', true)
  if (client != null) client.close();
  _setLoginAlert("login.connecting")
  let isGuest = $('input[name=loginType]:checked').val() == 1
  client = new WebSocketClient(server.name, server.host, server.port, isGuest ? 'guest' : $('#usernameInput').val(), isGuest ? 'dojo_guest' : $('#hiddenPass').val())
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
  client.setCallbackFunctions("EXP", _handleExp)
  client.setCallbackFunctions("WINS", _handleWins)
  client.setCallbackFunctions("ENTER", _handleEnter)
  client.setCallbackFunctions("LEAVE", _handleLeave)
  client.setCallbackFunctions("DISCONNECT", _handleDisconnect)
  client.connect();
}

function _reloginButtonClick(){
  $('input#reloginButton').css('display', 'none')
  $('img#entrance-img').prop('src', 'img/entrance_ja.jpg')
  _prepareForLogin()
  _fadeInLoginView()
}

function _bannedLoginInHistory(){
  for (let i = 0; i < _loginHistory.length; i++) {
    if (infoFetcher.banned.includes(_loginHistory[i])) return true
  }
  return false
}

function _setLoginAlert(i18nCode){
  $('#loginAlert').text(i18next.t(i18nCode)).attr('data-i18n', i18nCode)
}

/* ====================================
    Lobby View functions
===================================== */

function _logoutButtonClick(){
  $('img#entrance-img').prop('src', 'img/81Dojo_bye.jpg')
  _stopAllTimeouts()
  _backToEntrance()
  _setLoginAlert("login.closed")
  client.close()
}

function _refreshButtonClick(){
  _refreshLobby()
  $("#refreshButton").addClass("button-disabled")
  setGeneralTimeout("REFRESH", 10000)
}

function _waitButtonClick(){
  _disableNewGameOptions(me.isGuest)
  $('#modalNewGame').dialog('open')
}

function _navigateToWebSystem(path){
  window.open('http://system.81dojo.com/' + EJ('en', 'ja') + '/' + path, '_blank')
}

function _playerSelected(grid, index){
  let other_grid = grid == playerGrid ? waiterGrid : playerGrid
  let name = grid.row(index).data().name
  other_grid.rows().deselect()
  other_grid.row('#' + name).select()
  scrollGridToSelected(other_grid)
  gameGrid.rows().deselect()
  let game = _findGameByUser(users[name])
  if (game) {
    gameGrid.row('#' + game.gameId).select()
    scrollGridToSelected(gameGrid)
  }
  $('#findUser').val('')
}

function _enterGame(game){
  if (game.lockedOut()) {
    let ret = prompt(i18next.t("lobby.require_pass"))
    if (ret != null && ret != "") {
      game.enterPass(ret)
      _enterGame(game)
    }
    return
  }
  if (board.game) return
  _prepareCorrectBoard(game.gameType)
  board.setGame(game)
  //TODO watching or reconnecting ?
	if (!game.gameId.match(/^STUDY/) && board.getPlayerRoleFromName(me.name) != null) { // Reconnect
		if (me.status == 1) {
      writeUserMessage(i18next.t("msg.reconnect_while_game"), 1, "#008800", true)
      board.close()
    } else {
      client.watchers(game.gameId)
      client.reconnect(game.gameId)
    }
  } else { // Monitor
    client.watchers(game.gameId)
    client.monitor(game.gameId, true)
  }
}

function _enterGameById(gameId){
  let row = gameGrid.row('#' + gameId)
  if (row != null) _enterGame(row.data())
}

function writeUserMessage(str, layer, clr = null, bold = false, lineChange = true){
  let area
  let p
  if (layer == 1) {
    area = $('#lobbyMessageArea')
  } else if (layer == 2) {
    area = $('#boardMessageArea')
    p = $("p#disconnectTimer, p#typingIndicator-0, p#typingIndicator-1")
    if (p.length) p.detach()
  }
	str = str.replace(/</g, "&lt;")
	str = str.replace(/&lt;sPAn/g, "<span");
	str = str.replace(/&lt;\/SpaN>/g, "</span>");
	str = str.replace(/(https?\:\/\/[^\"^\s^\\^\)^\(]+)/g, '<a href="$1" target="_blank">$1</a>')
	str = str.replace(/\n/g, "<br>&emsp;")
  $('<span></span>',{}).css({
    'color': (clr ? clr : ''),
    'font-weight': (bold ? 'bold' : '')
  }).html(str).appendTo(area)
  if (lineChange) area.append('<br>')
  if (p && p.length) p.appendTo(area)
  if (area.scrollTop() + area.height() > area[0].scrollHeight - 80) area.animate({scrollTop: area[0].scrollHeight}, 'fast')
}

function _interpretCommunicationCode(name, code, n, bold, sound) {
  //string, string, integer, boolean, boolean
	writeUserMessage(name + i18next.t("code." + code), n, "#008800", bold)
  if (sound) sp.chatBoard()
}

function popupWatchers(elem){
  $(elem).tooltip({
    items: "[data-gameId]",
    track: true,
    position: {my:'left top', at:'right+10px top-2px'},
    content: function(){
      let str = ''
      let index = gameGrid.cell($(elem).closest('td')[0]).index().row
      let game = gameGrid.row(index).data()
      playerGrid.rows().every(function(){
        let user = users[this.data().name]
        if (user.isWatchingGame(game)) str += user.country.flagImgTag16() + ' ' + user.name + '<br>'
      })
      return str
    }
  });
  $(elem).tooltip('open')
}

/* ====================================
    Board View functions
===================================== */

function _prepareCorrectBoard(gameType){
  if (gameType == "vazoo") {
    if (board.constructor.name != "DobutsuBoard") {
      console.log('Changed to dobutsu')
      board = null
      board = new DobutsuBoard($('#boardBox'))
    }
  } else {
    if (board.constructor.name != "Board") {
      console.log('Changed to normal')
      board = null
      board = new Board($('#boardBox'))
    }
  }
}

function _checkLobbyButtonClick(forceDefault = false){
  if ($('#boardContents').css('pointer-events') == 'none') { // Back to normal
    $('#checkLobbyButton').addClass("button-disabled")
    $('#boardContents').css('pointer-events', 'initial').animate({'opacity': 1}, forceDefault ? 0 : 1200)
    $('#layerBoard').animate({'height': '100%'}, forceDefault ? 0 : 1200, function(){
      $('#layerBoard').css('border-bottom', 'none')
      $('#checkLobbyButton').removeClass("button-disabled")
      $('#checkLobbyButton').html('<i class="fa fa-eye fa-2x"></i>')
      $('#layerLobby').css('display', 'none')
    })
  } else if (!forceDefault) { // Start checking lobby
    $('#checkLobbyButton').addClass("button-disabled")
    $('#boardContents').css('pointer-events', 'none').animate({'opacity': 0}, 1200)
    playerGrid.clear().draw()
    waiterGrid.clear().draw()
    gameGrid.clear().draw()
    $('#layerLobby').css('display', 'block')
    $('#layerBoard').css('border-bottom', '5px ridge orange').animate({'height': '40px'}, 1200, function(){
      _refreshLobby()
      $('#checkLobbyButton').removeClass("button-disabled")
      $('#checkLobbyButton').html('<i class="fa fa-eye-slash fa-2x"></i>')
    })
  }
}

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
      if (!board.isPlayerPresent(1 - board.myRoleType)) {
        writeUserMessage(EJ("The opponent is not in this room.", "相手が退室しています"), 2, "#FF0000")
        return
      }
  		if (_checkGuestGamesExpired()) return
  		client.gameChat("[##REMATCH]")
      $('#rematchButton').addClass('button-disabled')
    }
  } else {
    let newGameName = ""
    if (board.game.gameId.split("+")[1].match(/^([0-9a-z]+?)_(.*)$/)){
      newGameName = RegExp.$1 + "_@" + RegExp.$2
    } else return
    let foundRow = gameGrid.rows(function(idx, data, node){
      return data.gameId.split("+")[1] == newGameName// && data.status == "game"
    })
    if (foundRow.data().length > 0) {
      client.monitor(board.game.gameId, false)
      board.close()
      $('#boardMessageArea').empty()
      watcherGrid.clear().draw()
      board.setGame(foundRow.data()[0])
      client.watchers(board.game.gameId)
      client.monitor(board.game.gameId, true)
    } else {
			writeUserMessage(i18next.t("msg.rematch_ended"), 2, "#008800")
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
    case 4:
      $('#modalChatTemplate').dialog('open')
      break
  }
}

function _sendChatTemplate(code){
  client.gameChat("[##TEMPLATE]" + code)
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

function _giveHostButtonClick(user = null){
  if (!board.isHost()) return
  if (user == null) {
    if (!board.game.isStudy()) {
      if (board.game.white.name != me.name && board.isPlayerPresent(1)) {
        user = board.game.white
      } else if (board.game.black.name != me.name && board.isPlayerPresent(0)) {
        user = board.game.black
      }
    }
    // TODO give host to one of the watchers if there is no player or a rematch is agreed
  }
  if (user) {
    // TODO Need to check here again whether the user is present in the game room
		client.gameChat("[##GIVEHOST]" + user.name)
    board.studyHostType = 1
    setBoardConditions()
  }
}

function _giveSubhostButtonClick(user){
  if (user.name == me.name) return
  client.gameChat("[##SUBHOST_ON]" + user.name)
}

function _materialBalanceButtonClick(){
  let num = kifuGrid.row({selected: true}).index()
  if (board.game.canCalculateMaterialBalance()) {
    let str = EJ("Material balance (move #", "駒割計算結果(") + num + EJ("):　", "手まで):　") + board.getMaterialBalance(num <= 40)
    if (viewerKifuId) alert(str)
    else writeUserMessage(str, 2, "#008800")
  }	else writeUserMessage(EJ("This function is only for even games.", "平手以外では使えません"), 2, "#FF0000")
}

function _KyokumenpediaClick(){
  if (['r', 'nr', 'hclance', 'hcbishop', 'hcrook', 'hcrooklance', 'hc2p', 'hc4p', 'hc6p'].indexOf(board.game.gameType) >= 0) window.open("http://kyokumen.jp/positions/" + board.position.toSFEN(), "_blank")
  else writeUserMessage(EJ('This game variant is not suppported.', 'このルールには非対応です'), 2, "#FF0000")
}

function _sharePositionButtonClick(mode){
  if (!board.game.gameType.match(/^va/)) sharePosition(mode)
  else writeUserMessage(EJ('This board cannot be shared.', 'この盤面はシェアできません'), 2, "#FF0000")
}

function _kifuCopyButtonClick(){
  if (!board.game.gameType.match(/^va/)) {
    let textArea = $('<textarea></textarea>', {id: 'clip-board-area'}).text(_generateKIF()).appendTo($('body'))
    $("#clip-board-area").select()
  	document.execCommand("copy")
    $("#clip-board-area").remove()
  } else writeUserMessage(EJ('This game cannot be exported.', 'この対局は出力できません'), 2, "#FF0000")
}

function _kifuDownloadButtonClick(){
  if (!board.game.gameType.match(/^va/)) {
    let date = Date.now()
    downloadToFile(_generateKIF(), "81Dojo-" + board.game.gameId.split("+")[4].substr(2,10) + "-" + board.game.black.name + "-" + board.game.white.name + ".kif")
  } else writeUserMessage(EJ('This game cannot be exported.', 'この対局は出力できません'), 2, "#FF0000")
}

function _kifuNoteButtonClick(){
  if (board.game.isStudy()) {
    writeUserMessage(EJ('This game cannot be exported.', 'この対局は出力できません'), 2, "#FF0000")
    return
  }
  let win = window.open('./kifu_note.html', 'kifu_note')
  if (!win) alert(EJ('New window could not be opened', 'ウインドウ作成に失敗しました'))
}

function _shareKifuButtonClick(mode){
  if (board.toKifuURL() != "") shareKifu(mode)
  else writeUserMessage(EJ('This board does not have a kifu URL.', 'この盤面には棋譜URLの設定がありません'), 2, "#FF0000")
}

function _uploadKifuButtonClick(){
  if (board.game.isStudy() && board.isHost()){
    let fileInput = document.createElement("input")
    fileInput.type = 'file'
    fileInput.addEventListener('change', function(e){
      let file = e.target.files[0]
      let reader = new FileReader()
      reader.onload = function(evt){
        let csa_lines = []
        if (file.name.match(/\.bod$/)) csa_lines = CSALinesFromBOD(evt.target.result)
        else if (file.name.match(/\.kifu?$/)) csa_lines = CSALinesFromKIF(evt.target.result)
        if (csa_lines.length > 0) client.resetStudyPosition(csa_lines.join("/"))
      }
      reader.readAsText(file)
    }, false)
    fileInput.click()
  }
}

function _optionButtonClick(){
  $('#modalOption').dialog('open')
}

function _handleOptionClose(){
  $('#modalOption').dialog('close')
  _setOptionsFromDialog()
  _enforceOptions()
}

function _playerNameDblClick(name){
  _openPlayerInfo(users[name])
}

function _allowWatcherChatClick(){
  _allowWatcherChat = $('#receiveWatcherChatCheckBox').is(':checked')
  if (_allowWatcherChat) _sendAutoChat("#G101")
  else _sendAutoChat("#G100")
}

function _closeBoard(roomToRoom = false){
  // roomToRoom: This is set to true when the user stays in the game room and just switches games
  // (1. Rematch by player, 2. Watcher is challenged and accepted it)
  if (board.isHost()) _giveHostButtonClick()
  if (board.isPlayer() && !roomToRoom) { // Exclude rematch
    client.closeGame() // This can be omitted with rematch, as CLOSE has been already sent
    _writeAfterCloseBoardMessage()
  }
  else if (board.isWatcher()) client.monitor(board.game.gameId, false)
  _checkLobbyButtonClick(true) //Cancel see lobby button if activated
  _refreshLobby()
  _updateHostPlayer(null)
  board.close() //board.game is null after this line!
  _switchLayer(1)
  _resize()
  $('#boardMessageArea').empty()
  watcherGrid.clear().draw()
  kifuGrid.clear().draw()
  _greetState = 0
  _studyBase = null
  _studyBranchMoves = null
  _opponentDisconnectCount = 0
  forceKifuMode(1)
  _kifuModeRadioChange()
}

function _writeAfterCloseBoardMessage(){
  if (_dialogOnBoardClose) {
    _dialogOnBoardClose = false
	  writeUserMessage(i18next.t("msg.last_kifu_url") + board.toKifuURL(), 1, "#008800")
	  _askEvaluation(board.getOpponent().name)
	  if (board.game.gameType == "r") {
		  //_writeUserMessage(LanguageSelector.EJ("Rated game results so far in this session: ", "本セッションでのこれまでの成績(レート対局のみ): ") + _wins_session + LanguageSelector.EJ(" win ", "勝 ") + _losses_session + LanguageSelector.EJ(" loss\n", "敗\n"), 1, "#008800", true);
		  //for each (var history:String in _games_session) _writeUserMessage(history + "\n", 1, "#000000");
		  if (!me.provisional && isBeforeUpgrade(me.rate)) writeUserMessage(i18next.t("msg.before_upgrade"), 1, "#FF3388")
		  else if (!me.provisional && isBeforeDowngrade(me.rate)) writeUserMessage(i18next.t("msg.before_downgrade"), 1, "#FF3388")
	  }
  }
}

function sendMoveAsPlayer(move){
  client.move(move)
  board.moves.push(move)
  /*
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
      if (board.isPostGame && _studyBase != null) _handleStudy()
      if (!board.isPostGame) {
        if (kifuGrid.rows().count() > 0 && kifuGrid.row(':last').data().branch) _restorePublicKifu()
        kifuGrid.row(':last').select()
        scrollGridToSelected(kifuGrid)
        board.replayMoves(board.moves)
      }
      board.redrawAllArrows(true, true)
    }
  }
  board.setBoardConditions()
}

function forceKifuMode(val){
  //0: local, 1: listen
  if ($("input[name=kifuModeRadio]:eq(" + val + ")").prop('checked') == false){
    sp.buttonClick("NORMAL")
    $("input[name=kifuModeRadio]:eq(" + val + ")").prop('checked', true)
    _kifuModeRadioChange()
  } else if (val == 0) {
    board.clearArrows(false)
  }
}

function goToPosition(n){
  if (kifuGrid.row(':last').data().branch) _restorePublicKifu()
  kifuGrid.row(n).select()
  scrollGridToSelected(kifuGrid)
  board.replayMoves(kifuGrid.rows(Array.from(Array(n+1).keys())).data())
}

function _kifuSelected(index, subhost_override = false){
  // If subhost-override is enabled, subhost is allowed to select a position
  // while acting like a host and staying in listen mode
  let actAsHost = board.isHost() || subhost_override && board.isSubHost()
  if (kifuGrid.row(':last').data().branch && !kifuGrid.row(index).data().branch) {
    _restorePublicKifu()
    if (actAsHost) _sendAutoChat("#G003")
  }
  board.replayMoves(kifuGrid.rows(Array.from(Array(index+1).keys())).data())
  if (actAsHost) {
    sendStudy(index)
  } else {
    forceKifuMode(0)
  }
}

function _replayButtonClick(v){
  let index = kifuGrid.row({selected: true}).index()
  if (v < 0 && index <= 0) return
  if (v > 0 && index >= kifuGrid.rows().count() - 1) {
    if (!board.isPostGame && !board.onListen) {
      forceKifuMode(1)
      _kifuModeRadioChange()
    }
    return
  }
  switch(v){
    case -2:
      index = 0
      break
    case -1:
      index--
      break
    case 1:
      index++
      break
    case 2:
      index = kifuGrid.rows().count() - 1
      break
  }
  kifuGrid.row(index).select()
  scrollGridToSelected(kifuGrid)
  _kifuSelected(index, v == -1 && board.onListen) // Subhost's-override is enabled if v is -1
}

function _restorePublicKifu(){
  let index = kifuGrid.row({selected: true}).index()
  if (board.moves.length <= 1) return
  kifuGrid.clear()
  kifuGrid.rows.add(board.moves)
  kifuGrid.row(index).select()
  drawGridMaintainScroll(kifuGrid)
}

function _updateHostPlayer(name){
  if (!board.game) return
  if (name == hostPlayerName) return
  let prevHostName = hostPlayerName
  hostPlayerName = name

  board.hostMark.detach()
  if (watcherGrid.row('#' + prevHostName).data()) {
    watcherGrid.row('#' + prevHostName).data(users[prevHostName])
  }

  if (watcherGrid.row('#' + hostPlayerName).data()) {
    watcherGrid.row('#' + hostPlayerName).data(users[hostPlayerName])
  } else if (hostPlayerName == board.game.black.name || hostPlayerName == board.game.white.name) {
    board.playerInfos[hostPlayerName == board.game.black.name ? 0 : 1].find("#player-info-rate").prepend(board.hostMark)
  }
}

function sendTimeout(){
  client.timeout()
  board.pauseAllTimers()
}

function setBoardConditions(){
  if (board.isPlayer()) {
    $("#flipButton").addClass("button-disabled")
    $("#greetButton").prop('disabled', false)
    if (board.isPostGame) {
      kifuGrid.select.style('single')
      $("#replayButtons").find("button").prop("disabled", false)
      $("input[name=kifuModeRadio]").prop("disabled", board.isHost())
      $("#resignButton").addClass("button-disabled")
      $("#clearArrowsButton, #positionMenuButton, #kifuMenuButton, #rematchButton, #closeGameButton").removeClass("button-disabled")
      $("#receiveWatcherChatCheckBox").prop({disabled: true, checked: true})
      if (_loserLeaveDisabled) $('#closeGameButton').addClass("button-disabled")
    } else {
      kifuGrid.select.style('api')
      $("#replayButtons").find("button").prop("disabled", true)
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
    $("#replayButtons").find("button").prop("disabled", false)
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
  if (board.isHost()) $(".buttons-for-host").css('display', 'initial')
  else $(".buttons-for-host").css('display', 'none')
  if (board.isHost() && board.isPlayer()) $("#giveHostButton").removeClass("button-disabled")
  else $("#giveHostButton").addClass("button-disabled")
  if (board.game.isStudy() && board.isHost()) $("#uploadKifuButton").removeClass("submenu-button-disabled")
  else $("#uploadKifuButton").addClass("submenu-button-disabled")
  if (board.isPostGame) $("#kifuNoteButton, #shareKifuTwitterButton, #shareKifuFacebookButton").removeClass("submenu-button-disabled")
  else $("#kifuNoteButton, #shareKifuTwitterButton, #shareKifuFacebookButton").addClass("submenu-button-disabled")
  _allowWatcherChat = $("#receiveWatcherChatCheckBox").is(":checked")
  if (viewerKifuId) {
    $("input[name=kifuModeRadio]:eq(0)").prop("checked", true)
    $("input[name=kifuModeRadio]").prop("disabled", true)
    $("#boardMenuRight").css('display', 'none')
  }
  _kifuModeRadioChange()
}

/* ====================================
    Modal View functions
===================================== */

function _handleNewGame(){
  let val = $('input[name="newGameType"]:checked').val()
  let comment = ""
  let password = $('#privateRoomPass').css('display') == 'block' ? $('#newGamePasswordInput').val() : ""
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
    client.wait(ruleType, 60 * $("#newGameTotalSelect option:selected").val(), $("#newGameByoyomiSelect option:selected").val(), ruleType.match(/^hc/) ? -1 : 0, "", comment, password)
  } else if (val == 6) {
    let tournamentId = $("#newGameTournamentSelect option:selected").val()
    if (tournaments[tournamentId]) tournaments[tournamentId].wait()
  } else if (val == 7) {
    client.stopWaiting()
    let ruleType = $("#newGameStudyRuleSelect option:selected").val()
    let blackName = $("#newGameStudyBlack").val()
    let whiteName = $("#newGameStudyWhite").val()
    client.study(ruleType, blackName, whiteName, password)
  } else if (val == 8) {
    client.stopWaiting()
  }
  $('#modalNewGame').dialog('close')
}

function _handleAcceptChallenge(){
  sp.buttonClick("NORMAL")
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
  sp.buttonClick("CANCEL")
	client.decline(declineCode)
	writeUserMessage(EJ("Rejected the challenge from " + challenger.name + ".", challenger.name + "さんからの挑戦をパスしました。"), 1, "#008800", true)
  if (_declinedList[challenger.name] == false) {
    $('#ignoreChallenge').remove()
    $('#lobbyMessageArea').append('<p id="ignoreChallenge">&nbsp;<a href="#" onclick="_ignoreChallenge(\'' + challenger.name + '\')">[' + i18next.t("msg.ask_auto_reject") + ']</a></p>')
  } else {
    _declinedList[challenger.name] = false // Manually declined so far
  }
}

function _ignoreChallenge(name){
  $('#ignoreChallenge').remove()
  _declinedList[name] = true // Decline automatically from now on
  writeUserMessage(i18next.t("msg.auto_reject"), 1, "#FF0000")
}

function _resetDeclinedList(){
  $('#ignoreChallenge').remove()
  // If false, delete it. If true, keep it.
  for (let name in _declinedList){
    if (_declinedList[name] == false) delete _declinedList[name]
  }
}

function _handleAcceptInvitation(user){
  sp.buttonClick("NORMAL")
  _playerChallengeClick(user)
}

function _handleDeclineInvitation(user, declineCode = ""){
  sp.buttonClick("CANCEL")
  client.privateChat(user.name, "[##REJECT]" + declineCode)
	writeUserMessage(EJ("Declined the invitation from " + user.name + ".", user.name + "さんからの招待をパスしました。"), 1, "#008800", true)
}

function _openPlayerInfo(user, doOpen = true){
  let element = $("#player-info-window-" + user.name)
  if (!element[0]) {
    element = $("<div></div>",{
      id: 'player-info-window-' + user.name,
      title: user.name + '  ' + user.titleName(),
      html: '<div id="player-info-layer-1" class="hbox" style="pointer-events:none">\
        <div class="avatar-wrapper"><img class="avatar"/></div>\
        <div style="flex:1;margin-left:10px"><p id="p1"></p><p id="p2"></p><p id="p3"></p><p id="p4"></p><p id="p5"></p></div>\
        </div>\
        <div id="player-info-layer-2" style="margin-top:-128px;opacity:0">\
        <div id="privateMessageArea"></div>\
        <div class="hbox" style="margin-top:5px"><span style="margin-right:5px;white-space:nowrap">PM:</span><input id="privateChatInput" style="flex:1" disabled="true"></div>\
        </div>\
        <div class="check-game" id="check-game-' + user.name + '"></div>'
    }).dialog({
      autoOpen: false,
      width: 'auto',
      resizable: false,
      position: {at:'left+'+mouseX+' top+'+mouseY},
      close: function(e){
        if (element.find("#privateMessageArea").html() == "") element.dialog('destroy').remove()
      },
      buttons: [
        {text: "", class: "fa fa-graduation-cap font-fa buttons-for-host connected-button-left", title: i18next.t("board.give_host"), click: function(){_giveHostButtonClick(user)}, disabled: user == me},
        {text: "", class: "fa fa-user-plus font-fa buttons-for-host connected-button-right", title: i18next.t("board.give_subhost"), click: function(){_giveSubhostButtonClick(user)}, disabled: user == me},
        {text: "", class: "fa fa-ban font-fa connected-button-left", title: i18next.t("player_info.ignore"), click: function(){_playerIgnoreClick(user)}, disabled: user == me},
        {text: "", class: "fa fa-comment font-fa connected-button-right connected-button-left", title: 'PM', click: function(){_playerPMClick(this)}, disabled: user == me},
        {text: "", class: "fa fa-info-circle font-fa connected-button-right", title: i18next.t("player_info.detail"), click: function(){_playerDetailClick(user)}},
        {text: i18next.t("player_info.challenge"), click: function(){_playerChallengeClick(user); $(this).dialog('close')}, disabled: user == me}
      ]
    })
    element.siblings('.ui-dialog-buttonpane').find('button').click(function(){sp.buttonClick("NORMAL")})
    element.siblings('.ui-dialog-titlebar').find('.ui-dialog-titlebar-close').click(function(){sp.buttonClick("CANCEL")})
    if (!board.isHost()) element.siblings('.ui-dialog-buttonpane').find('.buttons-for-host').css('display', 'none')
    if (user.isGuest) element.find("#privateChatInput").prop('disabled', true)
    element.find("#privateChatInput").blur()
    element.find("#privateChatInput").on('keypress', function(e){
      if (e.keyCode == 13){
        if ($(this).val().length > 0) {
          if (board.isPlaying()){
            showAlertDialog("pm_while_playing")
          } else {
            client.privateChat(user.name, $(this).val())
            let area = element.find("#privateMessageArea")
            $('<span></span>',{}).css('color', '#33f').text($(this).val()).appendTo(area)
            area.append('<br>')
            area.animate({scrollTop: area[0].scrollHeight}, 'fast')
          }
          $(this).val('')
        }
      }
    })
  }
  if (doOpen) {
    element.dialog('open')
    if (!user.isGuest) apiClient.getPlayerDetail(user)
    if (user.waitingChallengeableTournament()) apiClient.checkTournamentOpponent(user.waitingTournamentId, user.name)
    if (getPremium() >= 1) apiClient.getEvaluation(user.name)
  }
  element.find("img.avatar").attr("src", user.avatarURL())
  element.find("p#p1").html(user.country.flagImgTag27() + ' ' + user.country.toString())
  element.find("p#p2").html('R: ' + user.rate + ' (' + makeRankFromRating(user.rate) + ') ' + user.mobileIconTag() + '<img class="icon-evaluation" src="img/icon_like.png"><span class="get-evaluation" id="get-evaluation-' + user.name + '">?</span>')
  return element
}

function _playerChallengeClick(user){
  if (user == me) return
  if (board.isPlayer()) {
	  writeUserMessage(i18next.t("msg.still_in_game"), 1, "#008800")
  } else if (_challengeUser) {
	  writeUserMessage(i18next.t("msg.challenge_only_one"), 1, "#008800")
  } else if (user.listAsWaiter()) {
    if (user.waitingTournamentId && !user.waitingChallengeableTournament()) {
  	  writeUserMessage(EJ("You are not registered to this tournament.", "この大会には参加していません。"), 1, "#ff0000")
    } else if (user.waitingTournamentId && !tournaments[user.waitingTournamentId].withinPeriod()) {
  	  writeUserMessage(EJ("It is outside the tournament period right now.", "現在、大会開催期間外です。"), 1, "#ff0000")
    } else if (user.rate >= RANK_THRESHOLDS[2] && me.provisional && user.waitingGameName.match(/^r_/)) {
  	  writeUserMessage(i18next.t("msg.no_challenge_6dan"), 1, "#008800")
    } else if (_checkGuestGamesExpired()) {
    } else if (user.waitingGameName.match(/_automatch\-/)) {
		  client.seek(user)
    } else if (user.waitingGameName.match(/^vazoo2/)) {
  	  writeUserMessage(EJ("Dobutsu-shogi is not supported yet.", "HTML版はどうぶつしょうぎ未対応です。"), 1, "#ff0000")
    } else if (me.isGuest && user.waitingGameName.match(/^r_/)) {
			writeUserMessage(i18next.t("msg.no_guest_rating"), 1, "#ff0000")
	  } else {
		  _challengeUser = user
		  client.challenge(_challengeUser)
		  writeUserMessage(EJ("Challenging " + _challengeUser.name + "..... ", _challengeUser.name + "さんに挑戦中..... "), 1, "#008800", true, false)
      $('#challengeCanceler').remove()
      $('#lobbyMessageArea').append('<a id="challengeCanceler" href="#" onclick="_cancelChallenge($(this))">[' + i18next.t("cancel") + ']</a><br>')
      if (getPremium() == 1) setGeneralTimeout("SHOW_CHALLENGE_CANCELER", 10000, true)
      else if (getPremium() == 2) setGeneralTimeout("SHOW_CHALLENGE_CANCELER", 5000, true)
      else if (getPremium() >= 3) $('#challengeCanceler').show()
      setGeneralTimeout("CHALLENGE", 28000)
	  }
  // Opponent is not waiting -> Send invitation if possible
  } else if (me.isGuest || user.isMobile) {
		writeUserMessage(EJ("The opponent is not waiting with own game rule.", "相手は対局待をしていません。"), 1, "#008800")
  } else if (!me.listAsWaiter()) {
		writeUserMessage(EJ("The opponent is not waiting with own game rule. You can invite him if you wait with your own game rule.", "相手は対局待をしていません。自分が対局待にすることで招待メッセージを送ることが可能です。"), 1, "#008800")
	} else if (user.idle) {
		writeUserMessage(user.name + i18next.t("code.C010"), 1, "#008800", true)
	} else if (user.inGameRoom()) {
		writeUserMessage(user.name + EJ(" is in another game right now.", "さんは対局中です。"), 1, "#008800", true)
	} else {
		me.waitingGameName.match(/^([0-9a-z]+?)_(.*)-([0-9]*)-([0-9]*)/)
		client.privateChat(user.name, "[##INVITE]" + RegExp.$3 + "," + RegExp.$4 + "," + RegExp.$1)
		writeUserMessage(EJ("The opponent is not waiting with own game rule. Instead, an invitation to your game has been sent to him.", "相手は対局待をしていません。代わりに自分の対局への招待メッセージを" + user.name + "さんに送信しました。(拒否された場合は連続送信しないで下さい)"), 1, "#008800")
	}
}

function _cancelChallenge(canceler){
  clearGeneralTimeout("CHALLENGE")
  canceler.after('<span class="canceled">' + i18next.t("lobby.canceled") + '</span>')
  canceler.remove()
	if (_challengeUser) {
		_challengeUser = null
		client.decline("C031")
	}
}

function _playerIgnoreClick(user){
  showAlertDialog("confirm_block", function(){
    if (_ignoreList.indexOf(user.name) < 0) {
      _ignoreList.push(user.name)
      _declinedList[user.name] = true
      writeUserMessage(i18next.t("msg.add_block"), currentLayer == 2 ? 2 : 1, "#FF0000")
    }
  }, true)
}

function _playerDetailClick(user){
  if (user.isGuest) return
  window.open("http://system.81dojo.com/" + EJ('en', 'ja') + "/players/show/" + user.name)
}

function _playerPMClick(e, forcePM = false){
  if (forcePM || $(e).find("div#player-info-layer-1").css('opacity') == 1) {
    $(e).find("div#player-info-layer-1").css('opacity', 0)
    $(e).find("div#player-info-layer-2").css('opacity', 1)
    if (!me.isGuest) $(e).find("#privateChatInput").prop('disabled', false).focus()
  } else {
    $(e).find("div#player-info-layer-1").css('opacity', 1)
    $(e).find("div#player-info-layer-2").css('opacity', 0)
    $(e).find("#privateChatInput").prop('disabled', true)
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
  snowfall.stop()
  sp.stopOpening()
  _setLoginAlert("login.successfull")
  if ($('input[name=loginType]:checked').val() == 0 && $('#loginSave').prop('checked')) {
    localStorage.login = $('#usernameInput').val()
    localStorage.dat = caesar(caesar($('#hiddenPass').val(), 3), 81)
    localStorage.save = $('#loginSave').prop('checked')
    localStorage.server = client.serverName
  }
  $('div#layerLoginContents').animate({opacity: 0}, testMode ? 0 : 1000, function(){
    _switchLayer(1)
    _refreshLobby(true)
    $('div#layerLoginContents').css('opacity', 1)
    if (testMode) _testFunction(2)
  })
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
  _enforcePremium()
  _ignoreList = []
  if (_loginHistory.indexOf(client.username) >= 0) _loginHistory.splice(_loginHistory.indexOf(client.username), 1)
  _loginHistory.push(client.username)
  localStorage.dat2 = caesar(caesar(_loginHistory.join(","), 3), 81)
  apiClient.getOptions()
  apiClient.getTournaments()
  apiClient.getTitles()
  _updateLobbyHeader()
  _writeWelcomeMessage()
  _hourMileCount = 0
  setGeneralTimeout("HOUR_MILE", 3600000)
  _refreshWorldClocks()
  $('#classSurveyButton').css('display', i18next.language == "ja" ? 'block' : 'none')
  $('#lobbyChatInput, #boardChatInput').prop('disabled', me.isGuest)
}

function _writeWelcomeMessage(){
  writeUserMessage(EJ(infoFetcher.initialMessageEn.join("\n"), infoFetcher.initialMessageJa.join("\n")), 1, "#000000")
  if (me.isGuest) writeUserMessage(i18next.t("msg.guestlogin"), 1, "#000000")
  if (me.provisional) writeUserMessage(i18next.t("msg.newlogin"), 1, "#000000")
  if (me.rate >= 2250 && i18next.language == "ja") writeUserMessage("[レーティング2250点以上の方へ]\n- 「棋力証明制度」をご案内中です(https://system.81dojo.com/declaration)", 1, "#000000")
  if (getPremium()) writeUserMessage(EJ("You have " + makePremiumName(getPremium()) + " status. Thank you for choosing 81Dojo.", makePremiumName(getPremium()) + "クラス" + me.name + "様、いつもご利用有難うございます。＜(_ _)＞"), 1, "#FFBB00", true)
}

function _updateLobbyHeader(){
  $('#header-playerName').text(me.name + " : ")
  $('#header-rate').text("R" + me.rate + " : ")
  $('#header-mile').text(mileage + EJ(" D-Miles : ", " Dマイル : "))
  $('#header-premium').text(makePremiumName(premium) + EJ(" class", " クラス"))
}

function _handleLoginFailed(code){
  _setLoginAlert("code." + code)
  $('#reloginButton').css('display', 'initial')
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
    playerGrid.row.add(users[key])
    if (users[key].listAsWaiter()) waiterGrid.row.add(users[key])
  })
  playerGrid.draw()
  playerGrid.row('#' + me.name).select()
  scrollGridToSelected(playerGrid)
  drawGridMaintainScroll(waiterGrid)
  _playerSelected(playerGrid, playerGrid.row({selected: true}).index())
  $('#findUser').autocomplete('option', 'source', Object.keys(users))
}

function _handleList(str){
  let n = 0
  let lines = str.trim().split("\n")
  gameGrid.clear()
  let games = []
  let autoReconnectedGame = null
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
    if (game.isMyDisconnectedGame()) autoReconnectedGame = game
    games.push(game)
  })
  gameGrid.rows.add(games)
  gameGrid.draw()
  if (autoReconnectedGame) _enterGame(autoReconnectedGame)
}

function _handleWatchers(str){
  let lines = str.trim().split("\n")
  watcherGrid.clear()
  lines.forEach(function(line){
    if (users[line]) watcherGrid.row.add(users[line])
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
	if (name == me.name) return;
	if (!users[name]) {
		users[name] = new User(name);
    $('#findUser').autocomplete('option', 'source', Object.keys(users))
	} else {
		// TODO users[name].initialize();
	}
	users[name].setFromLobbyIn(parseInt(tokens[1]), tokens[2], parseInt(tokens[3]), tokens[12])
  playerGrid.row.add(users[name])
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
    waiterGrid.row.add(users[name])
    drawGridMaintainScroll(waiterGrid)
	}
  playerGrid.row('#' + name).invalidate()
}

function _handleChallenger(name){
  if (_declinedList[name] == true) {
  	client.decline("C000")
    return
  }
  sp.play("CHALLENGER")
  $('#modalChallenger').dialog('open')
  _initModalChallenger(users[name])
  if (me.waitingTournamentId) apiClient.checkTournamentOpponent(me.waitingTournamentId, name)
}

function _handleAccept(str){
  $('#challengeCanceler').remove()
  clearGeneralTimeout("CHALLENGE")
	_gameAccepted = true
	//_acceptedCancelTimer.reset();
	//_acceptedCancelTimer.start();
	_interpretCommunicationCode("", "C005", 1, true, false)
	if (_challengeUser) client.seek(_challengeUser)
}

function _handleDecline(str){
//	_acceptedCancelTimer.stop();
  $('#challengeCanceler').remove()
  clearGeneralTimeout("CHALLENGE")
	if (str.match(/^([A-Z]\d{3})/)) {
		_interpretCommunicationCode("", RegExp.$1, 1, true, false)
	} else {
		writeUserMessage(str, 1, "#008800", true)
	}
	_challengeUser = null
	_gameAccepted = false
  $('#modalChallenger').dialog('close')
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
  if (board.game) _closeBoard(true)
  let game = new Game(0, gameId, black, white)
  _prepareCorrectBoard(game.gameType)
  board.setGame(game)
  board.startGame(initialPosition, myTurn ? 0 : 1)
  board.setKifuId(kid)
  _dialogOnBoardClose = false
  $("#kifuGridWrapper").find(".dataTables_scrollBody").removeClass("local-kifu")
  setBoardConditions()
  _switchLayer(2)
  sp.gameStart()
  _greetState = 1
  _writeGameStartMessage()
  //_nOpponentDisconnect = 0;
  //_study_notified = false;
  _resetDeclinedList()
}

function _writeGameStartMessage(){
  writeUserMessage(i18next.t("msg.game_start") + "\n", 2, "#444444")
  if (board.myRoleType == 0) writeUserMessage(EJ("You are Black " + (board.game.isHandicap() ? "(Handicap taker)." : "(Sente)."), "あなた" + (board.game.isHandicap() ? "は下手(したて)" : "が先手") + "です。"), 2, "#008800", true)
  else writeUserMessage(EJ("You are White " + (board.game.isHandicap() ? "(Handicap giver)." : "(Gote).\n"), "あなた" + (board.game.isHandicap() ? "が上手(うわて)" : "は後手") + "です。"), 2, "#008800", true)
  if (board.game.gameType != "r") writeUserMessage(i18next.t("msg.mute_chat"), 2, "#008800")
  let opponent = board.getOpponent()
  if (board.game.gameType == "r" && !me.provisional) {
	  if (isBeforeUpgrade(me.rate) && !opponent.provisional && opponent.rate > me.rate - 200) _sendAutoChat("#G020")
	  else if (isBeforeDowngrade(me.rate) & !opponent.provisional && opponent.rate < me.rate + 200) _sendAutoChat("#G021")
  }
  client.privateChat(board.getOpponent().name, "[##FITNESS]" + options.postgame_study_level + "," + options.english_level)
}

function _handleMove(csa, time){
  //string, integer
  board.clearArrows(true)
  if (board.isPlaying()){
    let owner = csa.substr(0, 1) == "+"
    board.getPlayersTimer(owner).useTime(time)
    if (owner && board.myRoleType == 0 || !owner && board.myRoleType == 1) {
      board.moves[board.moves.length - 1].setTime(time, board)
      board.addMoveToKifuGrid(board.moves[board.moves.length - 1])
    } else {
      let move = board.getFinalMove().constructNextMove()
      move.setFromCSA(csa)
      move.setTime(time, board)
      board.handleReceivedMove(move)
      board.updateTurnHighlight()
    }
    board.runningTimer.run()
  }
}

function _handleGameEnd(lines, atReconnection = false){
  board.pauseAllTimers()
  _checkLobbyButtonClick(true) //Cancel see lobby button if activated
  let gameEndType = lines.split("\n")[0]
  board.game.gameEndType = gameEndType
  let result = lines.split("\n")[1]
  clearInterval(_disconnectTimer)
  $("p#disconnectTimer").remove()
  board.isPostGame = true
  let move = board.getFinalMove().constructNextMove()
  move.setGameEnd(gameEndType) //turn too?
  if (move.endTypeKey == 'RESIGN' && client && client.resignTime) {
    move.setTime(client.resignTime, board)
    client.resignTime = null
  }
  board.endTime = moment()
  if (gameEndType != "SUSPEND") {
    board.moves.push(move) //refresh list too
    if (!kifuGrid.row(':last').data().branch) board.addMoveToKifuGrid(move)
  }
  if (gameEndType == "TIME_UP" && board.isPlayer() && !atReconnection) sp.sayTimeUp()
  let illegal = gameEndType == "ILLEGAL_MOVE"
  writeUserMessage(move.toGameEndMessage(), 2, "#DD0088")
	//if (GameTimer.soundType >= 2) Byoyomi.sayTimeUp();
  switch (result) {
    case "LOSE":
      board.setResult(1 - board.myRoleType)
    	board.studyHostType = 2
      writeUserMessage(EJ("### You Lose ###", "### あなたの負けです ###"), 2, "#DD0088", true)
      sp.gameEnd(false)
    	openResult(-1)
      _loserLeaveDisabled = true
      setGeneralTimeout("LOSER_LEAVE", 4500)
      if (illegal) writeUserMessage(i18next.t("msg.illegal"), 2, "#FF0000")
      /*
    	if (board.gameType == "r") _losses_session += 1;
    	var history = "  ●";
      */
      break
    case "WIN":
    	board.setResult(board.myRoleType)
      board.studyHostType = 1
      writeUserMessage(EJ("### You Win ###\n", "### あなたの勝ちです ###\n"), 2, "#DD0088", true)
      sp.gameEnd(true)
    	openResult(1)
      /*
    	if (board.gameType == "r") _wins_session += 1;
    	history = "  ◯";
      */
      break
    case "DRAW":
    	board.setResult(-1)
    	if (board.myRoleType == 1) board.studyHostType = 1
    	else if (board.myRoleType == 0) board.studyHostType = 2
      writeUserMessage(EJ("### Draw ###\n", "### 引き分け ###\n"), 2, "#DD0088", true)
      sp.gameEnd(true)
    	if (board.isPlayer() && !atReconnection) openResult(0)
    	//history = "  引";
      break
    case "SENTE_WIN":
    	board.setResult(0)
      writeUserMessage(EJ("### Sente (or Shitate) Wins ###\n", "### 先手(または下手)の勝ち ###\n"), 2, "#DD0088", true)
      sp.gameEnd(true)
      break
    case "GOTE_WIN":
    	board.setResult(1)
      writeUserMessage(EJ("### Gote (or Uwate) Wins ###\n", "### 後手(または上手)の勝ち ###\n"), 2, "#DD0088", true)
      sp.gameEnd(true)
      break
  }
  // Set host status
  if (board.isPlayer() && board.game.gameType.match(/^hc/)) {
	  if (board.myRoleType == 0) board.studyHostType = 1
    else board.studyHostType = 2
  }
  if (atReconnection) board.studyHostType = 1
  else {
    if (board.isHost()) {
      writeUserMessage(i18next.t("msg.host"), 2, "#008800", true)
      sendStudy()
    } else if (board.isSubHost()) writeUserMessage(i18next.t("msg.subhost"), 2, "#008800", true)
  }
  /*
  if (opponent_disconnected && board.isSubHost) {
	  board.isStudyHost = true;
	  board.isSubHost = false;
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
  */
  if (board.isPlayer()) {
    if (!atReconnection) {
      _dialogOnBoardClose = true
      if (board.game.gameType == "r") client.mileage(10, config.mileagePass)
      else client.mileage(5, config.mileagePass)
      let tournament = board.game.getTournament()
      if (tournament) {
        writeUserMessage(EJ('Tournament status: ', 'イベント対局結果の確認: ') + tournament.url(), 2, "#FF3388")
      }
      if (me.isGuest) _countGuestGame()
    }
  }
  board.playerNameClassChange(0, 'name-mouse-out', false)
  board.playerNameClassChange(1, 'name-mouse-out', false)
  setBoardConditions()
  board.updateTurnHighlight()
  if (_greetState <= 2) _greetState = atReconnection ? 4 : 3
}

function _handleResult(str){
  let tokens = str.split(",")
  loadResult(tokens[0], tokens[1], tokens[2], tokens[3])
  me.rate = parseInt(tokens[1])
  users[board.getOpponent().name].rate = parseInt(tokens[3])
}

function _handleMonitor(str){
  let kifu_id = null
  let lines = str.split("\n")
  let move_strings = []
  let since_last_move = 0
  let positionStr = ""
  let gameEndStr = ""
  let studyReset = false
  board.clearArrows(true)
  lines.forEach(function(line){
    if(line.match(/^([-+][0-9]{4}[A-Z]{2}|%TORYO)$/)) {
      move_strings.push(RegExp.$1)
    } else if (line.match(/^T(\d+)$/)){
      move_strings[move_strings.length - 1] += "," + RegExp.$1
    } else if (line == "MONITOR_RESET") {
      studyReset = true
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
    } else if (line.match(/^NOT_FOUND$/)) {
      board.close()
      if (currentLayer == 2) _closeBoard()
      writeUserMessage(EJ('The specified room does not exist anymore.', 'その対局室は既にありません。リストを更新して下さい。'), 1, "#FF0000")
      return
    }
  })
  if (kifu_id) { // Start of watching game
    if (studyReset) forceKifuMode(1)
    board.startGame(positionStr, 2, move_strings, since_last_move)
    board.setKifuId(kifu_id)
    setBoardConditions()
    _switchLayer(2)
    if (!board.game.isStudy()) {
  		writeUserMessage(board.game.gameType == "r" ? i18next.t("msg.rated") : i18next.t("msg.nonrated"), 2, "#008800")
    }
    let tournament = board.game.getTournament()
    if (tournament) {
      writeUserMessage(EJ('This game belongs to: "', 'イベント対局: 「') + tournament.name() + EJ('" ', '」 ') + tournament.url(), 2, "#FF3388", true)
    }
  } else {
    move_strings.forEach(function(move_str){
      if (move_str.match(/^%TORYO/)) {
        client.resignTime = parseInt(move_str.split(",")[1])
        return
      }
      let move = board.getFinalMove().constructNextMove()
      move.setFromCSA(move_str.split(",")[0])
      move.setTime(parseInt(move_str.split(",")[1]), board)
      board.handleMonitorMove(move)
    })
  }
  if (gameEndStr != "") {
    _handleGameEnd(gameEndStr)
    if (since_last_move > 0) board.endTime.add((-1)*since_last_move, 'seconds')
  }
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
  if (kifu_id) board.setKifuId(kifu_id)
  setBoardConditions()
  _switchLayer(2)
  _greetState = 2
  if (gameEndStr != "") {
    client.status = 0
    _handleGameEnd(gameEndStr, true)
    if (since_last_move > 0) board.endTime.add((-1)*since_last_move, 'seconds')
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
      watcherGrid.row.add(users[name])
      drawGridMaintainScroll(watcherGrid)
  		//_watcherTitle = LanguageSelector.lan.watchers + " (" + _watcher_list.length +")";
    }
  }
  if (board.isHost()) client.privateChat(name, "[##STUDY]" + _generateStudyText(kifuGrid.row({selected: true}).data().num))
	if (board.isPlaying()) {
    /*
		if (_notify_blind) {
			if (board.piece_type == 100) _client.privateChat(e.message, "[auto-PM] #G014");
			else if (board.piece_type == 101) _client.privateChat(e.message, "[auto-PM] #G015");
			else if (board.piece_type == 102) _client.privateChat(e.message, "[auto-PM] #G016");
		}
    */
		if (board.game.gameType != "r" && !_allowWatcherChat) client.privateChat(name, "[auto-PM] #G102")
	}
	//if (_users[e.message]) _users[e.message].clearTags();
	//_updateStatusMarks(e.message);
}

function _handleLeave(name) {
  if (!board.game) return
  if (board.getPlayerRoleFromName(name) != null) {
		writeUserMessage(name + i18next.t("code.G031"), 2, board.getPlayerRoleFromName(name) == 0 ? "#000000" : "#666666", true)
    board.playerNameClassChange(board.getPlayerRoleFromName(name), "name-left", true)
    sp.door(false)
    _allowLoserLeave()
    board.clearRematch()
    if (board.isPlayer() && board.isPostGame) $('#rematchButton').removeClass('button-disabled')
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
		writeUserMessage(name + i18next.t("code.G032"), 2, board.getPlayerRoleFromName(name) == 0 ? "#000000" : "#666666", true)
    board.playerNameClassChange(board.getPlayerRoleFromName(name), "name-left", true)
    sp.door(false)
    _allowLoserLeave()
    board.clearRematch()
    if (board.isPlayer() && board.isPostGame) $('#rematchButton').removeClass('button-disabled')
  	if (board.isPlaying() && name != me.name) {
      board.disconnectTimer(board.getPlayerRoleFromName(name))
      writeUserMessage(i18next.t("msg.opponent_disconnect"), 2, "#ff0000")
      _startDisconnectTimer()
  	}
	}
}

function _startDisconnectTimer(){
  _opponentDisconnectCount += 1
  $("p#disconnectTimer").remove()
  let p = $('<p></p>', {id: 'disconnectTimer'})
  $("#boardMessageArea").append(p)
  p.html(i18next.t("since_disconnect") + '<span id="disconnectCount">0</span>&nbsp' + i18next.t("sec"))
  let count = 0
  let minimumWaitSeconds = _opponentDisconnectCount > 1 ? 1 : 60
  _disconnectTimer = setInterval(function(){
    count++
    $("span#disconnectCount").text(count)
    if (count == minimumWaitSeconds) { //TODO count has to be 1 if disconnected twice
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
  let str
	if (tokens[0] == "STUDY") {
		let str = game_info[2].split(".")[0] + EJ(" CREATED [", "さんが[")
    str += _game2link(EJ("STUDY ROOM", "検討室"), game_id)
		str += EJ("].", "]を作成しました。")
		writeUserMessage(str, 1, "#008800")
    sp.chatLobby()
		let black = new User(tokens[2])
		black.setFromStudy(true)
		var white = new User(tokens[3])
		white.setFromStudy(false)
		game = new Game(0, game_id, black, white);
    if (game.isMyRoom()) {
      board.studyHostType = 2
      _enterGame(game)
    }
	} else {
		str = "[" + _game2link(EJ("GAME STARTED", "新規対局"), game_id) + "] "
    str += "☗" + tokens[2] + EJ(" vs ", " 対 ") + "☖" + tokens[3] + " / " + EJ(HANDICAPS_EN[game_info[1]], HANDICAPS_JA[game_info[1]])
		writeUserMessage(str, 1, "#008800")
		if (users[tokens[2]]) {
      users[tokens[2]].setFromStart(tokens[1], "+")
      playerGrid.row("#" + tokens[2]).invalidate()
      waiterGrid.row("#" + tokens[2]).remove()
    }
		if (users[tokens[3]]) {
      users[tokens[3]].setFromStart(tokens[1], "-")
      playerGrid.row("#" + tokens[3]).invalidate()
      waiterGrid.row("#" + tokens[3]).remove()
    }
    drawGridMaintainScroll(waiterGrid)
		game = new Game(0, game_id, users[tokens[2]], users[tokens[3]])
	}
  gameGrid.row.add(game)
  drawGridMaintainScroll(gameGrid)
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
    let expModeName = RegExp.$1 == "nr" ? EJ("10-sec Shogi", "10秒将棋") : getHandicapShort(RegExp.$1)
    writeUserMessage(_name2link(sender) + EJ(" is promoted to " + makeRank34FromExp(parseInt(RegExp.$2)) + " class in " + expModeName + "!", "さん、" + expModeName + "で " + makeRank34FromExp(parseInt(RegExp.$2)) + " に昇格!!"), 1, "#008800", true)
	} else if (message.match(/^\[##.+\]/)) {
    return
	} else if (_ignoreList.indexOf(sender) >= 0) {
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
	} else if (message.match(/\[##TYPE\]$/)) {
		if (sender != me.name) {
      _runTypingIndicator(sender)
		}
	} else if (message.match(/\[\#\#STUDY\](\d+)\/(.+)$/)) {
    let branchDelta = _updateStudyState(sender, parseInt(RegExp.$1), RegExp.$2)
    if (hostPlayerName == null) _updateHostPlayer(sender)
  	board.clearArrows(true)
  	if (board.isHost() && sender == me.name) return
		if (!(board.isPostGame && board.onListen)) return
    if (sender != me.name || (branchDelta < 0 && !board.isHost())) _handleStudy(branchDelta == 1)
	} else if (message.match(/^\[##ARROW\]CLEAR$/)) {
		if (sender != me.name) board.clearArrows(true, sender)
	} else if (message.match(/^\[##ARROW\](.+),(.+),(.+),(.+),(.+),(.+)$/)) {
		if (_ignoreList.indexOf(sender) >= 0) return
		if (!options.accept_arrow == 1 || sender == me.name) return
		if (board.isPlaying()) return
		if (sender == me.name) sender = ""
		board.addArrow(parseInt(RegExp.$1), Number(RegExp.$2), Number(RegExp.$3), Number(RegExp.$4), Number(RegExp.$5), parseInt(RegExp.$6, 16), true, sender)
	} else if (message.match(/^\[##M_(IN|OUT)\](\d+),(\d+)$/)) {
    let isOut = RegExp.$1 == "OUT"
    let turn = board.getPlayerRoleFromName(sender)
    if (turn != null) board.playerNameClassChange(turn, 'name-mouse-out', isOut)
	} else if (message.match(/^\[##GIVEHOST\](.+)$/)) {
    if (!board.isPostGame) return
    let newHost = RegExp.$1
		if (newHost == me.name) {
      sendStudy()
      board.studyHostType = 2
      $("input[name=kifuModeRadio]:eq(1)").prop("checked", true)
      _kifuModeRadioChange()
      setBoardConditions()
			writeUserMessage(i18next.t("msg.host"), 2, "#008800", true)
    } else {
      writeUserMessage(EJ("Study Host status given to " + newHost, "感想戦ホストは、" + newHost + "さんに引き継がれました。"), 2, "#008800")
    }
    _updateHostPlayer(newHost)
	} else if (message.match(/^\[##SUBHOST_ON\](.+)$/)) {
		if (RegExp.$1 == me.name) {
			writeUserMessage(i18next.t("msg.subhost"), 2, "#008800", true)
			board.studyHostType = 1
      setBoardConditions()
		} else {
			writeUserMessage(EJ("Study Sub-host status given to " + _name2link(RegExp.$1), _name2link(RegExp.$1) + "さんに、感想戦サブ・ホスト権限が付与されました。"), 2, "#008800")
		}
	} else if (message.match(/^\[##TEMPLATE\]([A-Z]\d{3})/)) {
		_handleGameChat(sender, EJ("<Template> ", "<定型> ") + i18next.t("code." + RegExp.$1))
	} else if (message.match(/^\[##REMATCH\]$/)) {
    board.rematch(board.getPlayerRoleFromName(sender))
    _interpretCommunicationCode(sender, "G050", 2, true, true)
    if (board.rematchAgreed()) {
			writeUserMessage(i18next.t("msg.rematch_agreed"), 2, "#008800", true)
			if (board.isPlayer()) {
        client.closeGame()
        //TODO Have to give host to one of the watchers
				client.rematch(board.game, board.myRoleType)
			} else {
        $("#rematchButton").removeClass("button-disabled")
  			writeUserMessage(i18next.t("msg.rematch_follow"), 2, "#008800")
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
		if (_ignoreList.indexOf(sender) >= 0) return
		if (sender == board.game.black.name) {
      _stopTypingIndicator(0)
			writeUserMessage("[" + _name2link(sender) + "] " + message, 2, "#000000")
      if (_loserLeaveDisabled && sender != me.name) _allowLoserLeave()
		} else if (sender == board.game.white.name) {
      _stopTypingIndicator(1)
			writeUserMessage("[" + _name2link(sender) + "] " + message, 2, "#666666")
      if (_loserLeaveDisabled && sender != me.name) _allowLoserLeave()
		} else if (sender == me.name) {
			writeUserMessage("[" + _name2link(sender) + "] " + message, 2, "#0033DD")
		} else if (board.isPlaying() && !_allowWatcherChat) {
      return
      /*
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
    _updateStudyState(sender, parseInt(RegExp.$1), RegExp.$2)
		if (!(board.isPostGame && board.onListen)) return
    if (sender != me.name) _handleStudy()
    _updateHostPlayer(sender)
    // TODO If the user has been forced to become Host after entering room, he should be demoted to subHost as soon as receiving this private message
		return
	} else if (message.match(/^\[\#\#FITNESS\](\d),(\d)$/)) {
		let str = EJ("Opponent's ", "対局相手の") + i18next.t("option.study_level") + ": " + _fitnessLevelText(RegExp.$1)
		if (!board.game.black.isFromJapan() || !board.game.white.isFromJapan()) str += " / " + i18next.t("option.english_level") + ": " + _fitnessLevelText(RegExp.$2)
		writeUserMessage(str, 2, "#0000AA")
		return
	} else if (message.match(/^\[\#\#INVITE\](\d+),(\d+),(.+)$/)) {
		_handleInvitation(sender)
		return
	} else if (message.match(/^\[\#\#REJECT\]/)) {
		if (message.match(/^\[\#\#REJECT\]([A-Z]\d{3})/)) _interpretCommunicationCode(sender, RegExp.$1, 1, true, false)
		else writeUserMessage(sender + EJ(" did not accept your invitation.", "さんに招待メッセージが送信出来ませんでした。"), 1, "#008800", true)
		return
	} else if (message.match(/^\[auto\-PM\]/)) {
		if (message.match(/^\[auto\-PM\]\s#([A-Z]\d{3})/)) _interpretCommunicationCode(sender, RegExp.$1, 2, false, true)
		return
	}
	if (_ignoreList.indexOf(sender) >= 0) return
  if (me.isGuest) return
  let playerWindow = $("div#player-info-window-" + sender)
  if (!playerWindow[0] && users[sender]) playerWindow = _openPlayerInfo(users[sender], options.pm_auto_open)
  else if (options.pm_auto_open) playerWindow.dialog('open')
  let area = playerWindow.find("#privateMessageArea")
  $('<span></span>',{}).css('color', '#f35').text(message).appendTo(area)
  area.append('<br>')
  area.animate({scrollTop: area[0].scrollHeight}, 'fast')
  _playerPMClick(playerWindow, true)
  if (!playerWindow.dialog('isOpen') && !board.isPlaying()) {
		writeUserMessage("PM: [" + _name2link(sender) + "] " + message.replace(/^\[\#\#URGENT\]/, ""), 1, "#FF0000")
		if (currentLayer == 2) writeUserMessage("PM: [" + _name2link(sender) + "] " + message.replace(/^\[\#\#URGENT\]/, ""), 2, "#FF0000")
	}
  if (!board.isPlaying()) sp.chatPrivate()
}

function _handleInvitation(name){
  if (options.reject_invitation == 1) { client.privateChat(name, "[##REJECT]C010"); return; }
  let inviter = users[name]
  if (!inviter) { client.privateChat(name, "[##REJECT]"); return; }
  if (board.isPlayer()) { client.privateChat(name, "[##REJECT]C011"); return; }
  if ($('#modalInvitation').dialog('isOpen') || _challengeUser) { client.privateChat(name, "[##REJECT]C012"); return; }

  if (inviter.listAsWaiter()) {
    sp.play("INVITATION")
    $('#modalInvitation').dialog('open')
    _initModalInvitation(inviter)
  }
  //TODO if (me.waitingTournamentId) apiClient.checkTournamentOpponent(me.waitingTournamentId, name)
}

function _handleMile(result) {
  if (me.isGuest) return
  result = parseInt(result)
  if (result == -1) return
  let diff = result - mileage
	if (diff > 0) writeUserMessage(EJ("You've earned " + diff + " D-Mile" + (diff == 1 ? "!" : "s!"), diff + " Dマイル獲得しました!"), 1, "#FF3388")
	else if (diff < 0) writeUserMessage(EJ("You've used " + (- diff) + " D-Mile" + (diff == -1 ? "" : "s"), (- diff) + " Dマイルを消費しました。(通算マイル・期間マイルは減少しません)"), 1, "#FF3388")
  mileage = result
  _updateLobbyHeader()
}

function _handleWins(wins) {
	if (parseInt(wins) % 100 == 0) client.chat("[##WINS]" + wins)
}

function _handleExp(str) {
  let diff = parseInt(str.split(",")[0])
  let result = parseInt(str.split(",")[1])
	let rank = makeRank34FromExp(result)
	if (rank != makeRank34FromExp(result - diff)) {
		client.chat("[##EXP]" + board.game.gameType + "," + result)
		writeUserMessage(EJ("You're promoted to a new rank!!", "クラス昇格!!"), 2, "#DD0088", true)
	}
	writeUserMessage(EJ("You've gained " + diff + " EXP!! (Total: " + result + " EXP) You're in \"" + rank + "\" level.", diff + "EXPを獲得!! (トータル " + result + "EXP) 現在「" + rank + "」レベルです"), 2, "#DD0088")
}

function _handleClosed(){
  _stopAllTimeouts()
  _setLoginAlert("code.L005")
  if (currentLayer == 0) $('input#reloginButton').css('display', 'initial')
  else showAlertDialog("disconnect", _backToEntrance)
}

function _backToEntrance(){
  $('input[name=loginType], input#usernameInput, input#passwordInput, input#loginSave, input#loginButton').prop('disabled', true)
  $('input#reloginButton').css('display', 'initial')
  _switchLayer(0)
  _clearAllParams()
}

function _clearAllParams(){
  users = new Object()
  tournaments = new Object()
  playerGrid.clear().draw()
  waiterGrid.clear().draw()
  gameGrid.clear().draw()
  board.close()
  _checkLobbyButtonClick(true) //Cancel see lobby button if activated
  $('#lobbyMessageArea').empty()
  _loadDefaultOptions()
  _declinedList = new Object()
}

/* ====================================
    Post-game communication
===================================== */

function _updateStudyState(sender, base, branch = "*"){
  // integer, string
  let branchDelta = null
  _studyBase = base
  _studySender = sender
  if (branch == "*") {
    if (_studyBranchMoves) {
      branchDelta = - _studyBranchMoves.length
      _studyBranchMoves = null
    }
  } else {
    let branchMoves = branch.split("/")
    if (_studyBranchMoves == null) {
      writeUserMessage(sender + ": " + EJ("Studying a branch from move #" + base, base + "手目からの分岐手順を検討"), 2, "#008800")
      branchDelta = branchMoves.length
    } else {
      branchDelta = branchMoves.length - _studyBranchMoves.length
    }
    _studyBranchMoves = branch.split("/")
  }
  return branchDelta
  /*
	if (!board.studyOn) { //TODO check what 'studyOn' had been used in Flahs ver.
		board.studyOn = true;
		_users[name].isHost = true;
		_updateStatusMarks();
	if (!_study_notified && board.post_game && !board.onListen && !board.isStudyHost) {
		_writeUserMessage(LanguageSelector.lan.msg_study_notify + "\n", 2, "#008800");
		_study_notified = true;
	}
  */
}

function _handleStudy(singleMove = false) {
  _sendStudyBuffer = null
  if (_studyBase == null) return
	if (_studyBranchMoves == null) {
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
    _studyBranchMoves.forEach(function(csa, index){
      let move = prevMove.constructNextMove()
      move.setFromCSA(csa)
      move.branch = true
      prevMove = board.handleBranchMove(move, singleMove && index == _studyBranchMoves.length - 1)
      kifuGrid.rows.add([prevMove])
    })
    board.refreshPosition()
    if (singleMove) board.popupName(prevMove.toX, prevMove.toY, _studySender, 52224)
    kifuGrid.draw()
    kifuGrid.row(':last').select()
    scrollGridToSelected(kifuGrid)
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
  _sendStudyBuffer = _generateStudyText(index)
  if (timeouts["SEND_STUDY"]) return
  _sendStudyExecute()
}

function _sendStudyExecute(){
  if (_sendStudyBuffer == null) return
  client.gameChat("[##STUDY]" + _sendStudyBuffer)
  _sendStudyBuffer = null
  setGeneralTimeout("SEND_STUDY", 700)
}

function _sendAutoChat(str) {
  if (board.game) {
    client.gameChat("[auto-chat] " + str)
  } else {
    client.chat("[auto-chat] " + str)
	}
}

function _runTypingIndicator(name){
  let turn = board.getPlayerRoleFromName(name)
  if (turn == null) return
  let elem_id = "typingIndicator-" + turn
  let elem = $('#' + elem_id)
  if (!elem.length) {
    elem = $('<p></p>', {id: elem_id, class: 'typingIndicator'})
    let area = $("#boardMessageArea")
    area.append(elem)
    elem.text('[' + name + '] ' + i18next.t("msg.typing"))
    area.animate({scrollTop: area[0].scrollHeight}, 'fast')
  }
  setGeneralTimeout("TYPE_" + turn, 5000, true)
}

function _stopTypingIndicator(turn, fade = false){
  if (fade) {
    $('#typingIndicator-' + turn).fadeOut('fast', function(){
      $('#typingIndicator-' + turn).remove()
    })
  } else {
    $('#typingIndicator-' + turn).remove()
  }
  clearGeneralTimeout("TYPE_" + turn)
}

/* ====================================
    Web System API response handlers
===================================== */

function _handleServers(data){
  data[0].population = restoreIdleConnections(data[0].population)
  serverGrid.rows.add(data)
  serverGrid.draw()
  serverGrid.row(0).select()
  if (localStorage.server) serverGrid.row('#' + localStorage.server).select()
  $('input[name=loginType], input#usernameInput, input#passwordInput, input#loginSave, input#loginButton').prop('disabled', false)
  _loginTypeChange()
  if (testMode) _testFunction(1)
  _setLoginAlert("login.ready")
}

function _handleOptions(data){
  options = Object.assign(options, data)
  _enforceOptions()
  _loadOptionsToDialog()
}

function _handleTitles(data){
  data.forEach(function(dat){
    if (dat.avatar == null) dat.avatar = "*"
    let userName = dat.player.toLowerCase()
    if (!infoFetcher.titles[userName] || infoFetcher.titles[userName] && dat.priority >= infoFetcher.titles[userName].priority) {
      infoFetcher.titles[userName] = {name: dat.name_ja, tooltip: dat.name_en, avatar: dat.avatar, priority: dat.priority}
    }
  })
}

function _handleTournaments(data){
  tournaments = new Object()
  data.forEach(function(dat){
    tournaments[dat.id] = new Tournament(dat)
  })
  $('#newGameTournamentSelect').empty()
  Object.keys(tournaments).forEach(function(id){
    if (tournaments[id].amJoined()) $('#newGameTournamentSelect').append($("<option/>").val(id).text(tournaments[id].name()))
  })
}

function _handleCheckOpponent(data, opponent){
  if (data.to_play == null) return
  let elem = $('[id=check-game-' + opponent + ']').css('display', 'block')
  if (data.to_play) {
    elem.text(i18next.t("challenger.tournament_not_yet"))
  } else {
    elem.text(i18next.t("challenger.tournament_played"))
  }
}

function _handleEvaluation(data){
  let elem = $('[id=get-evaluation-' + data.name + ']')
  let diff = Math.max(data.good - data.bad, 0)
  if (elem.length) elem.text(diff)
}

function _handlePlayerDetail(data, name){
  let element = $("#player-info-window-" + name)
  if (element[0]) {
    let percentage = 0
    if (data.wins + data.losses > 0) percentage = 100.0 * data.wins / (data.wins + data.losses)
    element.find("p#p3").html(playingStyleName(data.style_id))
    element.find("p#p4").html(data.wins + " " + i18next.t("player_info.win") + " " + data.losses + " " + i18next.t("player_info.loss") + " (" + percentage.toFixed(1) + "%)")
    element.find("p#p5").html(i18next.t("player_info.streak") + ": " + data.streak_best + " (" + i18next.t("player_info.current") + ": " + Math.max(0, data.streak) + ")")
  }
}

function _handleKifuDetail(data){
  if (data.tournament_id) apiClient.getTournaments(data.tournament_id)
  let game_id
  let black
  let white
  let kifu_id = data.id
  let lines = data.contents.split("\n")
  let move_strings = []
  let endTime
  let positionStr = ""
  let gameEndStr = ""
  let opening = "*"
  lines.forEach(function(line){
    if (line.match(/^\$EVENT:(.+)$/)) {
      game_id = RegExp.$1
      black = new User(game_id.split("+")[2])
    	white = new User(game_id.split("+")[3])
    } else if (line.match(/^I([-+])(\d+),(\d+),.+$/)) {
      if (RegExp.$1 == "+") black.setFromList(RegExp.$2, RegExp.$3)
      else white.setFromList(RegExp.$2, RegExp.$3)
    } else if (line.match(/^([-+][0-9]{4}[A-Z]{2}|%TORYO)$/)) {
      move_strings.push(RegExp.$1)
    } else if (line.match(/^T(\d+)$/)){
      move_strings[move_strings.length - 1] += "," + RegExp.$1
    } else if (line.match(/^kifu_id:(.+)$/)) {
      kifu_id = RegExp.$1
    } else if (line.match(/^'\$END_TIME:(.+)$/)) {
      endTime = moment(RegExp.$1.replace(/\//g,"-"))
    } else if (line.match(/^To_Move:([\+\-])$/)){
			positionStr += "P0" + RegExp.$1 + "\n"
    } else if (line.match(/^P[0-9+-].*/)) {
      positionStr += line + "\n"
    } else if (line.match(/^#(SENTE_WIN|GOTE_WIN|DRAW|RESIGN|TIME_UP|ILLEGAL_MOVE|SENNICHITE|OUTE_SENNICHITE|JISHOGI|DISCONNECT|CATCH|TRY)/)) {
      gameEndStr += RegExp.$1 + "\n"
    } else if (line.match(/^'summary:/)) {
      opening = line.split(":")[5]
    }
  })
  let game = new Game(0, game_id, black, white)
  game.opening = opening
  board.setGame(game)
  board.startGame(positionStr, 2, move_strings)
  if (kifu_id) board.setKifuId(kifu_id)
  if (gameEndStr != "") {
    _handleGameEnd(gameEndStr)
    board.endTime = endTime
  }
  setBoardConditions()
  _greetState = 2
  $('div#boardLeftBottomHBox').detach()
  _enforcePremium()
  $('div#loader').detach()
  _switchLayer(2)
  _resize()
  if (args["moves"]) goToPosition(parseInt(args["moves"]))
  else goToPosition(0)
  if (args["turn"] == "1") board.flipBoard()
}

/* ====================================
    General
===================================== */

function _switchLayer(n){
  if (n == 1) {
    playerGrid.draw()
    waiterGrid.draw()
    gameGrid.draw()
  } else if (n == 2) {
    watcherGrid.draw()
    kifuGrid.draw()
  }
  $('div#layerLogin').css({'z-index': n == 0 ? 2 : 1, opacity: n == 0 ? 1 : 0})
  $('div#layerLobby').css({'z-index': n == 1 ? 2 : 1, display: (n == 0 || n == 1) ? 'block' : 'none'})
  $('div#layerBoard').css({'z-index': n == 2 ? 2 : 1, opacity: n == 2 ? 1 : 0})
  currentLayer = n
  if (n == 2 && me && me.isGuest) $('#boardChatInput').prop('disabled', !board.isPlayer())
}

function setGeneralTimeout(key, ms, force = false){
  //string, integer
  if (timeouts[key]) {
    if (force) clearGeneralTimeout(key)
    else return
  }
  timeouts[key] = setTimeout(_handleGeneralTimeout, ms, key)
}

function clearGeneralTimeout(key){
  if (timeouts[key]) {
    clearTimeout(timeouts[key])
    timeouts[key] = false
  }
}

function _enforceOptions(){
  sp.setByoyomiType(options.timer_sound_type)
  sp.gameStartEndEnabled = options.gamechat_sound_play == 1
  sp.chatLobbyEnabled = options.lobbychat_sound_play == 1
  sp.chatBoardEnabled = options.gamechat_sound_play == 1
  sp.buttonEnabled = options.button_sound_play == 1
  board.loadPieceDesignOption()
  let scale = [1, 1.5, 2][options.board_size]
  if (board.setScale(scale)) {
    $('#boardLeftBottomHBox').width(scale * board.div.width())
    _resize()
  }
  kifuGrid.rows().invalidate()
  if (client) client.idle(options.reject_invitation == 1)
}

function _handleGeneralTimeout(key){
  timeouts[key] = false
  switch (key) {
    case "LONG_TAP":
      _longTapRow.closest('table').DataTable().row(_longTapRow).select()
      _longTapRow.dblclick()
      break
    case "CHALLENGE":
      $('#challengeCanceler').remove()
  		if (_challengeUser) {
  			_challengeUser = null
  			writeUserMessage(i18next.t("msg.no_answer"), 1, "#008800", true)
  			client.decline("C031")
  		}
      break
    case "SHOW_CHALLENGE_CANCELER":
      $('#challengeCanceler').show()
    case "REFRESH":
      $("#refreshButton").removeClass("button-disabled")
      break
    case "AUTO_REFRESH":
      if (currentLayer == 1) _refreshLobby()
      break
    case "HOUR_MILE":
      if (client.serverName == "EARTH") {
        client.mileage([5, 8, 10, 10, 12, 12, 12, 12][_hourMileCount], config.mileagePass)
        if (_hourMileCount < 7) {
          _hourMileCount++
          setGeneralTimeout("HOUR_MILE", 3600000)
        }
      }
      break
    case "SEND_STUDY":
      _sendStudyExecute()
      break
    case "SEND_TYPE":
      client.gameChat("[##TYPE]")
      break
    case "TYPE_0":
      _stopTypingIndicator(0, true)
      break
    case "TYPE_1":
      _stopTypingIndicator(1, true)
      break
    case "WORLD_CLOCK":
      _refreshWorldClocks()
      break
    case "LOSER_LEAVE":
      _allowLoserLeave()
      break
  }
}

function _allowLoserLeave(){
  if (_loserLeaveDisabled) {
    _loserLeaveDisabled = false
    $('#closeGameButton').removeClass("button-disabled")
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

function _game2link(text, gameId){
  return '<sPAn onclick="_enterGameById(\'' + gameId + '\')" class="name-link">' + text + '</SpaN>'
}

function _isFavorite(name){
  return false
}

function _isColleague(name){
  return false
}

function getPremium(){
  if (premium == hidden_prm) return premium
  else return 0
}

function _enforcePremium(){
  _disableOptionsByPremium()
}

function _refreshLobby(first = false){
  client.who(first)
  client.list()
  setGeneralTimeout("AUTO_REFRESH", 180000, true)
}

function _askEvaluation(name){
	if (me.isGuest || name.match(/^GUEST_/)) return
  $('#userEvaluationDialog').remove()
  let elem = $('<p></p>', {id: 'userEvaluationDialog'})
  elem.html(EJ("Evaluate ", "対局相手") + name + EJ("'s game manner -> ", "さんの対局マナーを評価して下さい → "))
  $('<a></a>', {href: '#', 'data-answer': '1'}).text(EJ('[Good]', '[良い]')).appendTo(elem)
  $('<a></a>', {href: '#', 'data-answer': '-1'}).text(EJ('[Bad]', '[悪い]')).appendTo(elem)
  elem.find("a").click(function(){
    $('#userEvaluationDialog').remove()
    apiClient.postEvaluation(name, parseInt($(this).data('answer')) > 0)
  })
  let area = $("#lobbyMessageArea")
  area.append(elem)
  area.animate({scrollTop: area[0].scrollHeight}, 'fast')
}

function _generateKIF(){
  let rule = gameTypeToKIF(board.game.gameType)
  if (rule == null) return ""
  let lines = []
  lines.push("#KIF version=2.0 encoding=UTF-8")
  let tmp = board.game.gameId.split("+")[4]
  lines.push("開始日時：" + tmp.substr(0,4) + "/" + tmp.substr(4,2) + "/" + tmp.substr(6,2))
  lines.push("場所：81Dojo")
  lines.push("持ち時間：" + Math.floor(board.game.total/60) + "分+" + board.game.byoyomi + "秒")
  lines.push("手合割：" + rule)
  lines.push("先手：" + board.game.black.name)
  lines.push("後手：" + board.game.white.name)
  lines.push("手数----指手---------消費時間--")
  board.moves.forEach(function(move){
    let kif = move.toKIF()
    if (kif != null) lines.push(kif)
  })
  let branchStarted = false
  kifuGrid.rows().data().each(function(move,i){
    if (move.branch) {
      if (!branchStarted) {
        branchStarted = true
        lines.push("")
        lines.push("変化：" + move.num + "手")
      }
      lines.push(move.toKIF())
    }
  })
  return lines.join("\r\n")
}

function generateKifuNoteObject(){
  if (!board.game) return null
  if (board.game.isStudy() || !board.game.gameEndType) return null
  let tmp = board.game.gameId.split("+")[4]
  let result = ''
  if (board.result != null){
    if (board.result == -1) result = '引き分け'
    else if (board.result == 0) result = (board.game.gameType.match(/^hc/) ? '下手' : '先手') + '勝ち'
    else if (board.result == 1) result = (board.game.gameType.match(/^hc/) ? '上手' : '後手') + '勝ち'
    if (board.game.gameEndType && board.game.gameEndType != "RESIGN") result += '(' + board.constructor.MOVEMENT_CONST.special_notations_ja[board.game.gameEndType] + ')'
  }
  let moveSets = []
  let moves = []
  let count = 0
  board.moves.forEach(function(move){
    if (move.num == 1 && move.owner == Position.CONST.GOTE) moves.push(',')
    if (move.num != 0 && !move.endTypeKey) {
      moves.push(move.toKifuNote())
      count += 1
    }
    if (moves.length == 150) {
      moveSets.push(moves)
      moves = []
    }
  })
  if (moves.length > 0) moveSets.push(moves)
  let obj = {
    rule: HANDICAPS_JA[board.game.gameType] || "",
    startedAt: tmp.substr(0,4) + "/" + tmp.substr(4,2) + "/" + tmp.substr(6,2) + "　" + tmp.substr(8,2) + ":" + tmp.substr(10,2),
    endedAt: board.endTime.tz('Asia/Tokyo').format('YYYY/MM/DD　HH:mm'),
    place: '81道場 ' + board.game.serverName + 'サーバ',
    thinkingTime: '各 ' + Math.floor(board.game.total/60) + "分 (切れたら1手" + board.game.byoyomi + "秒)",
    blackName: board.game.black.name + '&nbsp;' + board.game.black.titleName(),
    whiteName: board.game.white.name + '&nbsp;' + board.game.white.titleName(),
    blackRank: (board.game.black.provisional ? "(" : "") + makeRankFromRating(board.game.black.rate, true) + (board.game.black.provisional ? ")" : ""),
    whiteRank: (board.game.white.provisional ? "(" : "") + makeRankFromRating(board.game.white.rate, true) + (board.game.white.provisional ? ")" : ""),
    moveSets: moveSets,
    movesCount: count.toString() + '手',
    result: result,
    opening: board.game.opening != "*" ? openingTypeObject(board.game.opening, true).tip : '',
    tournament: board.game.getTournament() ? board.game.getTournament().name() : '',
    usedTime: '☗ ' + sec2minsec(board.accumulatedTimes[0]) + '&emsp;☖ ' + sec2minsec(board.accumulatedTimes[1])
  }
  return obj
}

function _countGuestGame(){
  let date = new Date()
  if (localStorage.period && localStorage.period == date.getDay()) localStorage.status = parseInt(localStorage.status) + 1
  else {
	  localStorage.period = date.getDay()
    localStorage.status = 1
  }
}

function _checkGuestGamesExpired(){
	if (client.serverName == "MOON") return false
  if (!me.isGuest) return false
	let date = new Date()
	if (localStorage.period && localStorage.period == date.getDay() && localStorage.status >= 3) {
    showAlertDialog("guest_expire")
    return true
  } else {
    return false
  }
}

function _loadDefaultOptions(){
  options = {
    timer_sound_type: 2,
    piece_type: 0,
    piece_type_34: 1,
    button_sound_play: 1,
    lobbychat_sound_play: 1,
    gamechat_sound_play: 1,
    end_sound_play: 1,
    hold_piece: 1,
    highlight_movable: 0,
    notation_style: 1,
    pm_auto_open: 0,
    accept_arrow: 1,
    arrow_color: 52224,
    history_length: 50,
    postgame_study_level: 0,
    english_level: 0,
    receive_kifu_comment: 0,
    board_size: 0,
    favorites: [],
    members: [],
    opponents: [],
    show_accumulated_time: 0,
    reject_invitation: 0
  }
  _enforceOptions()
  _loadOptionsToDialog()
}

function _generateWorldClocks(){
  WorldClock.CONST.SEEDS.forEach(function(data){
    let clock = new WorldClock(data.key, data.timezone, data.secondary)
    $('#worldClocks').append(clock.div)
    _worldClocks.push(clock)
  })
}

function _refreshWorldClocks(){
  let now = moment()
  _worldClocks.forEach(function(clock){
    clock.draw(now)
  })
  setGeneralTimeout("WORLD_CLOCK", 10000)
}

function _fitnessLevelText(level){
  let i = parseInt(level)
  if (i == 0) return i18next.t("option.not_defined")
  else return i18next.t("option.level") + (i - 1).toString()
}

function _findGameByUser(user){
  let foundGame = null
  gameGrid.rows().data().toArray().some(function(game){
    if (game.isUserIn(user)) {
      foundGame = game
      return true
    }
  })
  return foundGame
}

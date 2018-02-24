function _initModalInvitation(user){
  $('span#inviterInfo').html(coloredSpan(makeRankFromRating(user.rate), makeColorFromRating(user.rate)) + '&ensp;' + user.name + '&ensp;' + user.country.flagImgTag27())
  if (user.waitingTournamentId){
    $('p#invitedGameInfo').html(tournaments[user.waitingTournamentId].name())
  } else {
    let game_info = user.waitingGameName.match(/^([0-9a-z]+?)_(.*)-([0-9]*)-([0-9]*)$/)
    $('p#invitedGameInfo').html(getHandicapShort(game_info[1]) + '&emsp;' + (parseInt(game_info[3])/60) + i18next.t("min") + ' + ' + game_info[4] + i18next.t("sec"))
  }
  $('#modalInvitation').find('div.check-game').attr('id', 'check-game-' + user.name).css('display', 'none').text('')
  $('#modalInvitation').find('span.get-evaluation').attr('id', 'get-evaluation-' + user.name).text('?')
  if (getPremium() >= 2) apiClient.getEvaluation(user.name)
  $('#invitationAcceptButton').unbind().click(function(){
    clearInterval(timer)
    _handleAcceptInvitation(user)
    $('#modalInvitation').dialog('close')
  })
  $('#invitationDeclineButton').unbind().click(function(){
    clearInterval(timer)
    _handleDeclineInvitation(user, "C014")
    $('#modalInvitation').dialog('close')
  })
  $('#declineReasonSelector').val("C014")
  $('#declineReasonSelector').unbind().change(function(){
    clearInterval(timer)
    _handleDeclineInvitation(user, $(this).val())
    $('#modalInvitation').dialog('close')
  })
  let count = 20
  $('#invitationTimerText').html(count)
  let timer = setInterval(function(){
    if (!$('#modalInvitation').dialog('isOpen')) {
      clearInterval(timer)
      return
    }
    count--
    $('#invitationTimerText').html(count)
    if (count <= 0) {
      clearInterval(timer)
      _handleDeclineInvitation(user, "C003")
      $('#modalInvitation').dialog('close')
    }
  }, 1000)
}

$('#modalInvitation').dialog({
  dialogClass: 'no-close',
  minHeight: 0,
  width: 250,
  autoOpen: false,
  position: {my: 'center bottom'},
  show: 'fade'
})

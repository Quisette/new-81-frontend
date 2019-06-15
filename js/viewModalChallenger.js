function _initModalChallenger(user){
  $('p#challengerName').html(coloredSpan('■', makeColorFromRating(user.rate)) + ' ' + user.name + '&emsp;' + user.country.flagImgTagMovie())
  $('span#challengerRate').html(': ' + user.rate + ' (' + makeRankFromRating(user.rate) + ') ' + user.mobileIconTag())
  $('#modalChallenger').find('div.check-game').attr('id', 'check-game-' + user.name).css('display', 'none').text('')
  $('#modalChallenger').find('span.get-evaluation').attr('id', 'get-evaluation-' + user.name).text('?')
  if (getPremium() >= 2) apiClient.getEvaluation(user.name)
  $('#challengerAcceptButton').unbind().click(function(){
    clearInterval(timer)
    _handleAcceptChallenge()
    $('#modalChallenger').dialog('close')
  })
  $('#challengerAcceptButton').keypress(function(e){
    e.preventDefault()
  })
  $('#challengerRejectButton').unbind().click(function(){
    clearInterval(timer)
    _handleRejectChallenge(user, "C004")
    $('#modalChallenger').dialog('close')
  })
  $('#rejectReasonSelector').val("C004")
  $('#rejectReasonSelector').unbind().change(function(){
    clearInterval(timer)
    _handleRejectChallenge(user, $(this).val())
    $('#modalChallenger').dialog('close')
  })
  let count = 20
  $('#challengerTimerText').html(count)
  let timer = setInterval(function(){
    if (!$('#modalChallenger').dialog('isOpen')) {
      clearInterval(timer)
      return
    }
    count--
    $('#challengerTimerText').html(count)
    if (count <= 0) {
      clearInterval(timer)
      _handleRejectChallenge(user, "C003")
      $('#modalChallenger').dialog('close')
    }
  }, 1000)
}

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

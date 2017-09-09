function _initModalChallenger(user){
  $('p#challengerName').html(coloredSpan('■', makeColorFromRating(user.rate)) + ' ' + user.name + '&emsp;' + user.country.flagImgTagMovie())
  $('span#challengerRate').html(': ' + user.rate + ' (' + makeRankFromRating(user.rate) + ')')
  $('#challengerAcceptButton').click(function(){
    _handleAcceptChallenge()
    clearInterval(timer)
  })
  $('#challengerRejectButton').click(function(){
    _handleRejectChallenge(user, "C004")
    clearInterval(timer)
  })
  let count = 20
  $('#challengerTimerText').html(count)
  let timer = setInterval(function(){
    count--
    $('#challengerTimerText').html(count)
    if (count <= 0) {
      clearInterval(timer)
      _handleRejectChallenge(user, "C003")
      modalChallengerWindow.close()
    }
  }, 1000)
}

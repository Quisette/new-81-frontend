function _initModalChallenger(user){
  $('p#challengerName').html(coloredSpan('■', makeColorFromRating(user.rate)) + ' ' + user.name + '&emsp;' + user.country.flagImgTagMovie())
  $('span#challengerRate').html(': ' + user.rate + ' (' + makeRankFromRating(user.rate) + ')')
  $('#challengerRejectButton').click(function(){
    _handleRejectChallenge(user, "C004")
  })
}

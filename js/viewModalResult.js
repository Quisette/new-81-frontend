function openResult(result){
  //integer (-1:Lose, 0:Draw, 1:Win)
  let div = $("#modalResult")
  div.css({left: board.div.offset().left + board.actualWidth()/2 - div.width()/2, top: board.div.offset().top + board.actualHeight()/2 - div.height()/2})
  if (result > 0) {
    div.css('background-image', 'url(img/fan_win.png)').find("#resultBanner").css('color', 'red').html(EJ('You Win', '勝利'))
  } else {
    div.css('background-image', 'url(img/fan_lose.png)').find("#resultBanner").css('color', 'black').html(result < 0 ? EJ('You Lose', '敗北') : EJ('Draw', '引分'))
  }
  div.fadeIn()
  setTimeout(function(){
    div.fadeOut(2000, function(){
      div.find(".rate-change").empty()
    })
  }, 4000)
}

function loadResult(myFrom, myTo, hisFrom, hisTo){
  if (board.game && board.isPlayer()) {
    let myRank1 = makeRankFromRating(myFrom)
    let myRank2 = makeRankFromRating(myTo)
    let hisRank1 = makeRankFromRating(hisFrom)
    let hisRank2 = makeRankFromRating(hisTo)
    let div = $("#modalResult")
    div.find("#my-change").html((board.myRoleType == 0 ? '☗' : '☖') + me.name + ' : ' + myFrom + ' → ' + myTo)
    if (myRank1 != myRank2) {
      if (myTo >= myFrom) div.find("#my-change").append('<span class="rank-up">' + EJ('Rank up!', '昇級!') + '</span>')
      else div.find("#my-change").append('<span class="rank-down">' + EJ('Rank down', '降級') + '</span>')
    }
    let opponent = board.myRoleType == 0 ? board.game.white : board.game.black
    div.find("#his-change").html((board.myRoleType == 0 ? '☖' : '☗') + opponent.name + ' : ' + hisFrom + ' → ' + hisTo)
    if (hisRank1 != hisRank2) {
      if (hisTo >= hisFrom) div.find("#his-change").append('<span class="rank-up">' + EJ('Rank up!', '昇級!') + '</span>')
      else div.find("#his-change").append('<span class="rank-down">' + EJ('Rank down', '降級') + '</span>')
    }
  }
}

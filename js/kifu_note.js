function loadKifu(){
  var obj = window.opener.generateKifuNoteObject()
  var currentSection
  var page = 0
  var currentSection = $('section')
  obj.moveSets.forEach(function(moveSet){
    page += 1
    if (page > 1) {
      currentSection = currentSection.clone()
      $('body').append(currentSection)
    }

    currentSection.find($('#blackName')).html('☗' + obj.blackName)
    currentSection.find($('#whiteName')).html('☖' + obj.whiteName)
    currentSection.find($('#blackRank')).text(obj.blackRank)
    currentSection.find($('#whiteRank')).text(obj.whiteRank)
    currentSection.find($('#tournament')).text(obj.tournament)
    currentSection.find($('#place')).text(obj.place)
    currentSection.find($('#startedAt')).text(obj.startedAt)
    currentSection.find($('#endedAt')).text(obj.endedAt)
    currentSection.find($('#gameType')).text(obj.rule)
    currentSection.find($('#thinkingTime')).text(obj.thinkingTime)
    currentSection.find($('#usedTime')).html(obj.usedTime)
    currentSection.find($('#movesCount')).text(obj.movesCount)
    currentSection.find($('#result')).text(obj.result)
    currentSection.find($('#opening')).text(obj.opening)
    currentSection.find($('td.move-box, td.time-box')).empty()
    currentSection.find($('td.move-box')).each(function(i,e){
      if (moveSet[i]) $(e).text(moveSet[i].split(",")[0])
    })
    currentSection.find($('td.time-box')).each(function(i,e){
      if (moveSet[i]) $(e).html(moveSet[i].split(",")[1])
    })
  })
}

$(function(){
  loadKifu()
})

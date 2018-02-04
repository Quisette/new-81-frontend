$('#modalNewGame').find('[name="newGameType"]').change(function(){
  $('#privateRoomPass').css('display', 'none')
  if ($('#modalNewGame').find('[name="newGameType"]:checked').val() == 5) {
    $('#newGameRuleSelect, #newGameTotalSelect, #newGameByoyomiSelect').attr('disabled', false)
    $('#privateRoomPass').css('display', 'block')
  } else {
    $('#newGameRuleSelect, #newGameTotalSelect, #newGameByoyomiSelect').attr('disabled', true)
  }
  if ($('#modalNewGame').find('[name="newGameType"]:checked').val() == 6) {
    $('#newGameTournamentSelect').attr('disabled', false)
  } else {
    $('#newGameTournamentSelect').attr('disabled', true)
  }
  if ($('#modalNewGame').find('[name="newGameType"]:checked').val() == 7) {
    $('#newGameStudyRuleSelect, #newGameStudyBlack, #newGameStudyWhite').attr('disabled', false)
    $('#privateRoomPass').css('display', 'block')
  } else {
    $('#newGameStudyRuleSelect, #newGameStudyBlack, #newGameStudyWhite').attr('disabled', true)
  }
})

function _disableNewGameOptions(isGuest){
  if (isGuest) {
    $('#modalNewGame').find('[name=newGameType]:lt(4), [name=newGameType]:lt(7):gt(4)').prop({'disabled': true})
    $('#modalNewGame').find('[name=newGameType]:eq(4)').prop('checked', true)
    $('#newGamePasswordInput').prop({'disabled': true}).val('')
  } else {
    $('#modalNewGame').find('[name=newGameType]').prop({'disabled': false})
    $('#newGamePasswordInput').prop({'disabled': false})
  }
  $('#modalNewGame').find('[name=newGameType]').change()
}

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

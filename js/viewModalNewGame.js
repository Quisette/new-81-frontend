$('#modalNewGame').find('[name="newGameType"]').change(function(){
  if ($('#modalNewGame').find('[name="newGameType"]:checked').val() == 5) {
    $('#newGameRuleSelect, #newGameTotalSelect, #newGameByoyomiSelect').attr('disabled', false)
  } else {
    $('#newGameRuleSelect, #newGameTotalSelect, #newGameByoyomiSelect').attr('disabled', true)
  }
})

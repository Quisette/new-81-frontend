$('#modalNewGame').find('[name="newGameType"]').change(function(){
  if ($('#modalNewGame').find('[name="newGameType"]:checked').val() == 5) {
    $('#newGameRuleSelect, #newGameTotalSelect, #newGameByoyomiSelect').attr('disabled', false)
  } else {
    $('#newGameRuleSelect, #newGameTotalSelect, #newGameByoyomiSelect').attr('disabled', true)
  }
})

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

$('#modalChatTemplate').find('a').click(function(){
  _sendChatTemplate($(this).data('i18n').split(".")[1])
  $('#modalChatTemplate').dialog('close')
})

$('#modalChatTemplate').dialog({
  modal: true,
  autoOpen: false,
  position: {my: 'left bottom', at: 'center bottom-50'},
  open: function(e, ui){
    $('.ui-widget-overlay').hide().fadeIn()
  },
  width: 400,
  show: 'fade'
})

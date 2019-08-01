function _initModalAutomatch(){
  $('#automatchConfirmButton').unbind().click(function(){
    clearInterval(timer)
    _handleConfirmAutomatch(true)
    $('#modalAutomatch').dialog('close')
  })
  $('#automatchConfirmButton').keypress(function(e){
    e.preventDefault()
  })
  let count = 10
  $('#automatchTimerText').html(count)
  let timer = setInterval(function(){
    if (!$('#modalAutomatch').dialog('isOpen')) {
      clearInterval(timer)
      return
    }
    count--
    $('#automatchTimerText').html(count)
    if (count <= 0) {
      clearInterval(timer)
      _handleConfirmAutomatch(false)
      $('#modalAutomatch').dialog('close')
    }
  }, 1000)
}

$('#modalAutomatch').dialog({
  modal: true,
  dialogClass: 'no-close',
  autoOpen: false,
  position: {my: 'center bottom'},
  open: function(e, ui){
    $('.ui-widget-overlay').hide().fadeIn()
  },
  close: function(){
    sp.stopAutomatchConfirm()
  },
  show: 'fade'
})

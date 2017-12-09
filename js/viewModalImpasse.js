function _updateImpasseWindow(impasseStatus, myTurn = null){
  //Objecct, integer(0:Playing as sente and having turn, 1:Playing as gote and having turn)
  $("#modalImpasse").find("td#black-entered").html(impasseStatus[0].entered ? EJ('YES', '成立') : EJ('NO', '不成立')).css('color', impasseStatus[0].entered ? 'red' : '')
  $("#modalImpasse").find("td#black-pieces").html(impasseStatus[0].pieces).css('color', impasseStatus[0].pieces >= 10 ? 'red' : '')
  $("#modalImpasse").find("td#black-points").html(impasseStatus[0].points).css('color', impasseStatus[0].points >= 28 ? 'red' : '')
  $("#modalImpasse").find("td#white-entered").html(impasseStatus[1].entered ? EJ('YES', '成立') : EJ('NO', '不成立')).css('color', impasseStatus[1].entered ? 'red' : '')
  $("#modalImpasse").find("td#white-pieces").html(impasseStatus[1].pieces).css('color', impasseStatus[1].pieces >= 10 ? 'red' : '')
  $("#modalImpasse").find("td#white-points").html(impasseStatus[1].points).css('color', impasseStatus[1].points >= 27 ? 'red' : '')
  if (myTurn == null || !impasseStatus[myTurn].entered || impasseStatus[myTurn].pieces < 10 || impasseStatus[myTurn].points < (28 - myTurn)) {
    $("#modalImpasse").dialog('widget').find(".ui-dialog-buttonpane button:eq(0)").button('disable')
  } else {
    $("#modalImpasse").dialog('widget').find(".ui-dialog-buttonpane button:eq(0)").button('enable')
  }
}

$('#modalImpasse').dialog({
  modal: true,
  autoOpen: false,
  position: {my: 'center bottom'},
  width: 250,
  open: function(e, ui){
    $('.ui-widget-overlay').hide().fadeIn()
  },
  show: 'fade',
  buttons: [
    {id: "i18n-declare", click: function(){_handleImpasseDeclare()}}
  ]
})

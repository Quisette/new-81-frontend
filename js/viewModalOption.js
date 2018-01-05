function _loadOptionsToDialog(){
  //Checkboxes
  $('div#optionTabs').find('input[type=checkbox]').each(function(){
    if (options[$(this).prop('id')] == null) return
    $(this).prop('checked', options[$(this).prop('id')] == 1)
  })
  //Radiobuttons
  $('input[name=timer_sound_type]').val([options.timer_sound_type])
  $('input[name=piece_type]').val([options.piece_type])
  $('input[name=board_size]').val([options.board_size])
  //Selectboxes
  $('div#optionTabs').find('select').each(function(){
    $(this).val(options[$(this).prop('id')])
  })
  //Others
  $('input#arrow_color').spectrum('set', intToColorStyle(options.arrow_color))
}
function _setOptionsFromDialog(){
  //Checkboxes
  $('div#optionTabs').find('input[type=checkbox]').each(function(){
    options[$(this).prop('id')] = $(this).prop('checked') ? 1 : 0
  })
  //Radiobuttons
  options.timer_sound_type = parseInt($('input[name=timer_sound_type]:checked').val())
  options.piece_type = parseInt($('input[name=piece_type]:checked').val())
  options.board_size = parseInt($('input[name=board_size]:checked').val())
  //Selectboxes
  $('div#optionTabs').find('select').each(function(){
    options[$(this).prop('id')] = $(this).val()
  })
  //Others
  options.arrow_color = parseInt($('input#arrow_color').spectrum('get').toHex(), 16)
}

function _DisableOptionsByPremium(){
  $('input[name=timer_sound_type]:gt(0), input[name=piece_type]:lt(9):gt(3)').prop({'disabled': getPremium() == 0, 'title': getPremium() == 0 ? i18next.t("option.for_premium") : ''})
}
function _loadPieceDesignToDialog(key, val, checked = false){
  let elm = $('<p></p>').css('margin-bottom', '5px')
  $('<input/>').attr({type: "radio", name: "piece_type", value: val}).prop('checked', checked).appendTo(elm)
  $('<span></span>').attr("data-i18n", "option.piece_design." + key).css('margin-right', '10px').appendTo(elm)
  $('<img/>', {class: "piece-preview", src: "img/themes/" + key + "/Sou.png"}).appendTo(elm)
  $('<img/>', {class: "piece-preview", src: "img/themes/" + key + "/Suma.png"}).appendTo(elm)
  $('<img/>', {class: "piece-preview", src: "img/themes/" + key + "/Gfu.png"}).appendTo(elm)
  $("#pieceDesignSelector").append(elm)
}

_loadPieceDesignToDialog("ichiji", 0, true)
_loadPieceDesignToDialog("ninju", 1)
_loadPieceDesignToDialog("hidetchi", 2)
_loadPieceDesignToDialog("shogicz", 8)
_loadPieceDesignToDialog("ichiji_ryoko", 3)
_loadPieceDesignToDialog("kinki", 5)
_loadPieceDesignToDialog("ryoko", 6)
_loadPieceDesignToDialog("kiyoyasu", 7)
_loadPieceDesignToDialog("dobutsu", 4)
_loadPieceDesignToDialog("blind_middle", 100)
_loadPieceDesignToDialog("blind_hard", 101)
_loadPieceDesignToDialog("blind_extreme", 102)

$('div#optionTabs').tabs()
//Change event for checkboxes
$('div#optionTabs').find('input[type=checkbox]').change(function(){
  apiClient.postOption($(this).prop('id'), $(this).prop('checked') ? 1 : 0)
})
//Change event for radiobuttons
$('div#optionTabs').find('input[type=radio]').change(function(){
  let key = $(this).prop('name')
  apiClient.postOption(key, parseInt($('input[name=' + key + ']:checked').val()))
})
//Change event for Selectboxes
$('div#optionTabs').find('select').change(function(){
  apiClient.postOption($(this).prop('id'), parseInt($(this).val()))
})
//Settings for others
$('input#arrow_color').spectrum({
  showInitial: true,
  showButtons: false,
  change: function(color){
    apiClient.postOption('arrow_color', parseInt(color.toHex(), 16))
  }
})

$('#modalOption').dialog({
  modal: true,
  autoOpen: false,
  position: {my: 'center bottom'},
  width: 410,
  open: function(e, ui){
    $('.ui-widget-overlay').hide().fadeIn()
  },
  show: 'fade',
  buttons: [
    {text: "OK", click: function(){_handleOptionClose()}},
  ]
})

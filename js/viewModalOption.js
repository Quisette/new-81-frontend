function _loadPieceDesignToDialog(key, val, checked = false){
  let elm = $('<p></p>').css('margin-bottom', '5px')
  $('<input/>').attr({type: "radio", name: "piece_type", value: val}).prop('checked', checked).appendTo(elm)
  $('<span></span>').attr("data-i18n", "option.piece_design." + key).css('margin-right', '10px').appendTo(elm)
  $('<img/>', {class: "piece-preview", src: "img/themes/" + key + "/Sou.png"}).appendTo(elm)
  $('<img/>', {class: "piece-preview", src: "img/themes/" + key + "/Suma.png"}).appendTo(elm)
  $('<img/>', {class: "piece-preview", src: "img/themes/" + key + "/Gfu.png"}).appendTo(elm)
  $("#pieceDesignSelector").append(elm)
}
function _loadOptionsToDialog(){
  $('input#arrow_color').spectrum('set', intToColorStyle(options.arrow_color))
  $('input[name=timer_sound_type]').val([options.timer_sound_type])
  $('input[name=piece_type]').val([options.piece_type])
  $('input[name=board_size]').val([options.board_size])
}
function _setOptionsFromDialog(){
  options.arrow_color = parseInt($('input#arrow_color').spectrum('get').toHex(), 16)
  options.timer_sound_type = parseInt($('input[name=timer_sound_type]:checked').val())
  options.piece_type = parseInt($('input[name=piece_type]:checked').val())
  options.board_size = parseInt($('input[name=board_size]:checked').val())
}
function _DisableOptionsByPremium(){
  $('input[name=timer_sound_type]:gt(0), input[name=piece_type]:lt(9):gt(3)').prop({'disabled': getPremium() == 0, 'title': getPremium() == 0 ? i18next.t("option.for_premium") : ''})
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
$('input#arrow_color').spectrum({
  showInitial: true,
  showButtons: false,
  change: function(color){
    apiClient.postOption('arrow_color', parseInt(color.toHex(), 16))
  }
})
$('div#optionTabs').find('input[type=radio]').change(function(){
  let key = $(this).prop('name')
  apiClient.postOption(key, parseInt($('input[name=' + key + ']:checked').val()))
})

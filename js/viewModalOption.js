var skinNames = ['iori(=null)', 'aie', 'urushi', 'oedo', 'asahi', 'momiji', 'rikyu', 'kabuki', 'miyuki', 'shinobi']
function _loadOptionsToDialog() {
  //Checkboxes
  $('div#optionTabs').find('input[type=checkbox]').each(function () {
    if (options[$(this).prop('id')] == null) return
    $(this).prop('checked', options[$(this).prop('id')] == 1)
  })
  //Radiobuttons
  $('input[name=timer_sound_type]').val([options.timer_sound_type])
  $('input[name=piece_type]').val([options.piece_type])
  $('input[name=piece_type_34]').val([options.piece_type_34])
  $('input[name=board_size]').val([options.board_size])
  $('input[name=notation_style]').val([options.notation_style])
  $('input[name=skin]').val([options.skin])
  //Selectboxes
  $('div#optionTabs').find('select').each(function () {
    $(this).val(options[$(this).prop('id')])
  })
  //Others
  $('input#arrow_color').spectrum('set', intToColorStyle(options.arrow_color))
}
function _setOptionsFromDialog() {
  //Checkboxes
  $('div#optionTabs').find('input[type=checkbox]').each(function () {
    options[$(this).prop('id')] = $(this).prop('checked') ? 1 : 0
  })
  //Radiobuttons
  options.timer_sound_type = parseInt($('input[name=timer_sound_type]:checked').val())
  options.piece_type = parseInt($('input[name=piece_type]:checked').val())
  options.piece_type_34 = parseInt($('input[name=piece_type_34]:checked').val())
  options.board_size = parseInt($('input[name=board_size]:checked').val())
  options.notation_style = parseInt($('input[name=notation_style]:checked').val())
  options.skin = parseInt($('input[name=skin]:checked').val())
  //Selectboxes
  $('div#optionTabs').find('select').each(function () {
    options[$(this).prop('id')] = $(this).val()
  })
  //Others
  options.arrow_color = parseInt($('input#arrow_color').spectrum('get').toHex(), 16)
  options.master_volume = $('input#volumeRange').val()
}

function _disableOptionsByPremium() {
  $('input[name=timer_sound_type]:gt(1), input[name=piece_type]:lt(9):gt(3)').prop({ 'disabled': getPremium() == 0, 'title': getPremium() == 0 ? i18next.t("option.for_premium") : '' })
  $('input[name=skin]:lt(3):gt(0)').prop({ 'disabled': getPremium() < 1, 'title': getPremium() < 1 ? i18next.t("option.for_premium") : '' })
  $('input[name=skin]:lt(7):gt(2)').prop({ 'disabled': getPremium() < 2, 'title': getPremium() < 2 ? i18next.t("option.for_premium") : '' })
  $('input[name=skin]:lt(10):gt(6)').prop({ 'disabled': getPremium() < 3, 'title': getPremium() < 3 ? i18next.t("option.for_premium") : '' })
}
function _loadPieceDesignToDialog(key, val, checked = false) {
  let p = $('<div></div>').css('margin-bottom', '5px')
  let pieceid = "pieceselect_" + val
  let input = $('<input/>').attr({ type: "radio", class: "btn-check", name: "piece_type", id: pieceid, value: val })

  let elm = $('<label></label>').attr({ class: "btn btn-outline-primary", for: pieceid }).css('margin', '5px').prop('checked', checked)
  // $('<input/>').attr({type: "radio", class: "btn-check",name: "piece_type", value: val}).prop('checked', checked).appendTo(elm)
  $('<img/>', { class: "piece-preview", src: "img/themes/" + key + "/Sou.png" }).appendTo(elm)
  // $('<span></span>').attr("data-i18n", "option.piece_design." + key).css('margin-right', '10px').appendTo(elm)
  // p.append(input)
  // p.append(elm)
  $("#pieceDesignSelector").append(input)
  $("#pieceDesignSelector").append(elm)
}

let piecenames = [["ichiji", 0, true],
["ninju", 1], ["hidetchi", 2], ["ichiji_ryoko", 3], ["dobutsu", 4], ["kinki", 5], ["ryoko", 6], ["kiyoyasu", 7], ["shogicz", 8],
["toast", 9], ["Portella", 10], ["Portella_2moji", 11], ["kifu_style", 12], ["shogiwars_2moji", 13], ["shogiwars_1moji", 14],
["blind_middle", 100], ["blind_hard", 101], ["blind_extreme", 102]]


piecenames.forEach(e => {
  try{
    _loadPieceDesignToDialog(e[0], e[1], e[2])
  } catch{
    _loadPieceDesignToDialog(e[0], e[1])
  }
});

// for (let ite = 1; ite < piecenames.length; ite++) {
//   let elem = piecenames[ite]
//   console.log(piecenames[ite])
//   try{
//     _loadPieceDesignToDialog(piecenames[ite][0], piecenames[ite][1], piecenames[ite][2])
//   } catch{
//     _loadPieceDesignToDialog(elem[0].toString(), elem[1])
//   }



// }

// _loadPieceDesignToDialog("ichiji", 0, true)
// _loadPieceDesignToDialog("ninju", 1)
// _loadPieceDesignToDialog("hidetchi", 2)
// _loadPieceDesignToDialog("ichiji_ryoko", 3)
// _loadPieceDesignToDialog("dobutsu", 4)
// _loadPieceDesignToDialog("kinki", 5)
// _loadPieceDesignToDialog("ryoko", 6)
// _loadPieceDesignToDialog("kiyoyasu", 7)
// _loadPieceDesignToDialog("shogicz", 8)
// _loadPieceDesignToDialog("toast", 9)
// _loadPieceDesignToDialog("Portella", 10)
// _loadPieceDesignToDialog("Portella_2moji", 11)
// _loadPieceDesignToDialog("kifu_style", 12)
// _loadPieceDesignToDialog("shogiwars_2moji", 13)
// _loadPieceDesignToDialog("shogiwars_1moji", 14)
// _loadPieceDesignToDialog("blind_middle", 100)
// _loadPieceDesignToDialog("blind_hard", 101)
// _loadPieceDesignToDialog("blind_extreme", 102)
$("#pieceDesignSelector").append('<div style="color:blue;background:#ddd"><label><input type="checkbox" id="notifyBlindCheckbox" class="no-save" onchange="this.disabled=true"><span data-i18n="option.blind_notify"></span></input></label></div>')
if (isTouchDevice) $('input#hold_piece').prop('disabled', true).parent().css('text-decoration', 'line-through')

$('div#optionTabs').tabs()
//Change event for checkboxes
$('div#optionTabs').find('input[type=checkbox]:not(.no-save)').change(function () {
  apiClient.postOption($(this).prop('id'), $(this).prop('checked') ? 1 : 0)
})
//Change event for radiobuttons
$('div#optionTabs').find('input[type=radio]').change(function () {
  let key = $(this).prop('name')
  apiClient.postOption(key, parseInt($('input[name=' + key + ']:checked').val()))
})
//Change event for Selectboxes
$('div#optionTabs').find('select').change(function () {
  apiClient.postOption($(this).prop('id'), parseInt($(this).val()))
})
//Settings for others
$('input#arrow_color').spectrum({
  showInitial: true,
  showButtons: false,
  change: function (color) {
    apiClient.postOption('arrow_color', parseInt(color.toHex(), 16))
  }
})

$('#modalOption').dialog({
  modal: true,
  autoOpen: false,
  position: { my: 'center top', at: 'center top+100' },
  width: "40vw",
  open: function (e, ui) {
    $('.ui-widget-overlay').hide().fadeIn()
    $('input#volumeRange').val(options.master_volume)
  },
  show: 'fade',
  buttons: [
    { text: "OK", click: function () { _handleOptionClose() }, 'data-click': 'exec' },
  ]
})

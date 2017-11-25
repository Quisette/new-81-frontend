function _loadOptionsToDialog(){
  $('input#arrow_color').spectrum('set', intToColorStyle(options.arrow_color))
  $('input[name=timer_sound_type]').val([options.timer_sound_type])
}
function _setOptionsFromDialog(){
  options.arrow_color = parseInt($('input#arrow_color').spectrum('get').toHex(), 16)
}
function _DisableOptionsByPremium(){
  $('input[name=timer_sound_type]:gt(0)').prop({'disabled': getPremium() == 0, 'title': getPremium() == 0 ? i18next.t("option.for_premium") : ''})
}
$('div#optionTabs').tabs()
$('input#arrow_color').spectrum({
  showInitial: true,
  showButtons: false,
  change: function(color){
    apiClient.postOption('arrow_color', parseInt(color.toHex(), 16))
  }
})

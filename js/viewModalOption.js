function _loadOptions(){
  $('input#arrow_color').spectrum('set', intToColorStyle(options.arrow_color))
}
function _setOptions(){
  options.arrow_color = parseInt($('input#arrow_color').spectrum('get').toHex(), 16)
}
$('div#optionTabs').tabs()
$('input#arrow_color').spectrum({
  showInitial: true,
  showButtons: false,
  change: function(color){
    apiClient.postOption('arrow_color', parseInt(color.toHex(), 16))
  }
})

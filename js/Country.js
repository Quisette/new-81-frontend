"use strict";

class Country{
  constructor(id, name_en, name_ja, name3){
    this.code3 = (id + 1000).toString().substr(1, 3)
    this.name_en = name_en
    this.name_ja = name_ja
    this.name3 = name3
  }

  flagImgTag16(){
    return '<img title="' + this.toString() + '" src="' + IMAGE_DIRECTORY + 'flags_ss/' + this.code3 + '.png"/>'
  }

  flagImgTag27(){
    return '<img title="' + this.toString() + '" src="' + IMAGE_DIRECTORY + 'flags_s/' + this.code3 + '.gif" style="vertical-align:middle"/>'
  }

  flagImgTagMovie(){
    return '<img title="' + this.toString() + '" src="' + IMAGE_DIRECTORY + 'flags_gif/' + this.code3 + '.gif" style="vertical-align:middle"/>'
  }

  name3Tag(){
    return '<span title="' + this.toString() + '">' + this.name3 + '</span>'
  }

  toString(){
    return EJ(this.name_en, this.name_ja)
  }
}

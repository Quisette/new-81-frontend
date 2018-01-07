"use strict"

class WorldClock{
  constructor(key, timezone){
    //string, string
    this._key = key
    this._timezone = timezone
    this._generateParts()
  }

  static get CONST(){
    return {
      SEEDS: [
        {key: 'utc', timezone: 'UTC'},
        {key: 'cet', timezone: 'Europe/Berlin'},
        {key: 'moscow', timezone: 'Europe/Moscow'},
        {key: 'shanghai', timezone: 'Asia/Shanghai'},
        {key: 'tokyo', timezone: 'Asia/Tokyo'},
        {key: 'sydney', timezone: 'Australia/Sydney'},
        {key: 'pst', timezone: 'America/Los_Angeles'},
        {key: 'est', timezone: 'America/New_York'},
        {key: 'sao_paulo', timezone: 'America/Sao_Paulo'}
      ],
      WEEK_DAY_KEYS: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    }
  }

  _generateParts(){
    this._div = $('<div></div>', {class: 'clock-box'})
    this._label = $('<span></span>', {class: 'clock-label', "data-i18n": 'clock.' + this._key}).appendTo(this._div)
    this._clock = $('<span></span>', {class: 'clock-digits'}).appendTo(this._div)
  }

  draw(now){
    let now_in_tz = now.tz(this._timezone)
    this._clock.html(i18next.t("clock." + WorldClock.CONST.WEEK_DAY_KEYS[now_in_tz.day()]) + '&ensp;' + now_in_tz.format("HH:mm"))
    if (now_in_tz.hour() >= 19 || now_in_tz.hour() <= 5) this._clock.addClass("clock-night")
    else this._clock.removeClass("clock-night")
  }

  get div(){
    return this._div
  }
}

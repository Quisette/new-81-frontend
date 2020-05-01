"use strict"

class GameTimer {
	constructor(div){
    this._div = div
		div.css('cursor', 'default')
		div.click(function(e){
			if ($(e.target).css('cursor') == 'help') window.open('https://81dojo.com/documents/' + EJ('Clock_Delay', '遅延表示'), '_blank')
		})
		this._label
    this._subLabel

		this._total = 30
    this._byoyomi = 30
    this._timeLeft = this._total
    this._isByoyomi = false
    this._disconnected = false

    this.soundType = 0
    this._tickTimer = false
		this.myPlayingTimer = false

		this._preCountedUsedTime = 0

    this._generateParts()
    this._display()
	}

  _generateParts(){
    this._label = $('<div></div>', {class: 'game-timer-label'}).appendTo(this._div)
    this._subLabel = $('<div></div>', {class: 'game-timer-sub-label'}).appendTo(this._div)
  }

  initialize(total, byoyomi){
    this._total = total
    this._byoyomi = byoyomi
    this._isByoyomi = total <= 0
    this._timeLeft = this._isByoyomi ? this._byoyomi : this._total
    this._totalUsedTime = 0
    this._disconnected = false
		this.myPlayingTimer = false
		this._preCountedUsedTime = 0
		this.stop()
		this._display()
  }

  setPosition(x, y){
    this._div.css({left: x + 'px', top: y + 'px'})
  }

	run(){
		if (this._tickTimer) return
		if (this._disconnected && this._isByoyomi) return
    let thisInstance = this
    this._tickTimer = setInterval(function(){
      thisInstance._tickHandler()
    }, 1000)
	}

	stop(pauseInByoyomi = false){
		if (!this._tickTimer) return
    clearInterval(this._tickTimer)
		this._tickTimer = false
		if (this._isByoyomi) {
			if (this._timeLeft < 0) this._timeLeft = 0
		  if (!pauseInByoyomi) this._timeLeft = this._byoyomi
		}
		this._disconnected = false
		this._div.css('cursor', 'default')
    this._display()
	}

	useTime(time, preCount = false){
    //integer
    this.stop()
    if (this._isByoyomi) return
		if (this._preCountedUsedTime > 0) {
			time -= this._preCountedUsedTime
			this._preCountedUsedTime = 0
		}
    this._totalUsedTime += time
		if(this._totalUsedTime < this._total){
      this._timeLeft = this._total - this._totalUsedTime
		} else {
      this._isByoyomi = true
      this._timeLeft = this._byoyomi
		}
		if (preCount) this._preCountedUsedTime = time
		this._display()
	}

	disconnect(){
		if (this._disconnected) return
		if (this._isByoyomi) this.stop()
		this._disconnected = true
	}

	reconnect(){
		this._disconnected = false
	}

	_tickHandler() {
    this._timeLeft--
		if(this._timeLeft <= 0){
			if(this._byoyomi > 0 && !this._isByoyomi){
        this._isByoyomi = true
        this._timeLeft = this._byoyomi
				if (this._byoyomi > 10) sp.sayByoyomi()
				if (this._disconnected) this.stop()
			} else { //time-up
				if (this.myPlayingTimer && this._timeLeft <= -1) sendTimeout() //Allow 1 second even after time-out
			}
		} else if (this._isByoyomi) {
			if (this._timeLeft == 30 || this._timeLeft == 20 || this._timeLeft == 10) sp.sayNumber(this._byoyomi - this._timeLeft)
			else if (this._timeLeft < 10 && this._timeLeft > 0) sp.sayNumber(10 - this._timeLeft)
		}
		this._display();
	}

	_display(){
    if (this._timeLeft <= 0) {
      this._div.css('background-color', 'red')
    } else if (this._isByoyomi) {
      if (this._timeLeft < 10) {
        this._div.css('background-color', '#f80')
      } else {
        this._div.css('background-color', 'yellow')
      }
    } else {
      this._div.css('background-color', 'white')
    }
		let sec = this._timeLeft % 60
		if (this._timeLeft <= -3) {
      this._label.text(EJ("Delay", "遅延"))
			this._div.css('cursor', 'help')
		} else if (this._timeLeft < 0) {
      this._label.text("0:00")
		} else {
      this._label.text(parseInt(this._timeLeft / 60).toString() + ":" + (sec < 10 ? '0' : '') + sec.toString())
		}
    this._subLabel.text(this._isByoyomi ? "" : this._byoyomi.toString())
	}

}

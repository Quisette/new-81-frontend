"use strict"

class Snowfall{
  constructor(canvasId){
    this._canvas = document.getElementById(canvasId)
    this._ctx = this._canvas.getContext("2d")
    this.resize(800, 600)
    this._imgCnt = 15
    this._aryImg = []
    this._baseSize = 20
    this._zoomMax = 1.3
    this._zoomMin = 0.5
    this._speedMax = 1.5
    this._speedMin = 0.2
    this._angleAdd = 4
    this._wind = 10
    this._windTarget = this._wind
    this._windMax = 25
    this._windMin = 5
    this._img = new Image()
    this._flowInterval = null
    this._windChangeInterval = null
    this._setSource("SAKURA_PINK")
  }

  static get CONST() {
    return {
      SAKURA_PINK: "img/snowfall_sakura.png",
      SAKURA_WHITE: "img/snowfall_sakura2.png"
    }
  }

  resize(w, h){
    this._canvas.width = w
    this._canvas.height = h
    this._cvsw = w
    this._cvsh = h
    this._setImages()
  }

  _setSource(key){
    this._img.src = Snowfall.CONST[key]
  }

  _setImages(){
    this._aryImg = []
    for(let i = 0; i < this._imgCnt; i++){
      let zoom = this._zoomMin + Math.random()*(this._zoomMax - this._zoomMin)
      this._aryImg.push({
        "posX": Math.random() * this._cvsw,
        "posY": Math.random() * this._cvsh,
        "size": this._baseSize * zoom,
        "speedY": this._speedMin + Math.random() * (this._speedMax - this._speedMin),
        "angle": 360 * Math.random()
      })
    }
  }

  _flow(){
    if (this._windTarget > this._wind + 0.1) this._wind += 0.1
    else if (this._windTarget < this._wind - 0.1) this._wind -= 0.1
    this._ctx.clearRect(0, 0, this._cvsw, this._cvsh)
    for (let idx = 0; idx < this._imgCnt; idx++){
      this._aryImg[idx].posX += this._wind/this._aryImg[idx].size;
      this._aryImg[idx].posY += this._aryImg[idx].speedY;
      (idx%2) ? this._aryImg[idx].angle += 1 : this._aryImg[idx].angle -= 1;
      let cos = Math.cos(this._aryImg[idx].angle * Math.PI/180);
      let sin = Math.sin(this._aryImg[idx].angle * Math.PI/180);
      this._ctx.setTransform(cos, sin, sin, cos, this._aryImg[idx].posX, this._aryImg[idx].posY);
      this._ctx.drawImage(this._img, 0, 0 , this._aryImg[idx].size , this._aryImg[idx].size);
      this._ctx.setTransform(1, 0, 0, 1, 0, 0);
      if(this._aryImg[idx].posY >= this._cvsh) this._aryImg[idx].posY = - this._aryImg[idx].size
      if(this._aryImg[idx].posX >= this._cvsw) this._aryImg[idx].posX = - this._aryImg[idx].size
    }
  }

  _windChange(){
    this._windTarget = this._windMin + Math.random() * (this._windMax - this._windMin)
  }

  start(key = "SAKURA_PINK", num = 15, scale = 1){
    clearInterval(this._flowInterval)
    clearInterval(this._windChangeInterval)
    this._img.src = Snowfall.CONST[key]
    this._imgCnt = num
    this._baseSize = 18 * scale
    $(this._canvas).fadeIn(1000)
    this._setImages()
    this._windChange()
    let _this = this
    this._flowInterval = setInterval(function(){
      _this._flow()
    }, 10)
    this._windChangeInterval = setInterval(function(){
      _this._windChange()
    }, 2000)
  }

  stop(){
    let _this = this
    $(this._canvas).fadeOut(2000, function(){
      clearInterval(_this._flowInterval)
      clearInterval(_this._windChangeInterval)
      _this._ctx.clearRect(0, 0, this._cvsw, this._cvsh)
    })
  }

}

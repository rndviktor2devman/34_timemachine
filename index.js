var TIMEOUT_IN_SECS = 3 * 60

var MOTTOS = ["No one can make you feel inferior without your consent.",
              "This too, shall pass.",
              "Keep your eyes on the stars and your feet on the ground.",
              "The only person you should try to be better than is the person you were yesterday.",
              "Life's too mysterious to take too serious.",
              "A man who flies from his fear may find that he has only taken a shortcut to meet it."]

if(document.createStyleSheet) {
  document.createStyleSheet('https://rawgit.com/rndviktor2devman/34_timemachine/d6729da9/crt.css');
}
else {
  var styles = "@import url(' https://rawgit.com/rndviktor2devman/34_timemachine/d6729da9/crt.css ');";
  var newSS=document.createElement('link');
  newSS.rel='stylesheet';
  newSS.href='data:text/css,'+escape(styles);
  document.getElementsByTagName("head")[0].appendChild(newSS);
}

var TEMPLATE = '<h1 class="crt"><span class="js-timer-minutes">00</span>:<span class="js-timer-seconds">00</span></h1>'

function padZero(number){
  return ("00" + String(number)).slice(-2);
}

function isNumeric(val) {
    return !isNaN(parseFloat(val)) && isFinite(val);
}

function findHighestZIndex() {
    let queryObject = document.querySelectorAll('*');
    let childNodes = Object.keys(queryObject).map(key => queryObject[key]);
    let highest = 0;

    childNodes.forEach((node) => {
      // Get the calculated CSS z-index value.
      let cssStyles = document.defaultView.getComputedStyle(node);
      let cssZIndex = cssStyles.getPropertyValue('z-index');

      // Get any inline z-index value.
      let inlineZIndex = node.style.zIndex;

      // Coerce the values as integers for comparison.
      cssZIndex = isNumeric(cssZIndex) ? parseInt(cssZIndex, 10) : 0;
      inlineZIndex = isNumeric(inlineZIndex) ? parseInt(inlineZIndex, 10) : 0;

      // Take the highest z-index for this element, whether inline or from CSS.
      let currentZIndex = cssZIndex > inlineZIndex ? cssZIndex : inlineZIndex;

      if ((currentZIndex > highest)) {
        highest = currentZIndex;
      }
    });

    return highest;
}

class Timer{
  // IE does not support new style classes yet
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
  constructor(timeout_in_secs){
    this.initial_timeout_in_secs = timeout_in_secs
    this.reset()
  }
  getTimestampInSecs(){
    var timestampInMilliseconds = new Date().getTime()
    return Math.round(timestampInMilliseconds/1000)
  }
  start(){
    if (this.isRunning)
      return
    this.timestampOnStart = this.getTimestampInSecs()
    this.isRunning = true
  }
  stop(){
    if (!this.isRunning)
      return
    this.timeout_in_secs = this.calculateSecsLeft()
    this.timestampOnStart = null
    this.isRunning = false
  }
  reset(timeout_in_secs){
    this.isRunning = false
    this.timestampOnStart = null
    this.timeout_in_secs = this.initial_timeout_in_secs
  }
  calculateSecsLeft(){
    if (!this.isRunning)
      return this.timeout_in_secs
    var currentTimestamp = this.getTimestampInSecs()
    var secsGone = currentTimestamp - this.timestampOnStart
    return Math.max(this.timeout_in_secs - secsGone, 0)
  }
}

class TimerWidget{
  // IE does not support new style classes yet
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
  construct(){
    this.timerContainer = this.minutes_element = this.seconds_element = null
  }
  mount(rootTag){
    if (this.timerContainer)
      this.unmount()

    // adds HTML tag to current page
    this.timerContainer = document.createElement('div')

    var nextZindex = findHighestZIndex() + 1;
    var elementStyle = "position: fixed; z-index: " + nextZindex + "; top:50px;"
    this.timerContainer.setAttribute("style", elementStyle)
    this.timerContainer.innerHTML = TEMPLATE

    rootTag.insertBefore(this.timerContainer, rootTag.firstChild)

    this.minutes_element = this.timerContainer.getElementsByClassName('js-timer-minutes')[0]
    this.seconds_element = this.timerContainer.getElementsByClassName('js-timer-seconds')[0]
  }
  update(secsLeft){
    var minutes = Math.floor(secsLeft / 60);
    var seconds = secsLeft - minutes * 60;

    this.minutes_element.innerHTML = padZero(minutes)
    this.seconds_element.innerHTML = padZero(seconds)
  }
  unmount(){
    if (!this.timerContainer)
      return
    this.timerContainer.remove()
    this.timerContainer = this.minutes_element = this.seconds_element = null
  }
}


function main(){

  var timer = new Timer(TIMEOUT_IN_SECS)
  var timerWidget = new TimerWidget()
  var intervalId = null

  timerWidget.mount(document.body)

  function randomiseAndShow() {
    var message = (MOTTOS[Math.floor(Math.random() * MOTTOS.length)]);
    window.alert(message);
  }

  function handleIntervalTick(){
    var secsLeft = timer.calculateSecsLeft()
    if(secsLeft === 0){
      randomiseAndShow();
      timer = new Timer(TIMEOUT_IN_SECS);
      secsLeft = timer.calculateSecsLeft();
      timer.start();
    }
    timerWidget.update(secsLeft)
  }

  function handleVisibilityChange(){
    if (document.hidden) {
      timer.stop()
      clearInterval(intervalId)
      intervalId = null
    } else {
      timer.start()
      intervalId = intervalId || setInterval(handleIntervalTick, 300)
    }
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
  document.addEventListener("visibilitychange", handleVisibilityChange, false);
  handleVisibilityChange()
}

// initialize timer when page ready for presentation
window.addEventListener('load', main)

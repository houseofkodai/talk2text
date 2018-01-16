var el={};
var qs={};
var lang = 'ta-IN';
var colors = {'success':'#2ecc40', 'warning':'#ffdc00', 'error':'#ff4136', 'default':'#0074d9'};

var onklick = function(evt) {
  if (!talk2text.isListening()) {
    hdr(' starting...', colors.warning);
    talk2text.start({"autoRestart":true, "language":lang, "callback": cb});
  } else {
    talk2text.stop();
  }
}

var onresize = function(evt) {
  el.txt.style.height = window.innerHeight - el.hdr.clientHeight + 'px';
  el.txt.focus();
}

var hdr = function(txt,bgcolor) {
  el.hdr.style.background = bgcolor || colors.default;
  el.hdr.innerText = languages[lang] + ' ' + txt;
}

var cb = function(type, data) {
  if (qs.debug) { console.log(type, data); }
  switch(type) {
    case 'onstart':
      break;
    case 'onend':
      if (talk2text.lastError()) {
        hdr(' klick2start');
      }
      break;
    case 'onsoundstart':
      hdr(' talk2text', colors.success);
      break;
    case 'onerror':
      hdr(data, colors.error);
      break;
    case 'onresult':
      var w = data[0];
      var v = el.txt.value;
      //insert in cursor position or replace selected text
      el.txt.value = v.slice(0, el.txt.selectionStart) + w + v.slice(el.txt.selectionEnd);
      el.txt.focus();
      break;
    default: console.log(type, data);
  }
}

var languages = talk2text.getLanguages();

var main = function() {
  el.hdr = document.createElement('div');
  el.hdr.className = 'hdr';
  el.hdr.addEventListener('click', onklick, false);
  document.body.appendChild(el.hdr);

  el.txt = document.createElement('textarea');
  el.txt.addEventListener('resize', onresize, false);
  document.body.appendChild(el.txt);

  qs = function() {
    var m = {};
    (window.location.search || '?').substr(1).replace(/([^&=]+)=?([^&]*)(?:&+|$)/g, function(match, k, v) {m[k] = v;});
    return m;
  }();
  if (languages[qs.lang]) { lang = qs.lang; }
  hdr('klick2start');
  onresize();
  onklick();
}
window.addEventListener('load', main, false);

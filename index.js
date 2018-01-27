var G = {'t2t': talk2text, 'l':['ta-IN', 'தமிழ்'], 'dbg':false};

window.addEventListener('load', function() {

G.fH = function(s,c) {
  G.h.style.background = c || '#0074d9';
  G.h.innerText = G.l[1] + ' ' + s;
}

G.fR = function(e) {
  G.t.style.height = window.innerHeight - G.h.clientHeight + 'px';
  G.t.focus();
}

G.cb = function(t, d) {
  if (G.dbg) { console.log(t, d); }
  switch(t) {
    case 'onstart':
      break;
    case 'onend':
      if (G.t2t.lastError()) { G.fH(' klick2start'); }
      break;
    case 'onsoundstart':
      G.fH(' talk2text', '#2ecc40');
      break;
    case 'onerror':
      G.fH(d, '#ff4136');
      break;
    case 'onresult':
      if (d.length) {
        var w = d[0];
        var v = G.t.value;
        //insert in cursor position or replace selected text
        G.t.value = v.slice(0, G.t.selectionStart) + w + v.slice(G.t.selectionEnd);
        G.t.focus();
      }
      break;
    default: console.log(t, d);
  }
}

var qs = function() {
  var m = {};
  (window.location.search || '?').substr(1).replace(/([^&=]+)=?([^&]*)(?:&+|$)/g, function(match, k, v) {m[k] = v;});
  return m;
}();
G.dbg = qs.debug || false;
var langs = G.t2t.getLanguages();
if (langs[qs.lang]) { 
  G.l[0] = qs.lang;
  G.l[1] = langs[qs.lang];
}

// create document elements and assign event-handlers for them
e = document.createElement('div');
e.className = 'h';
e.addEventListener('click', function() {
  if (!G.t2t.isListening()) {
    G.fH(' starting...', '#ffdc00');
    G.t2t.start({"language":G.l[0], "callback": G.cb});
  } else {
    G.t2t.stop();
  }
}, false);
document.body.appendChild(e);
G.h = e;

e = document.createElement('textarea');
e.addEventListener('resize', G.fR, false);
document.body.appendChild(e);
G.t = e;

// set initial-title, resize to set textarea height, and autostart
G.fH('klick2start');
G.fR();
G.h.click();

});
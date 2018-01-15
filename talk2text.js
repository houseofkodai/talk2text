//! talk2text
//! version : 0.1
//! author  : Karthik Ayyar <karthik@houseofkodai.in>>
//! license : MIT
//! website : https://houseofkodai.in/

(function (root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    // AMD
    define([], function () {
      return (root.talk2text = factory(root));
    });
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS
    module.exports = factory(root);
  } else {
    // POJO
    root.talk2text = factory(root);
  }
}(typeof window !== 'undefined' ? window : this, function (root, undefined) {

  'use strict';

  // Get browser support object, while handling browser prefixes
  var _SpeechRecognition = root.SpeechRecognition ||
                            root.webkitSpeechRecognition ||
                            root.mozSpeechRecognition ||
                            root.msSpeechRecognition ||
                            root.oSpeechRecognition;

  // return null for unsupported browsers
  if (!_SpeechRecognition) {
    return null;
  }

  var _languages = {"af-ZA": "Afrikaans",
    "am-ET": "አማርኛ",
    "az-AZ": "Azərbaycanca",
    "bn-BD": "বাংলা-বাংলাদেশ",
    "bn-IN": "বাংলা-ভারত",
    "id-ID": "Bahasa Indonesia",
    "ms-MY": "Bahasa Melayu",
    "ca-ES": "Català",
    "cs-CZ": "Čeština",
    "da-DK": "Dansk",
    "de-DE": "Deutsch",
    "en-AU": "English-Australia",
    "en-CA": "English-Canada",
    "en-IN": "English-India",
    "en-KE": "English-Kenya",
    "en-TZ": "English-Tanzania",
    "en-GH": "English-Ghana",
    "en-NZ": "English-New Zealand",
    "en-NG": "English-Nigeria",
    "en-ZA": "English-South Africa",
    "en-PH": "English-Philippines",
    "en-GB": "English-United Kingdom",
    "en-US": "English-United States",
    "es-AR": "Español-Argentina",
    "es-BO": "Español-Bolivia",
    "es-CL": "Español-Chile",
    "es-CO": "Español-Colombia",
    "es-CR": "Español-Costa Rica",
    "es-EC": "Español-Ecuador",
    "es-SV": "Español-El Salvador",
    "es-ES": "Español-España",
    "es-US": "Español-Estados Unidos",
    "es-GT": "Español-Guatemala",
    "es-HN": "Español-Honduras",
    "es-MX": "Español-México",
    "es-NI": "Español-Nicaragua",
    "es-PA": "Español-Panamá",
    "es-PY": "Español-Paraguay",
    "es-PE": "Español-Perú",
    "es-PR": "Español-Puerto Rico",
    "es-DO": "Español-República Dominicana",
    "es-UY": "Español-Uruguay",
    "es-VE": "Español-Venezuela",
    "eu-ES": "Euskara",
    "fil-PH": "Filipino",
    "fr-FR": "Français",
    "jv-ID": "Basa Jawa",
    "gl-ES": "Galego",
    "gu-IN": "ગુજરાતી",
    "hr-HR": "Hrvatski",
    "zu-ZA": "IsiZulu",
    "is-IS": "Íslenska",
    "it-IT": "Italiano-Italia",
    "it-CH": "Italiano-Svizzera",
    "kn-IN": "ಕನ್ನಡ",
    "km-KH": "ភាសាខ្មែរ",
    "lv-LV": "Latviešu",
    "lt-LT": "Lietuvių",
    "ml-IN": "മലയാളം",
    "mr-IN": "मराठी",
    "hu-HU": "Magyar",
    "lo-LA": "ລາວ",
    "nl-NL": "Nederlands",
    "ne-NP": "नेपाली भाषा",
    "nb-NO": "Norsk bokmål",
    "pl-PL": "Polski",
    "pt-BR": "Português-Brasil",
    "pt-PT": "Português-Portugal",
    "ro-RO": "Română",
    "si-LK": "සිංහල",
    "sl-SI": "Slovenščina",
    "su-ID": "Basa Sunda",
    "sk-SK": "Slovenčina",
    "fi-FI": "Suomi",
    "sv-SE": "Svenska",
    "sw-TZ": "Kiswahili-Tanzania",
    "sw-KE": "Kiswahili-Kenya",
    "ka-GE": "ქართული",
    "hy-AM": "Հայերեն",
    "ta-IN": "தமிழ்-இந்தியா",
    "ta-SG": "தமிழ்-சிங்கப்பூர்",
    "ta-LK": "தமிழ்-இலங்கை",
    "ta-MY": "தமிழ்-மலேசியா",
    "te-IN": "తెలుగు",
    "vi-VN": "Tiếng Việt",
    "tr-TR": "Türkçe",
    "ur-PK": "اُردُو-پاکستان",
    "ur-IN": "اُردُو-بھارت",
    "el-GR": "Ελληνικά",
    "bg-BG": "български",
    "ru-RU": "Pусский",
    "sr-RS": "Српски",
    "uk-UA": "Українська",
    "ko-KR": "한국어",
    "cmn-Hans-CN": "中文-普通话 (中国大陆)",
    "cmn-Hans-HK": "中文-普通话 (香港)",
    "cmn-Hant-TW": "中文-中文 (台灣)",
    "yue-Hant-HK": "中文-粵語 (香港)",
    "ja-JP": "日本語",
    "hi-IN": "हिन्दी",
    "th-TH": "ภาษาไทย"
  };
  var _isDebug = false;
  var _lastStart = 0;
  var _autoRestart = false;
  var _autoRestartCount = 0;
  var _isListening = false;
  var _lastError = '';

  var _defaultCallback = function(type, data) {
    console.log((new Date()).toLocaleTimeString(), type, data)
  };
  var _callback = _defaultCallback;

  var _log = function(s) {
    if (s && _isDebug) {
      console.log((new Date()).toLocaleTimeString() + ': ' + s);
    }
  }

  var _sr = new _SpeechRecognition();
  _sr.maxAlternatives = 5;
  // In HTTPS, turn off continuous mode for faster results.
  // In HTTP,  turn on  continuous mode for much slower results, but no repeating security notices
  _sr.continuous = root.location.protocol === 'http:';
  _sr.lang = 'en-US';
  _sr.onstart = function() {
    _isListening = true;
    _callback('onstart');
  };
  _sr.onend = function() {
    _isListening = false;
    _callback('onend');
    if (_autoRestart) {
      var timeSinceLastStart = new Date().getTime()-_lastStart;
      _autoRestartCount += 1;
      if (_autoRestartCount % 10 === 0) {
        _log('Speech Recognition is repeatedly stopping and starting.');
      }
      //do not start more than once-per-second
      if (timeSinceLastStart < 1000) {
        setTimeout(function() {_sr.start();}, 1000-timeSinceLastStart);
      } else {
        _sr.start();
      }
    }
  };
  _sr.onsoundstart = function() {
    _callback('onsoundstart');
  };
  _sr.onerror = function(evt) {
    if (_isListening) {
      _lastError = '- ' + evt.error;
      if (('not-allowed' == evt.error) || ('service-not-allowed' == evt.error)) {
        //if no-permession for mic, then disable autoRestart
        _autoRestart = false;
        // determine if permission was denied by user or automatically.
        if ((new Date().getTime()-_lastStart) < 200) {
          _lastError = '-not-allowed-system';
        } else {
          _lastError = '-not-allowed-user';
        }
      }
      _callback('onerror', _lastError);
    }
  };
  _sr.onresult = function(evt) {
    // Map the results to an array
    var r = evt.results[evt.resultIndex];
    var results = [];
    for (var k=0; k<r.length; k++) {
      results[k] = r[k].transcript;
    }
    _callback('onresult', results)
  };

  return {

    /**
     * Returns the instance of the browser's SpeechRecognition object 
     *
     * @returns SpeechRecognition The browser's Speech Recognizer currently being used
     * @method SpeechRecognition
     */
    SpeechRecognition: function() {
      return _sr;
    },

    /**
     * Returns current state of listening
     *
     * @return boolean
     * @method isListening
     */
    isListening: function() {
      return _isListening;
    },

    /**
     * Returns lastError
     *
     * @return string
     * @method lastError
     */
    lastError: function() {
      return _lastError;
    },

    /**
     * Returns Object of supported languages
     *
     * @return Object
     * @method getLanguages
     */
    getLanguages: function() {
      return _languages;
    },

    /**
     * Turn on/off output of debug messages to the console.
     *
     * @param {boolean} [newState=true] - Turn on/off debug messages
     * @method debug
     */
    debug: function(newState) {
      var newState = newState || true;
      _isDebug = !!newState;
    },

   /**
     * Start listening.
     *
     * Receives an optional options object which supports the following options:
     *
     * - `autoRestart`  (boolean, default: true) restart itself on silence or window conflicts?
     * - `callback`     {Function} The function to call when events occur.
     * - `language`     (string, default: en-US) The language to use for translation.
     *
     * #### Examples:
     * ````javascript
     * // Start listening, don't restart automatically
     * talk2text.start({ autoRestart: true });
     * // Start listening, don't restart automatically, stop recognition after first phrase recognized
     * talk2text.start({ autoRestart: true, callback: function(type, data) {console.log(type, data)}; });
     * ````
     * @param {Object} [options] - Optional options.
     * @method start
     */
    start: function(options) {

      if (_isListening) { return; }

      options = options || {};

      if (options.callback !== undefined && typeof options.callback === 'function') {
        _callback = options.callback;
      }
      if (options.autoRestart !== undefined) {
        _autoRestart = !!options.autoRestart;
      } else {
        _autoRestart = true;
      }
      if (options.language !== undefined && _languages[options.language]) {
        _sr.lang = options.language;
      }

      _lastError = '';
      _lastStart = new Date().getTime();
      try {
        _sr.start();
      } catch(e) {
        _callback("onexception", e.message);
      }
    },

    /**
     * Set the language the user will speak in. If this method is not called, defaults to 'en-US'.
     *
     * @param {String} language - The language (locale)
     * @method setLanguage
     */
    setLanguage: function(newLanguage) {
      if (_languages[newLanguage]) {
        _sr.lang = newLanguage;
      }
    },

    /**
     * Stop listening
     *
     * @method stop
     */
    stop: function() {
      if (_sr) {
        _autoRestart = false;
        _autoRestartCount = 0;
        _lastError = '';
        _sr.abort();
      }
    },

  };

}));

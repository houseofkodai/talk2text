//! talk2text
//! version : 0.2
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

  var _languages = {
    "en-US": "English",
    "bn-IN": "বাংলা-ভারত",
    "en-IN": "English",
    "gu-IN": "ગુજરાતી",
    "kn-IN": "ಕನ್ನಡ",
    "ml-IN": "മലയാളം",
    "mr-IN": "मराठी",
    "ta-IN": "தமிழ்",
    "te-IN": "తెలుగు",
    "ur-IN": "اُردُو-بھارت",
    "hi-IN": "हिन्दी",
  };
  var _isDebug = false;
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
  _sr.continuous = true;
  _sr.interimResults = true;
  _sr.lang = 'en-US';
  _sr.onstart = function() {
    _isListening = true;
    _callback('onstart');
  };
  _sr.onend = function() {
    _isListening = false;
    _callback('onend');
  };
  _sr.onsoundstart = function() {
    _callback('onsoundstart');
  };
  _sr.onerror = function(evt) {
    if (_isListening) {
      _lastError = '- ' + evt.error;
      if (('not-allowed' == evt.error) || ('service-not-allowed' == evt.error)) {
        // determine if permission was denied by user or automatically.
        if ((new Date().getTime()-_lastStart) < 200) {
          _lastError = 'service-not-allowed-system';
        } else {
          _lastError = 'service-not-allowed-user';
        }
      }
      _callback('onerror', _lastError);
    }
  };
  _sr.onresult = function(evt) {
    // Map the results to an array
    var results = [];
    for (var i = evt.resultIndex; i < evt.results.length; ++i) {
      var r = evt.results[i];
      if (r.isFinal) {
        for (var j=0; j<r.length; j++) {
          results.push(r[j].transcript);
        }
      }
    }
    if (results.length) {
      _callback('onresult', results);
    }
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
     * - `callback`     {Function} The function to call when events occur.
     * - `language`     (string, default: en-US) The language to use for translation.
     *
     * #### Examples:
     * ````javascript
     * // Start listening in en-US
     * talk2text.start({ callback: function(type, data) {console.log(type, data)}; });
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
      if (options.continuous !== undefined) {
        _sr.continuous = !!options.continuous;
      }
      if (options.language !== undefined && _languages[options.language]) {
        _sr.lang = options.language;
      }

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
        _lastError = '';
        _sr.abort();
      }
    },

  };

}));

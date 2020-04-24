'use strict';

const fs = require('fs');

class OlapicAnalizer {
  constructor() {
    this._regxs = {
      domain: /photorank/,
      script: /latest\/build/,
      media: /akamaihd\.net\/media\/(.+)\/(.+)\.jpg/,
    };
    this._requests = [];
    this._data = {
      script: {
        loadTime: 0,
        proccesTime: 0,
      },
      firstMedia: null,
      slowerMedia: null,
    };
  }
  analize(har) {
    fs.writeFileSync(`entries.json`, JSON.stringify(har.log.entries));
    this._requests = har.log.entries.filter((item) =>
      item.request.url.match(this.domainReg)
    );
    return this._process();
  }
  _process() {
    const build = this._getScript();
    const allMedia = this._getMedia();

    // First requested media.
    this._data.firstMedia = allMedia[0];

    // Script's load time in seconds.
    this._data.script.loadTime = build.time / 1000;

    // Script's processing time in seconds.
    this._data.script.proccesTime =
      (Date.parse(this._data.firstMedia.startedDateTime) -
        Date.parse(build.startedDateTime)) /
      1000;

    // Slower media based on loading time.
    this._data.slowerMedia = allMedia
      .sort((a, b) => Date.parse(a.time) > Date.parse(b.time))
      .pop();

    return this._data;
  }
  /**
   * Search for the build's request.
   *
   * @return  {Object}
   */
  _getScript() {
    return this._requests
      .filter((item) => item.request.url.match(this._regxs.script))
      .pop();
  }
  /**
   * Get request to media ordered by start time.
   *
   * @return  {Array}
   */
  _getMedia() {
    return this._requests
      .filter((item) => item.request.url.match(this._regxs.media))
      .sort(
        (a, b) => Date.parse(a.startedDateTime) > Date.parse(b.startedDateTime)
      );
  }
}
module.exports = new OlapicAnalizer();

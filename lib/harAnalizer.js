'use strict';

class OlapicStats {
  constructor(id) {
    this.id = id;
    this.request = [];
    this.stats = {
      found: false,
      scriptFileLoadTime: 0,
      firstTrackingTime: 0,
      firstMedia: null,
      timeUntilFirstMedia: 0,
      slowerMedia: null,
      stylesFileLoadTime: 0,
      templatesFileLoadTime: 0,
    };
  }
}
/**
 * The Olapic's requests analizer.
 */
class OlapicAnalizer {
  constructor() {
    this._pages = [];
    this._requests = [];
    this._regxs = {
      build: /photorankstatics-([a-z]{1}).akamaihd.net\/(.+)\/static\/frontend\/latest\/build.min.js/,
      renderTracking: /data.photorank.me\/track\/widget\/(.+)\/best\/render.gif/,
      media: /(.+)photorankmedia-([a-z]{1}).akamaihd.net\/media\/([a-z]{1})\/([a-z]{1})\/([a-z]{1})\/(.+)\/(.+).jpg/,
      cssFile: /photorankstatics-([a-z]{1}).akamaihd.net\/static\/frontend\/(.+)\/build.min.css/,
      templatesFile: /photorankstatics-([a-z]{1}).akamaihd.net\/assets2\/widget\/(.+)\?/,
    };
  }
  /**
   * Proccess the given HAR Object to generate Olapic's metrics.
   *
   * @param   {Object}  har  Request's made by the current run.
   * @return  {OlapicResult}
   */
  analize(har) {
    this._requests = har.log.entries;
    har.log.pages.forEach((page) => {
      const { id } = page;
      this._pages.push(this._analize(id));
    });
    return this._getStasts();
  }
  /**
   * Filter the current request's by page and url
   *
   * @param   {String}  id      Page's id.
   * @param   {RegExp}  regexp  Expression to to use as filter on the request's url.
   * @return  {Array}
   */
  _filterRequest(id, regexp = /(.)/) {
    return this._requests.filter(
      (item) => item.pageref === id && item.request.url.match(regexp)
    );
  }
  /**
   * Provide the first request based on the given expression.
   *
   * @param   {String}  id      Page's id.
   * @param   {RegExp}  regexp  Expression to to use as filter on the request's url.
   * @return  {Object}
   */
  _getFileRequest(id, regexp) {
    return this._filterRequest(id, regexp).pop();
  }
  /**
   * Analize the requests from the given page id.
   *
   * @param   {String}  id  Page's id.
   * @return  {OlapicStats}
   */
  _analize(id) {
    const page = new OlapicStats();
    page.request = this._filterRequest(id);
    const build = this._getFileRequest(id, this._regxs.build);
    const allMedia = this._filterRequest(id, this._regxs.media);
    const tracking = this._filterRequest(id, this._regxs.renderTracking);
    const cssFile = this._getFileRequest(id, this._regxs.cssFile);
    const templatesFile = this._getFileRequest(id, this._regxs.templatesFile);

    page.stats.found = !!build;

    if (build) {
      page.stats.scriptFileLoadTime = this._roundMs(build.time);
      page.stats.firstTrackingTime = this._roundMs(
        Date.parse(tracking[0].startedDateTime) -
          Date.parse(build.startedDateTime)
      );
    }

    if (allMedia.length) {
      page.stats.firstMedia = allMedia[0];
      page.stats.timeUntilFirstMedia =
        Date.parse(page.stats.firstMedia.startedDateTime) -
        Date.parse(page.request[0].startedDateTime);

      page.stats.slowerMedia = allMedia
        .sort((a, b) => Date.parse(a.time) > Date.parse(b.time))
        .pop();
    }

    if (cssFile) {
      page.stats.stylesFileLoadTime = this._roundMs(cssFile.time);
    }

    if (templatesFile) {
      page.stats.templatesFileLoadTime = this._roundMs(templatesFile.time);
    }
    return page;
  }
  /**
   * Format milliseconds to 2 digits.
   *
   * @param   {Number}  ms
   * @return  {Number}
   */
  _roundMs(ms) {
    return Math.floor(ms * 100) / 100;
  }
  /**
   * Generate the result stats.
   *
   * @return  {OlapicResult}
   */
  _getStasts() {
    const summarized = new OlapicStats();
    summarized.stats.found = this._pages.some((page) => page.stats.found);

    if (summarized.stats.found) {
      const metrics = [
        'scriptFileLoadTime',
        'firstTrackingTime',
        'stylesFileLoadTime',
        'templatesFileLoadTime',
        'timeUntilFirstMedia',
      ];
      this._pages.forEach((page) => {
        metrics.forEach(
          (statIndex) => (summarized.stats[statIndex] += page.stats[statIndex])
        );
      });
      metrics.forEach((statIndex) => {
        summarized.stats[statIndex] = this._roundMs(
          summarized.stats[statIndex] / this._pages.length
        );
      });
    }

    return {
      pages: this._pages,
      summarized,
    };
  }
}

module.exports = new OlapicAnalizer();

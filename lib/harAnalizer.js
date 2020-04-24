'use strict';

class OlapicAnalizer {
  constructor() {
    this._regxs = {
      domain: /photorank/,
      script: /latest\/build/,
      media: /akamaihd\.net\/media\/(.+)\/(.+)\.jpg/,
    };
    this.runs = [];
    this.summarized = {
      stats: {
        script: {
          loadTime: 0,
          proccesTime: 0,
        },
        firstMedia: null,
        slowerMedia: null,
      },
    };
  }
  analize(har) {
    const { runs, summarized } = this;
    har.log.pages.forEach((page) => {
      const data = {
        id: page.id,
        requests: har.log.entries.filter(
          (item) =>
            item.pageref === page.id && item.request.url.match(this.domainReg)
        ),
        stats: null,
      };

      data.stats = this._process(data.requests);
      summarized.stats.script.loadTime += data.stats.script.loadTime;
      summarized.stats.script.proccesTime += data.stats.script.proccesTime;
      this.runs.push(data);
    });
    summarized.stats.loadTime = summarized.stats.loadTime / this.runs.length;
    summarized.stats.proccesTime =
      summarized.stats.proccesTime / this.runs.length;

    return { runs, summarized };
  }
  _process(requests) {
    const build = this._getScript(requests);
    const allMedia = this._getMedia(requests);
    const stats = {
      script: {
        loadTime: 0,
        proccesTime: 0,
      },
      firstMedia: null,
      slowerMedia: null,
    };

    // First requested media.
    stats.firstMedia = allMedia[0];

    // Script's load time in seconds.
    stats.script.loadTime = build.time / 1000;

    // Script's processing time in seconds.
    stats.script.proccesTime =
      (Date.parse(stats.firstMedia.startedDateTime) -
        Date.parse(build.startedDateTime)) /
      1000;

    // Slower media based on loading time.
    stats.slowerMedia = allMedia
      .sort((a, b) => Date.parse(a.time) > Date.parse(b.time))
      .pop();

    return stats;
  }
  /**
   * Search for the build's request.
   *
   * @param {Array<Object>} requests  The request's list to analize.
   * @return  {Object}
   */
  _getScript(requests) {
    return requests
      .filter((item) => item.request.url.match(this._regxs.script))
      .pop();
  }
  /**
   * Get request to media ordered by start time.
   *
   * @param {Array<Object>} requests  The request's list to analize.
   * @return  {Array}
   */
  _getMedia(requests) {
    return requests
      .filter((item) => item.request.url.match(this._regxs.media))
      .sort(
        (a, b) => Date.parse(a.startedDateTime) > Date.parse(b.startedDateTime)
      );
  }
}
module.exports = new OlapicAnalizer();

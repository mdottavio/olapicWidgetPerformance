/**
 * @typedef {Object} OlapicResult
 * @property {Array<OlapicStats>} pages  List of results by page.
 * @property {OlapicStats} summarized    Sumarized results.
 */

/**
 * @typedef {Object} OlapicStats
 * @property {String}  id                           The page's id provided by sitespeed.
 * @property {Array}   request                      The page's request list.
 * @property {Object}  stats
 * @property {Boolean} stats.found
 * @property {Number}  stats.scriptFileLoadTime     The build's load time in milliseconds.
 * @property {Number}  stats.firstTrackingTime      Time to the `render` hit to the Olapic's tracking service, since the build's load time,in milliseconds.
 * @property {Object}  stats.firstMedia             First request to an Olapic's media.
 * @property {Object}  stats.slowerMedia            Olapic's media request with most loading time, in milliseconds.
 * @property {Number}  stats.stylesFileLoadTime     The Widget's styles file load time, in milliseconds.
 * @property {Number}  stats.templatesFileLoadTime  The widget's tempalte file load time, in milliseconds.
 */

'use strict';

const path = require('path');
const fs = require('fs');
const harAnalizer = require('./harAnalizer.js');

class OlapicPlugin {
  name() {
    return 'olapic-widget-performance';
  }
  open(context) {
    this.make = context.messageMaker('olapicWidgetPerformance').make;
    this.log = context.intel.getLogger(
      'sitespeedio.plugin.olapicWidgetPerformance'
    );

    this.pug = fs.readFileSync(
      path.resolve(__dirname, 'pug', 'index.pug'),
      'utf8'
    );
  }
  processMessage(message, queue) {
    const make = this.make;
    switch (message.type) {
      case 'sitespeedio.setup': {
        queue.postMessage(
          make('html.pug', {
            id: 'olapicWidgetPerformance',
            name: 'Olapic Widget',
            pug: this.pug,
            type: 'pageSummary',
          })
        );
        queue.postMessage(
          make('html.pug', {
            id: 'olapicWidgetPerformance',
            name: 'Olapic Widget',
            pug: this.pug,
            type: 'run',
          })
        );
        break;
      }
      case 'webpagetest.har':
      case 'browsertime.har': {
        const { data, group, url } = message;
        const { runs, summarized } = harAnalizer.analize(data);
        queue.postMessage(
          make('olapicWidgetPerformance.pageSummary', summarized, {
            group: group,
            url: url,
          })
        );
        runs.forEach((data, index) => {
          queue.postMessage(
            make('olapicWidgetPerformance.run', data, {
              group: group,
              url: url,
              runIndex: index,
            })
          );
        });
        break;
      }
    }
  }
}

module.exports = new OlapicPlugin();

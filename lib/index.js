'use strict';

const path = require('path');
const fs = require('fs');
const harAnalizer = require('./harAnalizer.js');

class OlapicPlugin {
  name() {
    return 'olapic-widget-perform';
  }
  open(context) {
    this.make = context.messageMaker('olapicWidgetPerform').make;
    this.log = context.intel.getLogger(
      'sitespeedio.plugin.olapicWidgetPerform'
    );

    this.pugSummary = fs.readFileSync(
      path.resolve(__dirname, 'pug', 'summary.pug'),
      'utf8'
    );
  }
  processMessage(message, queue) {
    const make = this.make;
    switch (message.type) {
      case 'sitespeedio.setup': {
        queue.postMessage(
          make('html.pug', {
            id: 'olapicWidgetPerform',
            name: 'Olapic Widget',
            pug: this.pugSummary,
            type: 'pageSummary',
          })
        );
        break;
      }
      case 'webpagetest.har':
      case 'browsertime.har': {
        const data = harAnalizer.analize(message.data);
        this.log.info('olapicWidgetPerform.pageSummary.');
        queue.postMessage(
          make('olapicWidgetPerform.pageSummary', data, {
            group: message.group,
            url: message.url,
          })
        );
      }
    }
  }
}

module.exports = new OlapicPlugin();

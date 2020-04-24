# olapicWidgetPerformance

sitespeed.io's plugin to evaluate the Olapic's widget performace.

Evaluate the requests made during the test to find those related with the Olapic's widget and sumarrice some data to evaluate its performace.

# How to use it

### Simple testing project.

* create a new NPM project and instal `sitespeed` and the plugin `olapic-widget-performance`

```
npm init -y
npm i sitespeed.io --save
```

* create the sitespeed's config file `./sitespeedio.config.json`.
```
{
  "browsertime": {
    "headless": true,
    "iterations": 1,
    "browser": "chrome"
  },
  "chrome": {
    "includeResponseBodies": "all"
  },
  "plugins": {
    "add": ["node-modules/olapicWidgetPerformance/lib"]
  }
}
```

* add a NPM script to run the `sitespeed`, on your `package.json`, include the following script:

```
"analizewidget": "sitespeed.io --config sitespeedio.config.json $SITE_URL",
```

* run the script with the env var `SITE_URL`

```
SITE_URL=https://olapic-widget-site.com/section.html npm run analizewidget
```

### Real implementation
Follow instructions on the [official doc site](https://www.sitespeed.io/documentation/sitespeed.io/plugins/#add-a-plugin).

# TODO
Keep improving data analysis.

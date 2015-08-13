module.exports = function(config) {
  config.set({

    basePath: './',

    files: [
      'bower_components/angular/angular.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-mocks/angular-mocks.js',
      "bower_components/angular-animate/angular-animate.js",
      "bower_components/angular-bootstrap/ui-bootstrap-tpls.js",
      'mosaic/mosaic.js',
      'mosaic/point.js',
      'mosaic/**/*.js'
    ],

    autoWatch: true,

    client: {
      captureConsole: true,
    },

    frameworks: ['jasmine'],

    browsers: ['Chrome'],

    plugins: [
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-jasmine',
      'karma-junit-reporter'
    ],

    junitReporter: {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};

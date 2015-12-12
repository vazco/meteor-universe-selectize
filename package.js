'use strict';

Package.describe({
    name: 'vazco:universe-selectize',
    summary: 'Universe Selectize input standalone - without autoform',
    version: '0.0.1',
    git: 'https://github.com/vazco/meteor-universe-selectize.git'
});

Package.onUse(function(api) {
    api.versionsFrom('1.0.4.2');

    api.use('templating');

    api.use(['underscore', 'reactive-var'], 'client');

    api.addFiles([
        'universe-selectize.html',
        'universe-selectize.js',
        'stylesheets/selectize.default.css',
        'stylesheets/universe-autoform-select.css'
    ], 'client');

    api.addAssets('img/loading.gif', 'client');
});

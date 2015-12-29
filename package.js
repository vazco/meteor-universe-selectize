'use strict';

Package.describe({
    name: 'vazco:universe-selectize',
    summary: 'Universe select input standalone - with the appearance as selectize. It is for use without autoform.',
    version: '0.0.10',
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
        'stylesheets/universe-selectize.css'
    ], 'client');

    api.addAssets('img/loading.gif', 'client');
});

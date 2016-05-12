'use strict';

Package.describe({
    name: 'vazco:universe-selectize',
    summary: 'Universe select input standalone - with the appearance as selectize. It is for use without autoform.',
    version: '0.1.20',
    git: 'https://github.com/vazco/meteor-universe-selectize.git'
});

Package.onUse(function(api) {
    api.versionsFrom('1.2.1');

    if (!api.addAssets) {
        api.addAssets = function (files, platform) {
            api.addFiles(files, platform, {isAsset: true});
        };
    }

    api.use(['ecmascript', 'templating', 'underscore', 'less', 'reactive-var'], 'client');

    api.addFiles([
        'universe-selectize.html',
        'universe-selectize.js',
        'stylesheets/selectize.default.less',
        'stylesheets/universe-selectize.less'
    ], 'client');

    api.addAssets('img/loading.gif', 'client');

    api.export(['UniSelectize'], 'client');
});

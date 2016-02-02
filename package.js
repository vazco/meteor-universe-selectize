'use strict';

Package.describe({
    name: 'vazco:universe-selectize',
    summary: 'Universe select input standalone - with the appearance as selectize. It is for use without autoform.',
    version: '0.1.3',
    git: 'https://github.com/vazco/meteor-universe-selectize.git'
});

Package.onUse(function(api) {
    if (!api.addAssets) {
        api.addAssets = function (files, platform) {
            api.addFiles(files, platform, {isAsset: true});
        };
    }

    api.use('ecmascript@0.1.6');
    api.use('less@2.5.1');
    api.use('templating@1.1.5');

    api.use(['underscore@1.0.4', 'reactive-var@1.0.6'], 'client');

    api.addFiles([
        'universe-selectize.html',
        'universe-selectize.js',
        'stylesheets/selectize.default.less',
        'stylesheets/universe-selectize.less'
    ], 'client');

    api.addAssets('img/loading.gif', 'client');

    api.export(['UniSelectize']);
});

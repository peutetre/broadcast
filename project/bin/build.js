/*
 * build.js
 */

var browserify = require('browserify'),
    watchify = require('watchify'),
    Q = require('q'),
    path = require('path'),
    fs = require('fs'),
    chokidar = require('chokidar'),

    w, // watchify instance
    watcher, // chokidar watcher instance

    src = path.join(__dirname, '../src/app.js'),
    settingsJSON = path.join(__dirname, 'settings.json'),
    out = path.join(__dirname, '../www/main.js'),
    www = path.join(__dirname, '../www');

function log(o) { if(o) console.log('- browserify - ' + o); }

function rejectOnError(d) {
    return function (err) { log(err); if(err) d.reject(err); };
}

function bundle(conf) {
    var defer = Q.defer(),
        b = browserify(watchify.args);

    if(fs.existsSync(settingsJSON)) fs.unlinkSync(settingsJSON);
    if(fs.existsSync(out)) fs.unlinkSync(out);

    fs.writeFileSync(settingsJSON, JSON.stringify(conf), null, 2);

    var ws = fs.createWriteStream(out);

    b.add(src)
        .exclude('settings')
        .require(settingsJSON, { expose: 'settings' })
        .bundle()
        .pipe(ws);

    b.on('error', rejectOnError(defer));
    ws.on('finish', function() { ws.end(); defer.resolve(b); });

    return defer.promise;
}

function run(conf, f){
    return bundle(conf).then(function (b) {
        w = watchify(b);

        b.bundle(function () { w.on('log', log); });

        w.on('update', function () {
            var ws = fs.createWriteStream(out);

            w.bundle().pipe(ws);

            ws.on('finish', function() { ws.end(); f(out); });
        });
        return w;
    });
}

module.exports.build = function build(platform, localSettings, config) {
    return bundle(localSettings.configurations[platform][config]);
};

module.exports.watch = function watch(f, localSettings, platform, config, confEmitter) {
    run(localSettings.configurations[platform][config], f).then(function () {
        watcher = chokidar.watch(www, { ignored: /main\.js/, persistent: true });

        setTimeout(function () {
            watcher.on('all', function (evt, p) { f(p); });
        }, 4000);

        confEmitter.on('change', function (conf) {
            fs.writeFileSync(settingsJSON, JSON.stringify(conf), null, 2);
        });
    });
};

module.exports.close = function () {
    if(w) w.close();
    if(watcher) watcher.close();
};

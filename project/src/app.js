var Q = require('q'),
    http = require('http'),
    qstart = require('qstart'),
    settings = require('settings'),
    $ = function (s) { return document.querySelector(s); },
    dashboard = require('./dashboard');

function init() {
    try {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    } catch(err) { }

    window.addEventListener('native.keyboardhide', function () {
        cordova.plugins.Keyboard.disableScroll(false);
    });

    var push = PushNotification.init({
        android: {
            senderID: settings.senderID,
            icon: settings.drawableName,
            iconColor: settings.iconColor,
            sound: true
        },
        ios: {
            sound: true,
            alert: true,
            badge: true
        }
    });

    push.on('registration', function(data) {
        var options = {
                protocol: 'http:',
                host: settings.hostname,
                port: settings.port,
                path: '/subscribe',
                method: 'post'
            },
            req = http.request(options, function (res) {
                res.on('end', function () {
                    window.plugins.toast.showWithOptions({
                        message: "Registration done!",
                        duration: "short",
                        position: "top",
                        addPixelsY: -20
                    });
                });
            });

        req.on('error', function(e) {
            window.plugins.toast.showWithOptions({
                message: 'problem with request: ' + e.message,
                duration: "short",
                position: "top",
                addPixelsY: -20
            });
        });

        req.write(JSON.stringify({
            id: data.registrationId,
            platform: cordova.platformId
        }));
        req.end();
    });

    dashboard.setPush(push);

    return Q.delay(500).then(function () {
        navigator.splashscreen.hide();
    });
}

qstart
    .then(function () { return init(); })
    .then(dashboard.init);

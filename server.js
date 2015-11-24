var path = require('path'),
    Hapi = require('hapi'),
    Boom = require('boom'),
    fs = require('fs'),
    gcm = require('node-gcm'),
    apn = require('apn'),
    settings = require(path.resolve(__dirname, 'settings.json')),
    senderAndroid = new gcm.Sender(settings.android.apiKey),
    apnConnection = new apn.Connection({ passphrase: settings.ios.passphrase });
    server = new Hapi.Server(),
    ids = {
        ios: [],
        android: []
    };

function send(opt) {
    var isHabib = /.*(habib|Habib).*/.test(opt.body);

     ids.ios.forEach(function (token) {
        var d = new apn.Device(token),
            notif = new apn.Notification();
        notif.expiry = Math.floor(Date.now() / 1000) + 3600;
        notif.sound = isHabib ? 'www/habib.caf': '';
        notif.alert = opt.title + ' ' + opt.body;
        apnConnection.pushNotification(notif, d);
    });

    var message = new gcm.Message({
        priority: 'high',
        notification: {
            title: opt.title,
            body: opt.body,
            icon: 'notif',
            sound: isHabib ? 'habib': ''
        }
    });

    return new Promise(function (resolve, reject) {
        if(!ids.android.length) {
            resolve();
            return;
        }
        senderAndroid.send(message, ids.android, (err, result) => {
            if(err) reject(err);
            else resolve(result);
        });
    });
}

function log(pl) {
    return v => console.log('push title: %s body: %s', pl.title, pl.body);
}

server.connection({ port: process.env.PORT || 3000 });

server.route({
    method: 'POST',
    path: '/',
    handler: function (req, reply) {
        return send({
            title: req.payload.title,
            body: req.payload.body
        })
        .then(log(req.payload))
        .then(v => reply(200));
    }
});

server.route({
    method: 'POST',
    path: '/subscribe',
    handler: function (req, reply) {
        var id = req.payload.id,
            platform = req.payload.platform;
        if(!id || ['android', 'ios'].indexOf(platform) == -1 )
            return reply(Boom.badRequest('Unsupported parameter'));
        if(ids[platform].indexOf(id) < 0) {
            ids[platform].push(id);
            console.log('registred...');
        } else {
            console.log('already registred...');
        }
        return reply(200);
    }
});

server.start(function () {
    console.log('Starting broadcast server...');
    console.log('node version: ', process.version);
    console.log('Server running at:', server.info.uri);
});

var $ = function (s) { return document.querySelector(s); },
    Mbutton = require('mobile-button'),
    http = require('http'),
    format = require('util').format,
    querystring = require('querystring'),
    settings = require('settings'),
    msgList = null,
    uriReg = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;

var sendMsg = function(msg) {

    var postData = querystring.stringify({
            'body' : msg,
            'title': ''
        }),
        options = {
            protocol: 'http:',
            host: settings.hostname,
            port: settings.port,
            path: '/',
            method: 'post',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': postData.length
            }
        },
        req = http.request(options, function (res) {
            res.on('end', function () {
                window.plugins.toast.showWithOptions({
                    message: 'push sended',
                    duration: 'short',
                    position: "top",
                    addPixelsY: -20
                });
            });
        });

    req.on('error', function(e) {
        window.plugins.toast.showWithOptions({
            message: 'problem with request: ' + e.message,
            duration: 'short',
            position: "top",
            addPixelsY: -20
        });
    });

    req.write(postData);
    req.end();
};

var urlify = function (txt) {
    var tmpl = "<a href='#' onclick=\"cordova.InAppBrowser.open('%s', '_blank');\"> %s... </a>";
    return txt.split(' ').reduce(function (rslt, word) {
        var w = word.substring(0, 30),
            t = uriReg.exec(word);
        rslt.push(!t ? w : format(tmpl, t[0], w));
        return rslt;
    }, []).join(' ');
}

module.exports = {
    setPush : function (pObj) {
        pObj.on('notification', function(data) {
            msgList.insertAdjacentHTML(
                'afterbegin',
                '<li><div class="list-item-ctn">' + urlify(data.message) + '</div></li>'
            );
        });

        pObj.on('error', function(e) {
            msgList.insertAdjacentHTML(
               'afterbegin',
               '<li><div class="list-item-ctn">' + e.message + '</div></li>'
            );
        });
    },
    init: function () {
        msgList = $('#msgListId');
        var msgTxt = $('#msgText'),
            sendBtn = $('#sendBtn'),
            clearBtn = $('#clear-btn');

        var btnSend = new Mbutton.Touchend({
            el: sendBtn,
            f: function () {
                if(msgTxt.value) {
                    sendMsg(msgTxt.value);
                    msgTxt.value = "";
                }
            },
            activeBorder: 40,
            autobind: true
        });

        var btnClear = new Mbutton.Touchend({
            el: clearBtn,
            f: function () {
                msgList.innerHTML = "";
            },
            activeBorder: 40,
            autobind: true
        });
    }
};

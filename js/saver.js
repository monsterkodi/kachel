// koffee 1.4.0

/*
 0000000   0000000   000   000  00000000  00000000 
000       000   000  000   000  000       000   000
0000000   000000000   000 000   0000000   0000000  
     000  000   000     000     000       000   000
0000000   000   000      0      00000000  000   000
 */
var Kachel, Saver, _, electron, elem, klog, kpos, os, post, prefs, ref, sh, slash, sw, wxw,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), sw = ref.sw, sh = ref.sh, os = ref.os, slash = ref.slash, post = ref.post, kpos = ref.kpos, prefs = ref.prefs, klog = ref.klog, elem = ref.elem, _ = ref._;

Kachel = require('./kachel');

wxw = require('wxw');

electron = require('electron');

Saver = (function(superClass) {
    extend(Saver, superClass);

    function Saver(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'saver';
        this.onContextMenu = bind(this.onContextMenu, this);
        this.onLeftClick = bind(this.onLeftClick, this);
        this.onSaverClose = bind(this.onSaverClose, this);
        this.check = bind(this.check, this);
        this.onData = bind(this.onData, this);
        this.onShow = bind(this.onShow, this);
        this.onLoad = bind(this.onLoad, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Saver.__super__.constructor.apply(this, arguments);
        this.last = Date.now();
        this.taskbar = false;
        this.saver = null;
        this.minutes = prefs.get('saver▸timeout', 5);
        this.interval = parseInt(1000 * 60 * this.minutes);
    }

    Saver.prototype.onLoad = function() {
        this.main.appendChild(elem('img', {
            "class": 'kachelImg',
            src: __dirname + '/../img/saver.png'
        }));
        this.startCheck();
        this.requestData('mouse');
        return this.requestData('keyboard');
    };

    Saver.prototype.onShow = function() {
        return this.startCheck();
    };

    Saver.prototype.onData = function(data) {
        return this.last = Date.now();
    };

    Saver.prototype.startCheck = function(ms) {
        if (ms == null) {
            ms = this.interval;
        }
        clearTimeout(this.checkTimer);
        return this.checkTimer = setTimeout(this.check, ms);
    };

    Saver.prototype.check = function() {
        var elapsed, now;
        if (!this.win.isVisible()) {
            return;
        }
        now = Date.now();
        elapsed = now - this.last;
        if (elapsed > this.interval) {
            return this.onLeftClick();
        } else {
            return this.startCheck(Math.max(100, this.interval - elapsed));
        }
    };

    Saver.prototype.onSaverClose = function() {
        this.saver = null;
        this.last = Date.now();
        this.startCheck();
        if (this.taskbar) {
            wxw('taskbar', 'show');
            return this.taskbar = false;
        }
    };

    Saver.prototype.onLeftClick = function() {
        var code, data, height, html, info, offset, wa, width;
        if (os.platform() === 'win32') {
            info = wxw('info', 'taskbar')[0];
            if (info.status !== 'hidden') {
                wxw('taskbar', 'hide');
                this.taskbar = true;
            } else {
                this.taskbar = false;
            }
        }
        clearTimeout(this.checkTimer);
        this.checkTimer = null;
        if (os.platform() === 'win32') {
            wa = wxw('screen', 'size');
            width = wa.width;
            height = wa.height;
        } else {
            width = electron.remote.screen.getPrimaryDisplay().workAreaSize.width;
            height = electron.remote.screen.getPrimaryDisplay().workAreaSize.height;
        }
        offset = 0;
        if (os.platform() === 'darwin' && parseInt(os.release().split('.')[0]) >= 18) {
            offset = 4;
        }
        this.saver = new electron.remote.BrowserWindow({
            x: 0,
            y: -offset,
            width: width,
            minWidth: width,
            minHeight: height + offset,
            height: height + offset,
            backgroundColor: '#01000000',
            resizable: false,
            maximizable: false,
            minimizable: false,
            thickFrame: false,
            frame: false,
            fullscreen: false,
            fullscreenenable: false,
            alwaysOnTop: true,
            enableLargerThanScreen: true,
            transparent: true,
            acceptFirstMouse: true,
            closable: true,
            show: true,
            webPreferences: {
                nodeIntegration: true
            }
        });
        code = 'krkkl';
        html = "<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\">\n    <meta http-equiv=\"Content-Security-Policy\" content=\"default-src * 'unsafe-inline' 'unsafe-eval'\">\n  </head>\n  <body tabindex=0 style=\"overflow: hidden; padding:0; margin:0; cursor: none; pointer-events: all; position: absolute; left: 0; top: 0; right: 0; bottom: 0;\">\n  </body>\n  <script>\n    Saver = require(\"./" + code + ".js\");\n    new Saver({});\n  </script>\n</html>";
        data = "data:text/html;charset=utf-8," + encodeURI(html);
        this.saver.loadURL(data, {
            baseURLForDataURL: slash.fileUrl(__dirname + '/index.html')
        });
        this.saver.on('close', this.onSaverClose);
        return this.saver.focus();
    };

    Saver.prototype.onContextMenu = function() {
        return klog('saverOptions');
    };

    return Saver;

})(Kachel);

module.exports = Saver;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZXIuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLHNGQUFBO0lBQUE7Ozs7QUFRQSxNQUEwRCxPQUFBLENBQVEsS0FBUixDQUExRCxFQUFFLFdBQUYsRUFBTSxXQUFOLEVBQVUsV0FBVixFQUFjLGlCQUFkLEVBQXFCLGVBQXJCLEVBQTJCLGVBQTNCLEVBQWlDLGlCQUFqQyxFQUF3QyxlQUF4QyxFQUE4QyxlQUE5QyxFQUFvRDs7QUFFcEQsTUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLEdBQUEsR0FBVyxPQUFBLENBQVEsS0FBUjs7QUFDWCxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBRUw7OztJQUVDLGVBQUMsR0FBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsa0RBQVM7Ozs7Ozs7O1FBRVYsMkdBQUEsU0FBQTtRQUVBLElBQUMsQ0FBQSxJQUFELEdBQVksSUFBSSxDQUFDLEdBQUwsQ0FBQTtRQUNaLElBQUMsQ0FBQSxPQUFELEdBQVk7UUFDWixJQUFDLENBQUEsS0FBRCxHQUFZO1FBQ1osSUFBQyxDQUFBLE9BQUQsR0FBWSxLQUFLLENBQUMsR0FBTixDQUFVLGVBQVYsRUFBMEIsQ0FBMUI7UUFDWixJQUFDLENBQUEsUUFBRCxHQUFZLFFBQUEsQ0FBUyxJQUFBLEdBQU8sRUFBUCxHQUFZLElBQUMsQ0FBQSxPQUF0QjtJQVJiOztvQkFVSCxNQUFBLEdBQVEsU0FBQTtRQUVKLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixJQUFBLENBQUssS0FBTCxFQUFXO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxXQUFOO1lBQWtCLEdBQUEsRUFBSSxTQUFBLEdBQVksbUJBQWxDO1NBQVgsQ0FBbEI7UUFFQSxJQUFDLENBQUEsVUFBRCxDQUFBO1FBRUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxPQUFiO2VBQ0EsSUFBQyxDQUFBLFdBQUQsQ0FBYSxV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MCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwIFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgIDAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG4jIyNcblxueyBzdywgc2gsIG9zLCBzbGFzaCwgcG9zdCwga3BvcywgcHJlZnMsIGtsb2csIGVsZW0sIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuS2FjaGVsICAgPSByZXF1aXJlICcuL2thY2hlbCdcbnd4dyAgICAgID0gcmVxdWlyZSAnd3h3J1xuZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcblxuY2xhc3MgU2F2ZXIgZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonc2F2ZXInKSAtPiBcbiAgICBcbiAgICAgICAgc3VwZXJcbiAgICBcbiAgICAgICAgQGxhc3QgICAgID0gRGF0ZS5ub3coKVxuICAgICAgICBAdGFza2JhciAgPSBmYWxzZVxuICAgICAgICBAc2F2ZXIgICAgPSBudWxsXG4gICAgICAgIEBtaW51dGVzICA9IHByZWZzLmdldCAnc2F2ZXLilrh0aW1lb3V0JyA1XG4gICAgICAgIEBpbnRlcnZhbCA9IHBhcnNlSW50IDEwMDAgKiA2MCAqIEBtaW51dGVzXG4gICAgICAgIFxuICAgIG9uTG9hZDogPT5cbiAgICAgICAgXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGVsZW0gJ2ltZycgY2xhc3M6J2thY2hlbEltZycgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL3NhdmVyLnBuZydcbiAgICAgICAgXG4gICAgICAgIEBzdGFydENoZWNrKClcbiAgICAgICAgXG4gICAgICAgIEByZXF1ZXN0RGF0YSAnbW91c2UnICAgXG4gICAgICAgIEByZXF1ZXN0RGF0YSAna2V5Ym9hcmQnXG4gICAgXG4gICAgb25TaG93OiA9PiBAc3RhcnRDaGVjaygpXG4gICAgICAgIFxuICAgIG9uRGF0YTogKGRhdGEpID0+IEBsYXN0ID0gRGF0ZS5ub3coKVxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBzdGFydENoZWNrOiAobXM9QGludGVydmFsKSAtPiBcbiAgICAgICAgXG4gICAgICAgIGNsZWFyVGltZW91dCBAY2hlY2tUaW1lclxuICAgICAgICBAY2hlY2tUaW1lciA9IHNldFRpbWVvdXQgQGNoZWNrLCBtc1xuICAgICAgICBcbiAgICBjaGVjazogPT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgQHdpbi5pc1Zpc2libGUoKVxuICAgICAgICBcbiAgICAgICAgbm93ID0gRGF0ZS5ub3coKVxuICAgICAgICBcbiAgICAgICAgZWxhcHNlZCA9IG5vdyAtIEBsYXN0XG4gICAgICAgIFxuICAgICAgICBpZiBlbGFwc2VkID4gQGludGVydmFsXG4gICAgICAgICAgICBAb25MZWZ0Q2xpY2soKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc3RhcnRDaGVjayBNYXRoLm1heCAxMDAsIEBpbnRlcnZhbCAtIGVsYXBzZWRcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBvblNhdmVyQ2xvc2U6ID0+XG4gICAgICAgIFxuICAgICAgICBAc2F2ZXIgPSBudWxsXG4gICAgICAgIEBsYXN0ID0gRGF0ZS5ub3coKVxuICAgICAgICBAc3RhcnRDaGVjaygpXG4gICAgICAgIGlmIEB0YXNrYmFyXG4gICAgICAgICAgICB3eHcgJ3Rhc2tiYXInICdzaG93J1xuICAgICAgICAgICAgQHRhc2tiYXIgPSBmYWxzZVxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIG9uTGVmdENsaWNrOiA9PiBcbiAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICBpbmZvID0gd3h3KCdpbmZvJyAndGFza2JhcicpWzBdXG4gICAgICAgICAgICBpZiBpbmZvLnN0YXR1cyAhPSAnaGlkZGVuJ1xuICAgICAgICAgICAgICAgIHd4dyAndGFza2JhcicgJ2hpZGUnXG4gICAgICAgICAgICAgICAgQHRhc2tiYXIgPSB0cnVlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQHRhc2tiYXIgPSBmYWxzZVxuICAgICAgICBcbiAgICAgICAgY2xlYXJUaW1lb3V0IEBjaGVja1RpbWVyXG4gICAgICAgIEBjaGVja1RpbWVyID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICB3YSA9IHd4dyAnc2NyZWVuJyAnc2l6ZSdcbiAgICAgICAgICAgIHdpZHRoICA9IHdhLndpZHRoXG4gICAgICAgICAgICBoZWlnaHQgPSB3YS5oZWlnaHRcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgd2lkdGggID0gZWxlY3Ryb24ucmVtb3RlLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhU2l6ZS53aWR0aFxuICAgICAgICAgICAgaGVpZ2h0ID0gZWxlY3Ryb24ucmVtb3RlLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhU2l6ZS5oZWlnaHRcbiAgICAgICAgXG4gICAgICAgIG9mZnNldCA9IDBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnZGFyd2luJyBhbmQgcGFyc2VJbnQob3MucmVsZWFzZSgpLnNwbGl0KCcuJylbMF0pID49IDE4XG4gICAgICAgICAgICBvZmZzZXQgPSA0ICMgdHJ5IHRvIGdldCByaWQgb2YgdWdseSB0b3AgZnJhbWUgYm9yZGVyXG4gICAgICAgIFxuICAgICAgICBAc2F2ZXIgPSBuZXcgZWxlY3Ryb24ucmVtb3RlLkJyb3dzZXJXaW5kb3dcbiAgICAgICAgICAgIHg6ICAgICAgICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIHk6ICAgICAgICAgICAgICAgICAgICAgIC1vZmZzZXRcbiAgICAgICAgICAgIHdpZHRoOiAgICAgICAgICAgICAgICAgIHdpZHRoXG4gICAgICAgICAgICBtaW5XaWR0aDogICAgICAgICAgICAgICB3aWR0aFxuICAgICAgICAgICAgbWluSGVpZ2h0OiAgICAgICAgICAgICAgaGVpZ2h0K29mZnNldFxuICAgICAgICAgICAgaGVpZ2h0OiAgICAgICAgICAgICAgICAgaGVpZ2h0K29mZnNldFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAgICAgICAgJyMwMTAwMDAwMCdcbiAgICAgICAgICAgIHJlc2l6YWJsZTogICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBtYXhpbWl6YWJsZTogICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgbWluaW1pemFibGU6ICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIHRoaWNrRnJhbWU6ICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBmcmFtZTogICAgICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgZnVsbHNjcmVlbjogICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIGZ1bGxzY3JlZW5lbmFibGU6ICAgICAgIGZhbHNlXG4gICAgICAgICAgICBhbHdheXNPblRvcDogICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICBlbmFibGVMYXJnZXJUaGFuU2NyZWVuOiB0cnVlXG4gICAgICAgICAgICB0cmFuc3BhcmVudDogICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICBhY2NlcHRGaXJzdE1vdXNlOiAgICAgICB0cnVlXG4gICAgICAgICAgICBjbG9zYWJsZTogICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICBzaG93OiAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICB3ZWJQcmVmZXJlbmNlczogXG4gICAgICAgICAgICAgICAgbm9kZUludGVncmF0aW9uOiB0cnVlXG4gICAgICAgICAgICAgICBcbiAgICAgICAgY29kZSA9ICdrcmtrbCdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaHRtbCA9IFwiXCJcIlxuICAgICAgICAgICAgPCFET0NUWVBFIGh0bWw+XG4gICAgICAgICAgICA8aHRtbCBsYW5nPVwiZW5cIj5cbiAgICAgICAgICAgICAgPGhlYWQ+XG4gICAgICAgICAgICAgICAgPG1ldGEgY2hhcnNldD1cInV0Zi04XCI+XG4gICAgICAgICAgICAgICAgPG1ldGEgaHR0cC1lcXVpdj1cIkNvbnRlbnQtU2VjdXJpdHktUG9saWN5XCIgY29udGVudD1cImRlZmF1bHQtc3JjICogJ3Vuc2FmZS1pbmxpbmUnICd1bnNhZmUtZXZhbCdcIj5cbiAgICAgICAgICAgICAgPC9oZWFkPlxuICAgICAgICAgICAgICA8Ym9keSB0YWJpbmRleD0wIHN0eWxlPVwib3ZlcmZsb3c6IGhpZGRlbjsgcGFkZGluZzowOyBtYXJnaW46MDsgY3Vyc29yOiBub25lOyBwb2ludGVyLWV2ZW50czogYWxsOyBwb3NpdGlvbjogYWJzb2x1dGU7IGxlZnQ6IDA7IHRvcDogMDsgcmlnaHQ6IDA7IGJvdHRvbTogMDtcIj5cbiAgICAgICAgICAgICAgPC9ib2R5PlxuICAgICAgICAgICAgICA8c2NyaXB0PlxuICAgICAgICAgICAgICAgIFNhdmVyID0gcmVxdWlyZShcIi4vI3tjb2RlfS5qc1wiKTtcbiAgICAgICAgICAgICAgICBuZXcgU2F2ZXIoe30pO1xuICAgICAgICAgICAgICA8L3NjcmlwdD5cbiAgICAgICAgICAgIDwvaHRtbD5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgICAgICBkYXRhID0gXCJkYXRhOnRleHQvaHRtbDtjaGFyc2V0PXV0Zi04LFwiICsgZW5jb2RlVVJJIGh0bWxcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQHNhdmVyLmxvYWRVUkwgZGF0YSwgYmFzZVVSTEZvckRhdGFVUkw6c2xhc2guZmlsZVVybCBfX2Rpcm5hbWUgKyAnL2luZGV4Lmh0bWwnXG4gICAgICAgIEBzYXZlci5vbiAnY2xvc2UnIEBvblNhdmVyQ2xvc2VcbiAgICAgICAgQHNhdmVyLmZvY3VzKClcbiAgICAgICAgXG4gICAgb25Db250ZXh0TWVudTogPT4ga2xvZyAnc2F2ZXJPcHRpb25zJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNhdmVyXG4iXX0=
//# sourceURL=../coffee/saver.coffee
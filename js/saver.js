// koffee 1.3.0

/*
 0000000   0000000   000   000  00000000  00000000 
000       000   000  000   000  000       000   000
0000000   000000000   000 000   0000000   0000000  
     000  000   000     000     000       000   000
0000000   000   000      0      00000000  000   000
 */
var Kachel, Saver, _, electron, elem, klog, kpos, os, post, ref, sh, slash, sw, wxw,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), sw = ref.sw, sh = ref.sh, os = ref.os, slash = ref.slash, post = ref.post, kpos = ref.kpos, klog = ref.klog, elem = ref.elem, _ = ref._;

Kachel = require('./kachel');

wxw = require('wxw');

electron = require('electron');

Saver = (function(superClass) {
    extend(Saver, superClass);

    function Saver(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'saver';
        this.onContextMenu = bind(this.onContextMenu, this);
        this.onClick = bind(this.onClick, this);
        this.onSaverClose = bind(this.onSaverClose, this);
        this.check = bind(this.check, this);
        this.onData = bind(this.onData, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Saver.__super__.constructor.apply(this, arguments);
        this.last = Date.now();
        this.taskbar = false;
        this.saver = null;
        this.minutes = 5;
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

    Saver.prototype.onData = function(data) {
        return this.last = Date.now();
    };

    Saver.prototype.startCheck = function(ms) {
        if (ms == null) {
            ms = this.interval;
        }
        return this.checkTimer = setTimeout(this.check, ms);
    };

    Saver.prototype.check = function() {
        var elapsed, now;
        now = Date.now();
        elapsed = now - this.last;
        if (elapsed > this.interval) {
            return this.onClick();
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

    Saver.prototype.onClick = function() {
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
        wa = wxw('screen', 'size');
        width = wa.width;
        height = wa.height;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZXIuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLCtFQUFBO0lBQUE7Ozs7QUFRQSxNQUFtRCxPQUFBLENBQVEsS0FBUixDQUFuRCxFQUFFLFdBQUYsRUFBTSxXQUFOLEVBQVUsV0FBVixFQUFjLGlCQUFkLEVBQXFCLGVBQXJCLEVBQTJCLGVBQTNCLEVBQWlDLGVBQWpDLEVBQXVDLGVBQXZDLEVBQTZDOztBQUU3QyxNQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBQ1gsR0FBQSxHQUFXLE9BQUEsQ0FBUSxLQUFSOztBQUNYLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFFTDs7O0lBRUMsZUFBQyxHQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxrREFBUzs7Ozs7O1FBRVYsMkdBQUEsU0FBQTtRQUVBLElBQUMsQ0FBQSxJQUFELEdBQVksSUFBSSxDQUFDLEdBQUwsQ0FBQTtRQUNaLElBQUMsQ0FBQSxPQUFELEdBQVk7UUFDWixJQUFDLENBQUEsS0FBRCxHQUFZO1FBQ1osSUFBQyxDQUFBLE9BQUQsR0FBWTtRQUNaLElBQUMsQ0FBQSxRQUFELEdBQVksUUFBQSxDQUFTLElBQUEsR0FBTyxFQUFQLEdBQVksSUFBQyxDQUFBLE9BQXRCO0lBUmI7O29CQVVILE1BQUEsR0FBUSxTQUFBO1FBRUosSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLElBQUEsQ0FBSyxLQUFMLEVBQVc7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFdBQU47WUFBa0IsR0FBQSxFQUFJLFNBQUEsR0FBWSxtQkFBbEM7U0FBWCxDQUFsQjtRQUVBLElBQUMsQ0FBQSxVQUFELENBQUE7UUFFQSxJQUFDLENBQUEsV0FBRCxDQUFhLE9BQWI7ZUFDQSxJQUFDLENBQUEsV0FBRCxDQUFhLFVBQWI7SUFQSTs7b0JBU1IsTUFBQSxHQUFRLFNBQUMsSUFBRDtlQUFVLElBQUMsQ0FBQSxJ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Q0k7Z0JBQUEsZUFBQSxFQUFpQixJQUFqQjthQXJCSjtTQURLO1FBd0JULElBQUEsR0FBTztRQUVQLElBQUEsR0FBTyx1WkFBQSxHQVVzQixJQVZ0QixHQVUyQjtRQU1sQyxJQUFBLEdBQU8sK0JBQUEsR0FBa0MsU0FBQSxDQUFVLElBQVY7UUFFekMsSUFBQyxDQUFBLEtBQUssQ0FBQyxPQUFQLENBQWUsSUFBZixFQUFxQjtZQUFBLGlCQUFBLEVBQWtCLEtBQUssQ0FBQyxPQUFOLENBQWMsU0FBQSxHQUFZLGFBQTFCLENBQWxCO1NBQXJCO1FBQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFQLENBQVUsT0FBVixFQUFrQixJQUFDLENBQUEsWUFBbkI7ZUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLEtBQVAsQ0FBQTtJQXBFSzs7b0JBc0VULGFBQUEsR0FBZSxTQUFBO2VBQUcsSUFBQSxDQUFLLGNBQUw7SUFBSDs7OztHQXJJQzs7QUF1SXBCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgXG4gICAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAgICAwMDAgICAwMDAgICAgICAwICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgc3csIHNoLCBvcywgc2xhc2gsIHBvc3QsIGtwb3MsIGtsb2csIGVsZW0sIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuS2FjaGVsICAgPSByZXF1aXJlICcuL2thY2hlbCdcbnd4dyAgICAgID0gcmVxdWlyZSAnd3h3J1xuZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcblxuY2xhc3MgU2F2ZXIgZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonc2F2ZXInKSAtPiBcbiAgICBcbiAgICAgICAgc3VwZXJcbiAgICBcbiAgICAgICAgQGxhc3QgICAgID0gRGF0ZS5ub3coKVxuICAgICAgICBAdGFza2JhciAgPSBmYWxzZVxuICAgICAgICBAc2F2ZXIgICAgPSBudWxsXG4gICAgICAgIEBtaW51dGVzICA9IDVcbiAgICAgICAgQGludGVydmFsID0gcGFyc2VJbnQgMTAwMCAqIDYwICogQG1pbnV0ZXNcbiAgICAgICAgXG4gICAgb25Mb2FkOiAtPlxuICAgICAgICBcbiAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgZWxlbSAnaW1nJyBjbGFzczona2FjaGVsSW1nJyBzcmM6X19kaXJuYW1lICsgJy8uLi9pbWcvc2F2ZXIucG5nJ1xuICAgICAgICBcbiAgICAgICAgQHN0YXJ0Q2hlY2soKVxuICAgICAgICBcbiAgICAgICAgQHJlcXVlc3REYXRhICdtb3VzZScgICBcbiAgICAgICAgQHJlcXVlc3REYXRhICdrZXlib2FyZCdcbiAgICBcbiAgICBvbkRhdGE6IChkYXRhKSA9PiBAbGFzdCA9IERhdGUubm93KClcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgc3RhcnRDaGVjazogKG1zPUBpbnRlcnZhbCkgLT4gQGNoZWNrVGltZXIgPSBzZXRUaW1lb3V0IEBjaGVjaywgbXNcbiAgICAgICAgXG4gICAgY2hlY2s6ID0+XG4gICAgICAgIFxuICAgICAgICBub3cgPSBEYXRlLm5vdygpXG4gICAgICAgIFxuICAgICAgICBlbGFwc2VkID0gbm93IC0gQGxhc3RcbiAgICAgICAgXG4gICAgICAgIGlmIGVsYXBzZWQgPiBAaW50ZXJ2YWxcbiAgICAgICAgICAgIEBvbkNsaWNrKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHN0YXJ0Q2hlY2sgTWF0aC5tYXggMTAwLCBAaW50ZXJ2YWwgLSBlbGFwc2VkXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgb25TYXZlckNsb3NlOiA9PlxuICAgICAgICBcbiAgICAgICAgQHNhdmVyID0gbnVsbFxuICAgICAgICBAbGFzdCA9IERhdGUubm93KClcbiAgICAgICAgQHN0YXJ0Q2hlY2soKVxuICAgICAgICBpZiBAdGFza2JhclxuICAgICAgICAgICAgd3h3ICd0YXNrYmFyJyAnc2hvdydcbiAgICAgICAgICAgIEB0YXNrYmFyID0gZmFsc2VcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBvbkNsaWNrOiA9PiBcbiAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICBpbmZvID0gd3h3KCdpbmZvJyAndGFza2JhcicpWzBdXG4gICAgICAgICAgICBpZiBpbmZvLnN0YXR1cyAhPSAnaGlkZGVuJ1xuICAgICAgICAgICAgICAgIHd4dyAndGFza2JhcicgJ2hpZGUnXG4gICAgICAgICAgICAgICAgQHRhc2tiYXIgPSB0cnVlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQHRhc2tiYXIgPSBmYWxzZVxuICAgICAgICBcbiAgICAgICAgY2xlYXJUaW1lb3V0IEBjaGVja1RpbWVyXG4gICAgICAgIEBjaGVja1RpbWVyID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgd2EgPSB3eHcgJ3NjcmVlbicgJ3NpemUnXG4gICAgICAgIFxuICAgICAgICB3aWR0aCAgPSB3YS53aWR0aFxuICAgICAgICBoZWlnaHQgPSB3YS5oZWlnaHRcbiAgICAgICAgXG4gICAgICAgIG9mZnNldCA9IDBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnZGFyd2luJyBhbmQgcGFyc2VJbnQob3MucmVsZWFzZSgpLnNwbGl0KCcuJylbMF0pID49IDE4XG4gICAgICAgICAgICBvZmZzZXQgPSA0ICMgdHJ5IHRvIGdldCByaWQgb2YgdWdseSB0b3AgZnJhbWUgYm9yZGVyXG4gICAgICAgIFxuICAgICAgICBAc2F2ZXIgPSBuZXcgZWxlY3Ryb24ucmVtb3RlLkJyb3dzZXJXaW5kb3dcbiAgICAgICAgICAgIHg6ICAgICAgICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIHk6ICAgICAgICAgICAgICAgICAgICAgIC1vZmZzZXRcbiAgICAgICAgICAgIHdpZHRoOiAgICAgICAgICAgICAgICAgIHdpZHRoXG4gICAgICAgICAgICBtaW5XaWR0aDogICAgICAgICAgICAgICB3aWR0aFxuICAgICAgICAgICAgbWluSGVpZ2h0OiAgICAgICAgICAgICAgaGVpZ2h0K29mZnNldFxuICAgICAgICAgICAgaGVpZ2h0OiAgICAgICAgICAgICAgICAgaGVpZ2h0K29mZnNldFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAgICAgICAgJyMwMTAwMDAwMCdcbiAgICAgICAgICAgIHJlc2l6YWJsZTogICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBtYXhpbWl6YWJsZTogICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgbWluaW1pemFibGU6ICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIHRoaWNrRnJhbWU6ICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBmcmFtZTogICAgICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgZnVsbHNjcmVlbjogICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIGZ1bGxzY3JlZW5lbmFibGU6ICAgICAgIGZhbHNlXG4gICAgICAgICAgICBhbHdheXNPblRvcDogICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICBlbmFibGVMYXJnZXJUaGFuU2NyZWVuOiB0cnVlXG4gICAgICAgICAgICB0cmFuc3BhcmVudDogICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICBhY2NlcHRGaXJzdE1vdXNlOiAgICAgICB0cnVlXG4gICAgICAgICAgICBjbG9zYWJsZTogICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICBzaG93OiAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICB3ZWJQcmVmZXJlbmNlczogXG4gICAgICAgICAgICAgICAgbm9kZUludGVncmF0aW9uOiB0cnVlXG4gICAgICAgICAgICAgICBcbiAgICAgICAgY29kZSA9ICdrcmtrbCdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaHRtbCA9IFwiXCJcIlxuICAgICAgICAgICAgPCFET0NUWVBFIGh0bWw+XG4gICAgICAgICAgICA8aHRtbCBsYW5nPVwiZW5cIj5cbiAgICAgICAgICAgICAgPGhlYWQ+XG4gICAgICAgICAgICAgICAgPG1ldGEgY2hhcnNldD1cInV0Zi04XCI+XG4gICAgICAgICAgICAgICAgPG1ldGEgaHR0cC1lcXVpdj1cIkNvbnRlbnQtU2VjdXJpdHktUG9saWN5XCIgY29udGVudD1cImRlZmF1bHQtc3JjICogJ3Vuc2FmZS1pbmxpbmUnICd1bnNhZmUtZXZhbCdcIj5cbiAgICAgICAgICAgICAgPC9oZWFkPlxuICAgICAgICAgICAgICA8Ym9keSB0YWJpbmRleD0wIHN0eWxlPVwib3ZlcmZsb3c6IGhpZGRlbjsgcGFkZGluZzowOyBtYXJnaW46MDsgY3Vyc29yOiBub25lOyBwb2ludGVyLWV2ZW50czogYWxsOyBwb3NpdGlvbjogYWJzb2x1dGU7IGxlZnQ6IDA7IHRvcDogMDsgcmlnaHQ6IDA7IGJvdHRvbTogMDtcIj5cbiAgICAgICAgICAgICAgPC9ib2R5PlxuICAgICAgICAgICAgICA8c2NyaXB0PlxuICAgICAgICAgICAgICAgIFNhdmVyID0gcmVxdWlyZShcIi4vI3tjb2RlfS5qc1wiKTtcbiAgICAgICAgICAgICAgICBuZXcgU2F2ZXIoe30pO1xuICAgICAgICAgICAgICA8L3NjcmlwdD5cbiAgICAgICAgICAgIDwvaHRtbD5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgICAgICBkYXRhID0gXCJkYXRhOnRleHQvaHRtbDtjaGFyc2V0PXV0Zi04LFwiICsgZW5jb2RlVVJJIGh0bWxcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQHNhdmVyLmxvYWRVUkwgZGF0YSwgYmFzZVVSTEZvckRhdGFVUkw6c2xhc2guZmlsZVVybCBfX2Rpcm5hbWUgKyAnL2luZGV4Lmh0bWwnXG4gICAgICAgIEBzYXZlci5vbiAnY2xvc2UnIEBvblNhdmVyQ2xvc2VcbiAgICAgICAgQHNhdmVyLmZvY3VzKClcbiAgICAgICAgXG4gICAgb25Db250ZXh0TWVudTogPT4ga2xvZyAnc2F2ZXJPcHRpb25zJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNhdmVyXG4iXX0=
//# sourceURL=../coffee/saver.coffee
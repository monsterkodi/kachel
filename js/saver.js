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
        this.onSaverClose = bind(this.onSaverClose, this);
        this.check = bind(this.check, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Saver.__super__.constructor.apply(this, arguments);
        this.taskbar = false;
        this.saver = null;
        this.minutes = 10;
        this.interval = 1000 * 60 * this.minutes;
    }

    Saver.prototype.onLoad = function() {
        this.main.appendChild(elem('img', {
            "class": 'kachelImg',
            src: __dirname + '/../img/saver.png'
        }));
        this.startCheck();
        post.toMain('requestData', 'mouse', this.id);
        return post.toMain('requestData', 'keyboard', this.id);
    };

    Saver.prototype.startCheck = function() {
        return this.checkTimer = setTimeout(this.check, this.interval);
    };

    Saver.prototype.check = function() {
        klog('check');
        return this.startCheck();
    };

    Saver.prototype.onSaverClose = function() {
        this.saver = null;
        this.startCheck();
        if (this.taskbar) {
            wxw('taskbar', 'show');
            return this.taskbar = false;
        }
    };

    Saver.prototype.onClick = function() {
        var code, data, height, html, info, offset, wa, width;
        info = wxw('info', 'taskbar')[0];
        if (info.status !== 'hidden') {
            wxw('taskbar', 'hide');
            this.taskbar = true;
        } else {
            this.taskbar = false;
        }
        clearInterval(this.check);
        this.check = null;
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
        code = 'saverdefault';
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZXIuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLCtFQUFBO0lBQUE7Ozs7QUFRQSxNQUFtRCxPQUFBLENBQVEsS0FBUixDQUFuRCxFQUFFLFdBQUYsRUFBTSxXQUFOLEVBQVUsV0FBVixFQUFjLGlCQUFkLEVBQXFCLGVBQXJCLEVBQTJCLGVBQTNCLEVBQWlDLGVBQWpDLEVBQXVDLGVBQXZDLEVBQTZDOztBQUU3QyxNQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBQ1gsR0FBQSxHQUFXLE9BQUEsQ0FBUSxLQUFSOztBQUNYLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFFTDs7O0lBRUMsZUFBQyxHQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxrREFBUzs7OztRQUVWLDJHQUFBLFNBQUE7UUFFQSxJQUFDLENBQUEsT0FBRCxHQUFjO1FBQ2QsSUFBQyxDQUFBLEtBQUQsR0FBYztRQUNkLElBQUMsQ0FBQSxPQUFELEdBQWM7UUFDZCxJQUFDLENBQUEsUUFBRCxHQUFjLElBQUEsR0FBTyxFQUFQLEdBQVksSUFBQyxDQUFBO0lBUDVCOztvQkFTSCxNQUFBLEdBQVEsU0FBQTtRQUVKLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixJQUFBLENBQUssS0FBTCxFQUFXO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxXQUFOO1lBQWtCLEdBQUEsRUFBSSxTQUFBLEdBQVksbUJBQWxDO1NBQVgsQ0FBbEI7UUFFQSxJQUFDLENBQUEsVUFBRCxDQUFBO1FBRUEsSUFBSSxDQUFDLE1BQUwsQ0FBWSxhQUFaLEVBQTBCLE9BQTFCLEVBQXFDLElBQUMsQ0FBQSxFQUF0QztlQUNBLElBQUksQ0FBQyxNQUFMLENBQVksYUFBWixFQUEwQixVQUExQixFQUFxQyxJQUFDLENBQUEsRUFBdEM7SUFQSTs7b0JBU1IsVUFBQSxHQUFZLFNBQUE7ZUFFUixJQUFDLENBQUEs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SDs7OztHQTNHQzs7QUE2R3BCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgXG4gICAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAgICAwMDAgICAwMDAgICAgICAwICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgc3csIHNoLCBvcywgc2xhc2gsIHBvc3QsIGtwb3MsIGtsb2csIGVsZW0sIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuS2FjaGVsICAgPSByZXF1aXJlICcuL2thY2hlbCdcbnd4dyAgICAgID0gcmVxdWlyZSAnd3h3J1xuZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcblxuY2xhc3MgU2F2ZXIgZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonc2F2ZXInKSAtPiBcbiAgICBcbiAgICAgICAgc3VwZXJcbiAgICBcbiAgICAgICAgQHRhc2tiYXIgICAgPSBmYWxzZVxuICAgICAgICBAc2F2ZXIgICAgICA9IG51bGxcbiAgICAgICAgQG1pbnV0ZXMgICAgPSAxMFxuICAgICAgICBAaW50ZXJ2YWwgICA9IDEwMDAgKiA2MCAqIEBtaW51dGVzXG4gICAgICAgIFxuICAgIG9uTG9hZDogLT5cbiAgICAgICAgXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGVsZW0gJ2ltZycgY2xhc3M6J2thY2hlbEltZycgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL3NhdmVyLnBuZydcbiAgICAgICAgXG4gICAgICAgIEBzdGFydENoZWNrKClcbiAgICAgICAgXG4gICAgICAgIHBvc3QudG9NYWluICdyZXF1ZXN0RGF0YScgJ21vdXNlJyAgICBAaWRcbiAgICAgICAgcG9zdC50b01haW4gJ3JlcXVlc3REYXRhJyAna2V5Ym9hcmQnIEBpZFxuICAgIFxuICAgIHN0YXJ0Q2hlY2s6IC0+XG4gICAgICAgIFxuICAgICAgICBAY2hlY2tUaW1lciA9IHNldFRpbWVvdXQgQGNoZWNrLCBAaW50ZXJ2YWxcbiAgICAgICAgXG4gICAgY2hlY2s6ID0+XG4gICAgICAgIFxuICAgICAgICBrbG9nICdjaGVjaydcbiAgICAgICAgXG4gICAgICAgIEBzdGFydENoZWNrKClcbiAgICAgICAgXG4gICAgb25TYXZlckNsb3NlOiA9PlxuICAgICAgICBcbiAgICAgICAgQHNhdmVyID0gbnVsbFxuICAgICAgICBAc3RhcnRDaGVjaygpXG4gICAgICAgIGlmIEB0YXNrYmFyXG4gICAgICAgICAgICB3eHcgJ3Rhc2tiYXInICdzaG93J1xuICAgICAgICAgICAgQHRhc2tiYXIgPSBmYWxzZVxuICAgICAgICAgICAgXG4gICAgb25DbGljazogLT4gXG4gICAgXG4gICAgICAgIGluZm8gPSB3eHcoJ2luZm8nICd0YXNrYmFyJylbMF1cbiAgICAgICAgaWYgaW5mby5zdGF0dXMgIT0gJ2hpZGRlbidcbiAgICAgICAgICAgIHd4dyAndGFza2JhcicgJ2hpZGUnXG4gICAgICAgICAgICBAdGFza2JhciA9IHRydWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHRhc2tiYXIgPSBmYWxzZVxuICAgICAgICBcbiAgICAgICAgY2xlYXJJbnRlcnZhbCBAY2hlY2tcbiAgICAgICAgQGNoZWNrID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgd2EgPSB3eHcgJ3NjcmVlbicgJ3NpemUnXG4gICAgICAgIFxuICAgICAgICB3aWR0aCAgPSB3YS53aWR0aFxuICAgICAgICBoZWlnaHQgPSB3YS5oZWlnaHRcbiAgICAgICAgXG4gICAgICAgIG9mZnNldCA9IDBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnZGFyd2luJyBhbmQgcGFyc2VJbnQob3MucmVsZWFzZSgpLnNwbGl0KCcuJylbMF0pID49IDE4XG4gICAgICAgICAgICBvZmZzZXQgPSA0ICMgdHJ5IHRvIGdldCByaWQgb2YgdWdseSB0b3AgZnJhbWUgYm9yZGVyXG4gICAgICAgIFxuICAgICAgICBAc2F2ZXIgPSBuZXcgZWxlY3Ryb24ucmVtb3RlLkJyb3dzZXJXaW5kb3dcbiAgICAgICAgICAgIHg6ICAgICAgICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIHk6ICAgICAgICAgICAgICAgICAgICAgIC1vZmZzZXRcbiAgICAgICAgICAgIHdpZHRoOiAgICAgICAgICAgICAgICAgIHdpZHRoXG4gICAgICAgICAgICBtaW5XaWR0aDogICAgICAgICAgICAgICB3aWR0aFxuICAgICAgICAgICAgbWluSGVpZ2h0OiAgICAgICAgICAgICAgaGVpZ2h0K29mZnNldFxuICAgICAgICAgICAgaGVpZ2h0OiAgICAgICAgICAgICAgICAgaGVpZ2h0K29mZnNldFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAgICAgICAgJyMwMTAwMDAwMCdcbiAgICAgICAgICAgIHJlc2l6YWJsZTogICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBtYXhpbWl6YWJsZTogICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgbWluaW1pemFibGU6ICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIHRoaWNrRnJhbWU6ICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBmcmFtZTogICAgICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgZnVsbHNjcmVlbjogICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIGZ1bGxzY3JlZW5lbmFibGU6ICAgICAgIGZhbHNlXG4gICAgICAgICAgICBhbHdheXNPblRvcDogICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICBlbmFibGVMYXJnZXJUaGFuU2NyZWVuOiB0cnVlXG4gICAgICAgICAgICB0cmFuc3BhcmVudDogICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICBhY2NlcHRGaXJzdE1vdXNlOiAgICAgICB0cnVlXG4gICAgICAgICAgICBjbG9zYWJsZTogICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICBzaG93OiAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICB3ZWJQcmVmZXJlbmNlczogXG4gICAgICAgICAgICAgICAgbm9kZUludGVncmF0aW9uOiB0cnVlXG4gICAgICAgICAgICAgICBcbiAgICAgICAgY29kZSA9ICdzYXZlcmRlZmF1bHQnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGh0bWwgPSBcIlwiXCJcbiAgICAgICAgICAgIDwhRE9DVFlQRSBodG1sPlxuICAgICAgICAgICAgPGh0bWwgbGFuZz1cImVuXCI+XG4gICAgICAgICAgICAgIDxoZWFkPlxuICAgICAgICAgICAgICAgIDxtZXRhIGNoYXJzZXQ9XCJ1dGYtOFwiPlxuICAgICAgICAgICAgICAgIDxtZXRhIGh0dHAtZXF1aXY9XCJDb250ZW50LVNlY3VyaXR5LVBvbGljeVwiIGNvbnRlbnQ9XCJkZWZhdWx0LXNyYyAqICd1bnNhZmUtaW5saW5lJyAndW5zYWZlLWV2YWwnXCI+XG4gICAgICAgICAgICAgIDwvaGVhZD5cbiAgICAgICAgICAgICAgPGJvZHkgdGFiaW5kZXg9MCBzdHlsZT1cIm92ZXJmbG93OiBoaWRkZW47IHBhZGRpbmc6MDsgbWFyZ2luOjA7IGN1cnNvcjogbm9uZTsgcG9pbnRlci1ldmVudHM6IGFsbDsgcG9zaXRpb246IGFic29sdXRlOyBsZWZ0OiAwOyB0b3A6IDA7IHJpZ2h0OiAwOyBib3R0b206IDA7XCI+XG4gICAgICAgICAgICAgIDwvYm9keT5cbiAgICAgICAgICAgICAgPHNjcmlwdD5cbiAgICAgICAgICAgICAgICBTYXZlciA9IHJlcXVpcmUoXCIuLyN7Y29kZX0uanNcIik7XG4gICAgICAgICAgICAgICAgbmV3IFNhdmVyKHt9KTtcbiAgICAgICAgICAgICAgPC9zY3JpcHQ+XG4gICAgICAgICAgICA8L2h0bWw+XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBcbiAgICAgICAgZGF0YSA9IFwiZGF0YTp0ZXh0L2h0bWw7Y2hhcnNldD11dGYtOCxcIiArIGVuY29kZVVSSSBodG1sXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBzYXZlci5sb2FkVVJMIGRhdGEsIGJhc2VVUkxGb3JEYXRhVVJMOnNsYXNoLmZpbGVVcmwgX19kaXJuYW1lICsgJy9pbmRleC5odG1sJ1xuICAgICAgICBAc2F2ZXIub24gJ2Nsb3NlJyBAb25TYXZlckNsb3NlXG4gICAgICAgIEBzYXZlci5mb2N1cygpXG4gICAgICAgIFxuICAgIG9uQ29udGV4dE1lbnU6ID0+IGtsb2cgJ3NhdmVyT3B0aW9ucydcblxubW9kdWxlLmV4cG9ydHMgPSBTYXZlclxuIl19
//# sourceURL=../coffee/saver.coffee
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
        info = wxw('info', 'taskbar')[0];
        if (info.status !== 'hidden') {
            wxw('taskbar', 'hide');
            this.taskbar = true;
        } else {
            this.taskbar = false;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZXIuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLCtFQUFBO0lBQUE7Ozs7QUFRQSxNQUFtRCxPQUFBLENBQVEsS0FBUixDQUFuRCxFQUFFLFdBQUYsRUFBTSxXQUFOLEVBQVUsV0FBVixFQUFjLGlCQUFkLEVBQXFCLGVBQXJCLEVBQTJCLGVBQTNCLEVBQWlDLGVBQWpDLEVBQXVDLGVBQXZDLEVBQTZDOztBQUU3QyxNQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBQ1gsR0FBQSxHQUFXLE9BQUEsQ0FBUSxLQUFSOztBQUNYLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFFTDs7O0lBRUMsZUFBQyxHQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxrREFBUzs7Ozs7O1FBRVYsMkdBQUEsU0FBQTtRQUVBLElBQUMsQ0FBQSxJQUFELEdBQVksSUFBSSxDQUFDLEdBQUwsQ0FBQTtRQUNaLElBQUMsQ0FBQSxPQUFELEdBQVk7UUFDWixJQUFDLENBQUEsS0FBRCxHQUFZO1FBQ1osSUFBQyxDQUFBLE9BQUQsR0FBWTtRQUNaLElBQUMsQ0FBQSxRQUFELEdBQVksUUFBQSxDQUFTLElBQUEsR0FBTyxFQUFQLEdBQVksSUFBQyxDQUFBLE9BQXRCO0lBUmI7O29CQVVILE1BQUEsR0FBUSxTQUFBO1FBRUosSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLElBQUEsQ0FBSyxLQUFMLEVBQVc7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFdBQU47WUFBa0IsR0FBQSxFQUFJLFNBQUEsR0FBWSxtQkFBbEM7U0FBWCxDQUFsQjtRQUVBLElBQUMsQ0FBQSxVQUFELENBQUE7UUFFQSxJQUFDLENBQUEsV0FBRCxDQUFhLE9BQWI7ZUFDQSxJQUFDLENBQUEsV0FBRCxDQUFhLFVBQWI7SUFQSTs7b0JBU1IsTUFBQSxHQUFRLFNBQUMsSUFBRDtlQUFVLElBQUMsQ0FBQSxJ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RVAsSUFBQSxHQUFPLHVaQUFBLEdBVXNCLElBVnRCLEdBVTJCO1FBTWxDLElBQUEsR0FBTywrQkFBQSxHQUFrQyxTQUFBLENBQVUsSUFBVjtRQUV6QyxJQUFDLENBQUEsS0FBSyxDQUFDLE9BQVAsQ0FBZSxJQUFmLEVBQXFCO1lBQUEsaUJBQUEsRUFBa0IsS0FBSyxDQUFDLE9BQU4sQ0FBYyxTQUFBLEdBQVksYUFBMUIsQ0FBbEI7U0FBckI7UUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLEVBQVAsQ0FBVSxPQUFWLEVBQWtCLElBQUMsQ0FBQSxZQUFuQjtlQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsS0FBUCxDQUFBO0lBbkVLOztvQkFxRVQsYUFBQSxHQUFlLFNBQUE7ZUFBRyxJQUFBLENBQUssY0FBTDtJQUFIOzs7O0dBcElDOztBQXNJcEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwIFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgIDAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG4jIyNcblxueyBzdywgc2gsIG9zLCBzbGFzaCwgcG9zdCwga3Bvcywga2xvZywgZWxlbSwgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5LYWNoZWwgICA9IHJlcXVpcmUgJy4va2FjaGVsJ1xud3h3ICAgICAgPSByZXF1aXJlICd3eHcnXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuXG5jbGFzcyBTYXZlciBleHRlbmRzIEthY2hlbFxuICAgICAgICBcbiAgICBAOiAoQGthY2hlbElkOidzYXZlcicpIC0+IFxuICAgIFxuICAgICAgICBzdXBlclxuICAgIFxuICAgICAgICBAbGFzdCAgICAgPSBEYXRlLm5vdygpXG4gICAgICAgIEB0YXNrYmFyICA9IGZhbHNlXG4gICAgICAgIEBzYXZlciAgICA9IG51bGxcbiAgICAgICAgQG1pbnV0ZXMgID0gNVxuICAgICAgICBAaW50ZXJ2YWwgPSBwYXJzZUludCAxMDAwICogNjAgKiBAbWludXRlc1xuICAgICAgICBcbiAgICBvbkxvYWQ6IC0+XG4gICAgICAgIFxuICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBlbGVtICdpbWcnIGNsYXNzOidrYWNoZWxJbWcnIHNyYzpfX2Rpcm5hbWUgKyAnLy4uL2ltZy9zYXZlci5wbmcnXG4gICAgICAgIFxuICAgICAgICBAc3RhcnRDaGVjaygpXG4gICAgICAgIFxuICAgICAgICBAcmVxdWVzdERhdGEgJ21vdXNlJyAgIFxuICAgICAgICBAcmVxdWVzdERhdGEgJ2tleWJvYXJkJ1xuICAgIFxuICAgIG9uRGF0YTogKGRhdGEpID0+IEBsYXN0ID0gRGF0ZS5ub3coKVxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBzdGFydENoZWNrOiAobXM9QGludGVydmFsKSAtPiBAY2hlY2tUaW1lciA9IHNldFRpbWVvdXQgQGNoZWNrLCBtc1xuICAgICAgICBcbiAgICBjaGVjazogPT5cbiAgICAgICAgXG4gICAgICAgIG5vdyA9IERhdGUubm93KClcbiAgICAgICAgXG4gICAgICAgIGVsYXBzZWQgPSBub3cgLSBAbGFzdFxuICAgICAgICBcbiAgICAgICAgaWYgZWxhcHNlZCA+IEBpbnRlcnZhbFxuICAgICAgICAgICAgQG9uQ2xpY2soKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc3RhcnRDaGVjayBNYXRoLm1heCAxMDAsIEBpbnRlcnZhbCAtIGVsYXBzZWRcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBvblNhdmVyQ2xvc2U6ID0+XG4gICAgICAgIFxuICAgICAgICBAc2F2ZXIgPSBudWxsXG4gICAgICAgIEBsYXN0ID0gRGF0ZS5ub3coKVxuICAgICAgICBAc3RhcnRDaGVjaygpXG4gICAgICAgIGlmIEB0YXNrYmFyXG4gICAgICAgICAgICB3eHcgJ3Rhc2tiYXInICdzaG93J1xuICAgICAgICAgICAgQHRhc2tiYXIgPSBmYWxzZVxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIG9uQ2xpY2s6ID0+IFxuICAgIFxuICAgICAgICBpbmZvID0gd3h3KCdpbmZvJyAndGFza2JhcicpWzBdXG4gICAgICAgIGlmIGluZm8uc3RhdHVzICE9ICdoaWRkZW4nXG4gICAgICAgICAgICB3eHcgJ3Rhc2tiYXInICdoaWRlJ1xuICAgICAgICAgICAgQHRhc2tiYXIgPSB0cnVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEB0YXNrYmFyID0gZmFsc2VcbiAgICAgICAgXG4gICAgICAgIGNsZWFyVGltZW91dCBAY2hlY2tUaW1lclxuICAgICAgICBAY2hlY2tUaW1lciA9IG51bGxcbiAgICAgICAgXG4gICAgICAgIHdhID0gd3h3ICdzY3JlZW4nICdzaXplJ1xuICAgICAgICBcbiAgICAgICAgd2lkdGggID0gd2Eud2lkdGhcbiAgICAgICAgaGVpZ2h0ID0gd2EuaGVpZ2h0XG4gICAgICAgIFxuICAgICAgICBvZmZzZXQgPSAwXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ2RhcndpbicgYW5kIHBhcnNlSW50KG9zLnJlbGVhc2UoKS5zcGxpdCgnLicpWzBdKSA+PSAxOFxuICAgICAgICAgICAgb2Zmc2V0ID0gNCAjIHRyeSB0byBnZXQgcmlkIG9mIHVnbHkgdG9wIGZyYW1lIGJvcmRlclxuICAgICAgICBcbiAgICAgICAgQHNhdmVyID0gbmV3IGVsZWN0cm9uLnJlbW90ZS5Ccm93c2VyV2luZG93XG4gICAgICAgICAgICB4OiAgICAgICAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICB5OiAgICAgICAgICAgICAgICAgICAgICAtb2Zmc2V0XG4gICAgICAgICAgICB3aWR0aDogICAgICAgICAgICAgICAgICB3aWR0aFxuICAgICAgICAgICAgbWluV2lkdGg6ICAgICAgICAgICAgICAgd2lkdGhcbiAgICAgICAgICAgIG1pbkhlaWdodDogICAgICAgICAgICAgIGhlaWdodCtvZmZzZXRcbiAgICAgICAgICAgIGhlaWdodDogICAgICAgICAgICAgICAgIGhlaWdodCtvZmZzZXRcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogICAgICAgICcjMDEwMDAwMDAnXG4gICAgICAgICAgICByZXNpemFibGU6ICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgbWF4aW1pemFibGU6ICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIG1pbmltaXphYmxlOiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICB0aGlja0ZyYW1lOiAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgZnJhbWU6ICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIGZ1bGxzY3JlZW46ICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBmdWxsc2NyZWVuZW5hYmxlOiAgICAgICBmYWxzZVxuICAgICAgICAgICAgYWx3YXlzT25Ub3A6ICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgZW5hYmxlTGFyZ2VyVGhhblNjcmVlbjogdHJ1ZVxuICAgICAgICAgICAgdHJhbnNwYXJlbnQ6ICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgYWNjZXB0Rmlyc3RNb3VzZTogICAgICAgdHJ1ZVxuICAgICAgICAgICAgY2xvc2FibGU6ICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgc2hvdzogICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgd2ViUHJlZmVyZW5jZXM6IFxuICAgICAgICAgICAgICAgIG5vZGVJbnRlZ3JhdGlvbjogdHJ1ZVxuICAgICAgICAgICAgICAgXG4gICAgICAgIGNvZGUgPSAna3Jra2wnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGh0bWwgPSBcIlwiXCJcbiAgICAgICAgICAgIDwhRE9DVFlQRSBodG1sPlxuICAgICAgICAgICAgPGh0bWwgbGFuZz1cImVuXCI+XG4gICAgICAgICAgICAgIDxoZWFkPlxuICAgICAgICAgICAgICAgIDxtZXRhIGNoYXJzZXQ9XCJ1dGYtOFwiPlxuICAgICAgICAgICAgICAgIDxtZXRhIGh0dHAtZXF1aXY9XCJDb250ZW50LVNlY3VyaXR5LVBvbGljeVwiIGNvbnRlbnQ9XCJkZWZhdWx0LXNyYyAqICd1bnNhZmUtaW5saW5lJyAndW5zYWZlLWV2YWwnXCI+XG4gICAgICAgICAgICAgIDwvaGVhZD5cbiAgICAgICAgICAgICAgPGJvZHkgdGFiaW5kZXg9MCBzdHlsZT1cIm92ZXJmbG93OiBoaWRkZW47IHBhZGRpbmc6MDsgbWFyZ2luOjA7IGN1cnNvcjogbm9uZTsgcG9pbnRlci1ldmVudHM6IGFsbDsgcG9zaXRpb246IGFic29sdXRlOyBsZWZ0OiAwOyB0b3A6IDA7IHJpZ2h0OiAwOyBib3R0b206IDA7XCI+XG4gICAgICAgICAgICAgIDwvYm9keT5cbiAgICAgICAgICAgICAgPHNjcmlwdD5cbiAgICAgICAgICAgICAgICBTYXZlciA9IHJlcXVpcmUoXCIuLyN7Y29kZX0uanNcIik7XG4gICAgICAgICAgICAgICAgbmV3IFNhdmVyKHt9KTtcbiAgICAgICAgICAgICAgPC9zY3JpcHQ+XG4gICAgICAgICAgICA8L2h0bWw+XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBcbiAgICAgICAgZGF0YSA9IFwiZGF0YTp0ZXh0L2h0bWw7Y2hhcnNldD11dGYtOCxcIiArIGVuY29kZVVSSSBodG1sXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBzYXZlci5sb2FkVVJMIGRhdGEsIGJhc2VVUkxGb3JEYXRhVVJMOnNsYXNoLmZpbGVVcmwgX19kaXJuYW1lICsgJy9pbmRleC5odG1sJ1xuICAgICAgICBAc2F2ZXIub24gJ2Nsb3NlJyBAb25TYXZlckNsb3NlXG4gICAgICAgIEBzYXZlci5mb2N1cygpXG4gICAgICAgIFxuICAgIG9uQ29udGV4dE1lbnU6ID0+IGtsb2cgJ3NhdmVyT3B0aW9ucydcblxubW9kdWxlLmV4cG9ydHMgPSBTYXZlclxuIl19
//# sourceURL=../coffee/saver.coffee
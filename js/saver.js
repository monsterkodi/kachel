// koffee 1.3.0

/*
 0000000   0000000   000   000  00000000  00000000 
000       000   000  000   000  000       000   000
0000000   000000000   000 000   0000000   0000000  
     000  000   000     000     000       000   000
0000000   000   000      0      00000000  000   000
 */
var Kachel, Saver, _, electron, elem, klog, kpos, os, post, ref, sh, slash, sw,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), sw = ref.sw, sh = ref.sh, os = ref.os, slash = ref.slash, post = ref.post, kpos = ref.kpos, klog = ref.klog, elem = ref.elem, _ = ref._;

Kachel = require('./kachel');

electron = require('electron');

Saver = (function(superClass) {
    extend(Saver, superClass);

    function Saver(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'saver';
        this.onContextMenu = bind(this.onContextMenu, this);
        this.onSaverClose = bind(this.onSaverClose, this);
        this.checkMouse = bind(this.checkMouse, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Saver.__super__.constructor.apply(this, arguments);
        this.saver = null;
        this.mouseIdle = 0;
        this.minutes = 5;
        this.interval = 1000 * 60;
    }

    Saver.prototype.onLoad = function() {
        this.main.appendChild(elem('img', {
            "class": 'kachelImg',
            src: __dirname + '/../img/saver.png'
        }));
        this.mousePos = kpos(electron.remote.screen.getCursorScreenPoint());
        return this.mouseCheck = setInterval(this.checkMouse, this.interval);
    };

    Saver.prototype.checkMouse = function() {
        var newPos;
        newPos = kpos(electron.remote.screen.getCursorScreenPoint());
        if (this.mousePos.equals(newPos)) {
            this.mouseIdle += 1;
            klog('@mouseIdle', this.mouseIdle);
            if (this.mouseIdle >= this.minutes) {
                return this.onClick();
            }
        } else {
            this.mouseIdle = 0;
            return this.mousePos = newPos;
        }
    };

    Saver.prototype.onSaverClose = function() {
        this.saver = null;
        this.mouseIdle = 0;
        return this.mouseCheck = setInterval(this.checkMouse, this.interval);
    };

    Saver.prototype.onClick = function() {
        var code, data, height, html, offset, wa, width;
        clearInterval(this.mouseCheck);
        this.mouseIdle = 0;
        this.mouseCheck = null;
        wa = electron.remote.screen.getPrimaryDisplay().workAreaSize;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZXIuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLDBFQUFBO0lBQUE7Ozs7QUFRQSxNQUFtRCxPQUFBLENBQVEsS0FBUixDQUFuRCxFQUFFLFdBQUYsRUFBTSxXQUFOLEVBQVUsV0FBVixFQUFjLGlCQUFkLEVBQXFCLGVBQXJCLEVBQTJCLGVBQTNCLEVBQWlDLGVBQWpDLEVBQXVDLGVBQXZDLEVBQTZDOztBQUU3QyxNQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBQ1gsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUVMOzs7SUFFQyxlQUFDLEdBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLGtEQUFTOzs7O1FBRVYsMkdBQUEsU0FBQTtRQUVBLElBQUMsQ0FBQSxLQUFELEdBQWM7UUFDZCxJQUFDLENBQUEsU0FBRCxHQUFjO1FBQ2QsSUFBQyxDQUFBLE9BQUQsR0FBYztRQUNkLElBQUMsQ0FBQSxRQUFELEdBQWMsSUFBQSxHQUFPO0lBUHRCOztvQkFTSCxNQUFBLEdBQVEsU0FBQTtRQUVKLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixJQUFBLENBQUssS0FBTCxFQUFXO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxXQUFOO1lBQWtCLEdBQUEsRUFBSSxTQUFBLEdBQVksbUJBQWxDO1NBQVgsQ0FBbEI7UUFFQSxJQUFDLENBQUEsUUFBRCxHQUFjLElBQUEsQ0FBSyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxvQkFBdkIsQ0FBQSxDQUFMO2VBQ2QsSUFBQyxDQUFBLFVBQUQsR0FBYyxXQUFBLENBQVksSUFBQyxDQUFBLFVBQWIsRUFBeUIsSUFBQyxDQUFBLFFBQTFCO0lBTFY7O29CQU9SLFVBQUEsR0FBWSxTQUFBO0FBRVIsWUFBQTtRQUFBLE1BQUEsR0FBUyxJQUFBLENBQUssUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMs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IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAwMDAwICAgMDAwICAgMDAwICAgICAgMCAgICAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiMjI1xuXG57IHN3LCBzaCwgb3MsIHNsYXNoLCBwb3N0LCBrcG9zLCBrbG9nLCBlbGVtLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbkthY2hlbCAgID0gcmVxdWlyZSAnLi9rYWNoZWwnXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuXG5jbGFzcyBTYXZlciBleHRlbmRzIEthY2hlbFxuICAgICAgICBcbiAgICBAOiAoQGthY2hlbElkOidzYXZlcicpIC0+IFxuICAgIFxuICAgICAgICBzdXBlclxuICAgIFxuICAgICAgICBAc2F2ZXIgICAgICA9IG51bGxcbiAgICAgICAgQG1vdXNlSWRsZSAgPSAwXG4gICAgICAgIEBtaW51dGVzICAgID0gNVxuICAgICAgICBAaW50ZXJ2YWwgICA9IDEwMDAgKiA2MFxuICAgICAgICBcbiAgICBvbkxvYWQ6IC0+IFxuICAgICAgICBcbiAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgZWxlbSAnaW1nJyBjbGFzczona2FjaGVsSW1nJyBzcmM6X19kaXJuYW1lICsgJy8uLi9pbWcvc2F2ZXIucG5nJ1xuICAgICAgICBcbiAgICAgICAgQG1vdXNlUG9zICAgPSBrcG9zIGVsZWN0cm9uLnJlbW90ZS5zY3JlZW4uZ2V0Q3Vyc29yU2NyZWVuUG9pbnQoKVxuICAgICAgICBAbW91c2VDaGVjayA9IHNldEludGVydmFsIEBjaGVja01vdXNlLCBAaW50ZXJ2YWxcbiAgICAgICAgXG4gICAgY2hlY2tNb3VzZTogPT5cbiAgICAgICAgXG4gICAgICAgIG5ld1BvcyA9IGtwb3MgZWxlY3Ryb24ucmVtb3RlLnNjcmVlbi5nZXRDdXJzb3JTY3JlZW5Qb2ludCgpXG4gICAgICAgIGlmIEBtb3VzZVBvcy5lcXVhbHMgbmV3UG9zXG4gICAgICAgICAgICBAbW91c2VJZGxlICs9IDFcbiAgICAgICAgICAgIGtsb2cgJ0Btb3VzZUlkbGUnIEBtb3VzZUlkbGVcbiAgICAgICAgICAgIGlmIEBtb3VzZUlkbGUgPj0gQG1pbnV0ZXNcbiAgICAgICAgICAgICAgICBAb25DbGljaygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBtb3VzZUlkbGUgPSAwXG4gICAgICAgICAgICBAbW91c2VQb3MgPSBuZXdQb3NcbiAgICAgICAgXG4gICAgb25TYXZlckNsb3NlOiA9PlxuICAgICAgICBcbiAgICAgICAgQHNhdmVyID0gbnVsbFxuICAgICAgICBAbW91c2VJZGxlID0gMFxuICAgICAgICBAbW91c2VDaGVjayA9IHNldEludGVydmFsIEBjaGVja01vdXNlLCBAaW50ZXJ2YWxcbiAgICAgICAgICAgIFxuICAgIG9uQ2xpY2s6IC0+IFxuICAgIFxuICAgICAgICBjbGVhckludGVydmFsIEBtb3VzZUNoZWNrXG4gICAgICAgIEBtb3VzZUlkbGUgID0gMFxuICAgICAgICBAbW91c2VDaGVjayA9IG51bGxcbiAgICAgICAgXG4gICAgICAgIHdhID0gZWxlY3Ryb24ucmVtb3RlLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhU2l6ZVxuICAgICAgICBcbiAgICAgICAgd2lkdGggID0gd2Eud2lkdGhcbiAgICAgICAgaGVpZ2h0ID0gd2EuaGVpZ2h0XG4gICAgICAgIFxuICAgICAgICBvZmZzZXQgPSAwXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ2RhcndpbicgYW5kIHBhcnNlSW50KG9zLnJlbGVhc2UoKS5zcGxpdCgnLicpWzBdKSA+PSAxOFxuICAgICAgICAgICAgb2Zmc2V0ID0gNCAjIHRyeSB0byBnZXQgcmlkIG9mIHVnbHkgdG9wIGZyYW1lIGJvcmRlclxuICAgICAgICBcbiAgICAgICAgQHNhdmVyID0gbmV3IGVsZWN0cm9uLnJlbW90ZS5Ccm93c2VyV2luZG93XG4gICAgICAgICAgICB4OiAgICAgICAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICB5OiAgICAgICAgICAgICAgICAgICAgICAtb2Zmc2V0XG4gICAgICAgICAgICB3aWR0aDogICAgICAgICAgICAgICAgICB3aWR0aFxuICAgICAgICAgICAgaGVpZ2h0OiAgICAgICAgICAgICAgICAgaGVpZ2h0K29mZnNldFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAgICAgICAgJyMwMTAwMDAwMCdcbiAgICAgICAgICAgIHJlc2l6YWJsZTogICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBtYXhpbWl6YWJsZTogICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgbWluaW1pemFibGU6ICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIHRoaWNrRnJhbWU6ICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBmcmFtZTogICAgICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgZnVsbHNjcmVlbjogICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIGZ1bGxzY3JlZW5lbmFibGU6ICAgICAgIGZhbHNlXG4gICAgICAgICAgICBhbHdheXNPblRvcDogICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICBlbmFibGVMYXJnZXJUaGFuU2NyZWVuOiB0cnVlXG4gICAgICAgICAgICB0cmFuc3BhcmVudDogICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICBhY2NlcHRGaXJzdE1vdXNlOiAgICAgICB0cnVlXG4gICAgICAgICAgICBjbG9zYWJsZTogICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICBzaG93OiAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICB3ZWJQcmVmZXJlbmNlczogXG4gICAgICAgICAgICAgICAgbm9kZUludGVncmF0aW9uOiB0cnVlXG4gICAgICAgICAgICAgICBcbiAgICAgICAgY29kZSA9ICdzYXZlcmRlZmF1bHQnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGh0bWwgPSBcIlwiXCJcbiAgICAgICAgICAgIDwhRE9DVFlQRSBodG1sPlxuICAgICAgICAgICAgPGh0bWwgbGFuZz1cImVuXCI+XG4gICAgICAgICAgICAgIDxoZWFkPlxuICAgICAgICAgICAgICAgIDxtZXRhIGNoYXJzZXQ9XCJ1dGYtOFwiPlxuICAgICAgICAgICAgICAgIDxtZXRhIGh0dHAtZXF1aXY9XCJDb250ZW50LVNlY3VyaXR5LVBvbGljeVwiIGNvbnRlbnQ9XCJkZWZhdWx0LXNyYyAqICd1bnNhZmUtaW5saW5lJyAndW5zYWZlLWV2YWwnXCI+XG4gICAgICAgICAgICAgIDwvaGVhZD5cbiAgICAgICAgICAgICAgPGJvZHkgdGFiaW5kZXg9MCBzdHlsZT1cIm92ZXJmbG93OiBoaWRkZW47IHBhZGRpbmc6MDsgbWFyZ2luOjA7IGN1cnNvcjogbm9uZTsgcG9pbnRlci1ldmVudHM6IGFsbDsgcG9zaXRpb246IGFic29sdXRlOyBsZWZ0OiAwOyB0b3A6IDA7IHJpZ2h0OiAwOyBib3R0b206IDA7XCI+XG4gICAgICAgICAgICAgIDwvYm9keT5cbiAgICAgICAgICAgICAgPHNjcmlwdD5cbiAgICAgICAgICAgICAgICBTYXZlciA9IHJlcXVpcmUoXCIuLyN7Y29kZX0uanNcIik7XG4gICAgICAgICAgICAgICAgbmV3IFNhdmVyKHt9KTtcbiAgICAgICAgICAgICAgPC9zY3JpcHQ+XG4gICAgICAgICAgICA8L2h0bWw+XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBcbiAgICAgICAgZGF0YSA9IFwiZGF0YTp0ZXh0L2h0bWw7Y2hhcnNldD11dGYtOCxcIiArIGVuY29kZVVSSSBodG1sXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBzYXZlci5sb2FkVVJMIGRhdGEsIGJhc2VVUkxGb3JEYXRhVVJMOnNsYXNoLmZpbGVVcmwgX19kaXJuYW1lICsgJy9pbmRleC5odG1sJ1xuICAgICAgICBAc2F2ZXIub24gJ2Nsb3NlJyBAb25TYXZlckNsb3NlXG4gICAgICAgIEBzYXZlci5mb2N1cygpXG4gICAgICAgIFxuICAgIG9uQ29udGV4dE1lbnU6ID0+IGtsb2cgJ3NhdmVyT3B0aW9ucydcblxubW9kdWxlLmV4cG9ydHMgPSBTYXZlclxuIl19
//# sourceURL=../coffee/saver.coffee
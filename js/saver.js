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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZXIuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLDBFQUFBO0lBQUE7Ozs7QUFRQSxNQUFtRCxPQUFBLENBQVEsS0FBUixDQUFuRCxFQUFFLFdBQUYsRUFBTSxXQUFOLEVBQVUsV0FBVixFQUFjLGlCQUFkLEVBQXFCLGVBQXJCLEVBQTJCLGVBQTNCLEVBQWlDLGVBQWpDLEVBQXVDLGVBQXZDLEVBQTZDOztBQUU3QyxNQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBQ1gsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUVMOzs7SUFFQyxlQUFDLEdBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLGtEQUFTOzs7O1FBRVYsMkdBQUEsU0FBQTtRQUVBLElBQUMsQ0FBQSxLQUFELEdBQWM7UUFDZCxJQUFDLENBQUEsU0FBRCxHQUFjO1FBQ2QsSUFBQyxDQUFBLE9BQUQsR0FBYztRQUNkLElBQUMsQ0FBQSxRQUFELEdBQWMsSUFBQSxHQUFPO0lBUHRCOztvQkFTSCxNQUFBLEdBQVEsU0FBQTtRQUVKLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixJQUFBLENBQUssS0FBTCxFQUFXO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxXQUFOO1lBQWtCLEdBQUEsRUFBSSxTQUFBLEdBQVksbUJBQWxDO1NBQVgsQ0FBbEI7UUFFQSxJQUFDLENBQUEsUUFBRCxHQUFjLElBQUEsQ0FBSyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxvQkFBdkIsQ0FBQSxDQUFMO2VBQ2QsSUFBQyxDQUFBLFVBQUQsR0FBYyxXQUFBLENBQVksSUFBQyxDQUFBLFVBQWIsRUFBeUIsSUFBQyxDQUFBLFFBQTFCO0lBTFY7O29CQU9SLFVBQUEsR0FBWSxTQUFBO0FBRVIsWUFBQTtRQUFBLE1BQUEsR0FBUyxJQUFBLENBQUssUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsb0JBQXZCLENBQUEsQ0FBTDtRQUNULElBQUcsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLENBQWlCLE1BQWpCLENBQUg7WUFDSSxJQUFDLENBQUEsU0FBRCxJQUFjO1lBQ2QsSUFBRyxJQUFDLENBQUEsU0FBRCxJQUFjLElBQUMsQ0FBQSxPQUFsQjt1QkFDSSxJQUFDLENBQUEsT0FBRCxDQUFBLEVBREo7YUFGSjtTQUFBLE1BQUE7WUFLSSxJQUFDLENBQUEsU0FBRCxHQUFhO21CQUNiLElBQUMsQ0FBQSxRQUFELEdBQVksT0FOaEI7O0lBSFE7O29CQVdaLFlBQUEsR0FBYyxTQUFBO1FBRVYsSUFBQyxDQUFBLEtBQUQsR0FBUztlQUNULElBQUMsQ0FBQSxVQUFELEdBQWMsV0FBQSxDQUFZLElBQUMsQ0FBQSxVQUFiLEVBQXlCLElBQUMsQ0FBQSxRQUExQjtJQUhKOztvQkFLZCxPQUFBLEdBQVMsU0FBQTtBQUVMLFlBQUE7UUFBQSxhQUFBLENBQWMsSUFBQyxDQUFBLFVBQWY7UUFDQSxJQUFDLENBQUEsU0FBRCxHQUFjO1FBQ2QsSUFBQyxDQUFBLFVBQUQsR0FBYztRQUVkLEVBQUEsR0FBSyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxpQkFBdkIsQ0FBQSxDQUEwQyxDQUFDO1FBRWhELEtBQUEsR0FBUyxFQUFFLENBQUM7UUFDWixNQUFBLEdBQVMsRUFBRSxDQUFDO1FBRVosTUFBQSxHQUFTO1FBQ1QsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsUUFBakIsSUFBOEIsUUFBQSxDQUFTLEVBQUUsQ0FBQyxPQUFILENBQUEsQ0FBWSxDQUFDLEtBQWIsQ0FBbUIsR0FBbkIsQ0FBd0IsQ0FBQSxDQUFBLENBQWpDLENBQUEsSUFBd0MsRUFBekU7WUFDSSxNQUFBLEdBQVMsRUFEYjs7UUFHQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxhQUFwQixDQUNMO1lBQUEsQ0FBQSxFQUF3QixDQUF4QjtZQUNBLENBQUEsRUFBd0IsQ0FBQyxNQUR6QjtZQUVBLEtBQUEsRUFBd0IsS0FGeEI7WUFHQSxNQUFBLEVBQXdCLE1BQUEsR0FBTyxNQUgvQjtZQUlBLGVBQUEsRUFBd0IsV0FKeEI7WUFLQSxTQUFBLEVBQXdCLEtBTHhCO1lBTUEsV0FBQSxFQUF3QixLQU54QjtZQU9BLFdBQUEsRUFBd0IsS0FQeEI7WUFRQSxVQUFBLEVBQXdCLEtBUnhCO1lBU0EsS0FBQSxFQUF3QixLQVR4QjtZQVVBLFVBQUEsRUFBd0IsS0FWeEI7WUFXQSxnQkFBQSxFQUF3QixLQVh4QjtZQVlBLFdBQUEsRUFBd0IsSUFaeEI7WUFhQSxzQkFBQSxFQUF3QixJQWJ4QjtZQWNBLFdBQUEsRUFBd0IsSUFkeEI7WUFlQSxnQkFBQSxFQUF3QixJQWZ4QjtZQWdCQSxRQUFBLEVBQXdCLElBaEJ4QjtZQWlCQSxJQUFBLEVBQXdCLElBakJ4QjtZQWtCQSxjQUFBLEVBQ0k7Z0JBQUEsZUFBQSxFQUFpQixJQUFqQjthQW5CSjtTQURLO1FBc0JULElBQUEsR0FBTztRQUVQLElBQUEsR0FBTyx1WkFBQSxHQVVzQixJQVZ0QixHQVUyQjtRQU1sQyxJQUFBLEdBQU8sK0JBQUEsR0FBa0MsU0FBQSxDQUFVLElBQVY7UUFFekMsSUFBQyxDQUFBLEtBQUssQ0FBQyxPQUFQLENBQWUsSUFBZixFQUFxQjtZQUFBLGlCQUFBLEVBQWtCLEtBQUssQ0FBQyxPQUFOLENBQWMsU0FBQSxHQUFZLGFBQTFCLENBQWxCO1NBQXJCO1FBQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFQLENBQVUsT0FBVixFQUFrQixJQUFDLENBQUEsWUFBbkI7ZUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLEtBQVAsQ0FBQTtJQTNESzs7b0JBNkRULGFBQUEsR0FBZSxTQUFBO2VBQUcsSUFBQSxDQUFLLGNBQUw7SUFBSDs7OztHQS9GQzs7QUFpR3BCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgXG4gICAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAgICAwMDAgICAwMDAgICAgICAwICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgc3csIHNoLCBvcywgc2xhc2gsIHBvc3QsIGtwb3MsIGtsb2csIGVsZW0sIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuS2FjaGVsICAgPSByZXF1aXJlICcuL2thY2hlbCdcbmVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG5cbmNsYXNzIFNhdmVyIGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J3NhdmVyJykgLT4gXG4gICAgXG4gICAgICAgIHN1cGVyXG4gICAgXG4gICAgICAgIEBzYXZlciAgICAgID0gbnVsbFxuICAgICAgICBAbW91c2VJZGxlICA9IDBcbiAgICAgICAgQG1pbnV0ZXMgICAgPSA1XG4gICAgICAgIEBpbnRlcnZhbCAgID0gMTAwMCAqIDYwXG4gICAgICAgIFxuICAgIG9uTG9hZDogLT4gXG4gICAgICAgIFxuICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBlbGVtICdpbWcnIGNsYXNzOidrYWNoZWxJbWcnIHNyYzpfX2Rpcm5hbWUgKyAnLy4uL2ltZy9zYXZlci5wbmcnXG4gICAgICAgIFxuICAgICAgICBAbW91c2VQb3MgICA9IGtwb3MgZWxlY3Ryb24ucmVtb3RlLnNjcmVlbi5nZXRDdXJzb3JTY3JlZW5Qb2ludCgpXG4gICAgICAgIEBtb3VzZUNoZWNrID0gc2V0SW50ZXJ2YWwgQGNoZWNrTW91c2UsIEBpbnRlcnZhbFxuICAgICAgICBcbiAgICBjaGVja01vdXNlOiA9PlxuICAgICAgICBcbiAgICAgICAgbmV3UG9zID0ga3BvcyBlbGVjdHJvbi5yZW1vdGUuc2NyZWVuLmdldEN1cnNvclNjcmVlblBvaW50KClcbiAgICAgICAgaWYgQG1vdXNlUG9zLmVxdWFscyBuZXdQb3NcbiAgICAgICAgICAgIEBtb3VzZUlkbGUgKz0gMVxuICAgICAgICAgICAgaWYgQG1vdXNlSWRsZSA+PSBAbWludXRlc1xuICAgICAgICAgICAgICAgIEBvbkNsaWNrKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQG1vdXNlSWRsZSA9IDBcbiAgICAgICAgICAgIEBtb3VzZVBvcyA9IG5ld1Bvc1xuICAgICAgICBcbiAgICBvblNhdmVyQ2xvc2U6ID0+XG4gICAgICAgIFxuICAgICAgICBAc2F2ZXIgPSBudWxsXG4gICAgICAgIEBtb3VzZUNoZWNrID0gc2V0SW50ZXJ2YWwgQGNoZWNrTW91c2UsIEBpbnRlcnZhbFxuICAgICAgICAgICAgXG4gICAgb25DbGljazogLT4gXG4gICAgXG4gICAgICAgIGNsZWFySW50ZXJ2YWwgQG1vdXNlQ2hlY2tcbiAgICAgICAgQG1vdXNlSWRsZSAgPSAwXG4gICAgICAgIEBtb3VzZUNoZWNrID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgd2EgPSBlbGVjdHJvbi5yZW1vdGUuc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWFTaXplXG4gICAgICAgIFxuICAgICAgICB3aWR0aCAgPSB3YS53aWR0aFxuICAgICAgICBoZWlnaHQgPSB3YS5oZWlnaHRcbiAgICAgICAgXG4gICAgICAgIG9mZnNldCA9IDBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnZGFyd2luJyBhbmQgcGFyc2VJbnQob3MucmVsZWFzZSgpLnNwbGl0KCcuJylbMF0pID49IDE4XG4gICAgICAgICAgICBvZmZzZXQgPSA0ICMgdHJ5IHRvIGdldCByaWQgb2YgdWdseSB0b3AgZnJhbWUgYm9yZGVyXG4gICAgICAgIFxuICAgICAgICBAc2F2ZXIgPSBuZXcgZWxlY3Ryb24ucmVtb3RlLkJyb3dzZXJXaW5kb3dcbiAgICAgICAgICAgIHg6ICAgICAgICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIHk6ICAgICAgICAgICAgICAgICAgICAgIC1vZmZzZXRcbiAgICAgICAgICAgIHdpZHRoOiAgICAgICAgICAgICAgICAgIHdpZHRoXG4gICAgICAgICAgICBoZWlnaHQ6ICAgICAgICAgICAgICAgICBoZWlnaHQrb2Zmc2V0XG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICAgICAgICAnIzAxMDAwMDAwJ1xuICAgICAgICAgICAgcmVzaXphYmxlOiAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIG1heGltaXphYmxlOiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBtaW5pbWl6YWJsZTogICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgdGhpY2tGcmFtZTogICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIGZyYW1lOiAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBmdWxsc2NyZWVuOiAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgZnVsbHNjcmVlbmVuYWJsZTogICAgICAgZmFsc2VcbiAgICAgICAgICAgIGFsd2F5c09uVG9wOiAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgIGVuYWJsZUxhcmdlclRoYW5TY3JlZW46IHRydWVcbiAgICAgICAgICAgIHRyYW5zcGFyZW50OiAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgIGFjY2VwdEZpcnN0TW91c2U6ICAgICAgIHRydWVcbiAgICAgICAgICAgIGNsb3NhYmxlOiAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgIHNob3c6ICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgIHdlYlByZWZlcmVuY2VzOiBcbiAgICAgICAgICAgICAgICBub2RlSW50ZWdyYXRpb246IHRydWVcbiAgICAgICAgICAgICAgIFxuICAgICAgICBjb2RlID0gJ3NhdmVyZGVmYXVsdCdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaHRtbCA9IFwiXCJcIlxuICAgICAgICAgICAgPCFET0NUWVBFIGh0bWw+XG4gICAgICAgICAgICA8aHRtbCBsYW5nPVwiZW5cIj5cbiAgICAgICAgICAgICAgPGhlYWQ+XG4gICAgICAgICAgICAgICAgPG1ldGEgY2hhcnNldD1cInV0Zi04XCI+XG4gICAgICAgICAgICAgICAgPG1ldGEgaHR0cC1lcXVpdj1cIkNvbnRlbnQtU2VjdXJpdHktUG9saWN5XCIgY29udGVudD1cImRlZmF1bHQtc3JjICogJ3Vuc2FmZS1pbmxpbmUnICd1bnNhZmUtZXZhbCdcIj5cbiAgICAgICAgICAgICAgPC9oZWFkPlxuICAgICAgICAgICAgICA8Ym9keSB0YWJpbmRleD0wIHN0eWxlPVwib3ZlcmZsb3c6IGhpZGRlbjsgcGFkZGluZzowOyBtYXJnaW46MDsgY3Vyc29yOiBub25lOyBwb2ludGVyLWV2ZW50czogYWxsOyBwb3NpdGlvbjogYWJzb2x1dGU7IGxlZnQ6IDA7IHRvcDogMDsgcmlnaHQ6IDA7IGJvdHRvbTogMDtcIj5cbiAgICAgICAgICAgICAgPC9ib2R5PlxuICAgICAgICAgICAgICA8c2NyaXB0PlxuICAgICAgICAgICAgICAgIFNhdmVyID0gcmVxdWlyZShcIi4vI3tjb2RlfS5qc1wiKTtcbiAgICAgICAgICAgICAgICBuZXcgU2F2ZXIoe30pO1xuICAgICAgICAgICAgICA8L3NjcmlwdD5cbiAgICAgICAgICAgIDwvaHRtbD5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgICAgICBkYXRhID0gXCJkYXRhOnRleHQvaHRtbDtjaGFyc2V0PXV0Zi04LFwiICsgZW5jb2RlVVJJIGh0bWxcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQHNhdmVyLmxvYWRVUkwgZGF0YSwgYmFzZVVSTEZvckRhdGFVUkw6c2xhc2guZmlsZVVybCBfX2Rpcm5hbWUgKyAnL2luZGV4Lmh0bWwnXG4gICAgICAgIEBzYXZlci5vbiAnY2xvc2UnIEBvblNhdmVyQ2xvc2VcbiAgICAgICAgQHNhdmVyLmZvY3VzKClcbiAgICAgICAgXG4gICAgb25Db250ZXh0TWVudTogPT4ga2xvZyAnc2F2ZXJPcHRpb25zJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNhdmVyXG4iXX0=
//# sourceURL=../coffee/saver.coffee
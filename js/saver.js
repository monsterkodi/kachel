// koffee 1.3.0

/*
 0000000   0000000   000   000  00000000  00000000 
000       000   000  000   000  000       000   000
0000000   000000000   000 000   0000000   0000000  
     000  000   000     000     000       000   000
0000000   000   000      0      00000000  000   000
 */
var Kachel, Saver, _, electron, elem, klog, kpos, post, ref, sh, slash, sw,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), sw = ref.sw, sh = ref.sh, slash = ref.slash, post = ref.post, kpos = ref.kpos, klog = ref.klog, elem = ref.elem, _ = ref._;

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
        var code, data, height, html, wa, width;
        clearInterval(this.mouseCheck);
        this.mouseIdle = 0;
        this.mouseCheck = null;
        wa = electron.remote.screen.getPrimaryDisplay().workAreaSize;
        width = wa.width;
        height = wa.height;
        this.saver = new electron.remote.BrowserWindow({
            x: 0,
            y: -4,
            width: width,
            height: height + 4,
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZXIuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLHNFQUFBO0lBQUE7Ozs7QUFRQSxNQUErQyxPQUFBLENBQVEsS0FBUixDQUEvQyxFQUFFLFdBQUYsRUFBTSxXQUFOLEVBQVUsaUJBQVYsRUFBaUIsZUFBakIsRUFBdUIsZUFBdkIsRUFBNkIsZUFBN0IsRUFBbUMsZUFBbkMsRUFBeUM7O0FBRXpDLE1BQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFDWCxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBRUw7OztJQUVDLGVBQUMsR0FBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsa0RBQVM7Ozs7UUFFViwyR0FBQSxTQUFBO1FBRUEsSUFBQyxDQUFBLEtBQUQsR0FBYztRQUNkLElBQUMsQ0FBQSxTQUFELEdBQWM7UUFDZCxJQUFDLENBQUEsT0FBRCxHQUFjO1FBQ2QsSUFBQyxDQUFBLFFBQUQsR0FBYyxJQUFBLEdBQU87SUFQdEI7O29CQVNILE1BQUEsR0FBUSxTQUFBO1FBRUosSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLElBQUEsQ0FBSyxLQUFMLEVBQVc7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFdBQU47WUFBa0IsR0FBQSxFQUFJLFNBQUEsR0FBWSxtQkFBbEM7U0FBWCxDQUFsQjtRQUVBLElBQUMsQ0FBQSxRQUFELEdBQWMsSUFBQSxDQUFLLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLG9CQUF2QixDQUFBLENBQUw7ZUFDZCxJQUFDLENBQUEsVUFBRCxHQUFjLFdBQUEsQ0FBWSxJQUFDLENBQUEsVUFBYixFQUF5QixJQUFDLENBQUEsUUFBMUI7SUFMVjs7b0JBT1IsVUFBQSxHQUFZLFNBQUE7QUFFUixZQUFBO1FBQUEsTUFBQSxHQUFTLElBQUEsQ0FBSyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxvQkFBdkIsQ0FBQSxDQUFMO1FBQ1QsSUFBRyxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsQ0FBaUIsTUFBakIsQ0FBSDtZQUNJLElBQUMsQ0FBQSxTQUFELElBQWM7WUFDZCxJQUFHLElBQUMsQ0FBQSxTQUFELElBQWMsSUFBQyxDQUFBLE9BQWxCO3VCQUNJLElBQUMsQ0FBQSxPQUFELENBQUEsRUFESjthQUZKO1NBQUEsTUFBQTtZQUtJLElBQUMsQ0FBQSxTQUFELEdBQWE7bUJBQ2IsSUFBQyxDQUFBLFFBQUQsR0FBWSxPQU5oQjs7SUFIUTs7b0JBV1osWUFBQSxHQUFjLFNBQUE7UUFFVixJQUFDLENBQUEsS0FBRCxHQUFTO2VBQ1QsSUFBQyxDQUFBLFVBQUQsR0FBYyxXQUFBLENBQVksSUFBQyxDQUFBLFVBQWIsRUFBeUIsSUFBQyxDQUFBLFFBQTFCO0lBSEo7O29CQUtkLE9BQUEsR0FBUyxTQUFBO0FBRUwsWUFBQTtRQUFBLGFBQUEsQ0FBYyxJQUFDLENBQUEsVUFBZjtRQUNBLElBQUMsQ0FBQSxTQUFELEdBQWM7UUFDZCxJQUFDLENBQUEsVUFBRCxHQUFjO1FBRWQsRUFBQSxHQUFLLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGlCQUF2QixDQUFBLENBQTBDLENBQUM7UUFFaEQsS0FBQSxHQUFTLEVBQUUsQ0FBQztRQUNaLE1BQUEsR0FBUyxFQUFFLENBQUM7UUFFWixJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxhQUFwQixDQUNMO1lBQUEsQ0FBQSxFQUF3QixDQUF4QjtZQUNBLENBQUEsRUFBd0IsQ0FBQyxDQUR6QjtZQUVBLEtBQUEsRUFBd0IsS0FGeEI7WUFHQSxNQUFBLEVBQXdCLE1BQUEsR0FBTyxDQUgvQjtZQUlBLGVBQUEsRUFBd0IsV0FKeEI7WUFLQSxTQUFBLEVBQXdCLEtBTHhCO1lBTUEsV0FBQSxFQUF3QixLQU54QjtZQU9BLFdBQUEsRUFBd0IsS0FQeEI7WUFRQSxVQUFBLEVBQXdCLEtBUnhCO1lBU0EsS0FBQSxFQUF3QixLQVR4QjtZQVVBLFVBQUEsRUFBd0IsS0FWeEI7WUFXQSxnQkFBQSxFQUF3QixLQVh4QjtZQVlBLFdBQUEsRUFBd0IsSUFaeEI7WUFhQSxzQkFBQSxFQUF3QixJQWJ4QjtZQWNBLFdBQUEsRUFBd0IsSUFkeEI7WUFlQSxnQkFBQSxFQUF3QixJQWZ4QjtZQWdCQSxRQUFBLEVBQXdCLElBaEJ4QjtZQWlCQSxJQUFBLEVBQXdCLElBakJ4QjtZQWtCQSxjQUFBLEVBQ0k7Z0JBQUEsZUFBQSxFQUFpQixJQUFqQjthQW5CSjtTQURLO1FBc0JULElBQUEsR0FBTztRQUVQLElBQUEsR0FBTyx1WkFBQSxHQVVzQixJQVZ0QixHQVUyQjtRQU1sQyxJQUFBLEdBQU8sK0JBQUEsR0FBa0MsU0FBQSxDQUFVLElBQVY7UUFFekMsSUFBQyxDQUFBLEtBQUssQ0FBQyxPQUFQLENBQWUsSUFBZixFQUFxQjtZQUFBLGlCQUFBLEVBQWtCLEtBQUssQ0FBQyxPQUFOLENBQWMsU0FBQSxHQUFZLGFBQTFCLENBQWxCO1NBQXJCO1FBQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFQLENBQVUsT0FBVixFQUFrQixJQUFDLENBQUEsWUFBbkI7ZUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLEtBQVAsQ0FBQTtJQXZESzs7b0JBeURULGFBQUEsR0FBZSxTQUFBO2VBQUcsSUFBQSxDQUFLLGNBQUw7SUFBSDs7OztHQTNGQzs7QUE2RnBCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgXG4gICAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAgICAwMDAgICAwMDAgICAgICAwICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgc3csIHNoLCBzbGFzaCwgcG9zdCwga3Bvcywga2xvZywgZWxlbSwgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5LYWNoZWwgICA9IHJlcXVpcmUgJy4va2FjaGVsJ1xuZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcblxuY2xhc3MgU2F2ZXIgZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonc2F2ZXInKSAtPiBcbiAgICBcbiAgICAgICAgc3VwZXJcbiAgICBcbiAgICAgICAgQHNhdmVyICAgICAgPSBudWxsXG4gICAgICAgIEBtb3VzZUlkbGUgID0gMFxuICAgICAgICBAbWludXRlcyAgICA9IDVcbiAgICAgICAgQGludGVydmFsICAgPSAxMDAwICogNjBcbiAgICAgICAgXG4gICAgb25Mb2FkOiAtPiBcbiAgICAgICAgXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGVsZW0gJ2ltZycgY2xhc3M6J2thY2hlbEltZycgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL3NhdmVyLnBuZydcbiAgICAgICAgXG4gICAgICAgIEBtb3VzZVBvcyAgID0ga3BvcyBlbGVjdHJvbi5yZW1vdGUuc2NyZWVuLmdldEN1cnNvclNjcmVlblBvaW50KClcbiAgICAgICAgQG1vdXNlQ2hlY2sgPSBzZXRJbnRlcnZhbCBAY2hlY2tNb3VzZSwgQGludGVydmFsXG4gICAgICAgIFxuICAgIGNoZWNrTW91c2U6ID0+XG4gICAgICAgIFxuICAgICAgICBuZXdQb3MgPSBrcG9zIGVsZWN0cm9uLnJlbW90ZS5zY3JlZW4uZ2V0Q3Vyc29yU2NyZWVuUG9pbnQoKVxuICAgICAgICBpZiBAbW91c2VQb3MuZXF1YWxzIG5ld1Bvc1xuICAgICAgICAgICAgQG1vdXNlSWRsZSArPSAxXG4gICAgICAgICAgICBpZiBAbW91c2VJZGxlID49IEBtaW51dGVzXG4gICAgICAgICAgICAgICAgQG9uQ2xpY2soKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAbW91c2VJZGxlID0gMFxuICAgICAgICAgICAgQG1vdXNlUG9zID0gbmV3UG9zXG4gICAgICAgIFxuICAgIG9uU2F2ZXJDbG9zZTogPT5cbiAgICAgICAgXG4gICAgICAgIEBzYXZlciA9IG51bGxcbiAgICAgICAgQG1vdXNlQ2hlY2sgPSBzZXRJbnRlcnZhbCBAY2hlY2tNb3VzZSwgQGludGVydmFsXG4gICAgICAgICAgICBcbiAgICBvbkNsaWNrOiAtPiBcbiAgICBcbiAgICAgICAgY2xlYXJJbnRlcnZhbCBAbW91c2VDaGVja1xuICAgICAgICBAbW91c2VJZGxlICA9IDBcbiAgICAgICAgQG1vdXNlQ2hlY2sgPSBudWxsXG4gICAgICAgIFxuICAgICAgICB3YSA9IGVsZWN0cm9uLnJlbW90ZS5zY3JlZW4uZ2V0UHJpbWFyeURpc3BsYXkoKS53b3JrQXJlYVNpemVcbiAgICAgICAgXG4gICAgICAgIHdpZHRoICA9IHdhLndpZHRoXG4gICAgICAgIGhlaWdodCA9IHdhLmhlaWdodFxuICAgICAgICBcbiAgICAgICAgQHNhdmVyID0gbmV3IGVsZWN0cm9uLnJlbW90ZS5Ccm93c2VyV2luZG93XG4gICAgICAgICAgICB4OiAgICAgICAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICB5OiAgICAgICAgICAgICAgICAgICAgICAtNFxuICAgICAgICAgICAgd2lkdGg6ICAgICAgICAgICAgICAgICAgd2lkdGhcbiAgICAgICAgICAgIGhlaWdodDogICAgICAgICAgICAgICAgIGhlaWdodCs0XG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICAgICAgICAnIzAxMDAwMDAwJ1xuICAgICAgICAgICAgcmVzaXphYmxlOiAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIG1heGltaXphYmxlOiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBtaW5pbWl6YWJsZTogICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgdGhpY2tGcmFtZTogICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIGZyYW1lOiAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICBmdWxsc2NyZWVuOiAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgZnVsbHNjcmVlbmVuYWJsZTogICAgICAgZmFsc2VcbiAgICAgICAgICAgIGFsd2F5c09uVG9wOiAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgIGVuYWJsZUxhcmdlclRoYW5TY3JlZW46IHRydWVcbiAgICAgICAgICAgIHRyYW5zcGFyZW50OiAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgIGFjY2VwdEZpcnN0TW91c2U6ICAgICAgIHRydWVcbiAgICAgICAgICAgIGNsb3NhYmxlOiAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgIHNob3c6ICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgIHdlYlByZWZlcmVuY2VzOiBcbiAgICAgICAgICAgICAgICBub2RlSW50ZWdyYXRpb246IHRydWVcbiAgICAgICAgICAgICAgIFxuICAgICAgICBjb2RlID0gJ3NhdmVyZGVmYXVsdCdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaHRtbCA9IFwiXCJcIlxuICAgICAgICAgICAgPCFET0NUWVBFIGh0bWw+XG4gICAgICAgICAgICA8aHRtbCBsYW5nPVwiZW5cIj5cbiAgICAgICAgICAgICAgPGhlYWQ+XG4gICAgICAgICAgICAgICAgPG1ldGEgY2hhcnNldD1cInV0Zi04XCI+XG4gICAgICAgICAgICAgICAgPG1ldGEgaHR0cC1lcXVpdj1cIkNvbnRlbnQtU2VjdXJpdHktUG9saWN5XCIgY29udGVudD1cImRlZmF1bHQtc3JjICogJ3Vuc2FmZS1pbmxpbmUnICd1bnNhZmUtZXZhbCdcIj5cbiAgICAgICAgICAgICAgPC9oZWFkPlxuICAgICAgICAgICAgICA8Ym9keSB0YWJpbmRleD0wIHN0eWxlPVwib3ZlcmZsb3c6IGhpZGRlbjsgcGFkZGluZzowOyBtYXJnaW46MDsgY3Vyc29yOiBub25lOyBwb2ludGVyLWV2ZW50czogYWxsOyBwb3NpdGlvbjogYWJzb2x1dGU7IGxlZnQ6IDA7IHRvcDogMDsgcmlnaHQ6IDA7IGJvdHRvbTogMDtcIj5cbiAgICAgICAgICAgICAgPC9ib2R5PlxuICAgICAgICAgICAgICA8c2NyaXB0PlxuICAgICAgICAgICAgICAgIFNhdmVyID0gcmVxdWlyZShcIi4vI3tjb2RlfS5qc1wiKTtcbiAgICAgICAgICAgICAgICBuZXcgU2F2ZXIoe30pO1xuICAgICAgICAgICAgICA8L3NjcmlwdD5cbiAgICAgICAgICAgIDwvaHRtbD5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIFxuICAgICAgICBkYXRhID0gXCJkYXRhOnRleHQvaHRtbDtjaGFyc2V0PXV0Zi04LFwiICsgZW5jb2RlVVJJIGh0bWxcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQHNhdmVyLmxvYWRVUkwgZGF0YSwgYmFzZVVSTEZvckRhdGFVUkw6c2xhc2guZmlsZVVybCBfX2Rpcm5hbWUgKyAnL2luZGV4Lmh0bWwnXG4gICAgICAgIEBzYXZlci5vbiAnY2xvc2UnIEBvblNhdmVyQ2xvc2VcbiAgICAgICAgQHNhdmVyLmZvY3VzKClcbiAgICAgICAgXG4gICAgb25Db250ZXh0TWVudTogPT4ga2xvZyAnc2F2ZXJPcHRpb25zJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNhdmVyXG4iXX0=
//# sourceURL=../coffee/saver.coffee
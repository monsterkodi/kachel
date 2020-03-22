// koffee 1.12.0

/*
 0000000   00000000   00000000   000      
000   000  000   000  000   000  000      
000000000  00000000   00000000   000      
000   000  000        000        000      
000   000  000        000        0000000
 */
var $, Appl, Kachel, _, app, appIcon, elem, empty, kstr, open, os, post, ref, slash, utils, valid, wxw,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), $ = ref.$, _ = ref._, app = ref.app, elem = ref.elem, empty = ref.empty, kstr = ref.kstr, open = ref.open, os = ref.os, post = ref.post, slash = ref.slash, valid = ref.valid;

Kachel = require('./kachel');

appIcon = require('./icon');

utils = require('./utils');

wxw = require('wxw');

Appl = (function(superClass) {
    extend(Appl, superClass);

    function Appl(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'appl';
        this.setIcon = bind(this.setIcon, this);
        this.refreshIcon = bind(this.refreshIcon, this);
        this.onInitKachel = bind(this.onInitKachel, this);
        this.onMiddleClick = bind(this.onMiddleClick, this);
        this.onRightClick = bind(this.onRightClick, this);
        this.onLeftClick = bind(this.onLeftClick, this);
        this.onBounds = bind(this.onBounds, this);
        this.onWin = bind(this.onWin, this);
        this.onApp = bind(this.onApp, this);
        _;
        post.on('app', this.onApp);
        post.on('win', this.onWin);
        this.activated = false;
        this.status = '';
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Appl.__super__.constructor.apply(this, arguments);
    }

    Appl.prototype.onApp = function(action, app) {
        this.activated = action === 'activated';
        return this.updateDot();
    };

    Appl.prototype.onWin = function(wins) {
        var c, i, j, k, len, len1, len2, ref1, w;
        this.status = '';
        for (i = 0, len = wins.length; i < len; i++) {
            w = wins[i];
            ref1 = ['maximized', 'normal'];
            for (j = 0, len1 = ref1.length; j < len1; j++) {
                c = ref1[j];
                if (w.status.startsWith(c)) {
                    this.status = w.status;
                    break;
                }
            }
            if (valid(this.status)) {
                break;
            }
        }
        if (empty(this.status)) {
            for (k = 0, len2 = wins.length; k < len2; k++) {
                w = wins[k];
                if (w.status === 'minimized') {
                    this.status = 'minimized';
                    break;
                }
            }
        }
        return this.updateDot();
    };

    Appl.prototype.onBounds = function() {
        var dot;
        if (os.platform() === 'win32') {
            if (dot = $('.appldot')) {
                dot.remove();
                return this.updateDot();
            }
        }
    };

    Appl.prototype.updateDot = function() {
        var crc, defs, dot, grd, grp, i, len, ref1, results, s, stp;
        dot = $('.appldot');
        if (this.activated && !dot) {
            dot = utils.svg({
                width: 16,
                height: 16,
                clss: 'appldot'
            });
            defs = utils.append(dot, 'defs');
            grd = utils.append(defs, 'linearGradient', {
                id: 'appldotstroke',
                x1: "0%",
                y1: "0%",
                x2: "100%",
                y2: "100%"
            });
            stp = utils.append(grd, 'stop', {
                offset: "0%",
                'stop-color': "#0a0a0a"
            });
            stp = utils.append(grd, 'stop', {
                offset: "100%",
                'stop-color': "#202020"
            });
            grp = utils.append(dot, 'g');
            crc = utils.append(grp, 'circle', {
                cx: 0,
                cy: 0,
                r: 7,
                "class": 'applcircle'
            });
            this.main.appendChild(dot);
        } else if (!this.activated && dot) {
            if (dot != null) {
                dot.remove();
            }
            dot = null;
        }
        if (dot) {
            dot.classList.remove('top');
            dot.classList.remove('normal');
            dot.classList.remove('minimized');
            dot.classList.remove('maximized');
            if (valid(this.status)) {
                ref1 = this.status.split(' ');
                results = [];
                for (i = 0, len = ref1.length; i < len; i++) {
                    s = ref1[i];
                    results.push(dot.classList.add(s));
                }
                return results;
            }
        }
    };

    Appl.prototype.openApp = function(app) {
        var infos;
        if (os.platform() === 'win32') {
            infos = wxw('info', slash.file(app));
            if (infos.length) {
                return wxw('focus', slash.file(app));
            } else {
                return open(slash.unslash(app));
            }
        } else {
            return open(app);
        }
    };

    Appl.prototype.onLeftClick = function() {
        return this.openApp(this.kachelId);
    };

    Appl.prototype.onRightClick = function() {
        return wxw('minimize', slash.file(this.kachelId));
    };

    Appl.prototype.onMiddleClick = function() {
        return wxw('terminate', this.kachelId);
    };

    Appl.prototype.onInitKachel = function(kachelId) {
        var appName, base, iconDir, iconPath, minutes;
        this.kachelId = kachelId;
        iconDir = slash.join(slash.userData(), 'icons');
        appName = slash.base(this.kachelId);
        iconPath = iconDir + "/" + appName + ".png";
        if (!slash.isFile(iconPath)) {
            this.refreshIcon();
        } else {
            this.setIcon(iconPath);
        }
        base = slash.base(this.kachelId);
        if (base === 'Calendar') {
            minutes = {
                Calendar: 60
            }[base];
            this.refreshIcon();
            setInterval(this.refreshIcon, 1000 * 60 * minutes);
        }
        return Appl.__super__.onInitKachel.call(this, this.kachelId);
    };

    Appl.prototype.refreshIcon = function() {
        var appName, base, day, iconDir, mth, pngPath, time;
        iconDir = slash.join(slash.userData(), 'icons');
        appName = slash.base(this.kachelId);
        pngPath = slash.resolve(slash.join(iconDir, appName + ".png"));
        appIcon(this.kachelId, pngPath);
        this.setIcon(pngPath);
        base = slash.base(this.kachelId);
        if (base === 'Calendar') {
            time = new Date();
            day = elem({
                "class": 'calendarDay',
                text: kstr.lpad(time.getDate(), 2, '0')
            });
            this.main.appendChild(day);
            mth = elem({
                "class": 'calendarMonth',
                text: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][time.getMonth()]
            });
            return this.main.appendChild(mth);
        }
    };

    Appl.prototype.setIcon = function(iconPath) {
        if (!iconPath) {
            return;
        }
        Appl.__super__.setIcon.apply(this, arguments);
        return this.updateDot();
    };

    return Appl;

})(Kachel);

module.exports = Appl;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbC5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImFwcGwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLGtHQUFBO0lBQUE7Ozs7QUFRQSxNQUFpRSxPQUFBLENBQVEsS0FBUixDQUFqRSxFQUFFLFNBQUYsRUFBSyxTQUFMLEVBQVEsYUFBUixFQUFhLGVBQWIsRUFBbUIsaUJBQW5CLEVBQTBCLGVBQTFCLEVBQWdDLGVBQWhDLEVBQXNDLFdBQXRDLEVBQTBDLGVBQTFDLEVBQWdELGlCQUFoRCxFQUF1RDs7QUFFdkQsTUFBQSxHQUFVLE9BQUEsQ0FBUSxVQUFSOztBQUNWLE9BQUEsR0FBVSxPQUFBLENBQVEsUUFBUjs7QUFDVixLQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0FBQ1YsR0FBQSxHQUFVLE9BQUEsQ0FBUSxLQUFSOztBQUVKOzs7SUFFQyxjQUFDLEdBQUQ7QUFDQyxZQUFBO1FBREEsSUFBQyxDQUFBLGtEQUFTOzs7Ozs7Ozs7O1FBQ1Y7UUFDQSxJQUFJLENBQUMsRUFBTCxDQUFRLEtBQVIsRUFBYyxJQUFDLENBQUEsS0FBZjtRQUNBLElBQUksQ0FBQyxFQUFMLENBQVEsS0FBUixFQUFjLElBQUMsQ0FBQSxLQUFmO1FBRUEsSUFBQyxDQUFBLFNBQUQsR0FBYTtRQUNiLElBQUMsQ0FBQSxNQUFELEdBQWE7UUFFYiwwR0FBQSxTQUFBO0lBUkQ7O21CQVVILEtBQUEsR0FBTyxTQUFDLE1BQUQsRUFBUyxHQUFUO1FBRUgsSUFBQyxDQUFBLFNBQUQsR0FBYSxNQUFBLEtBQVU7ZUFDdkIsSUFBQyxDQUFBLFNBQUQsQ0FBQTtJQUhHOzttQkFLUCxLQUFBLEdBQU8sU0FBQyxJQUFEO0FBRUgsWUFBQTtRQUFBLElBQUMsQ0FBQSxNQUFELEdBQVU7QUFDVixhQUFBLHNDQUFBOztBQUNJO0FBQUEsaUJBQUEsd0NBQUE7O2dCQUNJLElBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFULENB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LEdBQU0sSUFBQSxDQUFLO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sZUFBTjtnQkFBc0IsSUFBQSxFQUFLLENBQUMsS0FBRCxFQUFPLEtBQVAsRUFBYSxLQUFiLEVBQW1CLEtBQW5CLEVBQXlCLEtBQXpCLEVBQStCLEtBQS9CLEVBQXFDLEtBQXJDLEVBQTJDLEtBQTNDLEVBQWlELEtBQWpELEVBQXVELEtBQXZELEVBQTZELEtBQTdELEVBQW1FLEtBQW5FLENBQTBFLENBQUEsSUFBSSxDQUFDLFFBQUwsQ0FBQSxDQUFBLENBQXJHO2FBQUw7bUJBQ04sSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLEdBQWxCLEVBTEo7O0lBVlM7O21CQWlCYixPQUFBLEdBQVMsU0FBQyxRQUFEO1FBRUwsSUFBVSxDQUFJLFFBQWQ7QUFBQSxtQkFBQTs7UUFDQSxtQ0FBQSxTQUFBO2VBQ0EsSUFBQyxDQUFBLFNBQUQsQ0FBQTtJQUpLOzs7O0dBaEpNOztBQXNKbkIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgICAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4wMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgICAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMCAgICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwMDAwMCAgXG4jIyNcblxueyAkLCBfLCBhcHAsIGVsZW0sIGVtcHR5LCBrc3RyLCBvcGVuLCBvcywgcG9zdCwgc2xhc2gsIHZhbGlkIH0gPSByZXF1aXJlICdreGsnXG5cbkthY2hlbCAgPSByZXF1aXJlICcuL2thY2hlbCdcbmFwcEljb24gPSByZXF1aXJlICcuL2ljb24nXG51dGlscyAgID0gcmVxdWlyZSAnLi91dGlscydcbnd4dyAgICAgPSByZXF1aXJlICd3eHcnXG5cbmNsYXNzIEFwcGwgZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonYXBwbCcpIC0+XG4gICAgICAgIF9cbiAgICAgICAgcG9zdC5vbiAnYXBwJyBAb25BcHBcbiAgICAgICAgcG9zdC5vbiAnd2luJyBAb25XaW5cbiAgICAgICAgXG4gICAgICAgIEBhY3RpdmF0ZWQgPSBmYWxzZVxuICAgICAgICBAc3RhdHVzICAgID0gJydcbiAgICAgICAgXG4gICAgICAgIHN1cGVyXG4gICAgICAgICAgICAgICAgXG4gICAgb25BcHA6IChhY3Rpb24sIGFwcCkgPT5cbiAgICAgICAgXG4gICAgICAgIEBhY3RpdmF0ZWQgPSBhY3Rpb24gPT0gJ2FjdGl2YXRlZCdcbiAgICAgICAgQHVwZGF0ZURvdCgpXG5cbiAgICBvbldpbjogKHdpbnMpID0+XG4gICAgICAgIFxuICAgICAgICBAc3RhdHVzID0gJydcbiAgICAgICAgZm9yIHcgaW4gd2luc1xuICAgICAgICAgICAgZm9yIGMgaW4gWydtYXhpbWl6ZWQnICdub3JtYWwnXVxuICAgICAgICAgICAgICAgIGlmIHcuc3RhdHVzLnN0YXJ0c1dpdGggY1xuICAgICAgICAgICAgICAgICAgICBAc3RhdHVzID0gdy5zdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGlmIHZhbGlkIEBzdGF0dXNcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBlbXB0eSBAc3RhdHVzXG4gICAgICAgICAgICBmb3IgdyBpbiB3aW5zXG4gICAgICAgICAgICAgICAgaWYgdy5zdGF0dXMgPT0gJ21pbmltaXplZCdcbiAgICAgICAgICAgICAgICAgICAgQHN0YXR1cyA9ICdtaW5pbWl6ZWQnXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIFxuICAgICAgICBAdXBkYXRlRG90KClcbiAgICAgICAgXG4gICAgb25Cb3VuZHM6ID0+XG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMicgIyBvbiB3aW5kb3dzLFxuICAgICAgICAgICAgaWYgZG90ID0kICcuYXBwbGRvdCcgICAgIyBmb3Igc29tZSByZWFzb24gdGhlIGNvbnRlbnQgXG4gICAgICAgICAgICAgICAgZG90LnJlbW92ZSgpICAgICAgICAjIGRvZXNuJ3QgZ2V0IHVwZGF0ZWQgaW1tZWRpYXRlbHkgb24gcmVzaXplIFxuICAgICAgICAgICAgICAgIEB1cGRhdGVEb3QoKSAgICAgICAgIyBpZiB0aGVyZSBpcyBhIGRvdCBzdmcgcHJlc2VudFxuICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgdXBkYXRlRG90OiAtPlxuICAgICAgICBcbiAgICAgICAgZG90ID0kICcuYXBwbGRvdCdcbiAgICAgICAgXG4gICAgICAgIGlmIEBhY3RpdmF0ZWQgYW5kIG5vdCBkb3RcbiAgICAgICAgICAgIGRvdCA9IHV0aWxzLnN2ZyB3aWR0aDoxNiBoZWlnaHQ6MTYgY2xzczonYXBwbGRvdCdcbiAgICAgICAgICAgIGRlZnMgPSB1dGlscy5hcHBlbmQgZG90LCAnZGVmcydcbiAgICAgICAgICAgIGdyZCA9IHV0aWxzLmFwcGVuZCBkZWZzLCAnbGluZWFyR3JhZGllbnQnLCBpZDonYXBwbGRvdHN0cm9rZScgeDE6XCIwJVwiIHkxOlwiMCVcIiB4MjpcIjEwMCVcIiB5MjpcIjEwMCVcIlxuICAgICAgICAgICAgc3RwID0gdXRpbHMuYXBwZW5kIGdyZCwgJ3N0b3AnIG9mZnNldDpcIjAlXCIgJ3N0b3AtY29sb3InOlwiIzBhMGEwYVwiXG4gICAgICAgICAgICBzdHAgPSB1dGlscy5hcHBlbmQgZ3JkLCAnc3RvcCcgb2Zmc2V0OlwiMTAwJVwiICdzdG9wLWNvbG9yJzpcIiMyMDIwMjBcIlxuICAgICAgICAgICAgZ3JwID0gdXRpbHMuYXBwZW5kIGRvdCwgJ2cnXG4gICAgICAgICAgICBjcmMgPSB1dGlscy5hcHBlbmQgZ3JwLCAnY2lyY2xlJyBjeDowIGN5OjAgcjo3IGNsYXNzOidhcHBsY2lyY2xlJ1xuICAgICAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgZG90XG4gICAgICAgIGVsc2UgaWYgbm90IEBhY3RpdmF0ZWQgYW5kIGRvdFxuICAgICAgICAgICAgZG90Py5yZW1vdmUoKVxuICAgICAgICAgICAgZG90ID0gbnVsbFxuICAgICAgICAgICAgXG4gICAgICAgIGlmIGRvdFxuICAgICAgICAgICAgZG90LmNsYXNzTGlzdC5yZW1vdmUgJ3RvcCdcbiAgICAgICAgICAgIGRvdC5jbGFzc0xpc3QucmVtb3ZlICdub3JtYWwnXG4gICAgICAgICAgICBkb3QuY2xhc3NMaXN0LnJlbW92ZSAnbWluaW1pemVkJ1xuICAgICAgICAgICAgZG90LmNsYXNzTGlzdC5yZW1vdmUgJ21heGltaXplZCdcbiAgICAgICAgICAgIGlmIHZhbGlkIEBzdGF0dXNcbiAgICAgICAgICAgICAgICBmb3IgcyBpbiBAc3RhdHVzLnNwbGl0ICcgJ1xuICAgICAgICAgICAgICAgICAgICBkb3QuY2xhc3NMaXN0LmFkZCBzXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAgICAgICAgIFxuICAgIG9wZW5BcHA6IChhcHApIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgIGluZm9zID0gd3h3ICdpbmZvJyBzbGFzaC5maWxlIGFwcFxuICAgICAgICAgICAgaWYgaW5mb3MubGVuZ3RoXG4gICAgICAgICAgICAgICAgd3h3ICdmb2N1cycgc2xhc2guZmlsZSBhcHBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBvcGVuIHNsYXNoLnVuc2xhc2ggYXBwXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG9wZW4gYXBwXG4gICAgXG4gICAgb25MZWZ0Q2xpY2s6ID0+IEBvcGVuQXBwIEBrYWNoZWxJZFxuICAgIG9uUmlnaHRDbGljazogPT4gd3h3ICdtaW5pbWl6ZScgc2xhc2guZmlsZSBAa2FjaGVsSWRcbiAgICBvbk1pZGRsZUNsaWNrOiA9PiB3eHcgJ3Rlcm1pbmF0ZScgQGthY2hlbElkXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgb25Jbml0S2FjaGVsOiAoQGthY2hlbElkKSA9PlxuICAgICAgICAgICAgXG4gICAgICAgIGljb25EaXIgPSBzbGFzaC5qb2luIHNsYXNoLnVzZXJEYXRhKCksICdpY29ucydcbiAgICAgICAgYXBwTmFtZSA9IHNsYXNoLmJhc2UgQGthY2hlbElkXG4gICAgICAgIGljb25QYXRoID0gXCIje2ljb25EaXJ9LyN7YXBwTmFtZX0ucG5nXCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgbm90IHNsYXNoLmlzRmlsZSBpY29uUGF0aFxuICAgICAgICAgICAgQHJlZnJlc2hJY29uKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNldEljb24gaWNvblBhdGhcbiAgICAgICAgICAgXG4gICAgICAgIGJhc2UgPSBzbGFzaC5iYXNlIEBrYWNoZWxJZFxuICAgICAgICBpZiBiYXNlIGluIFsnQ2FsZW5kYXInXVxuICAgICAgICAgICAgbWludXRlcyA9IHtDYWxlbmRhcjo2MH1bYmFzZV1cbiAgICAgICAgICAgIEByZWZyZXNoSWNvbigpXG4gICAgICAgICAgICBzZXRJbnRlcnZhbCBAcmVmcmVzaEljb24sIDEwMDAqNjAqbWludXRlc1xuICAgICAgICAgICAgXG4gICAgICAgIHN1cGVyIEBrYWNoZWxJZFxuICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAgICAgXG4gICAgcmVmcmVzaEljb246ID0+XG4gICAgICAgIFxuICAgICAgICBpY29uRGlyID0gc2xhc2guam9pbiBzbGFzaC51c2VyRGF0YSgpLCAnaWNvbnMnXG4gICAgICAgIGFwcE5hbWUgPSBzbGFzaC5iYXNlIEBrYWNoZWxJZFxuICAgICAgICBwbmdQYXRoID0gc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIGljb25EaXIsIGFwcE5hbWUgKyBcIi5wbmdcIlxuICAgICAgICBcbiAgICAgICAgYXBwSWNvbiBAa2FjaGVsSWQsIHBuZ1BhdGhcbiAgICAgICAgQHNldEljb24gcG5nUGF0aFxuICAgICAgICBcbiAgICAgICAgYmFzZSA9IHNsYXNoLmJhc2UgQGthY2hlbElkXG4gICAgICAgIGlmIGJhc2UgaW4gWydDYWxlbmRhciddXG4gICAgICAgICAgICB0aW1lID0gbmV3IERhdGUoKVxuICAgICAgICAgICAgZGF5ID0gZWxlbSBjbGFzczonY2FsZW5kYXJEYXknIHRleHQ6a3N0ci5scGFkIHRpbWUuZ2V0RGF0ZSgpLCAyLCAnMCdcbiAgICAgICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGRheVxuICAgICAgICAgICAgbXRoID0gZWxlbSBjbGFzczonY2FsZW5kYXJNb250aCcgdGV4dDpbJ0pBTicgJ0ZFQicgJ01BUicgJ0FQUicgJ01BWScgJ0pVTicgJ0pVTCcgJ0FVRycgJ1NFUCcgJ09DVCcgJ05PVicgJ0RFQyddW3RpbWUuZ2V0TW9udGgoKV1cbiAgICAgICAgICAgIEBtYWluLmFwcGVuZENoaWxkIG10aFxuICAgICAgICAgICAgICAgIFxuICAgIHNldEljb246IChpY29uUGF0aCkgPT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgaWNvblBhdGhcbiAgICAgICAgc3VwZXJcbiAgICAgICAgQHVwZGF0ZURvdCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gQXBwbFxuIl19
//# sourceURL=../coffee/appl.coffee
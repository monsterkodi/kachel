// koffee 1.4.0

/*
 0000000   00000000   00000000   000      
000   000  000   000  000   000  000      
000000000  00000000   00000000   000      
000   000  000        000        000      
000   000  000        000        0000000
 */
var $, Appl, Kachel, _, appIcon, childp, elem, empty, fs, klog, kstr, open, os, post, randint, ref, slash, utils, valid, wxw,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, childp = ref.childp, slash = ref.slash, empty = ref.empty, valid = ref.valid, randint = ref.randint, klog = ref.klog, kstr = ref.kstr, elem = ref.elem, open = ref.open, os = ref.os, fs = ref.fs, $ = ref.$, _ = ref._;

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
        var crc, def, dot, grd, grp, i, len, ref1, results, s, stp;
        dot = $('.appldot');
        if (this.activated && !dot) {
            dot = utils.svg({
                width: 16,
                height: 16,
                clss: 'appldot'
            });
            def = utils.append(dot, 'defs');
            grd = utils.append(def, 'linearGradient', {
                id: 'appldotstroke',
                x1: "0%",
                y1: "0%",
                x2: "100%",
                y2: "100%"
            });
            stp = utils.append(grd, 'stop', {
                offset: "0%",
                'stop-color': "#111"
            });
            stp = utils.append(grd, 'stop', {
                offset: "100%",
                'stop-color': "#333"
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsd0hBQUE7SUFBQTs7OztBQVFBLE1BQXVGLE9BQUEsQ0FBUSxLQUFSLENBQXZGLEVBQUUsZUFBRixFQUFRLG1CQUFSLEVBQWdCLGlCQUFoQixFQUF1QixpQkFBdkIsRUFBOEIsaUJBQTlCLEVBQXFDLHFCQUFyQyxFQUE4QyxlQUE5QyxFQUFvRCxlQUFwRCxFQUEwRCxlQUExRCxFQUFnRSxlQUFoRSxFQUFzRSxXQUF0RSxFQUEwRSxXQUExRSxFQUE4RSxTQUE5RSxFQUFpRjs7QUFFakYsTUFBQSxHQUFVLE9BQUEsQ0FBUSxVQUFSOztBQUNWLE9BQUEsR0FBVSxPQUFBLENBQVEsUUFBUjs7QUFDVixLQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0FBQ1YsR0FBQSxHQUFVLE9BQUEsQ0FBUSxLQUFSOztBQUVKOzs7SUFFQyxjQUFDLEdBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLGtEQUFTOzs7Ozs7Ozs7O1FBRVYsSUFBSSxDQUFDLEVBQUwsQ0FBUSxLQUFSLEVBQWMsSUFBQyxDQUFBLEtBQWY7UUFDQSxJQUFJLENBQUMsRUFBTCxDQUFRLEtBQVIsRUFBYyxJQUFDLENBQUEsS0FBZjtRQUVBLElBQUMsQ0FBQSxTQUFELEdBQWE7UUFDYixJQUFDLENBQUEsTUFBRCxHQUFhO1FBRWIsMEdBQUEsU0FBQTtJQVJEOzttQkFVSCxLQUFBLEdBQU8sU0FBQyxNQUFELEVBQVMsR0FBVDtRQUVILElBQUMsQ0FBQSxTQUFELEdBQWEsTUFBQSxLQUFVO2VBQ3ZCLElBQUMsQ0FBQSxTQUFELENBQUE7SUFIRzs7bUJBS1AsS0FBQSxHQUFPLFNBQUMsSUFBRDtBQUVILFlBQUE7UUFBQSxJQUFDLENBQUEsTUFBRCxHQUFVO0FBQ1YsYUFBQSxzQ0FBQTs7QUFDSTtBQUFBLGlCQUFBLHdDQUFBOztnQkFDSSxJQUFHLENBQUMsQ0FB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QWtCLEdBQWxCO1lBQ0EsR0FBQSxHQUFNLElBQUEsQ0FBSztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLGVBQU47Z0JBQXNCLElBQUEsRUFBSyxDQUFDLEtBQUQsRUFBTyxLQUFQLEVBQWEsS0FBYixFQUFtQixLQUFuQixFQUF5QixLQUF6QixFQUErQixLQUEvQixFQUFxQyxLQUFyQyxFQUEyQyxLQUEzQyxFQUFpRCxLQUFqRCxFQUF1RCxLQUF2RCxFQUE2RCxLQUE3RCxFQUFtRSxLQUFuRSxDQUEwRSxDQUFBLElBQUksQ0FBQyxRQUFMLENBQUEsQ0FBQSxDQUFyRzthQUFMO21CQUNOLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixHQUFsQixFQUxKOztJQVZTOzttQkFpQmIsT0FBQSxHQUFTLFNBQUMsUUFBRDtRQUVMLElBQVUsQ0FBSSxRQUFkO0FBQUEsbUJBQUE7O1FBQ0EsbUNBQUEsU0FBQTtlQUNBLElBQUMsQ0FBQSxTQUFELENBQUE7SUFKSzs7OztHQWhKTTs7QUFzSm5CLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgICAgICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAgICAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMDAwMDAgIFxuIyMjXG5cbnsgcG9zdCwgY2hpbGRwLCBzbGFzaCwgZW1wdHksIHZhbGlkLCByYW5kaW50LCBrbG9nLCBrc3RyLCBlbGVtLCBvcGVuLCBvcywgZnMsICQsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuS2FjaGVsICA9IHJlcXVpcmUgJy4va2FjaGVsJ1xuYXBwSWNvbiA9IHJlcXVpcmUgJy4vaWNvbidcbnV0aWxzICAgPSByZXF1aXJlICcuL3V0aWxzJ1xud3h3ICAgICA9IHJlcXVpcmUgJ3d4dydcblxuY2xhc3MgQXBwbCBleHRlbmRzIEthY2hlbFxuICAgICAgICBcbiAgICBAOiAoQGthY2hlbElkOidhcHBsJykgLT4gXG4gICAgXG4gICAgICAgIHBvc3Qub24gJ2FwcCcgQG9uQXBwXG4gICAgICAgIHBvc3Qub24gJ3dpbicgQG9uV2luXG4gICAgICAgIFxuICAgICAgICBAYWN0aXZhdGVkID0gZmFsc2VcbiAgICAgICAgQHN0YXR1cyAgICA9ICcnXG4gICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICAgICAgICAgIFxuICAgIG9uQXBwOiAoYWN0aW9uLCBhcHApID0+XG4gICAgICAgIFxuICAgICAgICBAYWN0aXZhdGVkID0gYWN0aW9uID09ICdhY3RpdmF0ZWQnXG4gICAgICAgIEB1cGRhdGVEb3QoKVxuXG4gICAgb25XaW46ICh3aW5zKSA9PlxuICAgICAgICBcbiAgICAgICAgQHN0YXR1cyA9ICcnXG4gICAgICAgIGZvciB3IGluIHdpbnNcbiAgICAgICAgICAgIGZvciBjIGluIFsnbWF4aW1pemVkJyAnbm9ybWFsJ11cbiAgICAgICAgICAgICAgICBpZiB3LnN0YXR1cy5zdGFydHNXaXRoIGNcbiAgICAgICAgICAgICAgICAgICAgQHN0YXR1cyA9IHcuc3RhdHVzXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBpZiB2YWxpZCBAc3RhdHVzXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgZW1wdHkgQHN0YXR1c1xuICAgICAgICAgICAgZm9yIHcgaW4gd2luc1xuICAgICAgICAgICAgICAgIGlmIHcuc3RhdHVzID09ICdtaW5pbWl6ZWQnXG4gICAgICAgICAgICAgICAgICAgIEBzdGF0dXMgPSAnbWluaW1pemVkJ1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICBcbiAgICAgICAgQHVwZGF0ZURvdCgpXG4gICAgICAgIFxuICAgIG9uQm91bmRzOiA9PlxuICAgICAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInICMgb24gd2luZG93cyxcbiAgICAgICAgICAgIGlmIGRvdCA9JCAnLmFwcGxkb3QnICAgICMgZm9yIHNvbWUgcmVhc29uIHRoZSBjb250ZW50IFxuICAgICAgICAgICAgICAgIGRvdC5yZW1vdmUoKSAgICAgICAgIyBkb2Vzbid0IGdldCB1cGRhdGVkIGltbWVkaWF0ZWx5IG9uIHJlc2l6ZSBcbiAgICAgICAgICAgICAgICBAdXBkYXRlRG90KCkgICAgICAgICMgaWYgdGhlcmUgaXMgYSBkb3Qgc3ZnIHByZXNlbnRcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuICAgIFxuICAgIHVwZGF0ZURvdDogLT5cbiAgICAgICAgXG4gICAgICAgIGRvdCA9JCAnLmFwcGxkb3QnXG4gICAgICAgIFxuICAgICAgICBpZiBAYWN0aXZhdGVkIGFuZCBub3QgZG90XG4gICAgICAgICAgICBkb3QgPSB1dGlscy5zdmcgd2lkdGg6MTYgaGVpZ2h0OjE2IGNsc3M6J2FwcGxkb3QnXG4gICAgICAgICAgICBkZWYgPSB1dGlscy5hcHBlbmQgZG90LCAnZGVmcydcbiAgICAgICAgICAgIGdyZCA9IHV0aWxzLmFwcGVuZCBkZWYsICdsaW5lYXJHcmFkaWVudCcsIGlkOidhcHBsZG90c3Ryb2tlJyB4MTpcIjAlXCIgeTE6XCIwJVwiIHgyOlwiMTAwJVwiIHkyOlwiMTAwJVwiXG4gICAgICAgICAgICBzdHAgPSB1dGlscy5hcHBlbmQgZ3JkLCAnc3RvcCcgb2Zmc2V0OlwiMCVcIiAnc3RvcC1jb2xvcic6XCIjMTExXCJcbiAgICAgICAgICAgIHN0cCA9IHV0aWxzLmFwcGVuZCBncmQsICdzdG9wJyBvZmZzZXQ6XCIxMDAlXCIgJ3N0b3AtY29sb3InOlwiIzMzM1wiXG4gICAgICAgICAgICBncnAgPSB1dGlscy5hcHBlbmQgZG90LCAnZydcbiAgICAgICAgICAgIGNyYyA9IHV0aWxzLmFwcGVuZCBncnAsICdjaXJjbGUnIGN4OjAgY3k6MCByOjcgY2xhc3M6J2FwcGxjaXJjbGUnXG4gICAgICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBkb3RcbiAgICAgICAgZWxzZSBpZiBub3QgQGFjdGl2YXRlZCBhbmQgZG90XG4gICAgICAgICAgICBkb3Q/LnJlbW92ZSgpXG4gICAgICAgICAgICBkb3QgPSBudWxsXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgZG90XG4gICAgICAgICAgICBkb3QuY2xhc3NMaXN0LnJlbW92ZSAndG9wJ1xuICAgICAgICAgICAgZG90LmNsYXNzTGlzdC5yZW1vdmUgJ25vcm1hbCdcbiAgICAgICAgICAgIGRvdC5jbGFzc0xpc3QucmVtb3ZlICdtaW5pbWl6ZWQnXG4gICAgICAgICAgICBkb3QuY2xhc3NMaXN0LnJlbW92ZSAnbWF4aW1pemVkJ1xuICAgICAgICAgICAgaWYgdmFsaWQgQHN0YXR1c1xuICAgICAgICAgICAgICAgIGZvciBzIGluIEBzdGF0dXMuc3BsaXQgJyAnXG4gICAgICAgICAgICAgICAgICAgIGRvdC5jbGFzc0xpc3QuYWRkIHNcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgXG4gICAgb3BlbkFwcDogKGFwcCkgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgaW5mb3MgPSB3eHcgJ2luZm8nIHNsYXNoLmZpbGUgYXBwXG4gICAgICAgICAgICBpZiBpbmZvcy5sZW5ndGhcbiAgICAgICAgICAgICAgICB3eHcgJ2ZvY3VzJyBzbGFzaC5maWxlIGFwcFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG9wZW4gc2xhc2gudW5zbGFzaCBhcHBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgb3BlbiBhcHBcbiAgICBcbiAgICBvbkxlZnRDbGljazogPT4gQG9wZW5BcHAgQGthY2hlbElkXG4gICAgb25SaWdodENsaWNrOiA9PiB3eHcgJ21pbmltaXplJyBzbGFzaC5maWxlIEBrYWNoZWxJZFxuICAgIG9uTWlkZGxlQ2xpY2s6ID0+IHd4dyAndGVybWluYXRlJyBAa2FjaGVsSWRcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBvbkluaXRLYWNoZWw6IChAa2FjaGVsSWQpID0+XG4gICAgICAgICAgICBcbiAgICAgICAgaWNvbkRpciA9IHNsYXNoLmpvaW4gc2xhc2gudXNlckRhdGEoKSwgJ2ljb25zJ1xuICAgICAgICBhcHBOYW1lID0gc2xhc2guYmFzZSBAa2FjaGVsSWRcbiAgICAgICAgaWNvblBhdGggPSBcIiN7aWNvbkRpcn0vI3thcHBOYW1lfS5wbmdcIlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBub3Qgc2xhc2guaXNGaWxlIGljb25QYXRoXG4gICAgICAgICAgICBAcmVmcmVzaEljb24oKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2V0SWNvbiBpY29uUGF0aFxuICAgICAgICAgICBcbiAgICAgICAgYmFzZSA9IHNsYXNoLmJhc2UgQGthY2hlbElkXG4gICAgICAgIGlmIGJhc2UgaW4gWydDYWxlbmRhciddXG4gICAgICAgICAgICBtaW51dGVzID0ge0NhbGVuZGFyOjYwfVtiYXNlXVxuICAgICAgICAgICAgQHJlZnJlc2hJY29uKClcbiAgICAgICAgICAgIHNldEludGVydmFsIEByZWZyZXNoSWNvbiwgMTAwMCo2MCptaW51dGVzXG4gICAgICAgICAgICBcbiAgICAgICAgc3VwZXIgQGthY2hlbElkXG4gICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICAgICBcbiAgICByZWZyZXNoSWNvbjogPT5cbiAgICAgICAgXG4gICAgICAgIGljb25EaXIgPSBzbGFzaC5qb2luIHNsYXNoLnVzZXJEYXRhKCksICdpY29ucydcbiAgICAgICAgYXBwTmFtZSA9IHNsYXNoLmJhc2UgQGthY2hlbElkXG4gICAgICAgIHBuZ1BhdGggPSBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gaWNvbkRpciwgYXBwTmFtZSArIFwiLnBuZ1wiXG4gICAgICAgIFxuICAgICAgICBhcHBJY29uIEBrYWNoZWxJZCwgcG5nUGF0aFxuICAgICAgICBAc2V0SWNvbiBwbmdQYXRoXG4gICAgICAgIFxuICAgICAgICBiYXNlID0gc2xhc2guYmFzZSBAa2FjaGVsSWRcbiAgICAgICAgaWYgYmFzZSBpbiBbJ0NhbGVuZGFyJ11cbiAgICAgICAgICAgIHRpbWUgPSBuZXcgRGF0ZSgpXG4gICAgICAgICAgICBkYXkgPSBlbGVtIGNsYXNzOidjYWxlbmRhckRheScgdGV4dDprc3RyLmxwYWQgdGltZS5nZXREYXRlKCksIDIsICcwJ1xuICAgICAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgZGF5XG4gICAgICAgICAgICBtdGggPSBlbGVtIGNsYXNzOidjYWxlbmRhck1vbnRoJyB0ZXh0OlsnSkFOJyAnRkVCJyAnTUFSJyAnQVBSJyAnTUFZJyAnSlVOJyAnSlVMJyAnQVVHJyAnU0VQJyAnT0NUJyAnTk9WJyAnREVDJ11bdGltZS5nZXRNb250aCgpXVxuICAgICAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgbXRoXG4gICAgICAgICAgICAgICAgXG4gICAgc2V0SWNvbjogKGljb25QYXRoKSA9PlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBpY29uUGF0aFxuICAgICAgICBzdXBlclxuICAgICAgICBAdXBkYXRlRG90KClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBBcHBsXG4iXX0=
//# sourceURL=../coffee/appl.coffee
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
        this.onContextMenu = bind(this.onContextMenu, this);
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

    Appl.prototype.onLeftClick = function(event) {
        var infos;
        if (os.platform() === 'win32') {
            infos = wxw('info', slash.file(this.kachelId));
            if (infos.length) {
                return wxw('focus', slash.file(this.kachelId));
            } else {
                return open(slash.unslash(this.kachelId));
            }
        } else {
            return open(this.kachelId);
        }
    };

    Appl.prototype.onContextMenu = function(event) {
        return wxw('minimize', slash.file(this.kachelId));
    };

    Appl.prototype.onMiddleClick = function(event) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsd0hBQUE7SUFBQTs7OztBQVFBLE1BQXVGLE9BQUEsQ0FBUSxLQUFSLENBQXZGLEVBQUUsZUFBRixFQUFRLG1CQUFSLEVBQWdCLGlCQUFoQixFQUF1QixpQkFBdkIsRUFBOEIsaUJBQTlCLEVBQXFDLHFCQUFyQyxFQUE4QyxlQUE5QyxFQUFvRCxlQUFwRCxFQUEwRCxlQUExRCxFQUFnRSxlQUFoRSxFQUFzRSxXQUF0RSxFQUEwRSxXQUExRSxFQUE4RSxTQUE5RSxFQUFpRjs7QUFFakYsTUFBQSxHQUFVLE9BQUEsQ0FBUSxVQUFSOztBQUNWLE9BQUEsR0FBVSxPQUFBLENBQVEsUUFBUjs7QUFDVixLQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0FBQ1YsR0FBQSxHQUFVLE9BQUEsQ0FBUSxLQUFSOztBQUVKOzs7SUFFQyxjQUFDLEdBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLGtEQUFTOzs7Ozs7OztRQUVWLElBQUksQ0FBQyxFQUFMLENBQVEsS0FBUixFQUFjLElBQUMsQ0FBQSxLQUFmO1FBQ0EsSUFBSSxDQUFDLEVBQUwsQ0FBUSxLQUFSLEVBQWMsSUFBQyxDQUFBLEtBQWY7UUFFQSxJQUFDLENBQUEsU0FBRCxHQUFhO1FBQ2IsSUFBQyxDQUFBLE1BQUQsR0FBYTtRQUViLDBHQUFBLFNBQUE7SUFSRDs7bUJBVUgsS0FBQSxHQUFPLFNBQUMsTUFBRCxFQUFTLEdBQVQ7UUFFSCxJQUFDLENBQUEsU0FBRCxHQUFhLE1BQUEsS0FBVTtlQUN2QixJQUFDLENBQUEsU0FBRCxDQUFBO0lBSEc7O21CQUtQLEtBQUEsR0FBTyxTQUFDLElBQUQ7QUFFSCxZQUFBO1FBQUEsSUFBQyxDQUFBLE1BQUQsR0FBVTtBQUNWLGFBQUEsc0NBQUE7O0FBQ0k7QUFBQSxpQkFBQSx3Q0FBQTs7Z0JBQ0ksSUFBRyxDQUFDLENBQUMs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N0QsRUFBbUUsS0FBbkUsQ0FBMEUsQ0FBQSxJQUFJLENBQUMsUUFBTCxDQUFBLENBQUEsQ0FBckc7YUFBTDttQkFDTixJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsR0FBbEIsRUFMSjs7SUFWUzs7bUJBaUJiLE9BQUEsR0FBUyxTQUFDLFFBQUQ7UUFFTCxJQUFVLENBQUksUUFBZDtBQUFBLG1CQUFBOztRQUNBLG1DQUFBLFNBQUE7ZUFDQSxJQUFDLENBQUEsU0FBRCxDQUFBO0lBSks7Ozs7R0EvSU07O0FBcUpuQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAgICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbjAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwICAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAwMDAwICBcbiMjI1xuXG57IHBvc3QsIGNoaWxkcCwgc2xhc2gsIGVtcHR5LCB2YWxpZCwgcmFuZGludCwga2xvZywga3N0ciwgZWxlbSwgb3Blbiwgb3MsIGZzLCAkLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbkthY2hlbCAgPSByZXF1aXJlICcuL2thY2hlbCdcbmFwcEljb24gPSByZXF1aXJlICcuL2ljb24nXG51dGlscyAgID0gcmVxdWlyZSAnLi91dGlscydcbnd4dyAgICAgPSByZXF1aXJlICd3eHcnXG5cbmNsYXNzIEFwcGwgZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonYXBwbCcpIC0+IFxuICAgIFxuICAgICAgICBwb3N0Lm9uICdhcHAnIEBvbkFwcFxuICAgICAgICBwb3N0Lm9uICd3aW4nIEBvbldpblxuICAgICAgICBcbiAgICAgICAgQGFjdGl2YXRlZCA9IGZhbHNlXG4gICAgICAgIEBzdGF0dXMgICAgPSAnJ1xuICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgICAgICAgICBcbiAgICBvbkFwcDogKGFjdGlvbiwgYXBwKSA9PlxuICAgICAgICBcbiAgICAgICAgQGFjdGl2YXRlZCA9IGFjdGlvbiA9PSAnYWN0aXZhdGVkJ1xuICAgICAgICBAdXBkYXRlRG90KClcblxuICAgIG9uV2luOiAod2lucykgPT5cbiAgICAgICAgXG4gICAgICAgIEBzdGF0dXMgPSAnJ1xuICAgICAgICBmb3IgdyBpbiB3aW5zXG4gICAgICAgICAgICBmb3IgYyBpbiBbJ21heGltaXplZCcgJ25vcm1hbCddXG4gICAgICAgICAgICAgICAgaWYgdy5zdGF0dXMuc3RhcnRzV2l0aCBjXG4gICAgICAgICAgICAgICAgICAgIEBzdGF0dXMgPSB3LnN0YXR1c1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgaWYgdmFsaWQgQHN0YXR1c1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGVtcHR5IEBzdGF0dXNcbiAgICAgICAgICAgIGZvciB3IGluIHdpbnNcbiAgICAgICAgICAgICAgICBpZiB3LnN0YXR1cyA9PSAnbWluaW1pemVkJ1xuICAgICAgICAgICAgICAgICAgICBAc3RhdHVzID0gJ21pbmltaXplZCdcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgXG4gICAgICAgIEB1cGRhdGVEb3QoKVxuICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgdXBkYXRlRG90OiAtPlxuICAgICAgICBcbiAgICAgICAgZG90ID0kICcuYXBwbGRvdCdcbiAgICAgICAgXG4gICAgICAgIGlmIEBhY3RpdmF0ZWQgYW5kIG5vdCBkb3RcbiAgICAgICAgICAgIGRvdCA9IHV0aWxzLnN2ZyB3aWR0aDoxNiBoZWlnaHQ6MTYgY2xzczonYXBwbGRvdCdcbiAgICAgICAgICAgIGRlZiA9IHV0aWxzLmFwcGVuZCBkb3QsICdkZWZzJ1xuICAgICAgICAgICAgZ3JkID0gdXRpbHMuYXBwZW5kIGRlZiwgJ2xpbmVhckdyYWRpZW50JywgaWQ6J2FwcGxkb3RzdHJva2UnIHgxOlwiMCVcIiB5MTpcIjAlXCIgeDI6XCIxMDAlXCIgeTI6XCIxMDAlXCJcbiAgICAgICAgICAgIHN0cCA9IHV0aWxzLmFwcGVuZCBncmQsICdzdG9wJyBvZmZzZXQ6XCIwJVwiICdzdG9wLWNvbG9yJzpcIiMxMTFcIlxuICAgICAgICAgICAgc3RwID0gdXRpbHMuYXBwZW5kIGdyZCwgJ3N0b3AnIG9mZnNldDpcIjEwMCVcIiAnc3RvcC1jb2xvcic6XCIjMzMzXCJcbiAgICAgICAgICAgIGdycCA9IHV0aWxzLmFwcGVuZCBkb3QsICdnJ1xuICAgICAgICAgICAgY3JjID0gdXRpbHMuYXBwZW5kIGdycCwgJ2NpcmNsZScgY3g6MCBjeTowIHI6NyBjbGFzczonYXBwbGNpcmNsZSdcbiAgICAgICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGRvdFxuICAgICAgICBlbHNlIGlmIG5vdCBAYWN0aXZhdGVkIGFuZCBkb3RcbiAgICAgICAgICAgIGRvdD8ucmVtb3ZlKClcbiAgICAgICAgICAgIGRvdCA9IG51bGxcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBkb3RcbiAgICAgICAgICAgIGRvdC5jbGFzc0xpc3QucmVtb3ZlICd0b3AnXG4gICAgICAgICAgICBkb3QuY2xhc3NMaXN0LnJlbW92ZSAnbm9ybWFsJ1xuICAgICAgICAgICAgZG90LmNsYXNzTGlzdC5yZW1vdmUgJ21pbmltaXplZCdcbiAgICAgICAgICAgIGRvdC5jbGFzc0xpc3QucmVtb3ZlICdtYXhpbWl6ZWQnXG4gICAgICAgICAgICBpZiB2YWxpZCBAc3RhdHVzXG4gICAgICAgICAgICAgICAgZm9yIHMgaW4gQHN0YXR1cy5zcGxpdCAnICdcbiAgICAgICAgICAgICAgICAgICAgZG90LmNsYXNzTGlzdC5hZGQgc1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgb25MZWZ0Q2xpY2s6IChldmVudCkgLT4gXG4gICAgICAgIFxuICAgICAgICAjIGtsb2cgJ2FwcGwub25DbGljaycgc2xhc2guZmlsZSBAa2FjaGVsSWRcbiAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgaW5mb3MgPSB3eHcgJ2luZm8nIHNsYXNoLmZpbGUgQGthY2hlbElkXG4gICAgICAgICAgICBpZiBpbmZvcy5sZW5ndGhcbiAgICAgICAgICAgICAgICB3eHcgJ2ZvY3VzJyBzbGFzaC5maWxlIEBrYWNoZWxJZFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG9wZW4gc2xhc2gudW5zbGFzaCBAa2FjaGVsSWQgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG9wZW4gQGthY2hlbElkIFxuICAgIFxuICAgIG9uQ29udGV4dE1lbnU6IChldmVudCkgPT4gXG4gICAgICAgIFxuICAgICAgICB3eHcgJ21pbmltaXplJyBzbGFzaC5maWxlIEBrYWNoZWxJZFxuXG4gICAgb25NaWRkbGVDbGljazogKGV2ZW50KSA9PiBcbiAgXG4gICAgICAgIHd4dyAndGVybWluYXRlJyBAa2FjaGVsSWRcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBvbkluaXRLYWNoZWw6IChAa2FjaGVsSWQpID0+XG4gICAgICAgICAgICBcbiAgICAgICAgaWNvbkRpciA9IHNsYXNoLmpvaW4gc2xhc2gudXNlckRhdGEoKSwgJ2ljb25zJ1xuICAgICAgICBhcHBOYW1lID0gc2xhc2guYmFzZSBAa2FjaGVsSWRcbiAgICAgICAgaWNvblBhdGggPSBcIiN7aWNvbkRpcn0vI3thcHBOYW1lfS5wbmdcIlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBub3Qgc2xhc2guaXNGaWxlIGljb25QYXRoXG4gICAgICAgICAgICBAcmVmcmVzaEljb24oKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2V0SWNvbiBpY29uUGF0aFxuICAgICAgICAgICBcbiAgICAgICAgYmFzZSA9IHNsYXNoLmJhc2UgQGthY2hlbElkXG4gICAgICAgIGlmIGJhc2UgaW4gWydDYWxlbmRhciddXG4gICAgICAgICAgICBtaW51dGVzID0ge0NhbGVuZGFyOjYwfVtiYXNlXVxuICAgICAgICAgICAgQHJlZnJlc2hJY29uKClcbiAgICAgICAgICAgIHNldEludGVydmFsIEByZWZyZXNoSWNvbiwgMTAwMCo2MCptaW51dGVzXG4gICAgICAgICAgICBcbiAgICAgICAgc3VwZXIgQGthY2hlbElkXG4gICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICAgICBcbiAgICByZWZyZXNoSWNvbjogPT5cbiAgICAgICAgXG4gICAgICAgIGljb25EaXIgPSBzbGFzaC5qb2luIHNsYXNoLnVzZXJEYXRhKCksICdpY29ucydcbiAgICAgICAgYXBwTmFtZSA9IHNsYXNoLmJhc2UgQGthY2hlbElkXG4gICAgICAgIHBuZ1BhdGggPSBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gaWNvbkRpciwgYXBwTmFtZSArIFwiLnBuZ1wiXG4gICAgICAgIFxuICAgICAgICBhcHBJY29uIEBrYWNoZWxJZCwgcG5nUGF0aFxuICAgICAgICBAc2V0SWNvbiBwbmdQYXRoXG4gICAgICAgIFxuICAgICAgICBiYXNlID0gc2xhc2guYmFzZSBAa2FjaGVsSWRcbiAgICAgICAgaWYgYmFzZSBpbiBbJ0NhbGVuZGFyJ11cbiAgICAgICAgICAgIHRpbWUgPSBuZXcgRGF0ZSgpXG4gICAgICAgICAgICBkYXkgPSBlbGVtIGNsYXNzOidjYWxlbmRhckRheScgdGV4dDprc3RyLmxwYWQgdGltZS5nZXREYXRlKCksIDIsICcwJ1xuICAgICAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgZGF5XG4gICAgICAgICAgICBtdGggPSBlbGVtIGNsYXNzOidjYWxlbmRhck1vbnRoJyB0ZXh0OlsnSkFOJyAnRkVCJyAnTUFSJyAnQVBSJyAnTUFZJyAnSlVOJyAnSlVMJyAnQVVHJyAnU0VQJyAnT0NUJyAnTk9WJyAnREVDJ11bdGltZS5nZXRNb250aCgpXVxuICAgICAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgbXRoXG4gICAgICAgICAgICAgICAgXG4gICAgc2V0SWNvbjogKGljb25QYXRoKSA9PlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBpY29uUGF0aFxuICAgICAgICBzdXBlclxuICAgICAgICBAdXBkYXRlRG90KClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBBcHBsXG4iXX0=
//# sourceURL=../coffee/appl.coffee
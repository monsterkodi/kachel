// koffee 1.4.0

/*
 0000000   00000000   00000000   000      
000   000  000   000  000   000  000      
000000000  00000000   00000000   000      
000   000  000        000        000      
000   000  000        000        0000000
 */
var $, Appl, Kachel, _, appIcon, childp, elem, empty, fs, klog, kstr, open, os, post, randint, ref, slash, valid, wxw,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, childp = ref.childp, slash = ref.slash, empty = ref.empty, valid = ref.valid, randint = ref.randint, klog = ref.klog, kstr = ref.kstr, elem = ref.elem, open = ref.open, os = ref.os, fs = ref.fs, $ = ref.$, _ = ref._;

Kachel = require('./kachel');

appIcon = require('./icon');

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
        var dot, i, len, ref1, results, s;
        dot = $('.appldot');
        if (this.activated && !dot) {
            dot = elem({
                "class": 'appldot'
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsaUhBQUE7SUFBQTs7OztBQVFBLE1BQXVGLE9BQUEsQ0FBUSxLQUFSLENBQXZGLEVBQUUsZUFBRixFQUFRLG1CQUFSLEVBQWdCLGlCQUFoQixFQUF1QixpQkFBdkIsRUFBOEIsaUJBQTlCLEVBQXFDLHFCQUFyQyxFQUE4QyxlQUE5QyxFQUFvRCxlQUFwRCxFQUEwRCxlQUExRCxFQUFnRSxlQUFoRSxFQUFzRSxXQUF0RSxFQUEwRSxXQUExRSxFQUE4RSxTQUE5RSxFQUFpRjs7QUFFakYsTUFBQSxHQUFVLE9BQUEsQ0FBUSxVQUFSOztBQUNWLE9BQUEsR0FBVSxPQUFBLENBQVEsUUFBUjs7QUFDVixHQUFBLEdBQVUsT0FBQSxDQUFRLEtBQVI7O0FBRUo7OztJQUVDLGNBQUMsR0FBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsa0RBQVM7Ozs7Ozs7O1FBRVYsSUFBSSxDQUFDLEVBQUwsQ0FBUSxLQUFSLEVBQWMsSUFBQyxDQUFBLEtBQWY7UUFDQSxJQUFJLENBQUMsRUFBTCxDQUFRLEtBQVIsRUFBYyxJQUFDLENBQUEsS0FBZjtRQUVBLElBQUMsQ0FBQSxTQUFELEdBQWE7UUFDYixJQUFDLENBQUEsTUFBRCxHQUFhO1FBRWIsMEdBQUEsU0FBQTtJQVJEOzttQkFVSCxLQUFBLEdBQU8sU0FBQyxNQUFELEVBQVMsR0FBVDtRQUVILElBQUMsQ0FBQSxTQUFELEdBQWEsTUFBQSxLQUFVO2VBQ3ZCLElBQUMsQ0FBQSxTQUFELENBQUE7SUFIRzs7bUJBS1AsS0FBQSxHQUFPLFNBQUMsSUFBRDtBQUVILFlBQUE7UUFBQSxJQUFDLENBQUEsTUFBRCxHQUFVO0FBQ1YsYUFBQSxzQ0FBQTs7QUFDSTtBQUFBLGlCQUFBLHdDQUFBOztnQkFDSSxJQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVCxDQUFvQixDQUFwQixDQUFI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QUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sZUFBTjtnQkFBc0IsSUFBQSxFQUFLLENBQUMsS0FBRCxFQUFPLEtBQVAsRUFBYSxLQUFiLEVBQW1CLEtBQW5CLEVBQXlCLEtBQXpCLEVBQStCLEtBQS9CLEVBQXFDLEtBQXJDLEVBQTJDLEtBQTNDLEVBQWlELEtBQWpELEVBQXVELEtBQXZELEVBQTZELEtBQTdELEVBQW1FLEtBQW5FLENBQTBFLENBQUEsSUFBSSxDQUFDLFFBQUwsQ0FBQSxDQUFBLENBQXJHO2FBQUw7bUJBQ04sSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLEdBQWxCLEVBTEo7O0lBVlM7O21CQWlCYixPQUFBLEdBQVMsU0FBQyxRQUFEO1FBRUwsSUFBVSxDQUFJLFFBQWQ7QUFBQSxtQkFBQTs7UUFDQSxtQ0FBQSxTQUFBO2VBQ0EsSUFBQyxDQUFBLFNBQUQsQ0FBQTtJQUpLOzs7O0dBckpNOztBQTJKbkIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgICAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4wMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgICAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMCAgICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwMDAwMCAgXG4jIyNcblxueyBwb3N0LCBjaGlsZHAsIHNsYXNoLCBlbXB0eSwgdmFsaWQsIHJhbmRpbnQsIGtsb2csIGtzdHIsIGVsZW0sIG9wZW4sIG9zLCBmcywgJCwgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5LYWNoZWwgID0gcmVxdWlyZSAnLi9rYWNoZWwnXG5hcHBJY29uID0gcmVxdWlyZSAnLi9pY29uJ1xud3h3ICAgICA9IHJlcXVpcmUgJ3d4dydcblxuY2xhc3MgQXBwbCBleHRlbmRzIEthY2hlbFxuICAgICAgICBcbiAgICBAOiAoQGthY2hlbElkOidhcHBsJykgLT4gXG4gICAgXG4gICAgICAgIHBvc3Qub24gJ2FwcCcgQG9uQXBwXG4gICAgICAgIHBvc3Qub24gJ3dpbicgQG9uV2luXG4gICAgICAgIFxuICAgICAgICBAYWN0aXZhdGVkID0gZmFsc2VcbiAgICAgICAgQHN0YXR1cyAgICA9ICcnXG4gICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICAgICAgICAgIFxuICAgIG9uQXBwOiAoYWN0aW9uLCBhcHApID0+XG4gICAgICAgIFxuICAgICAgICBAYWN0aXZhdGVkID0gYWN0aW9uID09ICdhY3RpdmF0ZWQnXG4gICAgICAgIEB1cGRhdGVEb3QoKVxuXG4gICAgb25XaW46ICh3aW5zKSA9PlxuICAgICAgICBcbiAgICAgICAgQHN0YXR1cyA9ICcnXG4gICAgICAgIGZvciB3IGluIHdpbnNcbiAgICAgICAgICAgIGZvciBjIGluIFsnbWF4aW1pemVkJyAnbm9ybWFsJ11cbiAgICAgICAgICAgICAgICBpZiB3LnN0YXR1cy5zdGFydHNXaXRoIGNcbiAgICAgICAgICAgICAgICAgICAgQHN0YXR1cyA9IHcuc3RhdHVzXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBpZiB2YWxpZCBAc3RhdHVzXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgZW1wdHkgQHN0YXR1c1xuICAgICAgICAgICAgZm9yIHcgaW4gd2luc1xuICAgICAgICAgICAgICAgIGlmIHcuc3RhdHVzID09ICdtaW5pbWl6ZWQnXG4gICAgICAgICAgICAgICAgICAgIEBzdGF0dXMgPSAnbWluaW1pemVkJ1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICBcbiAgICAgICAgQHVwZGF0ZURvdCgpXG4gICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwICAgICAgMDAwICAgICBcbiAgICBcbiAgICB1cGRhdGVEb3Q6IC0+XG4gICAgICAgIFxuICAgICAgICBkb3QgPSQgJy5hcHBsZG90J1xuICAgICAgICBcbiAgICAgICAgaWYgQGFjdGl2YXRlZCBhbmQgbm90IGRvdFxuICAgICAgICAgICAgZG90ID0gZWxlbSBjbGFzczonYXBwbGRvdCdcbiAgICAgICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGRvdFxuICAgICAgICBlbHNlIGlmIG5vdCBAYWN0aXZhdGVkIGFuZCBkb3RcbiAgICAgICAgICAgIGRvdD8ucmVtb3ZlKClcbiAgICAgICAgICAgIGRvdCA9IG51bGxcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBkb3RcbiAgICAgICAgICAgIGRvdC5jbGFzc0xpc3QucmVtb3ZlICd0b3AnXG4gICAgICAgICAgICBkb3QuY2xhc3NMaXN0LnJlbW92ZSAnbm9ybWFsJ1xuICAgICAgICAgICAgZG90LmNsYXNzTGlzdC5yZW1vdmUgJ21pbmltaXplZCdcbiAgICAgICAgICAgIGRvdC5jbGFzc0xpc3QucmVtb3ZlICdtYXhpbWl6ZWQnXG4gICAgICAgICAgICBpZiB2YWxpZCBAc3RhdHVzXG4gICAgICAgICAgICAgICAgZm9yIHMgaW4gQHN0YXR1cy5zcGxpdCAnICdcbiAgICAgICAgICAgICAgICAgICAgZG90LmNsYXNzTGlzdC5hZGQgc1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgb25MZWZ0Q2xpY2s6IChldmVudCkgLT4gXG4gICAgICAgIFxuICAgICAgICAjIGtsb2cgJ2FwcGwub25DbGljaycgc2xhc2guZmlsZSBAa2FjaGVsSWRcbiAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgaW5mb3MgPSB3eHcgJ2luZm8nIHNsYXNoLmZpbGUgQGthY2hlbElkXG4gICAgICAgICAgICBpZiBpbmZvcy5sZW5ndGhcbiAgICAgICAgICAgICAgICB3eHcgJ2ZvY3VzJyBzbGFzaC5maWxlIEBrYWNoZWxJZFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG9wZW4gc2xhc2gudW5zbGFzaCBAa2FjaGVsSWQgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG9wZW4gQGthY2hlbElkIFxuICAgIFxuICAgIG9uQ29udGV4dE1lbnU6IChldmVudCkgPT4gXG4gICAgICAgIFxuICAgICAgICB3eHcgJ21pbmltaXplJyBzbGFzaC5maWxlIEBrYWNoZWxJZFxuXG4gICAgb25NaWRkbGVDbGljazogKGV2ZW50KSA9PiBcbiAgXG4gICAgICAgIHd4dyAndGVybWluYXRlJyBAa2FjaGVsSWRcbiAgICAgICAgXG4gICAgICAgICMgaW5mb3MgPSB3eHcgJ2luZm8nIHNsYXNoLmZpbGUgQGthY2hlbElkXG4gICAgICAgICMgaWYgaW5mb3MubGVuZ3RoXG4gICAgICAgICAgICAjIG1heGltaXplZCA9IGZhbHNlXG4gICAgICAgICAgICAjIGZvciBpbmZvIGluIGluZm9zXG4gICAgICAgICAgICAgICAgIyBpZiBpbmZvLnN0YXR1cyA9PSAnbWF4aW1pemVkJ1xuICAgICAgICAgICAgICAgICAgICAjIG1heGltaXplZCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgIyBicmVha1xuICAgICAgICAgICAgIyBpZiBtYXhpbWl6ZWRcbiAgICAgICAgICAgICAgICAjIHd4dyAncmVzdG9yZScgc2xhc2guZmlsZSBAa2FjaGVsSWRcbiAgICAgICAgICAgICMgZWxzZVxuICAgICAgICAgICAgICAgICMgd3h3ICdtYXhpbWl6ZScgc2xhc2guZmlsZSBAa2FjaGVsSWRcbiAgICAgICAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgb25Jbml0S2FjaGVsOiAoQGthY2hlbElkKSA9PlxuICAgICAgICAgICAgXG4gICAgICAgIGljb25EaXIgPSBzbGFzaC5qb2luIHNsYXNoLnVzZXJEYXRhKCksICdpY29ucydcbiAgICAgICAgYXBwTmFtZSA9IHNsYXNoLmJhc2UgQGthY2hlbElkXG4gICAgICAgIGljb25QYXRoID0gXCIje2ljb25EaXJ9LyN7YXBwTmFtZX0ucG5nXCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgbm90IHNsYXNoLmlzRmlsZSBpY29uUGF0aFxuICAgICAgICAgICAgQHJlZnJlc2hJY29uKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNldEljb24gaWNvblBhdGhcbiAgICAgICAgICAgXG4gICAgICAgIGJhc2UgPSBzbGFzaC5iYXNlIEBrYWNoZWxJZFxuICAgICAgICBpZiBiYXNlIGluIFsnQ2FsZW5kYXInXVxuICAgICAgICAgICAgbWludXRlcyA9IHtDYWxlbmRhcjo2MH1bYmFzZV1cbiAgICAgICAgICAgIEByZWZyZXNoSWNvbigpXG4gICAgICAgICAgICBzZXRJbnRlcnZhbCBAcmVmcmVzaEljb24sIDEwMDAqNjAqbWludXRlc1xuICAgICAgICAgICAgXG4gICAgICAgIHN1cGVyIEBrYWNoZWxJZFxuICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAgICAgXG4gICAgcmVmcmVzaEljb246ID0+XG4gICAgICAgIFxuICAgICAgICBpY29uRGlyID0gc2xhc2guam9pbiBzbGFzaC51c2VyRGF0YSgpLCAnaWNvbnMnXG4gICAgICAgIGFwcE5hbWUgPSBzbGFzaC5iYXNlIEBrYWNoZWxJZFxuICAgICAgICBwbmdQYXRoID0gc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIGljb25EaXIsIGFwcE5hbWUgKyBcIi5wbmdcIlxuICAgICAgICBcbiAgICAgICAgYXBwSWNvbiBAa2FjaGVsSWQsIHBuZ1BhdGhcbiAgICAgICAgQHNldEljb24gcG5nUGF0aFxuICAgICAgICBcbiAgICAgICAgYmFzZSA9IHNsYXNoLmJhc2UgQGthY2hlbElkXG4gICAgICAgIGlmIGJhc2UgaW4gWydDYWxlbmRhciddXG4gICAgICAgICAgICB0aW1lID0gbmV3IERhdGUoKVxuICAgICAgICAgICAgZGF5ID0gZWxlbSBjbGFzczonY2FsZW5kYXJEYXknIHRleHQ6a3N0ci5scGFkIHRpbWUuZ2V0RGF0ZSgpLCAyLCAnMCdcbiAgICAgICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGRheVxuICAgICAgICAgICAgbXRoID0gZWxlbSBjbGFzczonY2FsZW5kYXJNb250aCcgdGV4dDpbJ0pBTicgJ0ZFQicgJ01BUicgJ0FQUicgJ01BWScgJ0pVTicgJ0pVTCcgJ0FVRycgJ1NFUCcgJ09DVCcgJ05PVicgJ0RFQyddW3RpbWUuZ2V0TW9udGgoKV1cbiAgICAgICAgICAgIEBtYWluLmFwcGVuZENoaWxkIG10aFxuICAgICAgICAgICAgICAgIFxuICAgIHNldEljb246IChpY29uUGF0aCkgPT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgaWNvblBhdGhcbiAgICAgICAgc3VwZXJcbiAgICAgICAgQHVwZGF0ZURvdCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gQXBwbFxuIl19
//# sourceURL=../coffee/appl.coffee
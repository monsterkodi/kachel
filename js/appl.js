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

    Appl.prototype.onClick = function(event) {
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
        var i, info, infos, len, maximized;
        infos = wxw('info', slash.file(this.kachelId));
        if (infos.length) {
            maximized = false;
            for (i = 0, len = infos.length; i < len; i++) {
                info = infos[i];
                if (info.status === 'maximized') {
                    maximized = true;
                    break;
                }
            }
            if (maximized) {
                return wxw('restore', slash.file(this.kachelId));
            } else {
                return wxw('maximize', slash.file(this.kachelId));
            }
        }
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
        return Appl.__super__.onInitKachel.apply(this, arguments);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsaUhBQUE7SUFBQTs7OztBQVFBLE1BQXVGLE9BQUEsQ0FBUSxLQUFSLENBQXZGLEVBQUUsZUFBRixFQUFRLG1CQUFSLEVBQWdCLGlCQUFoQixFQUF1QixpQkFBdkIsRUFBOEIsaUJBQTlCLEVBQXFDLHFCQUFyQyxFQUE4QyxlQUE5QyxFQUFvRCxlQUFwRCxFQUEwRCxlQUExRCxFQUFnRSxlQUFoRSxFQUFzRSxXQUF0RSxFQUEwRSxXQUExRSxFQUE4RSxTQUE5RSxFQUFpRjs7QUFFakYsTUFBQSxHQUFVLE9BQUEsQ0FBUSxVQUFSOztBQUNWLE9BQUEsR0FBVSxPQUFBLENBQVEsUUFBUjs7QUFDVixHQUFBLEdBQVUsT0FBQSxDQUFRLEtBQVI7O0FBRUo7OztJQUVDLGNBQUMsR0FBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsa0RBQVM7Ozs7Ozs7O1FBRVYsSUFBSSxDQUFDLEVBQUwsQ0FBUSxLQUFSLEVBQWMsSUFBQyxDQUFBLEtBQWY7UUFDQSxJQUFJLENBQUMsRUFBTCxDQUFRLEtBQVIsRUFBYyxJQUFDLENBQUEsS0FBZjtRQUVBLElBQUMsQ0FBQSxTQUFELEdBQWE7UUFDYixJQUFDLENBQUEsTUFBRCxHQUFhO1FBRWIsMEdBQUEsU0FBQTtJQVJEOzttQkFVSCxLQUFBLEdBQU8sU0FBQyxNQUFELEVBQVMsR0FBVDtRQUVILElBQUMsQ0FBQSxTQUFELEdBQWEsTUFBQSxLQUFVO2VBQ3ZCLElBQUMsQ0FBQSxTQUFELENBQUE7SUFIRzs7bUJBS1AsS0FBQSxHQUFPLFNBQUMsSUFBRDtBQUVILFlBQUE7UUFBQSxJQUFDLENBQUEsTUFBRCxHQUFVO0FBQ1YsYUFBQSxzQ0FBQTs7QUFDSTtBQUFBLGlCQUFBLHdDQUFBOztnQkFDSSxJQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVCxDQUFvQixDQUFwQixDQUFI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UyxPQUFUO1FBRUEsSUFBQSxHQUFPLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBQyxDQUFBLFFBQVo7UUFDUCxJQUFHLElBQUEsS0FBUyxVQUFaO1lBQ0ksSUFBQSxHQUFPLElBQUksSUFBSixDQUFBO1lBQ1AsR0FBQSxHQUFNLElBQUEsQ0FBSztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLGFBQU47Z0JBQW9CLElBQUEsRUFBSyxJQUFJLENBQUMsSUFBTCxDQUFVLElBQUksQ0FBQyxPQUFMLENBQUEsQ0FBVixFQUEwQixDQUExQixFQUE2QixHQUE3QixDQUF6QjthQUFMO1lBQ04sSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLEdBQWxCO1lBQ0EsR0FBQSxHQUFNLElBQUEsQ0FBSztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLGVBQU47Z0JBQXNCLElBQUEsRUFBSyxDQUFDLEtBQUQsRUFBTyxLQUFQLEVBQWEsS0FBYixFQUFtQixLQUFuQixFQUF5QixLQUF6QixFQUErQixLQUEvQixFQUFxQyxLQUFyQyxFQUEyQyxLQUEzQyxFQUFpRCxLQUFqRCxFQUF1RCxLQUF2RCxFQUE2RCxLQUE3RCxFQUFtRSxLQUFuRSxDQUEwRSxDQUFBLElBQUksQ0FBQyxRQUFMLENBQUEsQ0FBQSxDQUFyRzthQUFMO21CQUNOLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixHQUFsQixFQUxKOztJQVZTOzttQkFpQmIsT0FBQSxHQUFTLFNBQUMsUUFBRDtRQUVMLElBQVUsQ0FBSSxRQUFkO0FBQUEsbUJBQUE7O1FBQ0EsbUNBQUEsU0FBQTtlQUNBLElBQUMsQ0FBQSxTQUFELENBQUE7SUFKSzs7OztHQW5KTTs7QUF5Sm5CLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgICAgICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAgICAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMDAwMDAgIFxuIyMjXG5cbnsgcG9zdCwgY2hpbGRwLCBzbGFzaCwgZW1wdHksIHZhbGlkLCByYW5kaW50LCBrbG9nLCBrc3RyLCBlbGVtLCBvcGVuLCBvcywgZnMsICQsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuS2FjaGVsICA9IHJlcXVpcmUgJy4va2FjaGVsJ1xuYXBwSWNvbiA9IHJlcXVpcmUgJy4vaWNvbidcbnd4dyAgICAgPSByZXF1aXJlICd3eHcnXG5cbmNsYXNzIEFwcGwgZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonYXBwbCcpIC0+IFxuICAgIFxuICAgICAgICBwb3N0Lm9uICdhcHAnIEBvbkFwcFxuICAgICAgICBwb3N0Lm9uICd3aW4nIEBvbldpblxuICAgICAgICBcbiAgICAgICAgQGFjdGl2YXRlZCA9IGZhbHNlXG4gICAgICAgIEBzdGF0dXMgICAgPSAnJ1xuICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgICAgICAgICBcbiAgICBvbkFwcDogKGFjdGlvbiwgYXBwKSA9PlxuICAgICAgICBcbiAgICAgICAgQGFjdGl2YXRlZCA9IGFjdGlvbiA9PSAnYWN0aXZhdGVkJ1xuICAgICAgICBAdXBkYXRlRG90KClcblxuICAgIG9uV2luOiAod2lucykgPT5cbiAgICAgICAgXG4gICAgICAgIEBzdGF0dXMgPSAnJ1xuICAgICAgICBmb3IgdyBpbiB3aW5zXG4gICAgICAgICAgICBmb3IgYyBpbiBbJ21heGltaXplZCcgJ25vcm1hbCddXG4gICAgICAgICAgICAgICAgaWYgdy5zdGF0dXMuc3RhcnRzV2l0aCBjXG4gICAgICAgICAgICAgICAgICAgIEBzdGF0dXMgPSB3LnN0YXR1c1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgaWYgdmFsaWQgQHN0YXR1c1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGVtcHR5IEBzdGF0dXNcbiAgICAgICAgICAgIGZvciB3IGluIHdpbnNcbiAgICAgICAgICAgICAgICBpZiB3LnN0YXR1cyA9PSAnbWluaW1pemVkJ1xuICAgICAgICAgICAgICAgICAgICBAc3RhdHVzID0gJ21pbmltaXplZCdcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgXG4gICAgICAgIEB1cGRhdGVEb3QoKVxuICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgdXBkYXRlRG90OiAtPlxuICAgICAgICBcbiAgICAgICAgZG90ID0kICcuYXBwbGRvdCdcbiAgICAgICAgXG4gICAgICAgIGlmIEBhY3RpdmF0ZWQgYW5kIG5vdCBkb3RcbiAgICAgICAgICAgIGRvdCA9IGVsZW0gY2xhc3M6J2FwcGxkb3QnXG4gICAgICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBkb3RcbiAgICAgICAgZWxzZSBpZiBub3QgQGFjdGl2YXRlZCBhbmQgZG90XG4gICAgICAgICAgICBkb3Q/LnJlbW92ZSgpXG4gICAgICAgICAgICBkb3QgPSBudWxsXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgZG90XG4gICAgICAgICAgICBkb3QuY2xhc3NMaXN0LnJlbW92ZSAndG9wJ1xuICAgICAgICAgICAgZG90LmNsYXNzTGlzdC5yZW1vdmUgJ25vcm1hbCdcbiAgICAgICAgICAgIGRvdC5jbGFzc0xpc3QucmVtb3ZlICdtaW5pbWl6ZWQnXG4gICAgICAgICAgICBkb3QuY2xhc3NMaXN0LnJlbW92ZSAnbWF4aW1pemVkJ1xuICAgICAgICAgICAgaWYgdmFsaWQgQHN0YXR1c1xuICAgICAgICAgICAgICAgIGZvciBzIGluIEBzdGF0dXMuc3BsaXQgJyAnXG4gICAgICAgICAgICAgICAgICAgIGRvdC5jbGFzc0xpc3QuYWRkIHNcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIG9uQ2xpY2s6IChldmVudCkgLT4gXG4gICAgICAgIFxuICAgICAgICAjIGtsb2cgJ2FwcGwub25DbGljaycgc2xhc2guZmlsZSBAa2FjaGVsSWRcbiAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgaW5mb3MgPSB3eHcgJ2luZm8nIHNsYXNoLmZpbGUgQGthY2hlbElkXG4gICAgICAgICAgICBpZiBpbmZvcy5sZW5ndGhcbiAgICAgICAgICAgICAgICB3eHcgJ2ZvY3VzJyBzbGFzaC5maWxlIEBrYWNoZWxJZFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG9wZW4gc2xhc2gudW5zbGFzaCBAa2FjaGVsSWQgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG9wZW4gQGthY2hlbElkIFxuICAgIFxuICAgIG9uQ29udGV4dE1lbnU6IChldmVudCkgPT4gXG4gICAgICAgIFxuICAgICAgICB3eHcgJ21pbmltaXplJyBzbGFzaC5maWxlIEBrYWNoZWxJZFxuXG4gICAgb25NaWRkbGVDbGljazogKGV2ZW50KSA9PiBcbiAgICAgICAgXG4gICAgICAgIGluZm9zID0gd3h3ICdpbmZvJyBzbGFzaC5maWxlIEBrYWNoZWxJZFxuICAgICAgICBpZiBpbmZvcy5sZW5ndGhcbiAgICAgICAgICAgIG1heGltaXplZCA9IGZhbHNlXG4gICAgICAgICAgICBmb3IgaW5mbyBpbiBpbmZvc1xuICAgICAgICAgICAgICAgIGlmIGluZm8uc3RhdHVzID09ICdtYXhpbWl6ZWQnXG4gICAgICAgICAgICAgICAgICAgIG1heGltaXplZCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGlmIG1heGltaXplZFxuICAgICAgICAgICAgICAgIHd4dyAncmVzdG9yZScgc2xhc2guZmlsZSBAa2FjaGVsSWRcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB3eHcgJ21heGltaXplJyBzbGFzaC5maWxlIEBrYWNoZWxJZFxuICAgICAgICAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBvbkluaXRLYWNoZWw6IChAa2FjaGVsSWQpID0+XG4gICAgICAgICAgICBcbiAgICAgICAgaWNvbkRpciA9IHNsYXNoLmpvaW4gc2xhc2gudXNlckRhdGEoKSwgJ2ljb25zJ1xuICAgICAgICBhcHBOYW1lID0gc2xhc2guYmFzZSBAa2FjaGVsSWRcbiAgICAgICAgaWNvblBhdGggPSBcIiN7aWNvbkRpcn0vI3thcHBOYW1lfS5wbmdcIlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBub3Qgc2xhc2guaXNGaWxlIGljb25QYXRoXG4gICAgICAgICAgICBAcmVmcmVzaEljb24oKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2V0SWNvbiBpY29uUGF0aFxuICAgICAgICAgICBcbiAgICAgICAgYmFzZSA9IHNsYXNoLmJhc2UgQGthY2hlbElkXG4gICAgICAgIGlmIGJhc2UgaW4gWydDYWxlbmRhciddXG4gICAgICAgICAgICBtaW51dGVzID0ge0NhbGVuZGFyOjYwfVtiYXNlXVxuICAgICAgICAgICAgQHJlZnJlc2hJY29uKClcbiAgICAgICAgICAgIHNldEludGVydmFsIEByZWZyZXNoSWNvbiwgMTAwMCo2MCptaW51dGVzXG4gICAgICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgICAgIFxuICAgIHJlZnJlc2hJY29uOiA9PlxuICAgICAgICBcbiAgICAgICAgaWNvbkRpciA9IHNsYXNoLmpvaW4gc2xhc2gudXNlckRhdGEoKSwgJ2ljb25zJ1xuICAgICAgICBhcHBOYW1lID0gc2xhc2guYmFzZSBAa2FjaGVsSWRcbiAgICAgICAgcG5nUGF0aCA9IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBpY29uRGlyLCBhcHBOYW1lICsgXCIucG5nXCJcbiAgICAgICAgXG4gICAgICAgIGFwcEljb24gQGthY2hlbElkLCBwbmdQYXRoXG4gICAgICAgIEBzZXRJY29uIHBuZ1BhdGhcbiAgICAgICAgXG4gICAgICAgIGJhc2UgPSBzbGFzaC5iYXNlIEBrYWNoZWxJZFxuICAgICAgICBpZiBiYXNlIGluIFsnQ2FsZW5kYXInXVxuICAgICAgICAgICAgdGltZSA9IG5ldyBEYXRlKClcbiAgICAgICAgICAgIGRheSA9IGVsZW0gY2xhc3M6J2NhbGVuZGFyRGF5JyB0ZXh0OmtzdHIubHBhZCB0aW1lLmdldERhdGUoKSwgMiwgJzAnXG4gICAgICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBkYXlcbiAgICAgICAgICAgIG10aCA9IGVsZW0gY2xhc3M6J2NhbGVuZGFyTW9udGgnIHRleHQ6WydKQU4nICdGRUInICdNQVInICdBUFInICdNQVknICdKVU4nICdKVUwnICdBVUcnICdTRVAnICdPQ1QnICdOT1YnICdERUMnXVt0aW1lLmdldE1vbnRoKCldXG4gICAgICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBtdGhcbiAgICAgICAgICAgICAgICBcbiAgICBzZXRJY29uOiAoaWNvblBhdGgpID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGljb25QYXRoXG4gICAgICAgIHN1cGVyXG4gICAgICAgIEB1cGRhdGVEb3QoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEFwcGxcbiJdfQ==
//# sourceURL=../coffee/appl.coffee
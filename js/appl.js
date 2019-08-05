// koffee 1.3.0

/*
 0000000   00000000   00000000   000      
000   000  000   000  000   000  000      
000000000  00000000   00000000   000      
000   000  000        000        000      
000   000  000        000        0000000
 */
var $, Appl, Kachel, _, childp, elem, empty, fs, klog, kstr, open, os, post, randint, ref, slash, valid,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, childp = ref.childp, slash = ref.slash, empty = ref.empty, valid = ref.valid, randint = ref.randint, klog = ref.klog, kstr = ref.kstr, elem = ref.elem, open = ref.open, os = ref.os, fs = ref.fs, $ = ref.$, _ = ref._;

Kachel = require('./kachel');

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
        var infos, wxw;
        klog('appl.onClick', slash.file(this.kachelId));
        if (os.platform() === 'win32') {
            wxw = require('wxw');
            infos = wxw('info', slash.file(this.kachelId));
            if (infos.length) {
                klog("wxw 'focus' " + (slash.file(this.kachelId)));
                return wxw('focus', slash.file(this.kachelId));
            } else {
                return open(slash.unslash(this.kachelId));
            }
        } else {
            return open(this.kachelId);
        }
    };

    Appl.prototype.onContextMenu = function(event) {
        var wxw;
        if (os.platform() === 'win32') {
            wxw = require('wxw');
            return wxw('minimize', slash.file(this.kachelId));
        }
    };

    Appl.prototype.onMiddleClick = function(event) {
        var i, info, infos, len, maximized, wxw;
        if (os.platform() === 'win32') {
            wxw = require('wxw');
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
        var base, day, iconDir, mth, time;
        iconDir = slash.join(slash.userData(), 'icons');
        if (slash.win()) {
            this.exeIcon(this.kachelId, iconDir, this.setIcon);
        } else {
            this.setIcon(this.appIcon(this.kachelId, iconDir));
        }
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
        var img;
        if (!iconPath) {
            return;
        }
        img = elem('img', {
            "class": 'applicon',
            src: slash.fileUrl(iconPath)
        });
        img.ondragstart = function() {
            return false;
        };
        this.main.innerHTML = '';
        this.main.appendChild(img);
        return this.updateDot();
    };

    Appl.prototype.exeIcon = function(exePath, outDir, cb) {
        var any2Ico, pngPath, wxw;
        fs.mkdir(outDir, {
            recursive: true
        });
        pngPath = slash.resolve(slash.join(outDir, slash.base(exePath) + ".png"));
        any2Ico = slash.path(__dirname + '/../bin/Quick_Any2Ico.exe');
        if (false) {
            klog('appl.exeIcon', any2Ico);
            return childp.exec("\"" + any2Ico + "\" -formats=512 -res=\"" + exePath + "\" -icon=\"" + pngPath + "\"", {}, function(err, stdout, stderr) {
                if (err == null) {
                    return cb(pngPath);
                } else {
                    if (slash.ext(exePath) !== 'lnk') {
                        console.error(stdout, stderr, err);
                    }
                    return cb();
                }
            });
        } else {
            wxw = require('wxw');
            klog('exeIcon', exePath, pngPath);
            wxw('icon', exePath, pngPath);
            return cb(pngPath);
        }
    };

    Appl.prototype.appIcon = function(appPath, outDir) {
        var conPath, err, icnsPath, infoPath, obj, pngPath, size, splist;
        fs.mkdir(outDir, {
            recursive: true
        });
        size = 512;
        conPath = slash.join(appPath, 'Contents');
        try {
            infoPath = slash.join(conPath, 'Info.plist');
            fs.accessSync(infoPath, fs.R_OK);
            splist = require('simple-plist');
            obj = splist.readFileSync(infoPath);
            if (obj['CFBundleIconFile'] != null) {
                icnsPath = slash.join(slash.dirname(infoPath), 'Resources', obj['CFBundleIconFile']);
                if (!icnsPath.endsWith('.icns')) {
                    icnsPath += ".icns";
                }
                fs.accessSync(icnsPath, fs.R_OK);
                pngPath = slash.resolve(slash.join(outDir, slash.base(appPath) + ".png"));
                childp.execSync("/usr/bin/sips -Z " + size + " -s format png \"" + (slash.escape(icnsPath)) + "\" --out \"" + (slash.escape(pngPath)) + "\"");
                fs.accessSync(pngPath, fs.R_OK);
                return pngPath;
            }
        } catch (error) {
            err = error;
            return console.error(err);
        }
    };

    return Appl;

})(Kachel);

module.exports = Appl;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsbUdBQUE7SUFBQTs7OztBQVFBLE1BQXVGLE9BQUEsQ0FBUSxLQUFSLENBQXZGLEVBQUUsZUFBRixFQUFRLG1CQUFSLEVBQWdCLGlCQUFoQixFQUF1QixpQkFBdkIsRUFBOEIsaUJBQTlCLEVBQXFDLHFCQUFyQyxFQUE4QyxlQUE5QyxFQUFvRCxlQUFwRCxFQUEwRCxlQUExRCxFQUFnRSxlQUFoRSxFQUFzRSxXQUF0RSxFQUEwRSxXQUExRSxFQUE4RSxTQUE5RSxFQUFpRjs7QUFFakYsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztBQUVIOzs7SUFFQyxjQUFDLEdBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLGtEQUFTOzs7Ozs7OztRQUVWLElBQUksQ0FBQyxFQUFMLENBQVEsS0FBUixFQUFjLElBQUMsQ0FBQSxLQUFmO1FBQ0EsSUFBSSxDQUFDLEVBQUwsQ0FBUSxLQUFSLEVBQWMsSUFBQyxDQUFBLEtBQWY7UUFFQSxJQUFDLENBQUEsU0FBRCxHQUFhO1FBQ2IsSUFBQyxDQUFBLE1BQUQsR0FBYTtRQUViLDBHQUFBLFNBQUE7SUFSRDs7bUJBVUgsS0FBQSxHQUFPLFNBQUMsTUFBRCxFQUFTLEdBQVQ7UUFFSCxJQUFDLENBQUEsU0FBRCxHQUFhLE1BQUEsS0FBVTtlQUN2QixJQUFDLENBQUEsU0FBRCxDQUFBO0lBSEc7O21CQUtQLEtBQUEsR0FBTyxTQUFDLElBQUQ7QUFFSCxZQUFBO1FBQUEsSUFBQyxDQUFBLE1BQUQsR0FBVTtBQUNWLGFBQUEsc0NBQUE7O0FBQ0k7QUFBQSxpQkFBQSx3Q0FBQTs7Z0JBQ0ksSUFBRyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVQsQ0FBb0IsQ0FBcEIsQ0FBSDtvQkFDSSxJQUFDLENBQUEsTUFBRCxHQUFVLENBQUMsQ0FBQztBQUNaLDBCQUZKOztBQURKO1lBSUEsSUFB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LE9BQUEsR0FBVSxLQUFLLENBQUMsT0FBTixDQUFjLEtBQUssQ0FBQyxJQUFOLENBQVcsTUFBWCxFQUFtQixLQUFLLENBQUMsSUFBTixDQUFXLE9BQVgsQ0FBQSxHQUFzQixNQUF6QyxDQUFkO2dCQUNWLE1BQU0sQ0FBQyxRQUFQLENBQWdCLG1CQUFBLEdBQW9CLElBQXBCLEdBQXlCLG1CQUF6QixHQUEyQyxDQUFDLEtBQUssQ0FBQyxNQUFOLENBQWEsUUFBYixDQUFELENBQTNDLEdBQWtFLGFBQWxFLEdBQThFLENBQUMsS0FBSyxDQUFDLE1BQU4sQ0FBYSxPQUFiLENBQUQsQ0FBOUUsR0FBb0csSUFBcEg7Z0JBQ0EsRUFBRSxDQUFDLFVBQUgsQ0FBYyxPQUFkLEVBQXVCLEVBQUUsQ0FBQyxJQUExQjtBQUNBLHVCQUFPLFFBUFg7YUFMSjtTQUFBLGFBQUE7WUFhTTttQkFDSCxPQUFBLENBQUMsS0FBRCxDQUFPLEdBQVAsRUFkSDs7SUFMSzs7OztHQW5NTTs7QUF3Tm5CLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgICAgICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAgICAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMDAwMDAgIFxuIyMjXG5cbnsgcG9zdCwgY2hpbGRwLCBzbGFzaCwgZW1wdHksIHZhbGlkLCByYW5kaW50LCBrbG9nLCBrc3RyLCBlbGVtLCBvcGVuLCBvcywgZnMsICQsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuS2FjaGVsID0gcmVxdWlyZSAnLi9rYWNoZWwnXG5cbmNsYXNzIEFwcGwgZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonYXBwbCcpIC0+IFxuICAgIFxuICAgICAgICBwb3N0Lm9uICdhcHAnIEBvbkFwcFxuICAgICAgICBwb3N0Lm9uICd3aW4nIEBvbldpblxuICAgICAgICBcbiAgICAgICAgQGFjdGl2YXRlZCA9IGZhbHNlXG4gICAgICAgIEBzdGF0dXMgICAgPSAnJ1xuICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgICAgICAgICBcbiAgICBvbkFwcDogKGFjdGlvbiwgYXBwKSA9PlxuICAgICAgICBcbiAgICAgICAgQGFjdGl2YXRlZCA9IGFjdGlvbiA9PSAnYWN0aXZhdGVkJ1xuICAgICAgICBAdXBkYXRlRG90KClcblxuICAgIG9uV2luOiAod2lucykgPT5cbiAgICAgICAgXG4gICAgICAgIEBzdGF0dXMgPSAnJ1xuICAgICAgICBmb3IgdyBpbiB3aW5zXG4gICAgICAgICAgICBmb3IgYyBpbiBbJ21heGltaXplZCcgJ25vcm1hbCddXG4gICAgICAgICAgICAgICAgaWYgdy5zdGF0dXMuc3RhcnRzV2l0aCBjXG4gICAgICAgICAgICAgICAgICAgIEBzdGF0dXMgPSB3LnN0YXR1c1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgaWYgdmFsaWQgQHN0YXR1c1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGVtcHR5IEBzdGF0dXNcbiAgICAgICAgICAgIGZvciB3IGluIHdpbnNcbiAgICAgICAgICAgICAgICBpZiB3LnN0YXR1cyA9PSAnbWluaW1pemVkJ1xuICAgICAgICAgICAgICAgICAgICBAc3RhdHVzID0gJ21pbmltaXplZCdcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgXG4gICAgICAgIEB1cGRhdGVEb3QoKVxuICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgdXBkYXRlRG90OiAtPlxuICAgICAgICBcbiAgICAgICAgZG90ID0kICcuYXBwbGRvdCdcbiAgICAgICAgXG4gICAgICAgIGlmIEBhY3RpdmF0ZWQgYW5kIG5vdCBkb3RcbiAgICAgICAgICAgIGRvdCA9IGVsZW0gY2xhc3M6J2FwcGxkb3QnXG4gICAgICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBkb3RcbiAgICAgICAgZWxzZSBpZiBub3QgQGFjdGl2YXRlZCBhbmQgZG90XG4gICAgICAgICAgICBkb3Q/LnJlbW92ZSgpXG4gICAgICAgICAgICBkb3QgPSBudWxsXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgZG90XG4gICAgICAgICAgICBkb3QuY2xhc3NMaXN0LnJlbW92ZSAndG9wJ1xuICAgICAgICAgICAgZG90LmNsYXNzTGlzdC5yZW1vdmUgJ25vcm1hbCdcbiAgICAgICAgICAgIGRvdC5jbGFzc0xpc3QucmVtb3ZlICdtaW5pbWl6ZWQnXG4gICAgICAgICAgICBkb3QuY2xhc3NMaXN0LnJlbW92ZSAnbWF4aW1pemVkJ1xuICAgICAgICAgICAgaWYgdmFsaWQgQHN0YXR1c1xuICAgICAgICAgICAgICAgIGZvciBzIGluIEBzdGF0dXMuc3BsaXQgJyAnXG4gICAgICAgICAgICAgICAgICAgIGRvdC5jbGFzc0xpc3QuYWRkIHNcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIG9uQ2xpY2s6IChldmVudCkgLT4gXG4gICAgICAgIFxuICAgICAgICBrbG9nICdhcHBsLm9uQ2xpY2snIHNsYXNoLmZpbGUgQGthY2hlbElkXG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgIHd4dyA9IHJlcXVpcmUgJ3d4dydcbiAgICAgICAgICAgIGluZm9zID0gd3h3ICdpbmZvJyBzbGFzaC5maWxlIEBrYWNoZWxJZFxuICAgICAgICAgICAgaWYgaW5mb3MubGVuZ3RoXG4gICAgICAgICAgICAgICAga2xvZyBcInd4dyAnZm9jdXMnICN7c2xhc2guZmlsZSBAa2FjaGVsSWR9XCJcbiAgICAgICAgICAgICAgICB3eHcgJ2ZvY3VzJyBzbGFzaC5maWxlIEBrYWNoZWxJZFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG9wZW4gc2xhc2gudW5zbGFzaCBAa2FjaGVsSWQgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG9wZW4gQGthY2hlbElkIFxuICAgIFxuICAgIG9uQ29udGV4dE1lbnU6IChldmVudCkgPT4gXG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgIHd4dyA9IHJlcXVpcmUgJ3d4dydcbiAgICAgICAgICAgIHd4dyAnbWluaW1pemUnIHNsYXNoLmZpbGUgQGthY2hlbElkXG5cbiAgICBvbk1pZGRsZUNsaWNrOiAoZXZlbnQpID0+IFxuICAgICAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICB3eHcgPSByZXF1aXJlICd3eHcnXG4gICAgICAgICAgICBpbmZvcyA9IHd4dyAnaW5mbycgc2xhc2guZmlsZSBAa2FjaGVsSWRcbiAgICAgICAgICAgIGlmIGluZm9zLmxlbmd0aFxuICAgICAgICAgICAgICAgIG1heGltaXplZCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgZm9yIGluZm8gaW4gaW5mb3NcbiAgICAgICAgICAgICAgICAgICAgaWYgaW5mby5zdGF0dXMgPT0gJ21heGltaXplZCdcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heGltaXplZCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgaWYgbWF4aW1pemVkXG4gICAgICAgICAgICAgICAgICAgIHd4dyAncmVzdG9yZScgc2xhc2guZmlsZSBAa2FjaGVsSWRcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHd4dyAnbWF4aW1pemUnIHNsYXNoLmZpbGUgQGthY2hlbElkXG4gICAgICAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIG9uSW5pdEthY2hlbDogKEBrYWNoZWxJZCkgPT5cbiAgICAgICAgICAgIFxuICAgICAgICBpY29uRGlyID0gc2xhc2guam9pbiBzbGFzaC51c2VyRGF0YSgpLCAnaWNvbnMnXG4gICAgICAgIGFwcE5hbWUgPSBzbGFzaC5iYXNlIEBrYWNoZWxJZFxuICAgICAgICBpY29uUGF0aCA9IFwiI3tpY29uRGlyfS8je2FwcE5hbWV9LnBuZ1wiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIG5vdCBzbGFzaC5pc0ZpbGUgaWNvblBhdGhcbiAgICAgICAgICAgIEByZWZyZXNoSWNvbigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzZXRJY29uIGljb25QYXRoXG4gICAgICAgICAgIFxuICAgICAgICBiYXNlID0gc2xhc2guYmFzZSBAa2FjaGVsSWRcbiAgICAgICAgaWYgYmFzZSBpbiBbJ0NhbGVuZGFyJ11cbiAgICAgICAgICAgIG1pbnV0ZXMgPSB7Q2FsZW5kYXI6NjB9W2Jhc2VdXG4gICAgICAgICAgICBAcmVmcmVzaEljb24oKVxuICAgICAgICAgICAgc2V0SW50ZXJ2YWwgQHJlZnJlc2hJY29uLCAxMDAwKjYwKm1pbnV0ZXNcbiAgICAgICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICAgICBcbiAgICByZWZyZXNoSWNvbjogPT5cbiAgICAgICAgXG4gICAgICAgIGljb25EaXIgPSBzbGFzaC5qb2luIHNsYXNoLnVzZXJEYXRhKCksICdpY29ucydcbiAgICAgICAgXG4gICAgICAgIGlmIHNsYXNoLndpbigpXG4gICAgICAgICAgICBAZXhlSWNvbiBAa2FjaGVsSWQsIGljb25EaXIsIEBzZXRJY29uXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzZXRJY29uIEBhcHBJY29uIEBrYWNoZWxJZCwgaWNvbkRpclxuXG4gICAgICAgIGJhc2UgPSBzbGFzaC5iYXNlIEBrYWNoZWxJZFxuICAgICAgICBpZiBiYXNlIGluIFsnQ2FsZW5kYXInXVxuICAgICAgICAgICAgdGltZSA9IG5ldyBEYXRlKClcbiAgICAgICAgICAgIGRheSA9IGVsZW0gY2xhc3M6J2NhbGVuZGFyRGF5JyB0ZXh0OmtzdHIubHBhZCB0aW1lLmdldERhdGUoKSwgMiwgJzAnXG4gICAgICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBkYXlcbiAgICAgICAgICAgIG10aCA9IGVsZW0gY2xhc3M6J2NhbGVuZGFyTW9udGgnIHRleHQ6WydKQU4nICdGRUInICdNQVInICdBUFInICdNQVknICdKVU4nICdKVUwnICdBVUcnICdTRVAnICdPQ1QnICdOT1YnICdERUMnXVt0aW1lLmdldE1vbnRoKCldXG4gICAgICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBtdGhcbiAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHNldEljb246IChpY29uUGF0aCkgPT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgaWNvblBhdGhcbiAgICAgICAgaW1nID0gZWxlbSAnaW1nJyBjbGFzczonYXBwbGljb24nIHNyYzpzbGFzaC5maWxlVXJsIGljb25QYXRoXG4gICAgICAgIGltZy5vbmRyYWdzdGFydCA9IC0+IGZhbHNlXG4gICAgICAgIEBtYWluLmlubmVySFRNTCA9ICcnXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGltZ1xuICAgICAgICBAdXBkYXRlRG90KClcbiAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBleGVJY29uOiAoZXhlUGF0aCwgb3V0RGlyLCBjYikgLT5cblxuICAgICAgICBmcy5ta2RpciBvdXREaXIsIHJlY3Vyc2l2ZTp0cnVlXG4gICAgICAgIHBuZ1BhdGggPSBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gb3V0RGlyLCBzbGFzaC5iYXNlKGV4ZVBhdGgpICsgXCIucG5nXCJcbiAgICAgICAgYW55MkljbyA9IHNsYXNoLnBhdGggX19kaXJuYW1lICsgJy8uLi9iaW4vUXVpY2tfQW55Mkljby5leGUnXG4gICAgICAgIFxuICAgICAgICBpZiBmYWxzZSAjIHNsYXNoLmlzRmlsZSBhbnkySWNvXG4gICAgICAgICAgICBrbG9nICdhcHBsLmV4ZUljb24nIGFueTJJY29cbiAgICAgICAgICAgIGNoaWxkcC5leGVjIFwiXFxcIiN7YW55Mkljb31cXFwiIC1mb3JtYXRzPTUxMiAtcmVzPVxcXCIje2V4ZVBhdGh9XFxcIiAtaWNvbj1cXFwiI3twbmdQYXRofVxcXCJcIiwge30sIChlcnIsc3Rkb3V0LHN0ZGVycikgLT4gXG4gICAgICAgICAgICAgICAgaWYgbm90IGVycj8gXG4gICAgICAgICAgICAgICAgICAgIGNiIHBuZ1BhdGhcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGlmIHNsYXNoLmV4dChleGVQYXRoKSE9ICdsbmsnXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciBzdGRvdXQsIHN0ZGVyciwgZXJyXG4gICAgICAgICAgICAgICAgICAgIGNiKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgd3h3ID0gcmVxdWlyZSAnd3h3J1xuICAgICAgICAgICAga2xvZyAnZXhlSWNvbicgZXhlUGF0aCwgcG5nUGF0aFxuICAgICAgICAgICAgd3h3ICdpY29uJyBleGVQYXRoLCBwbmdQYXRoXG4gICAgICAgICAgICBjYiBwbmdQYXRoXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgYXBwSWNvbjogKGFwcFBhdGgsIG91dERpcikgLT5cbiAgICAgICAgXG4gICAgICAgIGZzLm1rZGlyIG91dERpciwgcmVjdXJzaXZlOnRydWVcbiAgICAgICAgc2l6ZSA9IDUxMlxuICAgICAgICBjb25QYXRoID0gc2xhc2guam9pbiBhcHBQYXRoLCAnQ29udGVudHMnXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgaW5mb1BhdGggPSBzbGFzaC5qb2luIGNvblBhdGgsICdJbmZvLnBsaXN0J1xuICAgICAgICAgICAgZnMuYWNjZXNzU3luYyBpbmZvUGF0aCwgZnMuUl9PS1xuICAgICAgICAgICAgc3BsaXN0ID0gcmVxdWlyZSAnc2ltcGxlLXBsaXN0J1xuICAgICAgICAgICAgb2JqID0gc3BsaXN0LnJlYWRGaWxlU3luYyBpbmZvUGF0aCAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb2JqWydDRkJ1bmRsZUljb25GaWxlJ10/XG4gICAgICAgICAgICAgICAgaWNuc1BhdGggPSBzbGFzaC5qb2luIHNsYXNoLmRpcm5hbWUoaW5mb1BhdGgpLCAnUmVzb3VyY2VzJywgb2JqWydDRkJ1bmRsZUljb25GaWxlJ11cbiAgICAgICAgICAgICAgICBpY25zUGF0aCArPSBcIi5pY25zXCIgaWYgbm90IGljbnNQYXRoLmVuZHNXaXRoICcuaWNucydcbiAgICAgICAgICAgICAgICBmcy5hY2Nlc3NTeW5jIGljbnNQYXRoLCBmcy5SX09LIFxuICAgICAgICAgICAgICAgIHBuZ1BhdGggPSBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gb3V0RGlyLCBzbGFzaC5iYXNlKGFwcFBhdGgpICsgXCIucG5nXCJcbiAgICAgICAgICAgICAgICBjaGlsZHAuZXhlY1N5bmMgXCIvdXNyL2Jpbi9zaXBzIC1aICN7c2l6ZX0gLXMgZm9ybWF0IHBuZyBcXFwiI3tzbGFzaC5lc2NhcGUgaWNuc1BhdGh9XFxcIiAtLW91dCBcXFwiI3tzbGFzaC5lc2NhcGUgcG5nUGF0aH1cXFwiXCJcbiAgICAgICAgICAgICAgICBmcy5hY2Nlc3NTeW5jIHBuZ1BhdGgsIGZzLlJfT0tcbiAgICAgICAgICAgICAgICByZXR1cm4gcG5nUGF0aFxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgIGVycm9yIGVyclxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gQXBwbFxuIl19
//# sourceURL=../coffee/appl.coffee
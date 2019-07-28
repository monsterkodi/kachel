// koffee 1.3.0

/*
 0000000   00000000   00000000   000      
000   000  000   000  000   000  000      
000000000  00000000   00000000   000      
000   000  000        000        000      
000   000  000        000        0000000
 */
var Appl, Kachel, _, childp, elem, fs, klog, open, os, ref, slash,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), childp = ref.childp, slash = ref.slash, open = ref.open, klog = ref.klog, elem = ref.elem, os = ref.os, fs = ref.fs, _ = ref._;

Kachel = require('./kachel');

Appl = (function(superClass) {
    extend(Appl, superClass);

    function Appl(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'appl';
        this.setIcon = bind(this.setIcon, this);
        this.refreshIcon = bind(this.refreshIcon, this);
        this.onInitKachel = bind(this.onInitKachel, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Appl.__super__.constructor.apply(this, arguments);
    }

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
                text: time.getDate()
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
        return this.main.appendChild(img);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsNkRBQUE7SUFBQTs7OztBQVFBLE1BQWlELE9BQUEsQ0FBUSxLQUFSLENBQWpELEVBQUUsbUJBQUYsRUFBVSxpQkFBVixFQUFpQixlQUFqQixFQUF1QixlQUF2QixFQUE2QixlQUE3QixFQUFtQyxXQUFuQyxFQUF1QyxXQUF2QyxFQUEyQzs7QUFFM0MsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztBQUVIOzs7SUFFQyxjQUFDLEdBQUQ7QUFBc0IsWUFBQTtRQUFyQixJQUFDLENBQUEsa0RBQVM7Ozs7UUFBVywwR0FBQSxTQUFBO0lBQXRCOzttQkFFSCxPQUFBLEdBQVMsU0FBQyxLQUFEO0FBRUwsWUFBQTtRQUFBLElBQUEsQ0FBSyxjQUFMLEVBQW9CLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBQyxDQUFBLFFBQVosQ0FBcEI7UUFFQSxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixPQUFwQjtZQUNJLEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUjtZQUNOLEtBQUEsR0FBUSxHQUFBLENBQUksTUFBSixFQUFXLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBQyxDQUFBLFFBQVosQ0FBWDtZQUNSLElBQUcsS0FBSyxDQUFDLE1BQVQ7Z0JBQ0ksSUFBQSxDQUFLLGNBQUEsR0FBYyxDQUFDLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBQyxDQUFBLFFBQVosQ0FBRCxDQUFuQjt1QkFDQSxHQUFBLENBQUksT0FBSixFQUFZLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBQyxDQUFBLFFBQVosQ0FBWixFQUZKO2FBQUEsTUFBQTt1QkFJSSxJQUFBLENBQUssS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFDLENBQUEsUUFBZixDQUFMLEVBSko7YUFISjtTQUFBLE1BQUE7bUJBU0ksSUFBQSxDQUFLLElBQUMsQ0FBQSxRQUFO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SjtTQUFBLGFBQUE7WUFhTTttQkFDSCxPQUFBLENBQUMsS0FBRCxDQUFPLEdBQVAsRUFkSDs7SUFMSzs7OztHQTVHTTs7QUFpSW5CLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgICAgICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAgICAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMDAwMDAgIFxuIyMjXG5cbnsgY2hpbGRwLCBzbGFzaCwgb3Blbiwga2xvZywgZWxlbSwgb3MsIGZzLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbkthY2hlbCA9IHJlcXVpcmUgJy4va2FjaGVsJ1xuXG5jbGFzcyBBcHBsIGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J2FwcGwnKSAtPiBzdXBlclxuICAgICAgICBcbiAgICBvbkNsaWNrOiAoZXZlbnQpIC0+IFxuICAgICAgICBcbiAgICAgICAga2xvZyAnYXBwbC5vbkNsaWNrJyBzbGFzaC5maWxlIEBrYWNoZWxJZFxuICAgICAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICB3eHcgPSByZXF1aXJlICd3eHcnXG4gICAgICAgICAgICBpbmZvcyA9IHd4dyAnaW5mbycgc2xhc2guZmlsZSBAa2FjaGVsSWRcbiAgICAgICAgICAgIGlmIGluZm9zLmxlbmd0aFxuICAgICAgICAgICAgICAgIGtsb2cgXCJ3eHcgJ2ZvY3VzJyAje3NsYXNoLmZpbGUgQGthY2hlbElkfVwiXG4gICAgICAgICAgICAgICAgd3h3ICdmb2N1cycgc2xhc2guZmlsZSBAa2FjaGVsSWRcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBvcGVuIHNsYXNoLnVuc2xhc2ggQGthY2hlbElkIFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvcGVuIEBrYWNoZWxJZCBcbiAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIG9uSW5pdEthY2hlbDogKEBrYWNoZWxJZCkgPT5cbiAgICAgICAgICAgIFxuICAgICAgICBpY29uRGlyID0gc2xhc2guam9pbiBzbGFzaC51c2VyRGF0YSgpLCAnaWNvbnMnXG4gICAgICAgIGFwcE5hbWUgPSBzbGFzaC5iYXNlIEBrYWNoZWxJZFxuICAgICAgICBpY29uUGF0aCA9IFwiI3tpY29uRGlyfS8je2FwcE5hbWV9LnBuZ1wiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIG5vdCBzbGFzaC5pc0ZpbGUgaWNvblBhdGhcbiAgICAgICAgICAgIEByZWZyZXNoSWNvbigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzZXRJY29uIGljb25QYXRoXG4gICAgICAgICAgIFxuICAgICAgICBiYXNlID0gc2xhc2guYmFzZSBAa2FjaGVsSWRcbiAgICAgICAgaWYgYmFzZSBpbiBbJ0NhbGVuZGFyJ11cbiAgICAgICAgICAgIG1pbnV0ZXMgPSB7Q2FsZW5kYXI6NjB9W2Jhc2VdXG4gICAgICAgICAgICBAcmVmcmVzaEljb24oKVxuICAgICAgICAgICAgc2V0SW50ZXJ2YWwgQHJlZnJlc2hJY29uLCAxMDAwKjYwKm1pbnV0ZXNcbiAgICAgICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICAgICBcbiAgICByZWZyZXNoSWNvbjogPT5cbiAgICAgICAgXG4gICAgICAgIGljb25EaXIgPSBzbGFzaC5qb2luIHNsYXNoLnVzZXJEYXRhKCksICdpY29ucydcbiAgICAgICAgXG4gICAgICAgIGlmIHNsYXNoLndpbigpXG4gICAgICAgICAgICBAZXhlSWNvbiBAa2FjaGVsSWQsIGljb25EaXIsIEBzZXRJY29uXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzZXRJY29uIEBhcHBJY29uIEBrYWNoZWxJZCwgaWNvbkRpclxuXG4gICAgICAgIGJhc2UgPSBzbGFzaC5iYXNlIEBrYWNoZWxJZFxuICAgICAgICBpZiBiYXNlIGluIFsnQ2FsZW5kYXInXVxuICAgICAgICAgICAgdGltZSA9IG5ldyBEYXRlKClcbiAgICAgICAgICAgIGRheSA9IGVsZW0gY2xhc3M6J2NhbGVuZGFyRGF5JyB0ZXh0OnRpbWUuZ2V0RGF0ZSgpXG4gICAgICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBkYXlcbiAgICAgICAgICAgIG10aCA9IGVsZW0gY2xhc3M6J2NhbGVuZGFyTW9udGgnIHRleHQ6WydKQU4nICdGRUInICdNQVInICdBUFInICdNQVknICdKVU4nICdKVUwnICdBVUcnICdTRVAnICdPQ1QnICdOT1YnICdERUMnXVt0aW1lLmdldE1vbnRoKCldXG4gICAgICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBtdGhcbiAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHNldEljb246IChpY29uUGF0aCkgPT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgaWNvblBhdGhcbiAgICAgICAgaW1nID0gZWxlbSAnaW1nJyBjbGFzczonYXBwbGljb24nIHNyYzpzbGFzaC5maWxlVXJsIGljb25QYXRoXG4gICAgICAgIGltZy5vbmRyYWdzdGFydCA9IC0+IGZhbHNlXG4gICAgICAgIEBtYWluLmlubmVySFRNTCA9ICcnXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGltZ1xuICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIGV4ZUljb246IChleGVQYXRoLCBvdXREaXIsIGNiKSAtPlxuXG4gICAgICAgIGZzLm1rZGlyIG91dERpciwgcmVjdXJzaXZlOnRydWVcbiAgICAgICAgcG5nUGF0aCA9IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBvdXREaXIsIHNsYXNoLmJhc2UoZXhlUGF0aCkgKyBcIi5wbmdcIlxuICAgICAgICBhbnkySWNvID0gc2xhc2gucGF0aCBfX2Rpcm5hbWUgKyAnLy4uL2Jpbi9RdWlja19BbnkySWNvLmV4ZSdcbiAgICAgICAgXG4gICAgICAgIGlmIGZhbHNlICMgc2xhc2guaXNGaWxlIGFueTJJY29cbiAgICAgICAgICAgIGtsb2cgJ2FwcGwuZXhlSWNvbicgYW55Mkljb1xuICAgICAgICAgICAgY2hpbGRwLmV4ZWMgXCJcXFwiI3thbnkySWNvfVxcXCIgLWZvcm1hdHM9NTEyIC1yZXM9XFxcIiN7ZXhlUGF0aH1cXFwiIC1pY29uPVxcXCIje3BuZ1BhdGh9XFxcIlwiLCB7fSwgKGVycixzdGRvdXQsc3RkZXJyKSAtPiBcbiAgICAgICAgICAgICAgICBpZiBub3QgZXJyPyBcbiAgICAgICAgICAgICAgICAgICAgY2IgcG5nUGF0aFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaWYgc2xhc2guZXh0KGV4ZVBhdGgpIT0gJ2xuaydcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yIHN0ZG91dCwgc3RkZXJyLCBlcnJcbiAgICAgICAgICAgICAgICAgICAgY2IoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB3eHcgPSByZXF1aXJlICd3eHcnXG4gICAgICAgICAgICBrbG9nICdleGVJY29uJyBleGVQYXRoLCBwbmdQYXRoXG4gICAgICAgICAgICB3eHcgJ2ljb24nIGV4ZVBhdGgsIHBuZ1BhdGhcbiAgICAgICAgICAgIGNiIHBuZ1BhdGhcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICBcbiAgICBcbiAgICBhcHBJY29uOiAoYXBwUGF0aCwgb3V0RGlyKSAtPlxuICAgICAgICBcbiAgICAgICAgZnMubWtkaXIgb3V0RGlyLCByZWN1cnNpdmU6dHJ1ZVxuICAgICAgICBzaXplID0gNTEyXG4gICAgICAgIGNvblBhdGggPSBzbGFzaC5qb2luIGFwcFBhdGgsICdDb250ZW50cydcbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBpbmZvUGF0aCA9IHNsYXNoLmpvaW4gY29uUGF0aCwgJ0luZm8ucGxpc3QnXG4gICAgICAgICAgICBmcy5hY2Nlc3NTeW5jIGluZm9QYXRoLCBmcy5SX09LXG4gICAgICAgICAgICBzcGxpc3QgPSByZXF1aXJlICdzaW1wbGUtcGxpc3QnXG4gICAgICAgICAgICBvYmogPSBzcGxpc3QucmVhZEZpbGVTeW5jIGluZm9QYXRoICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBvYmpbJ0NGQnVuZGxlSWNvbkZpbGUnXT9cbiAgICAgICAgICAgICAgICBpY25zUGF0aCA9IHNsYXNoLmpvaW4gc2xhc2guZGlybmFtZShpbmZvUGF0aCksICdSZXNvdXJjZXMnLCBvYmpbJ0NGQnVuZGxlSWNvbkZpbGUnXVxuICAgICAgICAgICAgICAgIGljbnNQYXRoICs9IFwiLmljbnNcIiBpZiBub3QgaWNuc1BhdGguZW5kc1dpdGggJy5pY25zJ1xuICAgICAgICAgICAgICAgIGZzLmFjY2Vzc1N5bmMgaWNuc1BhdGgsIGZzLlJfT0sgXG4gICAgICAgICAgICAgICAgcG5nUGF0aCA9IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBvdXREaXIsIHNsYXNoLmJhc2UoYXBwUGF0aCkgKyBcIi5wbmdcIlxuICAgICAgICAgICAgICAgIGNoaWxkcC5leGVjU3luYyBcIi91c3IvYmluL3NpcHMgLVogI3tzaXplfSAtcyBmb3JtYXQgcG5nIFxcXCIje3NsYXNoLmVzY2FwZSBpY25zUGF0aH1cXFwiIC0tb3V0IFxcXCIje3NsYXNoLmVzY2FwZSBwbmdQYXRofVxcXCJcIlxuICAgICAgICAgICAgICAgIGZzLmFjY2Vzc1N5bmMgcG5nUGF0aCwgZnMuUl9PS1xuICAgICAgICAgICAgICAgIHJldHVybiBwbmdQYXRoXG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgZXJyb3IgZXJyXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBBcHBsXG4iXX0=
//# sourceURL=../coffee/appl.coffee
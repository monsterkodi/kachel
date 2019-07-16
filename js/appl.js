// koffee 1.3.0

/*
 0000000   00000000   00000000   000      
000   000  000   000  000   000  000      
000000000  00000000   00000000   000      
000   000  000        000        000      
000   000  000        000        0000000
 */
var Appl, Kachel, _, childp, elem, fs, klog, open, os, osascript, post, prefs, ref, slash,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, childp = ref.childp, prefs = ref.prefs, slash = ref.slash, osascript = ref.osascript, open = ref.open, klog = ref.klog, elem = ref.elem, os = ref.os, fs = ref.fs, _ = ref._;

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
        klog('open app', slash.unslash(this.kachelId));
        return open(slash.unslash(this.kachelId));
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
        var any2Ico, pngPath;
        fs.mkdir(outDir, {
            recursive: true
        });
        pngPath = slash.resolve(slash.join(outDir, slash.base(exePath) + ".png"));
        any2Ico = slash.path(__dirname + '/../bin/Quick_Any2Ico.exe');
        if (slash.isFile(any2Ico)) {
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
            return console.error('no icon extractor!');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEscUZBQUE7SUFBQTs7OztBQVFBLE1BQXlFLE9BQUEsQ0FBUSxLQUFSLENBQXpFLEVBQUUsZUFBRixFQUFRLG1CQUFSLEVBQWdCLGlCQUFoQixFQUF1QixpQkFBdkIsRUFBOEIseUJBQTlCLEVBQXlDLGVBQXpDLEVBQStDLGVBQS9DLEVBQXFELGVBQXJELEVBQTJELFdBQTNELEVBQStELFdBQS9ELEVBQW1FOztBQUVuRSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0FBRUg7OztJQUVDLGNBQUMsR0FBRDtBQUFzQixZQUFBO1FBQXJCLElBQUMsQ0FBQSxrREFBUzs7OztRQUFXLDBHQUFBLFNBQUE7SUFBdEI7O21CQUVILE9BQUEsR0FBUyxTQUFDLEtBQUQ7UUFDTCxJQUFBLENBQUssVUFBTCxFQUFnQixLQUFLLENBQUMsT0FBTixDQUFjLElBQUMsQ0FBQSxRQUFmLENBQWhCO2VBQ0EsSUFBQSxDQUFLLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBQyxDQUFBLFFBQWYsQ0FBTDtJQUZLOzttQkFVVCxZQUFBLEdBQWMsU0FBQyxRQUFEO0FBRVYsWUFBQTtRQUZXLElBQUMsQ0FBQSxXQUFEO1FBRVgsT0FBQSxHQUFVLEtBQUssQ0FBQyxJQUFOLENBQVcsS0FBSyxDQUFDLFFBQU4sQ0FBQSxDQUFYLEVBQTZCLE9BQTdCO1FBQ1YsT0FBQSxHQUFVLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBQyxDQUFBLFFBQVo7UUFDVixRQUFBLEdBQWMsT0FBRCxHQUFTLEdBQVQsR0FBWSxPQUFaLEdBQW9CO1FBRWpDLElBQUcsQ0FBSSxLQUFLLENBQUMsTUFBTixDQUFhLFFBQWIsQ0FBUDtZQUNJLElBQUMsQ0FBQSxXQUFELENBQUEsRUFESjtTQUFBLE1BQUE7WUFHSSxJQUFDLENBQUEsT0FBRCxDQUFTLFFBQVQsRUFISjs7UUFLQSxJ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LENBQWtCLE9BQWxCLENBQTNCO29CQUFBLFFBQUEsSUFBWSxRQUFaOztnQkFDQSxFQUFFLENBQUMsVUFBSCxDQUFjLFFBQWQsRUFBd0IsRUFBRSxDQUFDLElBQTNCO2dCQUNBLE9BQUEsR0FBVSxLQUFLLENBQUMsT0FBTixDQUFjLEtBQUssQ0FBQyxJQUFOLENBQVcsTUFBWCxFQUFtQixLQUFLLENBQUMsSUFBTixDQUFXLE9BQVgsQ0FBQSxHQUFzQixNQUF6QyxDQUFkO2dCQUNWLE1BQU0sQ0FBQyxRQUFQLENBQWdCLG1CQUFBLEdBQW9CLElBQXBCLEdBQXlCLG1CQUF6QixHQUEyQyxDQUFDLEtBQUssQ0FBQyxNQUFOLENBQWEsUUFBYixDQUFELENBQTNDLEdBQWtFLGFBQWxFLEdBQThFLENBQUMsS0FBSyxDQUFDLE1BQU4sQ0FBYSxPQUFiLENBQUQsQ0FBOUUsR0FBb0csSUFBcEg7Z0JBQ0EsRUFBRSxDQUFDLFVBQUgsQ0FBYyxPQUFkLEVBQXVCLEVBQUUsQ0FBQyxJQUExQjtBQUNBLHVCQUFPLFFBUFg7YUFMSjtTQUFBLGFBQUE7WUFhTTttQkFDSCxPQUFBLENBQUMsS0FBRCxDQUFPLEdBQVAsRUFkSDs7SUFMSzs7OztHQTlGTTs7QUFtSG5CLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgICAgICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAgICAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMDAwMDAgIFxuIyMjXG5cbnsgcG9zdCwgY2hpbGRwLCBwcmVmcywgc2xhc2gsIG9zYXNjcmlwdCwgb3Blbiwga2xvZywgZWxlbSwgb3MsIGZzLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbkthY2hlbCA9IHJlcXVpcmUgJy4va2FjaGVsJ1xuXG5jbGFzcyBBcHBsIGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J2FwcGwnKSAtPiBzdXBlclxuICAgICAgICBcbiAgICBvbkNsaWNrOiAoZXZlbnQpIC0+IFxuICAgICAgICBrbG9nICdvcGVuIGFwcCcgc2xhc2gudW5zbGFzaCBAa2FjaGVsSWQgXG4gICAgICAgIG9wZW4gc2xhc2gudW5zbGFzaCBAa2FjaGVsSWQgXG4gICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBvbkluaXRLYWNoZWw6IChAa2FjaGVsSWQpID0+XG4gICAgICAgICAgICBcbiAgICAgICAgaWNvbkRpciA9IHNsYXNoLmpvaW4gc2xhc2gudXNlckRhdGEoKSwgJ2ljb25zJ1xuICAgICAgICBhcHBOYW1lID0gc2xhc2guYmFzZSBAa2FjaGVsSWRcbiAgICAgICAgaWNvblBhdGggPSBcIiN7aWNvbkRpcn0vI3thcHBOYW1lfS5wbmdcIlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBub3Qgc2xhc2guaXNGaWxlIGljb25QYXRoXG4gICAgICAgICAgICBAcmVmcmVzaEljb24oKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2V0SWNvbiBpY29uUGF0aFxuICAgICAgICAgICBcbiAgICAgICAgYmFzZSA9IHNsYXNoLmJhc2UgQGthY2hlbElkXG4gICAgICAgIGlmIGJhc2UgaW4gWydDYWxlbmRhciddXG4gICAgICAgICAgICBtaW51dGVzID0ge0NhbGVuZGFyOjYwfVtiYXNlXVxuICAgICAgICAgICAgQHJlZnJlc2hJY29uKClcbiAgICAgICAgICAgIHNldEludGVydmFsIEByZWZyZXNoSWNvbiwgMTAwMCo2MCptaW51dGVzXG4gICAgICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgICAgXG4gICAgcmVmcmVzaEljb246ID0+XG4gICAgICAgIFxuICAgICAgICBpY29uRGlyID0gc2xhc2guam9pbiBzbGFzaC51c2VyRGF0YSgpLCAnaWNvbnMnXG4gICAgICAgIFxuICAgICAgICBpZiBzbGFzaC53aW4oKVxuICAgICAgICAgICAgQGV4ZUljb24gQGthY2hlbElkLCBpY29uRGlyLCBAc2V0SWNvblxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2V0SWNvbiBAYXBwSWNvbiBAa2FjaGVsSWQsIGljb25EaXJcblxuICAgICAgICBiYXNlID0gc2xhc2guYmFzZSBAa2FjaGVsSWRcbiAgICAgICAgaWYgYmFzZSBpbiBbJ0NhbGVuZGFyJ11cbiAgICAgICAgICAgIHRpbWUgPSBuZXcgRGF0ZSgpXG4gICAgICAgICAgICBkYXkgPSBlbGVtIGNsYXNzOidjYWxlbmRhckRheScgdGV4dDp0aW1lLmdldERhdGUoKVxuICAgICAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgZGF5XG4gICAgICAgICAgICBtdGggPSBlbGVtIGNsYXNzOidjYWxlbmRhck1vbnRoJyB0ZXh0OlsnSkFOJyAnRkVCJyAnTUFSJyAnQVBSJyAnTUFZJyAnSlVOJyAnSlVMJyAnQVVHJyAnU0VQJyAnT0NUJyAnTk9WJyAnREVDJ11bdGltZS5nZXRNb250aCgpXVxuICAgICAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgbXRoXG4gICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBzZXRJY29uOiAoaWNvblBhdGgpID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGljb25QYXRoXG4gICAgICAgIGltZyA9IGVsZW0gJ2ltZycgY2xhc3M6J2FwcGxpY29uJyBzcmM6c2xhc2guZmlsZVVybCBpY29uUGF0aFxuICAgICAgICBpbWcub25kcmFnc3RhcnQgPSAtPiBmYWxzZVxuICAgICAgICBAbWFpbi5pbm5lckhUTUwgPSAnJ1xuICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBpbWdcbiAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBleGVJY29uOiAoZXhlUGF0aCwgb3V0RGlyLCBjYikgLT5cblxuICAgICAgICBmcy5ta2RpciBvdXREaXIsIHJlY3Vyc2l2ZTp0cnVlXG4gICAgICAgIHBuZ1BhdGggPSBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gb3V0RGlyLCBzbGFzaC5iYXNlKGV4ZVBhdGgpICsgXCIucG5nXCJcbiAgICAgICAgYW55MkljbyA9IHNsYXNoLnBhdGggX19kaXJuYW1lICsgJy8uLi9iaW4vUXVpY2tfQW55Mkljby5leGUnXG4gICAgICAgIFxuICAgICAgICBpZiBzbGFzaC5pc0ZpbGUgYW55Mkljb1xuICAgICAgICAgICAga2xvZyAnYXBwbC5leGVJY29uJyBhbnkySWNvXG4gICAgICAgICAgICBjaGlsZHAuZXhlYyBcIlxcXCIje2FueTJJY299XFxcIiAtZm9ybWF0cz01MTIgLXJlcz1cXFwiI3tleGVQYXRofVxcXCIgLWljb249XFxcIiN7cG5nUGF0aH1cXFwiXCIsIHt9LCAoZXJyLHN0ZG91dCxzdGRlcnIpIC0+IFxuICAgICAgICAgICAgICAgIGlmIG5vdCBlcnI/IFxuICAgICAgICAgICAgICAgICAgICBjYiBwbmdQYXRoXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBpZiBzbGFzaC5leHQoZXhlUGF0aCkhPSAnbG5rJ1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3Igc3Rkb3V0LCBzdGRlcnIsIGVyclxuICAgICAgICAgICAgICAgICAgICBjYigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGVycm9yICdubyBpY29uIGV4dHJhY3RvciEnXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgYXBwSWNvbjogKGFwcFBhdGgsIG91dERpcikgLT5cbiAgICAgICAgXG4gICAgICAgIGZzLm1rZGlyIG91dERpciwgcmVjdXJzaXZlOnRydWVcbiAgICAgICAgc2l6ZSA9IDUxMlxuICAgICAgICBjb25QYXRoID0gc2xhc2guam9pbiBhcHBQYXRoLCAnQ29udGVudHMnXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgaW5mb1BhdGggPSBzbGFzaC5qb2luIGNvblBhdGgsICdJbmZvLnBsaXN0J1xuICAgICAgICAgICAgZnMuYWNjZXNzU3luYyBpbmZvUGF0aCwgZnMuUl9PS1xuICAgICAgICAgICAgc3BsaXN0ID0gcmVxdWlyZSAnc2ltcGxlLXBsaXN0J1xuICAgICAgICAgICAgb2JqID0gc3BsaXN0LnJlYWRGaWxlU3luYyBpbmZvUGF0aCAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb2JqWydDRkJ1bmRsZUljb25GaWxlJ10/XG4gICAgICAgICAgICAgICAgaWNuc1BhdGggPSBzbGFzaC5qb2luIHNsYXNoLmRpcm5hbWUoaW5mb1BhdGgpLCAnUmVzb3VyY2VzJywgb2JqWydDRkJ1bmRsZUljb25GaWxlJ11cbiAgICAgICAgICAgICAgICBpY25zUGF0aCArPSBcIi5pY25zXCIgaWYgbm90IGljbnNQYXRoLmVuZHNXaXRoICcuaWNucydcbiAgICAgICAgICAgICAgICBmcy5hY2Nlc3NTeW5jIGljbnNQYXRoLCBmcy5SX09LIFxuICAgICAgICAgICAgICAgIHBuZ1BhdGggPSBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gb3V0RGlyLCBzbGFzaC5iYXNlKGFwcFBhdGgpICsgXCIucG5nXCJcbiAgICAgICAgICAgICAgICBjaGlsZHAuZXhlY1N5bmMgXCIvdXNyL2Jpbi9zaXBzIC1aICN7c2l6ZX0gLXMgZm9ybWF0IHBuZyBcXFwiI3tzbGFzaC5lc2NhcGUgaWNuc1BhdGh9XFxcIiAtLW91dCBcXFwiI3tzbGFzaC5lc2NhcGUgcG5nUGF0aH1cXFwiXCJcbiAgICAgICAgICAgICAgICBmcy5hY2Nlc3NTeW5jIHBuZ1BhdGgsIGZzLlJfT0tcbiAgICAgICAgICAgICAgICByZXR1cm4gcG5nUGF0aFxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgIGVycm9yIGVyclxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gQXBwbFxuIl19
//# sourceURL=../coffee/appl.coffee
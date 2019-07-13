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
        this.onInitData = bind(this.onInitData, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Appl.__super__.constructor.apply(this, arguments);
    }

    Appl.prototype.onClick = function(event) {
        klog('open app', slash.unslash(this.appPath));
        return open(slash.unslash(this.appPath));
    };

    Appl.prototype.onInitData = function(data) {
        var appName, base, iconDir, iconPath, minutes;
        this.appPath = data.app;
        this.kachelId = 'appl' + this.appPath;
        prefs.set("kacheln▸" + this.kachelId + "▸data▸app", this.appPath);
        prefs.set("kacheln▸" + this.kachelId + "▸html", 'appl');
        iconDir = slash.join(slash.userData(), 'icons');
        appName = slash.base(this.appPath);
        iconPath = iconDir + "/" + appName + ".png";
        if (!slash.isFile(iconPath)) {
            this.refreshIcon();
        } else {
            this.setIcon(iconPath);
        }
        base = slash.base(this.appPath);
        if (base === 'Calendar') {
            minutes = {
                Calendar: 60
            }[base];
            this.refreshIcon();
            setInterval(this.refreshIcon, 1000 * 60 * minutes);
        }
        return Appl.__super__.onInitData.apply(this, arguments);
    };

    Appl.prototype.refreshIcon = function() {
        var base, day, iconDir, mth, time;
        iconDir = slash.join(slash.userData(), 'icons');
        if (slash.win()) {
            this.exeIcon(this.appPath, iconDir, this.setIcon);
        } else {
            this.setIcon(this.appIcon(this.appPath, iconDir));
        }
        base = slash.base(this.appPath);
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
        var any2Ico, err, extractIcon, pngPath;
        fs.mkdir(outDir, {
            recursive: true
        });
        pngPath = slash.resolve(slash.join(outDir, slash.base(exePath) + ".png"));
        any2Ico = slash.path(__dirname + '/../bin/Quick_Any2Ico.exe');
        if (slash.isFile(any2Ico)) {
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
            try {
                extractIcon = require('win-icon-extractor');
                return extractIcon(exePath).then(function(result) {
                    var data;
                    if (result) {
                        data = result.slice('data:image/png;base64,'.length);
                        return fs.writeFile(pngPath, data, {
                            encoding: 'base64'
                        }, function(err) {
                            if (err == null) {
                                return cb(pngPath);
                            } else {
                                console.error(err);
                                return cb();
                            }
                        });
                    } else {
                        console.error('no result');
                        return cb();
                    }
                });
            } catch (error) {
                err = error;
                console.error(err);
                return cb();
            }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEscUZBQUE7SUFBQTs7OztBQVFBLE1BQXlFLE9BQUEsQ0FBUSxLQUFSLENBQXpFLEVBQUUsZUFBRixFQUFRLG1CQUFSLEVBQWdCLGlCQUFoQixFQUF1QixpQkFBdkIsRUFBOEIseUJBQTlCLEVBQXlDLGVBQXpDLEVBQStDLGVBQS9DLEVBQXFELGVBQXJELEVBQTJELFdBQTNELEVBQStELFdBQS9ELEVBQW1FOztBQUVuRSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0FBRUg7OztJQUVDLGNBQUMsR0FBRDtBQUFzQixZQUFBO1FBQXJCLElBQUMsQ0FBQSxrREFBUzs7OztRQUFXLDBHQUFBLFNBQUE7SUFBdEI7O21CQUVILE9BQUEsR0FBUyxTQUFDLEtBQUQ7UUFDTCxJQUFBLENBQUssVUFBTCxFQUFnQixLQUFLLENBQUMsT0FBTixDQUFjLElBQUMsQ0FBQSxPQUFmLENBQWhCO2VBQ0EsSUFBQSxDQUFLLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBQyxDQUFBLE9BQWYsQ0FBTDtJQUZLOzttQkFVVCxVQUFBLEdBQVksU0FBQyxJQUFEO0FBRVIsWUFBQTtRQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSSxDQUFDO1FBQ2hCLElBQUMsQ0FBQSxRQUFELEdBQVksTUFBQSxHQUFPLElBQUMsQ0FBQTtRQUNwQixLQUFLLENBQUMsR0FBTixDQUFVLFVBQUEsR0FBVyxJQUFDLENBQUEsUUFBWixHQUFxQixXQUEvQixFQUEwQyxJQUFDLENBQUEsT0FBM0M7UUFDQSxLQUFLLENBQUMsR0FBTixDQUFVLFVBQUEsR0FBVyxJQUFDLENBQUEsUUFBWixHQUFxQixPQUEvQixFQUFzQyxNQUF0QztRQUVBLE9BQUEsR0FBVSxLQUFLLENBQUMsSUFBTixDQUFXLEtBQUssQ0FBQyxRQUFOLENBQUEsQ0FBWCxFQUE2QixPQUE3QjtRQUNW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LENBQWQ7Z0JBQ1YsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsbUJBQUEsR0FBb0IsSUFBcEIsR0FBeUIsbUJBQXpCLEdBQTJDLENBQUMsS0FBSyxDQUFDLE1BQU4sQ0FBYSxRQUFiLENBQUQsQ0FBM0MsR0FBa0UsYUFBbEUsR0FBOEUsQ0FBQyxLQUFLLENBQUMsTUFBTixDQUFhLE9BQWIsQ0FBRCxDQUE5RSxHQUFvRyxJQUFwSDtnQkFDQSxFQUFFLENBQUMsVUFBSCxDQUFjLE9BQWQsRUFBdUIsRUFBRSxDQUFDLElBQTFCO0FBQ0EsdUJBQU8sUUFQWDthQUxKO1NBQUEsYUFBQTtZQWFNO21CQUNILE9BQUEsQ0FBQyxLQUFELENBQU8sR0FBUCxFQWRIOztJQUxLOzs7O0dBbEhNOztBQXVJbkIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgICAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4wMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgICAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMCAgICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwMDAwMCAgXG4jIyNcblxueyBwb3N0LCBjaGlsZHAsIHByZWZzLCBzbGFzaCwgb3Nhc2NyaXB0LCBvcGVuLCBrbG9nLCBlbGVtLCBvcywgZnMsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuS2FjaGVsID0gcmVxdWlyZSAnLi9rYWNoZWwnXG5cbmNsYXNzIEFwcGwgZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonYXBwbCcpIC0+IHN1cGVyXG4gICAgICAgIFxuICAgIG9uQ2xpY2s6IChldmVudCkgLT4gXG4gICAgICAgIGtsb2cgJ29wZW4gYXBwJyBzbGFzaC51bnNsYXNoIEBhcHBQYXRoIFxuICAgICAgICBvcGVuIHNsYXNoLnVuc2xhc2ggQGFwcFBhdGggXG4gICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBvbkluaXREYXRhOiAoZGF0YSkgPT5cbiAgICAgICAgXG4gICAgICAgIEBhcHBQYXRoID0gZGF0YS5hcHBcbiAgICAgICAgQGthY2hlbElkID0gJ2FwcGwnK0BhcHBQYXRoXG4gICAgICAgIHByZWZzLnNldCBcImthY2hlbG7ilrgje0BrYWNoZWxJZH3ilrhkYXRh4pa4YXBwXCIgQGFwcFBhdGhcbiAgICAgICAgcHJlZnMuc2V0IFwia2FjaGVsbuKWuCN7QGthY2hlbElkfeKWuGh0bWxcIiAnYXBwbCdcbiAgICBcbiAgICAgICAgaWNvbkRpciA9IHNsYXNoLmpvaW4gc2xhc2gudXNlckRhdGEoKSwgJ2ljb25zJ1xuICAgICAgICBhcHBOYW1lID0gc2xhc2guYmFzZSBAYXBwUGF0aFxuICAgICAgICBpY29uUGF0aCA9IFwiI3tpY29uRGlyfS8je2FwcE5hbWV9LnBuZ1wiXG4gICAgICAgIGlmIG5vdCBzbGFzaC5pc0ZpbGUgaWNvblBhdGhcbiAgICAgICAgICAgIEByZWZyZXNoSWNvbigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzZXRJY29uIGljb25QYXRoXG4gICAgICAgICAgIFxuICAgICAgICBiYXNlID0gc2xhc2guYmFzZSBAYXBwUGF0aFxuICAgICAgICBpZiBiYXNlIGluIFsnQ2FsZW5kYXInXVxuICAgICAgICAgICAgbWludXRlcyA9IHtDYWxlbmRhcjo2MH1bYmFzZV1cbiAgICAgICAgICAgIEByZWZyZXNoSWNvbigpXG4gICAgICAgICAgICBzZXRJbnRlcnZhbCBAcmVmcmVzaEljb24sIDEwMDAqNjAqbWludXRlc1xuICAgICAgICAgICAgXG4gICAgICAgIHN1cGVyXG4gICAgICAgICAgIFxuICAgIHJlZnJlc2hJY29uOiA9PlxuICAgICAgICBcbiAgICAgICAgaWNvbkRpciA9IHNsYXNoLmpvaW4gc2xhc2gudXNlckRhdGEoKSwgJ2ljb25zJ1xuICAgICAgICBcbiAgICAgICAgaWYgc2xhc2gud2luKClcbiAgICAgICAgICAgIEBleGVJY29uIEBhcHBQYXRoLCBpY29uRGlyLCBAc2V0SWNvblxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2V0SWNvbiBAYXBwSWNvbiBAYXBwUGF0aCwgaWNvbkRpclxuXG4gICAgICAgIGJhc2UgPSBzbGFzaC5iYXNlIEBhcHBQYXRoXG4gICAgICAgIGlmIGJhc2UgaW4gWydDYWxlbmRhciddXG4gICAgICAgICAgICB0aW1lID0gbmV3IERhdGUoKVxuICAgICAgICAgICAgZGF5ID0gZWxlbSBjbGFzczonY2FsZW5kYXJEYXknIHRleHQ6dGltZS5nZXREYXRlKClcbiAgICAgICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGRheVxuICAgICAgICAgICAgbXRoID0gZWxlbSBjbGFzczonY2FsZW5kYXJNb250aCcgdGV4dDpbJ0pBTicgJ0ZFQicgJ01BUicgJ0FQUicgJ01BWScgJ0pVTicgJ0pVTCcgJ0FVRycgJ1NFUCcgJ09DVCcgJ05PVicgJ0RFQyddW3RpbWUuZ2V0TW9udGgoKV1cbiAgICAgICAgICAgIEBtYWluLmFwcGVuZENoaWxkIG10aFxuICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgc2V0SWNvbjogKGljb25QYXRoKSA9PlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBpY29uUGF0aFxuICAgICAgICBpbWcgPSBlbGVtICdpbWcnIGNsYXNzOidhcHBsaWNvbicgc3JjOnNsYXNoLmZpbGVVcmwgaWNvblBhdGhcbiAgICAgICAgaW1nLm9uZHJhZ3N0YXJ0ID0gLT4gZmFsc2VcbiAgICAgICAgQG1haW4uaW5uZXJIVE1MID0gJydcbiAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgaW1nXG4gICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgZXhlSWNvbjogKGV4ZVBhdGgsIG91dERpciwgY2IpIC0+XG5cbiAgICAgICAgZnMubWtkaXIgb3V0RGlyLCByZWN1cnNpdmU6dHJ1ZVxuICAgICAgICBwbmdQYXRoID0gc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIG91dERpciwgc2xhc2guYmFzZShleGVQYXRoKSArIFwiLnBuZ1wiXG4gICAgICAgIGFueTJJY28gPSBzbGFzaC5wYXRoIF9fZGlybmFtZSArICcvLi4vYmluL1F1aWNrX0FueTJJY28uZXhlJ1xuICAgICAgICBcbiAgICAgICAgaWYgc2xhc2guaXNGaWxlIGFueTJJY29cbiAgICAgICAgXG4gICAgICAgICAgICBjaGlsZHAuZXhlYyBcIlxcXCIje2FueTJJY299XFxcIiAtZm9ybWF0cz01MTIgLXJlcz1cXFwiI3tleGVQYXRofVxcXCIgLWljb249XFxcIiN7cG5nUGF0aH1cXFwiXCIsIHt9LCAoZXJyLHN0ZG91dCxzdGRlcnIpIC0+IFxuICAgICAgICAgICAgICAgIGlmIG5vdCBlcnI/IFxuICAgICAgICAgICAgICAgICAgICBjYiBwbmdQYXRoXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBpZiBzbGFzaC5leHQoZXhlUGF0aCkhPSAnbG5rJ1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3Igc3Rkb3V0LCBzdGRlcnIsIGVyclxuICAgICAgICAgICAgICAgICAgICBjYigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGV4dHJhY3RJY29uID0gcmVxdWlyZSAnd2luLWljb24tZXh0cmFjdG9yJ1xuICAgICAgICAgICAgICAgIGV4dHJhY3RJY29uKGV4ZVBhdGgpLnRoZW4gKHJlc3VsdCkgLT5cbiAgICAgICAgICAgICAgICAgICAgaWYgcmVzdWx0XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhID0gcmVzdWx0LnNsaWNlICdkYXRhOmltYWdlL3BuZztiYXNlNjQsJy5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIGZzLndyaXRlRmlsZSBwbmdQYXRoLCBkYXRhLCB7ZW5jb2Rpbmc6ICdiYXNlNjQnfSwgKGVycikgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBub3QgZXJyP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYiBwbmdQYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvciBlcnJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2IoKVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciAnbm8gcmVzdWx0J1xuICAgICAgICAgICAgICAgICAgICAgICAgY2IoKVxuICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgZXJyb3IgZXJyXG4gICAgICAgICAgICAgICAgY2IoKVxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIFxuICAgIFxuICAgIGFwcEljb246IChhcHBQYXRoLCBvdXREaXIpIC0+XG4gICAgICAgIFxuICAgICAgICBmcy5ta2RpciBvdXREaXIsIHJlY3Vyc2l2ZTp0cnVlXG4gICAgICAgIHNpemUgPSA1MTJcbiAgICAgICAgY29uUGF0aCA9IHNsYXNoLmpvaW4gYXBwUGF0aCwgJ0NvbnRlbnRzJ1xuICAgICAgICB0cnlcbiAgICAgICAgICAgIGluZm9QYXRoID0gc2xhc2guam9pbiBjb25QYXRoLCAnSW5mby5wbGlzdCdcbiAgICAgICAgICAgIGZzLmFjY2Vzc1N5bmMgaW5mb1BhdGgsIGZzLlJfT0tcbiAgICAgICAgICAgIHNwbGlzdCA9IHJlcXVpcmUgJ3NpbXBsZS1wbGlzdCdcbiAgICAgICAgICAgIG9iaiA9IHNwbGlzdC5yZWFkRmlsZVN5bmMgaW5mb1BhdGggICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG9ialsnQ0ZCdW5kbGVJY29uRmlsZSddP1xuICAgICAgICAgICAgICAgIGljbnNQYXRoID0gc2xhc2guam9pbiBzbGFzaC5kaXJuYW1lKGluZm9QYXRoKSwgJ1Jlc291cmNlcycsIG9ialsnQ0ZCdW5kbGVJY29uRmlsZSddXG4gICAgICAgICAgICAgICAgaWNuc1BhdGggKz0gXCIuaWNuc1wiIGlmIG5vdCBpY25zUGF0aC5lbmRzV2l0aCAnLmljbnMnXG4gICAgICAgICAgICAgICAgZnMuYWNjZXNzU3luYyBpY25zUGF0aCwgZnMuUl9PSyBcbiAgICAgICAgICAgICAgICBwbmdQYXRoID0gc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIG91dERpciwgc2xhc2guYmFzZShhcHBQYXRoKSArIFwiLnBuZ1wiXG4gICAgICAgICAgICAgICAgY2hpbGRwLmV4ZWNTeW5jIFwiL3Vzci9iaW4vc2lwcyAtWiAje3NpemV9IC1zIGZvcm1hdCBwbmcgXFxcIiN7c2xhc2guZXNjYXBlIGljbnNQYXRofVxcXCIgLS1vdXQgXFxcIiN7c2xhc2guZXNjYXBlIHBuZ1BhdGh9XFxcIlwiXG4gICAgICAgICAgICAgICAgZnMuYWNjZXNzU3luYyBwbmdQYXRoLCBmcy5SX09LXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBuZ1BhdGhcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBlcnJvciBlcnJcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEFwcGxcbiJdfQ==
//# sourceURL=../coffee/appl.coffee
// koffee 1.3.0

/*
 0000000   00000000   00000000   000      
000   000  000   000  000   000  000      
000000000  00000000   00000000   000      
000   000  000        000        000      
000   000  000        000        0000000
 */
var Appl, Kachel, _, childp, elem, fs, klog, open, post, prefs, ref, slash,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, childp = ref.childp, prefs = ref.prefs, slash = ref.slash, open = ref.open, klog = ref.klog, elem = ref.elem, fs = ref.fs, _ = ref._;

Kachel = require('./kachel');

Appl = (function(superClass) {
    extend(Appl, superClass);

    function Appl(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'appl';
        this.setIcon = bind(this.setIcon, this);
        this.onInitData = bind(this.onInitData, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Appl.__super__.constructor.apply(this, arguments);
    }

    Appl.prototype.onClick = function() {
        klog("open " + this.appPath);
        return open(this.appPath);
    };

    Appl.prototype.onInitData = function(data) {
        var appName, bounds, iconDir, iconPath;
        this.appPath = data.app;
        this.kachelId = 'appl' + this.appPath;
        prefs.set("kacheln:" + this.kachelId + ":data:app", this.appPath);
        prefs.set("kacheln:" + this.kachelId + ":html", 'appl');
        iconDir = slash.join(slash.userData(), 'icons');
        fs.mkdir(iconDir, {
            recursive: true
        });
        appName = slash.base(this.appPath);
        iconPath = iconDir + "/" + appName + ".png";
        if (!slash.isFile(iconPath)) {
            if (slash.win()) {
                this.exeIcon(data.app, iconDir, this.setIcon);
            } else {
                this.setIcon(this.appIcon(data.app, iconDir));
            }
        } else {
            this.setIcon(iconPath);
        }
        bounds = prefs.get("bounds:" + this.kachelId);
        if (bounds != null) {
            return this.win.setPosition(bounds.x, bounds.y);
        }
    };

    Appl.prototype.setIcon = function(iconPath) {
        if (!iconPath) {
            return;
        }
        return this.main.appendChild(elem('img', {
            "class": 'applicon',
            click: this.openApp,
            src: slash.fileUrl(iconPath)
        }));
    };

    Appl.prototype.exeIcon = function(exePath, outDir, cb) {
        var any2Ico, err, extractIcon, pngPath;
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
        size = 110;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsc0VBQUE7SUFBQTs7OztBQVFBLE1BQTBELE9BQUEsQ0FBUSxLQUFSLENBQTFELEVBQUUsZUFBRixFQUFRLG1CQUFSLEVBQWdCLGlCQUFoQixFQUF1QixpQkFBdkIsRUFBOEIsZUFBOUIsRUFBb0MsZUFBcEMsRUFBMEMsZUFBMUMsRUFBZ0QsV0FBaEQsRUFBb0Q7O0FBRXBELE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFFSDs7O0lBRUMsY0FBQyxHQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxrREFBUzs7O1FBRVYsMEdBQUEsU0FBQTtJQUZEOzttQkFJSCxPQUFBLEdBQVMsU0FBQTtRQUNMLElBQUEsQ0FBSyxPQUFBLEdBQVEsSUFBQyxDQUFBLE9BQWQ7ZUFDQSxJQUFBLENBQUssSUFBQyxDQUFBLE9BQU47SUFGSzs7bUJBSVQsVUFBQSxHQUFZLFNBQUMsSUFBRDtBQUVSLFlBQUE7UUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUksQ0FBQztRQUNoQixJQUFDLENBQUEsUUFBRCxHQUFZLE1BQUEsR0FBTyxJQUFDLENBQUE7UUFDcEIsS0FBSyxDQUFDLEdBQU4sQ0FBVSxVQUFBLEdBQVcsSUFBQyxDQUFBLFFBQVosR0FBcUIsV0FBL0IsRUFBMEMsSUFBQyxDQUFBLE9BQTNDO1FBQ0EsS0FBSyxDQUFDLEdBQU4sQ0FBVSxVQUFBLEdBQVcsSUFBQyxDQUFBLFFBQVosR0FBcUIsT0FBL0IsRUFBc0MsTUFBdEM7UUFFQSxPQUFBLEdBQVUsS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFLLENBQUMsUUFBTixDQUFBLENBQVgsRUFBNkIsT0FBN0I7UUFDVixFQUFFLENBQUMsS0FBSCxDQUFTLE9BQVQsRUFBa0I7WUFBQSxTQUFBLEVBQVUsSUFBVjtTQUFsQjtRQUNBLE9BQUEsR0FBVSxLQUFLLENBQUMsSUFB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QWEsUUFBYixDQUFELENBQTNDLEdBQWtFLGFBQWxFLEdBQThFLENBQUMsS0FBSyxDQUFDLE1BQU4sQ0FBYSxPQUFiLENBQUQsQ0FBOUUsR0FBb0csSUFBcEg7Z0JBQ0EsRUFBRSxDQUFDLFVBQUgsQ0FBYyxPQUFkLEVBQXVCLEVBQUUsQ0FBQyxJQUExQjtBQUNBLHVCQUFPLFFBUFg7YUFMSjtTQUFBLGFBQUE7WUFhTTttQkFDSCxPQUFBLENBQUMsS0FBRCxDQUFPLEdBQVAsRUFkSDs7SUFKSzs7OztHQXZFTTs7QUEyRm5CLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgICAgICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAgICAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMDAwMDAgIFxuIyMjXG5cbnsgcG9zdCwgY2hpbGRwLCBwcmVmcywgc2xhc2gsIG9wZW4sIGtsb2csIGVsZW0sIGZzLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbkthY2hlbCA9IHJlcXVpcmUgJy4va2FjaGVsJ1xuXG5jbGFzcyBBcHBsIGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J2FwcGwnKSAtPiBcbiAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgb25DbGljazogLT4gXG4gICAgICAgIGtsb2cgXCJvcGVuICN7QGFwcFBhdGh9XCJcbiAgICAgICAgb3BlbiBAYXBwUGF0aFxuICAgICAgICBcbiAgICBvbkluaXREYXRhOiAoZGF0YSkgPT5cbiAgICAgICAgXG4gICAgICAgIEBhcHBQYXRoID0gZGF0YS5hcHBcbiAgICAgICAgQGthY2hlbElkID0gJ2FwcGwnK0BhcHBQYXRoXG4gICAgICAgIHByZWZzLnNldCBcImthY2hlbG46I3tAa2FjaGVsSWR9OmRhdGE6YXBwXCIgQGFwcFBhdGhcbiAgICAgICAgcHJlZnMuc2V0IFwia2FjaGVsbjoje0BrYWNoZWxJZH06aHRtbFwiICdhcHBsJ1xuICAgIFxuICAgICAgICBpY29uRGlyID0gc2xhc2guam9pbiBzbGFzaC51c2VyRGF0YSgpLCAnaWNvbnMnXG4gICAgICAgIGZzLm1rZGlyIGljb25EaXIsIHJlY3Vyc2l2ZTp0cnVlXG4gICAgICAgIGFwcE5hbWUgPSBzbGFzaC5iYXNlIEBhcHBQYXRoXG4gICAgICAgIGljb25QYXRoID0gXCIje2ljb25EaXJ9LyN7YXBwTmFtZX0ucG5nXCJcbiAgICAgICAgaWYgbm90IHNsYXNoLmlzRmlsZSBpY29uUGF0aFxuICAgICAgICAgICAgaWYgc2xhc2gud2luKClcbiAgICAgICAgICAgICAgICBAZXhlSWNvbiBkYXRhLmFwcCwgaWNvbkRpciwgQHNldEljb25cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAc2V0SWNvbiBAYXBwSWNvbiBkYXRhLmFwcCwgaWNvbkRpclxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2V0SWNvbiBpY29uUGF0aFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBib3VuZHMgPSBwcmVmcy5nZXQgXCJib3VuZHM6I3tAa2FjaGVsSWR9XCJcbiAgICAgICAgaWYgYm91bmRzP1xuICAgICAgICAgICAgQHdpbi5zZXRQb3NpdGlvbiBib3VuZHMueCwgYm91bmRzLnlcbiAgICAgICAgICAgICAgICBcbiAgICBzZXRJY29uOiAoaWNvblBhdGgpID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGljb25QYXRoXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGVsZW0gJ2ltZycgY2xhc3M6J2FwcGxpY29uJyBjbGljazpAb3BlbkFwcCwgc3JjOnNsYXNoLmZpbGVVcmwgaWNvblBhdGhcbiAgICAgICAgICAgICAgICAgICBcbiAgICBleGVJY29uOiAoZXhlUGF0aCwgb3V0RGlyLCBjYikgLT5cblxuICAgICAgICBwbmdQYXRoID0gc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIG91dERpciwgc2xhc2guYmFzZShleGVQYXRoKSArIFwiLnBuZ1wiXG4gICAgICAgIGFueTJJY28gPSBzbGFzaC5wYXRoIF9fZGlybmFtZSArICcvLi4vYmluL1F1aWNrX0FueTJJY28uZXhlJ1xuICAgICAgICBcbiAgICAgICAgaWYgc2xhc2guaXNGaWxlIGFueTJJY29cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2hpbGRwLmV4ZWMgXCJcXFwiI3thbnkySWNvfVxcXCIgLWZvcm1hdHM9NTEyIC1yZXM9XFxcIiN7ZXhlUGF0aH1cXFwiIC1pY29uPVxcXCIje3BuZ1BhdGh9XFxcIlwiLCB7fSwgKGVycixzdGRvdXQsc3RkZXJyKSAtPiBcbiAgICAgICAgICAgICAgICBpZiBub3QgZXJyPyBcbiAgICAgICAgICAgICAgICAgICAgY2IgcG5nUGF0aFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaWYgc2xhc2guZXh0KGV4ZVBhdGgpIT0gJ2xuaydcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yIHN0ZG91dCwgc3RkZXJyLCBlcnJcbiAgICAgICAgICAgICAgICAgICAgY2IoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBleHRyYWN0SWNvbiA9IHJlcXVpcmUgJ3dpbi1pY29uLWV4dHJhY3RvcidcbiAgICAgICAgICAgICAgICBleHRyYWN0SWNvbihleGVQYXRoKS50aGVuIChyZXN1bHQpIC0+XG4gICAgICAgICAgICAgICAgICAgIGlmIHJlc3VsdFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YSA9IHJlc3VsdC5zbGljZSAnZGF0YTppbWFnZS9wbmc7YmFzZTY0LCcubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICBmcy53cml0ZUZpbGUgcG5nUGF0aCwgZGF0YSwge2VuY29kaW5nOiAnYmFzZTY0J30sIChlcnIpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgbm90IGVycj9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2IgcG5nUGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IgZXJyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNiKClcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IgJ25vIHJlc3VsdCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGNiKClcbiAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgIGVycm9yIGVyclxuICAgICAgICAgICAgICAgIGNiKClcbiAgICAgICAgICAgIFxuICAgIGFwcEljb246IChhcHBQYXRoLCBvdXREaXIpIC0+XG4gICAgICAgIFxuICAgICAgICBzaXplID0gMTEwXG4gICAgICAgIGNvblBhdGggPSBzbGFzaC5qb2luIGFwcFBhdGgsICdDb250ZW50cydcbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBpbmZvUGF0aCA9IHNsYXNoLmpvaW4gY29uUGF0aCwgJ0luZm8ucGxpc3QnXG4gICAgICAgICAgICBmcy5hY2Nlc3NTeW5jIGluZm9QYXRoLCBmcy5SX09LXG4gICAgICAgICAgICBzcGxpc3QgPSByZXF1aXJlICdzaW1wbGUtcGxpc3QnXG4gICAgICAgICAgICBvYmogPSBzcGxpc3QucmVhZEZpbGVTeW5jIGluZm9QYXRoICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBvYmpbJ0NGQnVuZGxlSWNvbkZpbGUnXT9cbiAgICAgICAgICAgICAgICBpY25zUGF0aCA9IHNsYXNoLmpvaW4gc2xhc2guZGlybmFtZShpbmZvUGF0aCksICdSZXNvdXJjZXMnLCBvYmpbJ0NGQnVuZGxlSWNvbkZpbGUnXVxuICAgICAgICAgICAgICAgIGljbnNQYXRoICs9IFwiLmljbnNcIiBpZiBub3QgaWNuc1BhdGguZW5kc1dpdGggJy5pY25zJ1xuICAgICAgICAgICAgICAgIGZzLmFjY2Vzc1N5bmMgaWNuc1BhdGgsIGZzLlJfT0sgXG4gICAgICAgICAgICAgICAgcG5nUGF0aCA9IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBvdXREaXIsIHNsYXNoLmJhc2UoYXBwUGF0aCkgKyBcIi5wbmdcIlxuICAgICAgICAgICAgICAgIGNoaWxkcC5leGVjU3luYyBcIi91c3IvYmluL3NpcHMgLVogI3tzaXplfSAtcyBmb3JtYXQgcG5nIFxcXCIje3NsYXNoLmVzY2FwZSBpY25zUGF0aH1cXFwiIC0tb3V0IFxcXCIje3NsYXNoLmVzY2FwZSBwbmdQYXRofVxcXCJcIlxuICAgICAgICAgICAgICAgIGZzLmFjY2Vzc1N5bmMgcG5nUGF0aCwgZnMuUl9PS1xuICAgICAgICAgICAgICAgIHJldHVybiBwbmdQYXRoXG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgZXJyb3IgZXJyXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBBcHBsXG4iXX0=
//# sourceURL=../coffee/appl.coffee
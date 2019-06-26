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
        post.on('initData', this.onInitData);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Appl.__super__.constructor.apply(this, arguments);
    }

    Appl.prototype.onClick = function() {
        klog("open " + this.appPath);
        return open(this.appPath);
    };

    Appl.prototype.onInitData = function(data) {
        var appName, bounds, iconDir, iconPath;
        klog('onInitData', data);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsc0VBQUE7SUFBQTs7OztBQVFBLE1BQTBELE9BQUEsQ0FBUSxLQUFSLENBQTFELEVBQUUsZUFBRixFQUFRLG1CQUFSLEVBQWdCLGlCQUFoQixFQUF1QixpQkFBdkIsRUFBOEIsZUFBOUIsRUFBb0MsZUFBcEMsRUFBMEMsZUFBMUMsRUFBZ0QsV0FBaEQsRUFBb0Q7O0FBRXBELE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFFSDs7O0lBRUMsY0FBQyxHQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxrREFBUzs7O1FBRVYsSUFBSSxDQUFDLEVBQUwsQ0FBUSxVQUFSLEVBQW1CLElBQUMsQ0FBQSxVQUFwQjtRQUVBLDBHQUFBLFNBQUE7SUFKRDs7bUJBTUgsT0FBQSxHQUFTLFNBQUE7UUFDTCxJQUFBLENBQUssT0FBQSxHQUFRLElBQUMsQ0FBQSxPQUFkO2VBQ0EsSUFBQSxDQUFLLElBQUMsQ0FBQSxPQUFOO0lBRks7O21CQUlULFVBQUEsR0FBWSxTQUFDLElBQUQ7QUFFUixZQUFBO1FBQUEsSUFBQSxDQUFLLFlBQUwsRUFBbUIsSUFBbkI7UUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUksQ0FBQztRQUNoQixJQUFDLENBQUEsUUFBRCxHQUFZLE1BQUEsR0FBTyxJQUFDLENBQUE7UUFDcEIsS0FBSyxDQUFDLEdBQU4sQ0FBVSxVQUFBLEdBQVcsSUFBQyxDQUFBLFFBQVosR0FBcUIsV0FBL0IsRUFBMEMsSUFBQyxDQUFBLE9BQTNDO1FBQ0EsS0FBSyxDQUFDLEdBQU4sQ0FBVSxVQUFBLEdBQVcsSUFBQyxDQUFBLFFBQVosR0FBcUIsT0FBL0IsRUFBc0MsTUFBdEM7UUFFQSxPQUFBLEdBQVUsS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFLLENBQUMsUUFBTixDQUFBLENBQVgsRUFBNkIsT0FBN0I7UUFDVixF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QUNWLE1BQU0sQ0FBQyxRQUFQLENBQWdCLG1CQUFBLEdBQW9CLElBQXBCLEdBQXlCLG1CQUF6QixHQUEyQyxDQUFDLEtBQUssQ0FBQyxNQUFOLENBQWEsUUFBYixDQUFELENBQTNDLEdBQWtFLGFBQWxFLEdBQThFLENBQUMsS0FBSyxDQUFDLE1BQU4sQ0FBYSxPQUFiLENBQUQsQ0FBOUUsR0FBb0csSUFBcEg7Z0JBQ0EsRUFBRSxDQUFDLFVBQUgsQ0FBYyxPQUFkLEVBQXVCLEVBQUUsQ0FBQyxJQUExQjtBQUNBLHVCQUFPLFFBUFg7YUFMSjtTQUFBLGFBQUE7WUFhTTttQkFDSCxPQUFBLENBQUMsS0FBRCxDQUFPLEdBQVAsRUFkSDs7SUFKSzs7OztHQTFFTTs7QUE4Rm5CLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgICAgICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAgICAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMDAwMDAgIFxuIyMjXG5cbnsgcG9zdCwgY2hpbGRwLCBwcmVmcywgc2xhc2gsIG9wZW4sIGtsb2csIGVsZW0sIGZzLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbkthY2hlbCA9IHJlcXVpcmUgJy4va2FjaGVsJ1xuXG5jbGFzcyBBcHBsIGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J2FwcGwnKSAtPiBcbiAgICBcbiAgICAgICAgcG9zdC5vbiAnaW5pdERhdGEnIEBvbkluaXREYXRhXG4gICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICBvbkNsaWNrOiAtPiBcbiAgICAgICAga2xvZyBcIm9wZW4gI3tAYXBwUGF0aH1cIlxuICAgICAgICBvcGVuIEBhcHBQYXRoXG4gICAgICAgIFxuICAgIG9uSW5pdERhdGE6IChkYXRhKSA9PlxuICAgICAgICBcbiAgICAgICAga2xvZyAnb25Jbml0RGF0YScsIGRhdGFcbiAgICAgICAgQGFwcFBhdGggPSBkYXRhLmFwcFxuICAgICAgICBAa2FjaGVsSWQgPSAnYXBwbCcrQGFwcFBhdGhcbiAgICAgICAgcHJlZnMuc2V0IFwia2FjaGVsbjoje0BrYWNoZWxJZH06ZGF0YTphcHBcIiBAYXBwUGF0aFxuICAgICAgICBwcmVmcy5zZXQgXCJrYWNoZWxuOiN7QGthY2hlbElkfTpodG1sXCIgJ2FwcGwnXG4gICAgXG4gICAgICAgIGljb25EaXIgPSBzbGFzaC5qb2luIHNsYXNoLnVzZXJEYXRhKCksICdpY29ucydcbiAgICAgICAgZnMubWtkaXIgaWNvbkRpciwgcmVjdXJzaXZlOnRydWVcbiAgICAgICAgYXBwTmFtZSA9IHNsYXNoLmJhc2UgQGFwcFBhdGhcbiAgICAgICAgaWNvblBhdGggPSBcIiN7aWNvbkRpcn0vI3thcHBOYW1lfS5wbmdcIlxuICAgICAgICBpZiBub3Qgc2xhc2guaXNGaWxlIGljb25QYXRoXG4gICAgICAgICAgICBpZiBzbGFzaC53aW4oKVxuICAgICAgICAgICAgICAgIEBleGVJY29uIGRhdGEuYXBwLCBpY29uRGlyLCBAc2V0SWNvblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBzZXRJY29uIEBhcHBJY29uIGRhdGEuYXBwLCBpY29uRGlyXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzZXRJY29uIGljb25QYXRoXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGJvdW5kcyA9IHByZWZzLmdldCBcImJvdW5kczoje0BrYWNoZWxJZH1cIlxuICAgICAgICBpZiBib3VuZHM/XG4gICAgICAgICAgICBAd2luLnNldFBvc2l0aW9uIGJvdW5kcy54LCBib3VuZHMueVxuICAgICAgICAgICAgICAgIFxuICAgIHNldEljb246IChpY29uUGF0aCkgPT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgaWNvblBhdGhcbiAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgZWxlbSAnaW1nJyBjbGFzczonYXBwbGljb24nIGNsaWNrOkBvcGVuQXBwLCBzcmM6c2xhc2guZmlsZVVybCBpY29uUGF0aFxuICAgICAgICAgICAgICAgICAgIFxuICAgIGV4ZUljb246IChleGVQYXRoLCBvdXREaXIsIGNiKSAtPlxuXG4gICAgICAgIHBuZ1BhdGggPSBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gb3V0RGlyLCBzbGFzaC5iYXNlKGV4ZVBhdGgpICsgXCIucG5nXCJcbiAgICAgICAgYW55MkljbyA9IHNsYXNoLnBhdGggX19kaXJuYW1lICsgJy8uLi9iaW4vUXVpY2tfQW55Mkljby5leGUnXG4gICAgICAgIFxuICAgICAgICBpZiBzbGFzaC5pc0ZpbGUgYW55Mkljb1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjaGlsZHAuZXhlYyBcIlxcXCIje2FueTJJY299XFxcIiAtZm9ybWF0cz01MTIgLXJlcz1cXFwiI3tleGVQYXRofVxcXCIgLWljb249XFxcIiN7cG5nUGF0aH1cXFwiXCIsIHt9LCAoZXJyLHN0ZG91dCxzdGRlcnIpIC0+IFxuICAgICAgICAgICAgICAgIGlmIG5vdCBlcnI/IFxuICAgICAgICAgICAgICAgICAgICBjYiBwbmdQYXRoXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBpZiBzbGFzaC5leHQoZXhlUGF0aCkhPSAnbG5rJ1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3Igc3Rkb3V0LCBzdGRlcnIsIGVyclxuICAgICAgICAgICAgICAgICAgICBjYigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGV4dHJhY3RJY29uID0gcmVxdWlyZSAnd2luLWljb24tZXh0cmFjdG9yJ1xuICAgICAgICAgICAgICAgIGV4dHJhY3RJY29uKGV4ZVBhdGgpLnRoZW4gKHJlc3VsdCkgLT5cbiAgICAgICAgICAgICAgICAgICAgaWYgcmVzdWx0XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhID0gcmVzdWx0LnNsaWNlICdkYXRhOmltYWdlL3BuZztiYXNlNjQsJy5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIGZzLndyaXRlRmlsZSBwbmdQYXRoLCBkYXRhLCB7ZW5jb2Rpbmc6ICdiYXNlNjQnfSwgKGVycikgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBub3QgZXJyP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYiBwbmdQYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvciBlcnJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2IoKVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciAnbm8gcmVzdWx0J1xuICAgICAgICAgICAgICAgICAgICAgICAgY2IoKVxuICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgZXJyb3IgZXJyXG4gICAgICAgICAgICAgICAgY2IoKVxuICAgICAgICAgICAgXG4gICAgYXBwSWNvbjogKGFwcFBhdGgsIG91dERpcikgLT5cbiAgICAgICAgXG4gICAgICAgIHNpemUgPSAxMTBcbiAgICAgICAgY29uUGF0aCA9IHNsYXNoLmpvaW4gYXBwUGF0aCwgJ0NvbnRlbnRzJ1xuICAgICAgICB0cnlcbiAgICAgICAgICAgIGluZm9QYXRoID0gc2xhc2guam9pbiBjb25QYXRoLCAnSW5mby5wbGlzdCdcbiAgICAgICAgICAgIGZzLmFjY2Vzc1N5bmMgaW5mb1BhdGgsIGZzLlJfT0tcbiAgICAgICAgICAgIHNwbGlzdCA9IHJlcXVpcmUgJ3NpbXBsZS1wbGlzdCdcbiAgICAgICAgICAgIG9iaiA9IHNwbGlzdC5yZWFkRmlsZVN5bmMgaW5mb1BhdGggICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG9ialsnQ0ZCdW5kbGVJY29uRmlsZSddP1xuICAgICAgICAgICAgICAgIGljbnNQYXRoID0gc2xhc2guam9pbiBzbGFzaC5kaXJuYW1lKGluZm9QYXRoKSwgJ1Jlc291cmNlcycsIG9ialsnQ0ZCdW5kbGVJY29uRmlsZSddXG4gICAgICAgICAgICAgICAgaWNuc1BhdGggKz0gXCIuaWNuc1wiIGlmIG5vdCBpY25zUGF0aC5lbmRzV2l0aCAnLmljbnMnXG4gICAgICAgICAgICAgICAgZnMuYWNjZXNzU3luYyBpY25zUGF0aCwgZnMuUl9PSyBcbiAgICAgICAgICAgICAgICBwbmdQYXRoID0gc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIG91dERpciwgc2xhc2guYmFzZShhcHBQYXRoKSArIFwiLnBuZ1wiXG4gICAgICAgICAgICAgICAgY2hpbGRwLmV4ZWNTeW5jIFwiL3Vzci9iaW4vc2lwcyAtWiAje3NpemV9IC1zIGZvcm1hdCBwbmcgXFxcIiN7c2xhc2guZXNjYXBlIGljbnNQYXRofVxcXCIgLS1vdXQgXFxcIiN7c2xhc2guZXNjYXBlIHBuZ1BhdGh9XFxcIlwiXG4gICAgICAgICAgICAgICAgZnMuYWNjZXNzU3luYyBwbmdQYXRoLCBmcy5SX09LXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBuZ1BhdGhcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBlcnJvciBlcnJcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEFwcGxcbiJdfQ==
//# sourceURL=../coffee/appl.coffee
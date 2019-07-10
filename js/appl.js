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
        this.onInitData = bind(this.onInitData, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Appl.__super__.constructor.apply(this, arguments);
    }

    Appl.prototype.onClick = function(event) {
        return open(slash.unslash(this.appPath));
    };

    Appl.prototype.onInitData = function(data) {
        var appName, iconDir, iconPath;
        this.appPath = data.app;
        this.kachelId = 'appl' + this.appPath;
        prefs.set("kacheln▸" + this.kachelId + "▸data▸app", this.appPath);
        prefs.set("kacheln▸" + this.kachelId + "▸html", 'appl');
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
        return Appl.__super__.onInitData.apply(this, arguments);
    };

    Appl.prototype.setIcon = function(iconPath) {
        var img;
        if (!iconPath) {
            return;
        }
        img = elem('img', {
            "class": 'applicon',
            click: this.openApp,
            src: slash.fileUrl(iconPath)
        });
        img.ondragstart = function() {
            return false;
        };
        return this.main.appendChild(img);
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
                        klog('extractIcon result', result.length);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEscUZBQUE7SUFBQTs7OztBQVFBLE1BQXlFLE9BQUEsQ0FBUSxLQUFSLENBQXpFLEVBQUUsZUFBRixFQUFRLG1CQUFSLEVBQWdCLGlCQUFoQixFQUF1QixpQkFBdkIsRUFBOEIseUJBQTlCLEVBQXlDLGVBQXpDLEVBQStDLGVBQS9DLEVBQXFELGVBQXJELEVBQTJELFdBQTNELEVBQStELFdBQS9ELEVBQW1FOztBQUVuRSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0FBRUg7OztJQUVDLGNBQUMsR0FBRDtBQUFzQixZQUFBO1FBQXJCLElBQUMsQ0FBQSxrREFBUzs7O1FBQVcsMEdBQUEsU0FBQTtJQUF0Qjs7bUJBRUgsT0FBQSxHQUFTLFNBQUMsS0FBRDtlQUFXLElBQUEsQ0FBSyxLQUFLLENBQUMsT0FBTixDQUFjLElBQUMsQ0FBQSxPQUFmLENBQUw7SUFBWDs7bUJBUVQsVUFBQSxHQUFZLFNBQUMsSUFBRDtBQUVSLFlBQUE7UUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUksQ0FBQztRQUNoQixJQUFDLENBQUEsUUFBRCxHQUFZLE1BQUEsR0FBTyxJQUFDLENBQUE7UUFDcEIsS0FBSyxDQUFDLEdBQU4sQ0FBVSxVQUFBLEdBQVcsSUFBQyxDQUFBLFFBQVosR0FBcUIsV0FBL0IsRUFBMEMsSUFBQyxDQUFBLE9BQTNDO1FBQ0EsS0FBSyxDQUFDLEdBQU4sQ0FBVSxVQUFBLEdBQVcsSUFBQyxDQUFBLFFBQVosR0FBcUIsT0FBL0IsRUFBc0MsTUFBdEM7UUFFQSxPQUFBLEdBQVUsS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFLLENBQUMsUUFBTixDQUFBLENBQVgsRUFBNkIsT0FBN0I7UUFDVixFQUFFLENBQUMsS0FBSCxDQUFTLE9BQVQsRUFBa0I7WUFBQSxTQUFBLEVBQVUsSUFBVjtTQUFsQjtRQUNBLE9BQUEs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RCxDQUEzQyxHQUFrRSxhQUFsRSxHQUE4RSxDQUFDLEtBQUssQ0FBQyxNQUFOLENBQWEsT0FBYixDQUFELENBQTlFLEdBQW9HLElBQXBIO2dCQUNBLEVBQUUsQ0FBQyxVQUFILENBQWMsT0FBZCxFQUF1QixFQUFFLENBQUMsSUFBMUI7QUFDQSx1QkFBTyxRQVBYO2FBTEo7U0FBQSxhQUFBO1lBYU07bUJBQ0gsT0FBQSxDQUFDLEtBQUQsQ0FBTyxHQUFQLEVBZEg7O0lBSks7Ozs7R0E1Rk07O0FBZ0huQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAgICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbjAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwICAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAwMDAwICBcbiMjI1xuXG57IHBvc3QsIGNoaWxkcCwgcHJlZnMsIHNsYXNoLCBvc2FzY3JpcHQsIG9wZW4sIGtsb2csIGVsZW0sIG9zLCBmcywgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5LYWNoZWwgPSByZXF1aXJlICcuL2thY2hlbCdcblxuY2xhc3MgQXBwbCBleHRlbmRzIEthY2hlbFxuICAgICAgICBcbiAgICBAOiAoQGthY2hlbElkOidhcHBsJykgLT4gc3VwZXJcbiAgICAgICAgXG4gICAgb25DbGljazogKGV2ZW50KSAtPiBvcGVuIHNsYXNoLnVuc2xhc2ggQGFwcFBhdGggXG4gICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBvbkluaXREYXRhOiAoZGF0YSkgPT5cbiAgICAgICAgXG4gICAgICAgIEBhcHBQYXRoID0gZGF0YS5hcHBcbiAgICAgICAgQGthY2hlbElkID0gJ2FwcGwnK0BhcHBQYXRoXG4gICAgICAgIHByZWZzLnNldCBcImthY2hlbG7ilrgje0BrYWNoZWxJZH3ilrhkYXRh4pa4YXBwXCIgQGFwcFBhdGhcbiAgICAgICAgcHJlZnMuc2V0IFwia2FjaGVsbuKWuCN7QGthY2hlbElkfeKWuGh0bWxcIiAnYXBwbCdcbiAgICBcbiAgICAgICAgaWNvbkRpciA9IHNsYXNoLmpvaW4gc2xhc2gudXNlckRhdGEoKSwgJ2ljb25zJ1xuICAgICAgICBmcy5ta2RpciBpY29uRGlyLCByZWN1cnNpdmU6dHJ1ZVxuICAgICAgICBhcHBOYW1lID0gc2xhc2guYmFzZSBAYXBwUGF0aFxuICAgICAgICBpY29uUGF0aCA9IFwiI3tpY29uRGlyfS8je2FwcE5hbWV9LnBuZ1wiXG4gICAgICAgIGlmIG5vdCBzbGFzaC5pc0ZpbGUgaWNvblBhdGhcbiAgICAgICAgICAgIGlmIHNsYXNoLndpbigpXG4gICAgICAgICAgICAgICAgQGV4ZUljb24gZGF0YS5hcHAsIGljb25EaXIsIEBzZXRJY29uXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQHNldEljb24gQGFwcEljb24gZGF0YS5hcHAsIGljb25EaXJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNldEljb24gaWNvblBhdGhcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBzZXRJY29uOiAoaWNvblBhdGgpID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGljb25QYXRoXG4gICAgICAgIGltZyA9IGVsZW0gJ2ltZycgY2xhc3M6J2FwcGxpY29uJyBjbGljazpAb3BlbkFwcCwgc3JjOnNsYXNoLmZpbGVVcmwgaWNvblBhdGhcbiAgICAgICAgaW1nLm9uZHJhZ3N0YXJ0ID0gLT4gZmFsc2VcbiAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgaW1nXG4gICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgZXhlSWNvbjogKGV4ZVBhdGgsIG91dERpciwgY2IpIC0+XG5cbiAgICAgICAgcG5nUGF0aCA9IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBvdXREaXIsIHNsYXNoLmJhc2UoZXhlUGF0aCkgKyBcIi5wbmdcIlxuICAgICAgICBhbnkySWNvID0gc2xhc2gucGF0aCBfX2Rpcm5hbWUgKyAnLy4uL2Jpbi9RdWlja19BbnkySWNvLmV4ZSdcbiAgICAgICAgXG4gICAgICAgIGlmIHNsYXNoLmlzRmlsZSBhbnkySWNvXG4gICAgICAgIFxuICAgICAgICAgICAgY2hpbGRwLmV4ZWMgXCJcXFwiI3thbnkySWNvfVxcXCIgLWZvcm1hdHM9NTEyIC1yZXM9XFxcIiN7ZXhlUGF0aH1cXFwiIC1pY29uPVxcXCIje3BuZ1BhdGh9XFxcIlwiLCB7fSwgKGVycixzdGRvdXQsc3RkZXJyKSAtPiBcbiAgICAgICAgICAgICAgICBpZiBub3QgZXJyPyBcbiAgICAgICAgICAgICAgICAgICAgY2IgcG5nUGF0aFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaWYgc2xhc2guZXh0KGV4ZVBhdGgpIT0gJ2xuaydcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yIHN0ZG91dCwgc3RkZXJyLCBlcnJcbiAgICAgICAgICAgICAgICAgICAgY2IoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBleHRyYWN0SWNvbiA9IHJlcXVpcmUgJ3dpbi1pY29uLWV4dHJhY3RvcidcbiAgICAgICAgICAgICAgICBleHRyYWN0SWNvbihleGVQYXRoKS50aGVuIChyZXN1bHQpIC0+XG4gICAgICAgICAgICAgICAgICAgIGlmIHJlc3VsdFxuICAgICAgICAgICAgICAgICAgICAgICAga2xvZyAnZXh0cmFjdEljb24gcmVzdWx0JyByZXN1bHQubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhID0gcmVzdWx0LnNsaWNlICdkYXRhOmltYWdlL3BuZztiYXNlNjQsJy5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIGZzLndyaXRlRmlsZSBwbmdQYXRoLCBkYXRhLCB7ZW5jb2Rpbmc6ICdiYXNlNjQnfSwgKGVycikgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBub3QgZXJyP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYiBwbmdQYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvciBlcnJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2IoKVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciAnbm8gcmVzdWx0J1xuICAgICAgICAgICAgICAgICAgICAgICAgY2IoKVxuICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgZXJyb3IgZXJyXG4gICAgICAgICAgICAgICAgY2IoKVxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIFxuICAgIFxuICAgIGFwcEljb246IChhcHBQYXRoLCBvdXREaXIpIC0+XG4gICAgICAgIFxuICAgICAgICBzaXplID0gMTEwXG4gICAgICAgIGNvblBhdGggPSBzbGFzaC5qb2luIGFwcFBhdGgsICdDb250ZW50cydcbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBpbmZvUGF0aCA9IHNsYXNoLmpvaW4gY29uUGF0aCwgJ0luZm8ucGxpc3QnXG4gICAgICAgICAgICBmcy5hY2Nlc3NTeW5jIGluZm9QYXRoLCBmcy5SX09LXG4gICAgICAgICAgICBzcGxpc3QgPSByZXF1aXJlICdzaW1wbGUtcGxpc3QnXG4gICAgICAgICAgICBvYmogPSBzcGxpc3QucmVhZEZpbGVTeW5jIGluZm9QYXRoICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBvYmpbJ0NGQnVuZGxlSWNvbkZpbGUnXT9cbiAgICAgICAgICAgICAgICBpY25zUGF0aCA9IHNsYXNoLmpvaW4gc2xhc2guZGlybmFtZShpbmZvUGF0aCksICdSZXNvdXJjZXMnLCBvYmpbJ0NGQnVuZGxlSWNvbkZpbGUnXVxuICAgICAgICAgICAgICAgIGljbnNQYXRoICs9IFwiLmljbnNcIiBpZiBub3QgaWNuc1BhdGguZW5kc1dpdGggJy5pY25zJ1xuICAgICAgICAgICAgICAgIGZzLmFjY2Vzc1N5bmMgaWNuc1BhdGgsIGZzLlJfT0sgXG4gICAgICAgICAgICAgICAgcG5nUGF0aCA9IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBvdXREaXIsIHNsYXNoLmJhc2UoYXBwUGF0aCkgKyBcIi5wbmdcIlxuICAgICAgICAgICAgICAgIGNoaWxkcC5leGVjU3luYyBcIi91c3IvYmluL3NpcHMgLVogI3tzaXplfSAtcyBmb3JtYXQgcG5nIFxcXCIje3NsYXNoLmVzY2FwZSBpY25zUGF0aH1cXFwiIC0tb3V0IFxcXCIje3NsYXNoLmVzY2FwZSBwbmdQYXRofVxcXCJcIlxuICAgICAgICAgICAgICAgIGZzLmFjY2Vzc1N5bmMgcG5nUGF0aCwgZnMuUl9PS1xuICAgICAgICAgICAgICAgIHJldHVybiBwbmdQYXRoXG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgZXJyb3IgZXJyXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBBcHBsXG4iXX0=
//# sourceURL=../coffee/appl.coffee
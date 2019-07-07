// koffee 1.2.0

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEscUZBQUE7SUFBQTs7OztBQVFBLE1BQXlFLE9BQUEsQ0FBUSxLQUFSLENBQXpFLEVBQUUsZUFBRixFQUFRLG1CQUFSLEVBQWdCLGlCQUFoQixFQUF1QixpQkFBdkIsRUFBOEIseUJBQTlCLEVBQXlDLGVBQXpDLEVBQStDLGVBQS9DLEVBQXFELGVBQXJELEVBQTJELFdBQTNELEVBQStELFdBQS9ELEVBQW1FOztBQUVuRSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0FBRUg7OztJQUVDLGNBQUMsR0FBRDtBQUFzQixZQUFBO1FBQXJCLElBQUMsQ0FBQSxrREFBUzs7O1FBQVcsMEdBQUEsU0FBQTtJQUF0Qjs7bUJBRUgsT0FBQSxHQUFTLFNBQUMsS0FBRDtlQUVMLElBQUEsQ0FBSyxLQUFLLENBQUMsT0FBTixDQUFjLElBQUMsQ0FBQSxPQUFmLENBQUw7SUFGSzs7bUJBSVQsVUFBQSxHQUFZLFNBQUMsSUFBRDtBQUVSLFlBQUE7UUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUksQ0FBQztRQUNoQixJQUFDLENBQUEsUUFBRCxHQUFZLE1BQUEsR0FBTyxJQUFDLENBQUE7UUFDcEIsS0FBSyxDQUFDLEdBQU4sQ0FBVSxVQUFBLEdBQVcsSUFBQyxDQUFBLFFBQVosR0FBcUIsV0FBL0IsRUFBMEMsSUFBQyxDQUFBLE9BQTNDO1FBQ0EsS0FBSyxDQUFDLEdBQU4sQ0FBVSxVQUFBLEdBQVcsSUFBQyxDQUFBLFFBQVosR0FBcUIsT0FBL0IsRUFBc0MsTUFBdEM7UUFFQSxPQUFBLEdBQVUsS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFLLENBQUMsUUFBTixDQUFBLENBQVgsRUFBNkIsT0FBN0I7UUFDVixFQUFFLENBQUMsS0FBSCxDQUFTLE9BQVQsRUFBa0I7WUFBQSxTQUFBLEVBQVUsSUFBVjtTQUFsQjtRQUNBLE9BQUEs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TixDQUFhLE9BQWIsQ0FBRCxDQUE5RSxHQUFvRyxJQUFwSDtnQkFDQSxFQUFFLENBQUMsVUFBSCxDQUFjLE9BQWQsRUFBdUIsRUFBRSxDQUFDLElBQTFCO0FBQ0EsdUJBQU8sUUFQWDthQUxKO1NBQUEsYUFBQTtZQWFNO21CQUNILE9BQUEsQ0FBQyxLQUFELENBQU8sR0FBUCxFQWRIOztJQUpLOzs7O0dBckVNOztBQXlGbkIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgICAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4wMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgICAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMCAgICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwMDAwMCAgXG4jIyNcblxueyBwb3N0LCBjaGlsZHAsIHByZWZzLCBzbGFzaCwgb3Nhc2NyaXB0LCBvcGVuLCBrbG9nLCBlbGVtLCBvcywgZnMsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuS2FjaGVsID0gcmVxdWlyZSAnLi9rYWNoZWwnXG5cbmNsYXNzIEFwcGwgZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonYXBwbCcpIC0+IHN1cGVyXG4gICAgICAgIFxuICAgIG9uQ2xpY2s6IChldmVudCkgLT5cbiAgICAgICAgIyBrbG9nIFwib3BlbiAje3NsYXNoLnVuc2xhc2ggQGFwcFBhdGh9XCJcbiAgICAgICAgb3BlbiBzbGFzaC51bnNsYXNoIEBhcHBQYXRoXG4gICAgICAgIFxuICAgIG9uSW5pdERhdGE6IChkYXRhKSA9PlxuICAgICAgICBcbiAgICAgICAgQGFwcFBhdGggPSBkYXRhLmFwcFxuICAgICAgICBAa2FjaGVsSWQgPSAnYXBwbCcrQGFwcFBhdGhcbiAgICAgICAgcHJlZnMuc2V0IFwia2FjaGVsbjoje0BrYWNoZWxJZH06ZGF0YTphcHBcIiBAYXBwUGF0aFxuICAgICAgICBwcmVmcy5zZXQgXCJrYWNoZWxuOiN7QGthY2hlbElkfTpodG1sXCIgJ2FwcGwnXG4gICAgXG4gICAgICAgIGljb25EaXIgPSBzbGFzaC5qb2luIHNsYXNoLnVzZXJEYXRhKCksICdpY29ucydcbiAgICAgICAgZnMubWtkaXIgaWNvbkRpciwgcmVjdXJzaXZlOnRydWVcbiAgICAgICAgYXBwTmFtZSA9IHNsYXNoLmJhc2UgQGFwcFBhdGhcbiAgICAgICAgaWNvblBhdGggPSBcIiN7aWNvbkRpcn0vI3thcHBOYW1lfS5wbmdcIlxuICAgICAgICBpZiBub3Qgc2xhc2guaXNGaWxlIGljb25QYXRoXG4gICAgICAgICAgICBpZiBzbGFzaC53aW4oKVxuICAgICAgICAgICAgICAgIEBleGVJY29uIGRhdGEuYXBwLCBpY29uRGlyLCBAc2V0SWNvblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBzZXRJY29uIEBhcHBJY29uIGRhdGEuYXBwLCBpY29uRGlyXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzZXRJY29uIGljb25QYXRoXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHN1cGVyXG4gICAgICAgICAgICAgICAgXG4gICAgc2V0SWNvbjogKGljb25QYXRoKSA9PlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBpY29uUGF0aFxuICAgICAgICBpbWcgPSBlbGVtICdpbWcnIGNsYXNzOidhcHBsaWNvbicgY2xpY2s6QG9wZW5BcHAsIHNyYzpzbGFzaC5maWxlVXJsIGljb25QYXRoXG4gICAgICAgIGltZy5vbmRyYWdzdGFydCA9IC0+IGZhbHNlXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGltZ1xuICAgICAgICAgICAgICAgICAgIFxuICAgIGV4ZUljb246IChleGVQYXRoLCBvdXREaXIsIGNiKSAtPlxuXG4gICAgICAgIHBuZ1BhdGggPSBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gb3V0RGlyLCBzbGFzaC5iYXNlKGV4ZVBhdGgpICsgXCIucG5nXCJcbiAgICAgICAgYW55MkljbyA9IHNsYXNoLnBhdGggX19kaXJuYW1lICsgJy8uLi9iaW4vUXVpY2tfQW55Mkljby5leGUnXG4gICAgICAgIFxuICAgICAgICBpZiBzbGFzaC5pc0ZpbGUgYW55Mkljb1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjaGlsZHAuZXhlYyBcIlxcXCIje2FueTJJY299XFxcIiAtZm9ybWF0cz01MTIgLXJlcz1cXFwiI3tleGVQYXRofVxcXCIgLWljb249XFxcIiN7cG5nUGF0aH1cXFwiXCIsIHt9LCAoZXJyLHN0ZG91dCxzdGRlcnIpIC0+IFxuICAgICAgICAgICAgICAgIGlmIG5vdCBlcnI/IFxuICAgICAgICAgICAgICAgICAgICBjYiBwbmdQYXRoXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBpZiBzbGFzaC5leHQoZXhlUGF0aCkhPSAnbG5rJ1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3Igc3Rkb3V0LCBzdGRlcnIsIGVyclxuICAgICAgICAgICAgICAgICAgICBjYigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGV4dHJhY3RJY29uID0gcmVxdWlyZSAnd2luLWljb24tZXh0cmFjdG9yJ1xuICAgICAgICAgICAgICAgIGV4dHJhY3RJY29uKGV4ZVBhdGgpLnRoZW4gKHJlc3VsdCkgLT5cbiAgICAgICAgICAgICAgICAgICAgaWYgcmVzdWx0XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhID0gcmVzdWx0LnNsaWNlICdkYXRhOmltYWdlL3BuZztiYXNlNjQsJy5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIGZzLndyaXRlRmlsZSBwbmdQYXRoLCBkYXRhLCB7ZW5jb2Rpbmc6ICdiYXNlNjQnfSwgKGVycikgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBub3QgZXJyP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYiBwbmdQYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvciBlcnJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2IoKVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciAnbm8gcmVzdWx0J1xuICAgICAgICAgICAgICAgICAgICAgICAgY2IoKVxuICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgZXJyb3IgZXJyXG4gICAgICAgICAgICAgICAgY2IoKVxuICAgICAgICAgICAgXG4gICAgYXBwSWNvbjogKGFwcFBhdGgsIG91dERpcikgLT5cbiAgICAgICAgXG4gICAgICAgIHNpemUgPSAxMTBcbiAgICAgICAgY29uUGF0aCA9IHNsYXNoLmpvaW4gYXBwUGF0aCwgJ0NvbnRlbnRzJ1xuICAgICAgICB0cnlcbiAgICAgICAgICAgIGluZm9QYXRoID0gc2xhc2guam9pbiBjb25QYXRoLCAnSW5mby5wbGlzdCdcbiAgICAgICAgICAgIGZzLmFjY2Vzc1N5bmMgaW5mb1BhdGgsIGZzLlJfT0tcbiAgICAgICAgICAgIHNwbGlzdCA9IHJlcXVpcmUgJ3NpbXBsZS1wbGlzdCdcbiAgICAgICAgICAgIG9iaiA9IHNwbGlzdC5yZWFkRmlsZVN5bmMgaW5mb1BhdGggICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG9ialsnQ0ZCdW5kbGVJY29uRmlsZSddP1xuICAgICAgICAgICAgICAgIGljbnNQYXRoID0gc2xhc2guam9pbiBzbGFzaC5kaXJuYW1lKGluZm9QYXRoKSwgJ1Jlc291cmNlcycsIG9ialsnQ0ZCdW5kbGVJY29uRmlsZSddXG4gICAgICAgICAgICAgICAgaWNuc1BhdGggKz0gXCIuaWNuc1wiIGlmIG5vdCBpY25zUGF0aC5lbmRzV2l0aCAnLmljbnMnXG4gICAgICAgICAgICAgICAgZnMuYWNjZXNzU3luYyBpY25zUGF0aCwgZnMuUl9PSyBcbiAgICAgICAgICAgICAgICBwbmdQYXRoID0gc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIG91dERpciwgc2xhc2guYmFzZShhcHBQYXRoKSArIFwiLnBuZ1wiXG4gICAgICAgICAgICAgICAgY2hpbGRwLmV4ZWNTeW5jIFwiL3Vzci9iaW4vc2lwcyAtWiAje3NpemV9IC1zIGZvcm1hdCBwbmcgXFxcIiN7c2xhc2guZXNjYXBlIGljbnNQYXRofVxcXCIgLS1vdXQgXFxcIiN7c2xhc2guZXNjYXBlIHBuZ1BhdGh9XFxcIlwiXG4gICAgICAgICAgICAgICAgZnMuYWNjZXNzU3luYyBwbmdQYXRoLCBmcy5SX09LXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBuZ1BhdGhcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBlcnJvciBlcnJcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEFwcGxcbiJdfQ==
//# sourceURL=../coffee/appl.coffee
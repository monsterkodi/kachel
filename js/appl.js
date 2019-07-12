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
            src: slash.fileUrl(iconPath)
        });
        img.ondragstart = function() {
            return false;
        };
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEscUZBQUE7SUFBQTs7OztBQVFBLE1BQXlFLE9BQUEsQ0FBUSxLQUFSLENBQXpFLEVBQUUsZUFBRixFQUFRLG1CQUFSLEVBQWdCLGlCQUFoQixFQUF1QixpQkFBdkIsRUFBOEIseUJBQTlCLEVBQXlDLGVBQXpDLEVBQStDLGVBQS9DLEVBQXFELGVBQXJELEVBQTJELFdBQTNELEVBQStELFdBQS9ELEVBQW1FOztBQUVuRSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0FBRUg7OztJQUVDLGNBQUMsR0FBRDtBQUFzQixZQUFBO1FBQXJCLElBQUMsQ0FBQSxrREFBUzs7O1FBQVcsMEdBQUEsU0FBQTtJQUF0Qjs7bUJBRUgsT0FBQSxHQUFTLFNBQUMsS0FBRDtlQUFXLElBQUEsQ0FBSyxLQUFLLENBQUMsT0FBTixDQUFjLElBQUMsQ0FBQSxPQUFmLENBQUw7SUFBWDs7bUJBUVQsVUFBQSxHQUFZLFNBQUMsSUFBRDtBQUVSLFlBQUE7UUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUksQ0FBQztRQUNoQixJQUFDLENBQUEsUUFBRCxHQUFZLE1BQUEsR0FBTyxJQUFDLENBQUE7UUFDcEIsS0FBSyxDQUFDLEdBQU4sQ0FBVSxVQUFBLEdBQVcsSUFBQyxDQUFBLFFBQVosR0FBcUIsV0FBL0IsRUFBMEMsSUFBQyxDQUFBLE9BQTNDO1FBQ0EsS0FBSyxDQUFDLEdBQU4sQ0FBVSxVQUFBLEdBQVcsSUFBQyxDQUFBLFFBQVosR0FBcUIsT0FBL0IsRUFBc0MsTUFBdEM7UUFFQSxPQUFBLEdBQVUsS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFLLENBQUMsUUFBTixDQUFBLENBQVgsRUFBNkIsT0FBN0I7UUFDVixPQUFBLEdBQVUsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFDLENBQUEsT0FBWjtRQUNWLFFBQUEsR0FBYyxPQUFELEdB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YUFBbEUsR0FBOEUsQ0FBQyxLQUFLLENBQUMsTUFBTixDQUFhLE9BQWIsQ0FBRCxDQUE5RSxHQUFvRyxJQUFwSDtnQkFDQSxFQUFFLENBQUMsVUFBSCxDQUFjLE9BQWQsRUFBdUIsRUFBRSxDQUFDLElBQTFCO0FBQ0EsdUJBQU8sUUFQWDthQUxKO1NBQUEsYUFBQTtZQWFNO21CQUNILE9BQUEsQ0FBQyxLQUFELENBQU8sR0FBUCxFQWRIOztJQUxLOzs7O0dBM0ZNOztBQWdIbkIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgICAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4wMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgICAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMCAgICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwMDAwMCAgXG4jIyNcblxueyBwb3N0LCBjaGlsZHAsIHByZWZzLCBzbGFzaCwgb3Nhc2NyaXB0LCBvcGVuLCBrbG9nLCBlbGVtLCBvcywgZnMsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuS2FjaGVsID0gcmVxdWlyZSAnLi9rYWNoZWwnXG5cbmNsYXNzIEFwcGwgZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonYXBwbCcpIC0+IHN1cGVyXG4gICAgICAgIFxuICAgIG9uQ2xpY2s6IChldmVudCkgLT4gb3BlbiBzbGFzaC51bnNsYXNoIEBhcHBQYXRoIFxuICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgb25Jbml0RGF0YTogKGRhdGEpID0+XG4gICAgICAgIFxuICAgICAgICBAYXBwUGF0aCA9IGRhdGEuYXBwXG4gICAgICAgIEBrYWNoZWxJZCA9ICdhcHBsJytAYXBwUGF0aFxuICAgICAgICBwcmVmcy5zZXQgXCJrYWNoZWxu4pa4I3tAa2FjaGVsSWR94pa4ZGF0YeKWuGFwcFwiIEBhcHBQYXRoXG4gICAgICAgIHByZWZzLnNldCBcImthY2hlbG7ilrgje0BrYWNoZWxJZH3ilrhodG1sXCIgJ2FwcGwnXG4gICAgXG4gICAgICAgIGljb25EaXIgPSBzbGFzaC5qb2luIHNsYXNoLnVzZXJEYXRhKCksICdpY29ucycgICAgICAgIFxuICAgICAgICBhcHBOYW1lID0gc2xhc2guYmFzZSBAYXBwUGF0aFxuICAgICAgICBpY29uUGF0aCA9IFwiI3tpY29uRGlyfS8je2FwcE5hbWV9LnBuZ1wiXG4gICAgICAgIGlmIG5vdCBzbGFzaC5pc0ZpbGUgaWNvblBhdGhcbiAgICAgICAgICAgIGlmIHNsYXNoLndpbigpXG4gICAgICAgICAgICAgICAgQGV4ZUljb24gZGF0YS5hcHAsIGljb25EaXIsIEBzZXRJY29uXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQHNldEljb24gQGFwcEljb24gZGF0YS5hcHAsIGljb25EaXJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNldEljb24gaWNvblBhdGhcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBzZXRJY29uOiAoaWNvblBhdGgpID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGljb25QYXRoXG4gICAgICAgIGltZyA9IGVsZW0gJ2ltZycgY2xhc3M6J2FwcGxpY29uJyBzcmM6c2xhc2guZmlsZVVybCBpY29uUGF0aFxuICAgICAgICBpbWcub25kcmFnc3RhcnQgPSAtPiBmYWxzZVxuICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBpbWdcbiAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBleGVJY29uOiAoZXhlUGF0aCwgb3V0RGlyLCBjYikgLT5cblxuICAgICAgICBmcy5ta2RpciBvdXREaXIsIHJlY3Vyc2l2ZTp0cnVlXG4gICAgICAgIHBuZ1BhdGggPSBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gb3V0RGlyLCBzbGFzaC5iYXNlKGV4ZVBhdGgpICsgXCIucG5nXCJcbiAgICAgICAgYW55MkljbyA9IHNsYXNoLnBhdGggX19kaXJuYW1lICsgJy8uLi9iaW4vUXVpY2tfQW55Mkljby5leGUnXG4gICAgICAgIFxuICAgICAgICBpZiBzbGFzaC5pc0ZpbGUgYW55Mkljb1xuICAgICAgICBcbiAgICAgICAgICAgIGNoaWxkcC5leGVjIFwiXFxcIiN7YW55Mkljb31cXFwiIC1mb3JtYXRzPTUxMiAtcmVzPVxcXCIje2V4ZVBhdGh9XFxcIiAtaWNvbj1cXFwiI3twbmdQYXRofVxcXCJcIiwge30sIChlcnIsc3Rkb3V0LHN0ZGVycikgLT4gXG4gICAgICAgICAgICAgICAgaWYgbm90IGVycj8gXG4gICAgICAgICAgICAgICAgICAgIGNiIHBuZ1BhdGhcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGlmIHNsYXNoLmV4dChleGVQYXRoKSE9ICdsbmsnXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciBzdGRvdXQsIHN0ZGVyciwgZXJyXG4gICAgICAgICAgICAgICAgICAgIGNiKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgZXh0cmFjdEljb24gPSByZXF1aXJlICd3aW4taWNvbi1leHRyYWN0b3InXG4gICAgICAgICAgICAgICAgZXh0cmFjdEljb24oZXhlUGF0aCkudGhlbiAocmVzdWx0KSAtPlxuICAgICAgICAgICAgICAgICAgICBpZiByZXN1bHRcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEgPSByZXN1bHQuc2xpY2UgJ2RhdGE6aW1hZ2UvcG5nO2Jhc2U2NCwnLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgZnMud3JpdGVGaWxlIHBuZ1BhdGgsIGRhdGEsIHtlbmNvZGluZzogJ2Jhc2U2NCd9LCAoZXJyKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5vdCBlcnI/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNiIHBuZ1BhdGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yIGVyclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYigpXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yICdubyByZXN1bHQnXG4gICAgICAgICAgICAgICAgICAgICAgICBjYigpXG4gICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICBlcnJvciBlcnJcbiAgICAgICAgICAgICAgICBjYigpXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgYXBwSWNvbjogKGFwcFBhdGgsIG91dERpcikgLT5cbiAgICAgICAgXG4gICAgICAgIGZzLm1rZGlyIG91dERpciwgcmVjdXJzaXZlOnRydWVcbiAgICAgICAgc2l6ZSA9IDExMFxuICAgICAgICBjb25QYXRoID0gc2xhc2guam9pbiBhcHBQYXRoLCAnQ29udGVudHMnXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgaW5mb1BhdGggPSBzbGFzaC5qb2luIGNvblBhdGgsICdJbmZvLnBsaXN0J1xuICAgICAgICAgICAgZnMuYWNjZXNzU3luYyBpbmZvUGF0aCwgZnMuUl9PS1xuICAgICAgICAgICAgc3BsaXN0ID0gcmVxdWlyZSAnc2ltcGxlLXBsaXN0J1xuICAgICAgICAgICAgb2JqID0gc3BsaXN0LnJlYWRGaWxlU3luYyBpbmZvUGF0aCAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb2JqWydDRkJ1bmRsZUljb25GaWxlJ10/XG4gICAgICAgICAgICAgICAgaWNuc1BhdGggPSBzbGFzaC5qb2luIHNsYXNoLmRpcm5hbWUoaW5mb1BhdGgpLCAnUmVzb3VyY2VzJywgb2JqWydDRkJ1bmRsZUljb25GaWxlJ11cbiAgICAgICAgICAgICAgICBpY25zUGF0aCArPSBcIi5pY25zXCIgaWYgbm90IGljbnNQYXRoLmVuZHNXaXRoICcuaWNucydcbiAgICAgICAgICAgICAgICBmcy5hY2Nlc3NTeW5jIGljbnNQYXRoLCBmcy5SX09LIFxuICAgICAgICAgICAgICAgIHBuZ1BhdGggPSBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gb3V0RGlyLCBzbGFzaC5iYXNlKGFwcFBhdGgpICsgXCIucG5nXCJcbiAgICAgICAgICAgICAgICBjaGlsZHAuZXhlY1N5bmMgXCIvdXNyL2Jpbi9zaXBzIC1aICN7c2l6ZX0gLXMgZm9ybWF0IHBuZyBcXFwiI3tzbGFzaC5lc2NhcGUgaWNuc1BhdGh9XFxcIiAtLW91dCBcXFwiI3tzbGFzaC5lc2NhcGUgcG5nUGF0aH1cXFwiXCJcbiAgICAgICAgICAgICAgICBmcy5hY2Nlc3NTeW5jIHBuZ1BhdGgsIGZzLlJfT0tcbiAgICAgICAgICAgICAgICByZXR1cm4gcG5nUGF0aFxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgIGVycm9yIGVyclxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gQXBwbFxuIl19
//# sourceURL=../coffee/appl.coffee
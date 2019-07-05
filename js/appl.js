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
        klog("open " + (slash.unslash(this.appPath)));
        return open(slash.unslash(this.appPath));
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
            return this.win.setBounds(bounds);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsc0VBQUE7SUFBQTs7OztBQVFBLE1BQTBELE9BQUEsQ0FBUSxLQUFSLENBQTFELEVBQUUsZUFBRixFQUFRLG1CQUFSLEVBQWdCLGlCQUFoQixFQUF1QixpQkFBdkIsRUFBOEIsZUFBOUIsRUFBb0MsZUFBcEMsRUFBMEMsZUFBMUMsRUFBZ0QsV0FBaEQsRUFBb0Q7O0FBRXBELE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFFSDs7O0lBRUMsY0FBQyxHQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxrREFBUzs7O1FBRVYsMEdBQUEsU0FBQTtJQUZEOzttQkFJSCxPQUFBLEdBQVMsU0FBQTtRQUNMLElBQUEsQ0FBSyxPQUFBLEdBQU8sQ0FBQyxLQUFLLENBQUMsT0FBTixDQUFjLElBQUMsQ0FBQSxPQUFmLENBQUQsQ0FBWjtlQUNBLElBQUEsQ0FBSyxLQUFLLENBQUMsT0FBTixDQUFjLElBQUMsQ0FBQSxPQUFmLENBQUw7SUFGSzs7bUJBSVQsVUFBQSxHQUFZLFNBQUMsSUFBRDtBQUVSLFlBQUE7UUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUksQ0FBQztRQUNoQixJQUFDLENBQUEsUUFBRCxHQUFZLE1BQUEsR0FBTyxJQUFDLENBQUE7UUFDcEIsS0FBSyxDQUFDLEdBQU4sQ0FBVSxVQUFBLEdBQVcsSUFBQyxDQUFBLFFBQVosR0FBcUIsV0FBL0IsRUFBMEMsSUFBQyxDQUFBLE9BQTNDO1FBQ0EsS0FBSyxDQUFDLEdBQU4sQ0FBVSxVQUFBLEdBQVcsSUFBQyxDQUFBLFFBQVosR0FBcUIsT0FBL0IsRUFBc0MsTUFBdEM7UUFFQSxPQUFBLEdBQVUsS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFLLENBQUMsUUFBTixDQUFBLENBQVgsRUFBNkIsT0FBN0I7UUFDVixFQUFFLENBQUMsS0FBSCxDQUFTLE9BQVQs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QTJDLENBQUMsS0FBSyxDQUFDLE1BQU4sQ0FBYSxRQUFiLENBQUQsQ0FBM0MsR0FBa0UsYUFBbEUsR0FBOEUsQ0FBQyxLQUFLLENBQUMsTUFBTixDQUFhLE9BQWIsQ0FBRCxDQUE5RSxHQUFvRyxJQUFwSDtnQkFDQSxFQUFFLENBQUMsVUFBSCxDQUFjLE9BQWQsRUFBdUIsRUFBRSxDQUFDLElBQTFCO0FBQ0EsdUJBQU8sUUFQWDthQUxKO1NBQUEsYUFBQTtZQWFNO21CQUNILE9BQUEsQ0FBQyxLQUFELENBQU8sR0FBUCxFQWRIOztJQUpLOzs7O0dBdkVNOztBQTJGbkIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgICAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4wMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgICAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMCAgICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwMDAwMCAgXG4jIyNcblxueyBwb3N0LCBjaGlsZHAsIHByZWZzLCBzbGFzaCwgb3Blbiwga2xvZywgZWxlbSwgZnMsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuS2FjaGVsID0gcmVxdWlyZSAnLi9rYWNoZWwnXG5cbmNsYXNzIEFwcGwgZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonYXBwbCcpIC0+IFxuICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICBvbkNsaWNrOiAtPiBcbiAgICAgICAga2xvZyBcIm9wZW4gI3tzbGFzaC51bnNsYXNoIEBhcHBQYXRofVwiXG4gICAgICAgIG9wZW4gc2xhc2gudW5zbGFzaCBAYXBwUGF0aFxuICAgICAgICBcbiAgICBvbkluaXREYXRhOiAoZGF0YSkgPT5cbiAgICAgICAgXG4gICAgICAgIEBhcHBQYXRoID0gZGF0YS5hcHBcbiAgICAgICAgQGthY2hlbElkID0gJ2FwcGwnK0BhcHBQYXRoXG4gICAgICAgIHByZWZzLnNldCBcImthY2hlbG46I3tAa2FjaGVsSWR9OmRhdGE6YXBwXCIgQGFwcFBhdGhcbiAgICAgICAgcHJlZnMuc2V0IFwia2FjaGVsbjoje0BrYWNoZWxJZH06aHRtbFwiICdhcHBsJ1xuICAgIFxuICAgICAgICBpY29uRGlyID0gc2xhc2guam9pbiBzbGFzaC51c2VyRGF0YSgpLCAnaWNvbnMnXG4gICAgICAgIGZzLm1rZGlyIGljb25EaXIsIHJlY3Vyc2l2ZTp0cnVlXG4gICAgICAgIGFwcE5hbWUgPSBzbGFzaC5iYXNlIEBhcHBQYXRoXG4gICAgICAgIGljb25QYXRoID0gXCIje2ljb25EaXJ9LyN7YXBwTmFtZX0ucG5nXCJcbiAgICAgICAgaWYgbm90IHNsYXNoLmlzRmlsZSBpY29uUGF0aFxuICAgICAgICAgICAgaWYgc2xhc2gud2luKClcbiAgICAgICAgICAgICAgICBAZXhlSWNvbiBkYXRhLmFwcCwgaWNvbkRpciwgQHNldEljb25cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAc2V0SWNvbiBAYXBwSWNvbiBkYXRhLmFwcCwgaWNvbkRpclxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2V0SWNvbiBpY29uUGF0aFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBib3VuZHMgPSBwcmVmcy5nZXQgXCJib3VuZHM6I3tAa2FjaGVsSWR9XCJcbiAgICAgICAgaWYgYm91bmRzP1xuICAgICAgICAgICAgQHdpbi5zZXRCb3VuZHMgYm91bmRzXG4gICAgICAgICAgICAgICAgXG4gICAgc2V0SWNvbjogKGljb25QYXRoKSA9PlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBpY29uUGF0aFxuICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBlbGVtICdpbWcnIGNsYXNzOidhcHBsaWNvbicgY2xpY2s6QG9wZW5BcHAsIHNyYzpzbGFzaC5maWxlVXJsIGljb25QYXRoXG4gICAgICAgICAgICAgICAgICAgXG4gICAgZXhlSWNvbjogKGV4ZVBhdGgsIG91dERpciwgY2IpIC0+XG5cbiAgICAgICAgcG5nUGF0aCA9IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBvdXREaXIsIHNsYXNoLmJhc2UoZXhlUGF0aCkgKyBcIi5wbmdcIlxuICAgICAgICBhbnkySWNvID0gc2xhc2gucGF0aCBfX2Rpcm5hbWUgKyAnLy4uL2Jpbi9RdWlja19BbnkySWNvLmV4ZSdcbiAgICAgICAgXG4gICAgICAgIGlmIHNsYXNoLmlzRmlsZSBhbnkySWNvXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNoaWxkcC5leGVjIFwiXFxcIiN7YW55Mkljb31cXFwiIC1mb3JtYXRzPTUxMiAtcmVzPVxcXCIje2V4ZVBhdGh9XFxcIiAtaWNvbj1cXFwiI3twbmdQYXRofVxcXCJcIiwge30sIChlcnIsc3Rkb3V0LHN0ZGVycikgLT4gXG4gICAgICAgICAgICAgICAgaWYgbm90IGVycj8gXG4gICAgICAgICAgICAgICAgICAgIGNiIHBuZ1BhdGhcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGlmIHNsYXNoLmV4dChleGVQYXRoKSE9ICdsbmsnXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciBzdGRvdXQsIHN0ZGVyciwgZXJyXG4gICAgICAgICAgICAgICAgICAgIGNiKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgZXh0cmFjdEljb24gPSByZXF1aXJlICd3aW4taWNvbi1leHRyYWN0b3InXG4gICAgICAgICAgICAgICAgZXh0cmFjdEljb24oZXhlUGF0aCkudGhlbiAocmVzdWx0KSAtPlxuICAgICAgICAgICAgICAgICAgICBpZiByZXN1bHRcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEgPSByZXN1bHQuc2xpY2UgJ2RhdGE6aW1hZ2UvcG5nO2Jhc2U2NCwnLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgZnMud3JpdGVGaWxlIHBuZ1BhdGgsIGRhdGEsIHtlbmNvZGluZzogJ2Jhc2U2NCd9LCAoZXJyKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5vdCBlcnI/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNiIHBuZ1BhdGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yIGVyclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYigpXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yICdubyByZXN1bHQnXG4gICAgICAgICAgICAgICAgICAgICAgICBjYigpXG4gICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICBlcnJvciBlcnJcbiAgICAgICAgICAgICAgICBjYigpXG4gICAgICAgICAgICBcbiAgICBhcHBJY29uOiAoYXBwUGF0aCwgb3V0RGlyKSAtPlxuICAgICAgICBcbiAgICAgICAgc2l6ZSA9IDExMFxuICAgICAgICBjb25QYXRoID0gc2xhc2guam9pbiBhcHBQYXRoLCAnQ29udGVudHMnXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgaW5mb1BhdGggPSBzbGFzaC5qb2luIGNvblBhdGgsICdJbmZvLnBsaXN0J1xuICAgICAgICAgICAgZnMuYWNjZXNzU3luYyBpbmZvUGF0aCwgZnMuUl9PS1xuICAgICAgICAgICAgc3BsaXN0ID0gcmVxdWlyZSAnc2ltcGxlLXBsaXN0J1xuICAgICAgICAgICAgb2JqID0gc3BsaXN0LnJlYWRGaWxlU3luYyBpbmZvUGF0aCAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb2JqWydDRkJ1bmRsZUljb25GaWxlJ10/XG4gICAgICAgICAgICAgICAgaWNuc1BhdGggPSBzbGFzaC5qb2luIHNsYXNoLmRpcm5hbWUoaW5mb1BhdGgpLCAnUmVzb3VyY2VzJywgb2JqWydDRkJ1bmRsZUljb25GaWxlJ11cbiAgICAgICAgICAgICAgICBpY25zUGF0aCArPSBcIi5pY25zXCIgaWYgbm90IGljbnNQYXRoLmVuZHNXaXRoICcuaWNucydcbiAgICAgICAgICAgICAgICBmcy5hY2Nlc3NTeW5jIGljbnNQYXRoLCBmcy5SX09LIFxuICAgICAgICAgICAgICAgIHBuZ1BhdGggPSBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gb3V0RGlyLCBzbGFzaC5iYXNlKGFwcFBhdGgpICsgXCIucG5nXCJcbiAgICAgICAgICAgICAgICBjaGlsZHAuZXhlY1N5bmMgXCIvdXNyL2Jpbi9zaXBzIC1aICN7c2l6ZX0gLXMgZm9ybWF0IHBuZyBcXFwiI3tzbGFzaC5lc2NhcGUgaWNuc1BhdGh9XFxcIiAtLW91dCBcXFwiI3tzbGFzaC5lc2NhcGUgcG5nUGF0aH1cXFwiXCJcbiAgICAgICAgICAgICAgICBmcy5hY2Nlc3NTeW5jIHBuZ1BhdGgsIGZzLlJfT0tcbiAgICAgICAgICAgICAgICByZXR1cm4gcG5nUGF0aFxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgIGVycm9yIGVyclxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gQXBwbFxuIl19
//# sourceURL=../coffee/appl.coffee
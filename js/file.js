// koffee 1.3.0

/*
00000000  000  000      00000000  
000       000  000      000       
000000    000  000      0000000   
000       000  000      000       
000       000  0000000  00000000
 */
var File, Kachel, _, childp, elem, fs, klog, open, os, post, prefs, ref, slash, utils, valid,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, childp = ref.childp, prefs = ref.prefs, slash = ref.slash, valid = ref.valid, open = ref.open, klog = ref.klog, elem = ref.elem, os = ref.os, fs = ref.fs, _ = ref._;

Kachel = require('./kachel');

utils = require('./utils');

File = (function(superClass) {
    extend(File, superClass);

    function File(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'file';
        this.setIcon = bind(this.setIcon, this);
        this.onInitKachel = bind(this.onInitKachel, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); File.__super__.constructor.apply(this, arguments);
    }

    File.prototype.onClick = function(event) {
        return open(slash.unslash(this.kachelId));
    };

    File.prototype.onInitKachel = function(kachelId) {
        var file, fileName, iconDir, iconPath;
        this.kachelId = kachelId;
        file = slash.resolve(this.kachelId);
        iconDir = slash.join(slash.userData(), 'icons');
        fs.mkdir(iconDir, {
            recursive: true
        });
        fileName = slash.file(file);
        iconPath = iconDir + "/" + fileName + ".png";
        if (!slash.isFile(iconPath)) {
            if (slash.win()) {
                this.winIcon(file, iconDir, this.setIcon);
            } else {
                this.setIcon(this.appIcon(file, iconDir));
            }
        } else {
            this.setIcon(iconPath);
        }
        return File.__super__.onInitKachel.apply(this, arguments);
    };

    File.prototype.setIcon = function(iconPath) {
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

    File.prototype.winIcon = function(exePath, outDir, cb) {
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

    return File;

})(Kachel);

module.exports = File;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsd0ZBQUE7SUFBQTs7OztBQVFBLE1BQXFFLE9BQUEsQ0FBUSxLQUFSLENBQXJFLEVBQUUsZUFBRixFQUFRLG1CQUFSLEVBQWdCLGlCQUFoQixFQUF1QixpQkFBdkIsRUFBOEIsaUJBQTlCLEVBQXFDLGVBQXJDLEVBQTJDLGVBQTNDLEVBQWlELGVBQWpELEVBQXVELFdBQXZELEVBQTJELFdBQTNELEVBQStEOztBQUUvRCxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0FBQ1QsS0FBQSxHQUFTLE9BQUEsQ0FBUSxTQUFSOztBQUVIOzs7SUFFQyxjQUFDLEdBQUQ7QUFBc0IsWUFBQTtRQUFyQixJQUFDLENBQUEsa0RBQVM7OztRQUFXLDBHQUFBLFNBQUE7SUFBdEI7O21CQVFILE9BQUEsR0FBUyxTQUFDLEtBQUQ7ZUFFTCxJQUFBLENBQUssS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFDLENBQUEsUUFBZixDQUFMO0lBRks7O21CQVVULFlBQUEsR0FBYyxTQUFDLFFBQUQ7QUFFVixZQUFBO1FBRlcsSUFBQyxDQUFBLFdBQUQ7UUFFWCxJQUFBLEdBQU8sS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFDLENBQUEsUUFBZjtRQUVQLE9BQUEsR0FBVSxLQUFLLENBQUMsSUFBTixDQUFXLEtBQUssQ0FBQyxRQUFOLENBQUEsQ0FBWCxFQUE2QixPQUE3QjtRQUNWLEVBQUUsQ0FBQyxLQUFILENBQVMsT0FBVCxFQUFrQjtZQUFBLFNBQUEsRUFBVSxJQUFWO1NBQWxCO1FBQ0EsUUFBQSxHQUFXLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWDtRQUNYLFFBQUEsR0FBYyxPQUFELEdBQVMsR0FBVCxHQUFZLFFBQVosR0FBcUI7UUFDbEMsSUFBRyxDQUFJLEtBQUssQ0FBQyxNQUFOLENBQWEsUUFBYixDQUFQO1lBQ0ksSUFBRyxLQUFLLENB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IyNcbjAwMDAwMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICBcbjAwMCAgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICBcbjAwMDAwMCAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICBcbjAwMCAgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICBcbjAwMCAgICAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMjI1xuXG57IHBvc3QsIGNoaWxkcCwgcHJlZnMsIHNsYXNoLCB2YWxpZCwgb3Blbiwga2xvZywgZWxlbSwgb3MsIGZzLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbkthY2hlbCA9IHJlcXVpcmUgJy4va2FjaGVsJ1xudXRpbHMgID0gcmVxdWlyZSAnLi91dGlscydcblxuY2xhc3MgRmlsZSBleHRlbmRzIEthY2hlbFxuICAgICAgICBcbiAgICBAOiAoQGthY2hlbElkOidmaWxlJykgLT4gc3VwZXJcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIG9uQ2xpY2s6IChldmVudCkgLT4gXG4gICAgICAgIFxuICAgICAgICBvcGVuIHNsYXNoLnVuc2xhc2ggQGthY2hlbElkXG4gICAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgb25Jbml0S2FjaGVsOiAoQGthY2hlbElkKSA9PlxuXG4gICAgICAgIGZpbGUgPSBzbGFzaC5yZXNvbHZlIEBrYWNoZWxJZFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpY29uRGlyID0gc2xhc2guam9pbiBzbGFzaC51c2VyRGF0YSgpLCAnaWNvbnMnXG4gICAgICAgIGZzLm1rZGlyIGljb25EaXIsIHJlY3Vyc2l2ZTp0cnVlXG4gICAgICAgIGZpbGVOYW1lID0gc2xhc2guZmlsZSBmaWxlXG4gICAgICAgIGljb25QYXRoID0gXCIje2ljb25EaXJ9LyN7ZmlsZU5hbWV9LnBuZ1wiXG4gICAgICAgIGlmIG5vdCBzbGFzaC5pc0ZpbGUgaWNvblBhdGhcbiAgICAgICAgICAgIGlmIHNsYXNoLndpbigpXG4gICAgICAgICAgICAgICAgQHdpbkljb24gZmlsZSwgaWNvbkRpciwgQHNldEljb25cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAc2V0SWNvbiBAYXBwSWNvbiBmaWxlLCBpY29uRGlyXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzZXRJY29uIGljb25QYXRoXG4gICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgIFxuICAgICMgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHNldEljb246IChpY29uUGF0aCkgPT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgaWNvblBhdGhcbiAgICAgICAgaW1nID0gZWxlbSAnaW1nJyBjbGFzczonYXBwbGljb24nIHNyYzpzbGFzaC5maWxlVXJsIGljb25QYXRoXG4gICAgICAgIGltZy5vbmRyYWdzdGFydCA9IC0+IGZhbHNlXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGltZ1xuICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIHdpbkljb246IChleGVQYXRoLCBvdXREaXIsIGNiKSAtPlxuXG4gICAgICAgIHBuZ1BhdGggPSBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gb3V0RGlyLCBzbGFzaC5iYXNlKGV4ZVBhdGgpICsgXCIucG5nXCJcbiAgICAgICAgYW55MkljbyA9IHNsYXNoLnBhdGggX19kaXJuYW1lICsgJy8uLi9iaW4vUXVpY2tfQW55Mkljby5leGUnXG4gICAgICAgIFxuICAgICAgICBpZiBzbGFzaC5pc0ZpbGUgYW55Mkljb1xuICAgICAgICBcbiAgICAgICAgICAgIGNoaWxkcC5leGVjIFwiXFxcIiN7YW55Mkljb31cXFwiIC1mb3JtYXRzPTUxMiAtcmVzPVxcXCIje2V4ZVBhdGh9XFxcIiAtaWNvbj1cXFwiI3twbmdQYXRofVxcXCJcIiwge30sIChlcnIsc3Rkb3V0LHN0ZGVycikgLT4gXG4gICAgICAgICAgICAgICAgaWYgbm90IGVycj8gXG4gICAgICAgICAgICAgICAgICAgIGNiIHBuZ1BhdGhcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGlmIHNsYXNoLmV4dChleGVQYXRoKSE9ICdsbmsnXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciBzdGRvdXQsIHN0ZGVyciwgZXJyXG4gICAgICAgICAgICAgICAgICAgIGNiKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgZXh0cmFjdEljb24gPSByZXF1aXJlICd3aW4taWNvbi1leHRyYWN0b3InXG4gICAgICAgICAgICAgICAgZXh0cmFjdEljb24oZXhlUGF0aCkudGhlbiAocmVzdWx0KSAtPlxuICAgICAgICAgICAgICAgICAgICBpZiByZXN1bHRcbiAgICAgICAgICAgICAgICAgICAgICAgIGtsb2cgJ2V4dHJhY3RJY29uIHJlc3VsdCcgcmVzdWx0Lmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YSA9IHJlc3VsdC5zbGljZSAnZGF0YTppbWFnZS9wbmc7YmFzZTY0LCcubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICBmcy53cml0ZUZpbGUgcG5nUGF0aCwgZGF0YSwge2VuY29kaW5nOiAnYmFzZTY0J30sIChlcnIpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgbm90IGVycj9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2IgcG5nUGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IgZXJyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNiKClcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IgJ25vIHJlc3VsdCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGNiKClcbiAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgIGVycm9yIGVyclxuICAgICAgICAgICAgICAgIGNiKClcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVcbiJdfQ==
//# sourceURL=../coffee/file.coffee
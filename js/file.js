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
        this.onInitData = bind(this.onInitData, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); File.__super__.constructor.apply(this, arguments);
    }

    File.prototype.onClick = function(event) {
        return open(slash.unslash(this.filePath));
    };

    File.prototype.onInitData = function(data) {
        var file, fileName, iconDir, iconPath;
        this.filePath = data.file;
        this.kachelId = 'file' + this.filePath;
        prefs.set("kacheln▸" + this.kachelId + "▸data▸file", this.filePath);
        prefs.set("kacheln▸" + this.kachelId + "▸html", 'file');
        file = slash.resolve(this.filePath);
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
        return File.__super__.onInitData.apply(this, arguments);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsd0ZBQUE7SUFBQTs7OztBQVFBLE1BQXFFLE9BQUEsQ0FBUSxLQUFSLENBQXJFLEVBQUUsZUFBRixFQUFRLG1CQUFSLEVBQWdCLGlCQUFoQixFQUF1QixpQkFBdkIsRUFBOEIsaUJBQTlCLEVBQXFDLGVBQXJDLEVBQTJDLGVBQTNDLEVBQWlELGVBQWpELEVBQXVELFdBQXZELEVBQTJELFdBQTNELEVBQStEOztBQUUvRCxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0FBQ1QsS0FBQSxHQUFTLE9BQUEsQ0FBUSxTQUFSOztBQUVIOzs7SUFFQyxjQUFDLEdBQUQ7QUFBc0IsWUFBQTtRQUFyQixJQUFDLENBQUEsa0RBQVM7OztRQUFXLDBHQUFBLFNBQUE7SUFBdEI7O21CQVFILE9BQUEsR0FBUyxTQUFDLEtBQUQ7ZUFFTCxJQUFBLENBQUssS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFDLENBQUEsUUFBZixDQUFMO0lBRks7O21CQVVULFVBQUEsR0FBWSxTQUFDLElBQUQ7QUFFUixZQUFBO1FBQUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFJLENBQUM7UUFDakIsSUFBQyxDQUFBLFFBQUQsR0FBWSxNQUFBLEdBQU8sSUFBQyxDQUFBO1FBQ3BCLEtBQUssQ0FBQyxHQUFOLENBQVUsVUFBQSxHQUFXLElBQUMsQ0FBQSxRQUFaLEdBQXFCLFlBQS9CLEVBQTJDLElBQUMsQ0FBQSxRQUE1QztRQUNBLEtBQUssQ0FBQyxHQUFOLENBQVUsVUFBQSxHQUFXLElBQUMsQ0FBQSxRQUFaLEdBQXFCLE9BQS9CLEVBQXNDLE1BQXRDO1FBRUEsSUFBQSxHQUFPLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBQyxDQUFBLFFBQWY7UUFFUCxPQUFBLEdBQVUsS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFLLENBQUMsUUFBTixDQUFBLENBQVgsRUFB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QkFBQSxNQUFBO3dCQVVHLE9BQUEsQ0FBQyxLQUFELENBQU8sV0FBUDsrQkFDQyxFQUFBLENBQUEsRUFYSjs7Z0JBRHNCLENBQTFCLEVBRko7YUFBQSxhQUFBO2dCQWVNO2dCQUNILE9BQUEsQ0FBQyxLQUFELENBQU8sR0FBUDt1QkFDQyxFQUFBLENBQUEsRUFqQko7YUFWSjs7SUFMSzs7OztHQTlETTs7QUFnR25CLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgXG4wMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4wMDAwMDAgICAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgXG4wMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4wMDAgICAgICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4jIyNcblxueyBwb3N0LCBjaGlsZHAsIHByZWZzLCBzbGFzaCwgdmFsaWQsIG9wZW4sIGtsb2csIGVsZW0sIG9zLCBmcywgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5LYWNoZWwgPSByZXF1aXJlICcuL2thY2hlbCdcbnV0aWxzICA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmNsYXNzIEZpbGUgZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonZmlsZScpIC0+IHN1cGVyXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBvbkNsaWNrOiAoZXZlbnQpIC0+IFxuICAgICAgICBcbiAgICAgICAgb3BlbiBzbGFzaC51bnNsYXNoIEBmaWxlUGF0aFxuICAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIG9uSW5pdERhdGE6IChkYXRhKSA9PlxuXG4gICAgICAgIEBmaWxlUGF0aCA9IGRhdGEuZmlsZVxuICAgICAgICBAa2FjaGVsSWQgPSAnZmlsZScrQGZpbGVQYXRoXG4gICAgICAgIHByZWZzLnNldCBcImthY2hlbG7ilrgje0BrYWNoZWxJZH3ilrhkYXRh4pa4ZmlsZVwiIEBmaWxlUGF0aFxuICAgICAgICBwcmVmcy5zZXQgXCJrYWNoZWxu4pa4I3tAa2FjaGVsSWR94pa4aHRtbFwiICdmaWxlJ1xuICAgIFxuICAgICAgICBmaWxlID0gc2xhc2gucmVzb2x2ZSBAZmlsZVBhdGhcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWNvbkRpciA9IHNsYXNoLmpvaW4gc2xhc2gudXNlckRhdGEoKSwgJ2ljb25zJ1xuICAgICAgICBmcy5ta2RpciBpY29uRGlyLCByZWN1cnNpdmU6dHJ1ZVxuICAgICAgICBmaWxlTmFtZSA9IHNsYXNoLmZpbGUgZmlsZVxuICAgICAgICBpY29uUGF0aCA9IFwiI3tpY29uRGlyfS8je2ZpbGVOYW1lfS5wbmdcIlxuICAgICAgICBpZiBub3Qgc2xhc2guaXNGaWxlIGljb25QYXRoXG4gICAgICAgICAgICBpZiBzbGFzaC53aW4oKVxuICAgICAgICAgICAgICAgIEB3aW5JY29uIGZpbGUsIGljb25EaXIsIEBzZXRJY29uXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQHNldEljb24gQGFwcEljb24gZmlsZSwgaWNvbkRpclxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2V0SWNvbiBpY29uUGF0aFxuICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICBcbiAgICAjIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBzZXRJY29uOiAoaWNvblBhdGgpID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGljb25QYXRoXG4gICAgICAgIGltZyA9IGVsZW0gJ2ltZycgY2xhc3M6J2FwcGxpY29uJyBzcmM6c2xhc2guZmlsZVVybCBpY29uUGF0aFxuICAgICAgICBpbWcub25kcmFnc3RhcnQgPSAtPiBmYWxzZVxuICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBpbWdcbiAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICB3aW5JY29uOiAoZXhlUGF0aCwgb3V0RGlyLCBjYikgLT5cblxuICAgICAgICBwbmdQYXRoID0gc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIG91dERpciwgc2xhc2guYmFzZShleGVQYXRoKSArIFwiLnBuZ1wiXG4gICAgICAgIGFueTJJY28gPSBzbGFzaC5wYXRoIF9fZGlybmFtZSArICcvLi4vYmluL1F1aWNrX0FueTJJY28uZXhlJ1xuICAgICAgICBcbiAgICAgICAgaWYgc2xhc2guaXNGaWxlIGFueTJJY29cbiAgICAgICAgXG4gICAgICAgICAgICBjaGlsZHAuZXhlYyBcIlxcXCIje2FueTJJY299XFxcIiAtZm9ybWF0cz01MTIgLXJlcz1cXFwiI3tleGVQYXRofVxcXCIgLWljb249XFxcIiN7cG5nUGF0aH1cXFwiXCIsIHt9LCAoZXJyLHN0ZG91dCxzdGRlcnIpIC0+IFxuICAgICAgICAgICAgICAgIGlmIG5vdCBlcnI/IFxuICAgICAgICAgICAgICAgICAgICBjYiBwbmdQYXRoXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBpZiBzbGFzaC5leHQoZXhlUGF0aCkhPSAnbG5rJ1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3Igc3Rkb3V0LCBzdGRlcnIsIGVyclxuICAgICAgICAgICAgICAgICAgICBjYigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGV4dHJhY3RJY29uID0gcmVxdWlyZSAnd2luLWljb24tZXh0cmFjdG9yJ1xuICAgICAgICAgICAgICAgIGV4dHJhY3RJY29uKGV4ZVBhdGgpLnRoZW4gKHJlc3VsdCkgLT5cbiAgICAgICAgICAgICAgICAgICAgaWYgcmVzdWx0XG4gICAgICAgICAgICAgICAgICAgICAgICBrbG9nICdleHRyYWN0SWNvbiByZXN1bHQnIHJlc3VsdC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEgPSByZXN1bHQuc2xpY2UgJ2RhdGE6aW1hZ2UvcG5nO2Jhc2U2NCwnLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgZnMud3JpdGVGaWxlIHBuZ1BhdGgsIGRhdGEsIHtlbmNvZGluZzogJ2Jhc2U2NCd9LCAoZXJyKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5vdCBlcnI/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNiIHBuZ1BhdGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yIGVyclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYigpXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yICdubyByZXN1bHQnXG4gICAgICAgICAgICAgICAgICAgICAgICBjYigpXG4gICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICBlcnJvciBlcnJcbiAgICAgICAgICAgICAgICBjYigpXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBGaWxlXG4iXX0=
//# sourceURL=../coffee/file.coffee
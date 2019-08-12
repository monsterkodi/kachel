// koffee 1.4.0

/*
00000000  000  000      00000000  
000       000  000      000       
000000    000  000      0000000   
000       000  000      000       
000       000  0000000  00000000
 */
var File, Kachel, _, appIcon, childp, elem, fs, klog, open, os, post, prefs, ref, slash, utils, valid,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, childp = ref.childp, prefs = ref.prefs, slash = ref.slash, valid = ref.valid, open = ref.open, klog = ref.klog, elem = ref.elem, os = ref.os, fs = ref.fs, _ = ref._;

Kachel = require('./kachel');

utils = require('./utils');

appIcon = require('./icon');

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
        var any2Ico, pngPath;
        pngPath = slash.resolve(slash.join(outDir, slash.base(exePath) + ".png"));
        any2Ico = slash.path(__dirname + '/../bin/Quick_Any2Ico.exe');
        if (false) {
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
            appIcon(exePath, pngPath);
            return cb(pngPath);
        }
    };

    return File;

})(Kachel);

module.exports = File;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsaUdBQUE7SUFBQTs7OztBQVFBLE1BQXFFLE9BQUEsQ0FBUSxLQUFSLENBQXJFLEVBQUUsZUFBRixFQUFRLG1CQUFSLEVBQWdCLGlCQUFoQixFQUF1QixpQkFBdkIsRUFBOEIsaUJBQTlCLEVBQXFDLGVBQXJDLEVBQTJDLGVBQTNDLEVBQWlELGVBQWpELEVBQXVELFdBQXZELEVBQTJELFdBQTNELEVBQStEOztBQUUvRCxNQUFBLEdBQVUsT0FBQSxDQUFRLFVBQVI7O0FBQ1YsS0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSOztBQUNWLE9BQUEsR0FBVSxPQUFBLENBQVEsUUFBUjs7QUFFSjs7O0lBRUMsY0FBQyxHQUFEO0FBQXNCLFlBQUE7UUFBckIsSUFBQyxDQUFBLGtEQUFTOzs7UUFBVywwR0FBQSxTQUFBO0lBQXRCOzttQkFRSCxPQUFBLEdBQVMsU0FBQyxLQUFEO2VBRUwsSUFBQSxDQUFLLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBQyxDQUFBLFFBQWYsQ0FBTDtJQUZLOzttQkFVVCxZQUFBLEdBQWMsU0FBQyxRQUFEO0FBRVYsWUFBQTtRQUZXLElBQUMsQ0FBQSxXQUFEO1FBRVgsSUFBQSxHQUFPLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBQyxDQUFBLFFBQWY7UUFFUCxPQUFBLEdBQVUsS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFLLENBQUMsUUFBTixDQUFBLENBQVgsRUFBNkIsT0FBN0I7UUFDVixFQUFFLENBQUMsS0FBSCxDQUFTLE9BQVQsRUFBa0I7WUFBQSxTQUFBLEVBQVUsSUFBVjtTQUFsQjtRQUNBLFFBQUEsR0FBVyxLQUFLLENBQUMsSUFBTixDQUFXLElBQVg7UUFDWCxRQUFBLEdBQWMsT0FBRCxHQUFTLEdBQVQsR0FBWSxRQUFaLEdBQXFCO1FBQ2xDLElBQUcsQ0FBSSxLQUFLLENBQUMsTUFBTixDQUFhLFFBQWIsQ0FBUDtZQUNJLElBQUcsS0FBSyxDQUFDLEdBQU4sQ0FBQSxDQUFIO2dCQUNJLElBQUMsQ0FBQSxPQUFELENBQVMsSUFBVCxFQUFlLE9BQWYsRUFBd0IsSUFBQyxDQUFBLE9BQXpCLEVBREo7YUFBQSxNQUFBO2dCQUdJLElBQUMsQ0FBQSxPQUFELENBQVMsSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFULEVBQWUsT0FBZixDQUFULEVBSEo7YUFESjtTQUFBLE1BQUE7WUFNSSxJQUFDLENBQUEsT0FBRCxDQUFTLFFBQVQsRUFOSjs7ZUFRQSx3Q0FBQSxTQUFBO0lBaEJVOzttQkF3QmQsT0FBQSxHQUFTLFNBQUMsUUFBRDtBQUVMLFlBQUE7UUFBQSxJQUFVLENBQUksUUFBZDtBQUFBLG1CQUFBOztRQUNBLEdBQUEsR0FBTSxJQUFBLENBQUssS0FBTCxFQUFXO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxVQUFOO1lBQWlCLEdBQUEsRUFBSSxLQUFLLENBQUMsT0FBTixDQUFjLFFBQWQsQ0FBckI7U0FBWDtRQUNOLEdBQUcsQ0FBQyxXQUFKLEdBQWtCLFNBQUE7bUJBQUc7UUFBSDtlQUNsQixJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsR0FBbEI7SUFMSzs7bUJBYVQsT0FBQSxHQUFTLFNBQUMsT0FBRCxFQUFVLE1BQVYsRUFBa0IsRUFBbEI7QUFFTCxZQUFBO1FBQUEsT0FBQSxHQUFVLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBSyxDQUFDLElBQU4sQ0FBVyxNQUFYLEVBQW1CLEtBQUssQ0FBQyxJQUFOLENBQVcsT0FBWCxDQUFBLEdBQXNCLE1BQXpDLENBQWQ7UUFDVixPQUFBLEdBQVUsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFBLEdBQVksMkJBQXZCO1FBRVYsSUFBRyxLQUFIO21CQUVJLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBQSxHQUFLLE9BQUwsR0FBYSx5QkFBYixHQUFzQyxPQUF0QyxHQUE4QyxhQUE5QyxHQUEyRCxPQUEzRCxHQUFtRSxJQUEvRSxFQUFvRixFQUFwRixFQUF3RixTQUFDLEdBQUQsRUFBSyxNQUFMLEVBQVksTUFBWjtnQkFDcEYsSUFBTyxXQUFQOzJCQUNJLEVBQUEsQ0FBRyxPQUFILEVBREo7aUJBQUEsTUFBQTtvQkFHSSxJQUFHLEtBQUssQ0FBQyxHQUFOLENBQVUsT0FBVixDQUFBLEtBQXFCLEtBQXhCO3dCQUNHLE9BQUEsQ0FBQyxLQUFELENBQU8sTUFBUCxFQUFlLE1BQWYsRUFBdUIsR0FBdkIsRUFESDs7MkJBRUEsRUFBQSxDQUFBLEVBTEo7O1lBRG9GLENBQXhGLEVBRko7U0FBQSxNQUFBO1lBVUksT0FBQSxDQUFRLE9BQVIsRUFBaUIsT0FBakI7bUJBQ0EsRUFBQSxDQUFHLE9BQUgsRUFYSjs7SUFMSzs7OztHQXpETTs7QUEyRW5CLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgXG4wMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4wMDAwMDAgICAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgXG4wMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4wMDAgICAgICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4jIyNcblxueyBwb3N0LCBjaGlsZHAsIHByZWZzLCBzbGFzaCwgdmFsaWQsIG9wZW4sIGtsb2csIGVsZW0sIG9zLCBmcywgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5LYWNoZWwgID0gcmVxdWlyZSAnLi9rYWNoZWwnXG51dGlscyAgID0gcmVxdWlyZSAnLi91dGlscydcbmFwcEljb24gPSByZXF1aXJlICcuL2ljb24nXG5cbmNsYXNzIEZpbGUgZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonZmlsZScpIC0+IHN1cGVyXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBvbkNsaWNrOiAoZXZlbnQpIC0+IFxuICAgICAgICBcbiAgICAgICAgb3BlbiBzbGFzaC51bnNsYXNoIEBrYWNoZWxJZFxuICAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIG9uSW5pdEthY2hlbDogKEBrYWNoZWxJZCkgPT5cblxuICAgICAgICBmaWxlID0gc2xhc2gucmVzb2x2ZSBAa2FjaGVsSWRcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWNvbkRpciA9IHNsYXNoLmpvaW4gc2xhc2gudXNlckRhdGEoKSwgJ2ljb25zJ1xuICAgICAgICBmcy5ta2RpciBpY29uRGlyLCByZWN1cnNpdmU6dHJ1ZVxuICAgICAgICBmaWxlTmFtZSA9IHNsYXNoLmZpbGUgZmlsZVxuICAgICAgICBpY29uUGF0aCA9IFwiI3tpY29uRGlyfS8je2ZpbGVOYW1lfS5wbmdcIlxuICAgICAgICBpZiBub3Qgc2xhc2guaXNGaWxlIGljb25QYXRoXG4gICAgICAgICAgICBpZiBzbGFzaC53aW4oKVxuICAgICAgICAgICAgICAgIEB3aW5JY29uIGZpbGUsIGljb25EaXIsIEBzZXRJY29uXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQHNldEljb24gQGFwcEljb24gZmlsZSwgaWNvbkRpclxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2V0SWNvbiBpY29uUGF0aFxuICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICBcbiAgICAjIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBzZXRJY29uOiAoaWNvblBhdGgpID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGljb25QYXRoXG4gICAgICAgIGltZyA9IGVsZW0gJ2ltZycgY2xhc3M6J2FwcGxpY29uJyBzcmM6c2xhc2guZmlsZVVybCBpY29uUGF0aFxuICAgICAgICBpbWcub25kcmFnc3RhcnQgPSAtPiBmYWxzZVxuICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBpbWdcbiAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICB3aW5JY29uOiAoZXhlUGF0aCwgb3V0RGlyLCBjYikgLT5cblxuICAgICAgICBwbmdQYXRoID0gc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIG91dERpciwgc2xhc2guYmFzZShleGVQYXRoKSArIFwiLnBuZ1wiXG4gICAgICAgIGFueTJJY28gPSBzbGFzaC5wYXRoIF9fZGlybmFtZSArICcvLi4vYmluL1F1aWNrX0FueTJJY28uZXhlJ1xuICAgICAgICBcbiAgICAgICAgaWYgZmFsc2UgI3NsYXNoLmlzRmlsZSBhbnkySWNvXG4gICAgICAgIFxuICAgICAgICAgICAgY2hpbGRwLmV4ZWMgXCJcXFwiI3thbnkySWNvfVxcXCIgLWZvcm1hdHM9NTEyIC1yZXM9XFxcIiN7ZXhlUGF0aH1cXFwiIC1pY29uPVxcXCIje3BuZ1BhdGh9XFxcIlwiLCB7fSwgKGVycixzdGRvdXQsc3RkZXJyKSAtPiBcbiAgICAgICAgICAgICAgICBpZiBub3QgZXJyPyBcbiAgICAgICAgICAgICAgICAgICAgY2IgcG5nUGF0aFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaWYgc2xhc2guZXh0KGV4ZVBhdGgpIT0gJ2xuaydcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yIHN0ZG91dCwgc3RkZXJyLCBlcnJcbiAgICAgICAgICAgICAgICAgICAgY2IoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBhcHBJY29uIGV4ZVBhdGgsIHBuZ1BhdGhcbiAgICAgICAgICAgIGNiIHBuZ1BhdGhcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVcbiJdfQ==
//# sourceURL=../coffee/file.coffee
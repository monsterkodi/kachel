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
        return File.__super__.onInitKachel.call(this, this.kachelId);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsaUdBQUE7SUFBQTs7OztBQVFBLE1BQXFFLE9BQUEsQ0FBUSxLQUFSLENBQXJFLEVBQUUsZUFBRixFQUFRLG1CQUFSLEVBQWdCLGlCQUFoQixFQUF1QixpQkFBdkIsRUFBOEIsaUJBQTlCLEVBQXFDLGVBQXJDLEVBQTJDLGVBQTNDLEVBQWlELGVBQWpELEVBQXVELFdBQXZELEVBQTJELFdBQTNELEVBQStEOztBQUUvRCxNQUFBLEdBQVUsT0FBQSxDQUFRLFVBQVI7O0FBQ1YsS0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSOztBQUNWLE9BQUEsR0FBVSxPQUFBLENBQVEsUUFBUjs7QUFFSjs7O0lBRUMsY0FBQyxHQUFEO0FBQXNCLFlBQUE7UUFBckIsSUFBQyxDQUFBLGtEQUFTOztRQUFXLDBHQUFBLFNBQUE7SUFBdEI7O21CQVFILE9BQUEsR0FBUyxTQUFDLEtBQUQ7ZUFFTCxJQUFBLENBQUssS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFDLENBQUEsUUFBZixDQUFMO0lBRks7O21CQVVULFlBQUEsR0FBYyxTQUFDLFFBQUQ7QUFFVixZQUFBO1FBRlcsSUFBQyxDQUFBLFdBQUQ7UUFFWCxJQUFBLEdBQU8sS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFDLENBQUEsUUFBZjtRQUVQLE9BQUEsR0FBVSxLQUFLLENBQUMsSUFBTixDQUFXLEtBQUssQ0FBQyxRQUFOLENBQUEsQ0FBWCxFQUE2QixPQUE3QjtRQUNWLEVBQUUsQ0FBQyxLQUFILENBQVMsT0FBVCxFQUFrQjtZQUFBLFNBQUEsRUFBVSxJQUFWO1NBQWxCO1FBQ0EsUUFBQSxHQUFXLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWDtRQUNYLFFBQUEsR0FBYyxPQUFELEdBQVMsR0FBVCxHQUFZLFFBQVosR0FBcUI7UUFDbEMsSUFBRyxDQUFJLEtBQUssQ0FBQyxNQUFOLENBQWEsUUFBYixDQUFQO1lBQ0ksSUFBRyxLQUFLLENBQUMsR0FBTixDQUFBLENBQUg7Z0JBQ0ksSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFULEVBQWUsT0FBZixFQUF3QixJQUFDLENBQUEsT0FBekIsRUFESjthQUFBLE1BQUE7Z0JBR0ksSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFDLENBQUEsT0FBRCxDQUFTLElBQVQsRUFBZSxPQUFmLENBQVQsRUFISjthQURKO1NBQUEsTUFBQTtZQU1JLElBQUMsQ0FBQSxPQUFELENBQVMsUUFBVCxFQU5KOztlQVFBLHVDQUFNLElBQUMsQ0FBQSxRQUFQO0lBaEJVOzttQkF3QmQsT0FBQSxHQUFTLFNBQUMsT0FBRCxFQUFVLE1BQVYsRUFBa0IsRUFBbEI7QUFFTCxZQUFBO1FBQUEsT0FBQSxHQUFVLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBSyxDQUFDLElBQU4sQ0FBVyxNQUFYLEVBQW1CLEtBQUssQ0FBQyxJQUFOLENBQVcsT0FBWCxDQUFBLEdBQXNCLE1BQXpDLENBQWQ7UUFDVixPQUFBLEdBQVUsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFBLEdBQVksMkJBQXZCO1FBRVYsSUFBRyxLQUFIO21CQUVJLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBQSxHQUFLLE9BQUwsR0FBYSx5QkFBYixHQUFzQyxPQUF0QyxHQUE4QyxhQUE5QyxHQUEyRCxPQUEzRCxHQUFtRSxJQUEvRSxFQUFvRixFQUFwRixFQUF3RixTQUFDLEdBQUQsRUFBSyxNQUFMLEVBQVksTUFBWjtnQkFDcEYsSUFBTyxXQUFQOzJCQUNJLEVBQUEsQ0FBRyxPQUFILEVBREo7aUJBQUEsTUFBQTtvQkFHSSxJQUFHLEtBQUssQ0FBQyxHQUFOLENBQVUsT0FBVixDQUFBLEtBQXFCLEtBQXhCO3dCQUNHLE9BQUEsQ0FBQyxLQUFELENBQU8sTUFBUCxFQUFlLE1BQWYsRUFBdUIsR0FBdkIsRUFESDs7MkJBRUEsRUFBQSxDQUFBLEVBTEo7O1lBRG9GLENBQXhGLEVBRko7U0FBQSxNQUFBO1lBVUksT0FBQSxDQUFRLE9BQVIsRUFBaUIsT0FBakI7bUJBQ0EsRUFBQSxDQUFHLE9BQUgsRUFYSjs7SUFMSzs7OztHQTVDTTs7QUE4RG5CLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgXG4wMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4wMDAwMDAgICAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgXG4wMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4wMDAgICAgICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4jIyNcblxueyBwb3N0LCBjaGlsZHAsIHByZWZzLCBzbGFzaCwgdmFsaWQsIG9wZW4sIGtsb2csIGVsZW0sIG9zLCBmcywgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5LYWNoZWwgID0gcmVxdWlyZSAnLi9rYWNoZWwnXG51dGlscyAgID0gcmVxdWlyZSAnLi91dGlscydcbmFwcEljb24gPSByZXF1aXJlICcuL2ljb24nXG5cbmNsYXNzIEZpbGUgZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonZmlsZScpIC0+IHN1cGVyXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBvbkNsaWNrOiAoZXZlbnQpIC0+IFxuICAgICAgICBcbiAgICAgICAgb3BlbiBzbGFzaC51bnNsYXNoIEBrYWNoZWxJZFxuICAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIG9uSW5pdEthY2hlbDogKEBrYWNoZWxJZCkgPT5cblxuICAgICAgICBmaWxlID0gc2xhc2gucmVzb2x2ZSBAa2FjaGVsSWRcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWNvbkRpciA9IHNsYXNoLmpvaW4gc2xhc2gudXNlckRhdGEoKSwgJ2ljb25zJ1xuICAgICAgICBmcy5ta2RpciBpY29uRGlyLCByZWN1cnNpdmU6dHJ1ZVxuICAgICAgICBmaWxlTmFtZSA9IHNsYXNoLmZpbGUgZmlsZVxuICAgICAgICBpY29uUGF0aCA9IFwiI3tpY29uRGlyfS8je2ZpbGVOYW1lfS5wbmdcIlxuICAgICAgICBpZiBub3Qgc2xhc2guaXNGaWxlIGljb25QYXRoXG4gICAgICAgICAgICBpZiBzbGFzaC53aW4oKVxuICAgICAgICAgICAgICAgIEB3aW5JY29uIGZpbGUsIGljb25EaXIsIEBzZXRJY29uXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQHNldEljb24gQGFwcEljb24gZmlsZSwgaWNvbkRpclxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2V0SWNvbiBpY29uUGF0aFxuICAgICAgICBcbiAgICAgICAgc3VwZXIgQGthY2hlbElkXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIHdpbkljb246IChleGVQYXRoLCBvdXREaXIsIGNiKSAtPlxuXG4gICAgICAgIHBuZ1BhdGggPSBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gb3V0RGlyLCBzbGFzaC5iYXNlKGV4ZVBhdGgpICsgXCIucG5nXCJcbiAgICAgICAgYW55MkljbyA9IHNsYXNoLnBhdGggX19kaXJuYW1lICsgJy8uLi9iaW4vUXVpY2tfQW55Mkljby5leGUnXG4gICAgICAgIFxuICAgICAgICBpZiBmYWxzZSAjc2xhc2guaXNGaWxlIGFueTJJY29cbiAgICAgICAgXG4gICAgICAgICAgICBjaGlsZHAuZXhlYyBcIlxcXCIje2FueTJJY299XFxcIiAtZm9ybWF0cz01MTIgLXJlcz1cXFwiI3tleGVQYXRofVxcXCIgLWljb249XFxcIiN7cG5nUGF0aH1cXFwiXCIsIHt9LCAoZXJyLHN0ZG91dCxzdGRlcnIpIC0+IFxuICAgICAgICAgICAgICAgIGlmIG5vdCBlcnI/IFxuICAgICAgICAgICAgICAgICAgICBjYiBwbmdQYXRoXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBpZiBzbGFzaC5leHQoZXhlUGF0aCkhPSAnbG5rJ1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3Igc3Rkb3V0LCBzdGRlcnIsIGVyclxuICAgICAgICAgICAgICAgICAgICBjYigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGFwcEljb24gZXhlUGF0aCwgcG5nUGF0aFxuICAgICAgICAgICAgY2IgcG5nUGF0aFxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gRmlsZVxuIl19
//# sourceURL=../coffee/file.coffee
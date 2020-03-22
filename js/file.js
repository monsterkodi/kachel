// koffee 1.12.0

/*
00000000  000  000      00000000  
000       000  000      000       
000000    000  000      0000000   
000       000  000      000       
000       000  0000000  00000000
 */
var File, Kachel, _, appIcon, childp, fs, open, ref, slash, utils,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), _ = ref._, childp = ref.childp, fs = ref.fs, open = ref.open, slash = ref.slash;

Kachel = require('./kachel');

utils = require('./utils');

appIcon = require('./icon');

File = (function(superClass) {
    extend(File, superClass);

    function File(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'file';
        this.onInitKachel = bind(this.onInitKachel, this);
        _;
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); File.__super__.constructor.apply(this, arguments);
    }

    File.prototype.onLeftClick = function(event) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImZpbGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLDZEQUFBO0lBQUE7Ozs7QUFRQSxNQUFpQyxPQUFBLENBQVEsS0FBUixDQUFqQyxFQUFFLFNBQUYsRUFBSyxtQkFBTCxFQUFhLFdBQWIsRUFBaUIsZUFBakIsRUFBdUI7O0FBRXZCLE1BQUEsR0FBVSxPQUFBLENBQVEsVUFBUjs7QUFDVixLQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0FBQ1YsT0FBQSxHQUFVLE9BQUEsQ0FBUSxRQUFSOztBQUVKOzs7SUFFQyxjQUFDLEdBQUQ7QUFDQyxZQUFBO1FBREEsSUFBQyxDQUFBLGtEQUFTOztRQUNWO1FBQ0EsMEdBQUEsU0FBQTtJQUZEOzttQkFVSCxXQUFBLEdBQWEsU0FBQyxLQUFEO2VBRVQsSUFBQSxDQUFLLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBQyxDQUFBLFFBQWYsQ0FBTDtJQUZTOzttQkFVYixZQUFBLEdBQWMsU0FBQyxRQUFEO0FBRVYsWUFBQTtRQUZXLElBQUMsQ0FBQSxXQUFEO1FBRVgsSUFBQSxHQUFPLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBQyxDQUFBLFFBQWY7UUFFUCxPQUFBLEdBQVUsS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFLLENBQUMsUUFBTixDQUFBLENBQVgsRUFBNkIsT0FBN0I7UUFDVixFQUFFLENBQUMsS0FBSCxDQUFTLE9BQVQsRUFBa0I7WUFBQSxTQUFBLEVBQVUsSUFBVjtTQUFsQjtRQUNBLFFBQUEsR0FBVyxLQUFLLENBQUMsSUFBTixDQUFXLElBQVg7UUFDWCxRQUFBLEdBQWMsT0FBRCxHQUFTLEdBQVQsR0FBWSxRQUFaLEdBQXFCO1FBQ2xDLElBQUcsQ0FBSSxLQUFLLENBQUMsTUFBTixDQUFhLFFBQWIsQ0FBUDtZQUNJLElBQUcsS0FBSyxDQUFDLEdBQU4sQ0FBQSxDQUFIO2dCQUNJLElBQUMsQ0FBQSxPQUFELENBQVMsSUFBVCxFQUFlLE9BQWYsRUFBd0IsSUFBQyxDQUFBLE9BQXpCLEVBREo7YUFBQSxNQUFBO2dCQUdJLElBQUMsQ0FBQSxPQUFELENBQVMsSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFULEVBQWUsT0FBZixDQUFULEVBSEo7YUFESjtTQUFBLE1BQUE7WUFNSSxJQUFDLENBQUEsT0FBRCxDQUFTLFFBQVQsRUFOSjs7ZUFRQSx1Q0FBTSxJQUFDLENBQUEsUUFBUDtJQWhCVTs7bUJBd0JkLE9BQUEsR0FBUyxTQUFDLE9BQUQsRUFBVSxNQUFWLEVBQWtCLEVBQWxCO0FBRUwsWUFBQTtRQUFBLE9BQUEsR0FBVSxLQUFLLENBQUMsT0FBTixDQUFjLEtBQUssQ0FBQyxJQUFOLENBQVcsTUFBWCxFQUFtQixLQUFLLENBQUMsSUFBTixDQUFXLE9BQVgsQ0FBQSxHQUFzQixNQUF6QyxDQUFkO1FBQ1YsT0FBQSxHQUFVLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBQSxHQUFZLDJCQUF2QjtRQUVWLElBQUcsS0FBSDttQkFFSSxNQUFNLENBQUMsSUFBUCxDQUFZLElBQUEsR0FBSyxPQUFMLEdBQWEseUJBQWIsR0FBc0MsT0FBdEMsR0FBOEMsYUFBOUMsR0FBMkQsT0FBM0QsR0FBbUUsSUFBL0UsRUFBb0YsRUFBcEYsRUFBd0YsU0FBQyxHQUFELEVBQUssTUFBTCxFQUFZLE1BQVo7Z0JBQ3BGLElBQU8sV0FBUDsyQkFDSSxFQUFBLENBQUcsT0FBSCxFQURKO2lCQUFBLE1BQUE7b0JBR0ksSUFBRyxLQUFLLENBQUMsR0FBTixDQUFVLE9BQVYsQ0FBQSxLQUFxQixLQUF4Qjt3QkFDRyxPQUFBLENBQUMsS0FBRCxDQUFPLE1BQVAsRUFBZSxNQUFmLEVBQXVCLEdBQXZCLEVBREg7OzJCQUVBLEVBQUEsQ0FBQSxFQUxKOztZQURvRixDQUF4RixFQUZKO1NBQUEsTUFBQTtZQVVJLE9BQUEsQ0FBUSxPQUFSLEVBQWlCLE9BQWpCO21CQUNBLEVBQUEsQ0FBRyxPQUFILEVBWEo7O0lBTEs7Ozs7R0E5Q007O0FBZ0VuQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIFxuMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIFxuMDAwMDAwICAgIDAwMCAgMDAwICAgICAgMDAwMDAwMCAgIFxuMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIFxuMDAwICAgICAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyMjXG5cbnsgXywgY2hpbGRwLCBmcywgb3Blbiwgc2xhc2ggfSA9IHJlcXVpcmUgJ2t4aydcblxuS2FjaGVsICA9IHJlcXVpcmUgJy4va2FjaGVsJ1xudXRpbHMgICA9IHJlcXVpcmUgJy4vdXRpbHMnXG5hcHBJY29uID0gcmVxdWlyZSAnLi9pY29uJ1xuXG5jbGFzcyBGaWxlIGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J2ZpbGUnKSAtPiBcbiAgICAgICAgX1xuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgb25MZWZ0Q2xpY2s6IChldmVudCkgLT4gXG4gICAgICAgIFxuICAgICAgICBvcGVuIHNsYXNoLnVuc2xhc2ggQGthY2hlbElkXG4gICAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgb25Jbml0S2FjaGVsOiAoQGthY2hlbElkKSA9PlxuXG4gICAgICAgIGZpbGUgPSBzbGFzaC5yZXNvbHZlIEBrYWNoZWxJZFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpY29uRGlyID0gc2xhc2guam9pbiBzbGFzaC51c2VyRGF0YSgpLCAnaWNvbnMnXG4gICAgICAgIGZzLm1rZGlyIGljb25EaXIsIHJlY3Vyc2l2ZTp0cnVlXG4gICAgICAgIGZpbGVOYW1lID0gc2xhc2guZmlsZSBmaWxlXG4gICAgICAgIGljb25QYXRoID0gXCIje2ljb25EaXJ9LyN7ZmlsZU5hbWV9LnBuZ1wiXG4gICAgICAgIGlmIG5vdCBzbGFzaC5pc0ZpbGUgaWNvblBhdGhcbiAgICAgICAgICAgIGlmIHNsYXNoLndpbigpXG4gICAgICAgICAgICAgICAgQHdpbkljb24gZmlsZSwgaWNvbkRpciwgQHNldEljb25cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAc2V0SWNvbiBAYXBwSWNvbiBmaWxlLCBpY29uRGlyXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzZXRJY29uIGljb25QYXRoXG4gICAgICAgIFxuICAgICAgICBzdXBlciBAa2FjaGVsSWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgd2luSWNvbjogKGV4ZVBhdGgsIG91dERpciwgY2IpIC0+XG5cbiAgICAgICAgcG5nUGF0aCA9IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBvdXREaXIsIHNsYXNoLmJhc2UoZXhlUGF0aCkgKyBcIi5wbmdcIlxuICAgICAgICBhbnkySWNvID0gc2xhc2gucGF0aCBfX2Rpcm5hbWUgKyAnLy4uL2Jpbi9RdWlja19BbnkySWNvLmV4ZSdcbiAgICAgICAgXG4gICAgICAgIGlmIGZhbHNlICNzbGFzaC5pc0ZpbGUgYW55Mkljb1xuICAgICAgICBcbiAgICAgICAgICAgIGNoaWxkcC5leGVjIFwiXFxcIiN7YW55Mkljb31cXFwiIC1mb3JtYXRzPTUxMiAtcmVzPVxcXCIje2V4ZVBhdGh9XFxcIiAtaWNvbj1cXFwiI3twbmdQYXRofVxcXCJcIiwge30sIChlcnIsc3Rkb3V0LHN0ZGVycikgLT4gXG4gICAgICAgICAgICAgICAgaWYgbm90IGVycj8gXG4gICAgICAgICAgICAgICAgICAgIGNiIHBuZ1BhdGhcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGlmIHNsYXNoLmV4dChleGVQYXRoKSE9ICdsbmsnXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciBzdGRvdXQsIHN0ZGVyciwgZXJyXG4gICAgICAgICAgICAgICAgICAgIGNiKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYXBwSWNvbiBleGVQYXRoLCBwbmdQYXRoXG4gICAgICAgICAgICBjYiBwbmdQYXRoXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBGaWxlXG4iXX0=
//# sourceURL=../coffee/file.coffee
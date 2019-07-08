// koffee 1.2.0

/*
00000000   0000000   000      0000000    00000000  00000000   
000       000   000  000      000   000  000       000   000  
000000    000   000  000      000   000  0000000   0000000    
000       000   000  000      000   000  000       000   000  
000        0000000   0000000  0000000    00000000  000   000
 */
var Folder, Kachel, _, childp, elem, fs, klog, open, os, osascript, post, prefs, ref, slash,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, childp = ref.childp, prefs = ref.prefs, slash = ref.slash, osascript = ref.osascript, open = ref.open, klog = ref.klog, elem = ref.elem, os = ref.os, fs = ref.fs, _ = ref._;

Kachel = require('./kachel');

Folder = (function(superClass) {
    extend(Folder, superClass);

    function Folder(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'folder';
        this.setIcon = bind(this.setIcon, this);
        this.onInitData = bind(this.onInitData, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Folder.__super__.constructor.apply(this, arguments);
    }

    Folder.prototype.onClick = function(event) {
        return open(slash.unslash(this.folderPath));
    };

    Folder.prototype.onInitData = function(data) {
        var name, resolve;
        this.folderPath = data.folder;
        this.kachelId = 'folder' + this.folderPath;
        prefs.set("kacheln▸" + this.kachelId + "▸data▸folder", this.folderPath);
        prefs.set("kacheln▸" + this.kachelId + "▸html", 'folder');
        resolve = slash.resolve(this.folderPath);
        klog('resolve', resolve);
        klog('home', slash.untilde('~'));
        klog('desk', slash.untilde('~/Desktop'));
        klog('down', slash.untilde('~/Downloads'));
        if (resolve === slash.untilde('~')) {
            this.setIcon(slash.join(__dirname, '..', 'img', 'home.png'));
        } else if (resolve === slash.untilde('~/.Trash')) {
            this.setIcon(slash.join(__dirname, '..', 'img', 'recycle5.png'));
        } else if (resolve === slash.untilde('~/Desktop')) {
            this.setIcon(slash.join(__dirname, '..', 'img', 'desktop.png'));
        } else if (resolve === slash.untilde('~/Downloads')) {
            this.setIcon(slash.join(__dirname, '..', 'img', 'downloads.png'));
        } else {
            this.setIcon(slash.join(__dirname, '..', 'img', 'folder.png'));
            name = elem('div', {
                "class": 'foldername',
                text: slash.base(this.folderPath)
            });
            this.main.appendChild(name);
        }
        return Folder.__super__.onInitData.apply(this, arguments);
    };

    Folder.prototype.setIcon = function(iconPath) {
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

    return Folder;

})(Kachel);

module.exports = Folder;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9sZGVyLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSx1RkFBQTtJQUFBOzs7O0FBUUEsTUFBeUUsT0FBQSxDQUFRLEtBQVIsQ0FBekUsRUFBRSxlQUFGLEVBQVEsbUJBQVIsRUFBZ0IsaUJBQWhCLEVBQXVCLGlCQUF2QixFQUE4Qix5QkFBOUIsRUFBeUMsZUFBekMsRUFBK0MsZUFBL0MsRUFBcUQsZUFBckQsRUFBMkQsV0FBM0QsRUFBK0QsV0FBL0QsRUFBbUU7O0FBRW5FLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFFSDs7O0lBRUMsZ0JBQUMsR0FBRDtBQUF3QixZQUFBO1FBQXZCLElBQUMsQ0FBQSxrREFBUzs7O1FBQWEsNEdBQUEsU0FBQTtJQUF4Qjs7cUJBRUgsT0FBQSxHQUFTLFNBQUMsS0FBRDtlQUFXLElBQUEsQ0FBSyxLQUFLLENBQUMsT0FBTixDQUFjLElBQUMsQ0FBQSxVQUFmLENBQUw7SUFBWDs7cUJBRVQsVUFBQSxHQUFZLFNBQUMsSUFBRDtBQUVSLFlBQUE7UUFBQSxJQUFDLENBQUEsVUFBRCxHQUFjLElBQUksQ0FBQztRQUNuQixJQUFDLENBQUEsUUFBRCxHQUFZLFFBQUEsR0FBUyxJQUFDLENBQUE7UUFDdEIsS0FBSyxDQUFDLEdBQU4sQ0FBVSxVQUFBLEdBQVcsSUFBQyxDQUFBLFFBQVosR0FBcUIsY0FBL0IsRUFBNkMsSUFBQyxDQUFBLFVBQTlDO1FBQ0EsS0FBSyxDQUFDLEdBQU4sQ0FBVSxVQUFBLEdBQVcsSUFBQyxDQUFBLFFBQVosR0FBcUIsT0FBL0IsRUFBc0MsUUFBdEM7UUFFQSxPQUFBLEdBQVUsS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFDLENBQUEsVUFBZjtRQUVWLElBQUEsQ0FBSyxTQUFMLEVBQWUsT0FBZjtRQUNBLElBQUEsQ0FBSyxNQUFMLEVBQVksS0FBSyxDQUFDLE9BQU4sQ0FBYyxHQUFkLENBQVo7UUFDQSxJQUFBLENBQUssTUFBTCxFQUFZLEtBQUssQ0FBQyxPQUFOLENBQWMsV0FBZCxDQUFaO1FBQ0EsSUFBQSxDQUFLLE1BQUwsRUFBWSxLQUFLLENBQUMsT0FBTixDQUFjLGFBQWQsQ0FBWjtRQUVBLElBQUcsT0FBQSxLQUFXLEtBQUssQ0FBQyxPQUFOLENBQWMsR0FBZCxDQUFkO1lBQ0ksSUFBQyxDQUFBLE9BQUQsQ0FBUyxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0IsSUFBdEIsRUFBMkIsS0FBM0IsRUFBaUMsVUFBakMsQ0FBVCxFQURKO1NBQUEsTUFFSyxJQUFHLE9BQUEsS0FBVyxLQUFLLENBQUMsT0FBTixDQUFjLFVBQWQsQ0FBZDtZQUNELElBQUMsQ0FBQSxPQUFELENBQVMsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFYLEVBQXNCLElBQXRCLEVBQTJCLEtBQTNCLEVBQWlDLGNBQWpDLENBQVQsRUFEQztTQUFBLE1BRUEsSUFBRyxPQUFBLEtBQVcsS0FBSyxDQUFDLE9BQU4sQ0FBYyxXQUFkLENBQWQ7WUFDRCxJQUFDLENBQUEsT0FBRCxDQUFTLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBWCxFQUFzQixJQUF0QixFQUEyQixLQUEzQixFQUFpQyxhQUFqQyxDQUFULEVBREM7U0FBQSxNQUVBLElBQUcsT0FBQSxLQUFXLEtBQUssQ0FBQyxPQUFOLENBQWMsYUFBZCxDQUFkO1lBQ0QsSUFBQyxDQUFBLE9BQUQsQ0FBUyxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0IsSUFBdEIsRUFBMkIsS0FBM0IsRUFBaUMsZUFBakMsQ0FBVCxFQURDO1NBQUEsTUFBQTtZQUdELElBQUMsQ0FBQSxPQUFELENBQVMsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFYLEVBQXNCLElBQXRCLEVBQTJCLEtBQTNCLEVBQWlDLFlBQWpDLENBQVQ7WUFFQSxJQUFBLEdBQU8sSUFBQSxDQUFLLEtBQUwsRUFBVztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFlBQU47Z0JBQW1CLElBQUEsRUFBSyxLQUFLLENBQUMsSUFBTixDQUFXLElBQUMsQ0FBQSxVQUFaLENBQXhCO2FBQVg7WUFDUCxJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsSUFBbEIsRUFOQzs7ZUFRTCx3Q0FBQSxTQUFBO0lBNUJROztxQkE4QlosT0FBQSxHQUFTLFNBQUMsUUFBRDtBQUVMLFlBQUE7UUFBQSxJQUFVLENBQUksUUFBZDtBQUFBLG1CQUFBOztRQUNBLEdBQUEsR0FBTSxJQUFBLENBQUssS0FBTCxFQUFXO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxVQUFOO1lBQWlCLEtBQUEsRUFBTSxJQUFDLENBQUEsT0FBeEI7WUFBaUMsR0FBQSxFQUFJLEtBQUssQ0FBQyxPQUFOLENBQWMsUUFBZCxDQUFyQztTQUFYO1FBQ04sR0FBRyxDQUFDLFdBQUosR0FBa0IsU0FBQTttQkFBRztRQUFIO2VBQ2xCLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixHQUFsQjtJQUxLOzs7O0dBcENROztBQTJDckIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuIyMjXG5cbnsgcG9zdCwgY2hpbGRwLCBwcmVmcywgc2xhc2gsIG9zYXNjcmlwdCwgb3Blbiwga2xvZywgZWxlbSwgb3MsIGZzLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbkthY2hlbCA9IHJlcXVpcmUgJy4va2FjaGVsJ1xuXG5jbGFzcyBGb2xkZXIgZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonZm9sZGVyJykgLT4gc3VwZXJcbiAgICAgICAgXG4gICAgb25DbGljazogKGV2ZW50KSAtPiBvcGVuIHNsYXNoLnVuc2xhc2ggQGZvbGRlclBhdGhcbiAgICAgICAgXG4gICAgb25Jbml0RGF0YTogKGRhdGEpID0+XG4gICAgICAgIFxuICAgICAgICBAZm9sZGVyUGF0aCA9IGRhdGEuZm9sZGVyXG4gICAgICAgIEBrYWNoZWxJZCA9ICdmb2xkZXInK0Bmb2xkZXJQYXRoXG4gICAgICAgIHByZWZzLnNldCBcImthY2hlbG7ilrgje0BrYWNoZWxJZH3ilrhkYXRh4pa4Zm9sZGVyXCIgQGZvbGRlclBhdGhcbiAgICAgICAgcHJlZnMuc2V0IFwia2FjaGVsbuKWuCN7QGthY2hlbElkfeKWuGh0bWxcIiAnZm9sZGVyJ1xuICAgIFxuICAgICAgICByZXNvbHZlID0gc2xhc2gucmVzb2x2ZSBAZm9sZGVyUGF0aFxuICAgICAgICBcbiAgICAgICAga2xvZyAncmVzb2x2ZScgcmVzb2x2ZVxuICAgICAgICBrbG9nICdob21lJyBzbGFzaC51bnRpbGRlICd+J1xuICAgICAgICBrbG9nICdkZXNrJyBzbGFzaC51bnRpbGRlICd+L0Rlc2t0b3AnXG4gICAgICAgIGtsb2cgJ2Rvd24nIHNsYXNoLnVudGlsZGUgJ34vRG93bmxvYWRzJ1xuICAgICAgICBcbiAgICAgICAgaWYgcmVzb2x2ZSA9PSBzbGFzaC51bnRpbGRlICd+J1xuICAgICAgICAgICAgQHNldEljb24gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ltZycgJ2hvbWUucG5nJ1xuICAgICAgICBlbHNlIGlmIHJlc29sdmUgPT0gc2xhc2gudW50aWxkZSAnfi8uVHJhc2gnXG4gICAgICAgICAgICBAc2V0SWNvbiBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaW1nJyAncmVjeWNsZTUucG5nJ1xuICAgICAgICBlbHNlIGlmIHJlc29sdmUgPT0gc2xhc2gudW50aWxkZSAnfi9EZXNrdG9wJ1xuICAgICAgICAgICAgQHNldEljb24gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ltZycgJ2Rlc2t0b3AucG5nJ1xuICAgICAgICBlbHNlIGlmIHJlc29sdmUgPT0gc2xhc2gudW50aWxkZSAnfi9Eb3dubG9hZHMnXG4gICAgICAgICAgICBAc2V0SWNvbiBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaW1nJyAnZG93bmxvYWRzLnBuZydcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNldEljb24gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ltZycgJ2ZvbGRlci5wbmcnXG4gICAgXG4gICAgICAgICAgICBuYW1lID0gZWxlbSAnZGl2JyBjbGFzczonZm9sZGVybmFtZScgdGV4dDpzbGFzaC5iYXNlIEBmb2xkZXJQYXRoXG4gICAgICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBuYW1lXG4gICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICBzZXRJY29uOiAoaWNvblBhdGgpID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGljb25QYXRoXG4gICAgICAgIGltZyA9IGVsZW0gJ2ltZycgY2xhc3M6J2FwcGxpY29uJyBjbGljazpAb3BlbkFwcCwgc3JjOnNsYXNoLmZpbGVVcmwgaWNvblBhdGhcbiAgICAgICAgaW1nLm9uZHJhZ3N0YXJ0ID0gLT4gZmFsc2VcbiAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgaW1nXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBGb2xkZXJcbiJdfQ==
//# sourceURL=../coffee/folder.coffee
// koffee 1.3.0

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
        if (os.platform() === 'win32' && this.folderPath.endsWith('$Recycle.Bin')) {
            return childp.execSync("start shell:RecycleBinFolder");
        } else {
            return open(slash.unslash(this.folderPath));
        }
    };

    Folder.prototype.onInitData = function(data) {
        var name, resolve;
        this.folderPath = data.folder;
        this.kachelId = 'folder' + this.folderPath;
        prefs.set("kacheln▸" + this.kachelId + "▸data▸folder", this.folderPath);
        prefs.set("kacheln▸" + this.kachelId + "▸html", 'folder');
        resolve = slash.resolve(this.folderPath);
        if (resolve === slash.untilde('~')) {
            this.setIcon(slash.join(__dirname, '..', 'img', 'home.png'));
        } else if (resolve === slash.untilde('~/.Trash')) {
            this.setIcon(slash.join(__dirname, '..', 'img', 'recycle5.png'));
        } else if (resolve.indexOf('$Recycle.Bin') >= 0) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9sZGVyLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSx1RkFBQTtJQUFBOzs7O0FBUUEsTUFBeUUsT0FBQSxDQUFRLEtBQVIsQ0FBekUsRUFBRSxlQUFGLEVBQVEsbUJBQVIsRUFBZ0IsaUJBQWhCLEVBQXVCLGlCQUF2QixFQUE4Qix5QkFBOUIsRUFBeUMsZUFBekMsRUFBK0MsZUFBL0MsRUFBcUQsZUFBckQsRUFBMkQsV0FBM0QsRUFBK0QsV0FBL0QsRUFBbUU7O0FBRW5FLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFFSDs7O0lBRUMsZ0JBQUMsR0FBRDtBQUF3QixZQUFBO1FBQXZCLElBQUMsQ0FBQSxrREFBUzs7O1FBQWEsNEdBQUEsU0FBQTtJQUF4Qjs7cUJBRUgsT0FBQSxHQUFTLFNBQUMsS0FBRDtRQUVMLElBQUcsRUFBRSxDQUFDLFFBQUgsQ0FBQSxDQUFBLEtBQWlCLE9BQWpCLElBQTZCLElBQUMsQ0FBQSxVQUFVLENBQUMsUUFBWixDQUFxQixjQUFyQixDQUFoQzttQkFDSSxNQUFNLENBQUMsUUFBUCxDQUFnQiw4QkFBaEIsRUFESjtTQUFBLE1BQUE7bUJBR0ksSUFBQSxDQUFLLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBQyxDQUFBLFVBQWYsQ0FBTCxFQUhKOztJQUZLOztxQkFPVCxVQUFBLEdBQVksU0FBQyxJQUFEO0FBRVIsWUFBQTtRQUFBLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBSSxDQUFDO1FBQ25CLElBQUMsQ0FBQSxRQUFELEdBQVksUUFBQSxHQUFTLElBQUMsQ0FBQTtRQUN0QixLQUFLLENBQUMsR0FBTixDQUFVLFVBQUEsR0FBVyxJQUFDLENBQUEsUUFBWixHQUFxQixjQUEvQixFQUE2QyxJQUFDLENBQUEsVUFBOUM7UUFDQSxLQUFLLENBQUMsR0FBTixDQUFVLFVBQUEsR0FBVyxJQUFDLENBQUEsUUFBWixHQUFxQixPQUEvQixFQUFzQyxRQUF0QztRQUVBLE9BQUEsR0FBVSxLQUFLLENBQUMsT0FBTixDQUFjLElBQUMsQ0FBQSxVQUFmO1FBRVYsSUFBRyxPQUFBLEtBQVcsS0FBSyxDQUFDLE9BQU4sQ0FBYyxHQUFkLENBQWQ7WUFDSSxJQUFDLENBQUEsT0FBRCxDQUFTLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBWCxFQUFzQixJQUF0QixFQUEyQixLQUEzQixFQUFpQyxVQUFqQyxDQUFULEVBREo7U0FBQSxNQUVLLElBQUcsT0FBQSxLQUFXLEtBQUssQ0FBQyxPQUFOLENBQWMsVUFBZCxDQUFkO1lBQ0QsSUFBQyxDQUFBLE9BQUQsQ0FBUyxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0IsSUFBdEIsRUFBMkIsS0FBM0IsRUFBaUMsY0FBakMsQ0FBVCxFQURDO1NBQUEsTUFFQSxJQUFHLE9BQU8sQ0FBQyxPQUFSLENBQWdCLGNBQWhCLENBQUEsSUFBbUMsQ0FBdEM7WUFDRCxJQUFDLENBQUEsT0FBRCxDQUFTLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBWCxFQUFzQixJQUF0QixFQUEyQixLQUEzQixFQUFpQyxjQUFqQyxDQUFULEVBREM7U0FBQSxNQUVBLElBQUcsT0FBQSxLQUFXLEtBQUssQ0FBQyxPQUFOLENBQWMsV0FBZCxDQUFkO1lBQ0QsSUFBQyxDQUFBLE9BQUQsQ0FBUyxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0IsSUFBdEIsRUFBMkIsS0FBM0IsRUFBaUMsYUFBakMsQ0FBVCxFQURDO1NBQUEsTUFFQSxJQUFHLE9BQUEsS0FBVyxLQUFLLENBQUMsT0FBTixDQUFjLGFBQWQsQ0FBZDtZQUNELElBQUMsQ0FBQSxPQUFELENBQVMsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFYLEVBQXNCLElBQXRCLEVBQTJCLEtBQTNCLEVBQWlDLGVBQWpDLENBQVQsRUFEQztTQUFBLE1BQUE7WUFHRCxJQUFDLENBQUEsT0FBRCxDQUFTLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBWCxFQUFzQixJQUF0QixFQUEyQixLQUEzQixFQUFpQyxZQUFqQyxDQUFUO1lBRUEsSUFBQSxHQUFPLElBQUEsQ0FBSyxLQUFMLEVBQVc7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxZQUFOO2dCQUFtQixJQUFBLEVBQUssS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFDLENBQUEsVUFBWixDQUF4QjthQUFYO1lBQ1AsSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLElBQWxCLEVBTkM7O2VBUUwsd0NBQUEsU0FBQTtJQXpCUTs7cUJBMkJaLE9BQUEsR0FBUyxTQUFDLFFBQUQ7QUFFTCxZQUFBO1FBQUEsSUFBVSxDQUFJLFFBQWQ7QUFBQSxtQkFBQTs7UUFDQSxHQUFBLEdBQU0sSUFBQSxDQUFLLEtBQUwsRUFBVztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sVUFBTjtZQUFpQixLQUFBLEVBQU0sSUFBQyxDQUFBLE9BQXhCO1lBQWlDLEdBQUEsRUFBSSxLQUFLLENBQUMsT0FBTixDQUFjLFFBQWQsQ0FBckM7U0FBWDtRQUNOLEdBQUcsQ0FBQyxXQUFKLEdBQWtCLFNBQUE7bUJBQUc7UUFBSDtlQUNsQixJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsR0FBbEI7SUFMSzs7OztHQXRDUTs7QUE2Q3JCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiMjI1xuXG57IHBvc3QsIGNoaWxkcCwgcHJlZnMsIHNsYXNoLCBvc2FzY3JpcHQsIG9wZW4sIGtsb2csIGVsZW0sIG9zLCBmcywgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5LYWNoZWwgPSByZXF1aXJlICcuL2thY2hlbCdcblxuY2xhc3MgRm9sZGVyIGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J2ZvbGRlcicpIC0+IHN1cGVyXG4gICAgICAgIFxuICAgIG9uQ2xpY2s6IChldmVudCkgLT4gXG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMicgYW5kIEBmb2xkZXJQYXRoLmVuZHNXaXRoICckUmVjeWNsZS5CaW4nXG4gICAgICAgICAgICBjaGlsZHAuZXhlY1N5bmMgXCJzdGFydCBzaGVsbDpSZWN5Y2xlQmluRm9sZGVyXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgb3BlbiBzbGFzaC51bnNsYXNoIEBmb2xkZXJQYXRoXG4gICAgICAgIFxuICAgIG9uSW5pdERhdGE6IChkYXRhKSA9PlxuICAgICAgICBcbiAgICAgICAgQGZvbGRlclBhdGggPSBkYXRhLmZvbGRlclxuICAgICAgICBAa2FjaGVsSWQgPSAnZm9sZGVyJytAZm9sZGVyUGF0aFxuICAgICAgICBwcmVmcy5zZXQgXCJrYWNoZWxu4pa4I3tAa2FjaGVsSWR94pa4ZGF0YeKWuGZvbGRlclwiIEBmb2xkZXJQYXRoXG4gICAgICAgIHByZWZzLnNldCBcImthY2hlbG7ilrgje0BrYWNoZWxJZH3ilrhodG1sXCIgJ2ZvbGRlcidcbiAgICBcbiAgICAgICAgcmVzb2x2ZSA9IHNsYXNoLnJlc29sdmUgQGZvbGRlclBhdGhcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgcmVzb2x2ZSA9PSBzbGFzaC51bnRpbGRlICd+J1xuICAgICAgICAgICAgQHNldEljb24gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ltZycgJ2hvbWUucG5nJ1xuICAgICAgICBlbHNlIGlmIHJlc29sdmUgPT0gc2xhc2gudW50aWxkZSAnfi8uVHJhc2gnXG4gICAgICAgICAgICBAc2V0SWNvbiBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaW1nJyAncmVjeWNsZTUucG5nJ1xuICAgICAgICBlbHNlIGlmIHJlc29sdmUuaW5kZXhPZignJFJlY3ljbGUuQmluJykgPj0gMFxuICAgICAgICAgICAgQHNldEljb24gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ltZycgJ3JlY3ljbGU1LnBuZydcbiAgICAgICAgZWxzZSBpZiByZXNvbHZlID09IHNsYXNoLnVudGlsZGUgJ34vRGVza3RvcCdcbiAgICAgICAgICAgIEBzZXRJY29uIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpbWcnICdkZXNrdG9wLnBuZydcbiAgICAgICAgZWxzZSBpZiByZXNvbHZlID09IHNsYXNoLnVudGlsZGUgJ34vRG93bmxvYWRzJ1xuICAgICAgICAgICAgQHNldEljb24gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ltZycgJ2Rvd25sb2Fkcy5wbmcnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzZXRJY29uIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpbWcnICdmb2xkZXIucG5nJ1xuICAgIFxuICAgICAgICAgICAgbmFtZSA9IGVsZW0gJ2RpdicgY2xhc3M6J2ZvbGRlcm5hbWUnIHRleHQ6c2xhc2guYmFzZSBAZm9sZGVyUGF0aFxuICAgICAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgbmFtZVxuICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgc2V0SWNvbjogKGljb25QYXRoKSA9PlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBpY29uUGF0aFxuICAgICAgICBpbWcgPSBlbGVtICdpbWcnIGNsYXNzOidhcHBsaWNvbicgY2xpY2s6QG9wZW5BcHAsIHNyYzpzbGFzaC5maWxlVXJsIGljb25QYXRoXG4gICAgICAgIGltZy5vbmRyYWdzdGFydCA9IC0+IGZhbHNlXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGltZ1xuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gRm9sZGVyXG4iXX0=
//# sourceURL=../coffee/folder.coffee
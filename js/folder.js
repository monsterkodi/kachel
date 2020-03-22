// koffee 1.12.0

/*
00000000   0000000   000      0000000    00000000  00000000   
000       000   000  000      000   000  000       000   000  
000000    000   000  000      000   000  0000000   0000000    
000       000   000  000      000   000  000       000   000  
000        0000000   0000000  0000000    00000000  000   000
 */
var $, Folder, Kachel, _, childp, elem, fs, klog, open, os, osascript, osaspawn, post, prefs, ref, slash, utils, valid, wxw,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, childp = ref.childp, prefs = ref.prefs, slash = ref.slash, valid = ref.valid, osaspawn = ref.osaspawn, osascript = ref.osascript, open = ref.open, klog = ref.klog, elem = ref.elem, os = ref.os, fs = ref.fs, $ = ref.$, _ = ref._;

Kachel = require('./kachel');

utils = require('./utils');

wxw = require('wxw');

Folder = (function(superClass) {
    extend(Folder, superClass);

    function Folder(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'folder';
        this.onContextMenu = bind(this.onContextMenu, this);
        this.checkTrash = bind(this.checkTrash, this);
        this.showTrashDot = bind(this.showTrashDot, this);
        this.onBounds = bind(this.onBounds, this);
        this.onInitKachel = bind(this.onInitKachel, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Folder.__super__.constructor.apply(this, arguments);
    }

    Folder.prototype.onLeftClick = function(event) {
        if (os.platform() === 'win32' && this.kachelId.endsWith('$Recycle.Bin')) {
            return childp.execSync("start shell:RecycleBinFolder");
        } else {
            if (os.platform() === 'win32' && slash.isFile(slash.resolve('~/s/keks/keks-win32-x64/keks.exe'))) {
                childp.spawn(slash.resolve('~/s/keks/keks-win32-x64/keks.exe'), [this.kachelId]);
                return wxw('focus', 'keks');
            } else {
                return open(slash.unslash(this.kachelId));
            }
        }
    };

    Folder.prototype.onInitKachel = function(kachelId) {
        var folder;
        this.kachelId = kachelId;
        folder = slash.resolve(this.kachelId);
        if (folder === slash.untilde('~')) {
            this.setIcon(slash.join(__dirname, '..', 'img', 'home.png'));
        } else if (folder === slash.untilde('~/.Trash')) {
            this.setIcon(slash.join(__dirname, '..', 'icons', 'recycle.png'));
            this.addTrash(folder);
        } else if (folder.indexOf('$Recycle.Bin') >= 0) {
            this.setIcon(slash.join(__dirname, '..', 'icons', 'recycle.png'));
            this.addTrash(folder);
        } else if (folder === slash.untilde('~/Desktop')) {
            this.setIcon(slash.join(__dirname, '..', 'img', 'desktop.png'));
        } else if (folder === slash.untilde('~/Downloads')) {
            this.setIcon(slash.join(__dirname, '..', 'img', 'downloads.png'));
        } else {
            this.plainFolder = true;
            this.onBounds();
        }
        return Folder.__super__.onInitKachel.call(this, this.kachelId);
    };

    Folder.prototype.onBounds = function() {
        var name;
        if (this.plainFolder && os.platform() === 'win32') {
            this.main.innerHTML = '';
            this.setIcon(slash.join(__dirname, '..', 'img', 'folder.png'));
            $('.applicon').classList.add('foldericon');
            name = elem('div', {
                "class": 'foldername',
                text: slash.base(this.kachelId)
            });
            return this.main.appendChild(name);
        }
    };

    Folder.prototype.showTrashDot = function(count) {
        if (parseInt(count)) {
            if (!this.dot) {
                this.setIcon(slash.join(__dirname, '..', 'icons', 'recycledot.png'));
                return this.dot = true;
            }
        } else if (this.dot) {
            this.setIcon(slash.join(__dirname, '..', 'icons', 'recycle.png'));
            return this.dot = false;
        }
    };

    Folder.prototype.checkTrash = function(trashFolder) {
        return this.showTrashDot(wxw('trash', 'count'));
    };

    Folder.prototype.onContextMenu = function() {
        if (this.isTrash) {
            this.showTrashDot(0);
            return wxw('trash', 'empty');
        }
    };

    Folder.prototype.addTrash = function(trashFolder) {
        this.isTrash = true;
        this.checkTrash(trashFolder);
        return setInterval(this.checkTrash, 2000);
    };

    return Folder;

})(Kachel);

module.exports = Folder;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9sZGVyLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsiZm9sZGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSx1SEFBQTtJQUFBOzs7O0FBUUEsTUFBNkYsT0FBQSxDQUFRLEtBQVIsQ0FBN0YsRUFBRSxlQUFGLEVBQVEsbUJBQVIsRUFBZ0IsaUJBQWhCLEVBQXVCLGlCQUF2QixFQUE4QixpQkFBOUIsRUFBcUMsdUJBQXJDLEVBQStDLHlCQUEvQyxFQUEwRCxlQUExRCxFQUFnRSxlQUFoRSxFQUFzRSxlQUF0RSxFQUE0RSxXQUE1RSxFQUFnRixXQUFoRixFQUFvRixTQUFwRixFQUF1Rjs7QUFFdkYsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztBQUNULEtBQUEsR0FBUyxPQUFBLENBQVEsU0FBUjs7QUFDVCxHQUFBLEdBQVMsT0FBQSxDQUFRLEtBQVI7O0FBRUg7OztJQUVDLGdCQUFDLEdBQUQ7QUFBd0IsWUFBQTtRQUF2QixJQUFDLENBQUEsa0RBQVM7Ozs7OztRQUFhLDRHQUFBLFNBQUE7SUFBeEI7O3FCQVFILFdBQUEsR0FBYSxTQUFDLEtBQUQ7UUFFVCxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixPQUFqQixJQUE2QixJQUFDLENBQUEsUUFBUSxDQUFDLFFBQVYsQ0FBbUIsY0FBbkIsQ0FBaEM7bUJBQ0ksTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsOEJBQWhCLEVBREo7U0FBQSxNQUFBO1lBR0ksSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsT0FBakIsSUFBNkIsS0FBSyxDQUFDLE1BQU4sQ0FBYSxLQUFLLENBQUMsT0FBTixDQUFjLGtDQUFkLENBQWIsQ0FBaEM7Z0JBQ0ksTUFBTSxDQUFDLEtBQVAsQ0FBYSxLQUFLLENBQUMsT0FBTixDQUFjLGtDQUFkLENBQWIsRUFBZ0UsQ0FBQyxJQUFDLENBQUEsUUFBRixDQUFoRTt1QkFDQSxHQUFB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QU8sS0FGWDthQURKO1NBQUEsTUFJSyxJQUFHLElBQUMsQ0FBQSxHQUFKO1lBQ0QsSUFBQyxDQUFBLE9BQUQsQ0FBUyxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0IsSUFBdEIsRUFBMkIsT0FBM0IsRUFBbUMsYUFBbkMsQ0FBVDttQkFDQSxJQUFDLENBQUEsR0FBRCxHQUFPLE1BRk47O0lBTks7O3FCQVVkLFVBQUEsR0FBWSxTQUFDLFdBQUQ7ZUFFUixJQUFDLENBQUEsWUFBRCxDQUFjLEdBQUEsQ0FBSSxPQUFKLEVBQVksT0FBWixDQUFkO0lBRlE7O3FCQUlaLGFBQUEsR0FBZSxTQUFBO1FBRVgsSUFBRyxJQUFDLENBQUEsT0FBSjtZQUNJLElBQUMsQ0FBQSxZQUFELENBQWMsQ0FBZDttQkFDQSxHQUFBLENBQUksT0FBSixFQUFZLE9BQVosRUFGSjs7SUFGVzs7cUJBTWYsUUFBQSxHQUFVLFNBQUMsV0FBRDtRQUVOLElBQUMsQ0FBQSxPQUFELEdBQVc7UUFFWCxJQUFDLENBQUEsVUFBRCxDQUFZLFdBQVo7ZUFFQSxXQUFBLENBQVksSUFBQyxDQUFBLFVBQWIsRUFBeUIsSUFBekI7SUFOTTs7OztHQXZGTzs7QUErRnJCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiMjI1xuXG57IHBvc3QsIGNoaWxkcCwgcHJlZnMsIHNsYXNoLCB2YWxpZCwgb3Nhc3Bhd24sIG9zYXNjcmlwdCwgb3Blbiwga2xvZywgZWxlbSwgb3MsIGZzLCAkLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbkthY2hlbCA9IHJlcXVpcmUgJy4va2FjaGVsJ1xudXRpbHMgID0gcmVxdWlyZSAnLi91dGlscydcbnd4dyAgICA9IHJlcXVpcmUgJ3d4dydcblxuY2xhc3MgRm9sZGVyIGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J2ZvbGRlcicpIC0+IHN1cGVyXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBvbkxlZnRDbGljazogKGV2ZW50KSAtPiBcbiAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJyBhbmQgQGthY2hlbElkLmVuZHNXaXRoICckUmVjeWNsZS5CaW4nXG4gICAgICAgICAgICBjaGlsZHAuZXhlY1N5bmMgXCJzdGFydCBzaGVsbDpSZWN5Y2xlQmluRm9sZGVyXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInIGFuZCBzbGFzaC5pc0ZpbGUgc2xhc2gucmVzb2x2ZSAnfi9zL2tla3Mva2Vrcy13aW4zMi14NjQva2Vrcy5leGUnXG4gICAgICAgICAgICAgICAgY2hpbGRwLnNwYXduIHNsYXNoLnJlc29sdmUoJ34vcy9rZWtzL2tla3Mtd2luMzIteDY0L2tla3MuZXhlJyksIFtAa2FjaGVsSWRdXG4gICAgICAgICAgICAgICAgd3h3ICdmb2N1cycgJ2tla3MnICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgb3BlbiBzbGFzaC51bnNsYXNoIEBrYWNoZWxJZFxuICAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIG9uSW5pdEthY2hlbDogKEBrYWNoZWxJZCkgPT5cbiAgICAgICAgXG4gICAgICAgIGZvbGRlciA9IHNsYXNoLnJlc29sdmUgQGthY2hlbElkXG4gICAgICAgIFxuICAgICAgICBpZiBmb2xkZXIgPT0gc2xhc2gudW50aWxkZSAnfidcbiAgICAgICAgICAgIEBzZXRJY29uIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpbWcnICdob21lLnBuZydcbiAgICAgICAgZWxzZSBpZiBmb2xkZXIgPT0gc2xhc2gudW50aWxkZSAnfi8uVHJhc2gnXG4gICAgICAgICAgICBAc2V0SWNvbiBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaWNvbnMnICdyZWN5Y2xlLnBuZydcbiAgICAgICAgICAgIEBhZGRUcmFzaCBmb2xkZXJcbiAgICAgICAgZWxzZSBpZiBmb2xkZXIuaW5kZXhPZignJFJlY3ljbGUuQmluJykgPj0gMFxuICAgICAgICAgICAgQHNldEljb24gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ljb25zJyAncmVjeWNsZS5wbmcnXG4gICAgICAgICAgICBAYWRkVHJhc2ggZm9sZGVyXG4gICAgICAgIGVsc2UgaWYgZm9sZGVyID09IHNsYXNoLnVudGlsZGUgJ34vRGVza3RvcCdcbiAgICAgICAgICAgIEBzZXRJY29uIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpbWcnICdkZXNrdG9wLnBuZydcbiAgICAgICAgZWxzZSBpZiBmb2xkZXIgPT0gc2xhc2gudW50aWxkZSAnfi9Eb3dubG9hZHMnXG4gICAgICAgICAgICBAc2V0SWNvbiBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaW1nJyAnZG93bmxvYWRzLnBuZydcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHBsYWluRm9sZGVyID0gdHJ1ZVxuICAgICAgICAgICAgQG9uQm91bmRzKClcbiAgICAgICAgXG4gICAgICAgIHN1cGVyIEBrYWNoZWxJZFxuICAgICAgICBcbiAgICBvbkJvdW5kczogPT5cbiAgICAgICAgXG4gICAgICAgIGlmIEBwbGFpbkZvbGRlciBhbmQgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEBtYWluLmlubmVySFRNTCA9ICcnXG4gICAgICAgICAgICBAc2V0SWNvbiBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaW1nJyAnZm9sZGVyLnBuZydcbiAgICBcbiAgICAgICAgICAgICQoJy5hcHBsaWNvbicpLmNsYXNzTGlzdC5hZGQgJ2ZvbGRlcmljb24nXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG5hbWUgPSBlbGVtICdkaXYnIGNsYXNzOidmb2xkZXJuYW1lJyB0ZXh0OnNsYXNoLmJhc2UgQGthY2hlbElkXG4gICAgICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBuYW1lXG4gICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHNob3dUcmFzaERvdDogKGNvdW50KSA9PlxuICAgICAgICBcbiAgICAgICAgaWYgcGFyc2VJbnQgY291bnRcbiAgICAgICAgICAgIGlmIG5vdCBAZG90XG4gICAgICAgICAgICAgICAgQHNldEljb24gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ljb25zJyAncmVjeWNsZWRvdC5wbmcnXG4gICAgICAgICAgICAgICAgQGRvdCA9IHRydWVcbiAgICAgICAgZWxzZSBpZiBAZG90XG4gICAgICAgICAgICBAc2V0SWNvbiBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaWNvbnMnICdyZWN5Y2xlLnBuZydcbiAgICAgICAgICAgIEBkb3QgPSBmYWxzZVxuICAgIFxuICAgIGNoZWNrVHJhc2g6ICh0cmFzaEZvbGRlcikgPT5cbiAgICAgICAgXG4gICAgICAgIEBzaG93VHJhc2hEb3Qgd3h3ICd0cmFzaCcgJ2NvdW50J1xuICAgICAgICBcbiAgICBvbkNvbnRleHRNZW51OiA9PiBcbiAgICAgICAgXG4gICAgICAgIGlmIEBpc1RyYXNoXG4gICAgICAgICAgICBAc2hvd1RyYXNoRG90IDBcbiAgICAgICAgICAgIHd4dyAndHJhc2gnICdlbXB0eSdcbiAgICAgICAgICAgICAgICBcbiAgICBhZGRUcmFzaDogKHRyYXNoRm9sZGVyKSAtPlxuICAgICAgICAgICAgXG4gICAgICAgIEBpc1RyYXNoID0gdHJ1ZVxuICAgICAgICBcbiAgICAgICAgQGNoZWNrVHJhc2ggdHJhc2hGb2xkZXJcbiAgICAgICAgXG4gICAgICAgIHNldEludGVydmFsIEBjaGVja1RyYXNoLCAyMDAwXG4gICAgICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEZvbGRlclxuIl19
//# sourceURL=../coffee/folder.coffee
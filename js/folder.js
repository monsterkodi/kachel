// koffee 1.3.0

/*
00000000   0000000   000      0000000    00000000  00000000   
000       000   000  000      000   000  000       000   000  
000000    000   000  000      000   000  0000000   0000000    
000       000   000  000      000   000  000       000   000  
000        0000000   0000000  0000000    00000000  000   000
 */
var Folder, Kachel, _, childp, elem, fs, klog, open, os, post, prefs, ref, slash, utils, valid, wxw,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, childp = ref.childp, prefs = ref.prefs, slash = ref.slash, valid = ref.valid, open = ref.open, klog = ref.klog, elem = ref.elem, os = ref.os, fs = ref.fs, _ = ref._;

Kachel = require('./kachel');

utils = require('./utils');

if (os.platform() === 'win32') {
    wxw = require('wxw');
}

Folder = (function(superClass) {
    extend(Folder, superClass);

    function Folder(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'folder';
        this.setIcon = bind(this.setIcon, this);
        this.onContextMenu = bind(this.onContextMenu, this);
        this.checkTrash = bind(this.checkTrash, this);
        this.showTrashCount = bind(this.showTrashCount, this);
        this.onInitKachel = bind(this.onInitKachel, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Folder.__super__.constructor.apply(this, arguments);
    }

    Folder.prototype.onClick = function(event) {
        if (os.platform() === 'win32' && this.kachelId.endsWith('$Recycle.Bin')) {
            return childp.execSync("start shell:RecycleBinFolder");
        } else {
            return open(slash.unslash(this.kachelId));
        }
    };

    Folder.prototype.onInitKachel = function(kachelId) {
        var folder, name;
        this.kachelId = kachelId;
        folder = slash.resolve(this.kachelId);
        if (folder === slash.untilde('~')) {
            this.setIcon(slash.join(__dirname, '..', 'img', 'home.png'));
        } else if (folder === slash.untilde('~/.Trash')) {
            this.setIcon(slash.join(__dirname, '..', 'node_modules', 'wxw', 'icons', 'recycle.png'));
            this.addTrash(folder);
        } else if (folder.indexOf('$Recycle.Bin') >= 0) {
            this.setIcon(slash.join(__dirname, '..', 'node_modules', 'wxw', 'icons', 'recycledot.png'));
            this.addTrash(folder);
        } else if (folder === slash.untilde('~/Desktop')) {
            this.setIcon(slash.join(__dirname, '..', 'img', 'desktop.png'));
        } else if (folder === slash.untilde('~/Downloads')) {
            this.setIcon(slash.join(__dirname, '..', 'img', 'downloads.png'));
        } else {
            this.setIcon(slash.join(__dirname, '..', 'img', 'folder.png'));
            name = elem('div', {
                "class": 'foldername',
                text: slash.base(folder)
            });
            this.main.appendChild(name);
        }
        return Folder.__super__.onInitKachel.apply(this, arguments);
    };

    Folder.prototype.showTrashCount = function(count) {
        if (parseInt(count)) {
            if (!this.dot) {
                this.setIcon(slash.join(__dirname, '..', 'node_modules', 'wxw', 'icons', 'recycledot.png'));
                return this.dot = true;
            }
        } else if (this.dot) {
            this.setIcon(slash.join(__dirname, '..', 'node_modules', 'wxw', 'icons', 'recycle.png'));
            return this.dot = false;
        }
    };

    Folder.prototype.checkTrash = function(trashFolder) {
        if (os.platform() === 'win32') {
            return this.showTrashCount(wxw('trash', 'count'));
        } else {
            return fs.readdir(trashFolder, (function(_this) {
                return function(err, files) {
                    if (valid(err)) {
                        return;
                    }
                    return _this.showTrashCount(files.length);
                };
            })(this));
        }
    };

    Folder.prototype.onContextMenu = function() {
        var emptyTrash;
        if (this.isTrash) {
            this.showTrashCount(0);
            if (os.platform() === 'win32') {
                return wxw('trash', 'empty');
            } else {
                emptyTrash = require('empty-trash');
                return emptyTrash();
            }
        }
    };

    Folder.prototype.addTrash = function(trashFolder) {
        this.isTrash = true;
        this.checkTrash(trashFolder);
        if (os.platform() === 'win32') {
            return setInterval(this.checkTrash, 2000);
        } else {
            return fs.watch(trashFolder, (function(_this) {
                return function(change, file) {
                    return _this.checkTrash(trashFolder);
                };
            })(this));
        }
    };

    Folder.prototype.setIcon = function(iconPath) {
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
        this.main.innerHTML = '';
        return this.main.appendChild(img);
    };

    return Folder;

})(Kachel);

module.exports = Folder;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9sZGVyLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwrRkFBQTtJQUFBOzs7O0FBUUEsTUFBcUUsT0FBQSxDQUFRLEtBQVIsQ0FBckUsRUFBRSxlQUFGLEVBQVEsbUJBQVIsRUFBZ0IsaUJBQWhCLEVBQXVCLGlCQUF2QixFQUE4QixpQkFBOUIsRUFBcUMsZUFBckMsRUFBMkMsZUFBM0MsRUFBaUQsZUFBakQsRUFBdUQsV0FBdkQsRUFBMkQsV0FBM0QsRUFBK0Q7O0FBRS9ELE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFDVCxLQUFBLEdBQVMsT0FBQSxDQUFRLFNBQVI7O0FBRVQsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsT0FBcEI7SUFDSSxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVIsRUFEVjs7O0FBR007OztJQUVDLGdCQUFDLEdBQUQ7QUFBd0IsWUFBQTtRQUF2QixJQUFDLENBQUEsa0RBQVM7Ozs7OztRQUFhLDRHQUFBLFNBQUE7SUFBeEI7O3FCQVFILE9BQUEsR0FBUyxTQUFDLEtBQUQ7UUFFTCxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixPQUFqQixJQUE2QixJQUFDLENBQUEsUUFBUSxDQUFDLFFBQVYsQ0FBbUIsY0FBbkIsQ0FBaEM7bUJBQ0ksTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsOEJBQWhCLEVBREo7U0FBQSxNQUFBO21CQUdJLElBQUEsQ0FBSyxLQUFLLENBQUMsT0FBTixDQUFjLElBQUMsQ0FBQSxRQUFmLENBQUwsRUFISjs7SUFGSzs7cUJBYVQsWUFBQSxHQUFjLFNBQUMsUUFBRDtBQUVWLFlBQUE7UUFGVyxJQUFDLENBQUEsV0FBRDtRQUVYLE1BQUEsR0FBUyxLQUFLLENBQUMsT0FBTixDQUFjLElBQUMsQ0FBQSxRQUFmO1FBRVQsSUFBRyxNQUFBLEtBQVUsS0FBSyxDQUFDLE9BQU4sQ0FBYyxH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LFNBQUE7bUJBQUc7UUFBSDtRQUNsQixJQUFDLENBQUEsSUFBSSxDQUFDLFNBQU4sR0FBa0I7ZUFDbEIsSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLEdBQWxCO0lBTks7Ozs7R0E1R1E7O0FBb0hyQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMCAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIyNcblxueyBwb3N0LCBjaGlsZHAsIHByZWZzLCBzbGFzaCwgdmFsaWQsIG9wZW4sIGtsb2csIGVsZW0sIG9zLCBmcywgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5LYWNoZWwgPSByZXF1aXJlICcuL2thY2hlbCdcbnV0aWxzICA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgIHd4dyA9IHJlcXVpcmUgJ3d4dydcblxuY2xhc3MgRm9sZGVyIGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J2ZvbGRlcicpIC0+IHN1cGVyXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBvbkNsaWNrOiAoZXZlbnQpIC0+IFxuICAgICAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInIGFuZCBAa2FjaGVsSWQuZW5kc1dpdGggJyRSZWN5Y2xlLkJpbidcbiAgICAgICAgICAgIGNoaWxkcC5leGVjU3luYyBcInN0YXJ0IHNoZWxsOlJlY3ljbGVCaW5Gb2xkZXJcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvcGVuIHNsYXNoLnVuc2xhc2ggQGthY2hlbElkXG4gICAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgb25Jbml0S2FjaGVsOiAoQGthY2hlbElkKSA9PlxuICAgICAgICBcbiAgICAgICAgZm9sZGVyID0gc2xhc2gucmVzb2x2ZSBAa2FjaGVsSWRcbiAgICAgICAgXG4gICAgICAgIGlmIGZvbGRlciA9PSBzbGFzaC51bnRpbGRlICd+J1xuICAgICAgICAgICAgQHNldEljb24gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ltZycgJ2hvbWUucG5nJ1xuICAgICAgICBlbHNlIGlmIGZvbGRlciA9PSBzbGFzaC51bnRpbGRlICd+Ly5UcmFzaCdcbiAgICAgICAgICAgIEBzZXRJY29uIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdub2RlX21vZHVsZXMnICd3eHcnICdpY29ucycgJ3JlY3ljbGUucG5nJ1xuICAgICAgICAgICAgQGFkZFRyYXNoIGZvbGRlclxuICAgICAgICBlbHNlIGlmIGZvbGRlci5pbmRleE9mKCckUmVjeWNsZS5CaW4nKSA+PSAwXG4gICAgICAgICAgICBAc2V0SWNvbiBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnbm9kZV9tb2R1bGVzJyAnd3h3JyAnaWNvbnMnICdyZWN5Y2xlZG90LnBuZydcbiAgICAgICAgICAgIEBhZGRUcmFzaCBmb2xkZXJcbiAgICAgICAgZWxzZSBpZiBmb2xkZXIgPT0gc2xhc2gudW50aWxkZSAnfi9EZXNrdG9wJ1xuICAgICAgICAgICAgQHNldEljb24gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ltZycgJ2Rlc2t0b3AucG5nJ1xuICAgICAgICBlbHNlIGlmIGZvbGRlciA9PSBzbGFzaC51bnRpbGRlICd+L0Rvd25sb2FkcydcbiAgICAgICAgICAgIEBzZXRJY29uIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpbWcnICdkb3dubG9hZHMucG5nJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2V0SWNvbiBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaW1nJyAnZm9sZGVyLnBuZydcbiAgICBcbiAgICAgICAgICAgIG5hbWUgPSBlbGVtICdkaXYnIGNsYXNzOidmb2xkZXJuYW1lJyB0ZXh0OnNsYXNoLmJhc2UgZm9sZGVyXG4gICAgICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBuYW1lXG4gICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBzaG93VHJhc2hDb3VudDogKGNvdW50KSA9PlxuICAgICAgICBcbiAgICAgICAgaWYgcGFyc2VJbnQgY291bnRcbiAgICAgICAgICAgIGlmIG5vdCBAZG90XG4gICAgICAgICAgICAgICAgQHNldEljb24gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ25vZGVfbW9kdWxlcycgJ3d4dycgJ2ljb25zJyAncmVjeWNsZWRvdC5wbmcnXG4gICAgICAgICAgICAgICAgQGRvdCA9IHRydWVcbiAgICAgICAgICAgICAgICAjIEBkb3QgPSB1dGlscy5zdmcgY2xzczonb3ZlcmxheSdcbiAgICAgICAgICAgICAgICAjIHV0aWxzLmNpcmNsZSByYWRpdXM6NiBjbHNzOid0cmFzaERvdCcgc3ZnOkBkb3RcbiAgICAgICAgICAgICAgICAjIEBtYWluLmFwcGVuZENoaWxkIEBkb3RcbiAgICAgICAgICAgICAgICAjIEBkb3QuYXBwZW5kQ2hpbGQgZWxlbSBjbGFzczondHJhc2hDb3VudCcgdGV4dDpjb3VudFxuICAgICAgICBlbHNlIGlmIEBkb3RcbiAgICAgICAgICAgIEBzZXRJY29uIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdub2RlX21vZHVsZXMnICd3eHcnICdpY29ucycgJ3JlY3ljbGUucG5nJ1xuICAgICAgICAgICAgQGRvdCA9IGZhbHNlXG4gICAgICAgICAgICAjIEBkb3QucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZCBAZG90XG4gICAgICAgICAgICAjIEBkb3QucmVtb3ZlKClcbiAgICAgICAgICAgICMgZGVsZXRlIEBkb3RcbiAgICBcbiAgICBjaGVja1RyYXNoOiAodHJhc2hGb2xkZXIpID0+XG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQHNob3dUcmFzaENvdW50IHd4dyAndHJhc2gnICdjb3VudCdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZnMucmVhZGRpciB0cmFzaEZvbGRlciwgKGVyciwgZmlsZXMpID0+XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlmIHZhbGlkIGVyclxuICAgICAgICAgICAgICAgIEBzaG93VHJhc2hDb3VudCBmaWxlcy5sZW5ndGhcbiAgICAgICAgXG4gICAgb25Db250ZXh0TWVudTogPT4gXG4gICAgICAgIFxuICAgICAgICBpZiBAaXNUcmFzaFxuICAgICAgICAgICAgQHNob3dUcmFzaENvdW50IDBcbiAgICAgICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgICAgIHd4dyAndHJhc2gnICdlbXB0eSdcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBlbXB0eVRyYXNoID0gcmVxdWlyZSAnZW1wdHktdHJhc2gnXG4gICAgICAgICAgICAgICAgZW1wdHlUcmFzaCgpXG4gICAgICAgICAgICAgICAgXG4gICAgYWRkVHJhc2g6ICh0cmFzaEZvbGRlcikgLT5cbiAgICAgICAgICAgIFxuICAgICAgICBAaXNUcmFzaCA9IHRydWVcbiAgICAgICAgXG4gICAgICAgIEBjaGVja1RyYXNoIHRyYXNoRm9sZGVyXG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgIHNldEludGVydmFsIEBjaGVja1RyYXNoLCAyMDAwXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGZzLndhdGNoIHRyYXNoRm9sZGVyLCAoY2hhbmdlLCBmaWxlKSA9PiBAY2hlY2tUcmFzaCB0cmFzaEZvbGRlclxuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBzZXRJY29uOiAoaWNvblBhdGgpID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGljb25QYXRoXG4gICAgICAgIGltZyA9IGVsZW0gJ2ltZycgY2xhc3M6J2FwcGxpY29uJyBzcmM6c2xhc2guZmlsZVVybCBpY29uUGF0aFxuICAgICAgICBpbWcub25kcmFnc3RhcnQgPSAtPiBmYWxzZVxuICAgICAgICBAbWFpbi5pbm5lckhUTUwgPSAnJ1xuICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBpbWdcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEZvbGRlclxuIl19
//# sourceURL=../coffee/folder.coffee
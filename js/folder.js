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
            this.setIcon(slash.join(__dirname, '..', 'img', 'recycle.png'));
            this.addTrash(folder);
        } else if (folder.indexOf('$Recycle.Bin') >= 0) {
            this.setIcon(slash.join(__dirname, '..', 'img', 'recycle.png'));
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
                this.dot = utils.svg({
                    clss: 'overlay'
                });
                utils.circle({
                    radius: 12,
                    clss: 'trashDot',
                    svg: this.dot
                });
                this.main.appendChild(this.dot);
                return this.dot.appendChild(elem({
                    "class": 'trashCount',
                    text: count
                }));
            }
        } else if (this.dot) {
            this.dot.parentElement.removeChild(this.dot);
            this.dot.remove();
            return delete this.dot;
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
        return this.main.appendChild(img);
    };

    return Folder;

})(Kachel);

module.exports = Folder;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9sZGVyLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwrRkFBQTtJQUFBOzs7O0FBUUEsTUFBcUUsT0FBQSxDQUFRLEtBQVIsQ0FBckUsRUFBRSxlQUFGLEVBQVEsbUJBQVIsRUFBZ0IsaUJBQWhCLEVBQXVCLGlCQUF2QixFQUE4QixpQkFBOUIsRUFBcUMsZUFBckMsRUFBMkMsZUFBM0MsRUFBaUQsZUFBakQsRUFBdUQsV0FBdkQsRUFBMkQsV0FBM0QsRUFBK0Q7O0FBRS9ELE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFDVCxLQUFBLEdBQVMsT0FBQSxDQUFRLFNBQVI7O0FBRVQsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsT0FBcEI7SUFDSSxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVIsRUFEVjs7O0FBR007OztJQUVDLGdCQUFDLEdBQUQ7QUFBd0IsWUFBQTtRQUF2QixJQUFDLENBQUEsa0RBQVM7Ozs7OztRQUFhLDRHQUFBLFNBQUE7SUFBeEI7O3FCQVFILE9BQUEsR0FBUyxTQUFDLEtBQUQ7UUFFTCxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixPQUFqQixJQUE2QixJQUFDLENBQUEsUUFBUSxDQUFDLFFBQVYsQ0FBbUIsY0FBbkIsQ0FBaEM7bUJBQ0ksTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsOEJBQWhCLEVBREo7U0FBQSxNQUFBO21CQUdJLElBQUEsQ0FBSyxLQUFLLENBQUMsT0FBTixDQUFjLElBQUMsQ0FBQSxRQUFmLENBQUwsRUFISjs7SUFGSzs7cUJBYVQsWUFBQSxHQUFjLFNBQUMsUUFBRDtBQUVWLFlBQUE7UUFGVyxJQUFDLENBQUEsV0FBRDtRQUVYLE1BQUEsR0FBUyxLQUFLLENBQUMsT0FBTixDQUFjLElBQUMsQ0FBQSxRQUFmO1FBRVQsSUFBRyxNQUFBLEtBQVUsS0FBSyxDQUFDLE9BQU4sQ0FBYyxH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QUFNLElBQUEsQ0FBSyxLQUFMLEVBQVc7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFVBQU47WUFBaUIsR0FBQSxFQUFJLEtBQUssQ0FBQyxPQUFOLENBQWMsUUFBZCxDQUFyQjtTQUFYO1FBQ04sR0FBRyxDQUFDLFdBQUosR0FBa0IsU0FBQTttQkFBRztRQUFIO2VBQ2xCLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixHQUFsQjtJQUxLOzs7O0dBeEdROztBQStHckIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuIyMjXG5cbnsgcG9zdCwgY2hpbGRwLCBwcmVmcywgc2xhc2gsIHZhbGlkLCBvcGVuLCBrbG9nLCBlbGVtLCBvcywgZnMsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuS2FjaGVsID0gcmVxdWlyZSAnLi9rYWNoZWwnXG51dGlscyAgPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5pZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICB3eHcgPSByZXF1aXJlICd3eHcnXG5cbmNsYXNzIEZvbGRlciBleHRlbmRzIEthY2hlbFxuICAgICAgICBcbiAgICBAOiAoQGthY2hlbElkOidmb2xkZXInKSAtPiBzdXBlclxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgb25DbGljazogKGV2ZW50KSAtPiBcbiAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJyBhbmQgQGthY2hlbElkLmVuZHNXaXRoICckUmVjeWNsZS5CaW4nXG4gICAgICAgICAgICBjaGlsZHAuZXhlY1N5bmMgXCJzdGFydCBzaGVsbDpSZWN5Y2xlQmluRm9sZGVyXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgb3BlbiBzbGFzaC51bnNsYXNoIEBrYWNoZWxJZFxuICAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIG9uSW5pdEthY2hlbDogKEBrYWNoZWxJZCkgPT5cbiAgICAgICAgXG4gICAgICAgIGZvbGRlciA9IHNsYXNoLnJlc29sdmUgQGthY2hlbElkXG4gICAgICAgIFxuICAgICAgICBpZiBmb2xkZXIgPT0gc2xhc2gudW50aWxkZSAnfidcbiAgICAgICAgICAgIEBzZXRJY29uIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpbWcnICdob21lLnBuZydcbiAgICAgICAgZWxzZSBpZiBmb2xkZXIgPT0gc2xhc2gudW50aWxkZSAnfi8uVHJhc2gnXG4gICAgICAgICAgICBAc2V0SWNvbiBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaW1nJyAncmVjeWNsZS5wbmcnXG4gICAgICAgICAgICBAYWRkVHJhc2ggZm9sZGVyXG4gICAgICAgIGVsc2UgaWYgZm9sZGVyLmluZGV4T2YoJyRSZWN5Y2xlLkJpbicpID49IDBcbiAgICAgICAgICAgIEBzZXRJY29uIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpbWcnICdyZWN5Y2xlLnBuZydcbiAgICAgICAgICAgIEBhZGRUcmFzaCBmb2xkZXJcbiAgICAgICAgZWxzZSBpZiBmb2xkZXIgPT0gc2xhc2gudW50aWxkZSAnfi9EZXNrdG9wJ1xuICAgICAgICAgICAgQHNldEljb24gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ltZycgJ2Rlc2t0b3AucG5nJ1xuICAgICAgICBlbHNlIGlmIGZvbGRlciA9PSBzbGFzaC51bnRpbGRlICd+L0Rvd25sb2FkcydcbiAgICAgICAgICAgIEBzZXRJY29uIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpbWcnICdkb3dubG9hZHMucG5nJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2V0SWNvbiBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaW1nJyAnZm9sZGVyLnBuZydcbiAgICBcbiAgICAgICAgICAgIG5hbWUgPSBlbGVtICdkaXYnIGNsYXNzOidmb2xkZXJuYW1lJyB0ZXh0OnNsYXNoLmJhc2UgZm9sZGVyXG4gICAgICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBuYW1lXG4gICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBzaG93VHJhc2hDb3VudDogKGNvdW50KSA9PlxuICAgICAgICBcbiAgICAgICAgaWYgcGFyc2VJbnQgY291bnRcbiAgICAgICAgICAgIGlmIG5vdCBAZG90XG4gICAgICAgICAgICAgICAgQGRvdCA9IHV0aWxzLnN2ZyBjbHNzOidvdmVybGF5J1xuICAgICAgICAgICAgICAgIHV0aWxzLmNpcmNsZSByYWRpdXM6MTIgY2xzczondHJhc2hEb3QnIHN2ZzpAZG90XG4gICAgICAgICAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgQGRvdFxuICAgICAgICAgICAgICAgIEBkb3QuYXBwZW5kQ2hpbGQgZWxlbSBjbGFzczondHJhc2hDb3VudCcgdGV4dDpjb3VudFxuICAgICAgICBlbHNlIGlmIEBkb3RcbiAgICAgICAgICAgIEBkb3QucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZCBAZG90XG4gICAgICAgICAgICBAZG90LnJlbW92ZSgpXG4gICAgICAgICAgICBkZWxldGUgQGRvdFxuICAgIFxuICAgIGNoZWNrVHJhc2g6ICh0cmFzaEZvbGRlcikgPT5cbiAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBAc2hvd1RyYXNoQ291bnQgd3h3ICd0cmFzaCcgJ2NvdW50J1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBmcy5yZWFkZGlyIHRyYXNoRm9sZGVyLCAoZXJyLCBmaWxlcykgPT5cbiAgICAgICAgICAgICAgICByZXR1cm4gaWYgdmFsaWQgZXJyXG4gICAgICAgICAgICAgICAgQHNob3dUcmFzaENvdW50IGZpbGVzLmxlbmd0aFxuICAgICAgICBcbiAgICBvbkNvbnRleHRNZW51OiA9PiBcbiAgICAgICAgXG4gICAgICAgIGlmIEBpc1RyYXNoXG4gICAgICAgICAgICBAc2hvd1RyYXNoQ291bnQgMFxuICAgICAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICAgICAgd3h3ICd0cmFzaCcgJ2VtcHR5J1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGVtcHR5VHJhc2ggPSByZXF1aXJlICdlbXB0eS10cmFzaCdcbiAgICAgICAgICAgICAgICBlbXB0eVRyYXNoKClcbiAgICAgICAgICAgICAgICBcbiAgICBhZGRUcmFzaDogKHRyYXNoRm9sZGVyKSAtPlxuICAgICAgICAgICAgXG4gICAgICAgIEBpc1RyYXNoID0gdHJ1ZVxuICAgICAgICBcbiAgICAgICAgQGNoZWNrVHJhc2ggdHJhc2hGb2xkZXJcbiAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgc2V0SW50ZXJ2YWwgQGNoZWNrVHJhc2gsIDIwMDBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZnMud2F0Y2ggdHJhc2hGb2xkZXIsIChjaGFuZ2UsIGZpbGUpID0+IEBjaGVja1RyYXNoIHRyYXNoRm9sZGVyXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHNldEljb246IChpY29uUGF0aCkgPT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgaWNvblBhdGhcbiAgICAgICAgaW1nID0gZWxlbSAnaW1nJyBjbGFzczonYXBwbGljb24nIHNyYzpzbGFzaC5maWxlVXJsIGljb25QYXRoXG4gICAgICAgIGltZy5vbmRyYWdzdGFydCA9IC0+IGZhbHNlXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGltZ1xuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gRm9sZGVyXG4iXX0=
//# sourceURL=../coffee/folder.coffee
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
            this.setIcon(slash.join(__dirname, '..', 'node_modules', 'wxw', 'icons', 'recycle.png'));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9sZGVyLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwrRkFBQTtJQUFBOzs7O0FBUUEsTUFBcUUsT0FBQSxDQUFRLEtBQVIsQ0FBckUsRUFBRSxlQUFGLEVBQVEsbUJBQVIsRUFBZ0IsaUJBQWhCLEVBQXVCLGlCQUF2QixFQUE4QixpQkFBOUIsRUFBcUMsZUFBckMsRUFBMkMsZUFBM0MsRUFBaUQsZUFBakQsRUFBdUQsV0FBdkQsRUFBMkQsV0FBM0QsRUFBK0Q7O0FBRS9ELE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFDVCxLQUFBLEdBQVMsT0FBQSxDQUFRLFNBQVI7O0FBRVQsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsT0FBcEI7SUFDSSxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVIsRUFEVjs7O0FBR007OztJQUVDLGdCQUFDLEdBQUQ7QUFBd0IsWUFBQTtRQUF2QixJQUFDLENBQUEsa0RBQVM7Ozs7OztRQUFhLDRHQUFBLFNBQUE7SUFBeEI7O3FCQVFILE9BQUEsR0FBUyxTQUFDLEtBQUQ7UUFFTCxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixPQUFqQixJQUE2QixJQUFDLENBQUEsUUFBUSxDQUFDLFFBQVYsQ0FBbUIsY0FBbkIsQ0FBaEM7bUJBQ0ksTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsOEJBQWhCLEVBREo7U0FBQSxNQUFBO21CQUdJLElBQUEsQ0FBSyxLQUFLLENBQUMsT0FBTixDQUFjLElBQUMsQ0FBQSxRQUFmLENBQUwsRUFISjs7SUFGSzs7cUJBYVQsWUFBQSxHQUFjLFNBQUMsUUFBRDtBQUVWLFlBQUE7UUFGVyxJQUFDLENBQUEsV0FBRDtRQUVYLE1BQUEsR0FBUyxLQUFLLENBQUMsT0FBTixDQUFjLElBQUMsQ0FBQSxRQUFmO1FBRVQsSUFBRyxNQUFBLEtBQVUsS0FBSyxDQUFDLE9BQU4sQ0FBYyxHQUFkLENBQWI7WUFDSSxJQUFDLENBQUEsT0FBRCxDQUFTLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBWCxFQUFzQixJQUF0QixFQUEyQixLQUEzQixFQUFpQyxVQUFqQyxDQUFULEVBREo7U0FBQSxNQUVLLElBQUcsTUFBQSxLQUFVLEtBQUssQ0FBQyxPQUFOLENBQWMsVUFBZCxDQUFiO1lBQ0QsSUFBQyxDQUFBLE9BQUQsQ0FBUyxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0IsSUFBdEIsRUFBMkIsY0FBM0IsRUFBMEMsS0FBMUMsRUFBZ0QsT0FBaEQsRUFBd0QsYUFBeEQsQ0FBVDtZQUNBLElBQUMsQ0FBQSxRQUFELENBQVUsTUFBVixFQUZDO1NBQUEsTUFHQSxJQUFHLE1BQU0sQ0FBQyxPQUFQLENBQWUsY0FBZixDQUFBLElBQWtDLENBQXJDO1lBQ0QsSUFBQyxDQUFBLE9BQUQsQ0FBUyxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0IsSUFBdEIsRUFBMkIsY0FBM0IsRUFBMEMsS0FBMUMsRUFBZ0QsT0FBaEQsRUFBd0QsYUFBeEQsQ0FBVDtZQUNBLElBQUMsQ0FBQSxRQUFELENBQVUsTUFBVixFQUZDO1NBQUEsTUFHQSxJQUFHLE1BQUEsS0FBVSxLQUFLLENBQUMsT0FBTixDQUFjLFdBQWQsQ0FBYjtZQUNELElBQUMsQ0FBQSxPQUFELENBQVMsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFYLEVBQXNCLElBQXRCLEVBQTJCLEtBQTNCLEVBQWlDLGFBQWpDLENBQVQsRUFEQztTQUFBLE1BRUEsSUFBRyxNQUFBLEtBQVUsS0FBSyxDQUFDLE9BQU4sQ0FBYyxhQUFkLENBQWI7WUFDRCxJQUFDLENBQUEsT0FBRCxDQUFTLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBWCxFQUFzQixJQUF0QixFQUEyQixLQUEzQixFQUFpQyxlQUFqQyxDQUFULEVBREM7U0FBQSxNQUFBO1lBR0QsSUFBQyxDQUFBLE9BQUQsQ0FBUyxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0IsSUFBdEIsRUFBMkIsS0FBM0IsRUFBaUMsWUFBakMsQ0FBVDtZQUVBLElBQUEsR0FBTyxJQUFBLENBQUssS0FBTCxFQUFXO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sWUFBTjtnQkFBbUIsSUFBQSxFQUFLLEtBQUssQ0FBQyxJQUFOLENBQVcsTUFBWCxDQUF4QjthQUFYO1lBQ1AsSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLElBQWxCLEVBTkM7O2VBUUwsMENBQUEsU0FBQTtJQXRCVTs7cUJBOEJkLGNBQUEsR0FBZ0IsU0FBQyxLQUFEO1FBRVosSUFBRyxRQUFBLENBQVMsS0FBVCxDQUFIO1lBQ0ksSUFBRyxDQUFJLElBQUMsQ0FBQSxHQUFSO2dCQUNJLElBQUMsQ0FBQSxPQUFELENBQVMsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFYLEVBQXNCLElBQXRCLEVBQTJCLGNBQTNCLEVBQTBDLEtBQTFDLEVBQWdELE9BQWhELEVBQXdELGdCQUF4RCxDQUFUO3VCQUNBLElBQUMsQ0FBQSxHQUFELEdBQU8sS0FGWDthQURKO1NBQUEsTUFJSyxJQUFHLElBQUMsQ0FBQSxHQUFKO1lBQ0QsSUFBQyxDQUFBLE9BQUQsQ0FBUyxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0IsSUFBdEIsRUFBMkIsY0FBM0IsRUFBMEMsS0FBMUMsRUFBZ0QsT0FBaEQsRUFBd0QsYUFBeEQsQ0FBVDttQkFDQSxJQUFDLENBQUEsR0FBRCxHQUFPLE1BRk47O0lBTk87O3FCQVVoQixVQUFBLEdBQVksU0FBQyxXQUFEO1FBRVIsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsT0FBcEI7bUJBRUksSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsR0FBQSxDQUFJLE9BQUosRUFBWSxPQUFaLENBQWhCLEVBRko7U0FBQSxNQUFBO21CQUtJLEVBQUUsQ0FBQyxPQUFILENBQVcsV0FBWCxFQUF3QixDQUFBLFNBQUEsS0FBQTt1QkFBQSxTQUFDLEdBQUQsRUFBTSxLQUFOO29CQUNwQixJQUFVLEtBQUEsQ0FBTSxHQUFOLENBQVY7QUFBQSwrQkFBQTs7MkJBQ0EsS0FBQyxDQUFBLGNBQUQsQ0FBZ0IsS0FBSyxDQUFDLE1BQXRCO2dCQUZvQjtZQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEIsRUFMSjs7SUFGUTs7cUJBV1osYUFBQSxHQUFlLFNBQUE7QUFFWCxZQUFBO1FBQUEsSUFBRyxJQUFDLENBQUEsT0FBSjtZQUNJLElBQUMsQ0FBQSxjQUFELENBQWdCLENBQWhCO1lBQ0EsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsT0FBcEI7dUJBQ0ksR0FBQSxDQUFJLE9BQUosRUFBWSxPQUFaLEVBREo7YUFBQSxNQUFBO2dCQUdJLFVBQUEsR0FBYSxPQUFBLENBQVEsYUFBUjt1QkFDYixVQUFBLENBQUEsRUFKSjthQUZKOztJQUZXOztxQkFVZixRQUFBLEdBQVUsU0FBQyxXQUFEO1FBRU4sSUFBQyxDQUFBLE9BQUQsR0FBVztRQUVYLElBQUMsQ0FBQSxVQUFELENBQVksV0FBWjtRQUVBLElBQUcsRUFBRSxDQUFDLFFBQUgsQ0FBQSxDQUFBLEtBQWlCLE9BQXBCO21CQUNJLFdBQUEsQ0FBWSxJQUFDLENBQUEsVUFBYixFQUF5QixJQUF6QixFQURKO1NBQUEsTUFBQTttQkFHSSxFQUFFLENBQUMsS0FBSCxDQUFTLFdBQVQsRUFBc0IsQ0FBQSxTQUFBLEtBQUE7dUJBQUEsU0FBQyxNQUFELEVBQVMsSUFBVDsyQkFBa0IsS0FBQyxDQUFBLFVBQUQsQ0FBWSxXQUFaO2dCQUFsQjtZQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEIsRUFISjs7SUFOTTs7cUJBaUJWLE9BQUEsR0FBUyxTQUFDLFFBQUQ7QUFFTCxZQUFBO1FBQUEsSUFBVSxDQUFJLFFBQWQ7QUFBQSxtQkFBQTs7UUFDQSxHQUFBLEdBQU0sSUFBQSxDQUFLLEtBQUwsRUFBVztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sVUFBTjtZQUFpQixHQUFBLEVBQUksS0FBSyxDQUFDLE9BQU4sQ0FBYyxRQUFkLENBQXJCO1NBQVg7UUFDTixHQUFHLENBQUMsV0FBSixHQUFrQixTQUFBO21CQUFHO1FBQUg7UUFDbEIsSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFOLEdBQWtCO2VBQ2xCLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixHQUFsQjtJQU5LOzs7O0dBckdROztBQTZHckIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuIyMjXG5cbnsgcG9zdCwgY2hpbGRwLCBwcmVmcywgc2xhc2gsIHZhbGlkLCBvcGVuLCBrbG9nLCBlbGVtLCBvcywgZnMsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuS2FjaGVsID0gcmVxdWlyZSAnLi9rYWNoZWwnXG51dGlscyAgPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5pZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICB3eHcgPSByZXF1aXJlICd3eHcnXG5cbmNsYXNzIEZvbGRlciBleHRlbmRzIEthY2hlbFxuICAgICAgICBcbiAgICBAOiAoQGthY2hlbElkOidmb2xkZXInKSAtPiBzdXBlclxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgb25DbGljazogKGV2ZW50KSAtPiBcbiAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJyBhbmQgQGthY2hlbElkLmVuZHNXaXRoICckUmVjeWNsZS5CaW4nXG4gICAgICAgICAgICBjaGlsZHAuZXhlY1N5bmMgXCJzdGFydCBzaGVsbDpSZWN5Y2xlQmluRm9sZGVyXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgb3BlbiBzbGFzaC51bnNsYXNoIEBrYWNoZWxJZFxuICAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIG9uSW5pdEthY2hlbDogKEBrYWNoZWxJZCkgPT5cbiAgICAgICAgXG4gICAgICAgIGZvbGRlciA9IHNsYXNoLnJlc29sdmUgQGthY2hlbElkXG4gICAgICAgIFxuICAgICAgICBpZiBmb2xkZXIgPT0gc2xhc2gudW50aWxkZSAnfidcbiAgICAgICAgICAgIEBzZXRJY29uIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpbWcnICdob21lLnBuZydcbiAgICAgICAgZWxzZSBpZiBmb2xkZXIgPT0gc2xhc2gudW50aWxkZSAnfi8uVHJhc2gnXG4gICAgICAgICAgICBAc2V0SWNvbiBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnbm9kZV9tb2R1bGVzJyAnd3h3JyAnaWNvbnMnICdyZWN5Y2xlLnBuZydcbiAgICAgICAgICAgIEBhZGRUcmFzaCBmb2xkZXJcbiAgICAgICAgZWxzZSBpZiBmb2xkZXIuaW5kZXhPZignJFJlY3ljbGUuQmluJykgPj0gMFxuICAgICAgICAgICAgQHNldEljb24gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ25vZGVfbW9kdWxlcycgJ3d4dycgJ2ljb25zJyAncmVjeWNsZS5wbmcnXG4gICAgICAgICAgICBAYWRkVHJhc2ggZm9sZGVyXG4gICAgICAgIGVsc2UgaWYgZm9sZGVyID09IHNsYXNoLnVudGlsZGUgJ34vRGVza3RvcCdcbiAgICAgICAgICAgIEBzZXRJY29uIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpbWcnICdkZXNrdG9wLnBuZydcbiAgICAgICAgZWxzZSBpZiBmb2xkZXIgPT0gc2xhc2gudW50aWxkZSAnfi9Eb3dubG9hZHMnXG4gICAgICAgICAgICBAc2V0SWNvbiBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaW1nJyAnZG93bmxvYWRzLnBuZydcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNldEljb24gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ltZycgJ2ZvbGRlci5wbmcnXG4gICAgXG4gICAgICAgICAgICBuYW1lID0gZWxlbSAnZGl2JyBjbGFzczonZm9sZGVybmFtZScgdGV4dDpzbGFzaC5iYXNlIGZvbGRlclxuICAgICAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgbmFtZVxuICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgc2hvd1RyYXNoQ291bnQ6IChjb3VudCkgPT5cbiAgICAgICAgXG4gICAgICAgIGlmIHBhcnNlSW50IGNvdW50XG4gICAgICAgICAgICBpZiBub3QgQGRvdFxuICAgICAgICAgICAgICAgIEBzZXRJY29uIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdub2RlX21vZHVsZXMnICd3eHcnICdpY29ucycgJ3JlY3ljbGVkb3QucG5nJ1xuICAgICAgICAgICAgICAgIEBkb3QgPSB0cnVlXG4gICAgICAgIGVsc2UgaWYgQGRvdFxuICAgICAgICAgICAgQHNldEljb24gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ25vZGVfbW9kdWxlcycgJ3d4dycgJ2ljb25zJyAncmVjeWNsZS5wbmcnXG4gICAgICAgICAgICBAZG90ID0gZmFsc2VcbiAgICBcbiAgICBjaGVja1RyYXNoOiAodHJhc2hGb2xkZXIpID0+XG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQHNob3dUcmFzaENvdW50IHd4dyAndHJhc2gnICdjb3VudCdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZnMucmVhZGRpciB0cmFzaEZvbGRlciwgKGVyciwgZmlsZXMpID0+XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlmIHZhbGlkIGVyclxuICAgICAgICAgICAgICAgIEBzaG93VHJhc2hDb3VudCBmaWxlcy5sZW5ndGhcbiAgICAgICAgXG4gICAgb25Db250ZXh0TWVudTogPT4gXG4gICAgICAgIFxuICAgICAgICBpZiBAaXNUcmFzaFxuICAgICAgICAgICAgQHNob3dUcmFzaENvdW50IDBcbiAgICAgICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgICAgIHd4dyAndHJhc2gnICdlbXB0eSdcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBlbXB0eVRyYXNoID0gcmVxdWlyZSAnZW1wdHktdHJhc2gnXG4gICAgICAgICAgICAgICAgZW1wdHlUcmFzaCgpXG4gICAgICAgICAgICAgICAgXG4gICAgYWRkVHJhc2g6ICh0cmFzaEZvbGRlcikgLT5cbiAgICAgICAgICAgIFxuICAgICAgICBAaXNUcmFzaCA9IHRydWVcbiAgICAgICAgXG4gICAgICAgIEBjaGVja1RyYXNoIHRyYXNoRm9sZGVyXG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgIHNldEludGVydmFsIEBjaGVja1RyYXNoLCAyMDAwXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGZzLndhdGNoIHRyYXNoRm9sZGVyLCAoY2hhbmdlLCBmaWxlKSA9PiBAY2hlY2tUcmFzaCB0cmFzaEZvbGRlclxuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBzZXRJY29uOiAoaWNvblBhdGgpID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGljb25QYXRoXG4gICAgICAgIGltZyA9IGVsZW0gJ2ltZycgY2xhc3M6J2FwcGxpY29uJyBzcmM6c2xhc2guZmlsZVVybCBpY29uUGF0aFxuICAgICAgICBpbWcub25kcmFnc3RhcnQgPSAtPiBmYWxzZVxuICAgICAgICBAbWFpbi5pbm5lckhUTUwgPSAnJ1xuICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBpbWdcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEZvbGRlclxuIl19
//# sourceURL=../coffee/folder.coffee
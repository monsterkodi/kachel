// koffee 1.3.0

/*
00000000   0000000   000      0000000    00000000  00000000   
000       000   000  000      000   000  000       000   000  
000000    000   000  000      000   000  0000000   0000000    
000       000   000  000      000   000  000       000   000  
000        0000000   0000000  0000000    00000000  000   000
 */
var Folder, Kachel, _, childp, elem, fs, klog, open, os, post, prefs, ref, slash, utils, valid,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, childp = ref.childp, prefs = ref.prefs, slash = ref.slash, valid = ref.valid, open = ref.open, klog = ref.klog, elem = ref.elem, os = ref.os, fs = ref.fs, _ = ref._;

Kachel = require('./kachel');

utils = require('./utils');

Folder = (function(superClass) {
    extend(Folder, superClass);

    function Folder(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'folder';
        this.setIcon = bind(this.setIcon, this);
        this.onContextMenu = bind(this.onContextMenu, this);
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
        var folder, name;
        this.folderPath = data.folder;
        this.kachelId = 'folder' + this.folderPath;
        prefs.set("kacheln▸" + this.kachelId + "▸data▸folder", this.folderPath);
        prefs.set("kacheln▸" + this.kachelId + "▸html", 'folder');
        folder = slash.resolve(this.folderPath);
        if (folder === slash.untilde('~')) {
            this.setIcon(slash.join(__dirname, '..', 'img', 'home.png'));
        } else if (folder === slash.untilde('~/.Trash')) {
            this.setIcon(slash.join(__dirname, '..', 'img', 'recycle5.png'));
            this.addTrash(folder);
        } else if (folder.indexOf('$Recycle.Bin') >= 0) {
            this.setIcon(slash.join(__dirname, '..', 'img', 'recycle5.png'));
            this.addTrash(folder);
        } else if (folder === slash.untilde('~/Desktop')) {
            this.setIcon(slash.join(__dirname, '..', 'img', 'desktop.png'));
        } else if (folder === slash.untilde('~/Downloads')) {
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

    Folder.prototype.checkTrash = function(trashFolder) {
        return fs.readdir(trashFolder, (function(_this) {
            return function(err, files) {
                if (valid(err)) {
                    return;
                }
                if (files.length) {
                    _this.dot = utils.svg({
                        clss: 'overlay'
                    });
                    utils.circle({
                        radius: 12,
                        clss: 'trashDot',
                        svg: _this.dot
                    });
                    return _this.main.appendChild(_this.dot);
                } else if (_this.dot) {
                    _this.main.removeChild(_this.dot);
                    return delete _this.dot;
                }
            };
        })(this));
    };

    Folder.prototype.onContextMenu = function() {
        var emptyTrash;
        if (this.isTrash) {
            emptyTrash = require('empty-trash');
            return emptyTrash();
        }
    };

    Folder.prototype.addTrash = function(trashFolder) {
        this.isTrash = true;
        this.checkTrash(trashFolder);
        return fs.watch(trashFolder, (function(_this) {
            return function(change, file) {
                return _this.checkTrash(trashFolder);
            };
        })(this));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9sZGVyICgxKS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsMEZBQUE7SUFBQTs7OztBQVFBLE1BQXFFLE9BQUEsQ0FBUSxLQUFSLENBQXJFLEVBQUUsZUFBRixFQUFRLG1CQUFSLEVBQWdCLGlCQUFoQixFQUF1QixpQkFBdkIsRUFBOEIsaUJBQTlCLEVBQXFDLGVBQXJDLEVBQTJDLGVBQTNDLEVBQWlELGVBQWpELEVBQXVELFdBQXZELEVBQTJELFdBQTNELEVBQStEOztBQUUvRCxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0FBQ1QsS0FBQSxHQUFTLE9BQUEsQ0FBUSxTQUFSOztBQUVIOzs7SUFFQyxnQkFBQyxHQUFEO0FBQXdCLFlBQUE7UUFBdkIsSUFBQyxDQUFBLGtEQUFTOzs7O1FBQWEsNEdBQUEsU0FBQTtJQUF4Qjs7cUJBUUgsT0FBQSxHQUFTLFNBQUMsS0FBRDtRQUVMLElBQUcsRUFBRSxDQUFDLFFBQUgsQ0FBQSxDQUFBLEtBQWlCLE9BQWpCLElBQTZCLElBQUMsQ0FBQSxVQUFVLENBQUMsUUFBWixDQUFxQixjQUFyQixDQUFoQzttQkFDSSxNQUFNLENBQUMsUUFBUCxDQUFnQiw4QkFBaEIsRUFESjtTQUFBLE1BQUE7bUJBR0ksSUFBQSxDQUFLLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBQyxDQUFBLFVBQWYsQ0FBTCxFQUhKOztJQUZLOztxQkFhVCxVQUFBLEdBQVksU0FBQyxJQUFEO0FBRVIsWUFBQTtRQUFBLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBSSxDQUFDO1FBQ25CLElBQUMsQ0FBQSxRQUFELEdBQVksUUFBQSxHQUFTLElBQUMsQ0FBQTtRQUN0QixLQUFLLENBQUMsR0FBTixDQUFVLFVBQUEsR0FBVyxJQUFDLENBQUEsUUFBWixHQUFxQixjQUEvQixFQUE2QyxJQUFDLENBQUEsVUFBOUM7UUFDQSxLQUFLLENBQUMsR0FBTixDQUFVLFVBQUEsR0FBVyxJQUFDLENBQUEsUUFBWixHQUFxQixPQUEvQixFQUFzQyxRQUF0QztRQUVBLE1BQUEsR0FBUyxLQUFLLENBQUMsT0FBTixDQUFjLElBQUMsQ0FBQSxVQUFmO1FBRVQsSUFBRyxNQUFBLEtBQVUsS0FBSyxDQUFDLE9BQU4sQ0FBYyxHQUFkLENBQWI7WUFDSSxJQUFDLENBQUEsT0FBRCxDQUFTLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBWCxFQUFzQixJQUF0QixFQUEyQixLQUEzQixFQUFpQyxVQUFqQyxDQUFULEVBREo7U0FBQSxNQUVLLElBQUcsTUFBQSxLQUFVLEtBQUssQ0FBQyxPQUFOLENBQWMsVUFBZCxDQUFiO1lBQ0QsSUFBQyxDQUFBLE9BQUQsQ0FBUyxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0IsSUFBdEIsRUFBMkIsS0FBM0IsRUFBaUMsY0FBakMsQ0FBVDtZQUNBLElBQUMsQ0FBQSxRQUFELENBQVUsTUFBVixFQUZDO1NBQUEsTUFHQSxJQUFHLE1BQU0sQ0FBQyxPQUFQLENBQWUsY0FBZixDQUFBLElBQWtDLENBQXJDO1lBQ0QsSUFBQyxDQUFBLE9BQUQsQ0FBUyxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0IsSUFBdEIsRUFBMkIsS0FBM0IsRUFBaUMsY0FBakMsQ0FBVDtZQUNBLElBQUMsQ0FBQSxRQUFELENBQVUsTUFBVixFQUZDO1NBQUEsTUFHQSxJQUFHLE1BQUEsS0FBVSxLQUFLLENBQUMsT0FBTixDQUFjLFdBQWQsQ0FBYjtZQUNELElBQUMsQ0FBQSxPQUFELENBQVMsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFYLEVBQXNCLElBQXRCLEVBQTJCLEtBQTNCLEVBQWlDLGFBQWpDLENBQVQsRUFEQztTQUFBLE1BRUEsSUFBRyxNQUFBLEtBQVUsS0FBSyxDQUFDLE9BQU4sQ0FBYyxhQUFkLENBQWI7WUFDRCxJQUFDLENBQUEsT0FBRCxDQUFTLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBWCxFQUFzQixJQUF0QixFQUEyQixLQUEzQixFQUFpQyxlQUFqQyxDQUFULEVBREM7U0FBQSxNQUFBO1lBR0QsSUFBQyxDQUFBLE9BQUQsQ0FBUyxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0IsSUFBdEIsRUFBMkIsS0FBM0IsRUFBaUMsWUFBakMsQ0FBVDtZQUVBLElBQUEsR0FBTyxJQUFBLENBQUssS0FBTCxFQUFXO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sWUFBTjtnQkFBbUIsSUFBQSxFQUFLLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBQyxDQUFBLFVBQVosQ0FBeEI7YUFBWDtZQUNQLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixJQUFsQixFQU5DOztlQVFMLHdDQUFBLFNBQUE7SUEzQlE7O3FCQW1DWixVQUFBLEdBQVksU0FBQyxXQUFEO2VBRVIsRUFBRSxDQUFDLE9BQUgsQ0FBVyxXQUFYLEVBQXdCLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUMsR0FBRCxFQUFNLEtBQU47Z0JBQ3BCLElBQVUsS0FBQSxDQUFNLEdBQU4sQ0FBVjtBQUFBLDJCQUFBOztnQkFDQSxJQUFHLEtBQUssQ0FBQyxNQUFUO29CQUNJLEtBQUMsQ0FBQSxHQUFELEdBQU8sS0FBSyxDQUFDLEdBQU4sQ0FBVTt3QkFBQSxJQUFBLEVBQUssU0FBTDtxQkFBVjtvQkFDUCxLQUFLLENBQUMsTUFBTixDQUFhO3dCQUFBLE1BQUEsRUFBTyxFQUFQO3dCQUFVLElBQUEsRUFBSyxVQUFmO3dCQUEwQixHQUFBLEVBQUksS0FBQyxDQUFBLEdBQS9CO3FCQUFiOzJCQUNBLEtBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixLQUFDLENBQUEsR0FBbkIsRUFISjtpQkFBQSxNQUlLLElBQUcsS0FBQyxDQUFBLEdBQUo7b0JBQ0QsS0FBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLEtBQUMsQ0FBQSxHQUFuQjsyQkFDQSxPQUFPLEtBQUMsQ0FBQSxJQUZQOztZQU5lO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4QjtJQUZROztxQkFZWixhQUFBLEdBQWUsU0FBQTtBQUVYLFlBQUE7UUFBQSxJQUFHLElBQUMsQ0FBQSxPQUFKO1lBQ0ksVUFBQSxHQUFhLE9BQUEsQ0FBUSxhQUFSO21CQUNiLFVBQUEsQ0FBQSxFQUZKOztJQUZXOztxQkFNZixRQUFBLEdBQVUsU0FBQyxXQUFEO1FBRU4sSUFBQyxDQUFBLE9BQUQsR0FBVztRQUlYLElBQUMsQ0FBQSxVQUFELENBQVksV0FBWjtlQUVBLEVBQUUsQ0FBQyxLQUFILENBQVMsV0FBVCxFQUFzQixDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFDLE1BQUQsRUFBUyxJQUFUO3VCQUNsQixLQUFDLENBQUEsVUFBRCxDQUFZLFdBQVo7WUFEa0I7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRCO0lBUk07O3FCQWlCVixPQUFBLEdBQVMsU0FBQyxRQUFEO0FBRUwsWUFBQTtRQUFBLElBQVUsQ0FBSSxRQUFkO0FBQUEsbUJBQUE7O1FBQ0EsR0FBQSxHQUFNLElBQUEsQ0FBSyxLQUFMLEVBQVc7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFVBQU47WUFBaUIsS0FBQSxFQUFNLElBQUMsQ0FBQSxPQUF4QjtZQUFpQyxHQUFBLEVBQUksS0FBSyxDQUFDLE9BQU4sQ0FBYyxRQUFkLENBQXJDO1NBQVg7UUFDTixHQUFHLENBQUMsV0FBSixHQUFrQixTQUFBO21CQUFHO1FBQUg7ZUFDbEIsSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLEdBQWxCO0lBTEs7Ozs7R0E3RlE7O0FBb0dyQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMCAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIyNcblxueyBwb3N0LCBjaGlsZHAsIHByZWZzLCBzbGFzaCwgdmFsaWQsIG9wZW4sIGtsb2csIGVsZW0sIG9zLCBmcywgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5LYWNoZWwgPSByZXF1aXJlICcuL2thY2hlbCdcbnV0aWxzICA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmNsYXNzIEZvbGRlciBleHRlbmRzIEthY2hlbFxuICAgICAgICBcbiAgICBAOiAoQGthY2hlbElkOidmb2xkZXInKSAtPiBzdXBlclxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgb25DbGljazogKGV2ZW50KSAtPiBcbiAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJyBhbmQgQGZvbGRlclBhdGguZW5kc1dpdGggJyRSZWN5Y2xlLkJpbidcbiAgICAgICAgICAgIGNoaWxkcC5leGVjU3luYyBcInN0YXJ0IHNoZWxsOlJlY3ljbGVCaW5Gb2xkZXJcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvcGVuIHNsYXNoLnVuc2xhc2ggQGZvbGRlclBhdGhcbiAgICAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBvbkluaXREYXRhOiAoZGF0YSkgPT5cbiAgICAgICAgXG4gICAgICAgIEBmb2xkZXJQYXRoID0gZGF0YS5mb2xkZXJcbiAgICAgICAgQGthY2hlbElkID0gJ2ZvbGRlcicrQGZvbGRlclBhdGhcbiAgICAgICAgcHJlZnMuc2V0IFwia2FjaGVsbuKWuCN7QGthY2hlbElkfeKWuGRhdGHilrhmb2xkZXJcIiBAZm9sZGVyUGF0aFxuICAgICAgICBwcmVmcy5zZXQgXCJrYWNoZWxu4pa4I3tAa2FjaGVsSWR94pa4aHRtbFwiICdmb2xkZXInXG4gICAgXG4gICAgICAgIGZvbGRlciA9IHNsYXNoLnJlc29sdmUgQGZvbGRlclBhdGhcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgZm9sZGVyID09IHNsYXNoLnVudGlsZGUgJ34nXG4gICAgICAgICAgICBAc2V0SWNvbiBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaW1nJyAnaG9tZS5wbmcnXG4gICAgICAgIGVsc2UgaWYgZm9sZGVyID09IHNsYXNoLnVudGlsZGUgJ34vLlRyYXNoJ1xuICAgICAgICAgICAgQHNldEljb24gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ltZycgJ3JlY3ljbGU1LnBuZydcbiAgICAgICAgICAgIEBhZGRUcmFzaCBmb2xkZXJcbiAgICAgICAgZWxzZSBpZiBmb2xkZXIuaW5kZXhPZignJFJlY3ljbGUuQmluJykgPj0gMFxuICAgICAgICAgICAgQHNldEljb24gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ltZycgJ3JlY3ljbGU1LnBuZydcbiAgICAgICAgICAgIEBhZGRUcmFzaCBmb2xkZXJcbiAgICAgICAgZWxzZSBpZiBmb2xkZXIgPT0gc2xhc2gudW50aWxkZSAnfi9EZXNrdG9wJ1xuICAgICAgICAgICAgQHNldEljb24gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ltZycgJ2Rlc2t0b3AucG5nJ1xuICAgICAgICBlbHNlIGlmIGZvbGRlciA9PSBzbGFzaC51bnRpbGRlICd+L0Rvd25sb2FkcydcbiAgICAgICAgICAgIEBzZXRJY29uIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpbWcnICdkb3dubG9hZHMucG5nJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2V0SWNvbiBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaW1nJyAnZm9sZGVyLnBuZydcbiAgICBcbiAgICAgICAgICAgIG5hbWUgPSBlbGVtICdkaXYnIGNsYXNzOidmb2xkZXJuYW1lJyB0ZXh0OnNsYXNoLmJhc2UgQGZvbGRlclBhdGhcbiAgICAgICAgICAgIEBtYWluLmFwcGVuZENoaWxkIG5hbWVcbiAgICAgICAgXG4gICAgICAgIHN1cGVyXG4gICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGNoZWNrVHJhc2g6ICh0cmFzaEZvbGRlcikgLT5cbiAgICAgICAgXG4gICAgICAgIGZzLnJlYWRkaXIgdHJhc2hGb2xkZXIsIChlcnIsIGZpbGVzKSA9PlxuICAgICAgICAgICAgcmV0dXJuIGlmIHZhbGlkIGVyclxuICAgICAgICAgICAgaWYgZmlsZXMubGVuZ3RoXG4gICAgICAgICAgICAgICAgQGRvdCA9IHV0aWxzLnN2ZyBjbHNzOidvdmVybGF5J1xuICAgICAgICAgICAgICAgIHV0aWxzLmNpcmNsZSByYWRpdXM6MTIgY2xzczondHJhc2hEb3QnIHN2ZzpAZG90XG4gICAgICAgICAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgQGRvdFxuICAgICAgICAgICAgZWxzZSBpZiBAZG90XG4gICAgICAgICAgICAgICAgQG1haW4ucmVtb3ZlQ2hpbGQgQGRvdFxuICAgICAgICAgICAgICAgIGRlbGV0ZSBAZG90XG4gICAgICAgIFxuICAgIG9uQ29udGV4dE1lbnU6ID0+IFxuICAgICAgICBcbiAgICAgICAgaWYgQGlzVHJhc2hcbiAgICAgICAgICAgIGVtcHR5VHJhc2ggPSByZXF1aXJlICdlbXB0eS10cmFzaCdcbiAgICAgICAgICAgIGVtcHR5VHJhc2goKVxuICAgICAgICAgICAgICAgIFxuICAgIGFkZFRyYXNoOiAodHJhc2hGb2xkZXIpIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgQGlzVHJhc2ggPSB0cnVlXG4gICAgICAgICMgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICAjIHRyYXNoRm9sZGVyID0gJ3NoZWxsOlJlY3ljbGVCaW5Gb2xkZXInXG4gICAgICAgIFxuICAgICAgICBAY2hlY2tUcmFzaCB0cmFzaEZvbGRlclxuICAgICAgICBcbiAgICAgICAgZnMud2F0Y2ggdHJhc2hGb2xkZXIsIChjaGFuZ2UsIGZpbGUpID0+XG4gICAgICAgICAgICBAY2hlY2tUcmFzaCB0cmFzaEZvbGRlclxuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBzZXRJY29uOiAoaWNvblBhdGgpID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGljb25QYXRoXG4gICAgICAgIGltZyA9IGVsZW0gJ2ltZycgY2xhc3M6J2FwcGxpY29uJyBjbGljazpAb3BlbkFwcCwgc3JjOnNsYXNoLmZpbGVVcmwgaWNvblBhdGhcbiAgICAgICAgaW1nLm9uZHJhZ3N0YXJ0ID0gLT4gZmFsc2VcbiAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgaW1nXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBGb2xkZXJcbiJdfQ==
//# sourceURL=../coffee/folder (1).coffee
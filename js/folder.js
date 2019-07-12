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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9sZGVyLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwwRkFBQTtJQUFBOzs7O0FBUUEsTUFBcUUsT0FBQSxDQUFRLEtBQVIsQ0FBckUsRUFBRSxlQUFGLEVBQVEsbUJBQVIsRUFBZ0IsaUJBQWhCLEVBQXVCLGlCQUF2QixFQUE4QixpQkFBOUIsRUFBcUMsZUFBckMsRUFBMkMsZUFBM0MsRUFBaUQsZUFBakQsRUFBdUQsV0FBdkQsRUFBMkQsV0FBM0QsRUFBK0Q7O0FBRS9ELE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFDVCxLQUFBLEdBQVMsT0FBQSxDQUFRLFNBQVI7O0FBRUg7OztJQUVDLGdCQUFDLEdBQUQ7QUFBd0IsWUFBQTtRQUF2QixJQUFDLENBQUEsa0RBQVM7Ozs7UUFBYSw0R0FBQSxTQUFBO0lBQXhCOztxQkFRSCxPQUFBLEdBQVMsU0FBQyxLQUFEO1FBRUwsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsT0FBakIsSUFBNkIsSUFBQyxDQUFBLFVBQVUsQ0FBQyxRQUFaLENBQXFCLGNBQXJCLENBQWhDO21CQUNJLE1BQU0sQ0FBQyxRQUFQLENBQWdCLDhCQUFoQixFQURKO1NBQUEsTUFBQTttQkFHSSxJQUFBLENBQUssS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFDLENBQUEsVUFBZixDQUFMLEVBSEo7O0lBRks7O3FCQWFULFVBQUEsR0FBWSxTQUFDLElBQUQ7QUFFUixZQUFBO1FBQUEsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFJLENBQUM7UUFDbkIsSUFBQyxDQUFBLFFBQUQsR0FBWSxRQUFBLEdBQVMsSUFBQyxDQUFBO1FBQ3RCLEtBQUssQ0FBQyxHQUFOLENBQVUsVUFBQSxHQUFXLElBQUMsQ0FBQSxRQUFaLEdBQXFCLGNBQS9CLEVBQTZDLElBQUMsQ0FBQSxVQUE5QztRQUNBLEtBQUssQ0FBQyxHQUFOLENBQVUsVUFBQSxH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QTtRQUFBLElBQUcsSUFBQyxDQUFBLE9BQUo7WUFDSSxVQUFBLEdBQWEsT0FBQSxDQUFRLGFBQVI7bUJBQ2IsVUFBQSxDQUFBLEVBRko7O0lBRlc7O3FCQU1mLFFBQUEsR0FBVSxTQUFDLFdBQUQ7UUFFTixJQUFDLENBQUEsT0FBRCxHQUFXO1FBSVgsSUFBQyxDQUFBLFVBQUQsQ0FBWSxXQUFaO2VBRUEsRUFBRSxDQUFDLEtBQUgsQ0FBUyxXQUFULEVBQXNCLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUMsTUFBRCxFQUFTLElBQVQ7dUJBQWtCLEtBQUMsQ0FBQSxVQUFELENBQVksV0FBWjtZQUFsQjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEI7SUFSTTs7cUJBZ0JWLE9BQUEsR0FBUyxTQUFDLFFBQUQ7QUFFTCxZQUFBO1FBQUEsSUFBVSxDQUFJLFFBQWQ7QUFBQSxtQkFBQTs7UUFFQSxHQUFBLEdBQU0sSUFBQSxDQUFLLEtBQUwsRUFBVztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sVUFBTjtZQUFpQixHQUFBLEVBQUksS0FBSyxDQUFDLE9BQU4sQ0FBYyxRQUFkLENBQXJCO1NBQVg7UUFDTixHQUFHLENBQUMsV0FBSixHQUFrQixTQUFBO21CQUFHO1FBQUg7ZUFDbEIsSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLEdBQWxCO0lBTks7Ozs7R0E1RlE7O0FBb0dyQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMCAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIyNcblxueyBwb3N0LCBjaGlsZHAsIHByZWZzLCBzbGFzaCwgdmFsaWQsIG9wZW4sIGtsb2csIGVsZW0sIG9zLCBmcywgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5LYWNoZWwgPSByZXF1aXJlICcuL2thY2hlbCdcbnV0aWxzICA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmNsYXNzIEZvbGRlciBleHRlbmRzIEthY2hlbFxuICAgICAgICBcbiAgICBAOiAoQGthY2hlbElkOidmb2xkZXInKSAtPiBzdXBlclxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgb25DbGljazogKGV2ZW50KSAtPiBcbiAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJyBhbmQgQGZvbGRlclBhdGguZW5kc1dpdGggJyRSZWN5Y2xlLkJpbidcbiAgICAgICAgICAgIGNoaWxkcC5leGVjU3luYyBcInN0YXJ0IHNoZWxsOlJlY3ljbGVCaW5Gb2xkZXJcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvcGVuIHNsYXNoLnVuc2xhc2ggQGZvbGRlclBhdGhcbiAgICAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBvbkluaXREYXRhOiAoZGF0YSkgPT5cbiAgICAgICAgXG4gICAgICAgIEBmb2xkZXJQYXRoID0gZGF0YS5mb2xkZXJcbiAgICAgICAgQGthY2hlbElkID0gJ2ZvbGRlcicrQGZvbGRlclBhdGhcbiAgICAgICAgcHJlZnMuc2V0IFwia2FjaGVsbuKWuCN7QGthY2hlbElkfeKWuGRhdGHilrhmb2xkZXJcIiBAZm9sZGVyUGF0aFxuICAgICAgICBwcmVmcy5zZXQgXCJrYWNoZWxu4pa4I3tAa2FjaGVsSWR94pa4aHRtbFwiICdmb2xkZXInXG4gICAgXG4gICAgICAgIGZvbGRlciA9IHNsYXNoLnJlc29sdmUgQGZvbGRlclBhdGhcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgZm9sZGVyID09IHNsYXNoLnVudGlsZGUgJ34nXG4gICAgICAgICAgICBAc2V0SWNvbiBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaW1nJyAnaG9tZS5wbmcnXG4gICAgICAgIGVsc2UgaWYgZm9sZGVyID09IHNsYXNoLnVudGlsZGUgJ34vLlRyYXNoJ1xuICAgICAgICAgICAgQHNldEljb24gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ltZycgJ3JlY3ljbGU1LnBuZydcbiAgICAgICAgICAgIEBhZGRUcmFzaCBmb2xkZXJcbiAgICAgICAgZWxzZSBpZiBmb2xkZXIuaW5kZXhPZignJFJlY3ljbGUuQmluJykgPj0gMFxuICAgICAgICAgICAgQHNldEljb24gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ltZycgJ3JlY3ljbGU1LnBuZydcbiAgICAgICAgICAgIEBhZGRUcmFzaCBmb2xkZXJcbiAgICAgICAgZWxzZSBpZiBmb2xkZXIgPT0gc2xhc2gudW50aWxkZSAnfi9EZXNrdG9wJ1xuICAgICAgICAgICAgQHNldEljb24gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ltZycgJ2Rlc2t0b3AucG5nJ1xuICAgICAgICBlbHNlIGlmIGZvbGRlciA9PSBzbGFzaC51bnRpbGRlICd+L0Rvd25sb2FkcydcbiAgICAgICAgICAgIEBzZXRJY29uIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpbWcnICdkb3dubG9hZHMucG5nJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2V0SWNvbiBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaW1nJyAnZm9sZGVyLnBuZydcbiAgICBcbiAgICAgICAgICAgIG5hbWUgPSBlbGVtICdkaXYnIGNsYXNzOidmb2xkZXJuYW1lJyB0ZXh0OnNsYXNoLmJhc2UgQGZvbGRlclBhdGhcbiAgICAgICAgICAgIEBtYWluLmFwcGVuZENoaWxkIG5hbWVcbiAgICAgICAgXG4gICAgICAgIHN1cGVyXG4gICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGNoZWNrVHJhc2g6ICh0cmFzaEZvbGRlcikgLT5cbiAgICAgICAgXG4gICAgICAgIGZzLnJlYWRkaXIgdHJhc2hGb2xkZXIsIChlcnIsIGZpbGVzKSA9PlxuICAgICAgICAgICAgcmV0dXJuIGlmIHZhbGlkIGVyclxuICAgICAgICAgICAgaWYgZmlsZXMubGVuZ3RoXG4gICAgICAgICAgICAgICAgQGRvdCA9IHV0aWxzLnN2ZyBjbHNzOidvdmVybGF5J1xuICAgICAgICAgICAgICAgIHV0aWxzLmNpcmNsZSByYWRpdXM6MTIgY2xzczondHJhc2hEb3QnIHN2ZzpAZG90XG4gICAgICAgICAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgQGRvdFxuICAgICAgICAgICAgZWxzZSBpZiBAZG90XG4gICAgICAgICAgICAgICAgQG1haW4ucmVtb3ZlQ2hpbGQgQGRvdFxuICAgICAgICAgICAgICAgIGRlbGV0ZSBAZG90XG4gICAgICAgIFxuICAgIG9uQ29udGV4dE1lbnU6ID0+IFxuICAgICAgICBcbiAgICAgICAgaWYgQGlzVHJhc2hcbiAgICAgICAgICAgIGVtcHR5VHJhc2ggPSByZXF1aXJlICdlbXB0eS10cmFzaCdcbiAgICAgICAgICAgIGVtcHR5VHJhc2goKVxuICAgICAgICAgICAgICAgIFxuICAgIGFkZFRyYXNoOiAodHJhc2hGb2xkZXIpIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgQGlzVHJhc2ggPSB0cnVlXG4gICAgICAgICMgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICAjIHRyYXNoRm9sZGVyID0gJ3NoZWxsOlJlY3ljbGVCaW5Gb2xkZXInXG4gICAgICAgIFxuICAgICAgICBAY2hlY2tUcmFzaCB0cmFzaEZvbGRlclxuICAgICAgICBcbiAgICAgICAgZnMud2F0Y2ggdHJhc2hGb2xkZXIsIChjaGFuZ2UsIGZpbGUpID0+IEBjaGVja1RyYXNoIHRyYXNoRm9sZGVyXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHNldEljb246IChpY29uUGF0aCkgPT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgaWNvblBhdGhcbiAgICAgICAgIyBpbWcgPSBlbGVtICdpbWcnIGNsYXNzOidhcHBsaWNvbicgY2xpY2s6QG9wZW5BcHAsIHNyYzpzbGFzaC5maWxlVXJsIGljb25QYXRoXG4gICAgICAgIGltZyA9IGVsZW0gJ2ltZycgY2xhc3M6J2FwcGxpY29uJyBzcmM6c2xhc2guZmlsZVVybCBpY29uUGF0aFxuICAgICAgICBpbWcub25kcmFnc3RhcnQgPSAtPiBmYWxzZVxuICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBpbWdcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEZvbGRlclxuIl19
//# sourceURL=../coffee/folder.coffee
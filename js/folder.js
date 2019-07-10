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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9sZGVyLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwwRkFBQTtJQUFBOzs7O0FBUUEsTUFBcUUsT0FBQSxDQUFRLEtBQVIsQ0FBckUsRUFBRSxlQUFGLEVBQVEsbUJBQVIsRUFBZ0IsaUJBQWhCLEVBQXVCLGlCQUF2QixFQUE4QixpQkFBOUIsRUFBcUMsZUFBckMsRUFBMkMsZUFBM0MsRUFBaUQsZUFBakQsRUFBdUQsV0FBdkQsRUFBMkQsV0FBM0QsRUFBK0Q7O0FBRS9ELE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFDVCxLQUFBLEdBQVMsT0FBQSxDQUFRLFNBQVI7O0FBRUg7OztJQUVDLGdCQUFDLEdBQUQ7QUFBd0IsWUFBQTtRQUF2QixJQUFDLENBQUEsa0RBQVM7Ozs7UUFBYSw0R0FBQSxTQUFBO0lBQXhCOztxQkFRSCxPQUFBLEdBQVMsU0FBQyxLQUFEO1FBRUwsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsT0FBakIsSUFBNkIsSUFBQyxDQUFBLFVBQVUsQ0FBQyxRQUFaLENBQXFCLGNBQXJCLENBQWhDO21CQUNJLE1BQU0sQ0FBQyxRQUFQLENBQWdCLDhCQUFoQixFQURKO1NBQUEsTUFBQTttQkFHSSxJQUFBLENBQUssS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFDLENBQUEsVUFBZixDQUFMLEVBSEo7O0lBRks7O3FCQWFULFVBQUEsR0FBWSxTQUFDLElBQUQ7QUFFUixZQUFBO1FBQUEsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFJLENBQUM7UUFDbkIsSUFBQyxDQUFBLFFBQUQsR0FBWSxRQUFBLEdBQVMsSUFBQyxDQUFBO1FBQ3RCLEtBQUssQ0FBQyxHQUFOLENBQVUsVUFBQSxHQUFXLElBQUMsQ0FBQSxRQUFaLEdBQXFCLGNBQS9CLEVBQTZDLElBQUMsQ0FBQSxVQUE5QztRQUNBLEtBQUssQ0FBQyxHQUFOLENBQVUsVUFBQSxH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QTtRQUFBLElBQUcsSUFBQyxDQUFBLE9BQUo7WUFDSSxVQUFBLEdBQWEsT0FBQSxDQUFRLGFBQVI7bUJBQ2IsVUFBQSxDQUFBLEVBRko7O0lBRlc7O3FCQU1mLFFBQUEsR0FBVSxTQUFDLFdBQUQ7UUFFTixJQUFDLENBQUEsT0FBRCxHQUFXO1FBSVgsSUFBQyxDQUFBLFVBQUQsQ0FBWSxXQUFaO2VBRUEsRUFBRSxDQUFDLEtBQUgsQ0FBUyxXQUFULEVBQXNCLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUMsTUFBRCxFQUFTLElBQVQ7dUJBQ2xCLEtBQUMsQ0FBQSxVQUFELENBQVksV0FBWjtZQURrQjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEI7SUFSTTs7cUJBaUJWLE9BQUEsR0FBUyxTQUFDLFFBQUQ7QUFFTCxZQUFBO1FBQUEsSUFBVSxDQUFJLFFBQWQ7QUFBQSxtQkFBQTs7UUFDQSxHQUFBLEdBQU0sSUFBQSxDQUFLLEtBQUwsRUFBVztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sVUFBTjtZQUFpQixLQUFBLEVBQU0sSUFBQyxDQUFBLE9BQXhCO1lBQWlDLEdBQUEsRUFBSSxLQUFLLENBQUMsT0FBTixDQUFjLFFBQWQsQ0FBckM7U0FBWDtRQUNOLEdBQUcsQ0FBQyxXQUFKLEdBQWtCLFNBQUE7bUJBQUc7UUFBSDtlQUNsQixJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsR0FBbEI7SUFMSzs7OztHQTdGUTs7QUFvR3JCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiMjI1xuXG57IHBvc3QsIGNoaWxkcCwgcHJlZnMsIHNsYXNoLCB2YWxpZCwgb3Blbiwga2xvZywgZWxlbSwgb3MsIGZzLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbkthY2hlbCA9IHJlcXVpcmUgJy4va2FjaGVsJ1xudXRpbHMgID0gcmVxdWlyZSAnLi91dGlscydcblxuY2xhc3MgRm9sZGVyIGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J2ZvbGRlcicpIC0+IHN1cGVyXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBvbkNsaWNrOiAoZXZlbnQpIC0+IFxuICAgICAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInIGFuZCBAZm9sZGVyUGF0aC5lbmRzV2l0aCAnJFJlY3ljbGUuQmluJ1xuICAgICAgICAgICAgY2hpbGRwLmV4ZWNTeW5jIFwic3RhcnQgc2hlbGw6UmVjeWNsZUJpbkZvbGRlclwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG9wZW4gc2xhc2gudW5zbGFzaCBAZm9sZGVyUGF0aFxuICAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIG9uSW5pdERhdGE6IChkYXRhKSA9PlxuICAgICAgICBcbiAgICAgICAgQGZvbGRlclBhdGggPSBkYXRhLmZvbGRlclxuICAgICAgICBAa2FjaGVsSWQgPSAnZm9sZGVyJytAZm9sZGVyUGF0aFxuICAgICAgICBwcmVmcy5zZXQgXCJrYWNoZWxu4pa4I3tAa2FjaGVsSWR94pa4ZGF0YeKWuGZvbGRlclwiIEBmb2xkZXJQYXRoXG4gICAgICAgIHByZWZzLnNldCBcImthY2hlbG7ilrgje0BrYWNoZWxJZH3ilrhodG1sXCIgJ2ZvbGRlcidcbiAgICBcbiAgICAgICAgZm9sZGVyID0gc2xhc2gucmVzb2x2ZSBAZm9sZGVyUGF0aFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBmb2xkZXIgPT0gc2xhc2gudW50aWxkZSAnfidcbiAgICAgICAgICAgIEBzZXRJY29uIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpbWcnICdob21lLnBuZydcbiAgICAgICAgZWxzZSBpZiBmb2xkZXIgPT0gc2xhc2gudW50aWxkZSAnfi8uVHJhc2gnXG4gICAgICAgICAgICBAc2V0SWNvbiBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaW1nJyAncmVjeWNsZTUucG5nJ1xuICAgICAgICAgICAgQGFkZFRyYXNoIGZvbGRlclxuICAgICAgICBlbHNlIGlmIGZvbGRlci5pbmRleE9mKCckUmVjeWNsZS5CaW4nKSA+PSAwXG4gICAgICAgICAgICBAc2V0SWNvbiBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaW1nJyAncmVjeWNsZTUucG5nJ1xuICAgICAgICAgICAgQGFkZFRyYXNoIGZvbGRlclxuICAgICAgICBlbHNlIGlmIGZvbGRlciA9PSBzbGFzaC51bnRpbGRlICd+L0Rlc2t0b3AnXG4gICAgICAgICAgICBAc2V0SWNvbiBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaW1nJyAnZGVza3RvcC5wbmcnXG4gICAgICAgIGVsc2UgaWYgZm9sZGVyID09IHNsYXNoLnVudGlsZGUgJ34vRG93bmxvYWRzJ1xuICAgICAgICAgICAgQHNldEljb24gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ltZycgJ2Rvd25sb2Fkcy5wbmcnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzZXRJY29uIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpbWcnICdmb2xkZXIucG5nJ1xuICAgIFxuICAgICAgICAgICAgbmFtZSA9IGVsZW0gJ2RpdicgY2xhc3M6J2ZvbGRlcm5hbWUnIHRleHQ6c2xhc2guYmFzZSBAZm9sZGVyUGF0aFxuICAgICAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgbmFtZVxuICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgY2hlY2tUcmFzaDogKHRyYXNoRm9sZGVyKSAtPlxuICAgICAgICBcbiAgICAgICAgZnMucmVhZGRpciB0cmFzaEZvbGRlciwgKGVyciwgZmlsZXMpID0+XG4gICAgICAgICAgICByZXR1cm4gaWYgdmFsaWQgZXJyXG4gICAgICAgICAgICBpZiBmaWxlcy5sZW5ndGhcbiAgICAgICAgICAgICAgICBAZG90ID0gdXRpbHMuc3ZnIGNsc3M6J292ZXJsYXknXG4gICAgICAgICAgICAgICAgdXRpbHMuY2lyY2xlIHJhZGl1czoxMiBjbHNzOid0cmFzaERvdCcgc3ZnOkBkb3RcbiAgICAgICAgICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBAZG90XG4gICAgICAgICAgICBlbHNlIGlmIEBkb3RcbiAgICAgICAgICAgICAgICBAbWFpbi5yZW1vdmVDaGlsZCBAZG90XG4gICAgICAgICAgICAgICAgZGVsZXRlIEBkb3RcbiAgICAgICAgXG4gICAgb25Db250ZXh0TWVudTogPT4gXG4gICAgICAgIFxuICAgICAgICBpZiBAaXNUcmFzaFxuICAgICAgICAgICAgZW1wdHlUcmFzaCA9IHJlcXVpcmUgJ2VtcHR5LXRyYXNoJ1xuICAgICAgICAgICAgZW1wdHlUcmFzaCgpXG4gICAgICAgICAgICAgICAgXG4gICAgYWRkVHJhc2g6ICh0cmFzaEZvbGRlcikgLT5cbiAgICAgICAgICAgIFxuICAgICAgICBAaXNUcmFzaCA9IHRydWVcbiAgICAgICAgIyBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgICMgdHJhc2hGb2xkZXIgPSAnc2hlbGw6UmVjeWNsZUJpbkZvbGRlcidcbiAgICAgICAgXG4gICAgICAgIEBjaGVja1RyYXNoIHRyYXNoRm9sZGVyXG4gICAgICAgIFxuICAgICAgICBmcy53YXRjaCB0cmFzaEZvbGRlciwgKGNoYW5nZSwgZmlsZSkgPT5cbiAgICAgICAgICAgIEBjaGVja1RyYXNoIHRyYXNoRm9sZGVyXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHNldEljb246IChpY29uUGF0aCkgPT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgaWNvblBhdGhcbiAgICAgICAgaW1nID0gZWxlbSAnaW1nJyBjbGFzczonYXBwbGljb24nIGNsaWNrOkBvcGVuQXBwLCBzcmM6c2xhc2guZmlsZVVybCBpY29uUGF0aFxuICAgICAgICBpbWcub25kcmFnc3RhcnQgPSAtPiBmYWxzZVxuICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBpbWdcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEZvbGRlclxuIl19
//# sourceURL=../coffee/folder.coffee
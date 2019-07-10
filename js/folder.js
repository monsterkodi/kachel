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
                klog('checkTrash', files.length);
                if (files.length) {
                    klog('checkTrash', files);
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

    Folder.prototype.addTrash = function(trashFolder) {
        if (os.platform() === 'win32') {
            trashFolder = 'shell:RecycleBinFolder';
        }
        this.checkTrash(trashFolder);
        return fs.watch(trashFolder, (function(_this) {
            return function(change, file) {
                klog('watchTrash', change, file, trashFolder);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9sZGVyLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwwRkFBQTtJQUFBOzs7O0FBUUEsTUFBcUUsT0FBQSxDQUFRLEtBQVIsQ0FBckUsRUFBRSxlQUFGLEVBQVEsbUJBQVIsRUFBZ0IsaUJBQWhCLEVBQXVCLGlCQUF2QixFQUE4QixpQkFBOUIsRUFBcUMsZUFBckMsRUFBMkMsZUFBM0MsRUFBaUQsZUFBakQsRUFBdUQsV0FBdkQsRUFBMkQsV0FBM0QsRUFBK0Q7O0FBRS9ELE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFDVCxLQUFBLEdBQVMsT0FBQSxDQUFRLFNBQVI7O0FBRUg7OztJQUVDLGdCQUFDLEdBQUQ7QUFBd0IsWUFBQTtRQUF2QixJQUFDLENBQUEsa0RBQVM7OztRQUFhLDRHQUFBLFNBQUE7SUFBeEI7O3FCQUVILE9BQUEsR0FBUyxTQUFDLEtBQUQ7UUFFTCxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixPQUFqQixJQUE2QixJQUFDLENBQUEsVUFBVSxDQUFDLFFBQVosQ0FBcUIsY0FBckIsQ0FBaEM7bUJBQ0ksTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsOEJBQWhCLEVBREo7U0FBQSxNQUFBO21CQUdJLElBQUEsQ0FBSyxLQUFLLENBQUMsT0FBTixDQUFjLElBQUMsQ0FBQSxVQUFmLENBQUwsRUFISjs7SUFGSzs7cUJBT1QsVUFBQSxHQUFZLFNBQUMsSUFBRDtBQUVSLFlBQUE7UUFBQSxJQUFDLENBQUEsVUFBRCxHQUFjLElBQUksQ0FBQztRQUNuQixJQUFDLENBQUEsUUFBRCxHQUFZLFFBQUEsR0FBUyxJQUFDLENBQUE7UUFDdEIsS0FBSyxDQUFDLEdBQU4sQ0FBVSxVQUFBLEdBQVcsSUFBQyxDQUFBLFFBQVosR0FBcUIsY0FBL0IsRUFBNkMsSUFBQyxDQUFBLFVBQTlDO1FBQ0EsS0FBSyxDQUFDLEdBQU4sQ0FBVSxVQUFBLEdB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RlA7O1lBUmU7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXhCO0lBRlE7O3FCQWNaLFFBQUEsR0FBVSxTQUFDLFdBQUQ7UUFFTixJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixPQUFwQjtZQUNJLFdBQUEsR0FBYyx5QkFEbEI7O1FBR0EsSUFBQyxDQUFBLFVBQUQsQ0FBWSxXQUFaO2VBRUEsRUFBRSxDQUFDLEtBQUgsQ0FBUyxXQUFULEVBQXNCLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUMsTUFBRCxFQUFTLElBQVQ7Z0JBQ2xCLElBQUEsQ0FBSyxZQUFMLEVBQWtCLE1BQWxCLEVBQTBCLElBQTFCLEVBQWdDLFdBQWhDO3VCQUNBLEtBQUMsQ0FBQSxVQUFELENBQVksV0FBWjtZQUZrQjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEI7SUFQTTs7cUJBV1YsT0FBQSxHQUFTLFNBQUMsUUFBRDtBQUVMLFlBQUE7UUFBQSxJQUFVLENBQUksUUFBZDtBQUFBLG1CQUFBOztRQUNBLEdBQUEsR0FBTSxJQUFBLENBQUssS0FBTCxFQUFXO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxVQUFOO1lBQWlCLEtBQUEsRUFBTSxJQUFDLENBQUEsT0FBeEI7WUFBaUMsR0FBQSxFQUFJLEtBQUssQ0FBQyxPQUFOLENBQWMsUUFBZCxDQUFyQztTQUFYO1FBQ04sR0FBRyxDQUFDLFdBQUosR0FBa0IsU0FBQTttQkFBRztRQUFIO2VBQ2xCLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixHQUFsQjtJQUxLOzs7O0dBakVROztBQXdFckIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuIyMjXG5cbnsgcG9zdCwgY2hpbGRwLCBwcmVmcywgc2xhc2gsIHZhbGlkLCBvcGVuLCBrbG9nLCBlbGVtLCBvcywgZnMsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuS2FjaGVsID0gcmVxdWlyZSAnLi9rYWNoZWwnXG51dGlscyAgPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5jbGFzcyBGb2xkZXIgZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonZm9sZGVyJykgLT4gc3VwZXJcbiAgICAgICAgXG4gICAgb25DbGljazogKGV2ZW50KSAtPiBcbiAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJyBhbmQgQGZvbGRlclBhdGguZW5kc1dpdGggJyRSZWN5Y2xlLkJpbidcbiAgICAgICAgICAgIGNoaWxkcC5leGVjU3luYyBcInN0YXJ0IHNoZWxsOlJlY3ljbGVCaW5Gb2xkZXJcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvcGVuIHNsYXNoLnVuc2xhc2ggQGZvbGRlclBhdGhcbiAgICAgICAgXG4gICAgb25Jbml0RGF0YTogKGRhdGEpID0+XG4gICAgICAgIFxuICAgICAgICBAZm9sZGVyUGF0aCA9IGRhdGEuZm9sZGVyXG4gICAgICAgIEBrYWNoZWxJZCA9ICdmb2xkZXInK0Bmb2xkZXJQYXRoXG4gICAgICAgIHByZWZzLnNldCBcImthY2hlbG7ilrgje0BrYWNoZWxJZH3ilrhkYXRh4pa4Zm9sZGVyXCIgQGZvbGRlclBhdGhcbiAgICAgICAgcHJlZnMuc2V0IFwia2FjaGVsbuKWuCN7QGthY2hlbElkfeKWuGh0bWxcIiAnZm9sZGVyJ1xuICAgIFxuICAgICAgICBmb2xkZXIgPSBzbGFzaC5yZXNvbHZlIEBmb2xkZXJQYXRoXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGZvbGRlciA9PSBzbGFzaC51bnRpbGRlICd+J1xuICAgICAgICAgICAgQHNldEljb24gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ltZycgJ2hvbWUucG5nJ1xuICAgICAgICBlbHNlIGlmIGZvbGRlciA9PSBzbGFzaC51bnRpbGRlICd+Ly5UcmFzaCdcbiAgICAgICAgICAgIEBzZXRJY29uIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpbWcnICdyZWN5Y2xlNS5wbmcnXG4gICAgICAgICAgICBAYWRkVHJhc2ggZm9sZGVyXG4gICAgICAgIGVsc2UgaWYgZm9sZGVyLmluZGV4T2YoJyRSZWN5Y2xlLkJpbicpID49IDBcbiAgICAgICAgICAgIEBzZXRJY29uIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpbWcnICdyZWN5Y2xlNS5wbmcnXG4gICAgICAgICAgICBAYWRkVHJhc2ggZm9sZGVyXG4gICAgICAgIGVsc2UgaWYgZm9sZGVyID09IHNsYXNoLnVudGlsZGUgJ34vRGVza3RvcCdcbiAgICAgICAgICAgIEBzZXRJY29uIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpbWcnICdkZXNrdG9wLnBuZydcbiAgICAgICAgZWxzZSBpZiBmb2xkZXIgPT0gc2xhc2gudW50aWxkZSAnfi9Eb3dubG9hZHMnXG4gICAgICAgICAgICBAc2V0SWNvbiBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaW1nJyAnZG93bmxvYWRzLnBuZydcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNldEljb24gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ltZycgJ2ZvbGRlci5wbmcnXG4gICAgXG4gICAgICAgICAgICBuYW1lID0gZWxlbSAnZGl2JyBjbGFzczonZm9sZGVybmFtZScgdGV4dDpzbGFzaC5iYXNlIEBmb2xkZXJQYXRoXG4gICAgICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBuYW1lXG4gICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgIFxuICAgIGNoZWNrVHJhc2g6ICh0cmFzaEZvbGRlcikgLT5cbiAgICAgICAgXG4gICAgICAgIGZzLnJlYWRkaXIgdHJhc2hGb2xkZXIsIChlcnIsIGZpbGVzKSA9PlxuICAgICAgICAgICAgcmV0dXJuIGlmIHZhbGlkIGVyclxuICAgICAgICAgICAga2xvZyAnY2hlY2tUcmFzaCcgZmlsZXMubGVuZ3RoIFxuICAgICAgICAgICAgaWYgZmlsZXMubGVuZ3RoXG4gICAgICAgICAgICAgICAga2xvZyAnY2hlY2tUcmFzaCcgZmlsZXNcbiAgICAgICAgICAgICAgICBAZG90ID0gdXRpbHMuc3ZnIGNsc3M6J292ZXJsYXknXG4gICAgICAgICAgICAgICAgdXRpbHMuY2lyY2xlIHJhZGl1czoxMiBjbHNzOid0cmFzaERvdCcgc3ZnOkBkb3RcbiAgICAgICAgICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBAZG90XG4gICAgICAgICAgICBlbHNlIGlmIEBkb3RcbiAgICAgICAgICAgICAgICBAbWFpbi5yZW1vdmVDaGlsZCBAZG90XG4gICAgICAgICAgICAgICAgZGVsZXRlIEBkb3RcbiAgICAgICAgXG4gICAgYWRkVHJhc2g6ICh0cmFzaEZvbGRlcikgLT5cbiAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgIHRyYXNoRm9sZGVyID0gJ3NoZWxsOlJlY3ljbGVCaW5Gb2xkZXInXG4gICAgICAgIFxuICAgICAgICBAY2hlY2tUcmFzaCB0cmFzaEZvbGRlclxuICAgICAgICBcbiAgICAgICAgZnMud2F0Y2ggdHJhc2hGb2xkZXIsIChjaGFuZ2UsIGZpbGUpID0+XG4gICAgICAgICAgICBrbG9nICd3YXRjaFRyYXNoJyBjaGFuZ2UsIGZpbGUsIHRyYXNoRm9sZGVyXG4gICAgICAgICAgICBAY2hlY2tUcmFzaCB0cmFzaEZvbGRlclxuICAgICAgICBcbiAgICBzZXRJY29uOiAoaWNvblBhdGgpID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGljb25QYXRoXG4gICAgICAgIGltZyA9IGVsZW0gJ2ltZycgY2xhc3M6J2FwcGxpY29uJyBjbGljazpAb3BlbkFwcCwgc3JjOnNsYXNoLmZpbGVVcmwgaWNvblBhdGhcbiAgICAgICAgaW1nLm9uZHJhZ3N0YXJ0ID0gLT4gZmFsc2VcbiAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgaW1nXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBGb2xkZXJcbiJdfQ==
//# sourceURL=../coffee/folder.coffee
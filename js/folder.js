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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9sZGVyLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwwRkFBQTtJQUFBOzs7O0FBUUEsTUFBcUUsT0FBQSxDQUFRLEtBQVIsQ0FBckUsRUFBRSxlQUFGLEVBQVEsbUJBQVIsRUFBZ0IsaUJBQWhCLEVBQXVCLGlCQUF2QixFQUE4QixpQkFBOUIsRUFBcUMsZUFBckMsRUFBMkMsZUFBM0MsRUFBaUQsZUFBakQsRUFBdUQsV0FBdkQsRUFBMkQsV0FBM0QsRUFBK0Q7O0FBRS9ELE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFDVCxLQUFBLEdBQVMsT0FBQSxDQUFRLFNBQVI7O0FBRUg7OztJQUVDLGdCQUFDLEdBQUQ7QUFBd0IsWUFBQTtRQUF2QixJQUFDLENBQUEsa0RBQVM7Ozs7UUFBYSw0R0FBQSxTQUFBO0lBQXhCOztxQkFRSCxPQUFBLEdBQVMsU0FBQyxLQUFEO1FBRUwsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsT0FBakIsSUFBNkIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxRQUFWLENBQW1CLGNBQW5CLENBQWhDO21CQUNJLE1BQU0sQ0FBQyxRQUFQLENBQWdCLDhCQUFoQixFQURKO1NBQUEsTUFBQTttQkFHSSxJQUFBLENBQUssS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFDLENBQUEsUUFBZixDQUFMLEVBSEo7O0lBRks7O3FCQWFULFlBQUEsR0FBYyxTQUFDLFFBQUQ7QUFFVixZQUFBO1FBRlcsSUFBQyxDQUFBLFdBQUQ7UUFFWCxNQUFBLEdBQVMsS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFDLENBQUEsUUFBZjtRQUVULElBQUcsTUFBQSxLQUFVLEtBQUssQ0FBQyxPQUFOLENBQWMsR0FBZCxDQUFiO1lBQ0ksSUFBQyxDQUFBLE9BQUQsQ0FBUyxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0IsSUFBdEIsRUFBMkIsS0FBM0IsRUFB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QUQsRUFBUyxJQUFUO3VCQUFrQixLQUFDLENBQUEsVUFBRCxDQUFZLFdBQVo7WUFBbEI7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRCO0lBUk07O3FCQWdCVixPQUFBLEdBQVMsU0FBQyxRQUFEO0FBRUwsWUFBQTtRQUFBLElBQVUsQ0FBSSxRQUFkO0FBQUEsbUJBQUE7O1FBQ0EsR0FBQSxHQUFNLElBQUEsQ0FBSyxLQUFMLEVBQVc7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFVBQU47WUFBaUIsR0FBQSxFQUFJLEtBQUssQ0FBQyxPQUFOLENBQWMsUUFBZCxDQUFyQjtTQUFYO1FBQ04sR0FBRyxDQUFDLFdBQUosR0FBa0IsU0FBQTttQkFBRztRQUFIO2VBQ2xCLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixHQUFsQjtJQUxLOzs7O0dBdkZROztBQThGckIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuIyMjXG5cbnsgcG9zdCwgY2hpbGRwLCBwcmVmcywgc2xhc2gsIHZhbGlkLCBvcGVuLCBrbG9nLCBlbGVtLCBvcywgZnMsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuS2FjaGVsID0gcmVxdWlyZSAnLi9rYWNoZWwnXG51dGlscyAgPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5jbGFzcyBGb2xkZXIgZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonZm9sZGVyJykgLT4gc3VwZXJcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIG9uQ2xpY2s6IChldmVudCkgLT4gXG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMicgYW5kIEBrYWNoZWxJZC5lbmRzV2l0aCAnJFJlY3ljbGUuQmluJ1xuICAgICAgICAgICAgY2hpbGRwLmV4ZWNTeW5jIFwic3RhcnQgc2hlbGw6UmVjeWNsZUJpbkZvbGRlclwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG9wZW4gc2xhc2gudW5zbGFzaCBAa2FjaGVsSWRcbiAgICAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBvbkluaXRLYWNoZWw6IChAa2FjaGVsSWQpID0+XG4gICAgICAgIFxuICAgICAgICBmb2xkZXIgPSBzbGFzaC5yZXNvbHZlIEBrYWNoZWxJZFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBmb2xkZXIgPT0gc2xhc2gudW50aWxkZSAnfidcbiAgICAgICAgICAgIEBzZXRJY29uIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpbWcnICdob21lLnBuZydcbiAgICAgICAgZWxzZSBpZiBmb2xkZXIgPT0gc2xhc2gudW50aWxkZSAnfi8uVHJhc2gnXG4gICAgICAgICAgICBAc2V0SWNvbiBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaW1nJyAncmVjeWNsZS5wbmcnXG4gICAgICAgICAgICBAYWRkVHJhc2ggZm9sZGVyXG4gICAgICAgIGVsc2UgaWYgZm9sZGVyLmluZGV4T2YoJyRSZWN5Y2xlLkJpbicpID49IDBcbiAgICAgICAgICAgIEBzZXRJY29uIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpbWcnICdyZWN5Y2xlLnBuZydcbiAgICAgICAgICAgIEBhZGRUcmFzaCBmb2xkZXJcbiAgICAgICAgZWxzZSBpZiBmb2xkZXIgPT0gc2xhc2gudW50aWxkZSAnfi9EZXNrdG9wJ1xuICAgICAgICAgICAgQHNldEljb24gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ltZycgJ2Rlc2t0b3AucG5nJ1xuICAgICAgICBlbHNlIGlmIGZvbGRlciA9PSBzbGFzaC51bnRpbGRlICd+L0Rvd25sb2FkcydcbiAgICAgICAgICAgIEBzZXRJY29uIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpbWcnICdkb3dubG9hZHMucG5nJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2V0SWNvbiBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaW1nJyAnZm9sZGVyLnBuZydcbiAgICBcbiAgICAgICAgICAgIG5hbWUgPSBlbGVtICdkaXYnIGNsYXNzOidmb2xkZXJuYW1lJyB0ZXh0OnNsYXNoLmJhc2UgZm9sZGVyXG4gICAgICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBuYW1lXG4gICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBjaGVja1RyYXNoOiAodHJhc2hGb2xkZXIpIC0+XG4gICAgICAgIFxuICAgICAgICBmcy5yZWFkZGlyIHRyYXNoRm9sZGVyLCAoZXJyLCBmaWxlcykgPT5cbiAgICAgICAgICAgIHJldHVybiBpZiB2YWxpZCBlcnJcbiAgICAgICAgICAgIGlmIGZpbGVzLmxlbmd0aFxuICAgICAgICAgICAgICAgIEBkb3QgPSB1dGlscy5zdmcgY2xzczonb3ZlcmxheSdcbiAgICAgICAgICAgICAgICB1dGlscy5jaXJjbGUgcmFkaXVzOjEyIGNsc3M6J3RyYXNoRG90JyBzdmc6QGRvdFxuICAgICAgICAgICAgICAgIEBtYWluLmFwcGVuZENoaWxkIEBkb3RcbiAgICAgICAgICAgIGVsc2UgaWYgQGRvdFxuICAgICAgICAgICAgICAgIEBtYWluLnJlbW92ZUNoaWxkIEBkb3RcbiAgICAgICAgICAgICAgICBkZWxldGUgQGRvdFxuICAgICAgICBcbiAgICBvbkNvbnRleHRNZW51OiA9PiBcbiAgICAgICAgXG4gICAgICAgIGlmIEBpc1RyYXNoXG4gICAgICAgICAgICBlbXB0eVRyYXNoID0gcmVxdWlyZSAnZW1wdHktdHJhc2gnXG4gICAgICAgICAgICBlbXB0eVRyYXNoKClcbiAgICAgICAgICAgICAgICBcbiAgICBhZGRUcmFzaDogKHRyYXNoRm9sZGVyKSAtPlxuICAgICAgICAgICAgXG4gICAgICAgIEBpc1RyYXNoID0gdHJ1ZVxuICAgICAgICAjIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgIyB0cmFzaEZvbGRlciA9ICdzaGVsbDpSZWN5Y2xlQmluRm9sZGVyJ1xuICAgICAgICBcbiAgICAgICAgQGNoZWNrVHJhc2ggdHJhc2hGb2xkZXJcbiAgICAgICAgXG4gICAgICAgIGZzLndhdGNoIHRyYXNoRm9sZGVyLCAoY2hhbmdlLCBmaWxlKSA9PiBAY2hlY2tUcmFzaCB0cmFzaEZvbGRlclxuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBzZXRJY29uOiAoaWNvblBhdGgpID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGljb25QYXRoXG4gICAgICAgIGltZyA9IGVsZW0gJ2ltZycgY2xhc3M6J2FwcGxpY29uJyBzcmM6c2xhc2guZmlsZVVybCBpY29uUGF0aFxuICAgICAgICBpbWcub25kcmFnc3RhcnQgPSAtPiBmYWxzZVxuICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBpbWdcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEZvbGRlclxuIl19
//# sourceURL=../coffee/folder.coffee
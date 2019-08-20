// koffee 1.4.0

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
            return open(slash.unslash(this.kachelId));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9sZGVyLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSx1SEFBQTtJQUFBOzs7O0FBUUEsTUFBNkYsT0FBQSxDQUFRLEtBQVIsQ0FBN0YsRUFBRSxlQUFGLEVBQVEsbUJBQVIsRUFBZ0IsaUJBQWhCLEVBQXVCLGlCQUF2QixFQUE4QixpQkFBOUIsRUFBcUMsdUJBQXJDLEVBQStDLHlCQUEvQyxFQUEwRCxlQUExRCxFQUFnRSxlQUFoRSxFQUFzRSxlQUF0RSxFQUE0RSxXQUE1RSxFQUFnRixXQUFoRixFQUFvRixTQUFwRixFQUF1Rjs7QUFFdkYsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztBQUNULEtBQUEsR0FBUyxPQUFBLENBQVEsU0FBUjs7QUFDVCxHQUFBLEdBQVMsT0FBQSxDQUFRLEtBQVI7O0FBRUg7OztJQUVDLGdCQUFDLEdBQUQ7QUFBd0IsWUFBQTtRQUF2QixJQUFDLENBQUEsa0RBQVM7Ozs7OztRQUFhLDRHQUFBLFNBQUE7SUFBeEI7O3FCQVFILFdBQUEsR0FBYSxTQUFDLEtBQUQ7UUFFVCxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixPQUFqQixJQUE2QixJQUFDLENBQUEsUUFBUSxDQUFDLFFBQVYsQ0FBbUIsY0FBbkIsQ0FBaEM7bUJBQ0ksTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsOEJBQWhCLEVBREo7U0FBQSxNQUFBO21CQUdJLElBQUEsQ0FBSyxLQUFLLENBQUMsT0FBTixDQUFjLElBQUMsQ0FBQSxRQUFmLENBQUwsRUFISjs7SUFGUzs7cUJBYWIsWUFBQSxHQUFjLFNBQUMsUUFBRDtBQUVWLFlBQUE7UUFGVyxJQUFDLENBQUEsV0FBRDtRQUVYLE1BQUEsR0FBUyxLQUFLLENBQUMsT0FBTixDQUFjLElBQUMsQ0FBQSxRQUFmO1FBRVQsSUFBRyxNQUFBLEtBQVUsS0FBSyxDQUFDLE9BQU4sQ0FBYyxHQUFkLENBQWI7WUFDSSxJ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QWUsU0FBQTtRQUVYLElBQUcsSUFBQyxDQUFBLE9BQUo7WUFDSSxJQUFDLENBQUEsWUFBRCxDQUFjLENBQWQ7bUJBQ0EsR0FBQSxDQUFJLE9BQUosRUFBWSxPQUFaLEVBRko7O0lBRlc7O3FCQU1mLFFBQUEsR0FBVSxTQUFDLFdBQUQ7UUFFTixJQUFDLENBQUEsT0FBRCxHQUFXO1FBRVgsSUFBQyxDQUFBLFVBQUQsQ0FBWSxXQUFaO2VBRUEsV0FBQSxDQUFZLElBQUMsQ0FBQSxVQUFiLEVBQXlCLElBQXpCO0lBTk07Ozs7R0FuRk87O0FBMkZyQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMCAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIyNcblxueyBwb3N0LCBjaGlsZHAsIHByZWZzLCBzbGFzaCwgdmFsaWQsIG9zYXNwYXduLCBvc2FzY3JpcHQsIG9wZW4sIGtsb2csIGVsZW0sIG9zLCBmcywgJCwgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5LYWNoZWwgPSByZXF1aXJlICcuL2thY2hlbCdcbnV0aWxzICA9IHJlcXVpcmUgJy4vdXRpbHMnXG53eHcgICAgPSByZXF1aXJlICd3eHcnXG5cbmNsYXNzIEZvbGRlciBleHRlbmRzIEthY2hlbFxuICAgICAgICBcbiAgICBAOiAoQGthY2hlbElkOidmb2xkZXInKSAtPiBzdXBlclxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgb25MZWZ0Q2xpY2s6IChldmVudCkgLT4gXG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMicgYW5kIEBrYWNoZWxJZC5lbmRzV2l0aCAnJFJlY3ljbGUuQmluJ1xuICAgICAgICAgICAgY2hpbGRwLmV4ZWNTeW5jIFwic3RhcnQgc2hlbGw6UmVjeWNsZUJpbkZvbGRlclwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG9wZW4gc2xhc2gudW5zbGFzaCBAa2FjaGVsSWRcbiAgICAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBvbkluaXRLYWNoZWw6IChAa2FjaGVsSWQpID0+XG4gICAgICAgIFxuICAgICAgICBmb2xkZXIgPSBzbGFzaC5yZXNvbHZlIEBrYWNoZWxJZFxuICAgICAgICBcbiAgICAgICAgaWYgZm9sZGVyID09IHNsYXNoLnVudGlsZGUgJ34nXG4gICAgICAgICAgICBAc2V0SWNvbiBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaW1nJyAnaG9tZS5wbmcnXG4gICAgICAgIGVsc2UgaWYgZm9sZGVyID09IHNsYXNoLnVudGlsZGUgJ34vLlRyYXNoJ1xuICAgICAgICAgICAgQHNldEljb24gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ljb25zJyAncmVjeWNsZS5wbmcnXG4gICAgICAgICAgICBAYWRkVHJhc2ggZm9sZGVyXG4gICAgICAgIGVsc2UgaWYgZm9sZGVyLmluZGV4T2YoJyRSZWN5Y2xlLkJpbicpID49IDBcbiAgICAgICAgICAgIEBzZXRJY29uIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpY29ucycgJ3JlY3ljbGUucG5nJ1xuICAgICAgICAgICAgQGFkZFRyYXNoIGZvbGRlclxuICAgICAgICBlbHNlIGlmIGZvbGRlciA9PSBzbGFzaC51bnRpbGRlICd+L0Rlc2t0b3AnXG4gICAgICAgICAgICBAc2V0SWNvbiBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaW1nJyAnZGVza3RvcC5wbmcnXG4gICAgICAgIGVsc2UgaWYgZm9sZGVyID09IHNsYXNoLnVudGlsZGUgJ34vRG93bmxvYWRzJ1xuICAgICAgICAgICAgQHNldEljb24gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ltZycgJ2Rvd25sb2Fkcy5wbmcnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBwbGFpbkZvbGRlciA9IHRydWVcbiAgICAgICAgICAgIEBvbkJvdW5kcygpXG4gICAgICAgIFxuICAgICAgICBzdXBlciBAa2FjaGVsSWRcbiAgICAgICAgXG4gICAgb25Cb3VuZHM6ID0+XG4gICAgICAgIFxuICAgICAgICBpZiBAcGxhaW5Gb2xkZXIgYW5kIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBAbWFpbi5pbm5lckhUTUwgPSAnJ1xuICAgICAgICAgICAgQHNldEljb24gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ltZycgJ2ZvbGRlci5wbmcnXG4gICAgXG4gICAgICAgICAgICAkKCcuYXBwbGljb24nKS5jbGFzc0xpc3QuYWRkICdmb2xkZXJpY29uJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBuYW1lID0gZWxlbSAnZGl2JyBjbGFzczonZm9sZGVybmFtZScgdGV4dDpzbGFzaC5iYXNlIEBrYWNoZWxJZFxuICAgICAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgbmFtZVxuICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBzaG93VHJhc2hEb3Q6IChjb3VudCkgPT5cbiAgICAgICAgXG4gICAgICAgIGlmIHBhcnNlSW50IGNvdW50XG4gICAgICAgICAgICBpZiBub3QgQGRvdFxuICAgICAgICAgICAgICAgIEBzZXRJY29uIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpY29ucycgJ3JlY3ljbGVkb3QucG5nJ1xuICAgICAgICAgICAgICAgIEBkb3QgPSB0cnVlXG4gICAgICAgIGVsc2UgaWYgQGRvdFxuICAgICAgICAgICAgQHNldEljb24gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ljb25zJyAncmVjeWNsZS5wbmcnXG4gICAgICAgICAgICBAZG90ID0gZmFsc2VcbiAgICBcbiAgICBjaGVja1RyYXNoOiAodHJhc2hGb2xkZXIpID0+XG4gICAgICAgIFxuICAgICAgICBAc2hvd1RyYXNoRG90IHd4dyAndHJhc2gnICdjb3VudCdcbiAgICAgICAgXG4gICAgb25Db250ZXh0TWVudTogPT4gXG4gICAgICAgIFxuICAgICAgICBpZiBAaXNUcmFzaFxuICAgICAgICAgICAgQHNob3dUcmFzaERvdCAwXG4gICAgICAgICAgICB3eHcgJ3RyYXNoJyAnZW1wdHknXG4gICAgICAgICAgICAgICAgXG4gICAgYWRkVHJhc2g6ICh0cmFzaEZvbGRlcikgLT5cbiAgICAgICAgICAgIFxuICAgICAgICBAaXNUcmFzaCA9IHRydWVcbiAgICAgICAgXG4gICAgICAgIEBjaGVja1RyYXNoIHRyYXNoRm9sZGVyXG4gICAgICAgIFxuICAgICAgICBzZXRJbnRlcnZhbCBAY2hlY2tUcmFzaCwgMjAwMFxuICAgICAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBGb2xkZXJcbiJdfQ==
//# sourceURL=../coffee/folder.coffee
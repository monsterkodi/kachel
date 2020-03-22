// koffee 1.12.0

/*
00000000   0000000   000      0000000    00000000  00000000   
000       000   000  000      000   000  000       000   000  
000000    000   000  000      000   000  0000000   0000000    
000       000   000  000      000   000  000       000   000  
000        0000000   0000000  0000000    00000000  000   000
 */
var $, Folder, Kachel, _, childp, elem, open, os, ref, slash, utils, wxw,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), $ = ref.$, _ = ref._, childp = ref.childp, elem = ref.elem, open = ref.open, os = ref.os, slash = ref.slash;

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
        _;
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Folder.__super__.constructor.apply(this, arguments);
    }

    Folder.prototype.onLeftClick = function(event) {
        if (os.platform() === 'win32' && this.kachelId.endsWith('$Recycle.Bin')) {
            return childp.execSync("start shell:RecycleBinFolder");
        } else {
            if (os.platform() === 'win32' && slash.isFile(slash.resolve('~/s/keks/keks-win32-x64/keks.exe'))) {
                childp.spawn(slash.resolve('~/s/keks/keks-win32-x64/keks.exe'), [this.kachelId]);
                return wxw('focus', 'keks');
            } else if (os.platform() === 'darwin' && slash.isFile(slash.resolve('~/s/keks/keks-darwin-x64/keks.app/Contents/MacOS/keks'))) {
                return childp.spawn(slash.resolve('~/s/keks/keks-darwin-x64/keks.app/Contents/MacOS/keks'), ['--', this.kachelId]);
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
        if (this.plainFolder) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9sZGVyLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsiZm9sZGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxvRUFBQTtJQUFBOzs7O0FBUUEsTUFBMEMsT0FBQSxDQUFRLEtBQVIsQ0FBMUMsRUFBRSxTQUFGLEVBQUssU0FBTCxFQUFRLG1CQUFSLEVBQWdCLGVBQWhCLEVBQXNCLGVBQXRCLEVBQTRCLFdBQTVCLEVBQWdDOztBQUVoQyxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0FBQ1QsS0FBQSxHQUFTLE9BQUEsQ0FBUSxTQUFSOztBQUNULEdBQUEsR0FBUyxPQUFBLENBQVEsS0FBUjs7QUFFSDs7O0lBRUMsZ0JBQUMsR0FBRDtBQUNDLFlBQUE7UUFEQSxJQUFDLENBQUEsa0RBQVM7Ozs7OztRQUNWO1FBQ0EsNEdBQUEsU0FBQTtJQUZEOztxQkFVSCxXQUFBLEdBQWEsU0FBQyxLQUFEO1FBRVQsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsT0FBakIsSUFBNkIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxRQUFWLENBQW1CLGNBQW5CLENBQWhDO21CQUNJLE1BQU0sQ0FBQyxRQUFQLENBQWdCLDhCQUFoQixFQURKO1NBQUEsTUFBQTtZQUdJLElBQUcsRUFBRSxDQUFDLFFBQUgsQ0FBQSxDQUFBLEtBQWlCLE9BQWpCLElBQTZCLEtBQUssQ0FBQyxNQUFOLENBQWEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxrQ0FBZCxDQUFiLENBQWhDO2dCQUNJLE1BQU0sQ0FBQyxLQUFQLENBQWEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxrQ0FBZCxDQUFiLEVBQWdFLENBQUMsSUFBQyxDQUFBLFFBQUYsQ0FBaEU7dUJBQ0EsR0FBQSxDQUFJLE9BQUosRUFBWSxNQUFaLEVBRko7YUFBQSxNQUdLLElBQUcsRUFBRSxDQUFDLFFBQUgsQ0FBQSxDQUFBLEtBQWlCLFFBQWpCLElBQThCLEtBQUss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SyxDQUFDLElBQU4sQ0FBVyxTQUFYLEVBQXNCLElBQXRCLEVBQTJCLE9BQTNCLEVBQW1DLGdCQUFuQyxDQUFUO3VCQUNBLElBQUMsQ0FBQSxHQUFELEdBQU8sS0FGWDthQURKO1NBQUEsTUFJSyxJQUFHLElBQUMsQ0FBQSxHQUFKO1lBQ0QsSUFBQyxDQUFBLE9BQUQsQ0FBUyxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0IsSUFBdEIsRUFBMkIsT0FBM0IsRUFBbUMsYUFBbkMsQ0FBVDttQkFDQSxJQUFDLENBQUEsR0FBRCxHQUFPLE1BRk47O0lBTks7O3FCQVVkLFVBQUEsR0FBWSxTQUFDLFdBQUQ7ZUFFUixJQUFDLENBQUEsWUFBRCxDQUFjLEdBQUEsQ0FBSSxPQUFKLEVBQVksT0FBWixDQUFkO0lBRlE7O3FCQUlaLGFBQUEsR0FBZSxTQUFBO1FBRVgsSUFBRyxJQUFDLENBQUEsT0FBSjtZQUNJLElBQUMsQ0FBQSxZQUFELENBQWMsQ0FBZDttQkFDQSxHQUFBLENBQUksT0FBSixFQUFZLE9BQVosRUFGSjs7SUFGVzs7cUJBTWYsUUFBQSxHQUFVLFNBQUMsV0FBRDtRQUVOLElBQUMsQ0FBQSxPQUFELEdBQVc7UUFFWCxJQUFDLENBQUEsVUFBRCxDQUFZLFdBQVo7ZUFFQSxXQUFBLENBQVksSUFBQyxDQUFBLFVBQWIsRUFBeUIsSUFBekI7SUFOTTs7OztHQTNGTzs7QUFtR3JCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiMjI1xuXG57ICQsIF8sIGNoaWxkcCwgZWxlbSwgb3Blbiwgb3MsIHNsYXNoIH0gPSByZXF1aXJlICdreGsnXG5cbkthY2hlbCA9IHJlcXVpcmUgJy4va2FjaGVsJ1xudXRpbHMgID0gcmVxdWlyZSAnLi91dGlscydcbnd4dyAgICA9IHJlcXVpcmUgJ3d4dydcblxuY2xhc3MgRm9sZGVyIGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J2ZvbGRlcicpIC0+IFxuICAgICAgICBfXG4gICAgICAgIHN1cGVyXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBvbkxlZnRDbGljazogKGV2ZW50KSAtPiBcbiAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJyBhbmQgQGthY2hlbElkLmVuZHNXaXRoICckUmVjeWNsZS5CaW4nXG4gICAgICAgICAgICBjaGlsZHAuZXhlY1N5bmMgXCJzdGFydCBzaGVsbDpSZWN5Y2xlQmluRm9sZGVyXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInIGFuZCBzbGFzaC5pc0ZpbGUgc2xhc2gucmVzb2x2ZSAnfi9zL2tla3Mva2Vrcy13aW4zMi14NjQva2Vrcy5leGUnXG4gICAgICAgICAgICAgICAgY2hpbGRwLnNwYXduIHNsYXNoLnJlc29sdmUoJ34vcy9rZWtzL2tla3Mtd2luMzIteDY0L2tla3MuZXhlJyksIFtAa2FjaGVsSWRdXG4gICAgICAgICAgICAgICAgd3h3ICdmb2N1cycgJ2tla3MnXG4gICAgICAgICAgICBlbHNlIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ2RhcndpbicgYW5kIHNsYXNoLmlzRmlsZSBzbGFzaC5yZXNvbHZlICd+L3Mva2Vrcy9rZWtzLWRhcndpbi14NjQva2Vrcy5hcHAvQ29udGVudHMvTWFjT1Mva2VrcydcbiAgICAgICAgICAgICAgICBjaGlsZHAuc3Bhd24gc2xhc2gucmVzb2x2ZSgnfi9zL2tla3Mva2Vrcy1kYXJ3aW4teDY0L2tla3MuYXBwL0NvbnRlbnRzL01hY09TL2tla3MnKSwgWyctLScgQGthY2hlbElkXVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG9wZW4gc2xhc2gudW5zbGFzaCBAa2FjaGVsSWRcbiAgICAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBvbkluaXRLYWNoZWw6IChAa2FjaGVsSWQpID0+XG4gICAgICAgIFxuICAgICAgICBmb2xkZXIgPSBzbGFzaC5yZXNvbHZlIEBrYWNoZWxJZFxuICAgICAgICBcbiAgICAgICAgaWYgZm9sZGVyID09IHNsYXNoLnVudGlsZGUgJ34nXG4gICAgICAgICAgICBAc2V0SWNvbiBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaW1nJyAnaG9tZS5wbmcnXG4gICAgICAgIGVsc2UgaWYgZm9sZGVyID09IHNsYXNoLnVudGlsZGUgJ34vLlRyYXNoJ1xuICAgICAgICAgICAgQHNldEljb24gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ljb25zJyAncmVjeWNsZS5wbmcnXG4gICAgICAgICAgICBAYWRkVHJhc2ggZm9sZGVyXG4gICAgICAgIGVsc2UgaWYgZm9sZGVyLmluZGV4T2YoJyRSZWN5Y2xlLkJpbicpID49IDBcbiAgICAgICAgICAgIEBzZXRJY29uIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpY29ucycgJ3JlY3ljbGUucG5nJ1xuICAgICAgICAgICAgQGFkZFRyYXNoIGZvbGRlclxuICAgICAgICBlbHNlIGlmIGZvbGRlciA9PSBzbGFzaC51bnRpbGRlICd+L0Rlc2t0b3AnXG4gICAgICAgICAgICBAc2V0SWNvbiBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaW1nJyAnZGVza3RvcC5wbmcnXG4gICAgICAgIGVsc2UgaWYgZm9sZGVyID09IHNsYXNoLnVudGlsZGUgJ34vRG93bmxvYWRzJ1xuICAgICAgICAgICAgQHNldEljb24gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ltZycgJ2Rvd25sb2Fkcy5wbmcnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBwbGFpbkZvbGRlciA9IHRydWVcbiAgICAgICAgICAgIEBvbkJvdW5kcygpXG4gICAgICAgIFxuICAgICAgICBzdXBlciBAa2FjaGVsSWRcbiAgICAgICAgXG4gICAgb25Cb3VuZHM6ID0+XG4gICAgICAgIFxuICAgICAgICBpZiBAcGxhaW5Gb2xkZXJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQG1haW4uaW5uZXJIVE1MID0gJydcbiAgICAgICAgICAgIEBzZXRJY29uIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpbWcnICdmb2xkZXIucG5nJ1xuICAgIFxuICAgICAgICAgICAgJCgnLmFwcGxpY29uJykuY2xhc3NMaXN0LmFkZCAnZm9sZGVyaWNvbidcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbmFtZSA9IGVsZW0gJ2RpdicgY2xhc3M6J2ZvbGRlcm5hbWUnIHRleHQ6c2xhc2guYmFzZSBAa2FjaGVsSWRcbiAgICAgICAgICAgIEBtYWluLmFwcGVuZENoaWxkIG5hbWVcbiAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgc2hvd1RyYXNoRG90OiAoY291bnQpID0+XG4gICAgICAgIFxuICAgICAgICBpZiBwYXJzZUludCBjb3VudFxuICAgICAgICAgICAgaWYgbm90IEBkb3RcbiAgICAgICAgICAgICAgICBAc2V0SWNvbiBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaWNvbnMnICdyZWN5Y2xlZG90LnBuZydcbiAgICAgICAgICAgICAgICBAZG90ID0gdHJ1ZVxuICAgICAgICBlbHNlIGlmIEBkb3RcbiAgICAgICAgICAgIEBzZXRJY29uIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpY29ucycgJ3JlY3ljbGUucG5nJ1xuICAgICAgICAgICAgQGRvdCA9IGZhbHNlXG4gICAgXG4gICAgY2hlY2tUcmFzaDogKHRyYXNoRm9sZGVyKSA9PlxuICAgICAgICBcbiAgICAgICAgQHNob3dUcmFzaERvdCB3eHcgJ3RyYXNoJyAnY291bnQnXG4gICAgICAgIFxuICAgIG9uQ29udGV4dE1lbnU6ID0+IFxuICAgICAgICBcbiAgICAgICAgaWYgQGlzVHJhc2hcbiAgICAgICAgICAgIEBzaG93VHJhc2hEb3QgMFxuICAgICAgICAgICAgd3h3ICd0cmFzaCcgJ2VtcHR5J1xuICAgICAgICAgICAgICAgIFxuICAgIGFkZFRyYXNoOiAodHJhc2hGb2xkZXIpIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgQGlzVHJhc2ggPSB0cnVlXG4gICAgICAgIFxuICAgICAgICBAY2hlY2tUcmFzaCB0cmFzaEZvbGRlclxuICAgICAgICBcbiAgICAgICAgc2V0SW50ZXJ2YWwgQGNoZWNrVHJhc2gsIDIwMDBcbiAgICAgICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gRm9sZGVyXG4iXX0=
//# sourceURL=../coffee/folder.coffee
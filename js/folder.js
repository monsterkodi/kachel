// koffee 1.3.0

/*
00000000   0000000   000      0000000    00000000  00000000   
000       000   000  000      000   000  000       000   000  
000000    000   000  000      000   000  0000000   0000000    
000       000   000  000      000   000  000       000   000  
000        0000000   0000000  0000000    00000000  000   000
 */
var Folder, Kachel, _, childp, elem, fs, klog, open, os, osascript, osaspawn, post, prefs, ref, slash, utils, valid, wxw,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, childp = ref.childp, prefs = ref.prefs, slash = ref.slash, valid = ref.valid, osaspawn = ref.osaspawn, osascript = ref.osascript, open = ref.open, klog = ref.klog, elem = ref.elem, os = ref.os, fs = ref.fs, _ = ref._;

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
        var folder, name;
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
            this.setIcon(slash.join(__dirname, '..', 'img', 'folder.png'));
            name = elem('div', {
                "class": 'foldername',
                text: slash.base(folder)
            });
            this.main.appendChild(name);
        }
        return Folder.__super__.onInitKachel.call(this, this.kachelId);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9sZGVyLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxvSEFBQTtJQUFBOzs7O0FBUUEsTUFBMEYsT0FBQSxDQUFRLEtBQVIsQ0FBMUYsRUFBRSxlQUFGLEVBQVEsbUJBQVIsRUFBZ0IsaUJBQWhCLEVBQXVCLGlCQUF2QixFQUE4QixpQkFBOUIsRUFBcUMsdUJBQXJDLEVBQStDLHlCQUEvQyxFQUEwRCxlQUExRCxFQUFnRSxlQUFoRSxFQUFzRSxlQUF0RSxFQUE0RSxXQUE1RSxFQUFnRixXQUFoRixFQUFvRjs7QUFFcEYsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztBQUNULEtBQUEsR0FBUyxPQUFBLENBQVEsU0FBUjs7QUFDVCxHQUFBLEdBQVMsT0FBQSxDQUFRLEtBQVI7O0FBRUg7OztJQUVDLGdCQUFDLEdBQUQ7QUFBd0IsWUFBQTtRQUF2QixJQUFDLENBQUEsa0RBQVM7Ozs7O1FBQWEsNEdBQUEsU0FBQTtJQUF4Qjs7cUJBUUgsV0FBQSxHQUFhLFNBQUMsS0FBRDtRQUVULElBQUcsRUFBRSxDQUFDLFFBQUgsQ0FBQSxDQUFBLEtBQWlCLE9BQWpCLElBQTZCLElBQUMsQ0FBQSxRQUFRLENBQUMsUUFBVixDQUFtQixjQUFuQixDQUFoQzttQkFDSSxNQUFNLENBQUMsUUFBUCxDQUFnQiw4QkFBaEIsRUFESjtTQUFBLE1BQUE7bUJBR0ksSUFBQSxDQUFLLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBQyxDQUFBLFFBQWYsQ0FBTCxFQUhKOztJQUZTOztxQkFhYixZQUFBLEdBQWMsU0FBQyxRQUFEO0FBRVYsWUFBQTtRQUZXLElBQUMsQ0FBQSxXQUFEO1FBRVgsTUFBQSxHQUFTLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBQyxDQUFBLFFBQWY7UUFFVCxJQUFHLE1BQUEsS0FBVSxLQUFLLENBQUMsT0FBTixDQUFjLEdBQWQsQ0FBYjtZQUNJLElBQUMsQ0FBQSxPQUFE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Q29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuIyMjXG5cbnsgcG9zdCwgY2hpbGRwLCBwcmVmcywgc2xhc2gsIHZhbGlkLCBvc2FzcGF3biwgb3Nhc2NyaXB0LCBvcGVuLCBrbG9nLCBlbGVtLCBvcywgZnMsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuS2FjaGVsID0gcmVxdWlyZSAnLi9rYWNoZWwnXG51dGlscyAgPSByZXF1aXJlICcuL3V0aWxzJ1xud3h3ICAgID0gcmVxdWlyZSAnd3h3J1xuXG5jbGFzcyBGb2xkZXIgZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonZm9sZGVyJykgLT4gc3VwZXJcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIG9uTGVmdENsaWNrOiAoZXZlbnQpIC0+IFxuICAgICAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInIGFuZCBAa2FjaGVsSWQuZW5kc1dpdGggJyRSZWN5Y2xlLkJpbidcbiAgICAgICAgICAgIGNoaWxkcC5leGVjU3luYyBcInN0YXJ0IHNoZWxsOlJlY3ljbGVCaW5Gb2xkZXJcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvcGVuIHNsYXNoLnVuc2xhc2ggQGthY2hlbElkXG4gICAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgb25Jbml0S2FjaGVsOiAoQGthY2hlbElkKSA9PlxuICAgICAgICBcbiAgICAgICAgZm9sZGVyID0gc2xhc2gucmVzb2x2ZSBAa2FjaGVsSWRcbiAgICAgICAgXG4gICAgICAgIGlmIGZvbGRlciA9PSBzbGFzaC51bnRpbGRlICd+J1xuICAgICAgICAgICAgQHNldEljb24gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ltZycgJ2hvbWUucG5nJ1xuICAgICAgICBlbHNlIGlmIGZvbGRlciA9PSBzbGFzaC51bnRpbGRlICd+Ly5UcmFzaCdcbiAgICAgICAgICAgIEBzZXRJY29uIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpY29ucycgJ3JlY3ljbGUucG5nJ1xuICAgICAgICAgICAgQGFkZFRyYXNoIGZvbGRlclxuICAgICAgICBlbHNlIGlmIGZvbGRlci5pbmRleE9mKCckUmVjeWNsZS5CaW4nKSA+PSAwXG4gICAgICAgICAgICBAc2V0SWNvbiBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaWNvbnMnICdyZWN5Y2xlLnBuZydcbiAgICAgICAgICAgIEBhZGRUcmFzaCBmb2xkZXJcbiAgICAgICAgZWxzZSBpZiBmb2xkZXIgPT0gc2xhc2gudW50aWxkZSAnfi9EZXNrdG9wJ1xuICAgICAgICAgICAgQHNldEljb24gc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ltZycgJ2Rlc2t0b3AucG5nJ1xuICAgICAgICBlbHNlIGlmIGZvbGRlciA9PSBzbGFzaC51bnRpbGRlICd+L0Rvd25sb2FkcydcbiAgICAgICAgICAgIEBzZXRJY29uIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpbWcnICdkb3dubG9hZHMucG5nJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2V0SWNvbiBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaW1nJyAnZm9sZGVyLnBuZydcbiAgICBcbiAgICAgICAgICAgIG5hbWUgPSBlbGVtICdkaXYnIGNsYXNzOidmb2xkZXJuYW1lJyB0ZXh0OnNsYXNoLmJhc2UgZm9sZGVyXG4gICAgICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBuYW1lXG4gICAgICAgIFxuICAgICAgICBzdXBlciBAa2FjaGVsSWRcbiAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgc2hvd1RyYXNoRG90OiAoY291bnQpID0+XG4gICAgICAgIFxuICAgICAgICBpZiBwYXJzZUludCBjb3VudFxuICAgICAgICAgICAgaWYgbm90IEBkb3RcbiAgICAgICAgICAgICAgICBAc2V0SWNvbiBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaWNvbnMnICdyZWN5Y2xlZG90LnBuZydcbiAgICAgICAgICAgICAgICBAZG90ID0gdHJ1ZVxuICAgICAgICBlbHNlIGlmIEBkb3RcbiAgICAgICAgICAgIEBzZXRJY29uIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdpY29ucycgJ3JlY3ljbGUucG5nJ1xuICAgICAgICAgICAgQGRvdCA9IGZhbHNlXG4gICAgXG4gICAgY2hlY2tUcmFzaDogKHRyYXNoRm9sZGVyKSA9PlxuICAgICAgICBcbiAgICAgICAgQHNob3dUcmFzaERvdCB3eHcgJ3RyYXNoJyAnY291bnQnXG4gICAgICAgIFxuICAgIG9uQ29udGV4dE1lbnU6ID0+IFxuICAgICAgICBcbiAgICAgICAgaWYgQGlzVHJhc2hcbiAgICAgICAgICAgIEBzaG93VHJhc2hEb3QgMFxuICAgICAgICAgICAgd3h3ICd0cmFzaCcgJ2VtcHR5J1xuICAgICAgICAgICAgICAgIFxuICAgIGFkZFRyYXNoOiAodHJhc2hGb2xkZXIpIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgQGlzVHJhc2ggPSB0cnVlXG4gICAgICAgIFxuICAgICAgICBAY2hlY2tUcmFzaCB0cmFzaEZvbGRlclxuICAgICAgICBcbiAgICAgICAgc2V0SW50ZXJ2YWwgQGNoZWNrVHJhc2gsIDIwMDBcbiAgICAgICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gRm9sZGVyXG4iXX0=
//# sourceURL=../coffee/folder.coffee
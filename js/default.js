// koffee 1.3.0

/*
0000000    00000000  00000000   0000000   000   000  000    000000000  
000   000  000       000       000   000  000   000  000       000     
000   000  0000000   000000    000000000  000   000  000       000     
000   000  000       000       000   000  000   000  000       000     
0000000    00000000  000       000   000   0000000   0000000   000
 */
var Default, Kachel, _, electron, elem, klog, os, post, ref, slash,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, slash = ref.slash, klog = ref.klog, elem = ref.elem, os = ref.os, _ = ref._;

electron = require('electron');

Kachel = require('./kachel');

Default = (function(superClass) {
    extend(Default, superClass);

    function Default(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'default';
        this.appsChosen = bind(this.appsChosen, this);
        this.openApp = bind(this.openApp, this);
        this.dirsChosen = bind(this.dirsChosen, this);
        this.openFolder = bind(this.openFolder, this);
        this.onClick = bind(this.onClick, this);
        this.openInfo = bind(this.openInfo, this);
        this.openClock = bind(this.openClock, this);
        this.onLoad = bind(this.onLoad, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Default.__super__.constructor.apply(this, arguments);
    }

    Default.prototype.onLoad = function() {
        var child, children, grid, i, len;
        children = [
            elem('img', {
                "class": 'grid2x2_11',
                click: this.openApp,
                src: __dirname + '/../img/app.png'
            }), elem('img', {
                "class": 'grid2x2_12',
                click: this.openFolder,
                src: __dirname + '/../img/folder.png'
            }), elem('img', {
                "class": 'grid2x2_21',
                click: this.openInfo,
                src: __dirname + '/../img/info.png'
            }), elem('img', {
                "class": 'grid2x2_22',
                click: this.openClock,
                src: __dirname + '/../img/clock.png'
            })
        ];
        for (i = 0, len = children.length; i < len; i++) {
            child = children[i];
            child.ondragstart = function() {
                return false;
            };
        }
        grid = elem('div', {
            "class": 'grid2x2',
            children: children
        });
        return this.main.appendChild(grid);
    };

    Default.prototype.openClock = function() {
        return post.toMain('newKachel', {
            html: 'clock'
        });
    };

    Default.prototype.openInfo = function() {
        return post.toMain('newKachel', {
            html: 'sysinfo',
            winId: this.win.id
        });
    };

    Default.prototype.onClick = function() {
        return console.log('onClick');
    };

    Default.prototype.openFolder = function() {
        var dir;
        dir = slash.untilde('~');
        return electron.remote.dialog.showOpenDialog({
            title: "Open Folder",
            defaultPath: dir,
            properties: ['openDirectory', 'multiSelections']
        }, this.dirsChosen);
    };

    Default.prototype.dirsChosen = function(files) {
        var file, i, len, results;
        if (!files) {
            return;
        }
        if (!files instanceof Array) {
            files = [files];
        }
        results = [];
        for (i = 0, len = files.length; i < len; i++) {
            file = files[i];
            results.push(this.dirChosen(file));
        }
        return results;
    };

    Default.prototype.dirChosen = function(file) {
        file = slash.path(file);
        return post.toMain('newKachel', {
            html: 'folder',
            data: {
                folder: file
            }
        });
    };

    Default.prototype.openApp = function() {
        var dir;
        dir = slash.win() && 'C:/Program Files/' || '/Applications';
        return electron.remote.dialog.showOpenDialog({
            title: "Open Application",
            defaultPath: dir,
            properties: ['openFile', 'multiSelections']
        }, this.appsChosen);
    };

    Default.prototype.appsChosen = function(files) {
        var file, i, len, results;
        if (!files) {
            return;
        }
        if (!files instanceof Array) {
            files = [files];
        }
        results = [];
        for (i = 0, len = files.length; i < len; i++) {
            file = files[i];
            results.push(this.appChosen(file));
        }
        return results;
    };

    Default.prototype.appChosen = function(file) {
        file = slash.removeDrive(slash.path(file));
        return post.toMain('newKachel', {
            html: 'appl',
            data: {
                app: file
            }
        });
    };

    return Default;

})(Kachel);

module.exports = Default;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsOERBQUE7SUFBQTs7OztBQVFBLE1BQXFDLE9BQUEsQ0FBUSxLQUFSLENBQXJDLEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWUsZUFBZixFQUFxQixlQUFyQixFQUEyQixXQUEzQixFQUErQjs7QUFFL0IsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFFSDs7O0lBRUMsaUJBQUMsR0FBRDtBQUF5QixZQUFBO1FBQXhCLElBQUMsQ0FBQSxrREFBUzs7Ozs7Ozs7O1FBQWMsNkdBQUEsU0FBQTtJQUF6Qjs7c0JBRUgsTUFBQSxHQUFRLFNBQUE7QUFFSixZQUFBO1FBQUEsUUFBQSxHQUFXO1lBQ1AsSUFBQSxDQUFLLEtBQUwsRUFBVztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFlBQU47Z0JBQW1CLEtBQUEsRUFBTSxJQUFDLENBQUEsT0FBMUI7Z0JBQXNDLEdBQUEsRUFBSSxTQUFBLEdBQVksaUJBQXREO2FBQVgsQ0FETyxFQUVQLElBQUEsQ0FBSyxLQUFMLEVBQVc7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxZQUFOO2dCQUFtQixLQUFBLEVBQU0sSUFBQyxDQUFBLFVBQTFCO2dCQUFzQyxHQUFBLEVBQUksU0FBQSxHQUFZLG9CQUF0RDthQUFYLENBRk8sRUFHUCxJQUFBLENBQUssS0FBTCxFQUFXO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sWUFBTjtnQkFBbUIsS0FBQSxFQUFNLElBQUMsQ0FBQSxRQUExQjtnQkFBc0MsR0FBQSxFQUFJLFNBQUEsR0FBWSxrQkFBdEQ7YUFBWCxDQUhPLEVBSVAsSUFBQSxDQUFLLEtBQUwsRUFBVztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFlBQU47Z0JBQW1CLEtBQUEsRUFBTSxJQUFDLENBQUEsU0FB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QVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgIDAwMDAwMDAwMCAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgXG4wMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgIFxuIyMjXG5cbnsgcG9zdCwgc2xhc2gsIGtsb2csIGVsZW0sIG9zLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbmVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG5LYWNoZWwgPSByZXF1aXJlICcuL2thY2hlbCdcblxuY2xhc3MgRGVmYXVsdCBleHRlbmRzIEthY2hlbFxuICAgICAgICBcbiAgICBAOiAoQGthY2hlbElkOidkZWZhdWx0JykgLT4gc3VwZXJcbiAgICBcbiAgICBvbkxvYWQ6ID0+XG5cbiAgICAgICAgY2hpbGRyZW4gPSBbXG4gICAgICAgICAgICBlbGVtICdpbWcnIGNsYXNzOidncmlkMngyXzExJyBjbGljazpAb3BlbkFwcCwgICAgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL2FwcC5wbmcnICAgXG4gICAgICAgICAgICBlbGVtICdpbWcnIGNsYXNzOidncmlkMngyXzEyJyBjbGljazpAb3BlbkZvbGRlciwgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL2ZvbGRlci5wbmcnICAgIFxuICAgICAgICAgICAgZWxlbSAnaW1nJyBjbGFzczonZ3JpZDJ4Ml8yMScgY2xpY2s6QG9wZW5JbmZvLCAgIHNyYzpfX2Rpcm5hbWUgKyAnLy4uL2ltZy9pbmZvLnBuZycgXG4gICAgICAgICAgICBlbGVtICdpbWcnIGNsYXNzOidncmlkMngyXzIyJyBjbGljazpAb3BlbkNsb2NrLCAgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL2Nsb2NrLnBuZycgICAgIFxuICAgICAgICBdXG4gICAgICAgIFxuICAgICAgICBmb3IgY2hpbGQgaW4gY2hpbGRyZW5cbiAgICAgICAgICAgIGNoaWxkLm9uZHJhZ3N0YXJ0ID0gLT4gZmFsc2VcbiAgICAgICAgXG4gICAgICAgIGdyaWQgPSBlbGVtICdkaXYnIGNsYXNzOidncmlkMngyJyBjaGlsZHJlbjpjaGlsZHJlblxuICAgIFxuICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBncmlkXG4gICAgICAgIFxuICAgIG9wZW5DbG9jazogPT4gcG9zdC50b01haW4gJ25ld0thY2hlbCcgaHRtbDonY2xvY2snICAgXG4gICAgb3BlbkluZm86ICA9PiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyBodG1sOidzeXNpbmZvJyB3aW5JZDpAd2luLmlkXG4gICAgb25DbGljazogPT4gbG9nICdvbkNsaWNrJ1xuICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBvcGVuRm9sZGVyOiA9PiBcbiAgICAgICAgZGlyID0gc2xhc2gudW50aWxkZSAnfidcbiAgICAgICAgZWxlY3Ryb24ucmVtb3RlLmRpYWxvZy5zaG93T3BlbkRpYWxvZ1xuICAgICAgICAgICAgdGl0bGU6IFwiT3BlbiBGb2xkZXJcIlxuICAgICAgICAgICAgZGVmYXVsdFBhdGg6IGRpclxuICAgICAgICAgICAgcHJvcGVydGllczogWydvcGVuRGlyZWN0b3J5JyAnbXVsdGlTZWxlY3Rpb25zJ11cbiAgICAgICAgICAgICwgQGRpcnNDaG9zZW5cbiAgICAgICAgICAgIFxuICAgIGRpcnNDaG9zZW46IChmaWxlcykgPT4gXG4gICAgICAgIHJldHVybiBpZiBub3QgZmlsZXNcbiAgICAgICAgaWYgbm90IGZpbGVzIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgIGZpbGVzID0gW2ZpbGVzXVxuICAgICAgICBmb3IgZmlsZSBpbiBmaWxlc1xuICAgICAgICAgICAgQGRpckNob3NlbiBmaWxlXG4gICAgICAgICAgICBcbiAgICBkaXJDaG9zZW46IChmaWxlKSAtPlxuICAgICAgICBcbiAgICAgICAgZmlsZSA9IHNsYXNoLnBhdGggZmlsZVxuICAgICAgICBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyBodG1sOidmb2xkZXInIGRhdGE6Zm9sZGVyOmZpbGVcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICBcbiAgICBcbiAgICBvcGVuQXBwOiA9PiBcbiAgICAgICAgXG4gICAgICAgIGRpciA9IHNsYXNoLndpbigpIGFuZCAnQzovUHJvZ3JhbSBGaWxlcy8nIG9yICcvQXBwbGljYXRpb25zJ1xuICAgICAgICBlbGVjdHJvbi5yZW1vdGUuZGlhbG9nLnNob3dPcGVuRGlhbG9nXG4gICAgICAgICAgICB0aXRsZTogXCJPcGVuIEFwcGxpY2F0aW9uXCJcbiAgICAgICAgICAgIGRlZmF1bHRQYXRoOiBkaXJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IFsnb3BlbkZpbGUnLCAnbXVsdGlTZWxlY3Rpb25zJ11cbiAgICAgICAgICAgICwgQGFwcHNDaG9zZW5cbiAgICAgICAgICAgIFxuICAgIGFwcHNDaG9zZW46IChmaWxlcykgPT4gXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGZpbGVzXG4gICAgICAgIGlmIG5vdCBmaWxlcyBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICBmaWxlcyA9IFtmaWxlc11cbiAgICAgICAgZm9yIGZpbGUgaW4gZmlsZXNcbiAgICAgICAgICAgIEBhcHBDaG9zZW4gZmlsZVxuICAgICAgICAgICAgXG4gICAgYXBwQ2hvc2VuOiAoZmlsZSkgLT5cbiAgICAgICAgXG4gICAgICAgIGZpbGUgPSBzbGFzaC5yZW1vdmVEcml2ZSBzbGFzaC5wYXRoIGZpbGVcbiAgICAgICAgcG9zdC50b01haW4gJ25ld0thY2hlbCcgaHRtbDonYXBwbCcgZGF0YTphcHA6ZmlsZVxuXG5tb2R1bGUuZXhwb3J0cyA9IERlZmF1bHRcbiJdfQ==
//# sourceURL=../coffee/default.coffee
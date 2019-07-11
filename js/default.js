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
        this.filesChosen = bind(this.filesChosen, this);
        this.openFile = bind(this.openFile, this);
        this.dirsChosen = bind(this.dirsChosen, this);
        this.openFolder = bind(this.openFolder, this);
        this.onClick = bind(this.onClick, this);
        this.openInfo = bind(this.openInfo, this);
        this.openDish = bind(this.openDish, this);
        this.openClock = bind(this.openClock, this);
        this.onLoad = bind(this.onLoad, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Default.__super__.constructor.apply(this, arguments);
    }

    Default.prototype.onLoad = function() {
        var child, children, grid, i, len;
        children = [
            elem('img', {
                "class": 'grid3x3_11',
                click: this.openApp,
                src: __dirname + '/../img/app.png'
            }), elem('img', {
                "class": 'grid3x3_12',
                click: this.openFolder,
                src: __dirname + '/../img/folder.png'
            }), elem('img', {
                "class": 'grid3x3_21',
                click: this.openDish,
                src: __dirname + '/../img/info.png'
            }), elem('img', {
                "class": 'grid3x3_22',
                click: this.openInfo,
                src: __dirname + '/../img/info.png'
            }), elem('img', {
                "class": 'grid3x3_23',
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
            "class": 'grid3x3',
            children: children
        });
        return this.main.appendChild(grid);
    };

    Default.prototype.openClock = function() {
        return post.toMain('newKachel', {
            html: 'clock'
        });
    };

    Default.prototype.openDish = function() {
        return post.toMain('newKachel', {
            html: 'sysdish',
            winId: this.win.id
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

    Default.prototype.openFile = function() {
        var dir;
        dir = slash.untilde('~');
        return electron.remote.dialog.showOpenDialog({
            title: "Open File",
            defaultPath: dir,
            properties: ['openFile', 'multiSelections']
        }, this.filesChosen);
    };

    Default.prototype.filesChosen = function(files) {
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
            results.push(this.fileChosen(file));
        }
        return results;
    };

    Default.prototype.fileChosen = function(file) {
        file = slash.path(file);
        return post.toMain('newKachel', {
            html: 'file',
            data: {
                file: file
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsOERBQUE7SUFBQTs7OztBQVFBLE1BQXFDLE9BQUEsQ0FBUSxLQUFSLENBQXJDLEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWUsZUFBZixFQUFxQixlQUFyQixFQUEyQixXQUEzQixFQUErQjs7QUFFL0IsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFFSDs7O0lBRUMsaUJBQUMsR0FBRDtBQUF5QixZQUFBO1FBQXhCLElBQUMsQ0FBQSxrREFBUzs7Ozs7Ozs7Ozs7O1FBQWMsNkdBQUEsU0FBQTtJQUF6Qjs7c0JBUUgsTUFBQSxHQUFRLFNBQUE7QUFFSixZQUFBO1FBQUEsUUFBQSxHQUFXO1lBQ1AsSUFBQSxDQUFLLEtBQUwsRUFBVztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFlBQU47Z0JBQW1CLEtBQUEsRUFBTSxJQUFDLENBQUEsT0FBMUI7Z0JBQXNDLEdBQUEsRUFBSSxTQUFBLEdBQVksaUJBQXREO2FBQVgsQ0FETyxFQUVQLElBQUEsQ0FBSyxLQUFMLEVBQVc7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxZQUFOO2dCQUFtQixLQUFBLEVBQU0sSUFBQyxDQUFBLFVBQTFCO2dCQUFzQyxHQUFBLEVBQUksU0FBQSxHQUFZLG9CQUF0RDthQUFYLENBRk8sRUFJUCxJQUFBLENBQUssS0FBTCxFQUFXO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sWUFBTjtnQkFBbUIsS0FBQSxFQUFNLElBQUMsQ0FBQSxRQUExQjtnQkFBc0MsR0FBQSxFQUFJLFNBQUEsR0FBWSxrQkFBdEQ7YUFBWCxDQUpPLEVBS1AsSUFBQSxDQUFLLEtBQUwsRUFBVztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFlBQU47Z0JBQW1CLEtBQUEsRUFBTSxJQUFDLENBQUEs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MDAwMCAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgMDAwMDAwMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgXG4wMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbjAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgXG4jIyNcblxueyBwb3N0LCBzbGFzaCwga2xvZywgZWxlbSwgb3MsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbkthY2hlbCA9IHJlcXVpcmUgJy4va2FjaGVsJ1xuXG5jbGFzcyBEZWZhdWx0IGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J2RlZmF1bHQnKSAtPiBzdXBlclxuICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBvbkxvYWQ6ID0+XG5cbiAgICAgICAgY2hpbGRyZW4gPSBbXG4gICAgICAgICAgICBlbGVtICdpbWcnIGNsYXNzOidncmlkM3gzXzExJyBjbGljazpAb3BlbkFwcCwgICAgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL2FwcC5wbmcnICAgXG4gICAgICAgICAgICBlbGVtICdpbWcnIGNsYXNzOidncmlkM3gzXzEyJyBjbGljazpAb3BlbkZvbGRlciwgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL2ZvbGRlci5wbmcnICAgIFxuICAgICAgICAgICAgIyBlbGVtICdpbWcnIGNsYXNzOidncmlkM3gzXzEzJyBjbGljazpAb3BlbkZpbGUsICAgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL2ZvbGRlci5wbmcnICAgIFxuICAgICAgICAgICAgZWxlbSAnaW1nJyBjbGFzczonZ3JpZDN4M18yMScgY2xpY2s6QG9wZW5EaXNoLCAgIHNyYzpfX2Rpcm5hbWUgKyAnLy4uL2ltZy9pbmZvLnBuZycgXG4gICAgICAgICAgICBlbGVtICdpbWcnIGNsYXNzOidncmlkM3gzXzIyJyBjbGljazpAb3BlbkluZm8sICAgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL2luZm8ucG5nJyBcbiAgICAgICAgICAgIGVsZW0gJ2ltZycgY2xhc3M6J2dyaWQzeDNfMjMnIGNsaWNrOkBvcGVuQ2xvY2ssICBzcmM6X19kaXJuYW1lICsgJy8uLi9pbWcvY2xvY2sucG5nJyAgICAgXG4gICAgICAgIF1cbiAgICAgICAgXG4gICAgICAgIGZvciBjaGlsZCBpbiBjaGlsZHJlblxuICAgICAgICAgICAgY2hpbGQub25kcmFnc3RhcnQgPSAtPiBmYWxzZVxuICAgICAgICBcbiAgICAgICAgZ3JpZCA9IGVsZW0gJ2RpdicgY2xhc3M6J2dyaWQzeDMnIGNoaWxkcmVuOmNoaWxkcmVuXG4gICAgXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGdyaWRcbiAgICAgICAgXG4gICAgb3BlbkNsb2NrOiA9PiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyBodG1sOidjbG9jaycgICBcbiAgICBvcGVuRGlzaDogID0+IHBvc3QudG9NYWluICduZXdLYWNoZWwnIGh0bWw6J3N5c2Rpc2gnIHdpbklkOkB3aW4uaWRcbiAgICBvcGVuSW5mbzogID0+IHBvc3QudG9NYWluICduZXdLYWNoZWwnIGh0bWw6J3N5c2luZm8nIHdpbklkOkB3aW4uaWRcbiAgICBvbkNsaWNrOiAgID0+IGxvZyAnb25DbGljaydcbiAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgb3BlbkZvbGRlcjogPT4gXG4gICAgICAgIFxuICAgICAgICBkaXIgPSBzbGFzaC51bnRpbGRlICd+J1xuICAgICAgICBlbGVjdHJvbi5yZW1vdGUuZGlhbG9nLnNob3dPcGVuRGlhbG9nXG4gICAgICAgICAgICB0aXRsZTogXCJPcGVuIEZvbGRlclwiXG4gICAgICAgICAgICBkZWZhdWx0UGF0aDogZGlyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiBbJ29wZW5EaXJlY3RvcnknICdtdWx0aVNlbGVjdGlvbnMnXVxuICAgICAgICAgICAgLCBAZGlyc0Nob3NlblxuICAgICAgICAgICAgXG4gICAgZGlyc0Nob3NlbjogKGZpbGVzKSA9PiBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgZmlsZXNcbiAgICAgICAgaWYgbm90IGZpbGVzIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgIGZpbGVzID0gW2ZpbGVzXVxuICAgICAgICBmb3IgZmlsZSBpbiBmaWxlc1xuICAgICAgICAgICAgQGRpckNob3NlbiBmaWxlXG4gICAgICAgICAgICBcbiAgICBkaXJDaG9zZW46IChmaWxlKSAtPlxuICAgICAgICBcbiAgICAgICAgZmlsZSA9IHNsYXNoLnBhdGggZmlsZVxuICAgICAgICBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyBodG1sOidmb2xkZXInIGRhdGE6Zm9sZGVyOmZpbGVcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIG9wZW5GaWxlOiA9PiBcbiAgICAgICAgXG4gICAgICAgIGRpciA9IHNsYXNoLnVudGlsZGUgJ34nXG4gICAgICAgIGVsZWN0cm9uLnJlbW90ZS5kaWFsb2cuc2hvd09wZW5EaWFsb2dcbiAgICAgICAgICAgIHRpdGxlOiBcIk9wZW4gRmlsZVwiXG4gICAgICAgICAgICBkZWZhdWx0UGF0aDogZGlyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiBbJ29wZW5GaWxlJyAnbXVsdGlTZWxlY3Rpb25zJ11cbiAgICAgICAgICAgICwgQGZpbGVzQ2hvc2VuXG4gICAgICAgICAgICBcbiAgICBmaWxlc0Nob3NlbjogKGZpbGVzKSA9PiBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgZmlsZXNcbiAgICAgICAgaWYgbm90IGZpbGVzIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgIGZpbGVzID0gW2ZpbGVzXVxuICAgICAgICBmb3IgZmlsZSBpbiBmaWxlc1xuICAgICAgICAgICAgQGZpbGVDaG9zZW4gZmlsZVxuICAgICAgICAgICAgXG4gICAgZmlsZUNob3NlbjogKGZpbGUpIC0+XG4gICAgICAgIFxuICAgICAgICBmaWxlID0gc2xhc2gucGF0aCBmaWxlXG4gICAgICAgIHBvc3QudG9NYWluICduZXdLYWNoZWwnIGh0bWw6J2ZpbGUnIGRhdGE6ZmlsZTpmaWxlXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgb3BlbkFwcDogPT4gXG4gICAgICAgIFxuICAgICAgICBkaXIgPSBzbGFzaC53aW4oKSBhbmQgJ0M6L1Byb2dyYW0gRmlsZXMvJyBvciAnL0FwcGxpY2F0aW9ucydcbiAgICAgICAgZWxlY3Ryb24ucmVtb3RlLmRpYWxvZy5zaG93T3BlbkRpYWxvZ1xuICAgICAgICAgICAgdGl0bGU6IFwiT3BlbiBBcHBsaWNhdGlvblwiXG4gICAgICAgICAgICBkZWZhdWx0UGF0aDogZGlyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiBbJ29wZW5GaWxlJyAnbXVsdGlTZWxlY3Rpb25zJ11cbiAgICAgICAgICAgICwgQGFwcHNDaG9zZW5cbiAgICAgICAgICAgIFxuICAgIGFwcHNDaG9zZW46IChmaWxlcykgPT4gXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGZpbGVzXG4gICAgICAgIGlmIG5vdCBmaWxlcyBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICBmaWxlcyA9IFtmaWxlc11cbiAgICAgICAgZm9yIGZpbGUgaW4gZmlsZXNcbiAgICAgICAgICAgIEBhcHBDaG9zZW4gZmlsZVxuICAgICAgICAgICAgXG4gICAgYXBwQ2hvc2VuOiAoZmlsZSkgLT5cbiAgICAgICAgXG4gICAgICAgIGZpbGUgPSBzbGFzaC5yZW1vdmVEcml2ZSBzbGFzaC5wYXRoIGZpbGVcbiAgICAgICAgcG9zdC50b01haW4gJ25ld0thY2hlbCcgaHRtbDonYXBwbCcgZGF0YTphcHA6ZmlsZVxuXG5tb2R1bGUuZXhwb3J0cyA9IERlZmF1bHRcbiJdfQ==
//# sourceURL=../coffee/default.coffee
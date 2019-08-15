// koffee 1.4.0

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
        this.openTaskbar = bind(this.openTaskbar, this);
        this.openDish = bind(this.openDish, this);
        this.openSaver = bind(this.openSaver, this);
        this.openClean = bind(this.openClean, this);
        this.openAlarm = bind(this.openAlarm, this);
        this.openVolume = bind(this.openVolume, this);
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
                "class": 'grid3x3_13',
                click: this.openClean,
                src: __dirname + '/../img/clean.png'
            }), elem('img', {
                "class": 'grid3x3_21',
                click: this.openDish,
                src: __dirname + '/../img/dish.png'
            }), elem('img', {
                "class": 'grid3x3_22',
                click: this.openTaskbar,
                src: __dirname + '/../img/taskbar.png'
            }), elem('img', {
                "class": 'grid3x3_23',
                click: this.openSaver,
                src: __dirname + '/../img/saver.png'
            }), elem('img', {
                "class": 'grid3x3_31',
                click: this.openClock,
                src: __dirname + '/../img/clock.png'
            }), elem('img', {
                "class": 'grid3x3_32',
                click: this.openAlarm,
                src: __dirname + '/../img/alarm.png'
            }), elem('img', {
                "class": 'grid3x3_33',
                click: this.openVolume,
                src: __dirname + '/../img/volume.png'
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
        return post.toMain('newKachel', 'clock');
    };

    Default.prototype.openVolume = function() {
        return post.toMain('newKachel', 'volume');
    };

    Default.prototype.openAlarm = function() {
        return post.toMain('newKachel', 'alarm');
    };

    Default.prototype.openClean = function() {
        return post.toMain('newKachel', 'clean');
    };

    Default.prototype.openSaver = function() {
        return post.toMain('newKachel', 'saver');
    };

    Default.prototype.openDish = function() {
        return post.toMain('newKachel', 'sysdish');
    };

    Default.prototype.openTaskbar = function() {
        return post.toMain('newKachel', 'taskbar');
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
        return post.toMain('newKachel', slash.path(file));
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
        return post.toMain('newKachel', slash.path(file));
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
        return post.toMain('newKachel', slash.path(file));
    };

    return Default;

})(Kachel);

module.exports = Default;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsOERBQUE7SUFBQTs7OztBQVFBLE1BQXFDLE9BQUEsQ0FBUSxLQUFSLENBQXJDLEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWUsZUFBZixFQUFxQixlQUFyQixFQUEyQixXQUEzQixFQUErQjs7QUFFL0IsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLE1BQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFFTDs7O0lBRUMsaUJBQUMsR0FBRDtBQUF5QixZQUFBO1FBQXhCLElBQUMsQ0FBQSxrREFBUzs7Ozs7Ozs7Ozs7Ozs7OztRQUFjLDZHQUFBLFNBQUE7SUFBekI7O3NCQVFILE1BQUEsR0FBUSxTQUFBO0FBRUosWUFBQTtRQUFBLFFBQUEsR0FBVztZQUNQLElBQUEsQ0FBSyxLQUFMLEVBQVc7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxZQUFOO2dCQUFtQixLQUFBLEVBQU0sSUFBQyxDQUFBLE9BQTFCO2dCQUF1QyxHQUFBLEVBQUksU0FBQSxHQUFZLGlCQUF2RDthQUFYLENBRE8sRUFFUCxJQUFBLENBQUssS0FBTCxFQUFXO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sWUFBTjtnQkFBbUIsS0FBQSxFQUFNLElBQUMsQ0FBQSxVQUExQjtnQkFBdUMsR0FBQSxFQUFJLFNBQUEsR0FBWSxvQkFBdkQ7YUFBWCxDQUZPLEVBR1AsSUFBQSxDQUFLLEtBQUwsRUFBVztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFlBQU47Z0JBQW1CLEtBQUEsRUFBTSxJQUFDLENBQUEsU0FBMUI7Z0JBQXVDLEdBQUEsRUFBSSxTQUFBLEdBQVksbUJBQXZEO2FBQVgsQ0FITyxFQUlQLElBQUEsQ0FBSyxLQUFMLEVBQVc7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxZQUFOO2dCQUFtQixLQUFBLEVBQU0sSUFBQyxD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Q0FBQyxVQUFELEVBQVksaUJBQVosQ0FGWjtTQURKLEVBSU0sSUFBQyxDQUFBLFVBSlA7SUFISzs7c0JBU1QsVUFBQSxHQUFZLFNBQUMsS0FBRDtBQUVSLFlBQUE7UUFBQSxJQUFVLENBQUksS0FBZDtBQUFBLG1CQUFBOztRQUNBLElBQUcsQ0FBSSxLQUFKLFlBQXFCLEtBQXhCO1lBQ0ksS0FBQSxHQUFRLENBQUMsS0FBRCxFQURaOztBQUVBO2FBQUEsdUNBQUE7O3lCQUNJLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBWDtBQURKOztJQUxROztzQkFRWixTQUFBLEdBQVcsU0FBQyxJQUFEO2VBRVAsSUFBSSxDQUFDLE1BQUwsQ0FBWSxXQUFaLEVBQXdCLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWCxDQUF4QjtJQUZPOzs7O0dBckhPOztBQXlIdEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgIDAwMDAwMDAwMCAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgXG4wMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgIFxuIyMjXG5cbnsgcG9zdCwgc2xhc2gsIGtsb2csIGVsZW0sIG9zLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbmVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG5LYWNoZWwgICA9IHJlcXVpcmUgJy4va2FjaGVsJ1xuXG5jbGFzcyBEZWZhdWx0IGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J2RlZmF1bHQnKSAtPiBzdXBlclxuICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBvbkxvYWQ6ID0+XG5cbiAgICAgICAgY2hpbGRyZW4gPSBbXG4gICAgICAgICAgICBlbGVtICdpbWcnIGNsYXNzOidncmlkM3gzXzExJyBjbGljazpAb3BlbkFwcCwgICAgIHNyYzpfX2Rpcm5hbWUgKyAnLy4uL2ltZy9hcHAucG5nJyAgIFxuICAgICAgICAgICAgZWxlbSAnaW1nJyBjbGFzczonZ3JpZDN4M18xMicgY2xpY2s6QG9wZW5Gb2xkZXIsICBzcmM6X19kaXJuYW1lICsgJy8uLi9pbWcvZm9sZGVyLnBuZycgICAgXG4gICAgICAgICAgICBlbGVtICdpbWcnIGNsYXNzOidncmlkM3gzXzEzJyBjbGljazpAb3BlbkNsZWFuLCAgIHNyYzpfX2Rpcm5hbWUgKyAnLy4uL2ltZy9jbGVhbi5wbmcnICAgICBcbiAgICAgICAgICAgIGVsZW0gJ2ltZycgY2xhc3M6J2dyaWQzeDNfMjEnIGNsaWNrOkBvcGVuRGlzaCwgICAgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL2Rpc2gucG5nJyBcbiAgICAgICAgICAgIGVsZW0gJ2ltZycgY2xhc3M6J2dyaWQzeDNfMjInIGNsaWNrOkBvcGVuVGFza2Jhciwgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL3Rhc2tiYXIucG5nJyBcbiAgICAgICAgICAgIGVsZW0gJ2ltZycgY2xhc3M6J2dyaWQzeDNfMjMnIGNsaWNrOkBvcGVuU2F2ZXIsICAgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL3NhdmVyLnBuZycgXG4gICAgICAgICAgICBlbGVtICdpbWcnIGNsYXNzOidncmlkM3gzXzMxJyBjbGljazpAb3BlbkNsb2NrLCAgIHNyYzpfX2Rpcm5hbWUgKyAnLy4uL2ltZy9jbG9jay5wbmcnICAgICBcbiAgICAgICAgICAgIGVsZW0gJ2ltZycgY2xhc3M6J2dyaWQzeDNfMzInIGNsaWNrOkBvcGVuQWxhcm0sICAgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL2FsYXJtLnBuZycgICAgIFxuICAgICAgICAgICAgZWxlbSAnaW1nJyBjbGFzczonZ3JpZDN4M18zMycgY2xpY2s6QG9wZW5Wb2x1bWUsICBzcmM6X19kaXJuYW1lICsgJy8uLi9pbWcvdm9sdW1lLnBuZydcbiAgICAgICAgXVxuICAgICAgICBcbiAgICAgICAgZm9yIGNoaWxkIGluIGNoaWxkcmVuXG4gICAgICAgICAgICBjaGlsZC5vbmRyYWdzdGFydCA9IC0+IGZhbHNlXG4gICAgICAgIFxuICAgICAgICBncmlkID0gZWxlbSAnZGl2JyBjbGFzczonZ3JpZDN4MycgY2hpbGRyZW46Y2hpbGRyZW5cbiAgICBcbiAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgZ3JpZFxuICAgICAgICBcbiAgICBvcGVuQ2xvY2s6ICAgPT4gcG9zdC50b01haW4gJ25ld0thY2hlbCcgJ2Nsb2NrJyAgIFxuICAgIG9wZW5Wb2x1bWU6ICA9PiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAndm9sdW1lJyAgIFxuICAgIG9wZW5BbGFybTogICA9PiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAnYWxhcm0nICAgXG4gICAgb3BlbkNsZWFuOiAgID0+IHBvc3QudG9NYWluICduZXdLYWNoZWwnICdjbGVhbidcbiAgICBvcGVuU2F2ZXI6ICAgPT4gcG9zdC50b01haW4gJ25ld0thY2hlbCcgJ3NhdmVyJyAgIFxuICAgIG9wZW5EaXNoOiAgICA9PiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAnc3lzZGlzaCdcbiAgICBvcGVuVGFza2JhcjogPT4gcG9zdC50b01haW4gJ25ld0thY2hlbCcgJ3Rhc2tiYXInXG4gICAgb25DbGljazogICAgID0+IGxvZyAnb25DbGljaydcbiAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgb3BlbkZvbGRlcjogPT4gXG4gICAgICAgIFxuICAgICAgICBkaXIgPSBzbGFzaC51bnRpbGRlICd+J1xuICAgICAgICBlbGVjdHJvbi5yZW1vdGUuZGlhbG9nLnNob3dPcGVuRGlhbG9nXG4gICAgICAgICAgICB0aXRsZTogXCJPcGVuIEZvbGRlclwiXG4gICAgICAgICAgICBkZWZhdWx0UGF0aDogZGlyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiBbJ29wZW5EaXJlY3RvcnknICdtdWx0aVNlbGVjdGlvbnMnXVxuICAgICAgICAgICAgLCBAZGlyc0Nob3NlblxuICAgICAgICAgICAgXG4gICAgZGlyc0Nob3NlbjogKGZpbGVzKSA9PiBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgZmlsZXNcbiAgICAgICAgaWYgbm90IGZpbGVzIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgIGZpbGVzID0gW2ZpbGVzXVxuICAgICAgICBmb3IgZmlsZSBpbiBmaWxlc1xuICAgICAgICAgICAgQGRpckNob3NlbiBmaWxlXG4gICAgICAgICAgICBcbiAgICBkaXJDaG9zZW46IChmaWxlKSAtPlxuICAgICAgICBcbiAgICAgICAgcG9zdC50b01haW4gJ25ld0thY2hlbCcgc2xhc2gucGF0aCBmaWxlXG4gICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBvcGVuRmlsZTogPT4gXG4gICAgICAgIFxuICAgICAgICBkaXIgPSBzbGFzaC51bnRpbGRlICd+J1xuICAgICAgICBlbGVjdHJvbi5yZW1vdGUuZGlhbG9nLnNob3dPcGVuRGlhbG9nXG4gICAgICAgICAgICB0aXRsZTogXCJPcGVuIEZpbGVcIlxuICAgICAgICAgICAgZGVmYXVsdFBhdGg6IGRpclxuICAgICAgICAgICAgcHJvcGVydGllczogWydvcGVuRmlsZScgJ211bHRpU2VsZWN0aW9ucyddXG4gICAgICAgICAgICAsIEBmaWxlc0Nob3NlblxuICAgICAgICAgICAgXG4gICAgZmlsZXNDaG9zZW46IChmaWxlcykgPT4gXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGZpbGVzXG4gICAgICAgIGlmIG5vdCBmaWxlcyBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICBmaWxlcyA9IFtmaWxlc11cbiAgICAgICAgZm9yIGZpbGUgaW4gZmlsZXNcbiAgICAgICAgICAgIEBmaWxlQ2hvc2VuIGZpbGVcbiAgICAgICAgICAgIFxuICAgIGZpbGVDaG9zZW46IChmaWxlKSAtPlxuICAgICAgICBcbiAgICAgICAgcG9zdC50b01haW4gJ25ld0thY2hlbCcgc2xhc2gucGF0aCBmaWxlXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgb3BlbkFwcDogPT4gXG4gICAgICAgIFxuICAgICAgICBkaXIgPSBzbGFzaC53aW4oKSBhbmQgJ0M6L1Byb2dyYW0gRmlsZXMvJyBvciAnL0FwcGxpY2F0aW9ucydcbiAgICAgICAgZWxlY3Ryb24ucmVtb3RlLmRpYWxvZy5zaG93T3BlbkRpYWxvZ1xuICAgICAgICAgICAgdGl0bGU6IFwiT3BlbiBBcHBsaWNhdGlvblwiXG4gICAgICAgICAgICBkZWZhdWx0UGF0aDogZGlyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiBbJ29wZW5GaWxlJyAnbXVsdGlTZWxlY3Rpb25zJ11cbiAgICAgICAgICAgICwgQGFwcHNDaG9zZW5cbiAgICAgICAgICAgIFxuICAgIGFwcHNDaG9zZW46IChmaWxlcykgPT4gXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGZpbGVzXG4gICAgICAgIGlmIG5vdCBmaWxlcyBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICBmaWxlcyA9IFtmaWxlc11cbiAgICAgICAgZm9yIGZpbGUgaW4gZmlsZXNcbiAgICAgICAgICAgIEBhcHBDaG9zZW4gZmlsZVxuICAgICAgICAgICAgXG4gICAgYXBwQ2hvc2VuOiAoZmlsZSkgLT5cbiAgICAgICAgXG4gICAgICAgIHBvc3QudG9NYWluICduZXdLYWNoZWwnIHNsYXNoLnBhdGggZmlsZVxuXG5tb2R1bGUuZXhwb3J0cyA9IERlZmF1bHRcbiJdfQ==
//# sourceURL=../coffee/default.coffee
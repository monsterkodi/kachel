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
        this.openDish = bind(this.openDish, this);
        this.openSaver = bind(this.openSaver, this);
        this.openTools = bind(this.openTools, this);
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
                click: this.openVolume,
                src: __dirname + '/../img/volume.png'
            }), elem('img', {
                "class": 'grid3x3_21',
                click: this.openDish,
                src: __dirname + '/../img/dish.png'
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
                click: this.openTools,
                src: __dirname + '/../img/tools.png'
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

    Default.prototype.openTools = function() {
        return post.toMain('newKachel', 'tools');
    };

    Default.prototype.openSaver = function() {
        return post.toMain('newKachel', 'saver');
    };

    Default.prototype.openDish = function() {
        return post.toMain('newKachel', 'sysdish');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsOERBQUE7SUFBQTs7OztBQVFBLE1BQXFDLE9BQUEsQ0FBUSxLQUFSLENBQXJDLEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWUsZUFBZixFQUFxQixlQUFyQixFQUEyQixXQUEzQixFQUErQjs7QUFFL0IsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLE1BQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFFTDs7O0lBRUMsaUJBQUMsR0FBRDtBQUF5QixZQUFBO1FBQXhCLElBQUMsQ0FBQSxrREFBUzs7Ozs7Ozs7Ozs7Ozs7O1FBQWMsNkdBQUEsU0FBQTtJQUF6Qjs7c0JBUUgsTUFBQSxHQUFRLFNBQUE7QUFFSixZQUFBO1FBQUEsUUFBQSxHQUFXO1lBQ1AsSUFBQSxDQUFLLEtBQUwsRUFBVztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFlBQU47Z0JBQW1CLEtBQUEsRUFBTSxJQUFDLENBQUEsT0FBMUI7Z0JBQXNDLEdBQUEsRUFBSSxTQUFBLEdBQVksaUJBQXREO2FBQVgsQ0FETyxFQUVQLElBQUEsQ0FBSyxLQUFMLEVBQVc7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxZQUFOO2dCQUFtQixLQUFBLEVBQU0sSUFBQyxDQUFBLFVBQTFCO2dCQUFzQyxHQUFBLEVBQUksU0FBQSxHQUFZLG9CQUF0RDthQUFYLENBRk8sRUFHUCxJQUFBLENBQUssS0FBTCxFQUFXO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sWUFBTjtnQkFBbUIsS0FBQSxFQUFNLElBQUMsQ0FBQSxVQUExQjtnQkFBc0MsR0FBQSxFQUFJLFNBQUEsR0FBWSxvQkFBdEQ7YUFBWCxDQUhPLEVBSVAsSUFBQSxDQUFLLEtBQUwsRUFBVztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFlBQU47Z0JBQW1CLEtBQUEsRUFBTSxJQUFDLENB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Ozt5QkFDSSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQVg7QUFESjs7SUFMUTs7c0JBUVosU0FBQSxHQUFXLFNBQUMsSUFBRDtlQUVQLElBQUksQ0FBQyxNQUFMLENBQVksV0FBWixFQUF3QixLQUFLLENBQUMsSUFBTixDQUFXLElBQVgsQ0FBeEI7SUFGTzs7OztHQXBITzs7QUF3SHRCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAwMDAwMDAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbjAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICBcbiMjI1xuXG57IHBvc3QsIHNsYXNoLCBrbG9nLCBlbGVtLCBvcywgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuS2FjaGVsICAgPSByZXF1aXJlICcuL2thY2hlbCdcblxuY2xhc3MgRGVmYXVsdCBleHRlbmRzIEthY2hlbFxuICAgICAgICBcbiAgICBAOiAoQGthY2hlbElkOidkZWZhdWx0JykgLT4gc3VwZXJcbiAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgb25Mb2FkOiA9PlxuXG4gICAgICAgIGNoaWxkcmVuID0gW1xuICAgICAgICAgICAgZWxlbSAnaW1nJyBjbGFzczonZ3JpZDN4M18xMScgY2xpY2s6QG9wZW5BcHAsICAgIHNyYzpfX2Rpcm5hbWUgKyAnLy4uL2ltZy9hcHAucG5nJyAgIFxuICAgICAgICAgICAgZWxlbSAnaW1nJyBjbGFzczonZ3JpZDN4M18xMicgY2xpY2s6QG9wZW5Gb2xkZXIsIHNyYzpfX2Rpcm5hbWUgKyAnLy4uL2ltZy9mb2xkZXIucG5nJyAgICBcbiAgICAgICAgICAgIGVsZW0gJ2ltZycgY2xhc3M6J2dyaWQzeDNfMTMnIGNsaWNrOkBvcGVuVm9sdW1lLCBzcmM6X19kaXJuYW1lICsgJy8uLi9pbWcvdm9sdW1lLnBuZydcbiAgICAgICAgICAgIGVsZW0gJ2ltZycgY2xhc3M6J2dyaWQzeDNfMjEnIGNsaWNrOkBvcGVuRGlzaCwgICBzcmM6X19kaXJuYW1lICsgJy8uLi9pbWcvZGlzaC5wbmcnIFxuICAgICAgICAgICAgIyBlbGVtICdpbWcnIGNsYXNzOidncmlkM3gzXzIyJyBjbGljazpAb3BlbkluZm8sICAgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL2luZm8ucG5nJyBcbiAgICAgICAgICAgIGVsZW0gJ2ltZycgY2xhc3M6J2dyaWQzeDNfMjMnIGNsaWNrOkBvcGVuU2F2ZXIsICBzcmM6X19kaXJuYW1lICsgJy8uLi9pbWcvc2F2ZXIucG5nJyBcbiAgICAgICAgICAgIGVsZW0gJ2ltZycgY2xhc3M6J2dyaWQzeDNfMzEnIGNsaWNrOkBvcGVuQ2xvY2ssICBzcmM6X19kaXJuYW1lICsgJy8uLi9pbWcvY2xvY2sucG5nJyAgICAgXG4gICAgICAgICAgICBlbGVtICdpbWcnIGNsYXNzOidncmlkM3gzXzMyJyBjbGljazpAb3BlbkFsYXJtLCAgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL2FsYXJtLnBuZycgICAgIFxuICAgICAgICAgICAgZWxlbSAnaW1nJyBjbGFzczonZ3JpZDN4M18zMycgY2xpY2s6QG9wZW5Ub29scywgIHNyYzpfX2Rpcm5hbWUgKyAnLy4uL2ltZy90b29scy5wbmcnICAgICBcbiAgICAgICAgXVxuICAgICAgICBcbiAgICAgICAgZm9yIGNoaWxkIGluIGNoaWxkcmVuXG4gICAgICAgICAgICBjaGlsZC5vbmRyYWdzdGFydCA9IC0+IGZhbHNlXG4gICAgICAgIFxuICAgICAgICBncmlkID0gZWxlbSAnZGl2JyBjbGFzczonZ3JpZDN4MycgY2hpbGRyZW46Y2hpbGRyZW5cbiAgICBcbiAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgZ3JpZFxuICAgICAgICBcbiAgICBvcGVuQ2xvY2s6ICA9PiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAnY2xvY2snICAgXG4gICAgb3BlblZvbHVtZTogPT4gcG9zdC50b01haW4gJ25ld0thY2hlbCcgJ3ZvbHVtZScgICBcbiAgICBvcGVuQWxhcm06ICA9PiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAnYWxhcm0nICAgXG4gICAgb3BlblRvb2xzOiAgPT4gcG9zdC50b01haW4gJ25ld0thY2hlbCcgJ3Rvb2xzJ1xuICAgIG9wZW5TYXZlcjogID0+IHBvc3QudG9NYWluICduZXdLYWNoZWwnICdzYXZlcicgICBcbiAgICBvcGVuRGlzaDogICA9PiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAnc3lzZGlzaCdcbiAgICBvbkNsaWNrOiAgICA9PiBsb2cgJ29uQ2xpY2snXG4gICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIG9wZW5Gb2xkZXI6ID0+IFxuICAgICAgICBcbiAgICAgICAgZGlyID0gc2xhc2gudW50aWxkZSAnfidcbiAgICAgICAgZWxlY3Ryb24ucmVtb3RlLmRpYWxvZy5zaG93T3BlbkRpYWxvZ1xuICAgICAgICAgICAgdGl0bGU6IFwiT3BlbiBGb2xkZXJcIlxuICAgICAgICAgICAgZGVmYXVsdFBhdGg6IGRpclxuICAgICAgICAgICAgcHJvcGVydGllczogWydvcGVuRGlyZWN0b3J5JyAnbXVsdGlTZWxlY3Rpb25zJ11cbiAgICAgICAgICAgICwgQGRpcnNDaG9zZW5cbiAgICAgICAgICAgIFxuICAgIGRpcnNDaG9zZW46IChmaWxlcykgPT4gXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGZpbGVzXG4gICAgICAgIGlmIG5vdCBmaWxlcyBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICBmaWxlcyA9IFtmaWxlc11cbiAgICAgICAgZm9yIGZpbGUgaW4gZmlsZXNcbiAgICAgICAgICAgIEBkaXJDaG9zZW4gZmlsZVxuICAgICAgICAgICAgXG4gICAgZGlyQ2hvc2VuOiAoZmlsZSkgLT5cbiAgICAgICAgXG4gICAgICAgIHBvc3QudG9NYWluICduZXdLYWNoZWwnIHNsYXNoLnBhdGggZmlsZVxuICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgb3BlbkZpbGU6ID0+IFxuICAgICAgICBcbiAgICAgICAgZGlyID0gc2xhc2gudW50aWxkZSAnfidcbiAgICAgICAgZWxlY3Ryb24ucmVtb3RlLmRpYWxvZy5zaG93T3BlbkRpYWxvZ1xuICAgICAgICAgICAgdGl0bGU6IFwiT3BlbiBGaWxlXCJcbiAgICAgICAgICAgIGRlZmF1bHRQYXRoOiBkaXJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IFsnb3BlbkZpbGUnICdtdWx0aVNlbGVjdGlvbnMnXVxuICAgICAgICAgICAgLCBAZmlsZXNDaG9zZW5cbiAgICAgICAgICAgIFxuICAgIGZpbGVzQ2hvc2VuOiAoZmlsZXMpID0+IFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBmaWxlc1xuICAgICAgICBpZiBub3QgZmlsZXMgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgZmlsZXMgPSBbZmlsZXNdXG4gICAgICAgIGZvciBmaWxlIGluIGZpbGVzXG4gICAgICAgICAgICBAZmlsZUNob3NlbiBmaWxlXG4gICAgICAgICAgICBcbiAgICBmaWxlQ2hvc2VuOiAoZmlsZSkgLT5cbiAgICAgICAgXG4gICAgICAgIHBvc3QudG9NYWluICduZXdLYWNoZWwnIHNsYXNoLnBhdGggZmlsZVxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIFxuICAgIFxuICAgIG9wZW5BcHA6ID0+IFxuICAgICAgICBcbiAgICAgICAgZGlyID0gc2xhc2gud2luKCkgYW5kICdDOi9Qcm9ncmFtIEZpbGVzLycgb3IgJy9BcHBsaWNhdGlvbnMnXG4gICAgICAgIGVsZWN0cm9uLnJlbW90ZS5kaWFsb2cuc2hvd09wZW5EaWFsb2dcbiAgICAgICAgICAgIHRpdGxlOiBcIk9wZW4gQXBwbGljYXRpb25cIlxuICAgICAgICAgICAgZGVmYXVsdFBhdGg6IGRpclxuICAgICAgICAgICAgcHJvcGVydGllczogWydvcGVuRmlsZScgJ211bHRpU2VsZWN0aW9ucyddXG4gICAgICAgICAgICAsIEBhcHBzQ2hvc2VuXG4gICAgICAgICAgICBcbiAgICBhcHBzQ2hvc2VuOiAoZmlsZXMpID0+IFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBmaWxlc1xuICAgICAgICBpZiBub3QgZmlsZXMgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgZmlsZXMgPSBbZmlsZXNdXG4gICAgICAgIGZvciBmaWxlIGluIGZpbGVzXG4gICAgICAgICAgICBAYXBwQ2hvc2VuIGZpbGVcbiAgICAgICAgICAgIFxuICAgIGFwcENob3NlbjogKGZpbGUpIC0+XG4gICAgICAgIFxuICAgICAgICBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyBzbGFzaC5wYXRoIGZpbGVcblxubW9kdWxlLmV4cG9ydHMgPSBEZWZhdWx0XG4iXX0=
//# sourceURL=../coffee/default.coffee
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
        this.openSaver = bind(this.openSaver, this);
        this.openTools = bind(this.openTools, this);
        this.openAlarm = bind(this.openAlarm, this);
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
                src: __dirname + '/../img/dish.png'
            }), elem('img', {
                "class": 'grid3x3_22',
                click: this.openInfo,
                src: __dirname + '/../img/info.png'
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

    Default.prototype.openInfo = function() {
        return post.toMain('newKachel', 'sysinfo');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsOERBQUE7SUFBQTs7OztBQVFBLE1BQXFDLE9BQUEsQ0FBUSxLQUFSLENBQXJDLEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWUsZUFBZixFQUFxQixlQUFyQixFQUEyQixXQUEzQixFQUErQjs7QUFFL0IsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLE1BQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFFTDs7O0lBRUMsaUJBQUMsR0FBRDtBQUF5QixZQUFBO1FBQXhCLElBQUMsQ0FBQSxrREFBUzs7Ozs7Ozs7Ozs7Ozs7O1FBQWMsNkdBQUEsU0FBQTtJQUF6Qjs7c0JBUUgsTUFBQSxHQUFRLFNBQUE7QUFFSixZQUFBO1FBQUEsUUFBQSxHQUFXO1lBQ1AsSUFBQSxDQUFLLEtBQUwsRUFBVztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFlBQU47Z0JBQW1CLEtBQUEsRUFBTSxJQUFDLENBQUEsT0FBMUI7Z0JBQXNDLEdBQUEsRUFBSSxTQUFBLEdBQVksaUJBQXREO2FBQVgsQ0FETyxFQUVQLElBQUEsQ0FBSyxLQUFMLEVBQVc7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxZQUFOO2dCQUFtQixLQUFBLEVBQU0sSUFBQyxDQUFBLFVBQTFCO2dCQUFzQyxHQUFBLEVBQUksU0FBQSxHQUFZLG9CQUF0RDthQUFYLENBRk8sRUFJUCxJQUFBLENBQUssS0FBTCxFQUFXO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sWUFBTjtnQkFBbUIsS0FBQSxFQUFNLElBQUMsQ0FBQSxRQUExQjtnQkFBc0MsR0FBQSxFQUFJLFNBQUEsR0FBWSxrQkFBdEQ7YUFBWCxDQUpPLEVBS1AsSUFBQSxDQUFLLEtBQUwsRUFBVztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFlBQU47Z0JBQW1CLEtBQUEsRUFBTSxJQUFDLENB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Ozt5QkFDSSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQVg7QUFESjs7SUFMUTs7c0JBUVosU0FBQSxHQUFXLFNBQUMsSUFBRDtlQUVQLElBQUksQ0FBQyxNQUFMLENBQVksV0FBWixFQUF3QixLQUFLLENBQUMsSUFBTixDQUFXLElBQVgsQ0FBeEI7SUFGTzs7OztHQXBITzs7QUF3SHRCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAwMDAwMDAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbjAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICBcbiMjI1xuXG57IHBvc3QsIHNsYXNoLCBrbG9nLCBlbGVtLCBvcywgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuS2FjaGVsICAgPSByZXF1aXJlICcuL2thY2hlbCdcblxuY2xhc3MgRGVmYXVsdCBleHRlbmRzIEthY2hlbFxuICAgICAgICBcbiAgICBAOiAoQGthY2hlbElkOidkZWZhdWx0JykgLT4gc3VwZXJcbiAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgb25Mb2FkOiA9PlxuXG4gICAgICAgIGNoaWxkcmVuID0gW1xuICAgICAgICAgICAgZWxlbSAnaW1nJyBjbGFzczonZ3JpZDN4M18xMScgY2xpY2s6QG9wZW5BcHAsICAgIHNyYzpfX2Rpcm5hbWUgKyAnLy4uL2ltZy9hcHAucG5nJyAgIFxuICAgICAgICAgICAgZWxlbSAnaW1nJyBjbGFzczonZ3JpZDN4M18xMicgY2xpY2s6QG9wZW5Gb2xkZXIsIHNyYzpfX2Rpcm5hbWUgKyAnLy4uL2ltZy9mb2xkZXIucG5nJyAgICBcbiAgICAgICAgICAgICMgZWxlbSAnaW1nJyBjbGFzczonZ3JpZDN4M18xMycgY2xpY2s6QG9wZW5GaWxlLCAgIHNyYzpfX2Rpcm5hbWUgKyAnLy4uL2ltZy9mb2xkZXIucG5nJyAgICBcbiAgICAgICAgICAgIGVsZW0gJ2ltZycgY2xhc3M6J2dyaWQzeDNfMjEnIGNsaWNrOkBvcGVuRGlzaCwgICBzcmM6X19kaXJuYW1lICsgJy8uLi9pbWcvZGlzaC5wbmcnIFxuICAgICAgICAgICAgZWxlbSAnaW1nJyBjbGFzczonZ3JpZDN4M18yMicgY2xpY2s6QG9wZW5JbmZvLCAgIHNyYzpfX2Rpcm5hbWUgKyAnLy4uL2ltZy9pbmZvLnBuZycgXG4gICAgICAgICAgICBlbGVtICdpbWcnIGNsYXNzOidncmlkM3gzXzIzJyBjbGljazpAb3BlblNhdmVyLCAgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL3NhdmVyLnBuZycgXG4gICAgICAgICAgICBlbGVtICdpbWcnIGNsYXNzOidncmlkM3gzXzMxJyBjbGljazpAb3BlbkNsb2NrLCAgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL2Nsb2NrLnBuZycgICAgIFxuICAgICAgICAgICAgZWxlbSAnaW1nJyBjbGFzczonZ3JpZDN4M18zMicgY2xpY2s6QG9wZW5BbGFybSwgIHNyYzpfX2Rpcm5hbWUgKyAnLy4uL2ltZy9hbGFybS5wbmcnICAgICBcbiAgICAgICAgICAgIGVsZW0gJ2ltZycgY2xhc3M6J2dyaWQzeDNfMzMnIGNsaWNrOkBvcGVuVG9vbHMsICBzcmM6X19kaXJuYW1lICsgJy8uLi9pbWcvdG9vbHMucG5nJyAgICAgXG4gICAgICAgIF1cbiAgICAgICAgXG4gICAgICAgIGZvciBjaGlsZCBpbiBjaGlsZHJlblxuICAgICAgICAgICAgY2hpbGQub25kcmFnc3RhcnQgPSAtPiBmYWxzZVxuICAgICAgICBcbiAgICAgICAgZ3JpZCA9IGVsZW0gJ2RpdicgY2xhc3M6J2dyaWQzeDMnIGNoaWxkcmVuOmNoaWxkcmVuXG4gICAgXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGdyaWRcbiAgICAgICAgXG4gICAgb3BlbkNsb2NrOiA9PiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAnY2xvY2snICAgXG4gICAgb3BlbkFsYXJtOiA9PiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAnYWxhcm0nICAgXG4gICAgb3BlblRvb2xzOiA9PiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAndG9vbHMnXG4gICAgb3BlblNhdmVyOiA9PiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAnc2F2ZXInICAgXG4gICAgb3BlbkRpc2g6ICA9PiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAnc3lzZGlzaCdcbiAgICBvcGVuSW5mbzogID0+IHBvc3QudG9NYWluICduZXdLYWNoZWwnICdzeXNpbmZvJ1xuICAgIG9uQ2xpY2s6ICAgPT4gbG9nICdvbkNsaWNrJ1xuICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBvcGVuRm9sZGVyOiA9PiBcbiAgICAgICAgXG4gICAgICAgIGRpciA9IHNsYXNoLnVudGlsZGUgJ34nXG4gICAgICAgIGVsZWN0cm9uLnJlbW90ZS5kaWFsb2cuc2hvd09wZW5EaWFsb2dcbiAgICAgICAgICAgIHRpdGxlOiBcIk9wZW4gRm9sZGVyXCJcbiAgICAgICAgICAgIGRlZmF1bHRQYXRoOiBkaXJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IFsnb3BlbkRpcmVjdG9yeScgJ211bHRpU2VsZWN0aW9ucyddXG4gICAgICAgICAgICAsIEBkaXJzQ2hvc2VuXG4gICAgICAgICAgICBcbiAgICBkaXJzQ2hvc2VuOiAoZmlsZXMpID0+IFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBmaWxlc1xuICAgICAgICBpZiBub3QgZmlsZXMgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgZmlsZXMgPSBbZmlsZXNdXG4gICAgICAgIGZvciBmaWxlIGluIGZpbGVzXG4gICAgICAgICAgICBAZGlyQ2hvc2VuIGZpbGVcbiAgICAgICAgICAgIFxuICAgIGRpckNob3NlbjogKGZpbGUpIC0+XG4gICAgICAgIFxuICAgICAgICBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyBzbGFzaC5wYXRoIGZpbGVcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIG9wZW5GaWxlOiA9PiBcbiAgICAgICAgXG4gICAgICAgIGRpciA9IHNsYXNoLnVudGlsZGUgJ34nXG4gICAgICAgIGVsZWN0cm9uLnJlbW90ZS5kaWFsb2cuc2hvd09wZW5EaWFsb2dcbiAgICAgICAgICAgIHRpdGxlOiBcIk9wZW4gRmlsZVwiXG4gICAgICAgICAgICBkZWZhdWx0UGF0aDogZGlyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiBbJ29wZW5GaWxlJyAnbXVsdGlTZWxlY3Rpb25zJ11cbiAgICAgICAgICAgICwgQGZpbGVzQ2hvc2VuXG4gICAgICAgICAgICBcbiAgICBmaWxlc0Nob3NlbjogKGZpbGVzKSA9PiBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgZmlsZXNcbiAgICAgICAgaWYgbm90IGZpbGVzIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgIGZpbGVzID0gW2ZpbGVzXVxuICAgICAgICBmb3IgZmlsZSBpbiBmaWxlc1xuICAgICAgICAgICAgQGZpbGVDaG9zZW4gZmlsZVxuICAgICAgICAgICAgXG4gICAgZmlsZUNob3NlbjogKGZpbGUpIC0+XG4gICAgICAgIFxuICAgICAgICBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyBzbGFzaC5wYXRoIGZpbGVcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICBcbiAgICBcbiAgICBvcGVuQXBwOiA9PiBcbiAgICAgICAgXG4gICAgICAgIGRpciA9IHNsYXNoLndpbigpIGFuZCAnQzovUHJvZ3JhbSBGaWxlcy8nIG9yICcvQXBwbGljYXRpb25zJ1xuICAgICAgICBlbGVjdHJvbi5yZW1vdGUuZGlhbG9nLnNob3dPcGVuRGlhbG9nXG4gICAgICAgICAgICB0aXRsZTogXCJPcGVuIEFwcGxpY2F0aW9uXCJcbiAgICAgICAgICAgIGRlZmF1bHRQYXRoOiBkaXJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IFsnb3BlbkZpbGUnICdtdWx0aVNlbGVjdGlvbnMnXVxuICAgICAgICAgICAgLCBAYXBwc0Nob3NlblxuICAgICAgICAgICAgXG4gICAgYXBwc0Nob3NlbjogKGZpbGVzKSA9PiBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgZmlsZXNcbiAgICAgICAgaWYgbm90IGZpbGVzIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgIGZpbGVzID0gW2ZpbGVzXVxuICAgICAgICBmb3IgZmlsZSBpbiBmaWxlc1xuICAgICAgICAgICAgQGFwcENob3NlbiBmaWxlXG4gICAgICAgICAgICBcbiAgICBhcHBDaG9zZW46IChmaWxlKSAtPlxuICAgICAgICBcbiAgICAgICAgcG9zdC50b01haW4gJ25ld0thY2hlbCcgc2xhc2gucGF0aCBmaWxlXG5cbm1vZHVsZS5leHBvcnRzID0gRGVmYXVsdFxuIl19
//# sourceURL=../coffee/default.coffee
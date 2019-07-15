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

    Default.prototype.openAlarm = function() {
        return post.toMain('newKachel', {
            html: 'alarm'
        });
    };

    Default.prototype.openSaver = function() {
        return post.toMain('newKachel', {
            html: 'saver'
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
        var ref1;
        file = slash.removeDrive(slash.path(file));
        if ((ref1 = slash.file(file)) === 'konrad.app' || ref1 === 'konrad.exe') {
            return post.toMain('newKachel', {
                html: 'konrad',
                data: {
                    app: file
                }
            });
        } else {
            return post.toMain('newKachel', {
                html: 'appl',
                data: {
                    app: file
                }
            });
        }
    };

    return Default;

})(Kachel);

module.exports = Default;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsOERBQUE7SUFBQTs7OztBQVFBLE1BQXFDLE9BQUEsQ0FBUSxLQUFSLENBQXJDLEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWUsZUFBZixFQUFxQixlQUFyQixFQUEyQixXQUEzQixFQUErQjs7QUFFL0IsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFFSDs7O0lBRUMsaUJBQUMsR0FBRDtBQUF5QixZQUFBO1FBQXhCLElBQUMsQ0FBQSxrREFBUzs7Ozs7Ozs7Ozs7Ozs7UUFBYyw2R0FBQSxTQUFBO0lBQXpCOztzQkFRSCxNQUFBLEdBQVEsU0FBQTtBQUVKLFlBQUE7UUFBQSxRQUFBLEdBQVc7WUFDUCxJQUFBLENBQUssS0FBTCxFQUFXO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sWUFBTjtnQkFBbUIsS0FBQSxFQUFNLElBQUMsQ0FBQSxPQUExQjtnQkFBc0MsR0FBQSxFQUFJLFNBQUEsR0FBWSxpQkFBdEQ7YUFBWCxDQURPLEVBRVAsSUFBQSxDQUFLLEtBQUwsRUFBVztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFlBQU47Z0JBQW1CLEtBQUEsRUFBTSxJQUFDLENBQUEsVUFBMUI7Z0JBQXNDLEdBQUEsRUFBSSxTQUFBLEdBQVksb0JBQXREO2FBQVgsQ0FGTyxFQUlQLElBQUEsQ0FBSyxLQUFMLEVBQVc7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxZQUFOO2dCQUFtQixLQUFBLEVBQU0sSUFBQyxDQUFBLFFBQTFCO2dCQUFzQyxHQUFBLEVBQUksU0FBQSxHQUFZLGtCQUF0RDthQUFYLENBSk8sRUFLUCxJQUFBLENBQUssS0FBTCxFQUFXO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sWUFBTjtnQkFBbUIsS0FBQSxFQUFNLElBQUMsQ0FB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QVksU0FBQyxLQUFEO0FBRVIsWUFBQTtRQUFBLElBQVUsQ0FBSSxLQUFkO0FBQUEsbUJBQUE7O1FBQ0EsSUFBRyxDQUFJLEtBQUosWUFBcUIsS0FBeEI7WUFDSSxLQUFBLEdBQVEsQ0FBQyxLQUFELEVBRFo7O0FBRUE7YUFBQSx1Q0FBQTs7eUJBQ0ksSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFYO0FBREo7O0lBTFE7O3NCQVFaLFNBQUEsR0FBVyxTQUFDLElBQUQ7QUFFUCxZQUFBO1FBQUEsSUFBQSxHQUFPLEtBQUssQ0FBQyxXQUFOLENBQWtCLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWCxDQUFsQjtRQUNQLFlBQUcsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFYLEVBQUEsS0FBcUIsWUFBckIsSUFBQSxJQUFBLEtBQWtDLFlBQXJDO21CQUNJLElBQUksQ0FBQyxNQUFMLENBQVksV0FBWixFQUF3QjtnQkFBQSxJQUFBLEVBQUssUUFBTDtnQkFBYyxJQUFBLEVBQUs7b0JBQUEsR0FBQSxFQUFJLElBQUo7aUJBQW5CO2FBQXhCLEVBREo7U0FBQSxNQUFBO21CQUdJLElBQUksQ0FBQyxNQUFMLENBQVksV0FBWixFQUF3QjtnQkFBQSxJQUFBLEVBQUssTUFBTDtnQkFBWSxJQUFBLEVBQUs7b0JBQUEsR0FBQSxFQUFJLElBQUo7aUJBQWpCO2FBQXhCLEVBSEo7O0lBSE87Ozs7R0FwSE87O0FBNEh0QixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgMDAwMDAwMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgXG4wMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbjAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgXG4jIyNcblxueyBwb3N0LCBzbGFzaCwga2xvZywgZWxlbSwgb3MsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbkthY2hlbCA9IHJlcXVpcmUgJy4va2FjaGVsJ1xuXG5jbGFzcyBEZWZhdWx0IGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J2RlZmF1bHQnKSAtPiBzdXBlclxuICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBvbkxvYWQ6ID0+XG5cbiAgICAgICAgY2hpbGRyZW4gPSBbXG4gICAgICAgICAgICBlbGVtICdpbWcnIGNsYXNzOidncmlkM3gzXzExJyBjbGljazpAb3BlbkFwcCwgICAgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL2FwcC5wbmcnICAgXG4gICAgICAgICAgICBlbGVtICdpbWcnIGNsYXNzOidncmlkM3gzXzEyJyBjbGljazpAb3BlbkZvbGRlciwgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL2ZvbGRlci5wbmcnICAgIFxuICAgICAgICAgICAgIyBlbGVtICdpbWcnIGNsYXNzOidncmlkM3gzXzEzJyBjbGljazpAb3BlbkZpbGUsICAgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL2ZvbGRlci5wbmcnICAgIFxuICAgICAgICAgICAgZWxlbSAnaW1nJyBjbGFzczonZ3JpZDN4M18yMScgY2xpY2s6QG9wZW5EaXNoLCAgIHNyYzpfX2Rpcm5hbWUgKyAnLy4uL2ltZy9kaXNoLnBuZycgXG4gICAgICAgICAgICBlbGVtICdpbWcnIGNsYXNzOidncmlkM3gzXzIyJyBjbGljazpAb3BlbkluZm8sICAgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL2luZm8ucG5nJyBcbiAgICAgICAgICAgIGVsZW0gJ2ltZycgY2xhc3M6J2dyaWQzeDNfMjMnIGNsaWNrOkBvcGVuU2F2ZXIsICBzcmM6X19kaXJuYW1lICsgJy8uLi9pbWcvc2F2ZXIucG5nJyBcbiAgICAgICAgICAgIGVsZW0gJ2ltZycgY2xhc3M6J2dyaWQzeDNfMzEnIGNsaWNrOkBvcGVuQ2xvY2ssICBzcmM6X19kaXJuYW1lICsgJy8uLi9pbWcvY2xvY2sucG5nJyAgICAgXG4gICAgICAgICAgICBlbGVtICdpbWcnIGNsYXNzOidncmlkM3gzXzMyJyBjbGljazpAb3BlbkFsYXJtLCAgc3JjOl9fZGlybmFtZSArICcvLi4vaW1nL2FsYXJtLnBuZycgICAgIFxuICAgICAgICBdXG4gICAgICAgIFxuICAgICAgICBmb3IgY2hpbGQgaW4gY2hpbGRyZW5cbiAgICAgICAgICAgIGNoaWxkLm9uZHJhZ3N0YXJ0ID0gLT4gZmFsc2VcbiAgICAgICAgXG4gICAgICAgIGdyaWQgPSBlbGVtICdkaXYnIGNsYXNzOidncmlkM3gzJyBjaGlsZHJlbjpjaGlsZHJlblxuICAgIFxuICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBncmlkXG4gICAgICAgIFxuICAgIG9wZW5DbG9jazogPT4gcG9zdC50b01haW4gJ25ld0thY2hlbCcgaHRtbDonY2xvY2snICAgXG4gICAgb3BlbkFsYXJtOiA9PiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyBodG1sOidhbGFybScgICBcbiAgICBvcGVuU2F2ZXI6ID0+IHBvc3QudG9NYWluICduZXdLYWNoZWwnIGh0bWw6J3NhdmVyJyAgIFxuICAgIG9wZW5EaXNoOiAgPT4gcG9zdC50b01haW4gJ25ld0thY2hlbCcgaHRtbDonc3lzZGlzaCcgd2luSWQ6QHdpbi5pZFxuICAgIG9wZW5JbmZvOiAgPT4gcG9zdC50b01haW4gJ25ld0thY2hlbCcgaHRtbDonc3lzaW5mbycgd2luSWQ6QHdpbi5pZFxuICAgIG9uQ2xpY2s6ICAgPT4gbG9nICdvbkNsaWNrJ1xuICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBvcGVuRm9sZGVyOiA9PiBcbiAgICAgICAgXG4gICAgICAgIGRpciA9IHNsYXNoLnVudGlsZGUgJ34nXG4gICAgICAgIGVsZWN0cm9uLnJlbW90ZS5kaWFsb2cuc2hvd09wZW5EaWFsb2dcbiAgICAgICAgICAgIHRpdGxlOiBcIk9wZW4gRm9sZGVyXCJcbiAgICAgICAgICAgIGRlZmF1bHRQYXRoOiBkaXJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IFsnb3BlbkRpcmVjdG9yeScgJ211bHRpU2VsZWN0aW9ucyddXG4gICAgICAgICAgICAsIEBkaXJzQ2hvc2VuXG4gICAgICAgICAgICBcbiAgICBkaXJzQ2hvc2VuOiAoZmlsZXMpID0+IFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBmaWxlc1xuICAgICAgICBpZiBub3QgZmlsZXMgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgZmlsZXMgPSBbZmlsZXNdXG4gICAgICAgIGZvciBmaWxlIGluIGZpbGVzXG4gICAgICAgICAgICBAZGlyQ2hvc2VuIGZpbGVcbiAgICAgICAgICAgIFxuICAgIGRpckNob3NlbjogKGZpbGUpIC0+XG4gICAgICAgIFxuICAgICAgICBmaWxlID0gc2xhc2gucGF0aCBmaWxlXG4gICAgICAgIHBvc3QudG9NYWluICduZXdLYWNoZWwnIGh0bWw6J2ZvbGRlcicgZGF0YTpmb2xkZXI6ZmlsZVxuICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgb3BlbkZpbGU6ID0+IFxuICAgICAgICBcbiAgICAgICAgZGlyID0gc2xhc2gudW50aWxkZSAnfidcbiAgICAgICAgZWxlY3Ryb24ucmVtb3RlLmRpYWxvZy5zaG93T3BlbkRpYWxvZ1xuICAgICAgICAgICAgdGl0bGU6IFwiT3BlbiBGaWxlXCJcbiAgICAgICAgICAgIGRlZmF1bHRQYXRoOiBkaXJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IFsnb3BlbkZpbGUnICdtdWx0aVNlbGVjdGlvbnMnXVxuICAgICAgICAgICAgLCBAZmlsZXNDaG9zZW5cbiAgICAgICAgICAgIFxuICAgIGZpbGVzQ2hvc2VuOiAoZmlsZXMpID0+IFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBmaWxlc1xuICAgICAgICBpZiBub3QgZmlsZXMgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgZmlsZXMgPSBbZmlsZXNdXG4gICAgICAgIGZvciBmaWxlIGluIGZpbGVzXG4gICAgICAgICAgICBAZmlsZUNob3NlbiBmaWxlXG4gICAgICAgICAgICBcbiAgICBmaWxlQ2hvc2VuOiAoZmlsZSkgLT5cbiAgICAgICAgXG4gICAgICAgIGZpbGUgPSBzbGFzaC5wYXRoIGZpbGVcbiAgICAgICAgcG9zdC50b01haW4gJ25ld0thY2hlbCcgaHRtbDonZmlsZScgZGF0YTpmaWxlOmZpbGVcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICBcbiAgICBcbiAgICBvcGVuQXBwOiA9PiBcbiAgICAgICAgXG4gICAgICAgIGRpciA9IHNsYXNoLndpbigpIGFuZCAnQzovUHJvZ3JhbSBGaWxlcy8nIG9yICcvQXBwbGljYXRpb25zJ1xuICAgICAgICBlbGVjdHJvbi5yZW1vdGUuZGlhbG9nLnNob3dPcGVuRGlhbG9nXG4gICAgICAgICAgICB0aXRsZTogXCJPcGVuIEFwcGxpY2F0aW9uXCJcbiAgICAgICAgICAgIGRlZmF1bHRQYXRoOiBkaXJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IFsnb3BlbkZpbGUnICdtdWx0aVNlbGVjdGlvbnMnXVxuICAgICAgICAgICAgLCBAYXBwc0Nob3NlblxuICAgICAgICAgICAgXG4gICAgYXBwc0Nob3NlbjogKGZpbGVzKSA9PiBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgZmlsZXNcbiAgICAgICAgaWYgbm90IGZpbGVzIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgIGZpbGVzID0gW2ZpbGVzXVxuICAgICAgICBmb3IgZmlsZSBpbiBmaWxlc1xuICAgICAgICAgICAgQGFwcENob3NlbiBmaWxlXG4gICAgICAgICAgICBcbiAgICBhcHBDaG9zZW46IChmaWxlKSAtPlxuICAgICAgICBcbiAgICAgICAgZmlsZSA9IHNsYXNoLnJlbW92ZURyaXZlIHNsYXNoLnBhdGggZmlsZVxuICAgICAgICBpZiBzbGFzaC5maWxlKGZpbGUpIGluIFsna29ucmFkLmFwcCcgJ2tvbnJhZC5leGUnXVxuICAgICAgICAgICAgcG9zdC50b01haW4gJ25ld0thY2hlbCcgaHRtbDona29ucmFkJyBkYXRhOmFwcDpmaWxlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHBvc3QudG9NYWluICduZXdLYWNoZWwnIGh0bWw6J2FwcGwnIGRhdGE6YXBwOmZpbGVcblxubW9kdWxlLmV4cG9ydHMgPSBEZWZhdWx0XG4iXX0=
//# sourceURL=../coffee/default.coffee
// koffee 1.12.0

/*
0000000    00000000  00000000   0000000   000   000  000    000000000  
000   000  000       000       000   000  000   000  000       000     
000   000  0000000   000000    000000000  000   000  000       000     
000   000  000       000       000   000  000   000  000       000     
0000000    00000000  000       000   000   0000000   0000000   000
 */
var Default, Kachel, _, electron, elem, klog, post, ref, slash,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), _ = ref._, elem = ref.elem, klog = ref.klog, post = ref.post, slash = ref.slash;

electron = require('electron');

Kachel = require('./kachel');

Default = (function(superClass) {
    var button;

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
        this.onRightClick = bind(this.onRightClick, this);
        this.openTools = bind(this.openTools, this);
        this.onLoad = bind(this.onLoad, this);
        _;
        klog('Default', this.kachelId);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Default.__super__.constructor.apply(this, arguments);
    }

    button = function(row, col, img, click, clss) {
        var b;
        if (clss == null) {
            clss = '';
        }
        b = elem({
            "class": "button " + clss + " grid3x3_" + row + col,
            click: click,
            child: elem('img', {
                src: __dirname + '/../' + img
            })
        });
        b.ondragstart = function() {
            return false;
        };
        return b;
    };

    Default.prototype.onLoad = function() {
        klog('onLoad');
        this.main.innerHTML = '';
        return this.main.appendChild(elem('div', {
            "class": 'grid3x3',
            children: [
                button(1, 1, 'img/app.png', this.openApp), button(1, 2, 'img/folder.png', this.openFolder), button(1, 3, 'img/tools.png', this.openTools, 'dark'), button(2, 1, 'img/dish.png', function() {
                    return post.toMain('newKachel', 'sysdish');
                }), button(2, 3, 'img/anny.png', function() {
                    return post.toMain('newKachel', 'anny');
                }), button(3, 1, 'img/clock.png', function() {
                    return post.toMain('newKachel', 'clock');
                }), button(3, 2, 'img/alarm.png', function() {
                    return post.toMain('newKachel', 'alarm');
                }), button(3, 3, 'img/volume.png', function() {
                    return post.toMain('newKachel', 'volume');
                })
            ]
        }));
    };

    Default.prototype.openTools = function() {
        this.main.innerHTML = '';
        return this.main.appendChild(elem('div', {
            "class": 'grid3x3',
            children: [
                button(1, 1, 'img/taskbar.png', (function() {
                    return post.toMain('newKachel', 'taskbar');
                }), 'dark'), button(1, 2, 'img/chain.png', (function() {
                    return post.toMain('newKachel', 'chain');
                }), 'dark'), button(1, 3, 'img/tools.png', this.onLoad, 'dark'), button(2, 1, 'img/saver.png', function() {
                    return post.toMain('newKachel', 'saver');
                }), button(2, 2, 'img/anny.png', function() {
                    return post.toMain('newKachel', 'apps');
                }), button(2, 3, 'img/clean.png', function() {
                    return post.toMain('newKachel', 'clean');
                }), button(3, 1, 'icons/sleep.png', function() {
                    return post.toMain('newKachel', 'sleep');
                }), button(3, 2, 'icons/restart.png', function() {
                    return post.toMain('newKachel', 'restart');
                }), button(3, 3, 'icons/shutdown.png', function() {
                    return post.toMain('newKachel', 'shutdown');
                })
            ]
        }));
    };

    Default.prototype.onRightClick = function() {
        return this.win.close();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImRlZmF1bHQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLDBEQUFBO0lBQUE7Ozs7QUFRQSxNQUFpQyxPQUFBLENBQVEsS0FBUixDQUFqQyxFQUFFLFNBQUYsRUFBSyxlQUFMLEVBQVcsZUFBWCxFQUFpQixlQUFqQixFQUF1Qjs7QUFFdkIsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLE1BQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFFTDtBQUVGLFFBQUE7Ozs7SUFBRyxpQkFBQyxHQUFEO0FBQ0MsWUFBQTtRQURBLElBQUMsQ0FBQSxrREFBUzs7Ozs7Ozs7OztRQUNWO1FBR0EsSUFBQSxDQUFLLFNBQUwsRUFBZSxJQUFDLENBQUEsUUFBaEI7UUFDQSw2R0FBQSxTQUFBO0lBTEQ7O0lBYUgsTUFBQSxHQUFTLFNBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLEVBQWdCLEtBQWhCLEVBQXVCLElBQXZCO0FBRUwsWUFBQTs7WUFGNEIsT0FBSzs7UUFFakMsQ0FBQSxHQUFJLElBQUEsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sU0FBQSxHQUFVLElBQVYsR0FBZSxXQUFmLEdBQTBCLEdBQTFCLEdBQWdDLEdBQXRDO1lBQTRDLEtBQUEsRUFBTSxLQUFsRDtZQUF5RCxLQUFBLEVBQU8sSUFBQSxDQUFLLEtBQUwsRUFBVztnQkFBQSxHQUFBLEVBQUksU0FBQSxHQUFZLE1BQVosR0FBcUIsR0FBekI7YUFBWCxDQUFoRTtTQUFMO1FBQ0osQ0FBQyxDQUFDLFdBQUYsR0FBZ0IsU0FBQTttQkFBRztRQUFIO2VBQ2hCO0lBSks7O3NCQU1ULE1BQUEsR0FBUSxTQUFBO1FBRUosSUFBQSxDQUFLLFFBQUw7UUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLFNBQU4sR0FBa0I7ZUFDbEIsSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLElBQUEsQ0FBSyxLQUFMLEVBQVc7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFNBQU47WUFBZ0IsUUFBQSxFQUFTO2dCQUNsRCxNQUFBLENBQU8sQ0FBUCxFQUFTLENBQVQsRUFBVyxhQUFYLEVBQStCLElBQUMsQ0FBQSxPQUFoQyxDQURrRCxFQUVsRCxNQUFBLENBQU8sQ0FBUCxFQUFTLENBQVQsRUFBVyxnQkFBWCxFQUErQixJQUFDLENBQUEsVUFBaEMsQ0FGa0QsRUFHbEQsTUFBQSxDQUFPLENBQVAsRUFBUyxDQUFULEVBQVcsZUFBWCxFQUErQixJQUFDLENBQUEsU0FBaEMsRUFBMkMsTUFBM0MsQ0FIa0QsRUFJbEQsTUFBQSxDQUFPLENBQVAsRUFBUyxDQUFULEVBQVcsY0FBWCxFQUE0QixTQUFBOzJCQUFHLElBQUksQ0FBQyxNQUFMLENBQVksV0FBWixFQUF3QixTQUF4QjtnQkFBSCxDQUE1QixDQUprRCxFQUtsRCxNQUFBLENBQU8sQ0FBUCxFQUFTLENBQVQsRUFBVyxjQUFYLEVBQTRCLFNBQUE7MkJBQUcsSUFBSSxDQUFDLE1BQUwsQ0FBWSxXQUFaLEVBQXdCLE1BQXhCO2dCQUFILENBQTVCLENBTGtELEVBTWxELE1BQUEsQ0FBTyxDQUFQLEVBQVMsQ0FBVCxFQUFXLGVBQVgsRUFBNEIsU0FBQTsyQkFBRyxJQUFJLENBQUMsTUFBTCxDQUFZLFdBQVosRUFBd0IsT0FBeEI7Z0JBQUgsQ0FBNUIsQ0FOa0QsRUFPbEQsTUFBQSxDQUFPLENBQVAsRUFBUyxDQUFULEVBQVcsZUFBWCxFQUE0QixTQUFBOzJCQUFHLElBQUksQ0FBQyxNQUFMLENBQVksV0FBWixFQUF3QixPQUF4QjtnQkFBSCxDQUE1QixDQVBrRCxFQVFsRCxNQUFBLENBQU8sQ0FBUCxFQUFTLENBQVQsRUFBVyxnQkFBWCxFQUE0QixTQUFBOzJCQUFHLElBQUksQ0FBQyxNQUFMLENBQVksV0FBWixFQUF3QixRQUF4QjtnQkFBSCxDQUE1QixDQVJrRDthQUF6QjtTQUFYLENBQWxCO0lBSkk7O3NCQWVSLFNBQUEsR0FBVyxTQUFBO1FBRVAsSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFOLEdBQWtCO2VBQ2xCLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixJQUFBLENBQUssS0FBTCxFQUFXO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxTQUFOO1lBQWdCLFFBQUEsRUFBUztnQkFDbEQsTUFBQSxDQUFPLENBQVAsRUFBUyxDQUFULEVBQVcsaUJBQVgsRUFBK0IsQ0FBQyxTQUFBOzJCQUFHLElBQUksQ0FBQyxNQUFMLENBQVksV0FBWixFQUF3QixTQUF4QjtnQkFBSCxDQUFELENBQS9CLEVBQXVFLE1BQXZFLENBRGtELEVBRWxELE1BQUEsQ0FBTyxDQUFQLEVBQVMsQ0FBVCxFQUFXLGVBQVgsRUFBK0IsQ0FBQyxTQUFBOzJCQUFHLElBQUksQ0FBQyxNQUFMLENBQVksV0FBWixFQUF3QixPQUF4QjtnQkFBSCxDQUFELENBQS9CLEVBQXVFLE1BQXZFLENBRmtELEVBR2xELE1BQUEsQ0FBTyxDQUFQLEVBQVMsQ0FBVCxFQUFXLGVBQVgsRUFBbUMsSUFBQyxDQUFBLE1BQXBDLEVBQTRDLE1BQTVDLENBSGtELEVBSWxELE1BQUEsQ0FBTyxDQUFQLEVBQVMsQ0FBVCxFQUFXLGVBQVgsRUFBZ0MsU0FBQTsyQkFBRyxJQUFJLENBQUMsTUFBTCxDQUFZLFdBQVosRUFBd0IsT0FBeEI7Z0JBQUgsQ0FBaEMsQ0FKa0QsRUFLbEQsTUFBQSxDQUFPLENBQVAsRUFBUyxDQUFULEVBQVcsY0FBWCxFQUFnQyxTQUFBOzJCQUFHLElBQUksQ0FBQyxNQUFMLENBQVksV0FBWixFQUF3QixNQUF4QjtnQkFBSCxDQUFoQyxDQUxrRCxFQU1sRCxNQUFBLENBQU8sQ0FBUCxFQUFTLENBQVQsRUFBVyxlQUFYLEVBQWdDLFNBQUE7MkJBQUcsSUFBSSxDQUFDLE1BQUwsQ0FBWSxXQUFaLEVBQXdCLE9BQXhCO2dCQUFILENBQWhDLENBTmtELEVBT2xELE1BQUEsQ0FBTyxDQUFQLEVBQVMsQ0FBVCxFQUFXLGlCQUFYLEVBQWdDLFNBQUE7MkJBQUcsSUFBSSxDQUFDLE1BQUwsQ0FBWSxXQUFaLEVBQXdCLE9BQXhCO2dCQUFILENBQWhDLENBUGtELEVBUWxELE1BQUEsQ0FBTyxDQUFQLEVBQVMsQ0FBVCxFQUFXLG1CQUFYLEVBQWdDLFNBQUE7MkJBQUcsSUFBSSxDQUFDLE1BQUwsQ0FBWSxXQUFaLEVBQXdCLFNBQXhCO2dCQUFILENBQWhDLENBUmtELEVBU2xELE1BQUEsQ0FBTyxDQUFQLEVBQVMsQ0FBVCxFQUFXLG9CQUFYLEVBQWdDLFNBQUE7MkJBQUcsSUFBSSxDQUFDLE1BQUwsQ0FBWSxXQUFaLEVBQXdCLFVBQXhCO2dCQUFILENBQWhDLENBVGtEO2FBQXpCO1NBQVgsQ0FBbEI7SUFITzs7c0JBZVgsWUFBQSxHQUFjLFNBQUE7ZUFBRyxJQUFDLENBQUEsR0FBRyxDQUFDLEtBQUwsQ0FBQTtJQUFIOztzQkFRZCxVQUFBLEdBQVksU0FBQTtBQUVSLFlBQUE7UUFBQSxHQUFBLEdBQU0sS0FBSyxDQUFDLE9BQU4sQ0FBYyxHQUFkO2VBQ04sUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBdkIsQ0FDSTtZQUFBLEtBQUEsRUFBTyxhQUFQO1lBQ0EsV0FBQSxFQUFhLEdBRGI7WUFFQSxVQUFBLEVBQVksQ0FBQyxlQUFELEVBQWlCLGlCQUFqQixDQUZaO1NBREosRUFJTSxJQUFDLENBQUEsVUFKUDtJQUhROztzQkFTWixVQUFBLEdBQVksU0FBQyxLQUFEO0FBRVIsWUFBQTtRQUFBLElBQVUsQ0FBSSxLQUFkO0FBQUEsbUJBQUE7O1FBQ0EsSUFBRyxDQUFJLEtBQUosWUFBcUIsS0FBeEI7WUFDSSxLQUFBLEdBQVEsQ0FBQyxLQUFELEVBRFo7O0FBRUE7YUFBQSx1Q0FBQTs7eUJBQ0ksSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFYO0FBREo7O0lBTFE7O3NCQVFaLFNBQUEsR0FBVyxTQUFDLElBQUQ7ZUFFUCxJQUFJLENBQUMsTUFBTCxDQUFZLFdBQVosRUFBd0IsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFYLENBQXhCO0lBRk87O3NCQVVYLFFBQUEsR0FBVSxTQUFBO0FBRU4sWUFBQTtRQUFBLEdBQUEsR0FBTSxLQUFLLENBQUMsT0FBTixDQUFjLEdBQWQ7ZUFDTixRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUF2QixDQUNJO1lBQUEsS0FBQSxFQUFPLFdBQVA7WUFDQSxXQUFBLEVBQWEsR0FEYjtZQUVBLFVBQUEsRUFBWSxDQUFDLFVBQUQsRUFBWSxpQkFBWixDQUZaO1NBREosRUFJTSxJQUFDLENBQUEsV0FKUDtJQUhNOztzQkFTVixXQUFBLEdBQWEsU0FBQyxLQUFEO0FBRVQsWUFBQTtRQUFBLElBQVUsQ0FBSSxLQUFkO0FBQUEsbUJBQUE7O1FBQ0EsSUFBRyxDQUFJLEtBQUosWUFBcUIsS0FBeEI7WUFDSSxLQUFBLEdBQVEsQ0FBQyxLQUFELEVBRFo7O0FBRUE7YUFBQSx1Q0FBQTs7eUJBQ0ksSUFBQyxDQUFBLFVBQUQsQ0FBWSxJQUFaO0FBREo7O0lBTFM7O3NCQVFiLFVBQUEsR0FBWSxTQUFDLElBQUQ7ZUFFUixJQUFJLENBQUMsTUFBTCxDQUFZLFdBQVosRUFBd0IsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFYLENBQXhCO0lBRlE7O3NCQVVaLE9BQUEsR0FBUyxTQUFBO0FBRUwsWUFBQTtRQUFBLEdBQUEsR0FBTSxLQUFLLENBQUMsR0FBTixDQUFBLENBQUEsSUFBZ0IsbUJBQWhCLElBQXVDO2VBQzdDLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQXZCLENBQ0k7WUFBQSxLQUFBLEVBQU8sa0JBQVA7WUFDQSxXQUFBLEVBQWEsR0FEYjtZQUVBLFVBQUEsRUFBWSxDQUFDLFVBQUQsRUFBWSxpQkFBWixDQUZaO1NBREosRUFJTSxJQUFDLENBQUEsVUFKUDtJQUhLOztzQkFTVCxVQUFBLEdBQVksU0FBQyxLQUFEO0FBRVIsWUFBQTtRQUFBLElBQVUsQ0FBSSxLQUFkO0FBQUEsbUJBQUE7O1FBQ0EsSUFBRyxDQUFJLEtBQUosWUFBcUIsS0FBeEI7WUFDSSxLQUFBLEdBQVEsQ0FBQyxLQUFELEVBRFo7O0FBRUE7YUFBQSx1Q0FBQTs7eUJBQ0ksSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFYO0FBREo7O0lBTFE7O3NCQVFaLFNBQUEsR0FBVyxTQUFDLElBQUQ7ZUFFUCxJQUFJLENBQUMsTUFBTCxDQUFZLFdBQVosRUFBd0IsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFYLENBQXhCO0lBRk87Ozs7R0FsSU87O0FBc0l0QixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgMDAwMDAwMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgXG4wMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbjAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgXG4jIyNcblxueyBfLCBlbGVtLCBrbG9nLCBwb3N0LCBzbGFzaCB9ID0gcmVxdWlyZSAna3hrJ1xuXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuS2FjaGVsICAgPSByZXF1aXJlICcuL2thY2hlbCdcblxuY2xhc3MgRGVmYXVsdCBleHRlbmRzIEthY2hlbFxuICAgICAgICBcbiAgICBAOiAoQGthY2hlbElkOidkZWZhdWx0JykgLT5cbiAgICAgICAgX1xuICAgICAgICAjIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgICMgZWxlY3Ryb24ucmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKS5vcGVuRGV2VG9vbHMgbW9kZTonZGV0YWNoJ1xuICAgICAgICBrbG9nICdEZWZhdWx0JyBAa2FjaGVsSWRcbiAgICAgICAgc3VwZXJcbiAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgYnV0dG9uID0gKHJvdywgY29sLCBpbWcsIGNsaWNrLCBjbHNzPScnKSAtPlxuICAgICAgICBcbiAgICAgICAgYiA9IGVsZW0gY2xhc3M6XCJidXR0b24gI3tjbHNzfSBncmlkM3gzXyN7cm93fSN7Y29sfVwiIGNsaWNrOmNsaWNrLCBjaGlsZDogZWxlbSAnaW1nJyBzcmM6X19kaXJuYW1lICsgJy8uLi8nICsgaW1nXG4gICAgICAgIGIub25kcmFnc3RhcnQgPSAtPiBmYWxzZVxuICAgICAgICBiXG4gICAgXG4gICAgb25Mb2FkOiA9PlxuICAgICAgICBcbiAgICAgICAga2xvZyAnb25Mb2FkJ1xuICAgICAgICBAbWFpbi5pbm5lckhUTUwgPSAnJ1xuICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBlbGVtICdkaXYnIGNsYXNzOidncmlkM3gzJyBjaGlsZHJlbjpbXG4gICAgICAgICAgICBidXR0b24gMSAxICdpbWcvYXBwLnBuZycgICAgICAgQG9wZW5BcHBcbiAgICAgICAgICAgIGJ1dHRvbiAxIDIgJ2ltZy9mb2xkZXIucG5nJyAgICBAb3BlbkZvbGRlclxuICAgICAgICAgICAgYnV0dG9uIDEgMyAnaW1nL3Rvb2xzLnBuZycgICAgIEBvcGVuVG9vbHMsICdkYXJrJ1xuICAgICAgICAgICAgYnV0dG9uIDIgMSAnaW1nL2Rpc2gucG5nJyAgIC0+IHBvc3QudG9NYWluICduZXdLYWNoZWwnICdzeXNkaXNoJ1xuICAgICAgICAgICAgYnV0dG9uIDIgMyAnaW1nL2FubnkucG5nJyAgIC0+IHBvc3QudG9NYWluICduZXdLYWNoZWwnICdhbm55J1xuICAgICAgICAgICAgYnV0dG9uIDMgMSAnaW1nL2Nsb2NrLnBuZycgIC0+IHBvc3QudG9NYWluICduZXdLYWNoZWwnICdjbG9jaydcbiAgICAgICAgICAgIGJ1dHRvbiAzIDIgJ2ltZy9hbGFybS5wbmcnICAtPiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAnYWxhcm0nXG4gICAgICAgICAgICBidXR0b24gMyAzICdpbWcvdm9sdW1lLnBuZycgLT4gcG9zdC50b01haW4gJ25ld0thY2hlbCcgJ3ZvbHVtZSdcbiAgICAgICAgXVxuXG4gICAgb3BlblRvb2xzOiA9PlxuXG4gICAgICAgIEBtYWluLmlubmVySFRNTCA9ICcnXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGVsZW0gJ2RpdicgY2xhc3M6J2dyaWQzeDMnIGNoaWxkcmVuOltcbiAgICAgICAgICAgIGJ1dHRvbiAxIDEgJ2ltZy90YXNrYmFyLnBuZycgICAoLT4gcG9zdC50b01haW4gJ25ld0thY2hlbCcgJ3Rhc2tiYXInKSwgJ2RhcmsnXG4gICAgICAgICAgICBidXR0b24gMSAyICdpbWcvY2hhaW4ucG5nJyAgICAgKC0+IHBvc3QudG9NYWluICduZXdLYWNoZWwnICdjaGFpbicgICksICdkYXJrJ1xuICAgICAgICAgICAgYnV0dG9uIDEgMyAnaW1nL3Rvb2xzLnBuZycgICAgICAgICBAb25Mb2FkLCAnZGFyaydcbiAgICAgICAgICAgIGJ1dHRvbiAyIDEgJ2ltZy9zYXZlci5wbmcnICAgICAgLT4gcG9zdC50b01haW4gJ25ld0thY2hlbCcgJ3NhdmVyJyAgIFxuICAgICAgICAgICAgYnV0dG9uIDIgMiAnaW1nL2FubnkucG5nJyAgICAgICAtPiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAnYXBwcycgICBcbiAgICAgICAgICAgIGJ1dHRvbiAyIDMgJ2ltZy9jbGVhbi5wbmcnICAgICAgLT4gcG9zdC50b01haW4gJ25ld0thY2hlbCcgJ2NsZWFuJ1xuICAgICAgICAgICAgYnV0dG9uIDMgMSAnaWNvbnMvc2xlZXAucG5nJyAgICAtPiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAnc2xlZXAnICAgIFxuICAgICAgICAgICAgYnV0dG9uIDMgMiAnaWNvbnMvcmVzdGFydC5wbmcnICAtPiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAncmVzdGFydCcgIFxuICAgICAgICAgICAgYnV0dG9uIDMgMyAnaWNvbnMvc2h1dGRvd24ucG5nJyAtPiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAnc2h1dGRvd24nIFxuICAgICAgICBdXG4gICAgICAgIFxuICAgIG9uUmlnaHRDbGljazogPT4gQHdpbi5jbG9zZSgpICBcbiAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgb3BlbkZvbGRlcjogPT4gXG4gICAgICAgIFxuICAgICAgICBkaXIgPSBzbGFzaC51bnRpbGRlICd+J1xuICAgICAgICBlbGVjdHJvbi5yZW1vdGUuZGlhbG9nLnNob3dPcGVuRGlhbG9nXG4gICAgICAgICAgICB0aXRsZTogXCJPcGVuIEZvbGRlclwiXG4gICAgICAgICAgICBkZWZhdWx0UGF0aDogZGlyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiBbJ29wZW5EaXJlY3RvcnknICdtdWx0aVNlbGVjdGlvbnMnXVxuICAgICAgICAgICAgLCBAZGlyc0Nob3NlblxuICAgICAgICAgICAgXG4gICAgZGlyc0Nob3NlbjogKGZpbGVzKSA9PiBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgZmlsZXNcbiAgICAgICAgaWYgbm90IGZpbGVzIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgIGZpbGVzID0gW2ZpbGVzXVxuICAgICAgICBmb3IgZmlsZSBpbiBmaWxlc1xuICAgICAgICAgICAgQGRpckNob3NlbiBmaWxlXG4gICAgICAgICAgICBcbiAgICBkaXJDaG9zZW46IChmaWxlKSAtPlxuICAgICAgICBcbiAgICAgICAgcG9zdC50b01haW4gJ25ld0thY2hlbCcgc2xhc2gucGF0aCBmaWxlXG4gICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBvcGVuRmlsZTogPT4gXG4gICAgICAgIFxuICAgICAgICBkaXIgPSBzbGFzaC51bnRpbGRlICd+J1xuICAgICAgICBlbGVjdHJvbi5yZW1vdGUuZGlhbG9nLnNob3dPcGVuRGlhbG9nXG4gICAgICAgICAgICB0aXRsZTogXCJPcGVuIEZpbGVcIlxuICAgICAgICAgICAgZGVmYXVsdFBhdGg6IGRpclxuICAgICAgICAgICAgcHJvcGVydGllczogWydvcGVuRmlsZScgJ211bHRpU2VsZWN0aW9ucyddXG4gICAgICAgICAgICAsIEBmaWxlc0Nob3NlblxuICAgICAgICAgICAgXG4gICAgZmlsZXNDaG9zZW46IChmaWxlcykgPT4gXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGZpbGVzXG4gICAgICAgIGlmIG5vdCBmaWxlcyBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICBmaWxlcyA9IFtmaWxlc11cbiAgICAgICAgZm9yIGZpbGUgaW4gZmlsZXNcbiAgICAgICAgICAgIEBmaWxlQ2hvc2VuIGZpbGVcbiAgICAgICAgICAgIFxuICAgIGZpbGVDaG9zZW46IChmaWxlKSAtPlxuICAgICAgICBcbiAgICAgICAgcG9zdC50b01haW4gJ25ld0thY2hlbCcgc2xhc2gucGF0aCBmaWxlXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgb3BlbkFwcDogPT4gXG4gICAgICAgIFxuICAgICAgICBkaXIgPSBzbGFzaC53aW4oKSBhbmQgJ0M6L1Byb2dyYW0gRmlsZXMvJyBvciAnL0FwcGxpY2F0aW9ucydcbiAgICAgICAgZWxlY3Ryb24ucmVtb3RlLmRpYWxvZy5zaG93T3BlbkRpYWxvZ1xuICAgICAgICAgICAgdGl0bGU6IFwiT3BlbiBBcHBsaWNhdGlvblwiXG4gICAgICAgICAgICBkZWZhdWx0UGF0aDogZGlyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiBbJ29wZW5GaWxlJyAnbXVsdGlTZWxlY3Rpb25zJ11cbiAgICAgICAgICAgICwgQGFwcHNDaG9zZW5cbiAgICAgICAgICAgIFxuICAgIGFwcHNDaG9zZW46IChmaWxlcykgPT4gXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGZpbGVzXG4gICAgICAgIGlmIG5vdCBmaWxlcyBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICBmaWxlcyA9IFtmaWxlc11cbiAgICAgICAgZm9yIGZpbGUgaW4gZmlsZXNcbiAgICAgICAgICAgIEBhcHBDaG9zZW4gZmlsZVxuICAgICAgICAgICAgXG4gICAgYXBwQ2hvc2VuOiAoZmlsZSkgLT5cbiAgICAgICAgXG4gICAgICAgIHBvc3QudG9NYWluICduZXdLYWNoZWwnIHNsYXNoLnBhdGggZmlsZVxuXG5tb2R1bGUuZXhwb3J0cyA9IERlZmF1bHRcbiJdfQ==
//# sourceURL=../coffee/default.coffee
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
        this.onLeftClick = bind(this.onLeftClick, this);
        this.openTools = bind(this.openTools, this);
        this.onLoad = bind(this.onLoad, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Default.__super__.constructor.apply(this, arguments);
    }

    button = function(row, col, img, click) {
        var b;
        b = elem({
            "class": "button grid3x3_" + row + col,
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
        this.main.innerHTML = '';
        return this.main.appendChild(elem('div', {
            "class": 'grid3x3',
            children: [
                button(1, 1, 'img/app.png', this.openApp), button(1, 2, 'img/folder.png', this.openFolder), button(1, 3, 'img/tools.png', this.openTools), button(2, 1, 'img/dish.png', function() {
                    return post.toMain('newKachel', 'sysdish');
                }), button(2, 3, 'img/saver.png', function() {
                    return post.toMain('newKachel', 'saver');
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
                button(1, 3, 'img/tools.png', this.onLoad), button(2, 1, 'img/taskbar.png', function() {
                    return post.toMain('newKachel', 'taskbar');
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

    Default.prototype.onLeftClick = function() {
        return console.log('onLeftClick');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsOERBQUE7SUFBQTs7OztBQVFBLE1BQXFDLE9BQUEsQ0FBUSxLQUFSLENBQXJDLEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWUsZUFBZixFQUFxQixlQUFyQixFQUEyQixXQUEzQixFQUErQjs7QUFFL0IsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLE1BQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFFTDtBQUVGLFFBQUE7Ozs7SUFBRyxpQkFBQyxHQUFEO0FBQXlCLFlBQUE7UUFBeEIsSUFBQyxDQUFBLGtEQUFTOzs7Ozs7Ozs7O1FBQWMsNkdBQUEsU0FBQTtJQUF6Qjs7SUFRSCxNQUFBLEdBQVMsU0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsRUFBZ0IsS0FBaEI7QUFFTCxZQUFBO1FBQUEsQ0FBQSxHQUFJLElBQUEsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0saUJBQUEsR0FBa0IsR0FBbEIsR0FBd0IsR0FBOUI7WUFBb0MsS0FBQSxFQUFNLEtBQTFDO1lBQWlELEtBQUEsRUFBTyxJQUFBLENBQUssS0FBTCxFQUFXO2dCQUFBLEdBQUEsRUFBSSxTQUFBLEdBQVksTUFBWixHQUFxQixHQUF6QjthQUFYLENBQXhEO1NBQUw7UUFDSixDQUFDLENBQUMsV0FBRixHQUFnQixTQUFBO21CQUFHO1FBQUg7ZUFDaEI7SUFKSzs7c0JBTVQsTUFBQSxHQUFRLFNBQUE7UUFFSixJQUFDLENBQUEsSUFBSSxDQUFDLFNBQU4sR0FBa0I7ZUFDbEIsSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLElBQUEsQ0FBSyxLQUFMLEVBQVc7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFNBQU47WUFBZ0IsUUFBQSxFQUFTO2dCQUNsRCxNQUFBLENBQU8sQ0FBUCxFQUFTLENBQVQsRUFBVyxhQUFY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TCxZQUFBO1FBQUEsR0FBQSxHQUFNLEtBQUssQ0FBQyxHQUFOLENBQUEsQ0FBQSxJQUFnQixtQkFBaEIsSUFBdUM7ZUFDN0MsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBdkIsQ0FDSTtZQUFBLEtBQUEsRUFBTyxrQkFBUDtZQUNBLFdBQUEsRUFBYSxHQURiO1lBRUEsVUFBQSxFQUFZLENBQUMsVUFBRCxFQUFZLGlCQUFaLENBRlo7U0FESixFQUlNLElBQUMsQ0FBQSxVQUpQO0lBSEs7O3NCQVNULFVBQUEsR0FBWSxTQUFDLEtBQUQ7QUFFUixZQUFBO1FBQUEsSUFBVSxDQUFJLEtBQWQ7QUFBQSxtQkFBQTs7UUFDQSxJQUFHLENBQUksS0FBSixZQUFxQixLQUF4QjtZQUNJLEtBQUEsR0FBUSxDQUFDLEtBQUQsRUFEWjs7QUFFQTthQUFBLHVDQUFBOzt5QkFDSSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQVg7QUFESjs7SUFMUTs7c0JBUVosU0FBQSxHQUFXLFNBQUMsSUFBRDtlQUVQLElBQUksQ0FBQyxNQUFMLENBQVksV0FBWixFQUF3QixLQUFLLENBQUMsSUFBTixDQUFXLElBQVgsQ0FBeEI7SUFGTzs7OztHQTFITzs7QUE4SHRCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAwMDAwMDAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbjAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICBcbiMjI1xuXG57IHBvc3QsIHNsYXNoLCBrbG9nLCBlbGVtLCBvcywgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuS2FjaGVsICAgPSByZXF1aXJlICcuL2thY2hlbCdcblxuY2xhc3MgRGVmYXVsdCBleHRlbmRzIEthY2hlbFxuICAgICAgICBcbiAgICBAOiAoQGthY2hlbElkOidkZWZhdWx0JykgLT4gc3VwZXJcbiAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgYnV0dG9uID0gKHJvdywgY29sLCBpbWcsIGNsaWNrKSAtPlxuICAgICAgICBcbiAgICAgICAgYiA9IGVsZW0gY2xhc3M6XCJidXR0b24gZ3JpZDN4M18je3Jvd30je2NvbH1cIiBjbGljazpjbGljaywgY2hpbGQ6IGVsZW0gJ2ltZycgc3JjOl9fZGlybmFtZSArICcvLi4vJyArIGltZ1xuICAgICAgICBiLm9uZHJhZ3N0YXJ0ID0gLT4gZmFsc2VcbiAgICAgICAgYlxuICAgIFxuICAgIG9uTG9hZDogPT5cbiAgICAgICAgXG4gICAgICAgIEBtYWluLmlubmVySFRNTCA9ICcnXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGVsZW0gJ2RpdicgY2xhc3M6J2dyaWQzeDMnIGNoaWxkcmVuOltcbiAgICAgICAgICAgIGJ1dHRvbiAxIDEgJ2ltZy9hcHAucG5nJyAgICAgICBAb3BlbkFwcFxuICAgICAgICAgICAgYnV0dG9uIDEgMiAnaW1nL2ZvbGRlci5wbmcnICAgIEBvcGVuRm9sZGVyXG4gICAgICAgICAgICBidXR0b24gMSAzICdpbWcvdG9vbHMucG5nJyAgICAgQG9wZW5Ub29sc1xuICAgICAgICAgICAgYnV0dG9uIDIgMSAnaW1nL2Rpc2gucG5nJyAgIC0+IHBvc3QudG9NYWluICduZXdLYWNoZWwnICdzeXNkaXNoJyBcbiAgICAgICAgICAgIGJ1dHRvbiAyIDMgJ2ltZy9zYXZlci5wbmcnICAtPiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAnc2F2ZXInICAgXG4gICAgICAgICAgICBidXR0b24gMyAxICdpbWcvY2xvY2sucG5nJyAgLT4gcG9zdC50b01haW4gJ25ld0thY2hlbCcgJ2Nsb2NrJyAgIFxuICAgICAgICAgICAgYnV0dG9uIDMgMiAnaW1nL2FsYXJtLnBuZycgIC0+IHBvc3QudG9NYWluICduZXdLYWNoZWwnICdhbGFybScgICBcbiAgICAgICAgICAgIGJ1dHRvbiAzIDMgJ2ltZy92b2x1bWUucG5nJyAtPiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAndm9sdW1lJyAgXG4gICAgICAgIF1cbiAgICAgICAgXG5cbiAgICBvcGVuVG9vbHM6ID0+XG5cbiAgICAgICAgQG1haW4uaW5uZXJIVE1MID0gJydcbiAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgZWxlbSAnZGl2JyBjbGFzczonZ3JpZDN4MycgY2hpbGRyZW46W1xuICAgICAgICAgICAgYnV0dG9uIDEgMyAnaW1nL3Rvb2xzLnBuZycgICAgICAgICBAb25Mb2FkXG4gICAgICAgICAgICBidXR0b24gMiAxICdpbWcvdGFza2Jhci5wbmcnICAgIC0+IHBvc3QudG9NYWluICduZXdLYWNoZWwnICd0YXNrYmFyJyAgXG4gICAgICAgICAgICBidXR0b24gMiAzICdpbWcvY2xlYW4ucG5nJyAgICAgIC0+IHBvc3QudG9NYWluICduZXdLYWNoZWwnICdjbGVhbicgICAgXG4gICAgICAgICAgICBidXR0b24gMyAxICdpY29ucy9zbGVlcC5wbmcnICAgIC0+IHBvc3QudG9NYWluICduZXdLYWNoZWwnICdzbGVlcCcgICAgXG4gICAgICAgICAgICBidXR0b24gMyAyICdpY29ucy9yZXN0YXJ0LnBuZycgIC0+IHBvc3QudG9NYWluICduZXdLYWNoZWwnICdyZXN0YXJ0JyAgXG4gICAgICAgICAgICBidXR0b24gMyAzICdpY29ucy9zaHV0ZG93bi5wbmcnIC0+IHBvc3QudG9NYWluICduZXdLYWNoZWwnICdzaHV0ZG93bicgXG4gICAgICAgIF1cbiAgICAgICAgXG4gICAgb25MZWZ0Q2xpY2s6ID0+IGxvZyAnb25MZWZ0Q2xpY2snXG4gICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIG9wZW5Gb2xkZXI6ID0+IFxuICAgICAgICBcbiAgICAgICAgZGlyID0gc2xhc2gudW50aWxkZSAnfidcbiAgICAgICAgZWxlY3Ryb24ucmVtb3RlLmRpYWxvZy5zaG93T3BlbkRpYWxvZ1xuICAgICAgICAgICAgdGl0bGU6IFwiT3BlbiBGb2xkZXJcIlxuICAgICAgICAgICAgZGVmYXVsdFBhdGg6IGRpclxuICAgICAgICAgICAgcHJvcGVydGllczogWydvcGVuRGlyZWN0b3J5JyAnbXVsdGlTZWxlY3Rpb25zJ11cbiAgICAgICAgICAgICwgQGRpcnNDaG9zZW5cbiAgICAgICAgICAgIFxuICAgIGRpcnNDaG9zZW46IChmaWxlcykgPT4gXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGZpbGVzXG4gICAgICAgIGlmIG5vdCBmaWxlcyBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICBmaWxlcyA9IFtmaWxlc11cbiAgICAgICAgZm9yIGZpbGUgaW4gZmlsZXNcbiAgICAgICAgICAgIEBkaXJDaG9zZW4gZmlsZVxuICAgICAgICAgICAgXG4gICAgZGlyQ2hvc2VuOiAoZmlsZSkgLT5cbiAgICAgICAgXG4gICAgICAgIHBvc3QudG9NYWluICduZXdLYWNoZWwnIHNsYXNoLnBhdGggZmlsZVxuICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgb3BlbkZpbGU6ID0+IFxuICAgICAgICBcbiAgICAgICAgZGlyID0gc2xhc2gudW50aWxkZSAnfidcbiAgICAgICAgZWxlY3Ryb24ucmVtb3RlLmRpYWxvZy5zaG93T3BlbkRpYWxvZ1xuICAgICAgICAgICAgdGl0bGU6IFwiT3BlbiBGaWxlXCJcbiAgICAgICAgICAgIGRlZmF1bHRQYXRoOiBkaXJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IFsnb3BlbkZpbGUnICdtdWx0aVNlbGVjdGlvbnMnXVxuICAgICAgICAgICAgLCBAZmlsZXNDaG9zZW5cbiAgICAgICAgICAgIFxuICAgIGZpbGVzQ2hvc2VuOiAoZmlsZXMpID0+IFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBmaWxlc1xuICAgICAgICBpZiBub3QgZmlsZXMgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgZmlsZXMgPSBbZmlsZXNdXG4gICAgICAgIGZvciBmaWxlIGluIGZpbGVzXG4gICAgICAgICAgICBAZmlsZUNob3NlbiBmaWxlXG4gICAgICAgICAgICBcbiAgICBmaWxlQ2hvc2VuOiAoZmlsZSkgLT5cbiAgICAgICAgXG4gICAgICAgIHBvc3QudG9NYWluICduZXdLYWNoZWwnIHNsYXNoLnBhdGggZmlsZVxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIFxuICAgIFxuICAgIG9wZW5BcHA6ID0+IFxuICAgICAgICBcbiAgICAgICAgZGlyID0gc2xhc2gud2luKCkgYW5kICdDOi9Qcm9ncmFtIEZpbGVzLycgb3IgJy9BcHBsaWNhdGlvbnMnXG4gICAgICAgIGVsZWN0cm9uLnJlbW90ZS5kaWFsb2cuc2hvd09wZW5EaWFsb2dcbiAgICAgICAgICAgIHRpdGxlOiBcIk9wZW4gQXBwbGljYXRpb25cIlxuICAgICAgICAgICAgZGVmYXVsdFBhdGg6IGRpclxuICAgICAgICAgICAgcHJvcGVydGllczogWydvcGVuRmlsZScgJ211bHRpU2VsZWN0aW9ucyddXG4gICAgICAgICAgICAsIEBhcHBzQ2hvc2VuXG4gICAgICAgICAgICBcbiAgICBhcHBzQ2hvc2VuOiAoZmlsZXMpID0+IFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBmaWxlc1xuICAgICAgICBpZiBub3QgZmlsZXMgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgZmlsZXMgPSBbZmlsZXNdXG4gICAgICAgIGZvciBmaWxlIGluIGZpbGVzXG4gICAgICAgICAgICBAYXBwQ2hvc2VuIGZpbGVcbiAgICAgICAgICAgIFxuICAgIGFwcENob3NlbjogKGZpbGUpIC0+XG4gICAgICAgIFxuICAgICAgICBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyBzbGFzaC5wYXRoIGZpbGVcblxubW9kdWxlLmV4cG9ydHMgPSBEZWZhdWx0XG4iXX0=
//# sourceURL=../coffee/default.coffee
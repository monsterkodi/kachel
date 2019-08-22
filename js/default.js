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
        this.onRightClick = bind(this.onRightClick, this);
        this.openTools = bind(this.openTools, this);
        this.onLoad = bind(this.onLoad, this);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsOERBQUE7SUFBQTs7OztBQVFBLE1BQXFDLE9BQUEsQ0FBUSxLQUFSLENBQXJDLEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWUsZUFBZixFQUFxQixlQUFyQixFQUEyQixXQUEzQixFQUErQjs7QUFFL0IsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLE1BQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFFTDtBQUVGLFFBQUE7Ozs7SUFBRyxpQkFBQyxHQUFEO0FBQXlCLFlBQUE7UUFBeEIsSUFBQyxDQUFBLGtEQUFTOzs7Ozs7Ozs7O1FBQWMsNkdBQUEsU0FBQTtJQUF6Qjs7SUFRSCxNQUFBLEdBQVMsU0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsRUFBZ0IsS0FBaEIsRUFBdUIsSUFBdkI7QUFFTCxZQUFBOztZQUY0QixPQUFLOztRQUVqQyxDQUFBLEdBQUksSUFBQSxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxTQUFBLEdBQVUsSUFBVixHQUFlLFdBQWYsR0FBMEIsR0FBMUIsR0FBZ0MsR0FBdEM7WUFBNEMsS0FBQSxFQUFNLEtBQWxEO1lBQXlELEtBQUEsRUFBTyxJQUFBLENBQUssS0FBTCxFQUFXO2dCQUFBLEdBQUEsRUFBSSxTQUFBLEdBQVksTUFBWixHQUFxQixHQUF6QjthQUFYLENBQWhFO1NBQUw7UUFDSixDQUFDLENBQUMsV0FBRixHQUFnQixTQUFBO21CQUFHO1FBQUg7ZUFDaEI7SUFKSzs7c0JBTVQsTUFBQSxHQUFRLFNBQUE7UUFFSixJQUFDLENBQUEsSUFBSSxDQUFDLFNBQU4sR0FBa0I7ZUFDbEIsSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLElBQUEsQ0FBSyxLQUFMLEVBQVc7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFNBQU47WUFBZ0IsUUFBQSxF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ZUFFUCxJQUFJLENBQUMsTUFBTCxDQUFZLFdBQVosRUFBd0IsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFYLENBQXhCO0lBRk87Ozs7R0E1SE87O0FBZ0l0QixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgMDAwMDAwMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgXG4wMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbjAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgXG4jIyNcblxueyBwb3N0LCBzbGFzaCwga2xvZywgZWxlbSwgb3MsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbkthY2hlbCAgID0gcmVxdWlyZSAnLi9rYWNoZWwnXG5cbmNsYXNzIERlZmF1bHQgZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonZGVmYXVsdCcpIC0+IHN1cGVyXG4gICAgXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgIFxuICAgIGJ1dHRvbiA9IChyb3csIGNvbCwgaW1nLCBjbGljaywgY2xzcz0nJykgLT5cbiAgICAgICAgXG4gICAgICAgIGIgPSBlbGVtIGNsYXNzOlwiYnV0dG9uICN7Y2xzc30gZ3JpZDN4M18je3Jvd30je2NvbH1cIiBjbGljazpjbGljaywgY2hpbGQ6IGVsZW0gJ2ltZycgc3JjOl9fZGlybmFtZSArICcvLi4vJyArIGltZ1xuICAgICAgICBiLm9uZHJhZ3N0YXJ0ID0gLT4gZmFsc2VcbiAgICAgICAgYlxuICAgIFxuICAgIG9uTG9hZDogPT5cbiAgICAgICAgXG4gICAgICAgIEBtYWluLmlubmVySFRNTCA9ICcnXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGVsZW0gJ2RpdicgY2xhc3M6J2dyaWQzeDMnIGNoaWxkcmVuOltcbiAgICAgICAgICAgIGJ1dHRvbiAxIDEgJ2ltZy9hcHAucG5nJyAgICAgICBAb3BlbkFwcFxuICAgICAgICAgICAgYnV0dG9uIDEgMiAnaW1nL2ZvbGRlci5wbmcnICAgIEBvcGVuRm9sZGVyXG4gICAgICAgICAgICBidXR0b24gMSAzICdpbWcvdG9vbHMucG5nJyAgICAgQG9wZW5Ub29scywgJ2RhcmsnXG4gICAgICAgICAgICBidXR0b24gMiAxICdpbWcvZGlzaC5wbmcnICAgLT4gcG9zdC50b01haW4gJ25ld0thY2hlbCcgJ3N5c2Rpc2gnXG4gICAgICAgICAgICBidXR0b24gMiAzICdpbWcvYW5ueS5wbmcnICAgLT4gcG9zdC50b01haW4gJ25ld0thY2hlbCcgJ2FubnknXG4gICAgICAgICAgICBidXR0b24gMyAxICdpbWcvY2xvY2sucG5nJyAgLT4gcG9zdC50b01haW4gJ25ld0thY2hlbCcgJ2Nsb2NrJ1xuICAgICAgICAgICAgYnV0dG9uIDMgMiAnaW1nL2FsYXJtLnBuZycgIC0+IHBvc3QudG9NYWluICduZXdLYWNoZWwnICdhbGFybSdcbiAgICAgICAgICAgIGJ1dHRvbiAzIDMgJ2ltZy92b2x1bWUucG5nJyAtPiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAndm9sdW1lJ1xuICAgICAgICBdXG5cbiAgICBvcGVuVG9vbHM6ID0+XG5cbiAgICAgICAgQG1haW4uaW5uZXJIVE1MID0gJydcbiAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgZWxlbSAnZGl2JyBjbGFzczonZ3JpZDN4MycgY2hpbGRyZW46W1xuICAgICAgICAgICAgYnV0dG9uIDEgMSAnaW1nL3Rhc2tiYXIucG5nJyAgICgtPiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAndGFza2JhcicpLCAnZGFyaydcbiAgICAgICAgICAgIGJ1dHRvbiAxIDIgJ2ltZy9jaGFpbi5wbmcnICAgICAoLT4gcG9zdC50b01haW4gJ25ld0thY2hlbCcgJ2NoYWluJyAgKSwgJ2RhcmsnXG4gICAgICAgICAgICBidXR0b24gMSAzICdpbWcvdG9vbHMucG5nJyAgICAgICAgIEBvbkxvYWQsICdkYXJrJ1xuICAgICAgICAgICAgYnV0dG9uIDIgMSAnaW1nL3NhdmVyLnBuZycgICAgICAtPiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAnc2F2ZXInICAgXG4gICAgICAgICAgICBidXR0b24gMiAyICdpbWcvYW5ueS5wbmcnICAgICAgIC0+IHBvc3QudG9NYWluICduZXdLYWNoZWwnICdhcHBzJyAgIFxuICAgICAgICAgICAgYnV0dG9uIDIgMyAnaW1nL2NsZWFuLnBuZycgICAgICAtPiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAnY2xlYW4nXG4gICAgICAgICAgICBidXR0b24gMyAxICdpY29ucy9zbGVlcC5wbmcnICAgIC0+IHBvc3QudG9NYWluICduZXdLYWNoZWwnICdzbGVlcCcgICAgXG4gICAgICAgICAgICBidXR0b24gMyAyICdpY29ucy9yZXN0YXJ0LnBuZycgIC0+IHBvc3QudG9NYWluICduZXdLYWNoZWwnICdyZXN0YXJ0JyAgXG4gICAgICAgICAgICBidXR0b24gMyAzICdpY29ucy9zaHV0ZG93bi5wbmcnIC0+IHBvc3QudG9NYWluICduZXdLYWNoZWwnICdzaHV0ZG93bicgXG4gICAgICAgIF1cbiAgICAgICAgXG4gICAgb25SaWdodENsaWNrOiA9PiBAd2luLmNsb3NlKCkgIFxuICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBvcGVuRm9sZGVyOiA9PiBcbiAgICAgICAgXG4gICAgICAgIGRpciA9IHNsYXNoLnVudGlsZGUgJ34nXG4gICAgICAgIGVsZWN0cm9uLnJlbW90ZS5kaWFsb2cuc2hvd09wZW5EaWFsb2dcbiAgICAgICAgICAgIHRpdGxlOiBcIk9wZW4gRm9sZGVyXCJcbiAgICAgICAgICAgIGRlZmF1bHRQYXRoOiBkaXJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IFsnb3BlbkRpcmVjdG9yeScgJ211bHRpU2VsZWN0aW9ucyddXG4gICAgICAgICAgICAsIEBkaXJzQ2hvc2VuXG4gICAgICAgICAgICBcbiAgICBkaXJzQ2hvc2VuOiAoZmlsZXMpID0+IFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBmaWxlc1xuICAgICAgICBpZiBub3QgZmlsZXMgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgZmlsZXMgPSBbZmlsZXNdXG4gICAgICAgIGZvciBmaWxlIGluIGZpbGVzXG4gICAgICAgICAgICBAZGlyQ2hvc2VuIGZpbGVcbiAgICAgICAgICAgIFxuICAgIGRpckNob3NlbjogKGZpbGUpIC0+XG4gICAgICAgIFxuICAgICAgICBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyBzbGFzaC5wYXRoIGZpbGVcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIG9wZW5GaWxlOiA9PiBcbiAgICAgICAgXG4gICAgICAgIGRpciA9IHNsYXNoLnVudGlsZGUgJ34nXG4gICAgICAgIGVsZWN0cm9uLnJlbW90ZS5kaWFsb2cuc2hvd09wZW5EaWFsb2dcbiAgICAgICAgICAgIHRpdGxlOiBcIk9wZW4gRmlsZVwiXG4gICAgICAgICAgICBkZWZhdWx0UGF0aDogZGlyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiBbJ29wZW5GaWxlJyAnbXVsdGlTZWxlY3Rpb25zJ11cbiAgICAgICAgICAgICwgQGZpbGVzQ2hvc2VuXG4gICAgICAgICAgICBcbiAgICBmaWxlc0Nob3NlbjogKGZpbGVzKSA9PiBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgZmlsZXNcbiAgICAgICAgaWYgbm90IGZpbGVzIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgIGZpbGVzID0gW2ZpbGVzXVxuICAgICAgICBmb3IgZmlsZSBpbiBmaWxlc1xuICAgICAgICAgICAgQGZpbGVDaG9zZW4gZmlsZVxuICAgICAgICAgICAgXG4gICAgZmlsZUNob3NlbjogKGZpbGUpIC0+XG4gICAgICAgIFxuICAgICAgICBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyBzbGFzaC5wYXRoIGZpbGVcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICBcbiAgICBcbiAgICBvcGVuQXBwOiA9PiBcbiAgICAgICAgXG4gICAgICAgIGRpciA9IHNsYXNoLndpbigpIGFuZCAnQzovUHJvZ3JhbSBGaWxlcy8nIG9yICcvQXBwbGljYXRpb25zJ1xuICAgICAgICBlbGVjdHJvbi5yZW1vdGUuZGlhbG9nLnNob3dPcGVuRGlhbG9nXG4gICAgICAgICAgICB0aXRsZTogXCJPcGVuIEFwcGxpY2F0aW9uXCJcbiAgICAgICAgICAgIGRlZmF1bHRQYXRoOiBkaXJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IFsnb3BlbkZpbGUnICdtdWx0aVNlbGVjdGlvbnMnXVxuICAgICAgICAgICAgLCBAYXBwc0Nob3NlblxuICAgICAgICAgICAgXG4gICAgYXBwc0Nob3NlbjogKGZpbGVzKSA9PiBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgZmlsZXNcbiAgICAgICAgaWYgbm90IGZpbGVzIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgIGZpbGVzID0gW2ZpbGVzXVxuICAgICAgICBmb3IgZmlsZSBpbiBmaWxlc1xuICAgICAgICAgICAgQGFwcENob3NlbiBmaWxlXG4gICAgICAgICAgICBcbiAgICBhcHBDaG9zZW46IChmaWxlKSAtPlxuICAgICAgICBcbiAgICAgICAgcG9zdC50b01haW4gJ25ld0thY2hlbCcgc2xhc2gucGF0aCBmaWxlXG5cbm1vZHVsZS5leHBvcnRzID0gRGVmYXVsdFxuIl19
//# sourceURL=../coffee/default.coffee
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
                button(1, 1, 'img/menu.png', function() {
                    return post.toMain('newKachel', 'chain');
                }), button(1, 3, 'img/tools.png', this.onLoad), button(2, 1, 'img/taskbar.png', function() {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsOERBQUE7SUFBQTs7OztBQVFBLE1BQXFDLE9BQUEsQ0FBUSxLQUFSLENBQXJDLEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWUsZUFBZixFQUFxQixlQUFyQixFQUEyQixXQUEzQixFQUErQjs7QUFFL0IsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLE1BQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFFTDtBQUVGLFFBQUE7Ozs7SUFBRyxpQkFBQyxHQUFEO0FBQXlCLFlBQUE7UUFBeEIsSUFBQyxDQUFBLGtEQUFTOzs7Ozs7Ozs7O1FBQWMsNkdBQUEsU0FBQTtJQUF6Qjs7SUFRSCxNQUFBLEdBQVMsU0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsRUFBZ0IsS0FBaEI7QUFFTCxZQUFBO1FBQUEsQ0FBQSxHQUFJLElBQUEsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0saUJBQUEsR0FBa0IsR0FBbEIsR0FBd0IsR0FBOUI7WUFBb0MsS0FBQSxFQUFNLEtBQTFDO1lBQWlELEtBQUEsRUFBTyxJQUFBLENBQUssS0FBTCxFQUFXO2dCQUFBLEdBQUEsRUFBSSxTQUFBLEdBQVksTUFBWixHQUFxQixHQUF6QjthQUFYLENBQXhEO1NBQUw7UUFDSixDQUFDLENBQUMsV0FBRixHQUFnQixTQUFBO21CQUFHO1FBQUg7ZUFDaEI7SUFKSzs7c0JBTVQsTUFBQSxHQUFRLFNBQUE7UUFFSixJQUFDLENBQUEsSUFBSSxDQUFDLFNBQU4sR0FBa0I7ZUFDbEIsSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLElBQUEsQ0FBSyxLQUFMLEVBQVc7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFNBQU47WUFBZ0IsUUFBQSxFQUFTO2dCQUNsRCxNQUFBLENBQU8sQ0FBUCxFQUFTLENBQVQsRUFBVyxhQUFY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LFVBQUEsR0FBWSxTQUFDLElBQUQ7ZUFFUixJQUFJLENBQUMsTUFBTCxDQUFZLFdBQVosRUFBd0IsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFYLENBQXhCO0lBRlE7O3NCQVVaLE9BQUEsR0FBUyxTQUFBO0FBRUwsWUFBQTtRQUFBLEdBQUEsR0FBTSxLQUFLLENBQUMsR0FBTixDQUFBLENBQUEsSUFBZ0IsbUJBQWhCLElBQXVDO2VBQzdDLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQXZCLENBQ0k7WUFBQSxLQUFBLEVBQU8sa0JBQVA7WUFDQSxXQUFBLEVBQWEsR0FEYjtZQUVBLFVBQUEsRUFBWSxDQUFDLFVBQUQsRUFBWSxpQkFBWixDQUZaO1NBREosRUFJTSxJQUFDLENBQUEsVUFKUDtJQUhLOztzQkFTVCxVQUFBLEdBQVksU0FBQyxLQUFEO0FBRVIsWUFBQTtRQUFBLElBQVUsQ0FBSSxLQUFkO0FBQUEsbUJBQUE7O1FBQ0EsSUFBRyxDQUFJLEtBQUosWUFBcUIsS0FBeEI7WUFDSSxLQUFBLEdBQVEsQ0FBQyxLQUFELEVBRFo7O0FBRUE7YUFBQSx1Q0FBQTs7eUJBQ0ksSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFYO0FBREo7O0lBTFE7O3NCQVFaLFNBQUEsR0FBVyxTQUFDLElBQUQ7ZUFFUCxJQUFJLENBQUMsTUFBTCxDQUFZLFdBQVosRUFBd0IsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFYLENBQXhCO0lBRk87Ozs7R0ExSE87O0FBOEh0QixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgMDAwMDAwMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgXG4wMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbjAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgXG4jIyNcblxueyBwb3N0LCBzbGFzaCwga2xvZywgZWxlbSwgb3MsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbkthY2hlbCAgID0gcmVxdWlyZSAnLi9rYWNoZWwnXG5cbmNsYXNzIERlZmF1bHQgZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonZGVmYXVsdCcpIC0+IHN1cGVyXG4gICAgXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgIFxuICAgIGJ1dHRvbiA9IChyb3csIGNvbCwgaW1nLCBjbGljaykgLT5cbiAgICAgICAgXG4gICAgICAgIGIgPSBlbGVtIGNsYXNzOlwiYnV0dG9uIGdyaWQzeDNfI3tyb3d9I3tjb2x9XCIgY2xpY2s6Y2xpY2ssIGNoaWxkOiBlbGVtICdpbWcnIHNyYzpfX2Rpcm5hbWUgKyAnLy4uLycgKyBpbWdcbiAgICAgICAgYi5vbmRyYWdzdGFydCA9IC0+IGZhbHNlXG4gICAgICAgIGJcbiAgICBcbiAgICBvbkxvYWQ6ID0+XG4gICAgICAgIFxuICAgICAgICBAbWFpbi5pbm5lckhUTUwgPSAnJ1xuICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBlbGVtICdkaXYnIGNsYXNzOidncmlkM3gzJyBjaGlsZHJlbjpbXG4gICAgICAgICAgICBidXR0b24gMSAxICdpbWcvYXBwLnBuZycgICAgICAgQG9wZW5BcHBcbiAgICAgICAgICAgIGJ1dHRvbiAxIDIgJ2ltZy9mb2xkZXIucG5nJyAgICBAb3BlbkZvbGRlclxuICAgICAgICAgICAgYnV0dG9uIDEgMyAnaW1nL3Rvb2xzLnBuZycgICAgIEBvcGVuVG9vbHNcbiAgICAgICAgICAgIGJ1dHRvbiAyIDEgJ2ltZy9kaXNoLnBuZycgICAtPiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAnc3lzZGlzaCcgXG4gICAgICAgICAgICBidXR0b24gMiAzICdpbWcvc2F2ZXIucG5nJyAgLT4gcG9zdC50b01haW4gJ25ld0thY2hlbCcgJ3NhdmVyJyAgIFxuICAgICAgICAgICAgYnV0dG9uIDMgMSAnaW1nL2Nsb2NrLnBuZycgIC0+IHBvc3QudG9NYWluICduZXdLYWNoZWwnICdjbG9jaycgICBcbiAgICAgICAgICAgIGJ1dHRvbiAzIDIgJ2ltZy9hbGFybS5wbmcnICAtPiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAnYWxhcm0nICAgXG4gICAgICAgICAgICBidXR0b24gMyAzICdpbWcvdm9sdW1lLnBuZycgLT4gcG9zdC50b01haW4gJ25ld0thY2hlbCcgJ3ZvbHVtZScgIFxuICAgICAgICBdXG5cbiAgICBvcGVuVG9vbHM6ID0+XG5cbiAgICAgICAgQG1haW4uaW5uZXJIVE1MID0gJydcbiAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgZWxlbSAnZGl2JyBjbGFzczonZ3JpZDN4MycgY2hpbGRyZW46W1xuICAgICAgICAgICAgYnV0dG9uIDEgMSAnaW1nL21lbnUucG5nJyAgICAgICAtPiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAnY2hhaW4nICBcbiAgICAgICAgICAgIGJ1dHRvbiAxIDMgJ2ltZy90b29scy5wbmcnICAgICAgICAgQG9uTG9hZFxuICAgICAgICAgICAgYnV0dG9uIDIgMSAnaW1nL3Rhc2tiYXIucG5nJyAgICAtPiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAndGFza2JhcicgIFxuICAgICAgICAgICAgYnV0dG9uIDIgMyAnaW1nL2NsZWFuLnBuZycgICAgICAtPiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAnY2xlYW4nICAgIFxuICAgICAgICAgICAgYnV0dG9uIDMgMSAnaWNvbnMvc2xlZXAucG5nJyAgICAtPiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAnc2xlZXAnICAgIFxuICAgICAgICAgICAgYnV0dG9uIDMgMiAnaWNvbnMvcmVzdGFydC5wbmcnICAtPiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAncmVzdGFydCcgIFxuICAgICAgICAgICAgYnV0dG9uIDMgMyAnaWNvbnMvc2h1dGRvd24ucG5nJyAtPiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAnc2h1dGRvd24nIFxuICAgICAgICBdXG4gICAgICAgIFxuICAgIG9uUmlnaHRDbGljazogPT4gQHdpbi5jbG9zZSgpICBcbiAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgb3BlbkZvbGRlcjogPT4gXG4gICAgICAgIFxuICAgICAgICBkaXIgPSBzbGFzaC51bnRpbGRlICd+J1xuICAgICAgICBlbGVjdHJvbi5yZW1vdGUuZGlhbG9nLnNob3dPcGVuRGlhbG9nXG4gICAgICAgICAgICB0aXRsZTogXCJPcGVuIEZvbGRlclwiXG4gICAgICAgICAgICBkZWZhdWx0UGF0aDogZGlyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiBbJ29wZW5EaXJlY3RvcnknICdtdWx0aVNlbGVjdGlvbnMnXVxuICAgICAgICAgICAgLCBAZGlyc0Nob3NlblxuICAgICAgICAgICAgXG4gICAgZGlyc0Nob3NlbjogKGZpbGVzKSA9PiBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgZmlsZXNcbiAgICAgICAgaWYgbm90IGZpbGVzIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgIGZpbGVzID0gW2ZpbGVzXVxuICAgICAgICBmb3IgZmlsZSBpbiBmaWxlc1xuICAgICAgICAgICAgQGRpckNob3NlbiBmaWxlXG4gICAgICAgICAgICBcbiAgICBkaXJDaG9zZW46IChmaWxlKSAtPlxuICAgICAgICBcbiAgICAgICAgcG9zdC50b01haW4gJ25ld0thY2hlbCcgc2xhc2gucGF0aCBmaWxlXG4gICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBvcGVuRmlsZTogPT4gXG4gICAgICAgIFxuICAgICAgICBkaXIgPSBzbGFzaC51bnRpbGRlICd+J1xuICAgICAgICBlbGVjdHJvbi5yZW1vdGUuZGlhbG9nLnNob3dPcGVuRGlhbG9nXG4gICAgICAgICAgICB0aXRsZTogXCJPcGVuIEZpbGVcIlxuICAgICAgICAgICAgZGVmYXVsdFBhdGg6IGRpclxuICAgICAgICAgICAgcHJvcGVydGllczogWydvcGVuRmlsZScgJ211bHRpU2VsZWN0aW9ucyddXG4gICAgICAgICAgICAsIEBmaWxlc0Nob3NlblxuICAgICAgICAgICAgXG4gICAgZmlsZXNDaG9zZW46IChmaWxlcykgPT4gXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGZpbGVzXG4gICAgICAgIGlmIG5vdCBmaWxlcyBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICBmaWxlcyA9IFtmaWxlc11cbiAgICAgICAgZm9yIGZpbGUgaW4gZmlsZXNcbiAgICAgICAgICAgIEBmaWxlQ2hvc2VuIGZpbGVcbiAgICAgICAgICAgIFxuICAgIGZpbGVDaG9zZW46IChmaWxlKSAtPlxuICAgICAgICBcbiAgICAgICAgcG9zdC50b01haW4gJ25ld0thY2hlbCcgc2xhc2gucGF0aCBmaWxlXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgb3BlbkFwcDogPT4gXG4gICAgICAgIFxuICAgICAgICBkaXIgPSBzbGFzaC53aW4oKSBhbmQgJ0M6L1Byb2dyYW0gRmlsZXMvJyBvciAnL0FwcGxpY2F0aW9ucydcbiAgICAgICAgZWxlY3Ryb24ucmVtb3RlLmRpYWxvZy5zaG93T3BlbkRpYWxvZ1xuICAgICAgICAgICAgdGl0bGU6IFwiT3BlbiBBcHBsaWNhdGlvblwiXG4gICAgICAgICAgICBkZWZhdWx0UGF0aDogZGlyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiBbJ29wZW5GaWxlJyAnbXVsdGlTZWxlY3Rpb25zJ11cbiAgICAgICAgICAgICwgQGFwcHNDaG9zZW5cbiAgICAgICAgICAgIFxuICAgIGFwcHNDaG9zZW46IChmaWxlcykgPT4gXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGZpbGVzXG4gICAgICAgIGlmIG5vdCBmaWxlcyBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICBmaWxlcyA9IFtmaWxlc11cbiAgICAgICAgZm9yIGZpbGUgaW4gZmlsZXNcbiAgICAgICAgICAgIEBhcHBDaG9zZW4gZmlsZVxuICAgICAgICAgICAgXG4gICAgYXBwQ2hvc2VuOiAoZmlsZSkgLT5cbiAgICAgICAgXG4gICAgICAgIHBvc3QudG9NYWluICduZXdLYWNoZWwnIHNsYXNoLnBhdGggZmlsZVxuXG5tb2R1bGUuZXhwb3J0cyA9IERlZmF1bHRcbiJdfQ==
//# sourceURL=../coffee/default.coffee
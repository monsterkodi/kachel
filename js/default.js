// koffee 1.12.0

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImRlZmF1bHQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLDhEQUFBO0lBQUE7Ozs7QUFRQSxNQUFxQyxPQUFBLENBQVEsS0FBUixDQUFyQyxFQUFFLGVBQUYsRUFBUSxpQkFBUixFQUFlLGVBQWYsRUFBcUIsZUFBckIsRUFBMkIsV0FBM0IsRUFBK0I7O0FBRS9CLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFDWCxNQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBRUw7QUFFRixRQUFBOzs7O0lBQUcsaUJBQUMsR0FBRDtBQUF5QixZQUFBO1FBQXhCLElBQUMsQ0FBQSxrREFBUzs7Ozs7Ozs7OztRQUFjLDZHQUFBLFNBQUE7SUFBekI7O0lBUUgsTUFBQSxHQUFTLFNBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLEVBQWdCLEtBQWhCLEVBQXVCLElBQXZCO0FBRUwsWUFBQTs7WUFGNEIsT0FBSzs7UUFFakMsQ0FBQSxHQUFJLElBQUEsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sU0FBQSxHQUFVLElBQVYsR0FBZSxXQUFmLEdBQTBCLEdBQTFCLEdBQWdDLEdBQXRDO1lBQTRDLEtBQUEsRUFBTSxLQUFsRDtZQUF5RCxLQUFBLEVBQU8sSUFBQSxDQUFLLEtBQUwsRUFBVztnQkFBQSxHQUFBLEVBQUksU0FBQSxHQUFZLE1BQVosR0FBcUIsR0FBekI7YUFBWCxDQUFoRTtTQUFMO1FBQ0osQ0FBQyxDQUFDLFdBQUYsR0FBZ0IsU0FBQTttQkFBRztRQUFIO2VBQ2hCO0lBSks7O3NCQU1ULE1BQUEsR0FBUSxTQUFBO1FBRUosSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFOLEdBQWtCO2VBQ2xCLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixJQUFBLENBQUssS0FBTCxFQUFXO1lBQUEsQ0FBQSxLQUFBLENBQUEs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WixTQUFBLEdBQVcsU0FBQyxJQUFEO2VBRVAsSUFBSSxDQUFDLE1BQUwsQ0FBWSxXQUFaLEVBQXdCLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWCxDQUF4QjtJQUZPOzs7O0dBNUhPOztBQWdJdEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgIDAwMDAwMDAwMCAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgXG4wMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgIFxuIyMjXG5cbnsgcG9zdCwgc2xhc2gsIGtsb2csIGVsZW0sIG9zLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbmVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG5LYWNoZWwgICA9IHJlcXVpcmUgJy4va2FjaGVsJ1xuXG5jbGFzcyBEZWZhdWx0IGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J2RlZmF1bHQnKSAtPiBzdXBlclxuICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBidXR0b24gPSAocm93LCBjb2wsIGltZywgY2xpY2ssIGNsc3M9JycpIC0+XG4gICAgICAgIFxuICAgICAgICBiID0gZWxlbSBjbGFzczpcImJ1dHRvbiAje2Nsc3N9IGdyaWQzeDNfI3tyb3d9I3tjb2x9XCIgY2xpY2s6Y2xpY2ssIGNoaWxkOiBlbGVtICdpbWcnIHNyYzpfX2Rpcm5hbWUgKyAnLy4uLycgKyBpbWdcbiAgICAgICAgYi5vbmRyYWdzdGFydCA9IC0+IGZhbHNlXG4gICAgICAgIGJcbiAgICBcbiAgICBvbkxvYWQ6ID0+XG4gICAgICAgIFxuICAgICAgICBAbWFpbi5pbm5lckhUTUwgPSAnJ1xuICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBlbGVtICdkaXYnIGNsYXNzOidncmlkM3gzJyBjaGlsZHJlbjpbXG4gICAgICAgICAgICBidXR0b24gMSAxICdpbWcvYXBwLnBuZycgICAgICAgQG9wZW5BcHBcbiAgICAgICAgICAgIGJ1dHRvbiAxIDIgJ2ltZy9mb2xkZXIucG5nJyAgICBAb3BlbkZvbGRlclxuICAgICAgICAgICAgYnV0dG9uIDEgMyAnaW1nL3Rvb2xzLnBuZycgICAgIEBvcGVuVG9vbHMsICdkYXJrJ1xuICAgICAgICAgICAgYnV0dG9uIDIgMSAnaW1nL2Rpc2gucG5nJyAgIC0+IHBvc3QudG9NYWluICduZXdLYWNoZWwnICdzeXNkaXNoJ1xuICAgICAgICAgICAgYnV0dG9uIDIgMyAnaW1nL2FubnkucG5nJyAgIC0+IHBvc3QudG9NYWluICduZXdLYWNoZWwnICdhbm55J1xuICAgICAgICAgICAgYnV0dG9uIDMgMSAnaW1nL2Nsb2NrLnBuZycgIC0+IHBvc3QudG9NYWluICduZXdLYWNoZWwnICdjbG9jaydcbiAgICAgICAgICAgIGJ1dHRvbiAzIDIgJ2ltZy9hbGFybS5wbmcnICAtPiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAnYWxhcm0nXG4gICAgICAgICAgICBidXR0b24gMyAzICdpbWcvdm9sdW1lLnBuZycgLT4gcG9zdC50b01haW4gJ25ld0thY2hlbCcgJ3ZvbHVtZSdcbiAgICAgICAgXVxuXG4gICAgb3BlblRvb2xzOiA9PlxuXG4gICAgICAgIEBtYWluLmlubmVySFRNTCA9ICcnXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGVsZW0gJ2RpdicgY2xhc3M6J2dyaWQzeDMnIGNoaWxkcmVuOltcbiAgICAgICAgICAgIGJ1dHRvbiAxIDEgJ2ltZy90YXNrYmFyLnBuZycgICAoLT4gcG9zdC50b01haW4gJ25ld0thY2hlbCcgJ3Rhc2tiYXInKSwgJ2RhcmsnXG4gICAgICAgICAgICBidXR0b24gMSAyICdpbWcvY2hhaW4ucG5nJyAgICAgKC0+IHBvc3QudG9NYWluICduZXdLYWNoZWwnICdjaGFpbicgICksICdkYXJrJ1xuICAgICAgICAgICAgYnV0dG9uIDEgMyAnaW1nL3Rvb2xzLnBuZycgICAgICAgICBAb25Mb2FkLCAnZGFyaydcbiAgICAgICAgICAgIGJ1dHRvbiAyIDEgJ2ltZy9zYXZlci5wbmcnICAgICAgLT4gcG9zdC50b01haW4gJ25ld0thY2hlbCcgJ3NhdmVyJyAgIFxuICAgICAgICAgICAgYnV0dG9uIDIgMiAnaW1nL2FubnkucG5nJyAgICAgICAtPiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAnYXBwcycgICBcbiAgICAgICAgICAgIGJ1dHRvbiAyIDMgJ2ltZy9jbGVhbi5wbmcnICAgICAgLT4gcG9zdC50b01haW4gJ25ld0thY2hlbCcgJ2NsZWFuJ1xuICAgICAgICAgICAgYnV0dG9uIDMgMSAnaWNvbnMvc2xlZXAucG5nJyAgICAtPiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAnc2xlZXAnICAgIFxuICAgICAgICAgICAgYnV0dG9uIDMgMiAnaWNvbnMvcmVzdGFydC5wbmcnICAtPiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAncmVzdGFydCcgIFxuICAgICAgICAgICAgYnV0dG9uIDMgMyAnaWNvbnMvc2h1dGRvd24ucG5nJyAtPiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAnc2h1dGRvd24nIFxuICAgICAgICBdXG4gICAgICAgIFxuICAgIG9uUmlnaHRDbGljazogPT4gQHdpbi5jbG9zZSgpICBcbiAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgb3BlbkZvbGRlcjogPT4gXG4gICAgICAgIFxuICAgICAgICBkaXIgPSBzbGFzaC51bnRpbGRlICd+J1xuICAgICAgICBlbGVjdHJvbi5yZW1vdGUuZGlhbG9nLnNob3dPcGVuRGlhbG9nXG4gICAgICAgICAgICB0aXRsZTogXCJPcGVuIEZvbGRlclwiXG4gICAgICAgICAgICBkZWZhdWx0UGF0aDogZGlyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiBbJ29wZW5EaXJlY3RvcnknICdtdWx0aVNlbGVjdGlvbnMnXVxuICAgICAgICAgICAgLCBAZGlyc0Nob3NlblxuICAgICAgICAgICAgXG4gICAgZGlyc0Nob3NlbjogKGZpbGVzKSA9PiBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgZmlsZXNcbiAgICAgICAgaWYgbm90IGZpbGVzIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgIGZpbGVzID0gW2ZpbGVzXVxuICAgICAgICBmb3IgZmlsZSBpbiBmaWxlc1xuICAgICAgICAgICAgQGRpckNob3NlbiBmaWxlXG4gICAgICAgICAgICBcbiAgICBkaXJDaG9zZW46IChmaWxlKSAtPlxuICAgICAgICBcbiAgICAgICAgcG9zdC50b01haW4gJ25ld0thY2hlbCcgc2xhc2gucGF0aCBmaWxlXG4gICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBvcGVuRmlsZTogPT4gXG4gICAgICAgIFxuICAgICAgICBkaXIgPSBzbGFzaC51bnRpbGRlICd+J1xuICAgICAgICBlbGVjdHJvbi5yZW1vdGUuZGlhbG9nLnNob3dPcGVuRGlhbG9nXG4gICAgICAgICAgICB0aXRsZTogXCJPcGVuIEZpbGVcIlxuICAgICAgICAgICAgZGVmYXVsdFBhdGg6IGRpclxuICAgICAgICAgICAgcHJvcGVydGllczogWydvcGVuRmlsZScgJ211bHRpU2VsZWN0aW9ucyddXG4gICAgICAgICAgICAsIEBmaWxlc0Nob3NlblxuICAgICAgICAgICAgXG4gICAgZmlsZXNDaG9zZW46IChmaWxlcykgPT4gXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGZpbGVzXG4gICAgICAgIGlmIG5vdCBmaWxlcyBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICBmaWxlcyA9IFtmaWxlc11cbiAgICAgICAgZm9yIGZpbGUgaW4gZmlsZXNcbiAgICAgICAgICAgIEBmaWxlQ2hvc2VuIGZpbGVcbiAgICAgICAgICAgIFxuICAgIGZpbGVDaG9zZW46IChmaWxlKSAtPlxuICAgICAgICBcbiAgICAgICAgcG9zdC50b01haW4gJ25ld0thY2hlbCcgc2xhc2gucGF0aCBmaWxlXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgb3BlbkFwcDogPT4gXG4gICAgICAgIFxuICAgICAgICBkaXIgPSBzbGFzaC53aW4oKSBhbmQgJ0M6L1Byb2dyYW0gRmlsZXMvJyBvciAnL0FwcGxpY2F0aW9ucydcbiAgICAgICAgZWxlY3Ryb24ucmVtb3RlLmRpYWxvZy5zaG93T3BlbkRpYWxvZ1xuICAgICAgICAgICAgdGl0bGU6IFwiT3BlbiBBcHBsaWNhdGlvblwiXG4gICAgICAgICAgICBkZWZhdWx0UGF0aDogZGlyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiBbJ29wZW5GaWxlJyAnbXVsdGlTZWxlY3Rpb25zJ11cbiAgICAgICAgICAgICwgQGFwcHNDaG9zZW5cbiAgICAgICAgICAgIFxuICAgIGFwcHNDaG9zZW46IChmaWxlcykgPT4gXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGZpbGVzXG4gICAgICAgIGlmIG5vdCBmaWxlcyBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICBmaWxlcyA9IFtmaWxlc11cbiAgICAgICAgZm9yIGZpbGUgaW4gZmlsZXNcbiAgICAgICAgICAgIEBhcHBDaG9zZW4gZmlsZVxuICAgICAgICAgICAgXG4gICAgYXBwQ2hvc2VuOiAoZmlsZSkgLT5cbiAgICAgICAgXG4gICAgICAgIHBvc3QudG9NYWluICduZXdLYWNoZWwnIHNsYXNoLnBhdGggZmlsZVxuXG5tb2R1bGUuZXhwb3J0cyA9IERlZmF1bHRcbiJdfQ==
//# sourceURL=../coffee/default.coffee
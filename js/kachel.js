// koffee 1.4.0

/*
000   000   0000000    0000000  000   000  00000000  000        
000  000   000   000  000       000   000  000       000        
0000000    000000000  000       000000000  0000000   000        
000  000   000   000  000       000   000  000       000        
000   000  000   000   0000000  000   000  00000000  0000000
 */
var $, Bounds, Kachel, drag, elem, klog, kstr, os, post, prefs, ref, scheme, slash, stopEvent, win,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), drag = ref.drag, post = ref.post, scheme = ref.scheme, stopEvent = ref.stopEvent, prefs = ref.prefs, slash = ref.slash, klog = ref.klog, kstr = ref.kstr, elem = ref.elem, win = ref.win, os = ref.os, $ = ref.$;

Bounds = require('./bounds');

Kachel = (function(superClass) {
    extend(Kachel, superClass);

    function Kachel(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'kachel';
        this.onCombo = bind(this.onCombo, this);
        this.onMenuAction = bind(this.onMenuAction, this);
        this.setIcon = bind(this.setIcon, this);
        this.snapSize = bind(this.snapSize, this);
        this.onInitKachel = bind(this.onInitKachel, this);
        this.onWinClose = bind(this.onWinClose, this);
        this.onWinMove = bind(this.onWinMove, this);
        this.onWinShow = bind(this.onWinShow, this);
        this.onWinLoad = bind(this.onWinLoad, this);
        this.onWinBlur = bind(this.onWinBlur, this);
        this.onWinFocus = bind(this.onWinFocus, this);
        this.onLeave = bind(this.onLeave, this);
        this.onHover = bind(this.onHover, this);
        this.onSaveBounds = bind(this.onSaveBounds, this);
        this.onDragStop = bind(this.onDragStop, this);
        this.onDragMove = bind(this.onDragMove, this);
        this.onDragStart = bind(this.onDragStart, this);
        this.onContextMenu = bind(this.onContextMenu, this);
        Kachel.__super__.constructor.call(this, {
            prefsSeperator: '▸',
            dir: __dirname,
            pkg: require('../package.json'),
            menu: '../coffee/menu.noon',
            onLoad: this.onWinLoad
        });
        this.main = $('#main');
        this.drag = new drag({
            target: document.body,
            onStart: this.onDragStart,
            onMove: this.onDragMove,
            onStop: this.onDragStop
        });
        this.win.on('show', this.onWinShow);
        this.win.on('move', this.onWinMove);
        this.win.on('blur', this.onWinBlur);
        this.win.on('focus', this.onWinFocus);
        this.win.on('move', this.onWinMove);
        this.win.on('close', this.onWinClose);
        post.on('initKachel', this.onInitKachel);
        post.on('saveBounds', this.onSaveBounds);
        post.on('combo', this.onCombo);
        post.on('hover', this.onHover);
        post.on('leave', this.onLeave);
        post.on('toggleScheme', function() {
            return scheme.toggle();
        });
        if (this.kachelId !== 'main') {
            this.win.setSkipTaskbar(true);
        }
        post.toMain('kachelBounds', this.id, this.kachelId);
    }

    Kachel.prototype.requestData = function(name) {
        post.toMain('requestData', name, this.id);
        return post.on('data', this.onData);
    };

    Kachel.prototype.kachelSize = function() {
        return Bounds.kachelSize(this.win);
    };

    Kachel.prototype.onContextMenu = function(event) {
        return stopEvent(event);
    };

    Kachel.prototype.onDragStart = function(drag, event) {
        var ref1;
        if ((ref1 = this.win) != null ? ref1.isDestroyed() : void 0) {
            return;
        }
        this.startBounds = this.win.getBounds();
        return post.toMain('dragStart', this.id);
    };

    Kachel.prototype.onDragMove = function(drag, event) {
        this.win.setPosition(this.startBounds.x + drag.deltaSum.x, this.startBounds.y + drag.deltaSum.y);
        return this.win.setSize(this.startBounds.width, this.startBounds.height);
    };

    Kachel.prototype.onDragStop = function(drag, event) {
        if (Math.abs(drag.deltaSum.x) < 10 && Math.abs(drag.deltaSum.y) < 10) {
            this.win.setBounds(this.startBounds);
            if (event.button === 0) {
                this.onLeftClick(event);
            } else if (event.button === 1) {
                this.onMiddleClick(event);
            } else if (event.button === 2) {
                this.onRightClick(event);
            }
        } else {
            post.toMain('snapKachel', this.id);
        }
        return post.toMain('dragStop', this.id);
    };

    Kachel.prototype.onSaveBounds = function() {
        var i, j, setId;
        for (i = j = 1; j <= 6; i = ++j) {
            document.body.classList.remove("kachelSize" + i);
        }
        document.body.classList.add("kachelSize" + (this.kachelSize() + 1));
        setId = prefs.get('set', '');
        prefs.set("bounds" + setId + "▸" + this.kachelId, this.win.getBounds());
        return this.onBounds();
    };

    Kachel.prototype.onHover = function(event) {
        return document.body.classList.add('kachelHover');
    };

    Kachel.prototype.onLeave = function(event) {
        return document.body.classList.remove('kachelHover');
    };

    Kachel.prototype.onWinFocus = function(event) {
        document.body.classList.add('kachelFocus');
        post.toMain('kachelFocus', this.id);
        return this.onFocus(event);
    };

    Kachel.prototype.onWinBlur = function(event) {
        document.body.classList.remove('kachelFocus');
        return this.onBlur(event);
    };

    Kachel.prototype.onWinLoad = function(event) {
        return this.onLoad(event);
    };

    Kachel.prototype.onWinShow = function(event) {
        return this.onShow(event);
    };

    Kachel.prototype.onWinMove = function(event) {
        return this.onMove(event);
    };

    Kachel.prototype.onWinClose = function(event) {
        return this.onClose(event);
    };

    Kachel.prototype.onInitKachel = function(kachelId) {
        this.kachelId = kachelId;
        this.win.setTitle("kachel " + this.kachelId);
        post.toMain('kachelBounds', this.id, this.kachelId);
        return post.toMain('kachelLoad', this.id, this.kachelId);
    };

    Kachel.prototype.onLoad = function() {};

    Kachel.prototype.onShow = function() {};

    Kachel.prototype.onMove = function() {};

    Kachel.prototype.onFocus = function() {};

    Kachel.prototype.onBlur = function() {};

    Kachel.prototype.onMove = function() {};

    Kachel.prototype.onClose = function() {};

    Kachel.prototype.onBounds = function() {};

    Kachel.prototype.onLeftClick = function() {};

    Kachel.prototype.onMiddleClick = function() {};

    Kachel.prototype.onRightClick = function() {};

    Kachel.prototype.snapSize = function() {
        var br, i, j, k, ref1, ref2, sizes;
        br = this.win.getBounds();
        sizes = Bounds.snapSizes;
        for (i = j = 0, ref1 = sizes.length - 1; 0 <= ref1 ? j < ref1 : j > ref1; i = 0 <= ref1 ? ++j : --j) {
            if (br.width < sizes[i] + (sizes[i + 1] - sizes[i]) / 2) {
                br.width = sizes[i];
                break;
            }
        }
        br.width = Math.min(br.width, sizes.slice(-1)[0]);
        for (i = k = 0, ref2 = sizes.length - 1; 0 <= ref2 ? k < ref2 : k > ref2; i = 0 <= ref2 ? ++k : --k) {
            if (br.height < sizes[i] + (sizes[i + 1] - sizes[i]) / 2) {
                br.height = sizes[i];
                break;
            }
        }
        br.height = Math.min(br.height, sizes.slice(-1)[0]);
        return this.win.setBounds(br);
    };

    Kachel.prototype.setIcon = function(iconPath, clss) {
        var img;
        if (clss == null) {
            clss = 'applicon';
        }
        if (!iconPath) {
            return;
        }
        img = elem('img', {
            "class": clss,
            src: slash.fileUrl(slash.path(iconPath))
        });
        img.ondragstart = function() {
            return false;
        };
        this.main.innerHTML = '';
        return this.main.appendChild(img);
    };

    Kachel.prototype.onMenuAction = function(action) {
        switch (action) {
            case 'New':
                return post.toMain('newKachel', 'default');
            case 'Restore':
                return post.toMain('restoreSet');
            case 'Store':
                return post.toMain('storeSet');
            case 'Close':
                this.win.setClosable(true);
                return this.win.close();
            case 'Quit':
                return post.toMain('quit');
            case 'Hide':
                return post.toMain('hide');
            case 'About':
                return post.toMain('showAbout');
            case 'Scheme':
                return post.toWins('toggleScheme');
            case 'IncreaseSize':
                return post.toMain('kachelSize', 'increase');
            case 'DecreaseSize':
                return post.toMain('kachelSize', 'decrease');
            case 'ResetSize':
                return post.toMain('kachelSize', 'reset');
            case 'Increase':
                return post.toMain('kachelSize', 'increase', this.id);
            case 'Decrease':
                return post.toMain('kachelSize', 'decrease', this.id);
            case 'Reset':
                return post.toMain('kachelSize', 'reset', this.id);
            case 'MoveUp':
                return post.toMain('kachelMove', 'up', this.id);
            case 'MoveDown':
                return post.toMain('kachelMove', 'down', this.id);
            case 'MoveLeft':
                return post.toMain('kachelMove', 'left', this.id);
            case 'MoveRight':
                return post.toMain('kachelMove', 'right', this.id);
            case 'DevTools':
                return this.win.webContents.toggleDevTools();
            case 'Reload':
                return this.win.webContents.reloadIgnoringCache();
            case 'Screenshot':
                return this.screenshot();
            default:
                return klog('action', action);
        }
    };

    Kachel.prototype.onCombo = function(combo, info) {
        switch (combo) {
            case 'left':
            case 'right':
            case 'up':
            case 'down':
                return post.toMain('focusNeighbor', this.id, combo);
            case 'enter':
            case 'space':
                return this.onLeftClick();
            case 'command+enter':
            case 'command+space':
            case 'ctrl+enter':
            case 'ctrl+space':
                return this.onRightClick();
            case 'alt+command+enter':
            case 'alt+command+space':
            case 'alt+ctrl+enter':
            case 'alt+ctrl+space':
                return this.onMiddleClick();
        }
    };

    return Kachel;

})(win);

module.exports = Kachel;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2FjaGVsLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSw4RkFBQTtJQUFBOzs7O0FBUUEsTUFBZ0YsT0FBQSxDQUFRLEtBQVIsQ0FBaEYsRUFBRSxlQUFGLEVBQVEsZUFBUixFQUFjLG1CQUFkLEVBQXNCLHlCQUF0QixFQUFpQyxpQkFBakMsRUFBd0MsaUJBQXhDLEVBQStDLGVBQS9DLEVBQXFELGVBQXJELEVBQTJELGVBQTNELEVBQWlFLGFBQWpFLEVBQXNFLFdBQXRFLEVBQTBFOztBQUUxRSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0FBRUg7OztJQUVDLGdCQUFDLEdBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLGtEQUFTOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O1FBRVYsd0NBQ0k7WUFBQSxjQUFBLEVBQWdCLEdBQWhCO1lBQ0EsR0FBQSxFQUFRLFNBRFI7WUFFQSxHQUFBLEVBQVEsT0FBQSxDQUFRLGlCQUFSLENBRlI7WUFHQSxJQUFBLEVBQVEscUJBSFI7WUFJQSxNQUFBLEVBQVEsSUFBQyxDQUFBLFNBSlQ7U0FESjtRQU9BLElBQUMsQ0FBQSxJQUFELEdBQU8sQ0FBQSxDQUFFLE9BQUY7UUFFUCxJQUFDLENBQUEsSUFBRCxHQUFRLElBQUksSUFBSixDQUNKO1lBQUEsTUFBQSxFQUFVLFFBQVEsQ0FBQyxJQUFuQjtZQUNBLE9BQUEsRUFBVSxJQUFDLENBQUEsV0FEWDtZQUVBLE1BQUEsRUFBVSxJQUFDLENBQUEsVUFGWDtZQUdBLE1BQUEsRUFBVSxJQUFDLENBQUEsVUFIWDtTQURJO1FBTVIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFMLENBQVEsTUFBUixFQUFnQixJQUFDLENBQUEsU0FBakI7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxNQUFSLEVBQWdCLElBQUMsQ0FBQSxTQUFqQjtRQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLE1BQVIsRUFBZ0IsSUFBQyxDQUFBLFNBQWpCO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFMLENBQVEsT0FBUixFQUFnQixJQUFDLENBQUEsVUFBakI7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxNQUFSLEVBQWdCLElBQUMsQ0FBQSxTQUFqQjtRQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLE9BQVIsRUFBZ0IsSUFBQyxDQUFBLFVBQWpCO1FBRUEsSUFBSSxDQUFDLEVBQUwsQ0FBUSxZQUFSLEVBQXFCLElBQUMsQ0FBQSxZQUF0QjtRQUNBLElBQUksQ0FBQyxFQUFMLENBQVEsWUFBUixFQUFxQixJQUFDLENBQUEsWUFBdEI7UUFDQSxJQUFJLENBQUMsRUFBTCxDQUFRLE9BQVIsRUFBcUIsSUFBQyxDQUFBLE9BQXRCO1FBQ0EsSUFBSSxDQUFDLEVBQUwsQ0FBUSxPQUFSLEVBQXFCLElBQUMsQ0FBQSxPQUF0QjtRQUNBLElBQUksQ0FBQyxFQUFMLENBQVEsT0FBUixFQUFxQixJQUFDLENBQUEsT0FBdEI7UUFDQSxJQUFJLENBQUMsRUFBTCxDQUFRLGNBQVIsRUFBdUIsU0FBQTttQkFBRyxNQUFNLENBQUMsTUFBUCxDQUFBO1FBQUgsQ0FBdkI7UUFFQSxJQUFHLElBQUMsQ0FBQSxRQUFELEtBQWEsTUFBaEI7WUFDSSxJQUFDLENBQUEsR0FBRyxDQUFDLGNBQUwsQ0FBb0IsSUFBcEIsRUFESjs7UUFHQSxJQUFJLENBQUMsTUFBTCxDQUFZLGNBQVosRUFBMkIsSUFBQyxDQUFBLEVBQTVCLEVBQWdDLElBQUMsQ0FBQSxRQUFqQztJQWxDRDs7cUJBOENILFdBQUEsR0FBYSxTQUFDLElBQUQ7UUFFVCxJQUFJLENBQUMsTUFBTCxDQUFZLGFBQVosRUFBMEIsSUFBMUIsRUFBZ0MsSUFBQyxDQUFBLEVBQWpDO2VBQ0EsSUFBSSxDQUFDLEVBQUwsQ0FBUSxNQUFSLEVBQWUsSUFBQyxDQUFBLE1BQWhCO0lBSFM7O3FCQUtiLFVBQUEsR0FBWSxTQUFBO2VBQUcsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsSUFBQyxDQUFBLEdBQW5CO0lBQUg7O3FCQUVaLGFBQUEsR0FBZSxTQUFDLEtBQUQ7ZUFBVyxTQUFBLENBQVUsS0FBVjtJQUFYOztxQkFRZixXQUFBLEdBQWEsU0FBQyxJQUFELEVBQU8sS0FBUDtBQUVULFlBQUE7UUFBQSxvQ0FBTyxDQUFFLFdBQU4sQ0FBQSxVQUFIO0FBQ0ksbUJBREo7O1FBR0EsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFDLENBQUEsR0FBRyxDQUFDLFNBQUwsQ0FBQTtlQUNmLElBQUksQ0FBQyxNQUFMLENBQVksV0FBWixFQUF3QixJQUFDLENBQUEsRUFBekI7SUFOUzs7cUJBUWIsVUFBQSxHQUFZLFNBQUMsSUFBRCxFQUFPLEtBQVA7UUFFUixJQUFDLENBQUEsR0FBRyxDQUFDLFdBQUwsQ0FBaUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxDQUFiLEdBQWlCLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBaEQsRUFBbUQsSUFBQyxDQUFBLFdBQVcsQ0FBQyxDQUFiLEdBQWlCLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBbEY7ZUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLE9BQUwsQ0FBaUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxLQUE5QixFQUFxQyxJQUFDLENBQUEsV0FBVyxDQUFDLE1BQWxEO0lBSFE7O3FCQUtaLFVBQUEsR0FBWSxTQUFDLElBQUQsRUFBTyxLQUFQO1FBRVIsSUFBRyxJQUFJLENBQUMsR0FBTCxDQUFTLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBdkIsQ0FBQSxHQUE0QixFQUE1QixJQUFtQyxJQUFJLENBQUMsR0FBTCxDQUFTLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBdkIsQ0FBQSxHQUE0QixFQUFsRTtZQUNJLElBQUMsQ0FBQSxHQUFHLENBQUMsU0FBTCxDQUFlLElBQUMsQ0FBQSxXQUFoQjtZQUNBLElBQUcsS0FBSyxDQUFDLE1BQU4sS0FBZ0IsQ0FBbkI7Z0JBQ0ksSUFBQyxDQUFBLFdBQUQsQ0FBYSxLQUFiLEVBREo7YUFBQSxNQUVLLElBQUcsS0FBSyxDQUFDLE1BQU4sS0FBZ0IsQ0FBbkI7Z0JBQ0QsSUFBQyxDQUFBLGFBQUQsQ0FBZSxLQUFmLEVBREM7YUFBQSxNQUVBLElBQUcsS0FBSyxDQUFDLE1BQU4sS0FBZ0IsQ0FBbkI7Z0JBQ0QsSUFBQyxDQUFBLFlBQUQsQ0FBYyxLQUFkLEVBREM7YUFOVDtTQUFBLE1BQUE7WUFTSSxJQUFJLENBQUMsTUFBTCxDQUFZLFlBQVosRUFBeUIsSUFBQyxDQUFBLEVBQTFCLEVBVEo7O2VBVUEsSUFBSSxDQUFDLE1BQUwsQ0FBWSxVQUFaLEVBQXVCLElBQUMsQ0FBQSxFQUF4QjtJQVpROztxQkFjWixZQUFBLEdBQWMsU0FBQTtBQUVWLFlBQUE7QUFBQSxhQUFTLDBCQUFUO1lBQ0ksUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBeEIsQ0FBK0IsWUFBQSxHQUFhLENBQTVDO0FBREo7UUFFQSxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUF4QixDQUE0QixZQUFBLEdBQVksQ0FBQyxJQUFDLENBQUEsVUFBRCxDQUFBLENBQUEsR0FBYyxDQUFmLENBQXhDO1FBQ0EsS0FBQSxHQUFRLEtBQUssQ0FBQyxHQUFOLENBQVUsS0FBVixFQUFnQixFQUFoQjtRQUNSLEtBQUssQ0FBQyxHQUFOLENBQVUsUUFBQSxHQUFTLEtBQVQsR0FBZSxHQUFmLEdBQWtCLElBQUMsQ0FBQSxRQUE3QixFQUF3QyxJQUFDLENBQUEsR0FBRyxDQUFDLFNBQUwsQ0FBQSxDQUF4QztlQUNBLElBQUMsQ0FBQSxRQUFELENBQUE7SUFQVTs7cUJBU2QsT0FBQSxHQUFTLFNBQUMsS0FBRDtlQUFXLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQXhCLENBQTRCLGFBQTVCO0lBQVg7O3FCQUNULE9BQUEsR0FBUyxTQUFDLEtBQUQ7ZUFBVyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUF4QixDQUErQixhQUEvQjtJQUFYOztxQkFFVCxVQUFBLEdBQVksU0FBQyxLQUFEO1FBQVcsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBeEIsQ0FBK0IsYUFBL0I7UUFBOEMsSUFBSSxDQUFDLE1BQUwsQ0FBWSxhQUFaLEVBQTBCLElBQUMsQ0FBQSxFQUEzQjtlQUErQixJQUFDLENBQUEsT0FBRCxDQUFTLEtBQVQ7SUFBeEY7O3FCQUNaLFNBQUEsR0FBWSxTQUFDLEtBQUQ7UUFBVyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUF4QixDQUErQixhQUEvQjtlQUE4QyxJQUFDLENBQUEsTUFBRCxDQUFTLEtBQVQ7SUFBekQ7O3FCQUNaLFNBQUEsR0FBWSxTQUFDLEtBQUQ7ZUFBVyxJQUFDLENBQUEsTUFBRCxDQUFRLEtBQVI7SUFBWDs7cUJBQ1osU0FBQSxHQUFZLFNBQUMsS0FBRDtlQUFXLElBQUMsQ0FBQSxNQUFELENBQVEsS0FBUjtJQUFYOztxQkFDWixTQUFBLEdBQVksU0FBQyxLQUFEO2VBQVcsSUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSO0lBQVg7O3FCQUNaLFVBQUEsR0FBWSxTQUFDLEtBQUQ7ZUFBVyxJQUFDLENBQUEsT0FBRCxDQUFTLEtBQVQ7SUFBWDs7cUJBRVosWUFBQSxHQUFjLFNBQUMsUUFBRDtRQUFDLElBQUMsQ0FBQSxXQUFEO1FBSVgsSUFBQyxDQUFBLEdBQUcsQ0FBQyxRQUFMLENBQWMsU0FBQSxHQUFVLElBQUMsQ0FBQSxRQUF6QjtRQUVBLElBQUksQ0FBQyxNQUFMLENBQVksY0FBWixFQUEyQixJQUFDLENBQUEsRUFBNUIsRUFBZ0MsSUFBQyxDQUFBLFFBQWpDO2VBQ0EsSUFBSSxDQUFDLE1BQUwsQ0FBWSxZQUFaLEVBQXlCLElBQUMsQ0FBQSxFQUExQixFQUE4QixJQUFDLENBQUEsUUFBL0I7SUFQVTs7cUJBU2QsTUFBQSxHQUFlLFNBQUEsR0FBQTs7cUJBQ2YsTUFBQSxHQUFlLFNBQUEsR0FBQTs7cUJBQ2YsTUFBQSxHQUFlLFNBQUEsR0FBQTs7cUJBQ2YsT0FBQSxHQUFlLFNBQUEsR0FBQTs7cUJBQ2YsTUFBQSxHQUFlLFNBQUEsR0FBQTs7cUJBQ2YsTUFBQSxHQUFlLFNBQUEsR0FBQTs7cUJBQ2YsT0FBQSxHQUFlLFNBQUEsR0FBQTs7cUJBQ2YsUUFBQSxHQUFlLFNBQUEsR0FBQTs7cUJBQ2YsV0FBQSxHQUFlLFNBQUEsR0FBQTs7cUJBQ2YsYUFBQSxHQUFlLFNBQUEsR0FBQTs7cUJBQ2YsWUFBQSxHQUFlLFNBQUEsR0FBQTs7cUJBUWYsUUFBQSxHQUFVLFNBQUE7QUFFTixZQUFBO1FBQUEsRUFBQSxHQUFLLElBQUMsQ0FBQSxHQUFHLENBQUMsU0FBTCxDQUFBO1FBRUwsS0FBQSxHQUFRLE1BQU0sQ0FBQztBQUVmLGFBQVMsOEZBQVQ7WUFDSSxJQUFHLEVBQUUsQ0FBQyxLQUFILEdBQVcsS0FBTSxDQUFBLENBQUEsQ0FBTixHQUFXLENBQUMsS0FBTSxDQUFBLENBQUEsR0FBRSxDQUFGLENBQU4sR0FBYSxLQUFNLENBQUEsQ0FBQSxDQUFwQixDQUFBLEdBQTBCLENBQW5EO2dCQUNJLEVBQUUsQ0FBQyxLQUFILEdBQVcsS0FBTSxDQUFBLENBQUE7QUFDakIsc0JBRko7O0FBREo7UUFJQSxFQUFFLENBQUMsS0FBSCxHQUFXLElBQUksQ0FBQyxHQUFMLENBQVMsRUFBRSxDQUFDLEtBQVosRUFBbUIsS0FBTSxVQUFFLENBQUEsQ0FBQSxDQUEzQjtBQUVYLGFBQVMsOEZBQVQ7WUFDSSxJQUFHLEVBQUUsQ0FBQyxNQUFILEdBQVksS0FBTSxDQUFBLENBQUEsQ0FBTixHQUFXLENBQUMsS0FBTSxDQUFBLENBQUEsR0FBRSxDQUFGLENBQU4sR0FBYSxLQUFNLENBQUEsQ0FBQSxDQUFwQixDQUFBLEdBQTBCLENBQXBEO2dCQUNJLEVBQUUsQ0FBQyxNQUFILEdBQVksS0FBTSxDQUFBLENBQUE7QUFDbEIsc0JBRko7O0FBREo7UUFJQSxFQUFFLENBQUMsTUFBSCxHQUFZLElBQUksQ0FBQyxHQUFMLENBQVMsRUFBRSxDQUFDLE1BQVosRUFBb0IsS0FBTSxVQUFFLENBQUEsQ0FBQSxDQUE1QjtlQUVaLElBQUMsQ0FBQSxHQUFHLENBQUMsU0FBTCxDQUFlLEVBQWY7SUFsQk07O3FCQTBCVixPQUFBLEdBQVMsU0FBQyxRQUFELEVBQVcsSUFBWDtBQUVMLFlBQUE7O1lBRmdCLE9BQUs7O1FBRXJCLElBQVUsQ0FBSSxRQUFkO0FBQUEsbUJBQUE7O1FBQ0EsR0FBQSxHQUFNLElBQUEsQ0FBSyxLQUFMLEVBQVc7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLElBQU47WUFBWSxHQUFBLEVBQUksS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFLLENBQUMsSUFBTixDQUFXLFFBQVgsQ0FBZCxDQUFoQjtTQUFYO1FBQ04sR0FBRyxDQUFDLFdBQUosR0FBa0IsU0FBQTttQkFBRztRQUFIO1FBQ2xCLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBTixHQUFrQjtlQUNsQixJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsR0FBbEI7SUFOSzs7cUJBY1QsWUFBQSxHQUFjLFNBQUMsTUFBRDtBQUVWLGdCQUFPLE1BQVA7QUFBQSxpQkFDUyxLQURUO3VCQUM2QixJQUFJLENBQUMsTUFBTCxDQUFZLFdBQVosRUFBd0IsU0FBeEI7QUFEN0IsaUJBRVMsU0FGVDt1QkFFNkIsSUFBSSxDQUFDLE1BQUwsQ0FBWSxZQUFaO0FBRjdCLGlCQUdTLE9BSFQ7dUJBRzZCLElBQUksQ0FBQyxNQUFMLENBQVksVUFBWjtBQUg3QixpQkFJUyxPQUpUO2dCQUk2QixJQUFDLENBQUEsR0FBRyxDQUFDLFdBQUwsQ0FBaUIsSUFBakI7dUJBQXdCLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBTCxDQUFBO0FBSnJELGlCQUtTLE1BTFQ7dUJBSzZCLElBQUksQ0FBQyxNQUFMLENBQVksTUFBWjtBQUw3QixpQkFNUyxNQU5UO3VCQU02QixJQUFJLENBQUMsTUFBTCxDQUFZLE1BQVo7QUFON0IsaUJBT1MsT0FQVDt1QkFPNkIsSUFBSSxDQUFDLE1BQUwsQ0FBWSxXQUFaO0FBUDdCLGlCQVFTLFFBUlQ7dUJBUTZCLElBQUksQ0FBQyxNQUFMLENBQVksY0FBWjtBQVI3QixpQkFTUyxjQVRUO3VCQVM2QixJQUFJLENBQUMsTUFBTCxDQUFZLFlBQVosRUFBeUIsVUFBekI7QUFUN0IsaUJBVVMsY0FWVDt1QkFVNkIsSUFBSSxDQUFDLE1BQUwsQ0FBWSxZQUFaLEVBQXlCLFVBQXpCO0FBVjdCLGlCQVdTLFdBWFQ7dUJBVzZCLElBQUksQ0FBQyxNQUFMLENBQVksWUFBWixFQUF5QixPQUF6QjtBQVg3QixpQkFZUyxVQVpUO3VCQVk2QixJQUFJLENBQUMsTUFBTCxDQUFZLFlBQVosRUFBeUIsVUFBekIsRUFBb0MsSUFBQyxDQUFBLEVBQXJDO0FBWjdCLGlCQWFTLFVBYlQ7dUJBYTZCLElBQUksQ0FBQyxNQUFMLENBQVksWUFBWixFQUF5QixVQUF6QixFQUFvQyxJQUFDLENBQUEsRUFBckM7QUFiN0IsaUJBY1MsT0FkVDt1QkFjNkIsSUFBSSxDQUFDLE1BQUwsQ0FBWSxZQUFaLEVBQXlCLE9BQXpCLEVBQW9DLElBQUMsQ0FBQSxFQUFyQztBQWQ3QixpQkFlUyxRQWZUO3VCQWU2QixJQUFJLENBQUMsTUFBTCxDQUFZLFlBQVosRUFBeUIsSUFBekIsRUFBb0MsSUFBQyxDQUFBLEVBQXJDO0FBZjdCLGlCQWdCUyxVQWhCVDt1QkFnQjZCLElBQUksQ0FBQyxNQUFMLENBQVksWUFBWixFQUF5QixNQUF6QixFQUFvQyxJQUFDLENBQUEsRUFBckM7QUFoQjdCLGlCQWlCUyxVQWpCVDt1QkFpQjZCLElBQUksQ0FBQyxNQUFMLENBQVksWUFBWixFQUF5QixNQUF6QixFQUFvQyxJQUFDLENBQUEsRUFBckM7QUFqQjdCLGlCQWtCUyxXQWxCVDt1QkFrQjZCLElBQUksQ0FBQyxNQUFMLENBQVksWUFBWixFQUF5QixPQUF6QixFQUFvQyxJQUFDLENBQUEsRUFBckM7QUFsQjdCLGlCQW1CUyxVQW5CVDt1QkFtQjZCLElBQUMsQ0FBQSxHQUFHLENBQUMsV0FBVyxDQUFDLGNBQWpCLENBQUE7QUFuQjdCLGlCQW9CUyxRQXBCVDt1QkFvQjZCLElBQUMsQ0FBQSxHQUFHLENBQUMsV0FBVyxDQUFDLG1CQUFqQixDQUFBO0FBcEI3QixpQkFxQlMsWUFyQlQ7dUJBcUI2QixJQUFDLENBQUEsVUFBRCxDQUFBO0FBckI3Qjt1QkF1QlEsSUFBQSxDQUFLLFFBQUwsRUFBYyxNQUFkO0FBdkJSO0lBRlU7O3FCQWlDZCxPQUFBLEdBQVMsU0FBQyxLQUFELEVBQVEsSUFBUjtBQUVMLGdCQUFPLEtBQVA7QUFBQSxpQkFDUyxNQURUO0FBQUEsaUJBQ2UsT0FEZjtBQUFBLGlCQUNzQixJQUR0QjtBQUFBLGlCQUMwQixNQUQxQjt1QkFDc0MsSUFBSSxDQUFDLE1BQUwsQ0FBWSxlQUFaLEVBQTRCLElBQUMsQ0FBQSxFQUE3QixFQUFpQyxLQUFqQztBQUR0QyxpQkFFUyxPQUZUO0FBQUEsaUJBRWdCLE9BRmhCO3VCQUU2QixJQUFDLENBQUEsV0FBRCxDQUFBO0FBRjdCLGlCQUdTLGVBSFQ7QUFBQSxpQkFHd0IsZUFIeEI7QUFBQSxpQkFHdUMsWUFIdkM7QUFBQSxpQkFHbUQsWUFIbkQ7dUJBR3FFLElBQUMsQ0FBQSxZQUFELENBQUE7QUFIckUsaUJBSVMsbUJBSlQ7QUFBQSxpQkFJNEIsbUJBSjVCO0FBQUEsaUJBSStDLGdCQUovQztBQUFBLGlCQUkrRCxnQkFKL0Q7dUJBSXFGLElBQUMsQ0FBQSxhQUFELENBQUE7QUFKckY7SUFGSzs7OztHQWpOUTs7QUF5TnJCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgICAgXG4wMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgXG4wMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgICAgXG4wMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4jIyNcblxueyBkcmFnLCBwb3N0LCBzY2hlbWUsIHN0b3BFdmVudCwgcHJlZnMsIHNsYXNoLCBrbG9nLCBrc3RyLCBlbGVtLCB3aW4sIG9zLCAkIH0gPSByZXF1aXJlICdreGsnXG5cbkJvdW5kcyA9IHJlcXVpcmUgJy4vYm91bmRzJ1xuXG5jbGFzcyBLYWNoZWwgZXh0ZW5kcyB3aW5cblxuICAgIEA6IChAa2FjaGVsSWQ6J2thY2hlbCcpIC0+XG4gICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICAgICAgcHJlZnNTZXBlcmF0b3I6ICfilrgnXG4gICAgICAgICAgICBkaXI6ICAgIF9fZGlybmFtZVxuICAgICAgICAgICAgcGtnOiAgICByZXF1aXJlICcuLi9wYWNrYWdlLmpzb24nXG4gICAgICAgICAgICBtZW51OiAgICcuLi9jb2ZmZWUvbWVudS5ub29uJ1xuICAgICAgICAgICAgb25Mb2FkOiBAb25XaW5Mb2FkXG4gICAgXG4gICAgICAgIEBtYWluID0kICcjbWFpbidcbiAgICAgICAgXG4gICAgICAgIEBkcmFnID0gbmV3IGRyYWdcbiAgICAgICAgICAgIHRhcmdldDogICBkb2N1bWVudC5ib2R5XG4gICAgICAgICAgICBvblN0YXJ0OiAgQG9uRHJhZ1N0YXJ0XG4gICAgICAgICAgICBvbk1vdmU6ICAgQG9uRHJhZ01vdmVcbiAgICAgICAgICAgIG9uU3RvcDogICBAb25EcmFnU3RvcFxuICAgICAgICBcbiAgICAgICAgQHdpbi5vbiAnc2hvdycgIEBvbldpblNob3dcbiAgICAgICAgQHdpbi5vbiAnbW92ZScgIEBvbldpbk1vdmVcbiAgICAgICAgQHdpbi5vbiAnYmx1cicgIEBvbldpbkJsdXJcbiAgICAgICAgQHdpbi5vbiAnZm9jdXMnIEBvbldpbkZvY3VzXG4gICAgICAgIEB3aW4ub24gJ21vdmUnICBAb25XaW5Nb3ZlXG4gICAgICAgIEB3aW4ub24gJ2Nsb3NlJyBAb25XaW5DbG9zZVxuICAgICAgICBcbiAgICAgICAgcG9zdC5vbiAnaW5pdEthY2hlbCcgQG9uSW5pdEthY2hlbFxuICAgICAgICBwb3N0Lm9uICdzYXZlQm91bmRzJyBAb25TYXZlQm91bmRzXG4gICAgICAgIHBvc3Qub24gJ2NvbWJvJyAgICAgIEBvbkNvbWJvXG4gICAgICAgIHBvc3Qub24gJ2hvdmVyJyAgICAgIEBvbkhvdmVyXG4gICAgICAgIHBvc3Qub24gJ2xlYXZlJyAgICAgIEBvbkxlYXZlXG4gICAgICAgIHBvc3Qub24gJ3RvZ2dsZVNjaGVtZScgLT4gc2NoZW1lLnRvZ2dsZSgpXG4gICAgICAgIFxuICAgICAgICBpZiBAa2FjaGVsSWQgIT0gJ21haW4nXG4gICAgICAgICAgICBAd2luLnNldFNraXBUYXNrYmFyIHRydWVcbiAgICAgICAgXG4gICAgICAgIHBvc3QudG9NYWluICdrYWNoZWxCb3VuZHMnIEBpZCwgQGthY2hlbElkXG4gICAgICAgIFxuICAgICAgICAjIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ2RhcndpbidcbiAgICAgICAgICAgICMgaWYgcGFyc2VJbnQob3MucmVsZWFzZSgpLnNwbGl0KCcuJylbMF0pID49IDE4XG4gICAgICAgICAgICAgICAgIyBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQgJ21vamF2ZSdcbiAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAwMCAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAgIDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwIDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAgIDAwMCAgICAgMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAgMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAgICAgICAwMDAgICBcbiAgICBcbiAgICByZXF1ZXN0RGF0YTogKG5hbWUpIC0+XG4gICAgICAgIFxuICAgICAgICBwb3N0LnRvTWFpbiAncmVxdWVzdERhdGEnIG5hbWUsIEBpZFxuICAgICAgICBwb3N0Lm9uICdkYXRhJyBAb25EYXRhXG4gICAgICAgICAgICAgICAgXG4gICAga2FjaGVsU2l6ZTogLT4gQm91bmRzLmthY2hlbFNpemUgQHdpblxuICAgICAgICAgICAgXG4gICAgb25Db250ZXh0TWVudTogKGV2ZW50KSA9PiBzdG9wRXZlbnQgZXZlbnQgXG4gICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBvbkRyYWdTdGFydDogKGRyYWcsIGV2ZW50KSA9PlxuICAgIFxuICAgICAgICBpZiBAd2luPy5pc0Rlc3Ryb3llZCgpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICBAc3RhcnRCb3VuZHMgPSBAd2luLmdldEJvdW5kcygpXG4gICAgICAgIHBvc3QudG9NYWluICdkcmFnU3RhcnQnIEBpZFxuICAgICAgICBcbiAgICBvbkRyYWdNb3ZlOiAoZHJhZywgZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICBAd2luLnNldFBvc2l0aW9uIEBzdGFydEJvdW5kcy54ICsgZHJhZy5kZWx0YVN1bS54LCBAc3RhcnRCb3VuZHMueSArIGRyYWcuZGVsdGFTdW0ueVxuICAgICAgICBAd2luLnNldFNpemUgICAgIEBzdGFydEJvdW5kcy53aWR0aCwgQHN0YXJ0Qm91bmRzLmhlaWdodFxuICAgICAgICBcbiAgICBvbkRyYWdTdG9wOiAoZHJhZywgZXZlbnQpID0+XG5cbiAgICAgICAgaWYgTWF0aC5hYnMoZHJhZy5kZWx0YVN1bS54KSA8IDEwIGFuZCBNYXRoLmFicyhkcmFnLmRlbHRhU3VtLnkpIDwgMTBcbiAgICAgICAgICAgIEB3aW4uc2V0Qm91bmRzIEBzdGFydEJvdW5kc1xuICAgICAgICAgICAgaWYgZXZlbnQuYnV0dG9uID09IDBcbiAgICAgICAgICAgICAgICBAb25MZWZ0Q2xpY2sgZXZlbnRcbiAgICAgICAgICAgIGVsc2UgaWYgZXZlbnQuYnV0dG9uID09IDFcbiAgICAgICAgICAgICAgICBAb25NaWRkbGVDbGljayBldmVudFxuICAgICAgICAgICAgZWxzZSBpZiBldmVudC5idXR0b24gPT0gMlxuICAgICAgICAgICAgICAgIEBvblJpZ2h0Q2xpY2sgZXZlbnRcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcG9zdC50b01haW4gJ3NuYXBLYWNoZWwnIEBpZFxuICAgICAgICBwb3N0LnRvTWFpbiAnZHJhZ1N0b3AnIEBpZFxuICAgIFxuICAgIG9uU2F2ZUJvdW5kczogPT5cbiAgICAgICAgIyBrbG9nICdvblNhdmVCb3VuZHMnIEBpZFxuICAgICAgICBmb3IgaSBpbiBbMS4uNl1cbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSBcImthY2hlbFNpemUje2l9XCJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkIFwia2FjaGVsU2l6ZSN7QGthY2hlbFNpemUoKSsxfVwiXG4gICAgICAgIHNldElkID0gcHJlZnMuZ2V0ICdzZXQnICcnXG4gICAgICAgIHByZWZzLnNldCBcImJvdW5kcyN7c2V0SWR94pa4I3tAa2FjaGVsSWR9XCIgQHdpbi5nZXRCb3VuZHMoKVxuICAgICAgICBAb25Cb3VuZHMoKVxuICAgICAgICBcbiAgICBvbkhvdmVyOiAoZXZlbnQpID0+IGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCAna2FjaGVsSG92ZXInXG4gICAgb25MZWF2ZTogKGV2ZW50KSA9PiBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUgJ2thY2hlbEhvdmVyJ1xuICAgICAgICBcbiAgICBvbldpbkZvY3VzOiAoZXZlbnQpID0+IGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCAgICAna2FjaGVsRm9jdXMnOyBwb3N0LnRvTWFpbiAna2FjaGVsRm9jdXMnIEBpZDsgQG9uRm9jdXMgZXZlbnRcbiAgICBvbldpbkJsdXI6ICAoZXZlbnQpID0+IGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSAna2FjaGVsRm9jdXMnOyBAb25CbHVyICBldmVudFxuICAgIG9uV2luTG9hZDogIChldmVudCkgPT4gQG9uTG9hZCBldmVudFxuICAgIG9uV2luU2hvdzogIChldmVudCkgPT4gQG9uU2hvdyBldmVudFxuICAgIG9uV2luTW92ZTogIChldmVudCkgPT4gQG9uTW92ZSBldmVudFxuICAgIG9uV2luQ2xvc2U6IChldmVudCkgPT4gQG9uQ2xvc2UgZXZlbnRcbiAgICAgICAgXG4gICAgb25Jbml0S2FjaGVsOiAoQGthY2hlbElkKSA9PlxuICAgICAgICAgICBcbiAgICAgICAgIyBrbG9nICdvbkluaXRLYWNoZWwgQGthY2hlbElkJyBAa2FjaGVsSWRcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQHdpbi5zZXRUaXRsZSBcImthY2hlbCAje0BrYWNoZWxJZH1cIlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBwb3N0LnRvTWFpbiAna2FjaGVsQm91bmRzJyBAaWQsIEBrYWNoZWxJZFxuICAgICAgICBwb3N0LnRvTWFpbiAna2FjaGVsTG9hZCcgQGlkLCBAa2FjaGVsSWRcbiAgICBcbiAgICBvbkxvYWQ6ICAgICAgICAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uU2hvdzogICAgICAgIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25Nb3ZlOiAgICAgICAgLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvbkZvY3VzOiAgICAgICAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uQmx1cjogICAgICAgIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25Nb3ZlOiAgICAgICAgLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvbkNsb3NlOiAgICAgICAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uQm91bmRzOiAgICAgIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25MZWZ0Q2xpY2s6ICAgLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvbk1pZGRsZUNsaWNrOiAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uUmlnaHRDbGljazogIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAwMDAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAwMDAgICAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgc25hcFNpemU6ID0+XG4gICAgICAgIFxuICAgICAgICBiciA9IEB3aW4uZ2V0Qm91bmRzKClcbiAgICAgICAgXG4gICAgICAgIHNpemVzID0gQm91bmRzLnNuYXBTaXplc1xuICAgICAgICBcbiAgICAgICAgZm9yIGkgaW4gWzAuLi5zaXplcy5sZW5ndGgtMV1cbiAgICAgICAgICAgIGlmIGJyLndpZHRoIDwgc2l6ZXNbaV0gKyAoc2l6ZXNbaSsxXSAtIHNpemVzW2ldKSAvIDJcbiAgICAgICAgICAgICAgICBici53aWR0aCA9IHNpemVzW2ldXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgYnIud2lkdGggPSBNYXRoLm1pbiBici53aWR0aCwgc2l6ZXNbLTFdXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGZvciBpIGluIFswLi4uc2l6ZXMubGVuZ3RoLTFdXG4gICAgICAgICAgICBpZiBici5oZWlnaHQgPCBzaXplc1tpXSArIChzaXplc1tpKzFdIC0gc2l6ZXNbaV0pIC8gMlxuICAgICAgICAgICAgICAgIGJyLmhlaWdodCA9IHNpemVzW2ldXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgYnIuaGVpZ2h0ID0gTWF0aC5taW4gYnIuaGVpZ2h0LCBzaXplc1stMV1cbiAgICAgICAgXG4gICAgICAgIEB3aW4uc2V0Qm91bmRzIGJyXG4gICAgXG4gICAgIyAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgc2V0SWNvbjogKGljb25QYXRoLCBjbHNzPSdhcHBsaWNvbicpID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGljb25QYXRoXG4gICAgICAgIGltZyA9IGVsZW0gJ2ltZycgY2xhc3M6Y2xzcywgc3JjOnNsYXNoLmZpbGVVcmwgc2xhc2gucGF0aCBpY29uUGF0aFxuICAgICAgICBpbWcub25kcmFnc3RhcnQgPSAtPiBmYWxzZVxuICAgICAgICBAbWFpbi5pbm5lckhUTUwgPSAnJ1xuICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBpbWdcbiAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwIFxuICAgIFxuICAgIG9uTWVudUFjdGlvbjogKGFjdGlvbikgPT5cbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBhY3Rpb25cbiAgICAgICAgICAgIHdoZW4gJ05ldycgICAgICAgICAgdGhlbiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAnZGVmYXVsdCdcbiAgICAgICAgICAgIHdoZW4gJ1Jlc3RvcmUnICAgICAgdGhlbiBwb3N0LnRvTWFpbiAncmVzdG9yZVNldCdcbiAgICAgICAgICAgIHdoZW4gJ1N0b3JlJyAgICAgICAgdGhlbiBwb3N0LnRvTWFpbiAnc3RvcmVTZXQnXG4gICAgICAgICAgICB3aGVuICdDbG9zZScgICAgICAgIHRoZW4gQHdpbi5zZXRDbG9zYWJsZSh0cnVlKTsgQHdpbi5jbG9zZSgpXG4gICAgICAgICAgICB3aGVuICdRdWl0JyAgICAgICAgIHRoZW4gcG9zdC50b01haW4gJ3F1aXQnXG4gICAgICAgICAgICB3aGVuICdIaWRlJyAgICAgICAgIHRoZW4gcG9zdC50b01haW4gJ2hpZGUnXG4gICAgICAgICAgICB3aGVuICdBYm91dCcgICAgICAgIHRoZW4gcG9zdC50b01haW4gJ3Nob3dBYm91dCdcbiAgICAgICAgICAgIHdoZW4gJ1NjaGVtZScgICAgICAgdGhlbiBwb3N0LnRvV2lucyAndG9nZ2xlU2NoZW1lJ1xuICAgICAgICAgICAgd2hlbiAnSW5jcmVhc2VTaXplJyB0aGVuIHBvc3QudG9NYWluICdrYWNoZWxTaXplJyAnaW5jcmVhc2UnXG4gICAgICAgICAgICB3aGVuICdEZWNyZWFzZVNpemUnIHRoZW4gcG9zdC50b01haW4gJ2thY2hlbFNpemUnICdkZWNyZWFzZSdcbiAgICAgICAgICAgIHdoZW4gJ1Jlc2V0U2l6ZScgICAgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsU2l6ZScgJ3Jlc2V0J1xuICAgICAgICAgICAgd2hlbiAnSW5jcmVhc2UnICAgICB0aGVuIHBvc3QudG9NYWluICdrYWNoZWxTaXplJyAnaW5jcmVhc2UnIEBpZFxuICAgICAgICAgICAgd2hlbiAnRGVjcmVhc2UnICAgICB0aGVuIHBvc3QudG9NYWluICdrYWNoZWxTaXplJyAnZGVjcmVhc2UnIEBpZFxuICAgICAgICAgICAgd2hlbiAnUmVzZXQnICAgICAgICB0aGVuIHBvc3QudG9NYWluICdrYWNoZWxTaXplJyAncmVzZXQnICAgIEBpZFxuICAgICAgICAgICAgd2hlbiAnTW92ZVVwJyAgICAgICB0aGVuIHBvc3QudG9NYWluICdrYWNoZWxNb3ZlJyAndXAnICAgICAgIEBpZFxuICAgICAgICAgICAgd2hlbiAnTW92ZURvd24nICAgICB0aGVuIHBvc3QudG9NYWluICdrYWNoZWxNb3ZlJyAnZG93bicgICAgIEBpZFxuICAgICAgICAgICAgd2hlbiAnTW92ZUxlZnQnICAgICB0aGVuIHBvc3QudG9NYWluICdrYWNoZWxNb3ZlJyAnbGVmdCcgICAgIEBpZFxuICAgICAgICAgICAgd2hlbiAnTW92ZVJpZ2h0JyAgICB0aGVuIHBvc3QudG9NYWluICdrYWNoZWxNb3ZlJyAncmlnaHQnICAgIEBpZFxuICAgICAgICAgICAgd2hlbiAnRGV2VG9vbHMnICAgICB0aGVuIEB3aW4ud2ViQ29udGVudHMudG9nZ2xlRGV2VG9vbHMoKVxuICAgICAgICAgICAgd2hlbiAnUmVsb2FkJyAgICAgICB0aGVuIEB3aW4ud2ViQ29udGVudHMucmVsb2FkSWdub3JpbmdDYWNoZSgpXG4gICAgICAgICAgICB3aGVuICdTY3JlZW5zaG90JyAgIHRoZW4gQHNjcmVlbnNob3QoKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGtsb2cgJ2FjdGlvbicgYWN0aW9uXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgb25Db21ibzogKGNvbWJvLCBpbmZvKSA9PlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBzd2l0Y2ggY29tYm9cbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnJ3JpZ2h0Jyd1cCcnZG93bicgdGhlbiBwb3N0LnRvTWFpbiAnZm9jdXNOZWlnaGJvcicgQGlkLCBjb21ib1xuICAgICAgICAgICAgd2hlbiAnZW50ZXInJ3NwYWNlJyB0aGVuIEBvbkxlZnRDbGljaygpXG4gICAgICAgICAgICB3aGVuICdjb21tYW5kK2VudGVyJydjb21tYW5kK3NwYWNlJydjdHJsK2VudGVyJydjdHJsK3NwYWNlJyB0aGVuIEBvblJpZ2h0Q2xpY2soKVxuICAgICAgICAgICAgd2hlbiAnYWx0K2NvbW1hbmQrZW50ZXInJ2FsdCtjb21tYW5kK3NwYWNlJydhbHQrY3RybCtlbnRlcicnYWx0K2N0cmwrc3BhY2UnIHRoZW4gQG9uTWlkZGxlQ2xpY2soKVxuICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEthY2hlbFxuIl19
//# sourceURL=../coffee/kachel.coffee
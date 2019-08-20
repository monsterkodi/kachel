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

    Kachel.prototype.setIcon = function(iconPath) {
        var img;
        if (!iconPath) {
            return;
        }
        img = elem('img', {
            "class": 'applicon',
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2FjaGVsLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSw4RkFBQTtJQUFBOzs7O0FBUUEsTUFBZ0YsT0FBQSxDQUFRLEtBQVIsQ0FBaEYsRUFBRSxlQUFGLEVBQVEsZUFBUixFQUFjLG1CQUFkLEVBQXNCLHlCQUF0QixFQUFpQyxpQkFBakMsRUFBd0MsaUJBQXhDLEVBQStDLGVBQS9DLEVBQXFELGVBQXJELEVBQTJELGVBQTNELEVBQWlFLGFBQWpFLEVBQXNFLFdBQXRFLEVBQTBFOztBQUUxRSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0FBRUg7OztJQUVDLGdCQUFDLEdBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLGtEQUFTOzs7Ozs7Ozs7Ozs7Ozs7Ozs7UUFFVix3Q0FDSTtZQUFBLGNBQUEsRUFBZ0IsR0FBaEI7WUFDQSxHQUFBLEVBQVEsU0FEUjtZQUVBLEdBQUEsRUFBUSxPQUFBLENBQVEsaUJBQVIsQ0FGUjtZQUdBLElBQUEsRUFBUSxxQkFIUjtZQUlBLE1BQUEsRUFBUSxJQUFDLENBQUEsU0FKVDtTQURKO1FBT0EsSUFBQyxDQUFBLElBQUQsR0FBTyxDQUFBLENBQUUsT0FBRjtRQUVQLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBSSxJQUFKLENBQ0o7WUFBQSxNQUFBLEVBQVUsUUFBUSxDQUFDLElBQW5CO1lBQ0EsT0FBQSxFQUFVLElBQUMsQ0FBQSxXQURYO1lBRUEsTUFBQSxFQUFVLElBQUMsQ0FBQSxVQUZYO1lBR0EsTUFBQSxFQUFVLElBQUMsQ0FBQSxVQUhYO1NBREk7UUFNUixJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxNQUFSLEVBQWdCLElBQUMsQ0FBQSxTQUFqQjtRQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLE1BQVIsRUFBZ0IsSUFBQyxDQUFBLFNBQWpCO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFMLENBQVEsTUFBUixFQUFnQixJQUFDLENBQUEsU0FBakI7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxPQUFSLEVBQWdCLElBQUMsQ0FBQSxVQUFqQjtRQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLE1BQVIsRUFBZ0IsSUFBQyxDQUFBLFNBQWpCO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFMLENBQVEsT0FBUixFQUFnQixJQUFDLENBQUEsVUFBakI7UUFFQSxJQUFJLENBQUMsRUFBTCxDQUFRLFlBQVIsRUFBcUIsSUFBQyxDQUFBLFlBQXRCO1FBQ0EsSUFBSSxDQUFDLEVBQUwsQ0FBUSxZQUFSLEVBQXFCLElBQUMsQ0FBQSxZQUF0QjtRQUNBLElBQUksQ0FBQyxFQUFMLENBQVEsT0FBUixFQUFxQixJQUFDLENBQUEsT0FBdEI7UUFDQSxJQUFJLENBQUMsRUFBTCxDQUFRLE9BQVIsRUFBcUIsSUFBQyxDQUFBLE9BQXRCO1FBQ0EsSUFBSSxDQUFDLEVBQUwsQ0FBUSxPQUFSLEVBQXFCLElBQUMsQ0FBQSxPQUF0QjtRQUNBLElBQUksQ0FBQyxFQUFMLENBQVEsY0FBUixFQUF1QixTQUFBO21CQUFHLE1BQU0sQ0FBQyxNQUFQLENBQUE7UUFBSCxDQUF2QjtRQUVBLElBQUcsSUFBQyxDQUFBLFFBQUQsS0FBYSxNQUFoQjtZQUNJLElBQUMsQ0FBQSxHQUFHLENBQUMsY0FBTCxDQUFvQixJQUFwQixFQURKOztRQUdBLElBQUksQ0FBQyxNQUFMLENBQVksY0FBWixFQUEyQixJQUFDLENBQUEsRUFBNUIsRUFBZ0MsSUFBQyxDQUFBLFFBQWpDO0lBbENEOztxQkE4Q0gsV0FBQSxHQUFhLFNBQUMsSUFBRDtRQUVULElBQUksQ0FBQyxNQUFMLENBQVksYUFBWixFQUEwQixJQUExQixFQUFnQyxJQUFDLENBQUEsRUFBakM7ZUFDQSxJQUFJLENBQUMsRUFBTCxDQUFRLE1BQVIsRUFBZSxJQUFDLENBQUEsTUFBaEI7SUFIUzs7cUJBS2IsVUFBQSxHQUFZLFNBQUE7ZUFBRyxNQUFNLENBQUMsVUFBUCxDQUFrQixJQUFDLENBQUEsR0FBbkI7SUFBSDs7cUJBRVosYUFBQSxHQUFlLFNBQUMsS0FBRDtlQUFXLFNBQUEsQ0FBVSxLQUFWO0lBQVg7O3FCQVFmLFdBQUEsR0FBYSxTQUFDLElBQUQsRUFBTyxLQUFQO0FBRVQsWUFBQTtRQUFBLG9DQUFPLENBQUUsV0FBTixDQUFBLFVBQUg7QUFDSSxtQkFESjs7UUFHQSxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUMsQ0FBQSxHQUFHLENBQUMsU0FBTCxDQUFBO2VBQ2YsSUFBSSxDQUFDLE1BQUwsQ0FBWSxXQUFaLEVBQXdCLElBQUMsQ0FBQSxFQUF6QjtJQU5TOztxQkFRYixVQUFBLEdBQVksU0FBQyxJQUFELEVBQU8sS0FBUDtRQUVSLElBQUMsQ0FBQSxHQUFHLENBQUMsV0FBTCxDQUFpQixJQUFDLENBQUEsV0FBVyxDQUFDLENBQWIsR0FBaUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFoRCxFQUFtRCxJQUFDLENBQUEsV0FBVyxDQUFDLENBQWIsR0FBaUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFsRjtlQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsT0FBTCxDQUFpQixJQUFDLENBQUEsV0FBVyxDQUFDLEtBQTlCLEVBQXFDLElBQUMsQ0FBQSxXQUFXLENBQUMsTUFBbEQ7SUFIUTs7cUJBS1osVUFBQSxHQUFZLFNBQUMsSUFBRCxFQUFPLEtBQVA7UUFFUixJQUFHLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUF2QixDQUFBLEdBQTRCLEVBQTVCLElBQW1DLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUF2QixDQUFBLEdBQTRCLEVBQWxFO1lBQ0ksSUFBQyxDQUFBLEdBQUcsQ0FBQyxTQUFMLENBQWUsSUFBQyxDQUFBLFdBQWhCO1lBQ0EsSUFBRyxLQUFLLENBQUMsTUFBTixLQUFnQixDQUFuQjtnQkFDSSxJQUFDLENBQUEsV0FBRCxDQUFhLEtBQWIsRUFESjthQUFBLE1BRUssSUFBRyxLQUFLLENBQUMsTUFBTixLQUFnQixDQUFuQjtnQkFDRCxJQUFDLENBQUEsYUFBRCxDQUFlLEtBQWYsRUFEQzthQUFBLE1BRUEsSUFBRyxLQUFLLENBQUMsTUFBTixLQUFnQixDQUFuQjtnQkFDRCxJQUFDLENBQUEsWUFBRCxDQUFjLEtBQWQsRUFEQzthQU5UO1NBQUEsTUFBQTtZQVNJLElBQUksQ0FBQyxNQUFMLENBQVksWUFBWixFQUF5QixJQUFDLENBQUEsRUFBMUIsRUFUSjs7ZUFVQSxJQUFJLENBQUMsTUFBTCxDQUFZLFVBQVosRUFBdUIsSUFBQyxDQUFBLEVBQXhCO0lBWlE7O3FCQWNaLFlBQUEsR0FBYyxTQUFBO0FBRVYsWUFBQTtBQUFBLGFBQVMsMEJBQVQ7WUFDSSxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUF4QixDQUErQixZQUFBLEdBQWEsQ0FBNUM7QUFESjtRQUVBLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQXhCLENBQTRCLFlBQUEsR0FBWSxDQUFDLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBQSxHQUFjLENBQWYsQ0FBeEM7UUFDQSxLQUFBLEdBQVEsS0FBSyxDQUFDLEdBQU4sQ0FBVSxLQUFWLEVBQWdCLEVBQWhCO1FBQ1IsS0FBSyxDQUFDLEdBQU4sQ0FBVSxRQUFBLEdBQVMsS0FBVCxHQUFlLEdBQWYsR0FBa0IsSUFBQyxDQUFBLFFBQTdCLEVBQXdDLElBQUMsQ0FBQSxHQUFHLENBQUMsU0FBTCxDQUFBLENBQXhDO2VBQ0EsSUFBQyxDQUFBLFFBQUQsQ0FBQTtJQVBVOztxQkFTZCxPQUFBLEdBQVMsU0FBQyxLQUFEO2VBQVcsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBeEIsQ0FBNEIsYUFBNUI7SUFBWDs7cUJBQ1QsT0FBQSxHQUFTLFNBQUMsS0FBRDtlQUFXLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQXhCLENBQStCLGFBQS9CO0lBQVg7O3FCQUVULFVBQUEsR0FBWSxTQUFDLEtBQUQ7UUFBVyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUF4QixDQUErQixhQUEvQjtRQUE4QyxJQUFJLENBQUMsTUFBTCxDQUFZLGFBQVosRUFBMEIsSUFBQyxDQUFBLEVBQTNCO2VBQStCLElBQUMsQ0FBQSxPQUFELENBQVMsS0FBVDtJQUF4Rjs7cUJBQ1osU0FBQSxHQUFZLFNBQUMsS0FBRDtRQUFXLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQXhCLENBQStCLGFBQS9CO2VBQThDLElBQUMsQ0FBQSxNQUFELENBQVMsS0FBVDtJQUF6RDs7cUJBQ1osU0FBQSxHQUFZLFNBQUMsS0FBRDtlQUFXLElBQUMsQ0FBQSxNQUFELENBQVEsS0FBUjtJQUFYOztxQkFDWixTQUFBLEdBQVksU0FBQyxLQUFEO2VBQVcsSUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSO0lBQVg7O3FCQUNaLFNBQUEsR0FBWSxTQUFDLEtBQUQ7ZUFBVyxJQUFDLENBQUEsTUFBRCxDQUFRLEtBQVI7SUFBWDs7cUJBQ1osVUFBQSxHQUFZLFNBQUMsS0FBRDtlQUFXLElBQUMsQ0FBQSxPQUFELENBQVMsS0FBVDtJQUFYOztxQkFFWixZQUFBLEdBQWMsU0FBQyxRQUFEO1FBQUMsSUFBQyxDQUFBLFdBQUQ7UUFJWCxJQUFDLENBQUEsR0FBRyxDQUFDLFFBQUwsQ0FBYyxTQUFBLEdBQVUsSUFBQyxDQUFBLFFBQXpCO1FBRUEsSUFBSSxDQUFDLE1BQUwsQ0FBWSxjQUFaLEVBQTJCLElBQUMsQ0FBQSxFQUE1QixFQUFnQyxJQUFDLENBQUEsUUFBakM7ZUFDQSxJQUFJLENBQUMsTUFBTCxDQUFZLFlBQVosRUFBeUIsSUFBQyxDQUFBLEVBQTFCLEVBQThCLElBQUMsQ0FBQSxRQUEvQjtJQVBVOztxQkFTZCxNQUFBLEdBQWUsU0FBQSxHQUFBOztxQkFDZixNQUFBLEdBQWUsU0FBQSxHQUFBOztxQkFDZixNQUFBLEdBQWUsU0FBQSxHQUFBOztxQkFDZixPQUFBLEdBQWUsU0FBQSxHQUFBOztxQkFDZixNQUFBLEdBQWUsU0FBQSxHQUFBOztxQkFDZixNQUFBLEdBQWUsU0FBQSxHQUFBOztxQkFDZixPQUFBLEdBQWUsU0FBQSxHQUFBOztxQkFDZixRQUFBLEdBQWUsU0FBQSxHQUFBOztxQkFDZixXQUFBLEdBQWUsU0FBQSxHQUFBOztxQkFDZixhQUFBLEdBQWUsU0FBQSxHQUFBOztxQkFDZixZQUFBLEdBQWUsU0FBQSxHQUFBOztxQkFRZixPQUFBLEdBQVMsU0FBQyxRQUFEO0FBRUwsWUFBQTtRQUFBLElBQVUsQ0FBSSxRQUFkO0FBQUEsbUJBQUE7O1FBQ0EsR0FBQSxHQUFNLElBQUEsQ0FBSyxLQUFMLEVBQVc7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFVBQU47WUFBaUIsR0FBQSxFQUFJLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBSyxDQUFDLElBQU4sQ0FBVyxRQUFYLENBQWQsQ0FBckI7U0FBWDtRQUNOLEdBQUcsQ0FBQyxXQUFKLEdBQWtCLFNBQUE7bUJBQUc7UUFBSDtRQUNsQixJQUFDLENBQUEsSUFBSSxDQUFDLFNBQU4sR0FBa0I7ZUFDbEIsSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLEdBQWxCO0lBTks7O3FCQWNULFlBQUEsR0FBYyxTQUFDLE1BQUQ7QUFFVixnQkFBTyxNQUFQO0FBQUEsaUJBQ1MsS0FEVDt1QkFDNkIsSUFBSSxDQUFDLE1BQUwsQ0FBWSxXQUFaLEVBQXdCLFNBQXhCO0FBRDdCLGlCQUVTLFNBRlQ7dUJBRTZCLElBQUksQ0FBQyxNQUFMLENBQVksWUFBWjtBQUY3QixpQkFHUyxPQUhUO3VCQUc2QixJQUFJLENBQUMsTUFBTCxDQUFZLFVBQVo7QUFIN0IsaUJBSVMsT0FKVDtnQkFJNkIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxXQUFMLENBQWlCLElBQWpCO3VCQUF3QixJQUFDLENBQUEsR0FBRyxDQUFDLEtBQUwsQ0FBQTtBQUpyRCxpQkFLUyxNQUxUO3VCQUs2QixJQUFJLENBQUMsTUFBTCxDQUFZLE1BQVo7QUFMN0IsaUJBTVMsTUFOVDt1QkFNNkIsSUFBSSxDQUFDLE1BQUwsQ0FBWSxNQUFaO0FBTjdCLGlCQU9TLE9BUFQ7dUJBTzZCLElBQUksQ0FBQyxNQUFMLENBQVksV0FBWjtBQVA3QixpQkFRUyxRQVJUO3VCQVE2QixJQUFJLENBQUMsTUFBTCxDQUFZLGNBQVo7QUFSN0IsaUJBU1MsY0FUVDt1QkFTNkIsSUFBSSxDQUFDLE1BQUwsQ0FBWSxZQUFaLEVBQXlCLFVBQXpCO0FBVDdCLGlCQVVTLGNBVlQ7dUJBVTZCLElBQUksQ0FBQyxNQUFMLENBQVksWUFBWixFQUF5QixVQUF6QjtBQVY3QixpQkFXUyxXQVhUO3VCQVc2QixJQUFJLENBQUMsTUFBTCxDQUFZLFlBQVosRUFBeUIsT0FBekI7QUFYN0IsaUJBWVMsVUFaVDt1QkFZNkIsSUFBSSxDQUFDLE1BQUwsQ0FBWSxZQUFaLEVBQXlCLFVBQXpCLEVBQW9DLElBQUMsQ0FBQSxFQUFyQztBQVo3QixpQkFhUyxVQWJUO3VCQWE2QixJQUFJLENBQUMsTUFBTCxDQUFZLFlBQVosRUFBeUIsVUFBekIsRUFBb0MsSUFBQyxDQUFBLEVBQXJDO0FBYjdCLGlCQWNTLE9BZFQ7dUJBYzZCLElBQUksQ0FBQyxNQUFMLENBQVksWUFBWixFQUF5QixPQUF6QixFQUFvQyxJQUFDLENBQUEsRUFBckM7QUFkN0IsaUJBZVMsUUFmVDt1QkFlNkIsSUFBSSxDQUFDLE1BQUwsQ0FBWSxZQUFaLEVBQXlCLElBQXpCLEVBQW9DLElBQUMsQ0FBQSxFQUFyQztBQWY3QixpQkFnQlMsVUFoQlQ7dUJBZ0I2QixJQUFJLENBQUMsTUFBTCxDQUFZLFlBQVosRUFBeUIsTUFBekIsRUFBb0MsSUFBQyxDQUFBLEVBQXJDO0FBaEI3QixpQkFpQlMsVUFqQlQ7dUJBaUI2QixJQUFJLENBQUMsTUFBTCxDQUFZLFlBQVosRUFBeUIsTUFBekIsRUFBb0MsSUFBQyxDQUFBLEVBQXJDO0FBakI3QixpQkFrQlMsV0FsQlQ7dUJBa0I2QixJQUFJLENBQUMsTUFBTCxDQUFZLFlBQVosRUFBeUIsT0FBekIsRUFBb0MsSUFBQyxDQUFBLEVBQXJDO0FBbEI3QixpQkFtQlMsVUFuQlQ7dUJBbUI2QixJQUFDLENBQUEsR0FBRyxDQUFDLFdBQVcsQ0FBQyxjQUFqQixDQUFBO0FBbkI3QixpQkFvQlMsUUFwQlQ7dUJBb0I2QixJQUFDLENBQUEsR0FBRyxDQUFDLFdBQVcsQ0FBQyxtQkFBakIsQ0FBQTtBQXBCN0IsaUJBcUJTLFlBckJUO3VCQXFCNkIsSUFBQyxDQUFBLFVBQUQsQ0FBQTtBQXJCN0I7dUJBdUJRLElBQUEsQ0FBSyxRQUFMLEVBQWMsTUFBZDtBQXZCUjtJQUZVOztxQkFpQ2QsT0FBQSxHQUFTLFNBQUMsS0FBRCxFQUFRLElBQVI7QUFFTCxnQkFBTyxLQUFQO0FBQUEsaUJBQ1MsTUFEVDtBQUFBLGlCQUNlLE9BRGY7QUFBQSxpQkFDc0IsSUFEdEI7QUFBQSxpQkFDMEIsTUFEMUI7dUJBQ3NDLElBQUksQ0FBQyxNQUFMLENBQVksZUFBWixFQUE0QixJQUFDLENBQUEsRUFBN0IsRUFBaUMsS0FBakM7QUFEdEMsaUJBRVMsT0FGVDtBQUFBLGlCQUVnQixPQUZoQjt1QkFFNkIsSUFBQyxDQUFBLFdBQUQsQ0FBQTtBQUY3QixpQkFHUyxlQUhUO0FBQUEsaUJBR3dCLGVBSHhCO0FBQUEsaUJBR3VDLFlBSHZDO0FBQUEsaUJBR21ELFlBSG5EO3VCQUdxRSxJQUFDLENBQUEsWUFBRCxDQUFBO0FBSHJFLGlCQUlTLG1CQUpUO0FBQUEsaUJBSTRCLG1CQUo1QjtBQUFBLGlCQUkrQyxnQkFKL0M7QUFBQSxpQkFJK0QsZ0JBSi9EO3VCQUlxRixJQUFDLENBQUEsYUFBRCxDQUFBO0FBSnJGO0lBRks7Ozs7R0F2TFE7O0FBK0xyQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAgICAgIFxuMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIFxuMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgIFxuMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuIyMjXG5cbnsgZHJhZywgcG9zdCwgc2NoZW1lLCBzdG9wRXZlbnQsIHByZWZzLCBzbGFzaCwga2xvZywga3N0ciwgZWxlbSwgd2luLCBvcywgJCB9ID0gcmVxdWlyZSAna3hrJ1xuXG5Cb3VuZHMgPSByZXF1aXJlICcuL2JvdW5kcydcblxuY2xhc3MgS2FjaGVsIGV4dGVuZHMgd2luXG5cbiAgICBAOiAoQGthY2hlbElkOidrYWNoZWwnKSAtPlxuICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgICAgIHByZWZzU2VwZXJhdG9yOiAn4pa4J1xuICAgICAgICAgICAgZGlyOiAgICBfX2Rpcm5hbWVcbiAgICAgICAgICAgIHBrZzogICAgcmVxdWlyZSAnLi4vcGFja2FnZS5qc29uJ1xuICAgICAgICAgICAgbWVudTogICAnLi4vY29mZmVlL21lbnUubm9vbidcbiAgICAgICAgICAgIG9uTG9hZDogQG9uV2luTG9hZFxuICAgIFxuICAgICAgICBAbWFpbiA9JCAnI21haW4nXG4gICAgICAgIFxuICAgICAgICBAZHJhZyA9IG5ldyBkcmFnXG4gICAgICAgICAgICB0YXJnZXQ6ICAgZG9jdW1lbnQuYm9keVxuICAgICAgICAgICAgb25TdGFydDogIEBvbkRyYWdTdGFydFxuICAgICAgICAgICAgb25Nb3ZlOiAgIEBvbkRyYWdNb3ZlXG4gICAgICAgICAgICBvblN0b3A6ICAgQG9uRHJhZ1N0b3BcbiAgICAgICAgXG4gICAgICAgIEB3aW4ub24gJ3Nob3cnICBAb25XaW5TaG93XG4gICAgICAgIEB3aW4ub24gJ21vdmUnICBAb25XaW5Nb3ZlXG4gICAgICAgIEB3aW4ub24gJ2JsdXInICBAb25XaW5CbHVyXG4gICAgICAgIEB3aW4ub24gJ2ZvY3VzJyBAb25XaW5Gb2N1c1xuICAgICAgICBAd2luLm9uICdtb3ZlJyAgQG9uV2luTW92ZVxuICAgICAgICBAd2luLm9uICdjbG9zZScgQG9uV2luQ2xvc2VcbiAgICAgICAgXG4gICAgICAgIHBvc3Qub24gJ2luaXRLYWNoZWwnIEBvbkluaXRLYWNoZWxcbiAgICAgICAgcG9zdC5vbiAnc2F2ZUJvdW5kcycgQG9uU2F2ZUJvdW5kc1xuICAgICAgICBwb3N0Lm9uICdjb21ibycgICAgICBAb25Db21ib1xuICAgICAgICBwb3N0Lm9uICdob3ZlcicgICAgICBAb25Ib3ZlclxuICAgICAgICBwb3N0Lm9uICdsZWF2ZScgICAgICBAb25MZWF2ZVxuICAgICAgICBwb3N0Lm9uICd0b2dnbGVTY2hlbWUnIC0+IHNjaGVtZS50b2dnbGUoKVxuICAgICAgICBcbiAgICAgICAgaWYgQGthY2hlbElkICE9ICdtYWluJ1xuICAgICAgICAgICAgQHdpbi5zZXRTa2lwVGFza2JhciB0cnVlXG4gICAgICAgIFxuICAgICAgICBwb3N0LnRvTWFpbiAna2FjaGVsQm91bmRzJyBAaWQsIEBrYWNoZWxJZFxuICAgICAgICBcbiAgICAgICAgIyBpZiBvcy5wbGF0Zm9ybSgpID09ICdkYXJ3aW4nXG4gICAgICAgICAgICAjIGlmIHBhcnNlSW50KG9zLnJlbGVhc2UoKS5zcGxpdCgnLicpWzBdKSA+PSAxOFxuICAgICAgICAgICAgICAgICMgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkICdtb2phdmUnXG4gICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgMDAgMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgICAgICAwMDAgICAgIDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwIDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwICAgICAgMDAwICAgXG4gICAgXG4gICAgcmVxdWVzdERhdGE6IChuYW1lKSAtPlxuICAgICAgICBcbiAgICAgICAgcG9zdC50b01haW4gJ3JlcXVlc3REYXRhJyBuYW1lLCBAaWRcbiAgICAgICAgcG9zdC5vbiAnZGF0YScgQG9uRGF0YVxuICAgICAgICAgICAgICAgIFxuICAgIGthY2hlbFNpemU6IC0+IEJvdW5kcy5rYWNoZWxTaXplIEB3aW5cbiAgICAgICAgICAgIFxuICAgIG9uQ29udGV4dE1lbnU6IChldmVudCkgPT4gc3RvcEV2ZW50IGV2ZW50IFxuICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgb25EcmFnU3RhcnQ6IChkcmFnLCBldmVudCkgPT5cbiAgICBcbiAgICAgICAgaWYgQHdpbj8uaXNEZXN0cm95ZWQoKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBcbiAgICAgICAgQHN0YXJ0Qm91bmRzID0gQHdpbi5nZXRCb3VuZHMoKVxuICAgICAgICBwb3N0LnRvTWFpbiAnZHJhZ1N0YXJ0JyBAaWRcbiAgICAgICAgXG4gICAgb25EcmFnTW92ZTogKGRyYWcsIGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgQHdpbi5zZXRQb3NpdGlvbiBAc3RhcnRCb3VuZHMueCArIGRyYWcuZGVsdGFTdW0ueCwgQHN0YXJ0Qm91bmRzLnkgKyBkcmFnLmRlbHRhU3VtLnlcbiAgICAgICAgQHdpbi5zZXRTaXplICAgICBAc3RhcnRCb3VuZHMud2lkdGgsIEBzdGFydEJvdW5kcy5oZWlnaHRcbiAgICAgICAgXG4gICAgb25EcmFnU3RvcDogKGRyYWcsIGV2ZW50KSA9PlxuXG4gICAgICAgIGlmIE1hdGguYWJzKGRyYWcuZGVsdGFTdW0ueCkgPCAxMCBhbmQgTWF0aC5hYnMoZHJhZy5kZWx0YVN1bS55KSA8IDEwXG4gICAgICAgICAgICBAd2luLnNldEJvdW5kcyBAc3RhcnRCb3VuZHNcbiAgICAgICAgICAgIGlmIGV2ZW50LmJ1dHRvbiA9PSAwXG4gICAgICAgICAgICAgICAgQG9uTGVmdENsaWNrIGV2ZW50XG4gICAgICAgICAgICBlbHNlIGlmIGV2ZW50LmJ1dHRvbiA9PSAxXG4gICAgICAgICAgICAgICAgQG9uTWlkZGxlQ2xpY2sgZXZlbnRcbiAgICAgICAgICAgIGVsc2UgaWYgZXZlbnQuYnV0dG9uID09IDJcbiAgICAgICAgICAgICAgICBAb25SaWdodENsaWNrIGV2ZW50XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHBvc3QudG9NYWluICdzbmFwS2FjaGVsJyBAaWRcbiAgICAgICAgcG9zdC50b01haW4gJ2RyYWdTdG9wJyBAaWRcbiAgICBcbiAgICBvblNhdmVCb3VuZHM6ID0+XG4gICAgICAgICMga2xvZyAnb25TYXZlQm91bmRzJyBAaWRcbiAgICAgICAgZm9yIGkgaW4gWzEuLjZdXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUgXCJrYWNoZWxTaXplI3tpfVwiXG4gICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCBcImthY2hlbFNpemUje0BrYWNoZWxTaXplKCkrMX1cIlxuICAgICAgICBzZXRJZCA9IHByZWZzLmdldCAnc2V0JyAnJ1xuICAgICAgICBwcmVmcy5zZXQgXCJib3VuZHMje3NldElkfeKWuCN7QGthY2hlbElkfVwiIEB3aW4uZ2V0Qm91bmRzKClcbiAgICAgICAgQG9uQm91bmRzKClcbiAgICAgICAgXG4gICAgb25Ib3ZlcjogKGV2ZW50KSA9PiBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQgJ2thY2hlbEhvdmVyJ1xuICAgIG9uTGVhdmU6IChldmVudCkgPT4gZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlICdrYWNoZWxIb3ZlcidcbiAgICAgICAgXG4gICAgb25XaW5Gb2N1czogKGV2ZW50KSA9PiBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQgICAgJ2thY2hlbEZvY3VzJzsgcG9zdC50b01haW4gJ2thY2hlbEZvY3VzJyBAaWQ7IEBvbkZvY3VzIGV2ZW50XG4gICAgb25XaW5CbHVyOiAgKGV2ZW50KSA9PiBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUgJ2thY2hlbEZvY3VzJzsgQG9uQmx1ciAgZXZlbnRcbiAgICBvbldpbkxvYWQ6ICAoZXZlbnQpID0+IEBvbkxvYWQgZXZlbnRcbiAgICBvbldpblNob3c6ICAoZXZlbnQpID0+IEBvblNob3cgZXZlbnRcbiAgICBvbldpbk1vdmU6ICAoZXZlbnQpID0+IEBvbk1vdmUgZXZlbnRcbiAgICBvbldpbkNsb3NlOiAoZXZlbnQpID0+IEBvbkNsb3NlIGV2ZW50XG4gICAgICAgIFxuICAgIG9uSW5pdEthY2hlbDogKEBrYWNoZWxJZCkgPT5cbiAgICAgICAgICAgXG4gICAgICAgICMga2xvZyAnb25Jbml0S2FjaGVsIEBrYWNoZWxJZCcgQGthY2hlbElkXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEB3aW4uc2V0VGl0bGUgXCJrYWNoZWwgI3tAa2FjaGVsSWR9XCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcG9zdC50b01haW4gJ2thY2hlbEJvdW5kcycgQGlkLCBAa2FjaGVsSWRcbiAgICAgICAgcG9zdC50b01haW4gJ2thY2hlbExvYWQnIEBpZCwgQGthY2hlbElkXG4gICAgXG4gICAgb25Mb2FkOiAgICAgICAgLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvblNob3c6ICAgICAgICAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uTW92ZTogICAgICAgIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25Gb2N1czogICAgICAgLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvbkJsdXI6ICAgICAgICAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uTW92ZTogICAgICAgIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25DbG9zZTogICAgICAgLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvbkJvdW5kczogICAgICAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uTGVmdENsaWNrOiAgIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25NaWRkbGVDbGljazogLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvblJpZ2h0Q2xpY2s6ICAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBzZXRJY29uOiAoaWNvblBhdGgpID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGljb25QYXRoXG4gICAgICAgIGltZyA9IGVsZW0gJ2ltZycgY2xhc3M6J2FwcGxpY29uJyBzcmM6c2xhc2guZmlsZVVybCBzbGFzaC5wYXRoIGljb25QYXRoXG4gICAgICAgIGltZy5vbmRyYWdzdGFydCA9IC0+IGZhbHNlXG4gICAgICAgIEBtYWluLmlubmVySFRNTCA9ICcnXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGltZ1xuICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgXG4gICAgXG4gICAgb25NZW51QWN0aW9uOiAoYWN0aW9uKSA9PlxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIGFjdGlvblxuICAgICAgICAgICAgd2hlbiAnTmV3JyAgICAgICAgICB0aGVuIHBvc3QudG9NYWluICduZXdLYWNoZWwnICdkZWZhdWx0J1xuICAgICAgICAgICAgd2hlbiAnUmVzdG9yZScgICAgICB0aGVuIHBvc3QudG9NYWluICdyZXN0b3JlU2V0J1xuICAgICAgICAgICAgd2hlbiAnU3RvcmUnICAgICAgICB0aGVuIHBvc3QudG9NYWluICdzdG9yZVNldCdcbiAgICAgICAgICAgIHdoZW4gJ0Nsb3NlJyAgICAgICAgdGhlbiBAd2luLnNldENsb3NhYmxlKHRydWUpOyBAd2luLmNsb3NlKClcbiAgICAgICAgICAgIHdoZW4gJ1F1aXQnICAgICAgICAgdGhlbiBwb3N0LnRvTWFpbiAncXVpdCdcbiAgICAgICAgICAgIHdoZW4gJ0hpZGUnICAgICAgICAgdGhlbiBwb3N0LnRvTWFpbiAnaGlkZSdcbiAgICAgICAgICAgIHdoZW4gJ0Fib3V0JyAgICAgICAgdGhlbiBwb3N0LnRvTWFpbiAnc2hvd0Fib3V0J1xuICAgICAgICAgICAgd2hlbiAnU2NoZW1lJyAgICAgICB0aGVuIHBvc3QudG9XaW5zICd0b2dnbGVTY2hlbWUnXG4gICAgICAgICAgICB3aGVuICdJbmNyZWFzZVNpemUnIHRoZW4gcG9zdC50b01haW4gJ2thY2hlbFNpemUnICdpbmNyZWFzZSdcbiAgICAgICAgICAgIHdoZW4gJ0RlY3JlYXNlU2l6ZScgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsU2l6ZScgJ2RlY3JlYXNlJ1xuICAgICAgICAgICAgd2hlbiAnUmVzZXRTaXplJyAgICB0aGVuIHBvc3QudG9NYWluICdrYWNoZWxTaXplJyAncmVzZXQnXG4gICAgICAgICAgICB3aGVuICdJbmNyZWFzZScgICAgIHRoZW4gcG9zdC50b01haW4gJ2thY2hlbFNpemUnICdpbmNyZWFzZScgQGlkXG4gICAgICAgICAgICB3aGVuICdEZWNyZWFzZScgICAgIHRoZW4gcG9zdC50b01haW4gJ2thY2hlbFNpemUnICdkZWNyZWFzZScgQGlkXG4gICAgICAgICAgICB3aGVuICdSZXNldCcgICAgICAgIHRoZW4gcG9zdC50b01haW4gJ2thY2hlbFNpemUnICdyZXNldCcgICAgQGlkXG4gICAgICAgICAgICB3aGVuICdNb3ZlVXAnICAgICAgIHRoZW4gcG9zdC50b01haW4gJ2thY2hlbE1vdmUnICd1cCcgICAgICAgQGlkXG4gICAgICAgICAgICB3aGVuICdNb3ZlRG93bicgICAgIHRoZW4gcG9zdC50b01haW4gJ2thY2hlbE1vdmUnICdkb3duJyAgICAgQGlkXG4gICAgICAgICAgICB3aGVuICdNb3ZlTGVmdCcgICAgIHRoZW4gcG9zdC50b01haW4gJ2thY2hlbE1vdmUnICdsZWZ0JyAgICAgQGlkXG4gICAgICAgICAgICB3aGVuICdNb3ZlUmlnaHQnICAgIHRoZW4gcG9zdC50b01haW4gJ2thY2hlbE1vdmUnICdyaWdodCcgICAgQGlkXG4gICAgICAgICAgICB3aGVuICdEZXZUb29scycgICAgIHRoZW4gQHdpbi53ZWJDb250ZW50cy50b2dnbGVEZXZUb29scygpXG4gICAgICAgICAgICB3aGVuICdSZWxvYWQnICAgICAgIHRoZW4gQHdpbi53ZWJDb250ZW50cy5yZWxvYWRJZ25vcmluZ0NhY2hlKClcbiAgICAgICAgICAgIHdoZW4gJ1NjcmVlbnNob3QnICAgdGhlbiBAc2NyZWVuc2hvdCgpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAga2xvZyAnYWN0aW9uJyBhY3Rpb25cbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBvbkNvbWJvOiAoY29tYm8sIGluZm8pID0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHN3aXRjaCBjb21ib1xuICAgICAgICAgICAgd2hlbiAnbGVmdCcncmlnaHQnJ3VwJydkb3duJyB0aGVuIHBvc3QudG9NYWluICdmb2N1c05laWdoYm9yJyBAaWQsIGNvbWJvXG4gICAgICAgICAgICB3aGVuICdlbnRlcicnc3BhY2UnIHRoZW4gQG9uTGVmdENsaWNrKClcbiAgICAgICAgICAgIHdoZW4gJ2NvbW1hbmQrZW50ZXInJ2NvbW1hbmQrc3BhY2UnJ2N0cmwrZW50ZXInJ2N0cmwrc3BhY2UnIHRoZW4gQG9uUmlnaHRDbGljaygpXG4gICAgICAgICAgICB3aGVuICdhbHQrY29tbWFuZCtlbnRlcicnYWx0K2NvbW1hbmQrc3BhY2UnJ2FsdCtjdHJsK2VudGVyJydhbHQrY3RybCtzcGFjZScgdGhlbiBAb25NaWRkbGVDbGljaygpXG4gICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gS2FjaGVsXG4iXX0=
//# sourceURL=../coffee/kachel.coffee
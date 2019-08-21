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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2FjaGVsLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSw4RkFBQTtJQUFBOzs7O0FBUUEsTUFBZ0YsT0FBQSxDQUFRLEtBQVIsQ0FBaEYsRUFBRSxlQUFGLEVBQVEsZUFBUixFQUFjLG1CQUFkLEVBQXNCLHlCQUF0QixFQUFpQyxpQkFBakMsRUFBd0MsaUJBQXhDLEVBQStDLGVBQS9DLEVBQXFELGVBQXJELEVBQTJELGVBQTNELEVBQWlFLGFBQWpFLEVBQXNFLFdBQXRFLEVBQTBFOztBQUUxRSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0FBRUg7OztJQUVDLGdCQUFDLEdBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLGtEQUFTOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O1FBRVYsd0NBQ0k7WUFBQSxjQUFBLEVBQWdCLEdBQWhCO1lBQ0EsR0FBQSxFQUFRLFNBRFI7WUFFQSxHQUFBLEVBQVEsT0FBQSxDQUFRLGlCQUFSLENBRlI7WUFHQSxJQUFBLEVBQVEscUJBSFI7WUFJQSxNQUFBLEVBQVEsSUFBQyxDQUFBLFNBSlQ7U0FESjtRQU9BLElBQUMsQ0FBQSxJQUFELEdBQU8sQ0FBQSxDQUFFLE9BQUY7UUFFUCxJQUFDLENBQUEsSUFBRCxHQUFRLElBQUksSUFBSixDQUNKO1lBQUEsTUFBQSxFQUFVLFFBQVEsQ0FBQyxJQUFuQjtZQUNBLE9BQUEsRUFBVSxJQUFDLENBQUEsV0FEWDtZQUVBLE1BQUEsRUFBVSxJQUFDLENBQUEsVUFGWDtZQUdBLE1BQUEsRUFBVSxJQUFDLENBQUEsVUFIWDtTQURJO1FBTVIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFMLENBQVEsTUFBUixFQUFnQixJQUFDLENBQUEsU0FBakI7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxNQUFSLEVBQWdCLElBQUMsQ0FBQSxTQUFqQjtRQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFB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QUFMLEVBQWMsTUFBZDtBQXZCUjtJQUZVOztxQkFpQ2QsT0FBQSxHQUFTLFNBQUMsS0FBRCxFQUFRLElBQVI7QUFFTCxnQkFBTyxLQUFQO0FBQUEsaUJBQ1MsTUFEVDtBQUFBLGlCQUNlLE9BRGY7QUFBQSxpQkFDc0IsSUFEdEI7QUFBQSxpQkFDMEIsTUFEMUI7dUJBQ3NDLElBQUksQ0FBQyxNQUFMLENBQVksZUFBWixFQUE0QixJQUFDLENBQUEsRUFBN0IsRUFBaUMsS0FBakM7QUFEdEMsaUJBRVMsT0FGVDtBQUFBLGlCQUVnQixPQUZoQjt1QkFFNkIsSUFBQyxDQUFBLFdBQUQsQ0FBQTtBQUY3QixpQkFHUyxlQUhUO0FBQUEsaUJBR3dCLGVBSHhCO0FBQUEsaUJBR3VDLFlBSHZDO0FBQUEsaUJBR21ELFlBSG5EO3VCQUdxRSxJQUFDLENBQUEsWUFBRCxDQUFBO0FBSHJFLGlCQUlTLG1CQUpUO0FBQUEsaUJBSTRCLG1CQUo1QjtBQUFBLGlCQUkrQyxnQkFKL0M7QUFBQSxpQkFJK0QsZ0JBSi9EO3VCQUlxRixJQUFDLENBQUEsYUFBRCxDQUFBO0FBSnJGO0lBRks7Ozs7R0FqTlE7O0FBeU5yQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAgICAgIFxuMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIFxuMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgIFxuMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuIyMjXG5cbnsgZHJhZywgcG9zdCwgc2NoZW1lLCBzdG9wRXZlbnQsIHByZWZzLCBzbGFzaCwga2xvZywga3N0ciwgZWxlbSwgd2luLCBvcywgJCB9ID0gcmVxdWlyZSAna3hrJ1xuXG5Cb3VuZHMgPSByZXF1aXJlICcuL2JvdW5kcydcblxuY2xhc3MgS2FjaGVsIGV4dGVuZHMgd2luXG5cbiAgICBAOiAoQGthY2hlbElkOidrYWNoZWwnKSAtPlxuICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgICAgIHByZWZzU2VwZXJhdG9yOiAn4pa4J1xuICAgICAgICAgICAgZGlyOiAgICBfX2Rpcm5hbWVcbiAgICAgICAgICAgIHBrZzogICAgcmVxdWlyZSAnLi4vcGFja2FnZS5qc29uJ1xuICAgICAgICAgICAgbWVudTogICAnLi4vY29mZmVlL21lbnUubm9vbidcbiAgICAgICAgICAgIG9uTG9hZDogQG9uV2luTG9hZFxuICAgIFxuICAgICAgICBAbWFpbiA9JCAnI21haW4nXG4gICAgICAgIFxuICAgICAgICBAZHJhZyA9IG5ldyBkcmFnXG4gICAgICAgICAgICB0YXJnZXQ6ICAgZG9jdW1lbnQuYm9keVxuICAgICAgICAgICAgb25TdGFydDogIEBvbkRyYWdTdGFydFxuICAgICAgICAgICAgb25Nb3ZlOiAgIEBvbkRyYWdNb3ZlXG4gICAgICAgICAgICBvblN0b3A6ICAgQG9uRHJhZ1N0b3BcbiAgICAgICAgXG4gICAgICAgIEB3aW4ub24gJ3Nob3cnICBAb25XaW5TaG93XG4gICAgICAgIEB3aW4ub24gJ21vdmUnICBAb25XaW5Nb3ZlXG4gICAgICAgIEB3aW4ub24gJ2JsdXInICBAb25XaW5CbHVyXG4gICAgICAgIEB3aW4ub24gJ2ZvY3VzJyBAb25XaW5Gb2N1c1xuICAgICAgICBAd2luLm9uICdtb3ZlJyAgQG9uV2luTW92ZVxuICAgICAgICBAd2luLm9uICdjbG9zZScgQG9uV2luQ2xvc2VcbiAgICAgICAgXG4gICAgICAgIHBvc3Qub24gJ2luaXRLYWNoZWwnIEBvbkluaXRLYWNoZWxcbiAgICAgICAgcG9zdC5vbiAnc2F2ZUJvdW5kcycgQG9uU2F2ZUJvdW5kc1xuICAgICAgICBwb3N0Lm9uICdjb21ibycgICAgICBAb25Db21ib1xuICAgICAgICBwb3N0Lm9uICdob3ZlcicgICAgICBAb25Ib3ZlclxuICAgICAgICBwb3N0Lm9uICdsZWF2ZScgICAgICBAb25MZWF2ZVxuICAgICAgICBwb3N0Lm9uICd0b2dnbGVTY2hlbWUnIC0+IHNjaGVtZS50b2dnbGUoKVxuICAgICAgICBcbiAgICAgICAgaWYgQGthY2hlbElkICE9ICdtYWluJ1xuICAgICAgICAgICAgQHdpbi5zZXRTa2lwVGFza2JhciB0cnVlXG4gICAgICAgIFxuICAgICAgICBwb3N0LnRvTWFpbiAna2FjaGVsQm91bmRzJyBAaWQsIEBrYWNoZWxJZFxuICAgICAgICBcbiAgICAgICAgIyBpZiBvcy5wbGF0Zm9ybSgpID09ICdkYXJ3aW4nXG4gICAgICAgICAgICAjIGlmIHBhcnNlSW50KG9zLnJlbGVhc2UoKS5zcGxpdCgnLicpWzBdKSA+PSAxOFxuICAgICAgICAgICAgICAgICMgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkICdtb2phdmUnXG4gICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgMDAgMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgICAgICAwMDAgICAgIDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwIDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwICAgICAgMDAwICAgXG4gICAgXG4gICAgcmVxdWVzdERhdGE6IChuYW1lKSAtPlxuICAgICAgICBcbiAgICAgICAgcG9zdC50b01haW4gJ3JlcXVlc3REYXRhJyBuYW1lLCBAaWRcbiAgICAgICAgcG9zdC5vbiAnZGF0YScgQG9uRGF0YVxuICAgICAgICAgICAgICAgIFxuICAgIGthY2hlbFNpemU6IC0+IEJvdW5kcy5rYWNoZWxTaXplIEB3aW5cbiAgICAgICAgICAgIFxuICAgIG9uQ29udGV4dE1lbnU6IChldmVudCkgPT4gc3RvcEV2ZW50IGV2ZW50IFxuICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgb25EcmFnU3RhcnQ6IChkcmFnLCBldmVudCkgPT5cbiAgICBcbiAgICAgICAgaWYgQHdpbj8uaXNEZXN0cm95ZWQoKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBcbiAgICAgICAgQHN0YXJ0Qm91bmRzID0gQHdpbi5nZXRCb3VuZHMoKVxuICAgICAgICBwb3N0LnRvTWFpbiAnZHJhZ1N0YXJ0JyBAaWRcbiAgICAgICAgXG4gICAgb25EcmFnTW92ZTogKGRyYWcsIGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgQHdpbi5zZXRQb3NpdGlvbiBAc3RhcnRCb3VuZHMueCArIGRyYWcuZGVsdGFTdW0ueCwgQHN0YXJ0Qm91bmRzLnkgKyBkcmFnLmRlbHRhU3VtLnlcbiAgICAgICAgQHdpbi5zZXRTaXplICAgICBAc3RhcnRCb3VuZHMud2lkdGgsIEBzdGFydEJvdW5kcy5oZWlnaHRcbiAgICAgICAgXG4gICAgb25EcmFnU3RvcDogKGRyYWcsIGV2ZW50KSA9PlxuXG4gICAgICAgIGlmIE1hdGguYWJzKGRyYWcuZGVsdGFTdW0ueCkgPCAxMCBhbmQgTWF0aC5hYnMoZHJhZy5kZWx0YVN1bS55KSA8IDEwXG4gICAgICAgICAgICBAd2luLnNldEJvdW5kcyBAc3RhcnRCb3VuZHNcbiAgICAgICAgICAgIGlmIGV2ZW50LmJ1dHRvbiA9PSAwXG4gICAgICAgICAgICAgICAgQG9uTGVmdENsaWNrIGV2ZW50XG4gICAgICAgICAgICBlbHNlIGlmIGV2ZW50LmJ1dHRvbiA9PSAxXG4gICAgICAgICAgICAgICAgQG9uTWlkZGxlQ2xpY2sgZXZlbnRcbiAgICAgICAgICAgIGVsc2UgaWYgZXZlbnQuYnV0dG9uID09IDJcbiAgICAgICAgICAgICAgICBAb25SaWdodENsaWNrIGV2ZW50XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHBvc3QudG9NYWluICdzbmFwS2FjaGVsJyBAaWRcbiAgICAgICAgcG9zdC50b01haW4gJ2RyYWdTdG9wJyBAaWRcbiAgICBcbiAgICBvblNhdmVCb3VuZHM6ID0+XG4gICAgICAgICMga2xvZyAnb25TYXZlQm91bmRzJyBAaWRcbiAgICAgICAgZm9yIGkgaW4gWzEuLjZdXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUgXCJrYWNoZWxTaXplI3tpfVwiXG4gICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCBcImthY2hlbFNpemUje0BrYWNoZWxTaXplKCkrMX1cIlxuICAgICAgICBzZXRJZCA9IHByZWZzLmdldCAnc2V0JyAnJ1xuICAgICAgICBwcmVmcy5zZXQgXCJib3VuZHMje3NldElkfeKWuCN7QGthY2hlbElkfVwiIEB3aW4uZ2V0Qm91bmRzKClcbiAgICAgICAgQG9uQm91bmRzKClcbiAgICAgICAgXG4gICAgb25Ib3ZlcjogKGV2ZW50KSA9PiBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQgJ2thY2hlbEhvdmVyJ1xuICAgIG9uTGVhdmU6IChldmVudCkgPT4gZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlICdrYWNoZWxIb3ZlcidcbiAgICAgICAgXG4gICAgb25XaW5Gb2N1czogKGV2ZW50KSA9PiBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQgICAgJ2thY2hlbEZvY3VzJzsgcG9zdC50b01haW4gJ2thY2hlbEZvY3VzJyBAaWQ7IEBvbkZvY3VzIGV2ZW50XG4gICAgb25XaW5CbHVyOiAgKGV2ZW50KSA9PiBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUgJ2thY2hlbEZvY3VzJzsgQG9uQmx1ciAgZXZlbnRcbiAgICBvbldpbkxvYWQ6ICAoZXZlbnQpID0+IEBvbkxvYWQgZXZlbnRcbiAgICBvbldpblNob3c6ICAoZXZlbnQpID0+IEBvblNob3cgZXZlbnRcbiAgICBvbldpbk1vdmU6ICAoZXZlbnQpID0+IEBvbk1vdmUgZXZlbnRcbiAgICBvbldpbkNsb3NlOiAoZXZlbnQpID0+IEBvbkNsb3NlIGV2ZW50XG4gICAgICAgIFxuICAgIG9uSW5pdEthY2hlbDogKEBrYWNoZWxJZCkgPT5cbiAgICAgICAgICAgXG4gICAgICAgICMga2xvZyAnb25Jbml0S2FjaGVsIEBrYWNoZWxJZCcgQGthY2hlbElkXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEB3aW4uc2V0VGl0bGUgXCJrYWNoZWwgI3tAa2FjaGVsSWR9XCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcG9zdC50b01haW4gJ2thY2hlbEJvdW5kcycgQGlkLCBAa2FjaGVsSWRcbiAgICAgICAgcG9zdC50b01haW4gJ2thY2hlbExvYWQnIEBpZCwgQGthY2hlbElkXG4gICAgXG4gICAgb25Mb2FkOiAgICAgICAgLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvblNob3c6ICAgICAgICAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uTW92ZTogICAgICAgIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25Gb2N1czogICAgICAgLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvbkJsdXI6ICAgICAgICAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uTW92ZTogICAgICAgIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25DbG9zZTogICAgICAgLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvbkJvdW5kczogICAgICAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uTGVmdENsaWNrOiAgIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25NaWRkbGVDbGljazogLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvblJpZ2h0Q2xpY2s6ICAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgMDAwICAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIHNuYXBTaXplOiA9PlxuICAgICAgICBcbiAgICAgICAgYnIgPSBAd2luLmdldEJvdW5kcygpXG4gICAgICAgIFxuICAgICAgICBzaXplcyA9IEJvdW5kcy5zbmFwU2l6ZXNcbiAgICAgICAgXG4gICAgICAgIGZvciBpIGluIFswLi4uc2l6ZXMubGVuZ3RoLTFdXG4gICAgICAgICAgICBpZiBici53aWR0aCA8IHNpemVzW2ldICsgKHNpemVzW2krMV0gLSBzaXplc1tpXSkgLyAyXG4gICAgICAgICAgICAgICAgYnIud2lkdGggPSBzaXplc1tpXVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIGJyLndpZHRoID0gTWF0aC5taW4gYnIud2lkdGgsIHNpemVzWy0xXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBmb3IgaSBpbiBbMC4uLnNpemVzLmxlbmd0aC0xXVxuICAgICAgICAgICAgaWYgYnIuaGVpZ2h0IDwgc2l6ZXNbaV0gKyAoc2l6ZXNbaSsxXSAtIHNpemVzW2ldKSAvIDJcbiAgICAgICAgICAgICAgICBici5oZWlnaHQgPSBzaXplc1tpXVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIGJyLmhlaWdodCA9IE1hdGgubWluIGJyLmhlaWdodCwgc2l6ZXNbLTFdXG4gICAgICAgIFxuICAgICAgICBAd2luLnNldEJvdW5kcyBiclxuICAgIFxuICAgICMgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHNldEljb246IChpY29uUGF0aCwgY2xzcz0nYXBwbGljb24nKSA9PlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBpY29uUGF0aFxuICAgICAgICBpbWcgPSBlbGVtICdpbWcnIGNsYXNzOmNsc3MsIHNyYzpzbGFzaC5maWxlVXJsIHNsYXNoLnBhdGggaWNvblBhdGhcbiAgICAgICAgaW1nLm9uZHJhZ3N0YXJ0ID0gLT4gZmFsc2VcbiAgICAgICAgQG1haW4uaW5uZXJIVE1MID0gJydcbiAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgaW1nXG4gICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCBcbiAgICBcbiAgICBvbk1lbnVBY3Rpb246IChhY3Rpb24pID0+XG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggYWN0aW9uXG4gICAgICAgICAgICB3aGVuICdOZXcnICAgICAgICAgIHRoZW4gcG9zdC50b01haW4gJ25ld0thY2hlbCcgJ2RlZmF1bHQnXG4gICAgICAgICAgICB3aGVuICdSZXN0b3JlJyAgICAgIHRoZW4gcG9zdC50b01haW4gJ3Jlc3RvcmVTZXQnXG4gICAgICAgICAgICB3aGVuICdTdG9yZScgICAgICAgIHRoZW4gcG9zdC50b01haW4gJ3N0b3JlU2V0J1xuICAgICAgICAgICAgd2hlbiAnQ2xvc2UnICAgICAgICB0aGVuIEB3aW4uY2xvc2UoKVxuICAgICAgICAgICAgd2hlbiAnUXVpdCcgICAgICAgICB0aGVuIHBvc3QudG9NYWluICdxdWl0J1xuICAgICAgICAgICAgd2hlbiAnSGlkZScgICAgICAgICB0aGVuIHBvc3QudG9NYWluICdoaWRlJ1xuICAgICAgICAgICAgd2hlbiAnQWJvdXQnICAgICAgICB0aGVuIHBvc3QudG9NYWluICdzaG93QWJvdXQnXG4gICAgICAgICAgICB3aGVuICdTY2hlbWUnICAgICAgIHRoZW4gcG9zdC50b1dpbnMgJ3RvZ2dsZVNjaGVtZSdcbiAgICAgICAgICAgIHdoZW4gJ0luY3JlYXNlU2l6ZScgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsU2l6ZScgJ2luY3JlYXNlJ1xuICAgICAgICAgICAgd2hlbiAnRGVjcmVhc2VTaXplJyB0aGVuIHBvc3QudG9NYWluICdrYWNoZWxTaXplJyAnZGVjcmVhc2UnXG4gICAgICAgICAgICB3aGVuICdSZXNldFNpemUnICAgIHRoZW4gcG9zdC50b01haW4gJ2thY2hlbFNpemUnICdyZXNldCdcbiAgICAgICAgICAgIHdoZW4gJ0luY3JlYXNlJyAgICAgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsU2l6ZScgJ2luY3JlYXNlJyBAaWRcbiAgICAgICAgICAgIHdoZW4gJ0RlY3JlYXNlJyAgICAgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsU2l6ZScgJ2RlY3JlYXNlJyBAaWRcbiAgICAgICAgICAgIHdoZW4gJ1Jlc2V0JyAgICAgICAgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsU2l6ZScgJ3Jlc2V0JyAgICBAaWRcbiAgICAgICAgICAgIHdoZW4gJ01vdmVVcCcgICAgICAgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsTW92ZScgJ3VwJyAgICAgICBAaWRcbiAgICAgICAgICAgIHdoZW4gJ01vdmVEb3duJyAgICAgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsTW92ZScgJ2Rvd24nICAgICBAaWRcbiAgICAgICAgICAgIHdoZW4gJ01vdmVMZWZ0JyAgICAgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsTW92ZScgJ2xlZnQnICAgICBAaWRcbiAgICAgICAgICAgIHdoZW4gJ01vdmVSaWdodCcgICAgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsTW92ZScgJ3JpZ2h0JyAgICBAaWRcbiAgICAgICAgICAgIHdoZW4gJ0RldlRvb2xzJyAgICAgdGhlbiBAd2luLndlYkNvbnRlbnRzLnRvZ2dsZURldlRvb2xzKClcbiAgICAgICAgICAgIHdoZW4gJ1JlbG9hZCcgICAgICAgdGhlbiBAd2luLndlYkNvbnRlbnRzLnJlbG9hZElnbm9yaW5nQ2FjaGUoKVxuICAgICAgICAgICAgd2hlbiAnU2NyZWVuc2hvdCcgICB0aGVuIEBzY3JlZW5zaG90KClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBrbG9nICdhY3Rpb24nIGFjdGlvblxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIG9uQ29tYm86IChjb21ibywgaW5mbykgPT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgc3dpdGNoIGNvbWJvXG4gICAgICAgICAgICB3aGVuICdsZWZ0JydyaWdodCcndXAnJ2Rvd24nIHRoZW4gcG9zdC50b01haW4gJ2ZvY3VzTmVpZ2hib3InIEBpZCwgY29tYm9cbiAgICAgICAgICAgIHdoZW4gJ2VudGVyJydzcGFjZScgdGhlbiBAb25MZWZ0Q2xpY2soKVxuICAgICAgICAgICAgd2hlbiAnY29tbWFuZCtlbnRlcicnY29tbWFuZCtzcGFjZScnY3RybCtlbnRlcicnY3RybCtzcGFjZScgdGhlbiBAb25SaWdodENsaWNrKClcbiAgICAgICAgICAgIHdoZW4gJ2FsdCtjb21tYW5kK2VudGVyJydhbHQrY29tbWFuZCtzcGFjZScnYWx0K2N0cmwrZW50ZXInJ2FsdCtjdHJsK3NwYWNlJyB0aGVuIEBvbk1pZGRsZUNsaWNrKClcbiAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBLYWNoZWxcbiJdfQ==
//# sourceURL=../coffee/kachel.coffee
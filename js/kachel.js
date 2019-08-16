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
        }
    };

    return Kachel;

})(win);

module.exports = Kachel;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2FjaGVsLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSw4RkFBQTtJQUFBOzs7O0FBUUEsTUFBZ0YsT0FBQSxDQUFRLEtBQVIsQ0FBaEYsRUFBRSxlQUFGLEVBQVEsZUFBUixFQUFjLG1CQUFkLEVBQXNCLHlCQUF0QixFQUFpQyxpQkFBakMsRUFBd0MsaUJBQXhDLEVBQStDLGVBQS9DLEVBQXFELGVBQXJELEVBQTJELGVBQTNELEVBQWlFLGFBQWpFLEVBQXNFLFdBQXRFLEVBQTBFOztBQUUxRSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0FBRUg7OztJQUVDLGdCQUFDLEdBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLGtEQUFTOzs7Ozs7Ozs7Ozs7Ozs7OztRQUVWLHdDQUNJO1lBQUEsY0FBQSxFQUFnQixHQUFoQjtZQUNBLEdBQUEsRUFBUSxTQURSO1lBRUEsR0FBQSxFQUFRLE9BQUEsQ0FBUSxpQkFBUixDQUZSO1lBR0EsSUFBQSxFQUFRLHFCQUhSO1lBSUEsTUFBQSxFQUFRLElBQUMsQ0FBQSxTQUpUO1NBREo7UUFPQSxJQUFDLENBQUEsSUFBRCxHQUFPLENBQUEsQ0FBRSxPQUFGO1FBQ1AsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFJLElBQUosQ0FDSjtZQUFBLE1BQUEsRUFBVSxRQUFRLENBQUMsSUFBbkI7WUFDQSxPQUFBLEVBQVUsSUFBQyxDQUFBLFdBRFg7WUFFQSxNQUFBLEVBQVUsSUFBQyxDQUFBLFVBRlg7WUFHQSxNQUFBLEVBQVUsSUFBQyxDQUFBLFVBSFg7U0FESTtRQU1SLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLE1BQVIsRUFBZ0IsSUFBQyxDQUFBLFNBQWpCO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFMLENBQVEsTUFBUixFQUFnQixJQUFDLENBQUEsU0FBakI7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUws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RHRCO0FBQUEsaUJBQzBCLE1BRDFCO3VCQUNzQyxJQUFJLENBQUMsTUFBTCxDQUFZLGVBQVosRUFBNEIsSUFBQyxDQUFBLEVBQTdCLEVBQWlDLEtBQWpDO0FBRHRDLGlCQUVTLE9BRlQ7QUFBQSxpQkFFZ0IsT0FGaEI7dUJBRTZCLElBQUMsQ0FBQSxXQUFELENBQUE7QUFGN0I7SUFGSzs7OztHQWpMUTs7QUF1THJCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgICAgXG4wMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgXG4wMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgICAgXG4wMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4jIyNcblxueyBkcmFnLCBwb3N0LCBzY2hlbWUsIHN0b3BFdmVudCwgcHJlZnMsIHNsYXNoLCBrbG9nLCBrc3RyLCBlbGVtLCB3aW4sIG9zLCAkIH0gPSByZXF1aXJlICdreGsnXG5cbkJvdW5kcyA9IHJlcXVpcmUgJy4vYm91bmRzJ1xuXG5jbGFzcyBLYWNoZWwgZXh0ZW5kcyB3aW5cblxuICAgIEA6IChAa2FjaGVsSWQ6J2thY2hlbCcpIC0+XG4gICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICAgICAgcHJlZnNTZXBlcmF0b3I6ICfilrgnXG4gICAgICAgICAgICBkaXI6ICAgIF9fZGlybmFtZVxuICAgICAgICAgICAgcGtnOiAgICByZXF1aXJlICcuLi9wYWNrYWdlLmpzb24nXG4gICAgICAgICAgICBtZW51OiAgICcuLi9jb2ZmZWUvbWVudS5ub29uJ1xuICAgICAgICAgICAgb25Mb2FkOiBAb25XaW5Mb2FkXG4gICAgXG4gICAgICAgIEBtYWluID0kICcjbWFpbidcbiAgICAgICAgQGRyYWcgPSBuZXcgZHJhZ1xuICAgICAgICAgICAgdGFyZ2V0OiAgIGRvY3VtZW50LmJvZHlcbiAgICAgICAgICAgIG9uU3RhcnQ6ICBAb25EcmFnU3RhcnRcbiAgICAgICAgICAgIG9uTW92ZTogICBAb25EcmFnTW92ZVxuICAgICAgICAgICAgb25TdG9wOiAgIEBvbkRyYWdTdG9wXG4gICAgICAgIFxuICAgICAgICBAd2luLm9uICdtb3ZlJyAgQG9uV2luTW92ZVxuICAgICAgICBAd2luLm9uICdibHVyJyAgQG9uV2luQmx1clxuICAgICAgICBAd2luLm9uICdmb2N1cycgQG9uV2luRm9jdXNcbiAgICAgICAgQHdpbi5vbiAnbW92ZScgIEBvbldpbk1vdmVcbiAgICAgICAgQHdpbi5vbiAnY2xvc2UnIEBvbldpbkNsb3NlXG4gICAgICAgIFxuICAgICAgICBwb3N0Lm9uICdpbml0S2FjaGVsJyBAb25Jbml0S2FjaGVsXG4gICAgICAgIHBvc3Qub24gJ3NhdmVCb3VuZHMnIEBvblNhdmVCb3VuZHNcbiAgICAgICAgcG9zdC5vbiAnY29tYm8nICAgICAgQG9uQ29tYm9cbiAgICAgICAgcG9zdC5vbiAnaG92ZXInICAgICAgQG9uSG92ZXJcbiAgICAgICAgcG9zdC5vbiAnbGVhdmUnICAgICAgQG9uTGVhdmVcbiAgICAgICAgcG9zdC5vbiAndG9nZ2xlU2NoZW1lJyAtPiBzY2hlbWUudG9nZ2xlKClcbiAgICAgICAgXG4gICAgICAgIGlmIEBrYWNoZWxJZCAhPSAnbWFpbidcbiAgICAgICAgICAgIEB3aW4uc2V0U2tpcFRhc2tiYXIgdHJ1ZVxuICAgICAgICBcbiAgICAgICAgcG9zdC50b01haW4gJ2thY2hlbEJvdW5kcycgQGlkLCBAa2FjaGVsSWRcbiAgICAgICAgXG4gICAgICAgICMgaWYgb3MucGxhdGZvcm0oKSA9PSAnZGFyd2luJ1xuICAgICAgICAgICAgIyBpZiBwYXJzZUludChvcy5yZWxlYXNlKCkuc3BsaXQoJy4nKVswXSkgPj0gMThcbiAgICAgICAgICAgICAgICAjIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCAnbW9qYXZlJ1xuICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAwIDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgICAgMDAwICAgICAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMCAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgIFxuICAgIFxuICAgIHJlcXVlc3REYXRhOiAobmFtZSkgLT5cbiAgICAgICAgXG4gICAgICAgIHBvc3QudG9NYWluICdyZXF1ZXN0RGF0YScgbmFtZSwgQGlkXG4gICAgICAgIHBvc3Qub24gJ2RhdGEnIEBvbkRhdGFcbiAgICAgICAgICAgICAgICBcbiAgICBrYWNoZWxTaXplOiAtPiBCb3VuZHMua2FjaGVsU2l6ZSBAd2luXG4gICAgICAgICAgICBcbiAgICBvbkNvbnRleHRNZW51OiAoZXZlbnQpID0+IHN0b3BFdmVudCBldmVudCBcbiAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIG9uRHJhZ1N0YXJ0OiAoZHJhZywgZXZlbnQpID0+XG4gICAgXG4gICAgICAgIGlmIEB3aW4/LmlzRGVzdHJveWVkKClcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgXG4gICAgICAgIEBzdGFydEJvdW5kcyA9IEB3aW4uZ2V0Qm91bmRzKClcbiAgICAgICAgcG9zdC50b01haW4gJ2RyYWdTdGFydCcgQGlkXG4gICAgICAgIFxuICAgIG9uRHJhZ01vdmU6IChkcmFnLCBldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIEB3aW4uc2V0UG9zaXRpb24gQHN0YXJ0Qm91bmRzLnggKyBkcmFnLmRlbHRhU3VtLngsIEBzdGFydEJvdW5kcy55ICsgZHJhZy5kZWx0YVN1bS55XG4gICAgICAgIEB3aW4uc2V0U2l6ZSAgICAgQHN0YXJ0Qm91bmRzLndpZHRoLCBAc3RhcnRCb3VuZHMuaGVpZ2h0XG4gICAgICAgIFxuICAgIG9uRHJhZ1N0b3A6IChkcmFnLCBldmVudCkgPT5cblxuICAgICAgICBpZiBNYXRoLmFicyhkcmFnLmRlbHRhU3VtLngpIDwgMTAgYW5kIE1hdGguYWJzKGRyYWcuZGVsdGFTdW0ueSkgPCAxMFxuICAgICAgICAgICAgQHdpbi5zZXRCb3VuZHMgQHN0YXJ0Qm91bmRzXG4gICAgICAgICAgICBpZiBldmVudC5idXR0b24gPT0gMFxuICAgICAgICAgICAgICAgIEBvbkxlZnRDbGljayBldmVudFxuICAgICAgICAgICAgZWxzZSBpZiBldmVudC5idXR0b24gPT0gMVxuICAgICAgICAgICAgICAgIEBvbk1pZGRsZUNsaWNrIGV2ZW50XG4gICAgICAgICAgICBlbHNlIGlmIGV2ZW50LmJ1dHRvbiA9PSAyXG4gICAgICAgICAgICAgICAgQG9uUmlnaHRDbGljayBldmVudFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwb3N0LnRvTWFpbiAnc25hcEthY2hlbCcgQGlkXG4gICAgICAgIHBvc3QudG9NYWluICdkcmFnU3RvcCcgQGlkXG4gICAgXG4gICAgb25TYXZlQm91bmRzOiA9PlxuICAgICAgICBcbiAgICAgICAgZm9yIGkgaW4gWzEuLjZdXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUgXCJrYWNoZWxTaXplI3tpfVwiXG4gICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCBcImthY2hlbFNpemUje0BrYWNoZWxTaXplKCkrMX1cIlxuICAgICAgICBzZXRJZCA9IHByZWZzLmdldCAnc2V0JyAnJ1xuICAgICAgICBwcmVmcy5zZXQgXCJib3VuZHMje3NldElkfeKWuCN7QGthY2hlbElkfVwiIEB3aW4uZ2V0Qm91bmRzKClcbiAgICAgICAgQG9uQm91bmRzKClcbiAgICAgICAgXG4gICAgb25Ib3ZlcjogKGV2ZW50KSA9PiBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQgJ2thY2hlbEhvdmVyJ1xuICAgIG9uTGVhdmU6IChldmVudCkgPT4gZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlICdrYWNoZWxIb3ZlcidcbiAgICAgICAgXG4gICAgb25XaW5Gb2N1czogKGV2ZW50KSA9PiBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQgICAgJ2thY2hlbEZvY3VzJzsgcG9zdC50b01haW4gJ2thY2hlbEZvY3VzJyBAaWQ7IEBvbkZvY3VzIGV2ZW50XG4gICAgb25XaW5CbHVyOiAgKGV2ZW50KSA9PiBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUgJ2thY2hlbEZvY3VzJzsgQG9uQmx1ciAgZXZlbnRcbiAgICBvbldpbkxvYWQ6ICAoZXZlbnQpID0+IEBvbkxvYWQgZXZlbnRcbiAgICBvbldpbk1vdmU6ICAoZXZlbnQpID0+IEBvbk1vdmUgZXZlbnRcbiAgICBvbldpbkNsb3NlOiAoZXZlbnQpID0+IEBvbkNsb3NlIGV2ZW50XG4gICAgICAgIFxuICAgIG9uSW5pdEthY2hlbDogKEBrYWNoZWxJZCkgPT5cbiAgICAgICAgICAgXG4gICAgICAgICMga2xvZyAnb25Jbml0S2FjaGVsIEBrYWNoZWxJZCcgQGthY2hlbElkXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEB3aW4uc2V0VGl0bGUgXCJrYWNoZWwgI3tAa2FjaGVsSWR9XCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcG9zdC50b01haW4gJ2thY2hlbEJvdW5kcycgQGlkLCBAa2FjaGVsSWRcbiAgICAgICAgcG9zdC50b01haW4gJ2thY2hlbExvYWQnIEBpZCwgQGthY2hlbElkXG4gICAgXG4gICAgb25Mb2FkOiAgIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25Nb3ZlOiAgIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25Gb2N1czogIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25CbHVyOiAgIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25Nb3ZlOiAgIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25DbG9zZTogIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25Cb3VuZHM6IC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25MZWZ0Q2xpY2s6ICAgIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25NaWRkbGVDbGljazogIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25SaWdodENsaWNrOiAgIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHNldEljb246IChpY29uUGF0aCkgPT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgaWNvblBhdGhcbiAgICAgICAgaW1nID0gZWxlbSAnaW1nJyBjbGFzczonYXBwbGljb24nIHNyYzpzbGFzaC5maWxlVXJsIHNsYXNoLnBhdGggaWNvblBhdGhcbiAgICAgICAgaW1nLm9uZHJhZ3N0YXJ0ID0gLT4gZmFsc2VcbiAgICAgICAgQG1haW4uaW5uZXJIVE1MID0gJydcbiAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgaW1nXG4gICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCBcbiAgICBcbiAgICBvbk1lbnVBY3Rpb246IChhY3Rpb24pID0+XG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggYWN0aW9uXG4gICAgICAgICAgICB3aGVuICdOZXcnICAgICAgICAgIHRoZW4gcG9zdC50b01haW4gJ25ld0thY2hlbCcgJ2RlZmF1bHQnXG4gICAgICAgICAgICB3aGVuICdDbG9zZScgICAgICAgIHRoZW4gQHdpbi5jbG9zZSgpXG4gICAgICAgICAgICB3aGVuICdRdWl0JyAgICAgICAgIHRoZW4gcG9zdC50b01haW4gJ3F1aXQnXG4gICAgICAgICAgICB3aGVuICdIaWRlJyAgICAgICAgIHRoZW4gcG9zdC50b01haW4gJ2hpZGUnXG4gICAgICAgICAgICB3aGVuICdBYm91dCcgICAgICAgIHRoZW4gcG9zdC50b01haW4gJ3Nob3dBYm91dCdcbiAgICAgICAgICAgIHdoZW4gJ1NjaGVtZScgICAgICAgdGhlbiBwb3N0LnRvV2lucyAndG9nZ2xlU2NoZW1lJ1xuICAgICAgICAgICAgd2hlbiAnSW5jcmVhc2VTaXplJyB0aGVuIHBvc3QudG9NYWluICdrYWNoZWxTaXplJyAnaW5jcmVhc2UnXG4gICAgICAgICAgICB3aGVuICdEZWNyZWFzZVNpemUnIHRoZW4gcG9zdC50b01haW4gJ2thY2hlbFNpemUnICdkZWNyZWFzZSdcbiAgICAgICAgICAgIHdoZW4gJ1Jlc2V0U2l6ZScgICAgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsU2l6ZScgJ3Jlc2V0J1xuICAgICAgICAgICAgd2hlbiAnSW5jcmVhc2UnICAgICB0aGVuIHBvc3QudG9NYWluICdrYWNoZWxTaXplJyAnaW5jcmVhc2UnIEBpZFxuICAgICAgICAgICAgd2hlbiAnRGVjcmVhc2UnICAgICB0aGVuIHBvc3QudG9NYWluICdrYWNoZWxTaXplJyAnZGVjcmVhc2UnIEBpZFxuICAgICAgICAgICAgd2hlbiAnUmVzZXQnICAgICAgICB0aGVuIHBvc3QudG9NYWluICdrYWNoZWxTaXplJyAncmVzZXQnICAgIEBpZFxuICAgICAgICAgICAgd2hlbiAnTW92ZVVwJyAgICAgICB0aGVuIHBvc3QudG9NYWluICdrYWNoZWxNb3ZlJyAndXAnICAgICAgIEBpZFxuICAgICAgICAgICAgd2hlbiAnTW92ZURvd24nICAgICB0aGVuIHBvc3QudG9NYWluICdrYWNoZWxNb3ZlJyAnZG93bicgICAgIEBpZFxuICAgICAgICAgICAgd2hlbiAnTW92ZUxlZnQnICAgICB0aGVuIHBvc3QudG9NYWluICdrYWNoZWxNb3ZlJyAnbGVmdCcgICAgIEBpZFxuICAgICAgICAgICAgd2hlbiAnTW92ZVJpZ2h0JyAgICB0aGVuIHBvc3QudG9NYWluICdrYWNoZWxNb3ZlJyAncmlnaHQnICAgIEBpZFxuICAgICAgICAgICAgd2hlbiAnRGV2VG9vbHMnICAgICB0aGVuIEB3aW4ud2ViQ29udGVudHMudG9nZ2xlRGV2VG9vbHMoKVxuICAgICAgICAgICAgd2hlbiAnUmVsb2FkJyAgICAgICB0aGVuIEB3aW4ud2ViQ29udGVudHMucmVsb2FkSWdub3JpbmdDYWNoZSgpXG4gICAgICAgICAgICB3aGVuICdTY3JlZW5zaG90JyAgIHRoZW4gQHNjcmVlbnNob3QoKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGtsb2cgJ2FjdGlvbicgYWN0aW9uXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgb25Db21ibzogKGNvbWJvLCBpbmZvKSA9PlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBzd2l0Y2ggY29tYm9cbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnJ3JpZ2h0Jyd1cCcnZG93bicgdGhlbiBwb3N0LnRvTWFpbiAnZm9jdXNOZWlnaGJvcicgQGlkLCBjb21ib1xuICAgICAgICAgICAgd2hlbiAnZW50ZXInJ3NwYWNlJyB0aGVuIEBvbkxlZnRDbGljaygpXG4gICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gS2FjaGVsXG4iXX0=
//# sourceURL=../coffee/kachel.coffee
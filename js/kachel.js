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
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf;

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
                this.onClick(event);
            } else if (event.button === 1) {
                this.onMiddleClick(event);
            }
        } else {
            post.toMain('snapKachel', this.id);
        }
        return post.toMain('dragStop', this.id);
    };

    Kachel.prototype.onSaveBounds = function() {
        var i, j;
        for (i = j = 1; j <= 6; i = ++j) {
            document.body.classList.remove("kachelSize" + i);
        }
        document.body.classList.add("kachelSize" + (this.kachelSize() + 1));
        klog('onSaveBounds', this.kachelSize() + 1, this.win.getBounds());
        prefs.set("bounds▸" + this.kachelId, this.win.getBounds());
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
        if (this.kachelId !== 'main') {
            prefs.set('kacheln', prefs.get('kacheln').filter((function(_this) {
                return function(k) {
                    return k !== _this.kachelId;
                };
            })(this)));
        }
        return this.onClose(event);
    };

    Kachel.prototype.onInitKachel = function() {
        var kacheln, ref1;
        if (this.kachelId !== 'main') {
            kacheln = prefs.get('kacheln', []);
            if (ref1 = this.kachelId, indexOf.call(kacheln, ref1) < 0) {
                kacheln.push(this.kachelId);
                prefs.set('kacheln', kacheln);
            }
        }
        this.win.setTitle("kachel " + this.kachelId);
        return post.toMain('kachelBounds', this.id, this.kachelId);
    };

    Kachel.prototype.onLoad = function() {};

    Kachel.prototype.onMove = function() {};

    Kachel.prototype.onClick = function() {};

    Kachel.prototype.onMiddleClick = function() {};

    Kachel.prototype.onFocus = function() {};

    Kachel.prototype.onBlur = function() {};

    Kachel.prototype.onMove = function() {};

    Kachel.prototype.onClose = function() {};

    Kachel.prototype.onBounds = function() {};

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
                return this.onClick();
        }
    };

    return Kachel;

})(win);

module.exports = Kachel;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2FjaGVsLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSw4RkFBQTtJQUFBOzs7OztBQVFBLE1BQWdGLE9BQUEsQ0FBUSxLQUFSLENBQWhGLEVBQUUsZUFBRixFQUFRLGVBQVIsRUFBYyxtQkFBZCxFQUFzQix5QkFBdEIsRUFBaUMsaUJBQWpDLEVBQXdDLGlCQUF4QyxFQUErQyxlQUEvQyxFQUFxRCxlQUFyRCxFQUEyRCxlQUEzRCxFQUFpRSxhQUFqRSxFQUFzRSxXQUF0RSxFQUEwRTs7QUFFMUUsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztBQUVIOzs7SUFFQyxnQkFBQyxHQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxrREFBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7UUFFVix3Q0FDSTtZQUFBLGNBQUEsRUFBZ0IsR0FBaEI7WUFDQSxHQUFBLEVBQVEsU0FEUjtZQUVBLEdBQUEsRUFBUSxPQUFBLENBQVEsaUJBQVIsQ0FGUjtZQUdBLElBQUEsRUFBUSxxQkFIUjtZQUlBLE1BQUEsRUFBUSxJQUFDLENBQUEsU0FKVDtTQURKO1FBT0EsSUFBQyxDQUFBLElBQUQsR0FBTyxDQUFBLENBQUUsT0FBRjtRQUNQLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBSSxJQUFKLENBQ0o7WUFBQSxNQUFBLEVBQVUsUUFBUSxDQUFDLElBQW5CO1lBQ0EsT0FBQSxFQUFVLElBQUMsQ0FBQSxXQURYO1lBRUEsTUFBQSxFQUFVLElBQUMsQ0FBQSxVQUZYO1lBR0EsTUFBQSxFQUFVLElBQUMsQ0FBQSxVQUhYO1NBREk7UUFNUixJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxNQUFSLEVBQWdCLElBQUMsQ0FBQSxTQUFqQjtRQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLE1BQVIsRUFBZ0IsSUFBQyxDQUFBLFNBQWpCO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFM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LEdBQUcsQ0FBQyxXQUFXLENBQUMsY0FBakIsQ0FBQTtBQWpCN0IsaUJBa0JTLFFBbEJUO3VCQWtCNkIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxXQUFXLENBQUMsbUJBQWpCLENBQUE7QUFsQjdCLGlCQW1CUyxZQW5CVDt1QkFtQjZCLElBQUMsQ0FBQSxVQUFELENBQUE7QUFuQjdCO3VCQXFCUSxJQUFBLENBQUssUUFBTCxFQUFjLE1BQWQ7QUFyQlI7SUFGVTs7cUJBK0JkLE9BQUEsR0FBUyxTQUFDLEtBQUQsRUFBUSxJQUFSO0FBRUwsZ0JBQU8sS0FBUDtBQUFBLGlCQUNTLE1BRFQ7QUFBQSxpQkFDZSxPQURmO0FBQUEsaUJBQ3NCLElBRHRCO0FBQUEsaUJBQzBCLE1BRDFCO3VCQUNzQyxJQUFJLENBQUMsTUFBTCxDQUFZLGVBQVosRUFBNEIsSUFBQyxDQUFBLEVBQTdCLEVBQWlDLEtBQWpDO0FBRHRDLGlCQUVTLE9BRlQ7QUFBQSxpQkFFZ0IsT0FGaEI7dUJBRTZCLElBQUMsQ0FBQSxPQUFELENBQUE7QUFGN0I7SUFGSzs7OztHQXRMUTs7QUE0THJCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgICAgXG4wMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgXG4wMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgICAgXG4wMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4jIyNcblxueyBkcmFnLCBwb3N0LCBzY2hlbWUsIHN0b3BFdmVudCwgcHJlZnMsIHNsYXNoLCBrbG9nLCBrc3RyLCBlbGVtLCB3aW4sIG9zLCAkIH0gPSByZXF1aXJlICdreGsnXG5cbkJvdW5kcyA9IHJlcXVpcmUgJy4vYm91bmRzJ1xuXG5jbGFzcyBLYWNoZWwgZXh0ZW5kcyB3aW5cblxuICAgIEA6IChAa2FjaGVsSWQ6J2thY2hlbCcpIC0+XG4gICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICAgICAgcHJlZnNTZXBlcmF0b3I6ICfilrgnXG4gICAgICAgICAgICBkaXI6ICAgIF9fZGlybmFtZVxuICAgICAgICAgICAgcGtnOiAgICByZXF1aXJlICcuLi9wYWNrYWdlLmpzb24nXG4gICAgICAgICAgICBtZW51OiAgICcuLi9jb2ZmZWUvbWVudS5ub29uJ1xuICAgICAgICAgICAgb25Mb2FkOiBAb25XaW5Mb2FkXG4gICAgXG4gICAgICAgIEBtYWluID0kICcjbWFpbidcbiAgICAgICAgQGRyYWcgPSBuZXcgZHJhZ1xuICAgICAgICAgICAgdGFyZ2V0OiAgIGRvY3VtZW50LmJvZHlcbiAgICAgICAgICAgIG9uU3RhcnQ6ICBAb25EcmFnU3RhcnRcbiAgICAgICAgICAgIG9uTW92ZTogICBAb25EcmFnTW92ZVxuICAgICAgICAgICAgb25TdG9wOiAgIEBvbkRyYWdTdG9wXG4gICAgICAgIFxuICAgICAgICBAd2luLm9uICdtb3ZlJyAgQG9uV2luTW92ZVxuICAgICAgICBAd2luLm9uICdibHVyJyAgQG9uV2luQmx1clxuICAgICAgICBAd2luLm9uICdmb2N1cycgQG9uV2luRm9jdXNcbiAgICAgICAgQHdpbi5vbiAnbW92ZScgIEBvbldpbk1vdmVcbiAgICAgICAgQHdpbi5vbiAnY2xvc2UnIEBvbldpbkNsb3NlXG4gICAgICAgIFxuICAgICAgICBwb3N0Lm9uICdpbml0S2FjaGVsJyBAb25Jbml0S2FjaGVsXG4gICAgICAgIHBvc3Qub24gJ3NhdmVCb3VuZHMnIEBvblNhdmVCb3VuZHNcbiAgICAgICAgcG9zdC5vbiAnY29tYm8nICAgICAgQG9uQ29tYm9cbiAgICAgICAgcG9zdC5vbiAnaG92ZXInICAgICAgQG9uSG92ZXJcbiAgICAgICAgcG9zdC5vbiAnbGVhdmUnICAgICAgQG9uTGVhdmVcbiAgICAgICAgcG9zdC5vbiAndG9nZ2xlU2NoZW1lJyAtPiBzY2hlbWUudG9nZ2xlKClcbiAgICAgICAgXG4gICAgICAgIGlmIEBrYWNoZWxJZCAhPSAnbWFpbidcbiAgICAgICAgICAgIEB3aW4uc2V0U2tpcFRhc2tiYXIgdHJ1ZVxuICAgICAgICBcbiAgICAgICAgcG9zdC50b01haW4gJ2thY2hlbEJvdW5kcycgQGlkLCBAa2FjaGVsSWRcbiAgICAgICAgXG4gICAgICAgICMgaWYgb3MucGxhdGZvcm0oKSA9PSAnZGFyd2luJ1xuICAgICAgICAgICAgIyBpZiBwYXJzZUludChvcy5yZWxlYXNlKCkuc3BsaXQoJy4nKVswXSkgPj0gMThcbiAgICAgICAgICAgICAgICAjIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCAnbW9qYXZlJ1xuICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAwIDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgICAgMDAwICAgICAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMCAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgIFxuICAgIFxuICAgIHJlcXVlc3REYXRhOiAobmFtZSkgLT5cbiAgICAgICAgXG4gICAgICAgIHBvc3QudG9NYWluICdyZXF1ZXN0RGF0YScgbmFtZSwgQGlkXG4gICAgICAgIHBvc3Qub24gJ2RhdGEnIEBvbkRhdGFcbiAgICAgICAgICAgICAgICBcbiAgICBrYWNoZWxTaXplOiAtPiBCb3VuZHMua2FjaGVsU2l6ZSBAd2luXG4gICAgICAgICAgICBcbiAgICBvbkNvbnRleHRNZW51OiAoZXZlbnQpID0+IHN0b3BFdmVudCBldmVudCBcbiAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIG9uRHJhZ1N0YXJ0OiAoZHJhZywgZXZlbnQpID0+XG4gICAgXG4gICAgICAgIGlmIEB3aW4/LmlzRGVzdHJveWVkKClcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgXG4gICAgICAgIEBzdGFydEJvdW5kcyA9IEB3aW4uZ2V0Qm91bmRzKClcbiAgICAgICAgcG9zdC50b01haW4gJ2RyYWdTdGFydCcgQGlkXG4gICAgICAgIFxuICAgIG9uRHJhZ01vdmU6IChkcmFnLCBldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIEB3aW4uc2V0UG9zaXRpb24gQHN0YXJ0Qm91bmRzLnggKyBkcmFnLmRlbHRhU3VtLngsIEBzdGFydEJvdW5kcy55ICsgZHJhZy5kZWx0YVN1bS55XG4gICAgICAgIEB3aW4uc2V0U2l6ZSAgICAgQHN0YXJ0Qm91bmRzLndpZHRoLCBAc3RhcnRCb3VuZHMuaGVpZ2h0XG4gICAgICAgIFxuICAgIG9uRHJhZ1N0b3A6IChkcmFnLCBldmVudCkgPT5cblxuICAgICAgICBpZiBNYXRoLmFicyhkcmFnLmRlbHRhU3VtLngpIDwgMTAgYW5kIE1hdGguYWJzKGRyYWcuZGVsdGFTdW0ueSkgPCAxMFxuICAgICAgICAgICAgQHdpbi5zZXRCb3VuZHMgQHN0YXJ0Qm91bmRzXG4gICAgICAgICAgICBpZiBldmVudC5idXR0b24gPT0gMFxuICAgICAgICAgICAgICAgIEBvbkNsaWNrIGV2ZW50XG4gICAgICAgICAgICBlbHNlIGlmIGV2ZW50LmJ1dHRvbiA9PSAxXG4gICAgICAgICAgICAgICAgQG9uTWlkZGxlQ2xpY2sgZXZlbnRcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcG9zdC50b01haW4gJ3NuYXBLYWNoZWwnIEBpZFxuICAgICAgICBwb3N0LnRvTWFpbiAnZHJhZ1N0b3AnIEBpZFxuICAgIFxuICAgIG9uU2F2ZUJvdW5kczogPT5cbiAgICAgICAgXG4gICAgICAgIGZvciBpIGluIFsxLi42XVxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlIFwia2FjaGVsU2l6ZSN7aX1cIlxuICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQgXCJrYWNoZWxTaXplI3tAa2FjaGVsU2l6ZSgpKzF9XCJcbiAgICAgICAga2xvZyAnb25TYXZlQm91bmRzJyBAa2FjaGVsU2l6ZSgpKzEsIEB3aW4uZ2V0Qm91bmRzKClcbiAgICAgICAgcHJlZnMuc2V0IFwiYm91bmRz4pa4I3tAa2FjaGVsSWR9XCIgQHdpbi5nZXRCb3VuZHMoKVxuICAgICAgICBAb25Cb3VuZHMoKVxuICAgICAgICBcbiAgICBvbkhvdmVyOiAoZXZlbnQpID0+IGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCAna2FjaGVsSG92ZXInXG4gICAgb25MZWF2ZTogKGV2ZW50KSA9PiBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUgJ2thY2hlbEhvdmVyJ1xuICAgICAgICBcbiAgICBvbldpbkZvY3VzOiAoZXZlbnQpID0+IGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCAgICAna2FjaGVsRm9jdXMnOyBwb3N0LnRvTWFpbiAna2FjaGVsRm9jdXMnIEBpZDsgQG9uRm9jdXMgZXZlbnRcbiAgICBvbldpbkJsdXI6ICAoZXZlbnQpID0+IGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSAna2FjaGVsRm9jdXMnOyBAb25CbHVyICBldmVudFxuICAgIG9uV2luTG9hZDogIChldmVudCkgPT4gQG9uTG9hZCBldmVudFxuICAgIG9uV2luTW92ZTogIChldmVudCkgPT4gQG9uTW92ZSBldmVudFxuICAgICAgICAgICAgICAgIFxuICAgIG9uV2luQ2xvc2U6IChldmVudCkgPT4gXG4gICAgICAgIGlmIEBrYWNoZWxJZCAhPSAnbWFpbidcbiAgICAgICAgICAgIHByZWZzLnNldCAna2FjaGVsbicgcHJlZnMuZ2V0KCdrYWNoZWxuJykuZmlsdGVyIChrKSA9PiBrICE9IEBrYWNoZWxJZFxuICAgICAgICAgICAgXG4gICAgICAgIEBvbkNsb3NlIGV2ZW50XG4gICAgICAgIFxuICAgIG9uSW5pdEthY2hlbDogPT5cbiAgICAgICAgICAgXG4gICAgICAgIGlmIEBrYWNoZWxJZCAhPSAnbWFpbidcbiAgICAgICAgICAgIGthY2hlbG4gPSBwcmVmcy5nZXQgJ2thY2hlbG4nIFtdXG4gICAgICAgICAgICBpZiBAa2FjaGVsSWQgbm90IGluIGthY2hlbG5cbiAgICAgICAgICAgICAgICBrYWNoZWxuLnB1c2ggQGthY2hlbElkIFxuICAgICAgICAgICAgICAgIHByZWZzLnNldCAna2FjaGVsbicga2FjaGVsblxuICAgICAgICBcbiAgICAgICAgQHdpbi5zZXRUaXRsZSBcImthY2hlbCAje0BrYWNoZWxJZH1cIlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBwb3N0LnRvTWFpbiAna2FjaGVsQm91bmRzJyBAaWQsIEBrYWNoZWxJZFxuICAgIFxuICAgIG9uTG9hZDogICAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uTW92ZTogICAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uQ2xpY2s6ICAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uTWlkZGxlQ2xpY2s6ICAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uRm9jdXM6ICAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uQmx1cjogICAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uTW92ZTogICAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uQ2xvc2U6ICAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uQm91bmRzOiAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBzZXRJY29uOiAoaWNvblBhdGgpID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGljb25QYXRoXG4gICAgICAgIGltZyA9IGVsZW0gJ2ltZycgY2xhc3M6J2FwcGxpY29uJyBzcmM6c2xhc2guZmlsZVVybCBzbGFzaC5wYXRoIGljb25QYXRoXG4gICAgICAgIGltZy5vbmRyYWdzdGFydCA9IC0+IGZhbHNlXG4gICAgICAgIEBtYWluLmlubmVySFRNTCA9ICcnXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGltZ1xuICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgXG4gICAgXG4gICAgb25NZW51QWN0aW9uOiAoYWN0aW9uKSA9PlxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIGFjdGlvblxuICAgICAgICAgICAgd2hlbiAnTmV3JyAgICAgICAgICB0aGVuIHBvc3QudG9NYWluICduZXdLYWNoZWwnICdkZWZhdWx0J1xuICAgICAgICAgICAgd2hlbiAnQ2xvc2UnICAgICAgICB0aGVuIEB3aW4uY2xvc2UoKVxuICAgICAgICAgICAgd2hlbiAnUXVpdCcgICAgICAgICB0aGVuIHBvc3QudG9NYWluICdxdWl0J1xuICAgICAgICAgICAgd2hlbiAnSGlkZScgICAgICAgICB0aGVuIHBvc3QudG9NYWluICdoaWRlJ1xuICAgICAgICAgICAgd2hlbiAnQWJvdXQnICAgICAgICB0aGVuIHBvc3QudG9NYWluICdzaG93QWJvdXQnXG4gICAgICAgICAgICB3aGVuICdTY2hlbWUnICAgICAgIHRoZW4gcG9zdC50b1dpbnMgJ3RvZ2dsZVNjaGVtZSdcbiAgICAgICAgICAgIHdoZW4gJ0luY3JlYXNlU2l6ZScgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsU2l6ZScgJ2luY3JlYXNlJ1xuICAgICAgICAgICAgd2hlbiAnRGVjcmVhc2VTaXplJyB0aGVuIHBvc3QudG9NYWluICdrYWNoZWxTaXplJyAnZGVjcmVhc2UnXG4gICAgICAgICAgICB3aGVuICdSZXNldFNpemUnICAgIHRoZW4gcG9zdC50b01haW4gJ2thY2hlbFNpemUnICdyZXNldCdcbiAgICAgICAgICAgIHdoZW4gJ0luY3JlYXNlJyAgICAgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsU2l6ZScgJ2luY3JlYXNlJyBAaWRcbiAgICAgICAgICAgIHdoZW4gJ0RlY3JlYXNlJyAgICAgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsU2l6ZScgJ2RlY3JlYXNlJyBAaWRcbiAgICAgICAgICAgIHdoZW4gJ1Jlc2V0JyAgICAgICAgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsU2l6ZScgJ3Jlc2V0JyAgICBAaWRcbiAgICAgICAgICAgIHdoZW4gJ01vdmVVcCcgICAgICAgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsTW92ZScgJ3VwJyAgICAgICBAaWRcbiAgICAgICAgICAgIHdoZW4gJ01vdmVEb3duJyAgICAgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsTW92ZScgJ2Rvd24nICAgICBAaWRcbiAgICAgICAgICAgIHdoZW4gJ01vdmVMZWZ0JyAgICAgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsTW92ZScgJ2xlZnQnICAgICBAaWRcbiAgICAgICAgICAgIHdoZW4gJ01vdmVSaWdodCcgICAgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsTW92ZScgJ3JpZ2h0JyAgICBAaWRcbiAgICAgICAgICAgIHdoZW4gJ0RldlRvb2xzJyAgICAgdGhlbiBAd2luLndlYkNvbnRlbnRzLnRvZ2dsZURldlRvb2xzKClcbiAgICAgICAgICAgIHdoZW4gJ1JlbG9hZCcgICAgICAgdGhlbiBAd2luLndlYkNvbnRlbnRzLnJlbG9hZElnbm9yaW5nQ2FjaGUoKVxuICAgICAgICAgICAgd2hlbiAnU2NyZWVuc2hvdCcgICB0aGVuIEBzY3JlZW5zaG90KClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBrbG9nICdhY3Rpb24nIGFjdGlvblxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIG9uQ29tYm86IChjb21ibywgaW5mbykgPT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgc3dpdGNoIGNvbWJvXG4gICAgICAgICAgICB3aGVuICdsZWZ0JydyaWdodCcndXAnJ2Rvd24nIHRoZW4gcG9zdC50b01haW4gJ2ZvY3VzTmVpZ2hib3InIEBpZCwgY29tYm9cbiAgICAgICAgICAgIHdoZW4gJ2VudGVyJydzcGFjZScgdGhlbiBAb25DbGljaygpXG4gICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gS2FjaGVsXG4iXX0=
//# sourceURL=../coffee/kachel.coffee
// koffee 1.3.0

/*
000   000   0000000    0000000  000   000  00000000  000        
000  000   000   000  000       000   000  000       000        
0000000    000000000  000       000000000  0000000   000        
000  000   000   000  000       000   000  000       000        
000   000  000   000   0000000  000   000  00000000  0000000
 */
var $, Kachel, drag, elem, kachelSizes, klog, kstr, os, post, prefs, ref, scheme, slash, stopEvent, win,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf;

ref = require('kxk'), drag = ref.drag, post = ref.post, scheme = ref.scheme, stopEvent = ref.stopEvent, prefs = ref.prefs, slash = ref.slash, klog = ref.klog, kstr = ref.kstr, elem = ref.elem, win = ref.win, os = ref.os, $ = ref.$;

kachelSizes = [72, 108, 144, 216];

Kachel = (function(superClass) {
    extend(Kachel, superClass);

    function Kachel(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'kachel';
        this.onCombo = bind(this.onCombo, this);
        this.onMenuAction = bind(this.onMenuAction, this);
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
        if (os.platform() === 'darwin') {
            if (parseInt(os.release().split('.')[0]) >= 18) {
                document.body.classList.add('mojave');
            }
        }
    }

    Kachel.prototype.requestData = function(name) {
        post.toMain('requestData', name, this.id);
        return post.on('data', this.onData);
    };

    Kachel.prototype.kachelSize = function() {
        var size;
        size = 0;
        while (kachelSizes[size] < this.win.getBounds().width) {
            size++;
        }
        return size;
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
        if (drag.deltaSum.x < 10 && drag.deltaSum.y < 10) {
            this.win.setBounds(this.startBounds);
            if (event.button === 0) {
                this.onClick(event);
            }
        } else {
            post.toMain('snapKachel', this.id);
        }
        return post.toMain('dragStop', this.id);
    };

    Kachel.prototype.onSaveBounds = function() {
        var i, j;
        for (i = j = 1; j <= 4; i = ++j) {
            document.body.classList.remove("kachelSize" + i);
        }
        document.body.classList.add("kachelSize" + (this.kachelSize() + 1));
        prefs.set("bounds▸" + this.kachelId, this.win.getBounds());
        return this.onBounds();
    };

    Kachel.prototype.onHover = function(event) {
        return document.body.classList.add('kachelFocus');
    };

    Kachel.prototype.onLeave = function(event) {
        return document.body.classList.remove('kachelFocus');
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

    Kachel.prototype.onFocus = function() {};

    Kachel.prototype.onBlur = function() {};

    Kachel.prototype.onMove = function() {};

    Kachel.prototype.onClose = function() {};

    Kachel.prototype.onBounds = function() {};

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
                return post.toMain('focusKachel', this.id, combo);
            case 'enter':
            case 'space':
                return this.onClick();
        }
    };

    return Kachel;

})(win);

module.exports = Kachel;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2FjaGVsLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxtR0FBQTtJQUFBOzs7OztBQVFBLE1BQWdGLE9BQUEsQ0FBUSxLQUFSLENBQWhGLEVBQUUsZUFBRixFQUFRLGVBQVIsRUFBYyxtQkFBZCxFQUFzQix5QkFBdEIsRUFBaUMsaUJBQWpDLEVBQXdDLGlCQUF4QyxFQUErQyxlQUEvQyxFQUFxRCxlQUFyRCxFQUEyRCxlQUEzRCxFQUFpRSxhQUFqRSxFQUFzRSxXQUF0RSxFQUEwRTs7QUFFMUUsV0FBQSxHQUFjLENBQUMsRUFBRCxFQUFJLEdBQUosRUFBUSxHQUFSLEVBQVksR0FBWjs7QUFFUjs7O0lBRUMsZ0JBQUMsR0FBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsa0RBQVM7Ozs7Ozs7Ozs7Ozs7Ozs7UUFFVix3Q0FDSTtZQUFBLGNBQUEsRUFBZ0IsR0FBaEI7WUFDQSxHQUFBLEVBQVEsU0FEUjtZQUVBLEdBQUEsRUFBUSxPQUFBLENBQVEsaUJBQVIsQ0FGUjtZQUdBLElBQUEsRUFBUSxxQkFIUjtZQUlBLE1BQUEsRUFBUSxJQUFDLENBQUEsU0FKVDtTQURKO1FBT0EsSUFBQyxDQUFBLElBQUQsR0FBTyxDQUFBLENBQUUsT0FBRjtRQUNQLElBQUMsQ0FBQSxJQUFELEdBQVMsSUFBSSxJQUFKLENBQ0w7WUFBQSxNQUFBLEVBQVUsUUFBUSxDQUFDLElBQW5CO1lBQ0EsT0FBQSxFQUFVLElBQUMsQ0FBQSxXQURYO1lBRUEsTUFBQSxFQUFVLElBQUMsQ0FBQSxVQUZYO1lBR0EsTUFBQSxFQUFVLElBQUMsQ0FBQSxVQUhYO1NBREs7UUFNVCxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxNQUFSLEVBQWdCLElBQUMsQ0FBQSxTQUFqQjtRQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLE1BQVIsRUFBZ0IsSUFBQyxDQUFBLFNBQWpCO1FBQ0Es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QSxpQkFDZSxPQURmO0FBQUEsaUJBQ3NCLElBRHRCO0FBQUEsaUJBQzBCLE1BRDFCO3VCQUNzQyxJQUFJLENBQUMsTUFBTCxDQUFZLGFBQVosRUFBMEIsSUFBQyxDQUFBLEVBQTNCLEVBQStCLEtBQS9CO0FBRHRDLGlCQUVTLE9BRlQ7QUFBQSxpQkFFZ0IsT0FGaEI7dUJBRTZCLElBQUMsQ0FBQSxPQUFELENBQUE7QUFGN0I7SUFGSzs7OztHQTFLUTs7QUFnTHJCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgICAgXG4wMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgXG4wMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgICAgXG4wMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4jIyNcblxueyBkcmFnLCBwb3N0LCBzY2hlbWUsIHN0b3BFdmVudCwgcHJlZnMsIHNsYXNoLCBrbG9nLCBrc3RyLCBlbGVtLCB3aW4sIG9zLCAkIH0gPSByZXF1aXJlICdreGsnXG5cbmthY2hlbFNpemVzID0gWzcyLDEwOCwxNDQsMjE2XVxuXG5jbGFzcyBLYWNoZWwgZXh0ZW5kcyB3aW5cblxuICAgIEA6IChAa2FjaGVsSWQ6J2thY2hlbCcpIC0+XG4gICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICAgICAgcHJlZnNTZXBlcmF0b3I6ICfilrgnXG4gICAgICAgICAgICBkaXI6ICAgIF9fZGlybmFtZVxuICAgICAgICAgICAgcGtnOiAgICByZXF1aXJlICcuLi9wYWNrYWdlLmpzb24nXG4gICAgICAgICAgICBtZW51OiAgICcuLi9jb2ZmZWUvbWVudS5ub29uJ1xuICAgICAgICAgICAgb25Mb2FkOiBAb25XaW5Mb2FkXG4gICAgXG4gICAgICAgIEBtYWluID0kICcjbWFpbidcbiAgICAgICAgQGRyYWcgID0gbmV3IGRyYWdcbiAgICAgICAgICAgIHRhcmdldDogICBkb2N1bWVudC5ib2R5XG4gICAgICAgICAgICBvblN0YXJ0OiAgQG9uRHJhZ1N0YXJ0XG4gICAgICAgICAgICBvbk1vdmU6ICAgQG9uRHJhZ01vdmVcbiAgICAgICAgICAgIG9uU3RvcDogICBAb25EcmFnU3RvcFxuICAgICAgICBcbiAgICAgICAgQHdpbi5vbiAnbW92ZScgIEBvbldpbk1vdmVcbiAgICAgICAgQHdpbi5vbiAnYmx1cicgIEBvbldpbkJsdXJcbiAgICAgICAgQHdpbi5vbiAnZm9jdXMnIEBvbldpbkZvY3VzXG4gICAgICAgIEB3aW4ub24gJ21vdmUnICBAb25XaW5Nb3ZlXG4gICAgICAgIEB3aW4ub24gJ2Nsb3NlJyBAb25XaW5DbG9zZVxuICAgICAgICBcbiAgICAgICAgcG9zdC5vbiAnaW5pdEthY2hlbCcgQG9uSW5pdEthY2hlbFxuICAgICAgICBwb3N0Lm9uICdzYXZlQm91bmRzJyBAb25TYXZlQm91bmRzXG4gICAgICAgIHBvc3Qub24gJ2NvbWJvJyAgICAgIEBvbkNvbWJvXG4gICAgICAgIHBvc3Qub24gJ2hvdmVyJyAgICAgIEBvbkhvdmVyXG4gICAgICAgIHBvc3Qub24gJ2xlYXZlJyAgICAgIEBvbkxlYXZlXG4gICAgICAgIHBvc3Qub24gJ3RvZ2dsZVNjaGVtZScgLT4gc2NoZW1lLnRvZ2dsZSgpXG4gICAgICAgIFxuICAgICAgICBpZiBAa2FjaGVsSWQgIT0gJ21haW4nXG4gICAgICAgICAgICBAd2luLnNldFNraXBUYXNrYmFyIHRydWVcbiAgICAgICAgICAgICMgcHJlZnMuc2V0IFwia2FjaGVsbuKWuCN7QGthY2hlbElkfVwiIEBrYWNoZWxEYXRhKClcbiAgICAgICAgXG4gICAgICAgIHBvc3QudG9NYWluICdrYWNoZWxCb3VuZHMnIEBpZCwgQGthY2hlbElkXG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICdkYXJ3aW4nXG4gICAgICAgICAgICBpZiBwYXJzZUludChvcy5yZWxlYXNlKCkuc3BsaXQoJy4nKVswXSkgPj0gMThcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQgJ21vamF2ZSdcbiAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAwMCAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAgIDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwIDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAgIDAwMCAgICAgMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAgMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAgICAgICAwMDAgICBcbiAgICBcbiAgICByZXF1ZXN0RGF0YTogKG5hbWUpIC0+XG4gICAgICAgIFxuICAgICAgICBwb3N0LnRvTWFpbiAncmVxdWVzdERhdGEnIG5hbWUsIEBpZFxuICAgICAgICBwb3N0Lm9uICdkYXRhJyBAb25EYXRhXG4gICAgICAgICAgICAgICAgXG4gICAga2FjaGVsU2l6ZTogLT5cbiAgICAgICAgXG4gICAgICAgIHNpemUgPSAwICAgICAgICBcbiAgICAgICAgd2hpbGUga2FjaGVsU2l6ZXNbc2l6ZV0gPCBAd2luLmdldEJvdW5kcygpLndpZHRoXG4gICAgICAgICAgICBzaXplKytcbiAgICAgICAgc2l6ZVxuICAgIFxuICAgIG9uQ29udGV4dE1lbnU6IChldmVudCkgPT4gc3RvcEV2ZW50IGV2ZW50IFxuICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgb25EcmFnU3RhcnQ6IChkcmFnLCBldmVudCkgPT4gXG4gICAgXG4gICAgICAgIGlmIEB3aW4/LmlzRGVzdHJveWVkKClcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgXG4gICAgICAgIEBzdGFydEJvdW5kcyA9IEB3aW4uZ2V0Qm91bmRzKClcbiAgICAgICAgcG9zdC50b01haW4gJ2RyYWdTdGFydCcgQGlkXG4gICAgICAgIFxuICAgIG9uRHJhZ01vdmU6IChkcmFnLCBldmVudCkgPT4gXG4gICAgICAgIFxuICAgICAgICBAd2luLnNldFBvc2l0aW9uIEBzdGFydEJvdW5kcy54ICsgZHJhZy5kZWx0YVN1bS54LCBAc3RhcnRCb3VuZHMueSArIGRyYWcuZGVsdGFTdW0ueVxuICAgICAgICBAd2luLnNldFNpemUgICAgIEBzdGFydEJvdW5kcy53aWR0aCwgQHN0YXJ0Qm91bmRzLmhlaWdodFxuICAgICAgICBcbiAgICBvbkRyYWdTdG9wOiAoZHJhZywgZXZlbnQpID0+XG4gICAgICAgIGlmIGRyYWcuZGVsdGFTdW0ueCA8IDEwIGFuZCBkcmFnLmRlbHRhU3VtLnkgPCAxMFxuICAgICAgICAgICAgQHdpbi5zZXRCb3VuZHMgQHN0YXJ0Qm91bmRzXG4gICAgICAgICAgICBpZiBldmVudC5idXR0b24gPT0gMFxuICAgICAgICAgICAgICAgIEBvbkNsaWNrIGV2ZW50XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHBvc3QudG9NYWluICdzbmFwS2FjaGVsJyBAaWRcbiAgICAgICAgcG9zdC50b01haW4gJ2RyYWdTdG9wJyBAaWRcbiAgICBcbiAgICBvblNhdmVCb3VuZHM6ID0+XG4gICAgICAgIFxuICAgICAgICBmb3IgaSBpbiBbMS4uNF1cbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSBcImthY2hlbFNpemUje2l9XCJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkICAgIFwia2FjaGVsU2l6ZSN7QGthY2hlbFNpemUoKSsxfVwiXG4gICAgICAgIFxuICAgICAgICBwcmVmcy5zZXQgXCJib3VuZHPilrgje0BrYWNoZWxJZH1cIiBAd2luLmdldEJvdW5kcygpXG4gICAgICAgIEBvbkJvdW5kcygpXG4gICAgICAgIFxuICAgIG9uSG92ZXI6IChldmVudCkgPT4gZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkICdrYWNoZWxGb2N1cydcbiAgICBvbkxlYXZlOiAoZXZlbnQpID0+IGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSAna2FjaGVsRm9jdXMnXG4gICAgICAgIFxuICAgIG9uV2luRm9jdXM6ICAoZXZlbnQpID0+IGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCAgICAna2FjaGVsRm9jdXMnOyBwb3N0LnRvTWFpbiAna2FjaGVsRm9jdXMnIEBpZDsgQG9uRm9jdXMgZXZlbnRcbiAgICBvbldpbkJsdXI6ICAgKGV2ZW50KSA9PiBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUgJ2thY2hlbEZvY3VzJzsgQG9uQmx1ciAgZXZlbnRcbiAgICBvbldpbkxvYWQ6ICAgKGV2ZW50KSA9PiBAb25Mb2FkIGV2ZW50XG4gICAgb25XaW5Nb3ZlOiAgIChldmVudCkgPT4gQG9uTW92ZSBldmVudFxuICAgICAgICAgICAgICAgIFxuICAgIG9uV2luQ2xvc2U6ICAoZXZlbnQpID0+IFxuICAgICAgICBpZiBAa2FjaGVsSWQgIT0gJ21haW4nXG4gICAgICAgICAgICBwcmVmcy5zZXQgJ2thY2hlbG4nIHByZWZzLmdldCgna2FjaGVsbicpLmZpbHRlciAoaykgPT4gayAhPSBAa2FjaGVsSWRcbiAgICAgICAgICAgIFxuICAgICAgICBAb25DbG9zZSBldmVudFxuICAgICAgICBcbiAgICBvbkluaXRLYWNoZWw6ID0+XG4gICAgICAgICAgIFxuICAgICAgICBpZiBAa2FjaGVsSWQgIT0gJ21haW4nXG4gICAgICAgICAgICBrYWNoZWxuID0gcHJlZnMuZ2V0ICdrYWNoZWxuJyBbXVxuICAgICAgICAgICAgaWYgQGthY2hlbElkIG5vdCBpbiBrYWNoZWxuXG4gICAgICAgICAgICAgICAga2FjaGVsbi5wdXNoIEBrYWNoZWxJZCBcbiAgICAgICAgICAgICAgICBwcmVmcy5zZXQgJ2thY2hlbG4nIGthY2hlbG5cbiAgICAgICAgXG4gICAgICAgIEB3aW4uc2V0VGl0bGUgXCJrYWNoZWwgI3tAa2FjaGVsSWR9XCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcG9zdC50b01haW4gJ2thY2hlbEJvdW5kcycgQGlkLCBAa2FjaGVsSWRcbiAgICBcbiAgICBvbkxvYWQ6ICAgLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvbk1vdmU6ICAgLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvbkNsaWNrOiAgLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvbkZvY3VzOiAgLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvbkJsdXI6ICAgLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvbk1vdmU6ICAgLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvbkNsb3NlOiAgLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvbkJvdW5kczogLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCBcbiAgICBcbiAgICBvbk1lbnVBY3Rpb246IChhY3Rpb24pID0+XG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggYWN0aW9uXG4gICAgICAgICAgICB3aGVuICdOZXcnICAgICAgICAgIHRoZW4gcG9zdC50b01haW4gJ25ld0thY2hlbCcgJ2RlZmF1bHQnXG4gICAgICAgICAgICB3aGVuICdDbG9zZScgICAgICAgIHRoZW4gQHdpbi5jbG9zZSgpXG4gICAgICAgICAgICB3aGVuICdRdWl0JyAgICAgICAgIHRoZW4gcG9zdC50b01haW4gJ3F1aXQnXG4gICAgICAgICAgICB3aGVuICdIaWRlJyAgICAgICAgIHRoZW4gcG9zdC50b01haW4gJ2hpZGUnXG4gICAgICAgICAgICB3aGVuICdBYm91dCcgICAgICAgIHRoZW4gcG9zdC50b01haW4gJ3Nob3dBYm91dCdcbiAgICAgICAgICAgIHdoZW4gJ1NjaGVtZScgICAgICAgdGhlbiBwb3N0LnRvV2lucyAndG9nZ2xlU2NoZW1lJ1xuICAgICAgICAgICAgd2hlbiAnSW5jcmVhc2VTaXplJyB0aGVuIHBvc3QudG9NYWluICdrYWNoZWxTaXplJyAnaW5jcmVhc2UnXG4gICAgICAgICAgICB3aGVuICdEZWNyZWFzZVNpemUnIHRoZW4gcG9zdC50b01haW4gJ2thY2hlbFNpemUnICdkZWNyZWFzZSdcbiAgICAgICAgICAgIHdoZW4gJ1Jlc2V0U2l6ZScgICAgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsU2l6ZScgJ3Jlc2V0J1xuICAgICAgICAgICAgd2hlbiAnSW5jcmVhc2UnICAgICB0aGVuIHBvc3QudG9NYWluICdrYWNoZWxTaXplJyAnaW5jcmVhc2UnIEBpZFxuICAgICAgICAgICAgd2hlbiAnRGVjcmVhc2UnICAgICB0aGVuIHBvc3QudG9NYWluICdrYWNoZWxTaXplJyAnZGVjcmVhc2UnIEBpZFxuICAgICAgICAgICAgd2hlbiAnUmVzZXQnICAgICAgICB0aGVuIHBvc3QudG9NYWluICdrYWNoZWxTaXplJyAncmVzZXQnICAgIEBpZFxuICAgICAgICAgICAgd2hlbiAnTW92ZVVwJyAgICAgICB0aGVuIHBvc3QudG9NYWluICdrYWNoZWxNb3ZlJyAndXAnICAgICAgIEBpZFxuICAgICAgICAgICAgd2hlbiAnTW92ZURvd24nICAgICB0aGVuIHBvc3QudG9NYWluICdrYWNoZWxNb3ZlJyAnZG93bicgICAgIEBpZFxuICAgICAgICAgICAgd2hlbiAnTW92ZUxlZnQnICAgICB0aGVuIHBvc3QudG9NYWluICdrYWNoZWxNb3ZlJyAnbGVmdCcgICAgIEBpZFxuICAgICAgICAgICAgd2hlbiAnTW92ZVJpZ2h0JyAgICB0aGVuIHBvc3QudG9NYWluICdrYWNoZWxNb3ZlJyAncmlnaHQnICAgIEBpZFxuICAgICAgICAgICAgd2hlbiAnRGV2VG9vbHMnICAgICB0aGVuIEB3aW4ud2ViQ29udGVudHMudG9nZ2xlRGV2VG9vbHMoKVxuICAgICAgICAgICAgd2hlbiAnUmVsb2FkJyAgICAgICB0aGVuIEB3aW4ud2ViQ29udGVudHMucmVsb2FkSWdub3JpbmdDYWNoZSgpXG4gICAgICAgICAgICB3aGVuICdTY3JlZW5zaG90JyAgIHRoZW4gQHNjcmVlbnNob3QoKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGtsb2cgJ2FjdGlvbicgYWN0aW9uXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgb25Db21ibzogKGNvbWJvLCBpbmZvKSA9PlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBzd2l0Y2ggY29tYm9cbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnJ3JpZ2h0Jyd1cCcnZG93bicgdGhlbiBwb3N0LnRvTWFpbiAnZm9jdXNLYWNoZWwnIEBpZCwgY29tYm9cbiAgICAgICAgICAgIHdoZW4gJ2VudGVyJydzcGFjZScgdGhlbiBAb25DbGljaygpXG4gICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gS2FjaGVsXG4iXX0=
//# sourceURL=../coffee/kachel.coffee
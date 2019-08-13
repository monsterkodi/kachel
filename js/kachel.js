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
        for (i = j = 1; j <= 4; i = ++j) {
            document.body.classList.remove("kachelSize" + i);
        }
        document.body.classList.add("kachelSize" + (this.kachelSize() + 1));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2FjaGVsLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSw4RkFBQTtJQUFBOzs7OztBQVFBLE1BQWdGLE9BQUEsQ0FBUSxLQUFSLENBQWhGLEVBQUUsZUFBRixFQUFRLGVBQVIsRUFBYyxtQkFBZCxFQUFzQix5QkFBdEIsRUFBaUMsaUJBQWpDLEVBQXdDLGlCQUF4QyxFQUErQyxlQUEvQyxFQUFxRCxlQUFyRCxFQUEyRCxlQUEzRCxFQUFpRSxhQUFqRSxFQUFzRSxXQUF0RSxFQUEwRTs7QUFFMUUsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztBQUVIOzs7SUFFQyxnQkFBQyxHQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxrREFBUzs7Ozs7Ozs7Ozs7Ozs7OztRQUVWLHdDQUNJO1lBQUEsY0FBQSxFQUFnQixHQUFoQjtZQUNBLEdBQUEsRUFBUSxTQURSO1lBRUEsR0FBQSxFQUFRLE9BQUEsQ0FBUSxpQkFBUixDQUZSO1lBR0EsSUFBQSxFQUFRLHFCQUhSO1lBSUEsTUFBQSxFQUFRLElBQUMsQ0FBQSxTQUpUO1NBREo7UUFPQSxJQUFDLENBQUEsSUFBRCxHQUFPLENBQUEsQ0FBRSxPQUFGO1FBQ1AsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFJLElBQUosQ0FDSjtZQUFBLE1BQUEsRUFBVSxRQUFRLENBQUMsSUFBbkI7WUFDQSxPQUFBLEVBQVUsSUFBQyxDQUFBLFdBRFg7WUFFQSxNQUFBLEVBQVUsSUFBQyxDQUFBLFVBRlg7WUFHQSxNQUFBLEVBQVUsSUFBQyxDQUFBLFVBSFg7U0FESTtRQU1SLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLE1BQVIsRUFBZ0IsSUFBQyxDQUFBLFNBQWpCO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFMLENBQVEsTUFBUixFQUFnQixJQUFDLENBQUEsU0FBakI7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUws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RCxDQUFBO0FBRjdCO0lBRks7Ozs7R0F4S1E7O0FBOEtyQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAgICAgIFxuMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIFxuMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgIFxuMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuIyMjXG5cbnsgZHJhZywgcG9zdCwgc2NoZW1lLCBzdG9wRXZlbnQsIHByZWZzLCBzbGFzaCwga2xvZywga3N0ciwgZWxlbSwgd2luLCBvcywgJCB9ID0gcmVxdWlyZSAna3hrJ1xuXG5Cb3VuZHMgPSByZXF1aXJlICcuL2JvdW5kcydcblxuY2xhc3MgS2FjaGVsIGV4dGVuZHMgd2luXG5cbiAgICBAOiAoQGthY2hlbElkOidrYWNoZWwnKSAtPlxuICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgICAgIHByZWZzU2VwZXJhdG9yOiAn4pa4J1xuICAgICAgICAgICAgZGlyOiAgICBfX2Rpcm5hbWVcbiAgICAgICAgICAgIHBrZzogICAgcmVxdWlyZSAnLi4vcGFja2FnZS5qc29uJ1xuICAgICAgICAgICAgbWVudTogICAnLi4vY29mZmVlL21lbnUubm9vbidcbiAgICAgICAgICAgIG9uTG9hZDogQG9uV2luTG9hZFxuICAgIFxuICAgICAgICBAbWFpbiA9JCAnI21haW4nXG4gICAgICAgIEBkcmFnID0gbmV3IGRyYWdcbiAgICAgICAgICAgIHRhcmdldDogICBkb2N1bWVudC5ib2R5XG4gICAgICAgICAgICBvblN0YXJ0OiAgQG9uRHJhZ1N0YXJ0XG4gICAgICAgICAgICBvbk1vdmU6ICAgQG9uRHJhZ01vdmVcbiAgICAgICAgICAgIG9uU3RvcDogICBAb25EcmFnU3RvcFxuICAgICAgICBcbiAgICAgICAgQHdpbi5vbiAnbW92ZScgIEBvbldpbk1vdmVcbiAgICAgICAgQHdpbi5vbiAnYmx1cicgIEBvbldpbkJsdXJcbiAgICAgICAgQHdpbi5vbiAnZm9jdXMnIEBvbldpbkZvY3VzXG4gICAgICAgIEB3aW4ub24gJ21vdmUnICBAb25XaW5Nb3ZlXG4gICAgICAgIEB3aW4ub24gJ2Nsb3NlJyBAb25XaW5DbG9zZVxuICAgICAgICBcbiAgICAgICAgcG9zdC5vbiAnaW5pdEthY2hlbCcgQG9uSW5pdEthY2hlbFxuICAgICAgICBwb3N0Lm9uICdzYXZlQm91bmRzJyBAb25TYXZlQm91bmRzXG4gICAgICAgIHBvc3Qub24gJ2NvbWJvJyAgICAgIEBvbkNvbWJvXG4gICAgICAgIHBvc3Qub24gJ2hvdmVyJyAgICAgIEBvbkhvdmVyXG4gICAgICAgIHBvc3Qub24gJ2xlYXZlJyAgICAgIEBvbkxlYXZlXG4gICAgICAgIHBvc3Qub24gJ3RvZ2dsZVNjaGVtZScgLT4gc2NoZW1lLnRvZ2dsZSgpXG4gICAgICAgIFxuICAgICAgICBpZiBAa2FjaGVsSWQgIT0gJ21haW4nXG4gICAgICAgICAgICBAd2luLnNldFNraXBUYXNrYmFyIHRydWVcbiAgICAgICAgXG4gICAgICAgIHBvc3QudG9NYWluICdrYWNoZWxCb3VuZHMnIEBpZCwgQGthY2hlbElkXG4gICAgICAgIFxuICAgICAgICAjIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ2RhcndpbidcbiAgICAgICAgICAgICMgaWYgcGFyc2VJbnQob3MucmVsZWFzZSgpLnNwbGl0KCcuJylbMF0pID49IDE4XG4gICAgICAgICAgICAgICAgIyBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQgJ21vamF2ZSdcbiAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAwMCAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAgIDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwIDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAgIDAwMCAgICAgMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAgMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAgICAgICAwMDAgICBcbiAgICBcbiAgICByZXF1ZXN0RGF0YTogKG5hbWUpIC0+XG4gICAgICAgIFxuICAgICAgICBwb3N0LnRvTWFpbiAncmVxdWVzdERhdGEnIG5hbWUsIEBpZFxuICAgICAgICBwb3N0Lm9uICdkYXRhJyBAb25EYXRhXG4gICAgICAgICAgICAgICAgXG4gICAga2FjaGVsU2l6ZTogLT4gQm91bmRzLmthY2hlbFNpemUgQHdpblxuICAgICAgICAgICAgXG4gICAgb25Db250ZXh0TWVudTogKGV2ZW50KSA9PiBzdG9wRXZlbnQgZXZlbnQgXG4gICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBvbkRyYWdTdGFydDogKGRyYWcsIGV2ZW50KSA9PlxuICAgIFxuICAgICAgICBpZiBAd2luPy5pc0Rlc3Ryb3llZCgpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICBAc3RhcnRCb3VuZHMgPSBAd2luLmdldEJvdW5kcygpXG4gICAgICAgIHBvc3QudG9NYWluICdkcmFnU3RhcnQnIEBpZFxuICAgICAgICBcbiAgICBvbkRyYWdNb3ZlOiAoZHJhZywgZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICBAd2luLnNldFBvc2l0aW9uIEBzdGFydEJvdW5kcy54ICsgZHJhZy5kZWx0YVN1bS54LCBAc3RhcnRCb3VuZHMueSArIGRyYWcuZGVsdGFTdW0ueVxuICAgICAgICBAd2luLnNldFNpemUgICAgIEBzdGFydEJvdW5kcy53aWR0aCwgQHN0YXJ0Qm91bmRzLmhlaWdodFxuICAgICAgICBcbiAgICBvbkRyYWdTdG9wOiAoZHJhZywgZXZlbnQpID0+XG5cbiAgICAgICAgaWYgTWF0aC5hYnMoZHJhZy5kZWx0YVN1bS54KSA8IDEwIGFuZCBNYXRoLmFicyhkcmFnLmRlbHRhU3VtLnkpIDwgMTBcbiAgICAgICAgICAgIEB3aW4uc2V0Qm91bmRzIEBzdGFydEJvdW5kc1xuICAgICAgICAgICAgaWYgZXZlbnQuYnV0dG9uID09IDBcbiAgICAgICAgICAgICAgICBAb25DbGljayBldmVudFxuICAgICAgICAgICAgZWxzZSBpZiBldmVudC5idXR0b24gPT0gMVxuICAgICAgICAgICAgICAgIEBvbk1pZGRsZUNsaWNrIGV2ZW50XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHBvc3QudG9NYWluICdzbmFwS2FjaGVsJyBAaWRcbiAgICAgICAgcG9zdC50b01haW4gJ2RyYWdTdG9wJyBAaWRcbiAgICBcbiAgICBvblNhdmVCb3VuZHM6ID0+XG4gICAgICAgIFxuICAgICAgICBmb3IgaSBpbiBbMS4uNF1cbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSBcImthY2hlbFNpemUje2l9XCJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkIFwia2FjaGVsU2l6ZSN7QGthY2hlbFNpemUoKSsxfVwiXG4gICAgICAgIFxuICAgICAgICBwcmVmcy5zZXQgXCJib3VuZHPilrgje0BrYWNoZWxJZH1cIiBAd2luLmdldEJvdW5kcygpXG4gICAgICAgIEBvbkJvdW5kcygpXG4gICAgICAgIFxuICAgIG9uSG92ZXI6IChldmVudCkgPT4gZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkICdrYWNoZWxIb3ZlcidcbiAgICBvbkxlYXZlOiAoZXZlbnQpID0+IGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSAna2FjaGVsSG92ZXInXG4gICAgICAgIFxuICAgIG9uV2luRm9jdXM6IChldmVudCkgPT4gZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkICAgICdrYWNoZWxGb2N1cyc7IHBvc3QudG9NYWluICdrYWNoZWxGb2N1cycgQGlkOyBAb25Gb2N1cyBldmVudFxuICAgIG9uV2luQmx1cjogIChldmVudCkgPT4gZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlICdrYWNoZWxGb2N1cyc7IEBvbkJsdXIgIGV2ZW50XG4gICAgb25XaW5Mb2FkOiAgKGV2ZW50KSA9PiBAb25Mb2FkIGV2ZW50XG4gICAgb25XaW5Nb3ZlOiAgKGV2ZW50KSA9PiBAb25Nb3ZlIGV2ZW50XG4gICAgICAgICAgICAgICAgXG4gICAgb25XaW5DbG9zZTogKGV2ZW50KSA9PiBcbiAgICAgICAgaWYgQGthY2hlbElkICE9ICdtYWluJ1xuICAgICAgICAgICAgcHJlZnMuc2V0ICdrYWNoZWxuJyBwcmVmcy5nZXQoJ2thY2hlbG4nKS5maWx0ZXIgKGspID0+IGsgIT0gQGthY2hlbElkXG4gICAgICAgICAgICBcbiAgICAgICAgQG9uQ2xvc2UgZXZlbnRcbiAgICAgICAgXG4gICAgb25Jbml0S2FjaGVsOiA9PlxuICAgICAgICAgICBcbiAgICAgICAgaWYgQGthY2hlbElkICE9ICdtYWluJ1xuICAgICAgICAgICAga2FjaGVsbiA9IHByZWZzLmdldCAna2FjaGVsbicgW11cbiAgICAgICAgICAgIGlmIEBrYWNoZWxJZCBub3QgaW4ga2FjaGVsblxuICAgICAgICAgICAgICAgIGthY2hlbG4ucHVzaCBAa2FjaGVsSWQgXG4gICAgICAgICAgICAgICAgcHJlZnMuc2V0ICdrYWNoZWxuJyBrYWNoZWxuXG4gICAgICAgIFxuICAgICAgICBAd2luLnNldFRpdGxlIFwia2FjaGVsICN7QGthY2hlbElkfVwiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHBvc3QudG9NYWluICdrYWNoZWxCb3VuZHMnIEBpZCwgQGthY2hlbElkXG4gICAgXG4gICAgb25Mb2FkOiAgIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25Nb3ZlOiAgIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25DbGljazogIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25NaWRkbGVDbGljazogIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25Gb2N1czogIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25CbHVyOiAgIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25Nb3ZlOiAgIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25DbG9zZTogIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25Cb3VuZHM6IC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgXG4gICAgXG4gICAgb25NZW51QWN0aW9uOiAoYWN0aW9uKSA9PlxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIGFjdGlvblxuICAgICAgICAgICAgd2hlbiAnTmV3JyAgICAgICAgICB0aGVuIHBvc3QudG9NYWluICduZXdLYWNoZWwnICdkZWZhdWx0J1xuICAgICAgICAgICAgd2hlbiAnQ2xvc2UnICAgICAgICB0aGVuIEB3aW4uY2xvc2UoKVxuICAgICAgICAgICAgd2hlbiAnUXVpdCcgICAgICAgICB0aGVuIHBvc3QudG9NYWluICdxdWl0J1xuICAgICAgICAgICAgd2hlbiAnSGlkZScgICAgICAgICB0aGVuIHBvc3QudG9NYWluICdoaWRlJ1xuICAgICAgICAgICAgd2hlbiAnQWJvdXQnICAgICAgICB0aGVuIHBvc3QudG9NYWluICdzaG93QWJvdXQnXG4gICAgICAgICAgICB3aGVuICdTY2hlbWUnICAgICAgIHRoZW4gcG9zdC50b1dpbnMgJ3RvZ2dsZVNjaGVtZSdcbiAgICAgICAgICAgIHdoZW4gJ0luY3JlYXNlU2l6ZScgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsU2l6ZScgJ2luY3JlYXNlJ1xuICAgICAgICAgICAgd2hlbiAnRGVjcmVhc2VTaXplJyB0aGVuIHBvc3QudG9NYWluICdrYWNoZWxTaXplJyAnZGVjcmVhc2UnXG4gICAgICAgICAgICB3aGVuICdSZXNldFNpemUnICAgIHRoZW4gcG9zdC50b01haW4gJ2thY2hlbFNpemUnICdyZXNldCdcbiAgICAgICAgICAgIHdoZW4gJ0luY3JlYXNlJyAgICAgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsU2l6ZScgJ2luY3JlYXNlJyBAaWRcbiAgICAgICAgICAgIHdoZW4gJ0RlY3JlYXNlJyAgICAgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsU2l6ZScgJ2RlY3JlYXNlJyBAaWRcbiAgICAgICAgICAgIHdoZW4gJ1Jlc2V0JyAgICAgICAgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsU2l6ZScgJ3Jlc2V0JyAgICBAaWRcbiAgICAgICAgICAgIHdoZW4gJ01vdmVVcCcgICAgICAgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsTW92ZScgJ3VwJyAgICAgICBAaWRcbiAgICAgICAgICAgIHdoZW4gJ01vdmVEb3duJyAgICAgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsTW92ZScgJ2Rvd24nICAgICBAaWRcbiAgICAgICAgICAgIHdoZW4gJ01vdmVMZWZ0JyAgICAgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsTW92ZScgJ2xlZnQnICAgICBAaWRcbiAgICAgICAgICAgIHdoZW4gJ01vdmVSaWdodCcgICAgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsTW92ZScgJ3JpZ2h0JyAgICBAaWRcbiAgICAgICAgICAgIHdoZW4gJ0RldlRvb2xzJyAgICAgdGhlbiBAd2luLndlYkNvbnRlbnRzLnRvZ2dsZURldlRvb2xzKClcbiAgICAgICAgICAgIHdoZW4gJ1JlbG9hZCcgICAgICAgdGhlbiBAd2luLndlYkNvbnRlbnRzLnJlbG9hZElnbm9yaW5nQ2FjaGUoKVxuICAgICAgICAgICAgd2hlbiAnU2NyZWVuc2hvdCcgICB0aGVuIEBzY3JlZW5zaG90KClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBrbG9nICdhY3Rpb24nIGFjdGlvblxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIG9uQ29tYm86IChjb21ibywgaW5mbykgPT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgc3dpdGNoIGNvbWJvXG4gICAgICAgICAgICB3aGVuICdsZWZ0JydyaWdodCcndXAnJ2Rvd24nIHRoZW4gcG9zdC50b01haW4gJ2ZvY3VzTmVpZ2hib3InIEBpZCwgY29tYm9cbiAgICAgICAgICAgIHdoZW4gJ2VudGVyJydzcGFjZScgdGhlbiBAb25DbGljaygpXG4gICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gS2FjaGVsXG4iXX0=
//# sourceURL=../coffee/kachel.coffee
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
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), drag = ref.drag, post = ref.post, scheme = ref.scheme, stopEvent = ref.stopEvent, prefs = ref.prefs, slash = ref.slash, klog = ref.klog, kstr = ref.kstr, elem = ref.elem, win = ref.win, os = ref.os, $ = ref.$;

kachelSizes = [72, 108, 144, 216];

Kachel = (function(superClass) {
    extend(Kachel, superClass);

    function Kachel(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'kachel';
        this.onCombo = bind(this.onCombo, this);
        this.onMenuAction = bind(this.onMenuAction, this);
        this.onInitData = bind(this.onInitData, this);
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
        post.on('initData', this.onInitData);
        post.on('saveBounds', this.onSaveBounds);
        post.on('combo', this.onCombo);
        post.on('hover', this.onHover);
        post.on('leave', this.onLeave);
        post.on('toggleScheme', function() {
            return scheme.toggle();
        });
        if (this.kachelId !== 'main') {
            this.win.setSkipTaskbar(true);
            prefs.set("kacheln▸" + this.kachelId, this.kachelData());
        }
        post.toMain('kachelBounds', this.id, this.kachelId);
    }

    Kachel.prototype.kachelData = function() {
        return {
            html: this.kachelId
        };
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
        this.startBounds = this.win.getBounds();
        return post.toMain('dragStart', this.id);
    };

    Kachel.prototype.onDragMove = function(drag, event) {
        this.win.setPosition(this.startBounds.x + drag.deltaSum.x, this.startBounds.y + drag.deltaSum.y);
        return this.win.setSize(this.startBounds.width, this.startBounds.height);
    };

    Kachel.prototype.onDragStop = function(drag, event) {
        post.toMain('dragStop', this.id);
        if ((drag.deltaSum == null) || (drag.deltaSum.x === 0 && 0 === drag.deltaSum.y)) {
            if (event.button === 0) {
                return this.onClick(event);
            }
        } else {
            return post.toMain('snapKachel', this.id);
        }
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
            prefs.del("kacheln▸" + this.kachelId);
        }
        return this.onClose(event);
    };

    Kachel.prototype.onInitData = function() {
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
                return post.toMain('newKachel', {});
            case 'Close':
                return this.win.close();
            case 'Quit':
                return post.toMain('quit');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2FjaGVsLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxtR0FBQTtJQUFBOzs7O0FBUUEsTUFBZ0YsT0FBQSxDQUFRLEtBQVIsQ0FBaEYsRUFBRSxlQUFGLEVBQVEsZUFBUixFQUFjLG1CQUFkLEVBQXNCLHlCQUF0QixFQUFpQyxpQkFBakMsRUFBd0MsaUJBQXhDLEVBQStDLGVBQS9DLEVBQXFELGVBQXJELEVBQTJELGVBQTNELEVBQWlFLGFBQWpFLEVBQXNFLFdBQXRFLEVBQTBFOztBQUUxRSxXQUFBLEdBQWMsQ0FBQyxFQUFELEVBQUksR0FBSixFQUFRLEdBQVIsRUFBWSxHQUFaOztBQUVSOzs7SUFFQyxnQkFBQyxHQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxrREFBUzs7Ozs7Ozs7Ozs7Ozs7OztRQUVWLHdDQUNJO1lBQUEsY0FBQSxFQUFnQixHQUFoQjtZQUNBLEdBQUEsRUFBUSxTQURSO1lBRUEsR0FBQSxFQUFRLE9BQUEsQ0FBUSxpQkFBUixDQUZSO1lBR0EsSUFBQSxFQUFRLHFCQUhSO1lBSUEsTUFBQSxFQUFRLElBQUMsQ0FBQSxTQUpUO1NBREo7UUFPQSxJQUFDLENBQUEsSUFBRCxHQUFPLENBQUEsQ0FBRSxPQUFGO1FBQ1AsSUFBQyxDQUFBLElBQUQsR0FBUyxJQUFJLElBQUosQ0FDTDtZQUFBLE1BQUEsRUFBVSxRQUFRLENBQUMsSUFBbkI7WUFDQSxPQUFBLEVBQVUsSUFBQyxDQUFBLFdBRFg7WUFFQSxNQUFBLEVBQVUsSUFBQyxDQUFBLFVBRlg7WUFHQSxNQUFBLEVBQVUsSUFBQyxDQUFBLFVBSFg7U0FESztRQU1ULElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLE1BQVIsRUFBZ0IsSUFBQyxDQUFBLFNBQWpCO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFMLENBQVEsTUFBUixFQUFnQixJQUFDLENBQUEsU0FBakI7UUFDQSxJ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Q0FBSyxRQUFMLEVBQWMsTUFBZDtBQXBCUjtJQURVOztxQkE2QmQsT0FBQSxHQUFTLFNBQUMsS0FBRCxFQUFRLElBQVI7QUFFTCxnQkFBTyxLQUFQO0FBQUEsaUJBQ1MsTUFEVDtBQUFBLGlCQUNlLE9BRGY7QUFBQSxpQkFDc0IsSUFEdEI7QUFBQSxpQkFDMEIsTUFEMUI7dUJBQ3NDLElBQUksQ0FBQyxNQUFMLENBQVksYUFBWixFQUEwQixJQUFDLENBQUEsRUFBM0IsRUFBK0IsS0FBL0I7QUFEdEMsaUJBRVMsT0FGVDtBQUFBLGlCQUVnQixPQUZoQjt1QkFFNkIsSUFBQyxDQUFBLE9BQUQsQ0FBQTtBQUY3QjtJQUZLOzs7O0dBOUlROztBQW9KckIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgICAgICBcbjAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICBcbjAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwICAgICAgICBcbjAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbiMjI1xuXG57IGRyYWcsIHBvc3QsIHNjaGVtZSwgc3RvcEV2ZW50LCBwcmVmcywgc2xhc2gsIGtsb2csIGtzdHIsIGVsZW0sIHdpbiwgb3MsICQgfSA9IHJlcXVpcmUgJ2t4aydcblxua2FjaGVsU2l6ZXMgPSBbNzIsMTA4LDE0NCwyMTZdXG5cbmNsYXNzIEthY2hlbCBleHRlbmRzIHdpblxuXG4gICAgQDogKEBrYWNoZWxJZDona2FjaGVsJykgLT5cbiAgICAgICAgXG4gICAgICAgIHN1cGVyXG4gICAgICAgICAgICBwcmVmc1NlcGVyYXRvcjogJ+KWuCdcbiAgICAgICAgICAgIGRpcjogICAgX19kaXJuYW1lXG4gICAgICAgICAgICBwa2c6ICAgIHJlcXVpcmUgJy4uL3BhY2thZ2UuanNvbidcbiAgICAgICAgICAgIG1lbnU6ICAgJy4uL2NvZmZlZS9tZW51Lm5vb24nXG4gICAgICAgICAgICBvbkxvYWQ6IEBvbldpbkxvYWRcbiAgICBcbiAgICAgICAgQG1haW4gPSQgJyNtYWluJ1xuICAgICAgICBAZHJhZyAgPSBuZXcgZHJhZ1xuICAgICAgICAgICAgdGFyZ2V0OiAgIGRvY3VtZW50LmJvZHlcbiAgICAgICAgICAgIG9uU3RhcnQ6ICBAb25EcmFnU3RhcnRcbiAgICAgICAgICAgIG9uTW92ZTogICBAb25EcmFnTW92ZVxuICAgICAgICAgICAgb25TdG9wOiAgIEBvbkRyYWdTdG9wXG4gICAgICAgIFxuICAgICAgICBAd2luLm9uICdtb3ZlJyAgQG9uV2luTW92ZVxuICAgICAgICBAd2luLm9uICdibHVyJyAgQG9uV2luQmx1clxuICAgICAgICBAd2luLm9uICdmb2N1cycgQG9uV2luRm9jdXNcbiAgICAgICAgQHdpbi5vbiAnbW92ZScgIEBvbldpbk1vdmVcbiAgICAgICAgQHdpbi5vbiAnY2xvc2UnIEBvbldpbkNsb3NlXG4gICAgICAgIFxuICAgICAgICBwb3N0Lm9uICdpbml0RGF0YScgICBAb25Jbml0RGF0YVxuICAgICAgICBwb3N0Lm9uICdzYXZlQm91bmRzJyBAb25TYXZlQm91bmRzXG4gICAgICAgIHBvc3Qub24gJ2NvbWJvJyAgICAgIEBvbkNvbWJvXG4gICAgICAgIHBvc3Qub24gJ2hvdmVyJyAgICAgIEBvbkhvdmVyXG4gICAgICAgIHBvc3Qub24gJ2xlYXZlJyAgICAgIEBvbkxlYXZlXG4gICAgICAgIHBvc3Qub24gJ3RvZ2dsZVNjaGVtZScgLT4gc2NoZW1lLnRvZ2dsZSgpXG4gICAgICAgIFxuICAgICAgICBpZiBAa2FjaGVsSWQgIT0gJ21haW4nXG4gICAgICAgICAgICBAd2luLnNldFNraXBUYXNrYmFyIHRydWVcbiAgICAgICAgICAgIHByZWZzLnNldCBcImthY2hlbG7ilrgje0BrYWNoZWxJZH1cIiBAa2FjaGVsRGF0YSgpXG4gICAgICAgIFxuICAgICAgICBwb3N0LnRvTWFpbiAna2FjaGVsQm91bmRzJyBAaWQsIEBrYWNoZWxJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICBrYWNoZWxEYXRhOiAtPiBodG1sOkBrYWNoZWxJZFxuICAgICAgXG4gICAga2FjaGVsU2l6ZTogLT5cbiAgICAgICAgc2l6ZSA9IDAgICAgICAgIFxuICAgICAgICB3aGlsZSBrYWNoZWxTaXplc1tzaXplXSA8IEB3aW4uZ2V0Qm91bmRzKCkud2lkdGhcbiAgICAgICAgICAgIHNpemUrK1xuICAgICAgICBzaXplXG4gICAgXG4gICAgb25Db250ZXh0TWVudTogKGV2ZW50KSA9PiBzdG9wRXZlbnQgZXZlbnQgXG4gICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBvbkRyYWdTdGFydDogKGRyYWcsIGV2ZW50KSA9PiBcbiAgICBcbiAgICAgICAgQHN0YXJ0Qm91bmRzID0gQHdpbi5nZXRCb3VuZHMoKVxuICAgICAgICBwb3N0LnRvTWFpbiAnZHJhZ1N0YXJ0JyBAaWRcbiAgICAgICAgXG4gICAgb25EcmFnTW92ZTogKGRyYWcsIGV2ZW50KSA9PiBcbiAgICAgICAgXG4gICAgICAgIEB3aW4uc2V0UG9zaXRpb24gQHN0YXJ0Qm91bmRzLnggKyBkcmFnLmRlbHRhU3VtLngsIEBzdGFydEJvdW5kcy55ICsgZHJhZy5kZWx0YVN1bS55XG4gICAgICAgIEB3aW4uc2V0U2l6ZSAgICAgQHN0YXJ0Qm91bmRzLndpZHRoLCBAc3RhcnRCb3VuZHMuaGVpZ2h0XG4gICAgICAgIFxuICAgIG9uRHJhZ1N0b3A6IChkcmFnLCBldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIHBvc3QudG9NYWluICdkcmFnU3RvcCcgQGlkXG4gICAgICAgIGlmIG5vdCBkcmFnLmRlbHRhU3VtPyBvciBkcmFnLmRlbHRhU3VtLnggPT0gMCA9PSBkcmFnLmRlbHRhU3VtLnlcbiAgICAgICAgICAgIGlmIGV2ZW50LmJ1dHRvbiA9PSAwXG4gICAgICAgICAgICAgICAgQG9uQ2xpY2sgZXZlbnRcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcG9zdC50b01haW4gJ3NuYXBLYWNoZWwnIEBpZFxuICAgIFxuICAgIG9uU2F2ZUJvdW5kczogPT5cbiAgICAgICAgXG4gICAgICAgIGZvciBpIGluIFsxLi40XVxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlIFwia2FjaGVsU2l6ZSN7aX1cIlxuICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQgICAgXCJrYWNoZWxTaXplI3tAa2FjaGVsU2l6ZSgpKzF9XCJcbiAgICAgICAgXG4gICAgICAgIHByZWZzLnNldCBcImJvdW5kc+KWuCN7QGthY2hlbElkfVwiIEB3aW4uZ2V0Qm91bmRzKClcbiAgICAgICAgQG9uQm91bmRzKClcbiAgICAgICAgXG4gICAgb25Ib3ZlcjogKGV2ZW50KSA9PiBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQgJ2thY2hlbEZvY3VzJ1xuICAgIG9uTGVhdmU6IChldmVudCkgPT4gZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlICdrYWNoZWxGb2N1cydcbiAgICAgICAgXG4gICAgb25XaW5Gb2N1czogIChldmVudCkgPT4gZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkICAgICdrYWNoZWxGb2N1cyc7IHBvc3QudG9NYWluICdrYWNoZWxGb2N1cycgQGlkOyBAb25Gb2N1cyBldmVudFxuICAgIG9uV2luQmx1cjogICAoZXZlbnQpID0+IGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSAna2FjaGVsRm9jdXMnOyBAb25CbHVyICBldmVudFxuICAgIG9uV2luTG9hZDogICAoZXZlbnQpID0+IEBvbkxvYWQgZXZlbnRcbiAgICBvbldpbk1vdmU6ICAgKGV2ZW50KSA9PiBAb25Nb3ZlIGV2ZW50XG4gICAgICAgICAgICAgICAgXG4gICAgb25XaW5DbG9zZTogIChldmVudCkgPT4gXG4gICAgICAgIGlmIEBrYWNoZWxJZCAhPSAnbWFpbidcbiAgICAgICAgICAgIHByZWZzLmRlbCBcImthY2hlbG7ilrgje0BrYWNoZWxJZH1cIiBcbiAgICAgICAgQG9uQ2xvc2UgZXZlbnRcbiAgICAgICAgXG4gICAgb25Jbml0RGF0YTogPT5cbiAgICAgICAgICAgICAgXG4gICAgICAgIHBvc3QudG9NYWluICdrYWNoZWxCb3VuZHMnIEBpZCwgQGthY2hlbElkXG4gICAgXG4gICAgb25Mb2FkOiAgIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25Nb3ZlOiAgIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25DbGljazogIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25Gb2N1czogIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25CbHVyOiAgIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25Nb3ZlOiAgIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25DbG9zZTogIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25Cb3VuZHM6IC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgXG4gICAgXG4gICAgb25NZW51QWN0aW9uOiAoYWN0aW9uKSA9PlxuICAgICAgICBzd2l0Y2ggYWN0aW9uXG4gICAgICAgICAgICB3aGVuICdOZXcnICAgICAgICAgIHRoZW4gcG9zdC50b01haW4gJ25ld0thY2hlbCcge31cbiAgICAgICAgICAgIHdoZW4gJ0Nsb3NlJyAgICAgICAgdGhlbiBAd2luLmNsb3NlKClcbiAgICAgICAgICAgIHdoZW4gJ1F1aXQnICAgICAgICAgdGhlbiBwb3N0LnRvTWFpbiAncXVpdCdcbiAgICAgICAgICAgIHdoZW4gJ0Fib3V0JyAgICAgICAgdGhlbiBwb3N0LnRvTWFpbiAnc2hvd0Fib3V0J1xuICAgICAgICAgICAgd2hlbiAnU2NoZW1lJyAgICAgICB0aGVuIHBvc3QudG9XaW5zICd0b2dnbGVTY2hlbWUnXG4gICAgICAgICAgICB3aGVuICdJbmNyZWFzZVNpemUnIHRoZW4gcG9zdC50b01haW4gJ2thY2hlbFNpemUnICdpbmNyZWFzZSdcbiAgICAgICAgICAgIHdoZW4gJ0RlY3JlYXNlU2l6ZScgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsU2l6ZScgJ2RlY3JlYXNlJ1xuICAgICAgICAgICAgd2hlbiAnUmVzZXRTaXplJyAgICB0aGVuIHBvc3QudG9NYWluICdrYWNoZWxTaXplJyAncmVzZXQnXG4gICAgICAgICAgICB3aGVuICdJbmNyZWFzZScgICAgIHRoZW4gcG9zdC50b01haW4gJ2thY2hlbFNpemUnICdpbmNyZWFzZScgQGlkXG4gICAgICAgICAgICB3aGVuICdEZWNyZWFzZScgICAgIHRoZW4gcG9zdC50b01haW4gJ2thY2hlbFNpemUnICdkZWNyZWFzZScgQGlkXG4gICAgICAgICAgICB3aGVuICdSZXNldCcgICAgICAgIHRoZW4gcG9zdC50b01haW4gJ2thY2hlbFNpemUnICdyZXNldCcgICAgQGlkXG4gICAgICAgICAgICB3aGVuICdNb3ZlVXAnICAgICAgIHRoZW4gcG9zdC50b01haW4gJ2thY2hlbE1vdmUnICd1cCcgICAgICAgQGlkXG4gICAgICAgICAgICB3aGVuICdNb3ZlRG93bicgICAgIHRoZW4gcG9zdC50b01haW4gJ2thY2hlbE1vdmUnICdkb3duJyAgICAgQGlkXG4gICAgICAgICAgICB3aGVuICdNb3ZlTGVmdCcgICAgIHRoZW4gcG9zdC50b01haW4gJ2thY2hlbE1vdmUnICdsZWZ0JyAgICAgQGlkXG4gICAgICAgICAgICB3aGVuICdNb3ZlUmlnaHQnICAgIHRoZW4gcG9zdC50b01haW4gJ2thY2hlbE1vdmUnICdyaWdodCcgICAgQGlkXG4gICAgICAgICAgICB3aGVuICdEZXZUb29scycgICAgIHRoZW4gQHdpbi53ZWJDb250ZW50cy50b2dnbGVEZXZUb29scygpXG4gICAgICAgICAgICB3aGVuICdSZWxvYWQnICAgICAgIHRoZW4gQHdpbi53ZWJDb250ZW50cy5yZWxvYWRJZ25vcmluZ0NhY2hlKClcbiAgICAgICAgICAgIHdoZW4gJ1NjcmVlbnNob3QnICAgdGhlbiBAc2NyZWVuc2hvdCgpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAga2xvZyAnYWN0aW9uJyBhY3Rpb25cbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBvbkNvbWJvOiAoY29tYm8sIGluZm8pID0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHN3aXRjaCBjb21ib1xuICAgICAgICAgICAgd2hlbiAnbGVmdCcncmlnaHQnJ3VwJydkb3duJyB0aGVuIHBvc3QudG9NYWluICdmb2N1c0thY2hlbCcgQGlkLCBjb21ib1xuICAgICAgICAgICAgd2hlbiAnZW50ZXInJ3NwYWNlJyB0aGVuIEBvbkNsaWNrKClcbiAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBLYWNoZWxcbiJdfQ==
//# sourceURL=../coffee/kachel.coffee
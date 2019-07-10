// koffee 1.3.0

/*
000   000   0000000    0000000  000   000  00000000  000        
000  000   000   000  000       000   000  000       000        
0000000    000000000  000       000000000  0000000   000        
000  000   000   000  000       000   000  000       000        
000   000  000   000   0000000  000   000  00000000  0000000
 */
var $, Kachel, drag, elem, klog, kstr, os, post, prefs, ref, scheme, slash, stopEvent, win,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), drag = ref.drag, post = ref.post, scheme = ref.scheme, stopEvent = ref.stopEvent, prefs = ref.prefs, slash = ref.slash, klog = ref.klog, kstr = ref.kstr, elem = ref.elem, win = ref.win, os = ref.os, $ = ref.$;

Kachel = (function(superClass) {
    extend(Kachel, superClass);

    function Kachel(arg) {
        var bounds, ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'kachel';
        this.onCombo = bind(this.onCombo, this);
        this.onMenuAction = bind(this.onMenuAction, this);
        this.onInitData = bind(this.onInitData, this);
        this.onWinClose = bind(this.onWinClose, this);
        this.onWinMove = bind(this.onWinMove, this);
        this.onWinLoad = bind(this.onWinLoad, this);
        this.onWinBlur = bind(this.onWinBlur, this);
        this.onWinFocus = bind(this.onWinFocus, this);
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
        post.on('toggleScheme', function() {
            return scheme.toggle();
        });
        this.main.addEventListener('mouseenter', (function(_this) {
            return function() {
                return _this.win.focus();
            };
        })(this));
        if (this.kachelId !== 'main') {
            this.win.setSkipTaskbar(true);
            prefs.set("kacheln▸" + this.kachelId, this.kachelData());
        }
        bounds = prefs.get("bounds▸" + this.kachelId);
        if (bounds != null) {
            this.win.setBounds(bounds);
        }
    }

    Kachel.prototype.kachelData = function() {
        return {
            html: this.kachelId
        };
    };

    Kachel.prototype.onContextMenu = function(event) {
        return stopEvent(event);
    };

    Kachel.prototype.onDragStart = function(drag, event) {
        return this.startBounds = this.win.getBounds();
    };

    Kachel.prototype.onDragMove = function(drag, event) {
        this.win.setPosition(this.startBounds.x + drag.deltaSum.x, this.startBounds.y + drag.deltaSum.y);
        return this.win.setSize(this.startBounds.width, this.startBounds.height);
    };

    Kachel.prototype.onDragStop = function(drag, event) {
        if ((drag.deltaSum == null) || (drag.deltaSum.x === 0 && 0 === drag.deltaSum.y)) {
            if (event.button === 0) {
                return this.onClick(event);
            }
        } else {
            return post.toMain('snapKachel', this.id);
        }
    };

    Kachel.prototype.onSaveBounds = function() {
        return prefs.set("bounds▸" + this.kachelId, this.win.getBounds());
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
        var bounds;
        bounds = prefs.get("bounds▸" + this.kachelId);
        if (bounds != null) {
            return this.win.setBounds(bounds);
        }
    };

    Kachel.prototype.onLoad = function() {};

    Kachel.prototype.onMove = function() {};

    Kachel.prototype.onClick = function() {};

    Kachel.prototype.onFocus = function() {};

    Kachel.prototype.onBlur = function() {};

    Kachel.prototype.onMove = function() {};

    Kachel.prototype.onClose = function() {};

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
            case 'Arrange':
                return post.toMain('arrange');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2FjaGVsLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxzRkFBQTtJQUFBOzs7O0FBUUEsTUFBZ0YsT0FBQSxDQUFRLEtBQVIsQ0FBaEYsRUFBRSxlQUFGLEVBQVEsZUFBUixFQUFjLG1CQUFkLEVBQXNCLHlCQUF0QixFQUFpQyxpQkFBakMsRUFBd0MsaUJBQXhDLEVBQStDLGVBQS9DLEVBQXFELGVBQXJELEVBQTJELGVBQTNELEVBQWlFLGFBQWpFLEVBQXNFLFdBQXRFLEVBQTBFOztBQUVwRTs7O0lBRUMsZ0JBQUMsR0FBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsa0RBQVM7Ozs7Ozs7Ozs7Ozs7O1FBRVYsd0NBQ0k7WUFBQSxjQUFBLEVBQWdCLEdBQWhCO1lBQ0EsR0FBQSxFQUFRLFNBRFI7WUFFQSxHQUFBLEVBQVEsT0FBQSxDQUFRLGlCQUFSLENBRlI7WUFHQSxJQUFBLEVBQVEscUJBSFI7WUFJQSxNQUFBLEVBQVEsSUFBQyxDQUFBLFNBSlQ7U0FESjtRQU9BLElBQUMsQ0FBQSxJQUFELEdBQU8sQ0FBQSxDQUFFLE9BQUY7UUFDUCxJQUFDLENBQUEsSUFBRCxHQUFTLElBQUksSUFBSixDQUNMO1lBQUEsTUFBQSxFQUFVLFFBQVEsQ0FBQyxJQUFuQjtZQUNBLE9BQUEsRUFBVSxJQUFDLENBQUEsV0FEWDtZQUVBLE1BQUEsRUFBVSxJQUFDLENBQUEsVUFGWDtZQUdBLE1BQUEsRUFBVSxJQUFDLENBQUEsVUFIWDtTQURLO1FBTVQsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFMLENBQVEsTUFBUixFQUFnQixJQUFDLENBQUEsU0FBakI7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxNQUFSLEVBQWdCLElBQUMsQ0FBQSxTQUFqQjtRQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLE9BQVIsRUFBZ0IsSUFBQyxDQUFBLFVBQWpCO1FB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QUE7QUFmN0I7dUJBaUJRLElBQUEsQ0FBSyxRQUFMLEVBQWMsTUFBZDtBQWpCUjtJQURVOztxQkEwQmQsT0FBQSxHQUFTLFNBQUMsS0FBRCxFQUFRLElBQVI7QUFFTCxnQkFBTyxLQUFQO0FBQUEsaUJBQ1MsTUFEVDtBQUFBLGlCQUNlLE9BRGY7QUFBQSxpQkFDc0IsSUFEdEI7QUFBQSxpQkFDMEIsTUFEMUI7dUJBQ3NDLElBQUksQ0FBQyxNQUFMLENBQVksYUFBWixFQUEwQixJQUFDLENBQUEsRUFBM0IsRUFBK0IsS0FBL0I7QUFEdEMsaUJBRVMsT0FGVDtBQUFBLGlCQUVnQixPQUZoQjt1QkFFNkIsSUFBQyxDQUFBLE9BQUQsQ0FBQTtBQUY3QjtJQUZLOzs7O0dBbkhROztBQXlIckIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgICAgICBcbjAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICBcbjAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwICAgICAgICBcbjAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbiMjI1xuXG57IGRyYWcsIHBvc3QsIHNjaGVtZSwgc3RvcEV2ZW50LCBwcmVmcywgc2xhc2gsIGtsb2csIGtzdHIsIGVsZW0sIHdpbiwgb3MsICQgfSA9IHJlcXVpcmUgJ2t4aydcblxuY2xhc3MgS2FjaGVsIGV4dGVuZHMgd2luXG5cbiAgICBAOiAoQGthY2hlbElkOidrYWNoZWwnKSAtPlxuICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgICAgIHByZWZzU2VwZXJhdG9yOiAn4pa4J1xuICAgICAgICAgICAgZGlyOiAgICBfX2Rpcm5hbWVcbiAgICAgICAgICAgIHBrZzogICAgcmVxdWlyZSAnLi4vcGFja2FnZS5qc29uJ1xuICAgICAgICAgICAgbWVudTogICAnLi4vY29mZmVlL21lbnUubm9vbidcbiAgICAgICAgICAgIG9uTG9hZDogQG9uV2luTG9hZFxuICAgIFxuICAgICAgICBAbWFpbiA9JCAnI21haW4nXG4gICAgICAgIEBkcmFnICA9IG5ldyBkcmFnXG4gICAgICAgICAgICB0YXJnZXQ6ICAgZG9jdW1lbnQuYm9keVxuICAgICAgICAgICAgb25TdGFydDogIEBvbkRyYWdTdGFydFxuICAgICAgICAgICAgb25Nb3ZlOiAgIEBvbkRyYWdNb3ZlXG4gICAgICAgICAgICBvblN0b3A6ICAgQG9uRHJhZ1N0b3BcbiAgICAgICAgXG4gICAgICAgIEB3aW4ub24gJ21vdmUnICBAb25XaW5Nb3ZlXG4gICAgICAgIEB3aW4ub24gJ2JsdXInICBAb25XaW5CbHVyXG4gICAgICAgIEB3aW4ub24gJ2ZvY3VzJyBAb25XaW5Gb2N1c1xuICAgICAgICBAd2luLm9uICdtb3ZlJyAgQG9uV2luTW92ZVxuICAgICAgICBAd2luLm9uICdjbG9zZScgQG9uV2luQ2xvc2VcbiAgICAgICAgXG4gICAgICAgIHBvc3Qub24gJ2luaXREYXRhJyAgIEBvbkluaXREYXRhXG4gICAgICAgIHBvc3Qub24gJ3NhdmVCb3VuZHMnIEBvblNhdmVCb3VuZHNcbiAgICAgICAgcG9zdC5vbiAnY29tYm8nICAgICAgQG9uQ29tYm9cbiAgICAgICAgcG9zdC5vbiAndG9nZ2xlU2NoZW1lJyAtPiBzY2hlbWUudG9nZ2xlKClcbiAgICAgICAgXG4gICAgICAgIEBtYWluLmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNlZW50ZXInID0+IEB3aW4uZm9jdXMoKVxuICAgICAgICBcbiAgICAgICAgaWYgQGthY2hlbElkICE9ICdtYWluJ1xuICAgICAgICAgICAgQHdpbi5zZXRTa2lwVGFza2JhciB0cnVlXG4gICAgICAgICAgICBwcmVmcy5zZXQgXCJrYWNoZWxu4pa4I3tAa2FjaGVsSWR9XCIgQGthY2hlbERhdGEoKVxuICAgICAgICBcbiAgICAgICAgYm91bmRzID0gcHJlZnMuZ2V0IFwiYm91bmRz4pa4I3tAa2FjaGVsSWR9XCJcbiAgICAgICAgaWYgYm91bmRzP1xuICAgICAgICAgICAgQHdpbi5zZXRCb3VuZHMgYm91bmRzXG4gICAgICAgICAgICBcbiAgICBrYWNoZWxEYXRhOiAtPiBodG1sOkBrYWNoZWxJZFxuICAgICAgXG4gICAgb25Db250ZXh0TWVudTogKGV2ZW50KSA9PiBzdG9wRXZlbnQgZXZlbnQgXG4gICAgXG4gICAgb25EcmFnU3RhcnQ6IChkcmFnLCBldmVudCkgPT4gQHN0YXJ0Qm91bmRzID0gQHdpbi5nZXRCb3VuZHMoKVxuICAgICAgICBcbiAgICBvbkRyYWdNb3ZlOiAoZHJhZywgZXZlbnQpID0+IFxuICAgICAgICBAd2luLnNldFBvc2l0aW9uIEBzdGFydEJvdW5kcy54ICsgZHJhZy5kZWx0YVN1bS54LCBAc3RhcnRCb3VuZHMueSArIGRyYWcuZGVsdGFTdW0ueVxuICAgICAgICBAd2luLnNldFNpemUgICAgIEBzdGFydEJvdW5kcy53aWR0aCwgQHN0YXJ0Qm91bmRzLmhlaWdodFxuICAgICAgICBcbiAgICBvbkRyYWdTdG9wOiAoZHJhZywgZXZlbnQpID0+XG4gICAgICAgIGlmIG5vdCBkcmFnLmRlbHRhU3VtPyBvciBkcmFnLmRlbHRhU3VtLnggPT0gMCA9PSBkcmFnLmRlbHRhU3VtLnlcbiAgICAgICAgICAgIGlmIGV2ZW50LmJ1dHRvbiA9PSAwXG4gICAgICAgICAgICAgICAgQG9uQ2xpY2sgZXZlbnRcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcG9zdC50b01haW4gJ3NuYXBLYWNoZWwnIEBpZFxuICAgIFxuICAgIG9uU2F2ZUJvdW5kczogPT4gXG4gICAgICAgIHByZWZzLnNldCBcImJvdW5kc+KWuCN7QGthY2hlbElkfVwiIEB3aW4uZ2V0Qm91bmRzKClcbiAgICAgICAgXG4gICAgb25XaW5Gb2N1czogIChldmVudCkgPT4gZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkICAgICdrYWNoZWxGb2N1cyc7IHBvc3QudG9NYWluICdrYWNoZWxGb2N1cycgQGlkOyBAb25Gb2N1cyBldmVudFxuICAgIG9uV2luQmx1cjogICAoZXZlbnQpID0+IGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSAna2FjaGVsRm9jdXMnOyBAb25CbHVyICBldmVudFxuICAgIG9uV2luTG9hZDogICAoZXZlbnQpID0+IEBvbkxvYWQgZXZlbnRcbiAgICBvbldpbk1vdmU6ICAgKGV2ZW50KSA9PiBAb25Nb3ZlIGV2ZW50XG4gICAgICAgICAgICAgICAgXG4gICAgb25XaW5DbG9zZTogIChldmVudCkgPT4gXG4gICAgICAgIGlmIEBrYWNoZWxJZCAhPSAnbWFpbidcbiAgICAgICAgICAgIHByZWZzLmRlbCBcImthY2hlbG7ilrgje0BrYWNoZWxJZH1cIiBcbiAgICAgICAgQG9uQ2xvc2UgZXZlbnRcbiAgICAgICAgXG4gICAgb25Jbml0RGF0YTogPT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgYm91bmRzID0gcHJlZnMuZ2V0IFwiYm91bmRz4pa4I3tAa2FjaGVsSWR9XCJcbiAgICAgICAgaWYgYm91bmRzP1xuICAgICAgICAgICAgQHdpbi5zZXRCb3VuZHMgYm91bmRzXG4gICAgXG4gICAgb25Mb2FkOiAgLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvbk1vdmU6ICAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uQ2xpY2s6IC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25Gb2N1czogLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvbkJsdXI6ICAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uTW92ZTogIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25DbG9zZTogLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCBcbiAgICBcbiAgICBvbk1lbnVBY3Rpb246IChhY3Rpb24pID0+XG4gICAgICAgIHN3aXRjaCBhY3Rpb25cbiAgICAgICAgICAgIHdoZW4gJ05ldycgICAgICAgICAgdGhlbiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyB7fVxuICAgICAgICAgICAgd2hlbiAnQ2xvc2UnICAgICAgICB0aGVuIEB3aW4uY2xvc2UoKVxuICAgICAgICAgICAgd2hlbiAnUXVpdCcgICAgICAgICB0aGVuIHBvc3QudG9NYWluICdxdWl0J1xuICAgICAgICAgICAgd2hlbiAnQWJvdXQnICAgICAgICB0aGVuIHBvc3QudG9NYWluICdzaG93QWJvdXQnXG4gICAgICAgICAgICB3aGVuICdTY2hlbWUnICAgICAgIHRoZW4gcG9zdC50b1dpbnMgJ3RvZ2dsZVNjaGVtZSdcbiAgICAgICAgICAgIHdoZW4gJ0FycmFuZ2UnICAgICAgdGhlbiBwb3N0LnRvTWFpbiAnYXJyYW5nZSdcbiAgICAgICAgICAgIHdoZW4gJ0luY3JlYXNlU2l6ZScgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsU2l6ZScgJ2luY3JlYXNlJ1xuICAgICAgICAgICAgd2hlbiAnRGVjcmVhc2VTaXplJyB0aGVuIHBvc3QudG9NYWluICdrYWNoZWxTaXplJyAnZGVjcmVhc2UnXG4gICAgICAgICAgICB3aGVuICdSZXNldFNpemUnICAgIHRoZW4gcG9zdC50b01haW4gJ2thY2hlbFNpemUnICdyZXNldCdcbiAgICAgICAgICAgIHdoZW4gJ0luY3JlYXNlJyAgICAgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsU2l6ZScgJ2luY3JlYXNlJyBAaWRcbiAgICAgICAgICAgIHdoZW4gJ0RlY3JlYXNlJyAgICAgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsU2l6ZScgJ2RlY3JlYXNlJyBAaWRcbiAgICAgICAgICAgIHdoZW4gJ1Jlc2V0JyAgICAgICAgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsU2l6ZScgJ3Jlc2V0JyAgICBAaWRcbiAgICAgICAgICAgIHdoZW4gJ0RldlRvb2xzJyAgICAgdGhlbiBAd2luLndlYkNvbnRlbnRzLnRvZ2dsZURldlRvb2xzKClcbiAgICAgICAgICAgIHdoZW4gJ1JlbG9hZCcgICAgICAgdGhlbiBAd2luLndlYkNvbnRlbnRzLnJlbG9hZElnbm9yaW5nQ2FjaGUoKVxuICAgICAgICAgICAgd2hlbiAnU2NyZWVuc2hvdCcgICB0aGVuIEBzY3JlZW5zaG90KClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBrbG9nICdhY3Rpb24nIGFjdGlvblxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIG9uQ29tYm86IChjb21ibywgaW5mbykgPT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgc3dpdGNoIGNvbWJvXG4gICAgICAgICAgICB3aGVuICdsZWZ0JydyaWdodCcndXAnJ2Rvd24nIHRoZW4gcG9zdC50b01haW4gJ2ZvY3VzS2FjaGVsJyBAaWQsIGNvbWJvXG4gICAgICAgICAgICB3aGVuICdlbnRlcicnc3BhY2UnIHRoZW4gQG9uQ2xpY2soKVxuICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEthY2hlbFxuIl19
//# sourceURL=../coffee/kachel.coffee
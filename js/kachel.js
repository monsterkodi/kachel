// koffee 1.3.0

/*
000   000   0000000    0000000  000   000  00000000  000        
000  000   000   000  000       000   000  000       000        
0000000    000000000  000       000000000  0000000   000        
000  000   000   000  000       000   000  000       000        
000   000  000   000   0000000  000   000  00000000  0000000
 */
var $, Kachel, elem, klog, post, prefs, ref, scheme, slash, win,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, scheme = ref.scheme, prefs = ref.prefs, slash = ref.slash, klog = ref.klog, elem = ref.elem, win = ref.win, $ = ref.$;

Kachel = (function(superClass) {
    extend(Kachel, superClass);

    function Kachel(arg) {
        var bounds, ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'kachel';
        this.onCombo = bind(this.onCombo, this);
        this.onMenuAction = bind(this.onMenuAction, this);
        this.onInitData = bind(this.onInitData, this);
        this.onWinClose = bind(this.onWinClose, this);
        this.onWinLoad = bind(this.onWinLoad, this);
        this.onWinMove = bind(this.onWinMove, this);
        this.onWinBlur = bind(this.onWinBlur, this);
        this.onWinFocus = bind(this.onWinFocus, this);
        this.onWinMove = bind(this.onWinMove, this);
        this.onMouseUp = bind(this.onMouseUp, this);
        this.onMouseDown = bind(this.onMouseDown, this);
        Kachel.__super__.constructor.call(this, {
            dir: __dirname,
            pkg: require('../package.json'),
            menu: '../coffee/menu.noon',
            onLoad: this.onWinLoad
        });
        this.main = $('#main');
        this.moved = false;
        this.win.on('move', this.onWinMove);
        this.win.on('blur', this.onWinBlur);
        this.win.on('focus', this.onWinFocus);
        this.win.on('move', this.onWinMove);
        this.win.on('close', this.onWinClose);
        this.main.addEventListener('mousedown', this.onMouseDown);
        this.main.addEventListener('mouseup', this.onMouseUp);
        post.on('initData', this.onInitData);
        post.on('combo', this.onCombo);
        post.on('toggleScheme', function() {
            return scheme.toggle();
        });
        if (this.kachelId !== 'main') {
            prefs.set("kacheln:" + this.kachelId, this.kachelData());
        }
        bounds = prefs.get("bounds:" + this.kachelId);
        if (bounds != null) {
            this.win.setPosition(bounds.x, bounds.y);
        }
    }

    Kachel.prototype.kachelData = function() {
        return {
            html: this.kachelId
        };
    };

    Kachel.prototype.onMouseDown = function(event) {
        return this.moved = false;
    };

    Kachel.prototype.onMouseUp = function(event) {
        if (!this.moved) {
            return this.onClick();
        }
    };

    Kachel.prototype.onWinMove = function(event) {
        this.moved = true;
        return this.onMove(event);
    };

    Kachel.prototype.onWinFocus = function(event) {
        document.body.classList.add('kachelFocus');
        this.main.classList.add('kachelFocus');
        return this.onFocus(event);
    };

    Kachel.prototype.onWinBlur = function(event) {
        document.body.classList.remove('kachelFocus');
        this.main.classList.remove('kachelFocus');
        return this.onBlur(event);
    };

    Kachel.prototype.onWinMove = function(event) {
        prefs.set("bounds:" + this.kachelId, this.win.getBounds());
        return this.onMove(event);
    };

    Kachel.prototype.onWinLoad = function(event) {
        prefs.set("bounds:" + this.kachelId, this.win.getBounds());
        return this.onLoad(event);
    };

    Kachel.prototype.onWinClose = function(event) {
        if (this.kachelId !== 'main') {
            prefs.del("kacheln:" + this.kachelId);
        }
        return this.onClose(event);
    };

    Kachel.prototype.onInitData = function(data) {
        var bounds;
        this.indexPath = data.index;
        this.kachelId = 'kachel' + this.indexPath;
        prefs.set("kacheln:" + this.kachelId + ":data:index", this.indexPath);
        prefs.set("kacheln:" + this.kachelId + ":html", 'kachel');
        this.win.loadURL(slash.fileUrl(slash.join(__dirname, this.indexPath)));
        bounds = prefs.get("bounds:" + this.kachelId);
        if (bounds != null) {
            return this.win.setPosition(bounds.x, bounds.y);
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
            case 'Scheme':
                return post.toWins('toggleScheme');
            case 'Arrange':
                return post.toMain('arrange');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2FjaGVsLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwyREFBQTtJQUFBOzs7O0FBUUEsTUFBcUQsT0FBQSxDQUFRLEtBQVIsQ0FBckQsRUFBRSxlQUFGLEVBQVEsbUJBQVIsRUFBZ0IsaUJBQWhCLEVBQXVCLGlCQUF2QixFQUE4QixlQUE5QixFQUFvQyxlQUFwQyxFQUEwQyxhQUExQyxFQUErQzs7QUFFekM7OztJQUVDLGdCQUFDLEdBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLGtEQUFTOzs7Ozs7Ozs7Ozs7UUFFVix3Q0FDSTtZQUFBLEdBQUEsRUFBUSxTQUFSO1lBQ0EsR0FBQSxFQUFRLE9BQUEsQ0FBUSxpQkFBUixDQURSO1lBRUEsSUFBQSxFQUFRLHFCQUZSO1lBR0EsTUFBQSxFQUFRLElBQUMsQ0FBQSxTQUhUO1NBREo7UUFNQSxJQUFDLENBQUEsSUFBRCxHQUFPLENBQUEsQ0FBRSxPQUFGO1FBQ1AsSUFBQyxDQUFBLEtBQUQsR0FBUztRQUVULElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLE1BQVIsRUFBZ0IsSUFBQyxDQUFBLFNBQWpCO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFMLENBQVEsTUFBUixFQUFnQixJQUFDLENBQUEsU0FBakI7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxPQUFSLEVBQWdCLElBQUMsQ0FBQSxVQUFqQjtRQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLE1BQVIsRUFBZ0IsSUFBQyxDQUFBLFNBQWpCO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFMLENBQVEsT0FBUixFQUFnQixJQUFDLENBQUEsVUFBakI7UUFFQSxJQUFDLENBQUEsSUFBSSxDQUFDLGdCQUFOLENBQXVCLFdBQXZCLEVBQW1DLElBQUMsQ0FBQSxXQUFwQztRQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMs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QUMsS0FBRCxFQUFRLElBQVI7QUFFTCxnQkFBTyxLQUFQO0FBQUEsaUJBQ1MsTUFEVDtBQUFBLGlCQUNlLE9BRGY7QUFBQSxpQkFDc0IsSUFEdEI7QUFBQSxpQkFDMEIsTUFEMUI7dUJBQ3NDLElBQUksQ0FBQyxNQUFMLENBQVksYUFBWixFQUEwQixJQUFDLENBQUEsRUFBM0IsRUFBK0IsS0FBL0I7QUFEdEMsaUJBRVMsT0FGVDtBQUFBLGlCQUVnQixPQUZoQjt1QkFFNkIsSUFBQyxDQUFBLE9BQUQsQ0FBQTtBQUY3QjtJQUZLOzs7O0dBeEZROztBQThGckIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgICAgICBcbjAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICBcbjAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwICAgICAgICBcbjAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbiMjI1xuXG57IHBvc3QsIHNjaGVtZSwgcHJlZnMsIHNsYXNoLCBrbG9nLCBlbGVtLCB3aW4sICQgfSA9IHJlcXVpcmUgJ2t4aydcblxuY2xhc3MgS2FjaGVsIGV4dGVuZHMgd2luXG5cbiAgICBAOiAoQGthY2hlbElkOidrYWNoZWwnKSAtPlxuICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgICAgIGRpcjogICAgX19kaXJuYW1lXG4gICAgICAgICAgICBwa2c6ICAgIHJlcXVpcmUgJy4uL3BhY2thZ2UuanNvbidcbiAgICAgICAgICAgIG1lbnU6ICAgJy4uL2NvZmZlZS9tZW51Lm5vb24nXG4gICAgICAgICAgICBvbkxvYWQ6IEBvbldpbkxvYWRcbiAgICBcbiAgICAgICAgQG1haW4gPSQgJyNtYWluJ1xuICAgICAgICBAbW92ZWQgPSBmYWxzZVxuICAgICAgICBcbiAgICAgICAgQHdpbi5vbiAnbW92ZScgIEBvbldpbk1vdmVcbiAgICAgICAgQHdpbi5vbiAnYmx1cicgIEBvbldpbkJsdXJcbiAgICAgICAgQHdpbi5vbiAnZm9jdXMnIEBvbldpbkZvY3VzXG4gICAgICAgIEB3aW4ub24gJ21vdmUnICBAb25XaW5Nb3ZlXG4gICAgICAgIEB3aW4ub24gJ2Nsb3NlJyBAb25XaW5DbG9zZVxuICAgICAgICBcbiAgICAgICAgQG1haW4uYWRkRXZlbnRMaXN0ZW5lciAnbW91c2Vkb3duJyBAb25Nb3VzZURvd25cbiAgICAgICAgQG1haW4uYWRkRXZlbnRMaXN0ZW5lciAnbW91c2V1cCcgICBAb25Nb3VzZVVwXG4gICAgICAgIFxuICAgICAgICBwb3N0Lm9uICdpbml0RGF0YScgQG9uSW5pdERhdGFcbiAgICAgICAgcG9zdC5vbiAnY29tYm8nIEBvbkNvbWJvXG4gICAgICAgIHBvc3Qub24gJ3RvZ2dsZVNjaGVtZScgLT4gc2NoZW1lLnRvZ2dsZSgpXG4gICAgICAgIFxuICAgICAgICBpZiBAa2FjaGVsSWQgIT0gJ21haW4nXG4gICAgICAgICAgICBwcmVmcy5zZXQgXCJrYWNoZWxuOiN7QGthY2hlbElkfVwiIEBrYWNoZWxEYXRhKClcbiAgICAgICAgXG4gICAgICAgIGJvdW5kcyA9IHByZWZzLmdldCBcImJvdW5kczoje0BrYWNoZWxJZH1cIlxuICAgICAgICBpZiBib3VuZHM/XG4gICAgICAgICAgICBAd2luLnNldFBvc2l0aW9uIGJvdW5kcy54LCBib3VuZHMueVxuICAgIFxuICAgIGthY2hlbERhdGE6IC0+IGh0bWw6QGthY2hlbElkXG4gICAgICBcbiAgICBvbk1vdXNlRG93bjogKGV2ZW50KSA9PiBAbW92ZWQgPSBmYWxzZVxuICAgIG9uTW91c2VVcDogICAoZXZlbnQpID0+IGlmIG5vdCBAbW92ZWQgdGhlbiBAb25DbGljaygpXG4gICAgb25XaW5Nb3ZlOiAgIChldmVudCkgPT4gQG1vdmVkID0gdHJ1ZTsgQG9uTW92ZSBldmVudFxuICAgIG9uV2luRm9jdXM6ICAoZXZlbnQpID0+IGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCAgICAna2FjaGVsRm9jdXMnOyBAbWFpbi5jbGFzc0xpc3QuYWRkICAgICdrYWNoZWxGb2N1cyc7IEBvbkZvY3VzIGV2ZW50XG4gICAgb25XaW5CbHVyOiAgIChldmVudCkgPT4gZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlICdrYWNoZWxGb2N1cyc7IEBtYWluLmNsYXNzTGlzdC5yZW1vdmUgJ2thY2hlbEZvY3VzJzsgQG9uQmx1ciAgZXZlbnRcbiAgICBvbldpbk1vdmU6ICAgKGV2ZW50KSA9PiBwcmVmcy5zZXQgXCJib3VuZHM6I3tAa2FjaGVsSWR9XCIsIEB3aW4uZ2V0Qm91bmRzKCk7IEBvbk1vdmUgZXZlbnRcbiAgICBvbldpbkxvYWQ6ICAgKGV2ZW50KSA9PiBwcmVmcy5zZXQgXCJib3VuZHM6I3tAa2FjaGVsSWR9XCIsIEB3aW4uZ2V0Qm91bmRzKCk7IEBvbkxvYWQgIGV2ZW50XG4gICAgb25XaW5DbG9zZTogIChldmVudCkgPT4gXG4gICAgICAgIGlmIEBrYWNoZWxJZCAhPSAnbWFpbidcbiAgICAgICAgICAgIHByZWZzLmRlbCBcImthY2hlbG46I3tAa2FjaGVsSWR9XCIgXG4gICAgICAgIEBvbkNsb3NlIGV2ZW50XG4gICAgICAgIFxuICAgIG9uSW5pdERhdGE6ICAoZGF0YSkgPT5cblxuICAgICAgICBAaW5kZXhQYXRoID0gZGF0YS5pbmRleFxuICAgICAgICBAa2FjaGVsSWQgPSAna2FjaGVsJytAaW5kZXhQYXRoXG4gICAgICAgIHByZWZzLnNldCBcImthY2hlbG46I3tAa2FjaGVsSWR9OmRhdGE6aW5kZXhcIiBAaW5kZXhQYXRoXG4gICAgICAgIHByZWZzLnNldCBcImthY2hlbG46I3tAa2FjaGVsSWR9Omh0bWxcIiAna2FjaGVsJ1xuICAgIFxuICAgICAgICBAd2luLmxvYWRVUkwgc2xhc2guZmlsZVVybCBzbGFzaC5qb2luIF9fZGlybmFtZSwgQGluZGV4UGF0aFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBib3VuZHMgPSBwcmVmcy5nZXQgXCJib3VuZHM6I3tAa2FjaGVsSWR9XCJcbiAgICAgICAgaWYgYm91bmRzP1xuICAgICAgICAgICAgQHdpbi5zZXRQb3NpdGlvbiBib3VuZHMueCwgYm91bmRzLnlcbiAgICBcbiAgICBvbkxvYWQ6ICAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uTW92ZTogIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25DbGljazogLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvbkZvY3VzOiAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uQmx1cjogIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25Nb3ZlOiAgLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvbkNsb3NlOiAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwIFxuICAgIFxuICAgIG9uTWVudUFjdGlvbjogKGFjdGlvbikgPT5cbiAgICAgICAgc3dpdGNoIGFjdGlvblxuICAgICAgICAgICAgd2hlbiAnTmV3JyAgICAgdGhlbiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJywge31cbiAgICAgICAgICAgIHdoZW4gJ0Nsb3NlJyAgIHRoZW4gQHdpbi5jbG9zZSgpXG4gICAgICAgICAgICB3aGVuICdRdWl0JyAgICB0aGVuIHBvc3QudG9NYWluICdxdWl0J1xuICAgICAgICAgICAgd2hlbiAnU2NoZW1lJyAgdGhlbiBwb3N0LnRvV2lucyAndG9nZ2xlU2NoZW1lJ1xuICAgICAgICAgICAgd2hlbiAnQXJyYW5nZScgdGhlbiBwb3N0LnRvTWFpbiAnYXJyYW5nZSdcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBvbkNvbWJvOiAoY29tYm8sIGluZm8pID0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHN3aXRjaCBjb21ib1xuICAgICAgICAgICAgd2hlbiAnbGVmdCcncmlnaHQnJ3VwJydkb3duJyB0aGVuIHBvc3QudG9NYWluICdmb2N1c0thY2hlbCcgQGlkLCBjb21ib1xuICAgICAgICAgICAgd2hlbiAnZW50ZXInJ3NwYWNlJyB0aGVuIEBvbkNsaWNrKClcbiAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBLYWNoZWxcbiJdfQ==
//# sourceURL=../coffee/kachel.coffee
// koffee 1.2.0

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
        this.onMouseUp = bind(this.onMouseUp, this);
        this.onWinLoad = bind(this.onWinLoad, this);
        this.onWinMove = bind(this.onWinMove, this);
        this.onWinBlur = bind(this.onWinBlur, this);
        this.onWinFocus = bind(this.onWinFocus, this);
        this.onMouseDown = bind(this.onMouseDown, this);
        this.onSaveBounds = bind(this.onSaveBounds, this);
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
        post.on('saveBounds', this.onSaveBounds);
        post.on('combo', this.onCombo);
        post.on('toggleScheme', function() {
            return scheme.toggle();
        });
        if (this.kachelId !== 'main') {
            this.win.setSkipTaskbar(true);
            prefs.set("kacheln:" + this.kachelId, this.kachelData());
        }
        bounds = prefs.get("bounds:" + this.kachelId);
        if (bounds != null) {
            this.win.setBounds(bounds);
        }
    }

    Kachel.prototype.kachelData = function() {
        return {
            html: this.kachelId
        };
    };

    Kachel.prototype.onSaveBounds = function() {
        return prefs.set("bounds:" + this.kachelId, this.win.getBounds());
    };

    Kachel.prototype.onMouseDown = function(event) {
        return this.moved = false;
    };

    Kachel.prototype.onWinFocus = function(event) {
        document.body.classList.add('kachelFocus');
        this.main.classList.add('kachelFocus');
        post.toMain('kachelFocus', this.id);
        return this.onFocus(event);
    };

    Kachel.prototype.onWinBlur = function(event) {
        document.body.classList.remove('kachelFocus');
        this.main.classList.remove('kachelFocus');
        return this.onBlur(event);
    };

    Kachel.prototype.onWinMove = function(event) {
        this.moved = true;
        return this.onMove(event);
    };

    Kachel.prototype.onWinLoad = function(event) {
        this.onSaveBounds();
        return this.onLoad(event);
    };

    Kachel.prototype.onMouseUp = function(event) {
        if (!this.moved) {
            return this.onClick(event);
        } else {
            return post.toMain('snapKachel', this.id);
        }
    };

    Kachel.prototype.onWinClose = function(event) {
        if (this.kachelId !== 'main') {
            prefs.del("kacheln:" + this.kachelId);
        }
        return this.onClose(event);
    };

    Kachel.prototype.onInitData = function() {
        var bounds;
        bounds = prefs.get("bounds:" + this.kachelId);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2FjaGVsLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwyREFBQTtJQUFBOzs7O0FBUUEsTUFBcUQsT0FBQSxDQUFRLEtBQVIsQ0FBckQsRUFBRSxlQUFGLEVBQVEsbUJBQVIsRUFBZ0IsaUJBQWhCLEVBQXVCLGlCQUF2QixFQUE4QixlQUE5QixFQUFvQyxlQUFwQyxFQUEwQyxhQUExQyxFQUErQzs7QUFFekM7OztJQUVDLGdCQUFDLEdBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLGtEQUFTOzs7Ozs7Ozs7Ozs7UUFFVix3Q0FDSTtZQUFBLEdBQUEsRUFBUSxTQUFSO1lBQ0EsR0FBQSxFQUFRLE9BQUEsQ0FBUSxpQkFBUixDQURSO1lBRUEsSUFBQSxFQUFRLHFCQUZSO1lBR0EsTUFBQSxFQUFRLElBQUMsQ0FBQSxTQUhUO1NBREo7UUFNQSxJQUFDLENBQUEsSUFBRCxHQUFPLENBQUEsQ0FBRSxPQUFGO1FBQ1AsSUFBQyxDQUFBLEtBQUQsR0FBUztRQUVULElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLE1BQVIsRUFBZ0IsSUFBQyxDQUFBLFNBQWpCO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFMLENBQVEsTUFBUixFQUFnQixJQUFDLENBQUEsU0FBakI7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxPQUFSLEVBQWdCLElBQUMsQ0FBQSxVQUFqQjtRQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLE1BQVIsRUFBZ0IsSUFBQyxDQUFBLFNBQWpCO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFMLENBQVEsT0FBUixFQUFnQixJQUFDLENBQUEsVUFBakI7UUFFQSxJQUFDLENBQUEsSUFBSSxDQUFDLGdCQUFOLENBQXVCLFdBQXZCLEVBQW1DLElBQUMsQ0FBQSxXQUFwQztRQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMs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LEVBQXJDO0FBVjdCLGlCQVdTLE9BWFQ7dUJBVzZCLElBQUksQ0FBQyxNQUFMLENBQVksWUFBWixFQUF5QixPQUF6QixFQUFvQyxJQUFDLENBQUEsRUFBckM7QUFYN0I7dUJBYVEsSUFBQSxDQUFLLFFBQUwsRUFBYyxNQUFkO0FBYlI7SUFEVTs7cUJBc0JkLE9BQUEsR0FBUyxTQUFDLEtBQUQsRUFBUSxJQUFSO0FBRUwsZ0JBQU8sS0FBUDtBQUFBLGlCQUNTLE1BRFQ7QUFBQSxpQkFDZSxPQURmO0FBQUEsaUJBQ3NCLElBRHRCO0FBQUEsaUJBQzBCLE1BRDFCO3VCQUNzQyxJQUFJLENBQUMsTUFBTCxDQUFZLGFBQVosRUFBMEIsSUFBQyxDQUFBLEVBQTNCLEVBQStCLEtBQS9CO0FBRHRDLGlCQUVTLE9BRlQ7QUFBQSxpQkFFZ0IsT0FGaEI7dUJBRTZCLElBQUMsQ0FBQSxPQUFELENBQUE7QUFGN0I7SUFGSzs7OztHQWxHUTs7QUF3R3JCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgICAgXG4wMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgXG4wMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgICAgXG4wMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4jIyNcblxueyBwb3N0LCBzY2hlbWUsIHByZWZzLCBzbGFzaCwga2xvZywgZWxlbSwgd2luLCAkIH0gPSByZXF1aXJlICdreGsnXG5cbmNsYXNzIEthY2hlbCBleHRlbmRzIHdpblxuXG4gICAgQDogKEBrYWNoZWxJZDona2FjaGVsJykgLT5cbiAgICAgICAgXG4gICAgICAgIHN1cGVyXG4gICAgICAgICAgICBkaXI6ICAgIF9fZGlybmFtZVxuICAgICAgICAgICAgcGtnOiAgICByZXF1aXJlICcuLi9wYWNrYWdlLmpzb24nXG4gICAgICAgICAgICBtZW51OiAgICcuLi9jb2ZmZWUvbWVudS5ub29uJ1xuICAgICAgICAgICAgb25Mb2FkOiBAb25XaW5Mb2FkXG4gICAgXG4gICAgICAgIEBtYWluID0kICcjbWFpbidcbiAgICAgICAgQG1vdmVkID0gZmFsc2VcbiAgICAgICAgXG4gICAgICAgIEB3aW4ub24gJ21vdmUnICBAb25XaW5Nb3ZlXG4gICAgICAgIEB3aW4ub24gJ2JsdXInICBAb25XaW5CbHVyXG4gICAgICAgIEB3aW4ub24gJ2ZvY3VzJyBAb25XaW5Gb2N1c1xuICAgICAgICBAd2luLm9uICdtb3ZlJyAgQG9uV2luTW92ZVxuICAgICAgICBAd2luLm9uICdjbG9zZScgQG9uV2luQ2xvc2VcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQG1haW4uYWRkRXZlbnRMaXN0ZW5lciAnbW91c2Vkb3duJyBAb25Nb3VzZURvd25cbiAgICAgICAgQG1haW4uYWRkRXZlbnRMaXN0ZW5lciAnbW91c2V1cCcgICBAb25Nb3VzZVVwXG4gICAgICAgIFxuICAgICAgICBwb3N0Lm9uICdpbml0RGF0YScgICBAb25Jbml0RGF0YVxuICAgICAgICBwb3N0Lm9uICdzYXZlQm91bmRzJyBAb25TYXZlQm91bmRzXG4gICAgICAgIHBvc3Qub24gJ2NvbWJvJyBAb25Db21ib1xuICAgICAgICBwb3N0Lm9uICd0b2dnbGVTY2hlbWUnIC0+IHNjaGVtZS50b2dnbGUoKVxuICAgICAgICBcbiAgICAgICAgaWYgQGthY2hlbElkICE9ICdtYWluJ1xuICAgICAgICAgICAgQHdpbi5zZXRTa2lwVGFza2JhciB0cnVlXG4gICAgICAgICAgICBwcmVmcy5zZXQgXCJrYWNoZWxuOiN7QGthY2hlbElkfVwiIEBrYWNoZWxEYXRhKClcbiAgICAgICAgXG4gICAgICAgIGJvdW5kcyA9IHByZWZzLmdldCBcImJvdW5kczoje0BrYWNoZWxJZH1cIlxuICAgICAgICBpZiBib3VuZHM/XG4gICAgICAgICAgICBAd2luLnNldEJvdW5kcyBib3VuZHNcbiAgICBcbiAgICBrYWNoZWxEYXRhOiAtPiBodG1sOkBrYWNoZWxJZFxuICAgICAgXG4gICAgb25TYXZlQm91bmRzOiA9PiBcbiAgICAgICAgIyBrbG9nIFwiI3tAa2FjaGVsSWR9XCIsIEB3aW4uZ2V0Qm91bmRzKCkueCBcbiAgICAgICAgcHJlZnMuc2V0IFwiYm91bmRzOiN7QGthY2hlbElkfVwiIEB3aW4uZ2V0Qm91bmRzKClcbiAgICBvbk1vdXNlRG93bjogKGV2ZW50KSA9PiBAbW92ZWQgPSBmYWxzZVxuICAgIG9uV2luRm9jdXM6ICAoZXZlbnQpID0+IGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCAgICAna2FjaGVsRm9jdXMnOyBAbWFpbi5jbGFzc0xpc3QuYWRkICAgICdrYWNoZWxGb2N1cyc7IHBvc3QudG9NYWluICdrYWNoZWxGb2N1cycgQGlkOyBAb25Gb2N1cyBldmVudFxuICAgIG9uV2luQmx1cjogICAoZXZlbnQpID0+IGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSAna2FjaGVsRm9jdXMnOyBAbWFpbi5jbGFzc0xpc3QucmVtb3ZlICdrYWNoZWxGb2N1cyc7IEBvbkJsdXIgIGV2ZW50XG4gICAgb25XaW5Nb3ZlOiAgIChldmVudCkgPT4gQG1vdmVkID0gdHJ1ZTsgICBAb25Nb3ZlIGV2ZW50XG4gICAgb25XaW5Mb2FkOiAgIChldmVudCkgPT4gQG9uU2F2ZUJvdW5kcygpOyBAb25Mb2FkIGV2ZW50XG4gICAgb25Nb3VzZVVwOiAgIChldmVudCkgPT4gXG4gICAgICAgIGlmIG5vdCBAbW92ZWQgXG4gICAgICAgICAgICBAb25DbGljayBldmVudFxuICAgICAgICBlbHNlIFxuICAgICAgICAgICAgcG9zdC50b01haW4gJ3NuYXBLYWNoZWwnIEBpZFxuICAgICAgICAgICAgXG4gICAgb25XaW5DbG9zZTogIChldmVudCkgPT4gXG4gICAgICAgIGlmIEBrYWNoZWxJZCAhPSAnbWFpbidcbiAgICAgICAgICAgIHByZWZzLmRlbCBcImthY2hlbG46I3tAa2FjaGVsSWR9XCIgXG4gICAgICAgIEBvbkNsb3NlIGV2ZW50XG4gICAgICAgIFxuICAgIG9uSW5pdERhdGE6ID0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGJvdW5kcyA9IHByZWZzLmdldCBcImJvdW5kczoje0BrYWNoZWxJZH1cIlxuICAgICAgICBpZiBib3VuZHM/XG4gICAgICAgICAgICBAd2luLnNldEJvdW5kcyBib3VuZHNcbiAgICBcbiAgICBvbkxvYWQ6ICAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uTW92ZTogIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25DbGljazogLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvbkZvY3VzOiAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uQmx1cjogIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25Nb3ZlOiAgLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvbkNsb3NlOiAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwIFxuICAgIFxuICAgIG9uTWVudUFjdGlvbjogKGFjdGlvbikgPT5cbiAgICAgICAgc3dpdGNoIGFjdGlvblxuICAgICAgICAgICAgd2hlbiAnTmV3JyAgICAgICAgICB0aGVuIHBvc3QudG9NYWluICduZXdLYWNoZWwnLCB7fVxuICAgICAgICAgICAgd2hlbiAnQ2xvc2UnICAgICAgICB0aGVuIEB3aW4uY2xvc2UoKVxuICAgICAgICAgICAgd2hlbiAnUXVpdCcgICAgICAgICB0aGVuIHBvc3QudG9NYWluICdxdWl0J1xuICAgICAgICAgICAgd2hlbiAnU2NoZW1lJyAgICAgICB0aGVuIHBvc3QudG9XaW5zICd0b2dnbGVTY2hlbWUnXG4gICAgICAgICAgICB3aGVuICdBcnJhbmdlJyAgICAgIHRoZW4gcG9zdC50b01haW4gJ2FycmFuZ2UnXG4gICAgICAgICAgICB3aGVuICdJbmNyZWFzZVNpemUnIHRoZW4gcG9zdC50b01haW4gJ2thY2hlbFNpemUnICdpbmNyZWFzZSdcbiAgICAgICAgICAgIHdoZW4gJ0RlY3JlYXNlU2l6ZScgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsU2l6ZScgJ2RlY3JlYXNlJ1xuICAgICAgICAgICAgd2hlbiAnUmVzZXRTaXplJyAgICB0aGVuIHBvc3QudG9NYWluICdrYWNoZWxTaXplJyAncmVzZXQnXG4gICAgICAgICAgICB3aGVuICdJbmNyZWFzZScgICAgIHRoZW4gcG9zdC50b01haW4gJ2thY2hlbFNpemUnICdpbmNyZWFzZScgQGlkXG4gICAgICAgICAgICB3aGVuICdEZWNyZWFzZScgICAgIHRoZW4gcG9zdC50b01haW4gJ2thY2hlbFNpemUnICdkZWNyZWFzZScgQGlkXG4gICAgICAgICAgICB3aGVuICdSZXNldCcgICAgICAgIHRoZW4gcG9zdC50b01haW4gJ2thY2hlbFNpemUnICdyZXNldCcgICAgQGlkXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAga2xvZyAnYWN0aW9uJyBhY3Rpb25cbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBvbkNvbWJvOiAoY29tYm8sIGluZm8pID0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHN3aXRjaCBjb21ib1xuICAgICAgICAgICAgd2hlbiAnbGVmdCcncmlnaHQnJ3VwJydkb3duJyB0aGVuIHBvc3QudG9NYWluICdmb2N1c0thY2hlbCcgQGlkLCBjb21ib1xuICAgICAgICAgICAgd2hlbiAnZW50ZXInJ3NwYWNlJyB0aGVuIEBvbkNsaWNrKClcbiAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBLYWNoZWxcbiJdfQ==
//# sourceURL=../coffee/kachel.coffee
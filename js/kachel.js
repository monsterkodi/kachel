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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2FjaGVsLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwyREFBQTtJQUFBOzs7O0FBUUEsTUFBcUQsT0FBQSxDQUFRLEtBQVIsQ0FBckQsRUFBRSxlQUFGLEVBQVEsbUJBQVIsRUFBZ0IsaUJBQWhCLEVBQXVCLGlCQUF2QixFQUE4QixlQUE5QixFQUFvQyxlQUFwQyxFQUEwQyxhQUExQyxFQUErQzs7QUFFekM7OztJQUVDLGdCQUFDLEdBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLGtEQUFTOzs7Ozs7Ozs7Ozs7UUFFVix3Q0FDSTtZQUFBLEdBQUEsRUFBUSxTQUFSO1lBQ0EsR0FBQSxFQUFRLE9BQUEsQ0FBUSxpQkFBUixDQURSO1lBRUEsSUFBQSxFQUFRLHFCQUZSO1lBR0EsTUFBQSxFQUFRLElBQUMsQ0FBQSxTQUhUO1NBREo7UUFNQSxJQUFDLENBQUEsSUFBRCxHQUFPLENBQUEsQ0FBRSxPQUFGO1FBQ1AsSUFBQyxDQUFBLEtBQUQsR0FBUztRQUVULElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLE1BQVIsRUFBZ0IsSUFBQyxDQUFBLFNBQWpCO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFMLENBQVEsTUFBUixFQUFnQixJQUFDLENBQUEsU0FBakI7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxPQUFSLEVBQWdCLElBQUMsQ0FBQSxVQUFqQjtRQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLE1BQVIsRUFBZ0IsSUFBQyxDQUFBLFNBQWpCO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFMLENBQVEsT0FBUixFQUFnQixJQUFDLENBQUEsVUFBakI7UUFFQSxJQUFDLENBQUEsSUFBSSxDQUFDLGdCQUFOLENBQXVCLFdBQXZCLEVBQW1DLElBQUMsQ0FBQSxXQUFwQztRQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMs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QVosRUFBeUIsT0FBekIsRUFBb0MsSUFBQyxDQUFBLEVBQXJDO0FBWDdCO3VCQWFRLElBQUEsQ0FBSyxRQUFMLEVBQWMsTUFBZDtBQWJSO0lBRFU7O3FCQXNCZCxPQUFBLEdBQVMsU0FBQyxLQUFELEVBQVEsSUFBUjtBQUVMLGdCQUFPLEtBQVA7QUFBQSxpQkFDUyxNQURUO0FBQUEsaUJBQ2UsT0FEZjtBQUFBLGlCQUNzQixJQUR0QjtBQUFBLGlCQUMwQixNQUQxQjt1QkFDc0MsSUFBSSxDQUFDLE1BQUwsQ0FBWSxhQUFaLEVBQTBCLElBQUMsQ0FBQSxFQUEzQixFQUErQixLQUEvQjtBQUR0QyxpQkFFUyxPQUZUO0FBQUEsaUJBRWdCLE9BRmhCO3VCQUU2QixJQUFDLENBQUEsT0FBRCxDQUFBO0FBRjdCO0lBRks7Ozs7R0FsR1E7O0FBd0dyQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAgICAgIFxuMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIFxuMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgIFxuMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuIyMjXG5cbnsgcG9zdCwgc2NoZW1lLCBwcmVmcywgc2xhc2gsIGtsb2csIGVsZW0sIHdpbiwgJCB9ID0gcmVxdWlyZSAna3hrJ1xuXG5jbGFzcyBLYWNoZWwgZXh0ZW5kcyB3aW5cblxuICAgIEA6IChAa2FjaGVsSWQ6J2thY2hlbCcpIC0+XG4gICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICAgICAgZGlyOiAgICBfX2Rpcm5hbWVcbiAgICAgICAgICAgIHBrZzogICAgcmVxdWlyZSAnLi4vcGFja2FnZS5qc29uJ1xuICAgICAgICAgICAgbWVudTogICAnLi4vY29mZmVlL21lbnUubm9vbidcbiAgICAgICAgICAgIG9uTG9hZDogQG9uV2luTG9hZFxuICAgIFxuICAgICAgICBAbWFpbiA9JCAnI21haW4nXG4gICAgICAgIEBtb3ZlZCA9IGZhbHNlXG4gICAgICAgIFxuICAgICAgICBAd2luLm9uICdtb3ZlJyAgQG9uV2luTW92ZVxuICAgICAgICBAd2luLm9uICdibHVyJyAgQG9uV2luQmx1clxuICAgICAgICBAd2luLm9uICdmb2N1cycgQG9uV2luRm9jdXNcbiAgICAgICAgQHdpbi5vbiAnbW92ZScgIEBvbldpbk1vdmVcbiAgICAgICAgQHdpbi5vbiAnY2xvc2UnIEBvbldpbkNsb3NlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBtYWluLmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNlZG93bicgQG9uTW91c2VEb3duXG4gICAgICAgIEBtYWluLmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNldXAnICAgQG9uTW91c2VVcFxuICAgICAgICBcbiAgICAgICAgcG9zdC5vbiAnaW5pdERhdGEnICAgQG9uSW5pdERhdGFcbiAgICAgICAgcG9zdC5vbiAnc2F2ZUJvdW5kcycgQG9uU2F2ZUJvdW5kc1xuICAgICAgICBwb3N0Lm9uICdjb21ibycgQG9uQ29tYm9cbiAgICAgICAgcG9zdC5vbiAndG9nZ2xlU2NoZW1lJyAtPiBzY2hlbWUudG9nZ2xlKClcbiAgICAgICAgXG4gICAgICAgIGlmIEBrYWNoZWxJZCAhPSAnbWFpbidcbiAgICAgICAgICAgIEB3aW4uc2V0U2tpcFRhc2tiYXIgdHJ1ZVxuICAgICAgICAgICAgcHJlZnMuc2V0IFwia2FjaGVsbjoje0BrYWNoZWxJZH1cIiBAa2FjaGVsRGF0YSgpXG4gICAgICAgIFxuICAgICAgICBib3VuZHMgPSBwcmVmcy5nZXQgXCJib3VuZHM6I3tAa2FjaGVsSWR9XCJcbiAgICAgICAgaWYgYm91bmRzP1xuICAgICAgICAgICAgQHdpbi5zZXRCb3VuZHMgYm91bmRzXG4gICAgXG4gICAga2FjaGVsRGF0YTogLT4gaHRtbDpAa2FjaGVsSWRcbiAgICAgIFxuICAgIG9uU2F2ZUJvdW5kczogPT4gXG4gICAgICAgICMga2xvZyBcIiN7QGthY2hlbElkfVwiLCBAd2luLmdldEJvdW5kcygpLnggXG4gICAgICAgIHByZWZzLnNldCBcImJvdW5kczoje0BrYWNoZWxJZH1cIiBAd2luLmdldEJvdW5kcygpXG4gICAgb25Nb3VzZURvd246IChldmVudCkgPT4gQG1vdmVkID0gZmFsc2VcbiAgICBvbldpbkZvY3VzOiAgKGV2ZW50KSA9PiBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQgICAgJ2thY2hlbEZvY3VzJzsgQG1haW4uY2xhc3NMaXN0LmFkZCAgICAna2FjaGVsRm9jdXMnOyBAb25Gb2N1cyBldmVudFxuICAgIG9uV2luQmx1cjogICAoZXZlbnQpID0+IGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSAna2FjaGVsRm9jdXMnOyBAbWFpbi5jbGFzc0xpc3QucmVtb3ZlICdrYWNoZWxGb2N1cyc7IEBvbkJsdXIgIGV2ZW50XG4gICAgb25XaW5Nb3ZlOiAgIChldmVudCkgPT4gQG1vdmVkID0gdHJ1ZTsgICBAb25Nb3ZlIGV2ZW50XG4gICAgb25XaW5Mb2FkOiAgIChldmVudCkgPT4gQG9uU2F2ZUJvdW5kcygpOyBAb25Mb2FkIGV2ZW50XG4gICAgb25Nb3VzZVVwOiAgIChldmVudCkgPT4gXG4gICAgICAgIGlmIG5vdCBAbW92ZWQgXG4gICAgICAgICAgICBAb25DbGljayBldmVudFxuICAgICAgICBlbHNlIFxuICAgICAgICAgICAgcG9zdC50b01haW4gJ3NuYXBLYWNoZWwnIEBpZFxuICAgICAgICAgICAgXG4gICAgb25XaW5DbG9zZTogIChldmVudCkgPT4gXG4gICAgICAgIGlmIEBrYWNoZWxJZCAhPSAnbWFpbidcbiAgICAgICAgICAgIHByZWZzLmRlbCBcImthY2hlbG46I3tAa2FjaGVsSWR9XCIgXG4gICAgICAgIEBvbkNsb3NlIGV2ZW50XG4gICAgICAgIFxuICAgIG9uSW5pdERhdGE6ID0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGJvdW5kcyA9IHByZWZzLmdldCBcImJvdW5kczoje0BrYWNoZWxJZH1cIlxuICAgICAgICBpZiBib3VuZHM/XG4gICAgICAgICAgICBAd2luLnNldEJvdW5kcyBib3VuZHNcbiAgICBcbiAgICBvbkxvYWQ6ICAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uTW92ZTogIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25DbGljazogLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvbkZvY3VzOiAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uQmx1cjogIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25Nb3ZlOiAgLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvbkNsb3NlOiAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwIFxuICAgIFxuICAgIG9uTWVudUFjdGlvbjogKGFjdGlvbikgPT5cbiAgICAgICAgc3dpdGNoIGFjdGlvblxuICAgICAgICAgICAgd2hlbiAnTmV3JyAgICAgICAgICB0aGVuIHBvc3QudG9NYWluICduZXdLYWNoZWwnLCB7fVxuICAgICAgICAgICAgd2hlbiAnQ2xvc2UnICAgICAgICB0aGVuIEB3aW4uY2xvc2UoKVxuICAgICAgICAgICAgd2hlbiAnUXVpdCcgICAgICAgICB0aGVuIHBvc3QudG9NYWluICdxdWl0J1xuICAgICAgICAgICAgd2hlbiAnU2NoZW1lJyAgICAgICB0aGVuIHBvc3QudG9XaW5zICd0b2dnbGVTY2hlbWUnXG4gICAgICAgICAgICB3aGVuICdBcnJhbmdlJyAgICAgIHRoZW4gcG9zdC50b01haW4gJ2FycmFuZ2UnXG4gICAgICAgICAgICB3aGVuICdJbmNyZWFzZVNpemUnIHRoZW4gcG9zdC50b01haW4gJ2thY2hlbFNpemUnICdpbmNyZWFzZSdcbiAgICAgICAgICAgIHdoZW4gJ0RlY3JlYXNlU2l6ZScgdGhlbiBwb3N0LnRvTWFpbiAna2FjaGVsU2l6ZScgJ2RlY3JlYXNlJ1xuICAgICAgICAgICAgd2hlbiAnUmVzZXRTaXplJyAgICB0aGVuIHBvc3QudG9NYWluICdrYWNoZWxTaXplJyAncmVzZXQnXG4gICAgICAgICAgICB3aGVuICdJbmNyZWFzZScgICAgIHRoZW4gcG9zdC50b01haW4gJ2thY2hlbFNpemUnICdpbmNyZWFzZScgQGlkXG4gICAgICAgICAgICB3aGVuICdEZWNyZWFzZScgICAgIHRoZW4gcG9zdC50b01haW4gJ2thY2hlbFNpemUnICdkZWNyZWFzZScgQGlkXG4gICAgICAgICAgICB3aGVuICdSZXNldCcgICAgICAgIHRoZW4gcG9zdC50b01haW4gJ2thY2hlbFNpemUnICdyZXNldCcgICAgQGlkXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAga2xvZyAnYWN0aW9uJyBhY3Rpb25cbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBvbkNvbWJvOiAoY29tYm8sIGluZm8pID0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHN3aXRjaCBjb21ib1xuICAgICAgICAgICAgd2hlbiAnbGVmdCcncmlnaHQnJ3VwJydkb3duJyB0aGVuIHBvc3QudG9NYWluICdmb2N1c0thY2hlbCcgQGlkLCBjb21ib1xuICAgICAgICAgICAgd2hlbiAnZW50ZXInJ3NwYWNlJyB0aGVuIEBvbkNsaWNrKClcbiAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBLYWNoZWxcbiJdfQ==
//# sourceURL=../coffee/kachel.coffee
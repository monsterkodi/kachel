// koffee 1.3.0

/*
000   000   0000000    0000000  000   000  00000000  000        
000  000   000   000  000       000   000  000       000        
0000000    000000000  000       000000000  0000000   000        
000  000   000   000  000       000   000  000       000        
000   000  000   000   0000000  000   000  00000000  0000000
 */
var $, Kachel, _, elem, klog, post, prefs, ref, scheme, win,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, scheme = ref.scheme, prefs = ref.prefs, elem = ref.elem, win = ref.win, klog = ref.klog, $ = ref.$, _ = ref._;

Kachel = (function(superClass) {
    extend(Kachel, superClass);

    function Kachel(arg) {
        var bounds, ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : null;
        this.onCombo = bind(this.onCombo, this);
        this.onMenuAction = bind(this.onMenuAction, this);
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
            klog('prefs.del', "kacheln:" + this.kachelId);
            prefs.del("kacheln:" + this.kachelId);
        }
        return this.onClose(event);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2FjaGVsLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSx1REFBQTtJQUFBOzs7O0FBUUEsTUFBaUQsT0FBQSxDQUFRLEtBQVIsQ0FBakQsRUFBRSxlQUFGLEVBQVEsbUJBQVIsRUFBZ0IsaUJBQWhCLEVBQXVCLGVBQXZCLEVBQTZCLGFBQTdCLEVBQWtDLGVBQWxDLEVBQXdDLFNBQXhDLEVBQTJDOztBQUVyQzs7O0lBRUMsZ0JBQUMsR0FBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsa0RBQU87Ozs7Ozs7Ozs7O1FBRVIsd0NBQ0k7WUFBQSxHQUFBLEVBQVEsU0FBUjtZQUNBLEdBQUEsRUFBUSxPQUFBLENBQVEsaUJBQVIsQ0FEUjtZQUVBLElBQUEsRUFBUSxxQkFGUjtZQUdBLE1BQUEsRUFBUSxJQUFDLENBQUEsU0FIVDtTQURKO1FBTUEsSUFBQyxDQUFBLElBQUQsR0FBTyxDQUFBLENBQUUsT0FBRjtRQUNQLElBQUMsQ0FBQSxLQUFELEdBQVM7UUFFVCxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxNQUFSLEVBQWdCLElBQUMsQ0FBQSxTQUFqQjtRQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLE1BQVIsRUFBZ0IsSUFBQyxDQUFBLFNBQWpCO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFMLENBQVEsT0FBUixFQUFnQixJQUFDLENBQUEsVUFBakI7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxNQUFSLEVBQWdCLElBQUMsQ0FBQSxTQUFqQjtRQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLE9BQVIsRUFBZ0IsSUFBQyxDQUFBLFVBQWpCO1FBRUEsSUFBQyxDQUFBLElBQUksQ0FBQyxnQkFBTixDQUF1QixXQUF2QixFQUFtQyxJQUFDLENBQUEsV0FBcEM7UUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLGdC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QVMsU0FBQSxHQUFBOztxQkFRVCxZQUFBLEdBQWMsU0FBQyxNQUFEO0FBQ1YsZ0JBQU8sTUFBUDtBQUFBLGlCQUNTLEtBRFQ7dUJBQ3dCLElBQUksQ0FBQyxNQUFMLENBQVksV0FBWixFQUF5QixFQUF6QjtBQUR4QixpQkFFUyxPQUZUO3VCQUV3QixJQUFDLENBQUEsR0FBRyxDQUFDLEtBQUwsQ0FBQTtBQUZ4QixpQkFHUyxNQUhUO3VCQUd3QixJQUFJLENBQUMsTUFBTCxDQUFZLE1BQVo7QUFIeEIsaUJBSVMsUUFKVDt1QkFJd0IsSUFBSSxDQUFDLE1BQUwsQ0FBWSxjQUFaO0FBSnhCLGlCQUtTLFNBTFQ7dUJBS3dCLElBQUksQ0FBQyxNQUFMLENBQVksU0FBWjtBQUx4QjtJQURVOztxQkFjZCxPQUFBLEdBQVMsU0FBQyxLQUFELEVBQVEsSUFBUjtBQUVMLGdCQUFPLEtBQVA7QUFBQSxpQkFDUyxNQURUO0FBQUEsaUJBQ2UsT0FEZjtBQUFBLGlCQUNzQixJQUR0QjtBQUFBLGlCQUMwQixNQUQxQjt1QkFDc0MsSUFBSSxDQUFDLE1BQUwsQ0FBWSxhQUFaLEVBQTBCLElBQUMsQ0FBQSxFQUEzQixFQUErQixLQUEvQjtBQUR0QyxpQkFFUyxPQUZUO0FBQUEsaUJBRWdCLE9BRmhCO3VCQUU2QixJQUFDLENBQUEsT0FBRCxDQUFBO0FBRjdCO0lBRks7Ozs7R0EzRVE7O0FBaUZyQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAgICAgIFxuMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIFxuMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgIFxuMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuIyMjXG5cbnsgcG9zdCwgc2NoZW1lLCBwcmVmcywgZWxlbSwgd2luLCBrbG9nLCAkLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbmNsYXNzIEthY2hlbCBleHRlbmRzIHdpblxuXG4gICAgQDogKEBrYWNoZWxJZDopIC0+XG4gICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICAgICAgZGlyOiAgICBfX2Rpcm5hbWVcbiAgICAgICAgICAgIHBrZzogICAgcmVxdWlyZSAnLi4vcGFja2FnZS5qc29uJ1xuICAgICAgICAgICAgbWVudTogICAnLi4vY29mZmVlL21lbnUubm9vbidcbiAgICAgICAgICAgIG9uTG9hZDogQG9uV2luTG9hZFxuICAgIFxuICAgICAgICBAbWFpbiA9JCAnI21haW4nXG4gICAgICAgIEBtb3ZlZCA9IGZhbHNlXG4gICAgICAgIFxuICAgICAgICBAd2luLm9uICdtb3ZlJyAgQG9uV2luTW92ZVxuICAgICAgICBAd2luLm9uICdibHVyJyAgQG9uV2luQmx1clxuICAgICAgICBAd2luLm9uICdmb2N1cycgQG9uV2luRm9jdXNcbiAgICAgICAgQHdpbi5vbiAnbW92ZScgIEBvbldpbk1vdmVcbiAgICAgICAgQHdpbi5vbiAnY2xvc2UnIEBvbldpbkNsb3NlXG4gICAgICAgIFxuICAgICAgICBAbWFpbi5hZGRFdmVudExpc3RlbmVyICdtb3VzZWRvd24nIEBvbk1vdXNlRG93blxuICAgICAgICBAbWFpbi5hZGRFdmVudExpc3RlbmVyICdtb3VzZXVwJyAgIEBvbk1vdXNlVXBcbiAgICAgICAgXG4gICAgICAgIHBvc3Qub24gJ2NvbWJvJyBAb25Db21ib1xuICAgICAgICBwb3N0Lm9uICd0b2dnbGVTY2hlbWUnIC0+IHNjaGVtZS50b2dnbGUoKVxuICAgICAgICBcbiAgICAgICAgaWYgQGthY2hlbElkICE9ICdtYWluJ1xuICAgICAgICAgICAgcHJlZnMuc2V0IFwia2FjaGVsbjoje0BrYWNoZWxJZH1cIiBAa2FjaGVsRGF0YSgpXG4gICAgICAgIFxuICAgICAgICBib3VuZHMgPSBwcmVmcy5nZXQgXCJib3VuZHM6I3tAa2FjaGVsSWR9XCJcbiAgICAgICAgaWYgYm91bmRzP1xuICAgICAgICAgICAgQHdpbi5zZXRQb3NpdGlvbiBib3VuZHMueCwgYm91bmRzLnlcbiAgICBcbiAgICBrYWNoZWxEYXRhOiAtPiBodG1sOkBrYWNoZWxJZFxuICAgICAgICAgICAgXG4gICAgb25Nb3VzZURvd246IChldmVudCkgPT4gQG1vdmVkID0gZmFsc2VcbiAgICBvbk1vdXNlVXA6ICAgKGV2ZW50KSA9PiBpZiBub3QgQG1vdmVkIHRoZW4gQG9uQ2xpY2soKVxuICAgIG9uV2luTW92ZTogICAoZXZlbnQpID0+IEBtb3ZlZCA9IHRydWU7IEBvbk1vdmUgZXZlbnRcbiAgICBvbldpbkZvY3VzOiAgKGV2ZW50KSA9PiBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQgICAgJ2thY2hlbEZvY3VzJzsgQG1haW4uY2xhc3NMaXN0LmFkZCAgICAna2FjaGVsRm9jdXMnOyBAb25Gb2N1cyBldmVudFxuICAgIG9uV2luQmx1cjogICAoZXZlbnQpID0+IGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSAna2FjaGVsRm9jdXMnOyBAbWFpbi5jbGFzc0xpc3QucmVtb3ZlICdrYWNoZWxGb2N1cyc7IEBvbkJsdXIgIGV2ZW50XG4gICAgb25XaW5Nb3ZlOiAgIChldmVudCkgPT4gcHJlZnMuc2V0IFwiYm91bmRzOiN7QGthY2hlbElkfVwiLCBAd2luLmdldEJvdW5kcygpOyBAb25Nb3ZlIGV2ZW50XG4gICAgb25XaW5Mb2FkOiAgIChldmVudCkgPT4gcHJlZnMuc2V0IFwiYm91bmRzOiN7QGthY2hlbElkfVwiLCBAd2luLmdldEJvdW5kcygpOyBAb25Mb2FkICBldmVudFxuICAgIG9uV2luQ2xvc2U6ICAoZXZlbnQpID0+IFxuICAgICAgICBpZiBAa2FjaGVsSWQgIT0gJ21haW4nXG4gICAgICAgICAgICBrbG9nICdwcmVmcy5kZWwnIFwia2FjaGVsbjoje0BrYWNoZWxJZH1cIiBcbiAgICAgICAgICAgIHByZWZzLmRlbCBcImthY2hlbG46I3tAa2FjaGVsSWR9XCIgXG4gICAgICAgIEBvbkNsb3NlIGV2ZW50XG4gICAgXG4gICAgb25Mb2FkOiAgLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvbk1vdmU6ICAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uQ2xpY2s6IC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25Gb2N1czogLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvbkJsdXI6ICAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uTW92ZTogIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25DbG9zZTogLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCBcbiAgICBcbiAgICBvbk1lbnVBY3Rpb246IChhY3Rpb24pID0+XG4gICAgICAgIHN3aXRjaCBhY3Rpb25cbiAgICAgICAgICAgIHdoZW4gJ05ldycgICAgIHRoZW4gcG9zdC50b01haW4gJ25ld0thY2hlbCcsIHt9XG4gICAgICAgICAgICB3aGVuICdDbG9zZScgICB0aGVuIEB3aW4uY2xvc2UoKVxuICAgICAgICAgICAgd2hlbiAnUXVpdCcgICAgdGhlbiBwb3N0LnRvTWFpbiAncXVpdCdcbiAgICAgICAgICAgIHdoZW4gJ1NjaGVtZScgIHRoZW4gcG9zdC50b1dpbnMgJ3RvZ2dsZVNjaGVtZSdcbiAgICAgICAgICAgIHdoZW4gJ0FycmFuZ2UnIHRoZW4gcG9zdC50b01haW4gJ2FycmFuZ2UnXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgb25Db21ibzogKGNvbWJvLCBpbmZvKSA9PlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBzd2l0Y2ggY29tYm9cbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnJ3JpZ2h0Jyd1cCcnZG93bicgdGhlbiBwb3N0LnRvTWFpbiAnZm9jdXNLYWNoZWwnIEBpZCwgY29tYm9cbiAgICAgICAgICAgIHdoZW4gJ2VudGVyJydzcGFjZScgdGhlbiBAb25DbGljaygpXG4gICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gS2FjaGVsXG4iXX0=
//# sourceURL=../coffee/kachel.coffee
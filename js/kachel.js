// koffee 1.2.0

/*
000   000   0000000    0000000  000   000  00000000  000        
000  000   000   000  000       000   000  000       000        
0000000    000000000  000       000000000  0000000   000        
000  000   000   000  000       000   000  000       000        
000   000  000   000   0000000  000   000  00000000  0000000
 */
var $, Kachel, _, elem, post, prefs, ref, scheme, win,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, scheme = ref.scheme, prefs = ref.prefs, elem = ref.elem, win = ref.win, $ = ref.$, _ = ref._;

Kachel = (function(superClass) {
    extend(Kachel, superClass);

    function Kachel(arg) {
        var bounds, ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : null;
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
        console.log(prefs.get("bounds:" + this.kachelId));
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
        }
    };

    Kachel.prototype.onCombo = function(combo, info) {
        switch (combo) {
            case 'left':
            case 'right':
            case 'up':
            case 'down':
                return post.toMain('focusKachel', this.id, combo);
        }
    };

    return Kachel;

})(win);

module.exports = Kachel;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2FjaGVsLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxpREFBQTtJQUFBOzs7O0FBUUEsTUFBMkMsT0FBQSxDQUFRLEtBQVIsQ0FBM0MsRUFBRSxlQUFGLEVBQVEsbUJBQVIsRUFBZ0IsaUJBQWhCLEVBQXVCLGVBQXZCLEVBQTZCLGFBQTdCLEVBQWtDLFNBQWxDLEVBQXFDOztBQUUvQjs7O0lBRUMsZ0JBQUMsR0FBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsa0RBQU87Ozs7Ozs7Ozs7UUFFUix3Q0FDSTtZQUFBLEdBQUEsRUFBUSxTQUFSO1lBQ0EsR0FBQSxFQUFRLE9BQUEsQ0FBUSxpQkFBUixDQURSO1lBRUEsSUFBQSxFQUFRLHFCQUZSO1lBR0EsTUFBQSxFQUFRLElBQUMsQ0FBQSxTQUhUO1NBREo7UUFNQSxJQUFDLENBQUEsSUFBRCxHQUFPLENBQUEsQ0FBRSxPQUFGO1FBQ1AsSUFBQyxDQUFBLEtBQUQsR0FBUztRQUVULElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLE1BQVIsRUFBZ0IsSUFBQyxDQUFBLFNBQWpCO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFMLENBQVEsTUFBUixFQUFnQixJQUFDLENBQUEsU0FBakI7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxPQUFSLEVBQWdCLElBQUMsQ0FBQSxVQUFqQjtRQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLE1BQVIsRUFBZ0IsSUFBQyxDQUFBLFNBQWpCO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFMLENBQVEsT0FBUixFQUFnQixJQUFDLENBQUEsVUFBakI7UUFFQSxJQUFDLENBQUEsSUFBSSxDQUFDLGdCQUFOLENBQXVCLFdBQXZCLEVBQW1DLElBQUMsQ0FBQSxXQUFwQztRQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsZ0JBQU4sQ0FBdUIsU0FB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QkFDVCxPQUFBLEdBQVMsU0FBQSxHQUFBOztxQkFRVCxZQUFBLEdBQWMsU0FBQyxNQUFEO0FBRVYsZ0JBQU8sTUFBUDtBQUFBLGlCQUNTLEtBRFQ7dUJBQ3VCLElBQUksQ0FBQyxNQUFMLENBQVksV0FBWixFQUF5QixFQUF6QjtBQUR2QixpQkFFUyxPQUZUO3VCQUV1QixJQUFDLENBQUEsR0FBRyxDQUFDLEtBQUwsQ0FBQTtBQUZ2QixpQkFHUyxNQUhUO3VCQUd1QixJQUFJLENBQUMsTUFBTCxDQUFZLE1BQVo7QUFIdkIsaUJBSVMsUUFKVDt1QkFJdUIsSUFBSSxDQUFDLE1BQUwsQ0FBWSxjQUFaO0FBSnZCO0lBRlU7O3FCQWNkLE9BQUEsR0FBUyxTQUFDLEtBQUQsRUFBUSxJQUFSO0FBRUwsZ0JBQU8sS0FBUDtBQUFBLGlCQUNTLE1BRFQ7QUFBQSxpQkFDZSxPQURmO0FBQUEsaUJBQ3NCLElBRHRCO0FBQUEsaUJBQzBCLE1BRDFCO3VCQUNzQyxJQUFJLENBQUMsTUFBTCxDQUFZLGFBQVosRUFBMkIsSUFBQyxDQUFBLEVBQTVCLEVBQWdDLEtBQWhDO0FBRHRDO0lBRks7Ozs7R0ExRVE7O0FBK0VyQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAgICAgIFxuMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIFxuMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgIFxuMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuIyMjXG5cbnsgcG9zdCwgc2NoZW1lLCBwcmVmcywgZWxlbSwgd2luLCAkLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbmNsYXNzIEthY2hlbCBleHRlbmRzIHdpblxuXG4gICAgQDogKEBrYWNoZWxJZDopIC0+XG4gICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICAgICAgZGlyOiAgICBfX2Rpcm5hbWVcbiAgICAgICAgICAgIHBrZzogICAgcmVxdWlyZSAnLi4vcGFja2FnZS5qc29uJ1xuICAgICAgICAgICAgbWVudTogICAnLi4vY29mZmVlL21lbnUubm9vbidcbiAgICAgICAgICAgIG9uTG9hZDogQG9uV2luTG9hZFxuICAgIFxuICAgICAgICBAbWFpbiA9JCAnI21haW4nXG4gICAgICAgIEBtb3ZlZCA9IGZhbHNlXG4gICAgICAgIFxuICAgICAgICBAd2luLm9uICdtb3ZlJyAgQG9uV2luTW92ZVxuICAgICAgICBAd2luLm9uICdibHVyJyAgQG9uV2luQmx1clxuICAgICAgICBAd2luLm9uICdmb2N1cycgQG9uV2luRm9jdXNcbiAgICAgICAgQHdpbi5vbiAnbW92ZScgIEBvbldpbk1vdmVcbiAgICAgICAgQHdpbi5vbiAnY2xvc2UnIEBvbldpbkNsb3NlXG4gICAgICAgIFxuICAgICAgICBAbWFpbi5hZGRFdmVudExpc3RlbmVyICdtb3VzZWRvd24nIEBvbk1vdXNlRG93blxuICAgICAgICBAbWFpbi5hZGRFdmVudExpc3RlbmVyICdtb3VzZXVwJyAgIEBvbk1vdXNlVXBcbiAgICAgICAgXG4gICAgICAgIHBvc3Qub24gJ2NvbWJvJyBAb25Db21ib1xuICAgICAgICBwb3N0Lm9uICd0b2dnbGVTY2hlbWUnIC0+IHNjaGVtZS50b2dnbGUoKVxuICAgICAgICBcbiAgICAgICAgaWYgQGthY2hlbElkICE9ICdtYWluJ1xuICAgICAgICAgICAgcHJlZnMuc2V0IFwia2FjaGVsbjoje0BrYWNoZWxJZH1cIiBAa2FjaGVsRGF0YSgpXG4gICAgICAgIFxuICAgICAgICBib3VuZHMgPSBwcmVmcy5nZXQgXCJib3VuZHM6I3tAa2FjaGVsSWR9XCJcbiAgICAgICAgaWYgYm91bmRzP1xuICAgICAgICAgICAgQHdpbi5zZXRQb3NpdGlvbiBib3VuZHMueCwgYm91bmRzLnkgXG4gICAgXG4gICAga2FjaGVsRGF0YTogLT4gaHRtbDpAa2FjaGVsSWRcbiAgICAgICAgICAgIFxuICAgIG9uTW91c2VEb3duOiAoZXZlbnQpID0+IEBtb3ZlZCA9IGZhbHNlXG4gICAgb25Nb3VzZVVwOiAgIChldmVudCkgPT4gaWYgbm90IEBtb3ZlZCB0aGVuIEBvbkNsaWNrKClcbiAgICBvbldpbk1vdmU6ICAgKGV2ZW50KSA9PiBAbW92ZWQgPSB0cnVlOyBAb25Nb3ZlIGV2ZW50XG4gICAgb25XaW5Gb2N1czogIChldmVudCkgPT4gZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkICAgICdrYWNoZWxGb2N1cyc7IEBtYWluLmNsYXNzTGlzdC5hZGQgICAgJ2thY2hlbEZvY3VzJzsgQG9uRm9jdXMgZXZlbnRcbiAgICBvbldpbkJsdXI6ICAgKGV2ZW50KSA9PiBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUgJ2thY2hlbEZvY3VzJzsgQG1haW4uY2xhc3NMaXN0LnJlbW92ZSAna2FjaGVsRm9jdXMnOyBAb25CbHVyICBldmVudFxuICAgIG9uV2luTW92ZTogICAoZXZlbnQpID0+IHByZWZzLnNldCBcImJvdW5kczoje0BrYWNoZWxJZH1cIiwgQHdpbi5nZXRCb3VuZHMoKTsgbG9nIHByZWZzLmdldCBcImJvdW5kczoje0BrYWNoZWxJZH1cIjsgQG9uTW92ZSBldmVudFxuICAgIG9uV2luTG9hZDogICAoZXZlbnQpID0+IHByZWZzLnNldCBcImJvdW5kczoje0BrYWNoZWxJZH1cIiwgQHdpbi5nZXRCb3VuZHMoKTsgQG9uTG9hZCAgZXZlbnRcbiAgICBvbldpbkNsb3NlOiAgKGV2ZW50KSA9PiBcbiAgICAgICAgaWYgQGthY2hlbElkICE9ICdtYWluJ1xuICAgICAgICAgICAgcHJlZnMuZGVsIFwia2FjaGVsbjoje0BrYWNoZWxJZH1cIiBcbiAgICAgICAgQG9uQ2xvc2UgZXZlbnRcbiAgICBcbiAgICBvbkxvYWQ6ICAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uTW92ZTogIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25DbGljazogLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvbkZvY3VzOiAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uQmx1cjogIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25Nb3ZlOiAgLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvbkNsb3NlOiAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwIFxuICAgIFxuICAgIG9uTWVudUFjdGlvbjogKGFjdGlvbikgPT5cbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBhY3Rpb25cbiAgICAgICAgICAgIHdoZW4gJ05ldycgICAgdGhlbiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJywge31cbiAgICAgICAgICAgIHdoZW4gJ0Nsb3NlJyAgdGhlbiBAd2luLmNsb3NlKClcbiAgICAgICAgICAgIHdoZW4gJ1F1aXQnICAgdGhlbiBwb3N0LnRvTWFpbiAncXVpdCdcbiAgICAgICAgICAgIHdoZW4gJ1NjaGVtZScgdGhlbiBwb3N0LnRvV2lucyAndG9nZ2xlU2NoZW1lJ1xuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIG9uQ29tYm86IChjb21ibywgaW5mbykgLT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgc3dpdGNoIGNvbWJvXG4gICAgICAgICAgICB3aGVuICdsZWZ0JydyaWdodCcndXAnJ2Rvd24nIHRoZW4gcG9zdC50b01haW4gJ2ZvY3VzS2FjaGVsJywgQGlkLCBjb21ib1xuICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEthY2hlbFxuIl19
//# sourceURL=../coffee/kachel.coffee
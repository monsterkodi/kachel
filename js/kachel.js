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
            this.win.setPosition(bounds.x, bounds.y);
        }
    }

    Kachel.prototype.kachelData = function() {
        return {
            html: this.kachelId
        };
    };

    Kachel.prototype.onSaveBounds = function() {
        klog("" + this.kachelId, this.win.getBounds().x);
        return prefs.set("bounds:" + this.kachelId, this.win.getBounds());
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
        this.onSaveBounds();
        return this.onMove(event);
    };

    Kachel.prototype.onWinLoad = function(event) {
        this.onSaveBounds();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2FjaGVsLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwyREFBQTtJQUFBOzs7O0FBUUEsTUFBcUQsT0FBQSxDQUFRLEtBQVIsQ0FBckQsRUFBRSxlQUFGLEVBQVEsbUJBQVIsRUFBZ0IsaUJBQWhCLEVBQXVCLGlCQUF2QixFQUE4QixlQUE5QixFQUFvQyxlQUFwQyxFQUEwQyxhQUExQyxFQUErQzs7QUFFekM7OztJQUVDLGdCQUFDLEdBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLGtEQUFTOzs7Ozs7Ozs7Ozs7O1FBRVYsd0NBQ0k7WUFBQSxHQUFBLEVBQVEsU0FBUjtZQUNBLEdBQUEsRUFBUSxPQUFBLENBQVEsaUJBQVIsQ0FEUjtZQUVBLElBQUEsRUFBUSxxQkFGUjtZQUdBLE1BQUEsRUFBUSxJQUFDLENBQUEsU0FIVDtTQURKO1FBTUEsSUFBQyxDQUFBLElBQUQsR0FBTyxDQUFBLENBQUUsT0FBRjtRQUNQLElBQUMsQ0FBQSxLQUFELEdBQVM7UUFFVCxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxNQUFSLEVBQWdCLElBQUMsQ0FBQSxTQUFqQjtRQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLE1BQVIsRUFBZ0IsSUFBQyxDQUFBLFNBQWpCO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFMLENBQVEsT0FBUixFQUFnQixJQUFDLENBQUEsVUFBakI7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxNQUFSLEVBQWdCLElBQUMsQ0FBQSxTQUFqQjtRQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLE9BQVIsRUFBZ0IsSUFBQyxDQUFBLFVBQWpCO1FBRUEsSUFBQyxDQUFBLElBQUksQ0FBQyxnQkFBTixDQUF1QixXQUF2QixFQUFtQyxJQUFDLENBQUEsV0FBcEM7UUFDQSxJQUFDLENBQUEsSUFBSSxDQUFD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QUZ4QixpQkFHUyxNQUhUO3VCQUd3QixJQUFJLENBQUMsTUFBTCxDQUFZLE1BQVo7QUFIeEIsaUJBSVMsUUFKVDt1QkFJd0IsSUFBSSxDQUFDLE1BQUwsQ0FBWSxjQUFaO0FBSnhCLGlCQUtTLFNBTFQ7dUJBS3dCLElBQUksQ0FBQyxNQUFMLENBQVksU0FBWjtBQUx4QjtJQURVOztxQkFjZCxPQUFBLEdBQVMsU0FBQyxLQUFELEVBQVEsSUFBUjtBQUVMLGdCQUFPLEtBQVA7QUFBQSxpQkFDUyxNQURUO0FBQUEsaUJBQ2UsT0FEZjtBQUFBLGlCQUNzQixJQUR0QjtBQUFBLGlCQUMwQixNQUQxQjt1QkFDc0MsSUFBSSxDQUFDLE1BQUwsQ0FBWSxhQUFaLEVBQTBCLElBQUMsQ0FBQSxFQUEzQixFQUErQixLQUEvQjtBQUR0QyxpQkFFUyxPQUZUO0FBQUEsaUJBRWdCLE9BRmhCO3VCQUU2QixJQUFDLENBQUEsT0FBRCxDQUFBO0FBRjdCO0lBRks7Ozs7R0EzRlE7O0FBaUdyQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAgICAgIFxuMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIFxuMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgIFxuMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuIyMjXG5cbnsgcG9zdCwgc2NoZW1lLCBwcmVmcywgc2xhc2gsIGtsb2csIGVsZW0sIHdpbiwgJCB9ID0gcmVxdWlyZSAna3hrJ1xuXG5jbGFzcyBLYWNoZWwgZXh0ZW5kcyB3aW5cblxuICAgIEA6IChAa2FjaGVsSWQ6J2thY2hlbCcpIC0+XG4gICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICAgICAgZGlyOiAgICBfX2Rpcm5hbWVcbiAgICAgICAgICAgIHBrZzogICAgcmVxdWlyZSAnLi4vcGFja2FnZS5qc29uJ1xuICAgICAgICAgICAgbWVudTogICAnLi4vY29mZmVlL21lbnUubm9vbidcbiAgICAgICAgICAgIG9uTG9hZDogQG9uV2luTG9hZFxuICAgIFxuICAgICAgICBAbWFpbiA9JCAnI21haW4nXG4gICAgICAgIEBtb3ZlZCA9IGZhbHNlXG4gICAgICAgIFxuICAgICAgICBAd2luLm9uICdtb3ZlJyAgQG9uV2luTW92ZVxuICAgICAgICBAd2luLm9uICdibHVyJyAgQG9uV2luQmx1clxuICAgICAgICBAd2luLm9uICdmb2N1cycgQG9uV2luRm9jdXNcbiAgICAgICAgQHdpbi5vbiAnbW92ZScgIEBvbldpbk1vdmVcbiAgICAgICAgQHdpbi5vbiAnY2xvc2UnIEBvbldpbkNsb3NlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBtYWluLmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNlZG93bicgQG9uTW91c2VEb3duXG4gICAgICAgIEBtYWluLmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNldXAnICAgQG9uTW91c2VVcFxuICAgICAgICBcbiAgICAgICAgcG9zdC5vbiAnaW5pdERhdGEnICAgQG9uSW5pdERhdGFcbiAgICAgICAgcG9zdC5vbiAnc2F2ZUJvdW5kcycgQG9uU2F2ZUJvdW5kc1xuICAgICAgICBwb3N0Lm9uICdjb21ibycgQG9uQ29tYm9cbiAgICAgICAgcG9zdC5vbiAndG9nZ2xlU2NoZW1lJyAtPiBzY2hlbWUudG9nZ2xlKClcbiAgICAgICAgXG4gICAgICAgIGlmIEBrYWNoZWxJZCAhPSAnbWFpbidcbiAgICAgICAgICAgIEB3aW4uc2V0U2tpcFRhc2tiYXIgdHJ1ZVxuICAgICAgICAgICAgcHJlZnMuc2V0IFwia2FjaGVsbjoje0BrYWNoZWxJZH1cIiBAa2FjaGVsRGF0YSgpXG4gICAgICAgIFxuICAgICAgICBib3VuZHMgPSBwcmVmcy5nZXQgXCJib3VuZHM6I3tAa2FjaGVsSWR9XCJcbiAgICAgICAgaWYgYm91bmRzP1xuICAgICAgICAgICAgQHdpbi5zZXRQb3NpdGlvbiBib3VuZHMueCwgYm91bmRzLnlcbiAgICBcbiAgICBrYWNoZWxEYXRhOiAtPiBodG1sOkBrYWNoZWxJZFxuICAgICAgXG4gICAgb25TYXZlQm91bmRzOiAgICAgICAgPT4ga2xvZyBcIiN7QGthY2hlbElkfVwiLCBAd2luLmdldEJvdW5kcygpLng7IHByZWZzLnNldCBcImJvdW5kczoje0BrYWNoZWxJZH1cIiwgQHdpbi5nZXRCb3VuZHMoKVxuICAgIG9uTW91c2VEb3duOiAoZXZlbnQpID0+IEBtb3ZlZCA9IGZhbHNlXG4gICAgb25Nb3VzZVVwOiAgIChldmVudCkgPT4gaWYgbm90IEBtb3ZlZCB0aGVuIEBvbkNsaWNrKClcbiAgICBvbldpbk1vdmU6ICAgKGV2ZW50KSA9PiBAbW92ZWQgPSB0cnVlOyBAb25Nb3ZlIGV2ZW50XG4gICAgb25XaW5Gb2N1czogIChldmVudCkgPT4gZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkICAgICdrYWNoZWxGb2N1cyc7IEBtYWluLmNsYXNzTGlzdC5hZGQgICAgJ2thY2hlbEZvY3VzJzsgQG9uRm9jdXMgZXZlbnRcbiAgICBvbldpbkJsdXI6ICAgKGV2ZW50KSA9PiBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUgJ2thY2hlbEZvY3VzJzsgQG1haW4uY2xhc3NMaXN0LnJlbW92ZSAna2FjaGVsRm9jdXMnOyBAb25CbHVyICBldmVudFxuICAgIG9uV2luTW92ZTogICAoZXZlbnQpID0+IEBvblNhdmVCb3VuZHMoKTsgQG9uTW92ZSBldmVudFxuICAgIG9uV2luTG9hZDogICAoZXZlbnQpID0+IEBvblNhdmVCb3VuZHMoKTsgQG9uTG9hZCBldmVudFxuICAgIG9uV2luQ2xvc2U6ICAoZXZlbnQpID0+IFxuICAgICAgICBpZiBAa2FjaGVsSWQgIT0gJ21haW4nXG4gICAgICAgICAgICBwcmVmcy5kZWwgXCJrYWNoZWxuOiN7QGthY2hlbElkfVwiIFxuICAgICAgICBAb25DbG9zZSBldmVudFxuICAgICAgICBcbiAgICBvbkluaXREYXRhOiAgKGRhdGEpID0+XG5cbiAgICAgICAgQGluZGV4UGF0aCA9IGRhdGEuaW5kZXhcbiAgICAgICAgQGthY2hlbElkID0gJ2thY2hlbCcrQGluZGV4UGF0aFxuICAgICAgICBwcmVmcy5zZXQgXCJrYWNoZWxuOiN7QGthY2hlbElkfTpkYXRhOmluZGV4XCIgQGluZGV4UGF0aFxuICAgICAgICBwcmVmcy5zZXQgXCJrYWNoZWxuOiN7QGthY2hlbElkfTpodG1sXCIgJ2thY2hlbCdcbiAgICBcbiAgICAgICAgQHdpbi5sb2FkVVJMIHNsYXNoLmZpbGVVcmwgc2xhc2guam9pbiBfX2Rpcm5hbWUsIEBpbmRleFBhdGhcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgYm91bmRzID0gcHJlZnMuZ2V0IFwiYm91bmRzOiN7QGthY2hlbElkfVwiXG4gICAgICAgIGlmIGJvdW5kcz9cbiAgICAgICAgICAgIEB3aW4uc2V0UG9zaXRpb24gYm91bmRzLngsIGJvdW5kcy55XG4gICAgXG4gICAgb25Mb2FkOiAgLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvbk1vdmU6ICAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uQ2xpY2s6IC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25Gb2N1czogLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICBvbkJsdXI6ICAtPiAjIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3ViY2xhc3Nlc1xuICAgIG9uTW92ZTogIC0+ICMgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJjbGFzc2VzXG4gICAgb25DbG9zZTogLT4gIyB0byBiZSBvdmVycmlkZGVuIGluIHN1YmNsYXNzZXNcbiAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCBcbiAgICBcbiAgICBvbk1lbnVBY3Rpb246IChhY3Rpb24pID0+XG4gICAgICAgIHN3aXRjaCBhY3Rpb25cbiAgICAgICAgICAgIHdoZW4gJ05ldycgICAgIHRoZW4gcG9zdC50b01haW4gJ25ld0thY2hlbCcsIHt9XG4gICAgICAgICAgICB3aGVuICdDbG9zZScgICB0aGVuIEB3aW4uY2xvc2UoKVxuICAgICAgICAgICAgd2hlbiAnUXVpdCcgICAgdGhlbiBwb3N0LnRvTWFpbiAncXVpdCdcbiAgICAgICAgICAgIHdoZW4gJ1NjaGVtZScgIHRoZW4gcG9zdC50b1dpbnMgJ3RvZ2dsZVNjaGVtZSdcbiAgICAgICAgICAgIHdoZW4gJ0FycmFuZ2UnIHRoZW4gcG9zdC50b01haW4gJ2FycmFuZ2UnXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgb25Db21ibzogKGNvbWJvLCBpbmZvKSA9PlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBzd2l0Y2ggY29tYm9cbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnJ3JpZ2h0Jyd1cCcnZG93bicgdGhlbiBwb3N0LnRvTWFpbiAnZm9jdXNLYWNoZWwnIEBpZCwgY29tYm9cbiAgICAgICAgICAgIHdoZW4gJ2VudGVyJydzcGFjZScgdGhlbiBAb25DbGljaygpXG4gICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gS2FjaGVsXG4iXX0=
//# sourceURL=../coffee/kachel.coffee
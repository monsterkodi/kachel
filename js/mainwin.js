// koffee 1.4.0

/*
00     00   0000000   000  000   000  000   000  000  000   000
000   000  000   000  000  0000  000  000 0 000  000  0000  000
000000000  000000000  000  000 0 000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000  000   000  000  000  0000
000   000  000   000  000  000   000  00     00  000  000   000
 */
var $, Kachel, MainWin, _, elem, klog, post, ref, stopEvent,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, stopEvent = ref.stopEvent, klog = ref.klog, elem = ref.elem, $ = ref.$, _ = ref._;

Kachel = require('./kachel');

MainWin = (function(superClass) {
    extend(MainWin, superClass);

    function MainWin(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'main';
        this.onShowDot = bind(this.onShowDot, this);
        this.onContextMenu = bind(this.onContextMenu, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); MainWin.__super__.constructor.apply(this, arguments);
        post.on('showDot', this.onShowDot);
        this.win.on('close', function(event) {
            return stopEvent(event);
        });
        window.onbeforeunload = (function(_this) {
            return function(e) {
                return e.returnValue = false;
            };
        })(this);
    }

    MainWin.prototype.onLoad = function() {
        return this.main.appendChild(elem('img', {
            "class": 'kachelImg',
            src: __dirname + '/../img/about.png'
        }));
    };

    MainWin.prototype.onClick = function() {
        return post.toMain('newKachel', 'default');
    };

    MainWin.prototype.onContextMenu = function() {
        return post.toMain('raiseKacheln');
    };

    MainWin.prototype.onShowDot = function(show) {
        var dot, img;
        dot = $('.appldot');
        img = $('.kachelImg');
        img.classList.toggle('inactive', !show);
        if (show && !dot) {
            dot = elem({
                "class": 'appldot top'
            });
            return this.main.appendChild(dot);
        } else if (!show && dot) {
            if (dot != null) {
                dot.remove();
            }
            return dot = null;
        }
    };

    return MainWin;

})(Kachel);

module.exports = MainWin;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbndpbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsdURBQUE7SUFBQTs7OztBQVFBLE1BQXdDLE9BQUEsQ0FBUSxLQUFSLENBQXhDLEVBQUUsZUFBRixFQUFRLHlCQUFSLEVBQW1CLGVBQW5CLEVBQXlCLGVBQXpCLEVBQStCLFNBQS9CLEVBQWtDOztBQUVsQyxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0FBRUg7OztJQUVDLGlCQUFDLEdBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLGtEQUFTOzs7UUFFViw2R0FBQSxTQUFBO1FBRUEsSUFBSSxDQUFDLEVBQUwsQ0FBUSxTQUFSLEVBQWtCLElBQUMsQ0FBQSxTQUFuQjtRQUVBLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLE9BQVIsRUFBZ0IsU0FBQyxLQUFEO21CQUFXLFNBQUEsQ0FBVSxLQUFWO1FBQVgsQ0FBaEI7UUFFQSxNQUFNLENBQUMsY0FBUCxHQUF3QixDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFDLENBQUQ7dUJBQU8sQ0FBQyxDQUFDLFdBQUYsR0FBZ0I7WUFBdkI7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO0lBUnpCOztzQkFVSCxNQUFBLEdBQVEsU0FBQTtlQUFHLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixJQUFBLENBQUssS0FBTCxFQUFZO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxXQUFOO1lBQWtCLEdBQUEsRUFBSSxTQUFBLEdBQVksbUJBQWxDO1NBQVosQ0FBbEI7SUFBSDs7c0JBRVIsT0FBQSxHQUFTLFNBQUE7ZUFBRyxJQUFJLENBQUMsTUFBTCxDQUFZLFdBQVosRUFBd0IsU0FBeEI7SUFBSDs7c0JBRVQsYUFBQSxHQUFlLFNBQUE7ZUFBRyxJQUFJLENBQUMsTUFBTCxDQUFZLGNBQVo7SUFBSDs7c0JBUWYsU0FBQSxHQUFXLFNBQUMsSUFBRDtBQUVQLFlBQUE7UUFBQSxHQUFBLEdBQUssQ0FBQSxDQUFFLFVBQUY7UUFFTCxHQUFBLEdBQUssQ0FBQSxDQUFFLFlBQUY7UUFDTCxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQWQsQ0FBcUIsVUFBckIsRUFBZ0MsQ0FBSSxJQUFwQztRQUVBLElBQUcsSUFBQSxJQUFTLENBQUksR0FBaEI7WUFDSSxHQUFBLEdBQU0sSUFBQSxDQUFLO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sYUFBTjthQUFMO21CQUNOLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixHQUFsQixFQUZKO1NBQUEsTUFHSyxJQUFHLENBQUksSUFBSixJQUFhLEdBQWhCOztnQkFDRCxHQUFHLENBQUUsTUFBTCxDQUFBOzttQkFDQSxHQUFBLEdBQU0sS0FGTDs7SUFWRTs7OztHQXhCTzs7QUFzQ3RCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMFxuMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwXG4wMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgcG9zdCwgc3RvcEV2ZW50LCBrbG9nLCBlbGVtLCAkLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbkthY2hlbCA9IHJlcXVpcmUgJy4va2FjaGVsJ1xuXG5jbGFzcyBNYWluV2luIGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J21haW4nKSAtPiBcbiAgICAgICAgXG4gICAgICAgIHN1cGVyXG4gICAgICAgIFxuICAgICAgICBwb3N0Lm9uICdzaG93RG90JyBAb25TaG93RG90XG4gICAgICAgIFxuICAgICAgICBAd2luLm9uICdjbG9zZScgKGV2ZW50KSAtPiBzdG9wRXZlbnQgZXZlbnRcbiAgICAgICAgXG4gICAgICAgIHdpbmRvdy5vbmJlZm9yZXVubG9hZCA9IChlKSA9PiBlLnJldHVyblZhbHVlID0gZmFsc2VcbiAgICBcbiAgICBvbkxvYWQ6IC0+IEBtYWluLmFwcGVuZENoaWxkIGVsZW0gJ2ltZycsIGNsYXNzOidrYWNoZWxJbWcnIHNyYzpfX2Rpcm5hbWUgKyAnLy4uL2ltZy9hYm91dC5wbmcnICAgIFxuICAgICAgICBcbiAgICBvbkNsaWNrOiAtPiBwb3N0LnRvTWFpbiAnbmV3S2FjaGVsJyAnZGVmYXVsdCdcbiAgICBcbiAgICBvbkNvbnRleHRNZW51OiA9PiBwb3N0LnRvTWFpbiAncmFpc2VLYWNoZWxuJ1xuXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuICAgICAgICAgICAgXG4gICAgb25TaG93RG90OiAoc2hvdykgPT5cbiAgICAgICAgXG4gICAgICAgIGRvdCA9JCAnLmFwcGxkb3QnXG4gICAgICAgIFxuICAgICAgICBpbWcgPSQgJy5rYWNoZWxJbWcnXG4gICAgICAgIGltZy5jbGFzc0xpc3QudG9nZ2xlICdpbmFjdGl2ZScgbm90IHNob3dcbiAgICAgICAgXG4gICAgICAgIGlmIHNob3cgYW5kIG5vdCBkb3RcbiAgICAgICAgICAgIGRvdCA9IGVsZW0gY2xhc3M6J2FwcGxkb3QgdG9wJ1xuICAgICAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgZG90XG4gICAgICAgIGVsc2UgaWYgbm90IHNob3cgYW5kIGRvdFxuICAgICAgICAgICAgZG90Py5yZW1vdmUoKVxuICAgICAgICAgICAgZG90ID0gbnVsbFxuICAgIFxubW9kdWxlLmV4cG9ydHMgPSBNYWluV2luXG4iXX0=
//# sourceURL=../coffee/mainwin.coffee
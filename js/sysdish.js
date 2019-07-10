// koffee 1.3.0

/*
 0000000  000   000   0000000  0000000    000   0000000  000   000  
000        000 000   000       000   000  000  000       000   000  
0000000     00000    0000000   000   000  000  0000000   000000000  
     000     000          000  000   000  000       000  000   000  
0000000      000     0000000   0000000    000  0000000   000   000
 */
var Kachel, Sysdish, _, elem, post, ref, utils,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, elem = ref.elem, _ = ref._;

utils = require('./utils');

Kachel = require('./kachel');

Sysdish = (function(superClass) {
    extend(Sysdish, superClass);

    function Sysdish(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'sysdish';
        this.rx_max = 0;
        this.tx_max = 0;
        this.r_max = 0;
        this.w_max = 0;
        post.toMain('requestData', 'sysinfo');
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Sysdish.__super__.constructor.apply(this, arguments);
    }

    Sysdish.prototype.onLoad = function() {
        var info;
        info = (function(_this) {
            return function() {
                var data, pie, r_sec, rx_sec, svg, tx_sec, w_sec;
                if (data = post.get('getData', 'sysinfo')) {
                    _this.main.innerHTML = '';
                    svg = utils.svg({
                        clss: 'clock'
                    });
                    _this.main.appendChild(svg);
                    if (data.disksIO != null) {
                        r_sec = data.disksIO.rIO_sec;
                        w_sec = data.disksIO.wIO_sec;
                        _this.r_max = Math.max(_this.r_max, r_sec);
                        _this.w_max = Math.max(_this.w_max, w_sec);
                        pie = utils.circle({
                            clss: 'sysinfo_disk_bgr',
                            svg: svg
                        });
                        utils.pie({
                            svg: pie,
                            clss: 'sysinfo_disk_read',
                            angle: 180 * r_sec / _this.r_max
                        });
                        utils.pie({
                            svg: pie,
                            clss: 'sysinfo_disk_write',
                            angle: 180 * w_sec / _this.w_max,
                            start: 180
                        });
                    }
                    rx_sec = data.networkStats[0].rx_sec;
                    tx_sec = data.networkStats[0].tx_sec;
                    _this.rx_max = Math.max(_this.rx_max, rx_sec);
                    _this.tx_max = Math.max(_this.tx_max, tx_sec);
                    pie = utils.circle({
                        radius: 47,
                        clss: 'sysinfo_net_bgr',
                        svg: svg
                    });
                    utils.pie({
                        svg: pie,
                        radius: 47,
                        clss: 'sysinfo_net_recv',
                        angle: 180 * rx_sec / _this.rx_max
                    });
                    utils.pie({
                        svg: pie,
                        radius: 47,
                        clss: 'sysinfo_net_send',
                        angle: 180 * tx_sec / _this.tx_max,
                        start: 180
                    });
                    pie = utils.circle({
                        radius: 44,
                        clss: 'sysinfo_load_bgr',
                        svg: svg
                    });
                    utils.pie({
                        svg: pie,
                        radius: 44,
                        clss: 'sysinfo_load_sys',
                        angle: 360 * data.currentLoad.currentload / 100
                    });
                    utils.pie({
                        svg: pie,
                        radius: 44,
                        clss: 'sysinfo_load_usr',
                        angle: 360 * data.currentLoad.currentload_user / 100
                    });
                    pie = utils.circle({
                        radius: 18,
                        clss: 'sysinfo_mem_bgr',
                        svg: svg
                    });
                    utils.pie({
                        svg: pie,
                        radius: 18,
                        clss: 'sysinfo_mem_used',
                        angle: 360 * data.mem.used / data.mem.total
                    });
                    return utils.pie({
                        svg: pie,
                        radius: 18,
                        clss: 'sysinfo_mem_active',
                        angle: 360 * data.mem.active / data.mem.total
                    });
                }
            };
        })(this);
        return setInterval(info, 1000);
    };

    return Sysdish;

})(Kachel);

module.exports = Sysdish;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzZGlzaC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsMENBQUE7SUFBQTs7O0FBUUEsTUFBb0IsT0FBQSxDQUFRLEtBQVIsQ0FBcEIsRUFBRSxlQUFGLEVBQVEsZUFBUixFQUFjOztBQUVkLEtBQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7QUFDVixNQUFBLEdBQVUsT0FBQSxDQUFRLFVBQVI7O0FBRUo7OztJQUVDLGlCQUFDLEdBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLGtEQUFTO1FBRVYsSUFBQyxDQUFBLE1BQUQsR0FBVTtRQUNWLElBQUMsQ0FBQSxNQUFELEdBQVU7UUFFVixJQUFDLENBQUEsS0FBRCxHQUFTO1FBQ1QsSUFBQyxDQUFBLEtBQUQsR0FBUztRQUVULElBQUksQ0FBQyxNQUFMLENBQVksYUFBWixFQUEwQixTQUExQjtRQUVBLDZHQUFBLFNBQUE7SUFWRDs7c0JBWUgsTUFBQSxHQUFRLFNBQUE7QUFFSixZQUFBO1FBQUEsSUFBQSxHQUFPLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUE7QUFFSCxvQkFBQTtnQkFBQSxJQUFHLElBQUEsR0FBTyxJQUFJLENBQUMsR0FBTCxDQUFTLFNBQVQsRUFBbUIsU0FBbkIsQ0FBVjtvQkFFSSxLQUFDLENBQUEsSUFBSSxDQUFDLFNBQU4sR0FBa0I7b0JBQ2xCLEdBQUEsR0FBTSxLQUFLLENBQUMsR0FBTixDQUFVO3dCQUFBLElBQUEsRUFBSyxPQUFMO3FCQUFWO29CQUNOLEtBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixHQUFsQjtvQkFRQSxJQUFHLG9CQUFIO3dCQUVJLEtBQUEsR0FBUSxJQUFJLENBQUMsT0FBTyxDQUFDO3dCQUNyQixLQUFBLEdBQVEsSUFBSSxDQUFDLE9BQU8sQ0FBQzt3QkFFckIsS0FBQyxDQUFBLEtBQUQsR0FBUyxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQUMsQ0FBQSxL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TSxHQUFBLEdBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFiLEdBQWtCLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBOUU7cUJBQVY7MkJBQ0EsS0FBSyxDQUFDLEdBQU4sQ0FBVTt3QkFBQSxHQUFBLEVBQUksR0FBSjt3QkFBUyxNQUFBLEVBQU8sRUFBaEI7d0JBQW1CLElBQUEsRUFBSyxvQkFBeEI7d0JBQTZDLEtBQUEsRUFBTSxHQUFBLEdBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFiLEdBQW9CLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBaEY7cUJBQVYsRUExREo7O1lBRkc7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO2VBOERQLFdBQUEsQ0FBWSxJQUFaLEVBQWtCLElBQWxCO0lBaEVJOzs7O0dBZFU7O0FBZ0Z0QixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbjAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuICAgICAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jIyNcblxueyBwb3N0LCBlbGVtLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbnV0aWxzICAgPSByZXF1aXJlICcuL3V0aWxzJ1xuS2FjaGVsICA9IHJlcXVpcmUgJy4va2FjaGVsJ1xuXG5jbGFzcyBTeXNkaXNoIGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J3N5c2Rpc2gnKSAtPiBcbiAgICAgICAgXG4gICAgICAgIEByeF9tYXggPSAwXG4gICAgICAgIEB0eF9tYXggPSAwXG5cbiAgICAgICAgQHJfbWF4ID0gMFxuICAgICAgICBAd19tYXggPSAwXG4gICAgICAgIFxuICAgICAgICBwb3N0LnRvTWFpbiAncmVxdWVzdERhdGEnICdzeXNpbmZvJ1xuICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICBcbiAgICBvbkxvYWQ6IC0+XG4gICAgICAgIFxuICAgICAgICBpbmZvID0gPT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgZGF0YSA9IHBvc3QuZ2V0ICdnZXREYXRhJyAnc3lzaW5mbydcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAbWFpbi5pbm5lckhUTUwgPSAnJ1xuICAgICAgICAgICAgICAgIHN2ZyA9IHV0aWxzLnN2ZyBjbHNzOidjbG9jaydcbiAgICAgICAgICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBzdmdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIDAwMCAgIDAwMDAwMDAgICBcbiAgICAgICAgICAgICAgICAjIDAwMCAgMDAwICAgMDAwICBcbiAgICAgICAgICAgICAgICAjIDAwMCAgMDAwICAgMDAwICBcbiAgICAgICAgICAgICAgICAjIDAwMCAgMDAwICAgMDAwICBcbiAgICAgICAgICAgICAgICAjIDAwMCAgIDAwMDAwMDAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBkYXRhLmRpc2tzSU8/XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHJfc2VjID0gZGF0YS5kaXNrc0lPLnJJT19zZWNcbiAgICAgICAgICAgICAgICAgICAgd19zZWMgPSBkYXRhLmRpc2tzSU8ud0lPX3NlY1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgQHJfbWF4ID0gTWF0aC5tYXggQHJfbWF4LCByX3NlY1xuICAgICAgICAgICAgICAgICAgICBAd19tYXggPSBNYXRoLm1heCBAd19tYXgsIHdfc2VjXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBwaWUgPSB1dGlscy5jaXJjbGUgY2xzczonc3lzaW5mb19kaXNrX2Jncicgc3ZnOnN2Z1xuICAgICAgICAgICAgICAgICAgICB1dGlscy5waWUgc3ZnOnBpZSwgY2xzczonc3lzaW5mb19kaXNrX3JlYWQnICBhbmdsZToxODAqcl9zZWMvQHJfbWF4XG4gICAgICAgICAgICAgICAgICAgIHV0aWxzLnBpZSBzdmc6cGllLCBjbHNzOidzeXNpbmZvX2Rpc2tfd3JpdGUnIGFuZ2xlOjE4MCp3X3NlYy9Ad19tYXgsIHN0YXJ0OjE4MFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAwICBcbiAgICAgICAgICAgICAgICAjIDAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgICAgICAgICAgICAgIyAwMDAgMCAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuICAgICAgICAgICAgICAgICMgMDAwICAwMDAwICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAgICAgICAgICAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcnhfc2VjID0gZGF0YS5uZXR3b3JrU3RhdHNbMF0ucnhfc2VjXG4gICAgICAgICAgICAgICAgdHhfc2VjID0gZGF0YS5uZXR3b3JrU3RhdHNbMF0udHhfc2VjXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHJ4X21heCA9IE1hdGgubWF4IEByeF9tYXgsIHJ4X3NlY1xuICAgICAgICAgICAgICAgIEB0eF9tYXggPSBNYXRoLm1heCBAdHhfbWF4LCB0eF9zZWNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBwaWUgPSB1dGlscy5jaXJjbGUgcmFkaXVzOjQ3IGNsc3M6J3N5c2luZm9fbmV0X2Jncicgc3ZnOnN2Z1xuICAgICAgICAgICAgICAgIHV0aWxzLnBpZSBzdmc6cGllLCByYWRpdXM6NDcgY2xzczonc3lzaW5mb19uZXRfcmVjdicgYW5nbGU6MTgwKnJ4X3NlYy9AcnhfbWF4XG4gICAgICAgICAgICAgICAgdXRpbHMucGllIHN2ZzpwaWUsIHJhZGl1czo0NyBjbHNzOidzeXNpbmZvX25ldF9zZW5kJyBhbmdsZToxODAqdHhfc2VjL0B0eF9tYXgsIHN0YXJ0OjE4MFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICAgICAgICAgICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgICAgICAgICAgICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAgICAgICAgICAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcGllID0gdXRpbHMuY2lyY2xlIHJhZGl1czo0NCBjbHNzOidzeXNpbmZvX2xvYWRfYmdyJyBzdmc6c3ZnXG4gICAgICAgICAgICAgICAgdXRpbHMucGllIHN2ZzpwaWUsIHJhZGl1czo0NCBjbHNzOidzeXNpbmZvX2xvYWRfc3lzJyBhbmdsZTozNjAqZGF0YS5jdXJyZW50TG9hZC5jdXJyZW50bG9hZC8xMDBcbiAgICAgICAgICAgICAgICB1dGlscy5waWUgc3ZnOnBpZSwgcmFkaXVzOjQ0IGNsc3M6J3N5c2luZm9fbG9hZF91c3InIGFuZ2xlOjM2MCpkYXRhLmN1cnJlbnRMb2FkLmN1cnJlbnRsb2FkX3VzZXIvMTAwXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAgICAgIDAwICBcbiAgICAgICAgICAgICAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgICAgICAgICAgICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuICAgICAgICAgICAgICAgICMgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwIDAgMDAwICBcbiAgICAgICAgICAgICAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcGllID0gdXRpbHMuY2lyY2xlIHJhZGl1czoxOCBjbHNzOidzeXNpbmZvX21lbV9iZ3InIHN2ZzpzdmdcbiAgICAgICAgICAgICAgICB1dGlscy5waWUgc3ZnOnBpZSwgcmFkaXVzOjE4IGNsc3M6J3N5c2luZm9fbWVtX3VzZWQnICAgYW5nbGU6MzYwKmRhdGEubWVtLnVzZWQvZGF0YS5tZW0udG90YWxcbiAgICAgICAgICAgICAgICB1dGlscy5waWUgc3ZnOnBpZSwgcmFkaXVzOjE4IGNsc3M6J3N5c2luZm9fbWVtX2FjdGl2ZScgYW5nbGU6MzYwKmRhdGEubWVtLmFjdGl2ZS9kYXRhLm1lbS50b3RhbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgc2V0SW50ZXJ2YWwgaW5mbywgMTAwMFxuICAgICAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBTeXNkaXNoXG4iXX0=
//# sourceURL=../coffee/sysdish.coffee
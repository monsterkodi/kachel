// koffee 1.4.0

/*
000   000   0000000   000      000   000  00     00  00000000  
000   000  000   000  000      000   000  000   000  000       
 000 000   000   000  000      000   000  000000000  0000000   
   000     000   000  000      000   000  000 0 000  000       
    0       0000000   0000000   0000000   000   000  00000000
 */
var Kachel, Volume, _, clamp, elem, klog, kpos, os, post, ref, utils, wxw,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, clamp = ref.clamp, kpos = ref.kpos, elem = ref.elem, klog = ref.klog, os = ref.os, _ = ref._;

wxw = require('wxw');

utils = require('./utils');

Kachel = require('./kachel');

Volume = (function(superClass) {
    extend(Volume, superClass);

    function Volume(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'volume';
        this.onContextMenu = bind(this.onContextMenu, this);
        this.onWheel = bind(this.onWheel, this);
        this.onLeftClick = bind(this.onLeftClick, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Volume.__super__.constructor.apply(this, arguments);
        this.mute = false;
        this.main.addEventListener('mousewheel', this.onWheel);
        this.volume = parseInt(wxw('volume').trim());
    }

    Volume.prototype.onLeftClick = function(event) {
        var br, ctr, rot, vec;
        br = document.body.getBoundingClientRect();
        ctr = kpos(br.width, br.height).times(0.5);
        vec = ctr.to(kpos(event));
        rot = vec.normal().rotation(kpos(0, -1));
        return this.setVolume(50 + rot / 3);
    };

    Volume.prototype.onWheel = function(event) {
        var delta;
        if (event.deltaY === 0) {
            return;
        }
        if (event.deltaY > 0) {
            delta = 2;
        } else {
            delta = -3;
        }
        this.volume = clamp(0, 100, this.volume - delta);
        return this.setVolume(this.volume);
    };

    Volume.prototype.setVolume = function(v) {
        this.mute = false;
        this.volume = parseInt(wxw('volume', "" + (parseInt(clamp(0, 100, v)))).trim());
        return this.updateVolume();
    };

    Volume.prototype.onContextMenu = function(event) {
        var current;
        current = parseInt(wxw('volume').trim());
        if (this.volume === current) {
            this.mute = true;
            wxw('volume', 0);
            return this.updateVolume();
        } else {
            return this.setVolume(this.volume);
        }
    };

    Volume.prototype.onLoad = function() {
        var face, i, m, svg;
        svg = utils.svg({
            clss: 'volume'
        });
        this.main.appendChild(svg);
        face = utils.circle({
            radius: 35,
            clss: 'knob',
            svg: svg
        });
        for (m = i = 1; i <= 11; m = ++i) {
            utils.append(face, 'line', {
                "class": 'volmrk',
                y1: 40,
                y2: 47,
                transform: "rotate(" + (30 * m * 5) + ")"
            });
        }
        this.voldot = utils.append(face, 'circle', {
            r: 5,
            cx: 0,
            cy: -25,
            "class": 'voldot'
        });
        return this.updateVolume();
    };

    Volume.prototype.updateVolume = function() {
        var angle;
        angle = 150 * (this.volume - 50) / 50;
        this.voldot.setAttribute('transform', "rotate(" + angle + ")");
        return this.voldot.classList.toggle('mute', this.mute);
    };

    return Volume;

})(Kachel);

module.exports = Volume;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidm9sdW1lLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxxRUFBQTtJQUFBOzs7O0FBUUEsTUFBMkMsT0FBQSxDQUFRLEtBQVIsQ0FBM0MsRUFBRSxlQUFGLEVBQVEsaUJBQVIsRUFBZSxlQUFmLEVBQXFCLGVBQXJCLEVBQTJCLGVBQTNCLEVBQWlDLFdBQWpDLEVBQXFDOztBQUVyQyxHQUFBLEdBQVUsT0FBQSxDQUFRLEtBQVI7O0FBQ1YsS0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSOztBQUNWLE1BQUEsR0FBVSxPQUFBLENBQVEsVUFBUjs7QUFFSjs7O0lBRUMsZ0JBQUMsR0FBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsa0RBQVM7Ozs7UUFFViw0R0FBQSxTQUFBO1FBRUEsSUFBQyxDQUFBLElBQUQsR0FBUTtRQUNSLElBQUMsQ0FBQSxJQUFJLENBQUMsZ0JBQU4sQ0FBdUIsWUFBdkIsRUFBb0MsSUFBQyxDQUFBLE9BQXJDO1FBRUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxRQUFBLENBQVMsR0FBQSxDQUFJLFFBQUosQ0FBYSxDQUFDLElBQWQsQ0FBQSxDQUFUO0lBUFg7O3FCQVNILFdBQUEsR0FBYSxTQUFDLEtBQUQ7QUFFVCxZQUFBO1FBQUEsRUFBQSxHQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUMscUJBQWQsQ0FBQTtRQUNOLEdBQUEsR0FBTSxJQUFBLENBQUssRUFBRSxDQUFDLEtBQVIsRUFBZSxFQUFFLENBQUMsTUFBbEIsQ0FBeUIsQ0FBQyxLQUExQixDQUFnQyxHQUFoQztRQUNOLEdBQUEsR0FBTSxHQUFHLENBQUMsRUFBSixDQUFPLElBQUEsQ0FBSyxLQUFMLENBQVA7UUFDTixHQUFBLEdBQU0sR0FBRyxDQUFDLE1BQUosQ0FBQSxDQUFZLENBQUMsUUFBYixDQUFzQixJQUFBLENBQUssQ0FBTCxFQUFPLENBQUMsQ0FBUixDQUF0QjtlQUNOLElBQUMsQ0FB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OztBQXdFckIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICBcbiAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIFxuICAgIDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4jIyNcblxueyBwb3N0LCBjbGFtcCwga3BvcywgZWxlbSwga2xvZywgb3MsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxud3h3ICAgICA9IHJlcXVpcmUgJ3d4dydcbnV0aWxzICAgPSByZXF1aXJlICcuL3V0aWxzJ1xuS2FjaGVsICA9IHJlcXVpcmUgJy4va2FjaGVsJ1xuXG5jbGFzcyBWb2x1bWUgZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDondm9sdW1lJykgLT4gXG4gICAgXG4gICAgICAgIHN1cGVyXG4gICAgICAgIFxuICAgICAgICBAbXV0ZSA9IGZhbHNlXG4gICAgICAgIEBtYWluLmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNld2hlZWwnIEBvbldoZWVsXG4gICAgXG4gICAgICAgIEB2b2x1bWUgPSBwYXJzZUludCB3eHcoJ3ZvbHVtZScpLnRyaW0oKVxuICAgICAgICAgICAgXG4gICAgb25MZWZ0Q2xpY2s6IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIGJyICA9IGRvY3VtZW50LmJvZHkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgY3RyID0ga3Bvcyhici53aWR0aCwgYnIuaGVpZ2h0KS50aW1lcyAwLjVcbiAgICAgICAgdmVjID0gY3RyLnRvIGtwb3MgZXZlbnRcbiAgICAgICAgcm90ID0gdmVjLm5vcm1hbCgpLnJvdGF0aW9uIGtwb3MoMCwtMSlcbiAgICAgICAgQHNldFZvbHVtZSA1MCArIHJvdCAvIDNcbiAgICAgICAgXG4gICAgb25XaGVlbDogKGV2ZW50KSA9PiBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBldmVudC5kZWx0YVkgPT0gMFxuICAgICAgICBpZiBldmVudC5kZWx0YVkgPiAwIHRoZW4gZGVsdGEgPSAyIGVsc2UgZGVsdGEgPSAtM1xuICAgICAgICBcbiAgICAgICAgQHZvbHVtZSA9IGNsYW1wIDAgMTAwIEB2b2x1bWUgLSBkZWx0YVxuICAgICAgICBcbiAgICAgICAgQHNldFZvbHVtZSBAdm9sdW1lXG4gICAgXG4gICAgc2V0Vm9sdW1lOiAodikgLT5cbiAgICAgICAgXG4gICAgICAgIEBtdXRlID0gZmFsc2VcbiAgICAgICAgQHZvbHVtZSA9IHBhcnNlSW50IHd4dygndm9sdW1lJyBcIiN7cGFyc2VJbnQgY2xhbXAgMCAxMDAgdn1cIikudHJpbSgpXG4gICAgICAgIFxuICAgICAgICBAdXBkYXRlVm9sdW1lKClcbiAgICAgICAgXG4gICAgb25Db250ZXh0TWVudTogKGV2ZW50KSA9PiBcbiAgICAgICAgXG4gICAgICAgIGN1cnJlbnQgPSBwYXJzZUludCB3eHcoJ3ZvbHVtZScpLnRyaW0oKVxuICAgICAgICBpZiBAdm9sdW1lID09IGN1cnJlbnRcbiAgICAgICAgICAgIEBtdXRlID0gdHJ1ZVxuICAgICAgICAgICAgd3h3ICd2b2x1bWUnIDBcbiAgICAgICAgICAgIEB1cGRhdGVWb2x1bWUoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2V0Vm9sdW1lIEB2b2x1bWVcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgb25Mb2FkOiAtPlxuICAgICAgICBcbiAgICAgICAgc3ZnID0gdXRpbHMuc3ZnIGNsc3M6J3ZvbHVtZSdcbiAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgc3ZnXG4gICAgICAgIFxuICAgICAgICBmYWNlID0gdXRpbHMuY2lyY2xlIHJhZGl1czozNSBjbHNzOidrbm9iJyBzdmc6c3ZnXG4gICAgICAgIFxuICAgICAgICBmb3IgbSBpbiBbMS4uMTFdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHV0aWxzLmFwcGVuZCBmYWNlLCAnbGluZScgY2xhc3M6J3ZvbG1yaycgeTE6NDAgeTI6NDcgdHJhbnNmb3JtOlwicm90YXRlKCN7MzAqbSo1fSlcIiBcbiAgICBcbiAgICAgICAgQHZvbGRvdCA9IHV0aWxzLmFwcGVuZCBmYWNlLCAnY2lyY2xlJyByOjUgY3g6MCBjeTotMjUgY2xhc3M6J3ZvbGRvdCdcbiAgICAgICAgXG4gICAgICAgIEB1cGRhdGVWb2x1bWUoKVxuICAgICAgICBcbiAgICB1cGRhdGVWb2x1bWU6IC0+XG4gICAgICAgIFxuICAgICAgICBhbmdsZSA9IDE1MCooQHZvbHVtZS01MCkvNTBcbiAgICAgICAgQHZvbGRvdC5zZXRBdHRyaWJ1dGUgJ3RyYW5zZm9ybScgXCJyb3RhdGUoI3thbmdsZX0pXCJcbiAgICAgICAgQHZvbGRvdC5jbGFzc0xpc3QudG9nZ2xlICdtdXRlJyBAbXV0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBWb2x1bWVcbiJdfQ==
//# sourceURL=../coffee/volume.coffee
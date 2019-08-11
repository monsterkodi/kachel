// koffee 1.3.0

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
        this.onClick = bind(this.onClick, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Volume.__super__.constructor.apply(this, arguments);
        this.mute = false;
        this.main.addEventListener('mousewheel', this.onWheel);
        this.volume = parseInt(wxw('volume').trim());
    }

    Volume.prototype.onClick = function(event) {
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
        wxw('volume', clamp(0, 100, v));
        this.volume = parseInt(wxw('volume').trim());
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidm9sdW1lLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxxRUFBQTtJQUFBOzs7O0FBUUEsTUFBMkMsT0FBQSxDQUFRLEtBQVIsQ0FBM0MsRUFBRSxlQUFGLEVBQVEsaUJBQVIsRUFBZSxlQUFmLEVBQXFCLGVBQXJCLEVBQTJCLGVBQTNCLEVBQWlDLFdBQWpDLEVBQXFDOztBQUVyQyxHQUFBLEdBQVUsT0FBQSxDQUFRLEtBQVI7O0FBQ1YsS0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSOztBQUNWLE1BQUEsR0FBVSxPQUFBLENBQVEsVUFBUjs7QUFFSjs7O0lBRUMsZ0JBQUMsR0FBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsa0RBQVM7Ozs7UUFFViw0R0FBQSxTQUFBO1FBRUEsSUFBQyxDQUFBLElBQUQsR0FBUTtRQUNSLElBQUMsQ0FBQSxJQUFJLENBQUMsZ0JBQU4sQ0FBdUIsWUFBdkIsRUFBb0MsSUFBQyxDQUFBLE9BQXJDO1FBRUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxRQUFBLENBQVMsR0FBQSxDQUFJLFFBQUosQ0FBYSxDQUFDLElBQWQsQ0FBQSxDQUFUO0lBUFg7O3FCQVNILE9BQUEsR0FBUyxTQUFDLEtBQUQ7QUFFTCxZQUFBO1FBQUEsRUFBQSxHQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUMscUJBQWQsQ0FBQTtRQUNOLEdBQUEsR0FBTSxJQUFBLENBQUssRUFBRSxDQUFDLEtBQVIsRUFBZSxFQUFFLENBQUMsTUFBbEIsQ0FBeUIsQ0FBQyxLQUExQixDQUFnQyxHQUFoQztRQUNOLEdBQUEsR0FBTSxHQUFHLENBQUMsRUFBSixDQUFPLElBQUEsQ0FBSyxLQUFMLENBQVA7UUFDTixHQUFBLEdBQU0sR0FBRyxDQUFDLE1BQUosQ0FBQSxDQUFZLENBQUMsUUFBYixDQUFzQixJQUFBLENBQUssQ0FBTCxFQUFPLENBQUMsQ0FBUixDQUF0QjtlQUNOLElBQUMsQ0FB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QyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMDAwMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgXG4gICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICBcbiAgICAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuIyMjXG5cbnsgcG9zdCwgY2xhbXAsIGtwb3MsIGVsZW0sIGtsb2csIG9zLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbnd4dyAgICAgPSByZXF1aXJlICd3eHcnXG51dGlscyAgID0gcmVxdWlyZSAnLi91dGlscydcbkthY2hlbCAgPSByZXF1aXJlICcuL2thY2hlbCdcblxuY2xhc3MgVm9sdW1lIGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J3ZvbHVtZScpIC0+IFxuICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICAgICAgQG11dGUgPSBmYWxzZVxuICAgICAgICBAbWFpbi5hZGRFdmVudExpc3RlbmVyICdtb3VzZXdoZWVsJyBAb25XaGVlbFxuICAgIFxuICAgICAgICBAdm9sdW1lID0gcGFyc2VJbnQgd3h3KCd2b2x1bWUnKS50cmltKClcbiAgICAgICAgICAgIFxuICAgIG9uQ2xpY2s6IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIGJyICA9IGRvY3VtZW50LmJvZHkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgY3RyID0ga3Bvcyhici53aWR0aCwgYnIuaGVpZ2h0KS50aW1lcyAwLjVcbiAgICAgICAgdmVjID0gY3RyLnRvIGtwb3MgZXZlbnRcbiAgICAgICAgcm90ID0gdmVjLm5vcm1hbCgpLnJvdGF0aW9uIGtwb3MoMCwtMSlcbiAgICAgICAgQHNldFZvbHVtZSA1MCArIHJvdCAvIDNcbiAgICAgICAgXG4gICAgb25XaGVlbDogKGV2ZW50KSA9PiBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBldmVudC5kZWx0YVkgPT0gMFxuICAgICAgICBpZiBldmVudC5kZWx0YVkgPiAwIHRoZW4gZGVsdGEgPSAyIGVsc2UgZGVsdGEgPSAtM1xuICAgICAgICBcbiAgICAgICAgQHZvbHVtZSA9IGNsYW1wIDAgMTAwIEB2b2x1bWUgLSBkZWx0YVxuICAgICAgICBAc2V0Vm9sdW1lIEB2b2x1bWVcbiAgICBcbiAgICBzZXRWb2x1bWU6ICh2KSAtPlxuICAgICAgICBcbiAgICAgICAgQG11dGUgPSBmYWxzZSAgICAgICAgXG4gICAgICAgIHd4dyAndm9sdW1lJyBjbGFtcCAwIDEwMCB2XG4gICAgICAgIEB2b2x1bWUgPSBwYXJzZUludCB3eHcoJ3ZvbHVtZScpLnRyaW0oKVxuICAgICAgICBAdXBkYXRlVm9sdW1lKClcbiAgICAgICAgXG4gICAgb25Db250ZXh0TWVudTogKGV2ZW50KSA9PiBcbiAgICAgICAgXG4gICAgICAgIGN1cnJlbnQgPSBwYXJzZUludCB3eHcoJ3ZvbHVtZScpLnRyaW0oKVxuICAgICAgICBpZiBAdm9sdW1lID09IGN1cnJlbnRcbiAgICAgICAgICAgIEBtdXRlID0gdHJ1ZVxuICAgICAgICAgICAgd3h3ICd2b2x1bWUnIDBcbiAgICAgICAgICAgIEB1cGRhdGVWb2x1bWUoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2V0Vm9sdW1lIEB2b2x1bWVcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgb25Mb2FkOiAtPlxuICAgICAgICBcbiAgICAgICAgc3ZnID0gdXRpbHMuc3ZnIGNsc3M6J3ZvbHVtZSdcbiAgICAgICAgQG1haW4uYXBwZW5kQ2hpbGQgc3ZnXG4gICAgICAgIFxuICAgICAgICBmYWNlID0gdXRpbHMuY2lyY2xlIHJhZGl1czozNSBjbHNzOidrbm9iJyBzdmc6c3ZnXG4gICAgICAgIFxuICAgICAgICBmb3IgbSBpbiBbMS4uMTFdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHV0aWxzLmFwcGVuZCBmYWNlLCAnbGluZScgY2xhc3M6J3ZvbG1yaycgeTE6NDAgeTI6NDcgdHJhbnNmb3JtOlwicm90YXRlKCN7MzAqbSo1fSlcIiBcbiAgICBcbiAgICAgICAgQHZvbGRvdCA9IHV0aWxzLmFwcGVuZCBmYWNlLCAnY2lyY2xlJyByOjUgY3g6MCBjeTotMjUgY2xhc3M6J3ZvbGRvdCdcbiAgICAgICAgXG4gICAgICAgIEB1cGRhdGVWb2x1bWUoKVxuICAgICAgICBcbiAgICB1cGRhdGVWb2x1bWU6IC0+XG4gICAgICAgIFxuICAgICAgICBhbmdsZSA9IDE1MCooQHZvbHVtZS01MCkvNTBcbiAgICAgICAgQHZvbGRvdC5zZXRBdHRyaWJ1dGUgJ3RyYW5zZm9ybScgXCJyb3RhdGUoI3thbmdsZX0pXCJcbiAgICAgICAgQHZvbGRvdC5jbGFzc0xpc3QudG9nZ2xlICdtdXRlJyBAbXV0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBWb2x1bWVcbiJdfQ==
//# sourceURL=../coffee/volume.coffee
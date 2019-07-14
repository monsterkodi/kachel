// koffee 1.3.0

/*
 0000000  000       0000000    0000000  000   000  
000       000      000   000  000       000  000   
000       000      000   000  000       0000000    
000       000      000   000  000       000  000   
 0000000  0000000   0000000    0000000  000   000
 */
var Clock, Kachel, _, elem, klog, ref, utils,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), elem = ref.elem, klog = ref.klog, _ = ref._;

utils = require('./utils');

Kachel = require('./kachel');

Clock = (function(superClass) {
    extend(Clock, superClass);

    function Clock(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'clock';
        this.onTick = bind(this.onTick, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Clock.__super__.constructor.apply(this, arguments);
    }

    Clock.prototype.onLoad = function() {
        var face, i, m, svg;
        svg = utils.svg({
            clss: 'clock'
        });
        this.main.appendChild(svg);
        face = utils.circle({
            radius: 47,
            clss: 'face',
            svg: svg
        });
        for (m = i = 0; i <= 11; m = ++i) {
            utils.append(face, 'line', {
                "class": 'major',
                y1: 45,
                y2: 47,
                transform: "rotate(" + (30 * m * 5) + ")"
            });
        }
        this.hour = utils.append(face, 'line', {
            y1: 0,
            y2: -32,
            "class": 'hour'
        });
        this.minute = utils.append(face, 'line', {
            y1: 0,
            y2: -42,
            "class": 'minute'
        });
        this.second = utils.append(face, 'line', {
            y1: 0,
            y2: -42,
            "class": 'second'
        });
        this.onTick();
        return setInterval(this.onTick, 1000);
    };

    Clock.prototype.onTick = function() {
        var hours, minutes, seconds, time;
        time = new Date();
        hours = time.getHours();
        minutes = time.getMinutes();
        seconds = time.getSeconds();
        this.hour.setAttribute('transform', "rotate(" + (30 * hours + minutes / 2) + ")");
        this.minute.setAttribute('transform', "rotate(" + (6 * minutes + seconds / 10) + ")");
        return this.second.setAttribute('transform', "rotate(" + (6 * seconds) + ")");
    };

    return Clock;

})(Kachel);

module.exports = Clock;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xvY2sgKDEpLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSx3Q0FBQTtJQUFBOzs7O0FBUUEsTUFBb0IsT0FBQSxDQUFRLEtBQVIsQ0FBcEIsRUFBRSxlQUFGLEVBQVEsZUFBUixFQUFjOztBQUVkLEtBQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7QUFDVixNQUFBLEdBQVUsT0FBQSxDQUFRLFVBQVI7O0FBRUo7OztJQUVDLGVBQUMsR0FBRDtBQUF1QixZQUFBO1FBQXRCLElBQUMsQ0FBQSxrREFBUzs7UUFBWSwyR0FBQSxTQUFBO0lBQXZCOztvQkFRSCxNQUFBLEdBQVEsU0FBQTtBQUVKLFlBQUE7UUFBQSxHQUFBLEdBQU0sS0FBSyxDQUFDLEdBQU4sQ0FBVTtZQUFBLElBQUEsRUFBSyxPQUFMO1NBQVY7UUFDTixJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsR0FBbEI7UUFFQSxJQUFBLEdBQU8sS0FBSyxDQUFDLE1BQU4sQ0FBYTtZQUFBLE1BQUEsRUFBTyxFQUFQO1lBQVUsSUFBQSxFQUFLLE1BQWY7WUFBc0IsR0FBQSxFQUFJLEdBQTFCO1NBQWI7QUFFUCxhQUFTLDJCQUFUO1lBQ0ksS0FBSyxDQUFDLE1BQU4sQ0FBYSxJQUFiLEVBQW1CLE1BQW5CLEVBQTBCO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sT0FBTjtnQkFBYyxFQUFBLEVBQUcsRUFBakI7Z0JBQW9CLEVBQUEsRUFBRyxFQUF2QjtnQkFBMEIsU0FBQSxFQUFVLFNBQUEsR0FBUyxDQUFDLEVBQUEsR0FBRyxDQUFILEdBQUssQ0FBTixDQUFULEdBQWlCLEdBQXJEO2FBQTFCO0FBREo7UUFHQSxJQUFDLENBQUEsSUFBRCxHQUFVLEtBQUssQ0FBQyxNQUFOLENBQWEsSUFBYixFQUFtQixNQUFuQixFQUEwQjtZQUFBLEVBQUEsRUFBRyxDQUFIO1lBQUssRUFBQSxFQUFHLENBQUMsRUFBVDtZQUFZLENBQUEsS0FBQSxDQUFBLEVBQU0sTUFBbEI7U0FBMUI7UUFDVixJQUFDLENBQUEsTUFBRCxHQUFVLEtBQUssQ0FBQyxNQUFOLENBQWEsSUFBYixFQUFtQixNQUFuQixFQUEwQjtZQUFBLEVBQUEsRUFBRyxDQUFIO1lBQUssRUFBQSxFQUFHLENBQUMsRUFBVDtZQUFZLENBQUEsS0FBQSxDQUFBLEVBQU0sUUFBbEI7U0FBMUI7UUFDVixJQUFDLENBQUEsTUFBRCxHQUFVLEtBQUssQ0FBQyxNQUFOLENBQWEsSUFBYixFQUFtQixNQUFuQixFQUEwQjtZQUFBLEVBQUEsRUFBRyxDQUFIO1lBQUssRUFBQSxFQUFHLENBQUMsRUFBVDtZQUFZLENBQUEsS0FBQSxDQUFBLEVBQU0sUUFBbEI7U0FBMUI7UUFFVixJQUFDLENBQUEsTUFBRCxDQUFBO2VBQ0EsV0FBQSxDQUFZLElBQUMsQ0FBQSxNQUFiLEVBQXFCLElBQXJCO0lBZkk7O29CQXVCUixNQUFBLEdBQVEsU0FBQTtBQUVKLFlBQUE7UUFBQSxJQUFBLEdBQU8sSUFBSSxJQUFKLENBQUE7UUFFUCxLQUFBLEdBQVUsSUFBSSxDQUFDLFFBQUwsQ0FBQTtRQUNWLE9BQUEsR0FBVSxJQUFJLENBQUMsVUFBTCxDQUFBO1FBQ1YsT0FBQSxHQUFVLElBQUksQ0FBQyxVQUFMLENBQUE7UUFFVixJQUFDLENBQUEsSUFBTSxDQUFDLFlBQVIsQ0FBcUIsV0FBckIsRUFBaUMsU0FBQSxHQUFTLENBQUMsRUFBQSxHQUFLLEtBQUwsR0FBYSxPQUFBLEdBQVUsQ0FBeEIsQ0FBVCxHQUFtQyxHQUFwRTtRQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFxQixXQUFyQixFQUFpQyxTQUFBLEdBQVMsQ0FBQyxDQUFBLEdBQUksT0FBSixHQUFjLE9BQUEsR0FBVSxFQUF6QixDQUFULEdBQXFDLEdBQXRFO2VBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLENBQXFCLFdBQXJCLEVBQWlDLFNBQUEsR0FBUyxDQUFDLENBQUEsR0FBSSxPQUFMLENBQVQsR0FBc0IsR0FBdkQ7SUFWSTs7OztHQWpDUTs7QUE2Q3BCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbjAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4wMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuIyMjXG5cbnsgZWxlbSwga2xvZywgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG51dGlscyAgID0gcmVxdWlyZSAnLi91dGlscydcbkthY2hlbCAgPSByZXF1aXJlICcuL2thY2hlbCdcblxuY2xhc3MgQ2xvY2sgZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonY2xvY2snKSAtPiBzdXBlclxuICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBvbkxvYWQ6IC0+XG4gICAgICAgIFxuICAgICAgICBzdmcgPSB1dGlscy5zdmcgY2xzczonY2xvY2snXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIHN2Z1xuICAgICAgICBcbiAgICAgICAgZmFjZSA9IHV0aWxzLmNpcmNsZSByYWRpdXM6NDcgY2xzczonZmFjZScgc3ZnOnN2Z1xuICAgICAgICBcbiAgICAgICAgZm9yIG0gaW4gWzAuLjExXVxuICAgICAgICAgICAgdXRpbHMuYXBwZW5kIGZhY2UsICdsaW5lJyBjbGFzczonbWFqb3InIHkxOjQ1IHkyOjQ3IHRyYW5zZm9ybTpcInJvdGF0ZSgjezMwKm0qNX0pXCIgXG4gICAgXG4gICAgICAgIEBob3VyICAgPSB1dGlscy5hcHBlbmQgZmFjZSwgJ2xpbmUnIHkxOjAgeTI6LTMyIGNsYXNzOidob3VyJyBcbiAgICAgICAgQG1pbnV0ZSA9IHV0aWxzLmFwcGVuZCBmYWNlLCAnbGluZScgeTE6MCB5MjotNDIgY2xhc3M6J21pbnV0ZSdcbiAgICAgICAgQHNlY29uZCA9IHV0aWxzLmFwcGVuZCBmYWNlLCAnbGluZScgeTE6MCB5MjotNDIgY2xhc3M6J3NlY29uZCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgQG9uVGljaygpXG4gICAgICAgIHNldEludGVydmFsIEBvblRpY2ssIDEwMDBcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgb25UaWNrOiA9PlxuICAgICAgICBcbiAgICAgICAgdGltZSA9IG5ldyBEYXRlKClcbiAgICAgICAgXG4gICAgICAgIGhvdXJzICAgPSB0aW1lLmdldEhvdXJzKClcbiAgICAgICAgbWludXRlcyA9IHRpbWUuZ2V0TWludXRlcygpXG4gICAgICAgIHNlY29uZHMgPSB0aW1lLmdldFNlY29uZHMoKVxuICAgICAgICBcbiAgICAgICAgQGhvdXIgIC5zZXRBdHRyaWJ1dGUgJ3RyYW5zZm9ybScgXCJyb3RhdGUoI3szMCAqIGhvdXJzICsgbWludXRlcyAvIDJ9KVwiXG4gICAgICAgIEBtaW51dGUuc2V0QXR0cmlidXRlICd0cmFuc2Zvcm0nIFwicm90YXRlKCN7NiAqIG1pbnV0ZXMgKyBzZWNvbmRzIC8gMTB9KVwiXG4gICAgICAgIEBzZWNvbmQuc2V0QXR0cmlidXRlICd0cmFuc2Zvcm0nIFwicm90YXRlKCN7NiAqIHNlY29uZHN9KVwiXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBDbG9ja1xuIl19
//# sourceURL=../coffee/clock (1).coffee
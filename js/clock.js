// koffee 1.3.0

/*
 0000000  000       0000000    0000000  000   000  
000       000      000   000  000       000  000   
000       000      000   000  000       0000000    
000       000      000   000  000       000  000   
 0000000  0000000   0000000    0000000  000   000
 */
var Clock, Kachel, _, elem, klog, post, ref, utils,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, elem = ref.elem, klog = ref.klog, _ = ref._;

utils = require('./utils');

Kachel = require('./kachel');

Clock = (function(superClass) {
    extend(Clock, superClass);

    function Clock(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'clock';
        this.onData = bind(this.onData, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Clock.__super__.constructor.apply(this, arguments);
        post.toMain('requestData', 'clockdata', this.id);
        post.on('data', this.onData);
    }

    Clock.prototype.onData = function(data) {
        this.hour.setAttribute('transform', "rotate(" + (30 * data.hour + data.minute / 2) + ")");
        this.minute.setAttribute('transform', "rotate(" + (6 * data.minute + data.second / 10) + ")");
        return this.second.setAttribute('transform', "rotate(" + (6 * data.second) + ")");
    };

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
        return this.second = utils.append(face, 'line', {
            y1: 0,
            y2: -42,
            "class": 'second'
        });
    };

    return Clock;

})(Kachel);

module.exports = Clock;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xvY2suanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLDhDQUFBO0lBQUE7Ozs7QUFRQSxNQUEwQixPQUFBLENBQVEsS0FBUixDQUExQixFQUFFLGVBQUYsRUFBUSxlQUFSLEVBQWMsZUFBZCxFQUFvQjs7QUFFcEIsS0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSOztBQUNWLE1BQUEsR0FBVSxPQUFBLENBQVEsVUFBUjs7QUFFSjs7O0lBRUMsZUFBQyxHQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxrREFBUzs7UUFFViwyR0FBQSxTQUFBO1FBRUEsSUFBSSxDQUFDLE1BQUwsQ0FBWSxhQUFaLEVBQTBCLFdBQTFCLEVBQXNDLElBQUMsQ0FBQSxFQUF2QztRQUNBLElBQUksQ0FBQyxFQUFMLENBQVEsTUFBUixFQUFlLElBQUMsQ0FBQSxNQUFoQjtJQUxEOztvQkFPSCxNQUFBLEdBQVEsU0FBQyxJQUFEO1FBRUosSUFBQyxDQUFBLElBQU0sQ0FBQyxZQUFSLENBQXFCLFdBQXJCLEVBQWlDLFNBQUEsR0FBUyxDQUFDLEVBQUEsR0FBSyxJQUFJLENBQUMsSUFBVixHQUFpQixJQUFJLENBQUMsTUFBTCxHQUFjLENBQWhDLENBQVQsR0FBMkMsR0FBNUU7UUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsQ0FBcUIsV0FBckIsRUFBaUMsU0FBQSxHQUFTLENBQUMsQ0FBQSxHQUFJLElBQUksQ0FBQyxNQUFULEdBQWtCLElBQUksQ0FBQyxNQUFMLEdBQWMsRUFBakMsQ0FBVCxHQUE2QyxHQUE5RTtlQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFxQixXQUFyQixFQUFpQyxTQUFBLEdBQVMsQ0FBQyxDQUFBLEdBQUksSUFBSSxDQUFDLE1BQVYsQ0FBVCxHQUEwQixHQUEzRDtJQUpJOztvQkFZUixNQUFBLEdBQVEsU0FBQTtBQUVKLFlBQUE7UUFBQSxHQUFBLEdBQU0sS0FBSyxDQUFDLEdBQU4sQ0FBVTtZQUFBLElBQUEsRUFBSyxPQUFMO1NBQVY7UUFDTixJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsR0FBbEI7UUFFQSxJQUFBLEdBQU8sS0FBSyxDQUFDLE1BQU4sQ0FBYTtZQUFBLE1BQUEsRUFBTyxFQUFQO1lBQVUsSUFBQSxFQUFLLE1BQWY7WUFBc0IsR0FBQSxFQUFJLEdBQTFCO1NBQWI7QUFFUCxhQUFTLDJCQUFUO1lBQ0ksS0FBSyxDQUFDLE1BQU4sQ0FBYSxJQUFiLEVBQW1CLE1BQW5CLEVBQTBCO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sT0FBTjtnQkFBYyxFQUFBLEVBQUcsRUFBakI7Z0JBQW9CLEVBQUEsRUFBRyxFQUF2QjtnQkFBMEIsU0FBQSxFQUFVLFNBQUEsR0FBUyxDQUFDLEVBQUEsR0FBRyxDQUFILEdBQUssQ0FBTixDQUFULEdBQWlCLEdBQXJEO2FBQTFCO0FBREo7UUFHQSxJQUFDLENBQUEsSUFBRCxHQUFVLEtBQUssQ0FBQyxNQUFOLENBQWEsSUFBYixFQUFtQixNQUFuQixFQUEwQjtZQUFBLEVBQUEsRUFBRyxDQUFIO1lBQUssRUFBQSxFQUFHLENBQUMsRUFBVDtZQUFZLENBQUEsS0FBQSxDQUFBLEVBQU0sTUFBbEI7U0FBMUI7UUFDVixJQUFDLENBQUEsTUFBRCxHQUFVLEtBQUssQ0FBQyxNQUFOLENBQWEsSUFBYixFQUFtQixNQUFuQixFQUEwQjtZQUFBLEVBQUEsRUFBRyxDQUFIO1lBQUssRUFBQSxFQUFHLENBQUMsRUFBVDtZQUFZLENBQUEsS0FBQSxDQUFBLEVBQU0sUUFBbEI7U0FBMUI7ZUFDVixJQUFDLENBQUEsTUFBRCxHQUFVLEtBQUssQ0FBQyxNQUFOLENBQWEsSUFBYixFQUFtQixNQUFuQixFQUEwQjtZQUFBLEVBQUEsRUFBRyxDQUFIO1lBQUssRUFBQSxFQUFHLENBQUMsRUFBVDtZQUFZLENBQUEsS0FBQSxDQUFBLEVBQU0sUUFBbEI7U0FBMUI7SUFaTjs7OztHQXJCUTs7QUFtQ3BCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbjAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4wMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuIyMjXG5cbnsgcG9zdCwgZWxlbSwga2xvZywgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG51dGlscyAgID0gcmVxdWlyZSAnLi91dGlscydcbkthY2hlbCAgPSByZXF1aXJlICcuL2thY2hlbCdcblxuY2xhc3MgQ2xvY2sgZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonY2xvY2snKSAtPiBcbiAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgICAgIHBvc3QudG9NYWluICdyZXF1ZXN0RGF0YScgJ2Nsb2NrZGF0YScgQGlkXG4gICAgICAgIHBvc3Qub24gJ2RhdGEnIEBvbkRhdGFcbiAgICBcbiAgICBvbkRhdGE6IChkYXRhKSA9PiBcbiAgICAgICAgXG4gICAgICAgIEBob3VyICAuc2V0QXR0cmlidXRlICd0cmFuc2Zvcm0nIFwicm90YXRlKCN7MzAgKiBkYXRhLmhvdXIgKyBkYXRhLm1pbnV0ZSAvIDJ9KVwiXG4gICAgICAgIEBtaW51dGUuc2V0QXR0cmlidXRlICd0cmFuc2Zvcm0nIFwicm90YXRlKCN7NiAqIGRhdGEubWludXRlICsgZGF0YS5zZWNvbmQgLyAxMH0pXCJcbiAgICAgICAgQHNlY29uZC5zZXRBdHRyaWJ1dGUgJ3RyYW5zZm9ybScgXCJyb3RhdGUoI3s2ICogZGF0YS5zZWNvbmR9KVwiXG4gICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBvbkxvYWQ6IC0+XG4gICAgICAgIFxuICAgICAgICBzdmcgPSB1dGlscy5zdmcgY2xzczonY2xvY2snXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIHN2Z1xuICAgICAgICBcbiAgICAgICAgZmFjZSA9IHV0aWxzLmNpcmNsZSByYWRpdXM6NDcgY2xzczonZmFjZScgc3ZnOnN2Z1xuICAgICAgICBcbiAgICAgICAgZm9yIG0gaW4gWzAuLjExXVxuICAgICAgICAgICAgdXRpbHMuYXBwZW5kIGZhY2UsICdsaW5lJyBjbGFzczonbWFqb3InIHkxOjQ1IHkyOjQ3IHRyYW5zZm9ybTpcInJvdGF0ZSgjezMwKm0qNX0pXCIgXG4gICAgXG4gICAgICAgIEBob3VyICAgPSB1dGlscy5hcHBlbmQgZmFjZSwgJ2xpbmUnIHkxOjAgeTI6LTMyIGNsYXNzOidob3VyJyBcbiAgICAgICAgQG1pbnV0ZSA9IHV0aWxzLmFwcGVuZCBmYWNlLCAnbGluZScgeTE6MCB5MjotNDIgY2xhc3M6J21pbnV0ZSdcbiAgICAgICAgQHNlY29uZCA9IHV0aWxzLmFwcGVuZCBmYWNlLCAnbGluZScgeTE6MCB5MjotNDIgY2xhc3M6J3NlY29uZCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gQ2xvY2tcbiJdfQ==
//# sourceURL=../coffee/clock.coffee
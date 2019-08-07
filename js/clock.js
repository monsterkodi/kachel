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
        this.requestData('clock');
    }

    Clock.prototype.onData = function(data) {
        if (!this.hour) {
            return;
        }
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
                "class": 'minmrk',
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xvY2suanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLDhDQUFBO0lBQUE7Ozs7QUFRQSxNQUEwQixPQUFBLENBQVEsS0FBUixDQUExQixFQUFFLGVBQUYsRUFBUSxlQUFSLEVBQWMsZUFBZCxFQUFvQjs7QUFFcEIsS0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSOztBQUNWLE1BQUEsR0FBVSxPQUFBLENBQVEsVUFBUjs7QUFFSjs7O0lBRUMsZUFBQyxHQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxrREFBUzs7UUFFViwyR0FBQSxTQUFBO1FBRUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxPQUFiO0lBSkQ7O29CQU1ILE1BQUEsR0FBUSxTQUFDLElBQUQ7UUFFSixJQUFVLENBQUksSUFBQyxDQUFBLElBQWY7QUFBQSxtQkFBQTs7UUFFQSxJQUFDLENBQUEsSUFBTSxDQUFDLFlBQVIsQ0FBcUIsV0FBckIsRUFBaUMsU0FBQSxHQUFTLENBQUMsRUFBQSxHQUFLLElBQUksQ0FBQyxJQUFWLEdBQWlCLElBQUksQ0FBQyxNQUFMLEdBQWMsQ0FBaEMsQ0FBVCxHQUEyQyxHQUE1RTtRQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFxQixXQUFyQixFQUFpQyxTQUFBLEdBQVMsQ0FBQyxDQUFBLEdBQUksSUFBSSxDQUFDLE1BQVQsR0FBa0IsSUFBSSxDQUFDLE1BQUwsR0FBYyxFQUFqQyxDQUFULEdBQTZDLEdBQTlFO2VBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLENBQXFCLFdBQXJCLEVBQWlDLFNBQUEsR0FBUyxDQUFDLENBQUEsR0FBSSxJQUFJLENBQUMsTUFBVixDQUFULEdBQTBCLEdBQTNEO0lBTkk7O29CQWNSLE1BQUEsR0FBUSxTQUFBO0FBRUosWUFBQTtRQUFBLEdBQUEsR0FBTSxLQUFLLENBQUMsR0FBTixDQUFVO1lBQUEsSUFBQSxFQUFLLE9BQUw7U0FBVjtRQUNOLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixHQUFsQjtRQUVBLElBQUEsR0FBTyxLQUFLLENBQUMsTUFBTixDQUFhO1lBQUEsTUFBQSxFQUFPLEVBQVA7WUFBVSxJQUFBLEVBQUssTUFBZjtZQUFzQixHQUFBLEVBQUksR0FBMUI7U0FBYjtBQUVQLGFBQVMsMkJBQVQ7WUFDSSxLQUFLLENBQUMsTUFBTixDQUFhLElBQWIsRUFBbUIsTUFBbkIsRUFBMEI7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxRQUFOO2dCQUFlLEVBQUEsRUFBRyxFQUFsQjtnQkFBcUIsRUFBQSxFQUFHLEVBQXhCO2dCQUEyQixTQUFBLEVBQVUsU0FBQSxHQUFTLENBQUMsRUFBQSxHQUFHLENBQUgsR0FBSyxDQUFOLENBQVQsR0FBaUIsR0FBdEQ7YUFBMUI7QUFESjtRQUdBLElBQUMsQ0FBQSxJQUFELEdBQVUsS0FBSyxDQUFDLE1BQU4sQ0FBYSxJQUFiLEVBQW1CLE1BQW5CLEVBQTBCO1lBQUEsRUFBQSxFQUFHLENBQUg7WUFBSyxFQUFBLEVBQUcsQ0FBQyxFQUFUO1lBQVksQ0FBQSxLQUFBLENBQUEsRUFBTSxNQUFsQjtTQUExQjtRQUNWLElBQUMsQ0FBQSxNQUFELEdBQVUsS0FBSyxDQUFDLE1BQU4sQ0FBYSxJQUFiLEVBQW1CLE1BQW5CLEVBQTBCO1lBQUEsRUFBQSxFQUFHLENBQUg7WUFBSyxFQUFBLEVBQUcsQ0FBQyxFQUFUO1lBQVksQ0FBQSxLQUFBLENBQUEsRUFBTSxRQUFsQjtTQUExQjtlQUNWLElBQUMsQ0FBQSxNQUFELEdBQVUsS0FBSyxDQUFDLE1BQU4sQ0FBYSxJQUFiLEVBQW1CLE1BQW5CLEVBQTBCO1lBQUEsRUFBQSxFQUFHLENBQUg7WUFBSyxFQUFBLEVBQUcsQ0FBQyxFQUFUO1lBQVksQ0FBQSxLQUFBLENBQUEsRUFBTSxRQUFsQjtTQUExQjtJQVpOOzs7O0dBdEJROztBQW9DcEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4wMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbjAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuIDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIyNcblxueyBwb3N0LCBlbGVtLCBrbG9nLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbnV0aWxzICAgPSByZXF1aXJlICcuL3V0aWxzJ1xuS2FjaGVsICA9IHJlcXVpcmUgJy4va2FjaGVsJ1xuXG5jbGFzcyBDbG9jayBleHRlbmRzIEthY2hlbFxuICAgICAgICBcbiAgICBAOiAoQGthY2hlbElkOidjbG9jaycpIC0+IFxuICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICAgICAgQHJlcXVlc3REYXRhICdjbG9jaydcbiAgICBcbiAgICBvbkRhdGE6IChkYXRhKSA9PiBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgQGhvdXJcbiAgICAgICAgXG4gICAgICAgIEBob3VyICAuc2V0QXR0cmlidXRlICd0cmFuc2Zvcm0nIFwicm90YXRlKCN7MzAgKiBkYXRhLmhvdXIgKyBkYXRhLm1pbnV0ZSAvIDJ9KVwiXG4gICAgICAgIEBtaW51dGUuc2V0QXR0cmlidXRlICd0cmFuc2Zvcm0nIFwicm90YXRlKCN7NiAqIGRhdGEubWludXRlICsgZGF0YS5zZWNvbmQgLyAxMH0pXCJcbiAgICAgICAgQHNlY29uZC5zZXRBdHRyaWJ1dGUgJ3RyYW5zZm9ybScgXCJyb3RhdGUoI3s2ICogZGF0YS5zZWNvbmR9KVwiXG4gICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBvbkxvYWQ6IC0+XG4gICAgICAgIFxuICAgICAgICBzdmcgPSB1dGlscy5zdmcgY2xzczonY2xvY2snXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIHN2Z1xuICAgICAgICBcbiAgICAgICAgZmFjZSA9IHV0aWxzLmNpcmNsZSByYWRpdXM6NDcgY2xzczonZmFjZScgc3ZnOnN2Z1xuICAgICAgICBcbiAgICAgICAgZm9yIG0gaW4gWzAuLjExXVxuICAgICAgICAgICAgdXRpbHMuYXBwZW5kIGZhY2UsICdsaW5lJyBjbGFzczonbWlubXJrJyB5MTo0NSB5Mjo0NyB0cmFuc2Zvcm06XCJyb3RhdGUoI3szMCptKjV9KVwiIFxuICAgIFxuICAgICAgICBAaG91ciAgID0gdXRpbHMuYXBwZW5kIGZhY2UsICdsaW5lJyB5MTowIHkyOi0zMiBjbGFzczonaG91cicgXG4gICAgICAgIEBtaW51dGUgPSB1dGlscy5hcHBlbmQgZmFjZSwgJ2xpbmUnIHkxOjAgeTI6LTQyIGNsYXNzOidtaW51dGUnXG4gICAgICAgIEBzZWNvbmQgPSB1dGlscy5hcHBlbmQgZmFjZSwgJ2xpbmUnIHkxOjAgeTI6LTQyIGNsYXNzOidzZWNvbmQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IENsb2NrXG4iXX0=
//# sourceURL=../coffee/clock.coffee
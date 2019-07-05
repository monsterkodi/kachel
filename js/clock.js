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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xvY2suanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLHdDQUFBO0lBQUE7Ozs7QUFRQSxNQUFvQixPQUFBLENBQVEsS0FBUixDQUFwQixFQUFFLGVBQUYsRUFBUSxlQUFSLEVBQWM7O0FBRWQsS0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSOztBQUNWLE1BQUEsR0FBVSxPQUFBLENBQVEsVUFBUjs7QUFFSjs7O0lBRUMsZUFBQyxHQUFEO0FBQXVCLFlBQUE7UUFBdEIsSUFBQyxDQUFBLGtEQUFTOztRQUFZLDJHQUFBLFNBQUE7SUFBdkI7O29CQUVILE1BQUEsR0FBUSxTQUFBO0FBRUosWUFBQTtRQUFBLEdBQUEsR0FBTSxLQUFLLENBQUMsR0FBTixDQUFVO1lBQUEsSUFBQSxFQUFLLE9BQUw7U0FBVjtRQUNOLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixHQUFsQjtRQUVBLElBQUEsR0FBTyxLQUFLLENBQUMsTUFBTixDQUFhO1lBQUEsTUFBQSxFQUFPLEVBQVA7WUFBVSxJQUFBLEVBQUssTUFBZjtZQUFzQixHQUFBLEVBQUksR0FBMUI7U0FBYjtBQUVQLGFBQVMsMkJBQVQ7WUFDSSxLQUFLLENBQUMsTUFBTixDQUFhLElBQWIsRUFBbUIsTUFBbkIsRUFBMEI7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxPQUFOO2dCQUFjLEVBQUEsRUFBRyxFQUFqQjtnQkFBb0IsRUFBQSxFQUFHLEVBQXZCO2dCQUEwQixTQUFBLEVBQVUsU0FBQSxHQUFTLENBQUMsRUFBQSxHQUFHLENBQUgsR0FBSyxDQUFOLENBQVQsR0FBaUIsR0FBckQ7YUFBMUI7QUFESjtRQUdBLElBQUMsQ0FBQSxJQUFELEdBQVUsS0FBSyxDQUFDLE1BQU4sQ0FBYSxJQUFiLEVBQW1CLE1BQW5CLEVBQTBCO1lBQUEsRUFBQSxFQUFHLENBQUg7WUFBSyxFQUFBLEVBQUcsQ0FBQyxFQUFUO1lBQVksQ0FBQSxLQUFBLENBQUEsRUFBTSxNQUFsQjtTQUExQjtRQUNWLElBQUMsQ0FBQSxNQUFELEdBQVUsS0FBSyxDQUFDLE1BQU4sQ0FBYSxJQUFiLEVBQW1CLE1BQW5CLEVBQTBCO1lBQUEsRUFBQSxFQUFHLENBQUg7WUFBSyxFQUFBLEVBQUcsQ0FBQyxFQUFUO1lBQVksQ0FBQSxLQUFBLENBQUEsRUFBTSxRQUFsQjtTQUExQjtRQUNWLElBQUMsQ0FBQSxNQUFELEdBQVUsS0FBSyxDQUFDLE1BQU4sQ0FBYSxJQUFiLEVBQW1CLE1BQW5CLEVBQTBCO1lBQUEsRUFBQSxFQUFHLENBQUg7WUFBSyxFQUFBLEVBQUcsQ0FBQyxFQUFUO1lBQVksQ0FBQSxLQUFBLENBQUEsRUFBTSxRQUFsQjtTQUExQjtRQUVWLElBQUMsQ0FBQSxNQUFELENBQUE7ZUFDQSxXQUFBLENBQVksSUFBQyxDQUFBLE1BQWIsRUFBcUIsSUFBckI7SUFmSTs7b0JBaUJSLE1BQUEsR0FBUSxTQUFBO0FBRUosWUFBQTtRQUFBLElBQUEsR0FBTyxJQUFJLElBQUosQ0FBQTtRQUVQLEtBQUEsR0FBVSxJQUFJLENBQUMsUUFBTCxDQUFBO1FBQ1YsT0FBQSxHQUFVLElBQUksQ0FBQyxVQUFMLENBQUE7UUFDVixPQUFBLEdBQVUsSUFBSSxDQUFDLFVBQUwsQ0FBQTtRQUVWLElBQUMsQ0FBQSxJQUFNLENBQUMsWUFBUixDQUFxQixXQUFyQixFQUFpQyxTQUFBLEdBQVMsQ0FBQyxFQUFBLEdBQUssS0FBTCxHQUFhLE9BQUEsR0FBVSxDQUF4QixDQUFULEdBQW1DLEdBQXBFO1FBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLENBQXFCLFdBQXJCLEVBQWlDLFNBQUEsR0FBUyxDQUFDLENBQUEsR0FBSSxPQUFKLEdBQWMsT0FBQSxHQUFVLEVBQXpCLENBQVQsR0FBcUMsR0FBdEU7ZUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsQ0FBcUIsV0FBckIsRUFBaUMsU0FBQSxHQUFTLENBQUMsQ0FBQSxHQUFJLE9BQUwsQ0FBVCxHQUFzQixHQUF2RDtJQVZJOzs7O0dBckJROztBQWlDcEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4wMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbjAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuIDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIyNcblxueyBlbGVtLCBrbG9nLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbnV0aWxzICAgPSByZXF1aXJlICcuL3V0aWxzJ1xuS2FjaGVsICA9IHJlcXVpcmUgJy4va2FjaGVsJ1xuXG5jbGFzcyBDbG9jayBleHRlbmRzIEthY2hlbFxuICAgICAgICBcbiAgICBAOiAoQGthY2hlbElkOidjbG9jaycpIC0+IHN1cGVyXG4gICAgXG4gICAgb25Mb2FkOiAtPlxuICAgICAgICBcbiAgICAgICAgc3ZnID0gdXRpbHMuc3ZnIGNsc3M6J2Nsb2NrJ1xuICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBzdmdcbiAgICAgICAgXG4gICAgICAgIGZhY2UgPSB1dGlscy5jaXJjbGUgcmFkaXVzOjQ3IGNsc3M6J2ZhY2UnIHN2ZzpzdmdcbiAgICAgICAgXG4gICAgICAgIGZvciBtIGluIFswLi4xMV1cbiAgICAgICAgICAgIHV0aWxzLmFwcGVuZCBmYWNlLCAnbGluZScgY2xhc3M6J21ham9yJyB5MTo0NSB5Mjo0NyB0cmFuc2Zvcm06XCJyb3RhdGUoI3szMCptKjV9KVwiIFxuICAgIFxuICAgICAgICBAaG91ciAgID0gdXRpbHMuYXBwZW5kIGZhY2UsICdsaW5lJyB5MTowIHkyOi0zMiBjbGFzczonaG91cicgXG4gICAgICAgIEBtaW51dGUgPSB1dGlscy5hcHBlbmQgZmFjZSwgJ2xpbmUnIHkxOjAgeTI6LTQyIGNsYXNzOidtaW51dGUnXG4gICAgICAgIEBzZWNvbmQgPSB1dGlscy5hcHBlbmQgZmFjZSwgJ2xpbmUnIHkxOjAgeTI6LTQyIGNsYXNzOidzZWNvbmQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIEBvblRpY2soKVxuICAgICAgICBzZXRJbnRlcnZhbCBAb25UaWNrLCAxMDAwXG4gICAgICAgIFxuICAgIG9uVGljazogPT5cbiAgICAgICAgXG4gICAgICAgIHRpbWUgPSBuZXcgRGF0ZSgpXG4gICAgICAgIFxuICAgICAgICBob3VycyAgID0gdGltZS5nZXRIb3VycygpXG4gICAgICAgIG1pbnV0ZXMgPSB0aW1lLmdldE1pbnV0ZXMoKVxuICAgICAgICBzZWNvbmRzID0gdGltZS5nZXRTZWNvbmRzKClcbiAgICAgICAgXG4gICAgICAgIEBob3VyICAuc2V0QXR0cmlidXRlICd0cmFuc2Zvcm0nIFwicm90YXRlKCN7MzAgKiBob3VycyArIG1pbnV0ZXMgLyAyfSlcIlxuICAgICAgICBAbWludXRlLnNldEF0dHJpYnV0ZSAndHJhbnNmb3JtJyBcInJvdGF0ZSgjezYgKiBtaW51dGVzICsgc2Vjb25kcyAvIDEwfSlcIlxuICAgICAgICBAc2Vjb25kLnNldEF0dHJpYnV0ZSAndHJhbnNmb3JtJyBcInJvdGF0ZSgjezYgKiBzZWNvbmRzfSlcIlxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gQ2xvY2tcbiJdfQ==
//# sourceURL=../coffee/clock.coffee
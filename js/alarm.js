// koffee 1.3.0

/*
 0000000   000       0000000   00000000   00     00    
000   000  000      000   000  000   000  000   000    
000000000  000      000000000  0000000    000000000    
000   000  000      000   000  000   000  000 0 000    
000   000  0000000  000   000  000   000  000   000
 */
var Alarm, Kachel, _, elem, klog, kstr, ref, utils,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), elem = ref.elem, klog = ref.klog, kstr = ref.kstr, _ = ref._;

utils = require('./utils');

Kachel = require('./kachel');

Alarm = (function(superClass) {
    extend(Alarm, superClass);

    function Alarm(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'alarm';
        this.onTick = bind(this.onTick, this);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Alarm.__super__.constructor.apply(this, arguments);
    }

    Alarm.prototype.onLoad = function() {
        this.hour = elem({
            "class": 'alarm-hour'
        });
        this.minute = elem({
            "class": 'alarm-minute'
        });
        this.second = elem({
            "class": 'alarm-second'
        });
        this.main.appendChild(elem({
            "class": 'alarm-digits',
            children: [this.hour, this.minute, this.second]
        }));
        this.onTick();
        return setInterval(this.onTick, 1000);
    };

    Alarm.prototype.onTick = function() {
        var hours, minutes, seconds, time;
        time = new Date();
        hours = time.getHours();
        minutes = time.getMinutes();
        seconds = time.getSeconds();
        this.hour.innerHTML = kstr.lpad(hours, 2, '0');
        this.minute.innerHTML = kstr.lpad(minutes, 2, '0');
        return this.second.innerHTML = kstr.lpad(seconds, 2, '0');
    };

    return Alarm;

})(Kachel);

module.exports = Alarm;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxhcm0uanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLDhDQUFBO0lBQUE7Ozs7QUFRQSxNQUEwQixPQUFBLENBQVEsS0FBUixDQUExQixFQUFFLGVBQUYsRUFBUSxlQUFSLEVBQWMsZUFBZCxFQUFvQjs7QUFFcEIsS0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSOztBQUNWLE1BQUEsR0FBVSxPQUFBLENBQVEsVUFBUjs7QUFFSjs7O0lBRUMsZUFBQyxHQUFEO0FBQXVCLFlBQUE7UUFBdEIsSUFBQyxDQUFBLGtEQUFTOztRQUFZLDJHQUFBLFNBQUE7SUFBdkI7O29CQVFILE1BQUEsR0FBUSxTQUFBO1FBRUosSUFBQyxDQUFBLElBQUQsR0FBVSxJQUFBLENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFlBQU47U0FBTDtRQUNWLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQSxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxjQUFOO1NBQUw7UUFDVixJQUFDLENBQUEsTUFBRCxHQUFVLElBQUEsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sY0FBTjtTQUFMO1FBRVYsSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLElBQUEsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sY0FBTjtZQUFxQixRQUFBLEVBQVUsQ0FBQyxJQUFDLENBQUEsSUFBRixFQUFRLElBQUMsQ0FBQSxNQUFULEVBQWlCLElBQUMsQ0FBQSxNQUFsQixDQUEvQjtTQUFMLENBQWxCO1FBRUEsSUFBQyxDQUFBLE1BQUQsQ0FBQTtlQUNBLFdBQUEsQ0FBWSxJQUFDLENBQUEsTUFBYixFQUFxQixJQUFyQjtJQVRJOztvQkFpQlIsTUFBQSxHQUFRLFNBQUE7QUFFSixZQUFBO1FBQUEsSUFBQSxHQUFPLElBQUksSUFBSixDQUFBO1FBRVAsS0FBQSxHQUFVLElBQUksQ0FBQyxRQUFMLENBQUE7UUFDVixPQUFBLEdBQVUsSUFBSSxDQUFDLFVBQUwsQ0FBQTtRQUNWLE9BQUEsR0FBVSxJQUFJLENBQUMsVUFBTCxDQUFBO1FBRVYsSUFBQyxDQUFBLElBQU0sQ0FBQyxTQUFSLEdBQW9CLElBQUksQ0FBQyxJQUFMLENBQVUsS0FBVixFQUFtQixDQUFuQixFQUFxQixHQUFyQjtRQUNwQixJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVIsR0FBb0IsSUFBSSxDQUFDLElBQUwsQ0FBVSxPQUFWLEVBQW1CLENBQW5CLEVBQXFCLEdBQXJCO2VBQ3BCLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBUixHQUFvQixJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsRUFBbUIsQ0FBbkIsRUFBcUIsR0FBckI7SUFWaEI7Ozs7R0EzQlE7O0FBdUNwQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAgICAgIDAwICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgIFxuMDAwMDAwMDAwICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAgIFxuMDAwICAgMDAwICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgIFxuIyMjXG5cbnsgZWxlbSwga2xvZywga3N0ciwgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG51dGlscyAgID0gcmVxdWlyZSAnLi91dGlscydcbkthY2hlbCAgPSByZXF1aXJlICcuL2thY2hlbCdcblxuY2xhc3MgQWxhcm0gZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonYWxhcm0nKSAtPiBzdXBlclxuICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBvbkxvYWQ6IC0+XG4gICAgICAgIFxuICAgICAgICBAaG91ciAgID0gZWxlbSBjbGFzczonYWxhcm0taG91cicgXG4gICAgICAgIEBtaW51dGUgPSBlbGVtIGNsYXNzOidhbGFybS1taW51dGUnXG4gICAgICAgIEBzZWNvbmQgPSBlbGVtIGNsYXNzOidhbGFybS1zZWNvbmQnXG4gICAgICAgICAgICAgXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGVsZW0gY2xhc3M6J2FsYXJtLWRpZ2l0cycgY2hpbGRyZW46IFtAaG91ciwgQG1pbnV0ZSwgQHNlY29uZF1cbiAgICAgICAgXG4gICAgICAgIEBvblRpY2soKVxuICAgICAgICBzZXRJbnRlcnZhbCBAb25UaWNrLCAxMDAwXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuICAgICMgICAgMDAwICAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIG9uVGljazogPT5cbiAgICAgICAgXG4gICAgICAgIHRpbWUgPSBuZXcgRGF0ZSgpXG4gICAgICAgIFxuICAgICAgICBob3VycyAgID0gdGltZS5nZXRIb3VycygpXG4gICAgICAgIG1pbnV0ZXMgPSB0aW1lLmdldE1pbnV0ZXMoKVxuICAgICAgICBzZWNvbmRzID0gdGltZS5nZXRTZWNvbmRzKClcbiAgICAgICAgXG4gICAgICAgIEBob3VyICAuaW5uZXJIVE1MID0ga3N0ci5scGFkIGhvdXJzLCAgIDIgJzAnXG4gICAgICAgIEBtaW51dGUuaW5uZXJIVE1MID0ga3N0ci5scGFkIG1pbnV0ZXMsIDIgJzAnXG4gICAgICAgIEBzZWNvbmQuaW5uZXJIVE1MID0ga3N0ci5scGFkIHNlY29uZHMsIDIgJzAnXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBBbGFybVxuIl19
//# sourceURL=../coffee/alarm.coffee
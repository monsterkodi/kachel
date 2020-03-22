// koffee 1.12.0

/*
 0000000   000       0000000   00000000   00     00    
000   000  000      000   000  000   000  000   000    
000000000  000      000000000  0000000    000000000    
000   000  000      000   000  000   000  000 0 000    
000   000  0000000  000   000  000   000  000   000
 */
var Alarm, Kachel, _, elem, ref, utils,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), _ = ref._, elem = ref.elem;

utils = require('./utils');

Kachel = require('./kachel');

Alarm = (function(superClass) {
    extend(Alarm, superClass);

    function Alarm(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'alarm';
        this.onData = bind(this.onData, this);
        _;
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Alarm.__super__.constructor.apply(this, arguments);
        this.requestData('clock');
    }

    Alarm.prototype.onData = function(data) {
        this.hour.innerHTML = data.str.hour;
        this.minute.innerHTML = data.str.minute;
        return this.second.innerHTML = data.str.second;
    };

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
        return this.main.appendChild(elem({
            "class": 'alarm-digits',
            children: [this.hour, this.minute, this.second]
        }));
    };

    return Alarm;

})(Kachel);

module.exports = Alarm;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxhcm0uanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJhbGFybS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsa0NBQUE7SUFBQTs7OztBQVFBLE1BQWMsT0FBQSxDQUFRLEtBQVIsQ0FBZCxFQUFFLFNBQUYsRUFBSzs7QUFFTCxLQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0FBQ1YsTUFBQSxHQUFVLE9BQUEsQ0FBUSxVQUFSOztBQUVKOzs7SUFFQyxlQUFDLEdBQUQ7QUFDQyxZQUFBO1FBREEsSUFBQyxDQUFBLGtEQUFTOztRQUNWO1FBQ0EsMkdBQUEsU0FBQTtRQUVBLElBQUMsQ0FBQSxXQUFELENBQWEsT0FBYjtJQUpEOztvQkFNSCxNQUFBLEdBQVEsU0FBQyxJQUFEO1FBRUosSUFBQyxDQUFBLElBQU0sQ0FBQyxTQUFSLEdBQW9CLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDN0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFSLEdBQW9CLElBQUksQ0FBQyxHQUFHLENBQUM7ZUFDN0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFSLEdBQW9CLElBQUksQ0FBQyxHQUFHLENBQUM7SUFKekI7O29CQVlSLE1BQUEsR0FBUSxTQUFBO1FBRUosSUFBQyxDQUFBLElBQUQsR0FBVSxJQUFBLENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFlBQU47U0FBTDtRQUNWLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQSxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxjQUFOO1NBQUw7UUFDVixJQUFDLENBQUEsTUFBRCxHQUFVLElBQUEsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sY0FBTjtTQUFMO2VBRVYsSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLElBQUEsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sY0FBTjtZQUFxQixRQUFBLEVBQVUsQ0FBQyxJQUFDLENBQUEsSUFBRixFQUFRLElBQUMsQ0FBQSxNQUFULEVBQWlCLElBQUMsQ0FBQSxNQUFsQixDQUEvQjtTQUFMLENBQWxCO0lBTkk7Ozs7R0FwQlE7O0FBNEJwQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAgICAgIDAwICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgIFxuMDAwMDAwMDAwICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAgIFxuMDAwICAgMDAwICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgIFxuIyMjXG5cbnsgXywgZWxlbSB9ID0gcmVxdWlyZSAna3hrJ1xuXG51dGlscyAgID0gcmVxdWlyZSAnLi91dGlscydcbkthY2hlbCAgPSByZXF1aXJlICcuL2thY2hlbCdcblxuY2xhc3MgQWxhcm0gZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonYWxhcm0nKSAtPiBcbiAgICAgICAgX1xuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICAgICAgQHJlcXVlc3REYXRhICdjbG9jaydcbiAgICAgICAgXG4gICAgb25EYXRhOiAoZGF0YSkgPT4gXG4gICAgICAgIFxuICAgICAgICBAaG91ciAgLmlubmVySFRNTCA9IGRhdGEuc3RyLmhvdXJcbiAgICAgICAgQG1pbnV0ZS5pbm5lckhUTUwgPSBkYXRhLnN0ci5taW51dGVcbiAgICAgICAgQHNlY29uZC5pbm5lckhUTUwgPSBkYXRhLnN0ci5zZWNvbmRcbiAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgb25Mb2FkOiAtPlxuICAgICAgICBcbiAgICAgICAgQGhvdXIgICA9IGVsZW0gY2xhc3M6J2FsYXJtLWhvdXInIFxuICAgICAgICBAbWludXRlID0gZWxlbSBjbGFzczonYWxhcm0tbWludXRlJ1xuICAgICAgICBAc2Vjb25kID0gZWxlbSBjbGFzczonYWxhcm0tc2Vjb25kJ1xuICAgICAgICAgICAgIFxuICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBlbGVtIGNsYXNzOidhbGFybS1kaWdpdHMnIGNoaWxkcmVuOiBbQGhvdXIsIEBtaW51dGUsIEBzZWNvbmRdXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBBbGFybVxuIl19
//# sourceURL=../coffee/alarm.coffee
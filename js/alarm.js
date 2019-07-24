// koffee 1.3.0

/*
 0000000   000       0000000   00000000   00     00    
000   000  000      000   000  000   000  000   000    
000000000  000      000000000  0000000    000000000    
000   000  000      000   000  000   000  000 0 000    
000   000  0000000  000   000  000   000  000   000
 */
var Alarm, Kachel, _, elem, klog, kstr, post, ref, utils,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, elem = ref.elem, klog = ref.klog, kstr = ref.kstr, _ = ref._;

utils = require('./utils');

Kachel = require('./kachel');

Alarm = (function(superClass) {
    extend(Alarm, superClass);

    function Alarm(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'alarm';
        this.onData = bind(this.onData, this);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxhcm0uanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLG9EQUFBO0lBQUE7Ozs7QUFRQSxNQUFnQyxPQUFBLENBQVEsS0FBUixDQUFoQyxFQUFFLGVBQUYsRUFBUSxlQUFSLEVBQWMsZUFBZCxFQUFvQixlQUFwQixFQUEwQjs7QUFFMUIsS0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSOztBQUNWLE1BQUEsR0FBVSxPQUFBLENBQVEsVUFBUjs7QUFFSjs7O0lBRUMsZUFBQyxHQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxrREFBUzs7UUFFViwyR0FBQSxTQUFBO1FBRUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxPQUFiO0lBSkQ7O29CQU1ILE1BQUEsR0FBUSxTQUFDLElBQUQ7UUFFSixJQUFDLENBQUEsSUFBTSxDQUFDLFNBQVIsR0FBb0IsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUM3QixJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVIsR0FBb0IsSUFBSSxDQUFDLEdBQUcsQ0FBQztlQUM3QixJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVIsR0FBb0IsSUFBSSxDQUFDLEdBQUcsQ0FBQztJQUp6Qjs7b0JBWVIsTUFBQSxHQUFRLFNBQUE7UUFFSixJQUFDLENBQUEsSUFBRCxHQUFVLElBQUEsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sWUFBTjtTQUFMO1FBQ1YsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFBLENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLGNBQU47U0FBTDtRQUNWLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQSxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxjQUFOO1NBQUw7ZUFFVixJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsSUFBQSxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxjQUFOO1lBQXFCLFFBQUEsRUFBVSxDQUFDLElBQUMsQ0FBQSxJQUFGLEVBQVEsSUFBQyxDQUFBLE1BQVQsRUFBaUIsSUFBQyxDQUFBLE1BQWxCLENBQS9CO1NBQUwsQ0FBbEI7SUFOSTs7OztHQXBCUTs7QUE0QnBCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMCAgICAgMDAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgXG4wMDAwMDAwMDAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMDAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgICAgXG4wMDAgICAwMDAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgXG4jIyNcblxueyBwb3N0LCBlbGVtLCBrbG9nLCBrc3RyLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbnV0aWxzICAgPSByZXF1aXJlICcuL3V0aWxzJ1xuS2FjaGVsICA9IHJlcXVpcmUgJy4va2FjaGVsJ1xuXG5jbGFzcyBBbGFybSBleHRlbmRzIEthY2hlbFxuICAgICAgICBcbiAgICBAOiAoQGthY2hlbElkOidhbGFybScpIC0+IFxuICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICAgICAgQHJlcXVlc3REYXRhICdjbG9jaydcbiAgICAgICAgXG4gICAgb25EYXRhOiAoZGF0YSkgPT4gXG4gICAgICAgIFxuICAgICAgICBAaG91ciAgLmlubmVySFRNTCA9IGRhdGEuc3RyLmhvdXJcbiAgICAgICAgQG1pbnV0ZS5pbm5lckhUTUwgPSBkYXRhLnN0ci5taW51dGVcbiAgICAgICAgQHNlY29uZC5pbm5lckhUTUwgPSBkYXRhLnN0ci5zZWNvbmRcbiAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgb25Mb2FkOiAtPlxuICAgICAgICBcbiAgICAgICAgQGhvdXIgICA9IGVsZW0gY2xhc3M6J2FsYXJtLWhvdXInIFxuICAgICAgICBAbWludXRlID0gZWxlbSBjbGFzczonYWxhcm0tbWludXRlJ1xuICAgICAgICBAc2Vjb25kID0gZWxlbSBjbGFzczonYWxhcm0tc2Vjb25kJ1xuICAgICAgICAgICAgIFxuICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBlbGVtIGNsYXNzOidhbGFybS1kaWdpdHMnIGNoaWxkcmVuOiBbQGhvdXIsIEBtaW51dGUsIEBzZWNvbmRdXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBBbGFybVxuIl19
//# sourceURL=../coffee/alarm.coffee
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
        post.toMain('requestData', 'clock', this.id);
        post.on('data', this.onData);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxhcm0uanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLG9EQUFBO0lBQUE7Ozs7QUFRQSxNQUFnQyxPQUFBLENBQVEsS0FBUixDQUFoQyxFQUFFLGVBQUYsRUFBUSxlQUFSLEVBQWMsZUFBZCxFQUFvQixlQUFwQixFQUEwQjs7QUFFMUIsS0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSOztBQUNWLE1BQUEsR0FBVSxPQUFBLENBQVEsVUFBUjs7QUFFSjs7O0lBRUMsZUFBQyxHQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxrREFBUzs7UUFFViwyR0FBQSxTQUFBO1FBRUEsSUFBSSxDQUFDLE1BQUwsQ0FBWSxhQUFaLEVBQTBCLE9BQTFCLEVBQWtDLElBQUMsQ0FBQSxFQUFuQztRQUNBLElBQUksQ0FBQyxFQUFMLENBQVEsTUFBUixFQUFlLElBQUMsQ0FBQSxNQUFoQjtJQUxEOztvQkFPSCxNQUFBLEdBQVEsU0FBQyxJQUFEO1FBRUosSUFBQyxDQUFBLElBQU0sQ0FBQyxTQUFSLEdBQW9CLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDN0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFSLEdBQW9CLElBQUksQ0FBQyxHQUFHLENBQUM7ZUFDN0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFSLEdBQW9CLElBQUksQ0FBQyxHQUFHLENBQUM7SUFKekI7O29CQVlSLE1BQUEsR0FBUSxTQUFBO1FBRUosSUFBQyxDQUFBLElBQUQsR0FBVSxJQUFBLENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFlBQU47U0FBTDtRQUNWLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQSxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxjQUFOO1NBQUw7UUFDVixJQUFDLENBQUEsTUFBRCxHQUFVLElBQUEsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sY0FBTjtTQUFMO2VBRVYsSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLElBQUEsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sY0FBTjtZQUFxQixRQUFBLEVBQVUsQ0FBQyxJQUFDLENBQUEsSUFBRixFQUFRLElBQUMsQ0FBQSxNQUFULEVBQWlCLElBQUMsQ0FBQSxNQUFsQixDQUEvQjtTQUFMLENBQWxCO0lBTkk7Ozs7R0FyQlE7O0FBNkJwQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAgICAgIDAwICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgIFxuMDAwMDAwMDAwICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAgIFxuMDAwICAgMDAwICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgIFxuIyMjXG5cbnsgcG9zdCwgZWxlbSwga2xvZywga3N0ciwgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG51dGlscyAgID0gcmVxdWlyZSAnLi91dGlscydcbkthY2hlbCAgPSByZXF1aXJlICcuL2thY2hlbCdcblxuY2xhc3MgQWxhcm0gZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonYWxhcm0nKSAtPiBcbiAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgICAgIHBvc3QudG9NYWluICdyZXF1ZXN0RGF0YScgJ2Nsb2NrJyBAaWRcbiAgICAgICAgcG9zdC5vbiAnZGF0YScgQG9uRGF0YVxuICAgICAgICBcbiAgICBvbkRhdGE6IChkYXRhKSA9PiBcbiAgICAgICAgXG4gICAgICAgIEBob3VyICAuaW5uZXJIVE1MID0gZGF0YS5zdHIuaG91clxuICAgICAgICBAbWludXRlLmlubmVySFRNTCA9IGRhdGEuc3RyLm1pbnV0ZVxuICAgICAgICBAc2Vjb25kLmlubmVySFRNTCA9IGRhdGEuc3RyLnNlY29uZFxuICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBvbkxvYWQ6IC0+XG4gICAgICAgIFxuICAgICAgICBAaG91ciAgID0gZWxlbSBjbGFzczonYWxhcm0taG91cicgXG4gICAgICAgIEBtaW51dGUgPSBlbGVtIGNsYXNzOidhbGFybS1taW51dGUnXG4gICAgICAgIEBzZWNvbmQgPSBlbGVtIGNsYXNzOidhbGFybS1zZWNvbmQnXG4gICAgICAgICAgICAgXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGVsZW0gY2xhc3M6J2FsYXJtLWRpZ2l0cycgY2hpbGRyZW46IFtAaG91ciwgQG1pbnV0ZSwgQHNlY29uZF1cbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEFsYXJtXG4iXX0=
//# sourceURL=../coffee/alarm.coffee
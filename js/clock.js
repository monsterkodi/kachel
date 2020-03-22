// koffee 1.12.0

/*
 0000000  000       0000000    0000000  000   000  
000       000      000   000  000       000  000   
000       000      000   000  000       0000000    
000       000      000   000  000       000  000   
 0000000  0000000   0000000    0000000  000   000
 */
var Clock, Kachel, _, utils,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

_ = require('kxk')._;

utils = require('./utils');

Kachel = require('./kachel');

Clock = (function(superClass) {
    extend(Clock, superClass);

    function Clock(arg) {
        var ref;
        this.kachelId = (ref = arg.kachelId) != null ? ref : 'clock';
        this.onData = bind(this.onData, this);
        _;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xvY2suanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJjbG9jay5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsdUJBQUE7SUFBQTs7OztBQVFFLElBQU0sT0FBQSxDQUFRLEtBQVI7O0FBRVIsS0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSOztBQUNWLE1BQUEsR0FBVSxPQUFBLENBQVEsVUFBUjs7QUFFSjs7O0lBRUMsZUFBQyxHQUFEO0FBQ0MsWUFBQTtRQURBLElBQUMsQ0FBQSxnREFBUzs7UUFDVjtRQUNBLDJHQUFBLFNBQUE7UUFFQSxJQUFDLENBQUEsV0FBRCxDQUFhLE9BQWI7SUFKRDs7b0JBTUgsTUFBQSxHQUFRLFNBQUMsSUFBRDtRQUVKLElBQVUsQ0FBSSxJQUFDLENBQUEsSUFBZjtBQUFBLG1CQUFBOztRQUVBLElBQUMsQ0FBQSxJQUFNLENBQUMsWUFBUixDQUFxQixXQUFyQixFQUFpQyxTQUFBLEdBQVMsQ0FBQyxFQUFBLEdBQUssSUFBSSxDQUFDLElBQVYsR0FBaUIsSUFBSSxDQUFDLE1BQUwsR0FBYyxDQUFoQyxDQUFULEdBQTJDLEdBQTVFO1FBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLENBQXFCLFdBQXJCLEVBQWlDLFNBQUEsR0FBUyxDQUFDLENBQUEsR0FBSSxJQUFJLENBQUMsTUFBVCxHQUFrQixJQUFJLENBQUMsTUFBTCxHQUFjLEVBQWpDLENBQVQsR0FBNkMsR0FBOUU7ZUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsQ0FBcUIsV0FBckIsRUFBaUMsU0FBQSxHQUFTLENBQUMsQ0FBQSxHQUFJLElBQUksQ0FBQyxNQUFWLENBQVQsR0FBMEIsR0FBM0Q7SUFOSTs7b0JBY1IsTUFBQSxHQUFRLFNBQUE7QUFFSixZQUFBO1FBQUEsR0FBQSxHQUFNLEtBQUssQ0FBQyxHQUFOLENBQVU7WUFBQSxJQUFBLEVBQUssT0FBTDtTQUFWO1FBQ04sSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQWtCLEdBQWxCO1FBRUEsSUFBQSxHQUFPLEtBQUssQ0FBQyxNQUFOLENBQWE7WUFBQSxNQUFBLEVBQU8sRUFBUDtZQUFVLElBQUEsRUFBSyxNQUFmO1lBQXNCLEdBQUEsRUFBSSxHQUExQjtTQUFiO0FBRVAsYUFBUywyQkFBVDtZQUNJLEtBQUssQ0FBQyxNQUFOLENBQWEsSUFBYixFQUFtQixNQUFuQixFQUEwQjtnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFFBQU47Z0JBQWUsRUFBQSxFQUFHLEVBQWxCO2dCQUFxQixFQUFBLEVBQUcsRUFBeEI7Z0JBQTJCLFNBQUEsRUFBVSxTQUFBLEdBQVMsQ0FBQyxFQUFBLEdBQUcsQ0FBSCxHQUFLLENBQU4sQ0FBVCxHQUFpQixHQUF0RDthQUExQjtBQURKO1FBR0EsSUFBQyxDQUFBLElBQUQsR0FBVSxLQUFLLENBQUMsTUFBTixDQUFhLElBQWIsRUFBbUIsTUFBbkIsRUFBMEI7WUFBQSxFQUFBLEVBQUcsQ0FBSDtZQUFLLEVBQUEsRUFBRyxDQUFDLEVBQVQ7WUFBWSxDQUFBLEtBQUEsQ0FBQSxFQUFNLE1BQWxCO1NBQTFCO1FBQ1YsSUFBQyxDQUFBLE1BQUQsR0FBVSxLQUFLLENBQUMsTUFBTixDQUFhLElBQWIsRUFBbUIsTUFBbkIsRUFBMEI7WUFBQSxFQUFBLEVBQUcsQ0FBSDtZQUFLLEVBQUEsRUFBRyxDQUFDLEVBQVQ7WUFBWSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFFBQWxCO1NBQTFCO2VBQ1YsSUFBQyxDQUFBLE1BQUQsR0FBVSxLQUFLLENBQUMsTUFBTixDQUFhLElBQWIsRUFBbUIsTUFBbkIsRUFBMEI7WUFBQSxFQUFBLEVBQUcsQ0FBSDtZQUFLLEVBQUEsRUFBRyxDQUFDLEVBQVQ7WUFBWSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFFBQWxCO1NBQTFCO0lBWk47Ozs7R0F0QlE7O0FBb0NwQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4wMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbjAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiMjI1xuXG57IF8gfSA9IHJlcXVpcmUgJ2t4aydcblxudXRpbHMgICA9IHJlcXVpcmUgJy4vdXRpbHMnXG5LYWNoZWwgID0gcmVxdWlyZSAnLi9rYWNoZWwnXG5cbmNsYXNzIENsb2NrIGV4dGVuZHMgS2FjaGVsXG4gICAgICAgIFxuICAgIEA6IChAa2FjaGVsSWQ6J2Nsb2NrJykgLT4gXG4gICAgICAgIF9cbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgICAgIEByZXF1ZXN0RGF0YSAnY2xvY2snXG4gICAgXG4gICAgb25EYXRhOiAoZGF0YSkgPT4gXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IEBob3VyXG4gICAgICAgIFxuICAgICAgICBAaG91ciAgLnNldEF0dHJpYnV0ZSAndHJhbnNmb3JtJyBcInJvdGF0ZSgjezMwICogZGF0YS5ob3VyICsgZGF0YS5taW51dGUgLyAyfSlcIlxuICAgICAgICBAbWludXRlLnNldEF0dHJpYnV0ZSAndHJhbnNmb3JtJyBcInJvdGF0ZSgjezYgKiBkYXRhLm1pbnV0ZSArIGRhdGEuc2Vjb25kIC8gMTB9KVwiXG4gICAgICAgIEBzZWNvbmQuc2V0QXR0cmlidXRlICd0cmFuc2Zvcm0nIFwicm90YXRlKCN7NiAqIGRhdGEuc2Vjb25kfSlcIlxuICAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgb25Mb2FkOiAtPlxuICAgICAgICBcbiAgICAgICAgc3ZnID0gdXRpbHMuc3ZnIGNsc3M6J2Nsb2NrJ1xuICAgICAgICBAbWFpbi5hcHBlbmRDaGlsZCBzdmdcbiAgICAgICAgXG4gICAgICAgIGZhY2UgPSB1dGlscy5jaXJjbGUgcmFkaXVzOjQ3IGNsc3M6J2ZhY2UnIHN2ZzpzdmdcbiAgICAgICAgXG4gICAgICAgIGZvciBtIGluIFswLi4xMV1cbiAgICAgICAgICAgIHV0aWxzLmFwcGVuZCBmYWNlLCAnbGluZScgY2xhc3M6J21pbm1yaycgeTE6NDUgeTI6NDcgdHJhbnNmb3JtOlwicm90YXRlKCN7MzAqbSo1fSlcIiBcbiAgICBcbiAgICAgICAgQGhvdXIgICA9IHV0aWxzLmFwcGVuZCBmYWNlLCAnbGluZScgeTE6MCB5MjotMzIgY2xhc3M6J2hvdXInIFxuICAgICAgICBAbWludXRlID0gdXRpbHMuYXBwZW5kIGZhY2UsICdsaW5lJyB5MTowIHkyOi00MiBjbGFzczonbWludXRlJ1xuICAgICAgICBAc2Vjb25kID0gdXRpbHMuYXBwZW5kIGZhY2UsICdsaW5lJyB5MTowIHkyOi00MiBjbGFzczonc2Vjb25kJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBDbG9ja1xuIl19
//# sourceURL=../coffee/clock.coffee
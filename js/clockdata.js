// koffee 1.3.0

/*
 0000000  000       0000000    0000000  000   000  0000000     0000000   000000000   0000000   
000       000      000   000  000       000  000   000   000  000   000     000     000   000  
000       000      000   000  000       0000000    000   000  000000000     000     000000000  
000       000      000   000  000       000  000   000   000  000   000     000     000   000  
 0000000  0000000   0000000    0000000  000   000  0000000    000   000     000     000   000
 */
var Clockdata, _, klog, kstr, post, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

ref = require('kxk'), post = ref.post, klog = ref.klog, kstr = ref.kstr, _ = ref._;

Clockdata = (function() {
    function Clockdata() {
        this.setData = bind(this.setData, this);
        var info;
        info = (function(_this) {
            return function() {
                var hourStr, hours, minuteStr, minutes, secondStr, seconds, time;
                time = new Date();
                hours = time.getHours();
                minutes = time.getMinutes();
                seconds = time.getSeconds();
                hourStr = kstr.lpad(hours, 2, '0');
                minuteStr = kstr.lpad(minutes, 2, '0');
                secondStr = kstr.lpad(seconds, 2, '0');
                return _this.setData({
                    hour: hours,
                    minute: minutes,
                    second: seconds,
                    str: {
                        hour: hourStr,
                        minute: minuteStr,
                        second: secondStr
                    }
                });
            };
        })(this);
        setInterval(info, 1000);
        this.receivers = [];
    }

    Clockdata.prototype.addReceiver = function(wid) {
        return this.receivers.push(wid);
    };

    Clockdata.prototype.setData = function(data) {
        var i, len, receiver, ref1, results;
        this.data = data;
        ref1 = this.receivers;
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
            receiver = ref1[i];
            results.push(post.toWin(receiver, 'data', this.data));
        }
        return results;
    };

    Clockdata.prototype.getData = function() {
        return this.data;
    };

    return Clockdata;

})();

module.exports = Clockdata;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xvY2tkYXRhLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxtQ0FBQTtJQUFBOztBQVFBLE1BQTBCLE9BQUEsQ0FBUSxLQUFSLENBQTFCLEVBQUUsZUFBRixFQUFRLGVBQVIsRUFBYyxlQUFkLEVBQW9COztBQUVkO0lBRUMsbUJBQUE7O0FBQ0MsWUFBQTtRQUFBLElBQUEsR0FBTyxDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFBO0FBQ0gsb0JBQUE7Z0JBQUEsSUFBQSxHQUFPLElBQUksSUFBSixDQUFBO2dCQUVQLEtBQUEsR0FBVSxJQUFJLENBQUMsUUFBTCxDQUFBO2dCQUNWLE9BQUEsR0FBVSxJQUFJLENBQUMsVUFBTCxDQUFBO2dCQUNWLE9BQUEsR0FBVSxJQUFJLENBQUMsVUFBTCxDQUFBO2dCQUVWLE9BQUEsR0FBWSxJQUFJLENBQUMsSUFBTCxDQUFVLEtBQVYsRUFBbUIsQ0FBbkIsRUFBcUIsR0FBckI7Z0JBQ1osU0FBQSxHQUFZLElBQUksQ0FBQyxJQUFMLENBQVUsT0FBVixFQUFtQixDQUFuQixFQUFxQixHQUFyQjtnQkFDWixTQUFBLEdBQVksSUFBSSxDQUFDLElBQUwsQ0FBVSxPQUFWLEVBQW1CLENBQW5CLEVBQXFCLEdBQXJCO3VCQUVaLEtBQUMsQ0FBQSxPQUFELENBQ0k7b0JBQUEsSUFBQSxFQUFRLEtBQVI7b0JBQ0EsTUFBQSxFQUFRLE9BRFI7b0JBRUEsTUFBQSxFQUFRLE9BRlI7b0JBR0EsR0FBQSxFQUNRO3dCQUFBLElBQUEsRUFBUSxPQUFSO3dCQUNBLE1BQUEsRUFBUSxTQURSO3dCQUVBLE1BQUEsRUFBUSxTQUZSO3FCQUpSO2lCQURKO1lBWEc7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO1FBb0JQLFdBQUEsQ0FBWSxJQUFaLEVBQWtCLElBQWxCO1FBQ0EsSUFBQyxDQUFBLFNBQUQsR0FBYTtJQXRCZDs7d0JBd0JILFdBQUEsR0FBYSxTQUFDLEdBQUQ7ZUFBUyxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsR0FBaEI7SUFBVDs7d0JBRWIsT0FBQSxHQUFTLFNBQUMsSUFBRDtBQUVMLFlBQUE7UUFGTSxJQUFDLENBQUEsT0FBRDtBQUVOO0FBQUE7YUFBQSxzQ0FBQTs7eUJBQ0ksSUFBSSxDQUFDLEtBQUwsQ0FBVyxRQUFYLEVBQXFCLE1BQXJCLEVBQTRCLElBQUMsQ0FBQSxJQUE3QjtBQURKOztJQUZLOzt3QkFLVCxPQUFBLEdBQVMsU0FBQTtlQUFHLElBQUMsQ0FBQTtJQUFKOzs7Ozs7QUFFYixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbjAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4wMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMDAgIFxuMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4jIyNcblxueyBwb3N0LCBrbG9nLCBrc3RyLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbmNsYXNzIENsb2NrZGF0YVxuICAgICAgICBcbiAgICBAOiAtPlxuICAgICAgICBpbmZvID0gPT4gXG4gICAgICAgICAgICB0aW1lID0gbmV3IERhdGUoKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBob3VycyAgID0gdGltZS5nZXRIb3VycygpXG4gICAgICAgICAgICBtaW51dGVzID0gdGltZS5nZXRNaW51dGVzKClcbiAgICAgICAgICAgIHNlY29uZHMgPSB0aW1lLmdldFNlY29uZHMoKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBob3VyU3RyICAgPSBrc3RyLmxwYWQgaG91cnMsICAgMiAnMCdcbiAgICAgICAgICAgIG1pbnV0ZVN0ciA9IGtzdHIubHBhZCBtaW51dGVzLCAyICcwJ1xuICAgICAgICAgICAgc2Vjb25kU3RyID0ga3N0ci5scGFkIHNlY29uZHMsIDIgJzAnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEBzZXREYXRhIFxuICAgICAgICAgICAgICAgIGhvdXI6ICAgaG91cnNcbiAgICAgICAgICAgICAgICBtaW51dGU6IG1pbnV0ZXNcbiAgICAgICAgICAgICAgICBzZWNvbmQ6IHNlY29uZHNcbiAgICAgICAgICAgICAgICBzdHI6XG4gICAgICAgICAgICAgICAgICAgICAgICBob3VyOiAgIGhvdXJTdHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbnV0ZTogbWludXRlU3RyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWNvbmQ6IHNlY29uZFN0clxuICAgICAgICAgICAgXG4gICAgICAgIHNldEludGVydmFsIGluZm8sIDEwMDBcbiAgICAgICAgQHJlY2VpdmVycyA9IFtdXG5cbiAgICBhZGRSZWNlaXZlcjogKHdpZCkgLT4gQHJlY2VpdmVycy5wdXNoIHdpZFxuICAgICAgICBcbiAgICBzZXREYXRhOiAoQGRhdGEpID0+XG4gICAgICAgIFxuICAgICAgICBmb3IgcmVjZWl2ZXIgaW4gQHJlY2VpdmVyc1xuICAgICAgICAgICAgcG9zdC50b1dpbiByZWNlaXZlciwgJ2RhdGEnIEBkYXRhXG4gICAgICAgIFxuICAgIGdldERhdGE6IC0+IEBkYXRhXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBDbG9ja2RhdGFcbiJdfQ==
//# sourceURL=../coffee/clockdata.coffee
// koffee 1.3.0

/*
0000000     0000000   000000000   0000000 
000   000  000   000     000     000   000
000   000  000000000     000     000000000
000   000  000   000     000     000   000
0000000    000   000     000     000   000
 */
var Clock, Data, Keyboard, Mouse, Sysinfo, _, ioHook, klog, kstr, post, ref, sysinfo,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf;

ref = require('kxk'), post = ref.post, klog = ref.klog, kstr = ref.kstr, _ = ref._;

ioHook = require('iohook');

sysinfo = require('systeminformation');

Data = (function() {
    function Data() {
        this.send = bind(this.send, this);
        this.slowTick = bind(this.slowTick, this);
        this.onRequestData = bind(this.onRequestData, this);
        ioHook.start();
        this.providers = {
            mouse: new Mouse,
            keyboard: new Keyboard
        };
        post.on('requestData', this.onRequestData);
        setInterval(this.slowTick, 1000);
    }

    Data.prototype.onRequestData = function(provider, wid) {
        if (!this.providers[provider]) {
            this.providers[provider] = new {
                clock: Clock,
                sysinfo: Sysinfo
            }[provider];
            this.providers[provider].receivers = [];
        }
        if (indexOf.call(this.providers[provider].receivers, wid) < 0) {
            return this.providers[provider].receivers.push(wid);
        }
    };

    Data.prototype.slowTick = function() {
        var name, provider, ref1, results;
        ref1 = this.providers;
        results = [];
        for (name in ref1) {
            provider = ref1[name];
            if (provider.tick === 'slow') {
                results.push(provider.onTick(this));
            } else {
                results.push(void 0);
            }
        }
        return results;
    };

    Data.prototype.send = function(provider, data) {
        var i, len, receiver, ref1, results;
        ref1 = provider.receivers;
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
            receiver = ref1[i];
            results.push(post.toWin(receiver, 'data', data));
        }
        return results;
    };

    return Data;

})();


/*
 0000000  000       0000000    0000000  000   000  
000       000      000   000  000       000  000   
000       000      000   000  000       0000000    
000       000      000   000  000       000  000   
 0000000  0000000   0000000    0000000  000   000
 */

Clock = (function() {
    function Clock(name1, tick) {
        this.name = name1 != null ? name1 : 'clock';
        this.tick = tick != null ? tick : 'slow';
        this.onTick = bind(this.onTick, this);
    }

    Clock.prototype.onTick = function(data) {
        var hourStr, hours, minuteStr, minutes, secondStr, seconds, time;
        time = new Date();
        hours = time.getHours();
        minutes = time.getMinutes();
        seconds = time.getSeconds();
        hourStr = kstr.lpad(hours, 2, '0');
        minuteStr = kstr.lpad(minutes, 2, '0');
        secondStr = kstr.lpad(seconds, 2, '0');
        return data.send(this, {
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

    return Clock;

})();

Sysinfo = (function() {
    function Sysinfo(name1, tick) {
        this.name = name1 != null ? name1 : 'sysinfo';
        this.tick = tick != null ? tick : 'slow';
        this.onTick = bind(this.onTick, this);
    }

    Sysinfo.prototype.onTick = function(data) {
        return sysinfo.getDynamicData((function(_this) {
            return function(d) {
                return data.send(_this, d);
            };
        })(this));
    };

    return Sysinfo;

})();

Mouse = (function() {
    function Mouse(name1, receivers) {
        this.name = name1 != null ? name1 : 'mouse';
        this.receivers = receivers != null ? receivers : [];
        this.onEvent = bind(this.onEvent, this);
        ioHook.on('mousewheel', this.onEvent);
        ioHook.on('mousemove', this.onEvent);
        ioHook.on('mousedown', this.onEvent);
        ioHook.on('mouseup', this.onEvent);
        this.last = Date.now();
        this.interval = parseInt(1000 / 60);
    }

    Mouse.prototype.onEvent = function(event) {
        var i, len, now, receiver, ref1, results;
        now = Date.now();
        if (now - this.last > this.interval) {
            this.last = now;
            post.toMain(this.name, event);
            ref1 = this.receivers;
            results = [];
            for (i = 0, len = ref1.length; i < len; i++) {
                receiver = ref1[i];
                results.push(post.toWin(receiver, 'data', event));
            }
            return results;
        }
    };

    return Mouse;

})();

Keyboard = (function() {
    function Keyboard(name1, receivers) {
        this.name = name1 != null ? name1 : 'keyboard';
        this.receivers = receivers != null ? receivers : [];
        this.onEvent = bind(this.onEvent, this);
        ioHook.on('keydown', this.onEvent);
        ioHook.on('keyup', this.onEvent);
    }

    Keyboard.prototype.onEvent = function(event) {
        var i, len, receiver, ref1, results;
        post.toMain(this.name, event);
        ref1 = this.receivers;
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
            receiver = ref1[i];
            results.push(post.toWin(receiver, this.name, event));
        }
        return results;
    };

    return Keyboard;

})();

module.exports = Data;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsZ0ZBQUE7SUFBQTs7O0FBUUEsTUFBMEIsT0FBQSxDQUFRLEtBQVIsQ0FBMUIsRUFBRSxlQUFGLEVBQVEsZUFBUixFQUFjLGVBQWQsRUFBb0I7O0FBRXBCLE1BQUEsR0FBVSxPQUFBLENBQVEsUUFBUjs7QUFDVixPQUFBLEdBQVUsT0FBQSxDQUFRLG1CQUFSOztBQUVKO0lBRUMsY0FBQTs7OztRQUVDLE1BQU0sQ0FBQyxLQUFQLENBQUE7UUFFQSxJQUFDLENBQUEsU0FBRCxHQUNJO1lBQUEsS0FBQSxFQUFVLElBQUksS0FBZDtZQUNBLFFBQUEsRUFBVSxJQUFJLFFBRGQ7O1FBR0osSUFBSSxDQUFDLEVBQUwsQ0FBUSxhQUFSLEVBQXNCLElBQUMsQ0FBQSxhQUF2QjtRQUVBLFdBQUEsQ0FBWSxJQUFDLENBQUEsUUFBYixFQUF1QixJQUF2QjtJQVZEOzttQkFZSCxhQUFBLEdBQWUsU0FBQyxRQUFELEVBQVcsR0FBWDtRQUlYLElBQUcsQ0FBSSxJQUFDLENBQUEsU0FBVSxDQUFBLFFBQUEsQ0FBbEI7WUFDSSxJQUFDLENBQUEsU0FBVSxDQUFBLFFBQUEsQ0FBWCxHQUF1QixJQUFJO2dCQUFDLEtBQUEsRUFBTSxLQUFQO2dCQUFjLE9BQUEsRUFBUSxPQUF0QjthQUErQixDQUFBLFFBQUE7WUFDMUQsSUFBQyxDQUFBLFNBQVUsQ0FBQSxRQUFBLENBQVMsQ0FBQyxTQUFyQixHQUFpQyxHQUZyQzs7UUFJQSxJQUFHLGFBQVcsSUFBQyxDQUFBLFNBQVUsQ0FBQSxRQUFBLENBQVMsQ0FBQyxTQUFoQyxFQUFBLEdBQUEsS0FBSDttQkFDSSxJQUFDLENBQUEsU0FBVSxDQUFBLFFBQUEsQ0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUEvQixDQUFvQyxHQUFwQyxFQURKOztJQVJXOzttQkFXZixRQUFBLEdBQVUsU0FBQTtBQUVOLFlB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QUEsc0NBQUE7OzZCQUVJLElBQUksQ0FBQyxLQUFMLENBQVcsUUFBWCxFQUFxQixNQUFyQixFQUE2QixLQUE3QjtBQUZKOzJCQUhKOztJQUhLOzs7Ozs7QUFnQlA7SUFFQyxrQkFBQyxLQUFELEVBQWtCLFNBQWxCO1FBQUMsSUFBQyxDQUFBLHVCQUFELFFBQU07UUFBVyxJQUFDLENBQUEsZ0NBQUQsWUFBVzs7UUFFNUIsTUFBTSxDQUFDLEVBQVAsQ0FBVSxTQUFWLEVBQW9CLElBQUMsQ0FBQSxPQUFyQjtRQUNBLE1BQU0sQ0FBQyxFQUFQLENBQVUsT0FBVixFQUFvQixJQUFDLENBQUEsT0FBckI7SUFIRDs7dUJBS0gsT0FBQSxHQUFTLFNBQUMsS0FBRDtBQUVMLFlBQUE7UUFBQSxJQUFJLENBQUMsTUFBTCxDQUFZLElBQUMsQ0FBQSxJQUFiLEVBQW1CLEtBQW5CO0FBQ0E7QUFBQTthQUFBLHNDQUFBOzt5QkFDSSxJQUFJLENBQUMsS0FBTCxDQUFXLFFBQVgsRUFBcUIsSUFBQyxDQUFBLElBQXRCLEVBQTRCLEtBQTVCO0FBREo7O0lBSEs7Ozs7OztBQU1iLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwMDAwMCBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMFxuMDAwICAgMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDBcbjAwMDAwMDAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgcG9zdCwga2xvZywga3N0ciwgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5pb0hvb2sgID0gcmVxdWlyZSAnaW9ob29rJ1xuc3lzaW5mbyA9IHJlcXVpcmUgJ3N5c3RlbWluZm9ybWF0aW9uJ1xuXG5jbGFzcyBEYXRhXG5cbiAgICBAOiAtPlxuXG4gICAgICAgIGlvSG9vay5zdGFydCgpXG4gICAgICAgIFxuICAgICAgICBAcHJvdmlkZXJzID0gXG4gICAgICAgICAgICBtb3VzZTogICAgbmV3IE1vdXNlXG4gICAgICAgICAgICBrZXlib2FyZDogbmV3IEtleWJvYXJkXG4gICAgICAgIFxuICAgICAgICBwb3N0Lm9uICdyZXF1ZXN0RGF0YScgQG9uUmVxdWVzdERhdGFcbiAgICAgICAgXG4gICAgICAgIHNldEludGVydmFsIEBzbG93VGljaywgMTAwMFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgb25SZXF1ZXN0RGF0YTogKHByb3ZpZGVyLCB3aWQpID0+XG4gICAgICAgIFxuICAgICAgICAjIGtsb2cgXCJEYXRhLm9uUmVxdWVzdERhdGEgcHJvdmlkZXI6I3trc3RyIHByb3ZpZGVyfSB3aWQ6I3trc3RyIHdpZH1cIlxuICAgICAgICAgICAgXG4gICAgICAgIGlmIG5vdCBAcHJvdmlkZXJzW3Byb3ZpZGVyXVxuICAgICAgICAgICAgQHByb3ZpZGVyc1twcm92aWRlcl0gPSBuZXcge2Nsb2NrOkNsb2NrLCBzeXNpbmZvOlN5c2luZm99W3Byb3ZpZGVyXVxuICAgICAgICAgICAgQHByb3ZpZGVyc1twcm92aWRlcl0ucmVjZWl2ZXJzID0gW11cbiAgICAgICAgICAgIFxuICAgICAgICBpZiB3aWQgbm90IGluIEBwcm92aWRlcnNbcHJvdmlkZXJdLnJlY2VpdmVyc1xuICAgICAgICAgICAgQHByb3ZpZGVyc1twcm92aWRlcl0ucmVjZWl2ZXJzLnB1c2ggd2lkIFxuXG4gICAgc2xvd1RpY2s6ID0+XG4gICAgICAgIFxuICAgICAgICBmb3IgbmFtZSxwcm92aWRlciBvZiBAcHJvdmlkZXJzXG4gICAgICAgICAgICBpZiBwcm92aWRlci50aWNrID09ICdzbG93J1xuICAgICAgICAgICAgICAgIHByb3ZpZGVyLm9uVGljayBAXG4gICAgICAgIFxuICAgIHNlbmQ6IChwcm92aWRlciwgZGF0YSkgPT5cbiAgICAgICAgXG4gICAgICAgIGZvciByZWNlaXZlciBpbiBwcm92aWRlci5yZWNlaXZlcnNcbiAgICAgICAgICAgIHBvc3QudG9XaW4gcmVjZWl2ZXIsICdkYXRhJyBkYXRhXG4gICAgICAgICAgICBcbiMjI1xuIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4wMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbjAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiMjI1xuXG5jbGFzcyBDbG9ja1xuICAgICAgICBcbiAgICBAOiAoQG5hbWU9J2Nsb2NrJyBAdGljaz0nc2xvdycpIC0+XG4gICAgICAgIFxuICAgIG9uVGljazogKGRhdGEpID0+XG4gICAgICAgIFxuICAgICAgICB0aW1lID0gbmV3IERhdGUoKVxuICAgICAgICBcbiAgICAgICAgaG91cnMgICA9IHRpbWUuZ2V0SG91cnMoKVxuICAgICAgICBtaW51dGVzID0gdGltZS5nZXRNaW51dGVzKClcbiAgICAgICAgc2Vjb25kcyA9IHRpbWUuZ2V0U2Vjb25kcygpXG4gICAgICAgIFxuICAgICAgICBob3VyU3RyICAgPSBrc3RyLmxwYWQgaG91cnMsICAgMiAnMCdcbiAgICAgICAgbWludXRlU3RyID0ga3N0ci5scGFkIG1pbnV0ZXMsIDIgJzAnXG4gICAgICAgIHNlY29uZFN0ciA9IGtzdHIubHBhZCBzZWNvbmRzLCAyICcwJ1xuICAgICAgICBcbiAgICAgICAgZGF0YS5zZW5kIEAsXG4gICAgICAgICAgICBob3VyOiAgIGhvdXJzXG4gICAgICAgICAgICBtaW51dGU6IG1pbnV0ZXNcbiAgICAgICAgICAgIHNlY29uZDogc2Vjb25kc1xuICAgICAgICAgICAgc3RyOlxuICAgICAgICAgICAgICAgICAgICBob3VyOiAgIGhvdXJTdHJcbiAgICAgICAgICAgICAgICAgICAgbWludXRlOiBtaW51dGVTdHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kOiBzZWNvbmRTdHJcbiAgICAgICAgICAgICAgICAgICAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4jICAgICAgMDAwICAgICAwMDAgICAgICAgICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAwMDAwICAgXG5cbmNsYXNzIFN5c2luZm9cbiAgICAgICAgXG4gICAgQDogKEBuYW1lPSdzeXNpbmZvJyBAdGljaz0nc2xvdycpIC0+XG4gICAgICAgIFxuICAgIG9uVGljazogKGRhdGEpID0+XG4gICAgICAgIFxuICAgICAgICBzeXNpbmZvLmdldER5bmFtaWNEYXRhIChkKSA9PiBkYXRhLnNlbmQgQCwgZFxuXG4jIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG5cbmNsYXNzIE1vdXNlXG4gICAgXG4gICAgQDogKEBuYW1lPSdtb3VzZScgQHJlY2VpdmVycz1bXSkgLT5cbiAgICAgICAgXG4gICAgICAgIGlvSG9vay5vbiAnbW91c2V3aGVlbCcgQG9uRXZlbnRcbiAgICAgICAgaW9Ib29rLm9uICdtb3VzZW1vdmUnICBAb25FdmVudFxuICAgICAgICBpb0hvb2sub24gJ21vdXNlZG93bicgIEBvbkV2ZW50XG4gICAgICAgIGlvSG9vay5vbiAnbW91c2V1cCcgICAgQG9uRXZlbnRcbiAgICAgICAgXG4gICAgICAgIEBsYXN0ID0gRGF0ZS5ub3coKVxuICAgICAgICBAaW50ZXJ2YWwgPSBwYXJzZUludCAxMDAwLzYwXG4gICAgICAgIFxuICAgIG9uRXZlbnQ6IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIG5vdyA9IERhdGUubm93KClcbiAgICAgICAgaWYgbm93IC0gQGxhc3QgPiBAaW50ZXJ2YWxcbiAgICAgICAgICAgIEBsYXN0ID0gbm93XG4gICAgICAgICAgICBwb3N0LnRvTWFpbiBAbmFtZSwgZXZlbnRcbiAgICAgICAgICAgIGZvciByZWNlaXZlciBpbiBAcmVjZWl2ZXJzXG4gICAgICAgICAgICAgICAgIyBsb2cgXCJyZWNlaXZlcjoje2tzdHIgcmVjZWl2ZXJ9IG5hbWU6I3tAbmFtZX0gZXZlbnQ6I3trc3RyIGV2ZW50fVwiXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiByZWNlaXZlciwgJ2RhdGEnLCBldmVudFxuICAgICAgICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuXG5jbGFzcyBLZXlib2FyZFxuICAgIFxuICAgIEA6IChAbmFtZT0na2V5Ym9hcmQnIEByZWNlaXZlcnM9W10pIC0+XG4gICAgICAgIFxuICAgICAgICBpb0hvb2sub24gJ2tleWRvd24nIEBvbkV2ZW50XG4gICAgICAgIGlvSG9vay5vbiAna2V5dXAnICAgQG9uRXZlbnRcblxuICAgIG9uRXZlbnQ6IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIHBvc3QudG9NYWluIEBuYW1lLCBldmVudFxuICAgICAgICBmb3IgcmVjZWl2ZXIgaW4gQHJlY2VpdmVyc1xuICAgICAgICAgICAgcG9zdC50b1dpbiByZWNlaXZlciwgQG5hbWUsIGV2ZW50XG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBEYXRhXG5cbiJdfQ==
//# sourceURL=../coffee/data.coffee
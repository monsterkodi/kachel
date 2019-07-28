// koffee 1.3.0

/*
0000000     0000000   000000000   0000000 
000   000  000   000     000     000   000
000   000  000000000     000     000000000
000   000  000   000     000     000   000
0000000    000   000     000     000   000
 */
var Bounds, Clock, Data, Keyboard, Mouse, Sysinfo, _, electron, ioHook, klog, kstr, post, ref, sysinfo,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf;

ref = require('kxk'), post = ref.post, klog = ref.klog, kstr = ref.kstr, _ = ref._;

ioHook = require('iohook');

sysinfo = require('systeminformation');

electron = require('electron');

Data = (function() {
    function Data() {
        this.send = bind(this.send, this);
        this.slowTick = bind(this.slowTick, this);
        this.onRequestData = bind(this.onRequestData, this);
        ioHook.start();
        this.providers = {
            mouse: new Mouse,
            keyboard: new Keyboard,
            bounds: new Bounds
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
        this.r_max = 100;
        this.w_max = 100;
        this.rx_max = 100;
        this.tx_max = 100;
    }

    Sysinfo.prototype.onTick = function(data) {
        return sysinfo.getDynamicData((function(_this) {
            return function(d) {
                var nd, r_sec, rx_sec, tx_sec, w_sec;
                rx_sec = parseInt(d.networkStats[0].rx_sec);
                tx_sec = parseInt(d.networkStats[0].tx_sec);
                _this.rx_max = Math.max(_this.rx_max, rx_sec);
                _this.tx_max = Math.max(_this.tx_max, tx_sec);
                nd = {
                    mem: d.mem,
                    net: {
                        rx_sec: rx_sec,
                        tx_sec: tx_sec,
                        rx_max: _this.rx_max,
                        tx_max: _this.tx_max
                    },
                    cpu: {
                        sys: d.currentLoad.currentload / 100,
                        usr: d.currentLoad.currentload_user / 100
                    }
                };
                if (data.disksIO != null) {
                    r_sec = d.disksIO.rIO_sec;
                    w_sec = d.disksIO.wIO_sec;
                    _this.r_max = Math.max(_this.r_max, r_sec);
                    _this.w_max = Math.max(_this.w_max, w_sec);
                    nd.dsk = {
                        r_sec: r_sec,
                        w_sec: w_sec,
                        r_max: _this.r_max,
                        w_max: _this.w_max
                    };
                }
                return data.send(_this, nd);
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
        this.lastEvent = null;
        this.sendTimer = null;
    }

    Mouse.prototype.onEvent = function(event) {
        var i, len, now, receiver, ref1, results;
        this.lastEvent = event;
        now = Date.now();
        clearTimeout(this.sendTimer);
        this.sendTimer = null;
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
        } else {
            return this.sendTimer = setTimeout(((function(_this) {
                return function() {
                    return _this.onEvent(_this.lastEvent);
                };
            })(this)), this.interval);
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

Bounds = (function() {
    function Bounds(name1, receivers) {
        this.name = name1 != null ? name1 : 'bounds';
        this.receivers = receivers != null ? receivers : [];
        this.onBounds = bind(this.onBounds, this);
        post.on('bounds', this.onBounds);
        this.interval = parseInt(500);
        this.lastInfos = null;
        this.checkTimer = null;
        this.onBounds();
    }

    Bounds.prototype.onBounds = function(msg, arg) {
        var bounds, i, infos, len, receiver, ref1, results;
        bounds = require('./bounds');
        infos = bounds.getInfos();
        if (!_.isEqual(infos, this.lastInfos)) {
            this.lastInfos = infos;
            post.toMain(this.name, infos);
            ref1 = this.receivers;
            results = [];
            for (i = 0, len = ref1.length; i < len; i++) {
                receiver = ref1[i];
                console.log("receiver:" + (kstr(receiver)) + " name:" + this.name + " event:" + (kstr(event)));
                results.push(post.toWin(receiver, 'data', infos));
            }
            return results;
        }
    };

    return Bounds;

})();

module.exports = Data;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsa0dBQUE7SUFBQTs7O0FBUUEsTUFBMEIsT0FBQSxDQUFRLEtBQVIsQ0FBMUIsRUFBRSxlQUFGLEVBQVEsZUFBUixFQUFjLGVBQWQsRUFBb0I7O0FBRXBCLE1BQUEsR0FBVyxPQUFBLENBQVEsUUFBUjs7QUFDWCxPQUFBLEdBQVcsT0FBQSxDQUFRLG1CQUFSOztBQUNYLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFFTDtJQUVDLGNBQUE7Ozs7UUFFQyxNQUFNLENBQUMsS0FBUCxDQUFBO1FBRUEsSUFBQyxDQUFBLFNBQUQsR0FDSTtZQUFBLEtBQUEsRUFBVSxJQUFJLEtBQWQ7WUFDQSxRQUFBLEVBQVUsSUFBSSxRQURkO1lBRUEsTUFBQSxFQUFVLElBQUksTUFGZDs7UUFJSixJQUFJLENBQUMsRUFBTCxDQUFRLGFBQVIsRUFBc0IsSUFBQyxDQUFBLGFBQXZCO1FBRUEsV0FBQSxDQUFZLElBQUMsQ0FBQSxRQUFiLEVBQXVCLElBQXZCO0lBWEQ7O21CQWFILGFBQUEsR0FBZSxTQUFDLFFBQUQsRUFBVyxHQUFYO1FBSVgsSUFBRyxDQUFJLElBQUMsQ0FBQSxTQUFVLENBQUEsUUFBQSxDQUFsQjtZQUNJLElBQUMsQ0FBQSxTQUFVLENBQUEsUUFBQSxDQUFYLEdBQXVCLElBQUk7Z0JBQUMsS0FBQSxFQUFNLEtBQVA7Z0JBQWMsT0FBQSxFQUFRLE9BQXRCO2FBQStCLENBQUEsUUFBQTtZQUMxRCxJQUFDLENBQUEsU0FBVSxDQUFBLFFBQUEsQ0FBUyxDQUFDLFNBQXJCLEdBQWlDLEdBRnJDOztRQUlBLElBQUcsYUFBVyxJQUFDLENBQUEsU0FBVSxDQUFBLFFBQUEsQ0FBUyxDQUFDLFNBQWhDLEVBQUEsR0FBQSxLQUFIO21CQUNJLElBQUMsQ0FBQSxTQUFVLENBQUEsUUFBQSxDQUFTLENBQUMsU0FBUyxDQUFDLElB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T0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDBcbjAwMCAgIDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4wMDAwMDAwICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDBcbiMjI1xuXG57IHBvc3QsIGtsb2csIGtzdHIsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuaW9Ib29rICAgPSByZXF1aXJlICdpb2hvb2snXG5zeXNpbmZvICA9IHJlcXVpcmUgJ3N5c3RlbWluZm9ybWF0aW9uJ1xuZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcblxuY2xhc3MgRGF0YVxuXG4gICAgQDogLT5cblxuICAgICAgICBpb0hvb2suc3RhcnQoKVxuICAgICAgICBcbiAgICAgICAgQHByb3ZpZGVycyA9IFxuICAgICAgICAgICAgbW91c2U6ICAgIG5ldyBNb3VzZVxuICAgICAgICAgICAga2V5Ym9hcmQ6IG5ldyBLZXlib2FyZFxuICAgICAgICAgICAgYm91bmRzOiAgIG5ldyBCb3VuZHNcbiAgICAgICAgXG4gICAgICAgIHBvc3Qub24gJ3JlcXVlc3REYXRhJyBAb25SZXF1ZXN0RGF0YVxuICAgICAgICBcbiAgICAgICAgc2V0SW50ZXJ2YWwgQHNsb3dUaWNrLCAxMDAwXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICBvblJlcXVlc3REYXRhOiAocHJvdmlkZXIsIHdpZCkgPT5cbiAgICAgICAgXG4gICAgICAgICMga2xvZyBcIkRhdGEub25SZXF1ZXN0RGF0YSBwcm92aWRlcjoje2tzdHIgcHJvdmlkZXJ9IHdpZDoje2tzdHIgd2lkfVwiXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgbm90IEBwcm92aWRlcnNbcHJvdmlkZXJdXG4gICAgICAgICAgICBAcHJvdmlkZXJzW3Byb3ZpZGVyXSA9IG5ldyB7Y2xvY2s6Q2xvY2ssIHN5c2luZm86U3lzaW5mb31bcHJvdmlkZXJdXG4gICAgICAgICAgICBAcHJvdmlkZXJzW3Byb3ZpZGVyXS5yZWNlaXZlcnMgPSBbXVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIHdpZCBub3QgaW4gQHByb3ZpZGVyc1twcm92aWRlcl0ucmVjZWl2ZXJzXG4gICAgICAgICAgICBAcHJvdmlkZXJzW3Byb3ZpZGVyXS5yZWNlaXZlcnMucHVzaCB3aWQgXG5cbiAgICBzbG93VGljazogPT5cbiAgICAgICAgXG4gICAgICAgIGZvciBuYW1lLHByb3ZpZGVyIG9mIEBwcm92aWRlcnNcbiAgICAgICAgICAgIGlmIHByb3ZpZGVyLnRpY2sgPT0gJ3Nsb3cnXG4gICAgICAgICAgICAgICAgcHJvdmlkZXIub25UaWNrIEBcbiAgICAgICAgXG4gICAgc2VuZDogKHByb3ZpZGVyLCBkYXRhKSA9PlxuICAgICAgICBcbiAgICAgICAgZm9yIHJlY2VpdmVyIGluIHByb3ZpZGVyLnJlY2VpdmVyc1xuICAgICAgICAgICAgcG9zdC50b1dpbiByZWNlaXZlciwgJ2RhdGEnIGRhdGFcbiAgICAgICAgICAgIFxuIyMjXG4gMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbjAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4wMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuIyMjXG5cbmNsYXNzIENsb2NrXG4gICAgICAgIFxuICAgIEA6IChAbmFtZT0nY2xvY2snIEB0aWNrPSdzbG93JykgLT5cbiAgICAgICAgXG4gICAgb25UaWNrOiAoZGF0YSkgPT5cbiAgICAgICAgXG4gICAgICAgIHRpbWUgPSBuZXcgRGF0ZSgpXG4gICAgICAgIFxuICAgICAgICBob3VycyAgID0gdGltZS5nZXRIb3VycygpXG4gICAgICAgIG1pbnV0ZXMgPSB0aW1lLmdldE1pbnV0ZXMoKVxuICAgICAgICBzZWNvbmRzID0gdGltZS5nZXRTZWNvbmRzKClcbiAgICAgICAgXG4gICAgICAgIGhvdXJTdHIgICA9IGtzdHIubHBhZCBob3VycywgICAyICcwJ1xuICAgICAgICBtaW51dGVTdHIgPSBrc3RyLmxwYWQgbWludXRlcywgMiAnMCdcbiAgICAgICAgc2Vjb25kU3RyID0ga3N0ci5scGFkIHNlY29uZHMsIDIgJzAnXG4gICAgICAgIFxuICAgICAgICBkYXRhLnNlbmQgQCxcbiAgICAgICAgICAgIGhvdXI6ICAgaG91cnNcbiAgICAgICAgICAgIG1pbnV0ZTogbWludXRlc1xuICAgICAgICAgICAgc2Vjb25kOiBzZWNvbmRzXG4gICAgICAgICAgICBzdHI6XG4gICAgICAgICAgICAgICAgICAgIGhvdXI6ICAgaG91clN0clxuICAgICAgICAgICAgICAgICAgICBtaW51dGU6IG1pbnV0ZVN0clxuICAgICAgICAgICAgICAgICAgICBzZWNvbmQ6IHNlY29uZFN0clxuICAgICAgICAgICAgICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAgICAgMDAwICAgMDAwICBcbiMgICAgICAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMDAwMDAgICBcblxuY2xhc3MgU3lzaW5mb1xuICAgICAgICBcbiAgICBAOiAoQG5hbWU9J3N5c2luZm8nIEB0aWNrPSdzbG93JykgLT5cbiAgICAgICAgXG4gICAgICAgIEByX21heCA9IDEwMFxuICAgICAgICBAd19tYXggPSAxMDBcblxuICAgICAgICBAcnhfbWF4ID0gMTAwXG4gICAgICAgIEB0eF9tYXggPSAxMDBcbiAgICAgICAgXG4gICAgb25UaWNrOiAoZGF0YSkgPT5cbiAgICAgICAgXG4gICAgICAgIHN5c2luZm8uZ2V0RHluYW1pY0RhdGEgKGQpID0+IFxuICAgICAgICAgICAgXG4gICAgICAgICAgICByeF9zZWMgPSBwYXJzZUludCBkLm5ldHdvcmtTdGF0c1swXS5yeF9zZWNcbiAgICAgICAgICAgIHR4X3NlYyA9IHBhcnNlSW50IGQubmV0d29ya1N0YXRzWzBdLnR4X3NlY1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBAcnhfbWF4ID0gTWF0aC5tYXggQHJ4X21heCwgcnhfc2VjXG4gICAgICAgICAgICBAdHhfbWF4ID0gTWF0aC5tYXggQHR4X21heCwgdHhfc2VjXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG5kID1cbiAgICAgICAgICAgICAgICBtZW06IGQubWVtXG4gICAgICAgICAgICAgICAgbmV0OlxuICAgICAgICAgICAgICAgICAgICByeF9zZWM6IHJ4X3NlY1xuICAgICAgICAgICAgICAgICAgICB0eF9zZWM6IHR4X3NlY1xuICAgICAgICAgICAgICAgICAgICByeF9tYXg6IEByeF9tYXhcbiAgICAgICAgICAgICAgICAgICAgdHhfbWF4OiBAdHhfbWF4XG4gICAgICAgICAgICAgICAgY3B1OlxuICAgICAgICAgICAgICAgICAgICBzeXM6IGQuY3VycmVudExvYWQuY3VycmVudGxvYWQvMTAwIFxuICAgICAgICAgICAgICAgICAgICB1c3I6IGQuY3VycmVudExvYWQuY3VycmVudGxvYWRfdXNlci8xMDBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBkYXRhLmRpc2tzSU8/XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcl9zZWMgPSBkLmRpc2tzSU8ucklPX3NlY1xuICAgICAgICAgICAgICAgIHdfc2VjID0gZC5kaXNrc0lPLndJT19zZWNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAcl9tYXggPSBNYXRoLm1heCBAcl9tYXgsIHJfc2VjXG4gICAgICAgICAgICAgICAgQHdfbWF4ID0gTWF0aC5tYXggQHdfbWF4LCB3X3NlY1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG5kLmRzayA9IFxuICAgICAgICAgICAgICAgICAgICByX3NlYzogcl9zZWNcbiAgICAgICAgICAgICAgICAgICAgd19zZWM6IHdfc2VjXG4gICAgICAgICAgICAgICAgICAgIHJfbWF4OiBAcl9tYXhcbiAgICAgICAgICAgICAgICAgICAgd19tYXg6IEB3X21heFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBkYXRhLnNlbmQgQCwgbmRcblxuIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIFxuXG5jbGFzcyBNb3VzZVxuICAgIFxuICAgIEA6IChAbmFtZT0nbW91c2UnIEByZWNlaXZlcnM9W10pIC0+XG4gICAgICAgIFxuICAgICAgICBpb0hvb2sub24gJ21vdXNld2hlZWwnIEBvbkV2ZW50XG4gICAgICAgIGlvSG9vay5vbiAnbW91c2Vtb3ZlJyAgQG9uRXZlbnRcbiAgICAgICAgaW9Ib29rLm9uICdtb3VzZWRvd24nICBAb25FdmVudFxuICAgICAgICBpb0hvb2sub24gJ21vdXNldXAnICAgIEBvbkV2ZW50XG4gICAgICAgIFxuICAgICAgICBAbGFzdCA9IERhdGUubm93KClcbiAgICAgICAgQGludGVydmFsID0gcGFyc2VJbnQgMTAwMC82MFxuICAgICAgICBAbGFzdEV2ZW50ID0gbnVsbFxuICAgICAgICBAc2VuZFRpbWVyID0gbnVsbFxuICAgICAgICBcbiAgICBvbkV2ZW50OiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICBAbGFzdEV2ZW50ID0gZXZlbnRcbiAgICAgICAgbm93ID0gRGF0ZS5ub3coKVxuICAgICAgICBjbGVhclRpbWVvdXQgQHNlbmRUaW1lclxuICAgICAgICBAc2VuZFRpbWVyID0gbnVsbFxuICAgICAgICBpZiBub3cgLSBAbGFzdCA+IEBpbnRlcnZhbFxuICAgICAgICAgICAgQGxhc3QgPSBub3dcbiAgICAgICAgICAgIHBvc3QudG9NYWluIEBuYW1lLCBldmVudFxuICAgICAgICAgICAgZm9yIHJlY2VpdmVyIGluIEByZWNlaXZlcnNcbiAgICAgICAgICAgICAgICAjbG9nIFwicmVjZWl2ZXI6I3trc3RyIHJlY2VpdmVyfSBuYW1lOiN7QG5hbWV9IGV2ZW50OiN7a3N0ciBldmVudH1cIlxuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gcmVjZWl2ZXIsICdkYXRhJywgZXZlbnRcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNlbmRUaW1lciA9IHNldFRpbWVvdXQgKD0+IEBvbkV2ZW50IEBsYXN0RXZlbnQpLCBAaW50ZXJ2YWxcbiAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcblxuY2xhc3MgS2V5Ym9hcmRcbiAgICBcbiAgICBAOiAoQG5hbWU9J2tleWJvYXJkJyBAcmVjZWl2ZXJzPVtdKSAtPlxuICAgICAgICBcbiAgICAgICAgaW9Ib29rLm9uICdrZXlkb3duJyBAb25FdmVudFxuICAgICAgICBpb0hvb2sub24gJ2tleXVwJyAgIEBvbkV2ZW50XG5cbiAgICBvbkV2ZW50OiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICBwb3N0LnRvTWFpbiBAbmFtZSwgZXZlbnRcbiAgICAgICAgZm9yIHJlY2VpdmVyIGluIEByZWNlaXZlcnNcbiAgICAgICAgICAgIHBvc3QudG9XaW4gcmVjZWl2ZXIsIEBuYW1lLCBldmVudFxuICAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuIyAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwICAgXG5cbmNsYXNzIEJvdW5kc1xuICAgIFxuICAgIEA6IChAbmFtZT0nYm91bmRzJyBAcmVjZWl2ZXJzPVtdKSAtPlxuICAgICAgICBcbiAgICAgICAgcG9zdC5vbiAnYm91bmRzJyBAb25Cb3VuZHNcbiAgICAgICAgXG4gICAgICAgIEBpbnRlcnZhbCA9IHBhcnNlSW50IDUwMFxuICAgICAgICBAbGFzdEluZm9zID0gbnVsbFxuICAgICAgICBAY2hlY2tUaW1lciA9IG51bGxcbiAgICAgICAgQG9uQm91bmRzKClcbiAgICAgICBcbiAgICBvbkJvdW5kczogKG1zZywgYXJnKSA9PlxuICAgICAgICBcbiAgICAgICAgYm91bmRzID0gcmVxdWlyZSAnLi9ib3VuZHMnXG4gICAgICAgIGluZm9zID0gYm91bmRzLmdldEluZm9zKClcbiAgICAgICAgaWYgbm90IF8uaXNFcXVhbCBpbmZvcywgQGxhc3RJbmZvc1xuICAgICAgICAgICAgIyBrbG9nICdpbmZvcydcbiAgICAgICAgICAgIEBsYXN0SW5mb3MgPSBpbmZvc1xuICAgICAgICAgICAgcG9zdC50b01haW4gQG5hbWUsIGluZm9zXG4gICAgICAgICAgICBmb3IgcmVjZWl2ZXIgaW4gQHJlY2VpdmVyc1xuICAgICAgICAgICAgICAgIGxvZyBcInJlY2VpdmVyOiN7a3N0ciByZWNlaXZlcn0gbmFtZToje0BuYW1lfSBldmVudDoje2tzdHIgZXZlbnR9XCJcbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIHJlY2VpdmVyLCAnZGF0YScsIGluZm9zXG4gICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gRGF0YVxuXG4iXX0=
//# sourceURL=../coffee/data.coffee
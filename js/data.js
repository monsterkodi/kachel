// koffee 1.3.0

/*
0000000     0000000   000000000   0000000 
000   000  000   000     000     000   000
000   000  000000000     000     000000000
000   000  000   000     000     000   000
0000000    000   000     000     000   000
 */
var Apps, Bounds, Clock, Data, Keyboard, Mouse, Sysinfo, Wins, _, electron, ioHook, klog, kstr, os, post, ref, slash, sysinfo, wxw,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf;

ref = require('kxk'), post = ref.post, klog = ref.klog, slash = ref.slash, kstr = ref.kstr, os = ref.os, _ = ref._;

ioHook = require('iohook');

sysinfo = require('systeminformation');

electron = require('electron');

if (os.platform() === 'win32') {
    wxw = require('wxw');
}

Data = (function() {
    function Data() {
        this.send = bind(this.send, this);
        this.slowTick = bind(this.slowTick, this);
        this.onRequestData = bind(this.onRequestData, this);
        ioHook.start();
        this.providers = {
            mouse: new Mouse,
            keyboard: new Keyboard,
            apps: new Apps,
            wins: new Wins
        };
        post.on('requestData', this.onRequestData);
        setTimeout(this.slowTick, 1000);
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
        var name, provider, ref1;
        if (!global.dragging) {
            ref1 = this.providers;
            for (name in ref1) {
                provider = ref1[name];
                if (provider.tick === 'slow') {
                    provider.onTick(this);
                }
            }
        }
        return setTimeout(this.slowTick, 1000 - (new Date).getMilliseconds());
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
        this.lastInfos = null;
        this.onBounds();
    }

    Bounds.prototype.onBounds = function(msg, arg) {
        var bounds, i, infos, len, receiver, ref1, results;
        bounds = require('./bounds');
        infos = bounds.infos;
        if (!_.isEqual(infos, this.lastInfos)) {
            this.lastInfos = infos;
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

Apps = (function() {
    function Apps(name1, receivers) {
        this.name = name1 != null ? name1 : 'apps';
        this.receivers = receivers != null ? receivers : [];
        this.update = bind(this.update, this);
        this.start = bind(this.start, this);
        this.last = Date.now();
        this.interval = parseInt(1000);
        this.lastApps = null;
        this.timer = null;
    }

    Apps.prototype.start = function() {
        return this.update({
            force: true
        });
    };

    Apps.prototype.update = function(force) {
        var apps, i, len, proclist, receiver, ref1;
        if (force == null) {
            force = false;
        }
        if (os.platform() !== 'win32') {
            return;
        }
        clearTimeout(this.timer);
        if (!global.dragging) {
            proclist = wxw('proc');
            apps = Array.from(new Set(proclist.map(function(p) {
                return p.path;
            })));
            apps = apps.filter(function(p) {
                var ref1, s;
                s = slash.path(slash.removeDrive(p));
                if (s.startsWith('/Windows/System32')) {
                    return (ref1 = slash.base(s)) === 'cmd' || ref1 === 'powershell';
                }
                return true;
            });
            apps.sort();
            if (force || !_.isEqual(apps, this.lastApps)) {
                post.toMain('apps', apps);
                ref1 = this.receivers;
                for (i = 0, len = ref1.length; i < len; i++) {
                    receiver = ref1[i];
                    console.log("receiver:" + (kstr(receiver)) + " name:" + this.name + " apps:" + apps.length);
                    post.toWin(receiver, 'data', apps);
                }
                this.lastApps = apps;
            }
        }
        return this.timer = setTimeout(this.update, this.interval);
    };

    return Apps;

})();

Wins = (function() {
    function Wins(name1, receivers) {
        this.name = name1 != null ? name1 : 'wins';
        this.receivers = receivers != null ? receivers : [];
        this.update = bind(this.update, this);
        this.start = bind(this.start, this);
        this.last = Date.now();
        this.interval = parseInt(1000);
        this.lastWins = null;
        this.timer = null;
    }

    Wins.prototype.start = function() {
        return this.update({
            force: true
        });
    };

    Wins.prototype.update = function(force) {
        var i, len, receiver, ref1, wins;
        if (force == null) {
            force = false;
        }
        if (os.platform() !== 'win32') {
            return;
        }
        clearTimeout(this.timer);
        if (!global.dragging) {
            wins = wxw('info');
            if (force || !_.isEqual(wins, this.lastWins)) {
                post.toMain('wins', wins);
                ref1 = this.receivers;
                for (i = 0, len = ref1.length; i < len; i++) {
                    receiver = ref1[i];
                    console.log("receiver:" + (kstr(receiver)) + " name:" + this.name + " apps:" + apps.length);
                    post.toWin(receiver, 'data', apps);
                }
                this.lastWins = wins;
            }
        }
        return this.timer = setTimeout(this.update, this.interval);
    };

    return Wins;

})();

module.exports = Data;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsOEhBQUE7SUFBQTs7O0FBUUEsTUFBcUMsT0FBQSxDQUFRLEtBQVIsQ0FBckMsRUFBRSxlQUFGLEVBQVEsZUFBUixFQUFjLGlCQUFkLEVBQXFCLGVBQXJCLEVBQTJCLFdBQTNCLEVBQStCOztBQUUvQixNQUFBLEdBQVcsT0FBQSxDQUFRLFFBQVI7O0FBQ1gsT0FBQSxHQUFXLE9BQUEsQ0FBUSxtQkFBUjs7QUFDWCxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBRVgsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsT0FBcEI7SUFDSSxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVIsRUFEVjs7O0FBR007SUFFQyxjQUFBOzs7O1FBRUMsTUFBTSxDQUFDLEtBQVAsQ0FBQTtRQUVBLElBQUMsQ0FBQSxTQUFELEdBQ0k7WUFBQSxLQUFBLEVBQVUsSUFBSSxLQUFkO1lBQ0EsUUFBQSxFQUFVLElBQUksUUFEZDtZQUVBLElBQUEsRUFBVSxJQUFJLElBRmQ7WUFHQSxJQUFBLEVBQVUsSUFBSSxJQUhkOztRQUtKLElBQUksQ0FBQyxFQUFMLENBQVEsYUFBUixFQUFzQixJQUFDLENBQUEsYUFBdkI7UUFFQSxVQUFBLENBQVcsSUFBQyxDQUFBLFFBQVosRUFBc0IsSUFBdEI7SUFaRDs7bUJBY0gsYUFBQSxHQUFlLFNBQUMsUUFBRCxFQUFXLEdBQVg7UUFJWCxJQUFHLENBQUksSUFBQyxDQUFBLFNBQVUsQ0FBQSxRQUFBLENBQWxCO1lBQ0ksSUFBQyxDQUFBLFNBQVUsQ0FBQSxRQUFBLENBQVgsR0FBdUIsSUFBSTtnQkFBQyxLQUFBLEVBQU0sS0FBUDtnQkFBYyxPQUFBLEVBQVEsT0FBdEI7YUFBK0IsQ0FBQSxRQUFBO1lBQzFELElBQUMsQ0FBQSxTQUFVLENBQUEsUUFBQSxDQUFTLENBQUMsU0FBckIsR0FB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QUVYLElBQVUsRUFBRSxDQUFDLFFBQUgsQ0FBQSxDQUFBLEtBQWlCLE9BQTNCO0FBQUEsbUJBQUE7O1FBRUEsWUFBQSxDQUFhLElBQUMsQ0FBQSxLQUFkO1FBRUEsSUFBRyxDQUFJLE1BQU0sQ0FBQyxRQUFkO1lBRUksSUFBQSxHQUFPLEdBQUEsQ0FBSSxNQUFKO1lBRVAsSUFBRyxLQUFBLElBQVMsQ0FBSSxDQUFDLENBQUMsT0FBRixDQUFVLElBQVYsRUFBZ0IsSUFBQyxDQUFBLFFBQWpCLENBQWhCO2dCQUNJLElBQUksQ0FBQyxNQUFMLENBQVksTUFBWixFQUFvQixJQUFwQjtBQUNBO0FBQUEscUJBQUEsc0NBQUE7O29CQUNHLE9BQUEsQ0FBQyxHQUFELENBQUssV0FBQSxHQUFXLENBQUMsSUFBQSxDQUFLLFFBQUwsQ0FBRCxDQUFYLEdBQTBCLFFBQTFCLEdBQWtDLElBQUMsQ0FBQSxJQUFuQyxHQUF3QyxRQUF4QyxHQUFnRCxJQUFJLENBQUMsTUFBMUQ7b0JBQ0MsSUFBSSxDQUFDLEtBQUwsQ0FBVyxRQUFYLEVBQXFCLE1BQXJCLEVBQTZCLElBQTdCO0FBRko7Z0JBSUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxLQU5oQjthQUpKOztlQVlBLElBQUMsQ0FBQSxLQUFELEdBQVMsVUFBQSxDQUFXLElBQUMsQ0FBQSxNQUFaLEVBQW9CLElBQUMsQ0FBQSxRQUFyQjtJQWxCTDs7Ozs7O0FBb0JaLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwMDAwMCBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMFxuMDAwICAgMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDBcbjAwMDAwMDAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgcG9zdCwga2xvZywgc2xhc2gsIGtzdHIsIG9zLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbmlvSG9vayAgID0gcmVxdWlyZSAnaW9ob29rJ1xuc3lzaW5mbyAgPSByZXF1aXJlICdzeXN0ZW1pbmZvcm1hdGlvbidcbmVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG5cbmlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgIHd4dyA9IHJlcXVpcmUgJ3d4dydcblxuY2xhc3MgRGF0YVxuXG4gICAgQDogLT5cblxuICAgICAgICBpb0hvb2suc3RhcnQoKVxuICAgICAgICBcbiAgICAgICAgQHByb3ZpZGVycyA9IFxuICAgICAgICAgICAgbW91c2U6ICAgIG5ldyBNb3VzZVxuICAgICAgICAgICAga2V5Ym9hcmQ6IG5ldyBLZXlib2FyZFxuICAgICAgICAgICAgYXBwczogICAgIG5ldyBBcHBzXG4gICAgICAgICAgICB3aW5zOiAgICAgbmV3IFdpbnNcbiAgICAgICAgXG4gICAgICAgIHBvc3Qub24gJ3JlcXVlc3REYXRhJyBAb25SZXF1ZXN0RGF0YVxuICAgICAgICBcbiAgICAgICAgc2V0VGltZW91dCBAc2xvd1RpY2ssIDEwMDBcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIG9uUmVxdWVzdERhdGE6IChwcm92aWRlciwgd2lkKSA9PlxuICAgICAgICBcbiAgICAgICAgIyBrbG9nIFwiRGF0YS5vblJlcXVlc3REYXRhIHByb3ZpZGVyOiN7a3N0ciBwcm92aWRlcn0gd2lkOiN7a3N0ciB3aWR9XCJcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBub3QgQHByb3ZpZGVyc1twcm92aWRlcl1cbiAgICAgICAgICAgIEBwcm92aWRlcnNbcHJvdmlkZXJdID0gbmV3IHtjbG9jazpDbG9jaywgc3lzaW5mbzpTeXNpbmZvfVtwcm92aWRlcl1cbiAgICAgICAgICAgIEBwcm92aWRlcnNbcHJvdmlkZXJdLnJlY2VpdmVycyA9IFtdXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgd2lkIG5vdCBpbiBAcHJvdmlkZXJzW3Byb3ZpZGVyXS5yZWNlaXZlcnNcbiAgICAgICAgICAgIEBwcm92aWRlcnNbcHJvdmlkZXJdLnJlY2VpdmVycy5wdXNoIHdpZCBcblxuICAgIHNsb3dUaWNrOiA9PlxuICAgICAgICBcbiAgICAgICAgaWYgbm90IGdsb2JhbC5kcmFnZ2luZ1xuICAgICAgICBcbiAgICAgICAgICAgIGZvciBuYW1lLHByb3ZpZGVyIG9mIEBwcm92aWRlcnNcbiAgICAgICAgICAgICAgICBpZiBwcm92aWRlci50aWNrID09ICdzbG93J1xuICAgICAgICAgICAgICAgICAgICBwcm92aWRlci5vblRpY2sgQFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBzZXRUaW1lb3V0IEBzbG93VGljaywgMTAwMCAtIChuZXcgRGF0ZSkuZ2V0TWlsbGlzZWNvbmRzKClcbiAgICAgICAgXG4gICAgc2VuZDogKHByb3ZpZGVyLCBkYXRhKSA9PlxuICAgICAgICBcbiAgICAgICAgZm9yIHJlY2VpdmVyIGluIHByb3ZpZGVyLnJlY2VpdmVyc1xuICAgICAgICAgICAgcG9zdC50b1dpbiByZWNlaXZlciwgJ2RhdGEnIGRhdGFcbiAgICAgICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4jIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiMgIDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG5cbmNsYXNzIENsb2NrXG4gICAgICAgIFxuICAgIEA6IChAbmFtZT0nY2xvY2snIEB0aWNrPSdzbG93JykgLT5cbiAgICAgICAgXG4gICAgb25UaWNrOiAoZGF0YSkgPT5cbiAgICAgICAgXG4gICAgICAgIHRpbWUgPSBuZXcgRGF0ZSgpXG4gICAgICAgIFxuICAgICAgICBob3VycyAgID0gdGltZS5nZXRIb3VycygpXG4gICAgICAgIG1pbnV0ZXMgPSB0aW1lLmdldE1pbnV0ZXMoKVxuICAgICAgICBzZWNvbmRzID0gdGltZS5nZXRTZWNvbmRzKClcbiAgICAgICAgXG4gICAgICAgIGhvdXJTdHIgICA9IGtzdHIubHBhZCBob3VycywgICAyICcwJ1xuICAgICAgICBtaW51dGVTdHIgPSBrc3RyLmxwYWQgbWludXRlcywgMiAnMCdcbiAgICAgICAgc2Vjb25kU3RyID0ga3N0ci5scGFkIHNlY29uZHMsIDIgJzAnXG4gICAgICAgIFxuICAgICAgICBkYXRhLnNlbmQgQCxcbiAgICAgICAgICAgIGhvdXI6ICAgaG91cnNcbiAgICAgICAgICAgIG1pbnV0ZTogbWludXRlc1xuICAgICAgICAgICAgc2Vjb25kOiBzZWNvbmRzXG4gICAgICAgICAgICBzdHI6XG4gICAgICAgICAgICAgICAgICAgIGhvdXI6ICAgaG91clN0clxuICAgICAgICAgICAgICAgICAgICBtaW51dGU6IG1pbnV0ZVN0clxuICAgICAgICAgICAgICAgICAgICBzZWNvbmQ6IHNlY29uZFN0clxuICAgICAgICAgICAgICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAgICAgMDAwICAgMDAwICBcbiMgICAgICAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMDAwMDAgICBcblxuY2xhc3MgU3lzaW5mb1xuICAgICAgICBcbiAgICBAOiAoQG5hbWU9J3N5c2luZm8nIEB0aWNrPSdzbG93JykgLT5cbiAgICAgICAgXG4gICAgICAgIEByX21heCA9IDEwMFxuICAgICAgICBAd19tYXggPSAxMDBcblxuICAgICAgICBAcnhfbWF4ID0gMTAwXG4gICAgICAgIEB0eF9tYXggPSAxMDBcbiAgICAgICAgXG4gICAgb25UaWNrOiAoZGF0YSkgPT5cbiAgICAgICAgXG4gICAgICAgIHN5c2luZm8uZ2V0RHluYW1pY0RhdGEgKGQpID0+IFxuICAgICAgICAgICAgXG4gICAgICAgICAgICByeF9zZWMgPSBwYXJzZUludCBkLm5ldHdvcmtTdGF0c1swXS5yeF9zZWNcbiAgICAgICAgICAgIHR4X3NlYyA9IHBhcnNlSW50IGQubmV0d29ya1N0YXRzWzBdLnR4X3NlY1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBAcnhfbWF4ID0gTWF0aC5tYXggQHJ4X21heCwgcnhfc2VjXG4gICAgICAgICAgICBAdHhfbWF4ID0gTWF0aC5tYXggQHR4X21heCwgdHhfc2VjXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG5kID1cbiAgICAgICAgICAgICAgICBtZW06IGQubWVtXG4gICAgICAgICAgICAgICAgbmV0OlxuICAgICAgICAgICAgICAgICAgICByeF9zZWM6IHJ4X3NlY1xuICAgICAgICAgICAgICAgICAgICB0eF9zZWM6IHR4X3NlY1xuICAgICAgICAgICAgICAgICAgICByeF9tYXg6IEByeF9tYXhcbiAgICAgICAgICAgICAgICAgICAgdHhfbWF4OiBAdHhfbWF4XG4gICAgICAgICAgICAgICAgY3B1OlxuICAgICAgICAgICAgICAgICAgICBzeXM6IGQuY3VycmVudExvYWQuY3VycmVudGxvYWQvMTAwIFxuICAgICAgICAgICAgICAgICAgICB1c3I6IGQuY3VycmVudExvYWQuY3VycmVudGxvYWRfdXNlci8xMDBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBkYXRhLmRpc2tzSU8/XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcl9zZWMgPSBkLmRpc2tzSU8ucklPX3NlY1xuICAgICAgICAgICAgICAgIHdfc2VjID0gZC5kaXNrc0lPLndJT19zZWNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAcl9tYXggPSBNYXRoLm1heCBAcl9tYXgsIHJfc2VjXG4gICAgICAgICAgICAgICAgQHdfbWF4ID0gTWF0aC5tYXggQHdfbWF4LCB3X3NlY1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG5kLmRzayA9IFxuICAgICAgICAgICAgICAgICAgICByX3NlYzogcl9zZWNcbiAgICAgICAgICAgICAgICAgICAgd19zZWM6IHdfc2VjXG4gICAgICAgICAgICAgICAgICAgIHJfbWF4OiBAcl9tYXhcbiAgICAgICAgICAgICAgICAgICAgd19tYXg6IEB3X21heFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBkYXRhLnNlbmQgQCwgbmRcblxuIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIFxuXG5jbGFzcyBNb3VzZVxuICAgIFxuICAgIEA6IChAbmFtZT0nbW91c2UnIEByZWNlaXZlcnM9W10pIC0+XG4gICAgICAgIFxuICAgICAgICBpb0hvb2sub24gJ21vdXNld2hlZWwnIEBvbkV2ZW50XG4gICAgICAgIGlvSG9vay5vbiAnbW91c2Vtb3ZlJyAgQG9uRXZlbnRcbiAgICAgICAgaW9Ib29rLm9uICdtb3VzZWRvd24nICBAb25FdmVudFxuICAgICAgICBpb0hvb2sub24gJ21vdXNldXAnICAgIEBvbkV2ZW50XG4gICAgICAgIFxuICAgICAgICBAbGFzdCA9IERhdGUubm93KClcbiAgICAgICAgQGludGVydmFsID0gcGFyc2VJbnQgMTAwMC82MFxuICAgICAgICBAbGFzdEV2ZW50ID0gbnVsbFxuICAgICAgICBAc2VuZFRpbWVyID0gbnVsbFxuICAgICAgICBcbiAgICBvbkV2ZW50OiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICBAbGFzdEV2ZW50ID0gZXZlbnRcbiAgICAgICAgbm93ID0gRGF0ZS5ub3coKVxuICAgICAgICBjbGVhclRpbWVvdXQgQHNlbmRUaW1lclxuICAgICAgICBAc2VuZFRpbWVyID0gbnVsbFxuICAgICAgICBpZiBub3cgLSBAbGFzdCA+IEBpbnRlcnZhbFxuICAgICAgICAgICAgQGxhc3QgPSBub3dcbiAgICAgICAgICAgIHBvc3QudG9NYWluIEBuYW1lLCBldmVudFxuICAgICAgICAgICAgZm9yIHJlY2VpdmVyIGluIEByZWNlaXZlcnNcbiAgICAgICAgICAgICAgICAjbG9nIFwicmVjZWl2ZXI6I3trc3RyIHJlY2VpdmVyfSBuYW1lOiN7QG5hbWV9IGV2ZW50OiN7a3N0ciBldmVudH1cIlxuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gcmVjZWl2ZXIsICdkYXRhJywgZXZlbnRcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNlbmRUaW1lciA9IHNldFRpbWVvdXQgKD0+IEBvbkV2ZW50IEBsYXN0RXZlbnQpLCBAaW50ZXJ2YWxcbiAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcblxuY2xhc3MgS2V5Ym9hcmRcbiAgICBcbiAgICBAOiAoQG5hbWU9J2tleWJvYXJkJyBAcmVjZWl2ZXJzPVtdKSAtPlxuICAgICAgICBcbiAgICAgICAgaW9Ib29rLm9uICdrZXlkb3duJyBAb25FdmVudFxuICAgICAgICBpb0hvb2sub24gJ2tleXVwJyAgIEBvbkV2ZW50XG5cbiAgICBvbkV2ZW50OiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICBwb3N0LnRvTWFpbiBAbmFtZSwgZXZlbnRcbiAgICAgICAgZm9yIHJlY2VpdmVyIGluIEByZWNlaXZlcnNcbiAgICAgICAgICAgIHBvc3QudG9XaW4gcmVjZWl2ZXIsIEBuYW1lLCBldmVudFxuICAgICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgICAgICAgMDAwICBcbiMgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICBcblxuY2xhc3MgQm91bmRzXG4gICAgXG4gICAgQDogKEBuYW1lPSdib3VuZHMnIEByZWNlaXZlcnM9W10pIC0+XG4gICAgICAgIFxuICAgICAgICBwb3N0Lm9uICdib3VuZHMnIEBvbkJvdW5kc1xuICAgICAgICBcbiAgICAgICAgQGxhc3RJbmZvcyA9IG51bGxcbiAgICAgICAgQG9uQm91bmRzKClcbiAgICAgICBcbiAgICBvbkJvdW5kczogKG1zZywgYXJnKSA9PlxuICAgICAgICBcbiAgICAgICAgYm91bmRzID0gcmVxdWlyZSAnLi9ib3VuZHMnXG4gICAgICAgIGluZm9zID0gYm91bmRzLmluZm9zXG4gICAgICAgIGlmIG5vdCBfLmlzRXF1YWwgaW5mb3MsIEBsYXN0SW5mb3NcbiAgICAgICAgICAgIEBsYXN0SW5mb3MgPSBpbmZvc1xuICAgICAgICAgICAgZm9yIHJlY2VpdmVyIGluIEByZWNlaXZlcnNcbiAgICAgICAgICAgICAgICBsb2cgXCJyZWNlaXZlcjoje2tzdHIgcmVjZWl2ZXJ9IG5hbWU6I3tAbmFtZX0gZXZlbnQ6I3trc3RyIGV2ZW50fVwiXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiByZWNlaXZlciwgJ2RhdGEnLCBpbmZvc1xuICAgICAgICAgICAgXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgICAgICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwMDAwMCAgIFxuXG5jbGFzcyBBcHBzXG4gICAgXG4gICAgQDogKEBuYW1lPSdhcHBzJyBAcmVjZWl2ZXJzPVtdKSAtPlxuICAgICAgICBcbiAgICAgICAgQGxhc3QgICAgID0gRGF0ZS5ub3coKVxuICAgICAgICBAaW50ZXJ2YWwgPSBwYXJzZUludCAxMDAwXG4gICAgICAgIEBsYXN0QXBwcyA9IG51bGxcbiAgICAgICAgQHRpbWVyICAgID0gbnVsbFxuICAgICAgICBcbiAgICBzdGFydDogPT4gQHVwZGF0ZSBmb3JjZTp0cnVlXG4gICAgICAgIFxuICAgIHVwZGF0ZTogKGZvcmNlPWZhbHNlKSA9PlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG9zLnBsYXRmb3JtKCkgIT0gJ3dpbjMyJ1xuXG4gICAgICAgIGNsZWFyVGltZW91dCBAdGltZXJcbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBnbG9iYWwuZHJhZ2dpbmdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcHJvY2xpc3QgPSB3eHcgJ3Byb2MnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBhcHBzID0gQXJyYXkuZnJvbSBuZXcgU2V0IHByb2NsaXN0Lm1hcCAocCkgLT4gcC5wYXRoXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGFwcHMgPSBhcHBzLmZpbHRlciAocCkgLT4gXG4gICAgICAgICAgICAgICAgcyA9IHNsYXNoLnBhdGggc2xhc2gucmVtb3ZlRHJpdmUgcCBcbiAgICAgICAgICAgICAgICBpZiBzLnN0YXJ0c1dpdGggJy9XaW5kb3dzL1N5c3RlbTMyJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2xhc2guYmFzZShzKSBpbiBbJ2NtZCcgJ3Bvd2Vyc2hlbGwnXVxuICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBhcHBzLnNvcnQoKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBmb3JjZSBvciBub3QgXy5pc0VxdWFsIGFwcHMsIEBsYXN0QXBwc1xuICAgICAgICAgICAgICAgIHBvc3QudG9NYWluICdhcHBzJywgYXBwc1xuICAgICAgICAgICAgICAgIGZvciByZWNlaXZlciBpbiBAcmVjZWl2ZXJzXG4gICAgICAgICAgICAgICAgICAgIGxvZyBcInJlY2VpdmVyOiN7a3N0ciByZWNlaXZlcn0gbmFtZToje0BuYW1lfSBhcHBzOiN7YXBwcy5sZW5ndGh9XCJcbiAgICAgICAgICAgICAgICAgICAgcG9zdC50b1dpbiByZWNlaXZlciwgJ2RhdGEnLCBhcHBzXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQGxhc3RBcHBzID0gYXBwc1xuICAgICAgICAgICAgXG4gICAgICAgIEB0aW1lciA9IHNldFRpbWVvdXQgQHVwZGF0ZSwgQGludGVydmFsXG4gICAgICAgICAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiMgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICBcbiMgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuXG5jbGFzcyBXaW5zXG4gICAgXG4gICAgQDogKEBuYW1lPSd3aW5zJyBAcmVjZWl2ZXJzPVtdKSAtPlxuICAgICAgICBcbiAgICAgICAgQGxhc3QgICAgID0gRGF0ZS5ub3coKVxuICAgICAgICBAaW50ZXJ2YWwgPSBwYXJzZUludCAxMDAwXG4gICAgICAgIEBsYXN0V2lucyA9IG51bGxcbiAgICAgICAgQHRpbWVyICAgID0gbnVsbFxuICAgICAgICBcbiAgICBzdGFydDogPT4gQHVwZGF0ZSBmb3JjZTp0cnVlXG4gICAgICAgIFxuICAgIHVwZGF0ZTogKGZvcmNlPWZhbHNlKSA9PlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG9zLnBsYXRmb3JtKCkgIT0gJ3dpbjMyJ1xuICAgICAgICBcbiAgICAgICAgY2xlYXJUaW1lb3V0IEB0aW1lclxuICAgICAgICBcbiAgICAgICAgaWYgbm90IGdsb2JhbC5kcmFnZ2luZ1xuICAgICAgICBcbiAgICAgICAgICAgIHdpbnMgPSB3eHcgJ2luZm8nXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGZvcmNlIG9yIG5vdCBfLmlzRXF1YWwgd2lucywgQGxhc3RXaW5zXG4gICAgICAgICAgICAgICAgcG9zdC50b01haW4gJ3dpbnMnLCB3aW5zXG4gICAgICAgICAgICAgICAgZm9yIHJlY2VpdmVyIGluIEByZWNlaXZlcnNcbiAgICAgICAgICAgICAgICAgICAgbG9nIFwicmVjZWl2ZXI6I3trc3RyIHJlY2VpdmVyfSBuYW1lOiN7QG5hbWV9IGFwcHM6I3thcHBzLmxlbmd0aH1cIlxuICAgICAgICAgICAgICAgICAgICBwb3N0LnRvV2luIHJlY2VpdmVyLCAnZGF0YScsIGFwcHNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAbGFzdFdpbnMgPSB3aW5zXG4gICAgICAgICAgICBcbiAgICAgICAgQHRpbWVyID0gc2V0VGltZW91dCBAdXBkYXRlLCBAaW50ZXJ2YWxcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IERhdGFcblxuIl19
//# sourceURL=../coffee/data.coffee
// koffee 1.3.0

/*
0000000     0000000   000000000   0000000 
000   000  000   000     000     000   000
000   000  000000000     000     000000000
000   000  000   000     000     000   000
0000000    000   000     000     000   000
 */
var Apps, Bounds, Clock, Data, Keyboard, Mouse, Sysinfo, Wins, _, electron, ioHook, klog, kstr, os, post, ref, slash, sysinfo,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf;

ref = require('kxk'), post = ref.post, klog = ref.klog, slash = ref.slash, kstr = ref.kstr, os = ref.os, _ = ref._;

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
            apps: new Apps,
            wins: new Wins
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
        this.interval = parseInt(1000 / 60);
        this.lastApps = null;
        this.timer = null;
    }

    Apps.prototype.start = function() {
        return this.update({
            force: true
        });
    };

    Apps.prototype.update = function(force) {
        var apps, i, len, proclist, receiver, ref1, wxw;
        if (force == null) {
            force = false;
        }
        if (os.platform() !== 'win32') {
            return;
        }
        clearTimeout(this.timer);
        wxw = require('wxw');
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
        this.interval = parseInt(1000 / 60);
        this.lastWins = null;
        this.timer = null;
    }

    Wins.prototype.start = function() {
        return this.update({
            force: true
        });
    };

    Wins.prototype.update = function(force) {
        var i, len, receiver, ref1, wins, wxw;
        if (force == null) {
            force = false;
        }
        if (os.platform() !== 'win32') {
            return;
        }
        clearTimeout(this.timer);
        wxw = require('wxw');
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
        return this.timer = setTimeout(this.update, this.interval);
    };

    return Wins;

})();

module.exports = Data;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEseUhBQUE7SUFBQTs7O0FBUUEsTUFBcUMsT0FBQSxDQUFRLEtBQVIsQ0FBckMsRUFBRSxlQUFGLEVBQVEsZUFBUixFQUFjLGlCQUFkLEVBQXFCLGVBQXJCLEVBQTJCLFdBQTNCLEVBQStCOztBQUUvQixNQUFBLEdBQVcsT0FBQSxDQUFRLFFBQVI7O0FBQ1gsT0FBQSxHQUFXLE9BQUEsQ0FBUSxtQkFBUjs7QUFDWCxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBRUw7SUFFQyxjQUFBOzs7O1FBRUMsTUFBTSxDQUFDLEtBQVAsQ0FBQTtRQUVBLElBQUMsQ0FBQSxTQUFELEdBQ0k7WUFBQSxLQUFBLEVBQVUsSUFBSSxLQUFkO1lBQ0EsUUFBQSxFQUFVLElBQUksUUFEZDtZQUVBLElBQUEsRUFBVSxJQUFJLElBRmQ7WUFHQSxJQUFBLEVBQVUsSUFBSSxJQUhkOztRQUtKLElBQUksQ0FBQyxFQUFMLENBQVEsYUFBUixFQUFzQixJQUFDLENBQUEsYUFBdkI7UUFFQSxXQUFBLENBQVksSUFBQyxDQUFBLFFBQWIsRUFBdUIsSUFBdkI7SUFaRDs7bUJBY0gsYUFBQSxHQUFlLFNBQUMsUUFBRCxFQUFXLEdBQVg7UUFJWCxJQUFHLENBQUksSUFBQyxDQUFBLFNBQVUsQ0FBQSxRQUFBLENBQWxCO1lBQ0ksSUFBQyxDQUFBLFNBQVUsQ0FBQSxRQUFBLENBQVgsR0FBdUIsSUFBSTtnQkFBQyxLQUFBLEVBQU0sS0FBUDtnQkFBYyxPQUFBLEVBQVEsT0FBdEI7YUFBK0IsQ0FBQSxRQUFBO1lBQzFELElBQUMsQ0FBQSxTQUFVLENBQUEsUUFBQSxDQUFTLENBQUMsU0FBckIsR0FBaUMsR0FGckM7O1FBSUEsSUFBRyxhQUFXLElBQUMsQ0FBQSxTQUFVLENBQUEsUUFBQSxDQUFTLENBQUMsU0FBaEMsRUFBQSxHQUFBLEtBQUg7bUJB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LE9BQUYsQ0FBVSxJQUFWLEVBQWdCLElBQUMsQ0FBQSxRQUFqQixDQUFoQjtZQUNJLElBQUksQ0FBQyxNQUFMLENBQVksTUFBWixFQUFvQixJQUFwQjtBQUNBO0FBQUEsaUJBQUEsc0NBQUE7O2dCQUNHLE9BQUEsQ0FBQyxHQUFELENBQUssV0FBQSxHQUFXLENBQUMsSUFBQSxDQUFLLFFBQUwsQ0FBRCxDQUFYLEdBQTBCLFFBQTFCLEdBQWtDLElBQUMsQ0FBQSxJQUFuQyxHQUF3QyxRQUF4QyxHQUFnRCxJQUFJLENBQUMsTUFBMUQ7Z0JBQ0MsSUFBSSxDQUFDLEtBQUwsQ0FBVyxRQUFYLEVBQXFCLE1BQXJCLEVBQTZCLElBQTdCO0FBRko7WUFJQSxJQUFDLENBQUEsUUFBRCxHQUFZLEtBTmhCOztlQVFBLElBQUMsQ0FBQSxLQUFELEdBQVMsVUFBQSxDQUFXLElBQUMsQ0FBQSxNQUFaLEVBQW9CLElBQUMsQ0FBQSxRQUFyQjtJQWpCTDs7Ozs7O0FBbUJaLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwMDAwMCBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMFxuMDAwICAgMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDBcbjAwMDAwMDAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgcG9zdCwga2xvZywgc2xhc2gsIGtzdHIsIG9zLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbmlvSG9vayAgID0gcmVxdWlyZSAnaW9ob29rJ1xuc3lzaW5mbyAgPSByZXF1aXJlICdzeXN0ZW1pbmZvcm1hdGlvbidcbmVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG5cbmNsYXNzIERhdGFcblxuICAgIEA6IC0+XG5cbiAgICAgICAgaW9Ib29rLnN0YXJ0KClcbiAgICAgICAgXG4gICAgICAgIEBwcm92aWRlcnMgPSBcbiAgICAgICAgICAgIG1vdXNlOiAgICBuZXcgTW91c2VcbiAgICAgICAgICAgIGtleWJvYXJkOiBuZXcgS2V5Ym9hcmRcbiAgICAgICAgICAgIGFwcHM6ICAgICBuZXcgQXBwc1xuICAgICAgICAgICAgd2luczogICAgIG5ldyBXaW5zXG4gICAgICAgIFxuICAgICAgICBwb3N0Lm9uICdyZXF1ZXN0RGF0YScgQG9uUmVxdWVzdERhdGFcbiAgICAgICAgXG4gICAgICAgIHNldEludGVydmFsIEBzbG93VGljaywgMTAwMFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgb25SZXF1ZXN0RGF0YTogKHByb3ZpZGVyLCB3aWQpID0+XG4gICAgICAgIFxuICAgICAgICAjIGtsb2cgXCJEYXRhLm9uUmVxdWVzdERhdGEgcHJvdmlkZXI6I3trc3RyIHByb3ZpZGVyfSB3aWQ6I3trc3RyIHdpZH1cIlxuICAgICAgICAgICAgXG4gICAgICAgIGlmIG5vdCBAcHJvdmlkZXJzW3Byb3ZpZGVyXVxuICAgICAgICAgICAgQHByb3ZpZGVyc1twcm92aWRlcl0gPSBuZXcge2Nsb2NrOkNsb2NrLCBzeXNpbmZvOlN5c2luZm99W3Byb3ZpZGVyXVxuICAgICAgICAgICAgQHByb3ZpZGVyc1twcm92aWRlcl0ucmVjZWl2ZXJzID0gW11cbiAgICAgICAgICAgIFxuICAgICAgICBpZiB3aWQgbm90IGluIEBwcm92aWRlcnNbcHJvdmlkZXJdLnJlY2VpdmVyc1xuICAgICAgICAgICAgQHByb3ZpZGVyc1twcm92aWRlcl0ucmVjZWl2ZXJzLnB1c2ggd2lkIFxuXG4gICAgc2xvd1RpY2s6ID0+XG4gICAgICAgIFxuICAgICAgICBmb3IgbmFtZSxwcm92aWRlciBvZiBAcHJvdmlkZXJzXG4gICAgICAgICAgICBpZiBwcm92aWRlci50aWNrID09ICdzbG93J1xuICAgICAgICAgICAgICAgIHByb3ZpZGVyLm9uVGljayBAXG4gICAgICAgIFxuICAgIHNlbmQ6IChwcm92aWRlciwgZGF0YSkgPT5cbiAgICAgICAgXG4gICAgICAgIGZvciByZWNlaXZlciBpbiBwcm92aWRlci5yZWNlaXZlcnNcbiAgICAgICAgICAgIHBvc3QudG9XaW4gcmVjZWl2ZXIsICdkYXRhJyBkYXRhXG4gICAgICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4jICAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuXG5jbGFzcyBDbG9ja1xuICAgICAgICBcbiAgICBAOiAoQG5hbWU9J2Nsb2NrJyBAdGljaz0nc2xvdycpIC0+XG4gICAgICAgIFxuICAgIG9uVGljazogKGRhdGEpID0+XG4gICAgICAgIFxuICAgICAgICB0aW1lID0gbmV3IERhdGUoKVxuICAgICAgICBcbiAgICAgICAgaG91cnMgICA9IHRpbWUuZ2V0SG91cnMoKVxuICAgICAgICBtaW51dGVzID0gdGltZS5nZXRNaW51dGVzKClcbiAgICAgICAgc2Vjb25kcyA9IHRpbWUuZ2V0U2Vjb25kcygpXG4gICAgICAgIFxuICAgICAgICBob3VyU3RyICAgPSBrc3RyLmxwYWQgaG91cnMsICAgMiAnMCdcbiAgICAgICAgbWludXRlU3RyID0ga3N0ci5scGFkIG1pbnV0ZXMsIDIgJzAnXG4gICAgICAgIHNlY29uZFN0ciA9IGtzdHIubHBhZCBzZWNvbmRzLCAyICcwJ1xuICAgICAgICBcbiAgICAgICAgZGF0YS5zZW5kIEAsXG4gICAgICAgICAgICBob3VyOiAgIGhvdXJzXG4gICAgICAgICAgICBtaW51dGU6IG1pbnV0ZXNcbiAgICAgICAgICAgIHNlY29uZDogc2Vjb25kc1xuICAgICAgICAgICAgc3RyOlxuICAgICAgICAgICAgICAgICAgICBob3VyOiAgIGhvdXJTdHJcbiAgICAgICAgICAgICAgICAgICAgbWludXRlOiBtaW51dGVTdHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kOiBzZWNvbmRTdHJcbiAgICAgICAgICAgICAgICAgICAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4jICAgICAgMDAwICAgICAwMDAgICAgICAgICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAwMDAwICAgXG5cbmNsYXNzIFN5c2luZm9cbiAgICAgICAgXG4gICAgQDogKEBuYW1lPSdzeXNpbmZvJyBAdGljaz0nc2xvdycpIC0+XG4gICAgICAgIFxuICAgICAgICBAcl9tYXggPSAxMDBcbiAgICAgICAgQHdfbWF4ID0gMTAwXG5cbiAgICAgICAgQHJ4X21heCA9IDEwMFxuICAgICAgICBAdHhfbWF4ID0gMTAwXG4gICAgICAgIFxuICAgIG9uVGljazogKGRhdGEpID0+XG4gICAgICAgIFxuICAgICAgICBzeXNpbmZvLmdldER5bmFtaWNEYXRhIChkKSA9PiBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcnhfc2VjID0gcGFyc2VJbnQgZC5uZXR3b3JrU3RhdHNbMF0ucnhfc2VjXG4gICAgICAgICAgICB0eF9zZWMgPSBwYXJzZUludCBkLm5ldHdvcmtTdGF0c1swXS50eF9zZWNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQHJ4X21heCA9IE1hdGgubWF4IEByeF9tYXgsIHJ4X3NlY1xuICAgICAgICAgICAgQHR4X21heCA9IE1hdGgubWF4IEB0eF9tYXgsIHR4X3NlY1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBuZCA9XG4gICAgICAgICAgICAgICAgbWVtOiBkLm1lbVxuICAgICAgICAgICAgICAgIG5ldDpcbiAgICAgICAgICAgICAgICAgICAgcnhfc2VjOiByeF9zZWNcbiAgICAgICAgICAgICAgICAgICAgdHhfc2VjOiB0eF9zZWNcbiAgICAgICAgICAgICAgICAgICAgcnhfbWF4OiBAcnhfbWF4XG4gICAgICAgICAgICAgICAgICAgIHR4X21heDogQHR4X21heFxuICAgICAgICAgICAgICAgIGNwdTpcbiAgICAgICAgICAgICAgICAgICAgc3lzOiBkLmN1cnJlbnRMb2FkLmN1cnJlbnRsb2FkLzEwMCBcbiAgICAgICAgICAgICAgICAgICAgdXNyOiBkLmN1cnJlbnRMb2FkLmN1cnJlbnRsb2FkX3VzZXIvMTAwXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgZGF0YS5kaXNrc0lPP1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJfc2VjID0gZC5kaXNrc0lPLnJJT19zZWNcbiAgICAgICAgICAgICAgICB3X3NlYyA9IGQuZGlza3NJTy53SU9fc2VjXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHJfbWF4ID0gTWF0aC5tYXggQHJfbWF4LCByX3NlY1xuICAgICAgICAgICAgICAgIEB3X21heCA9IE1hdGgubWF4IEB3X21heCwgd19zZWNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBuZC5kc2sgPSBcbiAgICAgICAgICAgICAgICAgICAgcl9zZWM6IHJfc2VjXG4gICAgICAgICAgICAgICAgICAgIHdfc2VjOiB3X3NlY1xuICAgICAgICAgICAgICAgICAgICByX21heDogQHJfbWF4XG4gICAgICAgICAgICAgICAgICAgIHdfbWF4OiBAd19tYXhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZGF0YS5zZW5kIEAsIG5kXG5cbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcblxuY2xhc3MgTW91c2VcbiAgICBcbiAgICBAOiAoQG5hbWU9J21vdXNlJyBAcmVjZWl2ZXJzPVtdKSAtPlxuICAgICAgICBcbiAgICAgICAgaW9Ib29rLm9uICdtb3VzZXdoZWVsJyBAb25FdmVudFxuICAgICAgICBpb0hvb2sub24gJ21vdXNlbW92ZScgIEBvbkV2ZW50XG4gICAgICAgIGlvSG9vay5vbiAnbW91c2Vkb3duJyAgQG9uRXZlbnRcbiAgICAgICAgaW9Ib29rLm9uICdtb3VzZXVwJyAgICBAb25FdmVudFxuICAgICAgICBcbiAgICAgICAgQGxhc3QgPSBEYXRlLm5vdygpXG4gICAgICAgIEBpbnRlcnZhbCA9IHBhcnNlSW50IDEwMDAvNjBcbiAgICAgICAgQGxhc3RFdmVudCA9IG51bGxcbiAgICAgICAgQHNlbmRUaW1lciA9IG51bGxcbiAgICAgICAgXG4gICAgb25FdmVudDogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgQGxhc3RFdmVudCA9IGV2ZW50XG4gICAgICAgIG5vdyA9IERhdGUubm93KClcbiAgICAgICAgY2xlYXJUaW1lb3V0IEBzZW5kVGltZXJcbiAgICAgICAgQHNlbmRUaW1lciA9IG51bGxcbiAgICAgICAgaWYgbm93IC0gQGxhc3QgPiBAaW50ZXJ2YWxcbiAgICAgICAgICAgIEBsYXN0ID0gbm93XG4gICAgICAgICAgICBwb3N0LnRvTWFpbiBAbmFtZSwgZXZlbnRcbiAgICAgICAgICAgIGZvciByZWNlaXZlciBpbiBAcmVjZWl2ZXJzXG4gICAgICAgICAgICAgICAgI2xvZyBcInJlY2VpdmVyOiN7a3N0ciByZWNlaXZlcn0gbmFtZToje0BuYW1lfSBldmVudDoje2tzdHIgZXZlbnR9XCJcbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIHJlY2VpdmVyLCAnZGF0YScsIGV2ZW50XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzZW5kVGltZXIgPSBzZXRUaW1lb3V0ICg9PiBAb25FdmVudCBAbGFzdEV2ZW50KSwgQGludGVydmFsXG4gICAgICAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG5cbmNsYXNzIEtleWJvYXJkXG4gICAgXG4gICAgQDogKEBuYW1lPSdrZXlib2FyZCcgQHJlY2VpdmVycz1bXSkgLT5cbiAgICAgICAgXG4gICAgICAgIGlvSG9vay5vbiAna2V5ZG93bicgQG9uRXZlbnRcbiAgICAgICAgaW9Ib29rLm9uICdrZXl1cCcgICBAb25FdmVudFxuXG4gICAgb25FdmVudDogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgcG9zdC50b01haW4gQG5hbWUsIGV2ZW50XG4gICAgICAgIGZvciByZWNlaXZlciBpbiBAcmVjZWl2ZXJzXG4gICAgICAgICAgICBwb3N0LnRvV2luIHJlY2VpdmVyLCBAbmFtZSwgZXZlbnRcbiAgICAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4jIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG5cbmNsYXNzIEJvdW5kc1xuICAgIFxuICAgIEA6IChAbmFtZT0nYm91bmRzJyBAcmVjZWl2ZXJzPVtdKSAtPlxuICAgICAgICBcbiAgICAgICAgcG9zdC5vbiAnYm91bmRzJyBAb25Cb3VuZHNcbiAgICAgICAgXG4gICAgICAgIEBsYXN0SW5mb3MgPSBudWxsXG4gICAgICAgIEBvbkJvdW5kcygpXG4gICAgICAgXG4gICAgb25Cb3VuZHM6IChtc2csIGFyZykgPT5cbiAgICAgICAgXG4gICAgICAgIGJvdW5kcyA9IHJlcXVpcmUgJy4vYm91bmRzJ1xuICAgICAgICBpbmZvcyA9IGJvdW5kcy5pbmZvc1xuICAgICAgICBpZiBub3QgXy5pc0VxdWFsIGluZm9zLCBAbGFzdEluZm9zXG4gICAgICAgICAgICBAbGFzdEluZm9zID0gaW5mb3NcbiAgICAgICAgICAgIGZvciByZWNlaXZlciBpbiBAcmVjZWl2ZXJzXG4gICAgICAgICAgICAgICAgbG9nIFwicmVjZWl2ZXI6I3trc3RyIHJlY2VpdmVyfSBuYW1lOiN7QG5hbWV9IGV2ZW50OiN7a3N0ciBldmVudH1cIlxuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gcmVjZWl2ZXIsICdkYXRhJywgaW5mb3NcbiAgICAgICAgICAgIFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAgICAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMDAwMDAgICBcblxuY2xhc3MgQXBwc1xuICAgIFxuICAgIEA6IChAbmFtZT0nYXBwcycgQHJlY2VpdmVycz1bXSkgLT5cbiAgICAgICAgXG4gICAgICAgIEBsYXN0ICAgICA9IERhdGUubm93KClcbiAgICAgICAgQGludGVydmFsID0gcGFyc2VJbnQgMTAwMC82MFxuICAgICAgICBAbGFzdEFwcHMgPSBudWxsXG4gICAgICAgIEB0aW1lciAgICA9IG51bGxcbiAgICAgICAgXG4gICAgc3RhcnQ6ID0+IEB1cGRhdGUgZm9yY2U6dHJ1ZVxuICAgICAgICBcbiAgICB1cGRhdGU6IChmb3JjZT1mYWxzZSkgPT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBvcy5wbGF0Zm9ybSgpICE9ICd3aW4zMidcblxuICAgICAgICBjbGVhclRpbWVvdXQgQHRpbWVyXG4gICAgICAgIFxuICAgICAgICB3eHcgPSByZXF1aXJlICd3eHcnXG4gICAgICAgIHByb2NsaXN0ID0gd3h3ICdwcm9jJ1xuICAgICAgICBhcHBzID0gQXJyYXkuZnJvbSBuZXcgU2V0IHByb2NsaXN0Lm1hcCAocCkgLT4gcC5wYXRoXG4gICAgICAgIFxuICAgICAgICBhcHBzID0gYXBwcy5maWx0ZXIgKHApIC0+IFxuICAgICAgICAgICAgcyA9IHNsYXNoLnBhdGggc2xhc2gucmVtb3ZlRHJpdmUgcCBcbiAgICAgICAgICAgIGlmIHMuc3RhcnRzV2l0aCAnL1dpbmRvd3MvU3lzdGVtMzInXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNsYXNoLmJhc2UocykgaW4gWydjbWQnICdwb3dlcnNoZWxsJ11cbiAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgYXBwcy5zb3J0KClcbiAgICAgICAgXG4gICAgICAgIGlmIGZvcmNlIG9yIG5vdCBfLmlzRXF1YWwgYXBwcywgQGxhc3RBcHBzXG4gICAgICAgICAgICBwb3N0LnRvTWFpbiAnYXBwcycsIGFwcHNcbiAgICAgICAgICAgIGZvciByZWNlaXZlciBpbiBAcmVjZWl2ZXJzXG4gICAgICAgICAgICAgICAgbG9nIFwicmVjZWl2ZXI6I3trc3RyIHJlY2VpdmVyfSBuYW1lOiN7QG5hbWV9IGFwcHM6I3thcHBzLmxlbmd0aH1cIlxuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gcmVjZWl2ZXIsICdkYXRhJywgYXBwc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBAbGFzdEFwcHMgPSBhcHBzXG4gICAgICAgICAgICBcbiAgICAgICAgQHRpbWVyID0gc2V0VGltZW91dCBAdXBkYXRlLCBAaW50ZXJ2YWxcbiAgICAgICAgICAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIFxuIyAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG5cbmNsYXNzIFdpbnNcbiAgICBcbiAgICBAOiAoQG5hbWU9J3dpbnMnIEByZWNlaXZlcnM9W10pIC0+XG4gICAgICAgIFxuICAgICAgICBAbGFzdCAgICAgPSBEYXRlLm5vdygpXG4gICAgICAgIEBpbnRlcnZhbCA9IHBhcnNlSW50IDEwMDAvNjBcbiAgICAgICAgQGxhc3RXaW5zID0gbnVsbFxuICAgICAgICBAdGltZXIgICAgPSBudWxsXG4gICAgICAgIFxuICAgIHN0YXJ0OiA9PiBAdXBkYXRlIGZvcmNlOnRydWVcbiAgICAgICAgXG4gICAgdXBkYXRlOiAoZm9yY2U9ZmFsc2UpID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgb3MucGxhdGZvcm0oKSAhPSAnd2luMzInXG5cbiAgICAgICAgY2xlYXJUaW1lb3V0IEB0aW1lclxuICAgICAgICBcbiAgICAgICAgd3h3ID0gcmVxdWlyZSAnd3h3J1xuICAgICAgICB3aW5zID0gd3h3ICdpbmZvJ1xuICAgICAgICBcbiAgICAgICAgaWYgZm9yY2Ugb3Igbm90IF8uaXNFcXVhbCB3aW5zLCBAbGFzdFdpbnNcbiAgICAgICAgICAgIHBvc3QudG9NYWluICd3aW5zJywgd2luc1xuICAgICAgICAgICAgZm9yIHJlY2VpdmVyIGluIEByZWNlaXZlcnNcbiAgICAgICAgICAgICAgICBsb2cgXCJyZWNlaXZlcjoje2tzdHIgcmVjZWl2ZXJ9IG5hbWU6I3tAbmFtZX0gYXBwczoje2FwcHMubGVuZ3RofVwiXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiByZWNlaXZlciwgJ2RhdGEnLCBhcHBzXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEBsYXN0V2lucyA9IHdpbnNcbiAgICAgICAgICAgIFxuICAgICAgICBAdGltZXIgPSBzZXRUaW1lb3V0IEB1cGRhdGUsIEBpbnRlcnZhbFxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gRGF0YVxuXG4iXX0=
//# sourceURL=../coffee/data.coffee
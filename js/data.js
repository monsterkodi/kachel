// koffee 1.3.0

/*
0000000     0000000   000000000   0000000 
000   000  000   000     000     000   000
000   000  000000000     000     000000000
000   000  000   000     000     000   000
0000000    000   000     000     000   000
 */
var Apps, Bounds, Clock, Data, Keyboard, Mouse, Sysinfo, _, electron, ioHook, klog, kstr, os, post, ref, slash, sysinfo,
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
            apps: new Apps
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
        this.last = Date.now();
        this.interval = parseInt(1000 / 60);
        this.lastApps = null;
        this.timer = null;
        this.update();
    }

    Apps.prototype.update = function() {
        var apps, i, len, proclist, receiver, ref1, wxw;
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
        if (!_.isEqual(apps, this.lastApps)) {
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

module.exports = Data;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsbUhBQUE7SUFBQTs7O0FBUUEsTUFBcUMsT0FBQSxDQUFRLEtBQVIsQ0FBckMsRUFBRSxlQUFGLEVBQVEsZUFBUixFQUFjLGlCQUFkLEVBQXFCLGVBQXJCLEVBQTJCLFdBQTNCLEVBQStCOztBQUUvQixNQUFBLEdBQVcsT0FBQSxDQUFRLFFBQVI7O0FBQ1gsT0FBQSxHQUFXLE9BQUEsQ0FBUSxtQkFBUjs7QUFDWCxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBRUw7SUFFQyxjQUFBOzs7O1FBRUMsTUFBTSxDQUFDLEtBQVAsQ0FBQTtRQUVBLElBQUMsQ0FBQSxTQUFELEdBQ0k7WUFBQSxLQUFBLEVBQVUsSUFBSSxLQUFkO1lBQ0EsUUFBQSxFQUFVLElBQUksUUFEZDtZQUVBLElBQUEsRUFBVSxJQUFJLElBRmQ7O1FBSUosSUFBSSxDQUFDLEVBQUwsQ0FBUSxhQUFSLEVBQXNCLElBQUMsQ0FBQSxhQUF2QjtRQUVBLFdBQUEsQ0FBWSxJQUFDLENBQUEsUUFBYixFQUF1QixJQUF2QjtJQVhEOzttQkFhSCxhQUFBLEdBQWUsU0FBQyxRQUFELEVBQVcsR0FBWDtRQUlYLElBQUcsQ0FBSSxJQUFDLENBQUEsU0FBVSxDQUFBLFFBQUEsQ0FBbEI7WUFDSSxJQUFDLENBQUEsU0FBVSxDQUFBLFFBQUEsQ0FBWCxHQUF1QixJQUFJO2dCQUFDLEtBQUEsRUFBTSxLQUFQO2dCQUFjLE9BQUEsRUFBUSxPQUF0QjthQUErQixDQUFBLFFBQUE7WUFDMUQsSUFBQyxDQUFBLFNBQVUsQ0FBQSxRQUFBLENBQVMsQ0FBQyxTQUFyQixHQUFpQyxHQUZyQzs7UUFJQSxJQUFHLGFBQVcsSUFBQyxDQUFBLFNBQVUsQ0FBQSxRQUFBLENBQVMsQ0FBQyxTQUFoQyxFQUFBLEdBQUEsS0FBSDttQkFDSSxJQUFDLENBQUEsU0FBVSxDQUFBLFFB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LENBQVgsR0FBMEIsUUFBMUIsR0FBa0MsSUFBQyxDQUFBLElBQW5DLEdBQXdDLFFBQXhDLEdBQWdELElBQUksQ0FBQyxNQUExRDtnQkFDQyxJQUFJLENBQUMsS0FBTCxDQUFXLFFBQVgsRUFBcUIsTUFBckIsRUFBNkIsSUFBN0I7QUFGSjtZQUlBLElBQUMsQ0FBQSxRQUFELEdBQVksS0FOaEI7O2VBUUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxVQUFBLENBQVcsSUFBQyxDQUFBLE1BQVosRUFBb0IsSUFBQyxDQUFBLFFBQXJCO0lBMUJMOzs7Ozs7QUE0QlosTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwIFxuMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4wMDAgICAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4jIyNcblxueyBwb3N0LCBrbG9nLCBzbGFzaCwga3N0ciwgb3MsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuaW9Ib29rICAgPSByZXF1aXJlICdpb2hvb2snXG5zeXNpbmZvICA9IHJlcXVpcmUgJ3N5c3RlbWluZm9ybWF0aW9uJ1xuZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcblxuY2xhc3MgRGF0YVxuXG4gICAgQDogLT5cblxuICAgICAgICBpb0hvb2suc3RhcnQoKVxuICAgICAgICBcbiAgICAgICAgQHByb3ZpZGVycyA9IFxuICAgICAgICAgICAgbW91c2U6ICAgIG5ldyBNb3VzZVxuICAgICAgICAgICAga2V5Ym9hcmQ6IG5ldyBLZXlib2FyZFxuICAgICAgICAgICAgYXBwczogICAgIG5ldyBBcHBzXG4gICAgICAgIFxuICAgICAgICBwb3N0Lm9uICdyZXF1ZXN0RGF0YScgQG9uUmVxdWVzdERhdGFcbiAgICAgICAgXG4gICAgICAgIHNldEludGVydmFsIEBzbG93VGljaywgMTAwMFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgb25SZXF1ZXN0RGF0YTogKHByb3ZpZGVyLCB3aWQpID0+XG4gICAgICAgIFxuICAgICAgICAjIGtsb2cgXCJEYXRhLm9uUmVxdWVzdERhdGEgcHJvdmlkZXI6I3trc3RyIHByb3ZpZGVyfSB3aWQ6I3trc3RyIHdpZH1cIlxuICAgICAgICAgICAgXG4gICAgICAgIGlmIG5vdCBAcHJvdmlkZXJzW3Byb3ZpZGVyXVxuICAgICAgICAgICAgQHByb3ZpZGVyc1twcm92aWRlcl0gPSBuZXcge2Nsb2NrOkNsb2NrLCBzeXNpbmZvOlN5c2luZm99W3Byb3ZpZGVyXVxuICAgICAgICAgICAgQHByb3ZpZGVyc1twcm92aWRlcl0ucmVjZWl2ZXJzID0gW11cbiAgICAgICAgICAgIFxuICAgICAgICBpZiB3aWQgbm90IGluIEBwcm92aWRlcnNbcHJvdmlkZXJdLnJlY2VpdmVyc1xuICAgICAgICAgICAgQHByb3ZpZGVyc1twcm92aWRlcl0ucmVjZWl2ZXJzLnB1c2ggd2lkIFxuXG4gICAgc2xvd1RpY2s6ID0+XG4gICAgICAgIFxuICAgICAgICBmb3IgbmFtZSxwcm92aWRlciBvZiBAcHJvdmlkZXJzXG4gICAgICAgICAgICBpZiBwcm92aWRlci50aWNrID09ICdzbG93J1xuICAgICAgICAgICAgICAgIHByb3ZpZGVyLm9uVGljayBAXG4gICAgICAgIFxuICAgIHNlbmQ6IChwcm92aWRlciwgZGF0YSkgPT5cbiAgICAgICAgXG4gICAgICAgIGZvciByZWNlaXZlciBpbiBwcm92aWRlci5yZWNlaXZlcnNcbiAgICAgICAgICAgIHBvc3QudG9XaW4gcmVjZWl2ZXIsICdkYXRhJyBkYXRhXG4gICAgICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4jICAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuXG5jbGFzcyBDbG9ja1xuICAgICAgICBcbiAgICBAOiAoQG5hbWU9J2Nsb2NrJyBAdGljaz0nc2xvdycpIC0+XG4gICAgICAgIFxuICAgIG9uVGljazogKGRhdGEpID0+XG4gICAgICAgIFxuICAgICAgICB0aW1lID0gbmV3IERhdGUoKVxuICAgICAgICBcbiAgICAgICAgaG91cnMgICA9IHRpbWUuZ2V0SG91cnMoKVxuICAgICAgICBtaW51dGVzID0gdGltZS5nZXRNaW51dGVzKClcbiAgICAgICAgc2Vjb25kcyA9IHRpbWUuZ2V0U2Vjb25kcygpXG4gICAgICAgIFxuICAgICAgICBob3VyU3RyICAgPSBrc3RyLmxwYWQgaG91cnMsICAgMiAnMCdcbiAgICAgICAgbWludXRlU3RyID0ga3N0ci5scGFkIG1pbnV0ZXMsIDIgJzAnXG4gICAgICAgIHNlY29uZFN0ciA9IGtzdHIubHBhZCBzZWNvbmRzLCAyICcwJ1xuICAgICAgICBcbiAgICAgICAgZGF0YS5zZW5kIEAsXG4gICAgICAgICAgICBob3VyOiAgIGhvdXJzXG4gICAgICAgICAgICBtaW51dGU6IG1pbnV0ZXNcbiAgICAgICAgICAgIHNlY29uZDogc2Vjb25kc1xuICAgICAgICAgICAgc3RyOlxuICAgICAgICAgICAgICAgICAgICBob3VyOiAgIGhvdXJTdHJcbiAgICAgICAgICAgICAgICAgICAgbWludXRlOiBtaW51dGVTdHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kOiBzZWNvbmRTdHJcbiAgICAgICAgICAgICAgICAgICAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4jICAgICAgMDAwICAgICAwMDAgICAgICAgICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAwMDAwICAgXG5cbmNsYXNzIFN5c2luZm9cbiAgICAgICAgXG4gICAgQDogKEBuYW1lPSdzeXNpbmZvJyBAdGljaz0nc2xvdycpIC0+XG4gICAgICAgIFxuICAgICAgICBAcl9tYXggPSAxMDBcbiAgICAgICAgQHdfbWF4ID0gMTAwXG5cbiAgICAgICAgQHJ4X21heCA9IDEwMFxuICAgICAgICBAdHhfbWF4ID0gMTAwXG4gICAgICAgIFxuICAgIG9uVGljazogKGRhdGEpID0+XG4gICAgICAgIFxuICAgICAgICBzeXNpbmZvLmdldER5bmFtaWNEYXRhIChkKSA9PiBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcnhfc2VjID0gcGFyc2VJbnQgZC5uZXR3b3JrU3RhdHNbMF0ucnhfc2VjXG4gICAgICAgICAgICB0eF9zZWMgPSBwYXJzZUludCBkLm5ldHdvcmtTdGF0c1swXS50eF9zZWNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQHJ4X21heCA9IE1hdGgubWF4IEByeF9tYXgsIHJ4X3NlY1xuICAgICAgICAgICAgQHR4X21heCA9IE1hdGgubWF4IEB0eF9tYXgsIHR4X3NlY1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBuZCA9XG4gICAgICAgICAgICAgICAgbWVtOiBkLm1lbVxuICAgICAgICAgICAgICAgIG5ldDpcbiAgICAgICAgICAgICAgICAgICAgcnhfc2VjOiByeF9zZWNcbiAgICAgICAgICAgICAgICAgICAgdHhfc2VjOiB0eF9zZWNcbiAgICAgICAgICAgICAgICAgICAgcnhfbWF4OiBAcnhfbWF4XG4gICAgICAgICAgICAgICAgICAgIHR4X21heDogQHR4X21heFxuICAgICAgICAgICAgICAgIGNwdTpcbiAgICAgICAgICAgICAgICAgICAgc3lzOiBkLmN1cnJlbnRMb2FkLmN1cnJlbnRsb2FkLzEwMCBcbiAgICAgICAgICAgICAgICAgICAgdXNyOiBkLmN1cnJlbnRMb2FkLmN1cnJlbnRsb2FkX3VzZXIvMTAwXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgZGF0YS5kaXNrc0lPP1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJfc2VjID0gZC5kaXNrc0lPLnJJT19zZWNcbiAgICAgICAgICAgICAgICB3X3NlYyA9IGQuZGlza3NJTy53SU9fc2VjXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHJfbWF4ID0gTWF0aC5tYXggQHJfbWF4LCByX3NlY1xuICAgICAgICAgICAgICAgIEB3X21heCA9IE1hdGgubWF4IEB3X21heCwgd19zZWNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBuZC5kc2sgPSBcbiAgICAgICAgICAgICAgICAgICAgcl9zZWM6IHJfc2VjXG4gICAgICAgICAgICAgICAgICAgIHdfc2VjOiB3X3NlY1xuICAgICAgICAgICAgICAgICAgICByX21heDogQHJfbWF4XG4gICAgICAgICAgICAgICAgICAgIHdfbWF4OiBAd19tYXhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZGF0YS5zZW5kIEAsIG5kXG5cbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcblxuY2xhc3MgTW91c2VcbiAgICBcbiAgICBAOiAoQG5hbWU9J21vdXNlJyBAcmVjZWl2ZXJzPVtdKSAtPlxuICAgICAgICBcbiAgICAgICAgaW9Ib29rLm9uICdtb3VzZXdoZWVsJyBAb25FdmVudFxuICAgICAgICBpb0hvb2sub24gJ21vdXNlbW92ZScgIEBvbkV2ZW50XG4gICAgICAgIGlvSG9vay5vbiAnbW91c2Vkb3duJyAgQG9uRXZlbnRcbiAgICAgICAgaW9Ib29rLm9uICdtb3VzZXVwJyAgICBAb25FdmVudFxuICAgICAgICBcbiAgICAgICAgQGxhc3QgPSBEYXRlLm5vdygpXG4gICAgICAgIEBpbnRlcnZhbCA9IHBhcnNlSW50IDEwMDAvNjBcbiAgICAgICAgQGxhc3RFdmVudCA9IG51bGxcbiAgICAgICAgQHNlbmRUaW1lciA9IG51bGxcbiAgICAgICAgXG4gICAgb25FdmVudDogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgQGxhc3RFdmVudCA9IGV2ZW50XG4gICAgICAgIG5vdyA9IERhdGUubm93KClcbiAgICAgICAgY2xlYXJUaW1lb3V0IEBzZW5kVGltZXJcbiAgICAgICAgQHNlbmRUaW1lciA9IG51bGxcbiAgICAgICAgaWYgbm93IC0gQGxhc3QgPiBAaW50ZXJ2YWxcbiAgICAgICAgICAgIEBsYXN0ID0gbm93XG4gICAgICAgICAgICBwb3N0LnRvTWFpbiBAbmFtZSwgZXZlbnRcbiAgICAgICAgICAgIGZvciByZWNlaXZlciBpbiBAcmVjZWl2ZXJzXG4gICAgICAgICAgICAgICAgI2xvZyBcInJlY2VpdmVyOiN7a3N0ciByZWNlaXZlcn0gbmFtZToje0BuYW1lfSBldmVudDoje2tzdHIgZXZlbnR9XCJcbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIHJlY2VpdmVyLCAnZGF0YScsIGV2ZW50XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzZW5kVGltZXIgPSBzZXRUaW1lb3V0ICg9PiBAb25FdmVudCBAbGFzdEV2ZW50KSwgQGludGVydmFsXG4gICAgICAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG5cbmNsYXNzIEtleWJvYXJkXG4gICAgXG4gICAgQDogKEBuYW1lPSdrZXlib2FyZCcgQHJlY2VpdmVycz1bXSkgLT5cbiAgICAgICAgXG4gICAgICAgIGlvSG9vay5vbiAna2V5ZG93bicgQG9uRXZlbnRcbiAgICAgICAgaW9Ib29rLm9uICdrZXl1cCcgICBAb25FdmVudFxuXG4gICAgb25FdmVudDogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgcG9zdC50b01haW4gQG5hbWUsIGV2ZW50XG4gICAgICAgIGZvciByZWNlaXZlciBpbiBAcmVjZWl2ZXJzXG4gICAgICAgICAgICBwb3N0LnRvV2luIHJlY2VpdmVyLCBAbmFtZSwgZXZlbnRcbiAgICAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4jIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG5cbmNsYXNzIEJvdW5kc1xuICAgIFxuICAgIEA6IChAbmFtZT0nYm91bmRzJyBAcmVjZWl2ZXJzPVtdKSAtPlxuICAgICAgICBcbiAgICAgICAgcG9zdC5vbiAnYm91bmRzJyBAb25Cb3VuZHNcbiAgICAgICAgXG4gICAgICAgIEBsYXN0SW5mb3MgPSBudWxsXG4gICAgICAgIEBvbkJvdW5kcygpXG4gICAgICAgXG4gICAgb25Cb3VuZHM6IChtc2csIGFyZykgPT5cbiAgICAgICAgXG4gICAgICAgIGJvdW5kcyA9IHJlcXVpcmUgJy4vYm91bmRzJ1xuICAgICAgICBpbmZvcyA9IGJvdW5kcy5pbmZvc1xuICAgICAgICBpZiBub3QgXy5pc0VxdWFsIGluZm9zLCBAbGFzdEluZm9zXG4gICAgICAgICAgICBAbGFzdEluZm9zID0gaW5mb3NcbiAgICAgICAgICAgIGZvciByZWNlaXZlciBpbiBAcmVjZWl2ZXJzXG4gICAgICAgICAgICAgICAgbG9nIFwicmVjZWl2ZXI6I3trc3RyIHJlY2VpdmVyfSBuYW1lOiN7QG5hbWV9IGV2ZW50OiN7a3N0ciBldmVudH1cIlxuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gcmVjZWl2ZXIsICdkYXRhJywgaW5mb3NcbiAgICAgICAgICAgIFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAgICAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMDAwMDAgICBcblxuY2xhc3MgQXBwc1xuICAgIFxuICAgIEA6IChAbmFtZT0nYXBwcycgQHJlY2VpdmVycz1bXSkgLT5cbiAgICAgICAgXG4gICAgICAgIEBsYXN0ICAgICA9IERhdGUubm93KClcbiAgICAgICAgQGludGVydmFsID0gcGFyc2VJbnQgMTAwMC82MFxuICAgICAgICBAbGFzdEFwcHMgPSBudWxsXG4gICAgICAgIEB0aW1lciAgICA9IG51bGxcbiAgICAgICAgQHVwZGF0ZSgpXG4gICAgICAgIFxuICAgIHVwZGF0ZTogPT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBvcy5wbGF0Zm9ybSgpICE9ICd3aW4zMidcblxuICAgICAgICBjbGVhclRpbWVvdXQgQHRpbWVyXG4gICAgICAgIFxuICAgICAgICB3eHcgPSByZXF1aXJlICd3eHcnXG4gICAgICAgIHByb2NsaXN0ID0gd3h3ICdwcm9jJ1xuICAgICAgICBhcHBzID0gQXJyYXkuZnJvbSBuZXcgU2V0IHByb2NsaXN0Lm1hcCAocCkgLT4gcC5wYXRoXG4gICAgICAgIFxuICAgICAgICBhcHBzID0gYXBwcy5maWx0ZXIgKHApIC0+IFxuICAgICAgICAgICAgcyA9IHNsYXNoLnBhdGggc2xhc2gucmVtb3ZlRHJpdmUgcCBcbiAgICAgICAgICAgIGlmIHMuc3RhcnRzV2l0aCAnL1dpbmRvd3MvU3lzdGVtMzInXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNsYXNoLmJhc2UocykgaW4gWydjbWQnICdwb3dlcnNoZWxsJ11cbiAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgYXBwcy5zb3J0KClcbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBfLmlzRXF1YWwgYXBwcywgQGxhc3RBcHBzXG4gICAgICAgICAgICBwb3N0LnRvTWFpbiAnYXBwcycsIGFwcHNcbiAgICAgICAgICAgIGZvciByZWNlaXZlciBpbiBAcmVjZWl2ZXJzXG4gICAgICAgICAgICAgICAgbG9nIFwicmVjZWl2ZXI6I3trc3RyIHJlY2VpdmVyfSBuYW1lOiN7QG5hbWV9IGFwcHM6I3thcHBzLmxlbmd0aH1cIlxuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gcmVjZWl2ZXIsICdkYXRhJywgYXBwc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBAbGFzdEFwcHMgPSBhcHBzXG4gICAgICAgICAgICBcbiAgICAgICAgQHRpbWVyID0gc2V0VGltZW91dCBAdXBkYXRlLCBAaW50ZXJ2YWxcbiAgICAgICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gRGF0YVxuXG4iXX0=
//# sourceURL=../coffee/data.coffee
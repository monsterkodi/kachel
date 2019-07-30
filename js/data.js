// koffee 1.3.0

/*
0000000     0000000   000000000   0000000 
000   000  000   000     000     000   000
000   000  000000000     000     000000000
000   000  000   000     000     000   000
0000000    000   000     000     000   000
 */
var Apps, Bounds, Clock, Data, Keyboard, Mouse, Sysinfo, Wins, _, electron, klog, kstr, os, post, ref, slash, sysinfo, udp, wxw,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf;

ref = require('kxk'), post = ref.post, klog = ref.klog, slash = ref.slash, kstr = ref.kstr, udp = ref.udp, os = ref.os, _ = ref._;

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
        this.onUDP = bind(this.onUDP, this);
        if (os.platform() === 'win32') {
            this.udp = udp({
                port: 66666,
                onMsg: this.onUDP
            });
            this.hook = wxw('hook');
        }
        this.providers = {
            mouse: new Mouse,
            keyboard: new Keyboard,
            apps: new Apps,
            wins: new Wins
        };
        post.on('requestData', this.onRequestData);
        setTimeout(this.slowTick, 1000);
    }

    Data.prototype.detach = function() {
        var ref1;
        return klog('Data.detach', this.hook != null, (ref1 = this.hook) != null ? ref1.kill('SIGKILL') : void 0);
    };

    Data.prototype.onUDP = function(msg) {
        return console.log("udp", msg);
    };

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
        ref1 = this.providers;
        for (name in ref1) {
            provider = ref1[name];
            if (provider.tick === 'slow') {
                provider.onTick(this);
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
        if (global.dragging) {
            return;
        }
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
                console.log("receiver:" + (kstr(receiver)) + " name:" + this.name + " event:" + (kstr(event)));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsMkhBQUE7SUFBQTs7O0FBUUEsTUFBMEMsT0FBQSxDQUFRLEtBQVIsQ0FBMUMsRUFBRSxlQUFGLEVBQVEsZUFBUixFQUFjLGlCQUFkLEVBQXFCLGVBQXJCLEVBQTJCLGFBQTNCLEVBQWdDLFdBQWhDLEVBQW9DOztBQUVwQyxPQUFBLEdBQVcsT0FBQSxDQUFRLG1CQUFSOztBQUNYLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFFWCxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixPQUFwQjtJQUFpQyxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVIsRUFBdkM7OztBQUVNO0lBRUMsY0FBQTs7Ozs7UUFFQyxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixPQUFwQjtZQUVJLElBQUMsQ0FBQSxHQUFELEdBQVEsR0FBQSxDQUFJO2dCQUFBLElBQUEsRUFBSyxLQUFMO2dCQUFXLEtBQUEsRUFBTSxJQUFDLENBQUEsS0FBbEI7YUFBSjtZQUNSLElBQUMsQ0FBQSxJQUFELEdBQVEsR0FBQSxDQUFJLE1BQUosRUFIWjs7UUFLQSxJQUFDLENBQUEsU0FBRCxHQUNJO1lBQUEsS0FBQSxFQUFVLElBQUksS0FBZDtZQUNBLFFBQUEsRUFBVSxJQUFJLFFBRGQ7WUFFQSxJQUFBLEVBQVUsSUFBSSxJQUZkO1lBR0EsSUFBQSxFQUFVLElBQUksSUFIZDs7UUFLSixJQUFJLENBQUMsRUFBTCxDQUFRLGFBQVIsRUFBc0IsSUFBQyxDQUFBLGFBQXZCO1FBRUEsVUFBQSxDQUFXLElBQUMsQ0FBQSxRQUFaLEVBQXNCLElBQXRCO0lBZkQ7O21CQWlCSCxNQUFBLEdBQVEsU0FBQTtBQUVKLFlBQUE7ZUFBQSxJQUFBLENBQUssYUFBTCxFQUFtQixpQkFBbkIsbUNBQWdDLENBQUUsSUFBUCxDQUFZLFNBQVos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O1FBQ1osSUFBQyxDQUFBLEtBQUQsR0FBWTtJQUxiOzttQkFPSCxLQUFBLEdBQU8sU0FBQTtlQUFHLElBQUMsQ0FBQSxNQUFELENBQVE7WUFBQSxLQUFBLEVBQU0sSUFBTjtTQUFSO0lBQUg7O21CQUVQLE1BQUEsR0FBUSxTQUFDLEtBQUQ7QUFFSixZQUFBOztZQUZLLFFBQU07O1FBRVgsSUFBVSxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsT0FBM0I7QUFBQSxtQkFBQTs7UUFFQSxZQUFBLENBQWEsSUFBQyxDQUFBLEtBQWQ7UUFFQSxJQUFHLENBQUksTUFBTSxDQUFDLFFBQWQ7WUFFSSxJQUFBLEdBQU8sR0FBQSxDQUFJLE1BQUo7WUFFUCxJQUFHLEtBQUEsSUFBUyxDQUFJLENBQUMsQ0FBQyxPQUFGLENBQVUsSUFBVixFQUFnQixJQUFDLENBQUEsUUFBakIsQ0FBaEI7Z0JBQ0ksSUFBSSxDQUFDLE1BQUwsQ0FBWSxNQUFaLEVBQW9CLElBQXBCO0FBQ0E7QUFBQSxxQkFBQSxzQ0FBQTs7b0JBQ0csT0FBQSxDQUFDLEdBQUQsQ0FBSyxXQUFBLEdBQVcsQ0FBQyxJQUFBLENBQUssUUFBTCxDQUFELENBQVgsR0FBMEIsUUFBMUIsR0FBa0MsSUFBQyxDQUFBLElBQW5DLEdBQXdDLFFBQXhDLEdBQWdELElBQUksQ0FBQyxNQUExRDtvQkFDQyxJQUFJLENBQUMsS0FBTCxDQUFXLFFBQVgsRUFBcUIsTUFBckIsRUFBNkIsSUFBN0I7QUFGSjtnQkFJQSxJQUFDLENBQUEsUUFBRCxHQUFZLEtBTmhCO2FBSko7O2VBWUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxVQUFBLENBQVcsSUFBQyxDQUFBLE1BQVosRUFBb0IsSUFBQyxDQUFBLFFBQXJCO0lBbEJMOzs7Ozs7QUFvQlosTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwIFxuMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4wMDAgICAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4jIyNcblxueyBwb3N0LCBrbG9nLCBzbGFzaCwga3N0ciwgdWRwLCBvcywgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5zeXNpbmZvICA9IHJlcXVpcmUgJ3N5c3RlbWluZm9ybWF0aW9uJ1xuZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcblxuaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInIHRoZW4gd3h3ID0gcmVxdWlyZSAnd3h3J1xuXG5jbGFzcyBEYXRhXG5cbiAgICBAOiAtPlxuICAgICAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEB1ZHAgID0gdWRwIHBvcnQ6NjY2NjYgb25Nc2c6QG9uVURQXG4gICAgICAgICAgICBAaG9vayA9IHd4dyAnaG9vaydcbiAgICAgICAgXG4gICAgICAgIEBwcm92aWRlcnMgPSBcbiAgICAgICAgICAgIG1vdXNlOiAgICBuZXcgTW91c2VcbiAgICAgICAgICAgIGtleWJvYXJkOiBuZXcgS2V5Ym9hcmRcbiAgICAgICAgICAgIGFwcHM6ICAgICBuZXcgQXBwc1xuICAgICAgICAgICAgd2luczogICAgIG5ldyBXaW5zXG4gICAgICAgIFxuICAgICAgICBwb3N0Lm9uICdyZXF1ZXN0RGF0YScgQG9uUmVxdWVzdERhdGFcbiAgICAgICAgXG4gICAgICAgIHNldFRpbWVvdXQgQHNsb3dUaWNrLCAxMDAwXG4gICAgICAgIFxuICAgIGRldGFjaDogLT5cbiAgICAgICAgXG4gICAgICAgIGtsb2cgJ0RhdGEuZGV0YWNoJyBAaG9vaz8sIEBob29rPy5raWxsKCdTSUdLSUxMJylcbiAgICAgICAgICAgIFxuICAgIG9uVURQOiAobXNnKSA9PiBsb2cgXCJ1ZHBcIiBtc2dcbiAgICAgICAgXG4gICAgb25SZXF1ZXN0RGF0YTogKHByb3ZpZGVyLCB3aWQpID0+XG4gICAgICAgIFxuICAgICAgICAjIGtsb2cgXCJEYXRhLm9uUmVxdWVzdERhdGEgcHJvdmlkZXI6I3trc3RyIHByb3ZpZGVyfSB3aWQ6I3trc3RyIHdpZH1cIlxuICAgICAgICAgICAgXG4gICAgICAgIGlmIG5vdCBAcHJvdmlkZXJzW3Byb3ZpZGVyXVxuICAgICAgICAgICAgQHByb3ZpZGVyc1twcm92aWRlcl0gPSBuZXcge2Nsb2NrOkNsb2NrLCBzeXNpbmZvOlN5c2luZm99W3Byb3ZpZGVyXVxuICAgICAgICAgICAgQHByb3ZpZGVyc1twcm92aWRlcl0ucmVjZWl2ZXJzID0gW11cbiAgICAgICAgICAgIFxuICAgICAgICBpZiB3aWQgbm90IGluIEBwcm92aWRlcnNbcHJvdmlkZXJdLnJlY2VpdmVyc1xuICAgICAgICAgICAgQHByb3ZpZGVyc1twcm92aWRlcl0ucmVjZWl2ZXJzLnB1c2ggd2lkIFxuXG4gICAgc2xvd1RpY2s6ID0+XG4gICAgICAgIFxuICAgICAgICBmb3IgbmFtZSxwcm92aWRlciBvZiBAcHJvdmlkZXJzXG4gICAgICAgICAgICBpZiBwcm92aWRlci50aWNrID09ICdzbG93J1xuICAgICAgICAgICAgICAgIHByb3ZpZGVyLm9uVGljayBAXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHNldFRpbWVvdXQgQHNsb3dUaWNrLCAxMDAwIC0gKG5ldyBEYXRlKS5nZXRNaWxsaXNlY29uZHMoKVxuICAgICAgICBcbiAgICBzZW5kOiAocHJvdmlkZXIsIGRhdGEpID0+XG4gICAgICAgIFxuICAgICAgICBmb3IgcmVjZWl2ZXIgaW4gcHJvdmlkZXIucmVjZWl2ZXJzXG4gICAgICAgICAgICBwb3N0LnRvV2luIHJlY2VpdmVyLCAnZGF0YScgZGF0YVxuICAgICAgICAgICAgXG4jICAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4jIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuIyAgMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcblxuY2xhc3MgQ2xvY2tcbiAgICAgICAgXG4gICAgQDogKEBuYW1lPSdjbG9jaycgQHRpY2s9J3Nsb3cnKSAtPlxuICAgICAgICBcbiAgICBvblRpY2s6IChkYXRhKSA9PlxuICAgICAgICBcbiAgICAgICAgdGltZSA9IG5ldyBEYXRlKClcbiAgICAgICAgXG4gICAgICAgIGhvdXJzICAgPSB0aW1lLmdldEhvdXJzKClcbiAgICAgICAgbWludXRlcyA9IHRpbWUuZ2V0TWludXRlcygpXG4gICAgICAgIHNlY29uZHMgPSB0aW1lLmdldFNlY29uZHMoKVxuICAgICAgICBcbiAgICAgICAgaG91clN0ciAgID0ga3N0ci5scGFkIGhvdXJzLCAgIDIgJzAnXG4gICAgICAgIG1pbnV0ZVN0ciA9IGtzdHIubHBhZCBtaW51dGVzLCAyICcwJ1xuICAgICAgICBzZWNvbmRTdHIgPSBrc3RyLmxwYWQgc2Vjb25kcywgMiAnMCdcbiAgICAgICAgXG4gICAgICAgIGRhdGEuc2VuZCBALFxuICAgICAgICAgICAgaG91cjogICBob3Vyc1xuICAgICAgICAgICAgbWludXRlOiBtaW51dGVzXG4gICAgICAgICAgICBzZWNvbmQ6IHNlY29uZHNcbiAgICAgICAgICAgIHN0cjpcbiAgICAgICAgICAgICAgICAgICAgaG91cjogICBob3VyU3RyXG4gICAgICAgICAgICAgICAgICAgIG1pbnV0ZTogbWludXRlU3RyXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZDogc2Vjb25kU3RyXG4gICAgICAgICAgICAgICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMCAgICAwMDAgICAwMDAgIFxuIyAgICAgIDAwMCAgICAgMDAwICAgICAgICAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwMDAwMCAgIFxuXG5jbGFzcyBTeXNpbmZvXG4gICAgICAgIFxuICAgIEA6IChAbmFtZT0nc3lzaW5mbycgQHRpY2s9J3Nsb3cnKSAtPlxuICAgICAgICBcbiAgICAgICAgQHJfbWF4ID0gMTAwXG4gICAgICAgIEB3X21heCA9IDEwMFxuXG4gICAgICAgIEByeF9tYXggPSAxMDBcbiAgICAgICAgQHR4X21heCA9IDEwMFxuICAgICAgICBcbiAgICBvblRpY2s6IChkYXRhKSA9PlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIGdsb2JhbC5kcmFnZ2luZ1xuICAgICAgICBcbiAgICAgICAgc3lzaW5mby5nZXREeW5hbWljRGF0YSAoZCkgPT4gXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJ4X3NlYyA9IHBhcnNlSW50IGQubmV0d29ya1N0YXRzWzBdLnJ4X3NlY1xuICAgICAgICAgICAgdHhfc2VjID0gcGFyc2VJbnQgZC5uZXR3b3JrU3RhdHNbMF0udHhfc2VjXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEByeF9tYXggPSBNYXRoLm1heCBAcnhfbWF4LCByeF9zZWNcbiAgICAgICAgICAgIEB0eF9tYXggPSBNYXRoLm1heCBAdHhfbWF4LCB0eF9zZWNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbmQgPVxuICAgICAgICAgICAgICAgIG1lbTogZC5tZW1cbiAgICAgICAgICAgICAgICBuZXQ6XG4gICAgICAgICAgICAgICAgICAgIHJ4X3NlYzogcnhfc2VjXG4gICAgICAgICAgICAgICAgICAgIHR4X3NlYzogdHhfc2VjXG4gICAgICAgICAgICAgICAgICAgIHJ4X21heDogQHJ4X21heFxuICAgICAgICAgICAgICAgICAgICB0eF9tYXg6IEB0eF9tYXhcbiAgICAgICAgICAgICAgICBjcHU6XG4gICAgICAgICAgICAgICAgICAgIHN5czogZC5jdXJyZW50TG9hZC5jdXJyZW50bG9hZC8xMDAgXG4gICAgICAgICAgICAgICAgICAgIHVzcjogZC5jdXJyZW50TG9hZC5jdXJyZW50bG9hZF91c2VyLzEwMFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGRhdGEuZGlza3NJTz9cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByX3NlYyA9IGQuZGlza3NJTy5ySU9fc2VjXG4gICAgICAgICAgICAgICAgd19zZWMgPSBkLmRpc2tzSU8ud0lPX3NlY1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEByX21heCA9IE1hdGgubWF4IEByX21heCwgcl9zZWNcbiAgICAgICAgICAgICAgICBAd19tYXggPSBNYXRoLm1heCBAd19tYXgsIHdfc2VjXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbmQuZHNrID0gXG4gICAgICAgICAgICAgICAgICAgIHJfc2VjOiByX3NlY1xuICAgICAgICAgICAgICAgICAgICB3X3NlYzogd19zZWNcbiAgICAgICAgICAgICAgICAgICAgcl9tYXg6IEByX21heFxuICAgICAgICAgICAgICAgICAgICB3X21heDogQHdfbWF4XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGRhdGEuc2VuZCBALCBuZFxuXG4jIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG5cbmNsYXNzIE1vdXNlXG4gICAgXG4gICAgQDogKEBuYW1lPSdtb3VzZScgQHJlY2VpdmVycz1bXSkgLT5cbiAgICAgICAgXG4gICAgICAgICMgaW9Ib29rLm9uICdtb3VzZXdoZWVsJyBAb25FdmVudFxuICAgICAgICAjIGlvSG9vay5vbiAnbW91c2Vtb3ZlJyAgQG9uRXZlbnRcbiAgICAgICAgIyBpb0hvb2sub24gJ21vdXNlZG93bicgIEBvbkV2ZW50XG4gICAgICAgICMgaW9Ib29rLm9uICdtb3VzZXVwJyAgICBAb25FdmVudFxuICAgICAgICBcbiAgICAgICAgQGxhc3QgPSBEYXRlLm5vdygpXG4gICAgICAgIEBpbnRlcnZhbCA9IHBhcnNlSW50IDEwMDAvNjBcbiAgICAgICAgQGxhc3RFdmVudCA9IG51bGxcbiAgICAgICAgQHNlbmRUaW1lciA9IG51bGxcbiAgICAgICAgXG4gICAgb25FdmVudDogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgQGxhc3RFdmVudCA9IGV2ZW50XG4gICAgICAgIG5vdyA9IERhdGUubm93KClcbiAgICAgICAgY2xlYXJUaW1lb3V0IEBzZW5kVGltZXJcbiAgICAgICAgQHNlbmRUaW1lciA9IG51bGxcbiAgICAgICAgaWYgbm93IC0gQGxhc3QgPiBAaW50ZXJ2YWxcbiAgICAgICAgICAgIEBsYXN0ID0gbm93XG4gICAgICAgICAgICBwb3N0LnRvTWFpbiBAbmFtZSwgZXZlbnRcbiAgICAgICAgICAgIGZvciByZWNlaXZlciBpbiBAcmVjZWl2ZXJzXG4gICAgICAgICAgICAgICAgbG9nIFwicmVjZWl2ZXI6I3trc3RyIHJlY2VpdmVyfSBuYW1lOiN7QG5hbWV9IGV2ZW50OiN7a3N0ciBldmVudH1cIlxuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gcmVjZWl2ZXIsICdkYXRhJywgZXZlbnRcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNlbmRUaW1lciA9IHNldFRpbWVvdXQgKD0+IEBvbkV2ZW50IEBsYXN0RXZlbnQpLCBAaW50ZXJ2YWxcbiAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcblxuY2xhc3MgS2V5Ym9hcmRcbiAgICBcbiAgICBAOiAoQG5hbWU9J2tleWJvYXJkJyBAcmVjZWl2ZXJzPVtdKSAtPlxuICAgICAgICBcbiAgICAgICAgIyBpb0hvb2sub24gJ2tleWRvd24nIEBvbkV2ZW50XG4gICAgICAgICMgaW9Ib29rLm9uICdrZXl1cCcgICBAb25FdmVudFxuXG4gICAgb25FdmVudDogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgcG9zdC50b01haW4gQG5hbWUsIGV2ZW50XG4gICAgICAgIGZvciByZWNlaXZlciBpbiBAcmVjZWl2ZXJzXG4gICAgICAgICAgICBwb3N0LnRvV2luIHJlY2VpdmVyLCBAbmFtZSwgZXZlbnRcbiAgICAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4jIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG5cbmNsYXNzIEJvdW5kc1xuICAgIFxuICAgIEA6IChAbmFtZT0nYm91bmRzJyBAcmVjZWl2ZXJzPVtdKSAtPlxuICAgICAgICBcbiAgICAgICAgcG9zdC5vbiAnYm91bmRzJyBAb25Cb3VuZHNcbiAgICAgICAgXG4gICAgICAgIEBsYXN0SW5mb3MgPSBudWxsXG4gICAgICAgIEBvbkJvdW5kcygpXG4gICAgICAgXG4gICAgb25Cb3VuZHM6IChtc2csIGFyZykgPT5cbiAgICAgICAgXG4gICAgICAgIGJvdW5kcyA9IHJlcXVpcmUgJy4vYm91bmRzJ1xuICAgICAgICBpbmZvcyA9IGJvdW5kcy5pbmZvc1xuICAgICAgICBpZiBub3QgXy5pc0VxdWFsIGluZm9zLCBAbGFzdEluZm9zXG4gICAgICAgICAgICBAbGFzdEluZm9zID0gaW5mb3NcbiAgICAgICAgICAgIGZvciByZWNlaXZlciBpbiBAcmVjZWl2ZXJzXG4gICAgICAgICAgICAgICAgbG9nIFwicmVjZWl2ZXI6I3trc3RyIHJlY2VpdmVyfSBuYW1lOiN7QG5hbWV9IGV2ZW50OiN7a3N0ciBldmVudH1cIlxuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gcmVjZWl2ZXIsICdkYXRhJywgaW5mb3NcbiAgICAgICAgICAgIFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAgICAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMDAwMDAgICBcblxuY2xhc3MgQXBwc1xuICAgIFxuICAgIEA6IChAbmFtZT0nYXBwcycgQHJlY2VpdmVycz1bXSkgLT5cbiAgICAgICAgXG4gICAgICAgIEBsYXN0ICAgICA9IERhdGUubm93KClcbiAgICAgICAgQGludGVydmFsID0gcGFyc2VJbnQgMTAwMFxuICAgICAgICBAbGFzdEFwcHMgPSBudWxsXG4gICAgICAgIEB0aW1lciAgICA9IG51bGxcbiAgICAgICAgXG4gICAgc3RhcnQ6ID0+IEB1cGRhdGUgZm9yY2U6dHJ1ZVxuICAgICAgICBcbiAgICB1cGRhdGU6IChmb3JjZT1mYWxzZSkgPT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBvcy5wbGF0Zm9ybSgpICE9ICd3aW4zMidcblxuICAgICAgICBjbGVhclRpbWVvdXQgQHRpbWVyXG4gICAgICAgIFxuICAgICAgICBpZiBub3QgZ2xvYmFsLmRyYWdnaW5nXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHByb2NsaXN0ID0gd3h3ICdwcm9jJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgYXBwcyA9IEFycmF5LmZyb20gbmV3IFNldCBwcm9jbGlzdC5tYXAgKHApIC0+IHAucGF0aFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBhcHBzID0gYXBwcy5maWx0ZXIgKHApIC0+IFxuICAgICAgICAgICAgICAgIHMgPSBzbGFzaC5wYXRoIHNsYXNoLnJlbW92ZURyaXZlIHAgXG4gICAgICAgICAgICAgICAgaWYgcy5zdGFydHNXaXRoICcvV2luZG93cy9TeXN0ZW0zMidcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNsYXNoLmJhc2UocykgaW4gWydjbWQnICdwb3dlcnNoZWxsJ11cbiAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgYXBwcy5zb3J0KClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgZm9yY2Ugb3Igbm90IF8uaXNFcXVhbCBhcHBzLCBAbGFzdEFwcHNcbiAgICAgICAgICAgICAgICBwb3N0LnRvTWFpbiAnYXBwcycsIGFwcHNcbiAgICAgICAgICAgICAgICBmb3IgcmVjZWl2ZXIgaW4gQHJlY2VpdmVyc1xuICAgICAgICAgICAgICAgICAgICBsb2cgXCJyZWNlaXZlcjoje2tzdHIgcmVjZWl2ZXJ9IG5hbWU6I3tAbmFtZX0gYXBwczoje2FwcHMubGVuZ3RofVwiXG4gICAgICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gcmVjZWl2ZXIsICdkYXRhJywgYXBwc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEBsYXN0QXBwcyA9IGFwcHNcbiAgICAgICAgICAgIFxuICAgICAgICBAdGltZXIgPSBzZXRUaW1lb3V0IEB1cGRhdGUsIEBpbnRlcnZhbFxuICAgICAgICAgICAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgXG4jIDAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcblxuY2xhc3MgV2luc1xuICAgIFxuICAgIEA6IChAbmFtZT0nd2lucycgQHJlY2VpdmVycz1bXSkgLT5cbiAgICAgICAgXG4gICAgICAgIEBsYXN0ICAgICA9IERhdGUubm93KClcbiAgICAgICAgQGludGVydmFsID0gcGFyc2VJbnQgMTAwMFxuICAgICAgICBAbGFzdFdpbnMgPSBudWxsXG4gICAgICAgIEB0aW1lciAgICA9IG51bGxcbiAgICAgICAgXG4gICAgc3RhcnQ6ID0+IEB1cGRhdGUgZm9yY2U6dHJ1ZVxuICAgICAgICBcbiAgICB1cGRhdGU6IChmb3JjZT1mYWxzZSkgPT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBvcy5wbGF0Zm9ybSgpICE9ICd3aW4zMidcbiAgICAgICAgXG4gICAgICAgIGNsZWFyVGltZW91dCBAdGltZXJcbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBnbG9iYWwuZHJhZ2dpbmdcbiAgICAgICAgXG4gICAgICAgICAgICB3aW5zID0gd3h3ICdpbmZvJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBmb3JjZSBvciBub3QgXy5pc0VxdWFsIHdpbnMsIEBsYXN0V2luc1xuICAgICAgICAgICAgICAgIHBvc3QudG9NYWluICd3aW5zJywgd2luc1xuICAgICAgICAgICAgICAgIGZvciByZWNlaXZlciBpbiBAcmVjZWl2ZXJzXG4gICAgICAgICAgICAgICAgICAgIGxvZyBcInJlY2VpdmVyOiN7a3N0ciByZWNlaXZlcn0gbmFtZToje0BuYW1lfSBhcHBzOiN7YXBwcy5sZW5ndGh9XCJcbiAgICAgICAgICAgICAgICAgICAgcG9zdC50b1dpbiByZWNlaXZlciwgJ2RhdGEnLCBhcHBzXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQGxhc3RXaW5zID0gd2luc1xuICAgICAgICAgICAgXG4gICAgICAgIEB0aW1lciA9IHNldFRpbWVvdXQgQHVwZGF0ZSwgQGludGVydmFsXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBEYXRhXG5cbiJdfQ==
//# sourceURL=../coffee/data.coffee
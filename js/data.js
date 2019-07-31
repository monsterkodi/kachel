// koffee 1.3.0

/*
0000000     0000000   000000000   0000000 
000   000  000   000     000     000   000
000   000  000000000     000     000000000
000   000  000   000     000     000   000
0000000    000   000     000     000   000
 */
var Apps, Bounds, Clock, Data, Keyboard, Mouse, Sysinfo, Wins, _, electron, klog, kpos, kstr, os, post, ref, slash, sysinfo, udp, wxw,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf;

ref = require('kxk'), post = ref.post, klog = ref.klog, slash = ref.slash, kstr = ref.kstr, kpos = ref.kpos, udp = ref.udp, os = ref.os, _ = ref._;

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
        var ref1, ref2;
        klog('Data.detach', this.hook != null, (ref1 = this.hook) != null ? ref1.kill('SIGKILL') : void 0);
        klog('Data.detach', this.hook != null, (ref2 = this.hook) != null ? ref2.pid : void 0);
        return klog(wxw('terminate', this.hook.pid));
    };

    Data.prototype.onUDP = function(msg) {
        switch (msg.event) {
            case 'mousedown':
            case 'mousemove':
            case 'mouseup':
            case 'mousewheel':
                return this.providers.mouse.onEvent(msg);
            case 'keydown':
            case 'keyup':
                return this.providers.keyboard.onEvent(msg);
            default:
                return console.log(msg);
        }
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
        var bounds, i, len, now, pos, receiver, ref1, results;
        this.lastEvent = event;
        now = Date.now();
        clearTimeout(this.sendTimer);
        this.sendTimer = null;
        if (now - this.last > this.interval) {
            this.last = now;
            pos = kpos(event);
            if (os.platform() === 'win32') {
                pos = kpos(electron.screen.screenToDipPoint(pos)).rounded();
            }
            bounds = require('./bounds');
            pos = pos.clamp(kpos(0, 0), kpos(bounds.screenWidth, bounds.screenHeight));
            event.x = pos.x;
            event.y = pos.y;
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
    }

    Keyboard.prototype.onEvent = function(event) {
        var i, len, receiver, ref1, results;
        post.toMain(this.name, event);
        ref1 = this.receivers;
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
            receiver = ref1[i];
            console.log("receiver:" + (kstr(receiver)) + " name:" + this.name + " event:" + (kstr(event)));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsaUlBQUE7SUFBQTs7O0FBUUEsTUFBZ0QsT0FBQSxDQUFRLEtBQVIsQ0FBaEQsRUFBRSxlQUFGLEVBQVEsZUFBUixFQUFjLGlCQUFkLEVBQXFCLGVBQXJCLEVBQTJCLGVBQTNCLEVBQWlDLGFBQWpDLEVBQXNDLFdBQXRDLEVBQTBDOztBQUUxQyxPQUFBLEdBQVcsT0FBQSxDQUFRLG1CQUFSOztBQUNYLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFFWCxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixPQUFwQjtJQUFpQyxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVIsRUFBdkM7OztBQUVNO0lBRUMsY0FBQTs7Ozs7UUFFQyxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixPQUFwQjtZQUVJLElBQUMsQ0FBQSxHQUFELEdBQVEsR0FBQSxDQUFJO2dCQUFBLElBQUEsRUFBSyxLQUFMO2dCQUFXLEtBQUEsRUFBTSxJQUFDLENBQUEsS0FBbEI7YUFBSjtZQUNSLElBQUMsQ0FBQSxJQUFELEdBQVEsR0FBQSxDQUFJLE1BQUosRUFIWjs7UUFLQSxJQUFDLENBQUEsU0FBRCxHQUNJO1lBQUEsS0FBQSxFQUFVLElBQUksS0FBZDtZQUNBLFFBQUEsRUFBVSxJQUFJLFFBRGQ7WUFFQSxJQUFBLEVBQVUsSUFBSSxJQUZkO1lBR0EsSUFBQSxFQUFVLElBQUksSUFIZDs7UUFLSixJQUFJLENBQUMsRUFBTCxDQUFRLGFBQVIsRUFBc0IsSUFBQyxDQUFBLGFBQXZCO1FBRUEsVUFBQSxDQUFXLElBQUMsQ0FBQSxRQUFaLEVBQXNCLElBQXRCO0lBZkQ7O21CQWlCSCxNQUFBLEdBQVEsU0FBQTtBQUVKLFlBQUE7UUFBQSxJQUFBLENBQUssYUFBTCxFQUFtQixpQkFBbkIsbUNBQWdDLENBQUUsSUFB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QUMsS0FBRDtBQUVKLFlBQUE7O1lBRkssUUFBTTs7UUFFWCxJQUFVLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixPQUEzQjtBQUFBLG1CQUFBOztRQUVBLFlBQUEsQ0FBYSxJQUFDLENBQUEsS0FBZDtRQUVBLElBQUcsQ0FBSSxNQUFNLENBQUMsUUFBZDtZQUVJLElBQUEsR0FBTyxHQUFBLENBQUksTUFBSjtZQUVQLElBQUcsS0FBQSxJQUFTLENBQUksQ0FBQyxDQUFDLE9BQUYsQ0FBVSxJQUFWLEVBQWdCLElBQUMsQ0FBQSxRQUFqQixDQUFoQjtnQkFDSSxJQUFJLENBQUMsTUFBTCxDQUFZLE1BQVosRUFBb0IsSUFBcEI7QUFDQTtBQUFBLHFCQUFBLHNDQUFBOztvQkFDRyxPQUFBLENBQUMsR0FBRCxDQUFLLFdBQUEsR0FBVyxDQUFDLElBQUEsQ0FBSyxRQUFMLENBQUQsQ0FBWCxHQUEwQixRQUExQixHQUFrQyxJQUFDLENBQUEsSUFBbkMsR0FBd0MsUUFBeEMsR0FBZ0QsSUFBSSxDQUFDLE1BQTFEO29CQUNDLElBQUksQ0FBQyxLQUFMLENBQVcsUUFBWCxFQUFxQixNQUFyQixFQUE2QixJQUE3QjtBQUZKO2dCQUlBLElBQUMsQ0FBQSxRQUFELEdBQVksS0FOaEI7YUFKSjs7ZUFZQSxJQUFDLENBQUEsS0FBRCxHQUFTLFVBQUEsQ0FBVyxJQUFDLENBQUEsTUFBWixFQUFvQixJQUFDLENBQUEsUUFBckI7SUFsQkw7Ozs7OztBQW9CWixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDBcbjAwMCAgIDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4wMDAwMDAwICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDBcbiMjI1xuXG57IHBvc3QsIGtsb2csIHNsYXNoLCBrc3RyLCBrcG9zLCB1ZHAsIG9zLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbnN5c2luZm8gID0gcmVxdWlyZSAnc3lzdGVtaW5mb3JtYXRpb24nXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuXG5pZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMicgdGhlbiB3eHcgPSByZXF1aXJlICd3eHcnXG5cbmNsYXNzIERhdGFcblxuICAgIEA6IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQHVkcCAgPSB1ZHAgcG9ydDo2NjY2NiBvbk1zZzpAb25VRFBcbiAgICAgICAgICAgIEBob29rID0gd3h3ICdob29rJ1xuICAgICAgICBcbiAgICAgICAgQHByb3ZpZGVycyA9IFxuICAgICAgICAgICAgbW91c2U6ICAgIG5ldyBNb3VzZVxuICAgICAgICAgICAga2V5Ym9hcmQ6IG5ldyBLZXlib2FyZFxuICAgICAgICAgICAgYXBwczogICAgIG5ldyBBcHBzXG4gICAgICAgICAgICB3aW5zOiAgICAgbmV3IFdpbnNcbiAgICAgICAgXG4gICAgICAgIHBvc3Qub24gJ3JlcXVlc3REYXRhJyBAb25SZXF1ZXN0RGF0YVxuICAgICAgICBcbiAgICAgICAgc2V0VGltZW91dCBAc2xvd1RpY2ssIDEwMDBcbiAgICAgICAgXG4gICAgZGV0YWNoOiAtPlxuICAgICAgICBcbiAgICAgICAga2xvZyAnRGF0YS5kZXRhY2gnIEBob29rPywgQGhvb2s/LmtpbGwoJ1NJR0tJTEwnKVxuICAgICAgICBrbG9nICdEYXRhLmRldGFjaCcgQGhvb2s/LCBAaG9vaz8ucGlkXG4gICAgICAgIGtsb2cgd3h3ICd0ZXJtaW5hdGUnIEBob29rLnBpZFxuICAgICAgICAgICAgXG4gICAgb25VRFA6IChtc2cpID0+IFxuXG4gICAgICAgIHN3aXRjaCBtc2cuZXZlbnQgXG4gICAgICAgICAgICB3aGVuICdtb3VzZWRvd24nICdtb3VzZW1vdmUnICdtb3VzZXVwJyAnbW91c2V3aGVlbCcgdGhlbiBAcHJvdmlkZXJzLm1vdXNlLm9uRXZlbnQgbXNnXG4gICAgICAgICAgICB3aGVuICdrZXlkb3duJyAna2V5dXAnIHRoZW4gQHByb3ZpZGVycy5rZXlib2FyZC5vbkV2ZW50IG1zZ1xuICAgICAgICAgICAgZWxzZSBsb2cgbXNnXG4gICAgICAgIFxuICAgIG9uUmVxdWVzdERhdGE6IChwcm92aWRlciwgd2lkKSA9PlxuICAgICAgICBcbiAgICAgICAgIyBrbG9nIFwiRGF0YS5vblJlcXVlc3REYXRhIHByb3ZpZGVyOiN7a3N0ciBwcm92aWRlcn0gd2lkOiN7a3N0ciB3aWR9XCJcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBub3QgQHByb3ZpZGVyc1twcm92aWRlcl1cbiAgICAgICAgICAgIEBwcm92aWRlcnNbcHJvdmlkZXJdID0gbmV3IHtjbG9jazpDbG9jaywgc3lzaW5mbzpTeXNpbmZvfVtwcm92aWRlcl1cbiAgICAgICAgICAgIEBwcm92aWRlcnNbcHJvdmlkZXJdLnJlY2VpdmVycyA9IFtdXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgd2lkIG5vdCBpbiBAcHJvdmlkZXJzW3Byb3ZpZGVyXS5yZWNlaXZlcnNcbiAgICAgICAgICAgIEBwcm92aWRlcnNbcHJvdmlkZXJdLnJlY2VpdmVycy5wdXNoIHdpZCBcblxuICAgIHNsb3dUaWNrOiA9PlxuICAgICAgICBcbiAgICAgICAgZm9yIG5hbWUscHJvdmlkZXIgb2YgQHByb3ZpZGVyc1xuICAgICAgICAgICAgaWYgcHJvdmlkZXIudGljayA9PSAnc2xvdydcbiAgICAgICAgICAgICAgICBwcm92aWRlci5vblRpY2sgQFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBzZXRUaW1lb3V0IEBzbG93VGljaywgMTAwMCAtIChuZXcgRGF0ZSkuZ2V0TWlsbGlzZWNvbmRzKClcbiAgICAgICAgXG4gICAgc2VuZDogKHByb3ZpZGVyLCBkYXRhKSA9PlxuICAgICAgICBcbiAgICAgICAgZm9yIHJlY2VpdmVyIGluIHByb3ZpZGVyLnJlY2VpdmVyc1xuICAgICAgICAgICAgcG9zdC50b1dpbiByZWNlaXZlciwgJ2RhdGEnIGRhdGFcbiAgICAgICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4jIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiMgIDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG5cbmNsYXNzIENsb2NrXG4gICAgICAgIFxuICAgIEA6IChAbmFtZT0nY2xvY2snIEB0aWNrPSdzbG93JykgLT5cbiAgICAgICAgXG4gICAgb25UaWNrOiAoZGF0YSkgPT5cbiAgICAgICAgXG4gICAgICAgIHRpbWUgPSBuZXcgRGF0ZSgpXG4gICAgICAgIFxuICAgICAgICBob3VycyAgID0gdGltZS5nZXRIb3VycygpXG4gICAgICAgIG1pbnV0ZXMgPSB0aW1lLmdldE1pbnV0ZXMoKVxuICAgICAgICBzZWNvbmRzID0gdGltZS5nZXRTZWNvbmRzKClcbiAgICAgICAgXG4gICAgICAgIGhvdXJTdHIgICA9IGtzdHIubHBhZCBob3VycywgICAyICcwJ1xuICAgICAgICBtaW51dGVTdHIgPSBrc3RyLmxwYWQgbWludXRlcywgMiAnMCdcbiAgICAgICAgc2Vjb25kU3RyID0ga3N0ci5scGFkIHNlY29uZHMsIDIgJzAnXG4gICAgICAgIFxuICAgICAgICBkYXRhLnNlbmQgQCxcbiAgICAgICAgICAgIGhvdXI6ICAgaG91cnNcbiAgICAgICAgICAgIG1pbnV0ZTogbWludXRlc1xuICAgICAgICAgICAgc2Vjb25kOiBzZWNvbmRzXG4gICAgICAgICAgICBzdHI6XG4gICAgICAgICAgICAgICAgICAgIGhvdXI6ICAgaG91clN0clxuICAgICAgICAgICAgICAgICAgICBtaW51dGU6IG1pbnV0ZVN0clxuICAgICAgICAgICAgICAgICAgICBzZWNvbmQ6IHNlY29uZFN0clxuICAgICAgICAgICAgICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAgICAgMDAwICAgMDAwICBcbiMgICAgICAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMDAwMDAgICBcblxuY2xhc3MgU3lzaW5mb1xuICAgICAgICBcbiAgICBAOiAoQG5hbWU9J3N5c2luZm8nIEB0aWNrPSdzbG93JykgLT5cbiAgICAgICAgXG4gICAgICAgIEByX21heCA9IDEwMFxuICAgICAgICBAd19tYXggPSAxMDBcblxuICAgICAgICBAcnhfbWF4ID0gMTAwXG4gICAgICAgIEB0eF9tYXggPSAxMDBcbiAgICAgICAgXG4gICAgb25UaWNrOiAoZGF0YSkgPT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBnbG9iYWwuZHJhZ2dpbmdcbiAgICAgICAgXG4gICAgICAgIHN5c2luZm8uZ2V0RHluYW1pY0RhdGEgKGQpID0+IFxuICAgICAgICAgICAgXG4gICAgICAgICAgICByeF9zZWMgPSBwYXJzZUludCBkLm5ldHdvcmtTdGF0c1swXS5yeF9zZWNcbiAgICAgICAgICAgIHR4X3NlYyA9IHBhcnNlSW50IGQubmV0d29ya1N0YXRzWzBdLnR4X3NlY1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBAcnhfbWF4ID0gTWF0aC5tYXggQHJ4X21heCwgcnhfc2VjXG4gICAgICAgICAgICBAdHhfbWF4ID0gTWF0aC5tYXggQHR4X21heCwgdHhfc2VjXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG5kID1cbiAgICAgICAgICAgICAgICBtZW06IGQubWVtXG4gICAgICAgICAgICAgICAgbmV0OlxuICAgICAgICAgICAgICAgICAgICByeF9zZWM6IHJ4X3NlY1xuICAgICAgICAgICAgICAgICAgICB0eF9zZWM6IHR4X3NlY1xuICAgICAgICAgICAgICAgICAgICByeF9tYXg6IEByeF9tYXhcbiAgICAgICAgICAgICAgICAgICAgdHhfbWF4OiBAdHhfbWF4XG4gICAgICAgICAgICAgICAgY3B1OlxuICAgICAgICAgICAgICAgICAgICBzeXM6IGQuY3VycmVudExvYWQuY3VycmVudGxvYWQvMTAwIFxuICAgICAgICAgICAgICAgICAgICB1c3I6IGQuY3VycmVudExvYWQuY3VycmVudGxvYWRfdXNlci8xMDBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBkYXRhLmRpc2tzSU8/XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcl9zZWMgPSBkLmRpc2tzSU8ucklPX3NlY1xuICAgICAgICAgICAgICAgIHdfc2VjID0gZC5kaXNrc0lPLndJT19zZWNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAcl9tYXggPSBNYXRoLm1heCBAcl9tYXgsIHJfc2VjXG4gICAgICAgICAgICAgICAgQHdfbWF4ID0gTWF0aC5tYXggQHdfbWF4LCB3X3NlY1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG5kLmRzayA9IFxuICAgICAgICAgICAgICAgICAgICByX3NlYzogcl9zZWNcbiAgICAgICAgICAgICAgICAgICAgd19zZWM6IHdfc2VjXG4gICAgICAgICAgICAgICAgICAgIHJfbWF4OiBAcl9tYXhcbiAgICAgICAgICAgICAgICAgICAgd19tYXg6IEB3X21heFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBkYXRhLnNlbmQgQCwgbmRcblxuIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIFxuXG5jbGFzcyBNb3VzZVxuICAgIFxuICAgIEA6IChAbmFtZT0nbW91c2UnIEByZWNlaXZlcnM9W10pIC0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBsYXN0ID0gRGF0ZS5ub3coKVxuICAgICAgICBAaW50ZXJ2YWwgPSBwYXJzZUludCAxMDAwLzYwXG4gICAgICAgIEBsYXN0RXZlbnQgPSBudWxsXG4gICAgICAgIEBzZW5kVGltZXIgPSBudWxsXG4gICAgICAgIFxuICAgIG9uRXZlbnQ6IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIEBsYXN0RXZlbnQgPSBldmVudFxuICAgICAgICBub3cgPSBEYXRlLm5vdygpXG4gICAgICAgIGNsZWFyVGltZW91dCBAc2VuZFRpbWVyXG4gICAgICAgIEBzZW5kVGltZXIgPSBudWxsXG4gICAgICAgIGlmIG5vdyAtIEBsYXN0ID4gQGludGVydmFsXG4gICAgICAgICAgICBAbGFzdCA9IG5vd1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBwb3MgPSBrcG9zIGV2ZW50XG4gICAgICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgICAgICBwb3MgPSBrcG9zKGVsZWN0cm9uLnNjcmVlbi5zY3JlZW5Ub0RpcFBvaW50IHBvcykucm91bmRlZCgpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGJvdW5kcyA9IHJlcXVpcmUgJy4vYm91bmRzJ1xuICAgICAgICAgICAgcG9zID0gcG9zLmNsYW1wIGtwb3MoMCwwKSwga3BvcyBib3VuZHMuc2NyZWVuV2lkdGgsIGJvdW5kcy5zY3JlZW5IZWlnaHRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXZlbnQueCA9IHBvcy54XG4gICAgICAgICAgICBldmVudC55ID0gcG9zLnlcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcG9zdC50b01haW4gQG5hbWUsIGV2ZW50XG4gICAgICAgICAgICBmb3IgcmVjZWl2ZXIgaW4gQHJlY2VpdmVyc1xuICAgICAgICAgICAgICAgICMgbG9nIFwicmVjZWl2ZXI6I3trc3RyIHJlY2VpdmVyfSBuYW1lOiN7QG5hbWV9IGV2ZW50OiN7a3N0ciBldmVudH1cIlxuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gcmVjZWl2ZXIsICdkYXRhJywgZXZlbnRcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNlbmRUaW1lciA9IHNldFRpbWVvdXQgKD0+IEBvbkV2ZW50IEBsYXN0RXZlbnQpLCBAaW50ZXJ2YWxcbiAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcblxuY2xhc3MgS2V5Ym9hcmRcbiAgICBcbiAgICBAOiAoQG5hbWU9J2tleWJvYXJkJyBAcmVjZWl2ZXJzPVtdKSAtPlxuICAgICAgICBcbiAgICBvbkV2ZW50OiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICBwb3N0LnRvTWFpbiBAbmFtZSwgZXZlbnRcbiAgICAgICAgZm9yIHJlY2VpdmVyIGluIEByZWNlaXZlcnNcbiAgICAgICAgICAgIGxvZyBcInJlY2VpdmVyOiN7a3N0ciByZWNlaXZlcn0gbmFtZToje0BuYW1lfSBldmVudDoje2tzdHIgZXZlbnR9XCJcbiAgICAgICAgICAgIHBvc3QudG9XaW4gcmVjZWl2ZXIsIEBuYW1lLCBldmVudFxuICAgICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgICAgICAgMDAwICBcbiMgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICBcblxuY2xhc3MgQm91bmRzXG4gICAgXG4gICAgQDogKEBuYW1lPSdib3VuZHMnIEByZWNlaXZlcnM9W10pIC0+XG4gICAgICAgIFxuICAgICAgICBwb3N0Lm9uICdib3VuZHMnIEBvbkJvdW5kc1xuICAgICAgICBcbiAgICAgICAgQGxhc3RJbmZvcyA9IG51bGxcbiAgICAgICAgQG9uQm91bmRzKClcbiAgICAgICBcbiAgICBvbkJvdW5kczogKG1zZywgYXJnKSA9PlxuICAgICAgICBcbiAgICAgICAgYm91bmRzID0gcmVxdWlyZSAnLi9ib3VuZHMnXG4gICAgICAgIGluZm9zID0gYm91bmRzLmluZm9zXG4gICAgICAgIGlmIG5vdCBfLmlzRXF1YWwgaW5mb3MsIEBsYXN0SW5mb3NcbiAgICAgICAgICAgIEBsYXN0SW5mb3MgPSBpbmZvc1xuICAgICAgICAgICAgZm9yIHJlY2VpdmVyIGluIEByZWNlaXZlcnNcbiAgICAgICAgICAgICAgICBsb2cgXCJyZWNlaXZlcjoje2tzdHIgcmVjZWl2ZXJ9IG5hbWU6I3tAbmFtZX0gZXZlbnQ6I3trc3RyIGV2ZW50fVwiXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiByZWNlaXZlciwgJ2RhdGEnLCBpbmZvc1xuICAgICAgICAgICAgXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgICAgICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwMDAwMCAgIFxuXG5jbGFzcyBBcHBzXG4gICAgXG4gICAgQDogKEBuYW1lPSdhcHBzJyBAcmVjZWl2ZXJzPVtdKSAtPlxuICAgICAgICBcbiAgICAgICAgQGxhc3QgICAgID0gRGF0ZS5ub3coKVxuICAgICAgICBAaW50ZXJ2YWwgPSBwYXJzZUludCAxMDAwXG4gICAgICAgIEBsYXN0QXBwcyA9IG51bGxcbiAgICAgICAgQHRpbWVyICAgID0gbnVsbFxuICAgICAgICBcbiAgICBzdGFydDogPT4gQHVwZGF0ZSBmb3JjZTp0cnVlXG4gICAgICAgIFxuICAgIHVwZGF0ZTogKGZvcmNlPWZhbHNlKSA9PlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG9zLnBsYXRmb3JtKCkgIT0gJ3dpbjMyJ1xuXG4gICAgICAgIGNsZWFyVGltZW91dCBAdGltZXJcbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBnbG9iYWwuZHJhZ2dpbmdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcHJvY2xpc3QgPSB3eHcgJ3Byb2MnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBhcHBzID0gQXJyYXkuZnJvbSBuZXcgU2V0IHByb2NsaXN0Lm1hcCAocCkgLT4gcC5wYXRoXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGFwcHMgPSBhcHBzLmZpbHRlciAocCkgLT4gXG4gICAgICAgICAgICAgICAgcyA9IHNsYXNoLnBhdGggc2xhc2gucmVtb3ZlRHJpdmUgcCBcbiAgICAgICAgICAgICAgICBpZiBzLnN0YXJ0c1dpdGggJy9XaW5kb3dzL1N5c3RlbTMyJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2xhc2guYmFzZShzKSBpbiBbJ2NtZCcgJ3Bvd2Vyc2hlbGwnXVxuICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBhcHBzLnNvcnQoKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBmb3JjZSBvciBub3QgXy5pc0VxdWFsIGFwcHMsIEBsYXN0QXBwc1xuICAgICAgICAgICAgICAgIHBvc3QudG9NYWluICdhcHBzJywgYXBwc1xuICAgICAgICAgICAgICAgIGZvciByZWNlaXZlciBpbiBAcmVjZWl2ZXJzXG4gICAgICAgICAgICAgICAgICAgIGxvZyBcInJlY2VpdmVyOiN7a3N0ciByZWNlaXZlcn0gbmFtZToje0BuYW1lfSBhcHBzOiN7YXBwcy5sZW5ndGh9XCJcbiAgICAgICAgICAgICAgICAgICAgcG9zdC50b1dpbiByZWNlaXZlciwgJ2RhdGEnLCBhcHBzXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQGxhc3RBcHBzID0gYXBwc1xuICAgICAgICAgICAgXG4gICAgICAgIEB0aW1lciA9IHNldFRpbWVvdXQgQHVwZGF0ZSwgQGludGVydmFsXG4gICAgICAgICAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiMgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICBcbiMgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuXG5jbGFzcyBXaW5zXG4gICAgXG4gICAgQDogKEBuYW1lPSd3aW5zJyBAcmVjZWl2ZXJzPVtdKSAtPlxuICAgICAgICBcbiAgICAgICAgQGxhc3QgICAgID0gRGF0ZS5ub3coKVxuICAgICAgICBAaW50ZXJ2YWwgPSBwYXJzZUludCAxMDAwXG4gICAgICAgIEBsYXN0V2lucyA9IG51bGxcbiAgICAgICAgQHRpbWVyICAgID0gbnVsbFxuICAgICAgICBcbiAgICBzdGFydDogPT4gQHVwZGF0ZSBmb3JjZTp0cnVlXG4gICAgICAgIFxuICAgIHVwZGF0ZTogKGZvcmNlPWZhbHNlKSA9PlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG9zLnBsYXRmb3JtKCkgIT0gJ3dpbjMyJ1xuICAgICAgICBcbiAgICAgICAgY2xlYXJUaW1lb3V0IEB0aW1lclxuICAgICAgICBcbiAgICAgICAgaWYgbm90IGdsb2JhbC5kcmFnZ2luZ1xuICAgICAgICBcbiAgICAgICAgICAgIHdpbnMgPSB3eHcgJ2luZm8nXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGZvcmNlIG9yIG5vdCBfLmlzRXF1YWwgd2lucywgQGxhc3RXaW5zXG4gICAgICAgICAgICAgICAgcG9zdC50b01haW4gJ3dpbnMnLCB3aW5zXG4gICAgICAgICAgICAgICAgZm9yIHJlY2VpdmVyIGluIEByZWNlaXZlcnNcbiAgICAgICAgICAgICAgICAgICAgbG9nIFwicmVjZWl2ZXI6I3trc3RyIHJlY2VpdmVyfSBuYW1lOiN7QG5hbWV9IGFwcHM6I3thcHBzLmxlbmd0aH1cIlxuICAgICAgICAgICAgICAgICAgICBwb3N0LnRvV2luIHJlY2VpdmVyLCAnZGF0YScsIGFwcHNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAbGFzdFdpbnMgPSB3aW5zXG4gICAgICAgICAgICBcbiAgICAgICAgQHRpbWVyID0gc2V0VGltZW91dCBAdXBkYXRlLCBAaW50ZXJ2YWxcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IERhdGFcblxuIl19
//# sourceURL=../coffee/data.coffee
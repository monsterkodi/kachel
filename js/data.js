// koffee 1.3.0

/*
0000000     0000000   000000000   0000000 
000   000  000   000     000     000   000
000   000  000000000     000     000000000
000   000  000   000     000     000   000
0000000    000   000     000     000   000
 */
var Apps, Bounds, Clock, Data, Keyboard, Mouse, Sysinfo, Wins, _, electron, empty, klog, kpos, kstr, last, os, post, ref, slash, sysinfo, udp, wxw,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf;

ref = require('kxk'), post = ref.post, slash = ref.slash, empty = ref.empty, kstr = ref.kstr, kpos = ref.kpos, klog = ref.klog, last = ref.last, udp = ref.udp, os = ref.os, _ = ref._;

sysinfo = require('systeminformation');

electron = require('electron');

wxw = require('wxw');

Data = (function() {
    function Data() {
        this.send = bind(this.send, this);
        this.slowTick = bind(this.slowTick, this);
        this.onRequestData = bind(this.onRequestData, this);
        this.onUDP = bind(this.onUDP, this);
        this.udp = udp({
            port: 65432,
            onMsg: this.onUDP
        });
        this.hookProc = wxw('hook', 'proc');
        this.hookInfo = wxw('hook', 'info');
        this.hookInput = wxw('hook', 'input');
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
        if (os.platform() === 'win32') {
            return klog(wxw('kill', 'wc.exe'));
        } else {
            return klog(wxw('kill', 'mc'));
        }
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
            case 'proc':
                return this.providers.apps.onEvent(msg);
            case 'info':
                return this.providers.wins.onEvent(msg);
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
        this.onEvent = bind(this.onEvent, this);
        this.start = bind(this.start, this);
        this.lastApps = null;
    }

    Apps.prototype.start = function() {
        return this.force = true;
    };

    Apps.prototype.onEvent = function(event) {
        var apps, i, len, receiver, ref1;
        apps = Array.from(new Set(event.proc.map(function(p) {
            return p.path;
        })));
        if (os.platform() === 'win32') {
            apps = apps.filter(function(p) {
                var ref1, s;
                s = slash.path(slash.removeDrive(p));
                if (s.startsWith('/Windows/System32')) {
                    return (ref1 = slash.base(s)) === 'cmd' || ref1 === 'powershell';
                }
                return true;
            });
        }
        apps.sort();
        if (this.force || !_.isEqual(apps, this.lastApps)) {
            delete this.force;
            post.toMain('apps', apps);
            ref1 = this.receivers;
            for (i = 0, len = ref1.length; i < len; i++) {
                receiver = ref1[i];
                post.toWin(receiver, 'data', apps);
            }
            return this.lastApps = apps;
        }
    };

    return Apps;

})();

Wins = (function() {
    function Wins(name1, receivers) {
        this.name = name1 != null ? name1 : 'wins';
        this.receivers = receivers != null ? receivers : [];
        this.onEvent = bind(this.onEvent, this);
        this.start = bind(this.start, this);
        this.lastWins = null;
    }

    Wins.prototype.start = function() {
        return this.force = true;
    };

    Wins.prototype.onEvent = function(event) {
        var i, len, receiver, ref1, wins;
        wins = event.info;
        if (os.platform() === 'darwin') {
            wins[0].status += ' top';
        }
        if (empty(last(wins))) {
            wins.pop();
        }
        if (this.force || !_.isEqual(wins, this.lastWins)) {
            delete this.force;
            post.toMain('wins', wins);
            ref1 = this.receivers;
            for (i = 0, len = ref1.length; i < len; i++) {
                receiver = ref1[i];
                post.toWin(receiver, 'data', apps);
            }
            return this.lastWins = wins;
        }
    };

    return Wins;

})();

module.exports = Data;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsOElBQUE7SUFBQTs7O0FBUUEsTUFBNkQsT0FBQSxDQUFRLEtBQVIsQ0FBN0QsRUFBRSxlQUFGLEVBQVEsaUJBQVIsRUFBZSxpQkFBZixFQUFzQixlQUF0QixFQUE0QixlQUE1QixFQUFrQyxlQUFsQyxFQUF3QyxlQUF4QyxFQUE4QyxhQUE5QyxFQUFtRCxXQUFuRCxFQUF1RDs7QUFFdkQsT0FBQSxHQUFXLE9BQUEsQ0FBUSxtQkFBUjs7QUFDWCxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBQ1gsR0FBQSxHQUFXLE9BQUEsQ0FBUSxLQUFSOztBQUVMO0lBRUMsY0FBQTs7Ozs7UUFFQyxJQUFDLENBQUEsR0FBRCxHQUFPLEdBQUEsQ0FBSTtZQUFBLElBQUEsRUFBSyxLQUFMO1lBQVcsS0FBQSxFQUFNLElBQUMsQ0FBQSxLQUFsQjtTQUFKO1FBRVAsSUFBQyxDQUFBLFFBQUQsR0FBYSxHQUFBLENBQUksTUFBSixFQUFXLE1BQVg7UUFDYixJQUFDLENBQUEsUUFBRCxHQUFhLEdBQUEsQ0FBSSxNQUFKLEVBQVcsTUFBWDtRQUNiLElBQUMsQ0FBQSxTQUFELEdBQWEsR0FBQSxDQUFJLE1BQUosRUFBVyxPQUFYO1FBRWIsSUFBQyxDQUFBLFNBQUQsR0FDSTtZQUFBLEtBQUEsRUFBVSxJQUFJLEtBQWQ7WUFDQSxRQUFBLEVBQVUsSUFBSSxRQURkO1lBRUEsSUFBQSxFQUFVLElBQUksSUFGZDtZQUdBLElBQUEsRUFBVSxJQUFJLElBSGQ7O1FBS0osSUFBSSxDQUFDLEVBQUwsQ0FBUSxhQUFSLEVBQXNCLElBQUMsQ0FBQSxhQUF2QjtRQUVBLFVBQUEsQ0FBVyxJQUFDLENBQUEsUUFBWixFQUFzQixJQUF0QjtJQWhCRDs7bUJBa0JILE1BQUEsR0FBUSxTQUFBO1FBRUosSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENB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QUFDLENBQUEsdUJBQUQsUUFBTTtRQUFPLElBQUMsQ0FBQSxnQ0FBRCxZQUFXOzs7UUFFeEIsSUFBQyxDQUFBLFFBQUQsR0FBWTtJQUZiOzttQkFJSCxLQUFBLEdBQU8sU0FBQTtlQUFHLElBQUMsQ0FBQSxLQUFELEdBQVM7SUFBWjs7bUJBRVAsT0FBQSxHQUFTLFNBQUMsS0FBRDtBQUVMLFlBQUE7UUFBQSxJQUFBLEdBQU8sS0FBSyxDQUFDO1FBRWIsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsUUFBcEI7WUFDSSxJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBUixJQUFrQixPQUR0Qjs7UUFHQSxJQUFjLEtBQUEsQ0FBTSxJQUFBLENBQUssSUFBTCxDQUFOLENBQWQ7WUFBQSxJQUFJLENBQUMsR0FBTCxDQUFBLEVBQUE7O1FBQ0EsSUFBRyxJQUFDLENBQUEsS0FBRCxJQUFVLENBQUksQ0FBQyxDQUFDLE9BQUYsQ0FBVSxJQUFWLEVBQWdCLElBQUMsQ0FBQSxRQUFqQixDQUFqQjtZQUNJLE9BQU8sSUFBQyxDQUFBO1lBQ1IsSUFBSSxDQUFDLE1BQUwsQ0FBWSxNQUFaLEVBQW1CLElBQW5CO0FBQ0E7QUFBQSxpQkFBQSxzQ0FBQTs7Z0JBQ0ksSUFBSSxDQUFDLEtBQUwsQ0FBVyxRQUFYLEVBQXFCLE1BQXJCLEVBQTZCLElBQTdCO0FBREo7bUJBRUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxLQUxoQjs7SUFSSzs7Ozs7O0FBZWIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwIFxuMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4wMDAgICAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4jIyNcblxueyBwb3N0LCBzbGFzaCwgZW1wdHksIGtzdHIsIGtwb3MsIGtsb2csIGxhc3QsIHVkcCwgb3MsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuc3lzaW5mbyAgPSByZXF1aXJlICdzeXN0ZW1pbmZvcm1hdGlvbidcbmVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG53eHcgICAgICA9IHJlcXVpcmUgJ3d4dydcblxuY2xhc3MgRGF0YVxuXG4gICAgQDogLT5cbiAgICAgICAgXG4gICAgICAgIEB1ZHAgPSB1ZHAgcG9ydDo2NTQzMiBvbk1zZzpAb25VRFBcbiAgICAgICAgXG4gICAgICAgIEBob29rUHJvYyAgPSB3eHcgJ2hvb2snICdwcm9jJ1xuICAgICAgICBAaG9va0luZm8gID0gd3h3ICdob29rJyAnaW5mbydcbiAgICAgICAgQGhvb2tJbnB1dCA9IHd4dyAnaG9vaycgJ2lucHV0J1xuICAgICAgICAgICAgXG4gICAgICAgIEBwcm92aWRlcnMgPSBcbiAgICAgICAgICAgIG1vdXNlOiAgICBuZXcgTW91c2VcbiAgICAgICAgICAgIGtleWJvYXJkOiBuZXcgS2V5Ym9hcmRcbiAgICAgICAgICAgIGFwcHM6ICAgICBuZXcgQXBwc1xuICAgICAgICAgICAgd2luczogICAgIG5ldyBXaW5zXG4gICAgICAgIFxuICAgICAgICBwb3N0Lm9uICdyZXF1ZXN0RGF0YScgQG9uUmVxdWVzdERhdGFcbiAgICAgICAgXG4gICAgICAgIHNldFRpbWVvdXQgQHNsb3dUaWNrLCAxMDAwXG4gICAgICAgIFxuICAgIGRldGFjaDogLT5cbiAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAga2xvZyB3eHcgJ2tpbGwnICd3Yy5leGUnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGtsb2cgd3h3ICdraWxsJyAnbWMnXG4gICAgICAgICAgICBcbiAgICBvblVEUDogKG1zZykgPT4gXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggbXNnLmV2ZW50XG4gICAgICAgICAgICB3aGVuICdtb3VzZWRvd24nICdtb3VzZW1vdmUnICdtb3VzZXVwJyAnbW91c2V3aGVlbCcgdGhlbiBAcHJvdmlkZXJzLm1vdXNlLm9uRXZlbnQgbXNnXG4gICAgICAgICAgICB3aGVuICdrZXlkb3duJyAna2V5dXAnIHRoZW4gQHByb3ZpZGVycy5rZXlib2FyZC5vbkV2ZW50IG1zZ1xuICAgICAgICAgICAgd2hlbiAncHJvYycgdGhlbiBAcHJvdmlkZXJzLmFwcHMub25FdmVudCBtc2dcbiAgICAgICAgICAgIHdoZW4gJ2luZm8nIHRoZW4gQHByb3ZpZGVycy53aW5zLm9uRXZlbnQgbXNnXG4gICAgICAgICAgICAjIGVsc2UgbG9nIG1zZ1xuICAgICAgICBcbiAgICBvblJlcXVlc3REYXRhOiAocHJvdmlkZXIsIHdpZCkgPT5cbiAgICAgICAgXG4gICAgICAgICMga2xvZyBcIkRhdGEub25SZXF1ZXN0RGF0YSBwcm92aWRlcjoje2tzdHIgcHJvdmlkZXJ9IHdpZDoje2tzdHIgd2lkfVwiXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgbm90IEBwcm92aWRlcnNbcHJvdmlkZXJdXG4gICAgICAgICAgICBAcHJvdmlkZXJzW3Byb3ZpZGVyXSA9IG5ldyB7Y2xvY2s6Q2xvY2ssIHN5c2luZm86U3lzaW5mb31bcHJvdmlkZXJdXG4gICAgICAgICAgICBAcHJvdmlkZXJzW3Byb3ZpZGVyXS5yZWNlaXZlcnMgPSBbXVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIHdpZCBub3QgaW4gQHByb3ZpZGVyc1twcm92aWRlcl0ucmVjZWl2ZXJzXG4gICAgICAgICAgICBAcHJvdmlkZXJzW3Byb3ZpZGVyXS5yZWNlaXZlcnMucHVzaCB3aWQgXG5cbiAgICBzbG93VGljazogPT5cbiAgICAgICAgXG4gICAgICAgIGZvciBuYW1lLHByb3ZpZGVyIG9mIEBwcm92aWRlcnNcbiAgICAgICAgICAgIGlmIHByb3ZpZGVyLnRpY2sgPT0gJ3Nsb3cnXG4gICAgICAgICAgICAgICAgcHJvdmlkZXIub25UaWNrIEBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgc2V0VGltZW91dCBAc2xvd1RpY2ssIDEwMDAgLSAobmV3IERhdGUpLmdldE1pbGxpc2Vjb25kcygpXG4gICAgICAgIFxuICAgIHNlbmQ6IChwcm92aWRlciwgZGF0YSkgPT5cbiAgICAgICAgXG4gICAgICAgIGZvciByZWNlaXZlciBpbiBwcm92aWRlci5yZWNlaXZlcnNcbiAgICAgICAgICAgIHBvc3QudG9XaW4gcmVjZWl2ZXIsICdkYXRhJyBkYXRhXG4gICAgICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4jICAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuXG5jbGFzcyBDbG9ja1xuICAgICAgICBcbiAgICBAOiAoQG5hbWU9J2Nsb2NrJyBAdGljaz0nc2xvdycpIC0+XG4gICAgICAgIFxuICAgIG9uVGljazogKGRhdGEpID0+XG4gICAgICAgIFxuICAgICAgICB0aW1lID0gbmV3IERhdGUoKVxuICAgICAgICBcbiAgICAgICAgaG91cnMgICA9IHRpbWUuZ2V0SG91cnMoKVxuICAgICAgICBtaW51dGVzID0gdGltZS5nZXRNaW51dGVzKClcbiAgICAgICAgc2Vjb25kcyA9IHRpbWUuZ2V0U2Vjb25kcygpXG4gICAgICAgIFxuICAgICAgICBob3VyU3RyICAgPSBrc3RyLmxwYWQgaG91cnMsICAgMiAnMCdcbiAgICAgICAgbWludXRlU3RyID0ga3N0ci5scGFkIG1pbnV0ZXMsIDIgJzAnXG4gICAgICAgIHNlY29uZFN0ciA9IGtzdHIubHBhZCBzZWNvbmRzLCAyICcwJ1xuICAgICAgICBcbiAgICAgICAgZGF0YS5zZW5kIEAsXG4gICAgICAgICAgICBob3VyOiAgIGhvdXJzXG4gICAgICAgICAgICBtaW51dGU6IG1pbnV0ZXNcbiAgICAgICAgICAgIHNlY29uZDogc2Vjb25kc1xuICAgICAgICAgICAgc3RyOlxuICAgICAgICAgICAgICAgICAgICBob3VyOiAgIGhvdXJTdHJcbiAgICAgICAgICAgICAgICAgICAgbWludXRlOiBtaW51dGVTdHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kOiBzZWNvbmRTdHJcbiAgICAgICAgICAgICAgICAgICAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4jICAgICAgMDAwICAgICAwMDAgICAgICAgICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAwMDAwICAgXG5cbmNsYXNzIFN5c2luZm9cbiAgICAgICAgXG4gICAgQDogKEBuYW1lPSdzeXNpbmZvJyBAdGljaz0nc2xvdycpIC0+XG4gICAgICAgIFxuICAgICAgICBAcl9tYXggPSAxMDBcbiAgICAgICAgQHdfbWF4ID0gMTAwXG5cbiAgICAgICAgQHJ4X21heCA9IDEwMFxuICAgICAgICBAdHhfbWF4ID0gMTAwXG4gICAgICAgIFxuICAgIG9uVGljazogKGRhdGEpID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgZ2xvYmFsLmRyYWdnaW5nXG4gICAgICAgIFxuICAgICAgICBzeXNpbmZvLmdldER5bmFtaWNEYXRhIChkKSA9PiBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcnhfc2VjID0gcGFyc2VJbnQgZC5uZXR3b3JrU3RhdHNbMF0ucnhfc2VjXG4gICAgICAgICAgICB0eF9zZWMgPSBwYXJzZUludCBkLm5ldHdvcmtTdGF0c1swXS50eF9zZWNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQHJ4X21heCA9IE1hdGgubWF4IEByeF9tYXgsIHJ4X3NlY1xuICAgICAgICAgICAgQHR4X21heCA9IE1hdGgubWF4IEB0eF9tYXgsIHR4X3NlY1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBuZCA9XG4gICAgICAgICAgICAgICAgbWVtOiBkLm1lbVxuICAgICAgICAgICAgICAgIG5ldDpcbiAgICAgICAgICAgICAgICAgICAgcnhfc2VjOiByeF9zZWNcbiAgICAgICAgICAgICAgICAgICAgdHhfc2VjOiB0eF9zZWNcbiAgICAgICAgICAgICAgICAgICAgcnhfbWF4OiBAcnhfbWF4XG4gICAgICAgICAgICAgICAgICAgIHR4X21heDogQHR4X21heFxuICAgICAgICAgICAgICAgIGNwdTpcbiAgICAgICAgICAgICAgICAgICAgc3lzOiBkLmN1cnJlbnRMb2FkLmN1cnJlbnRsb2FkLzEwMCBcbiAgICAgICAgICAgICAgICAgICAgdXNyOiBkLmN1cnJlbnRMb2FkLmN1cnJlbnRsb2FkX3VzZXIvMTAwXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgZGF0YS5kaXNrc0lPP1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJfc2VjID0gZC5kaXNrc0lPLnJJT19zZWNcbiAgICAgICAgICAgICAgICB3X3NlYyA9IGQuZGlza3NJTy53SU9fc2VjXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHJfbWF4ID0gTWF0aC5tYXggQHJfbWF4LCByX3NlY1xuICAgICAgICAgICAgICAgIEB3X21heCA9IE1hdGgubWF4IEB3X21heCwgd19zZWNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBuZC5kc2sgPSBcbiAgICAgICAgICAgICAgICAgICAgcl9zZWM6IHJfc2VjXG4gICAgICAgICAgICAgICAgICAgIHdfc2VjOiB3X3NlY1xuICAgICAgICAgICAgICAgICAgICByX21heDogQHJfbWF4XG4gICAgICAgICAgICAgICAgICAgIHdfbWF4OiBAd19tYXhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZGF0YS5zZW5kIEAsIG5kXG5cbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcblxuY2xhc3MgTW91c2VcbiAgICBcbiAgICBAOiAoQG5hbWU9J21vdXNlJyBAcmVjZWl2ZXJzPVtdKSAtPlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBAbGFzdCA9IERhdGUubm93KClcbiAgICAgICAgQGludGVydmFsID0gcGFyc2VJbnQgMTAwMC82MFxuICAgICAgICBAbGFzdEV2ZW50ID0gbnVsbFxuICAgICAgICBAc2VuZFRpbWVyID0gbnVsbFxuICAgICAgICBcbiAgICBvbkV2ZW50OiAoZXZlbnQpID0+XG5cbiAgICAgICAgQGxhc3RFdmVudCA9IGV2ZW50XG4gICAgICAgIG5vdyA9IERhdGUubm93KClcbiAgICAgICAgY2xlYXJUaW1lb3V0IEBzZW5kVGltZXJcbiAgICAgICAgQHNlbmRUaW1lciA9IG51bGxcbiAgICAgICAgXG4gICAgICAgIGlmIG5vdyAtIEBsYXN0ID4gQGludGVydmFsXG4gICAgICAgICAgICBAbGFzdCA9IG5vd1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBwb3MgPSBrcG9zIGV2ZW50XG4gICAgICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgICAgICBwb3MgPSBrcG9zKGVsZWN0cm9uLnNjcmVlbi5zY3JlZW5Ub0RpcFBvaW50IHBvcykucm91bmRlZCgpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGJvdW5kcyA9IHJlcXVpcmUgJy4vYm91bmRzJ1xuICAgICAgICAgICAgcG9zID0gcG9zLmNsYW1wIGtwb3MoMCwwKSwga3BvcyBib3VuZHMuc2NyZWVuV2lkdGgsIGJvdW5kcy5zY3JlZW5IZWlnaHRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXZlbnQueCA9IHBvcy54XG4gICAgICAgICAgICBldmVudC55ID0gcG9zLnlcbiAgICAgICAgXG4gICAgICAgICAgICAjIGtsb2cgJ21vdXNlJyBldmVudFxuICAgICAgICAgICAgcG9zdC50b01haW4gQG5hbWUsIGV2ZW50XG4gICAgICAgICAgICBmb3IgcmVjZWl2ZXIgaW4gQHJlY2VpdmVyc1xuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gcmVjZWl2ZXIsICdkYXRhJywgZXZlbnRcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNlbmRUaW1lciA9IHNldFRpbWVvdXQgKD0+IEBvbkV2ZW50IEBsYXN0RXZlbnQpLCBAaW50ZXJ2YWxcbiAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcblxuY2xhc3MgS2V5Ym9hcmRcbiAgICBcbiAgICBAOiAoQG5hbWU9J2tleWJvYXJkJyBAcmVjZWl2ZXJzPVtdKSAtPlxuICAgICAgICBcbiAgICBvbkV2ZW50OiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICBwb3N0LnRvTWFpbiBAbmFtZSwgZXZlbnRcbiAgICAgICAgZm9yIHJlY2VpdmVyIGluIEByZWNlaXZlcnNcbiAgICAgICAgICAgIHBvc3QudG9XaW4gcmVjZWl2ZXIsIEBuYW1lLCBldmVudFxuICAgICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgICAgICAgMDAwICBcbiMgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICBcblxuY2xhc3MgQm91bmRzXG4gICAgXG4gICAgQDogKEBuYW1lPSdib3VuZHMnIEByZWNlaXZlcnM9W10pIC0+XG4gICAgICAgIFxuICAgICAgICBwb3N0Lm9uICdib3VuZHMnIEBvbkJvdW5kc1xuICAgICAgICBcbiAgICAgICAgQGxhc3RJbmZvcyA9IG51bGxcbiAgICAgICAgQG9uQm91bmRzKClcbiAgICAgICBcbiAgICBvbkJvdW5kczogKG1zZywgYXJnKSA9PlxuICAgICAgICBcbiAgICAgICAgYm91bmRzID0gcmVxdWlyZSAnLi9ib3VuZHMnXG4gICAgICAgIGluZm9zID0gYm91bmRzLmluZm9zXG4gICAgICAgIGlmIG5vdCBfLmlzRXF1YWwgaW5mb3MsIEBsYXN0SW5mb3NcbiAgICAgICAgICAgIEBsYXN0SW5mb3MgPSBpbmZvc1xuICAgICAgICAgICAgZm9yIHJlY2VpdmVyIGluIEByZWNlaXZlcnNcbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIHJlY2VpdmVyLCAnZGF0YScsIGluZm9zXG4gICAgICAgICAgICBcbiMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgICAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAwMDAwICAgXG5cbmNsYXNzIEFwcHNcbiAgICBcbiAgICBAOiAoQG5hbWU9J2FwcHMnIEByZWNlaXZlcnM9W10pIC0+XG4gICAgICAgIFxuICAgICAgICBAbGFzdEFwcHMgPSBudWxsICAgICAgICBcbiAgICAgICAgXG4gICAgc3RhcnQ6ID0+IEBmb3JjZSA9IHRydWVcbiAgICAgICAgXG4gICAgb25FdmVudDogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgYXBwcyA9IEFycmF5LmZyb20gbmV3IFNldCBldmVudC5wcm9jLm1hcCAocCkgLT4gcC5wYXRoXG4gICAgICAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICBhcHBzID0gYXBwcy5maWx0ZXIgKHApIC0+IFxuICAgICAgICAgICAgICAgIHMgPSBzbGFzaC5wYXRoIHNsYXNoLnJlbW92ZURyaXZlIHAgXG4gICAgICAgICAgICAgICAgaWYgcy5zdGFydHNXaXRoICcvV2luZG93cy9TeXN0ZW0zMidcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNsYXNoLmJhc2UocykgaW4gWydjbWQnICdwb3dlcnNoZWxsJ11cbiAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgIFxuICAgICAgICBhcHBzLnNvcnQoKVxuICAgICAgICBpZiBAZm9yY2Ugb3Igbm90IF8uaXNFcXVhbCBhcHBzLCBAbGFzdEFwcHNcbiAgICAgICAgICAgIGRlbGV0ZSBAZm9yY2VcbiAgICAgICAgICAgIHBvc3QudG9NYWluICdhcHBzJyBhcHBzXG4gICAgICAgICAgICAjIGtsb2cgJ2FwcHMnIGFwcHMubGVuZ3RoXG4gICAgICAgICAgICBmb3IgcmVjZWl2ZXIgaW4gQHJlY2VpdmVyc1xuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gcmVjZWl2ZXIsICdkYXRhJywgYXBwc1xuICAgICAgICAgICAgIFxuICAgICAgICAgICAgQGxhc3RBcHBzID0gYXBwc1xuICAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIFxuIyAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG5cbmNsYXNzIFdpbnNcbiAgICBcbiAgICBAOiAoQG5hbWU9J3dpbnMnIEByZWNlaXZlcnM9W10pIC0+XG4gICAgICAgIFxuICAgICAgICBAbGFzdFdpbnMgPSBudWxsXG5cbiAgICBzdGFydDogPT4gQGZvcmNlID0gdHJ1ZVxuICAgIFxuICAgIG9uRXZlbnQ6IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIHdpbnMgPSBldmVudC5pbmZvXG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICdkYXJ3aW4nXG4gICAgICAgICAgICB3aW5zWzBdLnN0YXR1cyArPSAnIHRvcCdcbiAgICAgICAgXG4gICAgICAgIHdpbnMucG9wKCkgaWYgZW1wdHkgbGFzdCB3aW5zXG4gICAgICAgIGlmIEBmb3JjZSBvciBub3QgXy5pc0VxdWFsIHdpbnMsIEBsYXN0V2luc1xuICAgICAgICAgICAgZGVsZXRlIEBmb3JjZVxuICAgICAgICAgICAgcG9zdC50b01haW4gJ3dpbnMnIHdpbnNcbiAgICAgICAgICAgIGZvciByZWNlaXZlciBpbiBAcmVjZWl2ZXJzXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiByZWNlaXZlciwgJ2RhdGEnLCBhcHBzXG4gICAgICAgICAgICBAbGFzdFdpbnMgPSB3aW5zXG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IERhdGFcblxuIl19
//# sourceURL=../coffee/data.coffee
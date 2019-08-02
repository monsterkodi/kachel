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
        return klog(wxw('kill', 'wc.exe'));
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
        apps = apps.filter(function(p) {
            var ref1, s;
            s = slash.path(slash.removeDrive(p));
            if (s.startsWith('/Windows/System32')) {
                return (ref1 = slash.base(s)) === 'cmd' || ref1 === 'powershell';
            }
            return true;
        });
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
        if (os.platform() !== 'win32') {
            return;
        }
        wins = event.info;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsaUlBQUE7SUFBQTs7O0FBUUEsTUFBZ0QsT0FBQSxDQUFRLEtBQVIsQ0FBaEQsRUFBRSxlQUFGLEVBQVEsZUFBUixFQUFjLGlCQUFkLEVBQXFCLGVBQXJCLEVBQTJCLGVBQTNCLEVBQWlDLGFBQWpDLEVBQXNDLFdBQXRDLEVBQTBDOztBQUUxQyxPQUFBLEdBQVcsT0FBQSxDQUFRLG1CQUFSOztBQUNYLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFFWCxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixPQUFwQjtJQUFpQyxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVIsRUFBdkM7OztBQUVNO0lBRUMsY0FBQTs7Ozs7UUFFQyxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixPQUFwQjtZQUVJLElBQUMsQ0FBQSxHQUFELEdBQVEsR0FBQSxDQUFJO2dCQUFBLElBQUEsRUFBSyxLQUFMO2dCQUFXLEtBQUEsRUFBTSxJQUFDLENBQUEsS0FBbEI7YUFBSjtZQUNSLElBQUMsQ0FBQSxJQUFELEdBQVEsR0FBQSxDQUFJLE1BQUosRUFIWjs7UUFLQSxJQUFDLENBQUEsU0FBRCxHQUNJO1lBQUEsS0FBQSxFQUFVLElBQUksS0FBZDtZQUNBLFFBQUEsRUFBVSxJQUFJLFFBRGQ7WUFFQSxJQUFBLEVBQVUsSUFBSSxJQUZkO1lBR0EsSUFBQSxFQUFVLElBQUksSUFIZDs7UUFLSixJQUFJLENBQUMsRUFBTCxDQUFRLGFBQVIsRUFBc0IsSUFBQyxDQUFBLGFBQXZCO1FBRUEsVUFBQSxDQUFXLElBQUMsQ0FBQSxRQUFaLEVBQXNCLElBQXRCO0lBZkQ7O21CQWlCSCxNQUFBLEdBQVEsU0FBQTtlQUVKLElBQUEsQ0FBSyxHQUFBLENBQUksTUFBSixFQUFXLFFBQVgsQ0FBTDtJQUZJOzttQkFJUixL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QSxDQUFBLEtBQWlCLE9BQTNCO0FBQUEsbUJBQUE7O1FBRUEsSUFBQSxHQUFPLEtBQUssQ0FBQztRQUNiLElBQUcsSUFBQyxDQUFBLEtBQUQsSUFBVSxDQUFJLENBQUMsQ0FBQyxPQUFGLENBQVUsSUFBVixFQUFnQixJQUFDLENBQUEsUUFBakIsQ0FBakI7WUFDSSxPQUFPLElBQUMsQ0FBQTtZQUNSLElBQUksQ0FBQyxNQUFMLENBQVksTUFBWixFQUFtQixJQUFuQjtBQUNBO0FBQUEsaUJBQUEsc0NBQUE7O2dCQUNJLElBQUksQ0FBQyxLQUFMLENBQVcsUUFBWCxFQUFxQixNQUFyQixFQUE2QixJQUE3QjtBQURKO21CQUdBLElBQUMsQ0FBQSxRQUFELEdBQVksS0FOaEI7O0lBTEs7Ozs7OztBQWFiLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwMDAwMCBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMFxuMDAwICAgMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDBcbjAwMDAwMDAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgcG9zdCwga2xvZywgc2xhc2gsIGtzdHIsIGtwb3MsIHVkcCwgb3MsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuc3lzaW5mbyAgPSByZXF1aXJlICdzeXN0ZW1pbmZvcm1hdGlvbidcbmVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG5cbmlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJyB0aGVuIHd4dyA9IHJlcXVpcmUgJ3d4dydcblxuY2xhc3MgRGF0YVxuXG4gICAgQDogLT5cbiAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBAdWRwICA9IHVkcCBwb3J0OjY2NjY2IG9uTXNnOkBvblVEUFxuICAgICAgICAgICAgQGhvb2sgPSB3eHcgJ2hvb2snXG4gICAgICAgIFxuICAgICAgICBAcHJvdmlkZXJzID0gXG4gICAgICAgICAgICBtb3VzZTogICAgbmV3IE1vdXNlXG4gICAgICAgICAgICBrZXlib2FyZDogbmV3IEtleWJvYXJkXG4gICAgICAgICAgICBhcHBzOiAgICAgbmV3IEFwcHNcbiAgICAgICAgICAgIHdpbnM6ICAgICBuZXcgV2luc1xuICAgICAgICBcbiAgICAgICAgcG9zdC5vbiAncmVxdWVzdERhdGEnIEBvblJlcXVlc3REYXRhXG4gICAgICAgIFxuICAgICAgICBzZXRUaW1lb3V0IEBzbG93VGljaywgMTAwMFxuICAgICAgICBcbiAgICBkZXRhY2g6IC0+XG4gICAgICAgIFxuICAgICAgICBrbG9nIHd4dyAna2lsbCcgJ3djLmV4ZSdcbiAgICAgICAgICAgIFxuICAgIG9uVURQOiAobXNnKSA9PiBcblxuICAgICAgICBzd2l0Y2ggbXNnLmV2ZW50IFxuICAgICAgICAgICAgd2hlbiAnbW91c2Vkb3duJyAnbW91c2Vtb3ZlJyAnbW91c2V1cCcgJ21vdXNld2hlZWwnIHRoZW4gQHByb3ZpZGVycy5tb3VzZS5vbkV2ZW50IG1zZ1xuICAgICAgICAgICAgd2hlbiAna2V5ZG93bicgJ2tleXVwJyB0aGVuIEBwcm92aWRlcnMua2V5Ym9hcmQub25FdmVudCBtc2dcbiAgICAgICAgICAgIHdoZW4gJ3Byb2MnIHRoZW4gQHByb3ZpZGVycy5hcHBzLm9uRXZlbnQgbXNnXG4gICAgICAgICAgICB3aGVuICdpbmZvJyB0aGVuIEBwcm92aWRlcnMud2lucy5vbkV2ZW50IG1zZ1xuICAgICAgICAgICAgIyBlbHNlIGxvZyBtc2dcbiAgICAgICAgXG4gICAgb25SZXF1ZXN0RGF0YTogKHByb3ZpZGVyLCB3aWQpID0+XG4gICAgICAgIFxuICAgICAgICAjIGtsb2cgXCJEYXRhLm9uUmVxdWVzdERhdGEgcHJvdmlkZXI6I3trc3RyIHByb3ZpZGVyfSB3aWQ6I3trc3RyIHdpZH1cIlxuICAgICAgICAgICAgXG4gICAgICAgIGlmIG5vdCBAcHJvdmlkZXJzW3Byb3ZpZGVyXVxuICAgICAgICAgICAgQHByb3ZpZGVyc1twcm92aWRlcl0gPSBuZXcge2Nsb2NrOkNsb2NrLCBzeXNpbmZvOlN5c2luZm99W3Byb3ZpZGVyXVxuICAgICAgICAgICAgQHByb3ZpZGVyc1twcm92aWRlcl0ucmVjZWl2ZXJzID0gW11cbiAgICAgICAgICAgIFxuICAgICAgICBpZiB3aWQgbm90IGluIEBwcm92aWRlcnNbcHJvdmlkZXJdLnJlY2VpdmVyc1xuICAgICAgICAgICAgQHByb3ZpZGVyc1twcm92aWRlcl0ucmVjZWl2ZXJzLnB1c2ggd2lkIFxuXG4gICAgc2xvd1RpY2s6ID0+XG4gICAgICAgIFxuICAgICAgICBmb3IgbmFtZSxwcm92aWRlciBvZiBAcHJvdmlkZXJzXG4gICAgICAgICAgICBpZiBwcm92aWRlci50aWNrID09ICdzbG93J1xuICAgICAgICAgICAgICAgIHByb3ZpZGVyLm9uVGljayBAXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHNldFRpbWVvdXQgQHNsb3dUaWNrLCAxMDAwIC0gKG5ldyBEYXRlKS5nZXRNaWxsaXNlY29uZHMoKVxuICAgICAgICBcbiAgICBzZW5kOiAocHJvdmlkZXIsIGRhdGEpID0+XG4gICAgICAgIFxuICAgICAgICBmb3IgcmVjZWl2ZXIgaW4gcHJvdmlkZXIucmVjZWl2ZXJzXG4gICAgICAgICAgICBwb3N0LnRvV2luIHJlY2VpdmVyLCAnZGF0YScgZGF0YVxuICAgICAgICAgICAgXG4jICAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4jIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuIyAgMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcblxuY2xhc3MgQ2xvY2tcbiAgICAgICAgXG4gICAgQDogKEBuYW1lPSdjbG9jaycgQHRpY2s9J3Nsb3cnKSAtPlxuICAgICAgICBcbiAgICBvblRpY2s6IChkYXRhKSA9PlxuICAgICAgICBcbiAgICAgICAgdGltZSA9IG5ldyBEYXRlKClcbiAgICAgICAgXG4gICAgICAgIGhvdXJzICAgPSB0aW1lLmdldEhvdXJzKClcbiAgICAgICAgbWludXRlcyA9IHRpbWUuZ2V0TWludXRlcygpXG4gICAgICAgIHNlY29uZHMgPSB0aW1lLmdldFNlY29uZHMoKVxuICAgICAgICBcbiAgICAgICAgaG91clN0ciAgID0ga3N0ci5scGFkIGhvdXJzLCAgIDIgJzAnXG4gICAgICAgIG1pbnV0ZVN0ciA9IGtzdHIubHBhZCBtaW51dGVzLCAyICcwJ1xuICAgICAgICBzZWNvbmRTdHIgPSBrc3RyLmxwYWQgc2Vjb25kcywgMiAnMCdcbiAgICAgICAgXG4gICAgICAgIGRhdGEuc2VuZCBALFxuICAgICAgICAgICAgaG91cjogICBob3Vyc1xuICAgICAgICAgICAgbWludXRlOiBtaW51dGVzXG4gICAgICAgICAgICBzZWNvbmQ6IHNlY29uZHNcbiAgICAgICAgICAgIHN0cjpcbiAgICAgICAgICAgICAgICAgICAgaG91cjogICBob3VyU3RyXG4gICAgICAgICAgICAgICAgICAgIG1pbnV0ZTogbWludXRlU3RyXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZDogc2Vjb25kU3RyXG4gICAgICAgICAgICAgICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMCAgICAwMDAgICAwMDAgIFxuIyAgICAgIDAwMCAgICAgMDAwICAgICAgICAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwMDAwMCAgIFxuXG5jbGFzcyBTeXNpbmZvXG4gICAgICAgIFxuICAgIEA6IChAbmFtZT0nc3lzaW5mbycgQHRpY2s9J3Nsb3cnKSAtPlxuICAgICAgICBcbiAgICAgICAgQHJfbWF4ID0gMTAwXG4gICAgICAgIEB3X21heCA9IDEwMFxuXG4gICAgICAgIEByeF9tYXggPSAxMDBcbiAgICAgICAgQHR4X21heCA9IDEwMFxuICAgICAgICBcbiAgICBvblRpY2s6IChkYXRhKSA9PlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIGdsb2JhbC5kcmFnZ2luZ1xuICAgICAgICBcbiAgICAgICAgc3lzaW5mby5nZXREeW5hbWljRGF0YSAoZCkgPT4gXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJ4X3NlYyA9IHBhcnNlSW50IGQubmV0d29ya1N0YXRzWzBdLnJ4X3NlY1xuICAgICAgICAgICAgdHhfc2VjID0gcGFyc2VJbnQgZC5uZXR3b3JrU3RhdHNbMF0udHhfc2VjXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEByeF9tYXggPSBNYXRoLm1heCBAcnhfbWF4LCByeF9zZWNcbiAgICAgICAgICAgIEB0eF9tYXggPSBNYXRoLm1heCBAdHhfbWF4LCB0eF9zZWNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbmQgPVxuICAgICAgICAgICAgICAgIG1lbTogZC5tZW1cbiAgICAgICAgICAgICAgICBuZXQ6XG4gICAgICAgICAgICAgICAgICAgIHJ4X3NlYzogcnhfc2VjXG4gICAgICAgICAgICAgICAgICAgIHR4X3NlYzogdHhfc2VjXG4gICAgICAgICAgICAgICAgICAgIHJ4X21heDogQHJ4X21heFxuICAgICAgICAgICAgICAgICAgICB0eF9tYXg6IEB0eF9tYXhcbiAgICAgICAgICAgICAgICBjcHU6XG4gICAgICAgICAgICAgICAgICAgIHN5czogZC5jdXJyZW50TG9hZC5jdXJyZW50bG9hZC8xMDAgXG4gICAgICAgICAgICAgICAgICAgIHVzcjogZC5jdXJyZW50TG9hZC5jdXJyZW50bG9hZF91c2VyLzEwMFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGRhdGEuZGlza3NJTz9cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByX3NlYyA9IGQuZGlza3NJTy5ySU9fc2VjXG4gICAgICAgICAgICAgICAgd19zZWMgPSBkLmRpc2tzSU8ud0lPX3NlY1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEByX21heCA9IE1hdGgubWF4IEByX21heCwgcl9zZWNcbiAgICAgICAgICAgICAgICBAd19tYXggPSBNYXRoLm1heCBAd19tYXgsIHdfc2VjXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbmQuZHNrID0gXG4gICAgICAgICAgICAgICAgICAgIHJfc2VjOiByX3NlY1xuICAgICAgICAgICAgICAgICAgICB3X3NlYzogd19zZWNcbiAgICAgICAgICAgICAgICAgICAgcl9tYXg6IEByX21heFxuICAgICAgICAgICAgICAgICAgICB3X21heDogQHdfbWF4XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGRhdGEuc2VuZCBALCBuZFxuXG4jIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG5cbmNsYXNzIE1vdXNlXG4gICAgXG4gICAgQDogKEBuYW1lPSdtb3VzZScgQHJlY2VpdmVycz1bXSkgLT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQGxhc3QgPSBEYXRlLm5vdygpXG4gICAgICAgIEBpbnRlcnZhbCA9IHBhcnNlSW50IDEwMDAvNjBcbiAgICAgICAgQGxhc3RFdmVudCA9IG51bGxcbiAgICAgICAgQHNlbmRUaW1lciA9IG51bGxcbiAgICAgICAgXG4gICAgb25FdmVudDogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgQGxhc3RFdmVudCA9IGV2ZW50XG4gICAgICAgIG5vdyA9IERhdGUubm93KClcbiAgICAgICAgY2xlYXJUaW1lb3V0IEBzZW5kVGltZXJcbiAgICAgICAgQHNlbmRUaW1lciA9IG51bGxcbiAgICAgICAgaWYgbm93IC0gQGxhc3QgPiBAaW50ZXJ2YWxcbiAgICAgICAgICAgIEBsYXN0ID0gbm93XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHBvcyA9IGtwb3MgZXZlbnRcbiAgICAgICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgICAgIHBvcyA9IGtwb3MoZWxlY3Ryb24uc2NyZWVuLnNjcmVlblRvRGlwUG9pbnQgcG9zKS5yb3VuZGVkKClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYm91bmRzID0gcmVxdWlyZSAnLi9ib3VuZHMnXG4gICAgICAgICAgICBwb3MgPSBwb3MuY2xhbXAga3BvcygwLDApLCBrcG9zIGJvdW5kcy5zY3JlZW5XaWR0aCwgYm91bmRzLnNjcmVlbkhlaWdodFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBldmVudC54ID0gcG9zLnhcbiAgICAgICAgICAgIGV2ZW50LnkgPSBwb3MueVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBwb3N0LnRvTWFpbiBAbmFtZSwgZXZlbnRcbiAgICAgICAgICAgIGZvciByZWNlaXZlciBpbiBAcmVjZWl2ZXJzXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiByZWNlaXZlciwgJ2RhdGEnLCBldmVudFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2VuZFRpbWVyID0gc2V0VGltZW91dCAoPT4gQG9uRXZlbnQgQGxhc3RFdmVudCksIEBpbnRlcnZhbFxuICAgICAgICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuXG5jbGFzcyBLZXlib2FyZFxuICAgIFxuICAgIEA6IChAbmFtZT0na2V5Ym9hcmQnIEByZWNlaXZlcnM9W10pIC0+XG4gICAgICAgIFxuICAgIG9uRXZlbnQ6IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIHBvc3QudG9NYWluIEBuYW1lLCBldmVudFxuICAgICAgICBmb3IgcmVjZWl2ZXIgaW4gQHJlY2VpdmVyc1xuICAgICAgICAgICAgcG9zdC50b1dpbiByZWNlaXZlciwgQG5hbWUsIGV2ZW50XG4gICAgICAgIFxuIyAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuIyAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuXG5jbGFzcyBCb3VuZHNcbiAgICBcbiAgICBAOiAoQG5hbWU9J2JvdW5kcycgQHJlY2VpdmVycz1bXSkgLT5cbiAgICAgICAgXG4gICAgICAgIHBvc3Qub24gJ2JvdW5kcycgQG9uQm91bmRzXG4gICAgICAgIFxuICAgICAgICBAbGFzdEluZm9zID0gbnVsbFxuICAgICAgICBAb25Cb3VuZHMoKVxuICAgICAgIFxuICAgIG9uQm91bmRzOiAobXNnLCBhcmcpID0+XG4gICAgICAgIFxuICAgICAgICBib3VuZHMgPSByZXF1aXJlICcuL2JvdW5kcydcbiAgICAgICAgaW5mb3MgPSBib3VuZHMuaW5mb3NcbiAgICAgICAgaWYgbm90IF8uaXNFcXVhbCBpbmZvcywgQGxhc3RJbmZvc1xuICAgICAgICAgICAgQGxhc3RJbmZvcyA9IGluZm9zXG4gICAgICAgICAgICBmb3IgcmVjZWl2ZXIgaW4gQHJlY2VpdmVyc1xuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gcmVjZWl2ZXIsICdkYXRhJywgaW5mb3NcbiAgICAgICAgICAgIFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAgICAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMDAwMDAgICBcblxuY2xhc3MgQXBwc1xuICAgIFxuICAgIEA6IChAbmFtZT0nYXBwcycgQHJlY2VpdmVycz1bXSkgLT5cbiAgICAgICAgXG4gICAgICAgIEBsYXN0QXBwcyA9IG51bGwgICAgICAgIFxuICAgICAgICBcbiAgICBzdGFydDogPT4gQGZvcmNlID0gdHJ1ZVxuICAgICAgICBcbiAgICBvbkV2ZW50OiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICBhcHBzID0gQXJyYXkuZnJvbSBuZXcgU2V0IGV2ZW50LnByb2MubWFwIChwKSAtPiBwLnBhdGhcbiAgICAgICAgIFxuICAgICAgICBhcHBzID0gYXBwcy5maWx0ZXIgKHApIC0+IFxuICAgICAgICAgICAgcyA9IHNsYXNoLnBhdGggc2xhc2gucmVtb3ZlRHJpdmUgcCBcbiAgICAgICAgICAgIGlmIHMuc3RhcnRzV2l0aCAnL1dpbmRvd3MvU3lzdGVtMzInXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNsYXNoLmJhc2UocykgaW4gWydjbWQnICdwb3dlcnNoZWxsJ11cbiAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICAgXG4gICAgICAgIGFwcHMuc29ydCgpXG4gICAgICAgICBcbiAgICAgICAgaWYgQGZvcmNlIG9yIG5vdCBfLmlzRXF1YWwgYXBwcywgQGxhc3RBcHBzXG4gICAgICAgICAgICBkZWxldGUgQGZvcmNlXG4gICAgICAgICAgICBwb3N0LnRvTWFpbiAnYXBwcycgYXBwc1xuICAgICAgICAgICAgZm9yIHJlY2VpdmVyIGluIEByZWNlaXZlcnNcbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIHJlY2VpdmVyLCAnZGF0YScsIGFwcHNcbiAgICAgICAgICAgICBcbiAgICAgICAgICAgIEBsYXN0QXBwcyA9IGFwcHNcbiAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiMgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICBcbiMgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuXG5jbGFzcyBXaW5zXG4gICAgXG4gICAgQDogKEBuYW1lPSd3aW5zJyBAcmVjZWl2ZXJzPVtdKSAtPlxuICAgICAgICBcbiAgICAgICAgQGxhc3RXaW5zID0gbnVsbFxuXG4gICAgc3RhcnQ6ID0+IEBmb3JjZSA9IHRydWVcbiAgICBcbiAgICBvbkV2ZW50OiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgb3MucGxhdGZvcm0oKSAhPSAnd2luMzInIFxuICAgICAgICBcbiAgICAgICAgd2lucyA9IGV2ZW50LmluZm9cbiAgICAgICAgaWYgQGZvcmNlIG9yIG5vdCBfLmlzRXF1YWwgd2lucywgQGxhc3RXaW5zXG4gICAgICAgICAgICBkZWxldGUgQGZvcmNlXG4gICAgICAgICAgICBwb3N0LnRvTWFpbiAnd2lucycgd2luc1xuICAgICAgICAgICAgZm9yIHJlY2VpdmVyIGluIEByZWNlaXZlcnNcbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIHJlY2VpdmVyLCAnZGF0YScsIGFwcHNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQGxhc3RXaW5zID0gd2luc1xuICAgIFxubW9kdWxlLmV4cG9ydHMgPSBEYXRhXG5cbiJdfQ==
//# sourceURL=../coffee/data.coffee
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
            this.hookInput = wxw('hook', 'input');
            this.hookProc = wxw('hook', 'proc');
            this.hookInfo = wxw('hook', 'info');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsaUlBQUE7SUFBQTs7O0FBUUEsTUFBZ0QsT0FBQSxDQUFRLEtBQVIsQ0FBaEQsRUFBRSxlQUFGLEVBQVEsZUFBUixFQUFjLGlCQUFkLEVBQXFCLGVBQXJCLEVBQTJCLGVBQTNCLEVBQWlDLGFBQWpDLEVBQXNDLFdBQXRDLEVBQTBDOztBQUUxQyxPQUFBLEdBQVcsT0FBQSxDQUFRLG1CQUFSOztBQUNYLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFFWCxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixPQUFwQjtJQUFpQyxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVIsRUFBdkM7OztBQUVNO0lBRUMsY0FBQTs7Ozs7UUFFQyxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixPQUFwQjtZQUVJLElBQUMsQ0FBQSxHQUFELEdBQVEsR0FBQSxDQUFJO2dCQUFBLElBQUEsRUFBSyxLQUFMO2dCQUFXLEtBQUEsRUFBTSxJQUFDLENBQUEsS0FBbEI7YUFBSjtZQUNSLElBQUMsQ0FBQSxTQUFELEdBQWEsR0FBQSxDQUFJLE1BQUosRUFBVyxPQUFYO1lBQ2IsSUFBQyxDQUFBLFFBQUQsR0FBYSxHQUFBLENBQUksTUFBSixFQUFXLE1BQVg7WUFDYixJQUFDLENBQUEsUUFBRCxHQUFhLEdBQUEsQ0FBSSxNQUFKLEVBQVcsTUFBWCxFQUxqQjs7UUFPQSxJQUFDLENBQUEsU0FBRCxHQUNJO1lBQUEsS0FBQSxFQUFVLElBQUksS0FBZDtZQUNBLFFBQUEsRUFBVSxJQUFJLFFBRGQ7WUFFQSxJQUFBLEVBQVUsSUFBSSxJQUZkO1lBR0EsSUFBQSxFQUFVLElBQUksSUFIZDs7UUFLSixJQUFJLENBQUMsRUFBTCxDQUFRLGFBQVIsRUFBc0IsSUFBQyxDQUFBLGFBQXZCO1FBRUEsVUFBQSxDQUFXLElB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SCxLQUFBLEdBQU8sU0FBQTtlQUFHLElBQUMsQ0FBQSxLQUFELEdBQVM7SUFBWjs7bUJBRVAsT0FBQSxHQUFTLFNBQUMsS0FBRDtBQUVMLFlBQUE7UUFBQSxJQUFVLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixPQUEzQjtBQUFBLG1CQUFBOztRQUVBLElBQUEsR0FBTyxLQUFLLENBQUM7UUFDYixJQUFHLElBQUMsQ0FBQSxLQUFELElBQVUsQ0FBSSxDQUFDLENBQUMsT0FBRixDQUFVLElBQVYsRUFBZ0IsSUFBQyxDQUFBLFFBQWpCLENBQWpCO1lBQ0ksT0FBTyxJQUFDLENBQUE7WUFDUixJQUFJLENBQUMsTUFBTCxDQUFZLE1BQVosRUFBbUIsSUFBbkI7QUFDQTtBQUFBLGlCQUFBLHNDQUFBOztnQkFDSSxJQUFJLENBQUMsS0FBTCxDQUFXLFFBQVgsRUFBcUIsTUFBckIsRUFBNkIsSUFBN0I7QUFESjttQkFHQSxJQUFDLENBQUEsUUFBRCxHQUFZLEtBTmhCOztJQUxLOzs7Ozs7QUFhYixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDBcbjAwMCAgIDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4wMDAwMDAwICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDBcbiMjI1xuXG57IHBvc3QsIGtsb2csIHNsYXNoLCBrc3RyLCBrcG9zLCB1ZHAsIG9zLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbnN5c2luZm8gID0gcmVxdWlyZSAnc3lzdGVtaW5mb3JtYXRpb24nXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuXG5pZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMicgdGhlbiB3eHcgPSByZXF1aXJlICd3eHcnXG5cbmNsYXNzIERhdGFcblxuICAgIEA6IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQHVkcCAgPSB1ZHAgcG9ydDo2NjY2NiBvbk1zZzpAb25VRFBcbiAgICAgICAgICAgIEBob29rSW5wdXQgPSB3eHcgJ2hvb2snICdpbnB1dCdcbiAgICAgICAgICAgIEBob29rUHJvYyAgPSB3eHcgJ2hvb2snICdwcm9jJ1xuICAgICAgICAgICAgQGhvb2tJbmZvICA9IHd4dyAnaG9vaycgJ2luZm8nXG4gICAgICAgIFxuICAgICAgICBAcHJvdmlkZXJzID0gXG4gICAgICAgICAgICBtb3VzZTogICAgbmV3IE1vdXNlXG4gICAgICAgICAgICBrZXlib2FyZDogbmV3IEtleWJvYXJkXG4gICAgICAgICAgICBhcHBzOiAgICAgbmV3IEFwcHNcbiAgICAgICAgICAgIHdpbnM6ICAgICBuZXcgV2luc1xuICAgICAgICBcbiAgICAgICAgcG9zdC5vbiAncmVxdWVzdERhdGEnIEBvblJlcXVlc3REYXRhXG4gICAgICAgIFxuICAgICAgICBzZXRUaW1lb3V0IEBzbG93VGljaywgMTAwMFxuICAgICAgICBcbiAgICBkZXRhY2g6IC0+XG4gICAgICAgIFxuICAgICAgICBrbG9nIHd4dyAna2lsbCcgJ3djLmV4ZSdcbiAgICAgICAgICAgIFxuICAgIG9uVURQOiAobXNnKSA9PiBcblxuICAgICAgICBzd2l0Y2ggbXNnLmV2ZW50XG4gICAgICAgICAgICB3aGVuICdtb3VzZWRvd24nICdtb3VzZW1vdmUnICdtb3VzZXVwJyAnbW91c2V3aGVlbCcgdGhlbiBAcHJvdmlkZXJzLm1vdXNlLm9uRXZlbnQgbXNnXG4gICAgICAgICAgICB3aGVuICdrZXlkb3duJyAna2V5dXAnIHRoZW4gQHByb3ZpZGVycy5rZXlib2FyZC5vbkV2ZW50IG1zZ1xuICAgICAgICAgICAgd2hlbiAncHJvYycgdGhlbiBAcHJvdmlkZXJzLmFwcHMub25FdmVudCBtc2dcbiAgICAgICAgICAgIHdoZW4gJ2luZm8nIHRoZW4gQHByb3ZpZGVycy53aW5zLm9uRXZlbnQgbXNnXG4gICAgICAgICAgICAjIGVsc2UgbG9nIG1zZ1xuICAgICAgICBcbiAgICBvblJlcXVlc3REYXRhOiAocHJvdmlkZXIsIHdpZCkgPT5cbiAgICAgICAgXG4gICAgICAgICMga2xvZyBcIkRhdGEub25SZXF1ZXN0RGF0YSBwcm92aWRlcjoje2tzdHIgcHJvdmlkZXJ9IHdpZDoje2tzdHIgd2lkfVwiXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgbm90IEBwcm92aWRlcnNbcHJvdmlkZXJdXG4gICAgICAgICAgICBAcHJvdmlkZXJzW3Byb3ZpZGVyXSA9IG5ldyB7Y2xvY2s6Q2xvY2ssIHN5c2luZm86U3lzaW5mb31bcHJvdmlkZXJdXG4gICAgICAgICAgICBAcHJvdmlkZXJzW3Byb3ZpZGVyXS5yZWNlaXZlcnMgPSBbXVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIHdpZCBub3QgaW4gQHByb3ZpZGVyc1twcm92aWRlcl0ucmVjZWl2ZXJzXG4gICAgICAgICAgICBAcHJvdmlkZXJzW3Byb3ZpZGVyXS5yZWNlaXZlcnMucHVzaCB3aWQgXG5cbiAgICBzbG93VGljazogPT5cbiAgICAgICAgXG4gICAgICAgIGZvciBuYW1lLHByb3ZpZGVyIG9mIEBwcm92aWRlcnNcbiAgICAgICAgICAgIGlmIHByb3ZpZGVyLnRpY2sgPT0gJ3Nsb3cnXG4gICAgICAgICAgICAgICAgcHJvdmlkZXIub25UaWNrIEBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgc2V0VGltZW91dCBAc2xvd1RpY2ssIDEwMDAgLSAobmV3IERhdGUpLmdldE1pbGxpc2Vjb25kcygpXG4gICAgICAgIFxuICAgIHNlbmQ6IChwcm92aWRlciwgZGF0YSkgPT5cbiAgICAgICAgXG4gICAgICAgIGZvciByZWNlaXZlciBpbiBwcm92aWRlci5yZWNlaXZlcnNcbiAgICAgICAgICAgIHBvc3QudG9XaW4gcmVjZWl2ZXIsICdkYXRhJyBkYXRhXG4gICAgICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4jICAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuXG5jbGFzcyBDbG9ja1xuICAgICAgICBcbiAgICBAOiAoQG5hbWU9J2Nsb2NrJyBAdGljaz0nc2xvdycpIC0+XG4gICAgICAgIFxuICAgIG9uVGljazogKGRhdGEpID0+XG4gICAgICAgIFxuICAgICAgICB0aW1lID0gbmV3IERhdGUoKVxuICAgICAgICBcbiAgICAgICAgaG91cnMgICA9IHRpbWUuZ2V0SG91cnMoKVxuICAgICAgICBtaW51dGVzID0gdGltZS5nZXRNaW51dGVzKClcbiAgICAgICAgc2Vjb25kcyA9IHRpbWUuZ2V0U2Vjb25kcygpXG4gICAgICAgIFxuICAgICAgICBob3VyU3RyICAgPSBrc3RyLmxwYWQgaG91cnMsICAgMiAnMCdcbiAgICAgICAgbWludXRlU3RyID0ga3N0ci5scGFkIG1pbnV0ZXMsIDIgJzAnXG4gICAgICAgIHNlY29uZFN0ciA9IGtzdHIubHBhZCBzZWNvbmRzLCAyICcwJ1xuICAgICAgICBcbiAgICAgICAgZGF0YS5zZW5kIEAsXG4gICAgICAgICAgICBob3VyOiAgIGhvdXJzXG4gICAgICAgICAgICBtaW51dGU6IG1pbnV0ZXNcbiAgICAgICAgICAgIHNlY29uZDogc2Vjb25kc1xuICAgICAgICAgICAgc3RyOlxuICAgICAgICAgICAgICAgICAgICBob3VyOiAgIGhvdXJTdHJcbiAgICAgICAgICAgICAgICAgICAgbWludXRlOiBtaW51dGVTdHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kOiBzZWNvbmRTdHJcbiAgICAgICAgICAgICAgICAgICAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4jICAgICAgMDAwICAgICAwMDAgICAgICAgICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAwMDAwICAgXG5cbmNsYXNzIFN5c2luZm9cbiAgICAgICAgXG4gICAgQDogKEBuYW1lPSdzeXNpbmZvJyBAdGljaz0nc2xvdycpIC0+XG4gICAgICAgIFxuICAgICAgICBAcl9tYXggPSAxMDBcbiAgICAgICAgQHdfbWF4ID0gMTAwXG5cbiAgICAgICAgQHJ4X21heCA9IDEwMFxuICAgICAgICBAdHhfbWF4ID0gMTAwXG4gICAgICAgIFxuICAgIG9uVGljazogKGRhdGEpID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgZ2xvYmFsLmRyYWdnaW5nXG4gICAgICAgIFxuICAgICAgICBzeXNpbmZvLmdldER5bmFtaWNEYXRhIChkKSA9PiBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcnhfc2VjID0gcGFyc2VJbnQgZC5uZXR3b3JrU3RhdHNbMF0ucnhfc2VjXG4gICAgICAgICAgICB0eF9zZWMgPSBwYXJzZUludCBkLm5ldHdvcmtTdGF0c1swXS50eF9zZWNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQHJ4X21heCA9IE1hdGgubWF4IEByeF9tYXgsIHJ4X3NlY1xuICAgICAgICAgICAgQHR4X21heCA9IE1hdGgubWF4IEB0eF9tYXgsIHR4X3NlY1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBuZCA9XG4gICAgICAgICAgICAgICAgbWVtOiBkLm1lbVxuICAgICAgICAgICAgICAgIG5ldDpcbiAgICAgICAgICAgICAgICAgICAgcnhfc2VjOiByeF9zZWNcbiAgICAgICAgICAgICAgICAgICAgdHhfc2VjOiB0eF9zZWNcbiAgICAgICAgICAgICAgICAgICAgcnhfbWF4OiBAcnhfbWF4XG4gICAgICAgICAgICAgICAgICAgIHR4X21heDogQHR4X21heFxuICAgICAgICAgICAgICAgIGNwdTpcbiAgICAgICAgICAgICAgICAgICAgc3lzOiBkLmN1cnJlbnRMb2FkLmN1cnJlbnRsb2FkLzEwMCBcbiAgICAgICAgICAgICAgICAgICAgdXNyOiBkLmN1cnJlbnRMb2FkLmN1cnJlbnRsb2FkX3VzZXIvMTAwXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgZGF0YS5kaXNrc0lPP1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJfc2VjID0gZC5kaXNrc0lPLnJJT19zZWNcbiAgICAgICAgICAgICAgICB3X3NlYyA9IGQuZGlza3NJTy53SU9fc2VjXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHJfbWF4ID0gTWF0aC5tYXggQHJfbWF4LCByX3NlY1xuICAgICAgICAgICAgICAgIEB3X21heCA9IE1hdGgubWF4IEB3X21heCwgd19zZWNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBuZC5kc2sgPSBcbiAgICAgICAgICAgICAgICAgICAgcl9zZWM6IHJfc2VjXG4gICAgICAgICAgICAgICAgICAgIHdfc2VjOiB3X3NlY1xuICAgICAgICAgICAgICAgICAgICByX21heDogQHJfbWF4XG4gICAgICAgICAgICAgICAgICAgIHdfbWF4OiBAd19tYXhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZGF0YS5zZW5kIEAsIG5kXG5cbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcblxuY2xhc3MgTW91c2VcbiAgICBcbiAgICBAOiAoQG5hbWU9J21vdXNlJyBAcmVjZWl2ZXJzPVtdKSAtPlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBAbGFzdCA9IERhdGUubm93KClcbiAgICAgICAgQGludGVydmFsID0gcGFyc2VJbnQgMTAwMC82MFxuICAgICAgICBAbGFzdEV2ZW50ID0gbnVsbFxuICAgICAgICBAc2VuZFRpbWVyID0gbnVsbFxuICAgICAgICBcbiAgICBvbkV2ZW50OiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICBAbGFzdEV2ZW50ID0gZXZlbnRcbiAgICAgICAgbm93ID0gRGF0ZS5ub3coKVxuICAgICAgICBjbGVhclRpbWVvdXQgQHNlbmRUaW1lclxuICAgICAgICBAc2VuZFRpbWVyID0gbnVsbFxuICAgICAgICBpZiBub3cgLSBAbGFzdCA+IEBpbnRlcnZhbFxuICAgICAgICAgICAgQGxhc3QgPSBub3dcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcG9zID0ga3BvcyBldmVudFxuICAgICAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICAgICAgcG9zID0ga3BvcyhlbGVjdHJvbi5zY3JlZW4uc2NyZWVuVG9EaXBQb2ludCBwb3MpLnJvdW5kZWQoKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBib3VuZHMgPSByZXF1aXJlICcuL2JvdW5kcydcbiAgICAgICAgICAgIHBvcyA9IHBvcy5jbGFtcCBrcG9zKDAsMCksIGtwb3MgYm91bmRzLnNjcmVlbldpZHRoLCBib3VuZHMuc2NyZWVuSGVpZ2h0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV2ZW50LnggPSBwb3MueFxuICAgICAgICAgICAgZXZlbnQueSA9IHBvcy55XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHBvc3QudG9NYWluIEBuYW1lLCBldmVudFxuICAgICAgICAgICAgZm9yIHJlY2VpdmVyIGluIEByZWNlaXZlcnNcbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIHJlY2VpdmVyLCAnZGF0YScsIGV2ZW50XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzZW5kVGltZXIgPSBzZXRUaW1lb3V0ICg9PiBAb25FdmVudCBAbGFzdEV2ZW50KSwgQGludGVydmFsXG4gICAgICAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG5cbmNsYXNzIEtleWJvYXJkXG4gICAgXG4gICAgQDogKEBuYW1lPSdrZXlib2FyZCcgQHJlY2VpdmVycz1bXSkgLT5cbiAgICAgICAgXG4gICAgb25FdmVudDogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgcG9zdC50b01haW4gQG5hbWUsIGV2ZW50XG4gICAgICAgIGZvciByZWNlaXZlciBpbiBAcmVjZWl2ZXJzXG4gICAgICAgICAgICBwb3N0LnRvV2luIHJlY2VpdmVyLCBAbmFtZSwgZXZlbnRcbiAgICAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4jIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG5cbmNsYXNzIEJvdW5kc1xuICAgIFxuICAgIEA6IChAbmFtZT0nYm91bmRzJyBAcmVjZWl2ZXJzPVtdKSAtPlxuICAgICAgICBcbiAgICAgICAgcG9zdC5vbiAnYm91bmRzJyBAb25Cb3VuZHNcbiAgICAgICAgXG4gICAgICAgIEBsYXN0SW5mb3MgPSBudWxsXG4gICAgICAgIEBvbkJvdW5kcygpXG4gICAgICAgXG4gICAgb25Cb3VuZHM6IChtc2csIGFyZykgPT5cbiAgICAgICAgXG4gICAgICAgIGJvdW5kcyA9IHJlcXVpcmUgJy4vYm91bmRzJ1xuICAgICAgICBpbmZvcyA9IGJvdW5kcy5pbmZvc1xuICAgICAgICBpZiBub3QgXy5pc0VxdWFsIGluZm9zLCBAbGFzdEluZm9zXG4gICAgICAgICAgICBAbGFzdEluZm9zID0gaW5mb3NcbiAgICAgICAgICAgIGZvciByZWNlaXZlciBpbiBAcmVjZWl2ZXJzXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiByZWNlaXZlciwgJ2RhdGEnLCBpbmZvc1xuICAgICAgICAgICAgXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgICAgICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwMDAwMCAgIFxuXG5jbGFzcyBBcHBzXG4gICAgXG4gICAgQDogKEBuYW1lPSdhcHBzJyBAcmVjZWl2ZXJzPVtdKSAtPlxuICAgICAgICBcbiAgICAgICAgQGxhc3RBcHBzID0gbnVsbCAgICAgICAgXG4gICAgICAgIFxuICAgIHN0YXJ0OiA9PiBAZm9yY2UgPSB0cnVlXG4gICAgICAgIFxuICAgIG9uRXZlbnQ6IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIGFwcHMgPSBBcnJheS5mcm9tIG5ldyBTZXQgZXZlbnQucHJvYy5tYXAgKHApIC0+IHAucGF0aFxuICAgICAgICAgXG4gICAgICAgIGFwcHMgPSBhcHBzLmZpbHRlciAocCkgLT4gXG4gICAgICAgICAgICBzID0gc2xhc2gucGF0aCBzbGFzaC5yZW1vdmVEcml2ZSBwIFxuICAgICAgICAgICAgaWYgcy5zdGFydHNXaXRoICcvV2luZG93cy9TeXN0ZW0zMidcbiAgICAgICAgICAgICAgICByZXR1cm4gc2xhc2guYmFzZShzKSBpbiBbJ2NtZCcgJ3Bvd2Vyc2hlbGwnXVxuICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgICBcbiAgICAgICAgYXBwcy5zb3J0KClcbiAgICAgICAgIFxuICAgICAgICBpZiBAZm9yY2Ugb3Igbm90IF8uaXNFcXVhbCBhcHBzLCBAbGFzdEFwcHNcbiAgICAgICAgICAgIGRlbGV0ZSBAZm9yY2VcbiAgICAgICAgICAgIHBvc3QudG9NYWluICdhcHBzJyBhcHBzXG4gICAgICAgICAgICBmb3IgcmVjZWl2ZXIgaW4gQHJlY2VpdmVyc1xuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gcmVjZWl2ZXIsICdkYXRhJywgYXBwc1xuICAgICAgICAgICAgIFxuICAgICAgICAgICAgQGxhc3RBcHBzID0gYXBwc1xuICAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIFxuIyAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG5cbmNsYXNzIFdpbnNcbiAgICBcbiAgICBAOiAoQG5hbWU9J3dpbnMnIEByZWNlaXZlcnM9W10pIC0+XG4gICAgICAgIFxuICAgICAgICBAbGFzdFdpbnMgPSBudWxsXG5cbiAgICBzdGFydDogPT4gQGZvcmNlID0gdHJ1ZVxuICAgIFxuICAgIG9uRXZlbnQ6IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBvcy5wbGF0Zm9ybSgpICE9ICd3aW4zMicgXG4gICAgICAgIFxuICAgICAgICB3aW5zID0gZXZlbnQuaW5mb1xuICAgICAgICBpZiBAZm9yY2Ugb3Igbm90IF8uaXNFcXVhbCB3aW5zLCBAbGFzdFdpbnNcbiAgICAgICAgICAgIGRlbGV0ZSBAZm9yY2VcbiAgICAgICAgICAgIHBvc3QudG9NYWluICd3aW5zJyB3aW5zXG4gICAgICAgICAgICBmb3IgcmVjZWl2ZXIgaW4gQHJlY2VpdmVyc1xuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gcmVjZWl2ZXIsICdkYXRhJywgYXBwc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBAbGFzdFdpbnMgPSB3aW5zXG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IERhdGFcblxuIl19
//# sourceURL=../coffee/data.coffee
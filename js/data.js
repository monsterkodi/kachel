// koffee 1.12.0

/*
0000000     0000000   000000000   0000000 
000   000  000   000     000     000   000
000   000  000000000     000     000000000
000   000  000   000     000     000   000
0000000    000   000     000     000   000
 */
var Apps, Bounds, Clock, Data, Keyboard, Mouse, Sysinfo, Wins, _, childp, electron, empty, klog, kpos, kstr, last, os, post, ref, slash, sysinfo, udp, win, wxw,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf;

ref = require('kxk'), post = ref.post, childp = ref.childp, empty = ref.empty, slash = ref.slash, kstr = ref.kstr, kpos = ref.kpos, last = ref.last, udp = ref.udp, win = ref.win, os = ref.os, klog = ref.klog, _ = ref._;

sysinfo = require('systeminformation');

electron = require('electron');

wxw = require('wxw');

Data = (function() {
    function Data() {
        this.send = bind(this.send, this);
        this.slowTick = bind(this.slowTick, this);
        this.onRequestData = bind(this.onRequestData, this);
        this.onUDP = bind(this.onUDP, this);
        if (os.platform() === 'win32') {
            this.hookProc = wxw('hook', 'proc');
            this.hookInput = wxw('hook', 'input');
            this.hookInfo = wxw('hook', 'info');
        }
        this.providers = {
            mouse: new Mouse,
            keyboard: new Keyboard,
            apps: new Apps,
            wins: new Wins,
            clock: new Clock,
            sysinfo: new Sysinfo
        };
        post.on('requestData', this.onRequestData);
    }

    Data.prototype.start = function() {
        if (this.udp) {
            return;
        }
        this.udp = new udp({
            port: 65432,
            onMsg: this.onUDP
        });
        return setTimeout(this.slowTick, 1000);
    };

    Data.prototype.detach = function() {
        if (os.platform() === 'win32') {
            return wxw('kill', 'wc.exe');
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
            return klog("Data.onRequestData no provider of type " + provider);
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
    function Clock(name1, tick, receivers) {
        this.name = name1 != null ? name1 : 'clock';
        this.tick = tick != null ? tick : 'slow';
        this.receivers = receivers != null ? receivers : [];
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
    function Sysinfo(name1, tick, receivers) {
        var fork;
        this.name = name1 != null ? name1 : 'sysinfo';
        this.tick = tick != null ? tick : 'slow';
        this.receivers = receivers != null ? receivers : [];
        this.onTick = bind(this.onTick, this);
        this.onMessage = bind(this.onMessage, this);
        fork = childp.fork(__dirname + "/memnet");
        fork.on('message', this.onMessage);
    }

    Sysinfo.prototype.onMessage = function(m) {
        return this.data = JSON.parse(m);
    };

    Sysinfo.prototype.onTick = function(data) {
        if (this.data) {
            return data.send(this, this.data);
        }
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
        this.lastApps = null;
    }

    Apps.prototype.onEvent = function(event) {
        var apps, i, len, receiver, ref1;
        apps = Array.from(new Set(event.proc.map(function(p) {
            return p.path;
        })));
        if (empty(last(apps))) {
            apps.pop();
        }
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
        if (!_.isEqual(apps, this.lastApps)) {
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
        this.lastWins = null;
    }

    Wins.prototype.onEvent = function(event) {
        var i, j, len, len1, receiver, ref1, wins;
        wins = event.info;
        if (os.platform() === 'darwin') {
            for (i = 0, len = wins.length; i < len; i++) {
                win = wins[i];
                if (win.index === 0) {
                    win.status += ' top';
                }
            }
        }
        if (empty(last(wins))) {
            wins.pop();
        }
        if (!_.isEqual(wins, this.lastWins)) {
            post.toMain('wins', wins);
            ref1 = this.receivers;
            for (j = 0, len1 = ref1.length; j < len1; j++) {
                receiver = ref1[j];
                post.toWin(receiver, 'data', apps);
            }
            return this.lastWins = wins;
        }
    };

    return Wins;

})();

module.exports = Data;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImRhdGEuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLDJKQUFBO0lBQUE7OztBQVFBLE1BQTBFLE9BQUEsQ0FBUSxLQUFSLENBQTFFLEVBQUUsZUFBRixFQUFRLG1CQUFSLEVBQWdCLGlCQUFoQixFQUF1QixpQkFBdkIsRUFBOEIsZUFBOUIsRUFBb0MsZUFBcEMsRUFBMEMsZUFBMUMsRUFBZ0QsYUFBaEQsRUFBcUQsYUFBckQsRUFBMEQsV0FBMUQsRUFBOEQsZUFBOUQsRUFBb0U7O0FBRXBFLE9BQUEsR0FBVyxPQUFBLENBQVEsbUJBQVI7O0FBQ1gsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLEdBQUEsR0FBVyxPQUFBLENBQVEsS0FBUjs7QUFFTDtJQUVDLGNBQUE7Ozs7O1FBRUMsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsT0FBcEI7WUFDSSxJQUFDLENBQUEsUUFBRCxHQUFhLEdBQUEsQ0FBSSxNQUFKLEVBQVcsTUFBWDtZQUNiLElBQUMsQ0FBQSxTQUFELEdBQWEsR0FBQSxDQUFJLE1BQUosRUFBVyxPQUFYO1lBQ2IsSUFBQyxDQUFBLFFBQUQsR0FBYSxHQUFBLENBQUksTUFBSixFQUFXLE1BQVgsRUFIakI7O1FBS0EsSUFBQyxDQUFBLFNBQUQsR0FDSTtZQUFBLEtBQUEsRUFBWSxJQUFJLEtBQWhCO1lBQ0EsUUFBQSxFQUFZLElBQUksUUFEaEI7WUFFQSxJQUFBLEVBQVksSUFBSSxJQUZoQjtZQUdBLElBQUEsRUFBWSxJQUFJLElBSGhCO1lBSUEsS0FBQSxFQUFZLElBQUksS0FKaEI7WUFLQSxPQUFBLEVBQVksSUFBSSxPQUxoQjs7UUFPSixJQUFJLENBQUMsRUFBTCxDQUFRLGFBQVIsRUFBc0IsSUFBQyxDQUFBLGFBQXZCO0lBZkQ7O21CQWlCSCxLQUFBLEdBQU8sU0FBQTtRQUVILElBQVUs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LEtBQUQsRUFBYyxTQUFkO1FBQUMsSUFBQyxDQUFBLHVCQUFELFFBQU07UUFBTyxJQUFDLENBQUEsZ0NBQUQsWUFBVzs7UUFFeEIsSUFBQyxDQUFBLFFBQUQsR0FBWTtJQUZiOzttQkFJSCxPQUFBLEdBQVMsU0FBQyxLQUFEO0FBRUwsWUFBQTtRQUFBLElBQUEsR0FBTyxLQUFLLENBQUM7UUFFYixJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixRQUFwQjtBQUNJLGlCQUFBLHNDQUFBOztnQkFDSSxJQUFHLEdBQUcsQ0FBQyxLQUFKLEtBQWEsQ0FBaEI7b0JBQ0ksR0FBRyxDQUFDLE1BQUosSUFBYyxPQURsQjs7QUFESixhQURKOztRQUtBLElBQWMsS0FBQSxDQUFNLElBQUEsQ0FBSyxJQUFMLENBQU4sQ0FBZDtZQUFBLElBQUksQ0FBQyxHQUFMLENBQUEsRUFBQTs7UUFDQSxJQUFHLENBQUksQ0FBQyxDQUFDLE9BQUYsQ0FBVSxJQUFWLEVBQWdCLElBQUMsQ0FBQSxRQUFqQixDQUFQO1lBQ0ksSUFBSSxDQUFDLE1BQUwsQ0FBWSxNQUFaLEVBQW1CLElBQW5CO0FBQ0E7QUFBQSxpQkFBQSx3Q0FBQTs7Z0JBQ0ksSUFBSSxDQUFDLEtBQUwsQ0FBVyxRQUFYLEVBQXFCLE1BQXJCLEVBQTRCLElBQTVCO0FBREo7bUJBRUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxLQUpoQjs7SUFWSzs7Ozs7O0FBZ0JiLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwMDAwMCBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMFxuMDAwICAgMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDBcbjAwMDAwMDAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgcG9zdCwgY2hpbGRwLCBlbXB0eSwgc2xhc2gsIGtzdHIsIGtwb3MsIGxhc3QsIHVkcCwgd2luLCBvcywga2xvZywgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5zeXNpbmZvICA9IHJlcXVpcmUgJ3N5c3RlbWluZm9ybWF0aW9uJ1xuZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbnd4dyAgICAgID0gcmVxdWlyZSAnd3h3J1xuXG5jbGFzcyBEYXRhXG5cbiAgICBAOiAtPlxuICAgICAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICBAaG9va1Byb2MgID0gd3h3ICdob29rJyAncHJvYydcbiAgICAgICAgICAgIEBob29rSW5wdXQgPSB3eHcgJ2hvb2snICdpbnB1dCdcbiAgICAgICAgICAgIEBob29rSW5mbyAgPSB3eHcgJ2hvb2snICdpbmZvJ1xuICAgICAgICAgICAgXG4gICAgICAgIEBwcm92aWRlcnMgPSBcbiAgICAgICAgICAgIG1vdXNlOiAgICAgIG5ldyBNb3VzZVxuICAgICAgICAgICAga2V5Ym9hcmQ6ICAgbmV3IEtleWJvYXJkXG4gICAgICAgICAgICBhcHBzOiAgICAgICBuZXcgQXBwc1xuICAgICAgICAgICAgd2luczogICAgICAgbmV3IFdpbnNcbiAgICAgICAgICAgIGNsb2NrOiAgICAgIG5ldyBDbG9jayBcbiAgICAgICAgICAgIHN5c2luZm86ICAgIG5ldyBTeXNpbmZvXG4gICAgICAgIFxuICAgICAgICBwb3N0Lm9uICdyZXF1ZXN0RGF0YScgQG9uUmVxdWVzdERhdGFcbiAgICAgICAgXG4gICAgc3RhcnQ6IC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgQHVkcFxuICAgICAgICBcbiAgICAgICAgQHVkcCA9IG5ldyB1ZHAgcG9ydDo2NTQzMiBvbk1zZzpAb25VRFBcbiAgICAgICAgc2V0VGltZW91dCBAc2xvd1RpY2ssIDEwMDBcbiAgICAgICAgXG4gICAgZGV0YWNoOiAtPlxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgIHd4dyAna2lsbCcgJ3djLmV4ZSdcbiAgICAgICAgIyBlbHNlXG4gICAgICAgICAgICAjIGtsb2cgd3h3ICdraWxsJyAnbWMnXG4gICAgICAgICAgICBcbiAgICBvblVEUDogKG1zZykgPT4gXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggbXNnLmV2ZW50XG4gICAgICAgICAgICB3aGVuICdtb3VzZWRvd24nICdtb3VzZW1vdmUnICdtb3VzZXVwJyAnbW91c2V3aGVlbCcgdGhlbiBAcHJvdmlkZXJzLm1vdXNlLm9uRXZlbnQgbXNnXG4gICAgICAgICAgICB3aGVuICdrZXlkb3duJyAna2V5dXAnIHRoZW4gQHByb3ZpZGVycy5rZXlib2FyZC5vbkV2ZW50IG1zZ1xuICAgICAgICAgICAgd2hlbiAncHJvYycgdGhlbiBAcHJvdmlkZXJzLmFwcHMub25FdmVudCBtc2dcbiAgICAgICAgICAgIHdoZW4gJ2luZm8nIHRoZW4gQHByb3ZpZGVycy53aW5zLm9uRXZlbnQgbXNnXG4gICAgICAgICAgICAjIGVsc2UgbG9nIG1zZ1xuICAgICAgICBcbiAgICBvblJlcXVlc3REYXRhOiAocHJvdmlkZXIsIHdpZCkgPT5cbiAgICAgICAgXG4gICAgICAgICMga2xvZyBcIkRhdGEub25SZXF1ZXN0RGF0YSBwcm92aWRlcjoje2tzdHIgcHJvdmlkZXJ9IHdpZDoje2tzdHIgd2lkfVwiXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgbm90IEBwcm92aWRlcnNbcHJvdmlkZXJdXG4gICAgICAgICAgICByZXR1cm4ga2xvZyBcIkRhdGEub25SZXF1ZXN0RGF0YSBubyBwcm92aWRlciBvZiB0eXBlICN7cHJvdmlkZXJ9XCJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIHdpZCBub3QgaW4gQHByb3ZpZGVyc1twcm92aWRlcl0ucmVjZWl2ZXJzXG4gICAgICAgICAgICBAcHJvdmlkZXJzW3Byb3ZpZGVyXS5yZWNlaXZlcnMucHVzaCB3aWQgXG5cbiAgICBzbG93VGljazogPT5cbiAgICAgICAgXG4gICAgICAgIGZvciBuYW1lLHByb3ZpZGVyIG9mIEBwcm92aWRlcnNcbiAgICAgICAgICAgIGlmIHByb3ZpZGVyLnRpY2sgPT0gJ3Nsb3cnXG4gICAgICAgICAgICAgICAgcHJvdmlkZXIub25UaWNrIEBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgc2V0VGltZW91dCBAc2xvd1RpY2ssIDEwMDAgLSAobmV3IERhdGUpLmdldE1pbGxpc2Vjb25kcygpXG4gICAgICAgIFxuICAgIHNlbmQ6IChwcm92aWRlciwgZGF0YSkgPT5cbiAgICAgICAgXG4gICAgICAgIGZvciByZWNlaXZlciBpbiBwcm92aWRlci5yZWNlaXZlcnNcbiAgICAgICAgICAgIHBvc3QudG9XaW4gcmVjZWl2ZXIsICdkYXRhJyBkYXRhXG4gICAgICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4jICAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuXG5jbGFzcyBDbG9ja1xuICAgICAgICBcbiAgICBAOiAoQG5hbWU9J2Nsb2NrJyBAdGljaz0nc2xvdycgQHJlY2VpdmVycz1bXSkgLT4gXG4gICAgICAgIFxuICAgIG9uVGljazogKGRhdGEpID0+XG4gICAgICAgIFxuICAgICAgICB0aW1lID0gbmV3IERhdGUoKVxuICAgICAgICBcbiAgICAgICAgaG91cnMgICA9IHRpbWUuZ2V0SG91cnMoKVxuICAgICAgICBtaW51dGVzID0gdGltZS5nZXRNaW51dGVzKClcbiAgICAgICAgc2Vjb25kcyA9IHRpbWUuZ2V0U2Vjb25kcygpXG4gICAgICAgIFxuICAgICAgICBob3VyU3RyICAgPSBrc3RyLmxwYWQgaG91cnMsICAgMiAnMCdcbiAgICAgICAgbWludXRlU3RyID0ga3N0ci5scGFkIG1pbnV0ZXMsIDIgJzAnXG4gICAgICAgIHNlY29uZFN0ciA9IGtzdHIubHBhZCBzZWNvbmRzLCAyICcwJ1xuICAgICAgICBcbiAgICAgICAgZGF0YS5zZW5kIEAsXG4gICAgICAgICAgICBob3VyOiAgIGhvdXJzXG4gICAgICAgICAgICBtaW51dGU6IG1pbnV0ZXNcbiAgICAgICAgICAgIHNlY29uZDogc2Vjb25kc1xuICAgICAgICAgICAgc3RyOlxuICAgICAgICAgICAgICAgICAgICBob3VyOiAgIGhvdXJTdHJcbiAgICAgICAgICAgICAgICAgICAgbWludXRlOiBtaW51dGVTdHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kOiBzZWNvbmRTdHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAgICAgMDAwICAgMDAwICBcbiMgICAgICAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMDAwMDAgICBcblxuY2xhc3MgU3lzaW5mb1xuICAgICAgICBcbiAgICBAOiAoQG5hbWU9J3N5c2luZm8nIEB0aWNrPSdzbG93JyBAcmVjZWl2ZXJzPVtdKSAtPlxuICAgICAgICBcbiAgICAgICAgZm9yayA9IGNoaWxkcC5mb3JrIFwiI3tfX2Rpcm5hbWV9L21lbW5ldFwiXG4gICAgICAgIGZvcmsub24gJ21lc3NhZ2UnIEBvbk1lc3NhZ2VcbiAgICAgICAgXG4gICAgb25NZXNzYWdlOiAobSkgPT4gQGRhdGEgPSBKU09OLnBhcnNlIG1cbiAgICAgICAgXG4gICAgb25UaWNrOiAoZGF0YSkgPT4gZGF0YS5zZW5kIEAsIEBkYXRhIGlmIEBkYXRhXG4gICAgICAgIFxuIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIFxuXG5jbGFzcyBNb3VzZVxuICAgIFxuICAgIEA6IChAbmFtZT0nbW91c2UnIEByZWNlaXZlcnM9W10pIC0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBsYXN0ID0gRGF0ZS5ub3coKVxuICAgICAgICBAaW50ZXJ2YWwgPSBwYXJzZUludCAxMDAwLzYwXG4gICAgICAgIEBsYXN0RXZlbnQgPSBudWxsXG4gICAgICAgIEBzZW5kVGltZXIgPSBudWxsXG4gICAgICAgIFxuICAgIG9uRXZlbnQ6IChldmVudCkgPT5cblxuICAgICAgICBAbGFzdEV2ZW50ID0gZXZlbnRcbiAgICAgICAgbm93ID0gRGF0ZS5ub3coKVxuICAgICAgICBjbGVhclRpbWVvdXQgQHNlbmRUaW1lclxuICAgICAgICBAc2VuZFRpbWVyID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgaWYgbm93IC0gQGxhc3QgPiBAaW50ZXJ2YWxcbiAgICAgICAgICAgIEBsYXN0ID0gbm93XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHBvcyA9IGtwb3MgZXZlbnRcbiAgICAgICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgICAgIHBvcyA9IGtwb3MoZWxlY3Ryb24uc2NyZWVuLnNjcmVlblRvRGlwUG9pbnQgcG9zKS5yb3VuZGVkKClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYm91bmRzID0gcmVxdWlyZSAnLi9ib3VuZHMnXG4gICAgICAgICAgICBwb3MgPSBwb3MuY2xhbXAga3BvcygwLDApLCBrcG9zIGJvdW5kcy5zY3JlZW5XaWR0aCwgYm91bmRzLnNjcmVlbkhlaWdodFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBldmVudC54ID0gcG9zLnhcbiAgICAgICAgICAgIGV2ZW50LnkgPSBwb3MueVxuICAgICAgICBcbiAgICAgICAgICAgIHBvc3QudG9NYWluIEBuYW1lLCBldmVudFxuICAgICAgICAgICAgZm9yIHJlY2VpdmVyIGluIEByZWNlaXZlcnNcbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIHJlY2VpdmVyLCAnZGF0YScsIGV2ZW50XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzZW5kVGltZXIgPSBzZXRUaW1lb3V0ICg9PiBAb25FdmVudCBAbGFzdEV2ZW50KSwgQGludGVydmFsXG4gICAgICAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG5cbmNsYXNzIEtleWJvYXJkXG4gICAgXG4gICAgQDogKEBuYW1lPSdrZXlib2FyZCcgQHJlY2VpdmVycz1bXSkgLT5cbiAgICAgICAgXG4gICAgb25FdmVudDogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgcG9zdC50b01haW4gQG5hbWUsIGV2ZW50XG4gICAgICAgIGZvciByZWNlaXZlciBpbiBAcmVjZWl2ZXJzXG4gICAgICAgICAgICBwb3N0LnRvV2luIHJlY2VpdmVyLCBAbmFtZSwgZXZlbnRcbiAgICAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4jIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG5cbmNsYXNzIEJvdW5kc1xuICAgIFxuICAgIEA6IChAbmFtZT0nYm91bmRzJyBAcmVjZWl2ZXJzPVtdKSAtPlxuICAgICAgICBcbiAgICAgICAgcG9zdC5vbiAnYm91bmRzJyBAb25Cb3VuZHNcbiAgICAgICAgXG4gICAgICAgIEBsYXN0SW5mb3MgPSBudWxsXG4gICAgICAgIEBvbkJvdW5kcygpXG4gICAgICAgXG4gICAgb25Cb3VuZHM6IChtc2csIGFyZykgPT5cbiAgICAgICAgXG4gICAgICAgIGJvdW5kcyA9IHJlcXVpcmUgJy4vYm91bmRzJ1xuICAgICAgICBpbmZvcyA9IGJvdW5kcy5pbmZvc1xuICAgICAgICBpZiBub3QgXy5pc0VxdWFsIGluZm9zLCBAbGFzdEluZm9zXG4gICAgICAgICAgICBAbGFzdEluZm9zID0gaW5mb3NcbiAgICAgICAgICAgIGZvciByZWNlaXZlciBpbiBAcmVjZWl2ZXJzXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiByZWNlaXZlciwgJ2RhdGEnLCBpbmZvc1xuICAgICAgICAgICAgXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgICAgICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwMDAwMCAgIFxuXG5jbGFzcyBBcHBzXG4gICAgXG4gICAgQDogKEBuYW1lPSdhcHBzJyBAcmVjZWl2ZXJzPVtdKSAtPlxuICAgICAgICBcbiAgICAgICAgQGxhc3RBcHBzID0gbnVsbCAgICAgICAgXG4gICAgICAgIFxuICAgIG9uRXZlbnQ6IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIGFwcHMgPSBBcnJheS5mcm9tIG5ldyBTZXQgZXZlbnQucHJvYy5tYXAgKHApIC0+IHAucGF0aFxuICAgICAgICBcbiAgICAgICAgYXBwcy5wb3AoKSBpZiBlbXB0eSBsYXN0IGFwcHNcbiAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgYXBwcyA9IGFwcHMuZmlsdGVyIChwKSAtPiBcbiAgICAgICAgICAgICAgICBzID0gc2xhc2gucGF0aCBzbGFzaC5yZW1vdmVEcml2ZSBwIFxuICAgICAgICAgICAgICAgIGlmIHMuc3RhcnRzV2l0aCAnL1dpbmRvd3MvU3lzdGVtMzInXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzbGFzaC5iYXNlKHMpIGluIFsnY21kJyAncG93ZXJzaGVsbCddXG4gICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgICBcbiAgICAgICAgYXBwcy5zb3J0KClcbiAgICAgICAgaWYgbm90IF8uaXNFcXVhbCBhcHBzLCBAbGFzdEFwcHNcbiAgICAgICAgICAgIHBvc3QudG9NYWluICdhcHBzJyBhcHBzXG4gICAgICAgICAgICBmb3IgcmVjZWl2ZXIgaW4gQHJlY2VpdmVyc1xuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gcmVjZWl2ZXIsICdkYXRhJyBhcHBzXG4gICAgICAgICAgICAgXG4gICAgICAgICAgICBAbGFzdEFwcHMgPSBhcHBzXG4gICAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgXG4jIDAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcblxuY2xhc3MgV2luc1xuICAgIFxuICAgIEA6IChAbmFtZT0nd2lucycgQHJlY2VpdmVycz1bXSkgLT5cbiAgICAgICAgXG4gICAgICAgIEBsYXN0V2lucyA9IG51bGxcblxuICAgIG9uRXZlbnQ6IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIHdpbnMgPSBldmVudC5pbmZvXG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICdkYXJ3aW4nXG4gICAgICAgICAgICBmb3Igd2luIGluIHdpbnNcbiAgICAgICAgICAgICAgICBpZiB3aW4uaW5kZXggPT0gMFxuICAgICAgICAgICAgICAgICAgICB3aW4uc3RhdHVzICs9ICcgdG9wJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgd2lucy5wb3AoKSBpZiBlbXB0eSBsYXN0IHdpbnNcbiAgICAgICAgaWYgbm90IF8uaXNFcXVhbCB3aW5zLCBAbGFzdFdpbnNcbiAgICAgICAgICAgIHBvc3QudG9NYWluICd3aW5zJyB3aW5zXG4gICAgICAgICAgICBmb3IgcmVjZWl2ZXIgaW4gQHJlY2VpdmVyc1xuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gcmVjZWl2ZXIsICdkYXRhJyBhcHBzXG4gICAgICAgICAgICBAbGFzdFdpbnMgPSB3aW5zXG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IERhdGFcblxuIl19
//# sourceURL=../coffee/data.coffee
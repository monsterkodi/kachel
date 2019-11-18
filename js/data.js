// koffee 1.4.0

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
        klog("Data.onRequestData provider:" + (kstr(provider)) + " wid:" + (kstr(wid)));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsMkpBQUE7SUFBQTs7O0FBUUEsTUFBMEUsT0FBQSxDQUFRLEtBQVIsQ0FBMUUsRUFBRSxlQUFGLEVBQVEsbUJBQVIsRUFBZ0IsaUJBQWhCLEVBQXVCLGlCQUF2QixFQUE4QixlQUE5QixFQUFvQyxlQUFwQyxFQUEwQyxlQUExQyxFQUFnRCxhQUFoRCxFQUFxRCxhQUFyRCxFQUEwRCxXQUExRCxFQUE4RCxlQUE5RCxFQUFvRTs7QUFFcEUsT0FBQSxHQUFXLE9BQUEsQ0FBUSxtQkFBUjs7QUFDWCxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBQ1gsR0FBQSxHQUFXLE9BQUEsQ0FBUSxLQUFSOztBQUVMO0lBRUMsY0FBQTs7Ozs7UUFFQyxJQUFHLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixPQUFwQjtZQUNJLElBQUMsQ0FBQSxRQUFELEdBQWEsR0FBQSxDQUFJLE1BQUosRUFBVyxNQUFYO1lBQ2IsSUFBQyxDQUFBLFNBQUQsR0FBYSxHQUFBLENBQUksTUFBSixFQUFXLE9BQVg7WUFDYixJQUFDLENBQUEsUUFBRCxHQUFhLEdBQUEsQ0FBSSxNQUFKLEVBQVcsTUFBWCxFQUhqQjs7UUFLQSxJQUFDLENBQUEsU0FBRCxHQUNJO1lBQUEsS0FBQSxFQUFZLElBQUksS0FBaEI7WUFDQSxRQUFBLEVBQVksSUFBSSxRQURoQjtZQUVBLElBQUEsRUFBWSxJQUFJLElBRmhCO1lBR0EsSUFBQSxFQUFZLElBQUksSUFIaEI7WUFJQSxLQUFBLEVBQVksSUFBSSxLQUpoQjtZQUtBLE9BQUEsRUFBWSxJQUFJLE9BTGhCOztRQU9KLElBQUksQ0FBQyxFQUFMLENBQVEsYUFBUixFQUFzQixJQUFDLENBQUEsYUFBdkI7SUFmRDs7bUJBaUJILEtBQUEsR0FBTyxTQUFBO1FBRUgsSUFBVSxJQUFDLENBQUEsR0FBWDtBQUFB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LEVBQXFCLE1BQXJCLEVBQTRCLElBQTVCO0FBREo7bUJBR0EsSUFBQyxDQUFBLFFBQUQsR0FBWSxLQUxoQjs7SUFkSzs7Ozs7O0FBMkJQO0lBRUMsY0FBQyxLQUFELEVBQWMsU0FBZDtRQUFDLElBQUMsQ0FBQSx1QkFBRCxRQUFNO1FBQU8sSUFBQyxDQUFBLGdDQUFELFlBQVc7O1FBRXhCLElBQUMsQ0FBQSxRQUFELEdBQVk7SUFGYjs7bUJBSUgsT0FBQSxHQUFTLFNBQUMsS0FBRDtBQUVMLFlBQUE7UUFBQSxJQUFBLEdBQU8sS0FBSyxDQUFDO1FBRWIsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsUUFBcEI7QUFDSSxpQkFBQSxzQ0FBQTs7Z0JBQ0ksSUFBRyxHQUFHLENBQUMsS0FBSixLQUFhLENBQWhCO29CQUNJLEdBQUcsQ0FBQyxNQUFKLElBQWMsT0FEbEI7O0FBREosYUFESjs7UUFLQSxJQUFjLEtBQUEsQ0FBTSxJQUFBLENBQUssSUFBTCxDQUFOLENBQWQ7WUFBQSxJQUFJLENBQUMsR0FBTCxDQUFBLEVBQUE7O1FBQ0EsSUFBRyxDQUFJLENBQUMsQ0FBQyxPQUFGLENBQVUsSUFBVixFQUFnQixJQUFDLENBQUEsUUFBakIsQ0FBUDtZQUNJLElBQUksQ0FBQyxNQUFMLENBQVksTUFBWixFQUFtQixJQUFuQjtBQUNBO0FBQUEsaUJBQUEsd0NBQUE7O2dCQUNJLElBQUksQ0FBQyxLQUFMLENBQVcsUUFBWCxFQUFxQixNQUFyQixFQUE0QixJQUE1QjtBQURKO21CQUVBLElBQUMsQ0FBQSxRQUFELEdBQVksS0FKaEI7O0lBVks7Ozs7OztBQWdCYixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDBcbjAwMCAgIDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4wMDAwMDAwICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDBcbiMjI1xuXG57IHBvc3QsIGNoaWxkcCwgZW1wdHksIHNsYXNoLCBrc3RyLCBrcG9zLCBsYXN0LCB1ZHAsIHdpbiwgb3MsIGtsb2csIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuc3lzaW5mbyAgPSByZXF1aXJlICdzeXN0ZW1pbmZvcm1hdGlvbidcbmVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG53eHcgICAgICA9IHJlcXVpcmUgJ3d4dydcblxuY2xhc3MgRGF0YVxuXG4gICAgQDogLT5cbiAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgQGhvb2tQcm9jICA9IHd4dyAnaG9vaycgJ3Byb2MnXG4gICAgICAgICAgICBAaG9va0lucHV0ID0gd3h3ICdob29rJyAnaW5wdXQnXG4gICAgICAgICAgICBAaG9va0luZm8gID0gd3h3ICdob29rJyAnaW5mbydcbiAgICAgICAgICAgIFxuICAgICAgICBAcHJvdmlkZXJzID0gXG4gICAgICAgICAgICBtb3VzZTogICAgICBuZXcgTW91c2VcbiAgICAgICAgICAgIGtleWJvYXJkOiAgIG5ldyBLZXlib2FyZFxuICAgICAgICAgICAgYXBwczogICAgICAgbmV3IEFwcHNcbiAgICAgICAgICAgIHdpbnM6ICAgICAgIG5ldyBXaW5zXG4gICAgICAgICAgICBjbG9jazogICAgICBuZXcgQ2xvY2sgXG4gICAgICAgICAgICBzeXNpbmZvOiAgICBuZXcgU3lzaW5mb1xuICAgICAgICBcbiAgICAgICAgcG9zdC5vbiAncmVxdWVzdERhdGEnIEBvblJlcXVlc3REYXRhXG4gICAgICAgIFxuICAgIHN0YXJ0OiAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIEB1ZHBcbiAgICAgICAgXG4gICAgICAgIEB1ZHAgPSBuZXcgdWRwIHBvcnQ6NjU0MzIgb25Nc2c6QG9uVURQXG4gICAgICAgIHNldFRpbWVvdXQgQHNsb3dUaWNrLCAxMDAwXG4gICAgICAgIFxuICAgIGRldGFjaDogLT5cbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICB3eHcgJ2tpbGwnICd3Yy5leGUnXG4gICAgICAgICMgZWxzZVxuICAgICAgICAgICAgIyBrbG9nIHd4dyAna2lsbCcgJ21jJ1xuICAgICAgICAgICAgXG4gICAgb25VRFA6IChtc2cpID0+IFxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIG1zZy5ldmVudFxuICAgICAgICAgICAgd2hlbiAnbW91c2Vkb3duJyAnbW91c2Vtb3ZlJyAnbW91c2V1cCcgJ21vdXNld2hlZWwnIHRoZW4gQHByb3ZpZGVycy5tb3VzZS5vbkV2ZW50IG1zZ1xuICAgICAgICAgICAgd2hlbiAna2V5ZG93bicgJ2tleXVwJyB0aGVuIEBwcm92aWRlcnMua2V5Ym9hcmQub25FdmVudCBtc2dcbiAgICAgICAgICAgIHdoZW4gJ3Byb2MnIHRoZW4gQHByb3ZpZGVycy5hcHBzLm9uRXZlbnQgbXNnXG4gICAgICAgICAgICB3aGVuICdpbmZvJyB0aGVuIEBwcm92aWRlcnMud2lucy5vbkV2ZW50IG1zZ1xuICAgICAgICAgICAgIyBlbHNlIGxvZyBtc2dcbiAgICAgICAgXG4gICAgb25SZXF1ZXN0RGF0YTogKHByb3ZpZGVyLCB3aWQpID0+XG4gICAgICAgIFxuICAgICAgICBrbG9nIFwiRGF0YS5vblJlcXVlc3REYXRhIHByb3ZpZGVyOiN7a3N0ciBwcm92aWRlcn0gd2lkOiN7a3N0ciB3aWR9XCJcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBub3QgQHByb3ZpZGVyc1twcm92aWRlcl1cbiAgICAgICAgICAgIHJldHVybiBrbG9nIFwiRGF0YS5vblJlcXVlc3REYXRhIG5vIHByb3ZpZGVyIG9mIHR5cGUgI3twcm92aWRlcn1cIlxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgd2lkIG5vdCBpbiBAcHJvdmlkZXJzW3Byb3ZpZGVyXS5yZWNlaXZlcnNcbiAgICAgICAgICAgIEBwcm92aWRlcnNbcHJvdmlkZXJdLnJlY2VpdmVycy5wdXNoIHdpZCBcblxuICAgIHNsb3dUaWNrOiA9PlxuICAgICAgICBcbiAgICAgICAgZm9yIG5hbWUscHJvdmlkZXIgb2YgQHByb3ZpZGVyc1xuICAgICAgICAgICAgaWYgcHJvdmlkZXIudGljayA9PSAnc2xvdydcbiAgICAgICAgICAgICAgICBwcm92aWRlci5vblRpY2sgQFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBzZXRUaW1lb3V0IEBzbG93VGljaywgMTAwMCAtIChuZXcgRGF0ZSkuZ2V0TWlsbGlzZWNvbmRzKClcbiAgICAgICAgXG4gICAgc2VuZDogKHByb3ZpZGVyLCBkYXRhKSA9PlxuICAgICAgICBcbiAgICAgICAgZm9yIHJlY2VpdmVyIGluIHByb3ZpZGVyLnJlY2VpdmVyc1xuICAgICAgICAgICAgcG9zdC50b1dpbiByZWNlaXZlciwgJ2RhdGEnIGRhdGFcbiAgICAgICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4jIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICBcbiMgIDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG5cbmNsYXNzIENsb2NrXG4gICAgICAgIFxuICAgIEA6IChAbmFtZT0nY2xvY2snIEB0aWNrPSdzbG93JyBAcmVjZWl2ZXJzPVtdKSAtPiBcbiAgICAgICAgXG4gICAgb25UaWNrOiAoZGF0YSkgPT5cbiAgICAgICAgXG4gICAgICAgIHRpbWUgPSBuZXcgRGF0ZSgpXG4gICAgICAgIFxuICAgICAgICBob3VycyAgID0gdGltZS5nZXRIb3VycygpXG4gICAgICAgIG1pbnV0ZXMgPSB0aW1lLmdldE1pbnV0ZXMoKVxuICAgICAgICBzZWNvbmRzID0gdGltZS5nZXRTZWNvbmRzKClcbiAgICAgICAgXG4gICAgICAgIGhvdXJTdHIgICA9IGtzdHIubHBhZCBob3VycywgICAyICcwJ1xuICAgICAgICBtaW51dGVTdHIgPSBrc3RyLmxwYWQgbWludXRlcywgMiAnMCdcbiAgICAgICAgc2Vjb25kU3RyID0ga3N0ci5scGFkIHNlY29uZHMsIDIgJzAnXG4gICAgICAgIFxuICAgICAgICBkYXRhLnNlbmQgQCxcbiAgICAgICAgICAgIGhvdXI6ICAgaG91cnNcbiAgICAgICAgICAgIG1pbnV0ZTogbWludXRlc1xuICAgICAgICAgICAgc2Vjb25kOiBzZWNvbmRzXG4gICAgICAgICAgICBzdHI6XG4gICAgICAgICAgICAgICAgICAgIGhvdXI6ICAgaG91clN0clxuICAgICAgICAgICAgICAgICAgICBtaW51dGU6IG1pbnV0ZVN0clxuICAgICAgICAgICAgICAgICAgICBzZWNvbmQ6IHNlY29uZFN0clxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMCAgICAwMDAgICAwMDAgIFxuIyAgICAgIDAwMCAgICAgMDAwICAgICAgICAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwMDAwMCAgIFxuXG5jbGFzcyBTeXNpbmZvXG4gICAgICAgIFxuICAgIEA6IChAbmFtZT0nc3lzaW5mbycgQHRpY2s9J3Nsb3cnIEByZWNlaXZlcnM9W10pIC0+XG4gICAgICAgIFxuICAgICAgICBmb3JrID0gY2hpbGRwLmZvcmsgXCIje19fZGlybmFtZX0vbWVtbmV0XCJcbiAgICAgICAgZm9yay5vbiAnbWVzc2FnZScgQG9uTWVzc2FnZVxuICAgICAgICBcbiAgICBvbk1lc3NhZ2U6IChtKSA9PiBAZGF0YSA9IEpTT04ucGFyc2UgbVxuICAgICAgICBcbiAgICBvblRpY2s6IChkYXRhKSA9PiBkYXRhLnNlbmQgQCwgQGRhdGEgaWYgQGRhdGFcbiAgICAgICAgXG4jIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG5cbmNsYXNzIE1vdXNlXG4gICAgXG4gICAgQDogKEBuYW1lPSdtb3VzZScgQHJlY2VpdmVycz1bXSkgLT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQGxhc3QgPSBEYXRlLm5vdygpXG4gICAgICAgIEBpbnRlcnZhbCA9IHBhcnNlSW50IDEwMDAvNjBcbiAgICAgICAgQGxhc3RFdmVudCA9IG51bGxcbiAgICAgICAgQHNlbmRUaW1lciA9IG51bGxcbiAgICAgICAgXG4gICAgb25FdmVudDogKGV2ZW50KSA9PlxuXG4gICAgICAgIEBsYXN0RXZlbnQgPSBldmVudFxuICAgICAgICBub3cgPSBEYXRlLm5vdygpXG4gICAgICAgIGNsZWFyVGltZW91dCBAc2VuZFRpbWVyXG4gICAgICAgIEBzZW5kVGltZXIgPSBudWxsXG4gICAgICAgIFxuICAgICAgICBpZiBub3cgLSBAbGFzdCA+IEBpbnRlcnZhbFxuICAgICAgICAgICAgQGxhc3QgPSBub3dcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcG9zID0ga3BvcyBldmVudFxuICAgICAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICAgICAgcG9zID0ga3BvcyhlbGVjdHJvbi5zY3JlZW4uc2NyZWVuVG9EaXBQb2ludCBwb3MpLnJvdW5kZWQoKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBib3VuZHMgPSByZXF1aXJlICcuL2JvdW5kcydcbiAgICAgICAgICAgIHBvcyA9IHBvcy5jbGFtcCBrcG9zKDAsMCksIGtwb3MgYm91bmRzLnNjcmVlbldpZHRoLCBib3VuZHMuc2NyZWVuSGVpZ2h0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV2ZW50LnggPSBwb3MueFxuICAgICAgICAgICAgZXZlbnQueSA9IHBvcy55XG4gICAgICAgIFxuICAgICAgICAgICAgcG9zdC50b01haW4gQG5hbWUsIGV2ZW50XG4gICAgICAgICAgICBmb3IgcmVjZWl2ZXIgaW4gQHJlY2VpdmVyc1xuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gcmVjZWl2ZXIsICdkYXRhJywgZXZlbnRcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNlbmRUaW1lciA9IHNldFRpbWVvdXQgKD0+IEBvbkV2ZW50IEBsYXN0RXZlbnQpLCBAaW50ZXJ2YWxcbiAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcblxuY2xhc3MgS2V5Ym9hcmRcbiAgICBcbiAgICBAOiAoQG5hbWU9J2tleWJvYXJkJyBAcmVjZWl2ZXJzPVtdKSAtPlxuICAgICAgICBcbiAgICBvbkV2ZW50OiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICBwb3N0LnRvTWFpbiBAbmFtZSwgZXZlbnRcbiAgICAgICAgZm9yIHJlY2VpdmVyIGluIEByZWNlaXZlcnNcbiAgICAgICAgICAgIHBvc3QudG9XaW4gcmVjZWl2ZXIsIEBuYW1lLCBldmVudFxuICAgICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgICAgICAgMDAwICBcbiMgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICBcblxuY2xhc3MgQm91bmRzXG4gICAgXG4gICAgQDogKEBuYW1lPSdib3VuZHMnIEByZWNlaXZlcnM9W10pIC0+XG4gICAgICAgIFxuICAgICAgICBwb3N0Lm9uICdib3VuZHMnIEBvbkJvdW5kc1xuICAgICAgICBcbiAgICAgICAgQGxhc3RJbmZvcyA9IG51bGxcbiAgICAgICAgQG9uQm91bmRzKClcbiAgICAgICBcbiAgICBvbkJvdW5kczogKG1zZywgYXJnKSA9PlxuICAgICAgICBcbiAgICAgICAgYm91bmRzID0gcmVxdWlyZSAnLi9ib3VuZHMnXG4gICAgICAgIGluZm9zID0gYm91bmRzLmluZm9zXG4gICAgICAgIGlmIG5vdCBfLmlzRXF1YWwgaW5mb3MsIEBsYXN0SW5mb3NcbiAgICAgICAgICAgIEBsYXN0SW5mb3MgPSBpbmZvc1xuICAgICAgICAgICAgZm9yIHJlY2VpdmVyIGluIEByZWNlaXZlcnNcbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIHJlY2VpdmVyLCAnZGF0YScsIGluZm9zXG4gICAgICAgICAgICBcbiMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgICAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAwMDAwICAgXG5cbmNsYXNzIEFwcHNcbiAgICBcbiAgICBAOiAoQG5hbWU9J2FwcHMnIEByZWNlaXZlcnM9W10pIC0+XG4gICAgICAgIFxuICAgICAgICBAbGFzdEFwcHMgPSBudWxsICAgICAgICBcbiAgICAgICAgXG4gICAgb25FdmVudDogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgYXBwcyA9IEFycmF5LmZyb20gbmV3IFNldCBldmVudC5wcm9jLm1hcCAocCkgLT4gcC5wYXRoXG4gICAgICAgIFxuICAgICAgICBhcHBzLnBvcCgpIGlmIGVtcHR5IGxhc3QgYXBwc1xuICAgICAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICBhcHBzID0gYXBwcy5maWx0ZXIgKHApIC0+IFxuICAgICAgICAgICAgICAgIHMgPSBzbGFzaC5wYXRoIHNsYXNoLnJlbW92ZURyaXZlIHAgXG4gICAgICAgICAgICAgICAgaWYgcy5zdGFydHNXaXRoICcvV2luZG93cy9TeXN0ZW0zMidcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNsYXNoLmJhc2UocykgaW4gWydjbWQnICdwb3dlcnNoZWxsJ11cbiAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgIFxuICAgICAgICBhcHBzLnNvcnQoKVxuICAgICAgICBpZiBub3QgXy5pc0VxdWFsIGFwcHMsIEBsYXN0QXBwc1xuICAgICAgICAgICAgcG9zdC50b01haW4gJ2FwcHMnIGFwcHNcbiAgICAgICAgICAgIGZvciByZWNlaXZlciBpbiBAcmVjZWl2ZXJzXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiByZWNlaXZlciwgJ2RhdGEnIGFwcHNcbiAgICAgICAgICAgICBcbiAgICAgICAgICAgIEBsYXN0QXBwcyA9IGFwcHNcbiAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiMgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICBcbiMgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuXG5jbGFzcyBXaW5zXG4gICAgXG4gICAgQDogKEBuYW1lPSd3aW5zJyBAcmVjZWl2ZXJzPVtdKSAtPlxuICAgICAgICBcbiAgICAgICAgQGxhc3RXaW5zID0gbnVsbFxuXG4gICAgb25FdmVudDogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgd2lucyA9IGV2ZW50LmluZm9cbiAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ2RhcndpbidcbiAgICAgICAgICAgIGZvciB3aW4gaW4gd2luc1xuICAgICAgICAgICAgICAgIGlmIHdpbi5pbmRleCA9PSAwXG4gICAgICAgICAgICAgICAgICAgIHdpbi5zdGF0dXMgKz0gJyB0b3AnXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICB3aW5zLnBvcCgpIGlmIGVtcHR5IGxhc3Qgd2luc1xuICAgICAgICBpZiBub3QgXy5pc0VxdWFsIHdpbnMsIEBsYXN0V2luc1xuICAgICAgICAgICAgcG9zdC50b01haW4gJ3dpbnMnIHdpbnNcbiAgICAgICAgICAgIGZvciByZWNlaXZlciBpbiBAcmVjZWl2ZXJzXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiByZWNlaXZlciwgJ2RhdGEnIGFwcHNcbiAgICAgICAgICAgIEBsYXN0V2lucyA9IHdpbnNcbiAgICBcbm1vZHVsZS5leHBvcnRzID0gRGF0YVxuXG4iXX0=
//# sourceURL=../coffee/data.coffee
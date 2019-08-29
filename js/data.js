// koffee 1.4.0

/*
0000000     0000000   000000000   0000000 
000   000  000   000     000     000   000
000   000  000000000     000     000000000
000   000  000   000     000     000   000
0000000    000   000     000     000   000
 */
var Apps, Bounds, Clock, Data, Keyboard, Mouse, Sysinfo, Wins, _, childp, electron, empty, klog, kpos, kstr, last, os, post, ref, slash, sysinfo, udp, wxw,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf;

ref = require('kxk'), post = ref.post, slash = ref.slash, childp = ref.childp, empty = ref.empty, kstr = ref.kstr, kpos = ref.kpos, klog = ref.klog, last = ref.last, udp = ref.udp, os = ref.os, _ = ref._;

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
            wins: new Wins
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
            return klog(wxw('kill', 'wc.exe'));
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
        var fork;
        this.name = name1 != null ? name1 : 'sysinfo';
        this.tick = tick != null ? tick : 'slow';
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
        var i, j, len, len1, receiver, ref1, win, wins;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsc0pBQUE7SUFBQTs7O0FBUUEsTUFBcUUsT0FBQSxDQUFRLEtBQVIsQ0FBckUsRUFBRSxlQUFGLEVBQVEsaUJBQVIsRUFBZSxtQkFBZixFQUF1QixpQkFBdkIsRUFBOEIsZUFBOUIsRUFBb0MsZUFBcEMsRUFBMEMsZUFBMUMsRUFBZ0QsZUFBaEQsRUFBc0QsYUFBdEQsRUFBMkQsV0FBM0QsRUFBK0Q7O0FBRS9ELE9BQUEsR0FBVyxPQUFBLENBQVEsbUJBQVI7O0FBQ1gsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLEdBQUEsR0FBVyxPQUFBLENBQVEsS0FBUjs7QUFFTDtJQUVDLGNBQUE7Ozs7O1FBRUMsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsT0FBcEI7WUFDSSxJQUFDLENBQUEsUUFBRCxHQUFhLEdBQUEsQ0FBSSxNQUFKLEVBQVcsTUFBWDtZQUNiLElBQUMsQ0FBQSxTQUFELEdBQWEsR0FBQSxDQUFJLE1BQUosRUFBVyxPQUFYO1lBQ2IsSUFBQyxDQUFBLFFBQUQsR0FBYSxHQUFBLENBQUksTUFBSixFQUFXLE1BQVgsRUFIakI7O1FBS0EsSUFBQyxDQUFBLFNBQUQsR0FDSTtZQUFBLEtBQUEsRUFBVSxJQUFJLEtBQWQ7WUFDQSxRQUFBLEVBQVUsSUFBSSxRQURkO1lBRUEsSUFBQSxFQUFVLElBQUksSUFGZDtZQUdBLElBQUEsRUFBVSxJQUFJLElBSGQ7O1FBS0osSUFBSSxDQUFDLEVBQUwsQ0FBUSxhQUFSLEVBQXNCLElBQUMsQ0FBQSxhQUF2QjtJQWJEOzttQkFlSCxLQUFBLEdBQU8sU0FBQTtRQUVILElBQVUsSUFBQyxDQUFBLEdBQVg7QUFBQSxtQkFBQTs7UUFFQSxJQUFDLENBQUEsR0FBRCxHQUFPLElBQUksR0FBSixDQUFRO1lBQUEsSUFBQSxFQUFLLEtBQUw7WUFB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dUJBQUQsUUFBTTtRQUFPLElBQUMsQ0FBQSxnQ0FBRCxZQUFXOztRQUV4QixJQUFDLENBQUEsUUFBRCxHQUFZO0lBRmI7O21CQUlILE9BQUEsR0FBUyxTQUFDLEtBQUQ7QUFFTCxZQUFBO1FBQUEsSUFBQSxHQUFPLEtBQUssQ0FBQztRQUViLElBQUcsRUFBRSxDQUFDLFFBQUgsQ0FBQSxDQUFBLEtBQWlCLFFBQXBCO0FBQ0ksaUJBQUEsc0NBQUE7O2dCQUNJLElBQUcsR0FBRyxDQUFDLEtBQUosS0FBYSxDQUFoQjtvQkFDSSxHQUFHLENBQUMsTUFBSixJQUFjLE9BRGxCOztBQURKLGFBREo7O1FBS0EsSUFBYyxLQUFBLENBQU0sSUFBQSxDQUFLLElBQUwsQ0FBTixDQUFkO1lBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBQSxFQUFBOztRQUNBLElBQUcsQ0FBSSxDQUFDLENBQUMsT0FBRixDQUFVLElBQVYsRUFBZ0IsSUFBQyxDQUFBLFFBQWpCLENBQVA7WUFDSSxJQUFJLENBQUMsTUFBTCxDQUFZLE1BQVosRUFBbUIsSUFBbkI7QUFDQTtBQUFBLGlCQUFBLHdDQUFBOztnQkFDSSxJQUFJLENBQUMsS0FBTCxDQUFXLFFBQVgsRUFBcUIsTUFBckIsRUFBNEIsSUFBNUI7QUFESjttQkFFQSxJQUFDLENBQUEsUUFBRCxHQUFZLEtBSmhCOztJQVZLOzs7Ozs7QUFnQmIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwIFxuMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4wMDAgICAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4jIyNcblxueyBwb3N0LCBzbGFzaCwgY2hpbGRwLCBlbXB0eSwga3N0ciwga3Bvcywga2xvZywgbGFzdCwgdWRwLCBvcywgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5zeXNpbmZvICA9IHJlcXVpcmUgJ3N5c3RlbWluZm9ybWF0aW9uJ1xuZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbnd4dyAgICAgID0gcmVxdWlyZSAnd3h3J1xuXG5jbGFzcyBEYXRhXG5cbiAgICBAOiAtPlxuICAgICAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICBAaG9va1Byb2MgID0gd3h3ICdob29rJyAncHJvYydcbiAgICAgICAgICAgIEBob29rSW5wdXQgPSB3eHcgJ2hvb2snICdpbnB1dCdcbiAgICAgICAgICAgIEBob29rSW5mbyAgPSB3eHcgJ2hvb2snICdpbmZvJ1xuICAgICAgICAgICAgXG4gICAgICAgIEBwcm92aWRlcnMgPSBcbiAgICAgICAgICAgIG1vdXNlOiAgICBuZXcgTW91c2VcbiAgICAgICAgICAgIGtleWJvYXJkOiBuZXcgS2V5Ym9hcmRcbiAgICAgICAgICAgIGFwcHM6ICAgICBuZXcgQXBwc1xuICAgICAgICAgICAgd2luczogICAgIG5ldyBXaW5zXG4gICAgICAgIFxuICAgICAgICBwb3N0Lm9uICdyZXF1ZXN0RGF0YScgQG9uUmVxdWVzdERhdGFcbiAgICAgICAgXG4gICAgc3RhcnQ6IC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgQHVkcFxuICAgICAgICBcbiAgICAgICAgQHVkcCA9IG5ldyB1ZHAgcG9ydDo2NTQzMiBvbk1zZzpAb25VRFBcbiAgICAgICAgc2V0VGltZW91dCBAc2xvd1RpY2ssIDEwMDBcbiAgICAgICAgXG4gICAgZGV0YWNoOiAtPlxuICAgICAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICBrbG9nIHd4dyAna2lsbCcgJ3djLmV4ZSdcbiAgICAgICAgIyBlbHNlXG4gICAgICAgICAgICAjIGtsb2cgd3h3ICdraWxsJyAnbWMnXG4gICAgICAgICAgICBcbiAgICBvblVEUDogKG1zZykgPT4gXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggbXNnLmV2ZW50XG4gICAgICAgICAgICB3aGVuICdtb3VzZWRvd24nICdtb3VzZW1vdmUnICdtb3VzZXVwJyAnbW91c2V3aGVlbCcgdGhlbiBAcHJvdmlkZXJzLm1vdXNlLm9uRXZlbnQgbXNnXG4gICAgICAgICAgICB3aGVuICdrZXlkb3duJyAna2V5dXAnIHRoZW4gQHByb3ZpZGVycy5rZXlib2FyZC5vbkV2ZW50IG1zZ1xuICAgICAgICAgICAgd2hlbiAncHJvYycgdGhlbiBAcHJvdmlkZXJzLmFwcHMub25FdmVudCBtc2dcbiAgICAgICAgICAgIHdoZW4gJ2luZm8nIHRoZW4gQHByb3ZpZGVycy53aW5zLm9uRXZlbnQgbXNnXG4gICAgICAgICAgICAjIGVsc2UgbG9nIG1zZ1xuICAgICAgICBcbiAgICBvblJlcXVlc3REYXRhOiAocHJvdmlkZXIsIHdpZCkgPT5cbiAgICAgICAgXG4gICAgICAgICMga2xvZyBcIkRhdGEub25SZXF1ZXN0RGF0YSBwcm92aWRlcjoje2tzdHIgcHJvdmlkZXJ9IHdpZDoje2tzdHIgd2lkfVwiXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgbm90IEBwcm92aWRlcnNbcHJvdmlkZXJdXG4gICAgICAgICAgICBAcHJvdmlkZXJzW3Byb3ZpZGVyXSA9IG5ldyB7Y2xvY2s6Q2xvY2ssIHN5c2luZm86U3lzaW5mb31bcHJvdmlkZXJdXG4gICAgICAgICAgICBAcHJvdmlkZXJzW3Byb3ZpZGVyXS5yZWNlaXZlcnMgPSBbXVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIHdpZCBub3QgaW4gQHByb3ZpZGVyc1twcm92aWRlcl0ucmVjZWl2ZXJzXG4gICAgICAgICAgICBAcHJvdmlkZXJzW3Byb3ZpZGVyXS5yZWNlaXZlcnMucHVzaCB3aWQgXG5cbiAgICBzbG93VGljazogPT5cbiAgICAgICAgXG4gICAgICAgIGZvciBuYW1lLHByb3ZpZGVyIG9mIEBwcm92aWRlcnNcbiAgICAgICAgICAgIGlmIHByb3ZpZGVyLnRpY2sgPT0gJ3Nsb3cnXG4gICAgICAgICAgICAgICAgcHJvdmlkZXIub25UaWNrIEBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgc2V0VGltZW91dCBAc2xvd1RpY2ssIDEwMDAgLSAobmV3IERhdGUpLmdldE1pbGxpc2Vjb25kcygpXG4gICAgICAgIFxuICAgIHNlbmQ6IChwcm92aWRlciwgZGF0YSkgPT5cbiAgICAgICAgXG4gICAgICAgIGZvciByZWNlaXZlciBpbiBwcm92aWRlci5yZWNlaXZlcnNcbiAgICAgICAgICAgIHBvc3QudG9XaW4gcmVjZWl2ZXIsICdkYXRhJyBkYXRhXG4gICAgICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4jICAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuXG5jbGFzcyBDbG9ja1xuICAgICAgICBcbiAgICBAOiAoQG5hbWU9J2Nsb2NrJyBAdGljaz0nc2xvdycpIC0+XG4gICAgICAgIFxuICAgIG9uVGljazogKGRhdGEpID0+XG4gICAgICAgIFxuICAgICAgICB0aW1lID0gbmV3IERhdGUoKVxuICAgICAgICBcbiAgICAgICAgaG91cnMgICA9IHRpbWUuZ2V0SG91cnMoKVxuICAgICAgICBtaW51dGVzID0gdGltZS5nZXRNaW51dGVzKClcbiAgICAgICAgc2Vjb25kcyA9IHRpbWUuZ2V0U2Vjb25kcygpXG4gICAgICAgIFxuICAgICAgICBob3VyU3RyICAgPSBrc3RyLmxwYWQgaG91cnMsICAgMiAnMCdcbiAgICAgICAgbWludXRlU3RyID0ga3N0ci5scGFkIG1pbnV0ZXMsIDIgJzAnXG4gICAgICAgIHNlY29uZFN0ciA9IGtzdHIubHBhZCBzZWNvbmRzLCAyICcwJ1xuICAgICAgICBcbiAgICAgICAgZGF0YS5zZW5kIEAsXG4gICAgICAgICAgICBob3VyOiAgIGhvdXJzXG4gICAgICAgICAgICBtaW51dGU6IG1pbnV0ZXNcbiAgICAgICAgICAgIHNlY29uZDogc2Vjb25kc1xuICAgICAgICAgICAgc3RyOlxuICAgICAgICAgICAgICAgICAgICBob3VyOiAgIGhvdXJTdHJcbiAgICAgICAgICAgICAgICAgICAgbWludXRlOiBtaW51dGVTdHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kOiBzZWNvbmRTdHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAgICAgMDAwICAgMDAwICBcbiMgICAgICAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMDAwMDAgICBcblxuY2xhc3MgU3lzaW5mb1xuICAgICAgICBcbiAgICBAOiAoQG5hbWU9J3N5c2luZm8nIEB0aWNrPSdzbG93JykgLT5cbiAgICAgICAgXG4gICAgICAgIGZvcmsgPSBjaGlsZHAuZm9yayBcIiN7X19kaXJuYW1lfS9tZW1uZXRcIlxuICAgICAgICBmb3JrLm9uICdtZXNzYWdlJyBAb25NZXNzYWdlXG4gICAgICAgIFxuICAgIG9uTWVzc2FnZTogKG0pID0+IEBkYXRhID0gSlNPTi5wYXJzZSBtXG4gICAgICAgIFxuICAgIG9uVGljazogKGRhdGEpID0+IGRhdGEuc2VuZCBALCBAZGF0YSBpZiBAZGF0YVxuICAgICAgICBcbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcblxuY2xhc3MgTW91c2VcbiAgICBcbiAgICBAOiAoQG5hbWU9J21vdXNlJyBAcmVjZWl2ZXJzPVtdKSAtPlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBAbGFzdCA9IERhdGUubm93KClcbiAgICAgICAgQGludGVydmFsID0gcGFyc2VJbnQgMTAwMC82MFxuICAgICAgICBAbGFzdEV2ZW50ID0gbnVsbFxuICAgICAgICBAc2VuZFRpbWVyID0gbnVsbFxuICAgICAgICBcbiAgICBvbkV2ZW50OiAoZXZlbnQpID0+XG5cbiAgICAgICAgQGxhc3RFdmVudCA9IGV2ZW50XG4gICAgICAgIG5vdyA9IERhdGUubm93KClcbiAgICAgICAgY2xlYXJUaW1lb3V0IEBzZW5kVGltZXJcbiAgICAgICAgQHNlbmRUaW1lciA9IG51bGxcbiAgICAgICAgXG4gICAgICAgIGlmIG5vdyAtIEBsYXN0ID4gQGludGVydmFsXG4gICAgICAgICAgICBAbGFzdCA9IG5vd1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBwb3MgPSBrcG9zIGV2ZW50XG4gICAgICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgICAgICBwb3MgPSBrcG9zKGVsZWN0cm9uLnNjcmVlbi5zY3JlZW5Ub0RpcFBvaW50IHBvcykucm91bmRlZCgpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGJvdW5kcyA9IHJlcXVpcmUgJy4vYm91bmRzJ1xuICAgICAgICAgICAgcG9zID0gcG9zLmNsYW1wIGtwb3MoMCwwKSwga3BvcyBib3VuZHMuc2NyZWVuV2lkdGgsIGJvdW5kcy5zY3JlZW5IZWlnaHRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXZlbnQueCA9IHBvcy54XG4gICAgICAgICAgICBldmVudC55ID0gcG9zLnlcbiAgICAgICAgXG4gICAgICAgICAgICBwb3N0LnRvTWFpbiBAbmFtZSwgZXZlbnRcbiAgICAgICAgICAgIGZvciByZWNlaXZlciBpbiBAcmVjZWl2ZXJzXG4gICAgICAgICAgICAgICAgcG9zdC50b1dpbiByZWNlaXZlciwgJ2RhdGEnLCBldmVudFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2VuZFRpbWVyID0gc2V0VGltZW91dCAoPT4gQG9uRXZlbnQgQGxhc3RFdmVudCksIEBpbnRlcnZhbFxuICAgICAgICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuXG5jbGFzcyBLZXlib2FyZFxuICAgIFxuICAgIEA6IChAbmFtZT0na2V5Ym9hcmQnIEByZWNlaXZlcnM9W10pIC0+XG4gICAgICAgIFxuICAgIG9uRXZlbnQ6IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIHBvc3QudG9NYWluIEBuYW1lLCBldmVudFxuICAgICAgICBmb3IgcmVjZWl2ZXIgaW4gQHJlY2VpdmVyc1xuICAgICAgICAgICAgcG9zdC50b1dpbiByZWNlaXZlciwgQG5hbWUsIGV2ZW50XG4gICAgICAgIFxuIyAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuIyAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuXG5jbGFzcyBCb3VuZHNcbiAgICBcbiAgICBAOiAoQG5hbWU9J2JvdW5kcycgQHJlY2VpdmVycz1bXSkgLT5cbiAgICAgICAgXG4gICAgICAgIHBvc3Qub24gJ2JvdW5kcycgQG9uQm91bmRzXG4gICAgICAgIFxuICAgICAgICBAbGFzdEluZm9zID0gbnVsbFxuICAgICAgICBAb25Cb3VuZHMoKVxuICAgICAgIFxuICAgIG9uQm91bmRzOiAobXNnLCBhcmcpID0+XG4gICAgICAgIFxuICAgICAgICBib3VuZHMgPSByZXF1aXJlICcuL2JvdW5kcydcbiAgICAgICAgaW5mb3MgPSBib3VuZHMuaW5mb3NcbiAgICAgICAgaWYgbm90IF8uaXNFcXVhbCBpbmZvcywgQGxhc3RJbmZvc1xuICAgICAgICAgICAgQGxhc3RJbmZvcyA9IGluZm9zXG4gICAgICAgICAgICBmb3IgcmVjZWl2ZXIgaW4gQHJlY2VpdmVyc1xuICAgICAgICAgICAgICAgIHBvc3QudG9XaW4gcmVjZWl2ZXIsICdkYXRhJywgaW5mb3NcbiAgICAgICAgICAgIFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAgICAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMDAwMDAgICBcblxuY2xhc3MgQXBwc1xuICAgIFxuICAgIEA6IChAbmFtZT0nYXBwcycgQHJlY2VpdmVycz1bXSkgLT5cbiAgICAgICAgXG4gICAgICAgIEBsYXN0QXBwcyA9IG51bGwgICAgICAgIFxuICAgICAgICBcbiAgICBvbkV2ZW50OiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICBhcHBzID0gQXJyYXkuZnJvbSBuZXcgU2V0IGV2ZW50LnByb2MubWFwIChwKSAtPiBwLnBhdGhcbiAgICAgICAgXG4gICAgICAgIGFwcHMucG9wKCkgaWYgZW1wdHkgbGFzdCBhcHBzXG4gICAgICAgIFxuICAgICAgICBpZiBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgIGFwcHMgPSBhcHBzLmZpbHRlciAocCkgLT4gXG4gICAgICAgICAgICAgICAgcyA9IHNsYXNoLnBhdGggc2xhc2gucmVtb3ZlRHJpdmUgcCBcbiAgICAgICAgICAgICAgICBpZiBzLnN0YXJ0c1dpdGggJy9XaW5kb3dzL1N5c3RlbTMyJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2xhc2guYmFzZShzKSBpbiBbJ2NtZCcgJ3Bvd2Vyc2hlbGwnXVxuICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICAgXG4gICAgICAgIGFwcHMuc29ydCgpXG4gICAgICAgIGlmIG5vdCBfLmlzRXF1YWwgYXBwcywgQGxhc3RBcHBzXG4gICAgICAgICAgICBwb3N0LnRvTWFpbiAnYXBwcycgYXBwc1xuICAgICAgICAgICAgZm9yIHJlY2VpdmVyIGluIEByZWNlaXZlcnNcbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIHJlY2VpdmVyLCAnZGF0YScgYXBwc1xuICAgICAgICAgICAgIFxuICAgICAgICAgICAgQGxhc3RBcHBzID0gYXBwc1xuICAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIFxuIyAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG5cbmNsYXNzIFdpbnNcbiAgICBcbiAgICBAOiAoQG5hbWU9J3dpbnMnIEByZWNlaXZlcnM9W10pIC0+XG4gICAgICAgIFxuICAgICAgICBAbGFzdFdpbnMgPSBudWxsXG5cbiAgICBvbkV2ZW50OiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICB3aW5zID0gZXZlbnQuaW5mb1xuICAgICAgICBcbiAgICAgICAgaWYgb3MucGxhdGZvcm0oKSA9PSAnZGFyd2luJ1xuICAgICAgICAgICAgZm9yIHdpbiBpbiB3aW5zXG4gICAgICAgICAgICAgICAgaWYgd2luLmluZGV4ID09IDBcbiAgICAgICAgICAgICAgICAgICAgd2luLnN0YXR1cyArPSAnIHRvcCdcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHdpbnMucG9wKCkgaWYgZW1wdHkgbGFzdCB3aW5zXG4gICAgICAgIGlmIG5vdCBfLmlzRXF1YWwgd2lucywgQGxhc3RXaW5zXG4gICAgICAgICAgICBwb3N0LnRvTWFpbiAnd2lucycgd2luc1xuICAgICAgICAgICAgZm9yIHJlY2VpdmVyIGluIEByZWNlaXZlcnNcbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIHJlY2VpdmVyLCAnZGF0YScgYXBwc1xuICAgICAgICAgICAgQGxhc3RXaW5zID0gd2luc1xuICAgIFxubW9kdWxlLmV4cG9ydHMgPSBEYXRhXG5cbiJdfQ==
//# sourceURL=../coffee/data.coffee
// koffee 1.3.0

/*
 0000000   00000000   00000000   000      
000   000  000   000  000   000  000      
000000000  00000000   00000000   000      
000   000  000        000        000      
000   000  000        000        0000000
 */
var Appl, Kachel, _, childp, elem, fs, klog, open, post, prefs, ref, slash,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), post = ref.post, childp = ref.childp, prefs = ref.prefs, slash = ref.slash, open = ref.open, klog = ref.klog, elem = ref.elem, fs = ref.fs, _ = ref._;

Kachel = require('./kachel');

Appl = (function(superClass) {
    extend(Appl, superClass);

    function Appl(arg) {
        var ref1;
        this.kachelId = (ref1 = arg.kachelId) != null ? ref1 : 'appl';
        this.onInitData = bind(this.onInitData, this);
        post.on('initData', this.onInitData);
        arguments[0] = _.defaults({kachelId:this.kachelId}, arguments[0]); Appl.__super__.constructor.apply(this, arguments);
    }

    Appl.prototype.onClick = function() {
        klog('onClick appl', this.appPath);
        return open(this.appPath);
    };

    Appl.prototype.onInitData = function(data) {
        var appName, bounds, iconDir, iconPath;
        klog('onInitData', data);
        this.appPath = data.app;
        this.kachelId = 'appl' + this.appPath;
        prefs.set("kacheln:" + this.kachelId + ":data:app", this.appPath);
        prefs.set("kacheln:" + this.kachelId + ":html", 'appl');
        iconDir = slash.join(slash.userData(), 'icons');
        fs.mkdir(iconDir, {
            recursive: true
        });
        appName = slash.base(this.appPath);
        iconPath = iconDir + "/" + appName + ".png";
        if (!slash.isFile(iconPath)) {
            iconPath = this.appIcon(data.app, iconDir);
        }
        if (iconPath) {
            this.main.appendChild(elem('img', {
                "class": 'applicon',
                click: this.openApp,
                src: slash.fileUrl(iconPath)
            }));
        }
        bounds = prefs.get("bounds:" + this.kachelId);
        if (bounds != null) {
            return this.win.setPosition(bounds.x, bounds.y);
        }
    };

    Appl.prototype.appIcon = function(appPath, outDir) {
        var conPath, err, icnsPath, infoPath, obj, pngPath, size, splist;
        size = 110;
        conPath = slash.join(appPath, 'Contents');
        try {
            infoPath = slash.join(conPath, 'Info.plist');
            fs.accessSync(infoPath, fs.R_OK);
            splist = require('simple-plist');
            obj = splist.readFileSync(infoPath);
            if (obj['CFBundleIconFile'] != null) {
                icnsPath = slash.join(slash.dirname(infoPath), 'Resources', obj['CFBundleIconFile']);
                if (!icnsPath.endsWith('.icns')) {
                    icnsPath += ".icns";
                }
                fs.accessSync(icnsPath, fs.R_OK);
                pngPath = slash.resolve(slash.join(outDir, slash.base(appPath) + ".png"));
                childp.execSync("/usr/bin/sips -Z " + size + " -s format png \"" + (slash.escape(icnsPath)) + "\" --out \"" + (slash.escape(pngPath)) + "\"");
                fs.accessSync(pngPath, fs.R_OK);
                return pngPath;
            }
        } catch (error) {
            err = error;
            return console.error(err);
        }
    };

    return Appl;

})(Kachel);

module.exports = Appl;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsc0VBQUE7SUFBQTs7OztBQVFBLE1BQTBELE9BQUEsQ0FBUSxLQUFSLENBQTFELEVBQUUsZUFBRixFQUFRLG1CQUFSLEVBQWdCLGlCQUFoQixFQUF1QixpQkFBdkIsRUFBOEIsZUFBOUIsRUFBb0MsZUFBcEMsRUFBMEMsZUFBMUMsRUFBZ0QsV0FBaEQsRUFBb0Q7O0FBRXBELE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFFSDs7O0lBRUMsY0FBQyxHQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxrREFBUzs7UUFFVixJQUFJLENBQUMsRUFBTCxDQUFRLFVBQVIsRUFBbUIsSUFBQyxDQUFBLFVBQXBCO1FBRUEsMEdBQUEsU0FBQTtJQUpEOzttQkFNSCxPQUFBLEdBQVMsU0FBQTtRQUVMLElBQUEsQ0FBSyxjQUFMLEVBQW9CLElBQUMsQ0FBQSxPQUFyQjtlQUNBLElBQUEsQ0FBSyxJQUFDLENBQUEsT0FBTjtJQUhLOzttQkFLVCxVQUFBLEdBQVksU0FBQyxJQUFEO0FBRVIsWUFBQTtRQUFBLElBQUEsQ0FBSyxZQUFMLEVBQW1CLElBQW5CO1FBQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJLENBQUM7UUFDaEIsSUFBQyxDQUFBLFFBQUQsR0FBWSxNQUFBLEdBQU8sSUFBQyxDQUFBO1FBQ3BCLEtBQUssQ0FBQyxHQUFOLENBQVUsVUFBQSxHQUFXLElBQUMsQ0FBQSxRQUFaLEdBQXFCLFdBQS9CLEVBQTBDLElBQUMsQ0FBQSxPQUEzQztRQUNBLEtBQUssQ0FBQyxHQUFOLENBQVUsVUFBQSxHQUFXLElBQUMsQ0FBQSxRQUFaLEdBQXFCLE9BQS9CLEVBQXNDLE1BQXRDO1FBRUEsT0FBQSxHQUFVLEtBQUssQ0FBQyxJQUFOLENBQVcsS0FBSyxDQUFDLFFBQU4sQ0FBQSxDQUFYLEVBQTZCLE9BQTdCO1FBQ1YsRUFBRSxDQUFDLEtBQUgsQ0FBUyxPQUFULEVBQWtCO1lBQUEsU0FBQSxFQUFVLElBQVY7U0FBbEI7UUFDQSxPQUFBLEdBQVUsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFDLENBQUEsT0FBWjtRQUNWLFFBQUEsR0FBYyxPQUFELEdBQVMsR0FBVCxHQUFZLE9BQVosR0FBb0I7UUFDakMsSUFBRyxDQUFJLEtBQUssQ0FBQyxNQUFOLENBQWEsUUFBYixDQUFQO1lBQ0ksUUFBQSxHQUFXLElBQUMsQ0FBQSxPQUFELENBQVMsSUFBSSxDQUFDLEdBQWQsRUFBbUIsT0FBbkIsRUFEZjs7UUFFQSxJQUFHLFFBQUg7WUFDSSxJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsSUFBQSxDQUFLLEtBQUwsRUFBVztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFVBQU47Z0JBQWlCLEtBQUEsRUFBTSxJQUFDLENBQUEsT0FBeEI7Z0JBQWlDLEdBQUEsRUFBSSxLQUFLLENBQUMsT0FBTixDQUFjLFFBQWQsQ0FBckM7YUFBWCxDQUFsQixFQURKOztRQUdBLE1BQUEsR0FBUyxLQUFLLENBQUMsR0FBTixDQUFVLFNBQUEsR0FBVSxJQUFDLENBQUEsUUFBckI7UUFDVCxJQUFHLGNBQUg7bUJBQ0ksSUFBQyxDQUFBLEdBQUcsQ0FBQyxXQUFMLENBQWlCLE1BQU0sQ0FBQyxDQUF4QixFQUEyQixNQUFNLENBQUMsQ0FBbEMsRUFESjs7SUFsQlE7O21CQXFCWixPQUFBLEdBQVMsU0FBQyxPQUFELEVBQVUsTUFBVjtBQUVMLFlBQUE7UUFBQSxJQUFBLEdBQU87UUFDUCxPQUFBLEdBQVUsS0FBSyxDQUFDLElBQU4sQ0FBVyxPQUFYLEVBQW9CLFVBQXBCO0FBQ1Y7WUFDSSxRQUFBLEdBQVcsS0FBSyxDQUFDLElBQU4sQ0FBVyxPQUFYLEVBQW9CLFlBQXBCO1lBQ1gsRUFBRSxDQUFDLFVBQUgsQ0FBYyxRQUFkLEVBQXdCLEVBQUUsQ0FBQyxJQUEzQjtZQUNBLE1BQUEsR0FBUyxPQUFBLENBQVEsY0FBUjtZQUNULEdBQUEsR0FBTSxNQUFNLENBQUMsWUFBUCxDQUFvQixRQUFwQjtZQUNOLElBQUcsK0JBQUg7Z0JBQ0ksUUFBQSxHQUFXLEtBQUssQ0FBQyxJQUFOLENBQVcsS0FBSyxDQUFDLE9BQU4sQ0FBYyxRQUFkLENBQVgsRUFBb0MsV0FBcEMsRUFBaUQsR0FBSSxDQUFBLGtCQUFBLENBQXJEO2dCQUNYLElBQXVCLENBQUksUUFBUSxDQUFDLFFBQVQsQ0FBa0IsT0FBbEIsQ0FBM0I7b0JBQUEsUUFBQSxJQUFZLFFBQVo7O2dCQUNBLEVBQUUsQ0FBQyxVQUFILENBQWMsUUFBZCxFQUF3QixFQUFFLENBQUMsSUFBM0I7Z0JBQ0EsT0FBQSxHQUFVLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBSyxDQUFDLElBQU4sQ0FBVyxNQUFYLEVBQW1CLEtBQUssQ0FBQyxJQUFOLENBQVcsT0FBWCxDQUFBLEdBQXNCLE1BQXpDLENBQWQ7Z0JBQ1YsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsbUJBQUEsR0FBb0IsSUFBcEIsR0FBeUIsbUJBQXpCLEdBQTJDLENBQUMsS0FBSyxDQUFDLE1BQU4sQ0FBYSxRQUFiLENBQUQsQ0FBM0MsR0FBa0UsYUFBbEUsR0FBOEUsQ0FBQyxLQUFLLENBQUMsTUFBTixDQUFhLE9BQWIsQ0FBRCxDQUE5RSxHQUFvRyxJQUFwSDtnQkFDQSxFQUFFLENBQUMsVUFBSCxDQUFjLE9BQWQsRUFBdUIsRUFBRSxDQUFDLElBQTFCO0FBQ0EsdUJBQU8sUUFQWDthQUxKO1NBQUEsYUFBQTtZQWFNO21CQUNILE9BQUEsQ0FBQyxLQUFELENBQU8sR0FBUCxFQWRIOztJQUpLOzs7O0dBbENNOztBQXNEbkIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgICAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4wMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgICAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMCAgICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwMDAwMCAgXG4jIyNcblxueyBwb3N0LCBjaGlsZHAsIHByZWZzLCBzbGFzaCwgb3Blbiwga2xvZywgZWxlbSwgZnMsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuS2FjaGVsID0gcmVxdWlyZSAnLi9rYWNoZWwnXG5cbmNsYXNzIEFwcGwgZXh0ZW5kcyBLYWNoZWxcbiAgICAgICAgXG4gICAgQDogKEBrYWNoZWxJZDonYXBwbCcpIC0+IFxuICAgIFxuICAgICAgICBwb3N0Lm9uICdpbml0RGF0YScgQG9uSW5pdERhdGFcbiAgICAgICAgXG4gICAgICAgIHN1cGVyXG4gICAgICAgIFxuICAgIG9uQ2xpY2s6IC0+XG4gICAgICAgIFxuICAgICAgICBrbG9nICdvbkNsaWNrIGFwcGwnIEBhcHBQYXRoXG4gICAgICAgIG9wZW4gQGFwcFBhdGhcbiAgICAgICAgXG4gICAgb25Jbml0RGF0YTogKGRhdGEpID0+XG4gICAgICAgIFxuICAgICAgICBrbG9nICdvbkluaXREYXRhJywgZGF0YVxuICAgICAgICBAYXBwUGF0aCA9IGRhdGEuYXBwXG4gICAgICAgIEBrYWNoZWxJZCA9ICdhcHBsJytAYXBwUGF0aFxuICAgICAgICBwcmVmcy5zZXQgXCJrYWNoZWxuOiN7QGthY2hlbElkfTpkYXRhOmFwcFwiIEBhcHBQYXRoXG4gICAgICAgIHByZWZzLnNldCBcImthY2hlbG46I3tAa2FjaGVsSWR9Omh0bWxcIiAnYXBwbCdcbiAgICBcbiAgICAgICAgaWNvbkRpciA9IHNsYXNoLmpvaW4gc2xhc2gudXNlckRhdGEoKSwgJ2ljb25zJ1xuICAgICAgICBmcy5ta2RpciBpY29uRGlyLCByZWN1cnNpdmU6dHJ1ZVxuICAgICAgICBhcHBOYW1lID0gc2xhc2guYmFzZSBAYXBwUGF0aFxuICAgICAgICBpY29uUGF0aCA9IFwiI3tpY29uRGlyfS8je2FwcE5hbWV9LnBuZ1wiXG4gICAgICAgIGlmIG5vdCBzbGFzaC5pc0ZpbGUgaWNvblBhdGhcbiAgICAgICAgICAgIGljb25QYXRoID0gQGFwcEljb24gZGF0YS5hcHAsIGljb25EaXJcbiAgICAgICAgaWYgaWNvblBhdGhcbiAgICAgICAgICAgIEBtYWluLmFwcGVuZENoaWxkIGVsZW0gJ2ltZycgY2xhc3M6J2FwcGxpY29uJyBjbGljazpAb3BlbkFwcCwgc3JjOnNsYXNoLmZpbGVVcmwgaWNvblBhdGhcbiAgICAgICAgICAgIFxuICAgICAgICBib3VuZHMgPSBwcmVmcy5nZXQgXCJib3VuZHM6I3tAa2FjaGVsSWR9XCJcbiAgICAgICAgaWYgYm91bmRzP1xuICAgICAgICAgICAgQHdpbi5zZXRQb3NpdGlvbiBib3VuZHMueCwgYm91bmRzLnlcbiAgICAgICAgXG4gICAgYXBwSWNvbjogKGFwcFBhdGgsIG91dERpcikgLT5cbiAgICAgICAgXG4gICAgICAgIHNpemUgPSAxMTBcbiAgICAgICAgY29uUGF0aCA9IHNsYXNoLmpvaW4gYXBwUGF0aCwgJ0NvbnRlbnRzJ1xuICAgICAgICB0cnlcbiAgICAgICAgICAgIGluZm9QYXRoID0gc2xhc2guam9pbiBjb25QYXRoLCAnSW5mby5wbGlzdCdcbiAgICAgICAgICAgIGZzLmFjY2Vzc1N5bmMgaW5mb1BhdGgsIGZzLlJfT0tcbiAgICAgICAgICAgIHNwbGlzdCA9IHJlcXVpcmUgJ3NpbXBsZS1wbGlzdCdcbiAgICAgICAgICAgIG9iaiA9IHNwbGlzdC5yZWFkRmlsZVN5bmMgaW5mb1BhdGggICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG9ialsnQ0ZCdW5kbGVJY29uRmlsZSddP1xuICAgICAgICAgICAgICAgIGljbnNQYXRoID0gc2xhc2guam9pbiBzbGFzaC5kaXJuYW1lKGluZm9QYXRoKSwgJ1Jlc291cmNlcycsIG9ialsnQ0ZCdW5kbGVJY29uRmlsZSddXG4gICAgICAgICAgICAgICAgaWNuc1BhdGggKz0gXCIuaWNuc1wiIGlmIG5vdCBpY25zUGF0aC5lbmRzV2l0aCAnLmljbnMnXG4gICAgICAgICAgICAgICAgZnMuYWNjZXNzU3luYyBpY25zUGF0aCwgZnMuUl9PSyBcbiAgICAgICAgICAgICAgICBwbmdQYXRoID0gc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIG91dERpciwgc2xhc2guYmFzZShhcHBQYXRoKSArIFwiLnBuZ1wiXG4gICAgICAgICAgICAgICAgY2hpbGRwLmV4ZWNTeW5jIFwiL3Vzci9iaW4vc2lwcyAtWiAje3NpemV9IC1zIGZvcm1hdCBwbmcgXFxcIiN7c2xhc2guZXNjYXBlIGljbnNQYXRofVxcXCIgLS1vdXQgXFxcIiN7c2xhc2guZXNjYXBlIHBuZ1BhdGh9XFxcIlwiXG4gICAgICAgICAgICAgICAgZnMuYWNjZXNzU3luYyBwbmdQYXRoLCBmcy5SX09LXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBuZ1BhdGhcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBlcnJvciBlcnJcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEFwcGwiXX0=
//# sourceURL=../coffee/appl.coffee
// koffee 1.12.0
var $, borderScroll, borderTimer, childp, clamp, createWindow, doScroll, done, drag, dragging, electron, init, karg, klog, kpos, mapRange, offset, onDblClick, onDragMove, onDragStart, onDragStop, onMouseMove, onWheel, os, post, prefs, ref, scale, screenshotFile, screenshotPath, scrollSpeed, slash, start, startScroll, taskbar, transform, wxw;

ref = require('kxk'), childp = ref.childp, post = ref.post, karg = ref.karg, slash = ref.slash, drag = ref.drag, prefs = ref.prefs, clamp = ref.clamp, kpos = ref.kpos, klog = ref.klog, os = ref.os, $ = ref.$;

electron = require('electron');

wxw = require('wxw');

taskbar = false;

screenshotPath = function() {
    return slash.resolve(slash.join(prefs.get('screenhotFolder', slash.resolve("~/Desktop")), 'screenshot.png'));
};

screenshotFile = function() {
    return slash.unslash(screenshotPath());
};

start = function(opt) {
    if (opt == null) {
        opt = {};
    }
    wxw('screenshot', screenshotFile());
    return createWindow(opt);
};

createWindow = function(opt) {
    var data, html, pngFile, ss, win;
    ss = electron.screen.getPrimaryDisplay().size;
    win = new electron.BrowserWindow({
        backgroundColor: '#00000000',
        x: 0,
        y: 0,
        width: ss.width,
        height: ss.height,
        minWidth: ss.width,
        minHeight: ss.height,
        hasShadow: false,
        resizable: false,
        frame: false,
        thickFrame: false,
        fullscreen: false,
        transparent: true,
        preloadWindow: true,
        alwaysOnTop: true,
        enableLargerThanScreen: true,
        acceptFirstMouse: true,
        show: true,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false
        }
    });
    pngFile = slash.fileUrl(screenshotPath());
    html = "<head>\n<style type=\"text/css\">\n    body {\n        overflow:       hidden;\n        margin:         1px;\n        border:         none;\n    }\n    img {\n        image-rendering: pixelated;\n        position:       absolute;\n        left:           0;\n        top:            0;\n        width:          " + ss.width + "px;\n        height:         " + ss.height + "px;\n    }\n</style>\n</head>\n<body>\n<img class=\"screenshot\" tabindex=0 src=\"" + pngFile + "\"/>\n<script>\n    var pth = process.resourcesPath + \"/app/js/zoom.js\";\n    if (process.resourcesPath.indexOf(\"node_modules\\\\electron\\\\dist\\\\resources\")>=0) { pth = process.cwd() + \"/js/zoom.js\"; }\n    else if (process.resourcesPath.indexOf(\"node_modules/electron/dist/Electron.app\")>=0) { pth = process.cwd() + \"/js/zoom.js\"; }\n    //console.log(pth, process.resourcesPath);\n    require(pth).init();\n</script>\n</body>";
    data = "data:text/html;charset=utf-8," + encodeURI(html);
    win.loadURL(data, {
        baseURLForDataURL: slash.fileUrl(__dirname + '/index.html')
    });
    win.debug = opt.debug;
    win.webContents.on('dom-ready', function() {
        var info;
        if (os.platform() === 'win32') {
            info = wxw('info', 'taskbar')[0];
            if (info.status !== 'hidden') {
                return post.toWin(win.id, 'taskbar', true);
            } else {
                return post.toWin(win.id, 'taskbar', false);
            }
        }
    });
    if (opt.debug) {
        win.webContents.openDevTools({
            mode: 'detach'
        });
    }
    return win;
};

done = function() {
    var win;
    win = electron.remote.getCurrentWindow();
    win.close();
    if (window.taskbar) {
        wxw('taskbar', 'show');
    }
    if (win.debug) {
        return electron.remote.app.exit(0);
    }
};

init = function() {
    var a, win;
    post.on('taskbar', function(show) {
        return window.taskbar = show;
    });
    win = electron.remote.getCurrentWindow();
    a = $('.screenshot');
    a.ondblclick = onDblClick;
    a.onmousemove = onMouseMove;
    a.onmousewheel = onWheel;
    a.onkeydown = done;
    if (!win.debug) {
        a.onblur = done;
    }
    new drag({
        target: a,
        onStart: onDragStart,
        onMove: onDragMove,
        onStop: onDragStop
    });
    return a.focus();
};

scale = 1.0;

offset = kpos(0, 0);

dragging = false;

transform = function() {
    var a, ox, oy, ss;
    ss = electron.remote.screen.getPrimaryDisplay().size;
    a = $('.screenshot');
    scale = clamp(1, 20, scale);
    ox = ss.width * (scale - 1) / (2 * scale);
    oy = ss.height * (scale - 1) / (2 * scale);
    offset.x = clamp(-ox, ox, offset.x);
    offset.y = clamp(-oy, oy, offset.y);
    return a.style.transform = "scaleX(" + scale + ") scaleY(" + scale + ") translateX(" + offset.x + "px) translateY(" + offset.y + "px)";
};

onDblClick = function(event) {
    scale = 1;
    return transform();
};

onWheel = function(event) {
    var mp, newPos, newScale, oldPos, scaleFactor, ss;
    scaleFactor = 1 - event.deltaY / 400.0;
    newScale = clamp(1, 20, scale * scaleFactor);
    if (newScale === 1) {
        dragging = false;
    }
    ss = electron.remote.screen.getPrimaryDisplay().size;
    mp = kpos(event).minus(kpos(ss.width, ss.height).times(0.5));
    oldPos = offset.plus(kpos(mp).times(1 / scale));
    newPos = offset.plus(kpos(mp).times(1 / newScale));
    offset.add(newPos.minus(oldPos));
    scale *= scaleFactor;
    return transform();
};

borderTimer = null;

onMouseMove = function(event) {
    if (!borderTimer) {
        return borderScroll();
    }
};

mapRange = function(value, valueRange, targetRange) {
    var clampedValue, relativeValue, targetWidth, valueWidth;
    targetWidth = targetRange[1] - targetRange[0];
    valueWidth = valueRange[1] - valueRange[0];
    clampedValue = clamp(valueRange[0], valueRange[1], value);
    relativeValue = (clampedValue - valueRange[0]) / valueWidth;
    return targetRange[0] + targetWidth * relativeValue;
};

scrollSpeed = 0;

doScroll = function() {
    transform();
    return startScroll();
};

startScroll = function() {
    var ms;
    ms = mapRange(scrollSpeed, [0, 1], [1000 / 10, 1000 / 30]);
    return borderTimer = setTimeout(borderScroll, ms);
};

borderScroll = function() {
    var border, direction, mousePos, scroll, ss;
    clearTimeout(borderTimer);
    borderTimer = null;
    if (dragging) {
        return;
    }
    mousePos = kpos(wxw('mouse'));
    scroll = false;
    border = 200;
    ss = electron.remote.screen.getPrimaryDisplay().size;
    direction = kpos(ss.width, ss.height).times(0.5).to(mousePos).mul(kpos(1 / ss.width, 1 / ss.height)).times(-1);
    if (mousePos.x < border) {
        scrollSpeed = (border - mousePos.x) / border;
        offset.add(direction.times((1.0 + scrollSpeed * 30) / scale));
        scroll = true;
    } else if (mousePos.x > ss.width - border) {
        scrollSpeed = (border - (ss.width - mousePos.x)) / border;
        offset.add(direction.times((1.0 + scrollSpeed * 30) / scale));
        scroll = true;
    }
    if (mousePos.y < border) {
        scrollSpeed = (border - mousePos.y) / border;
        offset.add(direction.times((1.0 + scrollSpeed * 30) / scale));
        scroll = true;
    } else if (mousePos.y > ss.height - border) {
        scrollSpeed = (border - (ss.height - mousePos.y)) / border;
        offset.add(direction.times((1.0 + scrollSpeed * 30) / scale));
        scroll = true;
    }
    if (scroll) {
        return doScroll();
    }
};

onDragStart = function(drag, event) {
    if (event.button !== 0) {
        if (event.button === 1) {
            done();
        }
        return 'skip';
    } else if (scale === 1) {
        done();
        return 'skip';
    }
    return dragging = true;
};

onDragStop = function(drag, event) {};

onDragMove = function(drag, event) {
    offset.add(drag.delta.times(1 / scale));
    return transform();
};

module.exports = {
    start: start,
    init: init
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiem9vbS5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbInpvb20uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFNQSxJQUFBOztBQUFBLE1BQXVFLE9BQUEsQ0FBUSxLQUFSLENBQXZFLEVBQUUsbUJBQUYsRUFBVSxlQUFWLEVBQWdCLGVBQWhCLEVBQXNCLGlCQUF0QixFQUE2QixlQUE3QixFQUFtQyxpQkFBbkMsRUFBMEMsaUJBQTFDLEVBQWlELGVBQWpELEVBQXVELGVBQXZELEVBQTZELFdBQTdELEVBQWlFOztBQUVqRSxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBQ1gsR0FBQSxHQUFXLE9BQUEsQ0FBUSxLQUFSOztBQUVYLE9BQUEsR0FBVzs7QUFFWCxjQUFBLEdBQWlCLFNBQUE7V0FBRyxLQUFLLENBQUMsT0FBTixDQUFjLEtBQUssQ0FBQyxJQUFOLENBQVcsS0FBSyxDQUFDLEdBQU4sQ0FBVSxpQkFBVixFQUE2QixLQUFLLENBQUMsT0FBTixDQUFjLFdBQWQsQ0FBN0IsQ0FBWCxFQUFvRSxnQkFBcEUsQ0FBZDtBQUFIOztBQUNqQixjQUFBLEdBQWlCLFNBQUE7V0FBRyxLQUFLLENBQUMsT0FBTixDQUFjLGNBQUEsQ0FBQSxDQUFkO0FBQUg7O0FBUWpCLEtBQUEsR0FBUSxTQUFDLEdBQUQ7O1FBQUMsTUFBSTs7SUFFVCxHQUFBLENBQUksWUFBSixFQUFpQixjQUFBLENBQUEsQ0FBakI7V0FDQSxZQUFBLENBQWEsR0FBYjtBQUhJOztBQVdSLFlBQUEsR0FBZSxTQUFDLEdBQUQ7QUFFWCxRQUFBO0lBQUEsRUFBQSxHQUFLLFFBQVEsQ0FBQyxNQUFNLENBQUMsaUJBQWhCLENBQUEsQ0FBbUMsQ0FBQztJQUV6QyxHQUFBLEdBQU0sSUFBSSxRQUFRLENBQUMsYUFBYixDQUNGO1FBQUEsZUFBQSxFQUF3QixXQUF4QjtRQUNBLENBQUEsRUFBd0IsQ0FEeEI7UUFFQSxDQUFBLEVBQXdCLENBRnhCO1FBR0EsS0FBQSxFQUF3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Q0FBVCxHQUFhLEVBQUUsQ0FBQyxNQUFILEdBQVUsTUFBMUI7UUFDRCxXQUFBLEdBQWMsQ0FBQyxNQUFBLEdBQU8sQ0FBQyxFQUFFLENBQUMsTUFBSCxHQUFVLFFBQVEsQ0FBQyxDQUFwQixDQUFSLENBQUEsR0FBZ0M7UUFDOUMsTUFBTSxDQUFDLEdBQVAsQ0FBVyxTQUFTLENBQUMsS0FBVixDQUFnQixDQUFDLEdBQUEsR0FBSSxXQUFBLEdBQVksRUFBakIsQ0FBQSxHQUFxQixLQUFyQyxDQUFYO1FBQ0EsTUFBQSxHQUFTLEtBSFI7O0lBS0wsSUFBRyxNQUFIO2VBQ0ksUUFBQSxDQUFBLEVBREo7O0FBbENXOztBQTJDZixXQUFBLEdBQWMsU0FBQyxJQUFELEVBQU8sS0FBUDtJQUVWLElBQUcsS0FBSyxDQUFDLE1BQU4sS0FBZ0IsQ0FBbkI7UUFDSSxJQUFHLEtBQUssQ0FBQyxNQUFOLEtBQWdCLENBQW5CO1lBQ0ksSUFBQSxDQUFBLEVBREo7O0FBRUEsZUFBTyxPQUhYO0tBQUEsTUFJSyxJQUFHLEtBQUEsS0FBUyxDQUFaO1FBQ0QsSUFBQSxDQUFBO0FBQ0EsZUFBTyxPQUZOOztXQUlMLFFBQUEsR0FBVztBQVZEOztBQVlkLFVBQUEsR0FBYSxTQUFDLElBQUQsRUFBTyxLQUFQLEdBQUE7O0FBQ2IsVUFBQSxHQUFhLFNBQUMsSUFBRCxFQUFPLEtBQVA7SUFFVCxNQUFNLENBQUMsR0FBUCxDQUFXLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBWCxDQUFpQixDQUFBLEdBQUUsS0FBbkIsQ0FBWDtXQUNBLFNBQUEsQ0FBQTtBQUhTOztBQUtiLE1BQU0sQ0FBQyxPQUFQLEdBQ0k7SUFBQSxLQUFBLEVBQU0sS0FBTjtJQUNBLElBQUEsRUFBSyxJQURMIiwic291cmNlc0NvbnRlbnQiOlsiIyAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAgICAgIDAwICBcbiMgICAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jICAgMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuIyAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiMgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG5cbnsgY2hpbGRwLCBwb3N0LCBrYXJnLCBzbGFzaCwgZHJhZywgcHJlZnMsIGNsYW1wLCBrcG9zLCBrbG9nLCBvcywgJCB9ID0gcmVxdWlyZSAna3hrJ1xuXG5lbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xud3h3ICAgICAgPSByZXF1aXJlICd3eHcnXG5cbnRhc2tiYXIgID0gZmFsc2Vcblxuc2NyZWVuc2hvdFBhdGggPSAtPiBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gcHJlZnMuZ2V0KCdzY3JlZW5ob3RGb2xkZXInLCBzbGFzaC5yZXNvbHZlIFwifi9EZXNrdG9wXCIpLCAnc2NyZWVuc2hvdC5wbmcnXG5zY3JlZW5zaG90RmlsZSA9IC0+IHNsYXNoLnVuc2xhc2ggc2NyZWVuc2hvdFBhdGgoKVxuICAgIFxuIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgICAwMDAgICAgIFxuIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG5cbnN0YXJ0ID0gKG9wdD17fSkgLT5cbiAgICBcbiAgICB3eHcgJ3NjcmVlbnNob3QnIHNjcmVlbnNob3RGaWxlKClcbiAgICBjcmVhdGVXaW5kb3cgb3B0XG4gICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiMgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAgICAgIDAwICBcblxuY3JlYXRlV2luZG93ID0gKG9wdCkgLT5cbiAgICAgICAgICAgICAgICBcbiAgICBzcyA9IGVsZWN0cm9uLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLnNpemVcbiAgICBcbiAgICB3aW4gPSBuZXcgZWxlY3Ryb24uQnJvd3NlcldpbmRvd1xuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICAgICAgICAnIzAwMDAwMDAwJ1xuICAgICAgICB4OiAgICAgICAgICAgICAgICAgICAgICAwIFxuICAgICAgICB5OiAgICAgICAgICAgICAgICAgICAgICAwIFxuICAgICAgICB3aWR0aDogICAgICAgICAgICAgICAgICBzcy53aWR0aFxuICAgICAgICBoZWlnaHQ6ICAgICAgICAgICAgICAgICBzcy5oZWlnaHRcbiAgICAgICAgbWluV2lkdGg6ICAgICAgICAgICAgICAgc3Mud2lkdGhcbiAgICAgICAgbWluSGVpZ2h0OiAgICAgICAgICAgICAgc3MuaGVpZ2h0XG4gICAgICAgIGhhc1NoYWRvdzogICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgIHJlc2l6YWJsZTogICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgIGZyYW1lOiAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgIHRoaWNrRnJhbWU6ICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgIGZ1bGxzY3JlZW46ICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgIHRyYW5zcGFyZW50OiAgICAgICAgICAgIHRydWVcbiAgICAgICAgcHJlbG9hZFdpbmRvdzogICAgICAgICAgdHJ1ZVxuICAgICAgICBhbHdheXNPblRvcDogICAgICAgICAgICB0cnVlXG4gICAgICAgIGVuYWJsZUxhcmdlclRoYW5TY3JlZW46IHRydWVcbiAgICAgICAgYWNjZXB0Rmlyc3RNb3VzZTogICAgICAgdHJ1ZVxuICAgICAgICBzaG93OiAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgIHdlYlByZWZlcmVuY2VzOlxuICAgICAgICAgICAgbm9kZUludGVncmF0aW9uOiB0cnVlXG4gICAgICAgICAgICB3ZWJTZWN1cml0eTogICAgIGZhbHNlXG4gICAgICAgICAgICBcbiAgICBwbmdGaWxlID0gc2xhc2guZmlsZVVybCBzY3JlZW5zaG90UGF0aCgpXG4gICAgXG4gICAgaHRtbCA9IFwiXCJcIlxuICAgICAgICA8aGVhZD5cbiAgICAgICAgPHN0eWxlIHR5cGU9XCJ0ZXh0L2Nzc1wiPlxuICAgICAgICAgICAgYm9keSB7XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3c6ICAgICAgIGhpZGRlbjtcbiAgICAgICAgICAgICAgICBtYXJnaW46ICAgICAgICAgMXB4O1xuICAgICAgICAgICAgICAgIGJvcmRlcjogICAgICAgICBub25lO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW1nIHtcbiAgICAgICAgICAgICAgICBpbWFnZS1yZW5kZXJpbmc6IHBpeGVsYXRlZDtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogICAgICAgYWJzb2x1dGU7XG4gICAgICAgICAgICAgICAgbGVmdDogICAgICAgICAgIDA7XG4gICAgICAgICAgICAgICAgdG9wOiAgICAgICAgICAgIDA7XG4gICAgICAgICAgICAgICAgd2lkdGg6ICAgICAgICAgICN7c3Mud2lkdGh9cHg7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAgICAgICAgICN7c3MuaGVpZ2h0fXB4O1xuICAgICAgICAgICAgfVxuICAgICAgICA8L3N0eWxlPlxuICAgICAgICA8L2hlYWQ+XG4gICAgICAgIDxib2R5PlxuICAgICAgICA8aW1nIGNsYXNzPVwic2NyZWVuc2hvdFwiIHRhYmluZGV4PTAgc3JjPVwiI3twbmdGaWxlfVwiLz5cbiAgICAgICAgPHNjcmlwdD5cbiAgICAgICAgICAgIHZhciBwdGggPSBwcm9jZXNzLnJlc291cmNlc1BhdGggKyBcIi9hcHAvanMvem9vbS5qc1wiO1xuICAgICAgICAgICAgaWYgKHByb2Nlc3MucmVzb3VyY2VzUGF0aC5pbmRleE9mKFwibm9kZV9tb2R1bGVzXFxcXFxcXFxlbGVjdHJvblxcXFxcXFxcZGlzdFxcXFxcXFxccmVzb3VyY2VzXCIpPj0wKSB7IHB0aCA9IHByb2Nlc3MuY3dkKCkgKyBcIi9qcy96b29tLmpzXCI7IH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHByb2Nlc3MucmVzb3VyY2VzUGF0aC5pbmRleE9mKFwibm9kZV9tb2R1bGVzL2VsZWN0cm9uL2Rpc3QvRWxlY3Ryb24uYXBwXCIpPj0wKSB7IHB0aCA9IHByb2Nlc3MuY3dkKCkgKyBcIi9qcy96b29tLmpzXCI7IH1cbiAgICAgICAgICAgIC8vY29uc29sZS5sb2cocHRoLCBwcm9jZXNzLnJlc291cmNlc1BhdGgpO1xuICAgICAgICAgICAgcmVxdWlyZShwdGgpLmluaXQoKTtcbiAgICAgICAgPC9zY3JpcHQ+XG4gICAgICAgIDwvYm9keT5cbiAgICBcIlwiXCJcblxuICAgIGRhdGEgPSBcImRhdGE6dGV4dC9odG1sO2NoYXJzZXQ9dXRmLTgsXCIgKyBlbmNvZGVVUkkoaHRtbCkgXG4gICAgd2luLmxvYWRVUkwgZGF0YSwgYmFzZVVSTEZvckRhdGFVUkw6c2xhc2guZmlsZVVybCBfX2Rpcm5hbWUgKyAnL2luZGV4Lmh0bWwnXG5cbiAgICB3aW4uZGVidWcgPSBvcHQuZGVidWdcbiAgICBcbiAgICB3aW4ud2ViQ29udGVudHMub24gJ2RvbS1yZWFkeScgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJ1xuICAgICAgICAgICAgaW5mbyA9IHd4dygnaW5mbycgJ3Rhc2tiYXInKVswXVxuICAgICAgICAgICAgaWYgaW5mby5zdGF0dXMgIT0gJ2hpZGRlbidcbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIHdpbi5pZCwgJ3Rhc2tiYXInIHRydWVcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBwb3N0LnRvV2luIHdpbi5pZCwgJ3Rhc2tiYXInIGZhbHNlXG4gICAgICAgIFxuICAgIGlmIG9wdC5kZWJ1ZyB0aGVuIHdpbi53ZWJDb250ZW50cy5vcGVuRGV2VG9vbHMgbW9kZTonZGV0YWNoJ1xuICAgICMgd2luLndlYkNvbnRlbnRzLm9wZW5EZXZUb29scyBtb2RlOidkZXRhY2gnXG5cbiAgICB3aW5cblxuIyAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcblxuZG9uZSA9IC0+IFxuICAgIHdpbiA9IGVsZWN0cm9uLnJlbW90ZS5nZXRDdXJyZW50V2luZG93KClcbiAgICB3aW4uY2xvc2UoKVxuICAgIGlmIHdpbmRvdy50YXNrYmFyXG4gICAgICAgIHd4dyAndGFza2JhcicgJ3Nob3cnXG4gICAgaWYgd2luLmRlYnVnIHRoZW4gZWxlY3Ryb24ucmVtb3RlLmFwcC5leGl0IDBcbiAgICBcbiMgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICAgIFxuIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICAgICBcbmluaXQgPSAtPlxuICAgIFxuICAgIHBvc3Qub24gJ3Rhc2tiYXInIChzaG93KSAtPiB3aW5kb3cudGFza2JhciA9IHNob3dcbiAgICBcbiAgICB3aW4gPSBlbGVjdHJvbi5yZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpXG4gICAgXG4gICAgYSA9JCAnLnNjcmVlbnNob3QnXG4gICAgXG4gICAgYS5vbmRibGNsaWNrICAgPSBvbkRibENsaWNrXG4gICAgYS5vbm1vdXNlbW92ZSAgPSBvbk1vdXNlTW92ZVxuICAgIGEub25tb3VzZXdoZWVsID0gb25XaGVlbFxuICAgIGEub25rZXlkb3duICAgID0gZG9uZVxuICAgIFxuICAgIGlmIG5vdCB3aW4uZGVidWdcbiAgICAgICAgYS5vbmJsdXIgPSBkb25lXG4gICAgICAgIFxuICAgIG5ldyBkcmFnXG4gICAgICAgIHRhcmdldDogIGFcbiAgICAgICAgb25TdGFydDogb25EcmFnU3RhcnRcbiAgICAgICAgb25Nb3ZlOiAgb25EcmFnTW92ZVxuICAgICAgICBvblN0b3A6ICBvbkRyYWdTdG9wXG4gICAgICAgIFxuICAgIGEuZm9jdXMoKVxuXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAgICAgIDAwICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuXG5zY2FsZSAgPSAxLjBcbm9mZnNldCA9IGtwb3MgMCAwXG5kcmFnZ2luZyA9IGZhbHNlXG5cbnRyYW5zZm9ybSA9IC0+XG4gICAgXG4gICAgc3MgPSBlbGVjdHJvbi5yZW1vdGUuc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkuc2l6ZVxuICAgIFxuICAgIGEgPSQgJy5zY3JlZW5zaG90J1xuXG4gICAgc2NhbGUgPSBjbGFtcCAxIDIwIHNjYWxlXG4gICAgXG4gICAgb3ggPSBzcy53aWR0aCAgKiAoc2NhbGUtMSkvKDIqc2NhbGUpXG4gICAgb3kgPSBzcy5oZWlnaHQgKiAoc2NhbGUtMSkvKDIqc2NhbGUpXG4gICAgb2Zmc2V0LnggPSBjbGFtcCAtb3gsIG94LCBvZmZzZXQueFxuICAgIG9mZnNldC55ID0gY2xhbXAgLW95LCBveSwgb2Zmc2V0LnlcbiAgICBcbiAgICBhLnN0eWxlLnRyYW5zZm9ybSA9IFwic2NhbGVYKCN7c2NhbGV9KSBzY2FsZVkoI3tzY2FsZX0pIHRyYW5zbGF0ZVgoI3tvZmZzZXQueH1weCkgdHJhbnNsYXRlWSgje29mZnNldC55fXB4KVwiXG5cbm9uRGJsQ2xpY2sgPSAoZXZlbnQpIC0+IFxuICAgIFxuICAgIHNjYWxlID0gMSBcbiAgICB0cmFuc2Zvcm0oKVxuICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICBcbiMgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgXG5cbm9uV2hlZWwgPSAoZXZlbnQpIC0+XG4gICAgXG4gICAgc2NhbGVGYWN0b3IgPSAxIC0gZXZlbnQuZGVsdGFZIC8gNDAwLjBcbiAgICBuZXdTY2FsZSA9IGNsYW1wIDEgMjAgc2NhbGUgKiBzY2FsZUZhY3RvclxuICAgIGlmIG5ld1NjYWxlID09IDFcbiAgICAgICAgZHJhZ2dpbmcgPSBmYWxzZVxuICAgIFxuICAgIHNzID0gZWxlY3Ryb24ucmVtb3RlLnNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLnNpemVcbiAgICBcbiAgICBtcCA9IGtwb3MoZXZlbnQpLm1pbnVzIGtwb3Moc3Mud2lkdGgsIHNzLmhlaWdodCkudGltZXMgMC41XG4gICAgXG4gICAgb2xkUG9zID0gb2Zmc2V0LnBsdXMga3BvcyhtcCkudGltZXMgMS9zY2FsZVxuICAgIG5ld1BvcyA9IG9mZnNldC5wbHVzIGtwb3MobXApLnRpbWVzIDEvbmV3U2NhbGVcbiAgICBvZmZzZXQuYWRkIG5ld1Bvcy5taW51cyBvbGRQb3NcbiAgICBcbiAgICBzY2FsZSAqPSBzY2FsZUZhY3RvclxuICAgIFxuICAgIHRyYW5zZm9ybSgpXG4gICAgXG5ib3JkZXJUaW1lciA9IG51bGxcbm9uTW91c2VNb3ZlID0gKGV2ZW50KSAtPlxuICAgIGlmIG5vdCBib3JkZXJUaW1lclxuICAgICAgICBib3JkZXJTY3JvbGwoKVxuXG5tYXBSYW5nZSA9ICh2YWx1ZSwgdmFsdWVSYW5nZSwgdGFyZ2V0UmFuZ2UpIC0+XG4gICAgdGFyZ2V0V2lkdGggICA9IHRhcmdldFJhbmdlWzFdIC0gdGFyZ2V0UmFuZ2VbMF1cbiAgICB2YWx1ZVdpZHRoICAgID0gdmFsdWVSYW5nZVsxXSAgLSB2YWx1ZVJhbmdlWzBdXG4gICAgY2xhbXBlZFZhbHVlICA9IGNsYW1wIHZhbHVlUmFuZ2VbMF0sIHZhbHVlUmFuZ2VbMV0sIHZhbHVlXG4gICAgcmVsYXRpdmVWYWx1ZSA9IChjbGFtcGVkVmFsdWUgLSB2YWx1ZVJhbmdlWzBdKSAvIHZhbHVlV2lkdGhcbiAgICB0YXJnZXRSYW5nZVswXSArIHRhcmdldFdpZHRoICogcmVsYXRpdmVWYWx1ZVxuICAgICAgICBcbnNjcm9sbFNwZWVkID0gMFxuZG9TY3JvbGwgPSAtPlxuICAgIHRyYW5zZm9ybSgpXG4gICAgc3RhcnRTY3JvbGwoKVxuICAgIFxuc3RhcnRTY3JvbGwgPSAtPlxuICAgIG1zID0gbWFwUmFuZ2Ugc2Nyb2xsU3BlZWQsIFswIDFdLCBbMTAwMC8xMCAxMDAwLzMwXVxuICAgIGJvcmRlclRpbWVyID0gc2V0VGltZW91dCBib3JkZXJTY3JvbGwsIG1zXG4gIFxuYm9yZGVyU2Nyb2xsID0gLT5cblxuICAgIGNsZWFyVGltZW91dCBib3JkZXJUaW1lclxuICAgIGJvcmRlclRpbWVyID0gbnVsbFxuICAgIFxuICAgIHJldHVybiBpZiBkcmFnZ2luZ1xuICAgIFxuICAgIG1vdXNlUG9zID0ga3BvcyB3eHcgJ21vdXNlJ1xuICAgIFxuICAgIHNjcm9sbCA9IGZhbHNlXG4gICAgYm9yZGVyID0gMjAwXG4gICAgXG4gICAgc3MgPSBlbGVjdHJvbi5yZW1vdGUuc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkuc2l6ZVxuICAgIFxuICAgIGRpcmVjdGlvbiA9IGtwb3Moc3Mud2lkdGgsc3MuaGVpZ2h0KS50aW1lcygwLjUpLnRvKG1vdXNlUG9zKS5tdWwoa3BvcygxL3NzLndpZHRoLDEvc3MuaGVpZ2h0KSkudGltZXMoLTEpXG4gICAgXG4gICAgaWYgbW91c2VQb3MueCA8IGJvcmRlclxuICAgICAgICBzY3JvbGxTcGVlZCA9IChib3JkZXItbW91c2VQb3MueCkvYm9yZGVyXG4gICAgICAgIG9mZnNldC5hZGQgZGlyZWN0aW9uLnRpbWVzICgxLjArc2Nyb2xsU3BlZWQqMzApL3NjYWxlXG4gICAgICAgIHNjcm9sbCA9IHRydWVcbiAgICBlbHNlIGlmIG1vdXNlUG9zLnggPiBzcy53aWR0aC1ib3JkZXJcbiAgICAgICAgc2Nyb2xsU3BlZWQgPSAoYm9yZGVyLShzcy53aWR0aC1tb3VzZVBvcy54KSkvYm9yZGVyXG4gICAgICAgIG9mZnNldC5hZGQgZGlyZWN0aW9uLnRpbWVzICgxLjArc2Nyb2xsU3BlZWQqMzApL3NjYWxlXG4gICAgICAgIHNjcm9sbCA9IHRydWVcbiAgICAgICAgXG4gICAgaWYgbW91c2VQb3MueSA8IGJvcmRlclxuICAgICAgICBzY3JvbGxTcGVlZCA9IChib3JkZXItbW91c2VQb3MueSkvYm9yZGVyXG4gICAgICAgIG9mZnNldC5hZGQgZGlyZWN0aW9uLnRpbWVzICgxLjArc2Nyb2xsU3BlZWQqMzApL3NjYWxlXG4gICAgICAgIHNjcm9sbCA9IHRydWVcbiAgICBlbHNlIGlmIG1vdXNlUG9zLnkgPiBzcy5oZWlnaHQtYm9yZGVyXG4gICAgICAgIHNjcm9sbFNwZWVkID0gKGJvcmRlci0oc3MuaGVpZ2h0LW1vdXNlUG9zLnkpKS9ib3JkZXJcbiAgICAgICAgb2Zmc2V0LmFkZCBkaXJlY3Rpb24udGltZXMgKDEuMCtzY3JvbGxTcGVlZCozMCkvc2NhbGVcbiAgICAgICAgc2Nyb2xsID0gdHJ1ZVxuICAgICAgICBcbiAgICBpZiBzY3JvbGxcbiAgICAgICAgZG9TY3JvbGwoKVxuICAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgIDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuXG5vbkRyYWdTdGFydCA9IChkcmFnLCBldmVudCkgLT4gXG4gICAgXG4gICAgaWYgZXZlbnQuYnV0dG9uICE9IDBcbiAgICAgICAgaWYgZXZlbnQuYnV0dG9uID09IDFcbiAgICAgICAgICAgIGRvbmUoKVxuICAgICAgICByZXR1cm4gJ3NraXAnXG4gICAgZWxzZSBpZiBzY2FsZSA9PSAxXG4gICAgICAgIGRvbmUoKVxuICAgICAgICByZXR1cm4gJ3NraXAnXG4gICAgICAgIFxuICAgIGRyYWdnaW5nID0gdHJ1ZVxuICAgIFxub25EcmFnU3RvcCA9IChkcmFnLCBldmVudCkgLT4gIyBkcmFnZ2luZyA9IGZhbHNlXG5vbkRyYWdNb3ZlID0gKGRyYWcsIGV2ZW50KSAtPiBcbiAgICBcbiAgICBvZmZzZXQuYWRkIGRyYWcuZGVsdGEudGltZXMgMS9zY2FsZVxuICAgIHRyYW5zZm9ybSgpXG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IFxuICAgIHN0YXJ0OnN0YXJ0XG4gICAgaW5pdDppbml0XG4gICAgXG4gICAgIl19
//# sourceURL=../coffee/zoom.coffee
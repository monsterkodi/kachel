// koffee 1.4.0

/*
00000000  000   000  00000000  00000000  000  000   000  0000000  
000        000 000   000       000       000  0000  000  000   000
0000000     00000    0000000   000000    000  000 0 000  000   000
000        000 000   000       000       000  000  0000  000   000
00000000  000   000  00000000  000       000  000   000  0000000
 */
var _, exeFind, klog, post, prefs, ref, slash, walkdir,
    indexOf = [].indexOf;

ref = require('kxk'), post = ref.post, slash = ref.slash, prefs = ref.prefs, walkdir = ref.walkdir, klog = ref.klog, _ = ref._;

exeFind = function(appCB, doneCB) {
    var app, apps, dirs, exeFolder, foldersLeft, i, ignore, ignoreDefaults, ignoredByName, ignoredByPath, len, pth, results, walk, walkOpt;
    apps = {
        cmd: 'C:/Windows/System32/cmd.exe',
        calc: 'C:/Windows/System32/calc.exe',
        Taskmgr: 'C:/Windows/System32/Taskmgr.exe',
        regedit: 'C:/Windows/regedit.exe',
        explorer: 'C:/Windows/explorer.exe',
        powershell: 'C:/Windows/System32/WindowsPowerShell/v1.0/powershell.exe'
    };
    dirs = _.clone(prefs.get('dirs', []));
    for (app in apps) {
        pth = apps[app];
        if (typeof appCB === "function") {
            appCB(pth);
        }
    }
    dirs.push("C:/Program Files");
    dirs.push("C:/Program Files (x86)");
    dirs.push(slash.resolve('~/AppData/Local'));
    dirs.push(slash.resolve('~/'));
    ignoreDefaults = require('../bin/ignore');
    ignoredByName = function(file) {
        var contains, i, j, k, len, len1, len2, match, ref1, ref2, ref3, start;
        file = file.toLowerCase();
        ref1 = ignoreDefaults.startsWith;
        for (i = 0, len = ref1.length; i < len; i++) {
            start = ref1[i];
            if (file.startsWith(start)) {
                return true;
            }
        }
        ref2 = ignoreDefaults.contains;
        for (j = 0, len1 = ref2.length; j < len1; j++) {
            contains = ref2[j];
            if (file.indexOf(contains) >= 0) {
                return true;
            }
        }
        ref3 = ignoreDefaults.matches;
        for (k = 0, len2 = ref3.length; k < len2; k++) {
            match = ref3[k];
            if (file === match) {
                return true;
            }
        }
        return false;
    };
    ignoredByPath = function(file) {
        var i, len, path, ref1;
        ref1 = ignoreDefaults.path;
        for (i = 0, len = ref1.length; i < len; i++) {
            path = ref1[i];
            if (file.indexOf(path) >= 0) {
                return true;
            }
        }
        return false;
    };
    ignore = prefs.get('ignore', []);
    foldersLeft = dirs.length;
    results = [];
    for (i = 0, len = dirs.length; i < len; i++) {
        exeFolder = dirs[i];
        walkOpt = prefs.get('walk', {
            no_recurse: false,
            max_depth: 4
        });
        walk = walkdir(slash.resolve(exeFolder), walkOpt);
        walk.on('error', function(err) {
            post.toWins('mainlog', "walk error " + err.stack);
            return console.log("[ERROR] findExes -- " + err);
        });
        walk.on('end', function() {
            foldersLeft -= 1;
            if (foldersLeft === 0) {
                return typeof doneCB === "function" ? doneCB(apps) : void 0;
            }
        });
        results.push(walk.on('file', function(file) {
            var name;
            file = slash.resolve(file);
            if (slash.ext(file) === 'exe') {
                name = slash.base(file);
                if (indexOf.call(ignore, file) < 0 && !ignoredByName(name) && !ignoredByPath(file)) {
                    if (apps[name] == null) {
                        if (typeof appCB === "function") {
                            appCB(file);
                        }
                        return apps[name] = file;
                    }
                }
            }
        }));
    }
    return results;
};

module.exports = exeFind;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhlZmluZC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsa0RBQUE7SUFBQTs7QUFRQSxNQUEyQyxPQUFBLENBQVEsS0FBUixDQUEzQyxFQUFFLGVBQUYsRUFBUSxpQkFBUixFQUFlLGlCQUFmLEVBQXNCLHFCQUF0QixFQUErQixlQUEvQixFQUFxQzs7QUFFckMsT0FBQSxHQUFVLFNBQUMsS0FBRCxFQUFRLE1BQVI7QUFFTixRQUFBO0lBQUEsSUFBQSxHQUNJO1FBQUEsR0FBQSxFQUFZLDZCQUFaO1FBQ0EsSUFBQSxFQUFZLDhCQURaO1FBRUEsT0FBQSxFQUFZLGlDQUZaO1FBR0EsT0FBQSxFQUFZLHdCQUhaO1FBSUEsUUFBQSxFQUFZLHlCQUpaO1FBS0EsVUFBQSxFQUFZLDJEQUxaOztJQU9KLElBQUEsR0FBTyxDQUFDLENBQUMsS0FBRixDQUFRLEtBQUssQ0FBQyxHQUFOLENBQVUsTUFBVixFQUFpQixFQUFqQixDQUFSO0FBRVAsU0FBQSxXQUFBOzs7WUFDSSxNQUFPOztBQURYO0lBR0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxrQkFBVjtJQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsd0JBQVY7SUFDQSxJQUFJLENBQUMsSUFBTCxDQUFVLEtBQUssQ0FBQyxPQUFOLENBQWMsaUJBQWQsQ0FBVjtJQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFkLENBQVY7SUFFQSxjQUFBLEdBQWlCLE9BQUEsQ0FBUSxlQUFSO0lBRWpCLGFBQUEsR0FBZ0IsU0FBQyxJQUFEO0FBQ1osWUFBQTtRQUFBLElBQUEsR0FBTyxJQUFJLENBQUMsV0FBTCxDQUFBO0FBQ1A7QUFBQSxhQUFBLHNDQUFBOztZQUNJLElBQWUsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsS0FBaEIsQ0FBZjtBQUFBLHVCQUFPLEtBQVA7O0FBREo7QUFFQTtBQUFBLGFBQUEsd0NBQUE7O1lBQ0ksSUFBZSxJQUFJLENBQUMsT0FBTCxDQUFhLFFBQWIsQ0FBQSxJQUEwQixDQUF6QztBQUFBLHVCQUFPLEtBQVA7O0FBREo7QUFFQTtBQUFBLGFBQUEsd0NBQUE7O1lBQ0ksSUFBZSxJQUFBLEtBQVEsS0FBdkI7QUFBQSx1QkFBTyxLQUFQOztBQURKO2VBRUE7SUFSWTtJQVVoQixhQUFBLEdBQWdCLFNBQUMsSUFBRDtBQUNaLFlBQUE7QUFBQTtBQUFBLGFBQUEsc0NBQUE7O1lBQ0ksSUFBZSxJQUFJLENBQUMsT0FBTCxDQUFhLElBQWIsQ0FBQSxJQUFzQixDQUFyQztBQUFBLHVCQUFPLEtBQVA7O0FBREo7ZUFFQTtJQUhZO0lBS2hCLE1BQUEsR0FBUyxLQUFLLENBQUMsR0FBTixDQUFVLFFBQVYsRUFBbUIsRUFBbkI7SUFDVCxXQUFBLEdBQWMsSUFBSSxDQUFDO0FBRW5CO1NBQUEsc0NBQUE7O1FBRUksT0FBQSxHQUFVLEtBQUssQ0FBQyxHQUFOLENBQVUsTUFBVixFQUFpQjtZQUFBLFVBQUEsRUFBWSxLQUFaO1lBQWtCLFNBQUEsRUFBVyxDQUE3QjtTQUFqQjtRQUNWLElBQUEsR0FBTyxPQUFBLENBQVEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxTQUFkLENBQVIsRUFBa0MsT0FBbEM7UUFFUCxJQUFJLENBQUMsRUFBTCxDQUFRLE9BQVIsRUFBZ0IsU0FBQyxHQUFEO1lBQ1osSUFBSSxDQUFDLE1BQUwsQ0FBWSxTQUFaLEVBQXNCLGFBQUEsR0FBYyxHQUFHLENBQUMsS0FBeEM7bUJBQStDLE9BQUEsQ0FDL0MsR0FEK0MsQ0FDM0Msc0JBQUEsR0FBdUIsR0FEb0I7UUFEbkMsQ0FBaEI7UUFJQSxJQUFJLENBQUMsRUFBTCxDQUFRLEtBQVIsRUFBYyxTQUFBO1lBRVYsV0FBQSxJQUFlO1lBQ2YsSUFBRyxXQUFBLEtBQWUsQ0FBbEI7c0RBRUksT0FBUSxlQUZaOztRQUhVLENBQWQ7cUJBT0EsSUFBSSxDQUFDLEVBQUwsQ0FBUSxNQUFSLEVBQWUsU0FBQyxJQUFEO0FBRVgsZ0JBQUE7WUFBQSxJQUFBLEdBQU8sS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFkO1lBQ1AsSUFBRyxLQUFLLENBQUMsR0FBTixDQUFVLElBQVYsQ0FBQSxLQUFtQixLQUF0QjtnQkFDSSxJQUFBLEdBQU8sS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFYO2dCQUNQLElBQUcsYUFBWSxNQUFaLEVBQUEsSUFBQSxLQUFBLElBQXVCLENBQUksYUFBQSxDQUFjLElBQWQsQ0FBM0IsSUFBbUQsQ0FBSSxhQUFBLENBQWMsSUFBZCxDQUExRDtvQkFDSSxJQUFPLGtCQUFQOzs0QkFDSSxNQUFPOzsrQkFDUCxJQUFLLENBQUEsSUFBQSxDQUFMLEdBQWEsS0FGakI7cUJBREo7aUJBRko7O1FBSFcsQ0FBZjtBQWhCSjs7QUF4Q007O0FBa0VWLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICBcbjAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwXG4wMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDBcbjAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIFxuIyMjXG5cbnsgcG9zdCwgc2xhc2gsIHByZWZzLCB3YWxrZGlyLCBrbG9nLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbmV4ZUZpbmQgPSAoYXBwQ0IsIGRvbmVDQikgLT5cblxuICAgIGFwcHMgPSBcbiAgICAgICAgY21kOiAgICAgICAgJ0M6L1dpbmRvd3MvU3lzdGVtMzIvY21kLmV4ZSdcbiAgICAgICAgY2FsYzogICAgICAgJ0M6L1dpbmRvd3MvU3lzdGVtMzIvY2FsYy5leGUnXG4gICAgICAgIFRhc2ttZ3I6ICAgICdDOi9XaW5kb3dzL1N5c3RlbTMyL1Rhc2ttZ3IuZXhlJ1xuICAgICAgICByZWdlZGl0OiAgICAnQzovV2luZG93cy9yZWdlZGl0LmV4ZSdcbiAgICAgICAgZXhwbG9yZXI6ICAgJ0M6L1dpbmRvd3MvZXhwbG9yZXIuZXhlJ1xuICAgICAgICBwb3dlcnNoZWxsOiAnQzovV2luZG93cy9TeXN0ZW0zMi9XaW5kb3dzUG93ZXJTaGVsbC92MS4wL3Bvd2Vyc2hlbGwuZXhlJ1xuXG4gICAgZGlycyA9IF8uY2xvbmUgcHJlZnMuZ2V0ICdkaXJzJyBbXVxuXG4gICAgZm9yIGFwcCwgcHRoIG9mIGFwcHNcbiAgICAgICAgYXBwQ0I/IHB0aFxuICAgIFxuICAgIGRpcnMucHVzaCBcIkM6L1Byb2dyYW0gRmlsZXNcIlxuICAgIGRpcnMucHVzaCBcIkM6L1Byb2dyYW0gRmlsZXMgKHg4NilcIlxuICAgIGRpcnMucHVzaCBzbGFzaC5yZXNvbHZlICd+L0FwcERhdGEvTG9jYWwnXG4gICAgZGlycy5wdXNoIHNsYXNoLnJlc29sdmUgJ34vJ1xuXG4gICAgaWdub3JlRGVmYXVsdHMgPSByZXF1aXJlICcuLi9iaW4vaWdub3JlJ1xuXG4gICAgaWdub3JlZEJ5TmFtZSA9IChmaWxlKSAtPlxuICAgICAgICBmaWxlID0gZmlsZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGZvciBzdGFydCBpbiBpZ25vcmVEZWZhdWx0cy5zdGFydHNXaXRoXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZSBpZiBmaWxlLnN0YXJ0c1dpdGggc3RhcnRcbiAgICAgICAgZm9yIGNvbnRhaW5zIGluIGlnbm9yZURlZmF1bHRzLmNvbnRhaW5zXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZSBpZiBmaWxlLmluZGV4T2YoY29udGFpbnMpID49IDBcbiAgICAgICAgZm9yIG1hdGNoIGluIGlnbm9yZURlZmF1bHRzLm1hdGNoZXNcbiAgICAgICAgICAgIHJldHVybiB0cnVlIGlmIGZpbGUgPT0gbWF0Y2hcbiAgICAgICAgZmFsc2VcbiAgICAgICAgXG4gICAgaWdub3JlZEJ5UGF0aCA9IChmaWxlKSAtPlxuICAgICAgICBmb3IgcGF0aCBpbiBpZ25vcmVEZWZhdWx0cy5wYXRoXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZSBpZiBmaWxlLmluZGV4T2YocGF0aCkgPj0gMFxuICAgICAgICBmYWxzZVxuICAgICAgICAgICAgXG4gICAgaWdub3JlID0gcHJlZnMuZ2V0ICdpZ25vcmUnIFtdXG4gICAgZm9sZGVyc0xlZnQgPSBkaXJzLmxlbmd0aFxuXG4gICAgZm9yIGV4ZUZvbGRlciBpbiBkaXJzXG4gICAgICAgIFxuICAgICAgICB3YWxrT3B0ID0gcHJlZnMuZ2V0ICd3YWxrJyBub19yZWN1cnNlOiBmYWxzZSBtYXhfZGVwdGg6IDRcbiAgICAgICAgd2FsayA9IHdhbGtkaXIgc2xhc2gucmVzb2x2ZShleGVGb2xkZXIpLCB3YWxrT3B0XG5cbiAgICAgICAgd2Fsay5vbiAnZXJyb3InIChlcnIpIC0+IFxuICAgICAgICAgICAgcG9zdC50b1dpbnMgJ21haW5sb2cnIFwid2FsayBlcnJvciAje2Vyci5zdGFja31cIlxuICAgICAgICAgICAgbG9nIFwiW0VSUk9SXSBmaW5kRXhlcyAtLSAje2Vycn1cIlxuXG4gICAgICAgIHdhbGsub24gJ2VuZCcgLT5cblxuICAgICAgICAgICAgZm9sZGVyc0xlZnQgLT0gMVxuICAgICAgICAgICAgaWYgZm9sZGVyc0xlZnQgPT0gMFxuICAgICAgICAgICAgICAgICMga2xvZyAnYXBwcycgYXBwc1xuICAgICAgICAgICAgICAgIGRvbmVDQj8gYXBwc1xuXG4gICAgICAgIHdhbGsub24gJ2ZpbGUnIChmaWxlKSAtPlxuXG4gICAgICAgICAgICBmaWxlID0gc2xhc2gucmVzb2x2ZSBmaWxlXG4gICAgICAgICAgICBpZiBzbGFzaC5leHQoZmlsZSkgPT0gJ2V4ZSdcbiAgICAgICAgICAgICAgICBuYW1lID0gc2xhc2guYmFzZSBmaWxlXG4gICAgICAgICAgICAgICAgaWYgZmlsZSBub3QgaW4gaWdub3JlIGFuZCBub3QgaWdub3JlZEJ5TmFtZShuYW1lKSBhbmQgbm90IGlnbm9yZWRCeVBhdGgoZmlsZSlcbiAgICAgICAgICAgICAgICAgICAgaWYgbm90IGFwcHNbbmFtZV0/XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHBDQj8gZmlsZVxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwc1tuYW1lXSA9IGZpbGVcblxubW9kdWxlLmV4cG9ydHMgPSBleGVGaW5kXG4iXX0=
//# sourceURL=../coffee/exefind.coffee
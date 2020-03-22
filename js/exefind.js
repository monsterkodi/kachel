// koffee 1.12.0

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhlZmluZC5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImV4ZWZpbmQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLGtEQUFBO0lBQUE7O0FBUUEsTUFBMkMsT0FBQSxDQUFRLEtBQVIsQ0FBM0MsRUFBRSxlQUFGLEVBQVEsaUJBQVIsRUFBZSxpQkFBZixFQUFzQixxQkFBdEIsRUFBK0IsZUFBL0IsRUFBcUM7O0FBRXJDLE9BQUEsR0FBVSxTQUFDLEtBQUQsRUFBUSxNQUFSO0FBRU4sUUFBQTtJQUFBLElBQUEsR0FDSTtRQUFBLEdBQUEsRUFBWSw2QkFBWjtRQUNBLElBQUEsRUFBWSw4QkFEWjtRQUVBLE9BQUEsRUFBWSxpQ0FGWjtRQUdBLE9BQUEsRUFBWSx3QkFIWjtRQUlBLFFBQUEsRUFBWSx5QkFKWjtRQUtBLFVBQUEsRUFBWSwyREFMWjs7SUFPSixJQUFBLEdBQU8sQ0FBQyxDQUFDLEtBQUYsQ0FBUSxLQUFLLENBQUMsR0FBTixDQUFVLE1BQVYsRUFBaUIsRUFBakIsQ0FBUjtBQUVQLFNBQUEsV0FBQTs7O1lBQ0ksTUFBTzs7QUFEWDtJQUdBLElBQUksQ0FBQyxJQUFMLENBQVUsa0JBQVY7SUFDQSxJQUFJLENBQUMsSUFBTCxDQUFVLHdCQUFWO0lBQ0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxLQUFLLENBQUMsT0FBTixDQUFjLGlCQUFkLENBQVY7SUFDQSxJQUFJLENBQUMsSUFBTCxDQUFVLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZCxDQUFWO0lBRUEsY0FBQSxHQUFpQixPQUFBLENBQVEsZUFBUjtJQUVqQixhQUFBLEdBQWdCLFNBQUMsSUFBRDtBQUNaLFlBQUE7UUFBQSxJQUFBLEdBQU8sSUFBSSxDQUFDLFdBQUwsQ0FBQTtBQUNQO0FBQUEsYUFBQSxzQ0FBQTs7WUFDSSxJQUFlLElBQUksQ0FBQyxVQUFMLENBQWdCLEtBQWhCLENBQWY7QUFBQSx1QkFBTyxLQUFQOztBQURKO0FBRUE7QUFBQSxhQUFBLHdDQUFBOztZQUNJLElBQWUsSUFBSSxDQUFDLE9BQUwsQ0FBYSxRQUFiLENBQUEsSUFBMEIsQ0FBekM7QUFBQSx1QkFBTyxLQUFQOztBQURKO0FBRUE7QUFBQSxhQUFBLHdDQUFBOztZQUNJLElBQWUsSUFBQSxLQUFRLEtBQXZCO0FBQUEsdUJBQU8sS0FBUDs7QUFESjtlQUVBO0lBUlk7SUFVaEIsYUFBQSxHQUFnQixTQUFDLElBQUQ7QUFDWixZQUFBO0FBQUE7QUFBQSxhQUFBLHNDQUFBOztZQUNJLElBQWUsSUFBSSxDQUFDLE9BQUwsQ0FBYSxJQUFiLENBQUEsSUFBc0IsQ0FBckM7QUFBQSx1QkFBTyxLQUFQOztBQURKO2VBRUE7SUFIWTtJQUtoQixNQUFBLEdBQVMsS0FBSyxDQUFDLEdBQU4sQ0FBVSxRQUFWLEVBQW1CLEVBQW5CO0lBQ1QsV0FBQSxHQUFjLElBQUksQ0FBQztBQUVuQjtTQUFBLHNDQUFBOztRQUVJLE9BQUEsR0FBVSxLQUFLLENBQUMsR0FBTixDQUFVLE1BQVYsRUFBaUI7WUFBQSxVQUFBLEVBQVksS0FBWjtZQUFrQixTQUFBLEVBQVcsQ0FBN0I7U0FBakI7UUFDVixJQUFBLEdBQU8sT0FBQSxDQUFRLEtBQUssQ0FBQyxPQUFOLENBQWMsU0FBZCxDQUFSLEVBQWtDLE9BQWxDO1FBRVAsSUFBSSxDQUFDLEVBQUwsQ0FBUSxPQUFSLEVBQWdCLFNBQUMsR0FBRDtZQUNaLElBQUksQ0FBQyxNQUFMLENBQVksU0FBWixFQUFzQixhQUFBLEdBQWMsR0FBRyxDQUFDLEtBQXhDO21CQUErQyxPQUFBLENBQy9DLEdBRCtDLENBQzNDLHNCQUFBLEdBQXVCLEdBRG9CO1FBRG5DLENBQWhCO1FBSUEsSUFBSSxDQUFDLEVBQUwsQ0FBUSxLQUFSLEVBQWMsU0FBQTtZQUVWLFdBQUEsSUFBZTtZQUNmLElBQUcsV0FBQSxLQUFlLENBQWxCO3NEQUVJLE9BQVEsZUFGWjs7UUFIVSxDQUFkO3FCQU9BLElBQUksQ0FBQyxFQUFMLENBQVEsTUFBUixFQUFlLFNBQUMsSUFBRDtBQUVYLGdCQUFBO1lBQUEsSUFBQSxHQUFPLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZDtZQUNQLElBQUcsS0FBSyxDQUFDLEdBQU4sQ0FBVSxJQUFWLENBQUEsS0FBbUIsS0FBdEI7Z0JBQ0ksSUFBQSxHQUFPLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWDtnQkFDUCxJQUFHLGFBQVksTUFBWixFQUFBLElBQUEsS0FBQSxJQUF1QixDQUFJLGFBQUEsQ0FBYyxJQUFkLENBQTNCLElBQW1ELENBQUksYUFBQSxDQUFjLElBQWQsQ0FBMUQ7b0JBQ0ksSUFBTyxrQkFBUDs7NEJBQ0ksTUFBTzs7K0JBQ1AsSUFBSyxDQUFBLElBQUEsQ0FBTCxHQUFhLEtBRmpCO3FCQURKO2lCQUZKOztRQUhXLENBQWY7QUFoQko7O0FBeENNOztBQWtFVixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgXG4wMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDBcbjAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAgICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMFxuMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwXG4wMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICBcbiMjI1xuXG57IHBvc3QsIHNsYXNoLCBwcmVmcywgd2Fsa2Rpciwga2xvZywgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5leGVGaW5kID0gKGFwcENCLCBkb25lQ0IpIC0+XG5cbiAgICBhcHBzID0gXG4gICAgICAgIGNtZDogICAgICAgICdDOi9XaW5kb3dzL1N5c3RlbTMyL2NtZC5leGUnXG4gICAgICAgIGNhbGM6ICAgICAgICdDOi9XaW5kb3dzL1N5c3RlbTMyL2NhbGMuZXhlJ1xuICAgICAgICBUYXNrbWdyOiAgICAnQzovV2luZG93cy9TeXN0ZW0zMi9UYXNrbWdyLmV4ZSdcbiAgICAgICAgcmVnZWRpdDogICAgJ0M6L1dpbmRvd3MvcmVnZWRpdC5leGUnXG4gICAgICAgIGV4cGxvcmVyOiAgICdDOi9XaW5kb3dzL2V4cGxvcmVyLmV4ZSdcbiAgICAgICAgcG93ZXJzaGVsbDogJ0M6L1dpbmRvd3MvU3lzdGVtMzIvV2luZG93c1Bvd2VyU2hlbGwvdjEuMC9wb3dlcnNoZWxsLmV4ZSdcblxuICAgIGRpcnMgPSBfLmNsb25lIHByZWZzLmdldCAnZGlycycgW11cblxuICAgIGZvciBhcHAsIHB0aCBvZiBhcHBzXG4gICAgICAgIGFwcENCPyBwdGhcbiAgICBcbiAgICBkaXJzLnB1c2ggXCJDOi9Qcm9ncmFtIEZpbGVzXCJcbiAgICBkaXJzLnB1c2ggXCJDOi9Qcm9ncmFtIEZpbGVzICh4ODYpXCJcbiAgICBkaXJzLnB1c2ggc2xhc2gucmVzb2x2ZSAnfi9BcHBEYXRhL0xvY2FsJ1xuICAgIGRpcnMucHVzaCBzbGFzaC5yZXNvbHZlICd+LydcblxuICAgIGlnbm9yZURlZmF1bHRzID0gcmVxdWlyZSAnLi4vYmluL2lnbm9yZSdcblxuICAgIGlnbm9yZWRCeU5hbWUgPSAoZmlsZSkgLT5cbiAgICAgICAgZmlsZSA9IGZpbGUudG9Mb3dlckNhc2UoKVxuICAgICAgICBmb3Igc3RhcnQgaW4gaWdub3JlRGVmYXVsdHMuc3RhcnRzV2l0aFxuICAgICAgICAgICAgcmV0dXJuIHRydWUgaWYgZmlsZS5zdGFydHNXaXRoIHN0YXJ0XG4gICAgICAgIGZvciBjb250YWlucyBpbiBpZ25vcmVEZWZhdWx0cy5jb250YWluc1xuICAgICAgICAgICAgcmV0dXJuIHRydWUgaWYgZmlsZS5pbmRleE9mKGNvbnRhaW5zKSA+PSAwXG4gICAgICAgIGZvciBtYXRjaCBpbiBpZ25vcmVEZWZhdWx0cy5tYXRjaGVzXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZSBpZiBmaWxlID09IG1hdGNoXG4gICAgICAgIGZhbHNlXG4gICAgICAgIFxuICAgIGlnbm9yZWRCeVBhdGggPSAoZmlsZSkgLT5cbiAgICAgICAgZm9yIHBhdGggaW4gaWdub3JlRGVmYXVsdHMucGF0aFxuICAgICAgICAgICAgcmV0dXJuIHRydWUgaWYgZmlsZS5pbmRleE9mKHBhdGgpID49IDBcbiAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIFxuICAgIGlnbm9yZSA9IHByZWZzLmdldCAnaWdub3JlJyBbXVxuICAgIGZvbGRlcnNMZWZ0ID0gZGlycy5sZW5ndGhcblxuICAgIGZvciBleGVGb2xkZXIgaW4gZGlyc1xuICAgICAgICBcbiAgICAgICAgd2Fsa09wdCA9IHByZWZzLmdldCAnd2Fsaycgbm9fcmVjdXJzZTogZmFsc2UgbWF4X2RlcHRoOiA0XG4gICAgICAgIHdhbGsgPSB3YWxrZGlyIHNsYXNoLnJlc29sdmUoZXhlRm9sZGVyKSwgd2Fsa09wdFxuXG4gICAgICAgIHdhbGsub24gJ2Vycm9yJyAoZXJyKSAtPiBcbiAgICAgICAgICAgIHBvc3QudG9XaW5zICdtYWlubG9nJyBcIndhbGsgZXJyb3IgI3tlcnIuc3RhY2t9XCJcbiAgICAgICAgICAgIGxvZyBcIltFUlJPUl0gZmluZEV4ZXMgLS0gI3tlcnJ9XCJcblxuICAgICAgICB3YWxrLm9uICdlbmQnIC0+XG5cbiAgICAgICAgICAgIGZvbGRlcnNMZWZ0IC09IDFcbiAgICAgICAgICAgIGlmIGZvbGRlcnNMZWZ0ID09IDBcbiAgICAgICAgICAgICAgICAjIGtsb2cgJ2FwcHMnIGFwcHNcbiAgICAgICAgICAgICAgICBkb25lQ0I/IGFwcHNcblxuICAgICAgICB3YWxrLm9uICdmaWxlJyAoZmlsZSkgLT5cblxuICAgICAgICAgICAgZmlsZSA9IHNsYXNoLnJlc29sdmUgZmlsZVxuICAgICAgICAgICAgaWYgc2xhc2guZXh0KGZpbGUpID09ICdleGUnXG4gICAgICAgICAgICAgICAgbmFtZSA9IHNsYXNoLmJhc2UgZmlsZVxuICAgICAgICAgICAgICAgIGlmIGZpbGUgbm90IGluIGlnbm9yZSBhbmQgbm90IGlnbm9yZWRCeU5hbWUobmFtZSkgYW5kIG5vdCBpZ25vcmVkQnlQYXRoKGZpbGUpXG4gICAgICAgICAgICAgICAgICAgIGlmIG5vdCBhcHBzW25hbWVdP1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwQ0I/IGZpbGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHNbbmFtZV0gPSBmaWxlXG5cbm1vZHVsZS5leHBvcnRzID0gZXhlRmluZFxuIl19
//# sourceURL=../coffee/exefind.coffee
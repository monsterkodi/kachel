// koffee 1.12.0

/*
00000000  000   000  00000000  00000000  000  000   000  0000000  
000        000 000   000       000       000  0000  000  000   000
0000000     00000    0000000   000000    000  000 0 000  000   000
000        000 000   000       000       000  000  0000  000   000
00000000  000   000  00000000  000       000  000   000  0000000
 */
var _, app, exeFind, post, prefs, ref, slash, walkdir,
    indexOf = [].indexOf;

ref = require('kxk'), _ = ref._, app = ref.app, post = ref.post, prefs = ref.prefs, slash = ref.slash, walkdir = ref.walkdir;

exeFind = function(appCB, doneCB) {
    var apps, dirs, exeFolder, foldersLeft, i, ignore, ignoreDefaults, ignoredByName, ignoredByPath, len, pth, results, walk, walkOpt;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhlZmluZC5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImV4ZWZpbmQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLGlEQUFBO0lBQUE7O0FBUUEsTUFBMEMsT0FBQSxDQUFRLEtBQVIsQ0FBMUMsRUFBRSxTQUFGLEVBQUssYUFBTCxFQUFVLGVBQVYsRUFBZ0IsaUJBQWhCLEVBQXVCLGlCQUF2QixFQUE4Qjs7QUFFOUIsT0FBQSxHQUFVLFNBQUMsS0FBRCxFQUFRLE1BQVI7QUFFTixRQUFBO0lBQUEsSUFBQSxHQUNJO1FBQUEsR0FBQSxFQUFZLDZCQUFaO1FBQ0EsSUFBQSxFQUFZLDhCQURaO1FBRUEsT0FBQSxFQUFZLGlDQUZaO1FBR0EsT0FBQSxFQUFZLHdCQUhaO1FBSUEsUUFBQSxFQUFZLHlCQUpaO1FBS0EsVUFBQSxFQUFZLDJEQUxaOztJQU9KLElBQUEsR0FBTyxDQUFDLENBQUMsS0FBRixDQUFRLEtBQUssQ0FBQyxHQUFOLENBQVUsTUFBVixFQUFpQixFQUFqQixDQUFSO0FBRVAsU0FBQSxXQUFBOzs7WUFDSSxNQUFPOztBQURYO0lBR0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxrQkFBVjtJQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsd0JBQVY7SUFDQSxJQUFJLENBQUMsSUFBTCxDQUFVLEtBQUssQ0FBQyxPQUFOLENBQWMsaUJBQWQsQ0FBVjtJQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFkLENBQVY7SUFFQSxjQUFBLEdBQWlCLE9BQUEsQ0FBUSxlQUFSO0lBRWpCLGFBQUEsR0FBZ0IsU0FBQyxJQUFEO0FBQ1osWUFBQTtRQUFBLElBQUEsR0FBTyxJQUFJLENBQUMsV0FBTCxDQUFBO0FBQ1A7QUFBQSxhQUFBLHNDQUFBOztZQUNJLElBQWUsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsS0FBaEIsQ0FBZjtBQUFBLHVCQUFPLEtBQVA7O0FBREo7QUFFQTtBQUFBLGFBQUEsd0NBQUE7O1lBQ0ksSUFBZSxJQUFJLENBQUMsT0FBTCxDQUFhLFFBQWIsQ0FBQSxJQUEwQixDQUF6QztBQUFBLHVCQUFPLEtBQVA7O0FBREo7QUFFQTtBQUFBLGFBQUEsd0NBQUE7O1lBQ0ksSUFBZSxJQUFBLEtBQVEsS0FBdkI7QUFBQSx1QkFBTyxLQUFQOztBQURKO2VBRUE7SUFSWTtJQVVoQixhQUFBLEdBQWdCLFNBQUMsSUFBRDtBQUNaLFlBQUE7QUFBQTtBQUFBLGFBQUEsc0NBQUE7O1lBQ0ksSUFBZSxJQUFJLENBQUMsT0FBTCxDQUFhLElBQWIsQ0FBQSxJQUFzQixDQUFyQztBQUFBLHVCQUFPLEtBQVA7O0FBREo7ZUFFQTtJQUhZO0lBS2hCLE1BQUEsR0FBUyxLQUFLLENBQUMsR0FBTixDQUFVLFFBQVYsRUFBbUIsRUFBbkI7SUFDVCxXQUFBLEdBQWMsSUFBSSxDQUFDO0FBRW5CO1NBQUEsc0NBQUE7O1FBRUksT0FBQSxHQUFVLEtBQUssQ0FBQyxHQUFOLENBQVUsTUFBVixFQUFpQjtZQUFBLFVBQUEsRUFBWSxLQUFaO1lBQWtCLFNBQUEsRUFBVyxDQUE3QjtTQUFqQjtRQUNWLElBQUEsR0FBTyxPQUFBLENBQVEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxTQUFkLENBQVIsRUFBa0MsT0FBbEM7UUFFUCxJQUFJLENBQUMsRUFBTCxDQUFRLE9BQVIsRUFBZ0IsU0FBQyxHQUFEO1lBQ1osSUFBSSxDQUFDLE1BQUwsQ0FBWSxTQUFaLEVBQXNCLGFBQUEsR0FBYyxHQUFHLENBQUMsS0FBeEM7bUJBQStDLE9BQUEsQ0FDL0MsR0FEK0MsQ0FDM0Msc0JBQUEsR0FBdUIsR0FEb0I7UUFEbkMsQ0FBaEI7UUFJQSxJQUFJLENBQUMsRUFBTCxDQUFRLEtBQVIsRUFBYyxTQUFBO1lBRVYsV0FBQSxJQUFlO1lBQ2YsSUFBRyxXQUFBLEtBQWUsQ0FBbEI7c0RBRUksT0FBUSxlQUZaOztRQUhVLENBQWQ7cUJBT0EsSUFBSSxDQUFDLEVBQUwsQ0FBUSxNQUFSLEVBQWUsU0FBQyxJQUFEO0FBRVgsZ0JBQUE7WUFBQSxJQUFBLEdBQU8sS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFkO1lBQ1AsSUFBRyxLQUFLLENBQUMsR0FBTixDQUFVLElBQVYsQ0FBQSxLQUFtQixLQUF0QjtnQkFDSSxJQUFBLEdBQU8sS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFYO2dCQUNQLElBQUcsYUFBWSxNQUFaLEVBQUEsSUFBQSxLQUFBLElBQXVCLENBQUksYUFBQSxDQUFjLElBQWQsQ0FBM0IsSUFBbUQsQ0FBSSxhQUFBLENBQWMsSUFBZCxDQUExRDtvQkFDSSxJQUFPLGtCQUFQOzs0QkFDSSxNQUFPOzsrQkFDUCxJQUFLLENBQUEsSUFBQSxDQUFMLEdBQWEsS0FGakI7cUJBREo7aUJBRko7O1FBSFcsQ0FBZjtBQWhCSjs7QUF4Q007O0FBa0VWLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICBcbjAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwXG4wMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDBcbjAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIFxuIyMjXG5cbnsgXywgYXBwLCBwb3N0LCBwcmVmcywgc2xhc2gsIHdhbGtkaXIgfSA9IHJlcXVpcmUgJ2t4aydcblxuZXhlRmluZCA9IChhcHBDQiwgZG9uZUNCKSAtPlxuXG4gICAgYXBwcyA9IFxuICAgICAgICBjbWQ6ICAgICAgICAnQzovV2luZG93cy9TeXN0ZW0zMi9jbWQuZXhlJ1xuICAgICAgICBjYWxjOiAgICAgICAnQzovV2luZG93cy9TeXN0ZW0zMi9jYWxjLmV4ZSdcbiAgICAgICAgVGFza21ncjogICAgJ0M6L1dpbmRvd3MvU3lzdGVtMzIvVGFza21nci5leGUnXG4gICAgICAgIHJlZ2VkaXQ6ICAgICdDOi9XaW5kb3dzL3JlZ2VkaXQuZXhlJ1xuICAgICAgICBleHBsb3JlcjogICAnQzovV2luZG93cy9leHBsb3Jlci5leGUnXG4gICAgICAgIHBvd2Vyc2hlbGw6ICdDOi9XaW5kb3dzL1N5c3RlbTMyL1dpbmRvd3NQb3dlclNoZWxsL3YxLjAvcG93ZXJzaGVsbC5leGUnXG5cbiAgICBkaXJzID0gXy5jbG9uZSBwcmVmcy5nZXQgJ2RpcnMnIFtdXG5cbiAgICBmb3IgYXBwLCBwdGggb2YgYXBwc1xuICAgICAgICBhcHBDQj8gcHRoXG4gICAgXG4gICAgZGlycy5wdXNoIFwiQzovUHJvZ3JhbSBGaWxlc1wiXG4gICAgZGlycy5wdXNoIFwiQzovUHJvZ3JhbSBGaWxlcyAoeDg2KVwiXG4gICAgZGlycy5wdXNoIHNsYXNoLnJlc29sdmUgJ34vQXBwRGF0YS9Mb2NhbCdcbiAgICBkaXJzLnB1c2ggc2xhc2gucmVzb2x2ZSAnfi8nXG5cbiAgICBpZ25vcmVEZWZhdWx0cyA9IHJlcXVpcmUgJy4uL2Jpbi9pZ25vcmUnXG5cbiAgICBpZ25vcmVkQnlOYW1lID0gKGZpbGUpIC0+XG4gICAgICAgIGZpbGUgPSBmaWxlLnRvTG93ZXJDYXNlKClcbiAgICAgICAgZm9yIHN0YXJ0IGluIGlnbm9yZURlZmF1bHRzLnN0YXJ0c1dpdGhcbiAgICAgICAgICAgIHJldHVybiB0cnVlIGlmIGZpbGUuc3RhcnRzV2l0aCBzdGFydFxuICAgICAgICBmb3IgY29udGFpbnMgaW4gaWdub3JlRGVmYXVsdHMuY29udGFpbnNcbiAgICAgICAgICAgIHJldHVybiB0cnVlIGlmIGZpbGUuaW5kZXhPZihjb250YWlucykgPj0gMFxuICAgICAgICBmb3IgbWF0Y2ggaW4gaWdub3JlRGVmYXVsdHMubWF0Y2hlc1xuICAgICAgICAgICAgcmV0dXJuIHRydWUgaWYgZmlsZSA9PSBtYXRjaFxuICAgICAgICBmYWxzZVxuICAgICAgICBcbiAgICBpZ25vcmVkQnlQYXRoID0gKGZpbGUpIC0+XG4gICAgICAgIGZvciBwYXRoIGluIGlnbm9yZURlZmF1bHRzLnBhdGhcbiAgICAgICAgICAgIHJldHVybiB0cnVlIGlmIGZpbGUuaW5kZXhPZihwYXRoKSA+PSAwXG4gICAgICAgIGZhbHNlXG4gICAgICAgICAgICBcbiAgICBpZ25vcmUgPSBwcmVmcy5nZXQgJ2lnbm9yZScgW11cbiAgICBmb2xkZXJzTGVmdCA9IGRpcnMubGVuZ3RoXG5cbiAgICBmb3IgZXhlRm9sZGVyIGluIGRpcnNcbiAgICAgICAgXG4gICAgICAgIHdhbGtPcHQgPSBwcmVmcy5nZXQgJ3dhbGsnIG5vX3JlY3Vyc2U6IGZhbHNlIG1heF9kZXB0aDogNFxuICAgICAgICB3YWxrID0gd2Fsa2RpciBzbGFzaC5yZXNvbHZlKGV4ZUZvbGRlciksIHdhbGtPcHRcblxuICAgICAgICB3YWxrLm9uICdlcnJvcicgKGVycikgLT4gXG4gICAgICAgICAgICBwb3N0LnRvV2lucyAnbWFpbmxvZycgXCJ3YWxrIGVycm9yICN7ZXJyLnN0YWNrfVwiXG4gICAgICAgICAgICBsb2cgXCJbRVJST1JdIGZpbmRFeGVzIC0tICN7ZXJyfVwiXG5cbiAgICAgICAgd2Fsay5vbiAnZW5kJyAtPlxuXG4gICAgICAgICAgICBmb2xkZXJzTGVmdCAtPSAxXG4gICAgICAgICAgICBpZiBmb2xkZXJzTGVmdCA9PSAwXG4gICAgICAgICAgICAgICAgIyBrbG9nICdhcHBzJyBhcHBzXG4gICAgICAgICAgICAgICAgZG9uZUNCPyBhcHBzXG5cbiAgICAgICAgd2Fsay5vbiAnZmlsZScgKGZpbGUpIC0+XG5cbiAgICAgICAgICAgIGZpbGUgPSBzbGFzaC5yZXNvbHZlIGZpbGVcbiAgICAgICAgICAgIGlmIHNsYXNoLmV4dChmaWxlKSA9PSAnZXhlJ1xuICAgICAgICAgICAgICAgIG5hbWUgPSBzbGFzaC5iYXNlIGZpbGVcbiAgICAgICAgICAgICAgICBpZiBmaWxlIG5vdCBpbiBpZ25vcmUgYW5kIG5vdCBpZ25vcmVkQnlOYW1lKG5hbWUpIGFuZCBub3QgaWdub3JlZEJ5UGF0aChmaWxlKVxuICAgICAgICAgICAgICAgICAgICBpZiBub3QgYXBwc1tuYW1lXT9cbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcENCPyBmaWxlXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHBzW25hbWVdID0gZmlsZVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4ZUZpbmRcbiJdfQ==
//# sourceURL=../coffee/exefind.coffee
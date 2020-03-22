// koffee 1.12.0

/*
000   0000000   0000000   000   000  
000  000       000   000  0000  000  
000  000       000   000  000 0 000  
000  000       000   000  000  0000  
000   0000000   0000000   000   000
 */
var appIcon, fakeIcon, fs, klog, last, os, ref, slash, wxw;

ref = require('kxk'), slash = ref.slash, os = ref.os, fs = ref.fs, last = ref.last, klog = ref.klog;

wxw = require('wxw');

fakeIcon = function(exePath, pngPath) {
    var base, err, fakeicon, icon, iconMap, targetfile;
    iconMap = {
        recycle: 'recycle',
        recycledot: 'recycledot',
        mingw32: 'terminal',
        mingw64: 'terminal',
        msys2: 'terminaldark',
        mintty: 'terminaldark',
        procexp64: 'procexp',
        Calculator: 'Calculator',
        Calendar: 'Calendar',
        Settings: 'Settings',
        Mail: 'Mail',
        'Microsoft Store': 'Microsoft Store'
    };
    base = slash.base(exePath);
    if (icon = iconMap[base]) {
        targetfile = slash.resolve(pngPath != null ? pngPath : base + '.png');
        fakeicon = slash.join(__dirname, '..', 'icons', icon + '.png');
        try {
            fs.copyFileSync(fakeicon, targetfile);
            return true;
        } catch (error) {
            err = error;
            console.error(err);
        }
    }
    return false;
};

appIcon = function(exePath, pngPath) {
    if (!fakeIcon(exePath, pngPath)) {
        return wxw('icon', exePath, pngPath);
    }
};

module.exports = appIcon;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbi5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImljb24uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLE1BQWdDLE9BQUEsQ0FBUSxLQUFSLENBQWhDLEVBQUUsaUJBQUYsRUFBUyxXQUFULEVBQWEsV0FBYixFQUFpQixlQUFqQixFQUF1Qjs7QUFFdkIsR0FBQSxHQUFNLE9BQUEsQ0FBUSxLQUFSOztBQUVOLFFBQUEsR0FBVyxTQUFDLE9BQUQsRUFBVSxPQUFWO0FBRVAsUUFBQTtJQUFBLE9BQUEsR0FDSTtRQUFBLE9BQUEsRUFBWSxTQUFaO1FBQ0EsVUFBQSxFQUFZLFlBRFo7UUFFQSxPQUFBLEVBQVksVUFGWjtRQUdBLE9BQUEsRUFBWSxVQUhaO1FBSUEsS0FBQSxFQUFZLGNBSlo7UUFLQSxNQUFBLEVBQVksY0FMWjtRQU1BLFNBQUEsRUFBWSxTQU5aO1FBT0EsVUFBQSxFQUFZLFlBUFo7UUFRQSxRQUFBLEVBQVksVUFSWjtRQVNBLFFBQUEsRUFBWSxVQVRaO1FBVUEsSUFBQSxFQUFZLE1BVlo7UUFXQSxpQkFBQSxFQUFtQixpQkFYbkI7O0lBYUosSUFBQSxHQUFPLEtBQUssQ0FBQyxJQUFOLENBQVcsT0FBWDtJQUVQLElBQUcsSUFBQSxHQUFPLE9BQVEsQ0FBQSxJQUFBLENBQWxCO1FBQ0ksVUFBQSxHQUFhLEtBQUssQ0FBQyxPQUFOLG1CQUFjLFVBQVUsSUFBQSxHQUFPLE1BQS9CO1FBQ2IsUUFBQSxHQUFXLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBWCxFQUFzQixJQUF0QixFQUEyQixPQUEzQixFQUFtQyxJQUFBLEdBQU8sTUFBMUM7QUFDWDtZQUNJLEVBQUUsQ0FBQyxZQUFILENBQWdCLFFBQWhCLEVBQTBCLFVBQTFCO0FBQ0EsbUJBQU8sS0FGWDtTQUFBLGFBQUE7WUFHTTtZQUNILE9BQUEsQ0FBQyxLQUFELENBQU8sR0FBUCxFQUpIO1NBSEo7O1dBUUE7QUExQk87O0FBNEJYLE9BQUEsR0FBVSxTQUFDLE9BQUQsRUFBVSxPQUFWO0lBRU4sSUFBRyxDQUFJLFFBQUEsQ0FBUyxPQUFULEVBQWtCLE9BQWxCLENBQVA7ZUFDSSxHQUFBLENBQUksTUFBSixFQUFXLE9BQVgsRUFBb0IsT0FBcEIsRUFESjs7QUFGTTs7QUFLVixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyMjXG5cbnsgc2xhc2gsIG9zLCBmcywgbGFzdCwga2xvZyB9ID0gcmVxdWlyZSAna3hrJ1xuXG53eHcgPSByZXF1aXJlICd3eHcnXG5cbmZha2VJY29uID0gKGV4ZVBhdGgsIHBuZ1BhdGgpIC0+XG4gICAgXG4gICAgaWNvbk1hcCA9IFxuICAgICAgICByZWN5Y2xlOiAgICAncmVjeWNsZSdcbiAgICAgICAgcmVjeWNsZWRvdDogJ3JlY3ljbGVkb3QnXG4gICAgICAgIG1pbmd3MzI6ICAgICd0ZXJtaW5hbCdcbiAgICAgICAgbWluZ3c2NDogICAgJ3Rlcm1pbmFsJ1xuICAgICAgICBtc3lzMjogICAgICAndGVybWluYWxkYXJrJ1xuICAgICAgICBtaW50dHk6ICAgICAndGVybWluYWxkYXJrJ1xuICAgICAgICBwcm9jZXhwNjQ6ICAncHJvY2V4cCdcbiAgICAgICAgQ2FsY3VsYXRvcjogJ0NhbGN1bGF0b3InXG4gICAgICAgIENhbGVuZGFyOiAgICdDYWxlbmRhcidcbiAgICAgICAgU2V0dGluZ3M6ICAgJ1NldHRpbmdzJ1xuICAgICAgICBNYWlsOiAgICAgICAnTWFpbCdcbiAgICAgICAgJ01pY3Jvc29mdCBTdG9yZSc6ICdNaWNyb3NvZnQgU3RvcmUnXG4gICAgICAgICAgICBcbiAgICBiYXNlID0gc2xhc2guYmFzZSBleGVQYXRoXG4gICAgICAgICAgICAgICAgXG4gICAgaWYgaWNvbiA9IGljb25NYXBbYmFzZV1cbiAgICAgICAgdGFyZ2V0ZmlsZSA9IHNsYXNoLnJlc29sdmUgcG5nUGF0aCA/IGJhc2UgKyAnLnBuZydcbiAgICAgICAgZmFrZWljb24gPSBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaWNvbnMnIGljb24gKyAnLnBuZydcbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBmcy5jb3B5RmlsZVN5bmMgZmFrZWljb24sIHRhcmdldGZpbGVcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgZXJyb3IgZXJyXG4gICAgZmFsc2VcbiAgICBcbmFwcEljb24gPSAoZXhlUGF0aCwgcG5nUGF0aCkgLT5cbiAgICBcbiAgICBpZiBub3QgZmFrZUljb24oZXhlUGF0aCwgcG5nUGF0aClcbiAgICAgICAgd3h3ICdpY29uJyBleGVQYXRoLCBwbmdQYXRoXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBhcHBJY29uXG4iXX0=
//# sourceURL=../coffee/icon.coffee
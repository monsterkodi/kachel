// koffee 1.12.0

/*
000   0000000   0000000   000   000  
000  000       000   000  0000  000  
000  000       000   000  000 0 000  
000  000       000   000  000  0000  
000   0000000   0000000   000   000
 */
var appIcon, fakeIcon, fs, ref, slash, wxw;

ref = require('kxk'), fs = ref.fs, slash = ref.slash;

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbi5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImljb24uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLE1BQWdCLE9BQUEsQ0FBUSxLQUFSLENBQWhCLEVBQUUsV0FBRixFQUFNOztBQUVOLEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUjs7QUFFTixRQUFBLEdBQVcsU0FBQyxPQUFELEVBQVUsT0FBVjtBQUVQLFFBQUE7SUFBQSxPQUFBLEdBQ0k7UUFBQSxPQUFBLEVBQVksU0FBWjtRQUNBLFVBQUEsRUFBWSxZQURaO1FBRUEsT0FBQSxFQUFZLFVBRlo7UUFHQSxPQUFBLEVBQVksVUFIWjtRQUlBLEtBQUEsRUFBWSxjQUpaO1FBS0EsTUFBQSxFQUFZLGNBTFo7UUFNQSxTQUFBLEVBQVksU0FOWjtRQU9BLFVBQUEsRUFBWSxZQVBaO1FBU0EsUUFBQSxFQUFZLFVBVFo7UUFVQSxJQUFBLEVBQVksTUFWWjtRQVdBLGlCQUFBLEVBQW1CLGlCQVhuQjs7SUFhSixJQUFBLEdBQU8sS0FBSyxDQUFDLElBQU4sQ0FBVyxPQUFYO0lBRVAsSUFBRyxJQUFBLEdBQU8sT0FBUSxDQUFBLElBQUEsQ0FBbEI7UUFDSSxVQUFBLEdBQWEsS0FBSyxDQUFDLE9BQU4sbUJBQWMsVUFBVSxJQUFBLEdBQU8sTUFBL0I7UUFDYixRQUFBLEdBQVcsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFYLEVBQXNCLElBQXRCLEVBQTJCLE9BQTNCLEVBQW1DLElBQUEsR0FBTyxNQUExQztBQUNYO1lBQ0ksRUFBRSxDQUFDLFlBQUgsQ0FBZ0IsUUFBaEIsRUFBMEIsVUFBMUI7QUFDQSxtQkFBTyxLQUZYO1NBQUEsYUFBQTtZQUdNO1lBQ0gsT0FBQSxDQUFDLEtBQUQsQ0FBTyxHQUFQLEVBSkg7U0FISjs7V0FRQTtBQTFCTzs7QUE0QlgsT0FBQSxHQUFVLFNBQUMsT0FBRCxFQUFVLE9BQVY7SUFFTixJQUFHLENBQUksUUFBQSxDQUFTLE9BQVQsRUFBa0IsT0FBbEIsQ0FBUDtlQUNJLEdBQUEsQ0FBSSxNQUFKLEVBQVcsT0FBWCxFQUFvQixPQUFwQixFQURKOztBQUZNOztBQUtWLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4wMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4wMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4wMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4wMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jIyNcblxueyBmcywgc2xhc2ggfSA9IHJlcXVpcmUgJ2t4aydcblxud3h3ID0gcmVxdWlyZSAnd3h3J1xuXG5mYWtlSWNvbiA9IChleGVQYXRoLCBwbmdQYXRoKSAtPlxuICAgIFxuICAgIGljb25NYXAgPSBcbiAgICAgICAgcmVjeWNsZTogICAgJ3JlY3ljbGUnXG4gICAgICAgIHJlY3ljbGVkb3Q6ICdyZWN5Y2xlZG90J1xuICAgICAgICBtaW5ndzMyOiAgICAndGVybWluYWwnXG4gICAgICAgIG1pbmd3NjQ6ICAgICd0ZXJtaW5hbCdcbiAgICAgICAgbXN5czI6ICAgICAgJ3Rlcm1pbmFsZGFyaydcbiAgICAgICAgbWludHR5OiAgICAgJ3Rlcm1pbmFsZGFyaydcbiAgICAgICAgcHJvY2V4cDY0OiAgJ3Byb2NleHAnXG4gICAgICAgIENhbGN1bGF0b3I6ICdDYWxjdWxhdG9yJ1xuICAgICAgICAjIENhbGVuZGFyOiAgICdDYWxlbmRhcidcbiAgICAgICAgU2V0dGluZ3M6ICAgJ1NldHRpbmdzJ1xuICAgICAgICBNYWlsOiAgICAgICAnTWFpbCdcbiAgICAgICAgJ01pY3Jvc29mdCBTdG9yZSc6ICdNaWNyb3NvZnQgU3RvcmUnXG4gICAgICAgICAgICBcbiAgICBiYXNlID0gc2xhc2guYmFzZSBleGVQYXRoXG4gICAgICAgICAgICAgICAgXG4gICAgaWYgaWNvbiA9IGljb25NYXBbYmFzZV1cbiAgICAgICAgdGFyZ2V0ZmlsZSA9IHNsYXNoLnJlc29sdmUgcG5nUGF0aCA/IGJhc2UgKyAnLnBuZydcbiAgICAgICAgZmFrZWljb24gPSBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJyAnaWNvbnMnIGljb24gKyAnLnBuZydcbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBmcy5jb3B5RmlsZVN5bmMgZmFrZWljb24sIHRhcmdldGZpbGVcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgZXJyb3IgZXJyXG4gICAgZmFsc2VcbiAgICBcbmFwcEljb24gPSAoZXhlUGF0aCwgcG5nUGF0aCkgLT5cbiAgICBcbiAgICBpZiBub3QgZmFrZUljb24oZXhlUGF0aCwgcG5nUGF0aClcbiAgICAgICAgd3h3ICdpY29uJyBleGVQYXRoLCBwbmdQYXRoXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBhcHBJY29uXG4iXX0=
//# sourceURL=../coffee/icon.coffee
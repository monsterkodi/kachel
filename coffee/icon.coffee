###
000   0000000   0000000   000   000  
000  000       000   000  0000  000  
000  000       000   000  000 0 000  
000  000       000   000  000  0000  
000   0000000   0000000   000   000  
###

{ fs, slash } = require 'kxk'

wxw = require 'wxw'

fakeIcon = (exePath, pngPath) ->
    
    iconMap = 
        recycle:    'recycle'
        recycledot: 'recycledot'
        mingw32:    'terminal'
        mingw64:    'terminal'
        msys2:      'terminaldark'
        mintty:     'terminaldark'
        procexp64:  'procexp'
        Calculator: 'Calculator'
        # Calendar:   'Calendar'
        Settings:   'Settings'
        Mail:       'Mail'
        'Microsoft Store': 'Microsoft Store'
            
    base = slash.base exePath
                
    if icon = iconMap[base]
        targetfile = slash.resolve pngPath ? base + '.png'
        fakeicon = slash.join __dirname, '..' 'icons' icon + '.png'
        try
            fs.copyFileSync fakeicon, targetfile
            return true
        catch err
            error err
    false
    
appIcon = (exePath, pngPath) ->
    
    if not fakeIcon(exePath, pngPath)
        wxw 'icon' exePath, pngPath
        
module.exports = appIcon

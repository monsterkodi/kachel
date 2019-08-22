###
00000000  000   000  00000000  00000000  000  000   000  0000000  
000        000 000   000       000       000  0000  000  000   000
0000000     00000    0000000   000000    000  000 0 000  000   000
000        000 000   000       000       000  000  0000  000   000
00000000  000   000  00000000  000       000  000   000  0000000  
###

{ post, slash, prefs, walkdir, klog, _ } = require 'kxk'

exeFind = (appCB, doneCB) ->

    apps = 
        cmd:        'C:/Windows/System32/cmd.exe'
        calc:       'C:/Windows/System32/calc.exe'
        Taskmgr:    'C:/Windows/System32/Taskmgr.exe'
        regedit:    'C:/Windows/regedit.exe'
        explorer:   'C:/Windows/explorer.exe'
        powershell: 'C:/Windows/System32/WindowsPowerShell/v1.0/powershell.exe'

    dirs = _.clone prefs.get 'dirs' []

    for app, pth of apps
        appCB? pth
    
    dirs.push "C:/Program Files"
    dirs.push "C:/Program Files (x86)"
    dirs.push slash.resolve '~/AppData/Local'
    dirs.push slash.resolve '~/'

    ignoreDefaults = require '../bin/ignore'

    ignoredByName = (file) ->
        file = file.toLowerCase()
        for start in ignoreDefaults.startsWith
            return true if file.startsWith start
        for contains in ignoreDefaults.contains
            return true if file.indexOf(contains) >= 0
        for match in ignoreDefaults.matches
            return true if file == match
        false
        
    ignoredByPath = (file) ->
        for path in ignoreDefaults.path
            return true if file.indexOf(path) >= 0
        false
            
    ignore = prefs.get 'ignore' []
    foldersLeft = dirs.length

    for exeFolder in dirs
        
        walkOpt = prefs.get 'walk' no_recurse: false max_depth: 4
        walk = walkdir slash.resolve(exeFolder), walkOpt

        walk.on 'error' (err) -> 
            post.toWins 'mainlog' "walk error #{err.stack}"
            log "[ERROR] findExes -- #{err}"

        walk.on 'end' ->

            foldersLeft -= 1
            if foldersLeft == 0
                # klog 'apps' apps
                doneCB? apps

        walk.on 'file' (file) ->

            file = slash.resolve file
            if slash.ext(file) == 'exe'
                name = slash.base file
                if file not in ignore and not ignoredByName(name) and not ignoredByPath(file)
                    if not apps[name]?
                        appCB? file
                        apps[name] = file

module.exports = exeFind

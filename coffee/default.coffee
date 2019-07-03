###
0000000    00000000  00000000   0000000   000   000  000    000000000  
000   000  000       000       000   000  000   000  000       000     
000   000  0000000   000000    000000000  000   000  000       000     
000   000  000       000       000   000  000   000  000       000     
0000000    00000000  000       000   000   0000000   0000000   000     
###

{ post, slash, klog, elem, _ } = require 'kxk'

electron = require 'electron'
Kachel = require './kachel'

class Default extends Kachel
        
    @: (@kachelId:'default') -> super
    
    onLoad: =>
        
        grid = elem 'div' class:'grid2x2' children:[
            elem 'img' class:'grid2x2_11' click:@openApp, src:__dirname + '/../img/app.png' 
            elem 'img' class:'grid2x2_12' click:@openCmd, src:__dirname + '/../img/cmd.png' 
            elem 'img' class:'grid2x2_21' click:@openGit, src:__dirname + '/../img/git.png'    
            elem 'img' class:'grid2x2_22' click:@openNpm, src:__dirname + '/../img/npm.png'     
        ]
    
        @main.appendChild grid
        
    openGit: => post.toMain 'newKachel' html:'kachel'  data:index:'../kacheln/clock/public/index.html'
    openNpm: => log 'openNpm'
    openCmd: => post.toMain 'newKachel' html:'sysinfo' winId:@win.id
    onClick: => log 'onClick'
    openApp: => 
        
        dir = slash.win() and 'C:/Program Files/' or '/Applications'
        electron.remote.dialog.showOpenDialog
            title: "Open Application"
            defaultPath: dir
            properties: ['openFile', 'multiSelections']
            , @appsChosen
            
    appsChosen: (files) => 
        
        if not files instanceof Array
            files = [files]
        for file in files
            @appChosen file
            
    appChosen: (file) ->
        
        file = slash.removeDrive slash.path file
        post.toMain 'newKachel' html:'appl' data:app:file

module.exports = Default

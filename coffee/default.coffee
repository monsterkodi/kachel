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

        children = [
            elem 'img' class:'grid2x2_11' click:@openApp,    src:__dirname + '/../img/app.png'   
            elem 'img' class:'grid2x2_12' click:@openFolder, src:__dirname + '/../img/folder.png'    
            elem 'img' class:'grid2x2_21' click:@openInfo,   src:__dirname + '/../img/info.png' 
            elem 'img' class:'grid2x2_22' click:@openClock,  src:__dirname + '/../img/clock.png'     
        ]
        
        for child in children
            child.ondragstart = -> false
        
        grid = elem 'div' class:'grid2x2' children:children
    
        @main.appendChild grid
        
    openClock: => post.toMain 'newKachel' html:'clock'   
    openInfo: => post.toMain 'newKachel' html:'sysinfo' winId:@win.id
    onClick: => log 'onClick'
    
    # 0000000    000  00000000   
    # 000   000  000  000   000  
    # 000   000  000  0000000    
    # 000   000  000  000   000  
    # 0000000    000  000   000  
    
    openFolder: => 
        dir = slash.untilde '~'
        electron.remote.dialog.showOpenDialog
            title: "Open Folder"
            defaultPath: dir
            properties: ['openDirectory', 'multiSelections']
            , @dirsChosen
            
    dirsChosen: (files) => 
        
        if not files instanceof Array
            files = [files]
        for file in files
            @dirChosen file
            
    dirChosen: (file) ->
        
        file = slash.removeDrive slash.path file
        post.toMain 'newKachel' html:'folder' data:folder:file
            
    #  0000000   00000000   00000000   
    # 000   000  000   000  000   000  
    # 000000000  00000000   00000000   
    # 000   000  000        000        
    # 000   000  000        000        
    
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

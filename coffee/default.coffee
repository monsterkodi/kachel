###
0000000    00000000  00000000   0000000   000   000  000    000000000  
000   000  000       000       000   000  000   000  000       000     
000   000  0000000   000000    000000000  000   000  000       000     
000   000  000       000       000   000  000   000  000       000     
0000000    00000000  000       000   000   0000000   0000000   000     
###

{ _, elem, klog, post, slash } = require 'kxk'

electron = require 'electron'
Kachel   = require './kachel'

class Default extends Kachel
        
    @: (@kachelId:'default') ->
        _
        # electron = require 'electron'
        # electron.remote.getCurrentWindow().openDevTools mode:'detach'
        klog 'Default' @kachelId
        super
    
    # 000       0000000    0000000   0000000    
    # 000      000   000  000   000  000   000  
    # 000      000   000  000000000  000   000  
    # 000      000   000  000   000  000   000  
    # 0000000   0000000   000   000  0000000    
    
    button = (row, col, img, click, clss='') ->
        
        b = elem class:"button #{clss} grid3x3_#{row}#{col}" click:click, child: elem 'img' src:__dirname + '/../' + img
        b.ondragstart = -> false
        b
    
    onLoad: =>
        
        klog 'onLoad'
        @main.innerHTML = ''
        @main.appendChild elem 'div' class:'grid3x3' children:[
            button 1 1 'img/app.png'       @openApp
            button 1 2 'img/folder.png'    @openFolder
            button 1 3 'img/tools.png'     @openTools, 'dark'
            button 2 1 'img/dish.png'   -> post.toMain 'newKachel' 'sysdish'
            button 2 3 'img/anny.png'   -> post.toMain 'newKachel' 'anny'
            button 3 1 'img/clock.png'  -> post.toMain 'newKachel' 'clock'
            button 3 2 'img/alarm.png'  -> post.toMain 'newKachel' 'alarm'
            button 3 3 'img/volume.png' -> post.toMain 'newKachel' 'volume'
        ]

    openTools: =>

        @main.innerHTML = ''
        @main.appendChild elem 'div' class:'grid3x3' children:[
            button 1 1 'img/taskbar.png'   (-> post.toMain 'newKachel' 'taskbar'), 'dark'
            button 1 2 'img/chain.png'     (-> post.toMain 'newKachel' 'chain'  ), 'dark'
            button 1 3 'img/tools.png'         @onLoad, 'dark'
            button 2 1 'img/saver.png'      -> post.toMain 'newKachel' 'saver'   
            button 2 2 'img/anny.png'       -> post.toMain 'newKachel' 'apps'   
            button 2 3 'img/clean.png'      -> post.toMain 'newKachel' 'clean'
            button 3 1 'icons/sleep.png'    -> post.toMain 'newKachel' 'sleep'    
            button 3 2 'icons/restart.png'  -> post.toMain 'newKachel' 'restart'  
            button 3 3 'icons/shutdown.png' -> post.toMain 'newKachel' 'shutdown' 
        ]
        
    onRightClick: => @win.close()  
    
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
            properties: ['openDirectory' 'multiSelections']
            , @dirsChosen
            
    dirsChosen: (files) => 
        
        return if not files
        if not files instanceof Array
            files = [files]
        for file in files
            @dirChosen file
            
    dirChosen: (file) ->
        
        post.toMain 'newKachel' slash.path file
        
    # 0000000    000  00000000   
    # 000   000  000  000   000  
    # 000   000  000  0000000    
    # 000   000  000  000   000  
    # 0000000    000  000   000  
    
    openFile: => 
        
        dir = slash.untilde '~'
        electron.remote.dialog.showOpenDialog
            title: "Open File"
            defaultPath: dir
            properties: ['openFile' 'multiSelections']
            , @filesChosen
            
    filesChosen: (files) => 
        
        return if not files
        if not files instanceof Array
            files = [files]
        for file in files
            @fileChosen file
            
    fileChosen: (file) ->
        
        post.toMain 'newKachel' slash.path file
            
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
            properties: ['openFile' 'multiSelections']
            , @appsChosen
            
    appsChosen: (files) => 
        
        return if not files
        if not files instanceof Array
            files = [files]
        for file in files
            @appChosen file
            
    appChosen: (file) ->
        
        post.toMain 'newKachel' slash.path file

module.exports = Default

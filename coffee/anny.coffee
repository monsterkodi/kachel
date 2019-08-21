###
 0000000   000   000  000   000  000   000  
000   000  0000  000  0000  000   000 000   
000000000  000 0 000  000 0 000    00000    
000   000  000  0000  000  0000     000     
000   000  000   000  000   000     000     
###

{ post, childp, slash, prefs, empty, valid, kstr, last, randint, klog, elem, open, os, fs, $, _ } = require 'kxk'

Appl    = require './appl'
Bounds  = require './bounds'
appIcon = require './icon'
wxw     = require 'wxw'

class Anny extends Appl
        
    @: (@kachelId:'anny') ->

        super

        @win.setResizable true
        @win.setMinimumSize Bounds.kachelSizes[0], Bounds.kachelSizes[0]
        @win.on 'resize' @onResize
        
        @main.classList.add 'noFrame'
        @main.style.display = 'block'
        
        @addButton icon:__dirname + '/../img/anny.png' 'annyicon'
        
        @iconSize = prefs.get 'anny▸iconSize' Bounds.kachelSizes[2]
        @updateIconSize()
        
    #  0000000  000  0000000  00000000  
    # 000       000     000   000       
    # 0000000   000    000    0000000   
    #      000  000   000     000       
    # 0000000   000  0000000  00000000  
    
    onResize: (event) =>
        
        clearTimeout @snapTimer
        @snapTimer = setTimeout @snapSize, 150
               
    snapSize: =>
        
        b = @win.getBounds()
        
        sizes = Bounds.snapSizes
        
        for i in [0...sizes.length-1]
            if b.width < sizes[i] + (sizes[i+1] - sizes[i]) / 2
                b.width = sizes[i]
                break
                
        for i in [0...sizes.length-1]
            if b.height < sizes[i] + (sizes[i+1] - sizes[i]) / 2
                b.height = sizes[i]
                break
        
        @win.setBounds b
        @onSaveBounds()        
        @updateIconSize()
        
    updateIconSize: =>
        
        b = @win.getBounds()
        @iconSize = Math.min @iconSize, parseInt Math.min b.width, b.height
        
        prefs.set 'anny▸iconSize' @iconSize
        
        for btn in document.querySelectorAll '.button'
            
            btn.style.width  = "#{@iconSize-1}px"
            btn.style.height = "#{@iconSize-1}px"
        
    onMenuAction: (action) =>
        
        switch action
            when 'Reset' 
                @iconSize = parseInt Bounds.snapSizes[-1]
                @updateIconSize()
                return 
            when 'Increase' 'Decrease' 
                d = action == 'Increase' and +1 or -1
                size = @iconSize
                sizes = Bounds.snapSizes
                index = sizes.length
                for i in [sizes.length-2..0]
                    if size < sizes[i] + (sizes[i+1] - sizes[i]) / 2
                        @iconSize = parseInt sizes[Math.max 0, i+d]
                @updateIconSize()
                return
        super
            
    onApp: (action, app) =>
        
    #  0000000   000   000  000   000  000  000   000  
    # 000   000  0000  000  000 0 000  000  0000  000  
    # 000   000  000 0 000  000000000  000  000 0 000  
    # 000   000  000  0000  000   000  000  000  0000  
    #  0000000   000   000  00     00  000  000   000  
    
    onWin: (wins) =>
        
        iconDir = slash.join slash.userData(), 'icons'
        
        apps = []
        for path,infos of wins
            appName = slash.base path
            
            if os.platform() == 'win32' and appName == 'ApplicationFrameHost'
                for info in infos
                    if info.title
                        name = last info.title.split '- '
                        if name in ['Calendar' 'Mail']
                            apps.push name
                        else if info.title in ['Settings' 'Calculator' 'Microsoft Store']
                            apps.push info.title
            else
                apps.push path

        icons = []
        for app in apps
            appName = slash.base app
            pngPath = slash.resolve slash.join iconDir, appName + ".png"
            if slash.fileExists pngPath
                icons.push icon:pngPath, app:app
            else
                klog 'no icon' pngPath
                appIcon app, pngPath
                        
        @main.innerHTML = ''
        for iconApp in icons
            @addButton iconApp
            
    # 0000000    000   000  000000000  000000000   0000000   000   000  
    # 000   000  000   000     000        000     000   000  0000  000  
    # 0000000    000   000     000        000     000   000  000 0 000  
    # 000   000  000   000     000        000     000   000  000  0000  
    # 0000000     0000000      000        000      0000000   000   000  
    
    addButton: (icon:, app:'') ->
        
        img = elem 'img' class:'annyicon' src:slash.fileUrl slash.path icon
        img.ondragstart = -> false
        
        btn = elem class:'button' child:img
        btn.style.width  = "#{@iconSize-1}px"
        btn.style.height = "#{@iconSize-1}px"
        
        btn.id = app
        
        @main.appendChild btn
                                
    #  0000000  000      000   0000000  000   000  
    # 000       000      000  000       000  000   
    # 000       000      000  000       0000000    
    # 000       000      000  000       000  000   
    #  0000000  0000000  000   0000000  000   000  
    
    appEvent: (event) -> 
        
        app = event.target.id
        app = event.target.parentElement.id if empty app
    
    onLeftClick: (event) => if app = @appEvent event then @openApp app
    onRightClick: (event) => if app = @appEvent event then wxw 'minimize' slash.file app
    onMiddleClick: (event) => if app = @appEvent event then wxw 'terminate' app

    onInitKachel: (@kachelId) =>
                        
        @win.setTitle "kachel #{@kachelId}"
                
        post.toMain 'kachelBounds' @id, @kachelId
        post.toMain 'kachelLoad' @id, @kachelId
        
module.exports = Anny

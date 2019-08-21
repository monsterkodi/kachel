###
 0000000   000   000  000   000  000   000  
000   000  0000  000  0000  000   000 000   
000000000  000 0 000  000 0 000    00000    
000   000  000  0000  000  0000     000     
000   000  000   000  000   000     000     
###

{ post, childp, slash, empty, valid, kstr, last, randint, klog, elem, open, os, fs, $, _ } = require 'kxk'

Appl    = require './appl'
Bounds  = require './bounds'
appIcon = require './icon'
wxw     = require 'wxw'

class Anny extends Appl
        
    @: (@kachelId:'anny') -> 

        super

        @win.setResizable true
        @win.setMinimumSize Bounds.kachelSizes[0], Bounds.kachelSizes[0]
        @win.setMaximumSize Bounds.kachelSizes[-1], Bounds.kachelSizes[-1]
        @win.on 'resize' @onResize
        
        @setIcon __dirname + '/../img/anny.png' 'annyicon'
        
    onResize: (event) =>
        
        clearTimeout @snapTimer
        @snapTimer = setTimeout @snapSize, 150
               
    snapSize: =>
        
        super
        
        b = @win.getBounds()
        @iconSize = parseInt 0.92 * Math.min b.width, b.height
        # @marginSize = parseInt 0.04 * Math.min b.width, b.height
        
        for btn in document.querySelectorAll '.button'
            
            img = btn.firstChild
            img.style.margin = "#{@iconSize*0.1}px"
            img.style.width  = "#{@iconSize*0.8}px"
            img.style.height = "#{@iconSize*0.8}px"
            
            # btn.style.margin = "#{@marginSize}px"
            btn.style.width  = "#{@iconSize}px"
            btn.style.height = "#{@iconSize}px"
        
    onApp: (action, app) =>
        
        # @activated = action == 'activated'
        # @updateDot()

    onWin: (wins) =>
        
        # klog 'anny wins' Object.keys(wins).length
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
                icons.push pngPath
            else
                klog 'no icon' pngPath
                appIcon app, pngPath
                        
        @main.innerHTML = ''
        for icon in icons
            img = elem 'img' class:'annyicon' src:slash.fileUrl slash.path icon
            img.style.margin = "#{@iconSize*0.1}px"
            img.style.width  = "#{@iconSize*0.8}px"
            img.style.height = "#{@iconSize*0.8}px"
            img.ondragstart = -> false
            
            btn = elem class:'button' click:@onButtonClick, child:img
            # btn.style.margin = "#{@marginSize}px"
            btn.style.width  = "#{@iconSize}px"
            btn.style.height = "#{@iconSize}px"
            
            @main.appendChild btn
                
        # @status = ''
        # for w in wins
            # for c in ['maximized' 'normal']
                # if w.status.startsWith c
                    # @status = w.status
                    # break
            # if valid @status
                # break

        # if empty @status
            # for w in wins
                # if w.status == 'minimized'
                    # @status = 'minimized'
                    # break
        
        @updateDot()
                        
    #  0000000  000      000   0000000  000   000  
    # 000       000      000  000       000  000   
    # 000       000      000  000       0000000    
    # 000       000      000  000       000  000   
    #  0000000  0000000  000   0000000  000   000  
    
    onButtonClick: (event) =>
        
        klog 'onButtonClick'
    
    onLeftClick: (event) -> 
        
        # klog 'appl.onClick' slash.file @kachelId
        
        return if not @currentApp
        if os.platform() == 'win32'
            infos = wxw 'info' slash.file @currentApp
            if infos.length
                wxw 'focus' slash.file @currentApp
            else
                open slash.unslash @currentApp
        else
            open @currentApp
    
    onContextMenu: (event) => 
        
        if @currentApp
            wxw 'minimize' slash.file @currentApp

    onMiddleClick: (event) => 
  
        if @currentApp
            wxw 'terminate' @currentApp
                    
    onInitKachel: (@kachelId) =>
                        
        @win.setTitle "kachel #{@kachelId}"
                
        post.toMain 'kachelBounds' @id, @kachelId
        post.toMain 'kachelLoad' @id, @kachelId
        
module.exports = Anny

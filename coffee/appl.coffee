###
 0000000   00000000   00000000   000      
000   000  000   000  000   000  000      
000000000  00000000   00000000   000      
000   000  000        000        000      
000   000  000        000        0000000  
###

{ $, _, app, elem, empty, kstr, open, os, post, slash, valid } = require 'kxk'

Kachel  = require './kachel'
appIcon = require './icon'
utils   = require './utils'
wxw     = require 'wxw'

class Appl extends Kachel
        
    @: (@kachelId:'appl') ->
        _
        post.on 'app' @onApp
        post.on 'win' @onWin
        
        @activated = false
        @status    = ''
        
        super
                
    onApp: (action, app) =>
        
        @activated = action == 'activated'
        @updateDot()

    onWin: (wins) =>
        
        @status = ''
        for w in wins
            for c in ['maximized' 'normal']
                if w.status.startsWith c
                    @status = w.status
                    break
            if valid @status
                break
                
        if empty @status
            for w in wins
                if w.status == 'minimized'
                    @status = 'minimized'
                    break
        
        @updateDot()
        
    onBounds: =>
        
        if os.platform() == 'win32' # on windows,
            if dot =$ '.appldot'    # for some reason the content 
                dot.remove()        # doesn't get updated immediately on resize 
                @updateDot()        # if there is a dot svg present
        
    # 0000000     0000000   000000000  
    # 000   000  000   000     000     
    # 000   000  000   000     000     
    # 000   000  000   000     000     
    # 0000000     0000000      000     
    
    updateDot: ->
        
        dot =$ '.appldot'
        
        if @activated and not dot
            dot = utils.svg width:16 height:16 clss:'appldot'
            defs = utils.append dot, 'defs'
            grd = utils.append defs, 'linearGradient', id:'appldotstroke' x1:"0%" y1:"0%" x2:"100%" y2:"100%"
            stp = utils.append grd, 'stop' offset:"0%" 'stop-color':"#0a0a0a"
            stp = utils.append grd, 'stop' offset:"100%" 'stop-color':"#202020"
            grp = utils.append dot, 'g'
            crc = utils.append grp, 'circle' cx:0 cy:0 r:7 class:'applcircle'
            @main.appendChild dot
        else if not @activated and dot
            dot?.remove()
            dot = null
            
        if dot
            dot.classList.remove 'top'
            dot.classList.remove 'normal'
            dot.classList.remove 'minimized'
            dot.classList.remove 'maximized'
            if valid @status
                for s in @status.split ' '
                    dot.classList.add s
        
    #  0000000  000      000   0000000  000   000  
    # 000       000      000  000       000  000   
    # 000       000      000  000       0000000    
    # 000       000      000  000       000  000   
    #  0000000  0000000  000   0000000  000   000  
            
    openApp: (app) ->
        
        if os.platform() == 'win32'
            infos = wxw 'info' slash.file app
            if infos.length
                wxw 'focus' slash.file app
            else
                open slash.unslash app
        else
            open app
    
    onLeftClick: => @openApp @kachelId
    onRightClick: => wxw 'minimize' slash.file @kachelId
    onMiddleClick: => wxw 'terminate' @kachelId
                    
    # 000  000   000  000  000000000  
    # 000  0000  000  000     000     
    # 000  000 0 000  000     000     
    # 000  000  0000  000     000     
    # 000  000   000  000     000     
    
    onInitKachel: (@kachelId) =>
            
        iconDir = slash.join slash.userData(), 'icons'
        appName = slash.base @kachelId
        iconPath = "#{iconDir}/#{appName}.png"
                
        if not slash.isFile iconPath
            @refreshIcon()
        else
            @setIcon iconPath
           
        base = slash.base @kachelId
        if base in ['Calendar']
            minutes = {Calendar:60}[base]
            @refreshIcon()
            setInterval @refreshIcon, 1000*60*minutes
            
        super @kachelId
           
    # 000   0000000   0000000   000   000  
    # 000  000       000   000  0000  000  
    # 000  000       000   000  000 0 000  
    # 000  000       000   000  000  0000  
    # 000   0000000   0000000   000   000  
        
    refreshIcon: =>
        
        iconDir = slash.join slash.userData(), 'icons'
        appName = slash.base @kachelId
        pngPath = slash.resolve slash.join iconDir, appName + ".png"
        
        appIcon @kachelId, pngPath
        @setIcon pngPath
        
        base = slash.base @kachelId
        if base in ['Calendar']
            time = new Date()
            day = elem class:'calendarDay' text:kstr.lpad time.getDate(), 2, '0'
            @main.appendChild day
            mth = elem class:'calendarMonth' text:['JAN' 'FEB' 'MAR' 'APR' 'MAY' 'JUN' 'JUL' 'AUG' 'SEP' 'OCT' 'NOV' 'DEC'][time.getMonth()]
            @main.appendChild mth
                
    setIcon: (iconPath) =>
        
        return if not iconPath
        super
        @updateDot()
                           
module.exports = Appl

###
 0000000   00000000   00000000   000      
000   000  000   000  000   000  000      
000000000  00000000   00000000   000      
000   000  000        000        000      
000   000  000        000        0000000  
###

{ post, childp, slash, empty, valid, randint, klog, kstr, elem, open, os, fs, $, _ } = require 'kxk'

Kachel  = require './kachel'
appIcon = require './icon'
utils   = require './utils'
wxw     = require 'wxw'

class Appl extends Kachel
        
    @: (@kachelId:'appl') -> 
    
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
        
    # 0000000     0000000   000000000  
    # 000   000  000   000     000     
    # 000   000  000   000     000     
    # 000   000  000   000     000     
    # 0000000     0000000      000     
    
    updateDot: ->
        
        dot =$ '.appldot'
        
        if @activated and not dot
            dot = utils.svg width:16 height:16 clss:'appldot'
            def = utils.append dot, 'defs'
            grd = utils.append def, 'linearGradient', id:'appldotstroke' x1:"0%" y1:"0%" x2:"100%" y2:"100%"
            stp = utils.append grd, 'stop' offset:"0%" 'stop-color':"#111"
            stp = utils.append grd, 'stop' offset:"100%" 'stop-color':"#333"
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
    
    onLeftClick: (event) -> 
        
        # klog 'appl.onClick' slash.file @kachelId
        
        if os.platform() == 'win32'
            infos = wxw 'info' slash.file @kachelId
            if infos.length
                wxw 'focus' slash.file @kachelId
            else
                open slash.unslash @kachelId 
        else
            open @kachelId 
    
    onContextMenu: (event) => 
        
        wxw 'minimize' slash.file @kachelId

    onMiddleClick: (event) => 
  
        wxw 'terminate' @kachelId
                    
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

###
 0000000   00000000   00000000   000      
000   000  000   000  000   000  000      
000000000  00000000   00000000   000      
000   000  000        000        000      
000   000  000        000        0000000  
###

{ post, childp, slash, empty, valid, randint, klog, elem, open, os, fs, $, _ } = require 'kxk'

Kachel = require './kachel'

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
            dot = elem class:'appldot'
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
    
    onClick: (event) -> 
        
        klog 'appl.onClick' slash.file @kachelId
        
        if os.platform() == 'win32'
            wxw = require 'wxw'
            infos = wxw 'info' slash.file @kachelId
            if infos.length
                klog "wxw 'focus' #{slash.file @kachelId}"
                wxw 'focus' slash.file @kachelId
            else
                open slash.unslash @kachelId 
        else
            open @kachelId 
    
    onContextMenu: (event) => 
        
        if os.platform() == 'win32'
            wxw = require 'wxw'
            wxw 'minimize' slash.file @kachelId

    onMiddleClick: (event) => 
        
        if os.platform() == 'win32'
            wxw = require 'wxw'
            infos = wxw 'info' slash.file @kachelId
            if infos.length
                maximized = false
                for info in infos
                    if info.status == 'maximized'
                        maximized = true
                        break
                if maximized
                    wxw 'restore' slash.file @kachelId
                else
                    wxw 'maximize' slash.file @kachelId
            
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
            
        super
           
    refreshIcon: =>
        
        iconDir = slash.join slash.userData(), 'icons'
        
        if slash.win()
            @exeIcon @kachelId, iconDir, @setIcon
        else
            @setIcon @appIcon @kachelId, iconDir

        base = slash.base @kachelId
        if base in ['Calendar']
            time = new Date()
            day = elem class:'calendarDay' text:time.getDate()
            @main.appendChild day
            mth = elem class:'calendarMonth' text:['JAN' 'FEB' 'MAR' 'APR' 'MAY' 'JUN' 'JUL' 'AUG' 'SEP' 'OCT' 'NOV' 'DEC'][time.getMonth()]
            @main.appendChild mth
            
    # 000   0000000   0000000   000   000  
    # 000  000       000   000  0000  000  
    # 000  000       000   000  000 0 000  
    # 000  000       000   000  000  0000  
    # 000   0000000   0000000   000   000  
    
    setIcon: (iconPath) =>
        
        return if not iconPath
        img = elem 'img' class:'applicon' src:slash.fileUrl iconPath
        img.ondragstart = -> false
        @main.innerHTML = ''
        @main.appendChild img
        @updateDot()
                   
    # 00000000  000   000  00000000  
    # 000        000 000   000       
    # 0000000     00000    0000000   
    # 000        000 000   000       
    # 00000000  000   000  00000000  
    
    exeIcon: (exePath, outDir, cb) ->

        fs.mkdir outDir, recursive:true
        pngPath = slash.resolve slash.join outDir, slash.base(exePath) + ".png"
        any2Ico = slash.path __dirname + '/../bin/Quick_Any2Ico.exe'
        
        if false # slash.isFile any2Ico
            klog 'appl.exeIcon' any2Ico
            childp.exec "\"#{any2Ico}\" -formats=512 -res=\"#{exePath}\" -icon=\"#{pngPath}\"", {}, (err,stdout,stderr) -> 
                if not err? 
                    cb pngPath
                else
                    if slash.ext(exePath)!= 'lnk'
                        error stdout, stderr, err
                    cb()
        else
            wxw = require 'wxw'
            klog 'exeIcon' exePath, pngPath
            wxw 'icon' exePath, pngPath
            cb pngPath
            
    #  0000000   00000000   00000000   
    # 000   000  000   000  000   000  
    # 000000000  00000000   00000000   
    # 000   000  000        000        
    # 000   000  000        000        
    
    appIcon: (appPath, outDir) ->
        
        fs.mkdir outDir, recursive:true
        size = 512
        conPath = slash.join appPath, 'Contents'
        try
            infoPath = slash.join conPath, 'Info.plist'
            fs.accessSync infoPath, fs.R_OK
            splist = require 'simple-plist'
            obj = splist.readFileSync infoPath            
            if obj['CFBundleIconFile']?
                icnsPath = slash.join slash.dirname(infoPath), 'Resources', obj['CFBundleIconFile']
                icnsPath += ".icns" if not icnsPath.endsWith '.icns'
                fs.accessSync icnsPath, fs.R_OK 
                pngPath = slash.resolve slash.join outDir, slash.base(appPath) + ".png"
                childp.execSync "/usr/bin/sips -Z #{size} -s format png \"#{slash.escape icnsPath}\" --out \"#{slash.escape pngPath}\""
                fs.accessSync pngPath, fs.R_OK
                return pngPath
        catch err
            error err
        
module.exports = Appl

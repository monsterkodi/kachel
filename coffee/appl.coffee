###
 0000000   00000000   00000000   000      
000   000  000   000  000   000  000      
000000000  00000000   00000000   000      
000   000  000        000        000      
000   000  000        000        0000000  
###

{ post, childp, prefs, slash, osascript, open, klog, elem, os, fs, _ } = require 'kxk'

Kachel = require './kachel'

class Appl extends Kachel
        
    @: (@kachelId:'appl') -> super
        
    onClick: (event) -> open slash.unslash @appPath 
    
    # 000  000   000  000  000000000  
    # 000  0000  000  000     000     
    # 000  000 0 000  000     000     
    # 000  000  0000  000     000     
    # 000  000   000  000     000     
    
    onInitData: (data) =>
        
        @appPath = data.app
        @kachelId = 'appl'+@appPath
        prefs.set "kacheln▸#{@kachelId}▸data▸app" @appPath
        prefs.set "kacheln▸#{@kachelId}▸html" 'appl'
    
        iconDir = slash.join slash.userData(), 'icons'        
        appName = slash.base @appPath
        iconPath = "#{iconDir}/#{appName}.png"
        if not slash.isFile iconPath
            if slash.win()
                @exeIcon data.app, iconDir, @setIcon
            else
                @setIcon @appIcon data.app, iconDir
        else
            @setIcon iconPath
                
        super
                
    # 000   0000000   0000000   000   000  
    # 000  000       000   000  0000  000  
    # 000  000       000   000  000 0 000  
    # 000  000       000   000  000  0000  
    # 000   0000000   0000000   000   000  
    
    setIcon: (iconPath) =>
        
        return if not iconPath
        img = elem 'img' class:'applicon' src:slash.fileUrl iconPath
        img.ondragstart = -> false
        @main.appendChild img
                   
    # 00000000  000   000  00000000  
    # 000        000 000   000       
    # 0000000     00000    0000000   
    # 000        000 000   000       
    # 00000000  000   000  00000000  
    
    exeIcon: (exePath, outDir, cb) ->

        fs.mkdir outDir, recursive:true
        pngPath = slash.resolve slash.join outDir, slash.base(exePath) + ".png"
        any2Ico = slash.path __dirname + '/../bin/Quick_Any2Ico.exe'
        
        if slash.isFile any2Ico
        
            childp.exec "\"#{any2Ico}\" -formats=512 -res=\"#{exePath}\" -icon=\"#{pngPath}\"", {}, (err,stdout,stderr) -> 
                if not err? 
                    cb pngPath
                else
                    if slash.ext(exePath)!= 'lnk'
                        error stdout, stderr, err
                    cb()
        else
            try
                extractIcon = require 'win-icon-extractor'
                extractIcon(exePath).then (result) ->
                    if result
                        data = result.slice 'data:image/png;base64,'.length
                        fs.writeFile pngPath, data, {encoding: 'base64'}, (err) ->
                            if not err?
                                cb pngPath
                            else
                                error err
                                cb()
                    else
                        error 'no result'
                        cb()
            catch err
                error err
                cb()
            
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

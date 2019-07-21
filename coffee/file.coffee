###
00000000  000  000      00000000  
000       000  000      000       
000000    000  000      0000000   
000       000  000      000       
000       000  0000000  00000000  
###

{ post, childp, prefs, slash, valid, open, klog, elem, os, fs, _ } = require 'kxk'

Kachel = require './kachel'
utils  = require './utils'

class File extends Kachel
        
    @: (@kachelId:'file') -> super
        
    #  0000000  000      000   0000000  000   000  
    # 000       000      000  000       000  000   
    # 000       000      000  000       0000000    
    # 000       000      000  000       000  000   
    #  0000000  0000000  000   0000000  000   000  
    
    onClick: (event) -> 
        
        open slash.unslash @kachelId
        
    # 000  000   000  000  000000000  
    # 000  0000  000  000     000     
    # 000  000 0 000  000     000     
    # 000  000  0000  000     000     
    # 000  000   000  000     000     
    
    onInitKachel: (@kachelId) =>

        file = slash.resolve @kachelId
                
        iconDir = slash.join slash.userData(), 'icons'
        fs.mkdir iconDir, recursive:true
        fileName = slash.file file
        iconPath = "#{iconDir}/#{fileName}.png"
        if not slash.isFile iconPath
            if slash.win()
                @winIcon file, iconDir, @setIcon
            else
                @setIcon @appIcon file, iconDir
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
    
    winIcon: (exePath, outDir, cb) ->

        pngPath = slash.resolve slash.join outDir, slash.base(exePath) + ".png"
        any2Ico = slash.path __dirname + '/../bin/Quick_Any2Ico.exe'
        
        if false #slash.isFile any2Ico
        
            childp.exec "\"#{any2Ico}\" -formats=512 -res=\"#{exePath}\" -icon=\"#{pngPath}\"", {}, (err,stdout,stderr) -> 
                if not err? 
                    cb pngPath
                else
                    if slash.ext(exePath)!= 'lnk'
                        error stdout, stderr, err
                    cb()
        else
            wxw = require 'wxw'
            wxw 'icon' exePath, pngPath
            cb pngPath
        
module.exports = File

###
000   000   0000000    0000000  000   000  00000000  000       0000000  00000000  000000000
000  000   000   000  000       000   000  000       000      000       000          000   
0000000    000000000  000       000000000  0000000   000      0000000   0000000      000   
000  000   000   000  000       000   000  000       000           000  000          000   
000   000  000   000   0000000  000   000  00000000  0000000  0000000   00000000     000   
###

{ post, prefs, klog } = require 'kxk'

electron = require 'electron'

class KachelSet

    @: (mainId) ->
        
        @focusKachel = null
        @dict  = "#{mainId}": 'main'
        @wids  = main:mainId
        @set   = []
        @sid   = ''
        
        post.on 'kachelLoad'  @onKachelLoad
        post.on 'toggleSet'   @onToggleSet
        post.on 'newSet'      @onNewSet
        post.on 'kachelFocus' @onKachelFocus
            
    # 00000000   0000000    0000000  000   000   0000000  
    # 000       000   000  000       000   000  000       
    # 000000    000   000  000       000   000  0000000   
    # 000       000   000  000       000   000       000  
    # 000        0000000    0000000   0000000   0000000   
    
    onKachelFocus: (winId) =>
    
        # klog 'on focus' @dict[winId]
        if @dict[winId] != 'main'
            @focusKachel = electron.BrowserWindow.fromId winId

    # 000   000  00000000  000   000  
    # 0000  000  000       000 0 000  
    # 000 0 000  0000000   000000000  
    # 000  0000  000       000   000  
    # 000   000  00000000  00     00  
    
    onNewSet: =>
        
        sets = prefs.get 'sets' ['']
        sets.push "#{sets.length}"
        prefs.set 'sets' sets
        @load sets[-1]
        
    # 000000000   0000000    0000000    0000000   000      00000000  
    #    000     000   000  000        000        000      000       
    #    000     000   000  000  0000  000  0000  000      0000000   
    #    000     000   000  000   000  000   000  000      000       
    #    000      0000000    0000000    0000000   0000000  00000000  
    
    onToggleSet: =>
        
        sets = prefs.get 'sets' ['']
        index = Math.max 0, sets.indexOf(@sid)
        
        if index >= sets.length-1 then index = -1
        @load sets[index+1]
        
    # 000       0000000    0000000   0000000    
    # 000      000   000  000   000  000   000  
    # 000      000   000  000000000  000   000  
    # 000      000   000  000   000  000   000  
    # 0000000   0000000   000   000  0000000    
    
    load: (newSid) ->
                
        newSid ?= prefs.get 'set' ''
        
        oldKacheln = prefs.get "kacheln#{@sid}" []

        @kachelIds = []
        updateIds = ['main']
        showIds = []
        newSet = prefs.get "kacheln#{newSid}" []
        # oldLen = newSet.length
        # newSet = newSet.filter (i) -> i not in ['main' 'kachel' 'appl' 'folder' 'file' 'null' 'undefined' null undefined]
        # klog 'newSet' oldLen, newSet.length

        for kachelId in newSet ? []
            if kachelId != 'main'
                if @set.indexOf(kachelId) >= 0
                    updateIds.push kachelId
                    @set.splice @set.indexOf(kachelId), 1
                else
                    showIds.push kachelId
                    if not @wids[kachelId]
                        @kachelIds.push kachelId

        if @set.length
            for kachelId in @set.slice()
                if kachelId not in ['main' 'null' null]
                    if @wids[kachelId]
                        @win(kachelId).hide()
                    else
                        klog 'no wid for' kachelId
        
        prefs.set "kacheln#{@sid}" oldKacheln
                    
        @sid = newSid
        prefs.set 'set' @sid
                    
        @set = newSet
        
        for kachelId in updateIds
            post.emit 'updateBounds' kachelId

        for kachelId in showIds
            post.emit 'newKachel' kachelId
            
        if @kachelIds.length == 0
            # klog 'loaded ++ focus main'
            @win('main').focus()
            post.emit 'setLoaded'
           
    #  0000000   000   000         000       0000000    0000000   0000000    
    # 000   000  0000  000         000      000   000  000   000  000   000  
    # 000   000  000 0 000         000      000   000  000000000  000   000  
    # 000   000  000  0000         000      000   000  000   000  000   000  
    #  0000000   000   000         0000000   0000000   000   000  0000000    
    
    onKachelLoad: (wid, kachelId) =>
        
        if kachelId not in @set
            @set.push kachelId 
            prefs.set "kacheln#{@sid}" @set
        
        @dict[wid] = kachelId
        @wids[kachelId] = wid
        
        if @kachelIds
            index = @kachelIds.indexOf kachelId
            if index >= 0
                @kachelIds.splice index, 1
                if @kachelIds.length == 0
                    # klog 'set loaded -- focus main'
                    @win('main').focus()
                    post.emit 'setLoaded'
            else
                klog 'unknown kachel?' kachelId

    # 00000000   00000000  00     00   0000000   000   000  00000000  
    # 000   000  000       000   000  000   000  000   000  000       
    # 0000000    0000000   000000000  000   000   000 000   0000000   
    # 000   000  000       000 0 000  000   000     000     000       
    # 000   000  00000000  000   000   0000000       0      00000000  
    
    remove: (kachel) ->
        
        if @focusKachel == kachel
            @focusKachel = null
        
        if kachelId = @dict[kachel.id]
            if @set.indexOf(kachelId) >= 0
                @set.splice @set.indexOf(kachelId), 1
            delete @wids[kachelId]
            delete @dict[kachel.id]
            # klog "prefs remove from #{@sid}" kachelId
            prefs.set "kacheln#{@sid}" @set
                
    win: (kachelId) ->
            
        electron.BrowserWindow.fromId @wids[kachelId]
        
module.exports = KachelSet

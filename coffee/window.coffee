###
000   000  000  000   000  0000000     0000000   000   000  
000 0 000  000  0000  000  000   000  000   000  000 0 000  
000000000  000  000 0 000  000   000  000   000  000000000  
000   000  000  000  0000  000   000  000   000  000   000  
00     00  000  000   000  0000000     0000000   00     00  
###

{ post, win, prefs, $, _ } = require 'kxk'

electron = require 'electron'

w = new win 
    dir:     __dirname
    pkg:     require '../package.json'
    menu:    '../coffee/menu.noon'
    icon:    '../img/menu@2x.png'
    context: (items) -> onContext items
    
main =$ '#main'    

post.on 'combo', (combo, info) ->

onContext = (items) -> items
    
# 00     00  00000000  000   000  000   000
# 000   000  000       0000  000  000   000
# 000000000  0000000   000 0 000  000   000
# 000 0 000  000       000  0000  000   000
# 000   000  00000000  000   000   0000000 

post.on 'menuAction', (action) ->
    
    switch action
        when 'New' then post.toMain 'newKachel'
            
onMouseDown = (event) ->
    
window.onload = -> 
    
    main.addEventListener 'mouseup', onMouseDown
        

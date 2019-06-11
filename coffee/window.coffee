###
000   000  000  000   000  0000000     0000000   000   000  
000 0 000  000  0000  000  000   000  000   000  000 0 000  
000000000  000  000 0 000  000   000  000   000  000000000  
000   000  000  000  0000  000   000  000   000  000   000  
00     00  000  000   000  0000000     0000000   00     00  
###

{ post, elem, win, $, _ } = require 'kxk'

w = new win 
    dir:     __dirname
    pkg:     require '../package.json'
    menu:   '../coffee/menu.noon'
    
main =$ '#main'

# 00     00  00000000  000   000  000   000
# 000   000  000       0000  000  000   000
# 000000000  0000000   000 0 000  000   000
# 000 0 000  000       000  0000  000   000
# 000   000  00000000  000   000   0000000 

post.on 'menuAction', (action) ->
    log 'menuAction', action
    switch action
        when 'New' then post.toMain 'newKachel'
            
window.onload = -> 
    
    main.appendChild elem 'img', class:'kachelImg', src:__dirname + '/../img/about.png'

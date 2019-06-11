###
000   000   0000000    0000000  000   000  00000000  000        
000  000   000   000  000       000   000  000       000        
0000000    000000000  000       000000000  0000000   000        
000  000   000   000  000       000   000  000       000        
000   000  000   000   0000000  000   000  00000000  0000000    
###

{ post, elem, win, $, _ } = require 'kxk'

w = new win 
    dir:     __dirname
    pkg:     require '../package.json'
    
main =$ '#main'

# 00     00  00000000  000   000  000   000
# 000   000  000       0000  000  000   000
# 000000000  0000000   000 0 000  000   000
# 000 0 000  000       000  0000  000   000
# 000   000  00000000  000   000   0000000 

post.on 'menuAction', (action) ->
    
    switch action
        when 'New' then post.toMain 'newKachel'
            
window.onload = -> 
    
    # main.appendChild elem 'img', class:'kachelImg', src:__dirname + '/../img/about.png'

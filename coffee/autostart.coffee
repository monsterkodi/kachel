###
 0000000   000   000  000000000   0000000    0000000  000000000   0000000   00000000   000000000
000   000  000   000     000     000   000  000          000     000   000  000   000     000   
000000000  000   000     000     000   000  0000000      000     000000000  0000000       000   
000   000  000   000     000     000   000       000     000     000   000  000   000     000   
000   000   0000000      000      0000000   0000000      000     000   000  000   000     000   
###

{ os, post, slash } = require 'kxk'

wxw = require 'wxw'

autoStart = ->

    if os.platform() == 'win32'
        wxw 'taskbar' 'toggle'
        post.emit 'screensize'
    
    # for f in ['klog' 'kappo' 'knot' 'clippo' 'konrad' 'ko' 'keks']
    for f in ['clippo']
        exe = slash.resolve "~/s/#{f}/#{f}-#{process.platform}-#{process.arch}/#{f}.exe"
        if slash.isFile exe
            wxw 'launch' exe            
    
module.exports = autoStart

###
 0000000  000   000   0000000  0000000    000   0000000  000   000  
000        000 000   000       000   000  000  000       000   000  
0000000     00000    0000000   000   000  000  0000000   000000000  
     000     000          000  000   000  000       000  000   000  
0000000      000     0000000   0000000    000  0000000   000   000  
###

{ post, elem, klog, _ } = require 'kxk'

utils   = require './utils'
Kachel  = require './kachel'

class Sysdish extends Kachel
        
    @: (@kachelId:'sysdish') -> 
        
        super
        
        @requestData 'sysinfo'
    
    onData: (data) =>
        
        @main.innerHTML = ''
        svg = utils.svg clss:'clock'
        @main.appendChild svg
        
        # 000   0000000   
        # 000  000   000  
        # 000  000   000  
        # 000  000   000  
        # 000   0000000   
        
        if data.dsk?
        
            pie = utils.circle clss:'sysdish_disk_bgr' svg:svg
            utils.pie svg:pie, clss:'sysdish_disk_read'  angle:180*data.dsk.r_sec/data.dsk.r_max
            utils.pie svg:pie, clss:'sysdish_disk_write' angle:180*data.dsk.w_sec/data.dsk.w_max, start:180
        
        # 000   000  00000000  000000000  
        # 0000  000  000          000     
        # 000 0 000  0000000      000     
        # 000  0000  000          000     
        # 000   000  00000000     000     
                
        pie = utils.circle radius:47 clss:'sysdish_net_bgr' svg:svg
        utils.pie svg:pie, radius:47 clss:'sysdish_net_recv' angle:180*data.net.rx_sec/data.net.rx_max
        utils.pie svg:pie, radius:47 clss:'sysdish_net_send' angle:180*data.net.tx_sec/data.net.tx_max, start:180
            
        # 000       0000000    0000000   0000000    
        # 000      000   000  000   000  000   000  
        # 000      000   000  000000000  000   000  
        # 000      000   000  000   000  000   000  
        # 0000000   0000000   000   000  0000000    
        
        pie = utils.circle radius:44 clss:'sysdish_load_bgr' svg:svg
        utils.pie svg:pie, radius:44 clss:'sysdish_load_sys' angle:360*data.cpu.sys
        utils.pie svg:pie, radius:44 clss:'sysdish_load_usr' angle:360*data.cpu.usr
            
        # 00     00  00000000  00     00  
        # 000   000  000       000   000  
        # 000000000  0000000   000000000  
        # 000 0 000  000       000 0 000  
        # 000   000  00000000  000   000  
        
        pie = utils.circle radius:18 clss:'sysdish_mem_bgr' svg:svg
        utils.pie svg:pie, radius:18 clss:'sysdish_mem_used'   angle:360*data.mem.used/data.mem.total
        utils.pie svg:pie, radius:18 clss:'sysdish_mem_active' angle:360*data.mem.active/data.mem.total
                                
module.exports = Sysdish

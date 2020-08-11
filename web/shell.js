const ioterm = require('./ioterm')
const { ipcRenderer } = require('electron')

window.addEventListener('load', run)

function run () { 
    var tio = ioterm("term")
    tio.printHTML ("<b>Sample Forth Interpreter</b>")
    loop(tio)
}


function loop (tio) {
    tio.prompt(". ", async (v) => { 
	const result = await ipcRenderer.invoke('input', v)
        if (result.error) {
            tio.print('ERROR ' + result.error)
        }
        else if (result.definition) {
            tio.print(result.definition)
        }
        else {
            const stack = result.stack.reverse().join(' ')
	    tio.print(stack)
        }
	loop(tio)
    })
}


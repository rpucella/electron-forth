const { app, BrowserWindow, ipcMain } = require('electron')

function createWindow () {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  win.loadFile('web/index.html')
}

app.whenReady().then(createWindow)

let _STACK = []
let _VOCAB = {
    '+': () => {
        has(2)
        const v1 = pop()
        const v2 = pop()
        push(v1 + v2)
    },
    '*': () => {
        has(2)
        const v1 = pop()
        const v2 = pop()
        push(v1 * v2)
    },
    'DUP': () => {
        has(1)
        const v1 = pop()
        push(v1)
        push(v1)
    },
    'DROP': () => {
        has(1)
        const v1 = pop()
    },
    'SWAP': () => {
        has(2)
        const v1 = pop()
        const v2 = pop()
        push(v1)
        push(v2)
    }
}

function push (v) {
    _STACK.push(v)
}

function pop (v) {
    return _STACK.pop()
}

function has (n) {
    if (_STACK.length < n) {
        throw('Need ' + n + ' arguments on stack')
    }
}

ipcMain.handle('input', process)

function eval_definition (terms) {
    if (terms.length < 2) {
        throw 'Need at least 2 words for definition'
    }
    const name = terms[0].toUpperCase()
    _VOCAB[name] = () => eval_words(terms.slice(1))
    return name
}

function eval_words (words) {
    for (let s of words) {
        eval_word(s)
    }
}

function eval_word (word) {
    const s = word.toUpperCase()
    const num = +s
    if (!isNaN(num)) {
        push(num)
    }
    else if (_VOCAB[s]) {
        _VOCAB[s]()
    }
    else { 
        throw ('Unknown word ' + s)
    }
}

function process (event, input) {
    try { 
        const clean_input = (input || '').trim()
        if (!clean_input) {
            return {stack: _STACK}
        }
        const inputs = clean_input.split(/\s+/)
        if (inputs[0] === ':') {
            const name = eval_definition(inputs.slice(1))
            return {definition: name}
        }
        eval_words(inputs)
        return {stack: _STACK}
    }
    catch(err) {
        return {error: err}
    }
}

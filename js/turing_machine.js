function TuringMachine() {
    this.tape = new Tape()
    this.states = {}
    this.alphabet = new Set()
}

TuringMachine.prototype.AddState = function(stateName, state) {
    this.states[stateName] = state

    for (let char of Object.keys(state))
        this.alphabet.add(char)
}

TuringMachine.prototype.SetWord = function(word) {
    this.tape.SetWord(word)
}

TuringMachine.prototype.GetWord = function(endChar = LAMBDA) {
    return this.tape.GetWord(endChar)
}

TuringMachine.prototype.WriteWord = function(word, dir = 1) {
    this.tape.WriteWord(word, dir)
}

TuringMachine.prototype.Clear = function() {
    this.tape.Clear()
    this.state = HALT
}

TuringMachine.prototype.IsHalt = function(state) {
    return state == HALT || state == HALT_OVERFLOW
}

TuringMachine.prototype.ParseCommand = function(state, currChar) {
    let command = this.states[state][currChar]
    let args = command.split(',')
    let nextChar = currChar
    let move = MOVE_NONE
    let nextState = state

    if (args[0] == '')
        args[0] = LAMBDA

    if (args.length == 3) {
        nextChar = args[0]
        move = args[1]
        nextState = args[2] == '' ? state : args[2]
    }
    else if (args.length == 2) {
        nextChar = args[0]
        move = args[1]
    }
    else if (args[0] == HALT) {
        nextState = HALT
    }
    else if (args[0] == HALT_OVERFLOW) {
        nextState = HALT_OVERFLOW
    }
    else {
        move = args[0]
    }

    return {nextChar, move, nextState}
}

TuringMachine.prototype.OptimizeCommand = function(state, char, nextChar, move, nextState) {
    if (state == nextState && char == nextChar)
        return move

    if (state == nextState)
        return `${nextChar},${move}`

    return `${nextChar},${move},${nextState}`
}

TuringMachine.prototype.Step = function() {
    if (this.IsHalt(this.state))
        return false

    let currChar = this.tape.GetChar()
    let command = this.ParseCommand(this.state, currChar)

    this.tape.SetChar(command.nextChar)
    this.tape.Move(command.move)
    this.state = command.nextState

    return !this.IsHalt(this.state)
}

TuringMachine.prototype.Run = function(state) {
    this.state = state

    while (this.Step())
        ;

    return this.GetWord()
}

TuringMachine.prototype.SetState = function(state) {
    this.state = state
}

TuringMachine.prototype.InitTapeHTML = function() {
    let tapeDiv = document.getElementById('tape-div')
    tapeDiv.innerHTML = ''

    let borders = this.tape.GetBorders()
    let cells = borders.right - borders.left + 1
    let width = tapeDiv.clientWidth

    this.columns = Math.floor(width / TAPE_CELL_SIZE)
    this.rows = Math.floor((cells + this.columns - 1) / this.columns)
    this.tapeCells = []

    for (let i = 0; i < this.rows; i++) {
        let row = document.createElement('div')
        row.className = 'turing-tape-row'

        for (let j = 0; j < this.columns; j++) {
            let cell = document.createElement('div')
            cell.className = 'turing-tape-cell'
            row.appendChild(cell)
            this.tapeCells[i * this.columns + j] = cell
        }

        tapeDiv.appendChild(row)
    }
}

TuringMachine.prototype.MakeTapeCell = function(cell, char, index) {
    cell.className = 'turing-tape-cell'

    if (this.tape.index == index) {
        cell.classList.add('turing-tape-current-cell')
    }
    else if (char == LAMBDA) {
        cell.classList.add('turing-tape-lambda-cell')
    }
    else if ([ALU_CHAR, MEMORY_CHAR, STACK_CHAR].indexOf(char) > -1) {
        cell.classList.add('turing-tape-system-cell')
    }
    else if (REGISTER_NAMES.indexOf(char) > -1) {
        cell.classList.add('turing-tape-register-cell')
    }
    else if (char == ZERO_FLAG_CHAR || char == CARRY_FLAG_CHAR) {
        cell.classList.add('turing-tape-flag-cell')
    }
    else if (char != '0' && char != '1') {
        cell.classList.add('turing-tape-light-cell')
    }

    cell.innerHTML = (char == LAMBDA ? LAMBDA_CELL : char)
}

TuringMachine.prototype.MakeTapeHTML = function(showedBlocks) {
    let tapeDiv = document.getElementById('tape-div')
    let borders = this.tape.GetBorders()
    let cells = borders.right - borders.left + 1
    let width = tapeDiv.clientWidth

    let columns = Math.floor(width / TAPE_CELL_SIZE)
    let rows = Math.floor((cells + columns - 1) / columns)

    if (columns != this.columns || rows != this.rows)
        this.InitTapeHTML()

    let startBlock = null

    for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
            let index = i * this.columns + j
            let char = this.tape.GetCharAt(index)
            let cell = this.tapeCells[index]

            this.MakeTapeCell(cell, char, index)

            if (PARTS_ORDER.indexOf(char) > -1) {
                startBlock = char
            }
            else if (char == LAMBDA) {
                startBlock = null
            }

            if (showedBlocks.indexOf(startBlock) > -1)
                cell.style.background = INFO_BLOCKS_COLORS[startBlock].background
            else
                cell.style.background = ''
        }
    }
}

TuringMachine.prototype.MakeNamedRow = function(names, classNames = null) {
    let row = document.createElement('div')
    row.className = 'turing-states-row'

    for (let i = 0; i < names.length; i++) {
        let cell = document.createElement('div')
        cell.className = 'turing-states-cell'

        if (classNames != null && classNames[i])
            cell.classList.add(classNames[i])

        cell.innerHTML = names[i]
        row.appendChild(cell)
    }

    return row
}

TuringMachine.prototype.MakeHeaderRow = function(alphabet) {
    let names = ['Состояние']
    let classNames = ['']
    let currChar = this.tape.GetChar()

    for (let char of alphabet) {
        names.push(char == LAMBDA ? LAMBDA_CELL : char)
        classNames.push(char == currChar && !this.IsHalt(this.state) ? 'turing-states-active-char' : '')
    }

    return this.MakeNamedRow(names, classNames)
}

TuringMachine.prototype.MakeStateRow = function(state, alphabet) {
    let names = [`q<sub>${state}</sub>`]
    let classNames = [state == this.state ? 'turing-states-active-state' : '']

    for (let char of alphabet) {
        if (char in this.states[state]) {
            let command = this.ParseCommand(state, char)

            let prevChar = char == LAMBDA ? LAMBDA_CELL : char
            let nextChar = command.nextChar == LAMBDA ? LAMBDA_CELL : command.nextChar

            let prevState = this.IsHalt(state) ? `q<sub>halt</sub>` : `q<sub>${state}</sub>`
            let nextState = this.IsHalt(command.nextState) ? `q<sub>halt</sub>` : `q<sub>${command.nextState}</sub>`

            names.push(this.OptimizeCommand(prevState, prevChar, nextChar, command.move, nextState))
        }
        else {
            names.push('')
        }

        if (state == this.state && char == this.tape.GetChar())
            classNames.push('turing-states-active-cell')
        else
            classNames.push('')
    }

    return this.MakeNamedRow(names, classNames)
}

TuringMachine.prototype.GetCommandStates = function() {
    let currStates = new Set()
    let currAlphabet = new Set()

    for (let queue = [this.state]; queue.length > 0;) {
        let state = queue.shift()

        if (currStates.has(state) || this.IsHalt(state))
            continue

        for (let char of Object.keys(this.states[state])) {
            let nextState = this.ParseCommand(state, char).nextState
            currAlphabet.add(char)
            queue.push(nextState)
        }

        currStates.add(state)
    }

    let indices = {}

    for (let i = 0; i < TURING_STATES.length; i++)
        indices[TURING_STATES[i].name] = i

    currStates = Array.from(currStates).sort((a, b) => indices[a] - indices[b])

    return {states: currStates, alphabet: currAlphabet}
}

TuringMachine.prototype.MakeStates = function(states) {
    let curr = this.GetCommandStates(this.state)
    let alphabet = Array.from(curr.alphabet)

    states.appendChild(this.MakeHeaderRow(alphabet))

    for (let state of curr.states)
        states.appendChild(this.MakeStateRow(state, alphabet))
}

TuringMachine.prototype.ToHTML = function(showedBlocks, showStates) {
    this.MakeTapeHTML(showedBlocks)

    let states = document.getElementById('states-div')
    states.innerHTML = ''

    if (showStates && this.state && !this.IsHalt(this.state))
        this.MakeStates(states)
}

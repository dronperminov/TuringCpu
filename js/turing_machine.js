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
    return state == HALT
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
    else {
        move = args[0]
    }

    return {nextChar, move, nextState}
}

TuringMachine.prototype.OptimizeCommand = function(state, char, nextChar, move, nextState) {
    if (state == nextState && char == nextChar)
        return move

    if (state == nextState)
        return `${nextChar}, ${move}`

    return `${nextChar}, ${move}, ${nextState}`
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
            cell.style.width = `${TAPE_CELL_SIZE}px`
            cell.style.height = `${TAPE_CELL_SIZE}px`
            row.appendChild(cell)
            this.tapeCells[i * this.columns + j] = cell
        }

        tapeDiv.appendChild(row)
    }
}

TuringMachine.prototype.MakeTapeCell = function(cell, char, index, begin, end, skipProg) {
    cell.className = 'turing-tape-cell'

    if (this.tape.index == index) {
        cell.classList.add('turing-tape-current-cell')
    }
    else if (char == LAMBDA) {
        cell.classList.add('turing-tape-lambda-cell')
    }
    else if ([ALU_CHAR, MEMORY_CHAR, STACK_CHAR, PROGRAM_CHAR, PROGRAM_END_CHAR].indexOf(char) > -1) {
        cell.classList.add('turing-tape-system-cell')
    }
    else if (REGISTER_NAMES.indexOf(char) > -1 && skipProg) {
        cell.classList.add('turing-tape-register-cell')
    }
    else if (char == ZERO_FLAG_CHAR || char == CARRY_FLAG_CHAR) {
        cell.classList.add('turing-tape-flag-cell')
    }
    else if (COMMANDS.map((v) => v.name).indexOf(char) > -1 && !skipProg) {
        cell.classList.add('turing-tape-command-cell')
    }
    else if (REGISTER_NAMES.indexOf(char) > -1 && !skipProg) {
        cell.classList.add('turing-tape-register-command-cell')
    }
    else if (char != '0' && char != '1') {
        cell.classList.add('turing-tape-light-cell')
    }

    if (begin <= index && index <= end) {
        cell.classList.add('turing-tape-curr-instruction-cell')
    }

    cell.innerHTML = (char == LAMBDA ? LAMBDA_CELL : char)
}

TuringMachine.prototype.MakeTapeHTML = function(showedBlocks, currInstructionBegin, currInstructionEnd) {
    let tapeDiv = document.getElementById('tape-div')
    let borders = this.tape.GetBorders()
    let cells = borders.right - borders.left + 1
    let width = tapeDiv.clientWidth

    let columns = Math.floor(width / TAPE_CELL_SIZE)
    let rows = Math.floor((cells + columns - 1) / columns)

    if (columns != this.columns || rows != this.rows)
        this.InitTapeHTML()

    let startBlock = null
    let skipProg = false

    for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
            let index = i * this.columns + j
            let char = this.tape.GetCharAt(index)
            let cell = this.tapeCells[index]

            this.MakeTapeCell(cell, char, index, currInstructionBegin, currInstructionEnd, skipProg)

            if (char == PROGRAM_END_CHAR)
                skipProg = true

            if (!skipProg)
                continue

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

TuringMachine.prototype.ToHTML = function(showedBlocks, showState, currInstructionBegin, currInstructionEnd) {
    this.MakeTapeHTML(showedBlocks, currInstructionBegin, currInstructionEnd)

    let stateDiv = document.getElementById('state-div')
    stateDiv.innerHTML = ''

    if (!showState)
        return

    let char = this.tape.GetChar()
    stateDiv.innerHTML += `<b>Текущее состояние</b>: ${this.state == HALT ? 'останов' : this.state}<br>`
    stateDiv.innerHTML += `<b>Текущий символ</b>: ${char.replace(LAMBDA, LAMBDA_CELL)}<br>`

    if (this.state != HALT) {
        let command = this.ParseCommand(this.state, char)
        command = this.OptimizeCommand(this.state, char.replace(LAMBDA, LAMBDA_CELL), command.nextChar.replace(LAMBDA, LAMBDA_CELL), command.move, command.nextState)
        stateDiv.innerHTML += `<b>Переход</b>: ${command}<br>`
    }
}

TuringMachine.prototype.DFS = function(state, visited) {
    visited[state] = true

    for (let char of Object.keys(this.states[state])) {
        let cmd = this.ParseCommand(state, char)
        if (visited[cmd.nextState] || cmd.nextState == HALT)
            continue

        this.DFS(cmd.nextState, visited)
    }
}

TuringMachine.prototype.ShowAllStates = function() {
    let all = []
    for (let state of Object.keys(this.states)) {
        let val = []

        for (let char of this.alphabet)
            val.push(char in this.states[state] ? this.states[state][char] : 'N')

        all.push(val.join('='))
    }

    for (let i = 0; i < all.length; i++) {
        let index = all.indexOf(all[i], i + 1)

        if (index > -1)
            console.log(Object.keys(this.states)[i], Object.keys(this.states)[index])
    }

    let visited = {}

    for (let state of Object.keys(this.states))
        visited[state] = false

    this.DFS(RUN_STATE, visited)

    for (let state of Object.keys(this.states))
        if (!visited[state])
            console.log(state)
}
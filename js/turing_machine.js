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

TuringMachine.prototype.Step = function() {
    if (this.state == HALT || this.state == HALT_OVERFLOW)
        return false

    let currChar = this.tape.GetChar()
    let command = this.ParseCommand(this.state, currChar)

    this.tape.SetChar(command.nextChar)
    this.tape.Move(command.move)
    this.state = command.nextState

    return this.state != HALT && this.state != HALT_OVERFLOW
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

TuringMachine.prototype.MakeTapeCell = function(index) {
    let cell = document.createElement('div')
    cell.className = 'turing-tape-cell'

    let char = this.tape.GetCharAt(index)

    if (this.tape.index == index) {
        cell.classList.add('turing-tape-current-cell')
    }
    else if (char == LAMBDA) {
        cell.classList.add('turing-tape-lambda-cell')
    }
    else if ([BEGIN_CHAR, ALU_CHAR, MEMORY_CHAR, STACK_CHAR].indexOf(char) > -1) {
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
    return cell
}

TuringMachine.prototype.MakeTapeHTML = function(div) {
    let tapeDiv = document.createElement('div')
    tapeDiv.className = 'turing-tape'

    let borders = this.tape.GetBorders()
    let cells = borders.right - borders.left + 1

    let width = div.clientWidth
    let columns = Math.floor(width / TAPE_CELL_SIZE)
    let rows = Math.floor((cells + columns - 1) / columns)

    for (let i = 0; i < rows; i++) {
        let row = document.createElement('div')
        row.className = 'turing-tape-row'

        for (let j = 0; j < columns; j++)
            row.appendChild(this.MakeTapeCell(i * columns + j))

        tapeDiv.appendChild(row)
    }

    div.appendChild(tapeDiv)
}

TuringMachine.prototype.ToHTML = function(divId = 'machine-box') {
    let div = document.getElementById(divId)
    div.innerHTML = ''
    this.MakeTapeHTML(div)
}

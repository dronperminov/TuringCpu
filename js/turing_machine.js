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

TuringMachine.prototype.Step = function() {
    if (this.state == HALT)
        return false

    let currChar = this.tape.GetChar()
    let command = this.ParseCommand(this.state, currChar)

    this.tape.SetChar(command.nextChar)
    this.tape.Move(command.move)
    this.state = command.nextState

    return this.state != HALT
}

TuringMachine.prototype.Run = function(state) {
    this.state = state

    while (this.Step())
        ;

    return this.GetWord()
}

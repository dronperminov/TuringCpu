function TuringCpu(bitDepth, memoryCount) {
    this.bitDepth = bitDepth
    this.memoryCount = memoryCount
    this.codeInput = new HighlightInput('code-editable-box', 'code-highlight-box', HIGHTLIGHT_RULES)

    this.InitControls()
    this.Compile()
    this.Reset()
    this.RunProcess()

}

TuringCpu.prototype.InitControls = function() {
    this.runBtn = document.getElementById('run-btn')
    this.stepBtn = document.getElementById('step-btn')
    this.resetBtn = document.getElementById('reset-btn')
    this.compileBtn = document.getElementById('compile-btn')
    this.stepByInstructionsBox = document.getElementById('step-by-instructions-box')

    this.runBtn.addEventListener('click', () => this.Run())
    this.stepBtn.addEventListener('click', () => { this.Stop(); this.Step() })
    this.resetBtn.addEventListener('click', () => this.Reset())
    this.compileBtn.addEventListener('click', () => { this.Reset(); this.Compile() })

    window.addEventListener('resize', () => this.turing.ToHTML())
}

TuringCpu.prototype.InitTuringALU = function() {
    let alu = []
    let aluBits = this.bitDepth * 3 + 3

    alu.push(ALU_CHAR)

    for (let i = 0; i < aluBits; i++)
        alu.push(LAMBDA)

    return alu
}

TuringCpu.prototype.InitTuringRegisters = function() {
    let registers = []

    for (let register of REGISTER_NAMES) {
        registers.push(register)

        for (let i = 0; i < this.bitDepth; i++)
            registers.push('0')

        registers.push(LAMBDA)
    }

    return registers
}

TuringCpu.prototype.InitTuringMemory = function() {
    let memory = [MEMORY_CHAR]

    memory.push(LAMBDA)
    for (let i = 0; i < this.bitDepth; i++)
            memory.push(LAMBDA)

    for (let i = 0; i < this.memoryCount; i++) {
        memory.push('#')

        for (let i = 0; i < this.bitDepth; i++)
            memory.push('0')

        memory.push(LAMBDA)
    }

    return memory
}

TuringCpu.prototype.InitTuringMoves = function(chars) {
    let moves = [
        {name: 'MOVE-ALU', char: ALU_CHAR },
        {name: 'MOVE-MEMORY', char: MEMORY_CHAR },
        {name: 'MOVE-STACK', char: STACK_CHAR },
        {name: 'MOVE-ZERO-FLAG', char: ZERO_FLAG_CHAR},
        {name: 'MOVE-CARRY-FLAG', char: CARRY_FLAG_CHAR}
    ]

    for (let register of REGISTER_NAMES)
        moves.push({name: `MOVE-REGISTER-${register}`, char: register})

    for (let move of moves) {
        let states = {}

        for (let char of chars)
            states[char] = char != move.char ? 'R' : `${char},R,${HALT}`

        this.turing.AddState(move.name, states)
    }

    let beginState = {}

    for (let char of chars)
        beginState[char] = char != BEGIN_CHAR ? 'L' : `${HALT}`

    this.turing.AddState('MOVE-BEGIN', beginState)
}

TuringCpu.prototype.InitTuring = function() {
    let alu = this.InitTuringALU()
    let flags = [ZERO_FLAG_CHAR, '0', LAMBDA, CARRY_FLAG_CHAR, '0', LAMBDA]
    let registers = this.InitTuringRegisters()
    let memory = this.InitTuringMemory()
    let stack = [STACK_CHAR]

    let word = [BEGIN_CHAR].concat(alu).concat(flags).concat(registers).concat(memory).concat(stack)

    this.turing = new TuringMachine()
    this.turing.SetWord(word.join(''))
    this.turing.ToHTML()

    this.InitTuringMoves(TURING_ALPHABET)

    for (let state of TURING_STATES)
        this.turing.AddState(state.name, JSON.parse(state.transitions))
}

TuringCpu.prototype.SetButtonState = function(button, enabled) {
    if (enabled) {
        button.removeAttribute('disabled')
    }
    else {
        button.setAttribute('disabled', '')
    }
}

TuringCpu.prototype.SetRunButtonsState = function(enabled = true, withReset = false) {
    this.SetButtonState(this.runBtn, enabled)
    this.SetButtonState(this.stepBtn, enabled)

    if (withReset)
        this.SetButtonState(this.resetBtn, enabled)
}

TuringCpu.prototype.HideAllLines = function() {
    for (let instruction of this.program)
        instruction.line.classList.remove('active-line')
}

TuringCpu.prototype.GetFlag = function(name) {
    this.turing.Run("MOVE-BEGIN")
    if (name == ZERO_FLAG) {
        this.turing.Run("MOVE-ZERO-FLAG")
    }
    else if (name == CARRY_FLAG) {
        this.turing.Run("MOVE-CARRY-FLAG")
    }

    return this.turing.GetWord() == "1"
}

// TODO: step by step
TuringCpu.prototype.GetRegisterValue = function(name) {
    this.turing.Run("MOVE-BEGIN")
    return this.turing.Run(`MOVE-REGISTER-${name}`)
}

// TODO: step by step
TuringCpu.prototype.SetRegisterValue = function(name, value) {
    this.turing.Run("MOVE-BEGIN")
    this.turing.Run(`MOVE-REGISTER-${name}`)
    this.turing.WriteWord(value)
}

// TODO: step by step
TuringCpu.prototype.SetMemoryValue = function(address, value) {
    this.turing.Run("MOVE-BEGIN")
    this.turing.Run(`MOVE-MEMORY`)
    this.turing.WriteWord(`${address}I`)
    this.turing.Run("MEMORY-RUN")
    this.turing.WriteWord(value)
}

// TODO: step by step
TuringCpu.prototype.GetMemoryValue = function(address) {
    this.turing.Run("MOVE-BEGIN")
    this.turing.Run(`MOVE-MEMORY`)
    this.turing.WriteWord(`${address}I`)
    return this.turing.Run("MEMORY-RUN")
}

// TODO: step by step
TuringCpu.prototype.PushStack = function(value) {
    this.turing.Run("MOVE-BEGIN")
    this.turing.Run("MOVE-STACK")
    this.turing.Run("PUSH")
    this.turing.WriteWord(value)
}

// TODO: step by step
TuringCpu.prototype.PopStack = function() {
    this.turing.Run("MOVE-BEGIN")
    this.turing.Run("MOVE-STACK")
    this.turing.Run("POP-init")
    let value = this.turing.GetWord()
    this.turing.Run("POP")
    return value
}

TuringCpu.prototype.ConstantToBits = function(value) {
    if (value.startsWith('0b')) {
        value = Number.parseInt(value.substr(2), 2)
    }
    else if (value.endsWith('b')) {
        value = Number.parseInt(value.substr(0, value.length - 1), 2)
    }
    else if (value.startsWith('0o')) {
        value = Number.parseInt(value.substr(2), 8)
    }
    else if (value.startsWith('0x')) {
        value = Number.parseInt(value.substr(2), 16)
    }
    else if (value.endsWith('d')) {
        value = Number.parseInt(value.substr(0, value.length - 1))
    }
    else {
        value = Number.parseInt(value)
    }

    let bits = []

    for (; bits.length != this.bitDepth; value >>= 1)
        bits.push(value & 1)

    return bits.reverse().join('')
}

TuringCpu.prototype.AddressToBits = function(arg) {
    let address = arg.substr(1, arg.length - 2)

    if (IsRegister(address))
        return this.GetRegisterValue(address)

    return this.ConstantToBits(address)
}

TuringCpu.prototype.GetArgumentValue = function(arg) {
    if (IsRegister(arg))
        return this.GetRegisterValue(arg)

    if (IsConstant(arg))
        return this.ConstantToBits(arg)

    let address = this.AddressToBits(arg)
    return this.GetMemoryValue(address)
}

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
    this.compileBtn.addEventListener('click', () => this.Compile())
}

TuringCpu.prototype.InitTuringALU = function() {
    let alu = []
    let aluBits = this.bitDepth * 3 + 5

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
    }

    return memory
}

TuringCpu.prototype.InitTuringMoves = function(chars) {
    let moves = [
        {name: 'MOVE-ALU', char: ALU_CHAR },
        {name: 'MOVE-MEMORY', char: MEMORY_CHAR },
        {name: 'MOVE-STACK', char: STACK_CHAR }
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
    let registers = this.InitTuringRegisters()
    let memory = this.InitTuringMemory()
    let stack = [STACK_CHAR]

    let word = [BEGIN_CHAR].concat(alu).concat(registers).concat(memory).concat(stack)
    let chars = new Set()

    for (let c of word)
        chars.add(c)

    this.turing = new TuringMachine()
    this.turing.SetWord(word.join(''))
    this.turing.ToHTML()

    this.InitTuringMoves(chars)
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

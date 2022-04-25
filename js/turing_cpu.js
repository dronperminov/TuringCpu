function TuringCpu(bitDepth, memoryCount) {
    this.bitDepth = bitDepth
    this.memoryCount = memoryCount
    this.codeInput = new HighlightInput('code-editable-box', 'code-highlight-box', HIGHTLIGHT_RULES)

    this.InitControls()
    this.InitRegisterBlocks()
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
    this.skipArgumentsBox = document.getElementById('skip-arguments-box')

    this.runBtn.addEventListener('click', () => this.Run())
    this.stepBtn.addEventListener('click', () => { this.Stop(); this.Step() })
    this.resetBtn.addEventListener('click', () => this.Reset())
    this.compileBtn.addEventListener('click', () => { this.Reset(); this.Compile() })

    window.addEventListener('resize', () => this.UpdateView())
}

TuringCpu.prototype.InitRegisterBlocks = function() {
    let div = document.getElementById('values-box')
    div.innerHTML = ''

    this.registerBlocks = {}

    for (let name of REGISTER_NAMES) {
        let block = this.MakeRegisterBlock(name)
        this.registerBlocks[name] = block
        div.appendChild(block.div)
    }
}

TuringCpu.prototype.MakeRegisterBlock = function(name) {
    let div = document.createElement('div')
    div.className = 'register-block'
    div.style.background = REGISTER_COLORS[name].background
    div.style.borderColor = REGISTER_COLORS[name].border

    let nameBox = document.createElement('div')
    let showBox = document.createElement('div')
    let valueBox = document.createElement('div')
    let decimalBox = document.createElement('div')

    let label = document.createElement("label")
    let checkbox = document.createElement("input")
    checkbox.type = 'checkbox'
    checkbox.id = `show-register-${name}-box`
    checkbox.addEventListener('change', () => this.UpdateView())

    label.innerHTML = 'Показать'
    label.setAttribute('for', checkbox.id)

    showBox.appendChild(checkbox)
    showBox.appendChild(label)

    nameBox.className = "register-name"
    showBox.className = "register-show"
    valueBox.className = "register-value"
    decimalBox.className = "register-decimal-value"

    nameBox.innerHTML = name

    div.appendChild(nameBox)
    div.appendChild(showBox)
    div.appendChild(valueBox)
    div.appendChild(decimalBox)

    return {div, nameBox, showBox, valueBox, decimalBox}
}

TuringCpu.prototype.InitTuringALU = function() {
    let alu = []
    let aluBits = this.bitDepth * 3 + 3

    alu.push(ALU_CHAR)

    for (let i = 0; i < aluBits; i++)
        alu.push(LAMBDA)

    return alu
}

TuringCpu.prototype.InitTuringRegister = function(name) {
    let register = [name]

    for (let i = 0; i < this.bitDepth; i++)
        register.push('0')

    register.push(LAMBDA)
    return register
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
        let leftStates = {}
        let rightStates = {}
        let rightName = `${move.name}-RIGHT`
        let targetIndex = PARTS_ORDER.indexOf(move.char)

        for (let char of chars) {
            let index = PARTS_ORDER.indexOf(char)

            if (char == BEGIN_CHAR) {
                leftStates[char] = `${char},R,${rightName}`
            }
            else if (index == -1 || index >= targetIndex)
                leftStates[char] = char != move.char ? 'L' : `${char},R,${HALT}`
            else
                leftStates[char] = `${char},R,${rightName}`

            if (index == -1 || index <= targetIndex)
                rightStates[char] = char != move.char ? 'R' : `${char},R,${HALT}`
        }

        this.turing.AddState(move.name, leftStates)
        this.turing.AddState(`${rightName}`, rightStates)
    }

    let beginState = {}

    for (let char of chars)
        beginState[char] = char != BEGIN_CHAR ? 'L' : `${HALT}`

    this.turing.AddState('MOVE-BEGIN', beginState)
}

TuringCpu.prototype.InitTuring = function() {
    let parts = {}
    parts[ALU_CHAR] = this.InitTuringALU()
    parts[ZERO_FLAG_CHAR] = [ZERO_FLAG_CHAR, '0', LAMBDA]
    parts[CARRY_FLAG_CHAR] = [CARRY_FLAG_CHAR, '0', LAMBDA]

    for (let name of REGISTER_NAMES)
        parts[name] = this.InitTuringRegister(name)

    parts[MEMORY_CHAR] = this.InitTuringMemory()
    parts[STACK_CHAR] = [STACK_CHAR]

    let word = [BEGIN_CHAR]

    for (let char of PARTS_ORDER)
        word = word.concat(parts[char])

    this.turing = new TuringMachine('machine-box')
    this.turing.SetWord(word.join(''))

    this.InitTuringMoves(TURING_ALPHABET)

    for (let state of TURING_STATES)
        this.turing.AddState(state.name, JSON.parse(state.transitions))

    this.UpdateView()
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
    if (name == ZERO_FLAG) {
        this.turing.Run("MOVE-ZERO-FLAG")
    }
    else if (name == CARRY_FLAG) {
        this.turing.Run("MOVE-CARRY-FLAG")
    }

    return this.turing.GetWord() == "1"
}

TuringCpu.prototype.GetRegisterValue = function(name, setWord) {
    this.taskQueue.push({ type: RUN_TASK, state: `MOVE-REGISTER-${name}`, skip: true})
    this.taskQueue.push({ type: READ_WORD_TASK, setWord: setWord, skip: true })
}

TuringCpu.prototype.SetRegisterValue = function(name, getWord) {
    this.taskQueue.push({type: RUN_TASK, state: `MOVE-REGISTER-${name}`, skip: true})
    this.taskQueue.push({type: WRITE_WORD_TASK, getWord: getWord, skip: true})
}

TuringCpu.prototype.GetMemoryValue = function(setWord) {
    this.taskQueue.push({type: RUN_TASK, state: `MOVE-MEMORY`, skip: true})
    this.taskQueue.push({type: WRITE_WORD_TASK, getWord: () => `${this.address}I`, skip: true})
    this.taskQueue.push({type: RUN_TASK, state: `MEMORY-RUN`, skip: true})
    this.taskQueue.push({ type: READ_WORD_TASK, setWord: setWord, skip: true })
}

TuringCpu.prototype.SetMemoryValue = function(getWord) {
    this.taskQueue.push({type: RUN_TASK, state: `MOVE-MEMORY`, skip: true})
    this.taskQueue.push({type: WRITE_WORD_TASK, getWord: () => `${this.address}I`, skip: true})
    this.taskQueue.push({type: RUN_TASK, state: `MEMORY-RUN`, skip: true})
    this.taskQueue.push({type: WRITE_WORD_TASK, getWord: getWord, skip: true})
}

TuringCpu.prototype.ConstantToBits = function(value, result) {
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

    let constant = bits.reverse().join('')
    this.taskQueue.push({ type: READ_WORD_TASK, setWord: (word) => result(constant) })
}

TuringCpu.prototype.AddressToBits = function(arg, word) {
    let address = arg.substr(1, arg.length - 2)

    if (IsRegister(address)) {
        this.GetRegisterValue(address, word)
    }
    else {
        this.ConstantToBits(address, word)
    }
}

TuringCpu.prototype.GetArgumentValue = function(arg, word) {
    if (IsRegister(arg)) {
        this.GetRegisterValue(arg, word)
    }
    else if (IsConstant(arg)) {
        this.ConstantToBits(arg, word)
    }
    else {
        this.AddressToBits(arg, (address) => this.address = address)
        this.GetMemoryValue(word)
    }
}

TuringCpu.prototype.SetArgumentValue = function(arg, value) {
    if (IsRegister(arg)) {
        this.SetRegisterValue(arg, value)
    }
    else if (IsAddress(arg)) {
        this.AddressToBits(arg, (address) => this.address = address)
        this.SetMemoryValue(value)
    }
    else {
        throw `invalid argument for SetValue: "${arg}"`
    }
}

TuringCpu.prototype.GetRegisterValues = function() {
    let registers = {}
    let chars = this.turing.tape.positive

    for (let i = 0; i < chars.length; i++) {
        if (REGISTER_NAMES.indexOf(chars[i]) > -1)
            registers[chars[i]] = chars.slice(i + 1, i + 1 + this.bitDepth).join('')
    }

    return registers
}

TuringCpu.prototype.UpdateView = function() {
    let registers = []
    let values = this.GetRegisterValues()

    for (let name of REGISTER_NAMES) {
        let value = values[name]
        let decimal = Number.parseInt(value, 2)
        let id = `show-register-${name}-box`

        this.registerBlocks[name].valueBox.innerHTML = `${value}<sub>2</sub>`
        this.registerBlocks[name].decimalBox.innerHTML = `${decimal}<sub>10</sub>`

        if (document.getElementById(id).checked)
            registers.push(name)
    }

    this.turing.ToHTML(registers)
}
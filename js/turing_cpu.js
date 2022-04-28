function TuringCpu(bitDepth, memoryCount) {
    this.bitDepth = bitDepth
    this.memoryCount = memoryCount
    this.codeInput = new HighlightInput('code-editable-box', 'code-highlight-box', HIGHTLIGHT_RULES)

    this.InitControls()
    this.InitInfoBlocks()
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
    this.showStatesBox = document.getElementById('show-states-box')

    this.runBtn.addEventListener('click', () => this.Run())
    this.stepBtn.addEventListener('click', () => { this.Stop(); this.Step() })
    this.resetBtn.addEventListener('click', () => this.Reset(false))
    this.compileBtn.addEventListener('click', () => this.Reset(true))

    window.addEventListener('resize', () => this.Resize())
}

TuringCpu.prototype.InitInfoBlocks = function() {
    let div = document.getElementById('values-box')
    div.innerHTML = ''

    this.infoBlocks = {}

    for (let name of Object.keys(INFO_BLOCKS_COLORS)) {
        let block = this.MakeInfoBlock(name)
        this.infoBlocks[name] = block
        div.appendChild(block.div)
    }
}

TuringCpu.prototype.MakeInfoBlock = function(name) {
    let div = document.createElement('div')
    div.className = 'info-block'
    div.style.background = INFO_BLOCKS_COLORS[name].background
    div.style.borderColor = INFO_BLOCKS_COLORS[name].border

    let nameBox = document.createElement('div')
    let valueBox = document.createElement('div')

    let label = document.createElement("label")
    let checkbox = document.createElement("input")
    checkbox.type = 'checkbox'
    checkbox.id = `show-register-${name}-box`
    checkbox.addEventListener('change', () => this.UpdateView())

    label.innerHTML = INFO_BLOCKS_COLORS[name].name
    label.setAttribute('for', checkbox.id)

    nameBox.appendChild(checkbox)
    nameBox.appendChild(label)

    nameBox.className = "info-name"
    valueBox.className = "info-value"

    div.appendChild(nameBox)
    div.appendChild(valueBox)

    return {div, nameBox, valueBox}
}

TuringCpu.prototype.InitTuringProgram = function() {
    let program = [PROGRAM_CHAR]

    let labelDepth = 0

    while ((1 << labelDepth) < this.program.length)
        labelDepth++

    console.log(labelDepth, this.program.length)

    for (let i = 0; i < labelDepth; i++)
            program.push(LAMBDA)

    for (let i = 0; i < this.program.length; i++) {
        let instruction = this.program[i]
        let args = instruction.args
        program.push('#')

        if (instruction.type == LABEL_TYPE) {
            let address = this.ConstantToBits(args[0] + '')
            program.push(instruction.command)
            program = program.concat(address)
            program.push(LAMBDA)
        }
        else {
            for (let i = 0; i < args.length; i++) {
                let arg = args[i]

                if (IsAddress(arg)) {
                    program.push('&')
                    arg = arg.substr(1, arg.length - 2)
                }

                if (IsConstant(arg))
                    program = program.concat(this.ConstantToBits(arg, this.bitDepth))
                else
                    program.push(arg)

                if (args.length == 1 || i == 1) {
                    program.push(LAMBDA)
                }
                else if (instruction.command == MOV_CMD.name) {
                    program.push('0')
                }
                else {
                    program.push('1')
                }
            }

            program.push(instruction.command)
            program.push(LAMBDA)
        }
    }

    program.push('#')
    program.push(PROGRAM_END_CHAR)

    return program
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

TuringCpu.prototype.InitTuringMoves = function() {
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

        for (let char of TURING_ALPHABET) {
            let index = PARTS_ORDER.indexOf(char)

            if (index == -1 || index >= targetIndex)
                leftStates[char] = char != move.char ? 'L' : `${char},R,${HALT}`
            else
                leftStates[char] = `${char},R,${rightName}`

            if (index == -1 || index <= targetIndex)
                rightStates[char] = char != move.char ? 'R' : `${char},R,${HALT}`
        }

        this.turing.AddState(move.name, leftStates)
        this.turing.AddState(`${rightName}`, rightStates)
    }
}

TuringCpu.prototype.InitTuringProgramStates = function() {
    let runState = {}
    let returnState = {}
    let fixRegister = {}

    for (let char of TURING_ALPHABET) {
        returnState[char] = char != PROGRAM_CHAR ? 'L' : `${PROGRAM_CHAR},R,${RUN_STATE}`
        runState[char] = 'R'
    }

    returnState['~'] = `${LAMBDA},R,FETCH`

    runState['#'] = '@,R,FETCH'
    runState['@'] = `R`
    runState[PROGRAM_END_CHAR] = HALT

    fixRegister['O'] = `0,R,${FIX_REGISTER_STATE}`
    fixRegister['I'] = `1,R,${FIX_REGISTER_STATE}`
    fixRegister['0'] = `R`
    fixRegister['1'] = `R`
    fixRegister[LAMBDA] = `${LAMBDA},L,${RETURN_RUN_STATE}`

    this.turing.AddState(RUN_STATE, runState)
    this.turing.AddState(RETURN_RUN_STATE, returnState)
    this.turing.AddState(FIX_REGISTER_STATE, fixRegister)
}

TuringCpu.prototype.InitTuring = function() {
    let parts = {}
    parts[PROGRAM_CHAR] = this.InitTuringProgram()
    parts[ALU_CHAR] = this.InitTuringALU()
    parts[ZERO_FLAG_CHAR] = [ZERO_FLAG_CHAR, '0', LAMBDA]
    parts[CARRY_FLAG_CHAR] = [CARRY_FLAG_CHAR, '0', LAMBDA]

    for (let name of REGISTER_NAMES)
        parts[name] = this.InitTuringRegister(name)

    parts[MEMORY_CHAR] = this.InitTuringMemory()
    parts[STACK_CHAR] = [STACK_CHAR]

    let word = []

    for (let char of PARTS_ORDER)
        word = word.concat(parts[char])

    this.turing = new TuringMachine()
    this.turing.SetWord(word)
    this.turing.InitTapeHTML()

    this.InitTuringMoves()
    this.InitTuringProgramStates()
    this.InitTuringFetchStates()

    for (let state of TURING_STATES)
        this.turing.AddState(state.name, JSON.parse(state.transitions))

    this.taskQueue.push({ type: RUN_TASK, state: 'RUN' })
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
    let lines = document.getElementsByClassName("code-line")

    for (let line of lines) {
        line.classList.remove('active-line')
    }
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
    this.taskQueue.push({type: RUN_TASK, state: 'MOVE-MEMORY', skip: true})
    this.taskQueue.push({type: WRITE_WORD_TASK, getWord: () => this.address.concat(['I']), skip: true})
    this.taskQueue.push({type: RUN_TASK, state: 'MEMORY-RUN', skip: true})
    this.taskQueue.push({ type: READ_WORD_TASK, setWord: setWord, skip: true })
}

TuringCpu.prototype.SetMemoryValue = function(getWord) {
    this.taskQueue.push({type: RUN_TASK, state: 'MOVE-MEMORY', skip: true})
    this.taskQueue.push({type: WRITE_WORD_TASK, getWord: () => this.address.concat(['I']), skip: true})
    this.taskQueue.push({type: RUN_TASK, state: 'MEMORY-RUN', skip: true})
    this.taskQueue.push({type: WRITE_WORD_TASK, getWord: getWord, skip: true})
}

TuringCpu.prototype.ConstantToBits = function(value, bitDepth = -1) {
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

    if (bitDepth > -1) {
        for (; bits.length != bitDepth; value >>= 1)
            bits.push((value & 1) + '')
    }
    else {
        for (; value != 0; value >>= 1)
            bits.push((value & 1) + '')

        if (bits.length == 0)
            bits.push('0')
    }

    return bits.reverse()
}

TuringCpu.prototype.AddressToBits = function(arg, setWord) {
    let address = arg.substr(1, arg.length - 2)

    if (IsRegister(address)) {
        this.GetRegisterValue(address, setWord)
    }
    else {
        let constant = this.ConstantToBits(address, this.bitDepth)
        this.taskQueue.push({ type: READ_WORD_TASK, setWord: (word) => setWord(constant) })
    }
}

TuringCpu.prototype.GetArgumentValue = function(arg, setWord) {
    if (IsRegister(arg)) {
        this.GetRegisterValue(arg, setWord)
    }
    else if (IsConstant(arg)) {
        let constant = this.ConstantToBits(arg, this.bitDepth)
        this.taskQueue.push({ type: READ_WORD_TASK, setWord: (word) => setWord(constant) })
    }
    else {
        this.AddressToBits(arg, (address) => this.address = address)
        this.GetMemoryValue(setWord)
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

TuringCpu.prototype.GetInfoValues = function() {
    let values = {}
    let chars = this.turing.tape.positive
    let skipProg = false

    for (let i = 0; i < chars.length; i++) {
        if (chars[i] == PROGRAM_END_CHAR)
            skipProg = true

        if (!skipProg)
            continue

        if (chars[i] in INFO_BLOCKS_COLORS) {
            let len = REGISTER_NAMES.indexOf(chars[i]) > -1 ? this.bitDepth : 1
            values[chars[i]] = chars.slice(i + 1, i + 1 + len).join('')
        }
    }

    return values
}

TuringCpu.prototype.UpdateView = function() {
    let showed = []
    let values = this.GetInfoValues()

    for (let name of Object.keys(INFO_BLOCKS_COLORS)) {
        let value = values[name]
        let decimal = Number.parseInt(value, 2)
        let id = `show-register-${name}-box`

        if (REGISTER_NAMES.indexOf(name) > -1) {
            this.infoBlocks[name].valueBox.innerHTML = `${value}<sub>2</sub><br>${decimal}<sub>10</sub>`
        }
        else {
            this.infoBlocks[name].valueBox.innerHTML = `${value}<br>${value == "1" ? "TRUE" : "FALSE"}`
        }

        if (document.getElementById(id).checked)
            showed.push(name)
    }

    this.turing.ToHTML(showed, this.showStatesBox.checked)
}

TuringCpu.prototype.Resize = function() {
    this.turing.InitTapeHTML()
    this.UpdateView()
}
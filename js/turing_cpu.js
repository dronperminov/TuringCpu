function TuringCpu(bitDepth, memoryCount) {
    this.bitDepth = bitDepth
    this.memoryCount = memoryCount
    this.codeInput = new HighlightInput('code-editable-box', 'code-highlight-box', HIGHTLIGHT_RULES)

    this.InitControls()
    this.InitInfoBlocks()

    this.Reset(true)
    this.RunProcess()
}

TuringCpu.prototype.InitControls = function() {
    this.runBtn = document.getElementById('run-btn')
    this.stepBtn = document.getElementById('step-btn')
    this.resetBtn = document.getElementById('reset-btn')
    this.compileBtn = document.getElementById('compile-btn')

    this.stepTypeBox = document.getElementById('step-type-box')
    this.showStateBox = document.getElementById('show-state-box')
    this.stepsBox = document.getElementById('steps-box')
    this.bitDepthBox = document.getElementById('bit-depth-box')
    this.memoryCountBox = document.getElementById('memory-count-box')

    this.runBtn.addEventListener('click', () => this.Run())
    this.stepBtn.addEventListener('click', () => { this.Stop(); this.Step() })
    this.resetBtn.addEventListener('click', () => this.Reset(false))
    this.compileBtn.addEventListener('click', () => this.Reset(true))

    this.showStateBox.addEventListener('change', () => this.UpdateView())
    this.bitDepthBox.addEventListener('change', () => this.SetBitDepth())
    this.memoryCountBox.addEventListener('change', () => this.SetMemoryCount())

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

TuringCpu.prototype.LabelInstructionToProgramTape = function(instruction) {
    let address = this.ConstantToBits(instruction.args[0] + '')
    let program = [instruction.command]

    if (instruction.command != JMP_CMD.name)
        program.push(LAMBDA)

    program = program.concat(address)
    program.push(LAMBDA)
    return program
}

TuringCpu.prototype.StackInstructionToProgramTape = function(instruction) {
    let arg = instruction.args[0]
    let program = [instruction.command]

    if (IsConstant(arg)) {
        program = program.concat(this.ConstantToBits(arg, this.bitDepth))
    }
    else if (IsAddress(arg)) {
        program.push('&')
        program = program.concat(this.AddressToBits(arg))
    }
    else {
        program.push(arg)
    }

    program.push(LAMBDA)
    return program
}

TuringCpu.prototype.MovInstructionToProgramTape = function(instruction) {
    let program = []
    let arg1 = instruction.args[0]
    let arg2 = instruction.args[1]

    if (IsRegister(arg1)) {
        program.push(arg1)
        program.push('0')
    }
    else {
        program.push('&')
        program = program.concat(this.AddressToBits(arg1))
        program.push(LAMBDA)
    }

    if (IsRegister(arg2)) {
        program.push(arg2)
    }
    else if (IsConstant(arg2)) {
        program = program.concat(this.ConstantToBits(arg2, this.bitDepth))
    }
    else {
        program.push('&')
        program = program.concat(this.AddressToBits(arg2))
    }

    program.push(LAMBDA)
    program.push(instruction.command)
    program.push(LAMBDA)
    return program
}

TuringCpu.prototype.UnaryCommandToProgramTape = function(instruction) {
    let program = []

    program.push(instruction.args[0])
    program.push(LAMBDA)
    program.push(instruction.command)
    program.push(LAMBDA)

    return program
}

TuringCpu.prototype.BinaryInstructionToProgramTape = function(instruction) {
    let program = []
    let arg1 = instruction.args[0]
    let arg2 = instruction.args[1]

    program.push(arg1)
    program.push('1')

    if (IsAddress(arg2)) {
        program.push('&')
        program = program.concat(this.AddressToBits(arg2))
    }
    else if (IsConstant(arg2)) {
        program = program.concat(this.ConstantToBits(arg2, this.bitDepth))
    }
    else {
        program.push(arg2)
    }

    program.push(LAMBDA)
    program.push(instruction.command)
    program.push(LAMBDA)
    return program
}

TuringCpu.prototype.InitTuringProgram = function() {
    let program = [PROGRAM_CHAR]

    this.labelDepth = 0

    while ((1 << this.labelDepth) <= this.program.length)
        this.labelDepth++

    this.labelDepth++

    for (let i = 0; i < this.labelDepth; i++)
        program.push(LAMBDA)

    for (let instruction of this.program) {
        program.push('#')

        if (instruction.type == LABEL_TYPE) {
            program = program.concat(this.LabelInstructionToProgramTape(instruction))
        }
        else if (instruction.command == MOV_CMD.name) {
            program = program.concat(this.MovInstructionToProgramTape(instruction))
        }
        else if (instruction.command == PUSH_CMD.name || instruction.command == POP_CMD.name) {
            program = program.concat(this.StackInstructionToProgramTape(instruction))
        }
        else if (instruction.command == HALT_CMD.name) {
            program.push(HALT_CMD.name)
        }
        else if (instruction.args.length == 1) {
            program = program.concat(this.UnaryCommandToProgramTape(instruction))
        }
        else {
            program = program.concat(this.BinaryInstructionToProgramTape(instruction))
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

    this.memoryDepth = 0

    while ((1 << this.memoryDepth) < memoryCount)
        this.memoryDepth++

    this.memoryDepth = Math.max(this.memoryDepth, this.bitDepth)

    for (let i = 0; i <= this.memoryDepth; i++)
            memory.push(LAMBDA)

    for (let i = 0; i < this.memoryCount; i++) {
        memory.push('#')

        for (let i = 0; i < this.bitDepth; i++)
            memory.push('0')

        memory.push(LAMBDA)
    }

    return memory
}

TuringCpu.prototype.InitTuringProgramStates = function() {
    let runState = {}
    let returnState = {}
    let fixRegister = {}
    let fixOne = {}

    for (let char of TURING_ALPHABET) {
        returnState[char] = 'L'
        runState[char] = 'R'
    }

    returnState[PROGRAM_CHAR] = `${PROGRAM_CHAR},R,${RUN_STATE}`
    returnState['~'] = `${LAMBDA},R,${FETCH_STATE}`
    returnState['O'] = `0,L,${RETURN_RUN_STATE}`
    returnState['I'] = `1,L,${RETURN_RUN_STATE}`
    returnState['@'] = `@,R,${RUN_STATE}`

    runState['#'] = `@,R,${FETCH_STATE}`
    runState['@'] = `R`
    runState[PROGRAM_END_CHAR] = HALT

    fixRegister['O'] = `0,R,${FIX_REGISTER_STATE}`
    fixRegister['I'] = `1,R,${FIX_REGISTER_STATE}`
    fixRegister['0'] = `R`
    fixRegister['1'] = `R`
    fixRegister[LAMBDA] = `${LAMBDA},L,${RETURN_RUN_STATE}`

    fixOne['O'] = `0,L,${RETURN_RUN_STATE}`
    fixOne['I'] = `1,L,${RETURN_RUN_STATE}`

    this.turing.AddState(RUN_STATE, runState)
    this.turing.AddState(RETURN_RUN_STATE, returnState)
    this.turing.AddState(FIX_REGISTER_STATE, fixRegister)
    this.turing.AddState(FIX_ONE_STATE, fixOne)
}

TuringCpu.prototype.InitTuring = function() {
    let parts = {}
    parts[PROGRAM_CHAR] = this.InitTuringProgram()
    parts[ALU_CHAR] = this.InitTuringALU()

    for (let flag of FLAG_CHARS)
        parts[flag] = [flag, '0']

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

    this.InitTuringProgramStates()
    this.InitTuringFetchStates()
    this.InitTuringFlagsStates()

    for (let state of ALU_STATES)
        this.turing.AddState(state.name, JSON.parse(state.transitions))

    this.turing.SetState(RUN_STATE)
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

TuringCpu.prototype.HighlightCurrLine = function() {
    let end = this.turing.tape.positive.indexOf(PROGRAM_END_CHAR)
    let chars = this.turing.tape.positive.slice(0, end)
    let last = chars.lastIndexOf('@')
    let line = 0

    for (let index = last - 1; index >= 0; index--)
        if (chars[index] == '@')
            line++

    this.HideAllLines()

    if (line >= this.program.length)
        return

    let lineDiv = document.getElementById(this.program[line].lineId)
    lineDiv.classList.add('active-line')
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
        value = this.ConvertToUnsigned(value, bitDepth)

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

TuringCpu.prototype.AddressToBits = function(value, bitDepth = -1) {
    value = value.substr(1, value.length - 2)

    if (IsRegister(value))
        return [value]

    return this.ConstantToBits(value, bitDepth)
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
            let value = chars.slice(i + 1, i + 1 + len).join('')
            values[chars[i]] = value.replace(/O/gi, '0').replace(/I/gi, '1')
        }
    }

    let start = chars.lastIndexOf('@')
    let end = chars.indexOf('#', start) - 1

    if (start == -1 && chars[this.turing.tape.index] != PROGRAM_CHAR) {
        start = chars.indexOf(PROGRAM_END_CHAR)
        end = start
    }

    values['curr_begin'] = start
    values['curr_end'] = Math.min(end, chars.indexOf(PROGRAM_END_CHAR))

    return values
}

TuringCpu.prototype.ConvertToSigned = function(value) {
    let decimal = Number.parseInt(value.substr(1), 2)
    let bitDepth = value.length - 1

    if (value.startsWith('1'))
        decimal = -((1 << bitDepth) - decimal)

    return decimal
}

TuringCpu.prototype.ConvertToUnsigned = function(value, bitDepth) {
    if (value >= 0)
        return value

    return (1 << bitDepth) + value
}

TuringCpu.prototype.UpdateView = function() {
    let showed = []
    let values = this.GetInfoValues()

    for (let name of Object.keys(INFO_BLOCKS_COLORS)) {
        let value = values[name]
        let id = `show-register-${name}-box`

        if (REGISTER_NAMES.indexOf(name) > -1) {
            let decimal = Number.parseInt(value, 2)
            let decimalSigned = this.ConvertToSigned(value)
            this.infoBlocks[name].valueBox.innerHTML = `bits: ${value}<br>unsigned: ${decimal}<br>signed: ${decimalSigned}`
        }
        else {
            this.infoBlocks[name].valueBox.innerHTML = `${value}<br>${value == "1" ? "TRUE" : "FALSE"}`
        }

        if (document.getElementById(id).checked)
            showed.push(name)
    }

    this.turing.ToHTML(showed, this.showStateBox.checked, values['curr_begin'], values['curr_end'])
}

TuringCpu.prototype.Resize = function() {
    this.turing.InitTapeHTML()
    this.UpdateView()
}

TuringCpu.prototype.LoadExample = function(code) {
    if (!confirm("Вы уверены, что хотите загрузить пример? Текущая программа будет утрачена."))
        return

    this.codeInput.SetText(code)
    this.Reset(true)
}

TuringCpu.prototype.SetBitDepth = function() {
    this.bitDepth = +this.bitDepthBox.value
    this.Reset()
}

TuringCpu.prototype.SetMemoryCount = function() {
    this.memoryCount = +this.memoryCountBox.value
    this.Reset()
}
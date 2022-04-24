function FakeCpu(bitDepth, memoryCount) {
    this.bitDepth = bitDepth
    this.memoryCount = memoryCount
    this.maxVal = (1 << this.bitDepth) - 1

    this.stack = []
    this.memory = Array(memoryCount).fill(0)
    this.registers = {}

    for (let name of REGISTER_NAMES)
        this.registers[name] = 0

    this.flags = {}
    this.flags[ZERO_FLAG] = false
    this.flags[CARRY_FLAG] = false
}

FakeCpu.prototype.GetFlag = function(flag) {
    return this.flags[flag]
}

FakeCpu.prototype.ParseConstant = function(value) {
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

    return value
}

FakeCpu.prototype.ParseAddress = function(arg) {
    let address = arg.substr(1, arg.length - 2)

    if (IsRegister(address))
        return this.registers[address]

    return this.ParseConstant(address)
}

FakeCpu.prototype.GetArgumentValue = function(arg) {
    if (IsRegister(arg))
        return this.registers[arg]

    if (IsConstant(arg))
        return this.ParseConstant(arg)

    return this.memory[this.ParseAddress(arg)]
}

FakeCpu.prototype.UpdateFlags = function(result) {
    this.flags[ZERO_FLAG] = result == 0
    this.flags[CARRY_FLAG] = result < 0 || result > this.maxVal
}

FakeCpu.prototype.UpdateInfo = function() {
    let registers = []

    for (let register of REGISTER_NAMES)
        registers.push(`${register}: ${this.registers[register]}`)

    console.log(registers.join(', '))
    console.log(`ZF: ${this.flags[ZERO_FLAG]}, CF: ${this.flags[CARRY_FLAG]}`)
    console.log(`Stack: [${this.stack}]`)
    console.log('')
}

FakeCpu.prototype.ProcessMov = function(arg1, arg2) {
    if (IsRegister(arg1) && IsAddress(arg2)) {
        let address = this.ParseAddress(arg2)
        this.registers[arg1] = this.memory[address]
    }
    else if (IsAddress(arg1) && (IsRegister(arg2) || IsConstant(arg2))) {
        let value = this.GetArgumentValue(arg2)
        let address = this.ParseAddress(arg1)
        this.memory[address] = value
    }
    else {
        let value = this.GetArgumentValue(arg2)
        this.registers[arg1] = value
    }
}

FakeCpu.prototype.ProcessInstruction = function(instruction) {
    let cmd = instruction.command
    let args = instruction.args

    if (cmd == MOV_CMD.name) {
        this.ProcessMov(args[0], args[1])
    }
    else if (cmd == INC_CMD.name) {
        let result = this.registers[args[0]] + 1
        this.UpdateFlags(result)
        this.registers[args[0]] = result
    }
    else if (cmd == DEC_CMD.name) {
        let result = this.registers[args[0]] - 1
        this.UpdateFlags(result)
        this.registers[args[0]] = result
    }
    else if (cmd == ADD_CMD.name) {
        let result = this.registers[args[0]] + this.GetArgumentValue(args[1])
        this.registers[args[0]] = result
        this.UpdateFlags(result)
    }
    else if (cmd == SUB_CMD.name) {
        let result = this.registers[args[0]] - this.GetArgumentValue(args[1])
        this.registers[args[0]] = result
        this.UpdateFlags(result)
    }
    else if (cmd == MUL_CMD.name) {
        let result = this.registers[args[0]] * this.GetArgumentValue(args[1])
        this.registers[args[0]] = result
        this.UpdateFlags(result)
    }
    else if (cmd == CMP_CMD.name) {
        let result = this.registers[args[0]] - this.GetArgumentValue(args[1])
        this.UpdateFlags(result)
        console.log("CMP:", result)
    }
    else if (cmd == AND_CMD.name) {
        let result = this.registers[args[0]] & this.GetArgumentValue(args[1])
        this.registers[args[0]] = result
        this.UpdateFlags(result)
    }
    else if (cmd == OR_CMD.name) {
        let result = this.registers[args[0]] | this.GetArgumentValue(args[1])
        this.registers[args[0]] = result
        this.UpdateFlags(result)
    }
    else if (cmd == XOR_CMD.name) {
        let result = this.registers[args[0]] ^ this.GetArgumentValue(args[1])
        this.registers[args[0]] = result
        this.UpdateFlags(result)
    }
    else if (cmd == NOT_CMD.name) {
        let result = this.maxVal - this.registers[args[0]]
        this.registers[args[0]] = result
        this.UpdateFlags(result)
    }
    else if (cmd == SHR_CMD.name) {
        let result = this.registers[args[0]] >> this.GetArgumentValue(args[1])
        this.registers[args[0]] = result
        this.UpdateFlags(result)
    }
    else if (cmd == SHL_CMD.name) {
        let result = this.registers[args[0]] << this.GetArgumentValue(args[1])
        this.registers[args[0]] = result
        this.UpdateFlags(result)
    }
    else if (cmd == PUSH_CMD.name) {
        this.stack.push(this.GetArgumentValue(args[0]))
    }
    else if (cmd == POP_CMD.name) {
        this.registers[args[0]] = this.stack.pop()
    }
    else {
        throw "UNKNOWN INSTRUCTION"
    }
}

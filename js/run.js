TuringCpu.prototype.RunProcess = function() {
    if (this.isRunning)
        this.Step()

    window.requestAnimationFrame(() => this.RunProcess())
}

TuringCpu.prototype.Run = function() {
    if (this.isRunning) {
        this.Stop()
    }
    else {
        this.Start()
    }
}

TuringCpu.prototype.Start = function() {
    this.isRunning = true
    this.runBtn.value = 'Остановить'
}

TuringCpu.prototype.Stop = function() {
    this.isRunning = false
    this.runBtn.value = 'Запустить'
}

TuringCpu.prototype.Step = function() {
    if (this.programIndex >= this.program.length) {
        this.Stop()
        this.SetRunButtonsState(false)
        return
    }

    this.ProcessInstruction(this.program[this.programIndex++])
}

TuringCpu.prototype.Reset = function() {
    this.Stop()
    this.SetRunButtonsState(true)
    this.HideAllLines()
    this.InitTuring()

    this.fakeCpu = new FakeCpu(this.bitDepth, this.memoryCount)
    this.programIndex = 0
}

TuringCpu.prototype.ProcessJump = function(jmp, label) {
    if (jmp == JMP_CMD.name) {
        this.programIndex = this.labels[label]
    }
    else if (jmp == JZ_CMD.name || jmp == JE_CMD.name) {
        if (this.fakeCpu.GetFlag(ZERO_FLAG))
            this.programIndex = this.labels[label]
    }
    else if (jmp == JNZ_CMD.name || jmp == JNE_CMD.name) {
        if (!this.fakeCpu.GetFlag(ZERO_FLAG))
            this.programIndex = this.labels[label]
    }
    else if (jmp == JC_CMD.name || jmp == JB_CMD.name || jmp == JNAE_CMD.name) {
        if (this.fakeCpu.GetFlag(CARRY_FLAG))
            this.programIndex = this.labels[label]
    }
    else if (jmp == JNC_CMD.name || jmp == JAE_CMD.name || jmp == JNB_CMD.name) {
        if (!this.fakeCpu.GetFlag(CARRY_FLAG))
            this.programIndex = this.labels[label]
    }
    else if (jmp == JA_CMD.name || jmp == JNBE_CMD.name) {
        if (!this.fakeCpu.GetFlag(ZERO_FLAG) && !this.fakeCpu.GetFlag(CARRY_FLAG))
            this.programIndex = this.labels[label]
    }
    else if (jmp == JBE_CMD.name || jmp == JNA_CMD.name) {
        if (this.fakeCpu.GetFlag(ZERO_FLAG) || this.fakeCpu.GetFlag(CARRY_FLAG))
            this.programIndex = this.labels[label]
    }
    else {
        throw `jump "${jmp}" not implemented`
    }
}

TuringCpu.prototype.ProcessInstruction = function(instruction) {
    console.log(instruction.command, instruction.args)
    this.HideAllLines()
    instruction.line.classList.add('active-line')

    if (instruction.type == LABEL_COMMAND) {
        this.ProcessJump(instruction.command, instruction.args[0])
    }
    else {
        this.fakeCpu.ProcessInstruction(instruction)
    }

    this.fakeCpu.UpdateInfo()
}

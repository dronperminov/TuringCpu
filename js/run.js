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

TuringCpu.prototype.IsEnd = function() {
    return this.programIndex >= this.program.length && this.taskQueue.length == 0
}

TuringCpu.prototype.Step = function() {
    if (this.IsEnd())
        return

    if (this.taskQueue.length == 0)
        this.ProcessInstruction(this.program[this.programIndex++])

    if (this.taskQueue.length > 0)
        this.ProcessTask()

    this.turing.ToHTML()

    if (this.IsEnd()) {
        this.Stop()
        this.SetRunButtonsState(false)
    }
}

TuringCpu.prototype.Reset = function() {
    this.Stop()
    this.SetRunButtonsState(true)
    this.HideAllLines()
    this.InitTuring()

    this.programIndex = 0
    this.taskQueue = []
}

TuringCpu.prototype.ProcessJump = function(jmp, label) {
    if (jmp == JMP_CMD.name) {
        this.programIndex = this.labels[label]
    }
    else if (jmp == JZ_CMD.name || jmp == JE_CMD.name) {
        if (this.GetFlag(ZERO_FLAG))
            this.programIndex = this.labels[label]
    }
    else if (jmp == JNZ_CMD.name || jmp == JNE_CMD.name) {
        if (!this.GetFlag(ZERO_FLAG))
            this.programIndex = this.labels[label]
    }
    else if (jmp == JC_CMD.name || jmp == JB_CMD.name || jmp == JNAE_CMD.name) {
        if (this.GetFlag(CARRY_FLAG))
            this.programIndex = this.labels[label]
    }
    else if (jmp == JNC_CMD.name || jmp == JAE_CMD.name || jmp == JNB_CMD.name) {
        if (!this.GetFlag(CARRY_FLAG))
            this.programIndex = this.labels[label]
    }
    else if (jmp == JA_CMD.name || jmp == JNBE_CMD.name) {
        if (!this.GetFlag(ZERO_FLAG) && !this.GetFlag(CARRY_FLAG))
            this.programIndex = this.labels[label]
    }
    else if (jmp == JBE_CMD.name || jmp == JNA_CMD.name) {
        if (this.GetFlag(ZERO_FLAG) || this.GetFlag(CARRY_FLAG))
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

    let command = instruction.command
    let args = instruction.args

    if (instruction.type == LABEL_COMMAND) {
        this.ProcessJump(command, instruction.args[0])
    }
    else if (command == MOV_CMD.name) {
        this.GetArgumentValue(args[1], (word) => this.word = word)
        this.SetArgumentValue(args[0], () => this.word)
    }
    else if (command == PUSH_CMD.name) {
        this.GetArgumentValue(args[0], (word) => this.word = word)
        this.taskQueue.push({ type: RUN_TASK, state: "MOVE-STACK", skip: true})
        this.taskQueue.push({ type: RUN_TASK, state: "PUSH"})
        this.taskQueue.push({ type: WRITE_WORD_TASK, getWord: () => this.word})
    }
    else if (command == POP_CMD.name) {
        this.taskQueue.push({ type: RUN_TASK, state: "MOVE-STACK", skip: true})
        this.taskQueue.push({ type: RUN_TASK, state: "POP-init"})
        this.taskQueue.push({ type: READ_WORD_TASK, setWord: (value) => this.word = value})
        this.taskQueue.push({ type: RUN_TASK, state: "POP"})
        this.SetArgumentValue(args[0], () => this.word)
    }
    else if (command == INC_CMD.name || command == DEC_CMD.name || command == NOT_CMD.name) {
        this.GetRegisterValue(args[0], (word) => this.word = word)
        this.taskQueue.push({ type: RUN_TASK, state: "MOVE-ALU", skip: true})
        this.taskQueue.push({ type: WRITE_WORD_TASK, getWord: () => this.word})
        this.taskQueue.push({ type: RUN_TASK, state: command})
        this.taskQueue.push({ type: READ_WORD_TASK, setWord: (value) => this.word = value})
        this.SetArgumentValue(args[0], () => this.word)
    }
    else if ([ADD_CMD.name, SUB_CMD.name, MUL_CMD.name, CMP_CMD.name, AND_CMD.name, OR_CMD.name, XOR_CMD.name, SHR_CMD.name, SHL_CMD.name].indexOf(command) > -1) {
        this.GetRegisterValue(args[0], (word) => this.word1 = word)
        this.GetArgumentValue(args[1], (word) => this.word2 = word)
        this.taskQueue.push({ type: RUN_TASK, state: "MOVE-ALU", skip: true})
        this.taskQueue.push({ type: WRITE_WORD_TASK, getWord: () => `${this.word1}#${this.word2}`})
        this.taskQueue.push({ type: RUN_TASK, state: command == CMP_CMD.name ? SUB_CMD.name : command})

        if (command != CMP_CMD.name) {
            this.taskQueue.push({ type: READ_WORD_TASK, setWord: (value) => this.word = value})
            this.SetArgumentValue(args[0], () => this.word)
        }
    }
    else {
        throw `Unknown command "${instruction.command}"`
    }
}

TuringCpu.prototype.ProcessTask = function() {
    let task = null
    let skipAll = this.stepByInstructionsBox.checked
    let skipArgs = this.skipArgumentsBox.checked

    do {
        task = this.taskQueue[0]

        if (task.type == RUN_TASK) {
            if (!task.isRunning)
                this.turing.SetState(task.state)

            task.isRunning = this.turing.Step()

            if (task.isRunning)
                continue
        }
        else if (task.type == WRITE_WORD_TASK) {
            this.turing.WriteWord(task.getWord())
        }
        else if (task.type == READ_WORD_TASK) {
            task.setWord(this.turing.GetWord())
        }

        this.taskQueue.shift()
    } while (this.taskQueue.length > 0 && (task.type == READ_WORD_TASK || task.skip == skipArgs || skipAll))
}

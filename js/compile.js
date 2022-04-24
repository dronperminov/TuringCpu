TuringCpu.prototype.ClearLine = function(line) {
    line = line.replace(/;.*/gi, "")
    line = line.replace(/^ +/gi, "")
    line = line.replace(/ +$/gi, "")
    return line
}

TuringCpu.prototype.CompileError = function(lineDiv, error) {
    lineDiv.classList.add('error-line')
    throw error
}

TuringCpu.prototype.GetCommand = function(cmd) {
    for (let command of COMMANDS)
        if (command.name == cmd.toUpperCase())
            return command

    return null
}

TuringCpu.prototype.ValidateArgs = function(command, args, lineDiv) {
    if (command.argTypes[0] == LABEL_TYPE) {
        if (!IsLabel(args[0]))
            this.CompileError(lineDiv, `Некорректная метка команды ${command.name}: ${args[0]}`)

        return
    }

    let correctArgs = []

    for (let validTypes of command.argTypes) {
        let isCorrectArgs = true

        for (let i = 0; i < command.args && isCorrectArgs; i++) {
            let argType = GetArgType(args[i])

            if (argType != validTypes[i])
                isCorrectArgs = false
        }

        if (isCorrectArgs)
            return

        correctArgs.push(validTypes.join(' '))
    }

    if (command.args == 1) {
        this.CompileError(lineDiv, `Некорректный тип аргумента команды ${command.name}. Ожидался один из следующих типов: ${correctArgs.join(', ')}`)
    }
    else {
        this.CompileError(lineDiv, `Некорректные типы аргументов команды ${command.name}. Ожидалась одна из комбинаций: ${correctArgs.join(', ')}`)
    }
}

TuringCpu.prototype.ParseLabeledLine = function(line, lineDiv) {
    let parts = line.split(':')
    let label = parts[0]

    if (label.match(new RegExp(`^${LABEL_REGEXP}$`, "g")) == null)
        this.CompileError(lineDiv, `Некорректная метка ("${label}")`)

    this.labels[label] = this.program.length

    if (parts.length != 1)
        this.ParseLine(this.ClearLine(parts[1]), lineDiv)
}

TuringCpu.prototype.ParseLine = function(line, lineDiv) {
    if (line == "")
        return

    let parts = line.split(/ +/g)
    let cmd = parts.shift()
    let args = parts.join(' ').split(/, */g)

    let command = this.GetCommand(cmd, lineDiv)

    if (command == null)
        this.CompileError(lineDiv, `Неизвестная команда "${cmd}"`)

    if (args.length == 1 && args[0] == '')
        args.pop()

    if (args.length == 1 && parts.length > 1)
        this.CompileError(lineDiv, "Аргументы должны разделяться запятыми")

    if (command.args != args.length)
        this.CompileError(lineDiv, `Неверное число аргументов команды ${command.name}: ожидалось ${command.args}, а получено ${args.length}`)

    this.ValidateArgs(command, args, lineDiv)

    this.program.push({ command: cmd, args: args, line: lineDiv, type: command.argTypes[0] == LABEL_TYPE ? LABEL_COMMAND : OTHER_COMMAND })
}

TuringCpu.prototype.ValidateLabels = function() {
    for (let instruction of this.program) {
        if (instruction.type != LABEL_COMMAND)
            continue

        let label = instruction.args[0]

        if (!(label in this.labels))
            this.CompileError(instruction.line, `Метка "${label}" не обнаружена`)
    }
}

TuringCpu.prototype.Compile = function() {
    this.programIndex = 0
    this.program = []
    this.labels = {}

    this.SetRunButtonsState(false, true)

    try {
        let lines = this.codeInput.GetTextLines()

        for (let i = 0; i < lines.length; i++) {
            let line = this.ClearLine(lines[i])
            let lineDiv = document.getElementById(`code-line-${i}`)

            if (line.match(/^.*:.*$/gi) != null) {
                this.ParseLabeledLine(line, lineDiv)
            }
            else {
                this.ParseLine(line, lineDiv)
            }
        }

        this.ValidateLabels()
        this.SetRunButtonsState(true, true)
    }
    catch (error) {
        alert(error)
    }
}

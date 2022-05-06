TuringCpu.prototype.ClearLine = function(line) {
    line = line.replace(/;.*/gi, "")
    line = line.replace(/^ +/gi, "")
    line = line.replace(/ +$/gi, "")
    return line
}

TuringCpu.prototype.CompileError = function(lineId, error) {
    let line = document.getElementById(lineId)
    line.classList.add('error-line')
    this.program = []
    throw error
}

TuringCpu.prototype.GetCommand = function(cmd) {
    for (let command of COMMANDS)
        if (command.name == cmd.toUpperCase())
            return command

    return null
}

TuringCpu.prototype.ValidateArgs = function(command, args, lineId) {
    if (command.argTypes[0] == LABEL_TYPE) {
        if (!IsLabel(args[0]))
            this.CompileError(lineId, `Некорректная метка команды ${command.name}: ${args[0]}`)

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
        this.CompileError(lineId, `Некорректный тип аргумента команды ${command.name}. Ожидался один из следующих типов: ${correctArgs.join(', ')}`)
    }
    else {
        this.CompileError(lineId, `Некорректные типы аргументов команды ${command.name}. Ожидалась одна из комбинаций: ${correctArgs.join(', ')}`)
    }
}

TuringCpu.prototype.ParseLabeledLine = function(line, lineId) {
    let parts = line.split(':')
    let label = parts[0]

    if (label.match(new RegExp(`^${LABEL_REGEXP}$`, "g")) == null)
        this.CompileError(lineId, `Некорректная метка ("${label}")`)

    if (REGISTER_NAMES.indexOf(label) > -1)
        this.CompileError(lineId, `Метка не может совпадать с именем регистра ("${label}")`)

    this.labels[label] = this.program.length

    if (parts.length != 1)
        this.ParseLine(this.ClearLine(parts[1]), lineId)
}

TuringCpu.prototype.GetCommandType = function(command) {
    if (command.args == 0 || command.argTypes[0] != LABEL_TYPE)
        return OTHER_COMMAND

    return LABEL_COMMAND
}

TuringCpu.prototype.ParseLine = function(line, lineId) {
    if (line == "")
        return

    let parts = line.split(/ +/g)
    let cmd = parts.shift()
    let args = parts.join(' ').split(/, */g)

    let command = this.GetCommand(cmd, lineId)

    if (command == null)
        this.CompileError(lineId, `Неизвестная команда "${cmd}"`)

    if (args.length == 1 && args[0] == '')
        args.pop()

    if (args.length == 1 && parts.length > 1)
        this.CompileError(lineId, "Аргументы должны разделяться запятыми")

    if (command.args != args.length)
        this.CompileError(lineId, `Неверное число аргументов команды ${command.name}: ожидалось ${command.args}, а получено ${args.length}`)

    if (command.args > 0)
        this.ValidateArgs(command, args, lineId)

    this.program.push({ command: command.name, args: args, lineId: lineId, type: this.GetCommandType(command) })
}

TuringCpu.prototype.ValidateLabels = function() {
    for (let instruction of this.program) {
        if (instruction.type != LABEL_COMMAND)
            continue

        let label = instruction.args[0]

        if (label in this.labels) {
            instruction.args[0] = this.labels[label]
        }
        else if (IsConstant(label)) {
            let address = this.ParseConstant(label)

            if (address < 0) {
                this.CompileError(instruction.lineId, `Адрес "${label}" не может быть отрицательным`)
            }
            else if (address > this.program.length) {
                this.CompileError(instruction.lineId, `Адрес "${label}" выходит за пределы программы`)
            }

            instruction.args[0] = address
        }
        else if (REGISTER_NAMES.indexOf(label) > -1) {
            instruction.args[0] = label
        }
        else {
            this.CompileError(instruction.lineId, `Метка "${label}" не обнаружена`)
        }
    }
}

TuringCpu.prototype.Compile = function() {
    this.program = []
    this.labels = {}

    this.SetRunButtonsState(false, true)

    try {
        let lines = this.codeInput.GetTextLines()

        for (let i = 0; i < lines.length; i++) {
            let line = this.ClearLine(lines[i])
            let lineId = `code-line-${i}`

            if (line.match(/^.*:.*$/gi) != null) {
                this.ParseLabeledLine(line, lineId)
            }
            else {
                this.ParseLine(line, lineId)
            }
        }

        this.ValidateLabels()
        this.SetRunButtonsState(true, true)
    }
    catch (error) {
        alert(error)
    }
}

function TuringCpu(bitDepth, memoryCount) {
    this.bitDepth = bitDepth
    this.memoryCount = memoryCount
    this.codeInput = new HighlightInput('code-editable-box', 'code-highlight-box', HIGHTLIGHT_RULES)

    this.InitControls()
    this.Reset()
    this.Compile()
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

TuringCpu.prototype.IsRegister = function(arg) {
    return REGISTER_NAMES.indexOf(arg) > -1
}

TuringCpu.prototype.IsConstant = function(arg) {
    return arg.match(new RegExp(`^${CONSTANT_REGEXP}$`, "g")) != null
}

TuringCpu.prototype.IsLabel = function(arg) {
    return arg.match(new RegExp(`^${LABEL_REGEXP}$`, "g")) != null
}

TuringCpu.prototype.IsAddress = function(arg) {
    if (!arg.startsWith('[') || !arg.endsWith(']'))
        return false

    arg = arg.substr(1, arg.length - 2)
    return this.IsRegister(arg) || this.IsConstant(arg)
}

TuringCpu.prototype.GetArgType = function(arg) {
    if (this.IsRegister(arg))
        return REGISTER_TYPE

    if (this.IsConstant(arg))
        return CONSTANT_TYPE

    if (this.IsAddress(arg))
        return ADDRESS_TYPE

    return UNKNOWN_TYPE
}
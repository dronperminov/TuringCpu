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

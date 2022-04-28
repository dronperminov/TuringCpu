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
    return this.turing.state == HALT
}

TuringCpu.prototype.TuringStep = function() {
    let prevState = this.turing.state
    this.turing.Step()
    let currState = this.turing.state

    if (prevState == RUN_STATE && currState == 'FETCH' || currState == HALT) {
        this.HighlightCurrLine()
        return true
    }

    return false
}

TuringCpu.prototype.Step = function() {
    if (this.IsEnd())
        return

    if (this.stepByInstructionsBox.checked) {
        while (!this.IsEnd() && !this.TuringStep())
            ;
    }
    else {
        this.TuringStep()
    }

    if (this.IsEnd()) {
        this.Stop()
        this.SetRunButtonsState(false)
    }

    this.UpdateView()
}

TuringCpu.prototype.Reset = function(withCompilation = false) {
    this.Stop()
    this.SetRunButtonsState(true)
    this.HideAllLines()

    if (withCompilation)
        this.Compile()

    this.InitTuring()
}

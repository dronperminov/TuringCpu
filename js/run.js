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
    return this.turing.state == HALT || this.turing.state == UNDERFLOW_STATE
}

TuringCpu.prototype.IsNextEnd = function() {
    return this.turing.state == FETCH_STATE && this.turing.tape.GetChar() == PROGRAM_END_CHAR
}

TuringCpu.prototype.CheckErrors = function() {
    if (this.turing.state == UNDERFLOW_STATE) {
        alert("Ошибка! Стек пуст!")
        return true
    }

    return false
}

TuringCpu.prototype.TuringStep = function() {
    let prevState = this.turing.state
    this.turing.Step()
    let currState = this.turing.state

    if (this.CheckErrors())
        return false

    this.stepsBox.innerHTML = this.steps.Increment().ToString()

    if (this.IsNextEnd())
        this.turing.Step()

    if (this.stepTypeBox.value == 'instructions') {
        if (prevState == RUN_STATE && currState == 'FETCH' || currState == HALT) {
            this.HighlightCurrLine()
            return true
        }
    }
    else if (this.stepTypeBox.value == 'states') {
        if (prevState != currState || currState == HALT) {
            this.HighlightCurrLine()
            return true
        }
    }
    else if (prevState == RUN_STATE && currState == 'FETCH' || currState == HALT) {
        this.HighlightCurrLine()
    }

    return false
}

TuringCpu.prototype.Step = function() {
    if (this.IsEnd())
        return

    if (this.stepTypeBox.value != 'cells') {
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

    this.steps = new Integer()
    this.stepsBox.innerHTML = '0'
    this.InitTuring()
}

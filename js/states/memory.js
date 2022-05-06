TuringCpu.prototype.PushMemory = function() {
    let move = {}
    move['0'] = 'R'
    move['1'] = 'R'
    move[LAMBDA] = 'R'
    move['@'] = '#,R'
    move['#'] = '#,R,PUSH'

    this.MemoryInitCell('PUSH-MEMORY', 'PUSH-MEMORY-VALUE', LAMBDA)
    this.turing.AddState('PUSH-MEMORY-VALUE', move)
}

TuringCpu.prototype.MemoryError = function() {
    let error = {}
    error[STACK_CHAR] = `${STACK_CHAR},N,${HALT}`
    this.turing.AddState(MEMORY_ERROR_STATE, error)
}

TuringCpu.prototype.RegisterAddressInitCell = function(name) {
    let states = {}
    states['0'] = `O,R,${name}-REGISTER-ADDRESS-0`
    states['1'] = `I,R,${name}-REGISTER-ADDRESS-1`
    states[LAMBDA] = `${LAMBDA},R,${name}-MOVE`

    let back = {}

    for (let char of TURING_ALPHABET)
        back[char] = 'L'

    back['O'] = `0,R,${name}-REGISTER-ADDRESS`
    back['I'] = `1,R,${name}-REGISTER-ADDRESS`

    for (let digit of ['0', '1']) {
        let address = {}
        let writeAddress = {}

        for (let char of TURING_ALPHABET)
            address[char] = 'R'

        address[MEMORY_CHAR] = `${MEMORY_CHAR},R,${name}-REGISTER-ADDRESS-${digit}-WRITE`

        writeAddress['0'] = 'R'
        writeAddress['1'] = 'R'
        writeAddress[LAMBDA] = `${digit},L,${name}-REGISTER-ADDRESS-BACK`

        this.turing.AddState(`${name}-REGISTER-ADDRESS-${digit}`, address)
        this.turing.AddState(`${name}-REGISTER-ADDRESS-${digit}-WRITE`, writeAddress)
    }

    this.turing.AddState(`${name}-REGISTER-ADDRESS`, states)
    this.turing.AddState(`${name}-REGISTER-ADDRESS-BACK`, back)
}

TuringCpu.prototype.MemoryInitCell = function(name, end, lastChar = '~') {
    let init = {}

    init['&'] = 'R'
    init['0'] = `O,R,${name}-ADDRESS-0`
    init['1'] = `I,R,${name}-ADDRESS-1`
    init[LAMBDA] = `${lastChar},R,${name}-MOVE`

    for (let register of REGISTER_NAMES) {
        init[register] = `${register},R,${name}-ADDRESS-${register}-STEP`

        let step = {}
        step[LAMBDA] = `${lastChar},R,${name}-ADDRESS-${register}`

        this.turing.AddState(`${name}-ADDRESS-${register}-STEP`, step)
        this.GoToRegisterAction(`${name}-ADDRESS-${register}`, register, `${name}-REGISTER-ADDRESS`)
    }

    this.RegisterAddressInitCell(name)

    for (let digit of ['0', '1']) {
        let address = {}
        let write = {}

        for (let char of TURING_ALPHABET) {
            address[char] = 'R'
        }

        address[MEMORY_CHAR] = `${MEMORY_CHAR},R,${name}-ADDRESS-${digit}-WRITE`

        write['0'] = 'R'
        write['1'] = 'R'
        write[LAMBDA] = `${digit},L,${name}-ADDRESS-BACK`

        this.turing.AddState(`${name}-ADDRESS-${digit}`, address)
        this.turing.AddState(`${name}-ADDRESS-${digit}-WRITE`, write)
    }

    let back = {}

    for (let char of TURING_ALPHABET)
        back[char] = 'L'

    back['O'] = `0,R,${name}`
    back['I'] = `1,R,${name}`

    let move = {}
    for (let char of TURING_ALPHABET)
        move[char] = 'R'

    move[MEMORY_CHAR] = `${MEMORY_CHAR},R,${name}-DEC`

    let dec = {}
    dec['0'] = 'R'
    dec['1'] = 'R'
    dec[LAMBDA] = `${LAMBDA},L,${name}-DEC-2`

    let dec2 = {}
    dec2['1'] = `0,R,${name}-MARK`
    dec2['0'] = `1,L,${name}-DEC-2`
    dec2[MEMORY_CHAR] = `${MEMORY_CHAR},R,${name}-CLEAR`

    let clear = {}
    clear['1'] = `${LAMBDA},R,${name}-CLEAR`
    clear[LAMBDA] = `${LAMBDA},R,${end}`

    let mark = {}
    mark['0'] = 'R'
    mark['1'] = 'R'
    mark['@'] = 'R'
    mark[LAMBDA] = 'R'
    mark['#'] = `@,L,${name}-MARK-BACK`
    mark[STACK_CHAR] = `${STACK_CHAR},N,${MEMORY_ERROR_STATE}`


    let markBack = {}
    markBack['0'] = 'L'
    markBack['1'] = 'L'
    markBack['@'] = 'L'
    markBack[LAMBDA] = 'L'
    markBack[MEMORY_CHAR] = `${MEMORY_CHAR},R,${name}-DEC`

    this.turing.AddState(name, init)
    this.turing.AddState(`${name}-MOVE`, move)
    this.turing.AddState(`${name}-DEC`, dec)
    this.turing.AddState(`${name}-DEC-2`, dec2)
    this.turing.AddState(`${name}-MARK`, mark)
    this.turing.AddState(`${name}-MARK-BACK`, markBack)
    this.turing.AddState(`${name}-CLEAR`, clear)
    this.turing.AddState(`${name}-ADDRESS-BACK`, back)
}

TuringCpu.prototype.MemoryToALU = function() {
    let backValue = {}

    for (let char of TURING_ALPHABET)
        backValue[char] = 'R'

    backValue['O'] = 'O,R,MEMORY-TO-ALU-COPY-RUN'
    backValue['I'] = 'I,R,MEMORY-TO-ALU-COPY-RUN'

    for (let digit of ['0', '1']) {
        let value = {}
        let writeValue = {}

        for (let char of TURING_ALPHABET)
            value[char] = 'L'

        value[ALU_CHAR] = `${ALU_CHAR},R,MEMORY-${digit}-TO-ALU-WRITE`

        writeValue['0'] = 'R'
        writeValue['1'] = 'R'
        writeValue['#'] = 'R'
        writeValue[LAMBDA] = `${digit},R,MEMORY-TO-ALU-DIGIT-BACK`

        this.turing.AddState(`MEMORY-${digit}-TO-ALU`, value)
        this.turing.AddState(`MEMORY-${digit}-TO-ALU-WRITE`, writeValue)
    }

    this.turing.AddState(`MEMORY-TO-ALU-DIGIT-BACK`, backValue)

    let copy = {}
    copy['0'] = 'R'
    copy['1'] = 'R'
    copy['@'] = 'R'
    copy[LAMBDA] = 'R'
    copy['#'] = '@,R,MEMORY-TO-ALU-COPY-RUN'

    let copyRun = {}
    copyRun['0'] = `O,L,MEMORY-0-TO-ALU`
    copyRun['1'] = `I,L,MEMORY-1-TO-ALU`
    copyRun['O'] = 'R'
    copyRun['I'] = 'R'
    copyRun[LAMBDA] = `${LAMBDA},L,MEMORY-TO-ALU-BACK`

    let back = {}
    back['0'] = 'L'
    back['1'] = 'L'
    back[LAMBDA] = 'L'
    back['O'] = `0,L,MEMORY-TO-ALU-BACK`
    back['I'] = `1,L,MEMORY-TO-ALU-BACK`
    back['@'] = `#,L,MEMORY-TO-ALU-BACK`
    back[MEMORY_CHAR] = `${MEMORY_CHAR},L,${RETURN_RUN_STATE}`

    this.MemoryInitCell('MEMORY-TO-ALU', 'MEMORY-TO-ALU-COPY')
    this.turing.AddState('MEMORY-TO-ALU-COPY', copy)
    this.turing.AddState('MEMORY-TO-ALU-COPY-RUN', copyRun)
    this.turing.AddState('MEMORY-TO-ALU-BACK', back)
}

TuringCpu.prototype.CheckMemoryOp = function() {
    let states = {}

    states[LAMBDA] = `${LAMBDA},R,MEMORY-TO-ALU`
    states['0'] = `0,R,MEMORY-TO-ALU`
    states['1'] = `1,R,MEMORY-TO-ALU`
    states['@'] = `@,R,MOV-TO-MEMORY`

    this.turing.AddState('CHECK-MEMORY-OP', states)
}

TuringCpu.prototype.MemoryClearMark = function() {
    let states = {}
    let run = {}
    let norm = {}

    for (let char of TURING_ALPHABET)
        states[char] = 'R'

    states[MEMORY_CHAR] = `${MEMORY_CHAR},R,MEMORY-CLEAR-MARK-RUN`

    run['0'] = 'R'
    run['1'] = 'R'
    run[LAMBDA] = 'R'
    run['@'] = '#,R,MEMORY-CLEAR-MARK-RUN'
    run['#'] = `#,R,MEMORY-CLEAR-MARK-NORM`

    norm['O'] = '0,R,MEMORY-CLEAR-MARK-NORM'
    norm['I'] = '1,R,MEMORY-CLEAR-MARK-NORM'
    norm[LAMBDA] = `${LAMBDA},L,${RETURN_RUN_STATE}`

    this.turing.AddState('MEMORY-CLEAR-MARK', states)
    this.turing.AddState('MEMORY-CLEAR-MARK-RUN', run)
    this.turing.AddState('MEMORY-CLEAR-MARK-NORM', norm)
}

TuringCpu.prototype.MovValueToMemory = function() {
    let states = {}
    let back = {}
    let back2 = {}
    states['0'] = 'O,R,MOV-0-TO-MEMORY'
    states['1'] = 'I,R,MOV-1-TO-MEMORY'
    states[LAMBDA] = `${LAMBDA},R,MEMORY-CLEAR-MARK`

    for (let register of REGISTER_NAMES) {
        states[register] = `${register},R,MOV-${register}-TO-MEMORY`
        this.GoToRegisterAction(`MOV-${register}-TO-MEMORY`, register, 'MOV-VALUE-TO-MEMORY')
    }

    for (let char of TURING_ALPHABET) {
        back[char] = 'L'
        back2[char] = 'L'
    }

    back[MEMORY_CHAR] = `${MEMORY_CHAR},L,MOV-VALUE-TO-MEMORY-BACK-2`

    back2['O'] = '0,R,MOV-VALUE-TO-MEMORY'
    back2['I'] = '1,R,MOV-VALUE-TO-MEMORY'

    let replace = {'0': 'O', '1': 'I'}
    for (let digit of ['0', '1']) {
        let mov = {}
        let find = {}
        let write = {}

        for (let char of TURING_ALPHABET)
            mov[char] = 'R'

        mov[MEMORY_CHAR] = `${MEMORY_CHAR},R,MOV-${digit}-TO-MEMORY-FIND`

        find['0'] = 'R'
        find['1'] = 'R'
        find['@'] = 'R'
        find[LAMBDA] = 'R'
        find['#'] = `#,R,MOV-${digit}-TO-MEMORY-WRITE`
        find[STACK_CHAR] = `${STACK_CHAR},N,${MEMORY_ERROR_STATE}`

        write['O'] = 'R'
        write['I'] = 'R'
        write['0'] = `${replace[digit]},L,MOV-VALUE-TO-MEMORY-BACK`
        write['1'] = `${replace[digit]},L,MOV-VALUE-TO-MEMORY-BACK`

        this.turing.AddState(`MOV-${digit}-TO-MEMORY`, mov)
        this.turing.AddState(`MOV-${digit}-TO-MEMORY-FIND`, find)
        this.turing.AddState(`MOV-${digit}-TO-MEMORY-WRITE`, write)
    }

    this.turing.AddState('MOV-VALUE-TO-MEMORY', states)
    this.turing.AddState('MOV-VALUE-TO-MEMORY-BACK', back)
    this.turing.AddState('MOV-VALUE-TO-MEMORY-BACK-2', back2)
}

TuringCpu.prototype.MovToMemory = function() {
    let copy = {}

    for (let char of TURING_ALPHABET)
        copy[char] = 'L'

    copy['~'] = `${LAMBDA},R,MOV-VALUE-TO-MEMORY`

    this.MemoryInitCell('MOV-TO-MEMORY', 'MOV-TO-MEMORY-COPY')
    this.turing.AddState('MOV-TO-MEMORY-COPY', copy)
}

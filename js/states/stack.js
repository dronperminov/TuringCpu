TuringCpu.prototype.Push = function() {
    let states = {}
    states['0'] = 'O,R,PUSH-0'
    states['1'] = 'I,R,PUSH-1'
    states[LAMBDA] = `${LAMBDA},R,PUSH-#`
    states['&'] = `&,R,PUSH-MEMORY`

    let begin = {}

    for (let char of TURING_ALPHABET)
        begin[char] = 'L'

    begin['O'] = '0,R,PUSH'
    begin['I'] = '1,R,PUSH'

    for (let digit of ['0', '1', '#']) {
        let push = {}
        let move = {}

        for (let char of TURING_ALPHABET)
            push[char] = 'R'

        push[STACK_CHAR] = `${STACK_CHAR},R,PUSH-${digit}-2`
        move['0'] = 'R'
        move['1'] = 'R'
        move['#'] = 'R'
        move[LAMBDA] = digit == '#' ? `${digit},L,${RETURN_RUN_STATE}` : `${digit},L,PUSH-BEGIN`
        
        this.turing.AddState(`PUSH-${digit}`, push)
        this.turing.AddState(`PUSH-${digit}-2`, move)
    }

    for (let register of REGISTER_NAMES) {
        states[register] = `${register},R,PUSH-REGISTER-${register}`
        this.GoToRegisterAction(`PUSH-REGISTER-${register}`, register, 'PUSH')
    }

    this.turing.AddState('PUSH', states)
    this.turing.AddState('PUSH-BEGIN', begin)
}

TuringCpu.prototype.PopRegister = function(register) {
    let move = {}
    let underflow = {}
    let end = {}
    let start = {}
    let check = {}
    let fix = {}

    for (let char of TURING_ALPHABET) {
        move[char] = 'R'
        fix[char] = 'L'
    }

    move[STACK_CHAR] = `${STACK_CHAR},R,POP-REGISTER-${register}-UNDERFLOW`

    underflow[LAMBDA] = `${LAMBDA},N,${UNDERFLOW_STATE}`
    underflow['0'] = `0,R,POP-REGISTER-${register}-END`
    underflow['1'] = `1,R,POP-REGISTER-${register}-END`
    underflow['#'] = `#,R,POP-REGISTER-${register}-END`

    end['0'] = 'R'
    end['1'] = 'R'
    end['#'] = 'R'
    end[LAMBDA] = `${LAMBDA},L,POP-REGISTER-${register}-CHECK`

    check['0'] = `#,L,POP-REGISTER-${register}-0`
    check['1'] = `#,L,POP-REGISTER-${register}-1`
    check['#'] = `${LAMBDA},L,POP-REGISTER-${register}-START`
    check[STACK_CHAR] = `${STACK_CHAR},L,POP-REGISTER-${register}-FIX`

    start['#'] = `#,L,POP-REGISTER-${register}-FIX`
    start[STACK_CHAR] = `${STACK_CHAR},L,POP-REGISTER-${register}-FIX`

    start['0'] = `#,L,POP-REGISTER-${register}-0`
    start['1'] = `#,L,POP-REGISTER-${register}-1`
    start[STACK_CHAR] = `${STACK_CHAR},L,POP-REGISTER-${register}-FIX`

    fix[register] = `${register},R,${FIX_ONE_STATE}`

    for (let digit of ['0', '1']) {
        let go = {}
        let last = {}
        let write = {}

        for (let char of TURING_ALPHABET)
            go[char] = 'L'

        let change = {'0': 'O', '1': 'I'}[digit]
        go[register] = `${register},R,POP-REGISTER-${register}-LAST-${digit}`

        last['0'] = 'R'
        last['1'] = 'R'
        last['O'] = `0,L,POP-REGISTER-${register}-WRITE-${digit}`
        last['I'] = `1,L,POP-REGISTER-${register}-WRITE-${digit}`
        last[LAMBDA] = `${LAMBDA},L,POP-REGISTER-${register}-WRITE-${digit}`

        write['0'] = `${change},R,POP-REGISTER-${register}`
        write['1'] = `${change},R,POP-REGISTER-${register}`

        this.turing.AddState(`POP-REGISTER-${register}-${digit}`, go)
        this.turing.AddState(`POP-REGISTER-${register}-LAST-${digit}`, last)
        this.turing.AddState(`POP-REGISTER-${register}-WRITE-${digit}`, write)
    }

    this.turing.AddState(`POP-REGISTER-${register}-UNDERFLOW`, underflow)
    this.turing.AddState(`POP-REGISTER-${register}`, move)
    this.turing.AddState(`POP-REGISTER-${register}-END`, end)
    this.turing.AddState(`POP-REGISTER-${register}-START`, start)
    this.turing.AddState(`POP-REGISTER-${register}-CHECK`, check)
    this.turing.AddState(`POP-REGISTER-${register}-FIX`, fix)
}

TuringCpu.prototype.Pop = function() {
    let states = {}

    for (let register of REGISTER_NAMES) {
        states[register] = `${register},R,POP-REGISTER-${register}`
        this.PopRegister(register)
    }

    this.turing.AddState('POP', states)
}

TuringCpu.prototype.StackUnderflow = function() {
    let states = {}
    states[LAMBDA] = HALT
    this.turing.AddState(UNDERFLOW_STATE, states)
}

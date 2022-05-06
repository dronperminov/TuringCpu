TuringCpu.prototype.PushRetAddress = function() {
    let states = {}
    states['0'] = 'O,R,PUSH-RET-ADDRESS-0'
    states['1'] = 'I,R,PUSH-RET-ADDRESS-1'
    states[LAMBDA] = `${LAMBDA},R,PUSH-RET-ADDRESS-#`

    let begin = {}

    for (let char of ['~', ...TURING_ALPHABET])
        begin[char] = 'L'

    begin['O'] = 'O,R,PUSH-RET-ADDRESS'
    begin['I'] = 'I,R,PUSH-RET-ADDRESS'

    for (let digit of ['0', '1', '#']) {
        let push = {}
        let move = {}

        for (let char of ['~', ...TURING_ALPHABET])
            push[char] = 'R'

        push[STACK_CHAR] = `${STACK_CHAR},R,PUSH-RET-ADDRESS-${digit}-2`
        move['0'] = 'R'
        move['1'] = 'R'
        move['#'] = 'R'
        move[LAMBDA] = digit == '#' ? `${digit},L,CALL-BEGIN` : `${digit},L,PUSH-RET-ADDRESS-BEGIN`

        this.turing.AddState(`PUSH-RET-ADDRESS-${digit}`, push)
        this.turing.AddState(`PUSH-RET-ADDRESS-${digit}-2`, move)
    }

    this.turing.AddState('PUSH-RET-ADDRESS', states)
    this.turing.AddState('PUSH-RET-ADDRESS-BEGIN', begin)
}

TuringCpu.prototype.IncAddress = function() {
    let states = {}
    states[LAMBDA] = '0,R,INC-ADDRESS-MARK'
    states['0'] = '0,R,INC-ADDRESS-END'
    states['1'] = '1,R,INC-ADDRESS-END'

    let mark = {}
    let markBegin = {}

    for (let char of ['~', ...TURING_ALPHABET]) {
        mark[char] = 'R'
        markBegin[char] = 'L'
    }

    mark['#'] = `#,L,INC-ADDRESS-MARK-BEGIN`
    markBegin['@'] = `#,L,CALL`
    markBegin[PROGRAM_CHAR] = `${PROGRAM_CHAR},R,PUSH-RET-ADDRESS`

    let end = {}
    let go = {}
    let shift = {}
    let shiftDigit = {'0': {}, '1': {}}

    end['0'] = 'R'
    end['1'] = 'R'
    end[LAMBDA] = `${LAMBDA},L,INC-ADDRESS-GO`

    go['0'] = `1,R,INC-ADDRESS-MARK`
    go['1'] = `0,L,INC-ADDRESS-GO`
    go[PROGRAM_CHAR] = `${PROGRAM_CHAR},R,INC-ADDRESS-SHIFT`

    for (let digit of ['0', '1']) {
        shift[digit] = `1,R,INC-ADDRESS-SHIFT-${digit}`
        shiftDigit[digit]['0'] = `${digit},R,INC-ADDRESS-SHIFT-0`
        shiftDigit[digit]['1'] = `${digit},R,INC-ADDRESS-SHIFT-1`
        shiftDigit[digit][LAMBDA] = `${digit},R,INC-ADDRESS-MARK`
    }

    this.turing.AddState('INC-ADDRESS', states)
    this.turing.AddState('INC-ADDRESS-MARK', mark)
    this.turing.AddState('INC-ADDRESS-MARK-BEGIN', markBegin)
    this.turing.AddState('INC-ADDRESS-END', end)
    this.turing.AddState('INC-ADDRESS-GO', go)
    this.turing.AddState('INC-ADDRESS-SHIFT', shift)
    this.turing.AddState('INC-ADDRESS-SHIFT-0', shiftDigit['0'])
    this.turing.AddState('INC-ADDRESS-SHIFT-1', shiftDigit['1'])
}

TuringCpu.prototype.Ret = function() {
    let ret = {}
    let underflow = {}
    let end = {}
    let step = {}
    let move = {}
    let check = {}
    let back = {}

    for (let char of TURING_ALPHABET) {
        ret[char] = 'R'
        back[char] = 'R'
    }

    ret[STACK_CHAR] = `${STACK_CHAR},R,RET-CHECK-UNDERFLOW`

    underflow[LAMBDA] = `${LAMBDA},N,${UNDERFLOW_STATE}`
    underflow['0'] = `0,R,RET-END`
    underflow['1'] = `1,R,RET-END`
    underflow['#'] = `#,R,RET-END`

    for (let char of ['0', '1', '#'])
        end[char] = 'R'

    end[LAMBDA] = `${LAMBDA},L,RET-END-STEP`

    step['#'] = `#,L,RET-END-MOVE`

    move['0'] = 'L'
    move['1'] = 'L'
    move['#'] = '#,R,RET-CHECK-DIGIT'
    move[STACK_CHAR] = `${STACK_CHAR},R,RET-CHECK-DIGIT`

    check['0'] = `O,L,RET-APPEND-0`
    check['1'] = `I,L,RET-APPEND-1`
    check['#'] = `${LAMBDA},L,${JMP_CMD.name}-MOVE-ADDRESS`

    back['O'] = `${LAMBDA},R,RET-CHECK-DIGIT`
    back['I'] = `${LAMBDA},R,RET-CHECK-DIGIT`

    for (let digit of ['0', '1']) {
        let append = {}
        let appendMove = {}

        for (let char of TURING_ALPHABET)
            append[char] = 'L'

        append[PROGRAM_CHAR] = `${PROGRAM_CHAR},R,RET-APPEND-${digit}-MOVE`
        appendMove['0'] = 'R'
        appendMove['1'] = 'R'
        appendMove[LAMBDA] = `${digit},R,RET-BACK`

        this.turing.AddState(`RET-APPEND-${digit}`, append)
        this.turing.AddState(`RET-APPEND-${digit}-MOVE`, appendMove)
    }

    this.turing.AddState('RET', ret)
    this.turing.AddState('RET-CHECK-UNDERFLOW', underflow)
    this.turing.AddState('RET-END', end)
    this.turing.AddState('RET-END-STEP', step)
    this.turing.AddState('RET-END-MOVE', move)
    this.turing.AddState('RET-CHECK-DIGIT', check)
    this.turing.AddState('RET-BACK', back)
}

TuringCpu.prototype.Call = function() {
    let step = {}
    step[LAMBDA] = `~,L,CALL`

    let states = {}
    let begin = {}
    let jump = {}

    for (let char of TURING_ALPHABET) {
        states[char] = 'L'
        begin[char] = 'L'
        jump[char] = 'R'
    }

    states[PROGRAM_CHAR] = `${PROGRAM_CHAR},R,INC-ADDRESS`
    begin['~'] = 'L'
    begin[PROGRAM_CHAR] = `${PROGRAM_CHAR},R,CALL-JUMP`

    jump['O'] = `${LAMBDA},R,CALL-JUMP`
    jump['I'] = `${LAMBDA},R,CALL-JUMP`
    jump['~'] = `${LAMBDA},R,${JMP_CMD.name}`

    this.turing.AddState('CALL-STEP', step)
    this.turing.AddState('CALL', states)
    this.turing.AddState('CALL-BEGIN', begin)
    this.turing.AddState('CALL-JUMP', jump)
}

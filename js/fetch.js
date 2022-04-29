TuringCpu.prototype.ClearALU = function() {
    let move = {}
    let clear = {}

    for (let char of TURING_ALPHABET) {
        move[char] = 'R'
    }

    move[ALU_CHAR] = `${ALU_CHAR},R,CLEAR-ALU-2`

    clear['0'] = `${LAMBDA},R,CLEAR-ALU-2`
    clear['1'] = `${LAMBDA},R,CLEAR-ALU-2`
    clear[LAMBDA] = `${LAMBDA},L,${RETURN_RUN_STATE}`

    this.turing.AddState('CLEAR-ALU', move)
    this.turing.AddState('CLEAR-ALU-2', clear)
}

TuringCpu.prototype.WriteRegisterToALU = function(register, isBinary) {
    let end = isBinary ? '-#' : ''
    let moveEnd = {}
    let moveRegister = {}

    for (let char of TURING_ALPHABET) {
        moveEnd[char] = char != PROGRAM_END_CHAR ? 'R' : `${char},R,WRITE-REGISTER-${register}-TO-ALU${end}-2`
        moveRegister[char] = char != register ? 'R' : `${char},R,APPEND-TO-ALU${end}`
    }

    this.turing.AddState(`WRITE-REGISTER-${register}-TO-ALU${end}`, moveEnd)
    this.turing.AddState(`WRITE-REGISTER-${register}-TO-ALU${end}-2`, moveRegister)
}

TuringCpu.prototype.WriteALUToRegister = function(register) {
    let moveAlu = {}
    let writeAlu = {}
    let writeAlu0 = {}
    let writeAlu1 = {}
    let writeAlu02 = {}
    let writeAlu12 = {}

    let writeNorm = {}
    let writeNorm2 = {}

    writeAlu['0'] = `O,N,WRITE-0-TO-REGISTER-${register}`
    writeAlu['1'] = `I,N,WRITE-1-TO-REGISTER-${register}`
    writeAlu['O'] = `R`
    writeAlu['I'] = `R`
    writeAlu[LAMBDA] = `${LAMBDA},L,WRITE-NORM-TO-REGISTER-${register}`

    for (let char of TURING_ALPHABET) {
        moveAlu[char] = char != ALU_CHAR ? 'R' : `${char},R,WRITE-ALU-TO-REGISTER-${register}-2`

        writeAlu0[char] = char != register ? 'L' : `${char},R,WRITE-0-TO-REGISTER-${register}-2`
        writeAlu1[char] = char != register ? 'L' : `${char},R,WRITE-1-TO-REGISTER-${register}-2`

        writeNorm2[char] = char != register ? 'L' : `${char},R,${FIX_REGISTER_STATE}`
    }

    writeAlu02['O'] = 'R'
    writeAlu02['I'] = 'R'
    writeAlu02['0'] = `O,R,WRITE-ALU-TO-REGISTER-${register}`
    writeAlu02['1'] = `O,R,WRITE-ALU-TO-REGISTER-${register}`

    writeAlu12['O'] = 'R'
    writeAlu12['I'] = 'R'
    writeAlu12['0'] = `I,R,WRITE-ALU-TO-REGISTER-${register}`
    writeAlu12['1'] = `I,R,WRITE-ALU-TO-REGISTER-${register}`

    writeNorm['0'] = `${LAMBDA},L,WRITE-NORM-TO-REGISTER-${register}`
    writeNorm['1'] = `${LAMBDA},L,WRITE-NORM-TO-REGISTER-${register}`
    writeNorm['O'] = `${LAMBDA},L,WRITE-NORM-TO-REGISTER-${register}`
    writeNorm['I'] = `${LAMBDA},L,WRITE-NORM-TO-REGISTER-${register}`
    writeNorm[ALU_CHAR] = `${ALU_CHAR},L,WRITE-NORM-TO-REGISTER-${register}-2`

    this.turing.AddState(`WRITE-ALU-TO-REGISTER-${register}`, moveAlu)
    this.turing.AddState(`WRITE-ALU-TO-REGISTER-${register}-2`, writeAlu)
    this.turing.AddState(`WRITE-0-TO-REGISTER-${register}`, writeAlu0)
    this.turing.AddState(`WRITE-1-TO-REGISTER-${register}`, writeAlu1)

    this.turing.AddState(`WRITE-0-TO-REGISTER-${register}-2`, writeAlu02)
    this.turing.AddState(`WRITE-1-TO-REGISTER-${register}-2`, writeAlu12)

    this.turing.AddState(`WRITE-NORM-TO-REGISTER-${register}`, writeNorm)
    this.turing.AddState(`WRITE-NORM-TO-REGISTER-${register}-2`, writeNorm2)
}

TuringCpu.prototype.DecAddress = function() {
    let moveStates = {}
    let decStates = {}
    let decClean = {}
    let markStates = {}
    let backStates = {}

    moveStates['0'] = 'R'
    moveStates['1'] = 'R'
    moveStates[LAMBDA] = `${LAMBDA},L,DEC-ADDRESS-2`

    decStates['1'] = '0,R,MARK-ADDRESS'
    decStates['0'] = '1,L,DEC-ADDRESS-2'
    decStates[PROGRAM_CHAR] = `${PROGRAM_CHAR},R,DEC-ADDRESS-CLEAN`

    decClean['0'] = `${LAMBDA},R,DEC-ADDRESS-CLEAN`
    decClean['1'] = `${LAMBDA},R,DEC-ADDRESS-CLEAN`
    decClean[LAMBDA] = `${LAMBDA},R,${RUN_STATE}`

    for (let char of TURING_ALPHABET) {
        markStates[char] = 'R'
        backStates[char] = 'L'
    }

    markStates['#'] = `@,L,BACK-TO-ADDRESS`

    backStates[PROGRAM_CHAR] = `${PROGRAM_CHAR},R,DEC-ADDRESS`

    this.turing.AddState('DEC-ADDRESS', moveStates)
    this.turing.AddState('DEC-ADDRESS-2', decStates)
    this.turing.AddState('DEC-ADDRESS-CLEAN', decClean)
    this.turing.AddState('MARK-ADDRESS', markStates)
    this.turing.AddState('BACK-TO-ADDRESS', backStates)
}

TuringCpu.prototype.Jump = function() {
    let states = {}
    let moveStates = {}
    let backStates = {}

    states['O'] = `R`
    states['I'] = `R`
    states['0'] = `O,L,${JMP_CMD.name}-COPY-0-ADDRESS`
    states['1'] = `I,L,${JMP_CMD.name}-COPY-1-ADDRESS`
    states[LAMBDA] = `${LAMBDA},L,${JMP_CMD.name}-MOVE-ADDRESS`


    for (let char of TURING_ALPHABET) {
        backStates[char] = char == 'O' || char == 'I' ? `${char},R,${JMP_CMD.name}` : 'R'
        moveStates[char] = 'L'
    }

    moveStates['I'] = `1,L,${JMP_CMD.name}-MOVE-ADDRESS`
    moveStates['O'] = `0,L,${JMP_CMD.name}-MOVE-ADDRESS`
    moveStates['@'] = `#,L,${JMP_CMD.name}-MOVE-ADDRESS`
    moveStates[PROGRAM_CHAR] = `${PROGRAM_CHAR},R,DEC-ADDRESS`

    for (let digit of ['0', '1']) {
        let copyStates = {}
        let copy2States = {}

        copy2States[LAMBDA] = `${digit},R,BACK-TO-JUMP`
        copy2States['0'] = 'R'
        copy2States['1'] = 'R'

        for (let char of TURING_ALPHABET)
            copyStates[char] = char != PROGRAM_CHAR ? 'L' : `${PROGRAM_CHAR},R,${JMP_CMD.name}-COPY-${digit}-ADDRESS-2`

        this.turing.AddState(`${JMP_CMD.name}-COPY-${digit}-ADDRESS`, copyStates)
        this.turing.AddState(`${JMP_CMD.name}-COPY-${digit}-ADDRESS-2`, copy2States)
    }

    this.turing.AddState(JMP_CMD.name, states)
    this.turing.AddState(`${JMP_CMD.name}-MOVE-ADDRESS`, moveStates)
    this.turing.AddState('BACK-TO-JUMP', backStates)
}

TuringCpu.prototype.AppendToALU = function(isBinary = false) {
    let end = isBinary ? '-#' : ''

    for (let char of ['0', '1']) {
        let moveStates = {}
        let writeStates = {}

        for (let c of TURING_ALPHABET.concat('~')) {
            if (c != ALU_CHAR) {
                moveStates[c] = 'R'
            }
            else {
                moveStates[c] = `${ALU_CHAR},R,APPEND-${char}-TO-ALU${end}-WRITE`
            }
        }

        writeStates['0'] = 'R'
        writeStates['1'] = 'R'
        writeStates['#'] = 'R'

        if (isBinary) {
            writeStates[`${LAMBDA}`] = `${char},R,APPEND-#-TO-ALU`
            writeStates[`#`] = `${char},R,APPEND-#-TO-ALU`
        }
        else {
            writeStates[`${LAMBDA}`] = `${char},L,APPEND-TO-ALU${end}-RETURN`
        }

        this.turing.AddState(`APPEND-${char}-TO-ALU${end}`, moveStates)
        this.turing.AddState(`APPEND-${char}-TO-ALU${end}-WRITE`, writeStates)
    }

    let states = {}
    states['0'] = `O,R,APPEND-0-TO-ALU${end}`
    states['1'] = `I,R,APPEND-1-TO-ALU${end}`
    states[`${LAMBDA}`] = `,N,${RETURN_RUN_STATE}`
    states[`~`] = `,R,${FETCH_STATE}`
    states[JMP_CMD.name] = `${JMP_CMD.name},R,${JMP_CMD.name}`

    this.turing.AddState(`APPEND-TO-ALU${end}`, states)

    if (isBinary) {
        let binStates = {}
        binStates[LAMBDA] = `#,L,APPEND-TO-ALU${end}-RETURN`
        this.turing.AddState(`APPEND-#-TO-ALU`, binStates)
    }

    let returnStates = {}

    for (let c of TURING_ALPHABET.concat('~'))
        returnStates[c] = 'L'

    returnStates['O'] = `0,R,APPEND-TO-ALU${end}`
    returnStates['I'] = `1,R,APPEND-TO-ALU${end}`

    this.turing.AddState(`APPEND-TO-ALU${end}-RETURN`, returnStates)
}

TuringCpu.prototype.ConstArgToALU = function() {
    let states1 = {}
    states1['0'] = 'R'
    states1['1'] = 'R'
    states1[LAMBDA] = '~,L,CONST-ARG-TO-ALU-BEGIN'

    let states2 = {}
    states2['0'] = 'L'
    states2['1'] = 'L'
    states2[LAMBDA] = `${LAMBDA},R,APPEND-TO-ALU`

    this.turing.AddState('CONST-ARG-TO-ALU', states1)
    this.turing.AddState('CONST-ARG-TO-ALU-BEGIN', states2)
}

TuringCpu.prototype.FixBinaryArgs = function() {
    let states = {}
    let skip = {}
    let fix = {}

    states[LAMBDA] = `${LAMBDA},L,FIX-BINARY-ARGS-SKIP`

    for (let char of [...REGISTER_NAMES, '0', '1', '&'])
        skip[char] = 'L'

    skip[LAMBDA] = `1,L,${WRITE_BACK_STATE}`

    this.turing.AddState('FIX-BINARY-ARGS', states)
    this.turing.AddState('FIX-BINARY-ARGS-SKIP', skip)
}

TuringCpu.prototype.FixCmpArgs = function() {
    let states = {}
    let skip = {}
    let fix = {}

    states[LAMBDA] = `${LAMBDA},L,FIX-CMP-ARGS-SKIP`

    for (let char of [...REGISTER_NAMES, '0', '1'])
        skip[char] = 'L'

    skip[LAMBDA] = `1,L,CLEAR-ALU`

    this.turing.AddState('FIX-CMP-ARGS', states)
    this.turing.AddState('FIX-CMP-ARGS-SKIP', skip)
}

TuringCpu.prototype.FixMovArgs = function() {
    let states = {}
    let skip = {}
    let fix = {}

    states[LAMBDA] = `${LAMBDA},L,FIX-MOV-ARGS-SKIP`

    for (let char of [...REGISTER_NAMES, '0', '1', '&'])
        skip[char] = 'L'

    skip[LAMBDA] = `0,L,${WRITE_BACK_STATE}`

    this.turing.AddState('FIX-MOV-ARGS', states)
    this.turing.AddState('FIX-MOV-ARGS-SKIP', skip)
}

TuringCpu.prototype.WriteBack = function() {
    let states = {}

    for (let char of TURING_ALPHABET)
        states[char] = char != '@' ? 'L' : `@,R,${WRITE_RESULT_STATE}`

    for (let command of BINARY_COMMAND_NAMES)
        states[command] = `${command},L,FIX-BINARY-ARGS`

    states[CMP_CMD.name] = `${CMP_CMD.name},L,FIX-CMP-ARGS`

    this.turing.AddState(WRITE_BACK_STATE, states)
}

TuringCpu.prototype.WriteResult = function() {
    let states = {}

    for (let register of REGISTER_NAMES)
        states[register] = `${register},R,WRITE-ALU-TO-REGISTER-${register}`

    this.turing.AddState(WRITE_RESULT_STATE, states)
}

TuringCpu.prototype.WriteFlag = function() {
    let write0 = {}
    let write1 = {}

    for (let char of TURING_ALPHABET) {
        write0[char] = 'L'
        write1[char] = 'L'
    }

    write0['~'] = `0,L,${FETCH_STATE}`
    write1['~'] = `1,L,${FETCH_STATE}`

    this.turing.AddState('WRITE-0-FLAG', write0)
    this.turing.AddState('WRITE-1-FLAG', write1)
}

TuringCpu.prototype.CheckZeroFlag = function() {
    let states = {}

    for (let char of TURING_ALPHABET)
        states[char] = 'R'

    states[ZERO_FLAG_CHAR] = `${ZERO_FLAG_CHAR},R,WRITE-ZERO-FLAG`

    this.turing.AddState('CHECK-ZERO-FLAG', states)
    this.turing.AddState('WRITE-ZERO-FLAG', {'0': '0,L,WRITE-0-FLAG', '1': '1,L,WRITE-1-FLAG'})
    this.turing.AddState('WRITE-NO-ZERO-FLAG', {'0': '0,L,WRITE-1-FLAG', '1': '1,L,WRITE-0-FLAG'})
}

TuringCpu.prototype.CheckCarryFlag = function() {
    let states = {}

    for (let char of TURING_ALPHABET)
        states[char] = 'R'

    states[CARRY_FLAG_CHAR] = `${CARRY_FLAG_CHAR},R,WRITE-CARRY-FLAG`

    this.turing.AddState('CHECK-CARRY-FLAG', states)
    this.turing.AddState('WRITE-CARRY-FLAG', {'0': '0,L,WRITE-0-FLAG', '1': '1,L,WRITE-1-FLAG'})
}

TuringCpu.prototype.CheckCarryOrZeroFlags = function() {
    let carry = {}
    let zero = {}

    for (let char of TURING_ALPHABET) {
        carry[char] = 'R'
        zero[char] = 'L'
    }

    carry[CARRY_FLAG_CHAR] = `${CARRY_FLAG_CHAR},R,WRITE-CARRY-OR-ZERO-FLAG`
    zero[ZERO_FLAG_CHAR] = `${ZERO_FLAG_CHAR},R,WRITE-ZERO-FLAG`

    this.turing.AddState('CHECK-CARRY-OR-ZERO-FLAG', carry)
    this.turing.AddState('CHECK-CARRY-OR-ZERO-0', zero)
    this.turing.AddState('WRITE-CARRY-OR-ZERO-FLAG', {'0': '0,L,CHECK-CARRY-OR-ZERO-0', '1': '1,L,WRITE-1-FLAG'})
}

TuringCpu.prototype.CheckNoCarryAndNoZeroFlags = function() {
    let carry = {}
    let zero = {}

    for (let char of TURING_ALPHABET) {
        carry[char] = 'R'
        zero[char] = 'L'
    }

    carry[CARRY_FLAG_CHAR] = `${CARRY_FLAG_CHAR},R,WRITE-NO-CARRY-AND-NO-ZERO-FLAG`
    zero[ZERO_FLAG_CHAR] = `${ZERO_FLAG_CHAR},R,WRITE-NO-ZERO-FLAG`

    this.turing.AddState('CHECK-NO-CARRY-AND-NO-ZERO-FLAG', carry)
    this.turing.AddState('CHECK-NO-CARRY-AND-NO-ZERO-0', zero)
    this.turing.AddState('WRITE-NO-CARRY-AND-NO-ZERO-FLAG', {'0': '0,L,CHECK-NO-CARRY-AND-NO-ZERO-0', '1': '1,L,WRITE-0-FLAG'})
}

TuringCpu.prototype.JZ = function() {
    let states = {}
    let statesNot = {}

    states[LAMBDA] = `~,R,CHECK-ZERO-FLAG`
    states['0'] = `${LAMBDA},R,${RETURN_RUN_STATE}`
    states['1'] = `${LAMBDA},R,${JMP_CMD.name}`

    statesNot[LAMBDA] = `~,R,CHECK-ZERO-FLAG`
    statesNot['0'] = `${LAMBDA},R,${JMP_CMD.name}`
    statesNot['1'] = `${LAMBDA},R,${RETURN_RUN_STATE}`

    this.turing.AddState(`${JZ_CMD.name}`, states)
    this.turing.AddState(`${JNZ_CMD.name}`, statesNot)
}

TuringCpu.prototype.JC = function() {
    let states = {}
    let statesNot = {}

    states[LAMBDA] = `~,R,CHECK-CARRY-FLAG`
    states['0'] = `${LAMBDA},R,${RETURN_RUN_STATE}`
    states['1'] = `${LAMBDA},R,${JMP_CMD.name}`

    statesNot[LAMBDA] = `~,R,CHECK-CARRY-FLAG`
    statesNot['1'] = `${LAMBDA},R,${RETURN_RUN_STATE}`
    statesNot['0'] = `${LAMBDA},R,${JMP_CMD.name}`

    this.turing.AddState(`${JC_CMD.name}`, states)
    this.turing.AddState(`${JNC_CMD.name}`, statesNot)
}

TuringCpu.prototype.JA = function() {
    let states = {}

    states[LAMBDA] = `~,R,CHECK-NO-CARRY-AND-NO-ZERO-FLAG`
    states['1'] = `${LAMBDA},R,${JMP_CMD.name}`
    states['0'] = `${LAMBDA},R,${RETURN_RUN_STATE}`

    this.turing.AddState(`${JA_CMD.name}`, states)
}

TuringCpu.prototype.JBE = function() {
    let states = {}

    states[LAMBDA] = `~,R,CHECK-CARRY-OR-ZERO-FLAG`
    states['1'] = `${LAMBDA},R,${JMP_CMD.name}`
    states['0'] = `${LAMBDA},R,${RETURN_RUN_STATE}`

    this.turing.AddState(`${JBE_CMD.name}`, states)
}

TuringCpu.prototype.PushRegister = function(register) {
    let move = {}
    let push = {}

    for (let char of TURING_ALPHABET) {
        move[char] = 'R'
        push[char] = 'R'
    }

    move[PROGRAM_END_CHAR] = `${PROGRAM_END_CHAR},R,PUSH-REGISTER-${register}-2`
    push[register] = `${register},R,PUSH`

    this.turing.AddState(`PUSH-REGISTER-${register}`, move)
    this.turing.AddState(`PUSH-REGISTER-${register}-2`, push)
}

TuringCpu.prototype.Push = function() {
    let states = {}
    states['0'] = 'O,R,PUSH-0'
    states['1'] = 'I,R,PUSH-1'
    states[LAMBDA] = `${LAMBDA},R,PUSH-#`

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
        this.PushRegister(register)
    }

    this.turing.AddState('PUSH', states)
    this.turing.AddState('PUSH-BEGIN', begin)
}

TuringCpu.prototype.PopRegister = function(register) {
    let move = {}
    let end = {}
    let start = {}
    let check = {}
    let fix = {}

    for (let char of TURING_ALPHABET) {
        move[char] = 'R'
        fix[char] = 'L'
    }

    move[STACK_CHAR] = `${STACK_CHAR},R,POP-REGISTER-${register}-END`
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

TuringCpu.prototype.FetchJumps = function(fetchStates) {
    fetchStates[JMP_CMD.name] = `${JMP_CMD.name},R,${JMP_CMD.name}`

    // zero
    fetchStates[JZ_CMD.name] = `${JZ_CMD.name},R,${JZ_CMD.name}`
    fetchStates[JE_CMD.name] = `${JE_CMD.name},R,${JZ_CMD.name}`

    fetchStates[JNZ_CMD.name] = `${JNZ_CMD.name},R,${JNZ_CMD.name}`
    fetchStates[JNE_CMD.name] = `${JNE_CMD.name},R,${JNZ_CMD.name}`

    // carry
    fetchStates[JC_CMD.name] = `${JC_CMD.name},R,${JC_CMD.name}`
    fetchStates[JB_CMD.name] = `${JB_CMD.name},R,${JC_CMD.name}`
    fetchStates[JNAE_CMD.name] = `${JNAE_CMD.name},R,${JC_CMD.name}`

    fetchStates[JNC_CMD.name] = `${JNC_CMD.name},R,${JNC_CMD.name}`
    fetchStates[JAE_CMD.name] = `${JAE_CMD.name},R,${JNC_CMD.name}`
    fetchStates[JNB_CMD.name] = `${JNB_CMD.name},R,${JNC_CMD.name}`

    // not carry and not zero
    fetchStates[JA_CMD.name] = `${JA_CMD.name},R,${JA_CMD.name}`
    fetchStates[JNBE_CMD.name] = `${JNBE_CMD.name},R,${JA_CMD.name}`

    // carry or zero
    fetchStates[JBE_CMD.name] = `${JBE_CMD.name},R,${JBE_CMD.name}`
    fetchStates[JNA_CMD.name] = `${JNA_CMD.name},R,${JBE_CMD.name}`
}

TuringCpu.prototype.FetchRegisters = function(fetchStates) {
    for (let register of REGISTER_NAMES) {
        fetchStates[register] = `${register},R,STEP-REGISTER-${register}-TO-ALU`

        let argStates = {}
        argStates[LAMBDA] = `~,R,WRITE-REGISTER-${register}-TO-ALU`
        argStates['1'] = `~,R,WRITE-REGISTER-${register}-TO-ALU-#`
        argStates['0'] = `${LAMBDA},R,${FETCH_STATE}`
        this.turing.AddState(`STEP-REGISTER-${register}-TO-ALU`, argStates)
    }
}

TuringCpu.prototype.FetchCommands = function(fetchStates) {

    for (let command of ALU_COMMAND_NAMES) {
        fetchStates[command] = `${command},R,STEP-${command}`

        let argStates = {}
        argStates[LAMBDA] = `~,R,MOVE-ALU-${command == CMP_CMD.name ? SUB_CMD.name : command}`
        this.turing.AddState(`STEP-${command}`, argStates)

        let states = {}

        for (let char of TURING_ALPHABET)
            states[char] = char != ALU_CHAR ? 'R' : `${ALU_CHAR},R,${command}`

        this.turing.AddState(`MOVE-ALU-${command}`, states)
    }

    fetchStates[MOV_CMD.name] = `${MOV_CMD.name},L,FIX-MOV-ARGS`
    fetchStates[PUSH_CMD.name] = `${PUSH_CMD.name},R,PUSH`
    fetchStates[POP_CMD.name] = `${POP_CMD.name},R,POP`
}

TuringCpu.prototype.RegisterAddressToMemoryALU = function(register) {
    let states = {}
    states['0'] = 'O,R,REGISTER-ADDRESS-0-TO-MEMORY-ALU'
    states['1'] = 'I,R,REGISTER-ADDRESS-1-TO-MEMORY-ALU'
    states[LAMBDA] = `${LAMBDA},R,MOVE-MEMORY-TO-ALU`

    for (let digit of ['0', '1']) {
        let address = {}
        let writeAddress = {}
        let backAddress = {}

        for (let char of TURING_ALPHABET) {
            address[char] = 'R'
            backAddress[char] = 'L'
        }

        address[MEMORY_CHAR] = `${MEMORY_CHAR},R,REGISTER-ADDRESS-${digit}-TO-ALU-WRITE`

        writeAddress['0'] = 'R'
        writeAddress['1'] = 'R'
        writeAddress[LAMBDA] = `${digit},L,REGISTER-ADDRESS-${digit}-TO-ALU-BACK`

        backAddress['O'] = '0,R,REGISTER-ADDRESS-TO-MEMORY-ALU'
        backAddress['I'] = '1,R,REGISTER-ADDRESS-TO-MEMORY-ALU'

        this.turing.AddState(`REGISTER-ADDRESS-${digit}-TO-MEMORY-ALU`, address)
        this.turing.AddState(`REGISTER-ADDRESS-${digit}-TO-ALU-WRITE`, writeAddress)
        this.turing.AddState(`REGISTER-ADDRESS-${digit}-TO-ALU-BACK`, backAddress)
    }

    this.turing.AddState(`REGISTER-ADDRESS-TO-MEMORY-ALU`, states)
}

TuringCpu.prototype.RegisterAddressToMemoryMov = function() {
    let states = {}
    states['0'] = 'O,R,MOV-REGISTER-ADDRESS-0-TO-MEMORY'
    states['1'] = 'I,R,MOV-REGISTER-ADDRESS-1-TO-MEMORY'
    states[LAMBDA] = `${LAMBDA},R,MOV-TO-MEMORY-MOVE`

    for (let digit of ['0', '1']) {
        let address = {}
        let writeAddress = {}
        let backAddress = {}

        for (let char of TURING_ALPHABET) {
            address[char] = 'R'
            backAddress[char] = 'L'
        }

        address[MEMORY_CHAR] = `${MEMORY_CHAR},R,MOV-REGISTER-ADDRESS-${digit}-TO-MEMORY-WRITE`

        writeAddress['0'] = 'R'
        writeAddress['1'] = 'R'
        writeAddress[LAMBDA] = `${digit},L,MOV-REGISTER-ADDRESS-${digit}-TO-MEMORY-BACK`

        backAddress['O'] = '0,R,MOV-REGISTER-ADDRESS-TO-MEMORY'
        backAddress['I'] = '1,R,MOV-REGISTER-ADDRESS-TO-MEMORY'

        this.turing.AddState(`MOV-REGISTER-ADDRESS-${digit}-TO-MEMORY`, address)
        this.turing.AddState(`MOV-REGISTER-ADDRESS-${digit}-TO-MEMORY-WRITE`, writeAddress)
        this.turing.AddState(`MOV-REGISTER-ADDRESS-${digit}-TO-MEMORY-BACK`, backAddress)
    }

    this.turing.AddState(`MOV-REGISTER-ADDRESS-TO-MEMORY`, states)
}

TuringCpu.prototype.MemoryToALU = function() {
    let init = {}

    init['&'] = 'R'
    init['0'] = 'O,R,MEMORY-ADDRESS-0-TO-ALU'
    init['1'] = 'I,R,MEMORY-ADDRESS-1-TO-ALU'
    init[LAMBDA] = `~,R,MOVE-MEMORY-TO-ALU`

    for (let digit of ['0', '1']) {
        let address = {}
        let writeAddress = {}
        let backAddress = {}

        let value = {}
        let writeValue = {}
        let backValue = {}

        for (let char of TURING_ALPHABET) {
            address[char] = 'R'
            backAddress[char] = 'L'

            value[char] = 'L'
            backValue[char] = 'R'
        }

        address[MEMORY_CHAR] = `${MEMORY_CHAR},R,MEMORY-ADDRESS-${digit}-TO-ALU-WRITE`

        writeAddress['0'] = 'R'
        writeAddress['1'] = 'R'
        writeAddress[LAMBDA] = `${digit},L,MEMORY-ADDRESS-${digit}-TO-ALU-BACK`

        backAddress['O'] = '0,R,MEMORY-TO-ALU'
        backAddress['I'] = '1,R,MEMORY-TO-ALU'

        value[ALU_CHAR] = `${ALU_CHAR},R,MEMORY-${digit}-TO-ALU-WRITE`

        writeValue['0'] = 'R'
        writeValue['1'] = 'R'
        writeValue['#'] = 'R'
        writeValue[LAMBDA] = `${digit},R,MEMORY-${digit}-TO-ALU-BACK`

        backValue['O'] = 'O,R,MEMORY-TO-ALU-COPY-RUN'
        backValue['I'] = 'I,R,MEMORY-TO-ALU-COPY-RUN'

        this.turing.AddState(`MEMORY-ADDRESS-${digit}-TO-ALU`, address)
        this.turing.AddState(`MEMORY-ADDRESS-${digit}-TO-ALU-WRITE`, writeAddress)
        this.turing.AddState(`MEMORY-ADDRESS-${digit}-TO-ALU-BACK`, backAddress)

        this.turing.AddState(`MEMORY-${digit}-TO-ALU`, value)
        this.turing.AddState(`MEMORY-${digit}-TO-ALU-WRITE`, writeValue)
        this.turing.AddState(`MEMORY-${digit}-TO-ALU-BACK`, backValue)
    }

    for (let register of REGISTER_NAMES) {
        init[register] = `${register},R,MEMORY-ADDRESS-${register}-TO-ALU-STEP`

        let step = {}
        step[LAMBDA] = `~,R,MEMORY-ADDRESS-${register}-TO-ALU`

        let run = {}
        let run2 = {}

        for (let char of TURING_ALPHABET)
            run[char] = 'R'

        run[PROGRAM_END_CHAR] = `${PROGRAM_END_CHAR},R,MEMORY-ADDRESS-${register}-TO-ALU-2`
        
        run2[register] = `${register},R,REGISTER-ADDRESS-TO-MEMORY-ALU`
        run2['0'] = 'R'
        run2['1'] = 'R'
        run2[LAMBDA] = 'R'

        this.turing.AddState(`MEMORY-ADDRESS-${register}-TO-ALU-STEP`, step)
        this.turing.AddState(`MEMORY-ADDRESS-${register}-TO-ALU`, run)
        this.turing.AddState(`MEMORY-ADDRESS-${register}-TO-ALU-2`, run2)
    }

    let move = {}
    for (let char of TURING_ALPHABET)
        move[char] = 'R'

    move[MEMORY_CHAR] = `${MEMORY_CHAR},R,MEMORY-TO-ALU-DEC`

    let dec = {}
    dec['0'] = 'R'
    dec['1'] = 'R'
    dec[LAMBDA] = `${LAMBDA},L,MEMORY-TO-ALU-DEC-2`

    let dec2 = {}
    dec2['1'] = '0,R,MEMORY-TO-ALU-MARK'
    dec2['0'] = '1,L,MEMORY-TO-ALU-DEC-2'
    dec2[MEMORY_CHAR] = `${MEMORY_CHAR},R,MEMORY-TO-ALU-CLEAR`

    let clear = {}
    clear['1'] = `${LAMBDA},R,MEMORY-TO-ALU-CLEAR`
    clear[LAMBDA] = `${LAMBDA},R,MEMORY-TO-ALU-COPY`

    let mark = {}
    mark['0'] = 'R'
    mark['1'] = 'R'
    mark['@'] = 'R'
    mark[LAMBDA] = 'R'
    mark['#'] = '@,L,MEMORY-TO-ALU-MARK-BACK'

    let markBack = {}
    markBack['0'] = 'L'
    markBack['1'] = 'L'
    markBack['@'] = 'L'
    markBack[LAMBDA] = 'L'
    markBack[MEMORY_CHAR] = `${MEMORY_CHAR},R,MEMORY-TO-ALU-DEC`

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

    this.turing.AddState('MEMORY-TO-ALU', init)
    this.turing.AddState('MOVE-MEMORY-TO-ALU', move)
    this.turing.AddState('MEMORY-TO-ALU-DEC', dec)
    this.turing.AddState('MEMORY-TO-ALU-DEC-2', dec2)
    this.turing.AddState('MEMORY-TO-ALU-MARK', mark)
    this.turing.AddState('MEMORY-TO-ALU-MARK-BACK', markBack)
    this.turing.AddState('MEMORY-TO-ALU-CLEAR', clear)
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

TuringCpu.prototype.RegisterToMemory = function(register) {
    let states = {}
    let mov = {}

    for (let char of TURING_ALPHABET) {
        states[char] = 'R'
        mov[char] = 'R'
    }

    states[PROGRAM_END_CHAR] = `${PROGRAM_END_CHAR},R,MOV-${register}-TO-MEMORY-MOVE`
    mov[register] = `${register},R,MOV-VALUE-TO-MEMORY`

    this.turing.AddState(`MOV-${register}-TO-MEMORY`, states)
    this.turing.AddState(`MOV-${register}-TO-MEMORY-MOVE`, mov)
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
        this.RegisterToMemory(register)
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
    let states = {}
    states['&'] = 'R'
    states['0'] = 'O,R,MOV-ADDRESS-0-TO-MEMORY'
    states['1'] = 'I,R,MOV-ADDRESS-1-TO-MEMORY'
    states[LAMBDA] = `~,R,MOV-TO-MEMORY-MOVE`

    for (let register of REGISTER_NAMES) {
        states[register] = `${register},R,MOV-ADDRESS-${register}-TO-MEMORY-STEP`

        let step = {}
        step[LAMBDA] = `~,R,MOV-ADDRESS-${register}-TO-MEMORY`

        let run = {}
        let run2 = {}

        for (let char of TURING_ALPHABET) {
            run[char] = 'R'
            run2[char] = 'R'
        }

        run[PROGRAM_END_CHAR] = `${PROGRAM_END_CHAR},R,MOV-ADDRESS-${register}-TO-MEMORY-2`
        run2[register] = `${register},R,MOV-REGISTER-ADDRESS-TO-MEMORY`

        this.turing.AddState(`MOV-ADDRESS-${register}-TO-MEMORY-STEP`, step)
        this.turing.AddState(`MOV-ADDRESS-${register}-TO-MEMORY`, run)
        this.turing.AddState(`MOV-ADDRESS-${register}-TO-MEMORY-2`, run2)
    }

    for (let digit of ['0', '1']) {
        let address = {}
        let write = {}
        let back = {}

        for (let char of TURING_ALPHABET) {
            address[char] = 'R'
            back[char] = 'L'
        }

        address[MEMORY_CHAR] = `${MEMORY_CHAR},R,MOV-ADDRESS-${digit}-TO-MEMORY-WRITE`

        write['0'] = 'R'
        write['1'] = 'R'
        write[LAMBDA] = `${digit},L,MOV-ADDRESS-${digit}-TO-MEMORY-BACK`

        back['O'] = '0,R,MOV-TO-MEMORY'
        back['I'] = '1,R,MOV-TO-MEMORY'

        this.turing.AddState(`MOV-ADDRESS-${digit}-TO-MEMORY`, address)
        this.turing.AddState(`MOV-ADDRESS-${digit}-TO-MEMORY-WRITE`, write)
        this.turing.AddState(`MOV-ADDRESS-${digit}-TO-MEMORY-BACK`, back)
    }

    let move = {}

    for (let char of TURING_ALPHABET)
        move[char] = 'R'

    move[MEMORY_CHAR] = `${MEMORY_CHAR},R,MOV-TO-MEMORY-DEC`

    let dec = {}
    dec['0'] = 'R'
    dec['1'] = 'R'
    dec[LAMBDA] = `${LAMBDA},L,MOV-TO-MEMORY-DEC-2`

    let dec2 = {}
    dec2['1'] = '0,R,MOV-TO-MEMORY-MARK'
    dec2['0'] = '1,L,MOV-TO-MEMORY-DEC-2'
    dec2[MEMORY_CHAR] = `${MEMORY_CHAR},R,MOV-TO-MEMORY-CLEAR`

    let clear = {}
    clear['1'] = `${LAMBDA},R,MOV-TO-MEMORY-CLEAR`
    clear[LAMBDA] = `${LAMBDA},R,MOV-TO-MEMORY-COPY`

    let mark = {}
    mark['0'] = 'R'
    mark['1'] = 'R'
    mark['@'] = 'R'
    mark[LAMBDA] = 'R'
    mark['#'] = '@,L,MOV-TO-MEMORY-MARK-BACK'

    let markBack = {}
    markBack['0'] = 'L'
    markBack['1'] = 'L'
    markBack['@'] = 'L'
    markBack[LAMBDA] = 'L'
    markBack[MEMORY_CHAR] = `${MEMORY_CHAR},R,MOV-TO-MEMORY-DEC`

    let copy = {}

    for (let char of TURING_ALPHABET)
        copy[char] = 'L'

    copy['~'] = `${LAMBDA},R,MOV-VALUE-TO-MEMORY`

    this.turing.AddState('MOV-TO-MEMORY', states)
    this.turing.AddState('MOV-TO-MEMORY-MOVE', move)
    this.turing.AddState('MOV-TO-MEMORY-DEC', dec)
    this.turing.AddState('MOV-TO-MEMORY-DEC-2', dec2)
    this.turing.AddState('MOV-TO-MEMORY-MARK', mark)
    this.turing.AddState('MOV-TO-MEMORY-MARK-BACK', markBack)
    this.turing.AddState('MOV-TO-MEMORY-CLEAR', clear)
    this.turing.AddState('MOV-TO-MEMORY-COPY', copy)
}

TuringCpu.prototype.InitTuringFetchStates = function() {
    for (let register of REGISTER_NAMES) {
        this.WriteRegisterToALU(register, false)
        this.WriteRegisterToALU(register, true)
        this.WriteALUToRegister(register)
    }

    this.ClearALU()
    this.ConstArgToALU()
    this.AppendToALU(true)
    this.AppendToALU(false)
    this.WriteBack()
    this.WriteResult()
    this.FixBinaryArgs()
    this.FixMovArgs()
    this.FixCmpArgs()

    this.WriteFlag()
    this.CheckZeroFlag()
    this.CheckCarryFlag()
    this.CheckCarryOrZeroFlags()
    this.CheckNoCarryAndNoZeroFlags()

    this.Push()
    this.Pop()

    this.DecAddress()
    this.Jump()
    this.JZ()
    this.JC()
    this.JA()
    this.JBE()

    this.CheckMemoryOp()
    this.RegisterAddressToMemoryALU()
    this.RegisterAddressToMemoryMov()
    this.MovValueToMemory()
    this.MemoryClearMark()
    this.MemoryToALU()
    this.MovToMemory()

    let fetchStates = {}
    fetchStates['#'] = `#,L,${WRITE_BACK_STATE}`
    fetchStates['&'] = `&,L,CHECK-MEMORY-OP`
    fetchStates['0'] = `0,N,CONST-ARG-TO-ALU`
    fetchStates['1'] = `1,N,CONST-ARG-TO-ALU`
    fetchStates[PROGRAM_END_CHAR] = `${HALT}`

    this.FetchJumps(fetchStates)
    this.FetchRegisters(fetchStates)
    this.FetchCommands(fetchStates)

    this.turing.AddState(FETCH_STATE, fetchStates)
}
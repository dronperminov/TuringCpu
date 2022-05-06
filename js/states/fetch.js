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

TuringCpu.prototype.GoToRegisterAction = function(name, register, action) {
    let run = {}
    let run2 = {}

    for (let char of TURING_ALPHABET)
        run[char] = 'R'

    run[PROGRAM_END_CHAR] = `${PROGRAM_END_CHAR},R,${name}-2`

    for (let char of [...REGISTER_NAMES, '0', '1', LAMBDA])
        run2[char] = 'R'

    run2[register] = `${register},R,${action}`

    this.turing.AddState(`${name}`, run)
    this.turing.AddState(`${name}-2`, run2)
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

TuringCpu.prototype.SkipWriteBack = function() {
    let states = {}
    let skip = {}
    let fix = {}

    states[LAMBDA] = `${LAMBDA},L,SKIP-WRITE-BACK-SKIP`

    for (let char of [...REGISTER_NAMES, '0', '1'])
        skip[char] = 'L'

    skip[LAMBDA] = `1,L,CLEAR-ALU`

    this.turing.AddState('SKIP-WRITE-BACK', states)
    this.turing.AddState('SKIP-WRITE-BACK-SKIP', skip)
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

    states[CMP_CMD.name] = `${CMP_CMD.name},L,SKIP-WRITE-BACK`
    states[TEST_CMD.name] = `${TEST_CMD.name},L,SKIP-WRITE-BACK`

    this.turing.AddState(WRITE_BACK_STATE, states)
}

TuringCpu.prototype.WriteResult = function() {
    let states = {}

    for (let register of REGISTER_NAMES)
        states[register] = `${register},R,WRITE-ALU-TO-REGISTER-${register}`

    this.turing.AddState(WRITE_RESULT_STATE, states)
}

TuringCpu.prototype.WriteFlag = function() {
    let write = {}
    let writeNo = {}
    let write0 = {}
    let write1 = {}

    for (let char of TURING_ALPHABET) {
        write0[char] = 'L'
        write1[char] = 'L'
    }

    write['0'] = '0,L,WRITE-0-FLAG'
    write['1'] = '1,L,WRITE-1-FLAG'

    writeNo['0'] = '0,L,WRITE-1-FLAG'
    writeNo['1'] = '1,L,WRITE-0-FLAG'

    write0['~'] = `0,L,${FETCH_STATE}`
    write1['~'] = `1,L,${FETCH_STATE}`

    this.turing.AddState('WRITE-FLAG', write)
    this.turing.AddState('WRITE-NO-FLAG', writeNo)
    this.turing.AddState('WRITE-0-FLAG', write0)
    this.turing.AddState('WRITE-1-FLAG', write1)
}

TuringCpu.prototype.FetchFlags = function() {
    this.WriteFlag()
    this.CheckCarryOrZeroFlags()
    this.CheckNoCarryAndNoZeroFlags()
    this.CheckSignEqualOverflow()
    this.CheckNoZeroAndSignEqualOverflow()
    this.CheckZeroOrSignNotEqualOverflow()

    this.Jump()
    this.JumpOnFlag(OVERFLOW_FLAG_CHAR, JO_CMD.name, JNO_CMD.name, 'OVERFLOW')
    this.JumpOnFlag(SIGN_FLAG_CHAR, JS_CMD.name, JNS_CMD.name, 'SIGN')
    this.JumpOnFlag(ZERO_FLAG_CHAR, JZ_CMD.name, JNZ_CMD.name, 'ZERO')
    this.JumpOnFlag(CARRY_FLAG_CHAR, JC_CMD.name, JNC_CMD.name, 'CARRY')

    this.JumpOnCheck(JA_CMD.name, 'CHECK-NO-CARRY-AND-NO-ZERO-FLAG')
    this.JumpOnCheck(JBE_CMD.name, 'CHECK-CARRY-OR-ZERO-FLAG')

    this.JumpOnCheck(JL_CMD.name, 'CHECK-SIGN-NOT-EQUAL-OVERFLOW-FLAG')
    this.JumpOnCheck(JLE_CMD.name, 'CHECK-ZERO-OR-SIGN-NOT-EQUAL-OVERFLOW')
    this.JumpOnCheck(JGE_CMD.name, 'CHECK-SIGN-EQUAL-OVERFLOW-FLAG')
    this.JumpOnCheck(JG_CMD.name, 'CHECK-NO-ZERO-AND-SIGN-EQUAL-OVERFLOW')
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

        if (command == CMP_CMD.name)
            argStates[LAMBDA] = `~,R,MOVE-ALU-${SUB_CMD.name}`
        else if (command == TEST_CMD.name)
            argStates[LAMBDA] = `~,R,MOVE-ALU-${AND_CMD.name}`
        else
            argStates[LAMBDA] = `~,R,MOVE-ALU-${command}`

        this.turing.AddState(`STEP-${command}`, argStates)

        let states = {}

        for (let char of TURING_ALPHABET)
            states[char] = char != ALU_CHAR ? 'R' : `${ALU_CHAR},R,${command}`

        if (command != CMP_CMD.name && command != TEST_CMD.name) {
            this.turing.AddState(`MOVE-ALU-${command}`, states)
        }
    }

    fetchStates[MOV_CMD.name] = `${MOV_CMD.name},L,FIX-MOV-ARGS`
    fetchStates[PUSH_CMD.name] = `${PUSH_CMD.name},R,PUSH`
    fetchStates[POP_CMD.name] = `${POP_CMD.name},R,POP`
}

TuringCpu.prototype.InitTuringFetchStates = function() {
    for (let register of REGISTER_NAMES) {
        this.GoToRegisterAction(`WRITE-REGISTER-${register}-TO-ALU`, register, `APPEND-TO-ALU`)
        this.GoToRegisterAction(`WRITE-REGISTER-${register}-TO-ALU-#`, register, `APPEND-TO-ALU-#`)
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
    this.SkipWriteBack()

    this.Push()
    this.PushMemory()
    this.Pop()
    this.StackUnderflow()

    this.DecAddress()

    this.CheckMemoryOp()
    this.MovValueToMemory()
    this.MemoryClearMark()
    this.MemoryToALU()
    this.MovToMemory()
    this.MemoryError()

    this.PushRetAddress()
    this.IncAddress()
    this.Call()
    this.Ret()

    let fetchStates = {}
    fetchStates['#'] = `#,L,${WRITE_BACK_STATE}`
    fetchStates['&'] = `&,L,CHECK-MEMORY-OP`
    fetchStates['0'] = `0,N,CONST-ARG-TO-ALU`
    fetchStates['1'] = `1,N,CONST-ARG-TO-ALU`
    fetchStates[HALT_CMD.name] = `${HALT}`
    fetchStates[CALL_CMD.name] = `${CALL_CMD.name},R,CALL-STEP`
    fetchStates[RET_CMD.name] = `${RET_CMD.name},R,RET`
    fetchStates[PROGRAM_END_CHAR] = `${HALT}`

    this.FetchFlags()
    this.FetchJumps(fetchStates)
    this.FetchRegisters(fetchStates)
    this.FetchCommands(fetchStates)

    this.turing.AddState(FETCH_STATE, fetchStates)
}
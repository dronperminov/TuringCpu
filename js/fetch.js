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
    decClean['#'] = `${LAMBDA},N,${RUN_STATE}`

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
    states[`~`] = `,R,FETCH`
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

TuringCpu.prototype.WriteBack = function() {
    let states = {}

    for (let char of TURING_ALPHABET)
        states[char] = char != '@' ? 'L' : '@,R,WRITE-RESULT'

    this.turing.AddState('WRITE-BACK', states)
}

TuringCpu.prototype.WriteResult = function() {
    let states = {}

    for (let register of REGISTER_NAMES)
        states[register] = `${register},R,WRITE-ALU-TO-REGISTER-${register}`

    this.turing.AddState('WRITE-RESULT', states)
}

TuringCpu.prototype.InitTuringFetchStates = function() {
    for (let register of REGISTER_NAMES) {
        this.WriteRegisterToALU(register, false)
        this.WriteRegisterToALU(register, true)
        this.WriteALUToRegister(register)
    }

    this.ConstArgToALU()
    this.AppendToALU(true)
    this.AppendToALU(false)
    this.WriteBack()
    this.WriteResult()

    this.DecAddress()
    this.Jump()

    let fetchStates = {}
    fetchStates['#'] = `#,L,WRITE-BACK`
    fetchStates['0'] = `0,N,CONST-ARG-TO-ALU`
    fetchStates['1'] = `1,N,CONST-ARG-TO-ALU`

    fetchStates[MOV_CMD.name] = `${MOV_CMD.name},L,WRITE-BACK`
    fetchStates[JMP_CMD.name] = `${JMP_CMD.name},R,${JMP_CMD.name}`
    fetchStates[PROGRAM_END_CHAR] = `${HALT}`

    for (let register of REGISTER_NAMES) {
        fetchStates[register] = `${register},R,STEP-REGISTER-${register}-TO-ALU`

        let argStates = {}
        argStates[LAMBDA] = `~,R,WRITE-REGISTER-${register}-TO-ALU`
        argStates['1'] = `~,R,WRITE-REGISTER-${register}-TO-ALU-#`
        argStates['0'] = `${LAMBDA},R,FETCH`
        this.turing.AddState(`STEP-REGISTER-${register}-TO-ALU`, argStates)
    }

    for (let command of ALU_COMMAND_NAMES) {
        fetchStates[command] = `${command},R,STEP-${command}`

        let argStates = {}
        argStates[LAMBDA] = `~,R,MOVE-ALU-${command}`
        this.turing.AddState(`STEP-${command}`, argStates)

        let states = {}

        for (let char of TURING_ALPHABET)
            states[char] = char != ALU_CHAR ? 'R' : `${ALU_CHAR},R,${command}`

        this.turing.AddState(`MOVE-ALU-${command}`, states)
    }

    this.turing.AddState('FETCH', fetchStates)
}
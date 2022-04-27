TuringCpu.prototype.InitTuringFetchInc = function() {
    
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

TuringCpu.prototype.AppendToALU = function(isBinary = false) {
    let end = isBinary ? '-#' : ''

    for (let char of ['0', '1']) {
        let moveStates = {}
        let writeStates = {}

        for (let c of TURING_ALPHABET) {
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

    this.turing.AddState(`APPEND-TO-ALU${end}`, states)

    if (isBinary) {
        let binStates = {}
        binStates[LAMBDA] = `#,L,APPEND-TO-ALU${end}-RETURN`
        this.turing.AddState(`APPEND-#-TO-ALU`, binStates)
    }

    let returnStates = {}

    for (let c of TURING_ALPHABET)
        returnStates[c] = 'L'

    returnStates['O'] = `0,R,APPEND-TO-ALU${end}`
    returnStates['I'] = `1,R,APPEND-TO-ALU${end}`

    this.turing.AddState(`APPEND-TO-ALU${end}-RETURN`, returnStates)
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

    this.AppendToALU(true)
    this.AppendToALU(false)
    this.WriteBack()
    this.WriteResult()

    let fetchStates = {}
    fetchStates['#'] = `#,L,WRITE-BACK`
    fetchStates[PROGRAM_END_CHAR] = `${HALT}`

    for (let register of REGISTER_NAMES) {
        fetchStates[register] = `${register},R,STEP-REGISTER-${register}-TO-ALU`

        let argStates = {}
        argStates[LAMBDA] = `~,R,WRITE-REGISTER-${register}-TO-ALU`
        argStates['I'] = `~,R,WRITE-REGISTER-${register}-TO-ALU-#`
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
TuringCpu.prototype.CheckCarryOrZeroFlags = function() {
    let carry = {}
    let zero = {}

    for (let char of TURING_ALPHABET) {
        carry[char] = 'R'
        zero[char] = 'L'
    }

    carry[CARRY_FLAG_CHAR] = `${CARRY_FLAG_CHAR},R,WRITE-CARRY-OR-ZERO-FLAG`
    zero[ZERO_FLAG_CHAR] = `${ZERO_FLAG_CHAR},R,WRITE-FLAG`

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
    zero[ZERO_FLAG_CHAR] = `${ZERO_FLAG_CHAR},R,WRITE-NO-FLAG`

    this.turing.AddState('CHECK-NO-CARRY-AND-NO-ZERO-FLAG', carry)
    this.turing.AddState('CHECK-NO-CARRY-AND-NO-ZERO-0', zero)
    this.turing.AddState('WRITE-NO-CARRY-AND-NO-ZERO-FLAG', {'0': '0,L,CHECK-NO-CARRY-AND-NO-ZERO-0', '1': '1,L,WRITE-0-FLAG'})
}

TuringCpu.prototype.CheckSignEqualOverflow = function() {
    let equal = {}
    let equalNo = {}
    let equal0 = {}
    let equal1 = {}

    for (let char of TURING_ALPHABET) {
        equal[char] = 'R'
        equalNo[char] = 'R'
    }

    equal[OVERFLOW_FLAG_CHAR] = `${OVERFLOW_FLAG_CHAR},R,CHECK-SIGN-EQUAL-OVERFLOW-FLAG-2`
    equalNo[OVERFLOW_FLAG_CHAR] = `${OVERFLOW_FLAG_CHAR},R,CHECK-SIGN-NOT-EQUAL-OVERFLOW-FLAG-2`

    equal0[LAMBDA] = 'R'
    equal0[SIGN_FLAG_CHAR] = `${SIGN_FLAG_CHAR},R,WRITE-NO-FLAG`

    equal1[LAMBDA] = 'R'
    equal1[SIGN_FLAG_CHAR] = `${SIGN_FLAG_CHAR},R,WRITE-FLAG`

    this.turing.AddState('CHECK-SIGN-EQUAL-OVERFLOW-FLAG', equal)
    this.turing.AddState('CHECK-SIGN-EQUAL-OVERFLOW-FLAG-2', {'0': `0,R,CHECK-SIGN-EQUAL-0`, '1': '1,R,CHECK-SIGN-EQUAL-1'})

    this.turing.AddState('CHECK-SIGN-NOT-EQUAL-OVERFLOW-FLAG', equalNo)
    this.turing.AddState('CHECK-SIGN-NOT-EQUAL-OVERFLOW-FLAG-2', {'0': `0,R,CHECK-SIGN-EQUAL-1`, '1': '1,R,CHECK-SIGN-EQUAL-0'})

    this.turing.AddState('CHECK-SIGN-EQUAL-0', equal0)
    this.turing.AddState('CHECK-SIGN-EQUAL-1', equal1)
}

TuringCpu.prototype.CheckNoZeroAndSignEqualOverflow = function() {
    let check = {}
    let move = {}

    for (let char of TURING_ALPHABET) {
        check[char] = 'R'
    }

    check[ZERO_FLAG_CHAR] = `${ZERO_FLAG_CHAR},R,WRITE-NO-ZERO-AND-SIGN-EQUAL-OVERFLOW`

    for (let char of ['0', '1', LAMBDA, ...FLAG_CHARS])
        move[char] = 'L'

    move[OVERFLOW_FLAG_CHAR] = `${OVERFLOW_FLAG_CHAR},R,CHECK-SIGN-EQUAL-OVERFLOW-FLAG-2`

    this.turing.AddState('CHECK-NO-ZERO-AND-SIGN-EQUAL-OVERFLOW', check)
    this.turing.AddState('CHECK-SIGN-EQUAL-OVERFLOW-FLAG-MOVE', move)
    this.turing.AddState('WRITE-NO-ZERO-AND-SIGN-EQUAL-OVERFLOW', {'0': '0,L,CHECK-SIGN-EQUAL-OVERFLOW-FLAG-MOVE', '1': '1,L,WRITE-0-FLAG'})
}

TuringCpu.prototype.CheckZeroOrSignNotEqualOverflow = function() {
    let check = {}
    let move = {}

    for (let char of TURING_ALPHABET) {
        check[char] = 'R'
    }

    check[ZERO_FLAG_CHAR] = `${ZERO_FLAG_CHAR},R,WRITE-ZERO-OR-SIGN-NOT-EQUAL-OVERFLOW`

    for (let char of ['0', '1', LAMBDA, ...FLAG_CHARS])
        move[char] = 'L'

    move[OVERFLOW_FLAG_CHAR] = `${OVERFLOW_FLAG_CHAR},R,CHECK-SIGN-NOT-EQUAL-OVERFLOW-FLAG-2`

    this.turing.AddState('CHECK-ZERO-OR-SIGN-NOT-EQUAL-OVERFLOW', check)
    this.turing.AddState('CHECK-SIGN-NOT-EQUAL-OVERFLOW-FLAG-MOVE', move)
    this.turing.AddState('WRITE-ZERO-OR-SIGN-NOT-EQUAL-OVERFLOW', {'0': '0,L,CHECK-SIGN-NOT-EQUAL-OVERFLOW-FLAG-MOVE', '1': '1,L,WRITE-1-FLAG'})
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

TuringCpu.prototype.JumpOnCheck = function(name, checkState) {
    let states = {}

    states[LAMBDA] = `~,R,${checkState}`
    states['0'] = `${LAMBDA},R,${RETURN_RUN_STATE}`
    states['1'] = `${LAMBDA},R,${JMP_CMD.name}`

    this.turing.AddState(`${name}`, states)
}

TuringCpu.prototype.JumpOnFlag = function(flagChar, flag, flagNot, name) {
    let check = {}
    let states = {}
    let statesNot = {}

    for (let char of TURING_ALPHABET)
        check[char] = 'R'

    check[flagChar] = `${flagChar},R,WRITE-FLAG`

    states[LAMBDA] = `~,R,CHECK-${name}-FLAG`
    states['0'] = `${LAMBDA},R,${RETURN_RUN_STATE}`
    states['1'] = `${LAMBDA},R,${JMP_CMD.name}`

    statesNot[LAMBDA] = `~,R,CHECK-${name}-FLAG`
    statesNot['0'] = `${LAMBDA},R,${JMP_CMD.name}`
    statesNot['1'] = `${LAMBDA},R,${RETURN_RUN_STATE}`

    this.turing.AddState(`CHECK-${name}-FLAG`, check)
    this.turing.AddState(`${flag}`, states)
    this.turing.AddState(`${flagNot}`, statesNot)
}

TuringCpu.prototype.FetchJumps = function(fetchStates) {
    fetchStates[JMP_CMD.name] = `${JMP_CMD.name},R,${JMP_CMD.name}`

    // overflow
    fetchStates[JO_CMD.name] = `${JO_CMD.name},R,${JO_CMD.name}`
    fetchStates[JNO_CMD.name] = `${JNO_CMD.name},R,${JNO_CMD.name}`

    // sign
    fetchStates[JS_CMD.name] = `${JS_CMD.name},R,${JS_CMD.name}`
    fetchStates[JNS_CMD.name] = `${JNS_CMD.name},R,${JNS_CMD.name}`

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

    // sign != overflow
    fetchStates[JL_CMD.name] = `${JL_CMD.name},R,${JL_CMD.name}`
    fetchStates[JNGE_CMD.name] = `${JNGE_CMD.name},R,${JL_CMD.name}`

    // sign == overflow
    fetchStates[JGE_CMD.name] = `${JGE_CMD.name},R,${JGE_CMD.name}`
    fetchStates[JNL_CMD.name] = `${JNL_CMD.name},R,${JGE_CMD.name}`

    // zero or sign != overflow
    fetchStates[JLE_CMD.name] = `${JLE_CMD.name},R,${JLE_CMD.name}`
    fetchStates[JNG_CMD.name] = `${JNG_CMD.name},R,${JLE_CMD.name}`

    // not zero and sign = overflow
    fetchStates[JG_CMD.name] = `${JG_CMD.name},R,${JG_CMD.name}`
    fetchStates[JNLE_CMD.name] = `${JNLE_CMD.name},R,${JG_CMD.name}`
}

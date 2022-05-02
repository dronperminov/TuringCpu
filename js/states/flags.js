TuringCpu.prototype.InitTuringOverflowFlagStates = function() {
    let overflow = {}
    let noOverflow = {}

    let overflowEqual0 = {}
    let overflowEqual1 = {}

    for (let char of ['0', '1', LAMBDA, ...FLAG_CHARS]) {
        overflow[char] = 'R'
        noOverflow[char] = 'R'

        overflowEqual0[char] = 'R'
        overflowEqual1[char] = 'R'
    }

    overflow[OVERFLOW_FLAG_CHAR] = `${OVERFLOW_FLAG_CHAR},R,OVERFLOW-WRITE`
    noOverflow[OVERFLOW_FLAG_CHAR] = `${OVERFLOW_FLAG_CHAR},R,NO-OVERFLOW-WRITE`

    overflowEqual0['O'] = `${LAMBDA},R,OVERFLOW`
    overflowEqual0['I'] = `${LAMBDA},R,NO-OVERFLOW`
    overflowEqual0[OVERFLOW_FLAG_CHAR] = `${OVERFLOW_FLAG_CHAR},R,NO-OVERFLOW-WRITE`

    overflowEqual1['I'] = `${LAMBDA},R,OVERFLOW`
    overflowEqual1['O'] = `${LAMBDA},R,NO-OVERFLOW`
    overflowEqual1[OVERFLOW_FLAG_CHAR] = `${OVERFLOW_FLAG_CHAR},R,NO-OVERFLOW-WRITE`

    this.turing.AddState("OVERFLOW", overflow)
    this.turing.AddState("NO-OVERFLOW", noOverflow)
    
    this.turing.AddState("OVERFLOW-EQUAL-0", overflowEqual0)
    this.turing.AddState("OVERFLOW-EQUAL-1", overflowEqual1)

    this.turing.AddState("OVERFLOW-WRITE", {'0': '1,L,BEGIN-SIGN', '1': '1,L,BEGIN-SIGN'})
    this.turing.AddState("NO-OVERFLOW-WRITE", {'0': '0,L,BEGIN-SIGN', '1': '0,L,BEGIN-SIGN'})
}

TuringCpu.prototype.InitTuringSignFlagStates = function() {
    let check = {}
    let sign = {}
    let noSign = {}

    for (let char of ['0', '1', LAMBDA, ...FLAG_CHARS]) {
        sign[char] = 'R'
        noSign[char] = 'R'
    }

    check['0'] = '0,R,NO-SIGN'
    check['1'] = '1,R,SIGN'

    sign[SIGN_FLAG_CHAR] = `${SIGN_FLAG_CHAR},R,SIGN-WRITE`
    noSign[SIGN_FLAG_CHAR] = `${SIGN_FLAG_CHAR},R,NO-SIGN-WRITE`

    this.turing.AddState("CHECK-SIGN", check)
    this.turing.AddState("SIGN", sign)
    this.turing.AddState("NO-SIGN", noSign)

    this.turing.AddState("SIGN-WRITE", {'0': '1,L,BEGIN-CARRY', '1': '1,L,BEGIN-CARRY'})
    this.turing.AddState("NO-SIGN-WRITE", {'0': '0,L,BEGIN-CARRY', '1': '0,L,BEGIN-CARRY'})
}

TuringCpu.prototype.InitTuringCarryFlagStates = function() {
    let carry = {}
    let noCarry = {}

    for (let char of ['0', '1', LAMBDA, ...FLAG_CHARS]) {
        carry[char] = 'R'
        noCarry[char] = 'R'
    }

    carry[CARRY_FLAG_CHAR] = `${CARRY_FLAG_CHAR},R,CARRY-WRITE`
    noCarry[CARRY_FLAG_CHAR] = `${CARRY_FLAG_CHAR},R,NO-CARRY-WRITE`

    this.turing.AddState("CARRY", carry)
    this.turing.AddState("NO-CARRY", noCarry)

    this.turing.AddState("CARRY-WRITE", {'0': '1,L,BEGIN-ZERO', '1': '1,L,BEGIN-ZERO'})
    this.turing.AddState("NO-CARRY-WRITE", {'0': '0,L,BEGIN-ZERO', '1': '0,L,BEGIN-ZERO'})
}

TuringCpu.prototype.InitTuringZeroFlagStates = function() {
    let check = {}
    let zero = {}
    let noZero = {}

    for (let char of ['0', '1', LAMBDA, ...FLAG_CHARS]) {
        zero[char] = 'R'
        noZero[char] = 'R'
    }

    check['0'] = 'R'
    check['1'] = '1,R,NO-ZERO'
    check[LAMBDA] = ',R,ZERO'

    zero[ZERO_FLAG_CHAR] = `${ZERO_FLAG_CHAR},R,ZERO-WRITE`
    noZero[ZERO_FLAG_CHAR] = `${ZERO_FLAG_CHAR},R,NO-ZERO-WRITE`

    this.turing.AddState("CHECK-ZERO", check)
    this.turing.AddState("ZERO", zero)
    this.turing.AddState("NO-ZERO", noZero)

    this.turing.AddState("ZERO-WRITE", {'0': `1,L,${RETURN_RUN_STATE}`, '1': `1,L,${RETURN_RUN_STATE}`})
    this.turing.AddState("NO-ZERO-WRITE", {'0': `0,L,${RETURN_RUN_STATE}`, '1': `0,L,${RETURN_RUN_STATE}`})
}

TuringCpu.prototype.InitTuringFlagsStates = function() {
    this.InitTuringOverflowFlagStates()
    this.InitTuringSignFlagStates()
    this.InitTuringCarryFlagStates()
    this.InitTuringZeroFlagStates()

    let beginSign = {}
    let beginCarry = {}
    let beginZero = {}

    for (let char of ['0', '1', LAMBDA, ...FLAG_CHARS, ALU_CHAR, ALU_CARRY_CHAR]) {
        beginSign[char] = 'L'
        beginCarry[char] = 'L'
        beginZero[char] = 'L'
    }

    beginSign[ALU_CHAR] = `${ALU_CHAR},R,CHECK-SIGN`
    beginSign[ALU_CARRY_CHAR] = `${ALU_CARRY_CHAR},R,CHECK-SIGN`

    beginCarry[ALU_CHAR] = `${ALU_CHAR},R,NO-CARRY`
    beginCarry[ALU_CARRY_CHAR] = `${ALU_CHAR},R,CARRY`

    beginZero[ALU_CHAR] = `${ALU_CHAR},R,CHECK-ZERO`

    this.turing.AddState('BEGIN-SIGN', beginSign)
    this.turing.AddState('BEGIN-CARRY', beginCarry)
    this.turing.AddState('BEGIN-ZERO', beginZero)
}

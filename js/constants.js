const ZERO_FLAG = "ZF"
const CARRY_FLAG = "CF"

const FLAG_NAMES = [ZERO_FLAG, CARRY_FLAG]
const REGISTER_NAMES = ["A", "B"]//, "C", "D", "E", "F"]

const REGISTER_TYPE = 'reg'
const CONSTANT_TYPE = 'const'
const ADDRESS_TYPE = 'address'
const LABEL_TYPE = 'label'
const UNKNOWN_TYPE = 'unknown'

const LABEL_COMMAND = 'label'
const OTHER_COMMAND = 'other'


const ARITHMETIC_ARGS = [
    [REGISTER_TYPE, REGISTER_TYPE],
    [REGISTER_TYPE, CONSTANT_TYPE],
    [REGISTER_TYPE, ADDRESS_TYPE]
]

const MOV_ARGS = [
    [REGISTER_TYPE, REGISTER_TYPE],
    [REGISTER_TYPE, CONSTANT_TYPE],
    [REGISTER_TYPE, ADDRESS_TYPE],
    [ADDRESS_TYPE, REGISTER_TYPE],
    [ADDRESS_TYPE, CONSTANT_TYPE]
]

const MOV_CMD = { name: "MOV", args: 2, argTypes: MOV_ARGS }

const PUSH_CMD = { name: "PUSH", args: 1, argTypes: [[REGISTER_TYPE], [CONSTANT_TYPE], [ADDRESS_TYPE]] }
const POP_CMD = { name: "POP", args: 1, argTypes: [[REGISTER_TYPE]] }

const INC_CMD = { name: "INC", args: 1, argTypes: [[REGISTER_TYPE]] }
const DEC_CMD = { name: "DEC", args: 1, argTypes: [[REGISTER_TYPE]] }

const ADD_CMD = { name: "ADD", args: 2, argTypes: ARITHMETIC_ARGS }
const SUB_CMD = { name: "SUB", args: 2, argTypes: ARITHMETIC_ARGS }
const MUL_CMD = { name: "MUL", args: 2, argTypes: ARITHMETIC_ARGS }
const CMP_CMD = { name: "CMP", args: 2, argTypes: ARITHMETIC_ARGS }

const AND_CMD = { name: "AND", args: 2, argTypes: ARITHMETIC_ARGS }
const OR_CMD = { name: "OR", args: 2, argTypes: ARITHMETIC_ARGS }
const XOR_CMD = { name: "XOR", args: 2, argTypes: ARITHMETIC_ARGS }
const NOT_CMD = { name: "NOT", args: 1, argTypes: [[REGISTER_TYPE]] }
const SHL_CMD = { name: "SHL", args: 2, argTypes: ARITHMETIC_ARGS }
const SHR_CMD = { name: "SHR", args: 2, argTypes: ARITHMETIC_ARGS }

const JMP_CMD = {name: 'JMP', args: 1, argTypes: [[LABEL_TYPE]] }

const JZ_CMD = {name: 'JZ', args: 1, argTypes: [[LABEL_TYPE]] }
const JNZ_CMD = {name: 'JNZ', args: 1, argTypes: [[LABEL_TYPE]] }

const JC_CMD = {name: 'JC', args: 1, argTypes: [[LABEL_TYPE]] }
const JNC_CMD = {name: 'JNC', args: 1, argTypes: [[LABEL_TYPE]] }

const JA_CMD = {name: 'JA', args: 1, argTypes: [[LABEL_TYPE]] }
const JAE_CMD = {name: 'JAE', args: 1, argTypes: [[LABEL_TYPE]] }
const JB_CMD = {name: 'JB', args: 1, argTypes: [[LABEL_TYPE]] }
const JBE_CMD = {name: 'JBE', args: 1, argTypes: [[LABEL_TYPE]] }
const JE_CMD = {name: 'JE', args: 1, argTypes: [[LABEL_TYPE]] }
const JNE_CMD = {name: 'JNE', args: 1, argTypes: [[LABEL_TYPE]] }

const JNA_CMD = {name: 'JNA', args: 1, argTypes: [[LABEL_TYPE]] }
const JNAE_CMD = {name: 'JNAE', args: 1, argTypes: [[LABEL_TYPE]] }
const JNB_CMD = {name: 'JNB', args: 1, argTypes: [[LABEL_TYPE]] }
const JNBE_CMD = {name: 'JNBE', args: 1, argTypes: [[LABEL_TYPE]] }

const COMMANDS = [
    MOV_CMD,
    PUSH_CMD, POP_CMD,

    INC_CMD, DEC_CMD,
    ADD_CMD, SUB_CMD, MUL_CMD, CMP_CMD,
    AND_CMD, OR_CMD, XOR_CMD, NOT_CMD, SHL_CMD, SHR_CMD,

    JMP_CMD,
    JZ_CMD, JNZ_CMD,
    JC_CMD, JNC_CMD,
    JA_CMD, JAE_CMD, JB_CMD, JBE_CMD, JE_CMD, JNE_CMD,
    JNA_CMD, JNAE_CMD, JNB_CMD, JNBE_CMD
]

const UNARY_COMMAND_NAMES = [
    INC_CMD.name, DEC_CMD.name, NOT_CMD.name,
]

const BINARY_COMMAND_NAMES = [
    ADD_CMD.name, SUB_CMD.name, MUL_CMD.name, CMP_CMD.name,
    AND_CMD.name, OR_CMD.name, XOR_CMD.name,
    SHR_CMD.name, SHL_CMD.name
]

const ALU_COMMAND_NAMES = [
    ...UNARY_COMMAND_NAMES,
    ...BINARY_COMMAND_NAMES
]

const CONSTANT_REGEXP = "\\b(\\d+d?|[01]+b|0b[01]+|0o[0-7]+|0x[\\da-fA-F]+)\\b"
const LABEL_REGEXP = "[.a-zA-Z]\\w*"

const HIGHTLIGHT_RULES = [
    {regex: /;.*/gi, name: "comment-code"},
    {regex: new RegExp(`^ *${LABEL_REGEXP}:`, "gi"), name: "label-code"},
    {regex: new RegExp(CONSTANT_REGEXP, "g"), name: "number-code"},
    {regex: new RegExp(`\\b(${REGISTER_NAMES.join('|')})\\b`, "g"), name: "register-code"},
    {regex: new RegExp(`\\b(${COMMANDS.map((cmd) => cmd.name).join('|')})\\b`, "gi"), name: "command-code"}
]

const INFO_BLOCKS_COLORS = {
    "A": { name: "A", border: "hsl(0, 100%, 64%)", background: "hsl(0, 100%, 84%)"},
    "B": { name: "B", border: "hsl(146, 83%, 44%)", background: "hsl(146, 83%, 64%)"},
    "C": { name: "C", border: "hsl(44, 100%, 62%)", background: "hsl(44, 100%, 82%)"},
    "D": { name: "D", border: "hsl(212, 98%, 59%)", background: "hsl(212, 98%, 79%)"},
    "E": { name: "E", border: "hsl(187, 100%, 42%)", background: "hsl(187, 100%, 62%)"},
    "F": { name: "F", border: "hsl(240, 60%, 65%)", background: "hsl(240, 60%, 85%)"},
    "ZF": { name: "ZF", border: "hsl(60, 60%, 65%)", background: "hsl(60, 60%, 85%)"},
    "CF": { name: "CF", border: "hsl(80, 60%, 65%)", background: "hsl(80, 60%, 85%)"},
}

function IsRegister(arg) {
    return REGISTER_NAMES.indexOf(arg) > -1
}

function IsConstant(arg) {
    return arg.match(new RegExp(`^${CONSTANT_REGEXP}$`, "g")) != null
}

function IsAddress(arg) {
    if (!arg.startsWith('[') || !arg.endsWith(']'))
        return false

    arg = arg.substr(1, arg.length - 2)
    return IsRegister(arg) || IsConstant(arg)
}

function IsLabel(arg) {
    return arg.match(new RegExp(`^${LABEL_REGEXP}$`, "g")) != null
}

function GetArgType(arg) {
    if (IsRegister(arg))
        return REGISTER_TYPE

    if (IsConstant(arg))
        return CONSTANT_TYPE

    if (IsAddress(arg))
        return ADDRESS_TYPE

    return UNKNOWN_TYPE
}

const MOVE_LEFT = "L"
const MOVE_NONE = "N"
const MOVE_RIGHT = "R"
const LAMBDA = ' '
const HALT = "!"

const TAPE_CELL_SIZE = 40
const LAMBDA_CELL = 'λ'
const LEFT_CELL = '‹'
const RIGHT_CELL = '›'

const PROGRAM_CHAR = 'PRG'
const PROGRAM_END_CHAR = 'HLT'
const ALU_CHAR = 'ALU'
const ALU_CARRY_CHAR = '$'
const ZERO_FLAG_CHAR = 'ZF'
const CARRY_FLAG_CHAR = 'CF'
const MEMORY_CHAR = 'MEM'
const STACK_CHAR = 'STK'

const RUN_STATE = 'RUN'
const RETURN_RUN_STATE = 'RETURN-RUN'
const FIX_REGISTER_STATE = 'FIX-REGISTER'

const PARTS_ORDER = [
    PROGRAM_CHAR,
    ...REGISTER_NAMES,
    ALU_CHAR,
    ZERO_FLAG_CHAR,
    CARRY_FLAG_CHAR,
    MEMORY_CHAR,
    STACK_CHAR
]

const TURING_ALPHABET = [
    LAMBDA,
    '0', '1',
    'O', 'I', '#', '@',

    PROGRAM_CHAR, PROGRAM_END_CHAR,
    ...COMMANDS.map((v) => v.name),
    '&',

    ALU_CHAR,
    ZERO_FLAG_CHAR, CARRY_FLAG_CHAR,

    MEMORY_CHAR,
    STACK_CHAR,
    ...REGISTER_NAMES
]

const TURING_STATES = [
    {name: "MEMORY-RUN",        transitions: `{"0": "R", "1": "R", "I": "I,L,MEMORY-MOVE"}`},
    {name: "MEMORY-MOVE",       transitions: `{"0": "1,L,MEMORY-MOVE-dec", "1": "0,R,MEMORY-MOVE-mark"}`},
    {name: "MEMORY-MOVE-mark",  transitions: `{"0": "R", "1": "R", "#": "O,L,MEMORY-MOVE-begin", "I": "R", "O": "R", "${LAMBDA}": "R"}`},
    {name: "MEMORY-MOVE-begin", transitions: `{"0": "L", "1": "L", "#": "L", "I": "I,L,MEMORY-MOVE", "O": "L", "${LAMBDA}": "L"}`},
    {name: "MEMORY-MOVE-dec",   transitions: `{"0": "1,L,MEMORY-MOVE-dec", "1": "0,R,MEMORY-MOVE-mark", "${MEMORY_CHAR}": "${MEMORY_CHAR},R,MEMORY-MOVE-shift"}`},
    {name: "MEMORY-MOVE-shift", transitions: `{"0": ",R,MEMORY-MOVE-shift", "1": ",R,MEMORY-MOVE-shift", "I": ",R,MEMORY-MOVE-find"}`},
    {name: "MEMORY-MOVE-find",  transitions: `{"0": "R", "1": "R", "${LAMBDA}": "R", "#": "#,R,${RETURN_RUN_STATE}", "O": "#,R,MEMORY-MOVE-find"}`},

    {name: "POP-init", transitions: `{"0": "R", "1": "R", "#": "R", "${LAMBDA}": ",L,POP-#"}`},
    {name: "POP-#", transitions: `{"0": "L", "1": "L", "#": "#,R,${RETURN_RUN_STATE}", "${STACK_CHAR}": "${STACK_CHAR},R,${RETURN_RUN_STATE}"}`},
    {name: "POP",        transitions: `{"0": "0,N,POP-clear", "1": "1,N,POP-clear", "${LAMBDA}": ",N,${RETURN_RUN_STATE}"}`},
    {name: "POP-clear",  transitions: `{"0": ",R,POP-clear", "1": ",R,POP-clear", "${LAMBDA}": ",L,POP-move"}`},
    {name: "POP-move",   transitions: `{"#": ",L,POP-begin", "${LAMBDA}": "L"}`},
    {name: "POP-begin",  transitions: `{"0": "L", "1": "L", "#": "#,R,${RETURN_RUN_STATE}", "${STACK_CHAR}": "${RETURN_RUN_STATE}"}`},

    {name: "PUSH", transitions: `{"0": "R", "1": "R", "#": "R", "${LAMBDA}": "#,R,${RETURN_RUN_STATE}"}`},

    {name: "move-begin", transitions: `{"0": "L",   "1": "L", "${ZERO_FLAG_CHAR}": "L", "${CARRY_FLAG_CHAR}": "L", "${LAMBDA}": "L", "O": "0,L,move-begin", "I": "1,L,move-begin", "${ALU_CHAR}": "${ALU_CHAR},R,check-zero", "${ALU_CARRY_CHAR}": "${ALU_CHAR},R,write-carry"}`},
    {name: "return-to-alu", transitions: `{"0": "L",   "1": "L", "${ZERO_FLAG_CHAR}": "L", "${CARRY_FLAG_CHAR}": "L", "${LAMBDA}": "L", "${ALU_CHAR}": "${ALU_CHAR},R,${RETURN_RUN_STATE}"}`},

    {name: "write-carry", transitions: `{"0": "R", "1": "R", "${LAMBDA}": "R", "O": "0,R,write-carry", "I": "1,R,write-carry", "#": ",R,write-carry", "${ZERO_FLAG_CHAR}": "R", "${CARRY_FLAG_CHAR}": "${CARRY_FLAG_CHAR},R,write-carry-begin"}`},
    {name: "write-no-carry", transitions: `{"0": "R", "1": "R", "${LAMBDA}": "R", "O": "0,R,write-no-carry", "I": "1,R,write-no-carry", "#": ",R,write-no-carry", "${ZERO_FLAG_CHAR}": "R", "${CARRY_FLAG_CHAR}": "${CARRY_FLAG_CHAR},R,write-no-carry-begin"}`},
    {name: "write-carry-begin", transitions: `{"0": "1,L,move-begin", "1": "1,L,move-begin", "${LAMBDA}": "L", "${CARRY_FLAG_CHAR}": "L", "${ZERO_FLAG_CHAR}": "L", "${ALU_CHAR}": "${ALU_CHAR},R,${RETURN_RUN_STATE}"}`},
    {name: "write-no-carry-begin", transitions: `{"0": "0,L,move-begin", "1": "0,L,move-begin", "${LAMBDA}": "L", "${CARRY_FLAG_CHAR}": "L", "${ZERO_FLAG_CHAR}": "L", "${ALU_CHAR}": "${ALU_CHAR},R,${RETURN_RUN_STATE}"}`},

    {name: "write-zero", transitions: `{"0": "R", "1": "R", "${LAMBDA}": "R", "${CARRY_FLAG_CHAR}": "R", "${ZERO_FLAG_CHAR}": "${ZERO_FLAG_CHAR},R,write-zero-begin"}`},
    {name: "write-no-zero", transitions: `{"0": "R", "1": "R", "${LAMBDA}": "R", "${CARRY_FLAG_CHAR}": "R", "${ZERO_FLAG_CHAR}": "${ZERO_FLAG_CHAR},R,write-no-zero-begin"}`},
    {name: "write-zero-begin", transitions: `{"0": "1,L,return-to-alu", "1": "1,L,return-to-alu", "${LAMBDA}": "L", "${CARRY_FLAG_CHAR}": "L", "${ZERO_FLAG_CHAR}": "L", "${ALU_CHAR}": "${ALU_CHAR},R,${RETURN_RUN_STATE}"}`},
    {name: "write-no-zero-begin", transitions: `{"0": "0,L,return-to-alu", "1": "0,L,return-to-alu", "${LAMBDA}": "L", "${CARRY_FLAG_CHAR}": "L", "${ZERO_FLAG_CHAR}": "L", "${ALU_CHAR}": "${ALU_CHAR},R,${RETURN_RUN_STATE}"}`},

    {name: "check-zero", transitions: `{"0": "R", "1": "1,R,write-no-zero", "${LAMBDA}": ",N,write-zero"}`},
    {name: "normalize", transitions: `{"0": "L", "1": "L", "I": "1,L,normalize", "O": "0,L,normalize", "${LAMBDA}": "L", "${ALU_CHAR}": "${ALU_CHAR},R,write-no-carry", "${ALU_CARRY_CHAR}": "${ALU_CHAR},R,write-carry"}`},

    // инкремент
    {name: "INC",   transitions: `{"0": "R",              "1": "R",      "${LAMBDA}": ",L,INC-1"}`},
    {name: "INC-1", transitions: `{"0": "1,N,write-no-carry", "1": "0,L,",   "${ALU_CHAR}": "${ALU_CHAR},R,write-carry"}`},

    // декремент
    {name: "DEC",   transitions: `{"0": "R",              "1": "R",           "${LAMBDA}": ",L,DEC-1"}`},
    {name: "DEC-1", transitions: `{"0": "1,L,DEC-1", "1": "0,N,write-no-carry",   "${ALU_CHAR}": "${ALU_CHAR},R,write-carry"}`},

    // сложение двух чисел
    {name: "ADD",       transitions: `{"0": "R", "1": "R", "${LAMBDA}": ",L,ADD-check", "I": "R", "#": "R", "O": "R"}`},
    {name: "ADD-check", transitions: `{"0": ",L,ADD-zero", "1": ",L,ADD-one", "#": ",L,normalize" }`},
    {name: "ADD-zero",  transitions: `{"0": "L", "1": "L", "#": "#,L,ADD-zero2" }`},
    {name: "ADD-one",   transitions: `{"0": "L", "1": "L", "#": "#,L,ADD-one2" }`},
    {name: "ADD-zero2", transitions: `{"0": "O,N,ADD", "1": "I,N,ADD", "I": "L", "${ALU_CHAR}": "${ALU_CHAR},R,ADD", "${ALU_CARRY_CHAR}": "${ALU_CARRY_CHAR},R,ADD", "O": "L"}`},
    {name: "ADD-one2",  transitions: `{"0": "I,N,ADD", "1": "O,L,ADD-one3", "I": "L", "${ALU_CHAR}": "${ALU_CARRY_CHAR},R,ADD", "${ALU_CARRY_CHAR}": "${ALU_CARRY_CHAR},R,ADD", "O": "L"}`},
    {name: "ADD-one3",  transitions: `{"0": "1,N,ADD", "1": "0,L,ADD-one3", "${ALU_CHAR}": "${ALU_CARRY_CHAR},R,ADD", "${ALU_CARRY_CHAR}": "${ALU_CARRY_CHAR},R,ADD"}`},

    // разность двух чисел
    {name: "SUB", transitions: `{"0": "R", "1": "R", "#": "R", "I": "R", "O": "R", "${LAMBDA}": ",L,SUB-check"}`},
    {name: "SUB-check", transitions: `{"0": ",L,SUB-move0", "1": ",L,SUB-move1", "#": ",L,normalize"}`},
    {name: "SUB-move0", transitions: `{"0": "L", "1": "L", "#": "#,L,SUB-sub0"}`},
    {name: "SUB-move1", transitions: `{"0": "L", "1": "L", "#": "#,L,SUB-sub1"}`},
    {name: "SUB-sub0", transitions: `{"0": "O,N,SUB", "1": "I,N,SUB", "I": "L", "O": "L"}`},
    {name: "SUB-sub1", transitions: `{"0": "I,L,SUB-sub-carry", "1": "O,N,SUB", "I": "L", "O": "L"}`},
    {name: "SUB-sub-carry", transitions: `{"0": "1,L,SUB-sub-carry", "1": "0,N,SUB", "${ALU_CHAR}": "${ALU_CARRY_CHAR},R,SUB", "${ALU_CARRY_CHAR}": "${ALU_CARRY_CHAR},R,SUB"}`},

    // умножение
    {name: "MUL", transitions: `{"0": "O,R,MUL-move0", "1": "O,R,MUL-move1", "#": ",R,MUL-norm1", "O": "R"}`},
    {name: "MUL-move1", transitions: `{"0": "R", "1": "R", "#": "#,R,MUL-move1-check", "${LAMBDA}":  ",R,MUL-move1-last"}`},
    {name: "MUL-move0", transitions: `{"0": "R", "1": "R", "#": "#,R,MUL-move0-check", "${LAMBDA}":  ",R,MUL-move0-last"}`},
    {name: "MUL-move0-check", transitions: `{"0": "O,R,MUL-move0", "1": "O,R,MUL-move1", "I": "R", "O": "R"}`},
    {name: "MUL-move1-check", transitions: `{"0": "I,R,MUL-move0", "1": "I,R,MUL-move1", "I": "R", "O": "R"}`},
    {name: "MUL-move0-last", transitions: `{"0": "R", "1": "R", "I": "R", "O": "R", "${LAMBDA}":  "0,L,MUL-begin"}`},
    {name: "MUL-move1-last", transitions: `{"0": "R", "1": "R", "I": "R", "O": "R", "${LAMBDA}":  "1,L,MUL-begin"}`},
    {name: "MUL-begin", transitions: `{"0": "L", "1": "L", "#": "L", "I": "L", "O": "L", "${ALU_CHAR}": "${ALU_CHAR},R,MUL", "${LAMBDA}":  "L"}`},
    {name: "MUL-norm1", transitions: `{"I": "1,R,MUL-norm1", "O": "0,R,MUL-norm1", "${LAMBDA}":  "#,L,MUL-norm2"}`},
    {name: "MUL-norm2", transitions: `{"0": "L", "1": "L", "I": "1,L,MUL-norm2", "O": "0,L,MUL-norm2", "${ALU_CHAR}": "${ALU_CHAR},R,MUL-pre", "${LAMBDA}":  "L"}`},
    {name: "MUL-pre", transitions: `{"0": "R", "1": "R", "${LAMBDA}":  ",R,MUL-go-back"}`},
    {name: "MUL-clean", transitions: `{"0": ",L,MUL-clean", "1": ",L,MUL-clean", "${LAMBDA}": ",L,normalize"}`},
    {name: "MUL-go-shift", transitions: `{"0": "R", "1": "R", "#": "#,N,MUL-shift", "I": "1,R,MUL-go-shift", "O": "0,R,MUL-go-shift", "${LAMBDA}": "R"}`},
    {name: "MUL-norm", transitions: `{"0": "L", "1": "L", "I": "1,L,MUL-norm", "O": "0,L,MUL-norm", "${ALU_CHAR}": "${ALU_CHAR},R,MUL-go-shift", "${ALU_CARRY_CHAR}": "${ALU_CARRY_CHAR},R,MUL-go-shift"}`},
    {name: "MUL-back2", transitions: `{"0": "R", "1": "R", "I": "I,L,MUL-add", "O": "O,L,MUL-add"}`},
    {name: "MUL-back", transitions: `{"0": "R", "1": "R", "I": "R", "O": "R", "${LAMBDA}": ",R,MUL-back2"}`},
    {name: "MUL-make-carry", transitions: `{"0": "1,R,MUL-back", "1": "0,L,MUL-make-carry", "${ALU_CHAR}": "${ALU_CARRY_CHAR},R,MUL-back", "${ALU_CARRY_CHAR}": "${ALU_CARRY_CHAR},R,MUL-back"}`},
    {name: "MUL-make-add1", transitions: `{"0": "I,R,MUL-back", "1": "O,L,MUL-make-carry", "I": "L", "O": "L", "${ALU_CHAR}": "${ALU_CARRY_CHAR},R,MUL-back", "${ALU_CARRY_CHAR}": "${ALU_CARRY_CHAR},R,MUL-back"}`},
    {name: "MUL-make-add0", transitions: `{"0": "O,R,MUL-back", "1": "I,R,MUL-back", "I": "L", "O": "L", "${ALU_CHAR}": "${ALU_CHAR},R,MUL-back", "${ALU_CARRY_CHAR}": "${ALU_CARRY_CHAR},R,MUL-back"}`},
    {name: "MUL-add1", transitions: `{"0": "L", "1": "L", "${LAMBDA}": ",L,MUL-make-add1"}`},
    {name: "MUL-add0", transitions: `{"0": "L", "1": "L", "${LAMBDA}": ",L,MUL-make-add0"}`},
    {name: "MUL-add", transitions: `{"0": "O,L,MUL-add0", "1": "I,L,MUL-add1", "${LAMBDA}": ",L,MUL-norm"}`},
    {name: "MUL-add-move", transitions: `{"0": "L", "1": "L", "#": "#,L,MUL-add"}`},
    {name: "MUL-make-shift1", transitions: `{"0": "1,R,MUL-make-shift0", "1": "R", "${LAMBDA}": "1,N,MUL-check-last"}`},
    {name: "MUL-make-shift0", transitions: `{"0": "R", "1": "0,R,MUL-make-shift1", "${LAMBDA}": "0,N,MUL-check-last"}`},
    {name: "MUL-make-shift", transitions: `{"0": "#,R,MUL-make-shift0", "1": "#,R,MUL-make-shift1", "${LAMBDA}": ",L,MUL-clean"}`},
    {name: "MUL-shift", transitions: `{"0": "L", "1": "L", "#": "0,R,MUL-make-shift"}`},
    {name: "MUL-check-last", transitions: `{"0": ",L,MUL-shift", "1": ",L,MUL-add-move"}`},
    {name: "MUL-go-back", transitions: `{"0": "R", "1": "R", "#": "R", "${LAMBDA}": ",L,MUL-check-last"}`},

    // логическое И
    {name: "AND", transitions: `{"0": "R", "1": "R", "#": "R", "I": "R", "O": "R", "${LAMBDA}": ",L,AND-check"}`},
    {name: "AND-check", transitions: `{"0": ",L,AND-left0", "1": ",L,AND-left1", "#": ",L,normalize"}`},
    {name: "AND-zero", transitions: `{"0": "O,N,AND", "1": "O,N,AND", "I": "L", "O": "L"}`},
    {name: "AND-one", transitions: `{"0": "O,N,AND", "1": "I,N,AND", "I": "L", "O": "L"}`},
    {name: "AND-left0", transitions: `{"0": "L", "1": "L", "#": "#,L,AND-zero"}`},
    {name: "AND-left1", transitions: `{"0": "L", "1": "L", "#": "#,L,AND-one"}`},

    // логическое ИЛИ
    {name: "OR", transitions: `{"0": "R", "1": "R", "#": "R", "I": "R", "O": "R", "${LAMBDA}": ",L,OR-check"}`},
    {name: "OR-check", transitions: `{"0": ",L,OR-left0", "1": ",L,OR-left1", "#": ",L,normalize"}`},
    {name: "OR-zero", transitions: `{"0": "O,N,OR", "1": "I,N,OR", "I": "L", "O": "L"}`},
    {name: "OR-one", transitions: `{"0": "I,N,OR", "1": "I,N,OR", "I": "L", "O": "L"}`},
    {name: "OR-left0", transitions: `{"0": "L", "1": "L", "#": "#,L,OR-zero"}`},
    {name: "OR-left1", transitions: `{"0": "L", "1": "L", "#": "#,L,OR-one"}`},

    // логическое исключающее ИЛИ
    {name: "XOR", transitions: `{"0": "R", "1": "R", "#": "R", "I": "R", "O": "R", "${LAMBDA}": ",L,XOR-check"}`},
    {name: "XOR-check", transitions: `{"0": ",L,XOR-left0", "1": ",L,XOR-left1", "#": ",L,normalize"}`},
    {name: "XOR-zero", transitions: `{"0": "O,N,XOR", "1": "I,N,XOR", "I": "L", "O": "L"}`},
    {name: "XOR-one", transitions: `{"0": "I,N,XOR", "1": "O,N,XOR", "I": "L", "O": "L"}`},
    {name: "XOR-left0", transitions: `{"0": "L", "1": "L", "#": "#,L,XOR-zero"}`},
    {name: "XOR-left1", transitions: `{"0": "L", "1": "L", "#": "#,L,XOR-one"}`},

    // логическая инверсия
    {name: "NOT", transitions: `{"0": "1,R", "1": "0,R", "${LAMBDA}": ",L,write-no-carry"}`},

    // битовый сдвиг вправо
    {name: "SHR", transitions: `{"0": "R", "1": "R", "#": "R", "${LAMBDA}": ",L,SHR-test"}`},
    {name: "SHR-test", transitions: `{"0": "1,L,SHR-test", "1": "0,L,SHR-pre", "#": ",R,SHR-clear"}`},
    {name: "SHR-clear", transitions: `{"0": ",R,SHR-clear", "1": ",R,SHR-clear", "${LAMBDA}": "${LAMBDA},L,normalize"}`},
    {name: "SHR-pre", transitions: `{"0": "L", "1": "L", "#": "L", "${ALU_CHAR}": "${ALU_CHAR},R,SHR-make"}`},
    {name: "SHR-make", transitions: `{"0": "0,R,SHR-zero", "1": "0,R,SHR-one"}`},
    {name: "SHR-zero", transitions: `{"0": "R", "1": "0,R,SHR-one", "#": "#,R,SHR"}`},
    {name: "SHR-one", transitions: `{"0": "1,R,SHR-zero", "1": "R", "#": "#,R,SHR"}`},

    // битовый сдвиг влево
    {name: "SHL", transitions: `{"0": "R", "1": "R", "#": "R", "${LAMBDA}": ",L,SHL-test"}`},
    {name: "SHL-test", transitions: `{"0": "1,L,SHL-test", "1": "0,L,SHL-pre", "#": ",R,SHL-clear"}`},
    {name: "SHL-clear", transitions: `{"0": ",R,SHL-clear", "1": ",R,SHL-clear", "${LAMBDA}": "${LAMBDA},L,normalize"}`},
    {name: "SHL-pre", transitions: `{"0": "L", "1": "L", "#": "#,L,SHL-make"}`},
    {name: "SHL-make", transitions: `{"0": "0,L,SHL-zero", "1": "0,L,SHL-one"}`},
    {name: "SHL-zero", transitions: `{"0": "L", "1": "0,L,SHL-one", "${ALU_CHAR}": "${ALU_CHAR},R,SHL", "${ALU_CARRY_CHAR}": "${ALU_CARRY_CHAR},R,SHL"}`},
    {name: "SHL-one", transitions: `{"0": "1,L,SHL-zero", "1": "L", "${ALU_CHAR}": "${ALU_CARRY_CHAR},R,SHL", "${ALU_CARRY_CHAR}": "${ALU_CARRY_CHAR},R,SHL"}`},
]

const RUN_TASK = 'run'
const WRITE_WORD_TASK = 'write-word'
const READ_WORD_TASK = 'read-word'
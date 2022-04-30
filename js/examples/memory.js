const MEMORY_EXAMPLE = `; Симулятор процессора на машине Тьюринга
; https://github.com/dronperminov/TuringCpu
; Пример работы с памятью и стеком

MOV E, 3
MOV [E], 5
MOV [5], E
MOV [0], 7
MOV B, [5]
MOV C, [E]
MOV D, [0]
MOV A, E
ADD E, [5]
ADD F, [C]
INC B
XOR D, E
XOR E, D
XOR D, E
PUSH 1
PUSH 2
PUSH A
PUSH B
PUSH C
PUSH D
PUSH E
SUB F, A
POP A
POP B
POP C
POP D
POP E
POP F
`
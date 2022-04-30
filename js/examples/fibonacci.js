const FIBONACCI_EXAMPLE = `; Симулятор процессора на машине Тьюринга
; https://github.com/dronperminov/TuringCpu
; Пример вычисления числа Фибоначчи

JMP start

.loop:
    PUSH B ; сохраняем предыдущий член последовательности
    ADD B, C ; вычисляем новый член последовательности
    POP C ; возвращаем сохранённый на место предыдущего
    DEC A   ; уменьшаем номер
    JNZ .loop

    JMP end

start:
    MOV A, 11  ; номер числа Фибоначчи
    MOV C, 0x1
    XOR B, B
    CMP A, 12
    CMP A, 11
    CMP A, 10
    JMP .loop

end:
    XOR A, B`

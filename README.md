# TuringCpu
Симулятор x86 подобного процессора на машине Тьюринга, использующий упрощённый синтаксис ассемблера на основе NASM.

![Симулятор процессора на МТ](examples/example.gif "Симулятор процессора на МТ")

## Конфигурация
* Можно задать произвольную точность вычислений (битность), по умолчанию 8 бит
* Можно задать произвольное количество ячеек памяти, по умолчанию 15
* Шесть регистров общего назначения: `A`, `B`, `C`, `D`, `E`, `F`
* Флаг нуля (`ZF`)
* Флаг переполнения (`CF`)
* АЛУ, флаги, регистры, память и стек находятся на одной общей ленте единственной машины Тьюринга

## Синтаксис

* Каждая инструкция располагается на отдельной строке
* Метки должны начинаться с буквы или точки (.) и заканчиваться двоеточием
* Комментарий начинается с символа `;`
* Адреса заключаются в квадратные скобки `[address]` и обозначает номер ячейки памяти
* В качестве адреса может быть константа (`[12]`) или регистр общего назначения (`[A]`)
* Операндами команд могут быть регистры общего назначения, константы, адреса или метки

Общий вид строки программы: `метка: инструкция аргументы ; комментарий`

## Допустимые форматы констант:

* Двоичный: `0b10101` или `110b`
* Восьмеричный: `0o461`
* Десятичный: `123` или `23d`
* Шестнадцатиричный: `0xF5`

## Команда MOV
Помещает содержимое аргумента `arg2` в аргумент `arg1`. Допустима следующая конфигурация аргументов:

* `MOV регистр, регистр/константа/адрес`
* `MOV адрес, регистр/константа`

Синтаксис: `MOV arg1, arg2`

## Стековые инструкции
### Команда PUSH - добавить в стек
Добавляет переданное значение в стек

Синтаксис: `PUSH arg`

### Команда POP - извлечь из стека
Извлекает значение на стеке и помещает его на переданный регистр. Если стек пуст, происходит ошибка.

Синтаксис: `POP reg`

## Математические операции
* Сложение: `ADD reg, arg`
* Вычитание: `SUB reg, arg`
* Умножение: `MUL reg, arg`
* Инкремент: `INC reg`
* Декремент: `DEC reg`

## Логические операции
* И: `AND reg, arg`
* ИЛИ: `OR reg, arg`
* Исключающее ИЛИ: `XOR reg, arg`
* НЕ: `NOT reg`
* Сдвиг влево: `SHL reg, arg`
* Сдвиг вправо: `SHR reg, arg`
* Циклический сдвиг влево: `ROL reg`
* Циклический сдвиг вправо: `ROR reg`

## Команда CMP (cравнение)
Результат сравнения никуда не записывается, но устанавливаются значения флагов (`ZF` и `CF`)

Синтаксис: `CMP reg, arg`

## Переходы
### Безусловный переход (JMP)
Производит передачу управления на инструкцию, помеченную указанной меткой.

Синтаксис: `JMP label`

### Условные переходы
Работают аналогично безусловному переходу, предварительно проверяя указанное ниже условие:
* `JZ` - переход по нулю (`ZF = 0`)
* `JNZ` - переход по не нулю (`ZF ≠ 0`)
* `JC` - переход при переполнении (`CF = 0`)
* `JNC` - переход при отсутствии переполнения (`CF ≠ 0`)
* `JA` - переход по больше (`ZF ≠ 0` и `CF ≠ 0`)
* `JAE` - переход по больше или равно (`CF ≠ 0`)
* `JB` - переход по меньше (`CF = 0`)
* `JBE` - переход по меньше или равно (`CF = 0` или `ZF = 0`)
* `JE` - переход по равенству (`ZF = 0`)
* `JNE` - переход по неравенству (`ZF ≠ 0`)
* `JNA` - переход по не больше (`not >`)
* `JNAE` - переход по не больше или равно (`not >=`)
* `JNB` - переход по не меньше (`not <`)
* `JNBE` - переход по не меньше или равно (`not <=`)

## Пример программы
```asm
JMP start

.loop:
    PUSH B ; сохраняем предыдущий член последовательности
    ADD B, C ; вычисляем новый
    POP C ; возвращаем сохранённый на место предыдущего
    DEC A   ; уменьшаем номер
    JNZ .loop

    JMP end

start:
    MOV A, 11  ; номер числа Фибоначчи
    MOV C, 0x1
    JMP .loop

end:
    XOR A, B
```

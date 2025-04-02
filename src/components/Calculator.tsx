
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [operation, setOperation] = useState<string | null>(null);
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const clearAll = () => {
    setDisplay('0');
    setOperation(null);
    setPrevValue(null);
    setWaitingForOperand(false);
  };

  const clearDisplay = () => {
    setDisplay('0');
  };

  const toggleSign = () => {
    const value = parseFloat(display);
    setDisplay(String(-value));
  };

  const handlePercent = () => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  };

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDot = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operation) {
      const currentValue = prevValue || 0;
      let newValue = 0;

      switch (operation) {
        case '+':
          newValue = currentValue + inputValue;
          break;
        case '-':
          newValue = currentValue - inputValue;
          break;
        case '*':
          newValue = currentValue * inputValue;
          break;
        case '/':
          newValue = currentValue / inputValue;
          break;
      }

      setPrevValue(newValue);
      setDisplay(String(newValue));
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const handleEquals = () => {
    performOperation('=');
    setOperation(null);
    setPrevValue(null);
  };

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-center">Calculadora</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="bg-gray-100 dark:bg-gray-800 p-2 mb-3 rounded text-right overflow-x-auto">
          <p className="font-mono text-xl">{display}</p>
        </div>
        <div className="grid grid-cols-4 gap-1">
          <Button variant="outline" onClick={clearAll}>AC</Button>
          <Button variant="outline" onClick={toggleSign}>+/-</Button>
          <Button variant="outline" onClick={handlePercent}>%</Button>
          <Button variant="secondary" onClick={() => performOperation('/')}>/</Button>
          
          <Button variant="outline" onClick={() => inputDigit('7')}>7</Button>
          <Button variant="outline" onClick={() => inputDigit('8')}>8</Button>
          <Button variant="outline" onClick={() => inputDigit('9')}>9</Button>
          <Button variant="secondary" onClick={() => performOperation('*')}>×</Button>
          
          <Button variant="outline" onClick={() => inputDigit('4')}>4</Button>
          <Button variant="outline" onClick={() => inputDigit('5')}>5</Button>
          <Button variant="outline" onClick={() => inputDigit('6')}>6</Button>
          <Button variant="secondary" onClick={() => performOperation('-')}>-</Button>
          
          <Button variant="outline" onClick={() => inputDigit('1')}>1</Button>
          <Button variant="outline" onClick={() => inputDigit('2')}>2</Button>
          <Button variant="outline" onClick={() => inputDigit('3')}>3</Button>
          <Button variant="secondary" onClick={() => performOperation('+')}>+</Button>
          
          <Button variant="outline" onClick={() => inputDigit('0')} className="col-span-2">0</Button>
          <Button variant="outline" onClick={inputDot}>.</Button>
          <Button variant="primary" onClick={handleEquals}>=</Button>
        </div>
      </CardContent>
    </Card>
  );
};

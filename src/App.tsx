//import { useState } from 'react'
import { useState } from 'react';
import './App.css'
import Layout from './components/Layout'
const baseClasses =
  "h-16 w-full flex items-center justify-center text-xl font-semibold rounded-lg cursor-pointer transition duration-150 ease-in-out";

// const equalsClasses = 
//            "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800";

// const defaultClasses = 
//            "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 active:bg-gray-100";            

function App() {
  const [input1, setInput1] = useState("");
  const [op, setOp] = useState("");
  const [eg, setEg] = useState(false);
  const [input2, setInput2] = useState("");
  const [ans, setAns] = useState(0);

  const signList = [
    '%', 'CE', 'C', '⌫', // ⌫ 代表退格/刪除鍵 (Backspace)
    '1/x', 'x²', '²√x', '÷',
    '7', '8', '9', '×',
    '4', '5', '6', '−', // 這裡使用數學上的減號 U+2212 '−'
    '1', '2', '3', '+',
    '±', '0', '.', '=',
  ];

  const resetAll = () => {
    setInput1("");    // 第一個數字清空
    setInput2("");    // 第二個數字清空
    setOp("");        // 運算符號清空
    setAns(0);        // 答案歸零
    setEg(false);     // 結束「等於」狀態
  };

  const isNum = (sign: string) => {
    return !isNaN(parseFloat(sign))
  };

  const handleCalc = (sign: string) => {
    if (sign === 'C' || sign === 'CE') {
      resetAll();
      return;
      }
    if ('⌫' === sign) {
      if (eg) {
        setInput1("");
        setInput2("");
        setOp("");
        setAns(0);
        setEg(false);
        return;
      }

      if (op) {
        setInput2(input2.slice(0, -1));
      } else {
        setInput1(input1.slice(0, -1));
      }
      return;
    }
    if (isNum(sign)) {
      if (op){
        setInput2(input2 + sign);
      } else {
        setInput1(input1 + sign);
      }
      return;
    }
    if ("+" === sign){
      setOp(sign);
      return;
    }
    if ("−" === sign){
      setOp(sign);
      return;
    }
    if ("×" === sign){
      setOp(sign);
      return;
    }
    if ("÷" === sign){
      setOp(sign);
      return;
    }

    if ("=" === sign){
      if ("+" === op){
        setAns(parseFloat(input1) + parseFloat(input2) );
        setEg(true);
      }
      if ("−" === op){
        setAns(parseFloat(input1) - parseFloat(input2) );
        setEg(true);
      }
      if ("×" === op){
        setAns(parseFloat(input1) * parseFloat(input2) );
        setEg(true);
      }
      if ("÷" === op){
        const num2 = parseFloat(input2);
        
        if (num2 === 0) {
          alert("錯誤：除數不能為 0");
          setInput1("");
          setInput2("");
          setOp("");
          return;
        }

        setAns(parseFloat(input1) / num2);
        setEg(true);
      }
    }

  };

  const getDisplayText=() => {
    if (eg){
      return ans+"";
    }
    if (op){
      return input2;
    }
    return input1;
  };

  return (
    <Layout>
      
      <input type='text' value={getDisplayText()} className="bg-blue-100 p-4 mb-4 rounded-lg" />
      <div className="grid grid-cols-4 gap-2 bg-gray-100 p-4 rounded-xl shadow-2xl max-w-sm mx-auto">
        {
          signList.map(
            (sign, index) => {

              return (
                <button key={index} className={baseClasses}  onClick={()=>{ handleCalc(sign); }} >
                  {sign}
                </button>
              )
            }
          )
        }

      </div>
    </Layout>
  )
}

export default App

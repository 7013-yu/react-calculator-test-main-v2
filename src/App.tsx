import { useState } from 'react'
import './App.css'
import Layout from './components/Layout'
const baseClasses =
  "h-16 w-full flex items-center justify-center text-xl font-semibold rounded-lg cursor-pointer transition duration-150 ease-in-out";

const equalsClasses = 
            "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800";

const defaultClasses = 
            "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 active:bg-gray-100";            

function App() {

  const signList = [
    '%', 'CE', 'C', '⌫', // ⌫ 代表退格/刪除鍵 (Backspace)
    '1/x', 'x²', '²√x', '÷',
    '7', '8', '9', '×',
    '4', '5', '6', '−', // 這裡使用數學上的減號 U+2212 '−'
    '1', '2', '3', '+',
    '±', '0', '.', '=',
  ];

  const [count, setCount] = useState(0)

  return (
    <Layout>

      <div className="grid grid-cols-4 gap-2 bg-gray-100 p-4 rounded-xl shadow-2xl max-w-sm mx-auto">
        {
          signList.map(
            (sign, index) => {

              return (
                <div key={index} className={baseClasses}>
                  {sign}
                </div>
              )
            }
          )
        }

      </div>
    </Layout>
  )
}

export default App

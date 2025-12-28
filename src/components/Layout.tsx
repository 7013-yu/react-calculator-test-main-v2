import { useState, type ReactNode } from "react";
import MyGame from '../MyGame'; 

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [view, setView] = useState<'app' | 'game'>('app');
  const isGame = view === 'game';

  return (
    /* 1. 外層固定 h-screen，防止整頁捲動 */
    <div className={`flex flex-col h-screen overflow-hidden w-full transition-colors duration-500 ${isGame ? 'bg-gray-900' : 'bg-purple-50'} text-gray-800`}>
      
      {/* 2. Header：固定高度 */}
      <header className={`flex-none z-[100] border-b transition-colors duration-500 shadow-md ${isGame ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className={`text-xl font-bold tracking-wider transition-colors ${isGame ? 'text-teal-400' : 'text-indigo-600'}`}>
            MyReactApp
          </h1>
          <nav className="flex space-x-6 text-sm font-medium">
            <a href="#" onClick={(e) => { e.preventDefault(); setView('app'); }} 
              className={`transition-colors ${isGame ? 'text-gray-400 hover:text-teal-400' : 'text-gray-600 hover:text-indigo-600'} ${view === 'app' ? 'text-indigo-600 font-bold underline underline-offset-4' : ''}`}>
              首頁
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); setView('game'); }} 
              className={`transition-colors ${isGame ? 'text-teal-400 hover:text-teal-400' : 'text-gray-600 hover:text-indigo-600'} ${view === 'game' ? 'text-indigo-600 font-bold underline underline-offset-4' : ''}`}>
              遊戲
            </a>
            <a href="#" className={`transition-colors ${isGame ? 'text-gray-400 hover:text-teal-400' : 'text-gray-600 hover:text-indigo-600'}`}>關於</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-grow w-full flex flex-col ${isGame ? 'overflow-y-auto' : 'overflow-hidden'}`}>
        
        {/* 計算機模式內容區 */}
        <div className={`flex-grow w-full ${isGame ? '' : 'max-w-7xl mx-auto px-4 py-8'}`}>
          {isGame ? (
            <div className="flex justify-center items-start pt-10 pb-10">
              <MyGame />
            </div>
          ) : (
            /* 這裡直接渲染 children，不加任何額外的 Flex 居中，確保你的格式 100% 正確 */
            children
          )}
        </div>
      </main>

        {/* Footer */}
        {!isGame && (
        <footer className="flex-none transition-colors bg-white border-t border-gray-200 py-2 text-center text-gray-500 text-xs hover:bg-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            &copy; {new Date().getFullYear()} React + TypeScript + Tailwind v4.
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
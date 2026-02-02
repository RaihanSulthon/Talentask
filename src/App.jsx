import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
        <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">
          React + Vite + Tailwind v4
        </h1>
        
        <div className="text-center">
          <button 
            onClick={() => setCount((count) => count + 1)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200"
          >
            Count is {count}
          </button>
          
          <p className="mt-4 text-gray-600">
            Edit <code className="bg-gray-200 px-2 py-1 rounded">src/App.jsx</code> and save to test HMR
          </p>
          
          <div className="mt-6 text-sm text-green-600">
            ✅ Tailwind CSS v4 is working!
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
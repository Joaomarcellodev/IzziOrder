function App() {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Tailwind CSS Funcionando!
        </h1>
        <p className="text-gray-600">Configurado com React + TypeScript 🎉</p>
        <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          Botão de Teste
        </button>
      </div>
    </div>
  );
}

export default App;

const App = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-cyan-500">Hello world!</h1>
      <p>{process.env.BUILT_AT}</p>
    </div>
  )
}

export default App

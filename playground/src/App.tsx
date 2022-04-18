import { Suspense, lazy, useMemo } from 'react'
import 'antd/dist/antd.variable.css'

const DynamicIcons: React.FC<{
  name: string
}> = ({ name }) => {
  const Icons = useMemo(() => {
    const icons = () => import(`@ant-design/icons/es/icons/${name}Outlined`)
    return lazy(icons)
  }, [])
  return <Icons></Icons>
}

function App() {
  return (
    <div className="App">
      <Suspense fallback="loading~~~">
        <header className="App-header">
          <DynamicIcons name="Github" />
          <DynamicIcons name="Api" />
          <DynamicIcons name="Apple" />
          <DynamicIcons name="Appstore" />
        </header>
      </Suspense>
    </div>
  )
}

export default App

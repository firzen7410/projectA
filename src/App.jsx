
import proptypes from "prop-types"

function ChildComponent(props){
  console.log(props)
  return  <>{props.a}</>
}

ChildComponent.proptypes={
  a: proptypes.string.isRequired,
}
function App() {
  return (
    <>
      <ChildComponent a='test'/>
    </>
  )
}

export default App

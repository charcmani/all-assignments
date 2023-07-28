import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { RecoilRoot, atom, useRecoilValue, useSetRecoilState } from 'recoil';
import Button from '@mui/material/Button';

function App() {
  // const [counter, setCounter] = useState(0)
  return (<RecoilRoot>
    <div>
      <IncreaseButton></IncreaseButton>
      <Count></Count>
      <DecreaseButton></DecreaseButton>
    </div>
  </RecoilRoot>)
}

function IncreaseButton() {
  let setCounter = useSetRecoilState(countState);
  return <div>
    <Button onClick={() => { setCounter((counter) => counter + 1) }}>Increase Counter</Button>
  </div>
}

function DecreaseButton() {
  let setCounter = useSetRecoilState(countState);
  return <div>
    <Button onClick={() => { setCounter((counter) => counter - 1) }}>Decrease Counter</Button>
  </div>
}

function Count(props) {
  const counterValue = useRecoilValue(countState);
  return <div>
    Count : {counterValue}
  </div>
}

// function App() {
//   const [todoForToday, setTodoForToday] = useState([{
//     title: "Wake up",
//     description: "Wake up at 8"
//   }, {
//     title: "Wake down",
//     description: "Wake up at 12"
//   }])

//   useEffect(() => {
//     setInterval(() => {
//       setTodoForToday([{
//         title: "Wake up",
//         description: "Wake up at " + Math.random()
//       }])
//     }, 2000)
//   }, [])

//   return (
//     <div>
//       {todoForToday.map((todo) => {
//         return <Todo title={todo.title} description={todo.description} />
//       })}
//     </div>
//   )
// }


// function Todo(props) {
//   return <div>
//     {props.title}
//     <br />
//     {props.description}
//     <br />
//   </div>
// }

export default App


const countState = atom({
  key: 'countState1',
  default: 0,
});
import logo from './logo.svg';
import './App.css';

function App() {
  let clickHandler = () => {
    let res = fetch('http://localhost:8080/api/auth/login', {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "email": "oleg@gmil.com",
        "password": "12345"
      }),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    })
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
          <button onClick={clickHandler}>Learn React</button>
      </header>
    </div>
  );
}

export default App;

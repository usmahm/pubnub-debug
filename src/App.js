// import logo from './logo.svg';
import './App.css';
import ChatWindow from './components/ChatWindow';
import { ContextProvider } from './components/context/chatContextProvider';

function App() {
  return (
    <ContextProvider>
      <div className="App">
        <ChatWindow />
      </div>
    </ContextProvider>
  );
}

export default App;

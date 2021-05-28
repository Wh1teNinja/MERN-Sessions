import "./App.css";
import { useState, useEffect } from "react";
import io from "socket.io-client";
import env from 'react-dotenv';

const apiUrl = env.API_URL || "http://localhost:80";

let socket;

function App() {
  let [value, setValue] = useState("");
  let [requestType, setRequestType] = useState("fetch");

  useEffect(() => {
    fetch(apiUrl + "/", {
      method: "GET",
      mode: "cors",
      credentials: "include",
    })
      .then((res) => res.json())
      .then(({ num }) => {
        setValue(num);

        socket = io(apiUrl, {
          withCredentials: true,
        });

        socket.on("value", (num) => {
          setValue(num);
        });
      });
  }, []);

  useEffect(() => {
    if (socket) socket.emit("reload-session");
  }, [value]);

  const sendRequest = (path) => {
    if (requestType === "fetch") {
      fetch(apiUrl + "/" + path, {
        method: "GET",
        mode: "cors",
        credentials: "include",
      })
        .then((res) => res.json())
        .then(({ num }) => {
          setValue(num);
        });
    } else {
      socket.emit(path);
    }
  };

  const onChangeRequestTypeRadio = (e) => {
    setRequestType(e.target.value);
  };

  return (
    <div className='App'>
      <h1>Test Session With Socket</h1>
      <div>
        <input
          onChange={onChangeRequestTypeRadio}
          type='radio'
          name='requestType'
          id='fetch'
          value='fetch'
          checked={requestType === "fetch"}
        />
        <label htmlFor='fetch'>Fetch</label>

        <input
          onChange={onChangeRequestTypeRadio}
          type='radio'
          name='requestType'
          id='socket'
          value='socket'
          checked={requestType === "socket"}
        />
        <label htmlFor='socket'>Socket</label>
      </div>
      <button onClick={() => sendRequest("increase")} style={{ width: "50px" }}>
        +
      </button>
      <button onClick={() => sendRequest("decrease")} style={{ width: "50px" }}>
        -
      </button>
      <h2>
        Return value:<span>{value}</span>
      </h2>
    </div>
  );
}

export default App;

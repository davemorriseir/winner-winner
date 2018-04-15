import React, { Component } from 'react'
import logo from './logo.svg'
import MainNav from './features/nav/Nav'
import './App.css'
import { Button } from 'reactstrap'

class App extends Component {
  render() {
    return (
      <div className="App">
        <MainNav />
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
          <Button color="success">Hello</Button>
        </p>
      </div>
    )
  }
}

export default App

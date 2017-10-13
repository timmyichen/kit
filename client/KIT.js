import React from 'react'
import { render } from 'react-dom'

import App from './components/App';

class KIT extends React.Component {
  render() {
    return (
      <App />
    );
  }
}

render(<KIT />, document.getElementById('app'));
import React, { Component } from 'react';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';

import Navbar from './Navbar';
import Landing from './Landing';
import Welcome from './Welcome';
import MyInfo from './MyInfo';
import PublicUserProfile from './PublicUserProfile';
import Dashboard from './Dashboard';
import AddressBook from './AddressBook'

import { getDataFrom } from '../actions/getDataFrom';

const authMethods = ['google', 'facebook', 'linkedin'];

class App extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      user: null
    };
    this.generateAuthRoute = this.generateAuthRoute.bind(this);
    this.refreshUser = this.refreshUser.bind(this);
  }
  componentDidMount() {
    this.refreshUser();
  }
  refreshUser() {
    getDataFrom('/api/current-user')
      .then(data => {
        this.setState({ user: data });
      });
    
  }
  //generates route that redirects auth routes to external (to be handled by express server)
  generateAuthRoute(method) {
    return (
      <Route exact 
        path={`/auth/${method}`}
        key={`authRoute-${method}`}
        render={() => <Redirect to={`/auth/${method}`} />}
      />
    );
  }
  render() {
    const { user } = this.state;
    return (
      <BrowserRouter>
        <div id="main-container">
          <Navbar user={user} />
          <Route exact path="/" component={Landing} />
          <Route exact path="/welcome" component={Welcome} />
          <Route exact path="/dashboard"
            render={() => 
              <Dashboard user={user} refreshUser={this.refreshUser} />
            }
          />
          <Route exact path="/my-info"
            render={() => 
              <MyInfo user={user} />
            }
          />
          <Route exact path="/contact-infos"
            render={() =>
              <AddressBook
                user={user}
                refreshUser={this.refreshUser}
              />
            }
          />
          <Route path="/profile/:username"
            render={(routerInfo) => 
              <PublicUserProfile
                user={user}
                refreshUser={this.refreshUser}
                routerInfo={routerInfo}
              />
            }
          />
          {authMethods.map(this.generateAuthRoute)}
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
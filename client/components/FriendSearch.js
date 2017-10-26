import React, { Component } from 'react';
import { Container, Header, Input, Card, Grid, Button } from 'semantic-ui-react';
import propTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { getDataFrom } from '../actions/getDataFrom';
import { pluralize } from '../utils/strings';

class FriendSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: '',
      queryTimeout: 0,
      results: [],
    }
    this.handleInput = this.handleInput.bind(this);
  }
  handleInput(event, data) {
    const { queryTimeout } = this.state;
  
    if (queryTimeout) clearTimeout(queryTimeout);
    
    this.setState({
      query: data.value,
      queryTimeout: setTimeout(() => {
        getDataFrom(`/api/user/search?query=${data.value}`)
          .then(values => {
            this.setState({
              queryTimeout: 0,
              results: values
            });
          })
      }, 2000)
    });
  }
  renderResult(user, i) {
    const { fullName, mutualCount, username } = user;
    return (
      <Card key={`search-${i}`} fluid className="user-search" color="blue">
        <Grid divided="vertically" verticalAlign="middle"><Grid.Row columns={2}>
          <Grid.Column textAlign="left">
            <Card.Content>
              <Card.Header>{fullName} <em>({username})</em></Card.Header>
              <Card.Meta>{mutualCount ? `${pluralize(mutualCount, 'mutual friend')}` : ''}</Card.Meta>
            </Card.Content>
          </Grid.Column>
          <Grid.Column textAlign="right">
            <Card.Content extra>
              <Link to={`/profile/${username}`}>
                <Button primary>Go To Profile</Button>
              </Link>
            </Card.Content>
          </Grid.Column>
        </Grid.Row></Grid>
      </Card>
    )
  }
  render() {
    const { query, queryTimeout, results } = this.state;
    return (
      <Container>
        <Input fluid
          icon="search"
          placeholder='Search by name or username..'
          value={query}
          loading={Boolean(queryTimeout)}
          onChange={this.handleInput}
        />
        {results.map(this.renderResult)}
      </Container>
    );
  }
}

FriendSearch.propTypes = {
  
};

export default FriendSearch;
import React, { Component } from 'react';

import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';

import api from '../../services/api';

import { Container, Form, SubmitButton, List } from './styles';

export default class Main extends Component {

  state = {
    newRepo: '',
    repositories: [],
    loading: false,
  };

  // carregar os dados do localStorage
  componentDidMount() {

    const repositories = localStorage.getItem('repositories');

    if(repositories) {
      this.setState({ repositories: JSON.parse(repositories)})
    }
  }

  // salvar os dados do localStorage
  componentDidUpdate(_, prevState) {

    const { repositories } = this.state;

    if(prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories))
    }

  }

  handleInputChange = e => {
    this.setState({ newRepo: e.target.value })
  }

  handleSubmit = async e => {
    e.preventDefault();

    const { newRepo, repositories } = this.state;

    this.setState({ loading: true })

    const response = await api.get(`/repos/${newRepo}`);

    const data = {
      name: response.data.full_name
    }

    this.setState({
      repositories: [...repositories, data],
      newRepo: '',
      loading: false,
    })

  }

  render() {

    const { newRepo, repositories, loading } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>

        <Form onSubmit={this.handleSubmit}>
          <input
            type="text"
            placeholder="Adicionar repositórios"
            onChange={this.handleInputChange}
            value={newRepo}
          />

          <SubmitButton loading={loading}>
            {loading ? (<FaSpinner color="#fff" size={14} />) : (<FaPlus color="#fff" size={14} />)}
          </SubmitButton>
        </Form>


        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              {repository.name}
              <a href="#">Detalhes</a>
            </li>
          ))}
        </List>

      </Container>
    );
  }
}

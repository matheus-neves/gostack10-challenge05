import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeftCircle, FiArrowRightCircle } from 'react-icons/fi';
import PropTypes from 'prop-types';
import api from '../../services/api';

import Container from '../../components/Container';
import {
  Loading,
  Owner,
  IssueList,
  Error,
  IssueFilter,
  Paginator,
} from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    repoName: '',
    issues: [],
    issuesFilter: [
      {
        label: 'Todos',
        filter: 'all',
      },
      {
        label: 'Abertos',
        filter: 'open',
      },
      {
        label: 'Fechados',
        filter: 'closed',
      },
    ],
    loading: true,
    error: {
      message: '',
      status: false,
    },
    page: 1,
    direction: 'right',
    filter: 'open',
  };

  async componentDidMount() {
    const { match } = this.props;
    const { filter } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    try {
      const [repository, issues] = await Promise.all([
        api.get(`/repos/${repoName}`),
        api.get(`/repos/${repoName}/issues`, {
          params: {
            state: filter,
            per_page: 5,
            page: 1,
          },
        }),
      ]);
      this.setState({
        repository: repository.data,
        repoName,
        issues: issues.data,
        loading: false,
        error: {
          status: false,
          message: '',
        },
      });
    } catch (error) {
      this.setState({
        error: {
          status: true,
          message: error,
        },
      });
    }
  }

  handleFilter = async e => {
    const { repoName } = this.state;
    const filter = e.target.name;

    const filteredIssues = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: filter,
        per_page: 5,
        page: 1,
      },
    });

    this.setState({
      issues: filteredIssues.data,
      filter,
      page: 1,
    });
  };

  handleDirection = direction => {
    this.setState({ direction });
    this.handlePagination();
  };

  handlePagination = async () => {
    const { repoName, filter, page, direction } = this.state;

    console.log(direction);

    const calcPage = direction === 'left' ? page - 1 : page + 1;

    const paginationIssues = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: filter,
        per_page: 5,
        page: calcPage,
      },
    });

    this.setState({
      issues: paginationIssues.data,
      page: calcPage,
    });
  };

  render() {
    const {
      repository,
      issues,
      loading,
      error,
      issuesFilter,
      page,
    } = this.state;

    if (error.status) {
      return (
        <Container>
          <Error>
            <p>{String(error.message)}</p>
            <Link to="/">Voltar aos repositórios</Link>
          </Error>
        </Container>
      );
    }

    if (loading) {
      return <Loading>Carregando...</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.name} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <IssueFilter>
          <h2>Filtrar</h2>
          <div>
            {issuesFilter.map(({ label, filter }) => (
              <button
                key={label}
                onClick={this.handleFilter}
                name={filter}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </IssueFilter>

        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.html_url}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>

        <Paginator>
          <button
            type="button"
            disabled={page === 1 && 'disabled'}
            onClick={() => this.handleDirection('left')}
          >
            <FiArrowLeftCircle />
          </button>
          <button type="button" onClick={() => this.handleDirection('right')}>
            <FiArrowRightCircle />
          </button>
        </Paginator>
      </Container>
    );
  }
}

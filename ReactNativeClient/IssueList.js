import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Button,
  View,
} from 'react-native';
import { Table, Row } from 'react-native-table-component';

const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

// Utility functions
function jsonDateReviver(key, value) {
  if (dateRegex.test(value)) return new Date(value);
  return value;
}

async function graphQLFetch(query, variables = {}) {
  try {
    const response = await fetch('http://192.168.10.122:3000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });
    const body = await response.text();
    const result = JSON.parse(body, jsonDateReviver);

    if (result.errors) {
      const error = result.errors[0];
      if (error.extensions.code === 'BAD_USER_INPUT') {
        const details = error.extensions.exception.errors.join('\n ');
        alert(`${error.message}:\n ${details}`);
      } else {
        alert(`${error.extensions.code}: ${error.message}`);
      }
    }
    return result.data;
  } catch (e) {
    alert(`Error in sending data to server: ${e.message}`);
  }
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { height: 50, backgroundColor: '#537791' },
  text: { textAlign: 'center', fontWeight: '500' },
  row: { height: 40, backgroundColor: '#E7E6E1' },
  input: { borderColor: '#cccccc', borderWidth: 1, marginBottom: 10, padding: 8 },
});

// Q1: Issue Filter Component
class IssueFilter extends React.Component {
  constructor() {
    super();
    this.state = { filterText: '' };
  }

  handleChange = (text) => {
    this.setState({ filterText: text });
    this.props.onFilterChange(text);
  };

  render() {
    return (
      <View style={{ marginBottom: 10 }}>
        <Text>Filter Issues by Owner:</Text>
        <TextInput
          placeholder="Enter owner name"
          value={this.state.filterText}
          onChangeText={this.handleChange}
          style={styles.input}
        />
      </View>
    );
  }
}

// Q2: Issue Table Component
function IssueRow(props) {
  const issue = props.issue;
  const rowData = [
    issue.id,
    issue.title,
    issue.status,
    issue.owner,
    issue.created.toDateString(),
    issue.effort,
    issue.due ? issue.due.toDateString() : '',
  ];

  return (
    <Row data={rowData} style={styles.row} textStyle={styles.text} />
  );
}

function IssueTable(props) {
  const issueRows = props.issues.map((issue) => (
    <IssueRow key={issue.id} issue={issue} />
  ));

  const tableHead = ['ID', 'Title', 'Status', 'Owner', 'Created', 'Effort', 'Due'];

  return (
    <View style={styles.container}>
      <Table>
        <Row data={tableHead} style={styles.header} textStyle={styles.text} />
        <ScrollView>{issueRows}</ScrollView>
      </Table>
    </View>
  );
}

// Q3: Issue Add Component
class IssueAdd extends React.Component {
  constructor() {
    super();
    this.state = { title: '', owner: '', effort: '' };
  }

  handleTitleChange = (title) => this.setState({ title });
  handleOwnerChange = (owner) => this.setState({ owner });
  handleEffortChange = (effort) => this.setState({ effort });

  handleSubmit = () => {
    const issue = {
      title: this.state.title,
      owner: this.state.owner,
      effort: parseInt(this.state.effort, 10),
    };
    this.props.createIssue(issue);
    this.setState({ title: '', owner: '', effort: '' });
  };

  render() {
    return (
      <View>
        <TextInput
          placeholder="Title"
          value={this.state.title}
          onChangeText={this.handleTitleChange}
          style={styles.input}
        />
        <TextInput
          placeholder="Owner"
          value={this.state.owner}
          onChangeText={this.handleOwnerChange}
          style={styles.input}
        />
        <TextInput
          placeholder="Effort"
          value={this.state.effort}
          onChangeText={this.handleEffortChange}
          keyboardType="numeric"
          style={styles.input}
        />
        <Button title="Add Issue" onPress={this.handleSubmit} />
      </View>
    );
  }
}

// Q4: Blacklist Component
class BlackList extends React.Component {
  constructor() {
    super();
    this.state = { owner: '' };
  }

  handleOwnerChange = (owner) => this.setState({ owner });

  async handleSubmit() {
    const query = `mutation addToBlackList($owner: String!) {
      addToBlackList(owner: $owner)
    }`;
    const variables = { owner: this.state.owner };
    await graphQLFetch(query, variables);
    this.setState({ owner: '' });
  }

  render() {
    return (
      <View>
        <TextInput
          placeholder="Owner to Blacklist"
          value={this.state.owner}
          onChangeText={this.handleOwnerChange}
          style={styles.input}
        />
        <Button title="Add to Blacklist" onPress={() => this.handleSubmit()} />
      </View>
    );
  }
}

// Q2 and Q3 integration in IssueList Component
export default class IssueList extends React.Component {
  constructor() {
    super();
    this.state = { issues: [], allIssues: [] };
  }

  componentDidMount() {
    this.loadData();
  }

  async loadData() {
    const query = `query {
      issueList {
        id title status owner
        created effort due
      }
    }`;

    const data = await graphQLFetch(query);
    if (data) {
      this.setState({ issues: data.issueList, allIssues: data.issueList });
    }
  }

  async createIssue(issue) {
    const query = `mutation issueAdd($issue: IssueInputs!) {
      issueAdd(issue: $issue) {
        id
      }
    }`;

    const data = await graphQLFetch(query, { issue });
    if (data) {
      this.loadData();
    }
  }

  handleFilterChange = (filterText) => {
    const filteredIssues = this.state.allIssues.filter((issue) =>
      issue.owner.toLowerCase().includes(filterText.toLowerCase())
    );
    this.setState({ issues: filteredIssues });
  };

  render() {
    return (
      <ScrollView>
        <IssueFilter onFilterChange={this.handleFilterChange} />
        <IssueTable issues={this.state.issues} />
        <IssueAdd createIssue={(issue) => this.createIssue(issue)} />
        <BlackList />
      </ScrollView>
    );
  }
}
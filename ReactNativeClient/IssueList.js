import React from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  Button,
  View,
  StyleSheet,
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
  text: { textAlign: 'center', color: '#fff' },
  dataWrapper: { marginTop: -1 },
  row: { height: 40, backgroundColor: '#E7E6E1' },
  input: { borderColor: '#ccc', borderWidth: 1, padding: 8, margin: 8 },
});

// Components
class IssueFilter extends React.Component {
  render() {
    return (
      <View style={{ padding: 10 }}>
        <Text>Issue Filter Placeholder</Text>
      </View>
    );
  }
}

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
    <Row
      data={rowData}
      style={styles.row}
      textStyle={{ textAlign: 'center' }}
    />
  );
}

function IssueTable(props) {
  const issueRows = props.issues.map((issue) => (
    <IssueRow key={issue.id} issue={issue} />
  ));

  const tableHead = ['ID', 'Title', 'Status', 'Owner', 'Created', 'Effort', 'Due'];

  return (
    <View style={styles.container}>
      <Table borderStyle={{ borderWidth: 1 }}>
        <Row data={tableHead} style={styles.header} textStyle={styles.text} />
        {issueRows}
      </Table>
    </View>
  );
}

class IssueAdd extends React.Component {
  constructor() {
    super();
    this.state = { title: '', owner: '', effort: '' };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(field, value) {
    this.setState({ [field]: value });
  }

  handleSubmit() {
    const { title, owner, effort } = this.state;
    const issue = {
      title,
      owner,
      effort: parseInt(effort, 10),
      created: new Date(),
    };
    this.props.createIssue(issue);
    this.setState({ title: '', owner: '', effort: '' });
  }

  render() {
    return (
      <View>
        <TextInput
          placeholder="Title"
          style={styles.input}
          value={this.state.title}
          onChangeText={(value) => this.handleChange('title', value)}
        />
        <TextInput
          placeholder="Owner"
          style={styles.input}
          value={this.state.owner}
          onChangeText={(value) => this.handleChange('owner', value)}
        />
        <TextInput
          placeholder="Effort"
          keyboardType="numeric"
          style={styles.input}
          value={this.state.effort}
          onChangeText={(value) => this.handleChange('effort', value)}
        />
        <Button title="Add Issue" onPress={this.handleSubmit} />
      </View>
    );
  }
}

class BlackList extends React.Component {
  constructor() {
    super();
    this.state = { owner: '' };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(value) {
    this.setState({ owner: value });
  }

  async handleSubmit() {
    const { owner } = this.state;
    const query = `
      mutation addToBlacklist($owner: String!) {
        addToBlacklist(owner: $owner) {
          id
        }
      }
    `;
    await graphQLFetch(query, { owner });
    alert(`${owner} added to blacklist`);
    this.setState({ owner: '' });
  }

  render() {
    return (
      <View>
        <TextInput
          placeholder="Owner"
          style={styles.input}
          value={this.state.owner}
          onChangeText={(value) => this.handleChange(value)}
        />
        <Button title="Add to Blacklist" onPress={this.handleSubmit} />
      </View>
    );
  }
}

export default class IssueList extends React.Component {
  constructor() {
    super();
    this.state = { issues: [] };
    this.createIssue = this.createIssue.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  async loadData() {
    const query = `query {
      issueList {
        id title status owner created effort due
      }
    }`;
    const data = await graphQLFetch(query);
    if (data) {
      this.setState({ issues: data.issueList });
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

  render() {
    return (
      <ScrollView>
        <IssueFilter />
        <IssueTable issues={this.state.issues} />
        <IssueAdd createIssue={this.createIssue} />
        <BlackList />
      </ScrollView>
    );
  }
}
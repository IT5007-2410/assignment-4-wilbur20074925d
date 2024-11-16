import React, { useState } from 'react';
import { Table, Row } from 'react-native-table-component';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Button,
  View,
} from 'react-native';

// Utility function to handle date parsing
const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');
function jsonDateReviver(key, value) {
  if (dateRegex.test(value)) return new Date(value);
  return value;
}

// Utility function for GraphQL requests
async function graphQLFetch(query, variables = {}) {
  try {
    const response = await fetch('http://10.0.2.2:3000/graphql', {
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

// Q1: IssueFilter Component
/**
 * The `IssueFilter` component is a placeholder for filtering issues.
 * It could later be extended to allow users to filter by owner, status, etc.
 */
class IssueFilter extends React.Component {
  render() {
    return (
      <View style={styles.filter}>
        <Text>This component will allow filtering issues in the future.</Text>
      </View>
    );
  }
}

// Q2: IssueRow and IssueTable Components

/**
 * The `IssueRow` component renders a single row of issue data in the table.
 * Props:
 * - issue: An object containing the issue details (id, status, owner, etc.).
 */
function IssueRow(props) {
  const { id, status, owner, created, effort, due, title } = props.issue;

  const rowContent = [
    id,
    status,
    owner,
    new Date(created).toDateString(),
    effort,
    due ? new Date(due).toDateString() : 'N/A',
    title,
  ];

  return (
    <Row
      data={rowContent}
      widthArr={width}
      style={styles.row}
      textStyle={styles.text}
    />
  );
}

/**
 * The `IssueTable` component renders the table with headers and rows of issues.
 * Props:
 * - issues: An array of issue objects to display.
 */
function IssueTable(props) {
  const tableHeaders = ['ID', 'Status', 'Owner', 'Created', 'Effort', 'Due', 'Title'];

  const tableRows = props.issues.map((issue) => (
    <IssueRow key={issue.id} issue={issue} />
  ));

  return (
    <ScrollView horizontal>
      <Table>
        <Row
          data={tableHeaders}
          widthArr={width}
          style={styles.header}
          textStyle={styles.headerText}
        />
        {tableRows}
      </Table>
    </ScrollView>
  );
}

// Q3: IssueAdd Component
/**
 * The `IssueAdd` component allows users to input a new issue and submit it.
 * State:
 * - ownerName: The name of the issue owner.
 * - issueTitle: The title of the issue.
 * Props:
 * - createIssue: A function passed from the parent to add a new issue.
 */
class IssueAdd extends React.Component {
  constructor() {
    super();
    this.state = {
      ownerName: '',
      issueTitle: '',
    };
    this.handleSubmission = this.handleSubmission.bind(this);
  }

  updateOwnerName(value) {
    this.setState({ ownerName: value });
  }

  updateIssueTitle(value) {
    this.setState({ issueTitle: value });
  }

  handleSubmission() {
    const { ownerName, issueTitle } = this.state;
    const newIssue = {
      owner: ownerName,
      title: issueTitle,
      due: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    };

    this.props.createIssue(newIssue);
    this.setState({ ownerName: '', issueTitle: '' }); // Clear inputs after submission
  }

  render() {
    return (
      <View style={styles.addIssue}>
        <TextInput
          placeholder="Enter Owner's Name"
          value={this.state.ownerName}
          onChangeText={(text) => this.updateOwnerName(text)}
          style={styles.input}
        />
        <TextInput
          placeholder="Enter Issue Title"
          value={this.state.issueTitle}
          onChangeText={(text) => this.updateIssueTitle(text)}
          style={styles.input}
        />
        <Button title="Submit Issue" onPress={this.handleSubmission} />
      </View>
    );
  }
}

// Q4: BlackList Component
/**
 * The `BlackList` component allows users to add a name to the blacklist.
 * State:
 * - blacklistEntry: The name to be added to the blacklist.
 * Props:
 * - None
 */
class BlackList extends React.Component {
  constructor() {
    super();
    this.state = {
      blacklistEntry: '',
    };
    this.submitBlacklistEntry = this.submitBlacklistEntry.bind(this);
  }

  updateBlacklistEntry(value) {
    this.setState({ blacklistEntry: value });
  }

  async submitBlacklistEntry() {
    const query = `
      mutation AddToBlacklist($inputName: String!) {
        addToBlacklist(nameInput: $inputName)
      }
    `;
    const variables = { inputName: this.state.blacklistEntry };

    try {
      await graphQLFetch(query, variables);
      this.setState({ blacklistEntry: '' }); // Clear input after submission
    } catch (error) {
      console.error('Error adding to blacklist:', error);
    }
  }

  render() {
    return (
      <View style={styles.blacklist}>
        <TextInput
          placeholder="Enter Name to Blacklist"
          value={this.state.blacklistEntry}
          onChangeText={(text) => this.updateBlacklistEntry(text)}
          style={styles.input}
        />
        <Button title="Blacklist Name" onPress={this.submitBlacklistEntry} />
      </View>
    );
  }
}

// Main IssueList Component
/**
 * The `IssueList` component is the main parent component.
 * It manages the list of issues, handles adding new issues, and rendering all subcomponents.
 * State:
 * - issues: An array of issues to display.
 */
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
          id title status owner
          created effort due
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
      this.loadData(); // Reload issues after adding a new one
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

// Styles
const styles = StyleSheet.create({
  filter: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  header: {
    height: 50,
    backgroundColor: '#4a90e2',
  },
  headerText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  row: {
    height: 40,
    backgroundColor: '#f9f9f9',
  },
  text: {
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginVertical: 5,
  },
  addIssue: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  blacklist: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },
});

// Table column widths
const width = [40, 80, 80, 80, 80, 80, 200];
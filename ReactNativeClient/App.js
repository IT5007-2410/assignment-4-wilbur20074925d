/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import IssueList from './IssueList.js';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default class App extends React.Component {
  render() {
    return (
      // Q1: Start Coding here
      <SafeAreaView style={styles.container}>
        <View style={styles.navBar}>
          <Text style={styles.navText}>Issue Tracker</Text>
        </View>
        <IssueList />
      </SafeAreaView>
      // Q1: Code Ends here
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  navBar: {
    height: 50,
    backgroundColor: '#3f51b5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
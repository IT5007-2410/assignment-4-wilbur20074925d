/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import IssueList from './IssueList';
import { ScrollView, Text, View } from 'react-native';

export default class App extends React.Component {
  render() {
    return (
      <>
        <ScrollView>
          <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
              Issue Tracker
            </Text>
            <IssueList />
          </View>
        </ScrollView>
      </>
    );
  }
}
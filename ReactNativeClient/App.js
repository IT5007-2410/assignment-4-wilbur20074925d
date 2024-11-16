/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import IssueList from './IssueList.js';
import type {Node} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';



export default class App extends React.Component
{
  render()
  {
    return(
    <>
      <Text>Issue Tracker</Text>
      <IssueList/>
    </>);

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
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from 'react-native';

import uuid from 'uuid-v4';
import QRCode from 'react-native-qrcode';


type Props = {};
export default class App extends Component<Props> {



  constructor(props){
    super(props)

    this.state = {
      prefix: 'https://showyoucare.herokuapp.com/r/',
      uuid: uuid()
    };
  }

  refreshUuid(){
    this.setState({
      uuid: uuid()
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => this.refreshUuid()}>
          <Text style={{ marginBottom: 30 }}>Tap to refresh</Text>
          <QRCode
            value={this.state.prefix + this.state.uuid}
            size={200}
            bgColor='black'
            fgColor='white'
          />
          <Text style={{ marginTop: 30 }}>{this.state.uuid}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  }
});

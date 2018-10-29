import * as React from 'react';
import {AsyncStorage, StyleSheet, Text, View} from 'react-native';

interface Props {
}

interface State {
  user: any;
}

export default class Account extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      user: {
        nickname: '老四',
        times: 0,
      },
    };
  }
  componentDidMount() {
    const user = this.state.user;
    user.times += 1;
    AsyncStorage
      .setItem('user', JSON.stringify(user))
      .catch(error => {
        console.log(error);
        console.log('save fails');
      })
      .then(() => {
        console.log('save ok');
      });
    AsyncStorage
      .getItem('user')
      .catch(error => {
        console.log(error);
        console.log('get fails');
      })
      .then(data => {
        console.log(data);
        data = data || '';
        data = JSON.parse(data);
        this.setState({
          user: data,
        });
      });
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={[styles.item, styles.item1]}>老大</Text>
        <View style={[styles.item, styles.item2]}>
          <Text>老二</Text>
        </View>
        <View style={[styles.item, styles.item1]}>
          <Text>老老三老三老三老三???</Text>
        </View>
        <View style={[styles.item, styles.item3]}>
          <Text>{this.state.user.nickname}不爽了{this.state.user.times}次</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    paddingBottom: 70,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f60',
  },
  item: {
    color: '#fff',
    backgroundColor: '#000',
  },
  item1: {
    backgroundColor: '#ccc',
    // alignSelf: 'flex-start',
    flex: 1,
  },
  item2: {
    backgroundColor: '#999',
    // alignSelf: 'center',
    width: 100,
  },
  item3: {
    backgroundColor: '#666',
    // alignSelf: 'flex-end',
    flex: 2,
  },
});

import * as React from 'react';
import {StyleSheet, TabBarIOS, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface Props {}
interface State {
  selectedTab: string;
}
export default class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedTab: 'list',
    };
  }
  videoPress = () => {
    this.setState({
      selectedTab: 'list',
    });
  }
  recordPress = () => {
    this.setState({
      selectedTab: 'edit',
    });
  }
  morePress = () => {
    this.setState({
      selectedTab: 'account',
    });
  }
  render() {
    return (
      <TabBarIOS tintColor='#ee735c'>
        <Icon.TabBarItem iconName='ios-videocam' selectedIconName='ios-videocam' selected={this.state.selectedTab === 'list'} onPress={this.videoPress}>
          <View style={styles.container}>
            <Text>列表页面</Text>
          </View>
        </Icon.TabBarItem>
        <Icon.TabBarItem iconName='ios-recording' selectedIconName='ios-recording' selected={this.state.selectedTab === 'edit'} onPress={this.recordPress}>
          <View style={styles.container}>
            <Text>制作页面</Text>
          </View>
        </Icon.TabBarItem>
        <Icon.TabBarItem iconName='ios-more' selectedIconName='ios-more' selected={this.state.selectedTab === 'account'} onPress={this.morePress}>
          <View style={styles.container}>
            <Text>账户页面</Text>
          </View>
        </Icon.TabBarItem>
      </TabBarIOS>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

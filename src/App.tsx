import * as React from 'react';
import {TabBarIOS} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Account from './components/Account';
import VideoCreate from './components/VideoCreate';
import VideoList from './components/VideoList';

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
          <VideoList></VideoList>
        </Icon.TabBarItem>
        <Icon.TabBarItem iconName='ios-recording' selectedIconName='ios-recording' selected={this.state.selectedTab === 'edit'} onPress={this.recordPress}>
          <VideoCreate></VideoCreate>
        </Icon.TabBarItem>
        <Icon.TabBarItem iconName='ios-more' selectedIconName='ios-more' selected={this.state.selectedTab === 'account'} onPress={this.morePress}>
          <Account></Account>
        </Icon.TabBarItem>
      </TabBarIOS>
    );
  }
}

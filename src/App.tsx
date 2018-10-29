import * as React from 'react';
import { TabBarIOS } from 'react-native';
import { Navigator } from 'react-native-deprecated-custom-components';
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
      selectedTab: 'account',
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
          <Navigator
            initialRoute={{
              name: 'videoList',
              component: VideoList,
            }}
            configureScene={(route: any) => Navigator.SceneConfigs.FloatFromRight}
            renderScene={(route: any, navigator: any) => {
              const Component = route.component;
              return <Component {...route.params} navigator={navigator}></Component>;
            }}
          >
          </Navigator>
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

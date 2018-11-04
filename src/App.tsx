import * as React from 'react';
import { AsyncStorage, TabBarIOS} from 'react-native';
import { Navigator } from 'react-native-deprecated-custom-components';
import Icon from 'react-native-vector-icons/Ionicons';
import Account from './components/Account';
import Login from './components/Login';
import VideoCreate from './components/VideoCreate';
import VideoList from './components/VideoList';

interface Props {}
interface State {
  user: any;
  selectedTab: string;
  login: boolean;
}
export default class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      user: null,
      selectedTab: 'list',
      login: false,
    };
  }
  _videoPress = () => {
    this.setState({
      selectedTab: 'list',
    });
  }
  _recordPress = () => {
    this.setState({
      selectedTab: 'edit',
    });
  }

  _morePress = () => {
    this.setState({
      selectedTab: 'account',
    });
  }
  _asyncAppStatus = () => {
    AsyncStorage.getItem('user')
      .then(data => {
        let user;
        const newState = {};
        if (data) {
          user = JSON.parse(data);
        }
        if (user && user.accessToken) {
          Object.assign(newState, {
            user,
            login: true,
          });
        } else {
          Object.assign(newState, {
            login: false,
          });
        }
        this.setState(newState);
      });
  }
  _afterLogin = (user: any) => {
    AsyncStorage.setItem('user', JSON.stringify(user))
      .then(() => {
        this.setState({
          login: true,
          user,
        });
      });
  }
  componentDidMount() {
    this._asyncAppStatus();
  }
  render() {
    if (!this.state.login) {
      return <Login afterLogin={this._afterLogin} />;
    }
    return (
      <TabBarIOS tintColor='#ee735c'>
        <Icon.TabBarItem iconName='ios-videocam' selectedIconName='ios-videocam' selected={this.state.selectedTab === 'list'} onPress={this._videoPress}>
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
        <Icon.TabBarItem iconName='ios-recording' selectedIconName='ios-recording' selected={this.state.selectedTab === 'edit'} onPress={this._recordPress}>
          <VideoCreate></VideoCreate>
        </Icon.TabBarItem>
        <Icon.TabBarItem iconName='ios-more' selectedIconName='ios-more' selected={this.state.selectedTab === 'account'} onPress={this._morePress}>
          <Account/>
        </Icon.TabBarItem>
      </TabBarIOS>
    );
  }
}

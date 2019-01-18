import * as React from 'react';
import { AsyncStorage, TabBarIOS} from 'react-native';
import { Navigator } from 'react-native-deprecated-custom-components';
import Icon from 'react-native-vector-icons/Ionicons';
import Account from './components/Account';
import Login from './components/Login';
import VideoCreate from './components/VideoCreate';
import VideoList from './components/VideoList';

interface State {
  user: any;
  selectedTab: string;
  login: boolean;
}
export default class App extends React.Component<any, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      user: null,
      selectedTab: 'edit',
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
  _logout = () => {
    AsyncStorage.removeItem('user');
    this.setState({
      login: false,
      user: null,
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
              return <route.component {...route.params} navigator={navigator} />;
            }}
          />
        </Icon.TabBarItem>
        <Icon.TabBarItem iconName='ios-recording' selectedIconName='ios-recording' selected={this.state.selectedTab === 'edit'} onPress={this._recordPress}>
          <VideoCreate />
        </Icon.TabBarItem>
        <Icon.TabBarItem iconName='ios-more' selectedIconName='ios-more' selected={this.state.selectedTab === 'account'} onPress={this._morePress}>
          <Account user={this.state.user} logout={this._logout} />
        </Icon.TabBarItem>
      </TabBarIOS>
    );
  }
}

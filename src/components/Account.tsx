import * as React from 'react';
import {
  AsyncStorage,
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/SimpleLineIcons';

const width = Dimensions.get('window').width;

interface Props {
  user: any;
}

interface State {
  user: any;
}

export default class Account extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      user: this.props.user || {},
    };
  }
  componentDidMount() {
    AsyncStorage.getItem('user')
     .then((data) => {
       let user;
       if (data) {
         console.log(data);
         user = JSON.parse(data);
       }
       if (user && user.accessToken) {
         this.setState({
           user,
         });
       }
     });
  }
  render() {
    const user = this.state.user;
    return (
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>我的账户</Text>
        </View>
        {
          user.avatar
          ? <TouchableOpacity style={styles.avatarContainer}>
              <ImageBackground source={{uri: user.avatar}} style={styles.avatarContainer}>
                <View style={styles.avatarBox}>
                  <Image
                    source={{uri: user.avatar}}
                    style={styles.avatar}
                  />
                </View>
                <Text style={styles.avatarTip}>点这里换宠物头像</Text>
              </ImageBackground>
            </TouchableOpacity>
          : <View style={styles.avatarContainer}>
              <Text style={styles.avatarTip}>添加宠物头像</Text>
              <TouchableOpacity style={styles.avatarBox}>
                <Icon
                  name='cloud-upload'
                  style={styles.plusIcon}
                />
              </TouchableOpacity>
            </View>
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    paddingTop: 25,
    paddingBottom: 12,
    backgroundColor: '#ee735c',
  },
  toolbarTitle: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  avatarContainer: {
    width,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#666',
  },
  avatar: {
    marginBottom: 15,
    width: width * 0.2,
    height: width * 0.2,
    resizeMode: 'cover',
    borderRadius: width * 0.1,
  },
  avatarTip: {
    color: '#fff',
    backgroundColor: 'transparent',
    fontSize: 14,
  },
  avatarBox: {
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: {
    padding: 20,
    paddingLeft: 25,
    paddingRight: 25,
    color: '#999',
    fontSize: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
});

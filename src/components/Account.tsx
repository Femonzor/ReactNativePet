import * as React from 'react';
import {
  AsyncStorage,
  Dimensions,
  Image,
  ImageBackground,
  ImageStyle,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
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
  _pickPhoto = () => {
    const options = {
      title: '选择头像',
      cancelButtonTitle: '取消',
      takePhotoButtonTitle: '拍照',
      chooseFromLibraryButtonTitle: '选择相册',
      quality: 0.75,
      allowsEditing: true,
      noData: false,
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    console.log(ImagePicker);
    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        return;
      }
      const avatarData = `data:image/jpeg;base64,${response.data}`;
      const user = this.state.user;
      user.avatar = avatarData;
      this.setState({
        user,
      });
    });
  }
  componentDidMount() {
    AsyncStorage.getItem('user')
     .then((data: any) => {
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
          ? <TouchableOpacity style={styles.avatarContainer} onPress={this._pickPhoto}>
              <ImageBackground source={{uri: user.avatar}} style={styles.avatarContainer}>
                <View style={styles.avatarBox}>
                  <Image
                    source={{uri: user.avatar}}
                    style={styles.avatar as ImageStyle}
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

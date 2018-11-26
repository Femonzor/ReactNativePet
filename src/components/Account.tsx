import * as React from 'react';
import {
  AlertIOS,
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
import * as Progress from 'react-native-progress';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import sha1 from 'sha1';
import config from '../common/config';
import request from '../common/request';

const width = Dimensions.get('window').width;

interface Props {
  user: any;
}

interface State {
  user: any;
  avatarProgress: number;
  avatarUploading: boolean;
}

const cloudinary = {
  cloud_name: 'yang',
  api_key: '668661248534544',
  api_secret: 'x0SRqJt1Iy8wwG4DLil6y84s1UI',
  base: 'http://res.cloudinary.com/yang',
  image: 'https://api.cloudinary.com/v1_1/yang/image/upload',
  video: 'https://api.cloudinary.com/v1_1/yang/video/upload',
  audio: 'https://api.cloudinary.com/v1_1/yang/raw/upload',
};

const avatar = (id: String, type: String) => `${cloudinary.base}/${type}/upload/${id}`;

export default class Account extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      user: this.props.user || {},
      avatarProgress: 0,
      avatarUploading: false,
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
      const timestamp = Date.now();
      const tags = 'app,avatar';
      const folder = 'avatar';
      const accessToken = this.state.user.accessToken;
      const signatureUrl = `${config.api.base}${config.api.signature}`;
      request.post(signatureUrl, {
        accessToken,
        timestamp,
        type: 'avatar',
        folder,
        tags,
      })
      .then(data => {
        console.log(data);
        if (data && data.code === 0) {
          let signature = `folder=${folder}&tags=${tags}&timestamp=${timestamp}${cloudinary.api_secret}`;
          console.log(signature);
          signature = sha1(signature) as string;
          const body = new FormData();
          body.append('folder', folder);
          body.append('signature', signature);
          body.append('tags', tags);
          body.append('timestamp', `${timestamp}`);
          body.append('api_key', cloudinary.api_key);
          body.append('resource_type', 'image');
          body.append('file', avatarData);
          this._uploadImage(body);
        }
      })
      .catch(error => {
        console.log(error);
      });
    });
  }
  _uploadImage(body: FormData) {
    const xhr = new XMLHttpRequest();
    const url = cloudinary.image;
    console.log(body);
    this.setState({
      avatarUploading: true,
      avatarProgress: 0,
    });
    xhr.open('POST', url);
    xhr.onload = () => {
      if (xhr.status !== 200) {
        AlertIOS.alert('请求失败');
        console.log(xhr.responseText);
        return;
      }
      if (!xhr.responseText) {
        AlertIOS.alert('请求失败');
        return;
      }
      let response;
      try {
        response = JSON.parse(xhr.response);
      } catch (e) {
        console.log(e);
        console.log('parse fails');
      }
      if (response && response.public_id) {
        const user = this.state.user;
        user.avatar = avatar(response.public_id, 'image');
        this.setState({
          avatarProgress: 0,
          avatarUploading: false,
          user,
        });
      }
    };
    if (xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Number((event.loaded / event.total).toFixed(2));
          this.setState({
            avatarProgress: percent,
          });
        }
      };
    }
    xhr.send(body);
  }
  componentDidMount() {
    AsyncStorage.getItem('user')
     .then((data: any) => {
       const user = data ? JSON.parse(data) : null;
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
                {
                  this.state.avatarUploading
                  ? <Progress.Circle
                    showsText={true}
                    size={75}
                    color={'#ee735c'}
                    progress={this.state.avatarProgress}
                  />
                  : <Image
                    source={{uri: user.avatar}}
                    style={styles.avatar as ImageStyle}
                  />
                }
                </View>
                <Text style={styles.avatarTip}>点这里换宠物头像</Text>
              </ImageBackground>
            </TouchableOpacity>
          : <TouchableOpacity onPress={this._pickPhoto} style={styles.avatarContainer}>
              <Text style={styles.avatarTip}>添加宠物头像</Text>
              <View style={styles.avatarBox}>
              {
                this.state.avatarUploading
                ? <Progress.Circle
                  showsText={true}
                  size={75}
                  color={'#ee735c'}
                  progress={this.state.avatarProgress}
                />
                : <Icon
                  name='cloud-upload'
                  style={styles.plusIcon}
                />
              }
              </View>
            </TouchableOpacity>
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

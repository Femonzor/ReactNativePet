import * as React from 'react';
import {
  AlertIOS,
  AsyncStorage,
  Dimensions,
  Image,
  ImageBackground,
  ImageStyle,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Button from 'react-native-button';
import ImagePicker from 'react-native-image-picker';
import * as Progress from 'react-native-progress';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import config from '../common/config';
import request from '../common/request';

const width = Dimensions.get('window').width;

const imageOptions = {
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

interface Props {
  user: any;
  logout: () => void;
}

interface State {
  user: any;
  avatarProgress: number;
  avatarUploading: boolean;
  modalVisible: boolean;
}

const cloudinary = {
  api_key: '668661248534544',
  audio: 'https://api.cloudinary.com/v1_1/yang/raw/upload',
  base: 'http://res.cloudinary.com/yang',
  cloud_name: 'yang',
  image: 'https://api.cloudinary.com/v1_1/yang/image/upload',
  video: 'https://api.cloudinary.com/v1_1/yang/video/upload',
};

const avatar = (id: string, type: string) => {
  if (id.indexOf('http') > -1) { return id; }
  if (id.indexOf('data:image') > -1) { return id; }
  return `${cloudinary.base}/${type}/upload/${id}`;
};

export default class Account extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      user: this.props.user || {},
      avatarProgress: 0,
      avatarUploading: false,
      modalVisible: false,
    };
  }
  _edit = () => {
    this.setState({
      modalVisible: true,
    });
  }
  _closeModal = () => {
    this.setState({
      modalVisible: false,
    });
  }
  _pickPhoto = () => {
    console.log(ImagePicker);
    ImagePicker.showImagePicker(imageOptions, (response) => {
      if (response.didCancel) {
        return;
      }
      const avatarData = `data:image/jpeg;base64,${response.data}`;
      const timestamp = Date.now();
      const tags = 'app,avatar';
      const folder = 'react-native-pet/avatar';
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
          const signature = data.data.token;
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
        this._asyncUser(true);
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
  _asyncUser = (isAvatar: boolean) => {
    let user = this.state.user;
    if (user && user.accessToken) {
      const url = `${config.api.base}${config.api.update}`;
      console.log(url);
      request.post(url, user)
        .then(data => {
          if (data && data.code === 0) {
            user = data.data;
            if (isAvatar) {
              AlertIOS.alert('头像更新成功');
            }
            this.setState({
              user,
            }, () => {
              AsyncStorage.setItem('user', JSON.stringify(user));
              this._closeModal();
            });
          }
        });
    }
  }
  _changeUserState = (key: string, value: any) => {
    const user = this.state.user;
    user[key] = value;
    this.setState({
      user,
    });
  }
  _submit = () => {
    this._asyncUser(false);
  }
  _logout = () => {
    this.props.logout();
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
          <Text style={styles.toolbarTitle}>宠物的账户</Text>
          <Text style={styles.toolbarEdit} onPress={this._edit}>编辑</Text>
        </View>
        {
          user.avatar
          ? <TouchableOpacity style={styles.avatarContainer} onPress={this._pickPhoto}>
              <ImageBackground source={{uri: avatar(user.avatar, 'image')}} style={styles.avatarContainer}>
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
                    source={{uri: avatar(user.avatar, 'image')}}
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
        <Modal
          animationType={'fade'}
          visible={this.state.modalVisible}
        >
          <View style={styles.modalContainer}>
            <Ionicons
              name='ios-close'
              style={styles.closeIcon}
              onPress={this._closeModal}
            />
            <View style={styles.fieldItem}>
              <Text style={styles.label}>昵称</Text>
              <TextInput
                placeholder='输入你的昵称'
                style={styles.inputField}
                autoCapitalize={'none'}
                autoCorrect={false}
                defaultValue={user.nickname}
                onChangeText={(text: string) => {
                  this._changeUserState('nickname', text);
                }}
              />
            </View>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>宠物品种</Text>
              <TextInput
                placeholder='输入宠物品种'
                style={styles.inputField}
                autoCapitalize={'none'}
                autoCorrect={false}
                defaultValue={user.breed}
                onChangeText={(text: string) => {
                  this._changeUserState('breed', text);
                }}
              />
            </View>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>年龄</Text>
              <TextInput
                placeholder='输入宠物年龄'
                style={styles.inputField}
                autoCapitalize={'none'}
                autoCorrect={false}
                defaultValue={user.age ? user.age + '' : user.age}
                onChangeText={(text: string) => {
                  this._changeUserState('age', text);
                }}
              />
            </View>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>性别</Text>
              <Ionicons.Button
                onPress={() => {
                  this._changeUserState('gender', 'male');
                }}
                style={user.gender === 'male' ? styles.genderChecked as any : styles.gender as any}
                name='ios-paw'
              >男
              </Ionicons.Button>
              <Ionicons.Button
                onPress={() => {
                  this._changeUserState('gender', 'female');
                }}
                style={user.gender === 'female' ? styles.genderChecked as any : styles.gender as any}
                name='md-paw'
              >女
              </Ionicons.Button>
            </View>
            <Button style={styles.btn} onPress={this._submit}>保存资料</Button>
          </View>
        </Modal>
        <Button style={styles.btn} onPress={this._logout}>退出登录</Button>
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
  toolbarEdit: {
    position: 'absolute',
    right: 10,
    top: 26,
    color: '#fff',
    textAlign: 'right',
    fontWeight: '600',
    fontSize: 14,
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
  modalContainer: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#fff',
  },
  fieldItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    paddingLeft: 15,
    paddingRight: 15,
    borderColor: '#eee',
    borderBottomWidth: 1,
  },
  label: {
    color: '#ccc',
    marginRight: 10,
  },
  inputField: {
    height: 50,
    flex: 1,
    color: '#666',
    fontSize: 14,
  },
  closeIcon: {
    position: 'absolute',
    width: 40,
    height: 40,
    fontSize: 32,
    right: 20,
    top: 30,
    color: '#ee735c',
  },
  gender: {
    backgroundColor: '#ccc',
  },
  genderChecked: {
    backgroundColor: '#ee735c',
  },
  btn: {
    marginTop: 25,
    padding: 10,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: 'transparent',
    borderColor: '#ee735c',
    borderWidth: 1,
    borderRadius: 4,
    color: '#ee735c',
  },
});

import * as React from 'react';
import {Dimensions, Image, ImageStyle, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

const width = Dimensions.get('window').width;

interface Props {
  user?: any;
  logout?: () => void;
}

interface State {
  previewVideo: any;
}

export default class VideoCreate extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      previewVideo: null,
    };
  }
  _pickVideo = () => {
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
    // console.log(ImagePicker);
    // ImagePicker.showImagePicker(options, (response) => {
    //   if (response.didCancel) {
    //     return;
    //   }
    //   const avatarData = `data:image/jpeg;base64,${response.data}`;
    //   const timestamp = Date.now();
    //   const tags = 'app,avatar';
    //   const folder = 'avatar';
    //   const accessToken = this.state.user.accessToken;
    //   const signatureUrl = `${config.api.base}${config.api.signature}`;
    //   request.post(signatureUrl, {
    //     accessToken,
    //     timestamp,
    //     type: 'avatar',
    //     folder,
    //     tags,
    //   })
    //   .then(data => {
    //     console.log(data);
    //     if (data && data.code === 0) {
    //       const signature = data.data;
    //       const body = new FormData();
    //       body.append('folder', folder);
    //       body.append('signature', signature);
    //       body.append('tags', tags);
    //       body.append('timestamp', `${timestamp}`);
    //       body.append('api_key', cloudinary.api_key);
    //       body.append('resource_type', 'image');
    //       body.append('file', avatarData);
    //       this._uploadImage(body);
    //     }
    //   })
    //   .catch(error => {
    //     console.log(error);
    //   });
    // });
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>
          {this.state.previewVideo ? '点击按钮配音' : '开始配音'}
          </Text>
          <Text style={styles.toolbarEdit} onPress={this._pickVideo}>更换视频</Text>
        </View>
        <View style={styles.page}>
        {
          this.state.previewVideo
          ? <View />
          : <TouchableOpacity style={styles.uploadContainer} onPress={this._pickVideo}>
            <View style={styles.uploadBox}>
              <Image source={require('../assets/images/record.png')} style={styles.uploadIcon as ImageStyle} />
              <Text style={styles.uploadTitle}>点击上传视频</Text>
              <Text style={styles.uploadDesc}>建议时长不超过 20 秒</Text>
            </View>
          </TouchableOpacity>
        }
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    alignItems: 'center',
    flex: 1,
  },
  toolbar: {
    backgroundColor: '#ee735c',
    flexDirection: 'row',
    paddingBottom: 12,
    paddingTop: 25,
  },
  toolbarEdit: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    position: 'absolute',
    right: 10,
    textAlign: 'right',
    top: 26,
  },
  toolbarTitle: {
    color: '#fff',
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  uploadBox: {
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  uploadContainer: {
    backgroundColor: '#fff',
    borderColor: '#ee735c',
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 90,
    paddingBottom: 10,
    width: width - 40,
  },
  uploadDesc: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
  },
  uploadIcon: {
    resizeMode: 'contain',
    width: 110,
  },
  uploadTitle: {
    color: '#000',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
});

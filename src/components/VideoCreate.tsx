import * as React from 'react';
import {Dimensions, Image, ImageResizeMode, ImageStyle, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import Video from 'react-native-video';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

type MediaType = 'photo' | 'video' | 'mixed' | undefined;
type VideoQuality = 'low' | 'medium' | 'high' | undefined;

const videoOptions = {
  title: '选择视频',
  cancelButtonTitle: '取消',
  takePhotoButtonTitle: '录制 10 秒视频',
  chooseFromLibraryButtonTitle: '选择已有视频',
  videoQuality: 'medium' as VideoQuality,
  mediaType: 'video' as MediaType,
  durationLimit: 10,
  noData: false,
  storageOptions: {
    skipBackup: true,
    path: 'images',
  },
};

interface Props {
  user?: any;
  logout?: () => void;
}

interface State {
  previewVideo: any;
  rate: number;
  muted: boolean;
  resizeMode: ImageResizeMode;
  repeat: boolean;
  videoReady: boolean;
  videoProgress: number;
  videoTotal: number;
  currentTime: number;
  playing: boolean;
  paused: boolean;
  videoRight: boolean;
}

export default class VideoCreate extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      previewVideo: null,
      rate: 1,
      muted: true,
      resizeMode: 'contain',
      repeat: false,
      videoReady: false,
      videoProgress: 0.01,
      videoTotal: 0,
      currentTime: 0,
      playing: false,
      paused: false,
      videoRight: true,
    };
  }
  _pickVideo = () => {
    // console.log(ImagePicker);
    ImagePicker.showImagePicker(videoOptions, (response) => {
      if (response.didCancel) {
        return;
      }
      const uri = response.uri;
      this.setState({
        previewVideo: uri,
      });
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
    });
  }
  _onLoadStart = () => {
    console.log('start');
  }
  _onLoad = () => {
    console.log('load');
  }
  _onProgress = (data: any) => {
    const { currentTime, playableDuration } = data;
    const percent = Number((currentTime / playableDuration).toFixed(2));
    const newState: any = {
      videoTotal: playableDuration,
      currentTime: Number(currentTime.toFixed(2)),
      videoProgress: percent,
    };
    if (!this.state.videoReady) {
      newState.videoReady = true;
    }
    if (!this.state.playing) {
      newState.playing = true;
    }
    this.setState(newState);
  }
  _onEnd = () => {
    this.setState({
      videoProgress: 1,
      playing: false,
    });
  }
  _onError = (error: any) => {
    this.setState({
      videoRight: false,
    });
    console.log(error);
    console.log('error');
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
          ? <View style={styles.videoContainer}>
              <View style={styles.videoBox}>
              <Video
                source={{uri: this.state.previewVideo}}
                style={styles.video}
                volume={5}
                paused={this.state.paused}
                rate={this.state.rate}
                muted={this.state.muted}
                resizeMode={this.state.resizeMode}
                repeat={this.state.repeat}
                onLoadStart={this._onLoadStart}
                onLoad={this._onLoad}
                onProgress={this._onProgress}
                onEnd={this._onEnd}
                onError={this._onError}
              />
              </View>
            </View>
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
  videoContainer: {
    width,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  videoBox: {
    width,
    height: height * 0.6,
    backgroundColor: '#333',
  },
  video: {
  },
});

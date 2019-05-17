import * as React from 'react';
import {AlertIOS, AsyncStorage, Dimensions, Image, ImageResizeMode, ImageStyle, Modal, Platform, ProgressViewIOS, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {AudioRecorder, AudioUtils} from 'react-native-audio';
import Button from 'react-native-button';
import RNFS from 'react-native-fs';
import ImagePicker from 'react-native-image-picker';
import * as Progress from 'react-native-progress';
import CountDownButton from 'react-native-smscode-count-down';
import Sound from 'react-native-sound';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';
import config from '../common/config';
import request from '../common/request';

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
  // video upload
  videoId: string | null;
  video: any;
  videoUploading: boolean;
  videoUploaded: boolean;
  videoProgress: number;
  videoUploadedProgress: number;
  // video load
  videoTotal: number;
  currentTime: number;
  videoRight: boolean;
  user: any;
  // count down
  counting: boolean;
  recording: boolean;
  // audio
  audioId: string | null;
  audio: any;
  audioPath: string;
  audioPlaying: boolean;
  recordDone: boolean;
  audioUploaded: boolean;
  audioUploading: boolean;
  audioUploadedProgress: number;

  title: string;
  modalVisible: boolean;
  publishProgress: number;
  publishing: boolean;
  willPublish: boolean;
}

const cloudinaryConfig = {
  api_key: '668661248534544',
  audio: 'https://api.cloudinary.com/v1_1/yang/raw/upload',
  base: 'http://res.cloudinary.com/yang',
  cloud_name: 'yang',
  image: 'https://api.cloudinary.com/v1_1/yang/image/upload',
  video: 'https://api.cloudinary.com/v1_1/yang/video/upload',
};

const defaultState = {
  previewVideo: null,
  rate: 1,
  muted: true,
  resizeMode: 'contain' as ImageResizeMode,
  repeat: false,
  videoId: null,
  video: null,
  videoUploading: false,
  videoUploaded: false,
  videoProgress: 0.01,
  videoUploadedProgress: 0.01,
  videoTotal: 0,
  currentTime: 0,
  videoRight: true,
  counting: false,
  recording: false,
  audioId: null,
  audio: null,
  audioPath: AudioUtils.DocumentDirectoryPath + '/pet.aac',
  audioPlaying: false,
  recordDone: false,
  audioUploaded: false,
  audioUploading: false,
  audioUploadedProgress: 0,
  title: '',
  modalVisible: false,
  publishProgress: 0.2,
  publishing: false,
  willPublish: false,
};

export default class VideoCreate extends React.Component<Props, State> {
  public videoPlayer: any;
  constructor(props: Props) {
    super(props);
    this.state = {
      user: this.props.user || {},
      ...defaultState,
    };
  }
  _pickVideo = () => {
    ImagePicker.showImagePicker(videoOptions, async (response) => {
      if (response.didCancel) {
        return;
      }
      const newState = {
        ...defaultState,
        user: this.state.user,
        ...{
          previewVideo: response.uri,
        },
      };
      this.setState(newState);
      const video = await RNFS.readFile(response.uri, 'base64');
      const timestamp = Date.now();
      const tags = 'app,video';
      const folder = 'react-native-pet/mute-video';
      const accessToken = this.state.user.accessToken;
      const signatureUrl = `${config.api.base}${config.api.signature}`;
      request.post(signatureUrl, {
        accessToken,
        timestamp,
        type: 'video',
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
          body.append('api_key', cloudinaryConfig.api_key);
          body.append('resource_type', 'video');
          body.append('file', `data:video/mp4;base64,${video}`);
          this._upload(body, 'video');
        }
      })
      .catch(error => {
        console.log(error);
      });
    });
  }
  _upload(body: FormData, type: string) {
    const xhr = new XMLHttpRequest();
    const url = cloudinaryConfig.video;
    console.log(body);
    const initState: any = {};
    initState[`${type}UploadedProgress`] = 0;
    initState[`${type}Uploading`] = true;
    initState[`${type}Uploaded`] = false;
    this.setState(initState);
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
        const newState: any = {};
        newState[type] = response;
        newState[`${type}Uploading`] = false;
        newState[`${type}Uploaded`] = true;
        this.setState(newState);
        const mediaUrl = `${config.api.base}${config.api[type]}`;
        const accessToken = this.state.user.accessToken;
        const postBody: any = {
          accessToken,
        };
        postBody[type] = JSON.stringify(response);
        if (type === 'audio') {
          postBody.videoId = this.state.videoId;
        }
        request.post(mediaUrl, postBody)
          .catch(error => {
            console.log(error);
            if (type === 'video') {
              AlertIOS.alert('视频同步异常，请重新上传！');
            } else if (type === 'audio') {
              AlertIOS.alert('音频同步异常，请重新上传！');
            }
          })
          .then(data => {
            if (data && data.code === 0) {
              const mediaState: any = {};
              mediaState[`${type}Id`] = data.data;
              if (type === 'audio') {
                this._showModal();
                mediaState.willPublish = true;
              }
              this.setState(mediaState);
            } else {
              if (type === 'video') {
                AlertIOS.alert('视频同步出错，请重新上传！');
              } else if (type === 'audio') {
                AlertIOS.alert('音频同步出错，请重新上传！');
              }
            }
          });
      }
    };
    if (xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Number((event.loaded / event.total).toFixed(2));
          const progressState: any = {};
          progressState[`${type}UploadedProgress`] = percent;
          this.setState(progressState);
        }
      };
    }
    xhr.send(body);
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
    this.setState({
      videoTotal: playableDuration,
      currentTime: Number(currentTime.toFixed(2)),
      videoProgress: percent,
    });
  }
  _onEnd = async () => {
    if (this.state.recording) {
      await AudioRecorder.stopRecording();
      this.setState({
        videoProgress: 1,
        recordDone: true,
        recording: false,
      });
    }
  }
  _onError = (error: any) => {
    this.setState({
      videoRight: false,
    });
    console.log(error);
    console.log('error');
  }
  _record = async () => {
    this.setState({
      videoProgress: 0,
      counting: false,
      recordDone: false,
      recording: true,
    });
    await AudioRecorder.startRecording();
    this.videoPlayer.seek(0);
  }
  _counting = () => {
    if (!this.state.counting && !this.state.recording && !this.state.audioPlaying) {
      this.setState({
        counting: true,
      });
      this.videoPlayer.seek(this.state.videoTotal - 0.01);
    }
  }
  _startCount = (shouldStartCountting: (shouldStart: boolean) => void) => {
    shouldStartCountting(true);
  }
  _preview = async () => {
    if (this.state.audioPlaying) {
      await AudioRecorder.stopPlaying();
    }
    this.setState({
      videoProgress: 0,
      audioPlaying: true,
    });
    setTimeout(() => {
      const sound = new Sound(this.state.audioPath, '', (error: any) => {
        if (error) {
          console.log('failed to load the sound', error);
        }
      });

      setTimeout(() => {
        this.videoPlayer.seek(0);
        sound.play((success: any) => {
          if (success) {
            console.log('successfully finished playing');
          } else {
            console.log('playback failed due to audio decoding errors');
          }
        });
      }, 100);
    }, 100);
  }
  _finishRecording = (didSucceed: boolean, filePath: string, fileSize: number) => {
    // this.setState({ finished: didSucceed });
    console.log(`Finished recording of duration ${this.state.currentTime} seconds at path: ${filePath} and size of ${fileSize || 0} bytes`);
  }
  _uploadAudio = async () => {
    const audio = await RNFS.readFile(this.state.audioPath, 'base64');
    const timestamp = Date.now();
    const tags = 'app,audio';
    const folder = 'react-native-pet/audio';
    const accessToken = this.state.user.accessToken;
    const signatureUrl = `${config.api.base}${config.api.signature}`;
    request.post(signatureUrl, {
      accessToken,
      timestamp,
      type: 'audio',
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
        body.append('api_key', cloudinaryConfig.api_key);
        body.append('resource_type', 'video');
        body.append('file', `data:video/mp4;base64,${audio}`);
        this._upload(body, 'audio');
      }
    })
    .catch(error => {
      console.log(error);
    });
  }
  _initAudio = () => {
    const audioPath = this.state.audioPath;
    console.log(`audioPath: ${audioPath}`);
    AudioRecorder.requestAuthorization().then((isAuthorised: any) => {
      // this.setState({ hasPermission: isAuthorised });

      if (!isAuthorised) { return; }

      AudioRecorder.prepareRecordingAtPath(audioPath, {
        SampleRate: 22050,
        Channels: 1,
        AudioQuality: 'High',
        AudioEncoding: 'aac',
        AudioEncodingBitRate: 32000,
      });

      AudioRecorder.onProgress = (data: any) => {
        // this.setState({currentTime: Math.floor(data.currentTime)});
      };

      AudioRecorder.onFinished = (data: any) => {
        // Android callback comes in the form of a promise instead.
        if (Platform.OS === 'ios') {
          this._finishRecording(data.status === 'OK', data.audioFileURL, data.audioFileSize);
        }
      };
    });
  }
  _closeModal = () => {
    this.setState({
      modalVisible: false,
    });
  }
  _showModal = () => {
    this.setState({
      modalVisible: true,
    });
  }
  _submit = () => {
    const body: any = {
      title: this.state.title,
      videoId: this.state.videoId,
      audioId: this.state.audioId,
    };
    const creationUrl = `${config.api.base}${config.api.media}`;
    const user = this.state.user;
    if (user && user.accessToken) {
      body.accessToken = user.accessToken;
      this.setState({
        publishing: true,
      });
      request.post(creationUrl, body)
      .then((res) => {
        if (res && res.code === 0) {
          AlertIOS.alert('视频发布成功', undefined, () => {
            this._closeModal();
            const state = {
              ...defaultState,
            };
            this.setState(state);
          });
        } else {
          this.setState({
            publishing: false,
          });
          AlertIOS.alert('视频发布失败');
        }
      })
      .catch((error: any) => {
        console.log(error);
        AlertIOS.alert('视频发布异常');
      });
    }
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
    this._initAudio();
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>
          {this.state.previewVideo ? '点击按钮配音' : '开始配音'}
          </Text>
          {
            this.state.previewVideo && this.state.videoUploaded
            ? <Text style={styles.toolbarEdit} onPress={this._pickVideo}>更换视频</Text>
            : null
          }
        </View>
        <View style={styles.page}>
        {
          this.state.previewVideo
          ? <View style={styles.videoContainer}>
              <View style={styles.videoBox}>
              <Video
                ref={ref => { this.videoPlayer = ref; }}
                source={{uri: this.state.previewVideo}}
                style={styles.video}
                volume={5}
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
              {
                !this.state.videoUploaded && this.state.videoUploading
                ? <View style={styles.progressTipBox}>
                    <ProgressViewIOS style={styles.progressBar} progressTintColor='#ee735c' progress={this.state.videoUploadedProgress} />
                    <Text style={styles.progressTip}>
                      正在生成静音视频，已完成{(this.state.videoUploadedProgress * 100).toFixed(2)}%
                    </Text>
                  </View>
                : null
              }
              {
                this.state.recording || this.state.audioPlaying
                ? <View style={styles.progressTipBox}>
                    <ProgressViewIOS style={styles.progressBar} progressTintColor='#ee735c' progress={this.state.videoProgress} />
                    {
                      this.state.recording
                      ? <Text style={styles.progressTip}>
                          录制声音中
                        </Text>
                      : null
                    }
                  </View>
                : null
              }
              {
                this.state.recordDone
                ? <View style={styles.previewBox}>
                    <Icon name='play' style={styles.previewIcon} />
                    <Text style={styles.previewText} onPress={this._preview}>
                      预览
                    </Text>
                  </View>
                : null
              }
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
        {
          this.state.videoUploaded
          ? <View style={styles.recordBox}>
              <View style={[styles.recordIconBox, (this.state.recording || this.state.audioPlaying) && styles.recordOn]}>
              {
                this.state.counting && !this.state.recording
                ? <CountDownButton
                    disableColor='#fff'
                    textStyle={{fontSize: 32, fontWeight: '600'}}
                    timerCount={3}
                    timerTitle={'3'}
                    timerActiveTitle={['', '']}
                    timerEnd={this._record}
                    enable={true}
                    executeFunc={(shouldStartingCounting: (shouldStart: boolean) => void)=>{
                      shouldStartingCounting(true);
                    }}
                />
                : <TouchableOpacity onPress={this._counting}>
                    <Icon name='microphone' style={styles.recordIcon} />
                  </TouchableOpacity>
              }
              </View>
            </View>
          : null
        }
        {
          this.state.videoUploaded && this.state.recordDone
          ? <View style={styles.uploadAudioBox}>
            {
              !this.state.audioUploaded && !this.state.audioUploading
              ? <Text style={styles.uploadAudioText} onPress={this._uploadAudio}>下一步</Text>
              : null
            }
            {
              this.state.audioUploading
              ? <Progress.Circle
                showsText={true}
                size={60}
                color={'#ee735c'}
                progress={this.state.audioUploadedProgress}
              />
              : null
            }
          </View>
          : null
        }
        </View>
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
            {
              this.state.audioUploaded && !this.state.publishing
              ? <View style={styles.fieldBox}>
                  <TextInput
                    placeholder='给宠物一句介绍'
                    style={styles.inputField}
                    autoCapitalize={'none'}
                    autoCorrect={false}
                    defaultValue={this.state.title}
                    onChangeText={(text: string) => {
                      this.setState({
                        title: text,
                      });
                    }}
                  />
                </View>
              : null
            }
            {
              this.state.publishing
              ? <View style={styles.loadingBox}>
                  <Text style={styles.loadingText}>正在生成专属视频中...</Text>
                  {
                    this.state.willPublish
                    ? <Text style={styles.loadingText}>正在合并视频音频...</Text>
                    : null
                  }
                  {
                    this.state.publishProgress > 0.3
                    ? <Text style={styles.loadingText}>开始上传！</Text>
                    : null
                  }
                  <Progress.Circle
                    showsText={true}
                    size={60}
                    color={'#ee735c'}
                    progress={this.state.publishProgress}
                  />
                </View>
              : null
            }
            <View style={styles.submitBox}>
              {
                this.state.audioUploaded && !this.state.publishing
                ? <Button style={styles.btn} onPress={this._submit}>发布视频</Button>
                : null
              }
            </View>
          </View>
        </Modal>
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
    width,
    height: height * 0.6,
    backgroundColor: '#333',
  },
  progressTipBox: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width,
    height: 30,
    backgroundColor: 'rgba(244, 244, 244, 0.65)',
  },
  progressBar: {
    width,
  },
  progressTip: {
    color: '#333',
    width: width - 10,
    padding: 5,
    height: 30,
  },
  recordBox: {
    width,
    height: 60,
    alignItems: 'center',
  },
  recordIconBox: {
    width: 68,
    height: 68,
    marginTop: -30,
    borderRadius: 34,
    backgroundColor: '#ee735c',
    borderWidth: 1,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordIcon: {
    fontSize: 58,
    backgroundColor: 'transparent',
    color: '#fff',
  },
  recordOn: {
    backgroundColor: '#ccc',
  },
  previewBox: {
    width: 80,
    height: 30,
    position: 'absolute',
    right: 10,
    bottom: 10,
    borderWidth: 1,
    borderColor: '#ee735c',
    borderRadius: 3,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewIcon: {
    marginRight: 5,
    fontSize: 20,
    color: '#ee735c',
  },
  previewText: {
    fontSize: 20,
    color: '#ee735c',
  },
  uploadAudioBox: {
    width,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadAudioText: {
    width: width - 20,
    padding: 5,
    borderWidth: 1,
    borderColor: '#ee735c',
    borderRadius: 5,
    textAlign: 'center',
    fontSize: 30,
    color: '#ee735c',
  },
  modalContainer: {
    width,
    height,
    paddingTop: 50,
    backgroundColor: '#fff',
  },
  inputField: {
    height: 36,
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  btn: {
    marginTop: 65,
    padding: 10,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: 'transparent',
    borderColor: '#ee735c',
    borderWidth: 1,
    borderRadius: 4,
    color: '#ee735c',
  },
  closeIcon: {
    position: 'absolute',
    fontSize: 32,
    right: 20,
    top: 30,
    color: '#ee735c',
  },
  loadingBox: {
    width,
    height: 50,
    marginTop: 10,
    padding: 15,
    alignItems: 'center',
  },
  loadingText: {
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  fieldBox: {
    width: width - 40,
    height: 36,
    marginTop: 30,
    marginRight: 20,
    marginLeft: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  submitBox: {
    marginTop: 50,
    padding: 15,
  },
});

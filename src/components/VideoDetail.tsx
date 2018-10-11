import * as React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';

const width = Dimensions.get('window').width;

enum ResizeMode {
  Cover = 'cover',
  Contain = 'contain',
}

interface Props {
  data: any;
  navigator: any;
}
interface State {
  rate: number;
  muted: boolean;
  resizeMode: ResizeMode;
  repeat: boolean;
  videoReady: boolean;
  videoProgress: number;
  videoTotal: number;
  currentTime: number;
  playing: boolean;
}

export default class VideoDetail extends React.Component<Props, State> {
  videoPlayer: any;
  constructor(props: Props) {
    super(props);
    this.state = {
      rate: 1,
      muted: false,
      resizeMode: ResizeMode.Contain,
      repeat: false,
      videoReady: false,
      videoProgress: 0.01,
      videoTotal: 0,
      currentTime: 0,
      playing: false,
    };
  }
  _backToList = () => {
    this.props.navigator.pop();
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
    console.log(error);
    console.log('error');
  }
  _rePlay = () => {
    this.videoPlayer.seek(0);
  }
  render() {
    const data = this.props.data;
    console.log(data);
    return (
      <View style={styles.container}>
        <Text onPress={this._backToList}>视频详情页</Text>
        <View style={styles.videoBox}>
          <Video
            ref={ref => { this.videoPlayer = ref; }}
            source={{uri: data.video}}
            style={styles.video}
            volume={5}
            paused={false}
            rate={this.state.rate}
            muted={this.state.muted}
            resizeMode={this.state.resizeMode}
            repeat={this.state.repeat}
            onLoadStart={this._onLoadStart}
            onLoad={this._onLoad}
            onProgress={this._onProgress}
            onEnd={this._onEnd}
            onError={this._onError}
          >
          </Video>
          {!this.state.videoReady && <ActivityIndicator color='#ee735c' style={styles.loading}></ActivityIndicator>}
          {
            this.state.videoReady && !this.state.playing
            ? <Icon onPress={this._rePlay} name='ios-play' size={48} style={styles.playIcon} />
            : null
          }
          <View style={styles.progressBox}>
            <View style={[styles.progressBar, {width: width * this.state.videoProgress}]}></View>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5fcff',
  },
  videoBox: {
    width,
    height: 360,
    backgroundColor: '#000',
  },
  video: {
    width,
    height: 360,
    backgroundColor: '#000',
  },
  loading: {
    position: 'absolute',
    left: 0,
    top: 140,
    width,
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  progressBox: {
    width,
    height: 2,
    backgroundColor: '#ccc',
  },
  progressBar: {
    width: 1,
    height: 2,
    backgroundColor: '#f60',
  },
  playIcon: {
    position: 'absolute',
    top: 140,
    left: width / 2 - 30,
    width: 60,
    height: 60,
    paddingTop: 8,
    paddingLeft: 22,
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 30,
    color: '#ed7b66',
  },
});

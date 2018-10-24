import * as React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ImageStyle,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
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
  paused: boolean;
  videoRight: boolean;
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
      paused: false,
      videoRight: true,
    };
  }
  _pop = () => {
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
    this.setState({
      videoRight: false,
    });
    console.log(error);
    console.log('error');
  }
  _rePlay = () => {
    this.videoPlayer.seek(0);
  }
  _pause = () => {
    if (!this.state.paused) {
      this.setState({
        paused: true,
      });
    }
  }
  _resume = () => {
    if (this.state.paused) {
      this.setState({
        paused: false,
      });
    }
  }
  render() {
    const data = this.props.data;
    console.log(data);
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBox} onPress={this._pop}>
            <Icon name='ios-arrow-back' style={styles.backIcon} />
            <Text style={styles.backText}>返回</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>视频详情页</Text>
        </View>
        <View style={styles.videoBox}>
          <Video
            ref={ref => { this.videoPlayer = ref; }}
            source={{uri: data.video}}
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
          >
          </Video>
          {!this.state.videoReady && <ActivityIndicator color='#ee735c' style={styles.loading}></ActivityIndicator>}
          {!this.state.videoRight && <Text style={styles.failText}>视频出错了～</Text>}
          {
            this.state.videoReady && !this.state.playing
            ? <Icon onPress={this._rePlay} name='ios-play' size={48} style={styles.playIcon} />
            : null
          }
          {
            this.state.videoReady && this.state.playing
            ? <TouchableOpacity onPress={this._pause} style={styles.pauseBtn}>
            {
              this.state.paused
              ? <Icon onPress={this._resume} name='ios-play' size={48} style={styles.resumeIcon} />
              : <Text></Text>
            }
            </TouchableOpacity>
            : null
          }
          <View style={styles.progressBox}>
            <View style={[styles.progressBar, {width: width * this.state.videoProgress}]}></View>
          </View>
        </View>
        <ScrollView
          automaticallyAdjustContentInsets={false}
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
        >
          <View style={styles.infoBox}>
            <Image style={styles.avatar as ImageStyle} source={{uri: data.author.avatar}}></Image>
            <View style={styles.descBox}>
              <Text style={styles.nickname}>{data.author.nickname}</Text>
              <Text style={styles.title}>{data.title}</Text>
            </View>
          </View>
        </ScrollView>
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
  pauseBtn: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height: 360,
  },
  resumeIcon: {
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
  failText: {
    position: 'absolute',
    left: 0,
    top: 180,
    width,
    textAlign: 'center',
    color: '#fff',
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width,
    height: 64,
    paddingTop: 20,
    paddingLeft: 10,
    paddingRight: 10,
    borderBottomWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
  },
  backBox: {
    position: 'absolute',
    left: 12,
    top: 32,
    width: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    width: width - 150,
    textAlign: 'center',
  },
  backIcon: {
    color: '#999',
    fontSize: 20,
    marginRight: 5,
  },
  backText: {
    color: '#999',
  },
  scrollView: {
  },
  infoBox: {
    width,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    marginRight: 10,
    marginLeft: 10,
    borderRadius: 30,
  },
  descBox: {
    flex: 1,
  },
  nickname: {
    fontSize: 18,
  },
  title: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  },
});

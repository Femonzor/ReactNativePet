import * as React from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
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
    console.log(data);
    console.log('progress');
  }
  _onEnd = () => {
    console.log('end');
  }
  _onError = (error: any) => {
    console.log(error);
    console.log('error');
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
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
});

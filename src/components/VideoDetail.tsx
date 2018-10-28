import * as React from 'react';
import {
  ActivityIndicator,
  AlertIOS,
  Dimensions,
  Image,
  ImageStyle,
  ListView,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Button from 'react-native-button';
import Icon from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';
import config from '../common/config';
import request from '../common/request';

const width = Dimensions.get('window').width;
const cache: Pet.PageData = {
  nextPage: 1,
  items: [],
  total: 0,
};

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
  comments: any;
  resizeMode: ResizeMode;
  repeat: boolean;
  videoReady: boolean;
  videoProgress: number;
  videoTotal: number;
  currentTime: number;
  playing: boolean;
  paused: boolean;
  videoRight: boolean;
  loading: boolean;
  modalVisible: boolean;
  isSending: boolean;
  content: string;
  animationType: string;
}

export default class VideoDetail extends React.Component<Props, State> {
  videoPlayer: any;
  constructor(props: Props) {
    super(props);
    const dataSource = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
    });
    this.state = {
      rate: 1,
      muted: false,
      comments: dataSource.cloneWithRows([]),
      resizeMode: ResizeMode.Contain,
      repeat: false,
      videoReady: false,
      videoProgress: 0.01,
      videoTotal: 0,
      currentTime: 0,
      playing: false,
      paused: false,
      videoRight: true,
      loading: false,
      modalVisible: false,
      isSending: false,
      content: '',
      animationType: 'none',
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
  _fetchData = (page: number) => {
    this.setState({
      loading: true,
    });
    console.log(`page: ${page}`);
    request.get(`${config.api.base}${config.api.comments}`, {
      page,
      videoId: 125,
      accessToken: '123a',
    }).then((data: any) => {
      if (data && data.code === 0) {
        const comments = data.data;
        comments.forEach((item: any) => {
          item.replyBy.avatar = item.replyBy.avatar.replace('http://', 'https://');
        });
        let items;
        items = cache.items.slice().concat(comments);
        cache.nextPage += 1;
        cache.items = items;
        cache.total = data.total;
        this.setState({
          comments: this.state.comments.cloneWithRows(cache.items),
          loading: false,
        });
      }
    })
    .catch((error: Error) => {
      this.setState({
        loading: false,
      });
      console.warn(error);
    });
  }
  _fetchMoreData = () => {
    if (!this._hasMore() || this.state.loading) {
      return;
    }
    const page = cache.nextPage;
    this._fetchData(page);
  }
  _hasMore = () => {
    return cache.items.length !== cache.total;
  }
  _renderFooter = () => {
    if (!this._hasMore() && cache.total !== 0) {
      return (
        <View style={styles.loadingMore}>
          <Text style={styles.loadingText}>没有更多了</Text>
        </View>
      );
    }
    if (!this.state.loading) {
      return <View style={styles.loadingMore}></View>;
    }
    return <ActivityIndicator style={styles.loadingMore}></ActivityIndicator>;
  }
  _renderHeader = () => {
    const data = this.props.data;
    return (
      <View style={styles.listHeader}>
        <View style={styles.infoBox}>
          <Image style={styles.avatar as ImageStyle} source={{uri: data.author.avatar}}></Image>
          <View style={styles.descBox}>
            <Text style={styles.nickname}>{data.author.nickname}</Text>
            <Text style={styles.title}>{data.title}</Text>
          </View>
        </View>
        <View style={styles.commentBox}>
          <View>
            <TextInput
              placeholder='请输入评论内容...'
              style={styles.content}
              multiline={true}
              onFocus={this._focus}
            />
          </View>
        </View>
        <View style={styles.commentArea}>
          <Text>精彩评论</Text>
        </View>
      </View>
    );
  }
  _renderRow = (row: any) => {
    return (
      <View key={row.id} style={styles.replyBox}>
        <Image style={styles.replyAvatar as ImageStyle} source={{uri: row.replyBy.avatar}}></Image>
        <View style={styles.reply}>
          <Text style={styles.replyNickname}>{row.replyBy.nickname}</Text>
          <Text style={styles.replyContent}>{row.content}</Text>
        </View>
      </View>
    );
  }
  _setModalVisible = (isVisible: boolean) => {
    this.setState({
      modalVisible: isVisible,
    });
  }
  _focus = () => {
    this._setModalVisible(true);
  }
  _blur = () => {
  }
  _closeModal = () => {
    this._setModalVisible(false);
  }
  _submit = () => {
    if (!this.state.content) {
      return AlertIOS.alert('留言不能为空');
    }
    if (this.state.isSending) {
      return AlertIOS.alert('正在评论中');
    }
    this.setState({
      isSending: true,
    }, () => {
      const body = {
        access_token: 'abc',
        videoId: 123,
        content: this.state.content,
      };
      const url = `${config.api.base}${config.api.comments}`;
      request.post(url, body)
        .then(data => {
          if (data && data.code === 0) {
            let items: any[] = cache.items.slice();
            const content = this.state.content;
            items = [{
              content,
              replyBy: {
                nickname: 'dog',
                avatar: 'https://dummyimage.com/640x640/79eff2',
              },
            }].concat(items);
            cache.items = items;
            cache.total += 1;
            this.setState({
              content: '',
              isSending: false,
              comments: this.state.comments.cloneWithRows(cache.items),
            });
            this._setModalVisible(false);
          }
        })
        .catch(error => {
          console.log(error);
          this.setState({
            isSending: false,
          });
          this._setModalVisible(false);
          AlertIOS.alert('评论失败');
        });
    });
  }
  componentDidMount() {
    this._fetchData(1);
  }
  render() {
    const data = this.props.data;
    // console.log(data);
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
        <ListView
          dataSource={this.state.comments}
          renderRow={this._renderRow}
          automaticallyAdjustContentInsets={false}
          enableEmptySections={true}
          showsVerticalScrollIndicator={false}
          renderHeader={this._renderHeader}
          renderFooter={this._renderFooter}
          onEndReached={this._fetchMoreData}
          onEndReachedThreshold={20}
        />
        <Modal
          animationType={'fade'}
          visible={this.state.modalVisible}
          onRequestClose={() => { this._setModalVisible(false); }}
        >
          <View style={styles.modalContainer}>
            <Icon
              onPress={this._closeModal}
              name='ios-close'
              style={styles.closeIcon}
            />
            <View style={styles.commentBox}>
              <View>
                <TextInput
                  placeholder='请输入评论内容...'
                  style={styles.content}
                  multiline={true}
                  defaultValue={this.state.content}
                  onChangeText={(text) => {
                    this.setState({
                      content: text,
                    });
                  }}
                />
              </View>
            </View>
            <Button style={styles.submitButton} onPress={this._submit}>评论</Button>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5fcff',
  },
  modalContainer: {
    flex: 1,
    paddingTop: 45,
    backgroundColor: '#fff',
  },
  closeIcon: {
    alignSelf: 'center',
    fontSize: 30,
    color: '#ee753c',
  },
  submitButton: {
    width: width - 20,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ee735c',
    borderRadius: 4,
    color: '#ee735c',
    fontSize: 18,
  },
  videoBox: {
    width,
    height: width * 0.56,
    backgroundColor: '#000',
  },
  video: {
    width,
    height: width * 0.56,
    backgroundColor: '#000',
  },
  loading: {
    position: 'absolute',
    left: 0,
    top: 80,
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
    top: 90,
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
    top: 90,
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
    top: 90,
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
  replyBox: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 10,
  },
  replyAvatar: {
    width: 40,
    height: 40,
    marginRight: 10,
    marginLeft: 10,
    borderRadius: 20,
  },
  replyNickname: {
    color: '#666',
  },
  replyContent: {
    color: '#666',
    marginTop: 4,
  },
  reply: {
    flex: 1,
  },
  loadingMore: {
    marginVertical: 20,
  },
  loadingText: {
    color: '#777',
    textAlign: 'center',
  },
  listHeader: {
    marginTop: 10,
    width,
  },
  commentBox: {
    marginTop: 10,
    marginBottom: 10,
    padding: 8,
    width,
  },
  content: {
    paddingLeft: 2,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    fontSize: 14,
    height: 80,
  },
  commentArea: {
    width,
    paddingBottom: 6,
    paddingLeft: 10,
    paddingRight: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});

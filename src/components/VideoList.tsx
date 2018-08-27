import * as React from 'react';
import {
  Dimensions,
  ImageBackground,
  ListView,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const width = Dimensions.get('window').width;

interface Props {}
interface State {
  videos: any;
}
export default class VideoList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const dataSource = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
    });
    this.state = {
      videos: dataSource.cloneWithRows([
        {
          id: '330000198207315548',
          thumb: 'https://dummyimage.com/1200x600/79f297',
          video: 'http://qcloud.rrmj.tv/db5a8379a592f620853dd86690acdd99.mp4.f40.mp4?sign=1127de61b2a30205630cf23b4aa88303&t=5b82dcdf&r=8842901641661277975',
          title: '识此江家状',
        },
        {
          id: '360000200401141700',
          thumb: 'https://dummyimage.com/1200x600/f2797e',
          video: 'http://qcloud.rrmj.tv/db5a8379a592f620853dd86690acdd99.mp4.f40.mp4?sign=1127de61b2a30205630cf23b4aa88303&t=5b82dcdf&r=8842901641661277975',
          title: '在战住火被',
        },
        {
          id: '510000198901107697',
          thumb: 'https://dummyimage.com/1280x720/79f2f0',
          video: 'http://qcloud.rrmj.tv/db5a8379a592f620853dd86690acdd99.mp4.f40.mp4?sign=1127de61b2a30205630cf23b4aa88303&t=5b82dcdf&r=8842901641661277975',
          title: '素力写红去',
        },
        {
          id: '610000198202016167',
          thumb: 'https://dummyimage.com/1200x600/d5f279',
          video: 'http://qcloud.rrmj.tv/db5a8379a592f620853dd86690acdd99.mp4.f40.mp4?sign=1127de61b2a30205630cf23b4aa88303&t=5b82dcdf&r=8842901641661277975',
          title: '色该元县部',
        },
      ]),
    };
  }
  renderRow = (row: any) => {
    return (
      <TouchableHighlight>
        <View style={styles.item}>
          <Text style={styles.title}>{row.title}</Text>
          <ImageBackground source={{uri: row.thumb}} style={styles.thumb}>
            <Icon name='ios-play' size={28} style={styles.play}></Icon>
          </ImageBackground>
          <View style={styles.itemFooter}>
            <View style={styles.handleBox}>
              <Icon name='ios-heart-empty' size={28} style={styles.favo}></Icon>
              <Text style={styles.handleText}>喜欢</Text>
            </View>
            <View style={styles.handleBox}>
              <Icon name='ios-chatboxes' size={28} style={styles.comment}></Icon>
              <Text style={styles.handleText}>评论</Text>
            </View>
          </View>
        </View>
      </TouchableHighlight>
    );
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>列表页面</Text>
        </View>
        <ListView dataSource={this.state.videos} renderRow={this.renderRow} automaticallyAdjustContentInsets={false}></ListView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5fcff',
  },
  header: {
    paddingTop: 25,
    paddingBottom: 12,
    backgroundColor: '#ee735c',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  item: {
    width,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  thumb: {
    width,
    height: width * 0.56,
    resizeMode: 'cover',
  },
  title: {
    padding: 10,
    fontSize: 18,
    color: '#333',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#eee',
  },
  handleBox: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    width: width / 2 - 0.5,
    backgroundColor: '#fff',
  },
  play: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    width: 46,
    height: 46,
    paddingTop: 9,
    paddingLeft: 18,
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 23,
    color: '#ed7b66',
  },
  handleText: {
    paddingLeft: 12,
    fontSize: 18,
    color: '#333',
  },
  favo: {
    fontSize: 22,
    color: '#333',
  },
  comment: {
    fontSize: 22,
    color: '#333',
  },
});

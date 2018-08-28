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
import config from '../common/config';
import request from '../common/request';

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
      videos: dataSource.cloneWithRows([]),
    };
  }
  componentDidMount() {
    this._fetchData();
  }
  _fetchData = () => {
    request.get(`${config.api.base}${config.api.videos}`)
      .then((data: any) => {
        console.log(data);
        if (data.code === 0) {
          data.data.forEach((item: any) => {
            item.thumb = item.thumb.replace('http://', 'https://');
          });
          console.log(data.data);
          this.setState({
            videos: this.state.videos.cloneWithRows(data.data),
          });
        }
      })
      .catch((error: Error) => {
        console.log(error);
      });
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
        <ListView dataSource={this.state.videos} renderRow={this.renderRow} automaticallyAdjustContentInsets={false} enableEmptySections={true}></ListView>
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

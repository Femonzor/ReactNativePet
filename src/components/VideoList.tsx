import * as React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ListView,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import config from '../common/config';
import request from '../common/request';
import VideoDetail from './VideoDetail';
import VideoListItem from './VideoListItem';

const width = Dimensions.get('window').width;

const cache = {
  nextPage: 1,
  items: [],
  total: 0,
};

interface Props {
  navigator: any;
}
interface State {
  videos: any;
  loading: boolean;
  refreshing: boolean;
}
export default class VideoList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const dataSource = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
    });
    this.state = {
      videos: dataSource.cloneWithRows([]),
      loading: false,
      refreshing: false,
    };
  }
  componentDidMount() {
    this._fetchData(1);
  }
  _fetchData = (page: number) => {
    if (page !== 0) {
      this.setState({
        loading: true,
      });
    } else {
      this.setState({
        refreshing: true,
      });
    }
    console.log(`page: ${page}`);
    request.get(`${config.api.base}${config.api.videos}`, {
      page,
    }).then((data: any) => {
      console.log(data);
      if (data.code === 0) {
        data.data.forEach((item: any) => {
          item.thumb = item.thumb.replace('http://', 'https://');
          item.author.avatar = item.author.avatar.replace('http://', 'https://');
        });
        let items;
        if (page !== 0) {
          items = cache.items.slice().concat(data.data);
        } else {
          cache.nextPage = 1;
          items = data.data;
        }
        cache.nextPage += 1;
        cache.items = items;
        cache.total = data.total;
        setTimeout(() => {
          if (page !== 0) {
            this.setState({
              videos: this.state.videos.cloneWithRows(cache.items),
              loading: false,
            });
          } else {
            this.setState({
              videos: this.state.videos.cloneWithRows(cache.items),
              refreshing: false,
            });
          }
        }, 2000);
      }
    })
    .catch((error: Error) => {
      if (page !== 0) {
        this.setState({
          loading: false,
        });
      } else {
        this.setState({
          refreshing: false,
        });
      }
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
  _onRefresh = () => {
    if (this.state.refreshing) {
      return;
    }
    this.setState({
      refreshing: true,
    });
    this._fetchData(0);
  }
  _hasMore = () => {
    return cache.items.length !== cache.total;
  }
  _renderRow = (row: any) => {
    return (
      <VideoListItem
        row={row}
        onSelect={() => this._loadPage(row)}
        key={row.id}
      >
      </VideoListItem>
    );
  }
  _renderFooter = () => {
    if (!this._hasMore() && cache.total !== 0) {
      return (
        <View style={styles.loading}>
          <Text style={styles.loadingText}>没有更多了</Text>
        </View>
      );
    }
    if (!this.state.loading) {
      return <View style={styles.loading}></View>;
    }
    return <ActivityIndicator style={styles.loading}></ActivityIndicator>;
  }
  _loadPage = (row: any) => {
    this.props.navigator.push({
      name: 'detail',
      component: VideoDetail,
      params: {
        data: row,
      },
    });
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>列表页面</Text>
        </View>
        <ListView
          dataSource={this.state.videos}
          renderRow={this._renderRow}
          automaticallyAdjustContentInsets={false}
          enableEmptySections={true}
          onEndReached={this._fetchMoreData}
          onEndReachedThreshold={20}
          renderFooter={this._renderFooter}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              tintColor='#f60'
              title='拼命加载中...'
              onRefresh={this._onRefresh}
            />
          }
        >
        </ListView>
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
  loading: {
    marginVertical: 20,
  },
  loadingText: {
    color: '#777',
    textAlign: 'center',
  },
});

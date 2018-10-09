import * as React from 'react';
import {
  AlertIOS,
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import config from '../common/config';
import request from '../common/request';

const width = Dimensions.get('window').width;

interface Props {
  row: any;
  onSelect: any;
}
interface State {
  favo: boolean;
}

export default class VideoListItem extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const row = props.row;
    this.state = {
      favo: row.favo,
    };
  }
  _favo = () => {
    const favo = !this.state.favo;
    const { row } = this.props;
    const url = `${config.api.base}${config.api.favo}`;
    const body = {
      id: row.id,
      favo,
      accessToken: 'asdv',
    };
    request.post(url, body)
      .then(data => {
        if (data && data.code === 0) {
          console.log('点赞成功');
          this.setState({
            favo,
          });
        } else {
          AlertIOS.alert('点赞失败，稍后重试～');
        }
      })
      .catch(error => {
        console.error(error);
        AlertIOS.alert('点赞失败，稍后重试～');
      });
  }
  render() {
    const row = this.props.row;
    return (
      <TouchableHighlight onPress={this.props.onSelect}>
        <View style={styles.item}>
          <Text style={styles.title}>{row.title}</Text>
          <ImageBackground source={{uri: row.thumb}} style={styles.thumb}>
            <Icon name='ios-play' size={28} style={styles.play}></Icon>
          </ImageBackground>
          <View style={styles.itemFooter}>
            <View style={styles.handleBox}>
              <Icon name={this.state.favo ? 'ios-heart' : 'ios-heart-empty'} size={28} style={[styles.favo, this.state.favo ? null : styles.unfavo]} onPress={this._favo}></Icon>
              <Text style={styles.handleText} onPress={this._favo}>喜欢</Text>
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
}

const styles = StyleSheet.create({
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
    color: '#ed7b66',
  },
  unfavo: {
    fontSize: 22,
    color: '#333',
  },
  comment: {
    fontSize: 22,
    color: '#333',
  },
});

import * as React from 'react';
import {Dimensions, Image, ImageStyle, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

const width = Dimensions.get('window').width;

interface Props {
  user: any;
  logout: Function;
}

interface State {
  previewVideo: any;
}

export default class VideoCreate extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      previewVideo: null,
    };
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>
          {this.state.previewVideo ? '点击按钮配音' : '开始配音'}
          </Text>
          <Text style={styles.toolbarEdit}>更换视频</Text>
        </View>
        <View style={styles.page}>
        {
          this.state.previewVideo
          ? <View />
          : <TouchableOpacity style={styles.uploadContainer}>
            <View>
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
  toolbar: {
    flexDirection: 'row',
    paddingTop: 25,
    paddingBottom: 12,
    backgroundColor: '#ee735c',
  },
  toolbarTitle: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  toolbarEdit: {
    position: 'absolute',
    right: 10,
    top: 26,
    color: '#fff',
    textAlign: 'right',
    fontWeight: '600',
    fontSize: 14,
  },
  page: {
    flex: 1,
    alignItems: 'center',
  },
  uploadContainer: {
    marginTop: 90,
    width: width - 40,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: '#ee735c',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  uploadTitle: {
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 16,
    color: '#000',
  },
  uploadDesc: {
    color: '#999',
    textAlign: 'center',
    fontSize: 12,
  },
  uploadIcon: {
    width: 110,
    resizeMode: 'contain',
  },
});

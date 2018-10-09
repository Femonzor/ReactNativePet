import * as React from 'react';
import {StyleSheet, Text, View} from 'react-native';

interface Props {
  row: any;
  navigator: any;
}

export default class VideoDetail extends React.Component<Props> {
  _backToList = () => {
    this.props.navigator.pop();
  }
  render() {
    const row = this.props.row;
    return (
      <View style={styles.container}>
        <Text onPress={this._backToList}>视频详情页{row.id}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});

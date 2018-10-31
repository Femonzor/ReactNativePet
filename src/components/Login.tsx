import * as React from 'react';
import {AlertIOS, StyleSheet, Text, TextInput, View} from 'react-native';
import Button from 'react-native-button';
import countdown from 'react-native-sk-countdown';
import config from '../common/config';
import request from '../common/request';

interface Props {
}

interface State {
  phoneNumber: string;
  codeSent: boolean;
  verifyCode: string;
  countingDone: boolean;
}

const CountDownText = countdown.CountDownText;

export default class Login extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      phoneNumber: '',
      codeSent: false,
      verifyCode: '',
      countingDone: false,
    };
  }
  _showVerifyCode = () => {
    this.setState({
      codeSent: true,
    });
  }
  _sendVerifyCode = () => {
    const phoneNumber = this.state.phoneNumber;
    if (!phoneNumber) {
      return AlertIOS.alert('手机号不能为空');
    }
    const body = {
      phoneNumber,
    };
    const signupUrl = `${config.api.base}${config.api.signup}`;
    request.post(signupUrl, body)
      .then(data => {
        if (data && data.code === 0) {
          this._showVerifyCode();
        } else {
          AlertIOS.alert('获取验证码失败，请检查手机号是否正确');
        }
      })
      .catch(error => {
        AlertIOS.alert('获取验证码失败，请检查网络是否良好');
      });
  }
  _countingDone = () => {
    this.setState({
      countingDone: true,
    });
  }
  _submit = () => {
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.signupBox}>
          <Text style={styles.title}>快速登录</Text>
          <TextInput
            placeholder='输入手机号'
            autoCapitalize={'none'}
            autoCorrect={false}
            keyboardType={'number-pad'}
            style={styles.inputField}
            onChangeText={text => {
              this.setState({
                phoneNumber: text,
              });
            }}
          />
          {
            this.state.codeSent
            ? <View style={styles.verifyCodeBox}>
                <TextInput
                  placeholder='输入手机号'
                  autoCapitalize={'none'}
                  autoCorrect={false}
                  keyboardType={'number-pad'}
                  style={styles.inputField}
                  onChangeText={text => {
                    this.setState({
                      verifyCode: text,
                    });
                  }}
                />
                {
                  this.state.countingDone
                  ? <Button style={styles.countBtn} onPress={this._sendVerifyCode}>获取验证码</Button>
                  : <CountDownText
                      style={styles.countBtn}
                      countType='seconds'
                      auto={true}
                      afterEnd={this._countingDone}
                      timeLeft={10}
                      step={-1}
                      startText='获取验证码'
                      endText='获取验证码'
                      intervalText={(second: string) => `剩余秒数${second}`}
                  />
                }
              </View>
            : null
          }
          {
            this.state.codeSent
            ? <Button style={styles.btn} onPress={this._submit}>登录</Button>
            : <Button style={styles.btn} onPress={this._sendVerifyCode}>获取验证码</Button>
          }
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  signupBox: {
    marginTop: 30,
  },
  title: {
    marginBottom: 20,
    color: '#333',
    fontSize: 20,
    textAlign: 'center',
  },
  inputField: {
    flex: 1,
    height: 40,
    padding: 5,
    color: '#666',
    fontSize: 16,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  btn: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'transparent',
    borderColor: '#ee735c',
    borderWidth: 1,
    borderRadius: 4,
    color: '#ee735c',
  },
  verifyCodeBox: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  countBtn: {
    width: 110,
    height: 40,
    padding: 10,
    marginLeft: 8,
    backgroundColor: 'transparent',
    borderColor: '#ee735c',
    textAlign: 'left',
    fontWeight: '600',
    fontSize: 15,
    borderRadius: 2,
  },
});

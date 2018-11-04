import * as React from 'react';
import {AlertIOS, StyleSheet, Text, TextInput, View} from 'react-native';
import Button from 'react-native-button';
import CountDownButton from 'react-native-smscode-count-down';
import config from '../common/config';
import request from '../common/request';

interface Props {
  afterLogin: Function;
}

interface State {
  phoneNumber: string;
  codeSent: boolean;
  verifyCode: string;
  countingDone: boolean;
}

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
  _sendVerifyCode = (shouldStartCountting: Function) => {
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
          shouldStartCountting(this.state.codeSent);
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
    const phoneNumber = this.state.phoneNumber;
    const verifyCode = this.state.verifyCode;
    if (!phoneNumber || !verifyCode) {
      return AlertIOS.alert('手机号和验证码都不能为空');
    }
    const body = {
      phoneNumber,
      verifyCode,
    };
    const verifyUrl = `${config.api.base}${config.api.verify}`;
    request.post(verifyUrl, body)
      .then(data => {
        if (data && data.code === 0) {
          this.props.afterLogin(data.data);
        } else {
          AlertIOS.alert('登录失败，请检查手机号是否正确');
        }
      })
      .catch(error => {
        AlertIOS.alert('登录异常，请检查网络是否良好');
      });
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
          <View style={styles.verifyCodeBox}>
            <TextInput
              placeholder='输入验证码'
              autoCapitalize={'none'}
              autoCorrect={false}
              style={styles.codeField}
              onChangeText={text => {
                this.setState({
                  verifyCode: text,
                });
              }}
            />
            <CountDownButton
              style={styles.countBtn}
              timerCount={60}
              timerTitle={'获取验证码'}
              textStyle={styles.btnCodeText}
              timerActiveTitle={['重新获取(', 's)']}
              enable={!!this.state.phoneNumber}
              onClick={this._sendVerifyCode}
              timerEnd={() => {
                console.log('countdown end');
              }}
            />
          </View>
          <Button style={styles.btn} onPress={this._submit}>登录</Button>
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
    height: 40,
    padding: 5,
    color: '#666',
    fontSize: 16,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  codeField: {
    height: 40,
    padding: 5,
    color: '#666',
    fontSize: 16,
    backgroundColor: '#fff',
    borderRadius: 4,
    flex: 1,
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
    height: 40,
    padding: 10,
    paddingLeft: 8,
    paddingRight: 8,
    backgroundColor: '#ee735c',
    borderColor: '#ee735c',
    borderRadius: 2,
  },
  btnCodeText: {
    color: '#fff',
    alignSelf: 'center',
  },
  btnCountDownText: {
    alignSelf: 'flex-start',
  },
});

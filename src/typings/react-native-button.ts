declare module 'react-native-button' {
  import {Component} from 'react';
  interface Props {
    style: any;
    onPress: () => void;
  }
  export default class Button extends Component<Props> {}
}

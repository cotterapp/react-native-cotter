import React, {Component} from 'react';
import {View, ActivityIndicator} from 'react-native';
import colors from '../assets/colors';
import axiosClient from '../services/axiosClient';
import LoginManager from './LoginManager';

export default class LoadingPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  componentDidMount() {
    if (this.props.route) {
      const {code, state, challenge_id} = this.props.route.params || {};
      this.getIdentity(code, state, challenge_id);
    } else if (
      this.props.navigation &&
      this.props.navigation.getParam('code')
    ) {
      var code = this.props.navigation.getParam('code');
      var state = this.props.navigation.getParam('state');
      var challenge_id = this.props.navigation.getParam('challenge_id');
      this.getIdentity(code, state, challenge_id);
    } else {
      loginReq.onError(
        'Unable to receive code/state/challenge_id in URL',
        null,
      );
      this.props.navigation.goBack();
    }
  }

  getIdentity(auth_code, state, challenge_id) {
    var path = '/verify/get_identity';
    var loginReq = LoginManager.getLoginRegistry(state);

    if (state != loginReq.state) {
      loginReq.onError('State is not the same', {});
    }

    var data = {
      code_verifier: loginReq.codeVerifier,
      authorization_code: auth_code,
      challenge_id: parseInt(challenge_id),
      redirect_url: loginReq.callbackURL,
    };

    console.log(data);

    var config = {
      headers: {
        API_KEY_ID: loginReq.apiKeyID,
        'Content-type': 'application/json',
      },
    };

    console.log(config);

    axiosClient
      .post(path, data, config)
      .then(resp => {
        this.props.navigation.goBack();
        loginReq.onSuccess(resp.data);
      })
      .catch(e => {
        console.log(e);
        loginReq.onError('Something went wrong', e.response.data);
        this.props.navigation.goBack();
      });
  }

  render() {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color={colors.purple} />
      </View>
    );
  }
}

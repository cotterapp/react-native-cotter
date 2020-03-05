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
    const {code, state, challenge_id} = this.props.route.params || {};
    this.getIdentity(code, state, challenge_id);
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
        /* 1. Navigate to the callbackScreenName route with params */
        this.props.navigation.replace(loginReq.callbackScreenName, {
          loginResponse: resp.data,
        });
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

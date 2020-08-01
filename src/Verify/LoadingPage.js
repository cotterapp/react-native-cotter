import React, {Component} from 'react';
import {View, ActivityIndicator} from 'react-native';
import axios from 'axios';
import colors from '../assets/colors';
import VerifyManager from './VerifyManager';
import TokenHandler from '../TokenHandler';
import Constants from '../Constants';
import UserHandler from '../User/handler';

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
      verifyReq.onError(
        'Unable to receive code/state/challenge_id in URL',
        null,
      );
      this.props.navigation.goBack();
    }
  }

  getIdentity(auth_code, state, challenge_id) {
    var verifyReq = VerifyManager.getRegistry(state);

    var path = '/verify/get_identity';
    if (verifyReq.getOAuthToken) {
      path += '?oauth_token=true';
    }

    if (state != verifyReq.state) {
      verifyReq.onError('State is not the same', {});
    }

    var data = {
      code_verifier: verifyReq.codeVerifier,
      authorization_code: auth_code,
      challenge_id: parseInt(challenge_id),
      redirect_url: verifyReq.callbackURL,
    };

    console.log(data);

    var config = {
      headers: {
        API_KEY_ID: verifyReq.apiKeyID,
        'Content-type': 'application/json',
      },
    };

    console.log(config);
    console.log(Constants.BaseURL + path);

    axios
      .post(Constants.BaseURL + path, data, config)
      .then(async (resp) => {
        if (resp.data && resp.data.oauth_token) {
          const tokenHandler = new TokenHandler(verifyReq.apiKeyID);
          tokenHandler.storeTokens(resp.data.oauth_token);
        }
        if (resp.data && resp.data.user) {
          await UserHandler.store(resp.data.user);
        }
        this.props.navigation.pop();
        verifyReq.onSuccess(resp.data);
      })
      .catch((e) => {
        console.log(e);
        this.props.navigation.pop();
        verifyReq.onError('Something went wrong', e.response.data);
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

import React, {Component} from 'react';
import {View, ActivityIndicator} from 'react-native';
import axios from 'axios';
import colors from '../assets/colors';
import VerifyManager from './VerifyManager';
import Cotter from '../Cotter';
import TokenHandler from '../TokenHandler';

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
    console.log(verifyReq.backendBaseURL + path);

    axios
      .post(verifyReq.backendBaseURL + path, data, config)
      .then((resp) => {
        this.props.navigation.goBack();
        if (verifyReq.getOAuthToken) {
          const tokenHandler = new TokenHandler(
            Cotter.BaseURL,
            verifyReq.apiKeyID,
          );
          tokenHandler.storeTokens(resp.data.oauth_token);
        }
        verifyReq.onSuccess(resp.data);
      })
      .catch((e) => {
        console.log(e);
        verifyReq.onError('Something went wrong', e.response.data);
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

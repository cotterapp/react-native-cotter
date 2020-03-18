import * as React from 'react';
import 'react-native-gesture-handler';
import {NavigationContainer, useLinking} from '@react-navigation/native';
import Router from './router';
import {connectCotterWrapper} from 'react-native-cotter';

function App() {
  const ref = React.useRef();

  const {getInitialState} = useLinking(ref, {
    prefixes: ['https://myexample.cotter.app', 'myexample://'],
    config: {
      CotterLoadingLogin: 'auth_callback',
    },
  });

  const [isReady, setIsReady] = React.useState(false);
  const [initialState, setInitialState] = React.useState();

  React.useEffect(() => {
    Promise.race([
      getInitialState(),
      new Promise(resolve =>
        // Timeout in 150ms if `getInitialState` doesn't resolve
        // Workaround for https://github.com/facebook/react-native/issues/25675
        setTimeout(resolve, 150),
      ),
    ])
      .catch(e => {
        console.error(e);
      })
      .then(state => {
        if (state !== undefined) {
          setInitialState(state);
        }

        setIsReady(true);
      });
  }, [getInitialState]);

  if (!isReady) {
    return null;
  }

  return (
    <NavigationContainer initialState={initialState} ref={ref}>
      <Router />
    </NavigationContainer>
  );
}

export default connectCotterWrapper(App);

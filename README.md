https://www.npmjs.com/package/react-native-inappbrowser-reborn
-> Add info.plist in iOS

```
    <array>
    	<dict>
    		<key>CFBundleTypeRole</key>
    		<string>Editor</string>
    		<key>CFBundleURLName</key>
    		<string>myexample</string>
    		<key>CFBundleURLSchemes</key>
    		<array>
    			<string>myexample</string>
    		</array>
    	</dict>
    </array>
```

        <intent-filter>
            <action android:name="android.intent.action.VIEW" />
            <category android:name="android.intent.category.DEFAULT" />
            <category android:name="android.intent.category.BROWSABLE" />
            <data android:scheme="myexample" android:host="auth_callback"/>
        </intent-filter>

https://reactnavigation.org/docs/deep-linking#ios
-> Add the AppDelegate.m in iOS
If you're targeting iOS 9.x or newer:

```
// Add the header at the top of the file:
#import <React/RCTLinkingManager.h>

// Add this above `@end`:
- (BOOL)application:(UIApplication *)application
   openURL:(NSURL *)url
   options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [RCTLinkingManager application:application openURL:url options:options];
}
```

If you're targeting iOS 8.x or older, you can use the following code instead:

```
// Add the header at the top of the file:
#import <React/RCTLinkingManager.h>

// Add this above `@end`:
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication annotation:(id)annotation
{
  return [RCTLinkingManager application:application openURL:url
                      sourceApplication:sourceApplication annotation:annotation];
}
```

-> Add the useLinking hook https://reactnavigation.org/docs/deep-linking#deep-link-integration

```
import { NavigationContainer, useLinking } from '@react-navigation/native';

function App() {
  const ref = React.useRef();

  const {getInitialState} = useLinking(ref, {
    prefixes: ['https://myexample.cotter.app', 'myexample://'],
    config: {
      CotterLoadingLogin: 'auth_callback',     // ADD THIS TO REDIRECT TO COTTER'S HANDLER PAGE
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
        setTimeout(resolve, 150)
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
      {/* content */}
    </NavigationContainer>
  );
}
```

Add Cotter in your Router

```
function Router() {
  return (
    <Stack.Navigator>
        ...
      // HERE ADD COTTER WITH NAME "CotterLoadingLogin"
      <Stack.Screen
        name="CotterLoadingLogin"
        component={LoadingPage}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}
```
# react-native-sdk

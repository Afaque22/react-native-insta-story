//changes by Afaque 3.0
import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  Animated,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  ActivityIndicator,
  View,
  Platform,
  SafeAreaView,
  TextInput,
  Keyboard,
  Alert,
  PanResponder,
} from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {usePrevious, isNullOrWhitespace} from './helpers';
import {IUserStoryItem, NextOrPrevious, StoryListItemProps} from './interfaces';
import Video, {VideoRef} from 'react-native-video';
import BottomSheet from '@gorhom/bottom-sheet';
import BottomSheetComp from './BottomSheetComp';

const {width, height} = Dimensions.get('window');

export const StoryListItem = ({
  index,
  key,
  userId,
  own_id,
  profileImage,
  profileName,
  duration,
  onFinish,
  onClosePress,
  stories,
  currentPage,
  onStorySeen,
  renderCloseComponent,
  renderSwipeUpComponent,
  renderTextComponent,
  loadedAnimationBarStyle,
  unloadedAnimationBarStyle,
  animationBarContainerStyle,
  storyUserContainerStyle,
  storyImageStyle,
  storyAvatarImageStyle,
  storyContainerStyle,
  viewsData,
  openSheet,
  deleteStory,
  likeComment,
  ...props
}: StoryListItemProps) => {
  const [load, setLoad] = useState<boolean>(true);
  const [pressed, setPressed] = useState<boolean>(false);
  const [content, setContent] = useState<IUserStoryItem[]>(
    stories.map(x => ({
      ...x,
      finish: 0,
    })),
  );

  const [current, setCurrent] = useState(0);

  const progress = useRef(new Animated.Value(0)).current;
  const keyboardHeight = useRef(new Animated.Value(0));
  const [isKeyboardOpen, setisKeyboardOpen] = useState(false);
  const [isLiked, setisLiked] = useState(false);
  const [comment, setComment] = useState('');

  const prevCurrentPage = usePrevious(currentPage);

  const [paused, setPaused] = useState(true);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const videoRef = useRef<VideoRef | null>(null);
  const storyViewsRef = useRef<BottomSheet>(null);
  const videoProgress = useRef<number>(0);

  const extension =
    content[current]?.story_image?.split('.').pop()?.toLowerCase() || '';
  const isVideo = ['mp4', 'avi', 'mov', 'wmv'].includes(extension);
  const maxDuration = 30000;

  useEffect(() => {
    let isPrevious = !!prevCurrentPage && prevCurrentPage > currentPage;
    if (isPrevious) {
      setCurrent(content.length - 1);
    } else {
      setCurrent(0);
    }

    let data = [...content];
    data.map((x, i) => {
      if (isPrevious) {
        x.finish = 1;
        if (i == content.length - 1) {
          x.finish = 0;
        }
      } else {
        x.finish = 0;
      }
    });
    setContent(data);
    if (!load) {
      start({duration: duration});
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const prevCurrent = usePrevious(current);

  useEffect(() => {
    if (!isNullOrWhitespace(prevCurrent)) {
      if (prevCurrent) {
        if (
          current > prevCurrent &&
          content[current - 1].story_image == content[current].story_image
        ) {
          start({duration: duration});
        } else if (
          current < prevCurrent &&
          content[current + 1].story_image == content[current].story_image
        ) {
          start({duration: duration});
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  useEffect(() => {
    // When the page changes, check if it's the current page

    if (currentPage === index) {
      setPaused(false);
    } else {
      setPaused(true);
      progress.setValue(0);
      progress.stopAnimation();
    }
  }, [currentPage, index]);

  function start(data: {duration: number}) {
    if (data.duration && data.duration > 0) {
      setLoad(false);
      progress.setValue(0);
      setVideoDuration(data?.duration);
      startAnimation(data?.duration);
    } else {
      setLoad(false);
      progress.setValue(0);
      setVideoDuration(duration);
      startAnimation(null);
    }
  }

  function startAnimation(dur: any) {
    if (currentPage !== index) {
      return;
    }

    const animationDuration = isVideo
      ? Math.min(dur ? dur * 1000 : duration, maxDuration)
      : duration;

    Animated.timing(progress, {
      toValue: 1,
      duration: animationDuration,
      useNativeDriver: false,
    }).start(({finished}) => {
      if (finished) {
        next();
      }
    });
  }

  function onSwipeUp(_props?: any) {
    if (onClosePress) {
      onClosePress();
    }
    if (content[current].onPress) {
      content[current].onPress?.();
    }
  }

  function onSwipeDown(_props?: any) {
    onClosePress();
  }

  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 90,
  };

  function next() {
    // setPaused(true)
    // check if the next content is not empty
    setLoad(true);
    if (current !== content.length - 1) {
      let data = [...content];
      data[current].finish = 1;
      setContent(data);
      setCurrent(current + 1);
      progress.setValue(0);
    } else {
      // the next content is empty
      close('next');
    }
  }

  function previous() {
    // checking if the previous content is not empty
    setLoad(true);
    if (current - 1 >= 0) {
      let data = [...content];
      data[current].finish = 0;
      setContent(data);
      setCurrent(current - 1);
      progress.setValue(0);
    } else {
      // the previous content is empty
      close('previous');
    }
  }

  function close(state: NextOrPrevious) {
    let data = [...content];
    data.map(x => (x.finish = 0));
    setContent(data);
    progress.setValue(0);
    if (currentPage == index) {
      if (onFinish) {
        onFinish(state);
      }
    }
  }

  const swipeText =
    content?.[current]?.swipeText || props.swipeText || 'Swipe Up';

  React.useEffect(() => {
    if (onStorySeen && currentPage === index) {
      onStorySeen({
        user_id: userId,
        user_image: profileImage,
        user_name: profileName,
        story: content[current],
      });
    }
  }, [currentPage, index, onStorySeen, current]);

  const handleVideoLoadStart = () => {
    setLoad(true);
    progress.setValue(0);
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      event => {
        Animated.timing(keyboardHeight.current, {
          duration: event.duration,
          toValue: event.endCoordinates.height + 10,
          useNativeDriver: false,
        }).start();
        onFocusInput();
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      event => {
        Animated.timing(keyboardHeight.current, {
          duration: event.duration,
          toValue: 0,
          useNativeDriver: false,
        }).start();
        onBlurInput();
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const onFocusInput = () => {
    progress.stopAnimation();
    setPaused(true);
    setisKeyboardOpen(true);
  };

  const onBlurInput = () => {
    setPaused(false);
    setisKeyboardOpen(false);
    const remainingTime = videoDuration
      ? videoDuration - videoProgress.current
      : null;
    startAnimation(remainingTime);
  };

  const openViewsSheet = () => {
    progress.stopAnimation();
    setPaused(true);
    storyViewsRef.current?.expand();
    if (typeof openSheet === 'function') {
      openSheet();
    }
  };

  const closeViewsSheet = () => {
    storyViewsRef.current?.close();
    const remainingTime = videoDuration
      ? videoDuration - videoProgress.current
      : null;
    startAnimation(remainingTime);
    setPaused(false);
    if (typeof openSheet === 'function') {
      openSheet();
    }
  };

  const deleteStoryAlert = () => {
    progress.stopAnimation();
    setPaused(true);
    const remainingTime = videoDuration
      ? videoDuration - videoProgress.current
      : null;
    Alert.alert('Delete Story', 'Are you sure you want to delete this story?', [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => {
          startAnimation(remainingTime);
          setPaused(false);
        },
      },
      {
        text: 'OK',
        onPress: async () => {
          if (deleteStory) {
            setLoad(true);
            const result = await deleteStory(content[current]?.story_id);

            console.log('res', result);

            if (result.success) {
              if (content.length > 1 && current < content.length - 1) {
                const updatedStoriesArray = content.filter(
                  story => story.story_id !== content[current]?.story_id,
                );
                setContent(updatedStoriesArray);
              } else {
                if (onClosePress) {
                  onClosePress();
                }
              }
              setLoad(false);
              startAnimation(remainingTime);
              setPaused(false);
            } else {
              console.error('Story deletion failed');
            }
          } else {
            console.error('deleteStory is undefined');
          }
          startAnimation(remainingTime);
          setPaused(false);
        },
      },
    ]);
  };

  const sendComment = (val: any) => {
    console.log(val, 'val');
    setLoad(true);
    if (likeComment) {
      likeComment(val)
        .then((response: any) => {
          console.log(response); // Success message
          setLoad(false);
          if (val === 'like') {
            setisLiked(!isLiked);
          } else {
            setComment('');
          }
        })
        .catch((error: any) => {
          setLoad(false);
          console.error(error); // Error message
        });
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Handle touch event here
        sendComment('comment');
      },
    }),
  ).current;

  return (
    <GestureRecognizer
      key={key}
      onSwipeUp={onSwipeUp}
      onSwipeDown={onSwipeDown}
      config={config}
      style={[styles.container, storyContainerStyle]}>
      <SafeAreaView>
        <View style={styles.backgroundContainer}>
          {isVideo ? (
            <Video
              ref={videoRef}
              paused={paused}
              source={{uri: content[current].story_image}}
              onError={() => console.log('videoerror')}
              onBuffer={() => setLoad(true)}
              onLoad={val => start({duration: val.duration})}
              onProgress={data => (videoProgress.current = data.currentTime)}
              onLoadStart={handleVideoLoadStart}
              style={[styles.image, storyImageStyle]}
              renderLoader={
                load && (
                  <View style={styles.spinnerContainer}>
                    <ActivityIndicator size="large" color={'white'} />
                  </View>
                )
              }
            />
          ) : (
            <Image
              onLoadEnd={() => start({duration: duration})}
              source={{uri: content[current].story_image}}
              style={[styles.image, storyImageStyle]}
            />
          )}
          {load && (
            <View style={styles.spinnerContainer}>
              <ActivityIndicator size="large" color={'white'} />
            </View>
          )}
        </View>
      </SafeAreaView>
      <View style={styles.flexCol}>
        <View
          style={[styles.animationBarContainer, animationBarContainerStyle]}>
          {content.map((index, key) => {
            return (
              <View
                key={key}
                style={[styles.animationBackground, unloadedAnimationBarStyle]}>
                <Animated.View
                  style={[
                    {
                      flex: current === key ? progress : content[key].finish,
                      height: 2,
                      backgroundColor: 'white',
                    },
                    loadedAnimationBarStyle,
                  ]}
                />
              </View>
            );
          })}
        </View>
        <View style={[styles.userContainer, storyUserContainerStyle]}>
          <View style={styles.flexRowCenter}>
            <Image
              style={[styles.avatarImage, storyAvatarImageStyle]}
              source={{uri: profileImage}}
            />
            {typeof renderTextComponent === 'function' ? (
              renderTextComponent({
                item: content[current],
                profileName,
              })
            ) : (
              <Text style={styles.avatarText}>{profileName}</Text>
            )}
          </View>
          <View style={styles.closeIconContainer}>
            {typeof renderCloseComponent === 'function' ? (
              renderCloseComponent({
                onPress: onClosePress,
                item: content[current],
              })
            ) : (
              <View
                style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                {own_id === userId && (
                  <TouchableOpacity onPress={() => deleteStoryAlert()}>
                    <Ionicons name="trash-outline" size={21} color="white" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => {
                    if (onClosePress) {
                      onClosePress();
                    }
                  }}>
                  <Ionicons name="close" size={25} color="white" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        <View style={styles.pressContainer}>
          <TouchableWithoutFeedback
            onPressIn={() => progress.stopAnimation()}
            onLongPress={() => setPressed(true)}
            onPressOut={() => {
              setPressed(false);
              startAnimation({duration: null});
            }}
            onPress={() => {
              if (!pressed && !load) {
                previous();
              }
            }}>
            <View style={styles.flex} />
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback
            onPressIn={() => progress.stopAnimation()}
            onLongPress={() => setPressed(true)}
            onPressOut={() => {
              setPressed(false);
              startAnimation({duration: null});
            }}
            onPress={() => {
              if (!pressed && !load) {
                next();
              }
            }}>
            <View style={styles.flex} />
          </TouchableWithoutFeedback>
        </View>
      </View>
      {typeof renderSwipeUpComponent === 'function' ? (
        renderSwipeUpComponent({
          onPress: onSwipeUp,
          item: content[current],
        })
      ) : (
        <>
          {own_id === userId && viewsData ? (
            <TouchableOpacity
              onPress={() => openViewsSheet()}
              style={styles.eyeView}>
              <Ionicons name="eye" size={23} color="white" />
              <Text style={styles.eyeTxt}>{viewsData?.length}</Text>
            </TouchableOpacity>
          ) : (
            <Animated.View
              style={[
                styles.inputView,
                {paddingBottom: keyboardHeight.current},
              ]}>
              <TextInput
                placeholderTextColor={'#1877F2'}
                placeholder="Send message"
                style={styles.txtInput}
                value={comment}
                onChangeText={val => setComment(val)}
              />
              {isKeyboardOpen ? (
                <TouchableOpacity onPress={() => sendComment('comment')}>
                  <Ionicons name="send-sharp" size={40} color="#141397" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => sendComment('like')}>
                  <Ionicons
                    name={isLiked ? 'heart' : 'heart-outline'}
                    size={40}
                    color={isLiked ? 'red' : '#141397'}
                  />
                </TouchableOpacity>
              )}
            </Animated.View>
          )}
        </>
      )}
      <BottomSheet
        ref={storyViewsRef}
        enablePanDownToClose={true}
        snapPoints={['55%']}
        index={-1}
        backgroundStyle={{backgroundColor: 'black'}}
        handleComponent={null}>
        <BottomSheetComp data={viewsData} closeViewsSheet={closeViewsSheet} />
      </BottomSheet>
    </GestureRecognizer>
  );
};

export default StoryListItem;

StoryListItem.defaultProps = {
  duration: 10000,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  flex: {
    flex: 1,
  },
  flexCol: {
    flex: 1,
    flexDirection: 'column',
  },
  flexRowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: width,
    height: height,
    resizeMode: 'cover',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  spinnerContainer: {
    zIndex: 99999999,
    position: 'absolute',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    alignSelf: 'center',
    width: width,
    height: height,
  },
  animationBarContainer: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  animationBackground: {
    height: 2,
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(117, 117, 117, 0.5)',
    marginHorizontal: 2,
  },
  userContainer: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  avatarImage: {
    height: 30,
    width: 30,
    borderRadius: 100,
  },
  avatarText: {
    fontWeight: 'bold',
    color: 'white',
    paddingLeft: 10,
  },
  closeIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    paddingHorizontal: 15,
  },
  pressContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  swipeUpBtn: {
    position: 'absolute',
    right: 0,
    left: 0,
    alignItems: 'center',
    bottom: Platform.OS == 'ios' ? 20 : 50,
  },
  whiteText: {
    color: 'white',
  },
  swipeText: {
    color: 'white',
    marginTop: 5,
  },
  txtInput: {
    borderWidth: 1,
    borderColor: '#518EF8',
    width: '83%',
    marginHorizontal: 10,
    borderRadius: 25,
    height: 45,
    backgroundColor: 'black',
    paddingHorizontal: 15,
    color: 'white',
  },
  inputView: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
  },
  eyeView: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    position: 'absolute',
    bottom: 30,
  },
  eyeTxt: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 5,
    fontSize: 15,
  },
});

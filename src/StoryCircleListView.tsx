import React, { useMemo } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import StoryCircleListItem from './StoryCircleListItem';
import { StoryCircleListViewProps } from 'src/interfaces';

const StoryCircleListView = ({
  data,
  handleStoryItemPress,
  unPressedBorderColor,
  pressedBorderColor,
  unPressedAvatarTextColor,
  pressedAvatarTextColor,
  avatarSize,
  showText,
  avatarTextStyle,
  avatarImageStyle,
  avatarWrapperStyle,
  avatarFlatListProps,
}: StoryCircleListViewProps) => {

  // console.log('..........data......',data);



  // Combining arrays
 

  const sortedData = useMemo(() => {
    const unseenItems = data.filter((item : any) => !item.isSeen);
    const seenItems = data.filter((item : any)  => item.isSeen);
    // Sorting only the filtered data
    const sortedUnseenItems = [...unseenItems].sort((a, b) => new Date(b.created_at).getDate() - new Date(a.created_at).getDate());
    const sortedSeenItems = [...seenItems].sort((a, b) => new Date(b.created_at).getDate() - new Date(a.created_at).getDate());
   const combinedData = [...sortedUnseenItems, ...sortedSeenItems];
   return combinedData
  },[data])
  
  
  // const sortedData = useMemo(() => {
  //   return data.sort((a : any, b : any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  // }, [data]); 
  
  return (
    <FlatList
      keyExtractor={(_item, index) => index.toString()}
      data={sortedData}
      horizontal
      style={styles.paddingLeft}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      ListFooterComponent={<View style={styles.footer} />}
      renderItem={({ item, index }) => (
        <StoryCircleListItem
          avatarSize={avatarSize}
          handleStoryItemPress={() =>
            handleStoryItemPress && handleStoryItemPress(item, index)
          }
          unPressedBorderColor={unPressedBorderColor}
          pressedBorderColor={pressedBorderColor}
          unPressedAvatarTextColor={unPressedAvatarTextColor}
          pressedAvatarTextColor={pressedAvatarTextColor}
          item={item}
          showText={showText}
          avatarTextStyle={avatarTextStyle}
          avatarImageStyle={avatarImageStyle}
          avatarWrapperStyle={avatarWrapperStyle}
        />
      )}
      {...avatarFlatListProps}
    />
  );
};

const styles = StyleSheet.create({
  paddingLeft: {
    paddingLeft: 12,
  },
  footer: {
    flex: 1,
    width: 8,
  },
});

export default StoryCircleListView;

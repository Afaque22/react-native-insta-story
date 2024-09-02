// Afaque 3.0
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {BottomSheetFlatList} from '@gorhom/bottom-sheet';

type Props = {
  data: [];
  closeViewsSheet: () => void;
};

const BottomSheetComp = (props: Props) => {
  const renderItem = ({item}: {item: any}) => {
    return (
      <View style={styles.row}>
        <Image
          source={{
            uri: item.image
              ? item.image
              : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
          }}
          resizeMode="contain"
          style={styles.dp}
        />
        <Text style={styles.userName}>{item?.name}</Text>
      </View>
    );
  };

  return (
    <View style={{flex: 1}}>
      <View style={styles.headerView}>
        <Text style={styles.txt}>Viewers ({props.data?.length})</Text>
        <TouchableOpacity onPress={() => props.closeViewsSheet()}>
          <Ionicons name="close-circle-outline" size={32} color="white" />
        </TouchableOpacity>
      </View>
      {props.data?.length > 0 ? (
        <BottomSheetFlatList
          data={props.data}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
        />
      ) : (
        <View style={styles.msgView}>
          <Text style={{color: 'white', fontSize: 16}}>
            This story hasn't been viewed yet.
          </Text>
        </View>
      )}
    </View>
  );
};

export default BottomSheetComp;

const styles = StyleSheet.create({
  row: {flexDirection: 'row', padding: 10, alignItems: 'center'},
  dp: {
    width: 40,
    height: 40,
    borderRadius: 50,
    marginRight: 10,
    backgroundColor: 'white',
  },
  userName: {color: '#518EF8', fontSize: 15, marginLeft: 10},
  headerView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  txt: {
    marginLeft: 10,
    color: 'white',
    fontWeight: '500',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  msgView: {flex: 1, justifyContent: 'center', alignItems: 'center'},
});

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  TextInput,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Modalize } from 'react-native-modalize';

const CommonModal = ({ visible, onClose, title, children }) => {
  const modalRef = useRef(null);

  // Open or close the modal based on "visible"
  useEffect(() => {
    if (visible) {
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [visible]);

  return (
    <Modalize
      ref={modalRef}
      adjustToContentHeight={false}
      modalHeight={600}
      onClosed={onClose}
      withHandle={true}
      handlePosition="inside"
      panGestureEnabled={true}
      closeOnOverlayTap={true}
      modalStyle={styles.modalContainer}
      scrollViewProps={{
        keyboardShouldPersistTaps: 'handled',
        showsVerticalScrollIndicator: false,
        contentContainerStyle: { paddingBottom: 24 },
      }}
    >
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={20}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>

        {children}
      </KeyboardAwareScrollView>
    </Modalize>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeText: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default CommonModal;

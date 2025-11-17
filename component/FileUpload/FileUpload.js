import * as DocumentPicker from 'expo-document-picker';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IMAGE_ROUTE_URL } from '../../config';
import axios from 'axios';

const FileAttachment = ({ navigation, setFile }) => {
  const pickFile = async () => {
    try {
      // Pick a file
      const result = await DocumentPicker.getDocumentAsync({});
      if (result.canceled) return;
      const file = result.assets[0];
      // Prepare form data for upload
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/octet-stream',
      });
      setFile(file.uri);
      const response = await axios.post(`${IMAGE_ROUTE_URL}/upload/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // console.log('Upload response:', response.data);
      // Navigate with backend URL if available
      const uploadedUrl = response.data.file_url;
      console.log(uploadedUrl);
      navigation.navigate('ImageEditScreen', { imageUri: uploadedUrl });
    } catch (error) {
      console.error('File upload error:', error);
      Alert.alert('Upload Failed', 'There was an error uploading the file. Please try again.');
    }
  };

  return (
    <TouchableOpacity onPress={pickFile}>
      <Ionicons name="attach-outline" size={24} color="#555" />
    </TouchableOpacity>
  );
};

export default FileAttachment;

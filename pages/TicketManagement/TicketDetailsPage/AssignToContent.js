import React, { useState, useMemo, useContext } from 'react';
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { Modalize } from 'react-native-modalize';
import { DataContext } from '../../../context';

const AssignUserModal = React.forwardRef(({ userList = [], onAssign, fetchFunction, ticketId }, ref) => {

    const [searchText, setSearchText] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [button, setButton] = useState(false);
    const { apiPost } = useContext(DataContext);
    const filteredUsers = useMemo(() => {
        return userList.filter((u) =>
            u.name.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [searchText, userList]);

    const handleAssign = async () => {
        if (selectedUser) {
            console.log(`/update-ticket-status/${ticketId}/`);
            console.log({ assignedTo: selectedUser._id });
            await apiPost(`/update-ticket-status/${ticketId}/`, { assignedTo: selectedUser._id }, setButton, () => { fetchFunction() });
            onAssign(selectedUser);
            ref?.current?.close();
            setSearchText('');
            setSelectedUser(null);
        }
    };


    return (
        <Modalize
            ref={ref}
            snapPoint={400}
            modalHeight={500}
            scrollViewProps={{ nestedScrollEnabled: true }}
        >
            <ScrollView contentContainerStyle={styles.modalContent}>
                <Text style={styles.modalTitle}>Choose a User</Text>

                <TextInput
                    placeholder="Search user..."
                    value={searchText}
                    onChangeText={setSearchText}
                    style={styles.searchInput}
                    placeholderTextColor="#888"
                />

                {filteredUsers?.map((item) => (
                    <TouchableOpacity
                        key={item._id}
                        style={[
                            styles.userOption,
                            selectedUser?._id === item._id && styles.selectedUserOption,
                        ]}
                        onPressIn={() => setSelectedUser(item)}
                    >
                        <Text
                            style={[
                                styles.userText,
                                selectedUser?._id === item._id && styles.selectedUserText,
                            ]}
                        >
                            {item.name}
                        </Text>
                    </TouchableOpacity>
                ))}

                <TouchableOpacity
                    onPress={handleAssign}
                    disabled={!selectedUser}
                    style={[
                        styles.assignButton,
                        !selectedUser && { backgroundColor: '#ccc' },
                    ]}
                >
                    <Text style={styles.assignButtonText}>
                        {selectedUser ? button ? <ActivityIndicator size={19} color={'white'} /> : `Assign to ${selectedUser.name}` : 'Select a user'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </Modalize>
    );
});

export default AssignUserModal;

const styles = StyleSheet.create({
    modalContent: { padding: 20 },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 10,
        fontSize: 15,
        color: '#111',
    },
    userOption: {
        paddingVertical: 14,
        borderBottomColor: '#ddd',
        paddingHorizontal: 14,
        borderRadius: 10,
        borderBottomWidth: 1,
    },
    userText: {
        fontSize: 16,
        color: '#222',
    },
    selectedUserOption: {
        backgroundColor: '#E0F2FE',
    },
    selectedUserText: {
        color: '#1E40AF',
        fontWeight: '600',
    },
    assignButton: {
        marginTop: 20,
        backgroundColor: '#2563EB',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    assignButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

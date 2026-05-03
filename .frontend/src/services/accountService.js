import apiClient from './apiClient';

export async function deactivateAccount() {
    await apiClient.post('/api/user/account/deactivate', {});
}

export async function deleteAccount(password) {
    await apiClient.delete('/api/user/account', {
        data: {
            password
        }
    });
}
import axios from 'axios'

const BASE_URL = process.env.VUE_APP_API_URL + 'api/';
const accessToken = localStorage.getItem('access_token')

const base = axios.create({
    baseURL: BASE_URL,
    headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + accessToken
    }
})

const Api = {
    login(data) {
        return base.post('login', data)
    },

    logout(user) {
        localStorage.removeItem('enterprise_id')
        localStorage.removeItem('user')
        localStorage.removeItem('email')
        localStorage.removeItem('type')
        localStorage.removeItem('access_token')

        return base.post('logout', user)
    },

    isLogged(token) {
        if (localStorage.getItem('access_token') !== null) {
            return base
                .post('check_token', token)
                .then(() => {

                    return true
                })
                .catch(() => {
                    localStorage.removeItem('enterprise_id')
                    localStorage.removeItem('user')
                    localStorage.removeItem('email')
                    localStorage.removeItem('type')
                    localStorage.removeItem('access_token')

                    return false
                })
        } else {
            return false
        }
    },

    // ENTERPRISES
    listEnterprises() {
        return base.get('enterprises')
    },

    storeEnterprises(data) {
        return base.post('enterprises', data)
    },

    updateEnterprises(id, data) {
        return base.put('enterprises/'+id, data)
    },

    deleteEnterprises(id) {
        return base.delete('enterprises/'+id)
    },
    
    // PACKAGES
    listPackages() {
        return base.get('packages')
    },

    storePackages(data) {
        return base.post('packages', data)
    },

    updatePackages(id, data) {
        return base.put('packages/'+id, data)
    },

    deletePackages(id) {
        return base.delete('packages/'+id)
    },

    // CUSTOMERS
    listCustomers() {
        return base.get('customers')
    },

    storeCustomers(data) {
        return base.post('customers', data)
    },

    updateCustomers(id, data) {
        return base.put('customers/'+id, data)
    },

    deleteCustomers(id) {
        return base.delete('customers/'+id)
    },

    // CONTRACTS
    listContracts() {
        return base.get('contracts')
    },

    storeContracts(data) {
        return base.post('contracts', data)
    },

    updateContracts(id, data) {
        return base.put('contracts/'+id, data)
    },

    deleteContracts(id) {
        return base.delete('contracts/'+id)
    },

    // EMAIL
    sendContractByEmail(id) {
        return base.post('send_contract_by_email', id)
    },

    // SIGN CONTRACT
    contractCustomer(id) {
        return base.get('contract_customer/'+id)
    },

    contractGenerate(id, signed) {
        return base.get('contract_generate/'+id+'/'+signed)
    },

    imgBackground() {
        return base.get('img_background')
    },

    storeNewCustomer(data) {
        return base.post('store_new_customer', data)
    },
}

export default Api
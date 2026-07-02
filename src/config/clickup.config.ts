import dotenv from 'dotenv';

dotenv.config();

export const clickupConfig = {

    apiUrl: process.env.CLICKUP_API_URL ??
        'https://api.clickup.com/api/v2',

    token: process.env.CLICKUP_API_TOKEN ?? '',

    listId: process.env.CLICKUP_LIST_ID ?? '',

};
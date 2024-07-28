import {configureStore} from '@reduxjs/toolkit'
import { thunk } from 'redux-thunk';
import { tokenMiddleware } from "../middlewares/tokenMiddleware";
import { initializeAuth } from "./actions/authActions";
import rootReducer from './reducers';


export const createAppStore = async () => {
    try {
        const store = configureStore({
            reducer : rootReducer,

        })

        return store
    } catch (err) {
        throw new Error("some thing ent wrong");
    }
}
export default createAppStore;

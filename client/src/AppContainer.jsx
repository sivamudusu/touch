import { Provider } from "react-redux"
import createAppStore from "./redux/store"
import App from "./App"
import { useEffect, useState } from "react";


const AppContainer = () => {
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);



    useEffect(() => {
        const initializeStore = async () => {
          try {
            const appStore = await createAppStore();
            setStore(appStore);
          } catch (err) {
            setError(`Error initializing the app: ${err.message}`);
            console.log(err);
          } finally {
            setLoading(false);
          }
        };
    
        initializeStore();
      }, []);

      if(loading){
        return(
            <div>loading</div>
        )
      }

      if(error){
        return(
            <div>error</div>
        )
      }


    return (
        <Provider store={store}>
            <App/>
        </Provider>
    )
}

export default AppContainer
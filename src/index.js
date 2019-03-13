import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import * as serviceWorker from './serviceWorker'
import { BrowserRouter as Router, Route } from "react-router-dom"
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import RootReducer from './reducers/RootReducer'

import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'
import { PersistGate } from 'redux-persist/lib/integration/react'

import Home from './producao/Home'
import SignIn from './admin/SignIn'
import IndexAdmin from './admin/IndexAdmin'

const persistConfig = {
	key: 'root',
	storage: storage,
	stateReconciler: autoMergeLevel2 // see "Merge Process" section for details.
};

const pReducer = persistReducer(persistConfig, RootReducer)

const store = createStore(pReducer)
const persistor = persistStore(store)

const routes = [
    {
        path: "/",
        exact: true,
        main: () => <SignIn />
    },
    {
        path: "/producao",
        exact: true,
        main: () => <Home />
    },
    {
      path: "/admin",
      main: () => <IndexAdmin />
    }
]

class App extends Component {
    render() { 
        return (
            <Provider store={ store }>
                <PersistGate loading="carregando" persistor={persistor}>
                    <Router>
                        <React.Fragment>
                            {
                                routes.map((route, index) => (
                                    <Route
                                        key={index}
                                        path={route.path}
                                        exact={route.exact}
                                        component={route.main}
                                    />
                                ))
                            }
                        </React.Fragment>
                    </Router>
                </PersistGate>
            </Provider>
        )
    }
}

export default App

ReactDOM.render(<App />, document.getElementById('root'))
serviceWorker.unregister()

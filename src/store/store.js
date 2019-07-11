import {createStore} from "redux"
import reducers from './reducers'

const store = createStore(reducers)

window._s = store

export default store

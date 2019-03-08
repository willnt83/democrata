const initState = {
    producaoMainData: [],
    producaoAcompanhamento: []
}

const RootReducer = (state = initState, action) => {
    if(action.type === 'SET_PAGETITLE'){
        return {
            ...state,
            pageTitle: action.pageTitle
        }
    }
    else if(action.type === 'SET_PRODUCAOMAINDATA'){
        return {
            ...state,
            producaoMainData: action.producao
        }
    }
    else if(action.type === 'SET_PRODUCAOACOMPANHAMENTO'){
        return {
            ...state,
            producaoAcompanhamento: action.producaoAcompanhamento
        }
    }
    return state;
}

export default RootReducer;
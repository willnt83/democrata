const initState = {
    //backEndPoint: 'http://localhost',
    backEndPoint: 'https://testedemocrata.tk',
    session: {
        idSession: null,
        usuario: {
            id: null,
            nome: null,
        },
        perfil: {
            id: null,
            nome: null,
        },
        administrador: null
    },
    producaoMainData: [],
    producaoAcompanhamento: []
}

const RootReducer = (state = initState, action) => {
    if(action.type === 'SET_SESSION'){
        return {
            ...state,
            session: action.session
        }
    }
    else if(action.type === 'RESET_ALL'){
        return {
            backEndPoint: 'http://localhost',
            session: {
                idSession: null,
                usuario: {
                    id: null,
                    nome: null,
                },
                perfil: {
                    id: null,
                    nome: null,
                },
                administrador: null
            },
            producaoMainData: [],
            producaoAcompanhamento: []
        }
    }
    else if(action.type === 'SET_PAGETITLE'){
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
    else if(action.type === 'RESET_PRODUCAOMAINDATA'){
        return{
            ...state,
            producaoMainData: []
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